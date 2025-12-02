/**
 * OrderItemCard Component
 * Displays a single order card with status badge and metadata
 * 
 * @see components/boutique/ProductItemCard.tsx - Similar pattern for products
 */

import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export interface OrderCard {
    id: string;
    orderNumber: string;
    customerName: string;
    itemName: string;
    itemImage: string;
    amount: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    orderDate: string;
}

interface OrderItemCardProps {
    item: OrderCard;
    onPress?: () => void;
    getStatusStyle: (status: string) => { backgroundColor: string; borderColor: string };
    getStatusTextColor: (status: string) => string;
}

export const OrderItemCard: React.FC<OrderItemCardProps> = ({
    item,
    onPress,
    getStatusStyle,
    getStatusTextColor,
}) => {
    const backgroundColor = useThemeColor({}, 'background');
    const iconColor = useThemeColor({}, 'icon');

    return (
        <TouchableOpacity
            style={[styles.itemCard, { backgroundColor }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Image source={{ uri: item.itemImage }} style={styles.itemImage} />
            <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                <ThemedText style={[styles.statusText, { color: getStatusTextColor(item.status) }]}>
                    {item.status}
                </ThemedText>
            </View>
            <View style={styles.itemDetails}>
                <ThemedText style={styles.orderNumber} numberOfLines={1}>
                    {item.orderNumber}
                </ThemedText>
                <ThemedText style={styles.itemTitle} numberOfLines={2}>
                    {item.itemName}
                </ThemedText>
                <ThemedText style={[styles.customerName, { color: iconColor }]} numberOfLines={1}>
                    {item.customerName}
                </ThemedText>
                <ThemedText style={styles.orderAmount}>
                    ₦{item.amount.toLocaleString()}
                </ThemedText>
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
        borderWidth: 1,
        zIndex: 10,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    itemDetails: {
        padding: 12,
    },
    orderNumber: {
        fontSize: 10,
        fontWeight: '500',
        opacity: 0.7,
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    customerName: {
        fontSize: 12,
        marginBottom: 8,
    },
    orderAmount: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});

