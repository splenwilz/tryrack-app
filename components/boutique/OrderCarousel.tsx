/**
 * OrderCarousel Component
 * Horizontal scrollable list of orders grouped by status
 * 
 * @see components/boutique/ProductCarousel.tsx - Similar pattern for products
 */

import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { OrderItemCard } from './OrderItemCard';
import type { OrderCard } from './OrderItemCard';

interface OrderCarouselProps {
    title: string;
    items: OrderCard[];
    onViewAll?: () => void;
    style?: object;
    onItemPress?: (itemId: string) => void;
    getStatusStyle: (status: string) => { backgroundColor: string; borderColor: string };
    getStatusTextColor: (status: string) => string;
}

export const OrderCarousel: React.FC<OrderCarouselProps> = ({
    title,
    items,
    onViewAll,
    style,
    onItemPress,
    getStatusStyle,
    getStatusTextColor,
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
                    <OrderItemCard
                        key={item.id}
                        item={item}
                        onPress={onItemPress ? () => onItemPress(item.id) : undefined}
                        getStatusStyle={getStatusStyle}
                        getStatusTextColor={getStatusTextColor}
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

