import { GoogleGenerativeAI } from "@google/generative-ai";
import * as FileSystem from "expo-file-system/legacy";
import Constants from "expo-constants";
import { apiClient, ApiError } from '../client';
import type {
    CreateLookRequest,
    UpdateLookRequest,
    LookResponse,
    GenerateLookImageRequest,
    GenerateLookImageResponse,
    ExtractLookMetadataRequest,
    LookMetadata,
} from './types';

/**
 * Get Gemini API key from environment
 */
function getGeminiApiKey(): string {
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
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onloadend = () => {
                const base64 = reader.result as string;
                const base64Data = base64.split(',')[1] || base64;
                resolve({ data: base64Data, mimeType });
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Handle local file URIs
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
    });

    return { data: base64, mimeType };
}

/**
 * Convert data URI to temporary file URI for upload
 */
async function convertDataUriToFile(dataUri: string): Promise<string> {
    const [mimeTypePart, base64Data] = dataUri.split(',');
    const mimeType = mimeTypePart.match(/data:([^;]+)/)?.[1] || 'image/png';

    const fileExtension = mimeType.includes('jpeg') || mimeType.includes('jpg') ? '.jpg' : '.png';
    const tempFileUri = `${FileSystem.cacheDirectory}look_${Date.now()}${fileExtension}`;

    await FileSystem.writeAsStringAsync(tempFileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
    });

    return tempFileUri;
}

/**
 * Look metadata extraction prompt
 * Analyzes selected products to suggest title, description, and style
 */
const LOOK_METADATA_EXTRACTION_PROMPT = `Analyze these fashion products and suggest metadata for a complete outfit look. Return ONLY valid JSON:

{
  "title": "short descriptive outfit name (max 40 chars, e.g., 'Business Professional Outfit', 'Casual Summer Look')",
  "description": "brief description of the outfit combination (max 200 chars)",
  "style": "one word style category (e.g., Business, Casual, Formal, Evening, Sporty, Bohemian, Vintage, Minimalist, Streetwear, Classic)"
}

Rules: title=descriptive outfit name. description=what the outfit is good for. style=single word from common categories. Return JSON only.`;

/**
 * Extract metadata from selected products
 */
async function extractLookMetadata(
    ai: GoogleGenerativeAI,
    productImages: { data: string; mimeType: string }[],
    productDetails: { name: string; category: string; colors?: string[]; tags?: string[] }[]
): Promise<LookMetadata> {
    const visionModel = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Build products text for context
    const productsText = productDetails.map((product, index) => {
        const colorsText = product.colors && product.colors.length > 0
            ? product.colors.join(', ')
            : 'original colors';
        return `${index + 1}. ${product.name} (${product.category}) in ${colorsText}`;
    }).join('\n');

    const promptParts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [
        { text: `${LOOK_METADATA_EXTRACTION_PROMPT}\n\nProducts:\n${productsText}` },
    ];

    // Add all product images
    productImages.forEach((productImage) => {
        promptParts.push({
            inlineData: {
                mimeType: productImage.mimeType,
                data: productImage.data,
            },
        });
    });

    const result = await visionModel.generateContent({
        contents: [{ role: "user", parts: promptParts }],
    });

    const response = result.response;
    const metadataText = response.text();

    // Parse JSON from response
    try {
        const jsonMatch = metadataText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) ||
            metadataText.match(/(\{[\s\S]*\})/);

        const jsonStr = jsonMatch ? jsonMatch[1] : metadataText.trim();
        const metadata = JSON.parse(jsonStr) as LookMetadata;

        // Validate required fields
        if (!metadata.title || !metadata.description || !metadata.style) {
            throw new Error('Invalid metadata structure');
        }

        return metadata;
    } catch (parseError) {
        console.error('[Look] Failed to parse metadata:', parseError);
        throw new ApiError(
            500,
            `Failed to parse metadata: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
        );
    }
}

/**
 * Extract look metadata from selected products
 * This is faster than image generation and can be used to pre-fill the form
 */
export async function extractLookMetadataFromProducts(
    request: ExtractLookMetadataRequest
): Promise<LookMetadata> {
    const startTime = Date.now();

    try {
        // Get API key from environment
        const apiKey = getGeminiApiKey();
        const ai = new GoogleGenerativeAI(apiKey);

        // Validate inputs
        if (!request.productImageUris || request.productImageUris.length === 0) {
            throw new ApiError(400, 'At least one product image is required');
        }
        if (request.productImageUris.length !== request.productDetails.length) {
            throw new ApiError(400, 'Number of product images must match number of product details');
        }
        if (request.productImageUris.length < 2 || request.productImageUris.length > 5) {
            throw new ApiError(400, 'A look must have 2-5 products');
        }

        // Read and encode all product images
        console.log('[Look Metadata] Reading product images...');
        const imagesStartTime = Date.now();

        const productImages = await Promise.all(
            request.productImageUris.map(async (uri, index) => {
                const { data, mimeType } = await readImageAsBase64(uri);
                console.log(`[Look Metadata] Product ${index + 1} encoded (${(data.length * 3 / 4 / 1024).toFixed(2)}KB)`);
                return { data, mimeType };
            })
        );

        const imagesDuration = Date.now() - imagesStartTime;
        console.log(`[Look Metadata] All images encoded in ${imagesDuration}ms`);

        // Extract metadata
        console.log('[Look Metadata] Extracting metadata...');
        const metadataStartTime = Date.now();
        const metadata = await extractLookMetadata(ai, productImages, request.productDetails);
        const metadataDuration = Date.now() - metadataStartTime;
        const totalDuration = Date.now() - startTime;

        console.log(`[Look Metadata] Extracted in ${metadataDuration}ms (total: ${totalDuration}ms)`);

        return metadata;
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[Look Metadata] Extraction failed after ${duration}ms:`, error);

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            500,
            error instanceof Error ? error.message : 'Failed to extract look metadata',
            error
        );
    }
}

