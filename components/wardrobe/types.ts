/**
 * Wardrobe Component Types
 * Shared types for wardrobe-related components
 */

export interface WardrobeItemCard {
    id: string;
    title: string;
    category: string;
    price?: number;
    imageUrl: string;
    colors: string[];
    tags: string[];
    status: 'clean' | 'dirty' | 'worn';
    last_worn_at?: string; // ISO datetime string
    wear_count?: number;
    created_at?: string;
}

export type WardrobeStatus = 'clean' | 'dirty' | 'worn';

