/**
 * Wardrobe Screen Component
 * Main screen for displaying and managing user's wardrobe items
 *
 * @see https://reactnative.dev/docs/components - React Native component patterns
 */

import { useState, useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CustomHeader } from '@/components/custom-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { WardrobeFilterModal, type WardrobeFilters } from '@/components/home/WardrobeFilterModal';
import {
    WardrobeCarousel,
    FeaturedWardrobeItem,
    FilterBar,
    FilterSummary,
    TodayOutfitCTA,
    StatusGrid,
    type WardrobeItemCardType,
} from '@/components/wardrobe';
import { formatLastWorn } from '@/utils/wardrobe';
import { useWardrobeItems } from '@/api/wardrobe/queries';
import type { WardrobeItemResponse } from '@/api/wardrobe/types';
import {
    FeaturedItemSkeleton,
    WardrobeCarouselSkeleton,
    StatusGridSkeleton,
} from '@/components/wardrobe/WardrobeSkeleton';

const noop = () => { };

/**
 * Empty Wardrobe State Component
 * Displays when user has no wardrobe items
 */
const EmptyWardrobeState: React.FC = () => {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');

    const handleAddFirstItem = () => {
        router.push('/wardrobe/add-item');
    };

    return (
        <View style={[styles.emptyState, { backgroundColor }]}>
            <View style={styles.emptyStateIcon}>
                <ThemedText style={styles.emptyStateEmoji}>👕</ThemedText>
            </View>
            <ThemedText type="title" style={styles.emptyStateTitle}>
                Your Wardrobe is Empty
            </ThemedText>
            <ThemedText style={styles.emptyStateDescription}>
                Start building your digital wardrobe by adding your favorite clothing items.
            </ThemedText>
            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: tintColor }]}
                onPress={handleAddFirstItem}
            >
                <ThemedText style={styles.addButtonText}>Add Your First Item</ThemedText>
            </TouchableOpacity>

            <View style={styles.quickTips}>
                <ThemedText style={styles.quickTipsTitle}>Quick Tips:</ThemedText>
                <ThemedText style={styles.quickTip}>• Take photos of your clothes</ThemedText>
                <ThemedText style={styles.quickTip}>• Organize by categories</ThemedText>
                <ThemedText style={styles.quickTip}>• Get outfit recommendations</ThemedText>
            </View>
        </View>
    );
};

/**
 * Wardrobe Screen Component
 * Displays user's personal wardrobe with categorized items and filtering
 */
