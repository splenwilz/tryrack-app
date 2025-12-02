import { z } from 'zod';

/**
 * Look/Outfit API Types
 * For boutique owners to create complete outfit combinations
 */

/**
 * Look Request Schema
 * Used when creating or updating a look
 */
export const CreateLookRequestSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(500).optional(),
    style: z.string().max(50), // e.g., "business", "casual", "evening", "formal"
    product_ids: z.array(z.string()).min(2).max(5), // 2-5 products in the look
    image_url: z.string().url().optional(), // Styled image URL (can be generated via virtual try-on)
    is_featured: z.boolean().default(false),
});

export const UpdateLookRequestSchema = CreateLookRequestSchema.partial();

/**
 * Look Response Schema
 * What the backend returns
 */
export const LookResponseSchema = z.object({
    id: z.number(),
    user_id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    style: z.string(),
    product_ids: z.array(z.string()),
    image_url: z.string().nullable(),
    is_featured: z.boolean(),
    total_price: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
    products: z.array(z.object({
        id: z.number(),
        name: z.string(),
        category: z.string(),
        brand: z.string().nullable(),
        cost_price: z.number().nullable(),
        price: z.number(),
        discount_price: z.number().nullable(),
        image_url: z.string(),
        stock: z.number(),
        status: z.string(),
        tags: z.array(z.string()),
        colors: z.array(z.string()),
        description: z.string().nullable(),
        sales: z.number(),
        revenue: z.number(),
        views: z.number(),
        created_at: z.string(),
        updated_at: z.string(),
    })),
});

/**
 * TypeScript types inferred from schemas
 */
export type CreateLookRequest = z.infer<typeof CreateLookRequestSchema>;
export type UpdateLookRequest = z.infer<typeof UpdateLookRequestSchema>;
export type LookResponse = z.infer<typeof LookResponseSchema>;

/**
 * Request for generating a look image from selected products
 */
export interface GenerateLookImageRequest {
    productImageUris: string[]; // Array of product image URIs
    productDetails: {
        name: string;
        category: string;
        colors?: string[];
        tags?: string[];
    }[]; // Product metadata for context (same order as productImageUris)
    customPrompt?: string; // Custom styling instructions
    style?: string; // Desired style (e.g., "business", "casual")
}

/**
 * Response from look image generation
 */
export interface GenerateLookImageResponse {
    generatedImageUri: string; // Local file URI of generated image
    mimeType: string;
}

/**
 * Look metadata extracted from selected products
 */
export interface LookMetadata {
    title: string; // Suggested look title
    description: string; // Suggested description
    style: string; // Suggested style (e.g., "Business", "Casual", "Formal")
}

/**
 * Request for extracting look metadata from products
 */
export interface ExtractLookMetadataRequest {
    productImageUris: string[]; // Array of product image URIs
    productDetails: {
        name: string;
        category: string;
        colors?: string[];
        tags?: string[];
    }[]; // Product metadata for context
}

