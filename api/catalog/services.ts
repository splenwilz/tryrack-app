import { apiClient, ApiError } from "../client";
import type {
    CreateCatalogProductRequest,
    UpdateCatalogProductRequest,
    CatalogProductResponse,
    GetCatalogProductsOptions,
} from "./types";

/**
 * Create a new catalog product
 * @param request - Product data to create
 * @returns Created product response
 */
export async function createCatalogProduct(
    request: CreateCatalogProductRequest
): Promise<CatalogProductResponse> {
    const response = await apiClient<CatalogProductResponse>("/api/v1/catalog", {
        method: "POST",
        body: JSON.stringify(request),
    });
    return response;
}

/**
 * Update an existing catalog product
 * @param id - Product ID to update
 * @param request - Product data to update
 * @returns Updated product response
 */
export async function updateCatalogProduct(
    id: string,
    request: UpdateCatalogProductRequest
): Promise<CatalogProductResponse> {
    const response = await apiClient<CatalogProductResponse>(`/api/v1/catalog/${id}`, {
        method: "PATCH",
        body: JSON.stringify(request),
    });
    return response;
}

/**
 * Get catalog products with optional filtering and pagination
 * @param options - Optional query parameters for filtering and pagination
 * @returns Array of catalog products
 */
export async function getCatalogProducts(
    options?: GetCatalogProductsOptions
): Promise<CatalogProductResponse[]> {
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
    const url = `/api/v1/catalog${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient<CatalogProductResponse[]>(url, {
        method: "GET",
    });
    return response;
}

/**
 * Get a single catalog product by ID
 * @param id - Product ID
 * @returns Product response
 */
export async function getCatalogProduct(id: string): Promise<CatalogProductResponse> {
    const response = await apiClient<CatalogProductResponse>(`/api/v1/catalog/${id}`, {
        method: "GET",
    });
    return response;
}

/**
 * Delete a catalog product
 * @param id - Product ID to delete
 * @returns Promise that resolves when deletion is successful
 */
export async function deleteCatalogProduct(id: string): Promise<void> {
    try {
        await apiClient<void>(`/api/v1/catalog/${id}`, {
            method: "DELETE",
        });
    } catch (error) {
        // If product is already deleted (404), treat it as success
        if (error instanceof ApiError && error.status === 404) {
            console.log('[Catalog] Product already deleted, treating as success');
            return;
        }
        throw error;
    }
}

