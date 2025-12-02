import { apiClient, ApiError } from '../client';
import * as ImageManipulator from 'expo-image-manipulator';
import type { PresignedUrlRequest, PresignedUrlResponse } from './types';

/**
 * FormData file object for React Native
 * React Native FormData requires uri, type, and name properties
 * @see https://reactnative.dev/docs/network#using-fetch
 */


/**
 * Get presigned URL from backend for direct S3 upload
 * This is faster than uploading through the backend
 * 
 * @param request - Presigned URL request parameters
 * @returns Promise resolving to presigned URL response
 */
async function getPresignedUrl(
    request: PresignedUrlRequest
): Promise<PresignedUrlResponse> {
    const presignedStartTime = Date.now();

    // Backend expects form-urlencoded data
    const params = new URLSearchParams({
        folder: request.folder,
        file_extension: request.file_extension,
        expiration: String(request.expiration || 3600),
    });

    const response = await apiClient<PresignedUrlResponse>('/api/v1/images/presigned-url', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });

    const presignedDuration = Date.now() - presignedStartTime;
    console.log(`[Upload] Presigned URL obtained in ${presignedDuration}ms`);

    return response;
}

/**
 * Extract content-type from presigned URL query parameters
 * S3 presigned URLs include the content-type in the query string
 * We must use the exact same content-type in the PUT request headers
 * 
 * @param presignedUrl - Presigned URL with content-type in query params
 * @returns Content-type string (e.g., 'image/jpg' or 'image/jpeg')
 */
function extractContentTypeFromPresignedUrl(presignedUrl: string): string {
    try {
        const url = new URL(presignedUrl);
        const contentTypeParam = url.searchParams.get('content-type');
        if (contentTypeParam) {
            // Decode URL-encoded content-type (e.g., 'image%2Fjpg' -> 'image/jpg')
            return decodeURIComponent(contentTypeParam);
        }
    } catch (error) {
        console.warn('[Upload] Failed to extract content-type from presigned URL:', error);
    }
    // Fallback to default if extraction fails
    return 'image/jpeg';
}

/**
 * Upload image directly to S3 using presigned URL
 * This bypasses the backend and uploads directly to S3, significantly faster
 * 
 * @param imageUri - Local file URI (e.g., file:///path/to/image.jpg)
 * @param presignedUrl - Presigned URL from backend (must include content-type in query params)
 * @param fallbackContentType - Fallback MIME type if not found in presigned URL
 * @returns Promise resolving when upload completes
 * 
 * @see https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html
 * @see https://reactnative.dev/docs/network#using-fetch - React Native fetch API
 */
async function uploadToS3(
    imageUri: string,
    presignedUrl: string,
    _fallbackContentType: string // Unused - we extract from presigned URL
): Promise<void> {
    const s3UploadStartTime = Date.now();

    // Extract the exact content-type from the presigned URL
    // S3 signature validation requires exact match with what was used to generate the URL
    const contentType = extractContentTypeFromPresignedUrl(presignedUrl);
    console.log(`[Upload] Using content-type from presigned URL: ${contentType}`);

    // For React Native, we need to read the file and send it as a blob
    // React Native fetch doesn't support file URIs directly in PUT body
    const fileResponse = await fetch(imageUri);
    const blob = await fileResponse.blob();

    // Upload directly to S3 using PUT with presigned URL
    // CRITICAL: Content-Type header must match exactly what's in the presigned URL query params
    // Otherwise S3 will reject with SignatureDoesNotMatch error
    const s3Response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': contentType, // Must match presigned URL's content-type param exactly
        },
        body: blob,
    });

    if (!s3Response.ok) {
        const errorText = await s3Response.text();
        console.error('[Upload] S3 upload error response:', errorText);
        throw new ApiError(
            s3Response.status,
            `S3 upload failed: ${errorText || s3Response.statusText}`
        );
    }

    const s3UploadDuration = Date.now() - s3UploadStartTime;
    console.log(`[Upload] S3 direct upload completed in ${s3UploadDuration}ms`);
}

/**
 * Upload an image file using presigned URL for direct S3 upload
 * This is significantly faster than uploading through the backend
 * 
 * @param data - Upload request data
 * @param data.imageUri - Local file URI (e.g., file:///path/to/image.jpg)
 * @param data.folder - S3 folder/path prefix (e.g., 'images', 'profile', 'wardrobe'). Defaults to 'images'
 * @returns Promise resolving to the public URL of the uploaded image
 * 
 * @see https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html - S3 presigned URLs
 * @see https://docs.expo.dev/versions/latest/sdk/imagemanipulator/ - Image compression
 */
export async function uploadImage(
    data: { imageUri: string; folder?: string }
): Promise<string> {
    const { imageUri, folder = 'images' } = data;
    const uploadStartTime = Date.now();

    try {
        // If already a URL (not local file), return as-is
        if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
            console.log('[Upload] Image already uploaded, skipping:', imageUri);
            return imageUri;
        }

        // Step 1: Compress and optimize image before upload
        console.log('[Upload] Starting image compression...');
        const compressionStartTime = Date.now();

        const manipulatedImage = await ImageManipulator.manipulateAsync(
            imageUri,
            [], // No transformations, just compression
            {
                compress: 0.7, // 70% quality - good balance between size and quality
                format: ImageManipulator.SaveFormat.JPEG, // JPEG is smaller than PNG
            }
        );

        const compressionDuration = Date.now() - compressionStartTime;
        console.log(`[Upload] Image compression completed in ${compressionDuration}ms`);

        const optimizedUri = manipulatedImage.uri;
        const mimeType = 'image/jpeg'; // Always JPEG after manipulation

        // Step 2: Get presigned URL from backend (fast API call)
        const presignedStartTime = Date.now();
        const presignedResponse = await getPresignedUrl({
            folder,
            file_extension: 'jpg',
            expiration: 3600, // 1 hour
        });
        const presignedDuration = Date.now() - presignedStartTime;

        // Step 3: Upload directly to S3 using presigned URL (bypasses backend)
        // Note: We pass mimeType as fallback, but uploadToS3 will extract the exact
        // content-type from the presigned URL to match S3 signature requirements
        const s3UploadStartTime = Date.now();
        await uploadToS3(optimizedUri, presignedResponse.url, mimeType);
        const s3UploadDuration = Date.now() - s3UploadStartTime;

        const totalDuration = Date.now() - uploadStartTime;

        console.log(`[Upload] Total upload time breakdown:`, {
            compression: `${compressionDuration}ms`,
            presignedUrl: `${presignedDuration}ms`,
            s3Upload: `${s3UploadDuration}ms`,
            total: `${totalDuration}ms`,
        });

        // Return the public URL from presigned response
        return presignedResponse.public_url;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        console.error('[Upload] Image upload error:', error);
        throw new ApiError(
            0,
            error instanceof Error ? error.message : 'Failed to upload image',
            error
        );
    }
}

