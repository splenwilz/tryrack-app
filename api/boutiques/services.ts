import { apiClient } from '../client';
import type {
    BoutiqueResponse,
    BoutiquesResponse,
    BoutiqueItemsResponse,
    BoutiqueLooksResponse,
    GetBoutiquesOptions,
    GetBoutiqueItemsOptions,
    GetBoutiqueLooksOptions,
} from './types';

/**
 * Get list of all boutiques
 * 
 * @param options - Optional query parameters for filtering and pagination
 * @returns Array of boutique profiles with additional fields
 */
export async function getBoutiques(options?: GetBoutiquesOptions): Promise<BoutiquesResponse> {
    const params = new URLSearchParams();

    if (options?.featured != null) {
        params.append('featured', String(options.featured));
    }

    if (options?.latitude != null && options?.longitude != null) {
        params.append('latitude', String(options.latitude));
        params.append('longitude', String(options.longitude));
    }

    if (options?.radius_miles != null) {
        params.append('radius_miles', String(options.radius_miles));
    }

    if (options?.skip != null) {
        params.append('skip', String(options.skip));
    }

    if (options?.limit != null) {
        params.append('limit', String(options.limit));
    }

    const queryString = params.toString();
    const url = `/api/v1/boutiques${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient<BoutiquesResponse>(url, {
        method: 'GET',
    });

    return response;
}

/**
 * Get boutique profile by boutique ID
 * 
 * @param boutiqueId - Boutique ID
 * @returns Boutique profile with additional fields (rating, review_count, product_count, featured, cover_image_url)
 */
export async function getBoutiqueById(boutiqueId: number | string): Promise<BoutiqueResponse> {
    const response = await apiClient<BoutiqueResponse>(`/api/v1/boutiques/${boutiqueId}`, {
        method: 'GET',
    });
    return response;
}

/**
 * Get all catalog items from a specific boutique
 * 
 * @param boutiqueId - Boutique ID
 * @param options - Optional query parameters for filtering and pagination
 * @returns Array of catalog products
 */
export async function getBoutiqueItems(
    boutiqueId: number | string,
    options?: GetBoutiqueItemsOptions
): Promise<BoutiqueItemsResponse> {
    // Build query string from options
    const params = new URLSearchParams();

    if (options?.category != null) {
        params.append('category', options.category);
    }

    if (options?.brand != null) {
        params.append('brand', options.brand);
    }

    if (options?.status != null) {
        params.append('status', options.status);
    }

    if (options?.skip != null) {
        params.append('skip', String(options.skip));
    }

    if (options?.limit != null) {
        params.append('limit', String(options.limit));
    }

    const queryString = params.toString();
    const url = `/api/v1/boutiques/${boutiqueId}/items${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient<BoutiqueItemsResponse>(url, {
        method: 'GET',
    });

    return response;
}

/**
 * Get all looks from a specific boutique
 * 
 * @param boutiqueId - Boutique ID
 * @param options - Optional query parameters for filtering and pagination
 * @returns Array of looks
 */
export async function getBoutiqueLooks(
    boutiqueId: number | string,
    options?: GetBoutiqueLooksOptions
): Promise<BoutiqueLooksResponse> {
    // Build query string from options
    const params = new URLSearchParams();

    if (options?.style != null) {
        params.append('style', options.style);
    }

    if (options?.is_featured != null) {
        params.append('is_featured', String(options.is_featured));
    }

    if (options?.skip != null) {
        params.append('skip', String(options.skip));
    }

    if (options?.limit != null) {
        params.append('limit', String(options.limit));
    }

    const queryString = params.toString();
    const url = `/api/v1/boutiques/${boutiqueId}/looks${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient<BoutiqueLooksResponse>(url, {
        method: 'GET',
    });

    return response;
}

