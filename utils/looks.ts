/**
 * Utility functions for look/outfit operations
 */

import type { CatalogProduct } from '@/types/boutique';
import type { LookResponse } from '@/api/looks/types';
import { LOOK_STYLES } from '@/constants/boutique';

/**
 * Extract style from selected products based on their tags and categories
 * Returns the most common style tag or a default style
 */
export function extractStyleFromProducts(products: CatalogProduct[]): string {
    if (products.length === 0) return '';

    // Collect all tags from products
    const allTags: string[] = [];
    products.forEach((product) => {
        if (product.tags && product.tags.length > 0) {
            allTags.push(...product.tags);
        }
    });

    // Map tags to style keywords
    const styleKeywords: Record<string, string[]> = {
        'Casual': ['casual', 'everyday', 'relaxed', 'comfortable', 'street', 'sporty'],
        'Formal': ['formal', 'elegant', 'sophisticated', 'dressy', 'black-tie'],
        'Business': ['business', 'professional', 'office', 'corporate', 'work'],
        'Evening': ['evening', 'night', 'party', 'cocktail', 'gala'],
        'Sporty': ['sporty', 'athletic', 'active', 'gym', 'workout'],
        'Bohemian': ['bohemian', 'boho', 'vintage', 'retro', 'free-spirited'],
        'Vintage': ['vintage', 'retro', 'classic', 'antique'],
        'Minimalist': ['minimalist', 'simple', 'clean', 'modern', 'minimal'],
        'Streetwear': ['streetwear', 'urban', 'hip-hop', 'street'],
        'Classic': ['classic', 'timeless', 'traditional', 'conservative'],
    };

    // Count style matches
    const styleScores: Record<string, number> = {};

    LOOK_STYLES.forEach((style) => {
        const keywords = styleKeywords[style.label] || [];
        let score = 0;

        allTags.forEach((tag) => {
            const lowerTag = tag.toLowerCase();
            keywords.forEach((keyword) => {
                if (lowerTag.includes(keyword.toLowerCase())) {
                    score++;
                }
            });
        });

        if (score > 0) {
            styleScores[style.label] = score;
        }
    });

    // Return the style with the highest score, or default to 'Casual'
    const sortedStyles = Object.entries(styleScores).sort((a, b) => b[1] - a[1]);

    if (sortedStyles.length > 0 && sortedStyles[0][1] > 0) {
        return sortedStyles[0][0];
    }

    // Default based on categories if no style tags found
    const categories = products.map((p) => p.category.toLowerCase());
    if (categories.some((c) => c.includes('suit') || c.includes('blazer') || c.includes('dress'))) {
        return 'Formal';
    }
    if (categories.some((c) => c.includes('jeans') || c.includes('t-shirt') || c.includes('sneaker'))) {
        return 'Casual';
    }

    return 'Casual'; // Default fallback
}

/**
 * Map look from backend response to frontend format
 */
export interface Look {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    style: string;
    items: {
        id: string;
        title: string;
        category: string;
        price: number;
        imageUrl: string;
    }[];
    totalPrice: number;
    boutique: {
        id: string;
        name: string;
        logo: string;
    };
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
}

export function mapLookFromBackendResponse(apiLook: LookResponse): Look {
    // Safety check: handle missing or null products array
    const products = apiLook.products || [];

    // Use total_price from backend if available, otherwise calculate from products
    const totalPrice = apiLook.total_price ?? products.reduce((sum, product) => sum + (product.discount_price || product.price), 0);

    // Mock boutique data for now, replace with actual boutique fetching later
    const mockBoutique = {
        id: apiLook.user_id,
        name: 'Boutique Name', // Placeholder
        logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop', // Placeholder
    };

    return {
        id: String(apiLook.id),
        title: apiLook.title,
        description: apiLook.description || '',
        imageUrl: apiLook.image_url || '',
        style: apiLook.style || 'Casual',
        items: products.map((p) => ({
            id: String(p.id),
            title: p.name,
            category: p.category,
            price: p.discount_price || p.price,
            imageUrl: p.image_url,
        })),
        totalPrice: totalPrice,
        boutique: mockBoutique,
        isFeatured: apiLook.is_featured || false,
        createdAt: apiLook.created_at,
        updatedAt: apiLook.updated_at,
    };
}
