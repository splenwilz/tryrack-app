import { GoogleGenerativeAI } from "@google/generative-ai";
import * as FileSystem from "expo-file-system/legacy";
import Constants from "expo-constants";
import { apiClient, ApiError } from "../client";
import type { CreateWardrobeItemRequest, ExtractWardrobeItemRequest, SaveVirtualTryOnRequest, SaveVirtualTryOnResponse, UpdateWardrobeItemRequest, VirtualTryOnRequest, VirtualTryOnResponse, VirtualTryOnHistoryItem, WardrobeItemResponse, WardrobeMetadata } from "./types";

/**
 * Get Gemini API key from environment
 * In Expo, EXPO_PUBLIC_* variables are available at runtime via process.env
 */
function getGeminiApiKey(): string {
    // Try multiple sources for the API key
    const apiKey =
        process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
        process.env.GEMINI_API_KEY ||
        Constants.expoConfig?.extra?.geminiApiKey;

    if (!apiKey) {
        throw new ApiError(
            500,
            'GEMINI_API_KEY environment variable is not set. Set EXPO_PUBLIC_GEMINI_API_KEY in your .env file and restart the dev server.'
        );
    }

    return apiKey;
}

/**
 * Wardrobe metadata extraction prompt
 * Extracts structured metadata from clothing item images
 */
const WARDROBE_EXTRACTION_PROMPT = `Extract wardrobe item metadata. Return ONLY valid JSON:

{
  "title": "short descriptive name (max 30 chars)",
  "category": "lowercase singular term (e.g., blazer, t-shirt, jeans, dress, sneaker, handbag)",
  "colors": ["1-3 specific colors with shades like navy blue, burgundy, olive green"],
  "tags": ["3-5 tags: style/material/occasion/season/fit"]
}

Rules: category=lowercase singular (blazer not Blazer, sneaker not sneakers). colors=specific shades. tags=3-5 descriptive. Return JSON only.`;

/**
 * Image processing prompt for catalog-ready images
 */
const IMAGE_PROCESSING_PROMPT = "Transform this clothing item into a professional catalog image. Straighten wrinkles/folds, center on stylish minimalist background (soft gradient or studio backdrop). Output polished, app-ready result.";

/**
 * Get MIME type from file URI or extension
 */
function getMimeType(imageUri: string, providedMimeType?: string): string {
    if (providedMimeType) return providedMimeType;

    const lowerUri = imageUri.toLowerCase();
    if (lowerUri.endsWith('.heic') || lowerUri.endsWith('.heif')) return 'image/heic';
    if (lowerUri.endsWith('.jpg') || lowerUri.endsWith('.jpeg')) return 'image/jpeg';
    if (lowerUri.endsWith('.png')) return 'image/png';
    if (lowerUri.endsWith('.webp')) return 'image/webp';

    return 'image/png'; // Default
}

/**
 * Read and encode image to base64
 * Handles both local file URIs and remote URLs
 */
async function readImageAsBase64(imageUri: string): Promise<{ data: string; mimeType: string }> {
    const mimeType = getMimeType(imageUri);

    // Handle remote URLs
    if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
        try {
            // Download remote image to temporary file
            const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
            if (!cacheDir) {
                throw new ApiError(500, 'FileSystem cache directory not available');
            }

            const tempFileUri = `${cacheDir}remote_image_${Date.now()}.${mimeType.split('/')[1] || 'jpg'}`;

            const downloadResult = await FileSystem.downloadAsync(imageUri, tempFileUri);
            if (!downloadResult.uri) {
                throw new ApiError(400, 'Failed to download remote image');
            }

            // Read downloaded file as base64
            const base64 = await FileSystem.readAsStringAsync(downloadResult.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Clean up temp file (optional, can be done later)
            // FileSystem.deleteAsync(downloadResult.uri, { idempotent: true }).catch(() => {});

            return { data: base64, mimeType: downloadResult.headers?.['content-type'] || mimeType };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(400, `Failed to fetch remote image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Read local file
    if (!imageUri.startsWith('file://')) {
        imageUri = `file://${imageUri}`;
    }

    const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
    });

    return { data: base64, mimeType };
}

/**
 * Extract metadata from wardrobe item image using Gemini Vision API
 */
