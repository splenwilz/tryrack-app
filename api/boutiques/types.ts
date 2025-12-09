import { z } from 'zod';
import { BoutiqueProfileResponseSchema } from '../boutique-profile/types';
import { CatalogProductResponseSchema } from '../catalog/types';
import { LookResponseSchema } from '../looks/types';

/**
 * Boutique API Types
 * 
 * Types for boutique-centric endpoints
 * @see API documentation for endpoint details
 */

/**
 * Boutique Response Schema
 * Extends BoutiqueProfileResponse with additional public-facing fields
 * 
 * Backend now provides all these fields in GET /api/v1/boutiques/{boutique_id}:
 * - rating: Average rating from reviews (0-5 scale, can be null)
 * - review_count: Total number of reviews
 * - product_count: Total number of products in boutique
 * - featured: Whether boutique is featured
 * - cover_image_url: Boutique cover/hero image
 * - distance_miles: Distance from user's location (optional, computed on-the-fly when latitude/longitude provided)
 */
export const BoutiqueResponseSchema = BoutiqueProfileResponseSchema.extend({
    rating: z.number().min(0).max(5).nullable().optional(),
    review_count: z.number().int().min(0).optional(),
    product_count: z.number().int().min(0).optional(),
    distance_miles: z.number().optional().nullable(),
    // cover_image_url and featured are already in BoutiqueProfileResponseSchema
});

/**
 * Boutique Items Response
 * Array of catalog products from a specific boutique
 */
export const BoutiqueItemsResponseSchema = z.array(CatalogProductResponseSchema);

/**
 * Boutique Looks Response
 * Array of looks from a specific boutique
 */
export const BoutiqueLooksResponseSchema = z.array(LookResponseSchema);

/**
 * Boutiques List Response
 * Array of boutique profiles with additional fields
 */
export const BoutiquesResponseSchema = z.array(BoutiqueResponseSchema);

/**
 * TypeScript types inferred from schemas
 */
export type BoutiqueResponse = z.infer<typeof BoutiqueResponseSchema>;
export type BoutiqueItemsResponse = z.infer<typeof BoutiqueItemsResponseSchema>;
export type BoutiqueLooksResponse = z.infer<typeof BoutiqueLooksResponseSchema>;
export type BoutiquesResponse = z.infer<typeof BoutiquesResponseSchema>;

/**
 * Options for filtering boutique items
 */
export interface GetBoutiqueItemsOptions {
    category?: string | null;
    brand?: string | null;
    status?: string | null;
    skip?: number;
    limit?: number;
}

/**
 * Options for filtering boutique looks
 */
export interface GetBoutiqueLooksOptions {
    style?: string | null;
    is_featured?: boolean | null;
    skip?: number;
    limit?: number;
}

/**
 * Options for filtering and querying boutiques list
 */
export interface GetBoutiquesOptions {
    featured?: boolean | null;
    latitude?: number | null;
    longitude?: number | null;
    radius_miles?: number | null;
    skip?: number;
    limit?: number;
}