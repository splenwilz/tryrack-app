import { z } from "zod";
import { CatalogProductResponseSchema } from "../catalog/types";

/**
 * Shop product response schema
 * Extends catalog product with boutique information
 */
export const ShopProductResponseSchema = CatalogProductResponseSchema.extend({
    boutique_name: z.string(),
    boutique_logo_url: z.string().nullable(),
    boutique_distance_miles: z.number().nullable(),
});

/**
 * Shop API response schema
 */
export const ShopResponseSchema = z.object({
    items: z.array(ShopProductResponseSchema),
    total: z.number(),
    radius_miles: z.number().nullable(),
});

export type ShopProductResponse = z.infer<typeof ShopProductResponseSchema>;
export type ShopResponse = z.infer<typeof ShopResponseSchema>;

/**
 * Options for filtering shop products
 */
export interface GetShopProductsOptions {
    category?: string | null;
    radius_miles?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    limit?: number | null;
}

