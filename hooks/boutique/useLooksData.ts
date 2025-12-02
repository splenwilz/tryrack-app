/**
 * useLooksData Hook
 * Organizes looks data into sections: featured, recent, and grouped by style
 *
 * @see hooks/boutique/useCatalogData.ts - Similar pattern for products
 */

import { useMemo } from 'react';
import type { LookResponse } from '@/api/looks/types';

interface UseLooksDataOptions {
    looks: LookResponse[];
}

interface LooksDataResult {
    featuredLooks: LookResponse[];
    recentLooks: LookResponse[];
    groupedByStyle: {
        sortedStyles: string[];
        groups: Record<string, LookResponse[]>;
    };
}

export function useLooksData({ looks }: UseLooksDataOptions): LooksDataResult {
    const featuredLooks = useMemo(() => {
        return looks
            .filter((look) => look.is_featured)
            .sort((a, b) => {
                // Sort by creation date, most recent first
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
    }, [looks]);

    const recentLooks = useMemo(() => {
        return [...looks]
            .filter((look) => !look.is_featured) // Exclude featured from recent
            .sort((a, b) => {
                // Sort by creation date, most recent first
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            })
            .slice(0, 10); // Limit to 10 most recent
    }, [looks]);

    const groupedByStyle = useMemo(() => {
        const groups: Record<string, LookResponse[]> = {};
        const styles = new Set<string>();

        looks.forEach((look) => {
            const style = look.style.toLowerCase().trim();
            if (!style) return; // Skip looks without style

            if (!groups[style]) {
                groups[style] = [];
                styles.add(style);
            }
            groups[style].push(look);
        });

        // Sort styles by count (most items first), then alphabetically
        const sortedStyles = Array.from(styles).sort((a, b) => {
            const countDiff = groups[b].length - groups[a].length;
            if (countDiff !== 0) return countDiff;
            return a.localeCompare(b);
        });

        return { groups, sortedStyles };
    }, [looks]);

    return {
        featuredLooks,
        recentLooks,
        groupedByStyle,
    };
}

