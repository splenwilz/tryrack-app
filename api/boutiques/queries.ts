import { createQueryHook } from '../utils/query-helpers';
import { queryKeys } from '../utils/query-keys';
import {
    getBoutiques,
    getBoutiqueById,
    getBoutiqueItems,
    getBoutiqueLooks,
} from './services';
import type {
    BoutiqueResponse,
    BoutiquesResponse,
    BoutiqueItemsResponse,
    BoutiqueLooksResponse,
    GetBoutiquesOptions,
    GetBoutiqueItemsOptions,
    GetBoutiqueLooksOptions,
} from './types';

/**
 * Hook to fetch list of all boutiques
 * 
 * @param options - Optional filtering and pagination options
 * @returns Query result with array of boutiques
 */
export function useBoutiques(options?: GetBoutiquesOptions & { enabled?: boolean }) {
    const { enabled, ...filterOptions } = options || {};

    return createQueryHook<BoutiquesResponse>(
        queryKeys.boutiques.list(filterOptions),
        () => getBoutiques(filterOptions),
        {
            enabled: enabled !== false,
            placeholderData: [],
        }
    )();
}

/**
 * Hook to fetch boutique profile by boutique ID
 * 
 * @param boutiqueId - Boutique ID
 * @param options - Optional query options
 * @returns Query result with boutique profile
 */
export function useBoutique(
    boutiqueId: number | string | null | undefined,
    options?: { enabled?: boolean }
) {
    return createQueryHook<BoutiqueResponse>(
        queryKeys.boutiques.byId(boutiqueId ?? ''),
        () => {
            if (!boutiqueId) {
                throw new Error('Boutique ID is required');
            }
            return getBoutiqueById(boutiqueId);
        },
        {
            enabled: options?.enabled !== false && !!boutiqueId,
            placeholderData: undefined,
        }
    )();
}

/**
 * Hook to fetch boutique items/products
 * 
 * @param boutiqueId - Boutique ID
 * @param options - Optional filtering and pagination options
 * @returns Query result with boutique items
 */
export function useBoutiqueItems(
    boutiqueId: number | string | null | undefined,
    options?: GetBoutiqueItemsOptions & { enabled?: boolean }
) {
    const { enabled, ...filterOptions } = options || {};

    return createQueryHook<BoutiqueItemsResponse>(
        queryKeys.boutiques.items(boutiqueId ?? '', filterOptions),
        () => {
            if (!boutiqueId) {
                throw new Error('Boutique ID is required');
            }
            return getBoutiqueItems(boutiqueId, filterOptions);
        },
        {
            enabled: enabled !== false && !!boutiqueId,
            placeholderData: [],
        }
    )();
}

/**
 * Hook to fetch boutique looks
 * 
 * @param boutiqueId - Boutique ID
 * @param options - Optional filtering and pagination options
 * @returns Query result with boutique looks
 */
export function useBoutiqueLooks(
    boutiqueId: number | string | null | undefined,
    options?: GetBoutiqueLooksOptions & { enabled?: boolean }
) {
    const { enabled, ...filterOptions } = options || {};

    return createQueryHook<BoutiqueLooksResponse>(
        queryKeys.boutiques.looks(boutiqueId ?? '', filterOptions),
        () => {
            if (!boutiqueId) {
                throw new Error('Boutique ID is required');
            }
            return getBoutiqueLooks(boutiqueId, filterOptions);
        },
        {
            enabled: enabled !== false && !!boutiqueId,
            placeholderData: [],
        }
    )();
}