async function extractMetadata(
    ai: GoogleGenerativeAI,
    base64Image: string,
    mimeType: string
): Promise<WardrobeMetadata> {
    const visionModel = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = [
        { text: WARDROBE_EXTRACTION_PROMPT },
        {
            inlineData: {
                mimeType,
                data: base64Image,
            },
        },
    ];

    const result = await visionModel.generateContent({
        contents: [{ role: "user", parts: prompt }],
    });

    const response = result.response;
    const metadataText = response.text();

    // Parse JSON from response
    try {
        const jsonMatch = metadataText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) ||
            metadataText.match(/(\{[\s\S]*\})/);

        const jsonStr = jsonMatch ? jsonMatch[1] : metadataText.trim();
        const metadata = JSON.parse(jsonStr) as WardrobeMetadata;

        // Validate required fields
        if (!metadata.title || !metadata.category || !Array.isArray(metadata.colors) || !Array.isArray(metadata.tags)) {
            throw new Error('Invalid metadata structure');
        }

        return metadata;
    } catch (parseError) {
        console.error('[Wardrobe] Failed to parse metadata:', parseError);
        throw new ApiError(
            500,
            `Failed to parse metadata: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
        );
    }
}

/**
 * Convert data URI to temporary file URI for upload
 */
async function convertDataUriToFile(dataUri: string): Promise<string> {
    const [mimeTypePart, base64Data] = dataUri.split(',');
    const mimeType = mimeTypePart.match(/data:([^;]+)/)?.[1] || 'image/png';
    const extension = mimeType.split('/')[1] || 'png';

    // Use expo-file-system to save temp file
    const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;

    if (!cacheDir) {
        throw new ApiError(500, 'FileSystem cache directory not available');
    }

    const tempFileUri = `${cacheDir}wardrobe_processed_${Date.now()}.${extension}`;

    await FileSystem.writeAsStringAsync(tempFileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
    });

    return tempFileUri;
}

/**
 * Generate processed catalog image using Gemini Image Generation API
 */
async function generateProcessedImage(
    ai: GoogleGenerativeAI,
    base64Image: string,
    mimeType: string
): Promise<{ fileUri: string; mimeType: string }> {
    const imageModel = ai.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    const prompt = [
        { text: IMAGE_PROCESSING_PROMPT },
        {
            inlineData: {
                mimeType,
                data: base64Image,
            },
        },
    ];

    const result = await imageModel.generateContent({
        contents: [{ role: "user", parts: prompt }],
    });

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
        if (part.inlineData) {
            const dataUri = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            // Convert data URI to file URI for upload
            const fileUri = await convertDataUriToFile(dataUri);
            return {
                fileUri,
                mimeType: part.inlineData.mimeType,
            };
        }
    }

    throw new ApiError(500, 'No image data found in response');
}

/**
 * Extract metadata from wardrobe item image
 * This is faster than image generation and can be used to pre-fill the form
 */
export async function extractWardrobeMetadata(
    request: ExtractWardrobeItemRequest
): Promise<WardrobeMetadata> {
    const startTime = Date.now();

    try {
        // Get API key from environment
        const apiKey = getGeminiApiKey();
        const ai = new GoogleGenerativeAI(apiKey);

        // Read and encode image
        console.log('[Wardrobe] Reading image for metadata extraction...');
        const { data: base64Image, mimeType } = await readImageAsBase64(request.imageUri);
        console.log(`[Wardrobe] Image encoded (${(base64Image.length * 3 / 4 / 1024).toFixed(2)}KB)`);

        // Extract metadata
        console.log('[Wardrobe] Extracting metadata...');
        const metadataStartTime = Date.now();
        const metadata = await extractMetadata(ai, base64Image, mimeType);
        const metadataDuration = Date.now() - metadataStartTime;
        const totalDuration = Date.now() - startTime;

        console.log(`[Wardrobe] Metadata extracted in ${metadataDuration}ms (total: ${totalDuration}ms)`);

        return metadata;
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[Wardrobe] Metadata extraction failed after ${duration}ms:`, error);

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            500,
            error instanceof Error ? error.message : 'Failed to extract metadata',
            error
        );
    }
}

/**
 * Generate processed catalog image from wardrobe item
 * This takes longer than metadata extraction
 */