export default function WardrobeScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const fabIconColor = isDark ? '#000' : 'white';

    // Filter state
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState<WardrobeFilters>({
        searchQuery: '',
        status: 'all',
        category: null,
        color: null,
        tag: null,
        lastWornFilter: 'all',
    });

    // Map filters to API options
    const apiOptions = useMemo(() => {
        const options: { category?: string | null; status?: string | null } = {};

        if (filters.category) {
            options.category = filters.category;
        }

        if (filters.status !== 'all') {
            options.status = filters.status;
        }

        return options;
    }, [filters.category, filters.status]);

    // Fetch wardrobe items from API
    const { data: wardrobeItemsResponse = [], refetch, isRefetching, isLoading, isFetching } = useWardrobeItems(apiOptions);

    // Check if we're loading (including initial fetch with placeholder data)
    const isDataLoading = isLoading || (isFetching && wardrobeItemsResponse.length === 0);

    // Transform API response to component format
    const allWardrobeItems = useMemo(() => {
        return wardrobeItemsResponse.map((item: WardrobeItemResponse): WardrobeItemCardType => ({
            id: String(item.id),
            title: item.title,
            category: item.category.toLowerCase(),
            imageUrl: item.image_url,
            colors: item.colors,
            tags: item.tags,
            status: item.status,
            created_at: item.created_at,
            // Note: last_worn_at and wear_count would need to be added to API response if available
        }));
    }, [wardrobeItemsResponse]);

    // Extract available filter options from wardrobe items
    const { availableCategories, availableColors, availableTags } = useMemo(() => {
        const categories = new Set<string>();
        const colors = new Set<string>();
        const tags = new Set<string>();

        allWardrobeItems.forEach((item) => {
            if (item.category && item.category !== 'processing') {
                categories.add(item.category.toLowerCase().trim());
            }
            if (item.colors) {
                item.colors.forEach((color) => {
                    colors.add(color.toLowerCase().trim());
                });
            }
            if (item.tags) {
                item.tags.forEach((tag) => {
                    tags.add(tag.toLowerCase().trim());
                });
            }
        });

        return {
            availableCategories: Array.from(categories).sort(),
            availableColors: Array.from(colors).sort(),
            availableTags: Array.from(tags).sort(),
        };
    }, [allWardrobeItems]);

    // Apply filters to wardrobe items
    const filteredItems = useMemo(() => {
        let filtered = [...allWardrobeItems];

        // Search by title
        if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase().trim();
            filtered = filtered.filter(
                (item) =>
                    item.title.toLowerCase().includes(query) ||
                    item.tags?.some((tag) => tag.toLowerCase().includes(query))
            );
        }

        // Filter by status
        if (filters.status !== 'all') {
            filtered = filtered.filter((item) => item.status === filters.status);
        }

        // Filter by category
        if (filters.category) {
            filtered = filtered.filter(
                (item) => item.category.toLowerCase().trim() === filters.category?.toLowerCase()
            );
        }

        // Filter by color
        if (filters.color) {
            filtered = filtered.filter((item) =>
                item.colors?.some((c) => c.toLowerCase().trim() === filters.color?.toLowerCase())
            );
        }

        // Filter by tag
        if (filters.tag) {
            filtered = filtered.filter((item) =>
                item.tags?.some((t) => t.toLowerCase().trim() === filters.tag?.toLowerCase())
            );
        }

        // Filter by last worn date
        if (filters.lastWornFilter !== 'all') {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            filtered = filtered.filter((item) => {
                if (!item.last_worn_at) {
                    return filters.lastWornFilter === 'never';
                }

                const lastWorn = new Date(item.last_worn_at);

                if (filters.lastWornFilter === 'never') {
                    return false; // Already handled above
                } else if (filters.lastWornFilter === 'recent') {
                    return lastWorn >= thirtyDaysAgo;
                } else if (filters.lastWornFilter === 'old') {
                    return lastWorn < thirtyDaysAgo;
                }

                return true;
            });
        }

        return filtered;
    }, [allWardrobeItems, filters]);

    // Check if any filters are active
    const hasActiveFilters =
        filters.searchQuery !== '' ||
        filters.status !== 'all' ||
        filters.category !== null ||
        filters.color !== null ||
        filters.tag !== null ||
        filters.lastWornFilter !== 'all';

    // Use filtered items for display
    const wardrobeItems = filteredItems;

    // Group items by dynamic category
    const groupedByCategory = useMemo(() => {
        const groups: Record<string, WardrobeItemCardType[]> = {};

        wardrobeItems.forEach((item) => {
            // Only group clean items; worn items go into their own section
            // Also exclude "processing" category items
            if (item.status === 'clean' && item.category !== 'processing') {
                const category = item.category.toLowerCase().trim(); // Normalize
                if (!groups[category]) {
                    groups[category] = [];
                }
                groups[category].push(item);
            }
        });

        // Sort categories by item count (descending)
        const sortedCategories = Object.keys(groups).sort(
            (a, b) => groups[b].length - groups[a].length
        );

        return { groups, sortedCategories };
    }, [wardrobeItems]);

    const wornItems = wardrobeItems.filter((item) => item.status === 'worn');
    const dirtyItems = wardrobeItems.filter((item) => item.status === 'dirty');

    // Featured item (first item from largest category)
    const featuredItem =
        groupedByCategory.sortedCategories.length > 0
            ? groupedByCategory.groups[groupedByCategory.sortedCategories[0]][0]
            : null;

    // Mock notification count - in real app this would come from state/API
    const notificationCount = 3;

    const handleSearchPress = () => {
        noop();
    };

    const handleNotificationPress = () => {
        noop();
    };

    const handleFilterPress = () => {
        setShowFilterModal(true);
    };

    const handleClearFilters = () => {
        setFilters({
            searchQuery: '',
            status: 'all',
            category: null,
            color: null,
            tag: null,
            lastWornFilter: 'all',
        });
    };

    const handleApplyFilters = (newFilters: WardrobeFilters) => {
        setFilters(newFilters);
    };

    const handleViewAll = (_category: string) => {
        noop(); // TODO: Navigate to category view when route exists
    };

    const handleStatusChange = (_itemId: string, _newStatus: 'clean' | 'worn' | 'dirty') => {
        noop();
    };

    const handleRefresh = async () => {
        await refetch();
    };

    // Recently added items
    const recentItems = useMemo(() => {
        return wardrobeItems
            .filter((item) => item.category !== 'processing' && item.status === 'clean')
            .sort(
                (a, b) =>
                    new Date(b.created_at || 0).getTime() -
                    new Date(a.created_at || 0).getTime()
            )
            .slice(0, 4);
    }, [wardrobeItems]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <CustomHeader
                title="My Wardrobe"
                onSearchPress={handleSearchPress}
                onNotificationPress={handleNotificationPress}
                notificationCount={notificationCount}
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
                {/* Show empty state only if data has loaded and there are no items */}
                {!isDataLoading && allWardrobeItems.length === 0 ? (
                    <EmptyWardrobeState />
                ) : (
                    <>
                        {/* Filter Bar */}
                        <FilterBar
                            hasActiveFilters={hasActiveFilters}
                            filters={filters}
                            onFilterPress={handleFilterPress}
                            onClearFilters={handleClearFilters}
                        />

                        {/* Filter Summary */}
                        <FilterSummary
                            hasActiveFilters={hasActiveFilters}
                            filteredCount={filteredItems.length}
                            totalCount={allWardrobeItems.length}
                            onClearFilters={handleClearFilters}
                        />

                        {/* Today's Outfit CTA */}
                        <TodayOutfitCTA onPress={noop} />

                        {isDataLoading ? (
                            <>
                                {/* Featured Item Skeleton */}
                                <View style={styles.featuredSection}>
                                    <FeaturedItemSkeleton />
                                </View>

                                {/* Recently Added Skeleton */}
                                <WardrobeCarouselSkeleton title="Recently Added" />

                                {/* Category Sections Skeleton */}
                                <WardrobeCarouselSkeleton title="Tops" />
                                <WardrobeCarouselSkeleton title="Bottoms" />

                                {/* Status Grids Skeleton */}
                                <StatusGridSkeleton
                                    title="Worn Items"
                                    subtitle="Clean these items to use in outfit recommendations"
                                />
                                <StatusGridSkeleton
                                    title="Dirty Items"
                                    subtitle="Mark as clean after washing"
                                />
                            </>
                        ) : (
                            <>
                                {/* Featured Item */}
                                {featuredItem?.imageUrl && (
                                    <View style={styles.featuredSection}>
                                        <FeaturedWardrobeItem item={featuredItem} />
                                    </View>
                                )}

                                {/* Recently Added */}
                                {recentItems.length > 0 && (
                                    <WardrobeCarousel
                                        title="Recently Added"
                                        items={recentItems}
                                        onViewAll={() => handleViewAll('recent')}
                                        formatLastWorn={formatLastWorn}
                                        style={!featuredItem ? { marginTop: 24 } : undefined}
                                    />
                                )}

                                {/* Dynamic Category Sections */}
                                {groupedByCategory.sortedCategories.map((category) => {
                                    const items = groupedByCategory.groups[category];
                                    // Capitalize category name for display (e.g., "denim jacket" → "Denim Jacket")
                                    const displayTitle = category
                                        .split(' ')
                                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(' ');

                                    // Only add 's' if category doesn't already end in 's' (avoid "chinoss", "jeanss")
                                    const pluralSuffix = category.endsWith('s') ? '' : 's';

                                    return (
                                        <WardrobeCarousel
                                            key={category}
                                            title={`${displayTitle}${pluralSuffix} (${items.length})`}
                                            items={items}
                                            onViewAll={() => handleViewAll(category)}
                                            formatLastWorn={formatLastWorn}
                                        />
                                    );
                                })}

                                {/* Worn Items Section */}
                                <StatusGrid
                                    title="Worn Items"
                                    subtitle="Clean these items to use in outfit recommendations"
                                    items={wornItems}
                                    onStatusChange={handleStatusChange}
                                />

                                {/* Dirty Items Section */}
                                <StatusGrid
                                    title="Dirty Items"
                                    subtitle="Mark as clean after washing"
                                    items={dirtyItems}
                                    onStatusChange={handleStatusChange}
                                />
                            </>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Floating Action Button - Hide when empty state is shown */}
            {!isDataLoading && allWardrobeItems.length > 0 && (
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: tintColor }]}
                    onPress={() => router.push('/wardrobe/add-item')}
                >
                    <IconSymbol name="plus" size={24} color={fabIconColor} />
                </TouchableOpacity>
            )}

            {/* Filter Modal */}
            <WardrobeFilterModal
                visible={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                filters={filters}
                onApplyFilters={handleApplyFilters}
                availableCategories={availableCategories}
                availableColors={availableColors}
                availableTags={availableTags}
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
    featuredSection: {
        marginBottom: 32,
        marginTop: 20,
    },
    // Floating Action Button
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
    // Empty State Styles
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyStateIcon: {
        minWidth: 160,
        minHeight: 160,
        padding: 20,
        borderRadius: 80,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 24,
    },
    emptyStateEmoji: {
        fontSize: 60,
        lineHeight: 120,
        includeFontPadding: false,
        textAlignVertical: 'center',
        zIndex: 1,
    },
    emptyStateTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    emptyStateDescription: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.7,
        lineHeight: 24,
        marginBottom: 32,
    },
    addButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 32,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    quickTips: {
        alignItems: 'flex-start',
    },
    quickTipsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    quickTip: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 4,
    },
});
