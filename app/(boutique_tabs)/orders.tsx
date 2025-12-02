/**
 * Boutique Orders Screen
 * Comprehensive order management with filtering and status tracking
 * 
 * Refactored to match catalog screen structure:
 * - Uses ScrollView with sections
 * - Filter bar and sort controls
 * - OrderSections component for grouped display
 * 
 * @see app/(boutique_tabs)/catalog.tsx - Reference implementation
 */

import React from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { CustomHeader } from '@/components/custom-header';
import {
    CatalogFilterBar,
    CatalogSortTabs,
    CatalogEmptyState,
    OrderSections,
} from '@/components/boutique';
import { FilterSummary } from '@/components/wardrobe/FilterSummary';
import { useOrdersData, type Order, type OrderFilters } from '@/hooks/boutique/useOrdersData';

// Mock data for comprehensive orders
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

export default function BoutiqueOrdersScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');

    // UI State
    const [sortBy, setSortBy] = React.useState<string>('date');
    const [refreshing, setRefreshing] = React.useState(false);

    // Filters
    const [filters, setFilters] = React.useState<OrderFilters>({
        searchQuery: '',
        status: 'all',
        paymentStatus: 'all',
    });

    // Processed data
    const {
        orderCards,
        recentOrders,
        groupedByStatus,
        hasActiveFilters,
        filteredCount,
    } = useOrdersData({ orders: mockOrders, filters, sortBy });

    const activeFilterCount = [
        filters.searchQuery && 'Search',
        filters.status !== 'all' && filters.status,
        filters.paymentStatus !== 'all' && filters.paymentStatus,
    ].filter(Boolean).length;

    const sortOptions = [
        { key: 'date', label: 'Date' },
        { key: 'amount', label: 'Amount' },
        { key: 'status', label: 'Status' },
    ];

    // Simplified color scheme - use theme colors with subtle variations
    const getStatusStyle = React.useCallback((status: string) => {
        const isPositive = status === 'delivered';
        const isNegative = status === 'cancelled';
        const isPending = status === 'pending';

        if (isPositive) {
            return { backgroundColor: tintColor + '20', borderColor: tintColor };
        }
        if (isNegative) {
            return { backgroundColor: '#FF3B3020', borderColor: '#FF3B30' };
        }
        if (isPending) {
            return { backgroundColor: iconColor + '20', borderColor: iconColor };
        }
        // Default for confirmed/shipped
        return { backgroundColor: tintColor + '15', borderColor: tintColor };
    }, [tintColor, iconColor]);

    const getStatusTextColor = React.useCallback((status: string) => {
        if (status === 'delivered') return tintColor;
        if (status === 'cancelled') return '#FF3B30';
        return iconColor;
    }, [tintColor, iconColor]);

    // Handlers
    const handleBackPress = () => {
        router.back();
    };

    const handleSearchPress = () => {
        console.log('Search orders');
    };

    const handleNotificationPress = () => {
        console.log('Notifications pressed');
    };

    const handleItemPress = (itemId: string) => {
        const url = `/(boutique)/order-detail?orderId=${itemId}`;
        // @ts-expect-error - Expo Router dynamic route typing
        router.push(url);
    };

    const handleViewAll = (status: string) => {
        router.push({
            pathname: '/orders/category',
            params: { status },
        });
    };

    const handleClearFilters = () => {
        setFilters({
            searchQuery: '',
            status: 'all',
            paymentStatus: 'all',
        });
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <CustomHeader
                title="Orders"
                showBackButton={true}
                onBackPress={handleBackPress}
                onSearchPress={handleSearchPress}
                onNotificationPress={handleNotificationPress}
                notificationCount={3}
            />

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={tintColor}
                    />
                }
            >
                {/* Filter Bar */}
                <CatalogFilterBar
                    hasActiveFilters={hasActiveFilters}
                    activeFilterCount={activeFilterCount}
                    onFilterPress={() => console.log('Open filter modal')}
                    onClearFilters={handleClearFilters}
                />

                {/* Filter Summary */}
                <FilterSummary
                    hasActiveFilters={hasActiveFilters}
                    filteredCount={filteredCount}
                    totalCount={mockOrders.length}
                    onClearFilters={handleClearFilters}
                />

                {/* Sort Controls */}
                <View style={styles.sortSection}>
                    <ThemedText style={[styles.sortLabel, { color: iconColor }]}>Sort by:</ThemedText>
                    <CatalogSortTabs options={sortOptions} value={sortBy} onChange={setSortBy} />
                </View>

                {orderCards.length === 0 ? (
                    <CatalogEmptyState
                        title="No Orders Found"
                        description="No orders match the selected filter."
                    />
                ) : (
                    <OrderSections
                        recentOrders={recentOrders}
                        groupedByStatus={groupedByStatus}
                        onItemPress={handleItemPress}
                        onViewAll={handleViewAll}
                        getStatusStyle={getStatusStyle}
                        getStatusTextColor={getStatusTextColor}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sortSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        marginBottom: 12,
        gap: 8,
    },
    sortLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 4,
    },
});
