/**
 * LookCarousel Component
 * Horizontal scrollable list of looks grouped by category
 *
 * @see components/boutique/ProductCarousel.tsx - Similar pattern for products
 */

import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LookItemCard } from './LookItemCard';
import type { LookResponse } from '@/api/looks/types';

interface LookCarouselProps {
    title: string;
    items: LookResponse[];
    onViewAll?: () => void;
    style?: object;
    onItemPress?: (itemId: string) => void;
}

export const LookCarousel: React.FC<LookCarouselProps> = ({
    title,
    items,
    onViewAll,
    style,
    onItemPress,
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
                    <LookItemCard
                        key={item.id}
                        item={item}
                        onPress={onItemPress ? () => onItemPress(String(item.id)) : undefined}
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

