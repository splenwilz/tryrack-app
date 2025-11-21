import { createMutationHook } from "../utils/query-helpers";
import { createProfile, updateProfile } from "./services";
import type { ProfileCompletionRequest, ProfileCompletionResponse } from "./types";

export const useCreateProfile = createMutationHook<ProfileCompletionRequest, ProfileCompletionResponse>(createProfile);
export const useUpdateProfile = createMutationHook<ProfileCompletionRequest, ProfileCompletionResponse>(updateProfile);