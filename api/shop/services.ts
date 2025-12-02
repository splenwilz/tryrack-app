import { apiClient } from "../client";
import type { ShopResponse, GetShopProductsOptions } from "./types";

/**
 * Get shop products with optional filtering by category, location, and radius
 * @param options - Optional query parameters for filtering
 * @returns Shop response with items, total, and radius_miles
 */
export async function getShopProducts(
    options?: GetShopProductsOptions
): Promise<ShopResponse> {
    // Build query string from options - only include non-null values
    const params = new URLSearchParams();

    if (options?.category != null && options.category !== '') {
        params.append('category', options.category);
    }

    if (options?.radius_miles != null) {
        params.append('radius_miles', String(options.radius_miles));
    }

    // Only include lat/long if both are provided and not null
    if (options?.latitude != null && options?.longitude != null) {
        params.append('latitude', String(options.latitude));
        params.append('longitude', String(options.longitude));
    }

    if (options?.limit != null) {
        params.append('limit', String(options.limit));
    }

    const queryString = params.toString();
    const url = `/api/v1/shop${queryString ? `?${queryString}` : ''}`;

    // Log the request for debugging - filter out null values from logged options
    const loggedOptions = options ? Object.fromEntries(
        Object.entries(options).filter(([_, value]) => value != null)
    ) : {};
    console.log('[Shop API] Request URL:', url);
    console.log('[Shop API] Request options (non-null only):', JSON.stringify(loggedOptions, null, 2));
    console.log('[Shop API] Query params:', queryString);

    const response = await apiClient<ShopResponse>(url, {
        method: "GET",
    });

    console.log('[Shop API] Response received:', {
        itemsCount: response.items?.length || 0,
        total: response.total,
        radius_miles: response.radius_miles,
    });

    return response;
}

