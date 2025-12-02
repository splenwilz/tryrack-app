import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useWardrobeItems } from '@/api/wardrobe/queries';
import { CategoryViewScreen } from '@/components/wardrobe/CategoryView';
import type { WardrobeItemResponse } from '@/api/wardrobe/types';

/**
 * Category View Route Component
 * Handles navigation to specific wardrobe categories with API data
 * 
 * @see https://expo-router.dev/docs/routing/navigating-pages - Expo Router navigation
 */
export default function CategoryView() {
    const params = useLocalSearchParams<{ category?: string | string[] }>();
    const category = Array.isArray(params.category) ? params.category[0] : params.category;

    // Fetch all wardrobe items (hooks must be called before any conditional returns)
    const { data: wardrobeItemsResponse = [], isLoading, isFetching, error } = useWardrobeItems();

    // Check if we're loading (including initial fetch with placeholder data)
    const isDataLoading = isLoading || (isFetching && wardrobeItemsResponse.length === 0);

    // Filter out processing items
    const allItems = useMemo(() => {
        return wardrobeItemsResponse.filter((item) => item.category !== 'processing');
    }, [wardrobeItemsResponse]);

    // Convert API items to display format
    const convertedItems = useMemo(() => {
        return allItems.map((item: WardrobeItemResponse) => ({
            id: item.id.toString(),
            title: item.title,
            category: item.category.toLowerCase(),
            imageUrl: item.image_url,
            colors: item.colors || [],
            tags: item.tags || [],
            status: item.status,
            created_at: item.created_at,
        }));
    }, [allItems]);

    // Filter items by category
    const categoryItems = useMemo(() => {
        if (!category) {
            return [];
        }

        if (category === 'recent') {
            // Show recently added items (sorted by created_at, only clean items - exclude planned)
            return [...convertedItems]
                .filter((item) => item.status === 'clean')
                .sort(
                    (a, b) =>
                        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
                );
        } else {
            // Normalize category name (handle plural/singular variations)
            const normalizedCategory = category.toLowerCase().trim();

            // Filter items by category (only show clean items - exclude planned)
            return convertedItems.filter(
                (item) =>
                    item.category === normalizedCategory && item.status === 'clean'
            );
        }
    }, [category, convertedItems]);

    // Early return if no category (after all hooks)
    if (!category) {
        return null;
    }

    // Show loading state
    if (isDataLoading) {
        return (
            <CategoryViewScreen
                category={category}
                items={[]}
                isLoading={true}
            />
        );
    }

    // Show error state
    if (error) {
        return (
            <CategoryViewScreen
                category={category}
                items={[]}
                error={error}
            />
        );
    }

    return (
        <CategoryViewScreen
            category={category}
            items={categoryItems}
        />
    );
}

