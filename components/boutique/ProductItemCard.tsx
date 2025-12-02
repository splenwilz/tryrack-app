/**
 * ProductItemCard Component
 * Displays a single product card with status badge and metadata
 *
 * @see https://reactnative.dev/docs/components - React Native component patterns
 */

import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export interface ProductCard {
    id: string;
    name: string;
    category: string;
    brand: string;
    price: number;
    originalPrice?: number;
    imageUrl: string;
    status: 'active' | 'inactive' | 'out_of_stock';
    tags: string[];
    stock: number;
}

interface ProductItemCardProps {
    item: ProductCard;
    onPress?: () => void;
}

export const ProductItemCard: React.FC<ProductItemCardProps> = ({
    item,
    onPress,
}) => {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const getStatusBadge = () => {
        if (item.status === 'out_of_stock') {
            return (
                <View style={[styles.statusBadge, { backgroundColor: iconColor, opacity: 0.9 }]}>
                    <IconSymbol name="exclamationmark.circle.fill" size={10} color="white" />
                    <ThemedText style={styles.statusText}>Out of Stock</ThemedText>
                </View>
            );
        }
        if (item.status === 'inactive') {
            return (
                <View style={[styles.statusBadge, { backgroundColor: iconColor, opacity: 0.9 }]}>
                    <IconSymbol name="pause.circle.fill" size={10} color="white" />
                    <ThemedText style={styles.statusText}>Inactive</ThemedText>
                </View>
            );
        }
        return (
            <View style={[styles.statusBadge, { backgroundColor: tintColor, opacity: 0.9 }]}>
                <IconSymbol name="checkmark.circle.fill" size={10} color={isDark ? '#000' : 'white'} />
                <ThemedText style={[styles.statusText, { color: isDark ? '#000' : 'white' }]}>Active</ThemedText>
            </View>
        );
    };

    const discountPercentage = item.originalPrice
        ? Math.round((1 - item.price / item.originalPrice) * 100)
        : 0;

    return (
        <TouchableOpacity
            style={[styles.itemCard, { backgroundColor }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            {getStatusBadge()}
            {item.originalPrice && discountPercentage > 0 && (
                <View style={[styles.discountBadge, { backgroundColor: tintColor }]}>
                    <ThemedText style={[styles.discountText, { color: isDark ? '#000' : 'white' }]}>
                        -{discountPercentage}%
                    </ThemedText>
                </View>
            )}
            <View style={styles.itemDetails}>
                <ThemedText style={styles.itemTitle} numberOfLines={2}>
                    {item.name}
                </ThemedText>
                <ThemedText style={styles.itemBrand} numberOfLines={1}>
                    {item.brand}
                </ThemedText>
                <View style={styles.priceContainer}>
                    <ThemedText style={styles.currentPrice}>₦{item.price.toLocaleString()}</ThemedText>
                    {item.originalPrice && (
                        <ThemedText style={styles.originalPrice}>
                            ₦{item.originalPrice.toLocaleString()}
                        </ThemedText>
                    )}
                </View>
                <View style={styles.itemTags}>
                    {item.tags.slice(0, 2).map((tag) => (
                        <View key={tag} style={styles.tag}>
                            <ThemedText style={styles.tagText}>{tag}</ThemedText>
                        </View>
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    itemCard: {
        width: 140,
        marginRight: 12,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemImage: {
        width: '100%',
        height: 140,
    },
    statusBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        zIndex: 10,
    },
    statusText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600',
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        zIndex: 10,
    },
    discountText: {
        fontSize: 10,
        fontWeight: '600',
    },
    itemDetails: {
        padding: 12,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemBrand: {
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    currentPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 4,
    },
    originalPrice: {
        fontSize: 11,
        opacity: 0.6,
        textDecorationLine: 'line-through',
    },
    itemTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        marginRight: 4,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 10,
        opacity: 0.8,
    },
});

