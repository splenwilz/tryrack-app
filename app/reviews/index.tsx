/**
 * Reviews Screen
 * View and submit reviews for boutique items (products or boutiques)
 */

import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, FlatList, RefreshControl, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomHeader } from '@/components/custom-header';
import { router, useLocalSearchParams } from 'expo-router';
import { useReviews, useLikeReview, useUnlikeReview } from '@/api/reviews/queries';
import type { ReviewResponse } from '@/api/reviews/types';
import { useAuthSession } from '@/hooks/use-auth-session';


/**
 * Star Rating Component
 */
const StarRating: React.FC<{
    rating: number;
    onRatingChange?: (rating: number) => void;
    editable?: boolean;
    size?: number;
}> = ({ rating, onRatingChange, editable = false, size = 20 }) => {
    const starColor = '#FFB800';
    const emptyStarColor = useThemeColor({}, 'icon');

    return (
        <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                    key={star}
                    onPress={() => editable && onRatingChange?.(star)}
                    disabled={!editable}
                    activeOpacity={editable ? 0.7 : 1}
                >
                    <IconSymbol
                        name={star <= rating ? 'star.fill' : 'star'}
                        size={size}
                        color={star <= rating ? starColor : emptyStarColor}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};

/**
 * Review Card Component
 */
const ReviewCard: React.FC<{
    review: ReviewResponse;
    itemId: string;
    itemType: 'boutique' | 'product';
    itemName?: string;
}> = ({ review, itemId, itemType, itemName }) => {
    const cardBg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');
    const iconColor = useThemeColor({}, 'icon');
    const tintColor = useThemeColor({}, 'tint');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { session } = useAuthSession();
    const isOwnReview = session?.id === review.user_id;

    const likeMutation = useLikeReview();
    const unlikeMutation = useUnlikeReview();
    const [showVerificationDetails, setShowVerificationDetails] = React.useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleLike = async () => {
        if (review.user_has_liked) {
            await unlikeMutation.mutateAsync(review.id);
        } else {
            await likeMutation.mutateAsync(review.id);
        }
    };

    const handleEdit = () => {
        router.push({
            pathname: '/reviews/add-review',
            params: {
                itemId,
                itemType,
                itemName: itemName || '',
                reviewId: String(review.id),
                rating: String(review.rating),
                comment: review.comment,
                images: review.images ? JSON.stringify(review.images) : '',
            },
        });
    };

    // Get user display name
    const getUserDisplayName = () => {
        if (review.user?.first_name && review.user?.last_name) {
            return `${review.user.first_name} ${review.user.last_name}`;
        }
        if (review.user?.first_name) {
            return review.user.first_name;
        }
        if (review.user?.email) {
            return review.user.email.split('@')[0];
        }
        return 'Anonymous';
    };

    // Get verification details text (shown when badge is clicked)
    const getVerificationDetailsText = () => {
        if (!review.is_verified) return null;
        switch (review.verification_type) {
            case 'purchase':
                return 'This user has purchased this item';
            case 'tryon':
                return 'This user has tried on this item virtually';
            case 'email':
                return 'This user has verified their email';
            default:
                return 'This user is verified';
        }
    };

    const isLiking = likeMutation.isPending || unlikeMutation.isPending;

    return (
        <View style={[styles.reviewCard, { backgroundColor: cardBg }]}>
            <View style={styles.reviewHeader}>
                <View style={styles.reviewUserInfo}>
                    {review.user?.profile_picture_url ? (
                        <Image source={{ uri: review.user.profile_picture_url }} style={styles.userAvatar} />
                    ) : (
                        <View style={[styles.userAvatarPlaceholder, { backgroundColor: iconColor + '20' }]}>
                            <IconSymbol name="person.fill" size={20} color={iconColor} />
                        </View>
                    )}
                    <View style={styles.reviewUserDetails}>
                        <View style={styles.reviewUserNameRow}>
                            <ThemedText style={styles.reviewUserName}>{getUserDisplayName()}</ThemedText>
                            {review.is_verified && (
                                <TouchableOpacity
                                    style={[styles.verifiedBadge, { backgroundColor: tintColor }]}
                                    onPress={() => setShowVerificationDetails(!showVerificationDetails)}
                                    activeOpacity={0.7}
                                >
                                    <IconSymbol name="checkmark.seal.fill" size={12} color={isDark ? '#000' : 'white'} />
                                    <ThemedText style={[styles.verifiedText, { color: isDark ? '#000' : 'white' }]}>
                                        Verified
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                            {isOwnReview && (
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={handleEdit}
                                    activeOpacity={0.7}
                                >
                                    <IconSymbol name="pencil" size={14} color={iconColor} />
                                </TouchableOpacity>
                            )}
                        </View>
                        {showVerificationDetails && review.is_verified && getVerificationDetailsText() && (
                            <View style={[styles.verificationDetailsContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                                <ThemedText style={[styles.verificationDetailsText, { color: iconColor }]}>
                                    {getVerificationDetailsText()}
                                </ThemedText>
                            </View>
                        )}
                        <View style={styles.reviewMeta}>
                            <StarRating rating={review.rating} size={14} />
                            <ThemedText style={[styles.reviewDate, { color: iconColor }]}>
                                {formatDate(review.created_at)}
                            </ThemedText>
                        </View>
                    </View>
                </View>
            </View>

            <ThemedText style={styles.reviewComment}>{review.comment}</ThemedText>

            {review.images && review.images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImages}>
                    {review.images.map((image) => (
                        <Image key={image} source={{ uri: image }} style={styles.reviewImage} />
                    ))}
                </ScrollView>
            )}

            <View style={styles.reviewFooter}>
                <TouchableOpacity
                    style={styles.helpfulButton}
                    onPress={handleLike}
                    disabled={isLiking}
                >
                    {isLiking ? (
                        <ActivityIndicator size="small" color={tintColor} />
                    ) : (
                        <IconSymbol
                            name={review.user_has_liked ? "hand.thumbsup.fill" : "hand.thumbsup"}
                            size={16}
                            color={review.user_has_liked ? tintColor : iconColor}
                        />
                    )}
                    <ThemedText
                        style={[
                            styles.helpfulText,
                            { color: review.user_has_liked ? tintColor : iconColor },
                        ]}
                    >
                        {review.like_count > 0 ? `Like (${review.like_count})` : 'Like'}
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </View>
    );
};


/**
 * Main Screen Component
 */
export default function ReviewsScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const iconColor = useThemeColor({}, 'icon');
    const tintColor = useThemeColor({}, 'tint');
    const { itemId, itemType, itemName } = useLocalSearchParams<{
        itemId: string;
        itemType: 'boutique' | 'product';
        itemName?: string;
    }>();

    // Fetch reviews from API
    const {
        data: reviews = [],
        isLoading,
        isRefetching,
        refetch,
    } = useReviews({
        item_type: itemType,
        item_id: itemId || '',
        limit: 100, // Fetch all reviews
    });

    const refreshing = isRefetching;

    // Calculate average rating
    const averageRating = React.useMemo(() => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return sum / reviews.length;
    }, [reviews]);

    // Rating distribution
    const ratingDistribution = React.useMemo(() => {
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach((review) => {
            distribution[review.rating as keyof typeof distribution]++;
        });
        return distribution;
    }, [reviews]);

    const handleBackPress = () => {
        router.back();
    };

    const handleRefresh = React.useCallback(async () => {
        await refetch();
    }, [refetch]);

    const handleWriteReview = () => {
        router.push({
            pathname: '/reviews/add-review',
            params: {
                itemId: itemId || '',
                itemType: itemType,
                itemName: itemName,
            },
        });
    };

    const screenTitle = itemType === 'boutique' ? 'Boutique Reviews' : 'Product Reviews';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
            <CustomHeader title={screenTitle} showBackButton onBackPress={handleBackPress} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Summary Section */}
                <View style={styles.summarySection}>
                    <View style={styles.summaryHeader}>
                        <View style={styles.summaryRating}>
                            <ThemedText style={styles.averageRating}>{averageRating.toFixed(1)}</ThemedText>
                            <StarRating rating={Math.round(averageRating)} size={24} />
                            <ThemedText style={[styles.reviewCount, { color: iconColor }]}>
                                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                            </ThemedText>
                        </View>
                        <TouchableOpacity
                            style={[styles.writeReviewButtonHeader, { backgroundColor: tintColor }]}
                            onPress={handleWriteReview}
                        >
                            <IconSymbol name="pencil" size={16} color="white" />
                            <ThemedText style={styles.writeReviewButtonHeaderText}>Write Review</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/* Rating Distribution */}
                    <View style={styles.ratingDistribution}>
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = ratingDistribution[star as keyof typeof ratingDistribution];
                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                            return (
                                <View key={star} style={styles.ratingBarRow}>
                                    <View style={styles.ratingBarLabel}>
                                        <ThemedText style={styles.ratingBarStar}>{star}</ThemedText>
                                        <IconSymbol name="star.fill" size={12} color="#FFB800" />
                                    </View>
                                    <View style={[styles.ratingBarContainer, { backgroundColor: iconColor + '20' }]}>
                                        <View
                                            style={[
                                                styles.ratingBarFill,
                                                { width: `${percentage}%`, backgroundColor: tintColor },
                                            ]}
                                        />
                                    </View>
                                    <ThemedText style={[styles.ratingBarCount, { color: iconColor }]}>{count}</ThemedText>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Reviews List */}
                <View style={styles.reviewsSection}>
                    <ThemedText style={styles.reviewsSectionTitle}>All Reviews</ThemedText>
                    {isLoading ? (
                        <View style={styles.emptyState}>
                            <ActivityIndicator size="large" color={tintColor} />
                            <ThemedText style={[styles.emptyStateText, { color: iconColor, marginTop: 16 }]}>
                                Loading reviews...
                            </ThemedText>
                        </View>
                    ) : reviews.length === 0 ? (
                        <View style={styles.emptyState}>
                            <IconSymbol name="star" size={48} color={iconColor} />
                            <ThemedText style={[styles.emptyStateText, { color: iconColor }]}>
                                No reviews yet. Be the first to review!
                            </ThemedText>
                        </View>
                    ) : (
                        <FlatList
                            data={reviews}
                            renderItem={({ item }) => (
                                <ReviewCard
                                    review={item}
                                    itemId={itemId || ''}
                                    itemType={itemType}
                                    itemName={itemName}
                                />
                            )}
                            keyExtractor={(item) => String(item.id)}
                            scrollEnabled={false}
                            ItemSeparatorComponent={() => <View style={styles.reviewSeparator} />}
                        />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    summarySection: {
        marginTop: 16,
        marginBottom: 24,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    summaryRating: {
        flex: 1,
    },
    averageRating: {
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 8,
        paddingTop: 25
    },
    reviewCount: {
        fontSize: 14,
        marginTop: 8,
    },
    writeReviewButtonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    writeReviewButtonHeaderText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    ratingDistribution: {
        gap: 8,
    },
    ratingBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ratingBarLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 40,
        gap: 4,
    },
    ratingBarStar: {
        fontSize: 12,
        fontWeight: '600',
        width: 16,
    },
    ratingBarContainer: {
        flex: 1,
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    ratingBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    ratingBarCount: {
        fontSize: 12,
        width: 30,
        textAlign: 'right',
    },
    reviewsSection: {
        marginBottom: 24,
    },
    reviewsSectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    reviewCard: {
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    reviewHeader: {
        marginBottom: 12,
    },
    reviewUserInfo: {
        flexDirection: 'row',
        gap: 12,
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    userAvatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reviewUserDetails: {
        flex: 1,
    },
    reviewUserNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    reviewUserName: {
        fontSize: 16,
        fontWeight: '600',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 4,
    },
    verifiedText: {
        fontSize: 10,
        fontWeight: '600',
    },
    editButton: {
        padding: 4,
        marginLeft: 'auto', // Push to the right
    },
    verificationDetailsContainer: {
        marginTop: 8,
        marginLeft: 60, // Align with user details
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    verificationDetailsText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    reviewMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    reviewDate: {
        fontSize: 12,
    },
    reviewComment: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    reviewImages: {
        marginBottom: 12,
    },
    reviewImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 8,
    },
    reviewFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    helpfulButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    helpfulText: {
        fontSize: 12,
        marginLeft: 8, // Spacing between icon and text
        marginVertical: 36
    },
    reviewSeparator: {
        height: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyStateText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
    },
    starContainer: {
        flexDirection: 'row',
        gap: 4,
    },
});

