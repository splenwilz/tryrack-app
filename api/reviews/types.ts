import { z } from "zod";

/**
 * Review metadata schema
 * Flexible object for additional review data
 */
export const ReviewMetadataSchema = z.record(z.string(), z.unknown()).nullable().optional();

/**
 * User object schema (nested in review response)
 */
export const ReviewUserSchema = z.object({
    object: z.literal("user"),
    id: z.string(),
    email: z.string(),
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
    email_verified: z.boolean(),
    profile_picture_url: z.string().url().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

/**
 * Review request schema for creating a review
 * Matches backend API expectations
 */
export const CreateReviewRequestSchema = z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(1),
    images: z.array(z.string().url()).default([]),
    review_metadata: ReviewMetadataSchema,
    item_type: z.enum(["product", "boutique"]),
    item_id: z.string(),
});

/**
 * Review request schema for updating a review
 * Similar to CreateReviewRequest but all fields are optional
 */
export const UpdateReviewRequestSchema = z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().min(1).optional(),
    images: z.array(z.string().url()).optional(),
    review_metadata: ReviewMetadataSchema,
});

/**
 * Review response schema from backend
 */
export const ReviewResponseSchema = CreateReviewRequestSchema.omit({ images: true }).extend({
    id: z.number(),
    user_id: z.string(),
    is_approved: z.boolean(),
    is_verified: z.boolean(),
    verification_type: z.string().nullable(), // e.g., "email", "purchase", "tryon"
    verification_level: z.number().int().min(0).max(5), // 0-5 verification level
    like_count: z.number().int().min(0),
    user_has_liked: z.boolean(),
    user: ReviewUserSchema,
    images: z.array(z.string().url()).nullable(), // Can be null or array
    created_at: z.string(),
    updated_at: z.string(),
});

/**
 * Like review response schema
 */
export const LikeReviewResponseSchema = z.object({
    message: z.string(),
    liked: z.boolean(),
});

/**
 * Options for querying reviews
 */
export interface GetReviewsOptions {
    item_type: "product" | "boutique";
    item_id: string;
    user_id?: string | null;
    include_unapproved?: boolean; // Defaults to false
    skip?: number;
    limit?: number;
}

export type CreateReviewRequest = z.infer<typeof CreateReviewRequestSchema>;
export type UpdateReviewRequest = z.infer<typeof UpdateReviewRequestSchema>;
export type ReviewResponse = z.infer<typeof ReviewResponseSchema>;
export type ReviewMetadata = z.infer<typeof ReviewMetadataSchema>;
export type ReviewUser = z.infer<typeof ReviewUserSchema>;
export type LikeReviewResponse = z.infer<typeof LikeReviewResponseSchema>;

