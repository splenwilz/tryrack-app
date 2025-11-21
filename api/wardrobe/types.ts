import { z } from "zod";

/**
 * Wardrobe item metadata extracted from image
 */
export const WardrobeMetadataSchema = z.object({
    title: z.string().max(50),
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


// {
//     "title": "Vintage Denim Jacket",
//     "category": "Outerwear",
//     "colors": [
//       "Blue", "Faded Indigo"
//     ],
//     "image_url": "https://example.com/images/denim_jacket_7421.jpg",
//     "tags": ["casual", "streetwear", "layering"],
//     "status": "clean"
//   }

export const CreateWardrobeItemRequestSchema = z.object({
    title: z.string().max(30),
    category: z.string(),
    colors: z.array(z.string()),
    tags: z.array(z.string()),
    image_url: z.string(),
    status: z.enum(["clean", "dirty", "worn"]).default("clean"),
});

export const WardrobeItemResponseSchema = CreateWardrobeItemRequestSchema.extend({
    id: z.number(),
    user_id: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type CreateWardrobeItemRequest = z.infer<typeof CreateWardrobeItemRequestSchema>;
export type WardrobeItemResponse = z.infer<typeof WardrobeItemResponseSchema>;