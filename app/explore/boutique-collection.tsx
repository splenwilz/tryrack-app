/**
 * Boutique Collection Screen
 * View all products from a specific boutique
 */

import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Image, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomHeader } from '@/components/custom-header';
import { router, useLocalSearchParams } from 'expo-router';
import { LookCarousel } from '@/components/boutique/LookCarousel';
import type { LookResponse } from '@/api/looks/types';

/**
 * Mock Product Data
 */
interface BoutiqueProduct {
    id: string;
    name: string;
    brand: string;
    category: string;
    imageUrl: string;
    price: number;
    discountPrice?: number;
    colors: string[];
    tags: string[];
}

const mockProducts: BoutiqueProduct[] = [
    {
        id: '1',
        name: 'Designer Silk Blouse',
        brand: 'Luxe Fashion',
        category: 'Blouses',
        imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=400&h=500&fit=crop',
        price: 45000,
        discountPrice: 35000,
        colors: ['Navy', 'Black', 'White'],
        tags: ['Premium', 'Silk', 'Designer'],
    },
    {
        id: '2',
        name: 'Elegant Evening Dress',
        brand: 'Luxe Fashion',
        category: 'Dresses',
        imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop',
        price: 85000,
        colors: ['Black', 'Red'],
        tags: ['Formal', 'Elegant', 'Evening'],
    },
    {
        id: '3',
        name: 'Classic Tailored Suit',
        brand: 'Luxe Fashion',
        category: 'Suits',
        imageUrl: 'https://images.unsplash.com/photo-1594938306406-6f6a3978d4e5?w=400&h=500&fit=crop',
        price: 120000,
        discountPrice: 95000,
        colors: ['Navy', 'Charcoal'],
        tags: ['Professional', 'Tailored', 'Premium'],
    },
    {
        id: '4',
        name: 'Casual Denim Jacket',
        brand: 'Luxe Fashion',
        category: 'Jackets',
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
        price: 35000,
        colors: ['Blue', 'Black'],
        tags: ['Casual', 'Denim', 'Versatile'],
    },
    {
        id: '5',
        name: 'Designer Leather Handbag',
        brand: 'Luxe Fashion',
        category: 'Accessories',
        imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=500&fit=crop',
        price: 65000,
        discountPrice: 50000,
        colors: ['Brown', 'Black'],
        tags: ['Leather', 'Designer', 'Premium'],
    },
    {
        id: '6',
        name: 'Silk Scarf Collection',
        brand: 'Luxe Fashion',
        category: 'Accessories',
        imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=500&fit=crop',
        price: 15000,
        colors: ['Multi-color'],
        tags: ['Silk', 'Accessory', 'Versatile'],
    },
];

/**
 * Mock Looks Data
 */