/**
 * Look image generation prompt template
 * Creates a styled outfit image from selected products
 */
const LOOK_GENERATION_PROMPT_TEMPLATE = (
    productDetails: { name: string; category: string; colors?: string[]; tags?: string[] }[],
    style?: string,
    customPrompt?: string
) => {
    // Build products text
    const productsText = productDetails.map((product, index) => {
        const colorsText = product.colors && product.colors.length > 0
            ? product.colors.join(', ')
            : 'original colors';
        return `${index + 1}. ${product.name} (${product.category}) in ${colorsText}`;
    }).join('\n');

    // Build style context
    const styleContext = style
        ? `Style: ${style}. Create a ${style.toLowerCase()} outfit combination.`
        : 'Create a cohesive, stylish outfit combination.';

    // Build prompt - Generate on a human model (like virtual try-on)
    // Keep it neutral and professional, let custom prompt control the style
    let prompt = `You are a professional fashion stylist. Generate a image of a person wearing this complete outfit:\n\n${productsText}\n\n`;

    // Only add style context if no custom prompt is provided
    if (!customPrompt?.trim()) {
        prompt += `${styleContext}\n\n`;
    }

    prompt += `CRITICAL REQUIREMENTS:\n\n`;
    prompt += `- Show a person (full body or upper body) wearing all items together\n`;
    prompt += `- Fit all items naturally on the body, match colors exactly\n`;
    prompt += `- Layer correctly (top over bottom, outerwear over items)\n`;
    prompt += `- Realistic lighting, shadows, and fabric draping\n`;
    prompt += `- Professional studio lighting on clean, minimalist background\n`;
    prompt += `- High-quality, catalog-ready presentation\n`;
    prompt += `- Natural pose that showcases the outfit\n`;

    // Add custom instructions if provided - these override default styling
    if (customPrompt?.trim()) {
        prompt += `\nCUSTOM STYLING INSTRUCTIONS (override defaults): ${customPrompt.trim()}\n`;
    }

    prompt += `\nOutput: an image of a person wearing the complete outfit.`;

    return prompt;
};

/**
 * Get all looks for the current boutique (my-looks endpoint)
 * @param options - Optional filters and pagination
 * @returns Array of looks
 */
