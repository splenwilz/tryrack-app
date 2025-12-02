/**
 * Product Detail Screen
 * View a single product with full details and actions
 *
 * @see app/catalog/look_detail.tsx - Similar pattern for looks
 */

import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomHeader } from '@/components/custom-header';
import { useCatalogProduct, useDeleteCatalogProduct } from '@/api/catalog/queries';
import { mapFromBackendResponse } from '@/utils/catalog';
import { ApiError } from '@/api/client';

export default function ProductDetailScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const cardBg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { productId, source } = useLocalSearchParams<{ productId: string; source?: string }>();

    const { data: apiProduct, isLoading, error } = useCatalogProduct(productId || '');
    const deleteProductMutation = useDeleteCatalogProduct();

    // Determine view mode based on navigation source
    // 'shop' = individual user browsing, 'catalog' = boutique owner managing products
    const isFromCatalog = source === 'catalog';

    const product = apiProduct ? mapFromBackendResponse(apiProduct) : null;
    const [showAnalytics, setShowAnalytics] = React.useState(false);

    const handleBackPress = () => {
        router.back();
    };

    const handleEdit = () => {
        if (!product) return;
        router.push({
            pathname: '/(boutique_tabs)/catalog',
            params: {
                editProductId: product.id,
                activeSection: 'products',
            },
        });
    };

    const handleDelete = () => {
        if (!product) return;
        Alert.alert(
            'Delete Product',
            'Are you sure you want to delete this product?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteProductMutation.mutateAsync(product.id);
                            Alert.alert('Success', 'Product deleted successfully!');
                            router.back();
                        } catch {
                            Alert.alert('Error', 'Failed to delete product. Please try again.');
                        }
                    },
                },
            ]
        );
    };


    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <CustomHeader title="Product Details" showBackButton onBackPress={handleBackPress} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={tintColor} />
                    <ThemedText style={styles.loadingText}>Loading product...</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    // Show error state - don't redirect, just show error message
    if (error && !isLoading) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load product';
        const isUnauthorized = error instanceof ApiError && (error.status === 401 || error.status === 403);

        return (
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <CustomHeader title="Product Details" showBackButton onBackPress={handleBackPress} />
                <View style={styles.errorContainer}>
                    <ThemedText style={styles.errorText}>
                        {isUnauthorized ? 'Product not available' : 'Failed to load product'}
                    </ThemedText>
                    <ThemedText style={[styles.errorSubtext, { color: iconColor }]}>
                        {isUnauthorized
                            ? 'This product may not be available for viewing.'
                            : errorMessage}
                    </ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    // Show error if no product after loading completes
    if (!isLoading && !product && !error) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <CustomHeader title="Product Details" showBackButton onBackPress={handleBackPress} />
                <View style={styles.errorContainer}>
                    <ThemedText style={styles.errorText}>Product not found</ThemedText>
                    <ThemedText style={[styles.errorSubtext, { color: iconColor }]}>
                        The product you&apos;re looking for doesn&apos;t exist or is no longer available.
                    </ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    // Don't render product details if we don't have a product yet
    if (!product) {
        return null;
    }

    const discountPercentage = product.discountPrice && product.price
        ? Math.round((1 - product.discountPrice / product.price) * 100)
        : 0;

    const getStatusBadge = () => {
        if (product.status === 'out_of_stock') {
            return (
                <View style={[styles.statusBadge, { backgroundColor: iconColor, opacity: 0.9 }]}>
                    <IconSymbol name="exclamationmark.circle.fill" size={12} color="white" />
                    <ThemedText style={styles.statusText}>Out of Stock</ThemedText>
                </View>
            );
        }
        if (product.status === 'inactive') {
            return (
                <View style={[styles.statusBadge, { backgroundColor: iconColor, opacity: 0.9 }]}>
                    <IconSymbol name="pause.circle.fill" size={12} color="white" />
                    <ThemedText style={styles.statusText}>Inactive</ThemedText>
                </View>
            );
        }
        return (
            <View style={[styles.statusBadge, { backgroundColor: tintColor, opacity: 0.9 }]}>
                <IconSymbol name="checkmark.circle.fill" size={12} color={isDark ? '#000' : 'white'} />
                <ThemedText style={[styles.statusText, { color: isDark ? '#000' : 'white' }]}>Active</ThemedText>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <CustomHeader title="Product Details" showBackButton onBackPress={handleBackPress} />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Product Image */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: product.imageUrl }} style={styles.productImage} resizeMode="cover" />
                    {getStatusBadge()}
                    {product.discountPrice && discountPercentage > 0 && (
                        <View style={[styles.discountBadge, { backgroundColor: tintColor }]}>
                            <ThemedText style={[styles.discountText, { color: isDark ? '#000' : 'white' }]}>
                                -{discountPercentage}%
                            </ThemedText>
                        </View>
                    )}
                </View>

                {/* Product Info */}
                <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
                    <ThemedText type="title" style={styles.title}>
                        {product.name}
                    </ThemedText>
                    {product.brand && (
                        <ThemedText style={[styles.brand, { color: iconColor }]}>
                            {product.brand}
                        </ThemedText>
                    )}

                    <View style={styles.priceRow}>
                        <View>
                            <ThemedText style={[styles.currentPrice, { color: tintColor }]}>
                                ₦{product.discountPrice ? product.discountPrice.toLocaleString() : product.price.toLocaleString()}
                            </ThemedText>
                            {product.discountPrice && (
                                <ThemedText style={styles.originalPrice}>
                                    ₦{product.price.toLocaleString()}
                                </ThemedText>
                            )}
                        </View>
                        {isFromCatalog && product.costPrice && (
                            <View style={styles.costPriceContainer}>
                                <ThemedText style={[styles.costPriceLabel, { color: iconColor }]}>
                                    Cost Price:
                                </ThemedText>
                                <ThemedText style={[styles.costPrice, { color: iconColor }]}>
                                    ₦{product.costPrice.toLocaleString()}
                                </ThemedText>
                            </View>
                        )}
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <ThemedText style={[styles.metaLabel, { color: iconColor }]}>Category:</ThemedText>
                            <ThemedText style={styles.metaValue}>{product.category}</ThemedText>
                        </View>
                        {isFromCatalog && (
                            <View style={styles.metaItem}>
                                <ThemedText style={[styles.metaLabel, { color: iconColor }]}>Stock:</ThemedText>
                                <ThemedText style={styles.metaValue}>{product.stock} units</ThemedText>
                            </View>
                        )}
                    </View>

                    {product.description && (
                        <View style={styles.descriptionContainer}>
                            <ThemedText style={[styles.descriptionLabel, { color: iconColor }]}>
                                Description:
                            </ThemedText>
                            <ThemedText style={styles.description}>{product.description}</ThemedText>
                        </View>
                    )}

                    {/* Tags */}
                    {product.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            <ThemedText style={[styles.sectionLabel, { color: iconColor }]}>Tags:</ThemedText>
                            <View style={styles.tagsRow}>
                                {product.tags.map((tag) => (
                                    <View key={tag} style={[styles.tag, { backgroundColor: iconColor + '20' }]}>
                                        <ThemedText style={styles.tagText}>{tag}</ThemedText>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Colors */}
                    {product.colors.length > 0 && (
                        <View style={styles.colorsContainer}>
                            <ThemedText style={[styles.sectionLabel, { color: iconColor }]}>Colors:</ThemedText>
                            <View style={styles.colorsRow}>
                                {product.colors.map((color) => (
                                    <View key={color} style={[styles.colorChip, { backgroundColor: iconColor + '20' }]}>
                                        <ThemedText style={styles.colorText}>{color}</ThemedText>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Analytics (only when viewing from catalog) - Accordion */}
                    {isFromCatalog && apiProduct && (apiProduct.sales > 0 || apiProduct.views > 0 || apiProduct.revenue > 0) && (
                        <View style={styles.analyticsContainer}>
                            <TouchableOpacity
                                style={styles.analyticsHeader}
                                onPress={() => setShowAnalytics(!showAnalytics)}
                                activeOpacity={0.7}
                            >
                                <ThemedText style={[styles.sectionLabel, { color: iconColor }]}>Analytics</ThemedText>
                                <IconSymbol
                                    name={showAnalytics ? "chevron.up" : "chevron.down"}
                                    size={20}
                                    color={iconColor}
                                />
                            </TouchableOpacity>
                            {showAnalytics && (
                                <View style={styles.analyticsContent}>
                                    <View style={styles.analyticsRow}>
                                        <View style={styles.analyticsItem}>
                                            <ThemedText style={[styles.analyticsValue, { color: tintColor }]}>
                                                {apiProduct.sales}
                                            </ThemedText>
                                            <ThemedText style={[styles.analyticsLabel, { color: iconColor }]}>Sales</ThemedText>
                                        </View>
                                        <View style={styles.analyticsItem}>
                                            <ThemedText style={[styles.analyticsValue, { color: tintColor }]}>
                                                {apiProduct.views}
                                            </ThemedText>
                                            <ThemedText style={[styles.analyticsLabel, { color: iconColor }]}>Views</ThemedText>
                                        </View>
                                        <View style={styles.analyticsItem}>
                                            <ThemedText style={[styles.analyticsValue, { color: tintColor }]}>
                                                ₦{apiProduct.revenue.toLocaleString()}
                                            </ThemedText>
                                            <ThemedText style={[styles.analyticsLabel, { color: iconColor }]}>Revenue</ThemedText>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Actions - Different based on navigation source */}
                {isFromCatalog ? (
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.editButton, { backgroundColor: tintColor }]}
                            onPress={handleEdit}
                        >
                            <IconSymbol name="pencil" size={18} color={isDark ? '#000' : 'white'} />
                            <ThemedText style={[styles.actionButtonText, { color: isDark ? '#000' : 'white' }]}>
                                Edit Product
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton, { borderColor: '#FF3B30' }]}
                            onPress={handleDelete}
                            disabled={deleteProductMutation.isPending}
                        >
                            {deleteProductMutation.isPending ? (
                                <ActivityIndicator size="small" color="#FF3B30" />
                            ) : (
                                <IconSymbol name="trash" size={18} color="#FF3B30" />
                            )}
                            <ThemedText style={[styles.actionButtonText, { color: '#FF3B30' }]}>
                                {deleteProductMutation.isPending ? 'Deleting...' : 'Delete Product'}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.tryOnButton, { backgroundColor: tintColor }]}
                            onPress={() => {
                                if (!product) return;

                                // Prepare boutique item data for virtual try-on
                                const boutiqueItem = {
                                    id: product.id,
                                    title: product.name,
                                    brand: product.brand || 'Unknown Brand',
                                    category: product.category,
                                    imageUrl: product.imageUrl,
                                    price: product.discountPrice || product.price,
                                    colors: product.colors || [],
                                    tags: product.tags || [],
                                    boutique: {
                                        id: 'shop',
                                        name: 'Shop',
                                        logo: '',
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
                            }}
                        >
                            <IconSymbol name="camera.fill" size={18} color={isDark ? '#000' : 'white'} />
                            <ThemedText style={[styles.actionButtonText, { color: isDark ? '#000' : 'white' }]}>
                                Try Virtually
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.purchaseButton, { backgroundColor: tintColor }]}
                            onPress={() => {
                                console.log('Purchase:', product.name);
                                // TODO: Navigate to purchase/checkout
                            }}
                        >
                            <IconSymbol name="cart.fill" size={18} color={isDark ? '#000' : 'white'} />
                            <ThemedText style={[styles.actionButtonText, { color: isDark ? '#000' : 'white' }]}>
                                Add to Cart
                            </ThemedText>
                        </TouchableOpacity>
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
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        opacity: 0.7,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        gap: 8,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
    },
    errorSubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
    imageContainer: {
        width: '100%',
        height: 400,
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    statusBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        zIndex: 10,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    discountBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        zIndex: 10,
    },
    discountText: {
        fontSize: 14,
        fontWeight: '600',
    },
    infoCard: {
        margin: 20,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    brand: {
        fontSize: 16,
        marginBottom: 16,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    currentPrice: {
        paddingTop: 4,
        fontSize: 28,
        fontWeight: 'bold',
    },
    originalPrice: {
        fontSize: 18,
        opacity: 0.6,
        textDecorationLine: 'line-through',
        marginTop: 4,
    },
    costPriceContainer: {
        alignItems: 'flex-end',
    },
    costPriceLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    costPrice: {
        fontSize: 16,
        fontWeight: '500',
    },
    metaRow: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 20,
    },
    metaItem: {
        flex: 1,
    },
    metaLabel: {
        fontSize: 14,
        marginBottom: 4,
    },
    metaValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    descriptionContainer: {
        marginBottom: 20,
    },
    descriptionLabel: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '600',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
    tagsContainer: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    tagText: {
        fontSize: 14,
    },
    colorsContainer: {
        marginBottom: 20,
    },
    colorsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    colorChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    colorText: {
        fontSize: 14,
        textTransform: 'capitalize',
    },
    analyticsContainer: {
        marginTop: 8,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    analyticsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    analyticsContent: {
        marginTop: 12,
    },
    analyticsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 16,
    },
    analyticsItem: {
        alignItems: 'center',
        flex: 1,
    },
    analyticsValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    analyticsLabel: {
        fontSize: 12,
    },
    actionsContainer: {
        margin: 20,
        marginBottom: 40,
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
    },
    editButton: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tryOnButton: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    purchaseButton: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    deleteButton: {
        borderWidth: 2,
        backgroundColor: 'transparent',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

