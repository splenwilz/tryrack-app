/**
 * Orders Category View Route
 * Displays all orders filtered by status
 * 
 * @see app/catalog/category.tsx - Similar pattern for catalog
 * @see app/wardrobe/category.tsx - Similar pattern for wardrobe
 */

import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { CustomHeader } from '@/components/custom-header';
import type { Order } from '@/hooks/boutique/useOrdersData';

// Mock data - in real app, this would come from API
const mockOrders: Order[] = [
    {
        id: '1',
        orderNumber: 'ORD-2024-001',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.johnson@email.com',
        itemName: 'Designer Blazer',
        itemImage: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=100&h=100&fit=crop',
        amount: 45000,
        status: 'shipped',
        paymentStatus: 'paid',
        shippingAddress: '123 Victoria Island, Lagos',
        orderDate: '2024-01-15',
        estimatedDelivery: '2024-01-18',
        trackingNumber: 'TRK123456789',
    },
    {
        id: '2',
        orderNumber: 'ORD-2024-002',
        customerName: 'Michael Chen',
        customerEmail: 'michael.chen@email.com',
        itemName: 'Silk Evening Dress',
        itemImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100&h=100&fit=crop',
        amount: 75000,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: '456 Ikoyi, Lagos',
        orderDate: '2024-01-15',
    },
    {
        id: '3',
        orderNumber: 'ORD-2024-003',
        customerName: 'Emma Wilson',
        customerEmail: 'emma.wilson@email.com',
        itemName: 'Summer Maxi Dress',
        itemImage: 'https://images.unsplash.com/photo-1594736797933-d0c29b8b0b8c?w=100&h=100&fit=crop',
        amount: 35000,
        status: 'delivered',
        paymentStatus: 'paid',
        shippingAddress: '789 Lekki Phase 1, Lagos',
        orderDate: '2024-01-14',
        estimatedDelivery: '2024-01-17',
    },
    {
        id: '4',
        orderNumber: 'ORD-2024-004',
        customerName: 'David Brown',
        customerEmail: 'david.brown@email.com',
        itemName: 'Casual Denim Jacket',
        itemImage: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=100&h=100&fit=crop',
        amount: 28000,
        status: 'confirmed',
        paymentStatus: 'paid',
        shippingAddress: '321 Surulere, Lagos',
        orderDate: '2024-01-15',
    },
    {
        id: '5',
        orderNumber: 'ORD-2024-005',
        customerName: 'Lisa Garcia',
        customerEmail: 'lisa.garcia@email.com',
        itemName: 'Formal Business Suit',
        itemImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        amount: 95000,
        status: 'cancelled',
        paymentStatus: 'refunded',
        shippingAddress: '654 Gbagada, Lagos',
        orderDate: '2024-01-13',
    },
    {
        id: '6',
        orderNumber: 'ORD-2024-006',
        customerName: 'James Taylor',
        customerEmail: 'james.taylor@email.com',
        itemName: 'Elegant Cocktail Dress',
        itemImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100&h=100&fit=crop',
        amount: 65000,
        status: 'shipped',
        paymentStatus: 'paid',
        shippingAddress: '987 Magodo, Lagos',
        orderDate: '2024-01-14',
        estimatedDelivery: '2024-01-17',
        trackingNumber: 'TRK987654321',
    },
];

export default function OrdersCategoryRoute() {
    const params = useLocalSearchParams<{ status?: string | string[] }>();
    const status = Array.isArray(params.status) ? params.status[0] : params.status;

    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const textColor = useThemeColor({}, 'text');
    const cardBg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');
    const borderColor = useThemeColor({}, 'tabIconDefault');

    // Filter orders by status
    const filteredOrders = useMemo(() => {
        if (!status || status === 'recent') {
            // Show recent orders (sorted by date)
            return [...mockOrders].sort(
                (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
            );
        }
        return mockOrders.filter((order) => order.status === status);
    }, [status]);

    // Format status name for display
    const statusDisplayName = useMemo(() => {
        if (!status || status === 'recent') return 'Recent Orders';
        const nameMap: Record<string, string> = {
            pending: 'Pending Orders',
            confirmed: 'Confirmed Orders',
            shipped: 'Shipped Orders',
            delivered: 'Delivered Orders',
            cancelled: 'Cancelled Orders',
        };
        return nameMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
    }, [status]);

    // Status styling
    const getStatusStyle = (orderStatus: string) => {
        const isPositive = orderStatus === 'delivered';
        const isNegative = orderStatus === 'cancelled';
        const isPending = orderStatus === 'pending';

        if (isPositive) {
            return { backgroundColor: tintColor + '20', borderColor: tintColor };
        }
        if (isNegative) {
            return { backgroundColor: '#FF3B3020', borderColor: '#FF3B30' };
        }
        if (isPending) {
            return { backgroundColor: iconColor + '20', borderColor: iconColor };
        }
        return { backgroundColor: tintColor + '15', borderColor: tintColor };
    };

    const getStatusTextColor = (orderStatus: string) => {
        if (orderStatus === 'delivered') return tintColor;
        if (orderStatus === 'cancelled') return '#FF3B30';
        return iconColor;
    };

    const handleBackPress = () => {
        router.back();
    };

    const handleOrderPress = (orderId: string) => {
        const url = `/(boutique)/order-detail?orderId=${orderId}`;
        // @ts-expect-error - Expo Router dynamic route typing
        router.push(url);
    };

    const renderOrderCard = ({ item }: { item: Order }) => (
        <TouchableOpacity
            style={[styles.orderCard, { backgroundColor: cardBg, borderColor: borderColor }]}
            onPress={() => handleOrderPress(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                    <ThemedText style={[styles.orderNumber, { color: textColor }]}>
                        {item.orderNumber}
                    </ThemedText>
                    <ThemedText style={[styles.customerName, { color: iconColor }]}>
                        {item.customerName}
                    </ThemedText>
                </View>
                <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                    <ThemedText style={[styles.statusText, { color: getStatusTextColor(item.status) }]}>
                        {item.status}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.orderContent}>
                <Image source={{ uri: item.itemImage }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                    <ThemedText style={[styles.itemName, { color: textColor }]}>
                        {item.itemName}
                    </ThemedText>
                    <ThemedText style={[styles.orderAmount, { color: textColor }]}>
                        ₦{item.amount.toLocaleString()}
                    </ThemedText>
                    <ThemedText style={[styles.orderDate, { color: iconColor }]}>
                        Ordered: {item.orderDate}
                    </ThemedText>
                    {item.estimatedDelivery && (
                        <ThemedText style={[styles.deliveryDate, { color: iconColor }]}>
                            Est. Delivery: {item.estimatedDelivery}
                        </ThemedText>
                    )}
                    {item.trackingNumber && (
                        <ThemedText style={[styles.trackingNumber, { color: tintColor }]}>
                            Tracking: {item.trackingNumber}
                        </ThemedText>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <CustomHeader
                title={statusDisplayName}
                showBackButton={true}
                onBackPress={handleBackPress}
            />
            <FlatList
                data={filteredOrders}
                renderItem={renderOrderCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <ThemedText style={[styles.emptyText, { color: iconColor }]}>
                            No orders found in this category
                        </ThemedText>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    orderCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderInfo: {
        flex: 1,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    customerName: {
        fontSize: 14,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    orderContent: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    orderAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 12,
        marginBottom: 2,
    },
    deliveryDate: {
        fontSize: 12,
        marginBottom: 2,
    },
    trackingNumber: {
        fontSize: 12,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});

