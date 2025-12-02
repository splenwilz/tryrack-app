import { apiClient, ApiError } from "../client";
import type { ProfileCompletionRequest, ProfileCompletionResponse } from "./types";


export const getProfile = async (): Promise<ProfileCompletionResponse | null> => {
    try {
        const response = await apiClient<ProfileCompletionResponse>("/api/v1/user/profile", {
            method: "GET",
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

export const createProfile = async (profile: ProfileCompletionRequest) => {
    const response = await apiClient<ProfileCompletionResponse>("/api/v1/user/profile", {
        method: "POST",
        body: JSON.stringify(profile),
    });
    return response;
};

export const updateProfile = async (profile: ProfileCompletionRequest) => {
    const response = await apiClient<ProfileCompletionResponse>("/api/v1/user/profile", {
        method: "PATCH",
        body: JSON.stringify(profile),
    });
    return response;
};