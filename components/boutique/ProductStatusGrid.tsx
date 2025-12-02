/**
 * ProductStatusGrid Component
 * Grid display for products by status (out of stock, inactive)
 *
 * @see https://reactnative.dev/docs/image - React Native Image component
 */

import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { ProductCard } from './ProductItemCard';

interface ProductStatusGridProps {
    title: string;
    subtitle: string;
    items: ProductCard[];
    onItemPress?: (itemId: string) => void;
}

export const ProductStatusGrid: React.FC<ProductStatusGridProps> = ({
    title,
    subtitle,
    items,
    onItemPress,
}) => {
    const backgroundColor = useThemeColor({}, 'background');

    if (items.length === 0) {
        return null;
    }

    return (
        <View style={styles.statusSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
                {title}
            </ThemedText>
            <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
            <View style={styles.statusGrid}>
                {items.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.gridItem, { backgroundColor }]}
                        onPress={onItemPress ? () => onItemPress(item.id) : undefined}
                        activeOpacity={0.7}
                    >
                        <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
                        <View style={styles.gridItemInfo}>
                            <ThemedText style={styles.gridItemTitle} numberOfLines={2}>
                                {item.name}
                            </ThemedText>
                            <ThemedText style={styles.gridItemPrice}>
                                ₦{item.price.toLocaleString()}
                            </ThemedText>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    statusSection: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 16,
    },
    statusGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    gridItem: {
        width: '48%',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    gridImage: {
        width: '100%',
        height: 120,
    },
    gridItemInfo: {
        padding: 12,
    },
    gridItemTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    gridItemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});

