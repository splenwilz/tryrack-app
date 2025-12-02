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
import { StyleSheet, View, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { CustomHeader } from '@/components/custom-header';
import {
    ProductFilterModal,
    ProductFormModal,
    LookFormModal,
    LookSections,
    type ProductFilters,
    type LookFormData,
    CatalogFilterBar,
    CatalogSortTabs,
    CatalogEmptyState,
    CatalogSections,
} from '@/components/boutique';
import { FilterSummary } from '@/components/wardrobe/FilterSummary';
import { useCatalogData } from '@/hooks/boutique/useCatalogData';
import { useLooksData } from '@/hooks/boutique/useLooksData';
import { useCatalogImageProcessing } from '@/hooks/boutique/useCatalogImageProcessing';
import { useCatalogProducts } from '@/api/catalog/queries';
import { useCatalogProductForm } from '@/hooks/boutique/useCatalogProductForm';
import { useCatalogProductMutations } from '@/hooks/boutique/useCatalogProductMutations';
import { useBoutiqueLooks, useCreateLook, useUpdateLook } from '@/api/looks/queries';
import { mapFromBackendResponse } from '@/utils/catalog';
import { uploadImage } from '@/api/upload/services';
import type { CatalogProduct } from '@/types/boutique';
import type { LookResponse } from '@/api/looks/types';

export default function BoutiqueProductsScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const fabIconColor = isDark ? '#000' : 'white';

    // UI State
    const [activeSection, setActiveSection] = React.useState<'products' | 'looks'>('products');
    const [sortBy, setSortBy] = React.useState<string>('sales');
    const [showAddProductModal, setShowAddProductModal] = React.useState(false);
    const [showAddLookModal, setShowAddLookModal] = React.useState(false);
    const [showFilterModal, setShowFilterModal] = React.useState(false);
    const [editingProduct, setEditingProduct] = React.useState<CatalogProduct | null>(null);
    const [editingLook, setEditingLook] = React.useState<{ id: string } | null>(null);

    // Filters
    const [filters, setFilters] = React.useState<ProductFilters>({
        searchQuery: '',
        status: 'all',
        category: null,
        brand: null,
        tag: null,
    });

    // Fetch products from API
    const { data: apiProducts = [], refetch: refetchProducts, isRefetching: isRefetchingProducts } = useCatalogProducts({
        category: filters.category || null,
        brand: filters.brand || null,
        status: filters.status !== 'all' ? filters.status : null,
    });

    // Fetch looks from API
    const { data: apiLooks = [], refetch: refetchLooks, isRefetching: isRefetchingLooks } = useBoutiqueLooks();

    // Map API products to frontend format
    const products = React.useMemo(() => {
        return apiProducts.map(mapFromBackendResponse);
    }, [apiProducts]);

    // Organize looks data into sections
    const {
        featuredLooks,
        recentLooks,
        groupedByStyle,
    } = useLooksData({ looks: apiLooks });

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

    // Look form state
    const [lookFormData, setLookFormData] = React.useState<LookFormData>({
        title: '',
        description: '',
        style: '',
        productIds: [],
        imageUrl: '',
        isFeatured: false,
        customPrompt: '',
    });

    // API mutations
    const { handleSave, isSaving } = useCatalogProductMutations(editingProduct, {
        onSuccess: () => {
            setShowAddProductModal(false);
            setEditingProduct(null);
            resetForm();
        },
    });

    const createLookMutation = useCreateLook();
    const updateLookMutation = useUpdateLook();
    // const deleteLookMutation = useDeleteLook(); // Commented out - not used in carousel view

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

    const handleEditProduct = React.useCallback((product: CatalogProduct) => {
        setEditingProduct(product);
        setShowAddProductModal(true);
    }, []);

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
        router.push({
            pathname: '/catalog/product_detail',
            params: { productId: itemId, source: 'catalog' },
        });
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
        if (activeSection === 'products') {
        await refetchProducts();
        } else {
            await refetchLooks();
        }
    };

    // Get route params for edit navigation
    const params = useLocalSearchParams<{ editLookId?: string; editProductId?: string; activeSection?: string }>();

    // Handle edit navigation from detail screens
    useFocusEffect(
        React.useCallback(() => {
            // Handle product edit navigation
            if (params.editProductId) {
                const selectedProduct = products.find((product) => product.id === params.editProductId);
                if (selectedProduct) {
                    handleEditProduct(selectedProduct);
                    // Switch to products section if specified
                    if (params.activeSection === 'products') {
                        setActiveSection('products');
                    }
                    // Clear params to prevent re-triggering
                    router.setParams({ editProductId: undefined, activeSection: undefined });
                }
            }

            // Handle look edit navigation
            if (params.editLookId) {
                const lookId = parseInt(params.editLookId, 10);
                const apiLook = apiLooks.find((l: LookResponse) => l.id === lookId);
                if (apiLook) {
                    setEditingLook({ id: String(apiLook.id) });
                    setLookFormData({
                        title: apiLook.title,
                        description: apiLook.description || '',
                        style: apiLook.style,
                        productIds: (apiLook.products || []).map((p: { id: number | string }) => String(p.id)),
                        imageUrl: apiLook.image_url || '',
                        isFeatured: apiLook.is_featured,
                        customPrompt: '', // Custom prompt not stored in backend yet
                    });
                    setShowAddLookModal(true);
                    // Switch to looks section if specified
                    if (params.activeSection === 'looks') {
                        setActiveSection('looks');
                    }
                    // Clear params to prevent re-triggering
                    router.setParams({ editLookId: undefined, activeSection: undefined });
                }
            }
        }, [params.editLookId, params.editProductId, params.activeSection, apiLooks, products, handleEditProduct])
    );

    // Look handlers
    const handleAddLook = () => {
        setEditingLook(null);
        setLookFormData({
            title: '',
            description: '',
            style: '',
            productIds: [],
            imageUrl: '',
            isFeatured: false,
            customPrompt: '',
        });
        setShowAddLookModal(true);
    };

    const handleSaveLook = async () => {
        try {
            if (!lookFormData.title.trim() || !lookFormData.style || lookFormData.productIds.length < 2) {
                Alert.alert('Validation Error', 'Please fill in all required fields and select at least 2 products.');
                return;
            }

            let imageUrl = lookFormData.imageUrl;

            // Upload image if it's a local URI
            if (imageUrl && !imageUrl.startsWith('http')) {
                try {
                    imageUrl = await uploadImage({
                        imageUri: imageUrl,
                        folder: 'look-images',
                    });
                    setLookFormData((prev) => ({ ...prev, imageUrl }));
                } catch {
                    Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
                    return;
                }
            }

            const payload = {
                title: lookFormData.title.trim(),
                description: lookFormData.description.trim() || undefined,
                style: lookFormData.style,
                product_ids: lookFormData.productIds,
                image_url: imageUrl || undefined,
                is_featured: lookFormData.isFeatured,
            };

            console.log('📤 Look Payload:', JSON.stringify(payload, null, 2));
            console.log('📤 Look Payload (formatted):', {
                title: payload.title,
                description: payload.description,
                style: payload.style,
                product_ids: payload.product_ids,
                product_count: payload.product_ids.length,
                image_url: payload.image_url ? `${payload.image_url.substring(0, 50)}...` : null,
                is_featured: payload.is_featured,
                action: editingLook ? 'UPDATE' : 'CREATE',
                look_id: editingLook?.id || 'NEW',
            });

            if (editingLook) {
                // Convert string ID to number for API call
                const lookId = typeof editingLook.id === 'number' ? editingLook.id : parseInt(editingLook.id, 10);
                await updateLookMutation.mutateAsync({ id: String(lookId), data: payload });
                Alert.alert('Success', 'Look updated successfully!');
            } else {
                await createLookMutation.mutateAsync(payload);
                Alert.alert('Success', 'Look created successfully!');
            }

            setShowAddLookModal(false);
            setEditingLook(null);
            setLookFormData({
                title: '',
                description: '',
                style: '',
                productIds: [],
                imageUrl: '',
                isFeatured: false,
                customPrompt: '',
            });
        } catch (error) {
            console.error('Failed to save look:', error);
            Alert.alert('Error', 'Failed to save look. Please try again.');
        }
    };

    // Delete look handler (kept for future use, e.g., long-press actions)
    // const handleDeleteLook = (lookId: string) => {
    //     Alert.alert(
    //         'Delete Look',
    //         'Are you sure you want to delete this look?',
    //         [
    //             { text: 'Cancel', style: 'cancel' },
    //             {
    //                 text: 'Delete',
    //                 style: 'destructive',
    //                 onPress: async () => {
    //                     try {
    //                         await deleteLookMutation.mutateAsync(lookId);
    //                         Alert.alert('Success', 'Look deleted successfully!');
    //                     } catch {
    //                         Alert.alert('Error', 'Failed to delete look. Please try again.');
    //                     }
    //                 },
    //             },
    //         ]
    //     );
    // };

    const handleToggleProductInLook = (productId: string) => {
        setLookFormData((prev) => {
            const isSelected = prev.productIds.includes(productId);
            if (isSelected) {
                return { ...prev, productIds: prev.productIds.filter((id) => id !== productId) };
            } else {
                if (prev.productIds.length >= 5) {
                    Alert.alert('Limit Reached', 'You can only select up to 5 products per look.');
                    return prev;
                }
                return { ...prev, productIds: [...prev.productIds, productId] };
            }
        });
    };

    const handleUpdateLookField = React.useCallback((field: string, value: unknown) => {
        setLookFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

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
                title={activeSection === 'products' ? 'Products' : 'Looks'}
                showBackButton={true}
                onBackPress={handleBackPress}
                onSearchPress={handleSearchPress}
                onNotificationPress={handleNotificationPress}
                notificationCount={3}
            />

            {/* Section Switcher */}
            <View style={[styles.sectionSwitcher, { backgroundColor }]}>
                <TouchableOpacity
                    style={[
                        styles.sectionTab,
                        activeSection === 'products' && [styles.activeSectionTab, { backgroundColor: tintColor }],
                    ]}
                    onPress={() => setActiveSection('products')}
                >
                    <ThemedText
                        style={[
                            styles.sectionTabText,
                            { color: activeSection === 'products' ? (isDark ? '#000' : 'white') : iconColor },
                        ]}
                    >
                        Products
                    </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.sectionTab,
                        activeSection === 'looks' && [styles.activeSectionTab, { backgroundColor: tintColor }],
                    ]}
                    onPress={() => setActiveSection('looks')}
                >
                    <ThemedText
                        style={[
                            styles.sectionTabText,
                            { color: activeSection === 'looks' ? (isDark ? '#000' : 'white') : iconColor },
                        ]}
                    >
                        Looks
                    </ThemedText>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={activeSection === 'products' ? isRefetchingProducts : isRefetchingLooks}
                        onRefresh={handleRefresh}
                        tintColor={tintColor}
                    />
                }
            >
                {activeSection === 'products' ? (
                    <>
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
                    </>
                ) : (
                    <>
                        {/* Looks Section */}
                        {apiLooks.length === 0 ? (
                            <View style={styles.emptyState}>
                                <ThemedText type="subtitle" style={styles.emptyStateTitle}>
                                    No Looks Yet
                                </ThemedText>
                                <ThemedText style={[styles.emptyStateText, { color: iconColor }]}>
                                    Create your first complete outfit look to showcase your styling expertise
                                </ThemedText>
                            </View>
                        ) : (
                            <LookSections
                                featuredLooks={featuredLooks}
                                recentLooks={recentLooks}
                                groupedByStyle={groupedByStyle}
                                onItemPress={(itemId) => {
                                    router.push({
                                        pathname: '/catalog/look_detail',
                                        params: { lookId: itemId },
                                    });
                                }}
                            />
                        )}
                    </>
                )}
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: tintColor }]}
                onPress={activeSection === 'products' ? handleAddProduct : handleAddLook}
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

            {/* Look Form Modal */}
            <LookFormModal
                visible={showAddLookModal}
                editingLook={editingLook}
                formData={lookFormData}
                availableProducts={products}
                onClose={() => {
                    setShowAddLookModal(false);
                    setEditingLook(null);
                    setLookFormData({
                        title: '',
                        description: '',
                        style: '',
                        productIds: [],
                        imageUrl: '',
                        isFeatured: false,
                        customPrompt: '',
                    });
                }}
                onSave={handleSaveLook}
                onUpdateField={handleUpdateLookField}
                onToggleProduct={handleToggleProductInLook}
                isSaving={createLookMutation.isPending || updateLookMutation.isPending}
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
    sectionSwitcher: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    sectionTab: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    activeSectionTab: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        paddingVertical: 60,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    looksGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 16,
    },
    lookCard: {
        width: '47%',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lookImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    lookImagePlaceholder: {
        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lookCardContent: {
        padding: 12,
    },
    lookCardTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    lookCardStyle: {
        fontSize: 12,
        textTransform: 'capitalize',
        marginBottom: 8,
    },
    lookCardPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    lookCardActions: {
        flexDirection: 'row',
        gap: 8,
    },
    lookActionButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
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

