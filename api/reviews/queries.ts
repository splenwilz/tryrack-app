import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createQueryHook } from "../utils/query-helpers";
import { queryKeys } from "../utils/query-keys";
import { createReview, updateReview, getReviews, likeReview, unlikeReview } from "./services";
import type { CreateReviewRequest, UpdateReviewRequest, GetReviewsOptions, ReviewResponse } from "./types";

/**
 * Hook to fetch reviews with optional filters
 * @param options - Query options for filtering and pagination
 * @returns Query result with reviews array
 */
export function useReviews(options: GetReviewsOptions & { enabled?: boolean }) {
    return createQueryHook<ReviewResponse[]>(
        queryKeys.reviews.list(options),
        () => getReviews(options),
        {
            enabled: options.enabled !== false,
            placeholderData: [],
        }
    )();
}

/**
 * Hook to create a new review
 * @returns Mutation hook for creating reviews
 */
export function useCreateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateReviewRequest) => createReview(request),
        onSuccess: (data) => {
            // Invalidate all reviews queries for the item to refresh the list
            queryClient.invalidateQueries({
                queryKey: queryKeys.reviews.list({
                    item_type: data.item_type,
                    item_id: data.item_id,
                }),
            });

            // Also invalidate all reviews queries to ensure consistency
            queryClient.invalidateQueries({
                queryKey: queryKeys.reviews.all(),
            });
        },
    });
}

/**
 * Hook to like a review
 * @returns Mutation hook for liking reviews
 */
export function useLikeReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reviewId: number) => likeReview(reviewId),
        onSuccess: (_, reviewId) => {
            // Invalidate all reviews queries to refresh like counts
            queryClient.invalidateQueries({
                queryKey: queryKeys.reviews.all(),
            });
        },
    });
}

/**
 * Hook to unlike a review
 * @returns Mutation hook for unliking reviews
 */
export function useUnlikeReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reviewId: number) => unlikeReview(reviewId),
        onSuccess: (_, reviewId) => {
            // Invalidate all reviews queries to refresh like counts
            queryClient.invalidateQueries({
                queryKey: queryKeys.reviews.all(),
            });
        },
    });
}

/**
 * Hook to update an existing review
 * @returns Mutation hook for updating reviews
 */
export function useUpdateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reviewId, request }: { reviewId: number; request: UpdateReviewRequest }) =>
            updateReview(reviewId, request),
        onSuccess: (data) => {
            // Invalidate all reviews queries for the item to refresh the list
            queryClient.invalidateQueries({
                queryKey: queryKeys.reviews.list({
                    item_type: data.item_type,
                    item_id: data.item_id,
                }),
            });

            // Also invalidate all reviews queries to ensure consistency
            queryClient.invalidateQueries({
                queryKey: queryKeys.reviews.all(),
            });
        },
    });
}

