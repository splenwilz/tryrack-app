/**
 * LookSections Component
 * Renders featured, recent, and style-grouped sections for looks
 *
 * @see components/boutique/CatalogSections.tsx - Similar pattern for products
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LookCarousel } from './LookCarousel';
import type { LookResponse } from '@/api/looks/types';

interface LookSectionsProps {
    featuredLooks: LookResponse[];
    recentLooks: LookResponse[];
    groupedByStyle: {
        sortedStyles: string[];
        groups: Record<string, LookResponse[]>;
    };
    onItemPress?: (itemId: string) => void;
    onViewAll?: (style: string) => void;
}

export const LookSections: React.FC<LookSectionsProps> = ({
    featuredLooks,
    recentLooks,
    groupedByStyle,
    onItemPress,
    onViewAll,
}) => {
    return (
        <>
            {featuredLooks.length > 0 && (
                <LookCarousel
                    title="Featured Looks"
                    items={featuredLooks}
                    onViewAll={onViewAll ? () => onViewAll('featured') : undefined}
                    onItemPress={onItemPress}
                    style={{ marginTop: 20 }}
                />
            )}

            {recentLooks.length > 0 && (
                <LookCarousel
                    title="Recently Added"
                    items={recentLooks}
                    onViewAll={onViewAll ? () => onViewAll('recent') : undefined}
                    onItemPress={onItemPress}
                    style={featuredLooks.length === 0 ? { marginTop: 20 } : undefined}
                />
            )}

            {groupedByStyle.sortedStyles.map((style) => {
                const items = groupedByStyle.groups[style];
                const displayTitle = style
                    .split(' ')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                return (
                    <LookCarousel
                        key={style}
                        title={`${displayTitle} (${items.length})`}
                        items={items}
                        onViewAll={onViewAll ? () => onViewAll(style) : undefined}
                        onItemPress={onItemPress}
                    />
                );
            })}
        </>
    );
};

