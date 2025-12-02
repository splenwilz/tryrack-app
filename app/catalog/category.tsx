import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useCatalogProducts } from '@/api/catalog/queries';
import { mapFromBackendResponse } from '@/utils/catalog';
import { CatalogCategoryView } from '@/components/boutique/CatalogCategoryView';
import type { CatalogProduct } from '@/types/boutique';

/**
 * Catalog Category View Route
 * Thin route wrapper that fetches data and passes it to CatalogCategoryView component
 * 
 * @see components/boutique/CatalogCategoryView.tsx - Main component logic
 * @see https://expo-router.dev/docs/routing/navigating-pages - Expo Router navigation
 */
export default function CatalogCategoryRoute() {
    const params = useLocalSearchParams<{ category?: string | string[] }>();
    const category = Array.isArray(params.category) ? params.category[0] : params.category;

    // Fetch all catalog products (hooks must be called before any conditional returns)
    const { data: apiProducts = [], isLoading, isFetching, error } = useCatalogProducts();

    // Check if we're loading (including initial fetch with placeholder data)
    const isDataLoading = isLoading || (isFetching && apiProducts.length === 0);

    // Map API products to frontend format
    const products = useMemo(() => {
        return apiProducts.map(mapFromBackendResponse);
    }, [apiProducts]);

    // Convert products to display format for CatalogCategoryView
    const convertedItems = useMemo(() => {
        return products.map((product: CatalogProduct) => ({
            id: product.id,
            title: product.name,
            category: product.category.toLowerCase(),
            imageUrl: product.imageUrl,
            colors: product.colors || [],
            tags: product.tags || [],
            status: product.status,
            created_at: product.createdAt,
        }));
    }, [products]);

    // Filter items by category
    const categoryItems = useMemo(() => {
        if (!category) {
            return [];
        }

        if (category === 'recent') {
            // Show recently added products (sorted by created_at)
            return [...convertedItems]
                .sort(
                    (a, b) =>
                        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
                );
        } else {
            // Normalize category name (handle plural/singular variations)
            const normalizedCategory = category.toLowerCase().trim();

            // Filter products by category
            return convertedItems.filter(
                (item) => item.category === normalizedCategory
            );
        }
    }, [category, convertedItems]);

    // Early return if no category (after all hooks)
    if (!category) {
        return null;
    }

    return (
        <CatalogCategoryView
            category={category}
            items={categoryItems}
            isLoading={isDataLoading}
            error={error}
        />
    );
}

