import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createQueryHook, createMutationHook } from '../utils/query-helpers';
import { queryKeys } from '../utils/query-keys';
import {
    getBoutiqueLooks,
    getPublicLooks,
    getLook,
    createLook,
    updateLook,
    deleteLook,
    extractLookMetadataFromProducts,
} from './services';
import type {
    CreateLookRequest,
    UpdateLookRequest,
    LookResponse,
    ExtractLookMetadataRequest,
    LookMetadata,
} from './types';

/**
 * Get all looks for the current boutique
 */
export function useBoutiqueLooks(options?: {
    style?: string | null;
    is_featured?: boolean | null;
    skip?: number;
    limit?: number;
    enabled?: boolean;
}) {
    return useQuery({
        queryKey: queryKeys.looks.boutique({
            style: options?.style,
            is_featured: options?.is_featured,
            skip: options?.skip,
            limit: options?.limit,
        }),
        queryFn: () => getBoutiqueLooks({
            style: options?.style,
            is_featured: options?.is_featured,
            skip: options?.skip,
            limit: options?.limit,
        }),
        enabled: options?.enabled !== false,
        placeholderData: [],
        refetchOnMount: false,
    });
}

/**
 * Get public looks (for shop screen)
 */
export function usePublicLooks(options?: {
    style?: string;
    boutique_id?: string;
    featured_only?: boolean;
    enabled?: boolean;
}) {
    return useQuery({
        queryKey: queryKeys.looks.public({
            style: options?.style,
            boutique_id: options?.boutique_id,
            featured_only: options?.featured_only,
        }),
        queryFn: () => getPublicLooks({
            style: options?.style,
            boutique_id: options?.boutique_id,
            featured_only: options?.featured_only,
        }),
        enabled: options?.enabled !== false,
    });
}

/**
 * Get a single look by ID
 */
export function useLook(id: string | null, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.looks.detail(id || ''),
        queryFn: () => getLook(id!),
        enabled: !!id && (options?.enabled !== false),
    });
}

/**
 * Create a new look
 */
export function useCreateLook() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateLookRequest) => createLook(request),
        onSuccess: () => {
            // Invalidate all boutique looks queries (all filter variations)
            queryClient.invalidateQueries({
                queryKey: ['looks', 'boutique'],
                exact: false,
            });
            // Invalidate all public looks queries (all filter variations)
            queryClient.invalidateQueries({
                queryKey: ['looks', 'public'],
                exact: false,
            });
        },
    });
}

/**
 * Update an existing look
 */
export function useUpdateLook() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateLookRequest }) =>
            updateLook(id, data),
        onSuccess: (data) => {
            // Invalidate all boutique looks queries (all filter variations)
            queryClient.invalidateQueries({
                queryKey: ['looks', 'boutique'],
                exact: false,
            });
            // Invalidate all public looks queries (all filter variations)
            queryClient.invalidateQueries({
                queryKey: ['looks', 'public'],
                exact: false,
            });
            // Invalidate the specific look detail query
            queryClient.invalidateQueries({
                queryKey: queryKeys.looks.detail(String(data.id)),
            });
        },
    });
}

/**
 * Delete a look
 */
export function useDeleteLook() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteLook,
        onSuccess: () => {
            // Invalidate all boutique looks queries (all filter variations)
            queryClient.invalidateQueries({
                queryKey: ['looks', 'boutique'],
                exact: false,
            });
            // Invalidate all public looks queries (all filter variations)
            queryClient.invalidateQueries({
                queryKey: ['looks', 'public'],
                exact: false,
            });
        },
    });
}

/**
 * Extract look metadata from selected products
 */
export function useExtractLookMetadata() {
    return useMutation({
        mutationFn: (request: ExtractLookMetadataRequest) => extractLookMetadataFromProducts(request),
    });
}

