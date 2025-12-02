/**
 * LookItemCard Component
 * Displays a single look card with price and style information
 *
 * @see components/boutique/ProductItemCard.tsx - Similar pattern for products
 */

import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { LookResponse } from '@/api/looks/types';

interface LookItemCardProps {
    item: LookResponse;
    onPress?: () => void;
}

export const LookItemCard: React.FC<LookItemCardProps> = ({
    item,
    onPress,
}) => {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const products = item.products || [];
    const totalPrice = item.total_price ?? products.reduce((sum, p) => sum + (p.discount_price || p.price), 0);

    return (
        <TouchableOpacity
            style={[styles.itemCard, { backgroundColor }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.itemImage} />
            ) : (
                <View style={[styles.itemImagePlaceholder, { backgroundColor: iconColor + '20' }]}>
                    <IconSymbol name="photo" size={32} color={iconColor} />
                </View>
            )}

            {item.is_featured && (
                <View style={[styles.featuredBadge, { backgroundColor: tintColor }]}>
                    <IconSymbol name="star.fill" size={10} color={isDark ? '#000' : 'white'} />
                    <ThemedText style={[styles.featuredText, { color: isDark ? '#000' : 'white' }]}>
                        Featured
                    </ThemedText>
                </View>
            )}

            <View style={[styles.styleBadge, { backgroundColor: tintColor, opacity: 0.9 }]}>
                <ThemedText style={[styles.styleText, { color: isDark ? '#000' : 'white' }]}>
                    {item.style}
                </ThemedText>
            </View>

            <View style={styles.itemDetails}>
                <ThemedText style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                </ThemedText>
                {item.description && (
                    <ThemedText style={styles.itemDescription} numberOfLines={1}>
                        {item.description}
                    </ThemedText>
                )}
                <View style={styles.priceContainer}>
                    <ThemedText style={[styles.currentPrice, { color: tintColor }]}>
                        ₦{totalPrice.toLocaleString()}
                    </ThemedText>
                </View>
                <View style={styles.itemInfo}>
                    <IconSymbol name="tshirt.fill" size={12} color={iconColor} />
                    <ThemedText style={[styles.itemCount, { color: iconColor }]}>
                        {products.length} {products.length === 1 ? 'item' : 'items'}
                    </ThemedText>
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
    itemImagePlaceholder: {
        width: '100%',
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featuredBadge: {
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
    featuredText: {
        fontSize: 10,
        fontWeight: '600',
    },
    styleBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        zIndex: 10,
    },
    styleText: {
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
    itemDescription: {
        fontSize: 11,
        opacity: 0.7,
        marginBottom: 8,
    },
    priceContainer: {
        marginBottom: 8,
    },
    currentPrice: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    itemCount: {
        fontSize: 11,
        opacity: 0.8,
    },
});

