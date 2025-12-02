import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useShopProducts } from '@/api/shop/queries';
import { useLocation } from '@/hooks/use-location';
import { mapShopProductToBoutiqueItem } from '@/utils/shop';
import { getCategoryDisplayName, getCategoryGroup } from '@/utils/shop-categories';
import { CatalogCategoryView } from '@/components/boutique/CatalogCategoryView';
import type { BoutiqueItem } from '@/utils/shop';

/**
 * Shop Category View Route
 * Displays products from shop API filtered by category
 * 
 * @see components/boutique/CatalogCategoryView.tsx - Reusable component for display
 * @see https://expo-router.dev/docs/routing/navigating-pages - Expo Router navigation
 */
export default function ShopCategoryRoute() {
    const params = useLocalSearchParams<{ category?: string | string[]; radius_miles?: string }>();
    const category = Array.isArray(params.category) ? params.category[0] : params.category;
    const radiusMiles = params.radius_miles ? parseInt(params.radius_miles, 10) : 100;

    // Get user location (optional)
    const { location } = useLocation({ autoRequest: false });

    // Fetch shop products with category filter
    const { 
        data: shopData, 
        isLoading, 
        isFetching, 
        error 
    } = useShopProducts({
        category: category || null,
        radius_miles: radiusMiles,
        latitude: (location?.latitude != null && location?.longitude != null) ? location.latitude : null,
        longitude: (location?.latitude != null && location?.longitude != null) ? location.longitude : null,
        limit: 100, // Get more items for category view
    });

    // Check if we're loading (including initial fetch with placeholder data)
    const isDataLoading = isLoading || (isFetching && (!shopData?.items || shopData.items.length === 0));

    // Map shop products to display format
    const convertedItems = useMemo(() => {
        if (!shopData?.items) return [];
        
        return shopData.items.map((product) => {
            const boutiqueItem = mapShopProductToBoutiqueItem(product);
            return {
                id: boutiqueItem.id,
                title: boutiqueItem.title,
                category: boutiqueItem.category.toLowerCase(),
                imageUrl: boutiqueItem.imageUrl,
                colors: boutiqueItem.colors || [],
                tags: boutiqueItem.tags || [],
                status: 'active', // Shop products are always active
                brand: boutiqueItem.brand,
                price: boutiqueItem.price,
                boutique: boutiqueItem.boutique,
            };
        });
    }, [shopData]);

    // Filter items by category
    // The API already filters by category, but we also filter client-side
    // to handle category grouping (e.g., "shirt" and "t-shirt" both show in "Shirts" section)
    const categoryItems = useMemo(() => {
        if (!category) {
            return convertedItems;
        }

        const categoryGroup = getCategoryGroup(category.toLowerCase().trim());
        
        // Filter products that match the category group
        // This ensures that if we grouped "shirt" and "t-shirt" together,
        // both will show when viewing the "shirt" category
        return convertedItems.filter((item) => {
            const itemCategoryGroup = getCategoryGroup(item.category);
            return itemCategoryGroup === categoryGroup;
        });
    }, [category, convertedItems]);

    // Early return if no category (after all hooks)
    if (!category) {
        return null;
    }

    // Handle item press - navigate to product detail view
    const handleItemPress = (itemId: string) => {
        const { router } = require('expo-router');
        router.push({
            pathname: '/catalog/product_detail',
            params: { productId: itemId, source: 'shop' },
        });
    };

    return (
        <CatalogCategoryView
            category={category}
            items={categoryItems}
            isLoading={isDataLoading}
            error={error}
            onItemPress={handleItemPress}
        />
    );
}

