/**
 * FilterBar Component
 * Filter controls and summary for wardrobe items
 *
 * @see https://reactnative.dev/docs/touchableopacity - React Native TouchableOpacity patterns
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { WardrobeFilters } from '@/components/home/WardrobeFilterModal';

interface FilterBarProps {
    hasActiveFilters: boolean;
    filters: WardrobeFilters;
    onFilterPress: () => void;
    onClearFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
    hasActiveFilters,
    filters,
    onFilterPress,
    onClearFilters,
}) => {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const textColor = useThemeColor({}, 'text');
    const borderColor = useThemeColor({}, 'tabIconDefault');

    const activeFilterCount = [
        filters.searchQuery && 'Search',
        filters.status !== 'all' && filters.status,
        filters.category && 'Category',
        filters.color && 'Color',
        filters.tag && 'Tag',
        filters.lastWornFilter !== 'all' && 'Date',
    ].filter(Boolean).length;

    return (
        <View style={styles.filterBar}>
            <TouchableOpacity
                style={[
                    styles.filterButton,
                    { backgroundColor, borderColor },
                    hasActiveFilters && { borderColor: tintColor, borderWidth: 2 },
                ]}
                onPress={onFilterPress}
            >
                <IconSymbol
                    name="slider.horizontal.3"
                    size={18}
                    color={hasActiveFilters ? tintColor : borderColor}
                />
                <ThemedText
                    style={[
                        styles.filterButtonText,
                        { color: hasActiveFilters ? tintColor : textColor },
                    ]}
                >
                    Filters
                </ThemedText>
                {hasActiveFilters && (
                    <View style={[styles.filterBadge, { backgroundColor: tintColor }]}>
                        <ThemedText style={styles.filterBadgeText}>{activeFilterCount}</ThemedText>
                    </View>
                )}
            </TouchableOpacity>

            {hasActiveFilters && (
                <TouchableOpacity style={styles.clearFiltersButton} onPress={onClearFilters}>
                    <ThemedText style={[styles.clearFiltersText, { color: tintColor }]}>
                        Clear All
                    </ThemedText>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    filterBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 20,
        marginBottom: 16,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        gap: 8,
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    filterBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    filterBadgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
    },
    clearFiltersButton: {
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    clearFiltersText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

