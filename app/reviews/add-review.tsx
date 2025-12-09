/**
 * Add Review Screen
 * Dedicated screen for users to write and submit reviews
 */

import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomHeader } from '@/components/custom-header';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useCatalogProduct } from '@/api/catalog/queries';
import { useBoutique } from '@/api/boutiques/queries';
import { mapFromBackendResponse } from '@/utils/catalog';
import { uploadImage } from '@/api/upload/services';
import { useCreateReview, useUpdateReview } from '@/api/reviews/queries';

/**
 * Star Rating Component
 */
const StarRating: React.FC<{
    rating: number;
    onRatingChange: (rating: number) => void;
    size?: number;
}> = ({ rating, onRatingChange, size = 32 }) => {
    const starColor = '#FFB800';
    const emptyStarColor = useThemeColor({}, 'icon');

    return (
        <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                    key={star}
                    onPress={() => onRatingChange(star)}
                    activeOpacity={0.7}
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
 * Main Screen Component
 */
export default function AddReviewScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const cardBg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { itemId, itemType, itemName, reviewId, rating: ratingParam, comment: commentParam, images: imagesParam } = useLocalSearchParams<{
        itemId: string;
        itemType: 'boutique' | 'product';
        itemName?: string;
        reviewId?: string;
        rating?: string;
        comment?: string;
        images?: string;
    }>();

    const isEditMode = !!reviewId;

    // Fetch item details
    const { data: apiProduct, isLoading: isLoadingProduct } = useCatalogProduct(
        itemType === 'product' ? itemId || '' : '',
        { enabled: itemType === 'product' && !!itemId }
    );
    const { data: boutique, isLoading: isLoadingBoutique } = useBoutique(
        itemType === 'boutique' ? Number(itemId) : null,
        { enabled: itemType === 'boutique' && !!itemId }
    );

    const product = apiProduct ? mapFromBackendResponse(apiProduct) : null;
    const isLoadingItem = isLoadingProduct || isLoadingBoutique;

    // Pre-fill form if editing
    const initialRating = React.useMemo(() => (ratingParam ? parseInt(ratingParam, 10) : 0), [ratingParam]);
    const initialComment = React.useMemo(() => commentParam || '', [commentParam]);
    const initialImages = React.useMemo(
        () => (imagesParam ? (JSON.parse(imagesParam) as string[]) : []),
        [imagesParam]
    );

    const [rating, setRating] = React.useState(initialRating);
    const [comment, setComment] = React.useState(initialComment);
    const [reviewImages, setReviewImages] = React.useState<string[]>(initialImages);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isUploadingImages, setIsUploadingImages] = React.useState(false);

    const createReviewMutation = useCreateReview();
    const updateReviewMutation = useUpdateReview();

    // Update form when edit params change
    React.useEffect(() => {
        if (isEditMode) {
            setRating(initialRating);
            setComment(initialComment);
            setReviewImages(initialImages);
        }
    }, [isEditMode, initialRating, initialComment, initialImages]);

    const handleBackPress = () => {
        router.back();
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera roll permissions to add images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
            allowsEditing: false,
        });

        if (!result.canceled && result.assets) {
            const newImages = result.assets.map((asset) => asset.uri);
            setReviewImages((prev) => [...prev, ...newImages].slice(0, 5)); // Max 5 images
        }
    };

    const handleRemoveImage = (index: number) => {
        setReviewImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        // Validation
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select a rating before submitting your review.');
            return;
        }

        if (comment.trim().length < 10) {
            Alert.alert('Comment Too Short', 'Please write at least 10 characters in your review.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Step 1: Upload images to S3 if any are selected
            let uploadedImageUrls: string[] = [];

            if (reviewImages.length > 0) {
                setIsUploadingImages(true);
                try {
                    console.log(`[Review] Starting upload of ${reviewImages.length} image(s)...`);

                    // Separate existing URLs from new local images
                    const existingUrls: string[] = [];
                    const localImages: string[] = [];

                    reviewImages.forEach((imageUri) => {
                        if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
                            // Already uploaded, keep as-is
                            existingUrls.push(imageUri);
                        } else {
                            // Local image, needs upload
                            localImages.push(imageUri);
                        }
                    });

                    // Upload only new local images
                    let newUploadedUrls: string[] = [];
                    if (localImages.length > 0) {
                        const uploadPromises = localImages.map((imageUri) =>
                            uploadImage({
                                imageUri,
                                folder: 'reviews', // Store review images in 'reviews' folder
                            })
                        );

                        newUploadedUrls = await Promise.all(uploadPromises);
                        console.log(`[Review] Successfully uploaded ${newUploadedUrls.length} new image(s)`);
                    }

                    // Combine existing URLs with newly uploaded ones
                    uploadedImageUrls = [...existingUrls, ...newUploadedUrls];
                    console.log(`[Review] Total images: ${uploadedImageUrls.length} (${existingUrls.length} existing, ${newUploadedUrls.length} new)`);
                } catch (uploadError) {
                    console.error('[Review] Image upload error:', uploadError);
                    Alert.alert(
                        'Upload Error',
                        'Failed to upload some images. Please try again or submit without images.',
                        [
                            {
                                text: 'Cancel',
                                style: 'cancel',
                                onPress: () => {
                                    setIsSubmitting(false);
                                    setIsUploadingImages(false);
                                },
                            },
                            {
                                text: 'Submit Without Images',
                                onPress: async () => {
                                    // Continue with submission without images
                                    await submitReviewPayload(uploadedImageUrls);
                                },
                            },
                        ]
                    );
                    return;
                } finally {
                    setIsUploadingImages(false);
                }
            }

            // Step 2: Build and submit review payload
            await submitReviewPayload(uploadedImageUrls);
        } catch (error) {
            console.error('[Review] Submit error:', error);
            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to submit review. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
            setIsUploadingImages(false);
        }
    };

    const submitReviewPayload = async (imageUrls: string[]) => {
        // Build the complete review payload
        const payload = {
            // Item identification
            item_id: itemId,
            item_type: itemType, // 'product' or 'boutique'

            // Review content
            rating: rating, // 1-5 stars
            comment: comment.trim(),

            // Images (array of S3 URLs)
            images: imageUrls, // Array of uploaded image URLs

            // Optional metadata (can be used for verification, analytics, etc.)
            metadata: {
                // Product-specific metadata (if reviewing a product)
                ...(itemType === 'product' && product && {
                    product_id: product.id,
                    product_name: product.name,
                    product_brand: product.brand,
                    product_category: product.category,
                }),

                // Boutique-specific metadata (if reviewing a boutique)
                ...(itemType === 'boutique' && boutique && {
                    boutique_id: boutique.boutique_id,
                    boutique_name: boutique.business_name,
                    boutique_category: boutique.business_category,
                }),

                // Review metadata
                review_length: comment.trim().length,
                image_count: imageUrls.length,
                submitted_at: new Date().toISOString(),
            },
        };

        console.log("Log payload", payload);

        if (isEditMode && reviewId) {
            // Update existing review
            const updateRequest = {
                rating: payload.rating,
                comment: payload.comment,
                images: payload.images,
                review_metadata: payload.metadata,
            };

            await updateReviewMutation.mutateAsync({
                reviewId: parseInt(reviewId, 10),
                request: updateRequest,
            });

            Alert.alert(
                'Review Updated',
                'Your review has been updated successfully.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            router.back();
                        },
                    },
                ]
            );
        } else {
            // Create new review
            const reviewRequest = {
                rating: payload.rating,
                comment: payload.comment,
                images: payload.images,
                review_metadata: payload.metadata,
                item_type: payload.item_type,
                item_id: payload.item_id,
            };

            await createReviewMutation.mutateAsync(reviewRequest);

            Alert.alert(
                'Review Submitted',
                'Thank you for your review! It will be published after moderation.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            router.back();
                        },
                    },
                ]
            );
        }
    };

    const displayName = itemName || product?.name || boutique?.business_name || (itemType === 'product' ? 'this product' : 'this boutique');
    const screenTitle = isEditMode
        ? 'Edit Review'
        : itemType === 'product'
            ? 'Review Product'
            : 'Review Boutique';

    // Get item image
    const itemImage = itemType === 'product'
        ? product?.imageUrl
        : boutique?.logo_url || boutique?.cover_image_url;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
            <CustomHeader title={screenTitle} showBackButton onBackPress={handleBackPress} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Item Info */}
                <View style={[styles.itemInfoCard, { backgroundColor: cardBg }]}>
                    <ThemedText style={styles.itemInfoTitle}>Reviewing</ThemedText>
                    {isLoadingItem ? (
                        <View style={styles.itemInfoLoading}>
                            <ActivityIndicator size="small" color={tintColor} />
                            <ThemedText style={[styles.itemInfoName, { color: iconColor }]}>Loading...</ThemedText>
                        </View>
                    ) : (
                        <>
                            <View style={styles.itemInfoContent}>
                                {itemImage && (
                                    <Image source={{ uri: itemImage }} style={styles.itemInfoImage} />
                                )}
                                <View style={styles.itemInfoDetails}>
                                    <ThemedText style={styles.itemInfoName} numberOfLines={2}>
                                        {displayName}
                                    </ThemedText>
                                    {itemType === 'product' && product && (
                                        <>
                                            {product.brand && (
                                                <ThemedText style={[styles.itemInfoDetail, { color: iconColor }]}>
                                                    {product.brand}
                                                </ThemedText>
                                            )}
                                            <View style={styles.itemInfoPriceRow}>
                                                {product.discountPrice ? (
                                                    <>
                                                        <ThemedText style={styles.itemInfoPrice}>
                                                            ₦{product.discountPrice.toLocaleString()}
                                                        </ThemedText>
                                                        <ThemedText style={[styles.itemInfoOriginalPrice, { color: iconColor }]}>
                                                            ₦{product.price.toLocaleString()}
                                                        </ThemedText>
                                                    </>
                                                ) : (
                                                    <ThemedText style={styles.itemInfoPrice}>
                                                        ₦{product.price.toLocaleString()}
                                                    </ThemedText>
                                                )}
                                            </View>
                                            <ThemedText style={[styles.itemInfoDetail, { color: iconColor, textTransform: 'capitalize' }]}>
                                                {product.category}
                                            </ThemedText>
                                        </>
                                    )}
                                    {itemType === 'boutique' && boutique && (
                                        <>
                                            {boutique.business_category && (
                                                <ThemedText style={[styles.itemInfoDetail, { color: iconColor }]}>
                                                    {boutique.business_category}
                                                </ThemedText>
                                            )}
                                            {boutique.business_city && (
                                                <ThemedText style={[styles.itemInfoDetail, { color: iconColor }]}>
                                                    {boutique.business_city}
                                                    {boutique.business_state && `, ${boutique.business_state}`}
                                                </ThemedText>
                                            )}
                                            {boutique.rating && (
                                                <View style={styles.itemInfoRating}>
                                                    <IconSymbol name="star.fill" size={14} color="#FFB800" />
                                                    <ThemedText style={styles.itemInfoRatingText}>
                                                        {boutique.rating.toFixed(1)}
                                                    </ThemedText>
                                                    {boutique.review_count && (
                                                        <ThemedText style={[styles.itemInfoReviewCount, { color: iconColor }]}>
                                                            ({boutique.review_count} reviews)
                                                        </ThemedText>
                                                    )}
                                                </View>
                                            )}
                                        </>
                                    )}
                                </View>
                            </View>
                        </>
                    )}
                </View>

                {/* Rating Section */}
                <View style={[styles.section, { backgroundColor: cardBg }]}>
                    <ThemedText style={styles.sectionTitle}>Your Rating</ThemedText>
                    <ThemedText style={[styles.sectionSubtitle, { color: iconColor }]}>
                        Tap to select a rating
                    </ThemedText>
                    <View style={styles.ratingContainer}>
                        <StarRating rating={rating} onRatingChange={setRating} />
                    </View>
                    {rating > 0 && (
                        <ThemedText style={[styles.ratingText, { color: tintColor }]}>
                            {rating === 5 && 'Excellent!'}
                            {rating === 4 && 'Very Good'}
                            {rating === 3 && 'Good'}
                            {rating === 2 && 'Fair'}
                            {rating === 1 && 'Poor'}
                        </ThemedText>
                    )}
                </View>

                {/* Comment Section */}
                <View style={[styles.section, { backgroundColor: cardBg }]}>
                    <ThemedText style={styles.sectionTitle}>Your Review</ThemedText>
                    <ThemedText style={[styles.sectionSubtitle, { color: iconColor }]}>
                        Share your experience with others
                    </ThemedText>
                    <TextInput
                        style={[styles.commentInput, { backgroundColor: backgroundColor, borderColor: iconColor + '30', color: iconColor }]}
                        placeholder="Write your review here... (minimum 10 characters)"
                        placeholderTextColor={iconColor + '60'}
                        value={comment}
                        onChangeText={setComment}
                        multiline
                        numberOfLines={8}
                        textAlignVertical="top"
                    />
                    <ThemedText style={[styles.charCount, { color: iconColor }]}>
                        {comment.length} characters
                    </ThemedText>
                </View>

                {/* Images Section */}
                <View style={[styles.section, { backgroundColor: cardBg }]}>
                    <ThemedText style={styles.sectionTitle}>Add Photos (Optional)</ThemedText>
                    <ThemedText style={[styles.sectionSubtitle, { color: iconColor }]}>
                        Share photos of your experience (up to 5 images)
                    </ThemedText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
                        {reviewImages.map((uri, index) => (
                            <View key={uri} style={styles.imageWrapper}>
                                <Image source={{ uri }} style={styles.reviewImage} />
                                <TouchableOpacity
                                    style={[styles.removeImageButton, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                                    onPress={() => handleRemoveImage(index)}
                                >
                                    <IconSymbol name="xmark" size={16} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {reviewImages.length < 5 && (
                            <TouchableOpacity
                                style={[styles.addImageButton, { borderColor: iconColor + '50', backgroundColor: backgroundColor }]}
                                onPress={handlePickImage}
                            >
                                <IconSymbol name="plus" size={24} color={iconColor} />
                                <ThemedText style={[styles.addImageText, { color: iconColor }]}>Add Photo</ThemedText>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        {
                            backgroundColor: rating > 0 && comment.trim().length >= 10 ? tintColor : iconColor + '30',
                        },
                    ]}
                    onPress={handleSubmit}
                    disabled={rating === 0 || comment.trim().length < 10 || isSubmitting || isUploadingImages}
                >
                    {(isSubmitting || isUploadingImages) ? (
                        <View style={styles.submitButtonContent}>
                            <ActivityIndicator size="small" color={isDark ? '#000' : 'white'} />
                            <ThemedText
                                style={[
                                    styles.submitButtonText,
                                    {
                                        color: isDark ? '#000' : 'white',
                                        marginLeft: 8,
                                    },
                                ]}
                            >
                                {isUploadingImages ? 'Uploading Images...' : 'Submitting...'}
                            </ThemedText>
                        </View>
                    ) : (
                        <ThemedText
                            style={[
                                styles.submitButtonText,
                                {
                                    color:
                                        rating > 0 && comment.trim().length >= 10
                                            ? isDark
                                                ? '#000'
                                                : 'white'
                                            : iconColor,
                                },
                            ]}
                        >
                            Submit Review
                        </ThemedText>
                    )}
                </TouchableOpacity>

                {/* Guidelines */}
                <View style={[styles.guidelinesCard, { backgroundColor: cardBg }]}>
                    <ThemedText style={styles.guidelinesTitle}>Review Guidelines</ThemedText>
                    <View style={styles.guidelinesList}>
                        <ThemedText style={[styles.guidelineItem, { color: iconColor }]}>
                            • Be honest and specific about your experience
                        </ThemedText>
                        <ThemedText style={[styles.guidelineItem, { color: iconColor }]}>
                            • Focus on the product/service quality
                        </ThemedText>
                        <ThemedText style={[styles.guidelineItem, { color: iconColor }]}>
                            • Avoid personal attacks or inappropriate language
                        </ThemedText>
                        <ThemedText style={[styles.guidelineItem, { color: iconColor }]}>
                            • Reviews are subject to moderation
                        </ThemedText>
                    </View>
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
    itemInfoCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemInfoTitle: {
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    itemInfoLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    itemInfoContent: {
        flexDirection: 'row',
        gap: 12,
    },
    itemInfoImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        resizeMode: 'cover',
    },
    itemInfoDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    itemInfoName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemInfoDetail: {
        fontSize: 13,
        marginBottom: 2,
    },
    itemInfoPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
        marginBottom: 4,
    },
    itemInfoPrice: {
        fontSize: 16,
        fontWeight: '600',
    },
    itemInfoOriginalPrice: {
        fontSize: 13,
        textDecorationLine: 'line-through',
    },
    itemInfoRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    itemInfoRatingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    itemInfoReviewCount: {
        fontSize: 12,
    },
    section: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        marginBottom: 16,
    },
    ratingContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    starContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
    },
    commentInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        minHeight: 150,
        marginBottom: 8,
    },
    charCount: {
        fontSize: 12,
        textAlign: 'right',
    },
    imagesContainer: {
        marginTop: 12,
    },
    imageWrapper: {
        position: 'relative',
        marginRight: 12,
    },
    reviewImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addImageButton: {
        width: 100,
        height: 100,
        borderRadius: 8,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addImageText: {
        fontSize: 12,
        marginTop: 4,
    },
    submitButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    submitButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    guidelinesCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    guidelinesTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    guidelinesList: {
        gap: 8,
    },
    guidelineItem: {
        fontSize: 13,
        lineHeight: 20,
    },
});

