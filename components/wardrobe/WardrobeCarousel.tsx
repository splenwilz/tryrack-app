/**
 * WardrobeCarousel Component
 * Horizontal scrollable list of wardrobe items grouped by category
 *
 * @see https://reactnative.dev/docs/scrollview - React Native ScrollView patterns
 */

import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { WardrobeItemCard } from './WardrobeItemCard';
import type { WardrobeItemCard as WardrobeItemCardType } from './types';

interface WardrobeCarouselProps {
    title: string;
    items: WardrobeItemCardType[];
    onViewAll?: () => void;
    onStatusChange?: (itemId: string, newStatus: 'clean' | 'worn' | 'dirty') => void;
    formatLastWorn?: (lastWornAt?: string) => string | null;
    style?: object;
}

export const WardrobeCarousel: React.FC<WardrobeCarouselProps> = ({
    title,
    items,
    onViewAll,
    formatLastWorn,
    style,
}) => {
    const tintColor = useThemeColor({}, 'tint');

    return (
        <View style={[styles.carouselContainer, style]}>
            <View style={styles.carouselHeader}>
                <ThemedText type="subtitle" style={styles.carouselTitle}>
                    {title}
                </ThemedText>
                {onViewAll && (
                    <TouchableOpacity onPress={onViewAll}>
                        <ThemedText style={[styles.viewAllText, { color: tintColor }]}>
                            View All
                        </ThemedText>
                    </TouchableOpacity>
                )}
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselContent}
            >
                {items.map((item) => (
                    <WardrobeItemCard
                        key={item.id}
                        item={item}
                        formatLastWorn={formatLastWorn}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    carouselContainer: {
        marginBottom: 32,
    },
    carouselHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    carouselTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '500',
    },
    carouselContent: {
        paddingRight: 20,
    },
});

