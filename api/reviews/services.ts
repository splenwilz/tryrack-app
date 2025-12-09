import { apiClient } from "../client";
import type { CreateReviewRequest, UpdateReviewRequest, ReviewResponse, GetReviewsOptions, LikeReviewResponse } from "./types";

/**
 * Create a new review
 * @param request - Review data to create
 * @returns Created review response
 */
export async function createReview(request: CreateReviewRequest): Promise<ReviewResponse> {
    const response = await apiClient<ReviewResponse>("/api/v1/reviews", {
        method: "POST",
        body: JSON.stringify(request),
    });
    return response;
}

/**
 * Get reviews with optional filters
 * @param options - Query options for filtering and pagination
 * @returns Array of review responses
 */
export async function getReviews(options: GetReviewsOptions): Promise<ReviewResponse[]> {
    const params = new URLSearchParams();

    params.append("item_type", options.item_type);
    params.append("item_id", options.item_id);

    if (options.user_id != null && options.user_id !== "") {
        params.append("user_id", options.user_id);
    }

    // Include unapproved reviews (defaults to false)
    if (options.include_unapproved === true) {
        params.append("include_unapproved", "true");
    }

    if (options.skip != null) {
        params.append("skip", String(options.skip));
    }

    if (options.limit != null) {
        params.append("limit", String(options.limit));
    }

    const queryString = params.toString();
    const url = `/api/v1/reviews${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient<ReviewResponse[]>(url, {
        method: "GET",
    });

    return response;
}

/**
 * Like a review
 * @param reviewId - Review ID to like
 * @returns Like response with status
 */
export async function likeReview(reviewId: number): Promise<LikeReviewResponse> {
    const response = await apiClient<LikeReviewResponse>(`/api/v1/reviews/${reviewId}/like`, {
        method: "POST",
    });
    return response;
}

/**
 * Unlike a review (remove like)
 * @param reviewId - Review ID to unlike
 * @returns Unlike response with status
 */
export async function unlikeReview(reviewId: number): Promise<LikeReviewResponse> {
    const response = await apiClient<LikeReviewResponse>(`/api/v1/reviews/${reviewId}/like`, {
        method: "DELETE",
    });
    return response;
}

/**
 * Update an existing review
 * @param reviewId - Review ID to update
 * @param request - Review data to update
 * @returns Updated review response
 */
export async function updateReview(reviewId: number, request: UpdateReviewRequest): Promise<ReviewResponse> {
    const response = await apiClient<ReviewResponse>(`/api/v1/reviews/${reviewId}`, {
        method: "PATCH",
        body: JSON.stringify(request),
    });
    return response;
}