export async function generateWardrobeImage(
    request: ExtractWardrobeItemRequest
): Promise<{ processedImageUri: string; processedImageMimeType: string }> {
    const startTime = Date.now();

    try {
        // Get API key from environment
        const apiKey = getGeminiApiKey();
        const ai = new GoogleGenerativeAI(apiKey);

        // Read and encode image
        console.log('[Wardrobe] Reading image for processing...');
        const { data: base64Image, mimeType } = await readImageAsBase64(request.imageUri);
        console.log(`[Wardrobe] Image encoded (${(base64Image.length * 3 / 4 / 1024).toFixed(2)}KB)`);

        // Generate processed image
        console.log('[Wardrobe] Generating processed image...');
        const imageStartTime = Date.now();
        const processedImage = await generateProcessedImage(ai, base64Image, mimeType);
        const imageDuration = Date.now() - imageStartTime;
        const totalDuration = Date.now() - startTime;

        console.log(`[Wardrobe] Image generated in ${imageDuration}ms (total: ${totalDuration}ms)`);

        return {
            processedImageUri: processedImage.fileUri, // Already converted to file URI
            processedImageMimeType: processedImage.mimeType,
        };
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[Wardrobe] Image generation failed after ${duration}ms:`, error);

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            500,
            error instanceof Error ? error.message : 'Failed to generate processed image',
            error
        );
    }
}

/**
 * Virtual try-on prompt template
 * Based on backend prompt structure for optimal results
 */
const VIRTUAL_TRYON_PROMPT_TEMPLATE = (itemDetails: { title: string; category: string; colors: string[]; tags: string[] }[], customInstructions?: string, useCleanBackground?: boolean) => {
    // Build items text
    const itemsText = itemDetails.map((item, index) => {
        const colorsText = item.colors.length > 0 ? item.colors.join(', ') : 'original colors';
        return `${index + 1}. ${item.title} (${item.category}) in ${colorsText}`;
    }).join('\n');

    // Build background command
    const bg_cmd = useCleanBackground
        ? 'Use a clean, professional studio backdrop (minimalist background)'
        : 'Keep the original background from the person\'s photo';

    // Build prompt with backend structure
    let prompt = `You are a professional fashion stylist creating a virtual try-on. Person wearing complete outfit:\n\n${itemsText}\n\n`;

    prompt += `CRITICAL: Keep face, body shape, pose, and all non-clothing features identical.\n\n`;

    prompt += `REQUIREMENTS:\n\n`;
    prompt += `- Fit all items naturally on body, match colors exactly\n`;
    prompt += `- Layer correctly (top over bottom, outerwear over items)\n`;
    prompt += `- Realistic lighting, shadows, fabric draping\n`;
    prompt += `- ${bg_cmd}\n`;
    prompt += `- Preserve person's actual appearance and style (don't change their natural look)\n`;

    // Add custom instructions if provided
    if (customInstructions?.trim()) {
        prompt += `\nAdditional instructions: ${customInstructions.trim()}\n`;
    }

    prompt += `\nOutput: photorealistic image with person wearing complete outfit. Face must match original exactly.`;

    return prompt;
};

/**
 * Generate virtual try-on image using Gemini API
 * Combines user's full body photo with selected wardrobe items
 */
export async function generateVirtualTryOn(
    request: VirtualTryOnRequest
): Promise<VirtualTryOnResponse> {
    const startTime = Date.now();

    try {
        // Get API key from environment
        const apiKey = getGeminiApiKey();
        const ai = new GoogleGenerativeAI(apiKey);

        // Validate inputs
        if (!request.fullBodyImageUri) {
            throw new ApiError(400, 'Full body image is required');
        }
        if (!request.itemImageUris || request.itemImageUris.length === 0) {
            throw new ApiError(400, 'At least one wardrobe item image is required');
        }
        if (request.itemImageUris.length !== request.itemDetails.length) {
            throw new ApiError(400, 'Number of item images must match number of item details');
        }

        // Read and encode all images
        console.log('[Virtual Try-On] Reading images...');
        const imagesStartTime = Date.now();

        // Encode full body photo
        const { data: fullBodyBase64, mimeType: fullBodyMimeType } = await readImageAsBase64(request.fullBodyImageUri);
        console.log(`[Virtual Try-On] Full body image encoded (${(fullBodyBase64.length * 3 / 4 / 1024).toFixed(2)}KB)`);

        // Encode all item images
        const itemImages = await Promise.all(
            request.itemImageUris.map(async (uri, index) => {
                const { data, mimeType } = await readImageAsBase64(uri);
                console.log(`[Virtual Try-On] Item ${index + 1} encoded (${(data.length * 3 / 4 / 1024).toFixed(2)}KB)`);
                return { data, mimeType };
            })
        );

        const imagesDuration = Date.now() - imagesStartTime;
        console.log(`[Virtual Try-On] All images encoded in ${imagesDuration}ms`);

        // Build prompt
        const promptText = VIRTUAL_TRYON_PROMPT_TEMPLATE(
            request.itemDetails,
            request.customInstructions,
            request.useCleanBackground
        );

        // Build multi-image prompt parts
        const promptParts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [
            { text: promptText },
            {
                inlineData: {
                    mimeType: fullBodyMimeType,
                    data: fullBodyBase64,
                },
            },
        ];

        // Add all item images
        itemImages.forEach((itemImage) => {
            promptParts.push({
                inlineData: {
                    mimeType: itemImage.mimeType,
                    data: itemImage.data,
                },
            });
        });

        // Generate try-on image
        console.log('[Virtual Try-On] Generating virtual try-on...');
        const generationStartTime = Date.now();
        const imageModel = ai.getGenerativeModel({ model: "gemini-2.5-flash-image" });

        const result = await imageModel.generateContent(promptParts);

        const response = result.response;
        const parts = response.candidates?.[0]?.content?.parts || [];

        // Extract generated image
        for (const part of parts) {
            if (part.inlineData) {
                const dataUri = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                const fileUri = await convertDataUriToFile(dataUri);
                const generationDuration = Date.now() - generationStartTime;
                const totalDuration = Date.now() - startTime;

                console.log(`[Virtual Try-On] Generated in ${generationDuration}ms (total: ${totalDuration}ms)`);

                return {
                    generatedImageUri: fileUri,
                    mimeType: part.inlineData.mimeType,
                };
            }
        }

        throw new ApiError(500, 'No image data found in response');
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[Virtual Try-On] Generation failed after ${duration}ms:`, error);

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            500,
            error instanceof Error ? error.message : 'Failed to generate virtual try-on',
            error
        );
    }
}

