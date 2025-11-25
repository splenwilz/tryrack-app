import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMutationHook, createQueryHook } from "../utils/query-helpers";
import { createWardrobeItem, deleteWardrobeItem, extractWardrobeMetadata, generateVirtualTryOn, generateWardrobeImage, getVirtualTryOn, getVirtualTryOns, getWardrobeItem, getWardrobeItems, markAsWorn, saveVirtualTryOn, updateWardrobeItem, type GetWardrobeItemsOptions } from "./services";
import type { CreateWardrobeItemRequest, ExtractWardrobeItemRequest, SaveVirtualTryOnRequest, SaveVirtualTryOnResponse, UpdateWardrobeItemRequest, VirtualTryOnRequest, VirtualTryOnResponse, WardrobeItemResponse, WardrobeMetadata } from "./types";
import { queryKeys } from "../utils/query-keys";

export const useExtractWardrobeMetadata = createMutationHook<
    ExtractWardrobeItemRequest,
    WardrobeMetadata
>(extractWardrobeMetadata);

export const useGenerateWardrobeImage = createMutationHook<
    ExtractWardrobeItemRequest,
    { processedImageUri: string; processedImageMimeType: string }
>(generateWardrobeImage);

export const useGenerateVirtualTryOn = createMutationHook<
    VirtualTryOnRequest,
    VirtualTryOnResponse
>(generateVirtualTryOn);

export const useSaveVirtualTryOn = createMutationHook<
    SaveVirtualTryOnRequest,
    SaveVirtualTryOnResponse
>(saveVirtualTryOn);

export function useGetVirtualTryOn(id?: string | number, options?: { enabled?: boolean }) {
    const enabled = Boolean(id) && options?.enabled !== false;
    return createQueryHook(
        queryKeys.virtualTryOn.byId(id ? Number(id) : -1),
        () => {
            if (!id) {
                throw new Error('Virtual try-on ID is required');
            }
            return getVirtualTryOn(String(id));
        },
        {
            enabled,
        }
    )();
}

export const useCreateWardrobeItem = createMutationHook<
    CreateWardrobeItemRequest,
    WardrobeItemResponse
>(createWardrobeItem);

/**
 * Hook to fetch wardrobe items with optional filtering and pagination
 * 
 * @param options - Optional query parameters for filtering and pagination
 * @returns Query result with wardrobe items and queryClient
 */
export function useWardrobeItems(options?: GetWardrobeItemsOptions) {
    return createQueryHook(
        queryKeys.wardrobe.items(options),
        () => getWardrobeItems(options),
        {
            // Use placeholder data to prevent blocking render
            // Screen will show immediately with loading state
            placeholderData: [],
            // Don't refetch on mount if we have cached data
            refetchOnMount: false,
        }
    )();
}

export function useWardrobeItem(id: string, options?: { enabled?: boolean }) {
    return createQueryHook(
        queryKeys.wardrobe.itemById(id),
        () => getWardrobeItem(id),
        {
            placeholderData: undefined,
            enabled: options?.enabled !== false,
        }
    )();
}

/**
 * Hook to update a wardrobe item
 * 
 * @param id - The wardrobe item ID to update
 * @returns Mutation hook with queryClient for cache invalidation
 */
export function useUpdateWardrobeItem(id: string) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (request: UpdateWardrobeItemRequest) => updateWardrobeItem(id, request),
        onSuccess: () => {
            // Invalidate both the specific item and the items list
            queryClient.invalidateQueries({ queryKey: queryKeys.wardrobe.itemById(id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.wardrobe.all() });
        },
    });

    return {
        ...mutation,
        queryClient,
    };
}

export function useMarkAsWorn(id: string) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => markAsWorn(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.wardrobe.itemById(id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.wardrobe.all() });
        },
    });
    return {
        ...mutation,
        queryClient,
    };
}

export function useDeleteWardrobeItem(id: string) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => deleteWardrobeItem(id),
        onSuccess: () => {
            // Remove the deleted item from cache (prevents 404 refetch error)
            queryClient.removeQueries({ queryKey: queryKeys.wardrobe.itemById(id) });
            // Invalidate the items list to refetch without the deleted item
            queryClient.invalidateQueries({ queryKey: queryKeys.wardrobe.all() });
        },
    });
    return {
        ...mutation,
        queryClient,
    };
}

/**
 * Hook to fetch virtual try-on history for the current user
 * 
 * @returns Query result with virtual try-on history items
 */
export function useGetVirtualTryOns() {
    return createQueryHook(
        queryKeys.virtualTryOn.history(),
        () => getVirtualTryOns(),
        {
            placeholderData: [],
            refetchOnMount: false,
        }
    )();
}