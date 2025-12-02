/**
 * Location utility functions
 * 
 * Provides functions for:
 * - Distance calculations (Haversine formula)
 * - Coordinate validation
 * - Distance formatting
 * - Address parsing
 * 
 * @see https://en.wikipedia.org/wiki/Haversine_formula - Haversine formula for distance calculation
 */

import type { Coordinates, DistanceUnit, FormattedDistance } from '@/types/location';

/**
 * Earth's radius in kilometers
 */
const EARTH_RADIUS_KM = 6371;

/**
 * Earth's radius in miles
 */
const EARTH_RADIUS_MI = 3959;

/**
 * Calculate distance between two coordinates using Haversine formula
 * 
 * @param coord1 - First coordinate (latitude, longitude)
 * @param coord2 - Second coordinate (latitude, longitude)
 * @param unit - Distance unit ('km' or 'mi')
 * @returns Distance in specified unit
 * 
 * @example
 * ```ts
 * const distance = calculateDistance(
 *   { latitude: 6.5244, longitude: 3.3792 }, // Lagos
 *   { latitude: 6.4474, longitude: 3.3903 }, // Ikeja
 *   'km'
 * );
 * // Returns: ~8.7 km
 * ```
 */
export function calculateDistance(
    coord1: Coordinates,
    coord2: Coordinates,
    unit: DistanceUnit = 'km'
): number {
    // Validate coordinates
    if (!isValidCoordinate(coord1) || !isValidCoordinate(coord2)) {
        throw new Error('Invalid coordinates provided');
    }

    const radius = unit === 'km' ? EARTH_RADIUS_KM : EARTH_RADIUS_MI;

    // Convert degrees to radians
    const lat1Rad = toRadians(coord1.latitude);
    const lat2Rad = toRadians(coord2.latitude);
    const deltaLatRad = toRadians(coord2.latitude - coord1.latitude);
    const deltaLonRad = toRadians(coord2.longitude - coord1.longitude);

    // Haversine formula
    const a =
        Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
        Math.cos(lat1Rad) *
            Math.cos(lat2Rad) *
            Math.sin(deltaLonRad / 2) *
            Math.sin(deltaLonRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = radius * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Validate coordinate values
 * 
 * @param coord - Coordinate to validate
 * @returns true if coordinate is valid
 */
export function isValidCoordinate(coord: Coordinates): boolean {
    return (
        typeof coord.latitude === 'number' &&
        typeof coord.longitude === 'number' &&
        coord.latitude >= -90 &&
        coord.latitude <= 90 &&
        coord.longitude >= -180 &&
        coord.longitude <= 180
    );
}

/**
 * Format distance for display
 * 
 * @param distanceKm - Distance in kilometers
 * @param unit - Display unit ('km' or 'mi')
 * @param precision - Number of decimal places (default: 1)
 * @returns Formatted distance object
 * 
 * @example
 * ```ts
 * formatDistance(2.5, 'km') // { value: 2.5, unit: 'km', display: '2.5 km' }
 * formatDistance(1.6, 'mi') // { value: 1.6, unit: 'mi', display: '1.6 mi' }
 * ```
 */
export function formatDistance(
    distanceKm: number,
    unit: DistanceUnit = 'km',
    precision: number = 1
): FormattedDistance {
    let value: number;
    let display: string;

    if (unit === 'mi') {
        // Convert km to miles
        value = distanceKm * 0.621371;
        display = `${value.toFixed(precision)} mi`;
    } else {
        value = distanceKm;
        if (value < 1) {
            // Show in meters for distances < 1km
            const meters = Math.round(value * 1000);
            display = `${meters} m`;
        } else {
            display = `${value.toFixed(precision)} km`;
        }
    }

    return {
        value,
        unit,
        display,
    };
}

/**
 * Filter items by distance from user location
 * 
 * @param items - Array of items with coordinates
 * @param userLocation - User's current location
 * @param radiusKm - Maximum distance in kilometers
 * @returns Filtered items within radius
 */
export function filterByDistance<T extends { coordinates?: Coordinates }>(
    items: T[],
    userLocation: Coordinates,
    radiusKm: number
): T[] {
    return items.filter((item) => {
        if (!item.coordinates) return false;
        const distance = calculateDistance(userLocation, item.coordinates, 'km');
        return distance <= radiusKm;
    });
}

/**
 * Sort items by distance from user location
 * 
 * @param items - Array of items with coordinates
 * @param userLocation - User's current location
 * @returns Sorted items (closest first)
 */
export function sortByDistance<T extends { coordinates?: Coordinates }>(
    items: T[],
    userLocation: Coordinates
): T[] {
    return [...items].sort((a, b) => {
        if (!a.coordinates) return 1;
        if (!b.coordinates) return -1;

        const distanceA = calculateDistance(userLocation, a.coordinates, 'km');
        const distanceB = calculateDistance(userLocation, b.coordinates, 'km');

        return distanceA - distanceB;
    });
}

/**
 * Add distance to items from user location
 * 
 * @param items - Array of items with coordinates
 * @param userLocation - User's current location
 * @returns Items with distance property added
 */
export function addDistanceToItems<T extends { coordinates?: Coordinates }>(
    items: T[],
    userLocation: Coordinates
): Array<T & { distance: number }> {
    return items.map((item) => {
        if (!item.coordinates) {
            return { ...item, distance: Infinity };
        }
        const distance = calculateDistance(userLocation, item.coordinates, 'km');
        return { ...item, distance };
    });
}

