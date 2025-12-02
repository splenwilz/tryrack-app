import { createMutationHook, createQueryHook } from '../utils/query-helpers';
import { queryKeys } from '../utils/query-keys';
import { getBoutiqueProfile, createBoutiqueProfile, updateBoutiqueProfile } from './services';
import type { BoutiqueProfileRequest, BoutiqueProfileResponse } from './types';

/**
 * Hook to fetch current user's boutique profile
 * 
 * @returns React Query query object
 * @see https://tanstack.com/query/latest/docs/react/reference/useQuery
 */
export const useGetBoutiqueProfile = createQueryHook<BoutiqueProfileResponse | null>(
    queryKeys.boutiqueProfile.current(),
    getBoutiqueProfile,
    {
        retry: 1,
        // Use placeholder data to prevent blocking render
        placeholderData: null,
        // Don't refetch on mount if data exists
        refetchOnMount: false,
        // Don't throw error on 404 - profile might not exist yet
        throwOnError: false,
    }
);

/**
 * Hook to create boutique profile
 * 
 * @returns React Query mutation hook
 * @see https://tanstack.com/query/latest/docs/react/reference/useMutation
 */
export const useCreateBoutiqueProfile = createMutationHook<
    BoutiqueProfileRequest,
    BoutiqueProfileResponse
>(createBoutiqueProfile);

/**
 * Hook to update boutique profile
 * 
 * @returns React Query mutation hook
 * @see https://tanstack.com/query/latest/docs/react/reference/useMutation
 */
export const useUpdateBoutiqueProfile = createMutationHook<
    BoutiqueProfileRequest,
    BoutiqueProfileResponse
>(updateBoutiqueProfile);

