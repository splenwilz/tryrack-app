/**
 * FeaturedProductItem Component
 * Large display card for featured products
 *
 * @see https://reactnative.dev/docs/image - React Native Image component
 */

import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ProductCard } from './ProductItemCard';

interface FeaturedProductItemProps {
    item: ProductCard;
    onPress?: () => void;
}

export const FeaturedProductItem: React.FC<FeaturedProductItemProps> = ({ item, onPress }) => {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const tagTextColor = isDark ? '#000' : 'white';

    const discountPercentage = item.originalPrice
        ? Math.round((1 - item.price / item.originalPrice) * 100)
        : 0;

    return (
        <TouchableOpacity
            style={[styles.featuredCard, { backgroundColor }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Image source={{ uri: item.imageUrl }} style={styles.featuredImage} />
            {item.originalPrice && discountPercentage > 0 && (
                <View style={[styles.discountBadge, { backgroundColor: tintColor }]}>
                    <ThemedText style={[styles.discountText, { color: tagTextColor }]}>
                        -{discountPercentage}% OFF
                    </ThemedText>
                </View>
            )}
            <View style={styles.featuredContent}>
                <ThemedText type="subtitle" style={styles.featuredTitle}>
                    {item.name}
                </ThemedText>
                <ThemedText style={styles.featuredBrand}>{item.brand}</ThemedText>
                <View style={styles.priceContainer}>
                    <ThemedText style={styles.currentPrice}>₦{item.price.toLocaleString()}</ThemedText>
                    {item.originalPrice && (
                        <ThemedText style={styles.originalPrice}>
                            ₦{item.originalPrice.toLocaleString()}
                        </ThemedText>
                    )}
                </View>
                <View style={styles.featuredTags}>
                    {item.tags.map((tag: string) => (
                        <View key={tag} style={[styles.featuredTag, { backgroundColor: tintColor }]}>
                            <ThemedText style={[styles.featuredTagText, { color: tagTextColor }]}>{tag}</ThemedText>
                        </View>
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    featuredCard: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    featuredImage: {
        width: '100%',
        height: 200,
    },
    discountBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        zIndex: 10,
    },
    discountText: {
        fontSize: 12,
        fontWeight: '600',
    },
    featuredContent: {
        padding: 16,
    },
    featuredTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    featuredBrand: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 12,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    currentPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 8,
    },
    originalPrice: {
        fontSize: 16,
        opacity: 0.6,
        textDecorationLine: 'line-through',
    },
    featuredTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    featuredTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
        marginBottom: 4,
    },
    featuredTagText: {
        fontSize: 12,
        fontWeight: '500',
    },
});

