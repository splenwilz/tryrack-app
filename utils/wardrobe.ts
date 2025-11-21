/**
 * Wardrobe Utility Functions
 * Helper functions for wardrobe-related operations
 */

import type { WardrobeItemCard } from '@/components/wardrobe/types';

/**
 * Formats the last worn date into a human-readable string
 * @param lastWornAt - ISO datetime string
 * @returns Formatted string or null if no date provided
 */
export const formatLastWorn = (lastWornAt?: string): string | null => {
    if (!lastWornAt) return null;
    const date = new Date(lastWornAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Worn today';
    if (diffDays === 1) return 'Worn yesterday';
    if (diffDays < 7) return `Worn ${diffDays} days ago`;
    if (diffDays < 30) return `Worn ${Math.floor(diffDays / 7)} weeks ago`;
    return `Worn ${Math.floor(diffDays / 30)} months ago`;
};

/**
 * Mock wardrobe items data for development/testing
 * TODO: Replace with real API data
 */
export const MOCK_WARDROBE_ITEMS: WardrobeItemCard[] = [
    {
        id: '1',
        title: 'Off-White Linen Blazer',
        category: 'outerwear',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&h=1200&fit=crop',
        colors: ['cream', 'beige'],
        tags: ['linen', 'neutral', 'statement'],
        status: 'clean',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '2',
        title: 'Denim Jacket with Raw Hem',
        category: 'denim jacket',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
        colors: ['blue', 'navy'],
        tags: ['denim', 'casual'],
        status: 'clean',
        last_worn_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        wear_count: 5,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '3',
        title: 'Cream Ribbed Knit Sweater',
        category: 'top',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
        colors: ['cream', 'beige'],
        tags: ['neutral', 'cozy'],
        status: 'clean',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '4',
        title: 'Tailored High-Waist Trousers',
        category: 'chinos',
        imageUrl: 'https://images.unsplash.com/photo-1484519332611-516457305ff6?w=600&h=800&fit=crop',
        colors: ['beige', 'tan'],
        tags: ['tailored', 'office'],
        status: 'worn',
        last_worn_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        wear_count: 3,
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '5',
        title: 'Minimalist Leather Sneakers',
        category: 'sneaker',
        imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=800&fit=crop',
        colors: ['white', 'gray'],
        tags: ['capsule', 'white'],
        status: 'clean',
        last_worn_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        wear_count: 12,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '6',
        title: 'Silk Button Down',
        category: 'top',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
        colors: ['white', 'ivory'],
        tags: ['silk', 'classic'],
        status: 'dirty',
        last_worn_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        wear_count: 8,
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '7',
        title: 'Oversized Graphic Tee',
        category: 'top',
        imageUrl: 'https://images.unsplash.com/photo-1484519332611-516457305ff6?w=600&h=800&fit=crop',
        colors: ['black', 'white'],
        tags: ['street', 'casual'],
        status: 'clean',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '8',
        title: 'Cable Knit Crewneck',
        category: 'top',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
        colors: ['gray', 'navy'],
        tags: ['knit', 'cozy'],
        status: 'clean',
        last_worn_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        wear_count: 6,
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '9',
        title: 'Wide-Leg Denim',
        category: 'chinos',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
        colors: ['blue'],
        tags: ['denim'],
        status: 'dirty',
        last_worn_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        wear_count: 4,
        created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '10',
        title: 'Cropped Moto Jacket',
        category: 'outerwear',
        imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&h=800&fit=crop',
        colors: ['black'],
        tags: ['leather'],
        status: 'dirty',
        last_worn_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        wear_count: 2,
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '11',
        title: 'Minimal White Trainers',
        category: 'sneaker',
        imageUrl: 'https://images.unsplash.com/photo-1484519332611-516457305ff6?w=600&h=800&fit=crop',
        colors: ['white'],
        tags: ['white'],
        status: 'worn',
        last_worn_at: new Date().toISOString(),
        wear_count: 15,
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '12',
        title: 'Layered Chain Necklace',
        category: 'accessory',
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=800&fit=crop',
        colors: ['gold'],
        tags: ['gold'],
        status: 'worn',
        last_worn_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        wear_count: 20,
        created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