const mockLooks: LookResponse[] = [
    {
        id: 1,
        boutique_id: 1,
        title: 'Elegant Evening Ensemble',
        description: 'Perfect for formal events and special occasions',
        style: 'formal',
        product_ids: ['1', '2'],
        image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop',
        is_featured: true,
        total_price: 130000,
        created_at: '2025-12-01T10:00:00Z',
        updated_at: '2025-12-01T10:00:00Z',
        products: [
            {
                id: 1,
                name: 'Designer Silk Blouse',
                category: 'Blouses',
                brand: 'Luxe Fashion',
                cost_price: 30000,
                price: 45000,
                discount_price: 35000,
                image_url: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=400&h=500&fit=crop',
                stock: 10,
                status: 'active',
                tags: ['Premium', 'Silk', 'Designer'],
                colors: ['Navy', 'Black', 'White'],
                description: 'Luxurious silk blouse',
                sales: 5,
                revenue: 175000,
                views: 120,
                created_at: '2025-11-01T10:00:00Z',
                updated_at: '2025-12-01T10:00:00Z',
            },
            {
                id: 2,
                name: 'Elegant Evening Dress',
                category: 'Dresses',
                brand: 'Luxe Fashion',
                cost_price: 60000,
                price: 85000,
                image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop',
                stock: 8,
                status: 'active',
                tags: ['Formal', 'Elegant', 'Evening'],
                colors: ['Black', 'Red'],
                description: 'Stunning evening dress',
                sales: 3,
                revenue: 255000,
                views: 95,
                created_at: '2025-11-01T10:00:00Z',
                updated_at: '2025-12-01T10:00:00Z',
            },
        ],
    },
    {
        id: 2,
        boutique_id: 1,
        title: 'Professional Business Look',
        description: 'Sharp and sophisticated for the modern professional',
        style: 'business',
        product_ids: ['3', '5'],
        image_url: 'https://images.unsplash.com/photo-1594938306406-6f6a3978d4e5?w=400&h=500&fit=crop',
        is_featured: false,
        total_price: 185000,
        created_at: '2025-12-02T10:00:00Z',
        updated_at: '2025-12-02T10:00:00Z',
        products: [
            {
                id: 3,
                name: 'Classic Tailored Suit',
                category: 'Suits',
                brand: 'Luxe Fashion',
                cost_price: 80000,
                price: 120000,
                discount_price: 95000,
                image_url: 'https://images.unsplash.com/photo-1594938306406-6f6a3978d4e5?w=400&h=500&fit=crop',
                stock: 5,
                status: 'active',
                tags: ['Professional', 'Tailored', 'Premium'],
                colors: ['Navy', 'Charcoal'],
                description: 'Perfectly tailored business suit',
                sales: 2,
                revenue: 190000,
                views: 78,
                created_at: '2025-11-01T10:00:00Z',
                updated_at: '2025-12-02T10:00:00Z',
            },
            {
                id: 5,
                name: 'Designer Leather Handbag',
                category: 'Accessories',
                brand: 'Luxe Fashion',
                cost_price: 40000,
                price: 65000,
                discount_price: 50000,
                image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=500&fit=crop',
                stock: 12,
                status: 'active',
                tags: ['Leather', 'Designer', 'Premium'],
                colors: ['Brown', 'Black'],
                description: 'Luxury leather handbag',
                sales: 8,
                revenue: 400000,
                views: 150,
                created_at: '2025-11-01T10:00:00Z',
                updated_at: '2025-12-02T10:00:00Z',
            },
        ],
    },
    {
        id: 3,
        boutique_id: 1,
        title: 'Casual Weekend Style',
        description: 'Comfortable and stylish for everyday wear',
        style: 'casual',
        product_ids: ['4', '6'],
        image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
        is_featured: false,
        total_price: 50000,
        created_at: '2025-12-03T10:00:00Z',
        updated_at: '2025-12-03T10:00:00Z',
        products: [
            {
                id: 4,
                name: 'Casual Denim Jacket',
                category: 'Jackets',
                brand: 'Luxe Fashion',
                cost_price: 25000,
                price: 35000,
                image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
                stock: 15,
                status: 'active',
                tags: ['Casual', 'Denim', 'Versatile'],
                colors: ['Blue', 'Black'],
                description: 'Classic denim jacket',
                sales: 12,
                revenue: 420000,
                views: 200,
                created_at: '2025-11-01T10:00:00Z',
                updated_at: '2025-12-03T10:00:00Z',
            },
            {
                id: 6,
                name: 'Silk Scarf Collection',
                category: 'Accessories',
                brand: 'Luxe Fashion',
                cost_price: 10000,
                price: 15000,
                image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=500&fit=crop',
                stock: 20,
                status: 'active',
                tags: ['Silk', 'Accessory', 'Versatile'],
                colors: ['Multi-color'],
                description: 'Beautiful silk scarves',
                sales: 25,
                revenue: 375000,
                views: 180,
                created_at: '2025-11-01T10:00:00Z',
                updated_at: '2025-12-03T10:00:00Z',
            },
        ],
    },
];

/**
 * Product Card Component
 */
