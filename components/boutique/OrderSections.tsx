/**
 * OrderSections Component
 * Renders order sections grouped by status
 * 
 * @see components/boutique/CatalogSections.tsx - Similar pattern for catalog
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OrderCarousel } from './OrderCarousel';
import type { OrderCard } from './OrderItemCard';

interface OrderSectionsProps {
    recentOrders: OrderCard[];
    groupedByStatus: {
        sortedStatuses: string[];
        groups: Record<string, OrderCard[]>;
    };
    onItemPress: (id: string) => void;
    onViewAll: (status: string) => void;
    getStatusStyle: (status: string) => { backgroundColor: string; borderColor: string };
    getStatusTextColor: (status: string) => string;
}

/**
 * OrderSections
 * Renders recent orders and status-based sections
 */
export const OrderSections: React.FC<OrderSectionsProps> = ({
    recentOrders,
    groupedByStatus,
    onItemPress,
    onViewAll,
    getStatusStyle,
    getStatusTextColor,
}) => {
    const formatStatusLabel = (status: string): string => {
        const labels: Record<string, string> = {
            pending: 'Pending Orders',
            confirmed: 'Confirmed Orders',
            shipped: 'Shipped Orders',
            delivered: 'Delivered Orders',
            cancelled: 'Cancelled Orders',
        };
        return labels[status] || status;
    };

    return (
        <>
            {recentOrders.length > 0 && (
                <OrderCarousel
                    title="Recent Orders"
                    items={recentOrders}
                    onViewAll={() => onViewAll('recent')}
                    style={{ marginTop: 20 }}
                    onItemPress={onItemPress}
                    getStatusStyle={getStatusStyle}
                    getStatusTextColor={getStatusTextColor}
                />
            )}

            {groupedByStatus.sortedStatuses.map((status) => {
                const items = groupedByStatus.groups[status];
                return (
                    <OrderCarousel
                        key={status}
                        title={`${formatStatusLabel(status)} (${items.length})`}
                        items={items}
                        onViewAll={() => onViewAll(status)}
                        onItemPress={onItemPress}
                        getStatusStyle={getStatusStyle}
                        getStatusTextColor={getStatusTextColor}
                    />
                );
            })}
        </>
    );
};

