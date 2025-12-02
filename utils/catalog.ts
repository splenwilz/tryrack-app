import type { CatalogProduct } from '@/types/boutique';
import type { CreateCatalogProductRequest, UpdateCatalogProductRequest, CatalogProductResponse } from '@/api/catalog/types';

/**
 * Map frontend CatalogProduct to backend CreateCatalogProductRequest
 * Converts camelCase to snake_case for API
 */
export function mapToBackendRequest(product: {
    name: string;
    category: string;
    brand?: string;
    costPrice?: number;
    price: number;
    discountPrice?: number;
    imageUrl: string;
    stock: number;
    status: 'active' | 'inactive' | 'out_of_stock';
    tags: string[];
    colors: string[];
    description: string;
}): CreateCatalogProductRequest {
    return {
        name: product.name.trim(),
        category: product.category.trim(),
        brand: product.brand?.trim() || undefined,
        cost_price: product.costPrice,
        price: product.price,
        discount_price: product.discountPrice,
        image_url: product.imageUrl,
        stock: product.stock,
        status: product.status,
        tags: product.tags,
        colors: product.colors,
        description: product.description.trim(),
    };
}

/**
 * Map backend CatalogProductResponse to frontend CatalogProduct
 * Converts snake_case to camelCase for frontend
 * Converts numeric ID to string for frontend consistency
 */
export function mapFromBackendResponse(response: CatalogProductResponse): CatalogProduct {
    return {
        id: String(response.id), // Convert number ID to string for frontend
        name: response.name,
        category: response.category,
        brand: response.brand,
        price: response.price,
        costPrice: response.cost_price,
        discountPrice: response.discount_price,
        imageUrl: response.image_url,
        stock: response.stock,
        status: response.status,
        tags: response.tags,
        colors: response.colors,
        description: response.description,
        createdAt: response.created_at,
        lastUpdated: response.updated_at,
    };
}

