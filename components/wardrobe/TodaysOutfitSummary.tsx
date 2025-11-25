/**
 * Today's Outfit Summary Component
 * Displays selected items in a horizontal scrollable list
 *
 * @see https://reactnative.dev/docs/scrollview - React Native ScrollView
 */

import React from 'react';
import { View, ScrollView, Image, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { WardrobeItemResponse } from '@/api/wardrobe/types';

interface TodaysOutfitSummaryProps {
    items: WardrobeItemResponse[];
}

export function TodaysOutfitSummary({ items }: TodaysOutfitSummaryProps) {
    const backgroundColor = useThemeColor({}, 'background');

    if (items.length === 0) {
        return null;
    }

    return (
        <View style={[styles.summaryCard, { backgroundColor }]}>
            <View style={styles.summaryHeader}>
                <ThemedText type="subtitle" style={styles.summaryTitle}>
                    Selected Items ({items.length})
                </ThemedText>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryScroll}>
                {items.map(item => (
                    <View key={item.id} style={[styles.summaryItem, { backgroundColor }]}>
                        <Image
                            source={{ uri: item.image_url || 'https://via.placeholder.com/80' }}
                            style={styles.summaryImage}
                        />
                        <ThemedText style={styles.summaryItemTitle} numberOfLines={1}>
                            {item.title}
                        </ThemedText>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    summaryCard: {
        marginTop: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryHeader: {
        marginBottom: 12,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    summaryScroll: {
        marginHorizontal: -4,
    },
    summaryItem: {
        width: 80,
        marginRight: 12,
        alignItems: 'center',
    },
    summaryImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginBottom: 8,
    },
    summaryItemTitle: {
        fontSize: 11,
        textAlign: 'center',
    },
});

