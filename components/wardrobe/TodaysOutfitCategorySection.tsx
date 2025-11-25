/**
 * Today's Outfit Category Section Component
 * Displays items grouped by category in a grid
 *
 * @see https://reactnative.dev/docs/view - React Native View component
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { TodaysOutfitItemCard } from './TodaysOutfitItemCard';
import type { WardrobeItemResponse } from '@/api/wardrobe/types';

interface TodaysOutfitCategorySectionProps {
    category: string;
    items: WardrobeItemResponse[];
    selectedItemIds: Set<number>;
    onItemPress: (itemId: number) => void;
}

export function TodaysOutfitCategorySection({
    category,
    items,
    selectedItemIds,
    onItemPress,
}: TodaysOutfitCategorySectionProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <View style={styles.categorySection}>
            <ThemedText type="subtitle" style={styles.categoryTitle}>
                {category.charAt(0).toUpperCase() + category.slice(1)} ({items.length})
            </ThemedText>
            <View style={styles.itemsGrid}>
                {items.map((item, index) => (
                    <TodaysOutfitItemCard
                        key={`${category}-${item.id}-${index}`}
                        item={item}
                        isSelected={selectedItemIds.has(item.id)}
                        onPress={() => onItemPress(item.id)}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    categorySection: {
        marginBottom: 24,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    itemsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
});

