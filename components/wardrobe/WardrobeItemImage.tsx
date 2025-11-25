import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { WardrobeItemResponse } from '@/api/wardrobe/types';

const { width } = Dimensions.get('window');

const STATUS_COLORS: Record<'clean' | 'worn' | 'dirty', string> = {
    clean: '#34C759',
    worn: '#FF9500',
    dirty: '#FF3B30',
};

const STATUS_NAMES: Record<'clean' | 'worn' | 'dirty', string> = {
    clean: 'Clean',
    worn: 'Worn',
    dirty: 'Dirty',
};

/**
 * Gets the color for a wardrobe item status
 * @see https://reactnative.dev/docs/view - React Native View component
 */
function getStatusColor(status: string): string {
    if (status === 'clean' || status === 'worn' || status === 'dirty') {
        return STATUS_COLORS[status];
    }
    return STATUS_COLORS.clean;
}

/**
 * Gets the display name for a wardrobe item status
 */
function getStatusName(status: string): string {
    if (status === 'clean' || status === 'worn' || status === 'dirty') {
        return STATUS_NAMES[status];
    }
    return STATUS_NAMES.clean;
}

interface WardrobeItemImageProps {
    item: WardrobeItemResponse;
}

/**
 * Displays wardrobe item image with status badge overlay
 * 
 * @param item - The wardrobe item to display
 * @see https://reactnative.dev/docs/image - React Native Image component
 */
export function WardrobeItemImage({ item }: WardrobeItemImageProps) {
    return (
        <View style={styles.imageContainer}>
            <Image
                source={{ uri: item.image_url || 'https://via.placeholder.com/400' }}
                style={styles.itemImage}
            />
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <IconSymbol
                    name={item.status === 'clean' ? 'checkmark.circle.fill' : 'tshirt.fill'}
                    size={12}
                    color="white"
                />
                <ThemedText style={styles.statusText}>{getStatusName(item.status)}</ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    imageContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    itemImage: {
        width: width - 32,
        height: 400,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
    },
    statusBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
});

