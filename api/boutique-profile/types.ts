import { z } from 'zod';

/**
 * Boutique Profile API Types
 * 
 * Matches the backend BoutiqueProfile model
 * @see backend models for field definitions
 */

/**
 * Boutique Profile Request Schema
 * All fields are optional to support partial updates
 */
export const BoutiqueProfileRequestSchema = z.object({
    business_name: z.string().max(200).optional(),
    business_address: z.string().max(500).optional(),
    business_category: z.string().max(100).optional(),
    business_city: z.string().max(100).optional(),
    business_state: z.string().max(100).optional(),
    business_zip: z.string().max(20).optional(),
    business_country: z.string().max(100).optional(),
    business_phone: z.string().max(20).optional(),
    business_email: z.email().max(255).optional(),
    business_website: z.url().max(500).optional(),
    business_social_media: z.record(z.string(), z.string()).optional(),
    logo_url: z.url().max(500).optional(),
    cover_image_url: z.url().max(500).optional(),
    featured: z.boolean().optional(),
    currency: z.string().length(3).optional(),
    timezone: z.string().max(50).optional(),
    language: z.string().max(10).optional(),
});

/**
 * Boutique Profile Response Schema
 * Matches backend BoutiqueProfile model response
 */
export const BoutiqueProfileResponseSchema = z.object({
    id: z.number(),
    boutique_id: z.number(),
    business_name: z.string().nullable(),
    business_address: z.string().nullable(),
    business_category: z.string().nullable(),
    business_city: z.string().nullable(),
    business_state: z.string().nullable(),
    business_zip: z.string().nullable(),
    business_country: z.string().nullable(),
    business_phone: z.string().nullable(),
    business_email: z.string().nullable(),
    business_website: z.string().nullable(),
    business_social_media: z.record(z.string(), z.string()).nullable(),
    logo_url: z.string().nullable(),
    cover_image_url: z.string().nullable(),
    featured: z.boolean().nullable(),
    currency: z.string().nullable(),
    timezone: z.string().nullable(),
    language: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

/**
 * TypeScript types inferred from schemas
 */
export type BoutiqueProfileRequest = z.infer<typeof BoutiqueProfileRequestSchema>;
export type BoutiqueProfileResponse = z.infer<typeof BoutiqueProfileResponseSchema>;

