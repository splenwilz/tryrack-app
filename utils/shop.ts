import type { ShopProductResponse } from '@/api/shop/types';

/**
 * Boutique item interface for shop screen
 * Matches the format expected by BoutiqueItemCard component
 */
export interface BoutiqueItem {
    id: string;
    title: string;
    brand: string;
    category: string;
    imageUrl: string;
    price: number;
    colors: string[];
    tags: string[];
    boutique: {
        id: string;
        name: string;
        logo: string;
    };
    arAvailable: boolean;
}

/**
 * Map shop product response to BoutiqueItem format
 * @param product - Shop product from API
 * @returns BoutiqueItem formatted for UI
 */
export function mapShopProductToBoutiqueItem(product: ShopProductResponse): BoutiqueItem {
    return {
        id: String(product.id),
        title: product.name,
        brand: product.brand || 'Unknown Brand',
        category: product.category,
        imageUrl: product.image_url,
        price: product.discount_price || product.price,
        colors: product.colors || [],
        tags: product.tags || [],
        boutique: {
            id: 'boutique', // We don't have boutique ID in the response, using placeholder
            name: product.boutique_name,
            logo: product.boutique_logo_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
        },
        arAvailable: true, // Default to true, can be enhanced later
    };
}

