/**
 * Boutique Products Screen (Refactored)
 * Comprehensive product management with analytics and inventory tracking
 * 
 * Refactored for better separation of concerns:
 * - Form logic extracted to ProductFormModal component
 * - Form state managed by useCatalogProductForm hook
 * - Validation logic in utils/catalog-validation.ts
 * - API mutations in useCatalogProductMutations hook
 */

import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { CustomHeader } from '@/components/custom-header';
import {
    ProductFilterModal,
    ProductFormModal,
    type ProductFilters,
    CatalogFilterBar,
    CatalogSortTabs,
    CatalogEmptyState,
    CatalogSections,
} from '@/components/boutique';
import { FilterSummary } from '@/components/wardrobe/FilterSummary';
import { useCatalogData } from '@/hooks/boutique/useCatalogData';
import { useCatalogImageProcessing } from '@/hooks/boutique/useCatalogImageProcessing';
import { useCatalogProducts } from '@/api/catalog/queries';
import { useCatalogProductForm } from '@/hooks/boutique/useCatalogProductForm';
import { useCatalogProductMutations } from '@/hooks/boutique/useCatalogProductMutations';
import { mapFromBackendResponse } from '@/utils/catalog';
import type { CatalogProduct } from '@/types/boutique';

export default function BoutiqueProductsScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const fabIconColor = isDark ? '#000' : 'white';

    // UI State
    const [sortBy, setSortBy] = React.useState<string>('sales');
    const [showAddProductModal, setShowAddProductModal] = React.useState(false);
    const [showFilterModal, setShowFilterModal] = React.useState(false);
    const [editingProduct, setEditingProduct] = React.useState<CatalogProduct | null>(null);

    // Filters
    const [filters, setFilters] = React.useState<ProductFilters>({
        searchQuery: '',
        status: 'all',
        category: null,
        brand: null,
        tag: null,
    });

    // Fetch products from API
    const { data: apiProducts = [], refetch: refetchProducts, isRefetching } = useCatalogProducts({
        category: filters.category || null,
        brand: filters.brand || null,
        status: filters.status !== 'all' ? filters.status : null,
    });

    // Map API products to frontend format
    const products = React.useMemo(() => {
        return apiProducts.map(mapFromBackendResponse);
    }, [apiProducts]);

    // Form management
    const form = useCatalogProductForm();
    const { updateForm, updateField, populateFromProduct, resetForm } = form;

    // Populate form when editing
    React.useEffect(() => {
        if (editingProduct && showAddProductModal) {
            populateFromProduct(editingProduct);
        } else if (!editingProduct && showAddProductModal) {
            resetForm();
        }
    }, [editingProduct, showAddProductModal, populateFromProduct, resetForm]);

    // Memoize callbacks to prevent infinite render loops
    // Use refs to access latest form data without causing re-renders
    const formDataRef = React.useRef(form.formData);
    React.useEffect(() => {
        formDataRef.current = form.formData;
    }, [form.formData]);

    const handleMetadataExtracted = React.useCallback((metadata: {
        name: string;
        category: string;
        tags: string[];
        colors?: string[];
        description?: string;
    }) => {
        updateForm({
            name: metadata.name || formDataRef.current.name,
            category: metadata.category || formDataRef.current.category,
            tags: metadata.tags || formDataRef.current.tags,
            colors: metadata.colors || formDataRef.current.colors,
            description: metadata.description || formDataRef.current.description,
        });
    }, [updateForm]);

    const handleImageReady = React.useCallback((imageUrl: string) => {
        updateField('imageUrl', imageUrl);
    }, [updateField]);

    // Image processing
    const {
        handleSelectPhoto,
        processingStage,
        isPickingPhoto,
        isUploadingImage,
        resetProcessingState,
    } = useCatalogImageProcessing({
        onMetadataExtracted: handleMetadataExtracted,
        onImageReady: handleImageReady,
    });

    // API mutations
    const { handleSave, isSaving } = useCatalogProductMutations(editingProduct, {
        onSuccess: () => {
            setShowAddProductModal(false);
            setEditingProduct(null);
            resetForm();
        },
    });

    // Handlers
    const handleBackPress = () => {
        router.back();
    };

    const handleSearchPress = () => {
        console.log('Search products');
    };

    const handleNotificationPress = () => {
        console.log('Notifications pressed');
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        setShowAddProductModal(true);
    };

    const handleEditProduct = (product: CatalogProduct) => {
        setEditingProduct(product);
        setShowAddProductModal(true);
    };

    const handleSaveProduct = () => {
        handleSave(form.formData);
    };

    const handleImageUpload = async () => {
        await handleSelectPhoto();
    };

    const handleRemovePhoto = () => {
        updateField('imageUrl', '');
        resetProcessingState();
    };

    const handleItemPress = (itemId: string) => {
        const selectedProduct = products.find((product) => product.id === itemId);
        if (selectedProduct) {
            handleEditProduct(selectedProduct);
        }
    };

    const handleViewAll = (category: string) => {
        router.push({
            pathname: '/catalog/category',
            params: { category },
        });
    };

    const handleApplyFilters = (newFilters: ProductFilters) => {
        setFilters(newFilters);
    };

    const handleClearFilters = () => {
        setFilters({
            searchQuery: '',
            status: 'all',
            category: null,
            brand: null,
            tag: null,
        });
    };

    const handleRefresh = async () => {
        await refetchProducts();
    };

    // Processed data
    const {
        productCards,
        featuredProduct,
        recentProducts,
        groupedByCategory,
        outOfStockProducts,
        inactiveProducts,
        availableCategories,
        availableBrands,
        availableTags,
        hasActiveFilters,
        filteredCount,
    } = useCatalogData({ products, filters, sortBy });

    const activeFilterCount = [
        filters.searchQuery && 'Search',
        filters.status !== 'all' && filters.status,
        filters.category && 'Category',
        filters.brand && 'Brand',
        filters.tag && 'Tag',
    ].filter(Boolean).length;

    const sortOptions = [
        { key: 'sales', label: 'Sales' },
        { key: 'revenue', label: 'Revenue' },
        { key: 'views', label: 'Views' },
        { key: 'price', label: 'Price' },
        { key: 'rating', label: 'Rating' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <CustomHeader
                title="Products"
                showBackButton={true}
                onBackPress={handleBackPress}
                onSearchPress={handleSearchPress}
                onNotificationPress={handleNotificationPress}
                notificationCount={3}
            />

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={handleRefresh}
                        tintColor={tintColor}
                    />
                }
            >
                {/* Filter Bar */}
                <CatalogFilterBar
                    hasActiveFilters={hasActiveFilters}
                    activeFilterCount={activeFilterCount}
                    onFilterPress={() => setShowFilterModal(true)}
                    onClearFilters={handleClearFilters}
                />

                {/* Filter Summary */}
                <FilterSummary
                    hasActiveFilters={hasActiveFilters}
                    filteredCount={filteredCount}
                    totalCount={products.length}
                    onClearFilters={handleClearFilters}
                />

                {/* Sort Controls */}
                <View style={styles.sortSection}>
                    <ThemedText style={[styles.sortLabel, { color: iconColor }]}>Sort by:</ThemedText>
                    <CatalogSortTabs options={sortOptions} value={sortBy} onChange={setSortBy} />
                </View>

                {productCards.length === 0 ? (
                    <CatalogEmptyState />
                ) : (
                    <CatalogSections
                        featuredProduct={featuredProduct}
                        recentProducts={recentProducts}
                        groupedByCategory={groupedByCategory}
                        outOfStockProducts={outOfStockProducts}
                        inactiveProducts={inactiveProducts}
                        onItemPress={handleItemPress}
                        onViewAll={handleViewAll}
                    />
                )}
            </ScrollView>

            {/* Floating Action Button - Add Product */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: tintColor }]}
                onPress={handleAddProduct}
            >
                <IconSymbol name="plus" size={24} color={fabIconColor} />
            </TouchableOpacity>

            {/* Filter Modal */}
            <ProductFilterModal
                visible={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                filters={filters}
                onApplyFilters={handleApplyFilters}
                availableCategories={availableCategories}
                availableBrands={availableBrands}
                availableTags={availableTags}
            />

            {/* Product Form Modal */}
            <ProductFormModal
                visible={showAddProductModal}
                editingProduct={editingProduct}
                formData={form.formData}
                onClose={() => {
                    setShowAddProductModal(false);
                    setEditingProduct(null);
                    resetForm();
                }}
                onSave={handleSaveProduct}
                onUpdateField={updateField}
                onUpdateColors={(colors) => updateField('colors', colors)}
                onAddTag={form.addTag}
                onRemoveTag={form.removeTag}
                onImageUpload={handleImageUpload}
                onRemovePhoto={handleRemovePhoto}
                imageUrl={form.formData.imageUrl}
                processingStage={processingStage}
                isPickingPhoto={isPickingPhoto}
                isUploadingImage={isUploadingImage}
                isSaving={isSaving}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sortSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        marginBottom: 12,
        gap: 8,
    },
    sortLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 4,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});

