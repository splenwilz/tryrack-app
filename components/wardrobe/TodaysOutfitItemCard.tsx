/**
 * Today's Outfit Item Card Component
 * Selectable item card for the Today's Outfit screen
 *
 * @see https://reactnative.dev/docs/touchableopacity - React Native TouchableOpacity
 */

import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { WardrobeItemResponse } from '@/api/wardrobe/types';

interface TodaysOutfitItemCardProps {
    item: WardrobeItemResponse;
    isSelected: boolean;
    onPress: () => void;
}

export function TodaysOutfitItemCard({ item, isSelected, onPress }: TodaysOutfitItemCardProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <TouchableOpacity
            style={[
                styles.itemCard,
                { backgroundColor },
                isSelected && { borderColor: tintColor, borderWidth: 2 },
                !isSelected && { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Image
                source={{ uri: item.image_url || 'https://via.placeholder.com/120' }}
                style={[styles.itemImage, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
            />
            {isSelected && (
                <View style={[styles.selectedBadge, { backgroundColor: tintColor }]}>
                    <IconSymbol name="checkmark" size={16} color={isDark ? '#000' : 'white'} />
                </View>
            )}
            <ThemedText style={styles.itemTitle} numberOfLines={2}>
                {item.title}
            </ThemedText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    itemCard: {
        width: '47%',
        marginHorizontal: '1.5%',
        marginBottom: 12,
        borderRadius: 12,
        padding: 8,
        borderWidth: 1,
        position: 'relative',
    },
    itemImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemTitle: {
        fontSize: 12,
        fontWeight: '500',
    },
});

