/**
 * Explore Boutiques Screen
 * Browse and discover boutique collections
 */

import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Image, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomHeader } from '@/components/custom-header';
import { router } from 'expo-router';
import { useBoutiques } from '@/api/boutiques/queries';
import type { BoutiqueResponse } from '@/api/boutiques/types';

/**
 * Frontend Boutique interface for explore screen
 */
interface Boutique {
    id: string;
    name: string;
    logo: string;
    coverImage?: string;
    description: string;
    location: string;
    distance?: number; // in miles
    category: string;
    rating: number;
    reviewCount: number;
    productCount: number;
    featured: boolean;
}

/**
 * Map backend BoutiqueResponse to frontend Boutique interface
 */
function mapBoutiqueResponseToBoutique(boutique: BoutiqueResponse): Boutique {
    // Build location string from address components
    const locationParts: string[] = [];
    if (boutique.business_city) locationParts.push(boutique.business_city);
    if (boutique.business_state) locationParts.push(boutique.business_state);
    if (boutique.business_country) locationParts.push(boutique.business_country);
    const location = locationParts.length > 0
        ? locationParts.join(', ')
        : boutique.business_address || 'Location not specified';

    return {
        id: String(boutique.boutique_id),
        name: boutique.business_name || 'Unnamed Boutique',
        logo: boutique.logo_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop',
        coverImage: boutique.cover_image_url || undefined,
        description: boutique.business_category || 'Fashion boutique',
        location,
        distance: boutique.distance_miles || undefined,
        category: boutique.business_category || 'Fashion',
        rating: boutique.rating ?? 0,
        reviewCount: boutique.review_count ?? 0,
        productCount: boutique.product_count ?? 0,
        featured: boutique.featured ?? false,
    };
}


/**
 * Boutique Card Component
 */
