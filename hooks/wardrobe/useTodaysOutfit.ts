/**
 * Custom hook for Today's Outfit screen
 * Handles data fetching, state management, and business logic
 *
 * @see https://react-query.tanstack.com/guides/queries - React Query patterns
 */

import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useWardrobeItems } from '@/api/wardrobe/queries';
import { updateWardrobeItem } from '@/api/wardrobe/services';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/utils/query-keys';
import type { WardrobeItemResponse } from '@/api/wardrobe/types';

/**
 * Group items by category with proper sorting
 */
export function groupItemsByCategory(items: WardrobeItemResponse[]) {
    const groups: Record<string, WardrobeItemResponse[]> = {};

    items.forEach(item => {
        // Show both clean and planned items
        if (item.status === 'clean' || item.status === 'planned') {
            const category = item.category.toLowerCase().trim();
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
        }
    });

    // Category display order
    const categoryOrder = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessories'];
    const sortedCategories = Object.keys(groups).sort((a, b) => {
        const aIndex = categoryOrder.indexOf(a);
        const bIndex = categoryOrder.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    });

    return { groups, sortedCategories };
}

export function useTodaysOutfit() {
    const queryClient = useQueryClient();

    // Fetch both clean and planned wardrobe items
    const { 
        data: cleanItems = [], 
        isLoading: isLoadingClean, 
        isFetching: isFetchingClean, 
        error: cleanError, 
        refetch: refetchClean 
    } = useWardrobeItems({ status: 'clean' });
    
    const { 
        data: plannedItems = [], 
        isLoading: isLoadingPlanned, 
        isFetching: isFetchingPlanned, 
        error: plannedError, 
        refetch: refetchPlanned 
    } = useWardrobeItems({ status: 'planned' });

    // Track updating state
    const [isUpdating, setIsUpdating] = useState(false);

    // Combine clean and planned items, filter out processing items, and deduplicate by ID
    // An item can only have one status, but we fetch both lists separately, so we need to deduplicate
    const items = useMemo(() => {
        const allItems = [...(cleanItems ?? []), ...(plannedItems ?? [])];
        const filtered = allItems.filter((item) => item.category !== 'processing');
        
        // Deduplicate by ID (in case same item appears in both lists)
        const uniqueItems = new Map<number, WardrobeItemResponse>();
        filtered.forEach((item) => {
            // If item already exists, prefer the one with 'planned' status (more recent state)
            if (!uniqueItems.has(item.id) || item.status === 'planned') {
                uniqueItems.set(item.id, item);
            }
        });
        
        return Array.from(uniqueItems.values());
    }, [cleanItems, plannedItems]);

    // Initialize selected items with already planned items
    const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());

    // Update selected items when planned items load (pre-select already planned items)
    useEffect(() => {
        if (plannedItems.length > 0) {
            setSelectedItemIds((prev) => {
                const next = new Set(prev);
                plannedItems.forEach((item) => {
                    next.add(item.id);
                });
                return next;
            });
        }
    }, [plannedItems]);

    // Toggle item selection
    const toggleItemSelection = (itemId: number) => {
        setSelectedItemIds(prev => {
            const next = new Set(prev);
            if (next.has(itemId)) {
                next.delete(itemId);
            } else {
                next.add(itemId);
            }
            return next;
        });
    };

    // Group items by category
    const groupedItems = useMemo(() => {
        return groupItemsByCategory(items);
    }, [items]);

    // Selected items summary
    const selectedItems = useMemo(() => {
        return items.filter(item => selectedItemIds.has(item.id));
    }, [items, selectedItemIds]);

    // Handle planning today's outfit
    const handlePlanOutfit = async () => {
        if (isUpdating) {
            return; // Prevent duplicate calls
        }

        // Get currently planned item IDs
        const currentlyPlannedIds = new Set(plannedItems.map((item) => item.id));
        const selectedIds = Array.from(selectedItemIds);

        // Items to add to plan (selected but not currently planned)
        const itemsToPlan = selectedIds.filter((id) => !currentlyPlannedIds.has(id));

        // Items to remove from plan (currently planned but not selected)
        const itemsToUnplan = Array.from(currentlyPlannedIds).filter((id) => !selectedItemIds.has(id));

        // If no changes, just go back
        if (itemsToPlan.length === 0 && itemsToUnplan.length === 0) {
            router.back();
            return;
        }

        setIsUpdating(true);
        try {
            const promises: Promise<WardrobeItemResponse>[] = [];

            // Add items to plan
            if (itemsToPlan.length > 0) {
                itemsToPlan.forEach((id) => {
                    promises.push(updateWardrobeItem(id.toString(), { status: 'planned' }));
                });
            }

            // Remove items from plan (convert back to clean)
            if (itemsToUnplan.length > 0) {
                itemsToUnplan.forEach((id) => {
                    promises.push(updateWardrobeItem(id.toString(), { status: 'clean' }));
                });
            }

            // Execute all updates in parallel
            const results = await Promise.allSettled(promises);

            const successCount = results.filter((r) => r.status === 'fulfilled').length;
            const failedCount = results.filter((r) => r.status === 'rejected').length;

            // Invalidate cache
            queryClient.invalidateQueries({ queryKey: queryKeys.wardrobe.all() });
            selectedIds.forEach((id) => {
                queryClient.invalidateQueries({ queryKey: queryKeys.wardrobe.itemById(id.toString()) });
            });
            itemsToUnplan.forEach((id) => {
                queryClient.invalidateQueries({ queryKey: queryKeys.wardrobe.itemById(id.toString()) });
            });

            if (failedCount > 0) {
                Alert.alert(
                    'Partial Success',
                    `Updated ${successCount} item(s). ${failedCount} item(s) failed to update.`,
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else {
                const addedText = itemsToPlan.length > 0 ? `Added ${itemsToPlan.length} item(s) to plan. ` : '';
                const removedText = itemsToUnplan.length > 0 ? `Removed ${itemsToUnplan.length} item(s) from plan.` : '';
                Alert.alert(
                    'Outfit Updated!',
                    `${addedText}${removedText}Mark items as worn when you're wearing them.`,
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            }
        } catch (error) {
            console.error('Failed to update outfit plan:', error);
            Alert.alert('Error', 'Failed to update outfit plan. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    // Refetch both queries
    const handleRefresh = async () => {
        await Promise.all([refetchClean(), refetchPlanned()]);
    };

    // Computed states
    const isLoading = isLoadingClean || isLoadingPlanned;
    const isFetching = isFetchingClean || isFetchingPlanned;
    const error = cleanError || plannedError;
    const showLoadingState = isLoading && items.length === 0;
    const showErrorState = error && items.length === 0;
    const hasFetchedItems = Array.isArray(cleanItems) && Array.isArray(plannedItems);
    const showEmptyState = hasFetchedItems && items.length === 0 && !isLoading && !isFetching;

    return {
        // Data
        items,
        cleanItems,
        plannedItems,
        groupedItems,
        selectedItems,
        selectedItemIds,
        
        // States
        isLoading,
        isFetching,
        isFetchingClean,
        isFetchingPlanned,
        isUpdating,
        error,
        showLoadingState,
        showErrorState,
        showEmptyState,
        
        // Actions
        toggleItemSelection,
        handlePlanOutfit,
        handleRefresh,
    };
}

