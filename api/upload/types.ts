import { z } from "zod";

/**
 * Internal FormData file object for React Native
 * Used internally when constructing FormData
 */
export interface FormDataFile {
    uri: string;
    type: string;
    name: string;
}

/**
 * Presigned URL request parameters
 */
export interface PresignedUrlRequest {
    folder: string;
    file_extension: string;
    expiration?: number; // Default 3600 seconds (1 hour)
}

/**
 * Presigned URL response from backend
 */
export const PresignedUrlResponseSchema = z.object({
    url: z.string(), // Presigned URL for PUT upload
    key: z.string(), // S3 key/path
    public_url: z.string(), // Public URL to access the file
    expires_in: z.number(), // Expiration time in seconds
});

export type PresignedUrlResponse = z.infer<typeof PresignedUrlResponseSchema>;

/**
 * Backend upload response (legacy - for direct backend upload)
 */
export const UploadResponseSchema = z.object({
    url: z.string(),
    message: z.string(),
});

export type UploadResponse = z.infer<typeof UploadResponseSchema>;

/**
 * Request type for uploadImage function
 */
export interface UploadImageRequest {
    imageUri: string;
    folder?: string;
}