const BoutiqueCard: React.FC<{ boutique: Boutique }> = ({ boutique }) => {
    const backgroundColor = useThemeColor({}, 'background');
    const cardBg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handlePress = () => {
        // Navigate to boutique collection view
        router.push({
            pathname: '/explore/boutique-collection',
            params: { boutiqueId: boutique.id },
        });
    };

    return (
        <TouchableOpacity
            style={[styles.boutiqueCard, { backgroundColor: cardBg }]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            {/* Cover Image */}
            {boutique.coverImage && (
                <Image source={{ uri: boutique.coverImage }} style={styles.coverImage} />
            )}

            {/* Featured Badge */}
            {boutique.featured && (
                <View style={[styles.featuredBadge, { backgroundColor: tintColor }]}>
                    <IconSymbol name="star.fill" size={12} color={isDark ? '#000' : 'white'} />
                    <ThemedText style={[styles.featuredText, { color: isDark ? '#000' : 'white' }]}>
                        Featured
                    </ThemedText>
                </View>
            )}

            {/* Boutique Info */}
            <View style={styles.boutiqueInfo}>
                {/* Logo */}
                <View style={[styles.logoContainer, { backgroundColor: cardBg }]}>
                    <Image source={{ uri: boutique.logo }} style={styles.logo} />
                </View>

                {/* Details */}
                <View style={styles.details}>
                    <ThemedText style={styles.boutiqueName} numberOfLines={1}>
                        {boutique.name}
                    </ThemedText>
                    <ThemedText style={[styles.category, { color: iconColor }]} numberOfLines={1}>
                        {boutique.category}
                    </ThemedText>

                    {/* Location & Distance */}
                    <View style={styles.locationRow}>
                        <IconSymbol name="location.fill" size={14} color={iconColor} />
                        <ThemedText style={[styles.location, { color: iconColor }]} numberOfLines={1}>
                            {boutique.location}
                        </ThemedText>
                        {boutique.distance && (
                            <>
                                <ThemedText style={[styles.distance, { color: iconColor }]}>
                                    • {boutique.distance} mi
                                </ThemedText>
                            </>
                        )}
                    </View>

                    {/* Rating & Reviews */}
                    {boutique.rating > 0 && (
                        <View style={styles.ratingRow}>
                            <View style={styles.ratingContainer}>
                                <IconSymbol name="star.fill" size={14} color="#FFB800" />
                                <ThemedText style={styles.rating}>{boutique.rating.toFixed(1)}</ThemedText>
                                {boutique.reviewCount > 0 && (
                                    <ThemedText style={[styles.reviewCount, { color: iconColor }]}>
                                        ({boutique.reviewCount})
                                    </ThemedText>
                                )}
                            </View>
                            <ThemedText style={[styles.productCount, { color: iconColor }]}>
                                {boutique.productCount} items
                            </ThemedText>
                        </View>
                    )}
                    {boutique.rating === 0 && (
                        <View style={styles.ratingRow}>
                            <ThemedText style={[styles.productCount, { color: iconColor }]}>
                                {boutique.productCount} items
                            </ThemedText>
                        </View>
                    )}

                    {/* Description */}
                    <ThemedText style={[styles.description, { color: iconColor }]} numberOfLines={2}>
                        {boutique.description}
                    </ThemedText>
                </View>
            </View>
        </TouchableOpacity>
    );
};

/**
 * Main Screen Component
 */
export default function ExploreBoutiquesScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const iconColor = useThemeColor({}, 'icon');
    const tintColor = useThemeColor({}, 'tint');

    // Fetch boutiques from API
    const {
        data: apiBoutiques = [],
        isLoading,
        isRefetching,
        refetch,
        error,
    } = useBoutiques({
        limit: 100, // Fetch all boutiques
    });

    // Map API response to frontend format
    const boutiques = React.useMemo(() => {
        return apiBoutiques.map(mapBoutiqueResponseToBoutique);
    }, [apiBoutiques]);

    const handleBackPress = () => {
        router.back();
    };

    const handleRefresh = React.useCallback(async () => {
        await refetch();
    }, [refetch]);

    // Separate featured and regular boutiques
    const featuredBoutiques = boutiques.filter((b) => b.featured);
    const regularBoutiques = boutiques.filter((b) => !b.featured);

    const refreshing = isRefetching;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
            <CustomHeader title="Explore Boutiques" showBackButton onBackPress={handleBackPress} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Loading State */}
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={tintColor} />
                        <ThemedText style={[styles.loadingText, { color: iconColor }]}>
                            Loading boutiques...
                        </ThemedText>
                    </View>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <View style={styles.errorContainer}>
                        <IconSymbol name="exclamationmark.triangle.fill" size={48} color="#FF3B30" />
                        <ThemedText style={[styles.errorText, { color: iconColor }]}>
                            Failed to load boutiques. Please try again.
                        </ThemedText>
                        <TouchableOpacity
                            style={[styles.retryButton, { backgroundColor: tintColor }]}
                            onPress={() => refetch()}
                        >
                            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Empty State */}
                {!isLoading && !error && boutiques.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <IconSymbol name="building.2" size={64} color={iconColor} />
                        <ThemedText style={[styles.emptyText, { color: iconColor }]}>
                            No boutiques found
                        </ThemedText>
                    </View>
                )}

                {/* Featured Section */}
                {!isLoading && !error && featuredBoutiques.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>Featured Boutiques</ThemedText>
                            <IconSymbol name="star.fill" size={20} color="#FFB800" />
                        </View>
                        <FlatList
                            data={featuredBoutiques}
                            renderItem={({ item }) => <BoutiqueCard boutique={item} />}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    </View>
                )}

                {/* All Boutiques Section */}
                {!isLoading && !error && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>All Boutiques</ThemedText>
                            <ThemedText style={[styles.count, { color: iconColor }]}>
                                {boutiques.length}
                            </ThemedText>
                        </View>
                        <FlatList
                            data={regularBoutiques}
                            renderItem={({ item }) => <BoutiqueCard boutique={item} />}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    </View>
                )}
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
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    count: {
        fontSize: 14,
    },
    boutiqueCard: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    coverImage: {
        width: '100%',
        height: 160,
        resizeMode: 'cover',
    },
    featuredBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    featuredText: {
        fontSize: 12,
        fontWeight: '600',
    },
    boutiqueInfo: {
        padding: 16,
    },
    logoContainer: {
        position: 'absolute',
        top: -40,
        left: 16,
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#fff',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    logo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    details: {
        marginTop: 48,
    },
    boutiqueName: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 4,
    },
    category: {
        fontSize: 14,
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 4,
    },
    location: {
        fontSize: 13,
        flex: 1,
    },
    distance: {
        fontSize: 13,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        fontSize: 14,
        fontWeight: '600',
    },
    reviewCount: {
        fontSize: 13,
    },
    productCount: {
        fontSize: 13,
    },
    description: {
        fontSize: 13,
        lineHeight: 18,
        marginTop: 4,
    },
    separator: {
        height: 16,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    errorText: {
        marginTop: 16,
        marginBottom: 24,
        fontSize: 16,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
    },
});

