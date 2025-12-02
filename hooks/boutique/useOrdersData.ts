/**
 * useOrdersData Hook
 * Derives order UI data from orders, filters, and sort options
 * 
 * @see hooks/boutique/useCatalogData.ts - Similar pattern for catalog
 */

import { useMemo } from 'react';

export interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    itemName: string;
    itemImage: string;
    amount: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    shippingAddress: string;
    orderDate: string;
    estimatedDelivery?: string;
    trackingNumber?: string;
}

export interface OrderFilters {
    searchQuery: string;
    status: 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'all' | 'pending' | 'paid' | 'failed' | 'refunded';
}

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

interface UseOrdersDataOptions {
    orders: Order[];
    filters: OrderFilters;
    sortBy: string;
}

interface OrdersDataResult {
    orderCards: OrderCard[];
    recentOrders: OrderCard[];
    groupedByStatus: {
        sortedStatuses: string[];
        groups: Record<string, OrderCard[]>;
    };
    hasActiveFilters: boolean;
    filteredCount: number;
}

export function useOrdersData({
    orders,
    filters,
    sortBy,
}: UseOrdersDataOptions): OrdersDataResult {
    const hasActiveFilters =
        filters.searchQuery !== '' ||
        filters.status !== 'all' ||
        filters.paymentStatus !== 'all';

    const filteredOrders = useMemo(() => {
        let filtered = [...orders];

        if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase().trim();
            filtered = filtered.filter(
                (order) =>
                    order.orderNumber.toLowerCase().includes(query) ||
                    order.customerName.toLowerCase().includes(query) ||
                    order.itemName.toLowerCase().includes(query)
            );
        }

        if (filters.status !== 'all') {
            filtered = filtered.filter((order) => order.status === filters.status);
        }

        if (filters.paymentStatus !== 'all') {
            filtered = filtered.filter((order) => order.paymentStatus === filters.paymentStatus);
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
                case 'amount':
                    return b.amount - a.amount;
                case 'status':
                    const statusOrder: Record<string, number> = {
                        pending: 1,
                        confirmed: 2,
                        shipped: 3,
                        delivered: 4,
                        cancelled: 5,
                    };
                    return statusOrder[a.status] - statusOrder[b.status];
                default:
                    return 0;
            }
        });

        return filtered;
    }, [orders, filters, sortBy]);

    const orderCards: OrderCard[] = useMemo(() => {
        return filteredOrders.map((order) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            itemName: order.itemName,
            itemImage: order.itemImage,
            amount: order.amount,
            status: order.status,
            paymentStatus: order.paymentStatus,
            orderDate: order.orderDate,
        }));
    }, [filteredOrders]);

    const recentOrders = useMemo(() => {
        return orderCards
            .sort((a, b) => {
                return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
            })
            .slice(0, 10);
    }, [orderCards]);

    const groupedByStatus = useMemo(() => {
        const groups: Record<string, OrderCard[]> = {
            pending: [],
            confirmed: [],
            shipped: [],
            delivered: [],
            cancelled: [],
        };

        orderCards.forEach((card) => {
            if (groups[card.status]) {
                groups[card.status].push(card);
            }
        });

        const sortedStatuses = Object.keys(groups).filter((status) => groups[status].length > 0);

        return { groups, sortedStatuses };
    }, [orderCards]);

    return {
        orderCards,
        recentOrders,
        groupedByStatus,
        hasActiveFilters,
        filteredCount: orderCards.length,
    };
}