const ProductCard: React.FC<{ product: BoutiqueProduct }> = ({ product }) => {
    const backgroundColor = useThemeColor({}, 'background');
    const cardBg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handlePress = () => {
        router.push({
            pathname: '/catalog/product_detail',
            params: { productId: product.id, source: 'shop' },
        });
    };

    const discountPercentage = product.discountPrice
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    return (
        <TouchableOpacity
            style={[styles.productCard, { backgroundColor: cardBg }]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
            {product.discountPrice && discountPercentage > 0 && (
                <View style={[styles.discountBadge, { backgroundColor: tintColor }]}>
                    <ThemedText style={[styles.discountText, { color: isDark ? '#000' : 'white' }]}>
                        -{discountPercentage}%
                    </ThemedText>
                </View>
            )}
            <View style={styles.productInfo}>
                <ThemedText style={[styles.brand, { color: iconColor }]} numberOfLines={1}>
                    {product.brand}
                </ThemedText>
                <ThemedText style={styles.productName} numberOfLines={2}>
                    {product.name}
                </ThemedText>
                <View style={styles.priceRow}>
                    {product.discountPrice ? (
                        <>
                            <ThemedText style={styles.currentPrice}>
                                ₦{product.discountPrice.toLocaleString()}
                            </ThemedText>
                            <ThemedText style={[styles.originalPrice, { color: iconColor }]}>
                                ₦{product.price.toLocaleString()}
                            </ThemedText>
                        </>
                    ) : (
                        <ThemedText style={styles.currentPrice}>
                            ₦{product.price.toLocaleString()}
                        </ThemedText>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

/**
 * Main Screen Component
 */
export default function BoutiqueCollectionScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const cardBg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { boutiqueId } = useLocalSearchParams<{ boutiqueId: string }>();
    const [refreshing, setRefreshing] = React.useState(false);
    const [products, setProducts] = React.useState<BoutiqueProduct[]>(mockProducts);
    const [looks, setLooks] = React.useState<LookResponse[]>(mockLooks);

    const handleBackPress = () => {
        router.back();
    };

    const handleRefresh = React.useCallback(async () => {
        setRefreshing(true);
        // Simulate refresh - in real app, fetch from API
        setTimeout(() => {
            setProducts(mockProducts);
            setLooks(mockLooks);
            setRefreshing(false);
        }, 1000);
    }, []);

    const handleLookPress = (lookId: string) => {
        router.push({
            pathname: '/catalog/look_detail',
            params: { lookId },
        });
    };

    // Group products by category
    const productsByCategory = React.useMemo(() => {
        const grouped: Record<string, BoutiqueProduct[]> = {};
        products.forEach((product) => {
            if (!grouped[product.category]) {
                grouped[product.category] = [];
            }
            grouped[product.category].push(product);
        });
        return grouped;
    }, [products]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
            <CustomHeader title="Boutique Collection" showBackButton onBackPress={handleBackPress} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Boutique Info Header */}
                <View style={styles.boutiqueHeader}>
                    <ThemedText style={styles.boutiqueTitle}>Luxe Fashion House</ThemedText>
                    <ThemedText style={[styles.boutiqueSubtitle, { color: iconColor }]}>
                        Premium designer clothing and accessories
                    </ThemedText>
                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <ThemedText style={styles.statValue}>{products.length}</ThemedText>
                            <ThemedText style={[styles.statLabel, { color: iconColor }]}>Products</ThemedText>
                        </View>
                        <View style={styles.stat}>
                            <ThemedText style={styles.statValue}>{looks.length}</ThemedText>
                            <ThemedText style={[styles.statLabel, { color: iconColor }]}>Looks</ThemedText>
                        </View>
                        <View style={styles.stat}>
                            <IconSymbol name="star.fill" size={16} color="#FFB800" />
                            <ThemedText style={styles.statValue}>4.8</ThemedText>
                            <ThemedText style={[styles.statLabel, { color: iconColor }]}>Rating</ThemedText>
                        </View>
                    </View>
                </View>

                {/* Reviews Section */}
                <View style={styles.reviewsSection}>
                    <View style={styles.reviewsSectionHeader}>
                        <ThemedText style={styles.reviewsSectionTitle}>Reviews</ThemedText>
                        <View style={styles.reviewsHeaderRight}>
                            <View style={styles.reviewsSummary}>
                                <IconSymbol name="star.fill" size={16} color="#FFB800" />
                                <ThemedText style={styles.reviewsRating}>4.8</ThemedText>
                                <ThemedText style={[styles.reviewsCount, { color: iconColor }]}>(124)</ThemedText>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    router.push({
                                        pathname: '/reviews',
                                        params: {
                                            itemId: boutiqueId || '',
                                            itemType: 'boutique',
                                            itemName: 'Luxe Fashion House',
                                        },
                                    });
                                }}
                            >
                                <ThemedText style={[styles.viewAllReviews, { color: tintColor }]}>View All</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Quick Review Preview */}
                    <TouchableOpacity
                        style={[styles.quickReviewCard, { backgroundColor: cardBg }]}
                        onPress={() => {
                            router.push({
                                pathname: '/reviews',
                                params: {
                                    itemId: boutiqueId || '',
                                    itemType: 'boutique',
                                    itemName: 'Luxe Fashion House',
                                },
                            });
                        }}
                        activeOpacity={0.7}
                    >
                        <View style={styles.quickReviewHeader}>
                            <View style={styles.quickReviewUser}>
                                <View style={[styles.userAvatarPlaceholder, { backgroundColor: iconColor + '20' }]}>
                                    <IconSymbol name="person.fill" size={16} color={iconColor} />
                                </View>
                                <ThemedText style={styles.quickReviewName}>Michael C.</ThemedText>
                                <View style={styles.quickReviewStars}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <IconSymbol
                                            key={star}
                                            name="star.fill"
                                            size={12}
                                            color="#FFB800"
                                        />
                                    ))}
                                </View>
                            </View>
                            <ThemedText style={[styles.quickReviewDate, { color: iconColor }]}>3 days ago</ThemedText>
                        </View>
                        <ThemedText style={styles.quickReviewText} numberOfLines={2}>
                            Great boutique with excellent service! The quality of their products is outstanding...
                        </ThemedText>
                    </TouchableOpacity>

                    {/* Write Review Button */}
                    <TouchableOpacity
                        style={[styles.writeReviewButton, { backgroundColor: tintColor }]}
                        onPress={() => {
                            router.push({
                                pathname: '/reviews/add-review',
                                params: {
                                    itemId: boutiqueId || '',
                                    itemType: 'boutique',
                                    itemName: 'Luxe Fashion House',
                                },
                            });
                        }}
                    >
                        <IconSymbol name="pencil" size={18} color={isDark ? '#000' : 'white'} />
                        <ThemedText style={[styles.writeReviewButtonText, { color: isDark ? '#000' : 'white' }]}>
                            Write a Review
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Looks Section */}
                {looks.length > 0 && (
                    <View style={styles.looksSection}>
                        <LookCarousel
                            title="Curated Looks"
                            items={looks}
                            onItemPress={handleLookPress}
                        />
                    </View>
                )}

                {/* Products by Category */}
                {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                    <View key={category} style={styles.categorySection}>
                        <ThemedText style={styles.categoryTitle}>{category}</ThemedText>
                        <FlatList
                            data={categoryProducts}
                            renderItem={({ item }) => <ProductCard product={item} />}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoryList}
                            ItemSeparatorComponent={() => <View style={styles.productSeparator} />}
                            scrollEnabled={false}
                        />
                    </View>
                ))}
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
    boutiqueHeader: {
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    boutiqueTitle: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 4,
    },
    boutiqueSubtitle: {
        fontSize: 14,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 24,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    statLabel: {
        fontSize: 12,
    },
    categorySection: {
        marginBottom: 24,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    categoryList: {
        paddingVertical: 4,
    },
    productCard: {
        width: 160,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    discountText: {
        fontSize: 12,
        fontWeight: '600',
    },
    productInfo: {
        padding: 12,
    },
    brand: {
        fontSize: 12,
        marginBottom: 4,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    currentPrice: {
        fontSize: 16,
        fontWeight: '600',
    },
    originalPrice: {
        fontSize: 14,
        textDecorationLine: 'line-through',
    },
    productSeparator: {
        width: 12,
    },
    looksSection: {
        marginBottom: 32,
    },
    reviewsSection: {
        marginTop: 24,
        marginBottom: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    reviewsSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    reviewsSectionTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    reviewsHeaderRight: {
        alignItems: 'flex-end',
        gap: 8,
    },
    reviewsSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    reviewsRating: {
        fontSize: 16,
        fontWeight: '600',
    },
    reviewsCount: {
        fontSize: 14,
    },
    viewAllReviews: {
        fontSize: 14,
        fontWeight: '500',
    },
    quickReviewCard: {
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        marginBottom: 12,
    },
    quickReviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    quickReviewUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    userAvatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickReviewName: {
        fontSize: 14,
        fontWeight: '600',
    },
    quickReviewStars: {
        flexDirection: 'row',
        gap: 2,
    },
    quickReviewDate: {
        fontSize: 12,
    },
    quickReviewText: {
        fontSize: 13,
        lineHeight: 18,
    },
    writeReviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    writeReviewButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

