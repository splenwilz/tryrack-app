/**
 * WardrobeItemCard Component
 * Displays a single wardrobe item card with status badge and metadata
 *
 * @see https://reactnative.dev/docs/components - React Native component patterns
 */

import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { WardrobeItemCard as WardrobeItemCardType } from './types';

interface WardrobeItemCardProps {
    item: WardrobeItemCardType;
    onPress?: () => void;
    onStatusChange?: (itemId: string, newStatus: 'clean' | 'worn' | 'dirty') => void;
    formatLastWorn?: (lastWornAt?: string) => string | null;
}

export const WardrobeItemCard: React.FC<WardrobeItemCardProps> = ({
    item,
    onPress,
    formatLastWorn,
}) => {
    const backgroundColor = useThemeColor({}, 'background');

    const getStatusBadge = () => {
        if (item.status === 'worn') {
            return (
                <View style={[styles.statusBadge, { backgroundColor: '#FF9500', opacity: 0.9 }]}>
                    <IconSymbol name="tshirt.fill" size={10} color="white" />
                    <ThemedText style={styles.statusText}>Worn</ThemedText>
                </View>
            );
        }
        if (item.status === 'dirty') {
            return (
                <View style={[styles.statusBadge, { backgroundColor: '#FF3B30', opacity: 0.9 }]}>
                    <IconSymbol name="exclamationmark.circle.fill" size={10} color="white" />
                    <ThemedText style={styles.statusText}>Dirty</ThemedText>
                </View>
            );
        }
        return (
            <View style={[styles.statusBadge, { backgroundColor: '#34C759', opacity: 0.9 }]}>
                <IconSymbol name="checkmark.circle.fill" size={10} color="white" />
                <ThemedText style={styles.statusText}>Clean</ThemedText>
            </View>
        );
    };

    return (
        <TouchableOpacity
            style={[styles.itemCard, { backgroundColor }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            {getStatusBadge()}
            <View style={styles.itemDetails}>
                <ThemedText style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                </ThemedText>
                {/* Last worn / Wear count info */}
                {((item.last_worn_at && formatLastWorn && formatLastWorn(item.last_worn_at)) ||
                    (item.wear_count && item.wear_count > 0)) ? (
                    <View style={styles.wearInfo}>
                        {formatLastWorn && item.last_worn_at && formatLastWorn(item.last_worn_at) ? (
                            <ThemedText style={styles.wearInfoText}>
                                {formatLastWorn(item.last_worn_at)}
                            </ThemedText>
                        ) : null}
                        {item.wear_count && item.wear_count > 0 ? (
                            <ThemedText style={styles.wearInfoText}>
                                • Worn {item.wear_count} {item.wear_count === 1 ? 'time' : 'times'}
                            </ThemedText>
                        ) : null}
                    </View>
                ) : null}
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
    itemDetails: {
        padding: 12,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    wearInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
        marginBottom: 4,
    },
    wearInfoText: {
        fontSize: 11,
        opacity: 0.6,
        marginRight: 4,
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

