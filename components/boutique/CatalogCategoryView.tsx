/**
 * Catalog Category View Component
 * Displays all products in a specific catalog category
 * Reusable component for showing filtered catalog products
 * 
 * @see components/wardrobe/CategoryView.tsx - Similar pattern for wardrobe
 */

import { useMemo } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { CustomHeader } from '@/components/custom-header';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface CatalogItem {
    id: string;
    title: string;
    category: string;
    imageUrl: string;
    colors: string[];
    tags: string[];
    status: string;
    created_at?: string;
    brand?: string;
    price?: number;
    boutique?: {
        name?: string;
        logo?: string;
    };
}

interface CatalogCategoryViewProps {
    category: string;
    items: CatalogItem[];
    isLoading?: boolean;
    error?: unknown;
    onItemPress?: (itemId: string) => void;
}

/**
 * Catalog Product Card Component
 * Displays individual catalog products in the grid
 */
const CatalogProductCard: React.FC<{ item: CatalogItem; onPress?: (itemId: string) => void }> = ({ item, onPress }) => {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');

    const handleViewItem = () => {
        if (onPress) {
            onPress(item.id);
        } else {
            // Default: navigate to product detail view
            router.push({
                pathname: '/catalog/product_detail',
                params: { productId: item.id, source: 'catalog' },
            });
        }
    };

    const handleTryOn = (e: { stopPropagation: () => void }) => {
        e.stopPropagation();

        // Prepare boutique item data for virtual try-on
        const boutiqueItem = {
            id: item.id,
            title: item.title,
            brand: item.brand || 'Unknown Brand',
            category: item.category,
            imageUrl: item.imageUrl,
            price: item.price || 0,
            colors: item.colors || [],
            tags: item.tags || [],
            boutique: {
                id: 'shop',
                name: item.boutique?.name || 'Shop',
                logo: item.boutique?.logo || '',
            },
            arAvailable: true,
        };

        // Navigate to virtual try-on with product data
        router.push({
            pathname: '/wardrobe/virtual_tryon',
            params: {
                itemType: 'boutique',
                itemData: JSON.stringify(boutiqueItem),
            },
        });
    };


    return (
        <TouchableOpacity
            style={[styles.itemCard, { backgroundColor }]}
            onPress={handleViewItem}
            activeOpacity={0.7}
        >
            <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />

            {/* Boutique Logo */}
            {item.boutique?.logo && (
                <View style={styles.boutiqueLogo}>
                    <Image source={{ uri: item.boutique.logo }} style={styles.logoImage} />
                </View>
            )}

            <View style={styles.itemDetails}>
                {item.brand && (
                    <ThemedText style={styles.brandName}>{item.brand}</ThemedText>
                )}
                <ThemedText style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                </ThemedText>
                {item.price !== undefined && (
                    <ThemedText style={styles.price}>₦{item.price.toLocaleString()}</ThemedText>
                )}

                {/* Action Buttons */}
                <TouchableOpacity
                    style={[styles.actionButton, styles.tryOnButton, { backgroundColor: tintColor }]}
                    onPress={handleTryOn}
                >
                    <IconSymbol name="plus" size={14} color="white" />
                    <ThemedText style={styles.actionButtonText}>Try Virtually</ThemedText>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

/**
 * Catalog Category View Component
 * Displays all products in a specific catalog category
 */
export function CatalogCategoryView({
    category,
    items,
    isLoading = false,
    error,
    onItemPress,
}: CatalogCategoryViewProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const iconColor = useThemeColor({}, 'icon');

    const handleBackPress = () => {
        router.back();
    };

    // Format category name for display
    const categoryDisplayName = useMemo(() => {
        if (!category) return 'Category';
        if (category === 'recent') return 'Recently Added';
        return category
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }, [category]);

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <CustomHeader
                    title={categoryDisplayName}
                    showBackButton={true}
                    onBackPress={handleBackPress}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={iconColor} />
                    <ThemedText style={[styles.loadingText, { color: iconColor }]}>
                        Loading products...
                    </ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (error) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <CustomHeader
                    title={categoryDisplayName}
                    showBackButton={true}
                    onBackPress={handleBackPress}
                />
                <View style={styles.errorContainer}>
                    <ThemedText style={[styles.errorText, { color: textColor }]}>
                        Failed to load products. Please try again.
                    </ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    // Empty state
    if (items.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <CustomHeader
                    title={categoryDisplayName}
                    showBackButton={true}
                    onBackPress={handleBackPress}
                />
                <View style={styles.emptyContainer}>
                    <ThemedText style={[styles.emptyText, { color: iconColor }]}>
                        No products found in this category
                    </ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <CustomHeader
                title={categoryDisplayName}
                showBackButton={true}
                onBackPress={handleBackPress}
            />
            <FlatList
                data={items}
                renderItem={({ item }) => (
                    <CatalogProductCard item={item} onPress={onItemPress} />
                )}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    listContent: {
        padding: 16,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    itemCard: {
        width: '48%',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    boutiqueLogo: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 2,
        zIndex: 1,
    },
    logoImage: {
        width: '100%',
        height: '100%',
        borderRadius: 14,
        resizeMode: 'cover',
    },
    itemDetails: {
        padding: 12,
    },
    brandName: {
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.7,
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 6,
        marginTop: 4,
    },
    tryOnButton: {
        // backgroundColor set inline
    },
    actionButtonText: {
        fontSize: 10,
        fontWeight: '600',
        color: 'white',
    },
});

