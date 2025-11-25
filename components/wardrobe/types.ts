/**
 * Wardrobe Component Types
 * Shared types for wardrobe-related components
 */

export type WardrobeItemStatus = 'clean' | 'dirty' | 'worn' | 'planned';
export interface WardrobeItemCard {
    id: string;
    title: string;
    category: string;
    price?: number;
    imageUrl: string;
    colors: string[];
    tags: string[];
    status: WardrobeItemStatus;
    last_worn_at?: string; // ISO datetime string
    wear_count?: number;
    created_at?: string;
}

