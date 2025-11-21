import { createMutationHook } from "../utils/query-helpers";
import { uploadImage } from "./services";
import type { UploadImageRequest } from "./types";

export const useUploadImage = createMutationHook<UploadImageRequest, string>(uploadImage);