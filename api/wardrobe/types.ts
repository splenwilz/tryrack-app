import { z } from "zod";

/**
 * Wardrobe item metadata extracted from image
 */
export const WardrobeMetadataSchema = z.object({
    title: z.string().max(30),
    category: z.string(),
    colors: z.array(z.string()),
    tags: z.array(z.string()),
});

export type WardrobeMetadata = z.infer<typeof WardrobeMetadataSchema>;

/**
 * Request for wardrobe item extraction
 */
export interface ExtractWardrobeItemRequest {
    imageUri: string; // Local file URI (file://) or remote URL
    mimeType?: string; // Optional MIME type (defaults to image/png)
}

export const CreateWardrobeItemRequestSchema = z.object({
    title: z.string().max(30),
    category: z.string(),
    colors: z.array(z.string()),
    tags: z.array(z.string()),
    image_url: z.string(),
    status: z.enum(["clean", "dirty", "worn", "planned"]).default("clean"),
});

export const UpdateWardrobeItemRequestSchema = z.object({
    title: z.string().max(30).optional(),
    category: z.string().optional(),
    colors: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    image_url: z.string().optional(),
    status: z.enum(["clean", "dirty", "worn", "planned"]).optional().default("clean"),
})

export const WardrobeItemResponseSchema = CreateWardrobeItemRequestSchema.extend({
    id: z.number(),
    user_id: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    last_worn_at: z.string().optional(),
    wear_count: z.number().optional(),
});

export type CreateWardrobeItemRequest = z.infer<typeof CreateWardrobeItemRequestSchema>;
export type UpdateWardrobeItemRequest = z.infer<typeof UpdateWardrobeItemRequestSchema>;
export type WardrobeItemResponse = z.infer<typeof WardrobeItemResponseSchema>;

/**
 * Item details for virtual try-on context
 */
export interface VirtualTryOnItemDetail {
    title: string;
    category: string;
    colors: string[];
    tags: string[];
}

/**
 * Request for virtual try-on generation
 */
export interface VirtualTryOnRequest {
    fullBodyImageUri: string; // User's full body photo (local file URI or remote URL)
    itemImageUris: string[]; // Array of selected wardrobe item image URIs
    itemDetails: VirtualTryOnItemDetail[]; // Item metadata for context (same order as itemImageUris)
    customInstructions?: string; // Custom prompt text
    useCleanBackground: boolean; // Background preference
}

/**
 * Response from virtual try-on generation
 */
export interface VirtualTryOnResponse {
    generatedImageUri: string; // Result image file URI
    mimeType: string; // Image MIME type
}

/**
 * Request to save virtual try-on result to backend
 */
export interface SaveVirtualTryOnRequest {
    full_body_image_uri: string;
    generated_image_uri: string;
    use_clean_background: boolean;
    custom_instructions: string | null;
    selected_items: {
        id: string | number;
        title: string;
        category: string;
        colors: string[];
        tags: string[];
    }[];
}

/**
 * Response from saving virtual try-on
 */
export interface SaveVirtualTryOnResponse {
    id: number;
    created_at: string;
    updated_at: string;
}

/**
 * Virtual try-on history item (response from GET /api/v1/virtual-try-on)
 */
export interface VirtualTryOnHistoryItem {
    id: number;
    full_body_image_uri: string;
    generated_image_uri: string;
    use_clean_background: boolean;
    custom_instructions: string | null;
    selected_items: {
        id: string | number;
        title: string;
        category: string;
        colors: string[];
        tags: string[];
    }[];
    created_at: string;
    updated_at: string;
}