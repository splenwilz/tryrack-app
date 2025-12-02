import { apiClient, ApiError } from '../client';
import type { BoutiqueProfileRequest, BoutiqueProfileResponse } from './types';

/**
 * Get current user's boutique profile
 * 
 * @returns Boutique profile or null if not found
 */
export const getBoutiqueProfile = async (): Promise<BoutiqueProfileResponse | null> => {
    try {
        const response = await apiClient<BoutiqueProfileResponse>('/api/v1/user/boutique-profile', {
            method: 'GET',
        });
        return response;
    } catch (error) {
        // If profile doesn't exist (404), return null instead of throwing
        if (error instanceof ApiError && error.status === 404) {
            return null;
        }
        throw error;
    }
};

/**
 * Create boutique profile
 * 
 * @param profile - Boutique profile data
 * @returns Created boutique profile
 */
export const createBoutiqueProfile = async (
    profile: BoutiqueProfileRequest
): Promise<BoutiqueProfileResponse> => {
    const response = await apiClient<BoutiqueProfileResponse>('/api/v1/user/boutique-profile', {
        method: 'POST',
        body: JSON.stringify(profile),
    });
    return response;
};

/**
 * Update boutique profile
 * 
 * @param profile - Partial boutique profile data to update
 * @returns Updated boutique profile
 */
export const updateBoutiqueProfile = async (
    profile: BoutiqueProfileRequest
): Promise<BoutiqueProfileResponse> => {
    const response = await apiClient<BoutiqueProfileResponse>('/api/v1/user/boutique-profile', {
        method: 'PATCH',
        body: JSON.stringify(profile),
    });
    return response;
};

