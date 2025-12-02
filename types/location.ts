/**
 * Location-related types for proximity-based recommendations
 * 
 * Used for:
 * - Storing boutique addresses with geocoded coordinates
 * - Calculating distances between users and boutiques
 * - Filtering/sorting products by proximity
 */

/**
 * Geographic coordinates (latitude, longitude)
 */
export interface Coordinates {
    latitude: number;
    longitude: number;
}

/**
 * Address with optional geocoded coordinates
 */
export interface Address {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    fullAddress: string; // Full address string for display
    coordinates?: Coordinates; // Geocoded coordinates (lat/lng)
}

/**
 * Boutique location information
 */
export interface BoutiqueLocation {
    boutiqueId: string;
    boutiqueName: string;
    address: Address;
    distance?: number; // Distance in kilometers (calculated client-side)
}

/**
 * Product with boutique location information
 */
export interface ProductWithLocation {
    productId: string;
    productName: string;
    boutique: BoutiqueLocation;
    // ... other product fields
}

/**
 * Location filter options
 */
export interface LocationFilter {
    enabled: boolean;
    radiusKm: number; // Search radius in kilometers
    userLocation?: Coordinates; // User's current location
    sortByDistance?: boolean; // Sort results by distance
}

/**
 * Distance unit for display
 */
export type DistanceUnit = 'km' | 'mi';

/**
 * Formatted distance for display
 */
export interface FormattedDistance {
    value: number;
    unit: DistanceUnit;
    display: string; // e.g., "2.5 km" or "1.2 mi"
}

