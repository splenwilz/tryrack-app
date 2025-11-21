import { apiClient } from "../client";
import type { ProfileCompletionRequest, ProfileCompletionResponse } from "./types";

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