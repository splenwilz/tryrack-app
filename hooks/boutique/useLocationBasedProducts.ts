/**
 * Hook for location-based product recommendations
 * 
 * Filters and sorts products by proximity to user's location
 * 
 * Features:
 * - Get user location
 * - Filter products by boutique location within radius
 * - Sort products by distance
 * - Calculate distances for display
 */

import { useMemo } from 'react';
import { useLocation } from '@/hooks/use-location';
import { filterByDistance, sortByDistance, addDistanceToItems, formatDistance } from '@/utils/location';
import type { Coordinates, LocationFilter } from '@/types/location';
import type { CatalogProduct } from '@/types/boutique';

/**
 * Extended product type with boutique location information
 */
interface ProductWithBoutiqueLocation extends CatalogProduct {
    boutiqueLocation?: {
        boutiqueId: string;
        boutiqueName: string;
        address: string;
        coordinates?: Coordinates;
    };
}

interface UseLocationBasedProductsOptions {
    /**
     * Products to filter/sort
     */
    products: ProductWithBoutiqueLocation[];
    /**
     * Location filter configuration
     */
    locationFilter?: LocationFilter;
    /**
     * Whether to automatically request location
     */
    autoRequestLocation?: boolean;
}

interface UseLocationBasedProductsResult {
    /**
     * Filtered and sorted products with distance information
     */
    productsWithDistance: Array<ProductWithBoutiqueLocation & { distance?: number; formattedDistance?: string }>;
    /**
     * User's current location
     */
    userLocation: Coordinates | null;
    /**
     * Whether location is being fetched
     */
    isLocationLoading: boolean;
    /**
     * Location error message
     */
    locationError: string | null;
    /**
     * Whether location permission is granted
     */
    hasLocationPermission: boolean;
    /**
     * Request location permission
     */
    requestLocationPermission: () => Promise<boolean>;
    /**
     * Get current location
     */
    getCurrentLocation: () => Promise<Coordinates | null>;
    /**
     * Number of products within filter radius
     */
    productsInRadius: number;
    /**
     * Total number of products
     */
    totalProducts: number;
}

/**
 * Hook to filter and sort products by proximity to user location
 * 
 * @param options - Configuration options
 * @returns Filtered products with distance information
 * 
 * @example
 * ```tsx
 * const { productsWithDistance, requestLocationPermission } = useLocationBasedProducts({
 *   products: allProducts,
 *   locationFilter: {
 *     enabled: true,
 *     radiusKm: 10,
 *     sortByDistance: true
 *   },
 *   autoRequestLocation: true
 * });
 * ```
 */
export function useLocationBasedProducts(
    options: UseLocationBasedProductsOptions
): UseLocationBasedProductsResult {
    const { products, locationFilter, autoRequestLocation = false } = options;

    // Get user location
    const {
        location: userLocation,
        isLoading: isLocationLoading,
        error: locationError,
        hasPermission: hasLocationPermission,
        requestPermission: requestLocationPermission,
        getCurrentLocation,
    } = useLocation({
        autoRequest: autoRequestLocation,
    });

    // Process products with location filtering
    const productsWithDistance = useMemo(() => {
        if (!locationFilter?.enabled || !userLocation) {
            // Return products without distance if location filter is disabled or no location
            return products.map((product) => ({
                ...product,
                distance: undefined,
                formattedDistance: undefined,
            }));
        }

        // Filter products that have boutique location with coordinates
        const productsWithCoords = products.filter(
            (product) => product.boutiqueLocation?.coordinates
        );

        // Add distance to each product
        const productsWithDist = addDistanceToItems(
            productsWithCoords.map((product) => ({
                ...product,
                coordinates: product.boutiqueLocation?.coordinates,
            })),
            userLocation
        );

        // Filter by radius if specified
        let filtered = productsWithDist;
        if (locationFilter.radiusKm > 0) {
            filtered = filterByDistance(
                productsWithDist,
                userLocation,
                locationFilter.radiusKm
            );
        }

        // Sort by distance if enabled
        let sorted = filtered;
        if (locationFilter.sortByDistance) {
            sorted = sortByDistance(filtered, userLocation);
        }

        // Format distances for display
        return sorted.map((product) => {
            const formatted = product.distance !== undefined
                ? formatDistance(product.distance, 'km')
                : undefined;

            return {
                ...product,
                formattedDistance: formatted?.display,
            };
        });
    }, [products, locationFilter, userLocation]);

    // Calculate statistics
    const productsInRadius = useMemo(() => {
        if (!locationFilter?.enabled || !userLocation || locationFilter.radiusKm === 0) {
            return products.length;
        }
        return productsWithDistance.length;
    }, [products.length, productsWithDistance.length, locationFilter, userLocation]);

    return {
        productsWithDistance,
        userLocation,
        isLocationLoading,
        locationError,
        hasLocationPermission,
        requestLocationPermission,
        getCurrentLocation,
        productsInRadius,
        totalProducts: products.length,
    };
}

