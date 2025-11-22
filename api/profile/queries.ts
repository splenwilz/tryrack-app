import { createMutationHook, createQueryHook } from "../utils/query-helpers";
import { queryKeys } from "../utils/query-keys";
import { getProfile, createProfile, updateProfile } from "./services";
import type { ProfileCompletionRequest, ProfileCompletionResponse } from "./types";

/**
 * Hook to fetch current user's profile
 * 
 * @returns React Query query object and queryClient for cache management
 * @see https://tanstack.com/query/latest/docs/react/reference/useQuery
 */
export const useGetProfile = createQueryHook<ProfileCompletionResponse | null>(
    queryKeys.profile.current(),
    getProfile,
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

export const useCreateProfile = createMutationHook<ProfileCompletionRequest, ProfileCompletionResponse>(createProfile);
export const useUpdateProfile = createMutationHook<ProfileCompletionRequest, ProfileCompletionResponse>(updateProfile);