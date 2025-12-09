import { z } from "zod";

/**
 * Catalog product request schema for creating/updating products
 * Matches backend API expectations
 */
export const CreateCatalogProductRequestSchema = z.object({
    name: z.string().max(100),
    category: z.string(),
    brand: z.string().optional(),
    cost_price: z.number().positive().optional(),
    price: z.number().positive(),
    discount_price: z.number().positive().optional(),
    image_url: z.string().url(),
    stock: z.number().int().min(0),
    status: z.enum(["active", "inactive", "out_of_stock"]).default("active"),
    tags: z.array(z.string()),
    colors: z.array(z.string()),
    description: z.string(),
});

export const UpdateCatalogProductRequestSchema = CreateCatalogProductRequestSchema.partial();

/**
 * Catalog product response schema from backend
 */
export const CatalogProductResponseSchema = CreateCatalogProductRequestSchema.extend({
    id: z.number(), // Backend returns numeric ID
    sales: z.number().int().min(0).default(0),
    revenue: z.number().int().min(0).default(0),
    views: z.number().int().min(0).default(0),
    created_at: z.string(),
    updated_at: z.string(),
});

export type CreateCatalogProductRequest = z.infer<typeof CreateCatalogProductRequestSchema>;
export type UpdateCatalogProductRequest = z.infer<typeof UpdateCatalogProductRequestSchema>;
export type CatalogProductResponse = z.infer<typeof CatalogProductResponseSchema>;

/**
 * Options for filtering and paginating catalog products
 */
export interface GetCatalogProductsOptions {
    category?: string | null;
    brand?: string | null;
    status?: string | null;
    boutique_id?: number | null; // Filter by boutique ID (replaces deprecated user_id)
    skip?: number;
    limit?: number;
}

