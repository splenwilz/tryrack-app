import { createMutationHook, createQueryHook } from "../utils/query-helpers";
import { createWardrobeItem, extractWardrobeMetadata, generateWardrobeImage, getWardrobeItems, type GetWardrobeItemsOptions } from "./services";
import type { CreateWardrobeItemRequest, ExtractWardrobeItemRequest, WardrobeItemResponse, WardrobeMetadata } from "./types";
import { queryKeys } from "../utils/query-keys";

export const useExtractWardrobeMetadata = createMutationHook<
    ExtractWardrobeItemRequest,
    WardrobeMetadata
>(extractWardrobeMetadata);

export const useGenerateWardrobeImage = createMutationHook<
    ExtractWardrobeItemRequest,
    { processedImageUri: string; processedImageMimeType: string }
>(generateWardrobeImage);

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
        () => getWardrobeItems(options)
    )();
}

