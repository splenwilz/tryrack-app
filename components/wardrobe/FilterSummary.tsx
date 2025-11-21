/**
 * FilterSummary Component
 * Displays filter results summary and empty state
 *
 * @see https://reactnative.dev/docs/view - React Native View component
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface FilterSummaryProps {
    hasActiveFilters: boolean;
    filteredCount: number;
    totalCount: number;
    onClearFilters: () => void;
}

export const FilterSummary: React.FC<FilterSummaryProps> = ({
    hasActiveFilters,
    filteredCount,
    totalCount,
    onClearFilters,
}) => {
    const borderColor = useThemeColor({}, 'tabIconDefault');
    const tintColor = useThemeColor({}, 'tint');

    if (!hasActiveFilters) {
        return null;
    }

    return (
        <>
            <View style={styles.filterSummary}>
                <ThemedText style={styles.filterSummaryText}>
                    {filteredCount > 0
                        ? `Showing ${filteredCount} of ${totalCount} items`
                        : 'No items match your filters'}
                </ThemedText>
            </View>

            {filteredCount === 0 && totalCount > 0 && (
                <View style={styles.emptyFilterState}>
                    <IconSymbol
                        name="magnifyingglass"
                        size={48}
                        color={borderColor}
                        style={{ opacity: 0.3, marginBottom: 16 }}
                    />
                    <ThemedText type="subtitle" style={styles.emptyFilterTitle}>
                        No items found
                    </ThemedText>
                    <ThemedText style={styles.emptyFilterText}>
                        Try adjusting your filters or search query
                    </ThemedText>
                    <TouchableOpacity
                        style={[styles.clearFiltersButtonInline, { borderColor }]}
                        onPress={onClearFilters}
                    >
                        <ThemedText style={[styles.clearFiltersTextInline, { color: tintColor }]}>
                            Clear All Filters
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    filterSummary: {
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    filterSummaryText: {
        fontSize: 13,
        opacity: 0.7,
    },
    emptyFilterState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyFilterTitle: {
        marginBottom: 8,
    },
    emptyFilterText: {
        textAlign: 'center',
        opacity: 0.7,
        marginBottom: 24,
        lineHeight: 20,
    },
    clearFiltersButtonInline: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    clearFiltersTextInline: {
        fontSize: 15,
        fontWeight: '600',
    },
});

