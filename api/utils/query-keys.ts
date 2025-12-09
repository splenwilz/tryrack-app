/**
 * Query keys factory for type-safe query key management
 * 
 * Centralizes all query keys to prevent typos and ensure consistency.
 * Follows React Query v5 best practices for query key structure.
 * 
 * @see https://tanstack.com/query/latest/docs/react/guides/query-keys
 * 
 * @example
 * ```ts
 * // In a query hook:
 * useQuery({
 *   queryKey: queryKeys.auth.user(),
 *   queryFn: () => fetchUser(),
 * })
 * 
 * // In a mutation to invalidate:
 * queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() })
 * ```
 */
export const queryKeys = {
  /**
   * Authentication-related query keys
   */
  auth: {
    /**
     * Get current authenticated user
     */
    user: () => ['auth', 'user'] as const,

    /**
     * Get user by ID
     */
    userById: (userId: string) => ['auth', 'user', userId] as const,
  },

  /**
   * Wardrobe-related query keys
   */
  wardrobe: {
    /**
     * All wardrobe queries
     */
    all: () => ['wardrobe'] as const,

    /**
     * Wardrobe items list with optional filters
     */
    items: (options?: { category?: string | null; status?: string | null; skip?: number; limit?: number }) =>
      ['wardrobe', 'items', options] as const,

    /**
     * Wardrobe item by ID
     */
    itemById: (itemId: string) => ['wardrobe', 'items', itemId] as const,
  },

  /**
   * Profile-related query keys
   */
  profile: {
    /**
     * Get current user's profile
     */
    current: () => ['profile', 'current'] as const,
  },

  /**
   * Virtual try-on related query keys
   */
  virtualTryOn: {
    /**
     * All virtual try-on queries
     */
    all: () => ['virtual-try-on'] as const,

    /**
     * Virtual try-on history list
     */
    history: () => ['virtual-try-on', 'history'] as const,

    /**
     * Virtual try-on by ID
     */
    byId: (id: number) => ['virtual-try-on', id] as const,
  },

  /**
   * Catalog-related query keys
   */
  catalog: {
    /**
     * All catalog queries
     */
    all: () => ['catalog'] as const,

    /**
     * Catalog products list with optional filters
     */
    products: (options?: { category?: string | null; brand?: string | null; status?: string | null; boutique_id?: number | null; skip?: number; limit?: number }) =>
      ['catalog', 'products', options] as const,

    /**
     * Catalog product by ID
     */
    productById: (productId: string) => ['catalog', 'products', productId] as const,
  },

  /**
   * Boutique Profile-related query keys
   */
  boutiqueProfile: {
    /**
     * Get current user's boutique profile
     */
    current: () => ['boutique-profile', 'current'] as const,
  },

  /**
   * Boutiques-related query keys (boutique-centric endpoints)
   */
  boutiques: {
    /**
     * All boutique queries
     */
    all: () => ['boutiques'] as const,

    /**
     * Boutiques list with optional filters
     */
    list: (options?: { featured?: boolean | null; latitude?: number | null; longitude?: number | null; radius_miles?: number | null; skip?: number; limit?: number }) =>
      ['boutiques', 'list', options] as const,

    /**
     * Boutique by ID
     */
    byId: (boutiqueId: string | number) => ['boutiques', boutiqueId] as const,

    /**
     * Boutique items/products with optional filters
     */
    items: (boutiqueId: string | number, options?: { category?: string | null; brand?: string | null; status?: string | null; skip?: number; limit?: number }) =>
      ['boutiques', boutiqueId, 'items', options] as const,

    /**
     * Boutique looks with optional filters
     */
    looks: (boutiqueId: string | number, options?: { style?: string | null; is_featured?: boolean | null; skip?: number; limit?: number }) =>
      ['boutiques', boutiqueId, 'looks', options] as const,
  },

  /**
   * Looks/Outfits-related query keys
   */
  looks: {
    /**
     * All looks queries
     */
    all: () => ['looks'] as const,

    /**
     * Looks for current boutique
     */
    boutique: (filters?: { style?: string | null; is_featured?: boolean | null; skip?: number; limit?: number }) => ['looks', 'boutique', filters] as const,

    /**
     * Public looks (for shop screen)
     */
    public: (filters?: { style?: string; boutique_id?: string; featured_only?: boolean }) =>
      ['looks', 'public', filters] as const,

    /**
     * Look by ID
     */
    detail: (id: string) => ['looks', 'detail', id] as const,
  },

  /**
   * Shop-related query keys
   */
  shop: {
    /**
     * All shop queries
     */
    all: () => ['shop'] as const,

    /**
     * Shop products list with optional filters (category, location, radius)
     */
    products: (options?: { category?: string | null; radius_miles?: number | null; latitude?: number | null; longitude?: number | null; limit?: number | null }) =>
      ['shop', 'products', options] as const,
  },

  /**
   * Reviews-related query keys
   */
  reviews: {
    /**
     * All reviews queries
     */
    all: () => ['reviews'] as const,

    /**
     * Reviews list with optional filters (item_type, item_id, user_id, pagination)
     */
    list: (options: { item_type: 'product' | 'boutique'; item_id: string; user_id?: string | null; skip?: number; limit?: number }) =>
      ['reviews', 'list', options] as const,
  },
} as const;