export async function getBoutiqueLooks(options?: {
    style?: string | null;
    is_featured?: boolean | null;
    skip?: number;
    limit?: number;
}): Promise<LookResponse[]> {
    const params = new URLSearchParams();
    if (options?.style !== undefined && options.style !== null) {
        params.append('style', options.style);
    }
    if (options?.is_featured !== undefined && options.is_featured !== null) {
        params.append('is_featured', String(options.is_featured));
    }
    if (options?.skip !== undefined) {
        params.append('skip', String(options.skip));
    }
    if (options?.limit !== undefined) {
        params.append('limit', String(options.limit));
    }

    const queryString = params.toString();
    const url = `/api/v1/catalog/looks/my-looks${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient<LookResponse[]>(url, {
        method: 'GET',
    });
    return response;
}

/**
 * Get all public looks (for shop screen)
 * @param options - Optional filters
 * @returns Array of looks
 */
export async function getPublicLooks(options?: {
    style?: string;
    boutique_id?: string;
    featured_only?: boolean;
}): Promise<LookResponse[]> {
    const params = new URLSearchParams();
    if (options?.style) params.append('style', options.style);
    if (options?.boutique_id) params.append('boutique_id', options.boutique_id);
    if (options?.featured_only) params.append('featured_only', 'true');

    const queryString = params.toString();
    const url = `/api/v1/catalog/looks/public${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient<LookResponse[]>(url, {
        method: 'GET',
    });
    return response;
}

/**
 * Get a single look by ID
 * @param id - Look ID
 * @returns Look details
 */
export async function getLook(id: string): Promise<LookResponse> {
    const response = await apiClient<LookResponse>(`/api/v1/catalog/looks/${id}`, {
        method: 'GET',
    });
    return response;
}

/**
 * Create a new look
 * @param request - Look data
 * @returns Created look
 */
export async function createLook(request: CreateLookRequest): Promise<LookResponse> {
    const response = await apiClient<LookResponse>('/api/v1/catalog/looks', {
        method: 'POST',
        body: JSON.stringify(request),
    });
    return response;
}

/**
 * Update an existing look
 * @param id - Look ID
 * @param request - Updated look data
 * @returns Updated look
 */
export async function updateLook(
    id: string,
    request: UpdateLookRequest
): Promise<LookResponse> {
    const response = await apiClient<LookResponse>(`/api/v1/catalog/looks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(request),
    });
    return response;
}

/**
 * Delete a look
 * @param id - Look ID
 */
export async function deleteLook(id: string): Promise<void> {
    await apiClient<void>(`/api/v1/catalog/looks/${id}`, {
        method: 'DELETE',
    });
}

/**
 * Generate a styled look image from selected products using AI
 * Similar to virtual try-on but for creating outfit combinations
 */
export async function generateLookImage(
    request: GenerateLookImageRequest
): Promise<GenerateLookImageResponse> {
    const startTime = Date.now();

    try {
        // Get API key from environment
        const apiKey = getGeminiApiKey();
        const ai = new GoogleGenerativeAI(apiKey);

        // Validate inputs
        if (!request.productImageUris || request.productImageUris.length === 0) {
            throw new ApiError(400, 'At least one product image is required');
        }
        if (request.productImageUris.length !== request.productDetails.length) {
            throw new ApiError(400, 'Number of product images must match number of product details');
        }
        if (request.productImageUris.length < 2 || request.productImageUris.length > 5) {
            throw new ApiError(400, 'A look must have 2-5 products');
        }

        // Read and encode all product images
        console.log('[Look Generation] Reading product images...');
        const imagesStartTime = Date.now();

        const productImages = await Promise.all(
            request.productImageUris.map(async (uri, index) => {
                const { data, mimeType } = await readImageAsBase64(uri);
                console.log(`[Look Generation] Product ${index + 1} encoded (${(data.length * 3 / 4 / 1024).toFixed(2)}KB)`);
                return { data, mimeType };
            })
        );

        const imagesDuration = Date.now() - imagesStartTime;
        console.log(`[Look Generation] All images encoded in ${imagesDuration}ms`);

        // Build prompt
        const promptText = LOOK_GENERATION_PROMPT_TEMPLATE(
            request.productDetails,
            request.style,
            request.customPrompt
        );

        // Build multi-image prompt parts
        const promptParts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [
            { text: promptText },
        ];

        // Add all product images
        productImages.forEach((productImage) => {
            promptParts.push({
                inlineData: {
                    mimeType: productImage.mimeType,
                    data: productImage.data,
                },
            });
        });

        // Generate look image
        console.log('[Look Generation] Generating styled look image...');
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

                console.log(`[Look Generation] Generated in ${generationDuration}ms (total: ${totalDuration}ms)`);

                return {
                    generatedImageUri: fileUri,
                    mimeType: part.inlineData.mimeType,
                };
            }
        }

        throw new ApiError(500, 'No image data found in response');
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[Look Generation] Failed after ${duration}ms:`, error);

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            500,
            error instanceof Error ? error.message : 'Failed to generate look image',
            error
        );
    }
}

