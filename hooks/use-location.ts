/**
 * Hook for getting user's current location
 * 
 * Uses expo-location to:
 * - Request location permissions
 * - Get current location
 * - Handle errors gracefully
 * 
 * @see https://docs.expo.dev/versions/latest/sdk/location/ - Expo Location documentation
 */

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import type { Coordinates } from '@/types/location';

interface UseLocationOptions {
    /**
     * Whether to automatically request location on mount
     */
    autoRequest?: boolean;
    /**
     * Accuracy level for location requests
     */
    accuracy?: Location.Accuracy;
    /**
     * Maximum age of cached location in milliseconds
     */
    maxAge?: number;
}

interface UseLocationResult {
    /**
     * User's current location coordinates
     */
    location: Coordinates | null;
    /**
     * Whether location is currently being fetched
     */
    isLoading: boolean;
    /**
     * Error message if location fetch failed
     */
    error: string | null;
    /**
     * Whether location permissions are granted
     */
    hasPermission: boolean;
    /**
     * Request location permissions
     */
    requestPermission: () => Promise<boolean>;
    /**
     * Get current location
     */
    getCurrentLocation: () => Promise<Coordinates | null>;
    /**
     * Clear location data
     */
    clearLocation: () => void;
}

/**
 * Hook to get and manage user's current location
 * 
 * @param options - Configuration options
 * @returns Location state and methods
 * 
 * @example
 * ```tsx
 * const { location, isLoading, requestPermission, getCurrentLocation } = useLocation();
 * 
 * useEffect(() => {
 *   requestPermission().then((granted) => {
 *     if (granted) {
 *       getCurrentLocation();
 *     }
 *   });
 * }, []);
 * ```
 */
export function useLocation(options: UseLocationOptions = {}): UseLocationResult {
    const { autoRequest = false, accuracy = Location.Accuracy.Balanced } = options;

    const [location, setLocation] = useState<Coordinates | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState(false);

    /**
     * Check if location permissions are granted
     */
    const checkPermission = useCallback(async (): Promise<boolean> => {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            const granted = status === 'granted';
            setHasPermission(granted);
            return granted;
        } catch (err) {
            console.error('[Location] Error checking permission:', err);
            setError('Failed to check location permissions');
            return false;
        }
    }, []);

    /**
     * Request location permissions
     */
    const requestPermission = useCallback(async (): Promise<boolean> => {
        try {
            setError(null);

            // Check existing permission
            const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
            if (existingStatus === 'granted') {
                setHasPermission(true);
                return true;
            }

            // Request permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            const granted = status === 'granted';
            setHasPermission(granted);

            if (!granted) {
                setError('Location permission denied');
                Alert.alert(
                    'Location Permission Required',
                    'We need your location to show nearby boutiques and products. Please enable location access in your device settings.',
                    [{ text: 'OK' }]
                );
            }

            return granted;
        } catch (err) {
            console.error('[Location] Error requesting permission:', err);
            const message = err instanceof Error ? err.message : 'Failed to request location permission';
            setError(message);
            return false;
        }
    }, []);

    /**
     * Get current location
     */
    const getCurrentLocation = useCallback(async (): Promise<Coordinates | null> => {
        try {
            setIsLoading(true);
            setError(null);

            // Check permission first
            const hasPerm = await checkPermission();
            if (!hasPerm) {
                const granted = await requestPermission();
                if (!granted) {
                    setIsLoading(false);
                    return null;
                }
            }

            // Get current location
            const locationData = await Location.getCurrentPositionAsync({
                accuracy,
            });

            const coords: Coordinates = {
                latitude: locationData.coords.latitude,
                longitude: locationData.coords.longitude,
            };

            setLocation(coords);
            setIsLoading(false);
            return coords;
        } catch (err) {
            console.error('[Location] Error getting location:', err);
            const message = err instanceof Error ? err.message : 'Failed to get current location';
            setError(message);
            setIsLoading(false);

            Alert.alert(
                'Location Error',
                'Unable to get your current location. Please check your device settings and try again.',
                [{ text: 'OK' }]
            );

            return null;
        }
    }, [accuracy, checkPermission, requestPermission]);

    /**
     * Clear location data
     */
    const clearLocation = useCallback(() => {
        setLocation(null);
        setError(null);
    }, []);

    // Auto-request location on mount if enabled
    useEffect(() => {
        if (autoRequest) {
            requestPermission().then((granted) => {
                if (granted) {
                    getCurrentLocation();
                }
            });
        }
    }, [autoRequest, requestPermission, getCurrentLocation]);

    // Check permission on mount
    useEffect(() => {
        checkPermission();
    }, [checkPermission]);

    return {
        location,
        isLoading,
        error,
        hasPermission,
        requestPermission,
        getCurrentLocation,
        clearLocation,
    };
}

