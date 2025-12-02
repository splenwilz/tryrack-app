import { createQueryHook } from "../utils/query-helpers";
import { getShopProducts } from "./services";
import type { GetShopProductsOptions } from "./types";
import { queryKeys } from "../utils/query-keys";

/**
 * Hook to fetch shop products with optional filtering by category, location, and radius
 * @param options - Optional query parameters for filtering
 * @returns Query result with shop products
 */
export function useShopProducts(options?: GetShopProductsOptions & { enabled?: boolean }) {
    return createQueryHook(
        queryKeys.shop.products(options),
        () => getShopProducts(options),
        {
            placeholderData: { items: [], total: 0, radius_miles: null },
            refetchOnMount: false,
            enabled: options?.enabled !== false,
        }
    )();
}

