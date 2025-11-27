import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMutationHook, createQueryHook } from "../utils/query-helpers";
import {
    createCatalogProduct,
    updateCatalogProduct,
    getCatalogProducts,
    getCatalogProduct,
    deleteCatalogProduct,
} from "./services";
import type {
    CreateCatalogProductRequest,
    UpdateCatalogProductRequest,
    CatalogProductResponse,
    GetCatalogProductsOptions,
} from "./types";
import { queryKeys } from "../utils/query-keys";

/**
 * Hook to fetch catalog products with optional filtering and pagination
 * @param options - Optional query parameters for filtering and pagination
 * @returns Query result with catalog products
 */
export function useCatalogProducts(options?: GetCatalogProductsOptions) {
    return createQueryHook(
        queryKeys.catalog.products(options),
        () => getCatalogProducts(options),
        {
            placeholderData: [],
            refetchOnMount: false,
        }
    )();
}

/**
 * Hook to fetch a single catalog product by ID
 * @param id - Product ID
 * @returns Query result with the product
 */
export function useCatalogProduct(id: string, options?: { enabled?: boolean }) {
    return createQueryHook(
        queryKeys.catalog.productById(id),
        () => getCatalogProduct(id),
        {
            placeholderData: undefined,
            enabled: options?.enabled !== false && !!id,
        }
    )();
}

/**
 * Hook to create a new catalog product
 * @returns Mutation hook with queryClient for cache invalidation
 */
export function useCreateCatalogProduct() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (request: CreateCatalogProductRequest) => createCatalogProduct(request),
        onSuccess: () => {
            // Invalidate products list to refetch
            queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all() });
        },
    });

    return {
        ...mutation,
        queryClient,
    };
}

/**
 * Hook to update an existing catalog product
 * @param id - Product ID to update
 * @returns Mutation hook with queryClient for cache invalidation
 */
export function useUpdateCatalogProduct(id: string) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (request: UpdateCatalogProductRequest) => updateCatalogProduct(id, request),
        onSuccess: () => {
            // Invalidate both the specific product and the products list
            queryClient.invalidateQueries({ queryKey: queryKeys.catalog.productById(id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all() });
        },
    });

    return {
        ...mutation,
        queryClient,
    };
}

/**
 * Hook to delete a catalog product
 * @returns Mutation hook with queryClient for cache invalidation
 */
export function useDeleteCatalogProduct() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (id: string) => deleteCatalogProduct(id),
        onSuccess: () => {
            // Invalidate products list to refetch
            queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all() });
        },
    });

    return {
        ...mutation,
        queryClient,
    };
}

