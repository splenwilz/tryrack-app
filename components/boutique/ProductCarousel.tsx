/**
 * ProductCarousel Component
 * Horizontal scrollable list of products grouped by category
 *
 * @see https://reactnative.dev/docs/scrollview - React Native ScrollView patterns
 */

import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ProductItemCard } from './ProductItemCard';
import type { ProductCard } from './ProductItemCard';

interface ProductCarouselProps {
    title: string;
    items: ProductCard[];
    onViewAll?: () => void;
    style?: object;
    onItemPress?: (itemId: string) => void;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
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
                    <ProductItemCard
                        key={item.id}
                        item={item}
                        onPress={onItemPress ? () => onItemPress(item.id) : undefined}
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

