import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useCreateCatalogProduct, useUpdateCatalogProduct } from '@/api/catalog/queries';
import { mapToBackendRequest } from '@/utils/catalog';
import { queryKeys } from '@/api/utils/query-keys';
import { ApiError } from '@/api/client';
import type { CatalogProduct } from '@/types/boutique';
import type { CatalogProductFormData } from './useCatalogProductForm';
import { validateCatalogProductForm } from '@/utils/catalog-validation';

interface UseCatalogProductMutationsOptions {
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

/**
 * Hook for managing catalog product mutations (create/update)
 * Encapsulates API mutation logic and error handling
 * 
 * @param editingProduct - Product being edited (null for new products)
 * @param options - Callback options
 * @returns Mutation handlers and loading states
 */
export function useCatalogProductMutations(
    editingProduct: CatalogProduct | null,
    options?: UseCatalogProductMutationsOptions
) {
    const { mutateAsync: createProduct, isPending: isCreating, queryClient: createQueryClient } = useCreateCatalogProduct();
    const updateProductMutation = useUpdateCatalogProduct(editingProduct?.id || '');

    const isSaving = isCreating || (editingProduct ? updateProductMutation.isPending : false);
    const queryClient = editingProduct ? updateProductMutation.queryClient : createQueryClient;

    const handleSave = useCallback(async (formData: CatalogProductFormData) => {
        // Validate form
        const validation = validateCatalogProductForm(formData);
        if (!validation.isValid) {
            Alert.alert('Validation Error', validation.errorMessage);
            return;
        }

        // Parse form values
        const price = parseInt(formData.price);
        const costPrice = formData.costPrice ? parseInt(formData.costPrice) : undefined;
        const discountPrice = formData.discountPrice ? parseInt(formData.discountPrice) : undefined;
        const stock = parseInt(formData.stock) || 0;

        try {
            // Map form data to backend request format
            const backendRequest = mapToBackendRequest({
                name: formData.name.trim(),
                category: formData.category.trim(),
                brand: formData.brand.trim() || undefined,
                costPrice: costPrice,
                price: price,
                discountPrice: discountPrice,
                imageUrl: formData.imageUrl,
                stock: stock,
                status: editingProduct?.status || 'active',
                tags: formData.tags,
                colors: formData.colors,
                description: formData.description.trim(),
            });

            // Log payload for debugging
            console.log('[Catalog] ========== PRODUCT PAYLOAD ==========');
            console.log('[Catalog] Backend request payload:', JSON.stringify(backendRequest, null, 2));
            console.log('[Catalog] Image URL (S3):', backendRequest.image_url);
            console.log('[Catalog] Image URL type:', backendRequest.image_url.startsWith('http') ? 'REMOTE URL ✅' : 'LOCAL FILE ❌');
            console.log('[Catalog] ======================================');

            // Call API
            if (editingProduct?.id) {
                await updateProductMutation.mutateAsync(backendRequest);
                Alert.alert('Success', 'Product updated successfully!');
            } else {
                await createProduct(backendRequest);
                Alert.alert('Success', 'Product added successfully!');
            }

            // Invalidate queries to refetch
            queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all() });

            // Call success callback
            options?.onSuccess?.();
        } catch (error) {
            console.error('[Catalog] Failed to save product:', error);

            let errorMessage = `Unable to ${editingProduct ? 'update' : 'save'} product. Please try again.`;
            if (error instanceof ApiError) {
                errorMessage = error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            Alert.alert('Save Failed', errorMessage);
            options?.onError?.(errorMessage);
        }
    }, [editingProduct, createProduct, updateProductMutation, queryClient, options]);

    return {
        handleSave,
        isSaving,
    };
}

