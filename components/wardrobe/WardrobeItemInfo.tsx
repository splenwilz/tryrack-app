import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { WardrobeItemResponse } from '@/api/wardrobe/types';

interface WardrobeItemInfoProps {
    item: WardrobeItemResponse;
}

/**
 * Displays wardrobe item title and category badge
 * 
 * @param item - The wardrobe item to display
 * @see https://reactnative.dev/docs/view - React Native View component
 */
export function WardrobeItemInfo({ item }: WardrobeItemInfoProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');

    return (
        <View style={[styles.infoSection, { backgroundColor }]}>
            <ThemedText type="title" style={styles.itemName}>{item.title}</ThemedText>
            <View style={styles.categoryBadge}>
                <IconSymbol name="tag.fill" size={14} color={tintColor} />
                <ThemedText style={[styles.categoryText, { color: tintColor }]}>
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    infoSection: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    itemName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
    },
});