/**
 * Save virtual try-on result to backend
 */
export async function saveVirtualTryOn(
    request: SaveVirtualTryOnRequest
): Promise<SaveVirtualTryOnResponse> {
    const response = await apiClient<SaveVirtualTryOnResponse>("/api/v1/virtual-try-on", {
        method: "POST",
        body: JSON.stringify(request),
    });
    return response;
}

/**
 * Get virtual try-on history for the current user
 * @returns Array of virtual try-on history items
 */
export async function getVirtualTryOns(): Promise<VirtualTryOnHistoryItem[]> {
    const response = await apiClient<VirtualTryOnHistoryItem[]>("/api/v1/virtual-try-on", {
        method: "GET",
    });
    return response;
}

export async function getVirtualTryOn(session_id: string): Promise<VirtualTryOnHistoryItem> {
    const response = await apiClient<VirtualTryOnHistoryItem>(`/api/v1/virtual-try-on/${session_id}`, {
        method: "GET",
    });
    return response;
}


// Create wardrobe item
export async function createWardrobeItem(
    request: CreateWardrobeItemRequest
): Promise<WardrobeItemResponse> {
    const response = await apiClient<WardrobeItemResponse>("/api/v1/wardrobe", {
        method: "POST",
        body: JSON.stringify(request),
    });
    return response;
}

/**
 * Options for filtering and paginating wardrobe items
 */
export interface GetWardrobeItemsOptions {
    category?: string | null;
    status?: string | null;
    skip?: number;
    limit?: number;
}

/**
 * Get wardrobe items with optional filtering and pagination
 * 
 * @param options - Optional query parameters for filtering and pagination
 * @returns Array of wardrobe items
 */
export async function getWardrobeItems(
    options?: GetWardrobeItemsOptions
): Promise<WardrobeItemResponse[]> {
    // Build query string from options
    const params = new URLSearchParams();

    if (options?.category != null) {
        params.append('category', options.category);
    }

    if (options?.status != null) {
        params.append('status', options.status);
    }

    if (options?.skip != null) {
        params.append('skip', String(options.skip));
    }

    if (options?.limit != null) {
        params.append('limit', String(options.limit));
    }

    const queryString = params.toString();
    const url = `/api/v1/wardrobe${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient<WardrobeItemResponse[]>(url, {
        method: "GET",
    });
    return response;
}


export async function getWardrobeItem(id: string): Promise<WardrobeItemResponse> {
    const response = await apiClient<WardrobeItemResponse>(`/api/v1/wardrobe/${id}`, {
        method: "GET",
    });
    return response;
}

export async function updateWardrobeItem(id: string, request: UpdateWardrobeItemRequest): Promise<WardrobeItemResponse> {
    const response = await apiClient<WardrobeItemResponse>(`/api/v1/wardrobe/${id}`, {
        method: "PATCH",
        body: JSON.stringify(request),
    });
    return response;
}

export async function markAsWorn(id: string): Promise<WardrobeItemResponse> {
    const response = await apiClient<WardrobeItemResponse>(`/api/v1/wardrobe/${id}/mark-worn`, {
        method: "POST",
    });
    return response;
}

/**
 * Delete a wardrobe item
 * Returns 204 No Content on success (no response body)
 * 
 * @param id - The wardrobe item ID to delete
 * @returns Promise that resolves when deletion is successful
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/204 - HTTP 204 No Content
 */
export async function deleteWardrobeItem(id: string): Promise<void> {
    try {
        await apiClient<void>(`/api/v1/wardrobe/${id}`, {
            method: "DELETE",
        });
    } catch (error) {
        // If item is already deleted (404), treat it as success
        // This handles race conditions where delete is called multiple times
        if (error instanceof Error && error.message.includes('not found')) {
            console.log('[Wardrobe] Item already deleted, treating as success');
            return;
        }
        throw error;
    }
}