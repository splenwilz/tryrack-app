/**
 * Custom hook for look image generation and metadata extraction
 * Manages state and handles the AI generation process for outfit looks
 * Extracts metadata first (faster) to pre-fill form, then generates image
 *
 * @see https://react-query.tanstack.com/guides/mutations - React Query mutations
 */

import { useState } from 'react';
import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { generateLookImage, extractLookMetadataFromProducts } from '@/api/looks/services';
import { uploadImage } from '@/api/upload/services';
import type { GenerateLookImageRequest, ExtractLookMetadataRequest, LookMetadata } from '@/api/looks/types';
import type { CatalogProduct } from '@/types/boutique';

interface UseLookImageGenerationOptions {
    selectedProducts: CatalogProduct[];
    customPrompt?: string;
    onMetadataExtracted?: (metadata: LookMetadata) => void;
}

export function useLookImageGeneration({
    selectedProducts,
    customPrompt,
    onMetadataExtracted,
}: UseLookImageGenerationOptions) {
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [remoteImageUrl, setRemoteImageUrl] = useState<string | null>(null);
    const [isExtractingMetadata, setIsExtractingMetadata] = useState(false);

    const extractMetadataMutation = useMutation({
        mutationFn: (request: ExtractLookMetadataRequest) => extractLookMetadataFromProducts(request),
    });

    const generateMutation = useMutation({
        mutationFn: (request: GenerateLookImageRequest) => generateLookImage(request),
    });

    const generateLook = async (): Promise<{ imageUrl: string | null; metadata: LookMetadata | null }> => {
        // Validation
        if (selectedProducts.length < 2) {
            Alert.alert('Products Required', 'Please select at least 2 products to create a look');
            return { imageUrl: null, metadata: null };
        }

        if (selectedProducts.length > 5) {
            Alert.alert('Too Many Products', 'A look can have a maximum of 5 products');
            return { imageUrl: null, metadata: null };
        }

        try {
            // Build product details and image URIs
            const productImageUris: string[] = [];
            const productDetails: { name: string; category: string; colors?: string[]; tags?: string[] }[] = [];

            selectedProducts.forEach((product) => {
                productImageUris.push(product.imageUrl);
                productDetails.push({
                    name: product.name,
                    category: product.category,
                    colors: product.colors || [],
                    tags: product.tags || [],
                });
            });

            // Step 1: Extract metadata first (faster) to pre-fill form
            setIsExtractingMetadata(true);
            console.log('[Look Generation] Extracting metadata from products...');

            const metadataRequest: ExtractLookMetadataRequest = {
                productImageUris,
                productDetails,
            };

            const metadata = await extractMetadataMutation.mutateAsync(metadataRequest);
            console.log('[Look Generation] Metadata extracted! Pre-filling form...');
            setIsExtractingMetadata(false);

            // Pre-fill form with extracted metadata
            onMetadataExtracted?.(metadata);

            // Step 2: Generate image (takes longer) using extracted style
            console.log('[Look Generation] Generating look image with style:', metadata.style);
            const imageRequest: GenerateLookImageRequest = {
                productImageUris,
                productDetails,
                style: metadata.style, // Use extracted style
                customPrompt: customPrompt?.trim() || undefined,
            };

            const result = await generateMutation.mutateAsync(imageRequest);

            console.log('[Look Generation] Image generated!');

            setGeneratedImage(result.generatedImageUri);

            // Upload to S3 in the background (don't await - let it happen async)
            // This ensures the mutation state resets immediately
            uploadImage({
                imageUri: result.generatedImageUri,
                folder: 'look-images',
            })
                .then((uploadedUrl) => {
                    setRemoteImageUrl(uploadedUrl);
                })
                .catch((uploadError) => {
                    console.error('[Look Generation] Failed to upload to S3:', uploadError);
                    // Keep using local URI if upload fails
                });

            // Return immediately with local URI - upload happens in background
            return { imageUrl: result.generatedImageUri, metadata };
        } catch (error) {
            console.error('[Look Generation] Generation failed:', error);
            setIsExtractingMetadata(false);
            Alert.alert(
                'Generation Failed',
                error instanceof Error ? error.message : 'Unable to generate look. Please try again.'
            );
            return { imageUrl: null, metadata: null };
        }
    };

    const reset = () => {
        setGeneratedImage(null);
        setRemoteImageUrl(null);
        setIsExtractingMetadata(false);
    };

    return {
        generatedImage,
        remoteImageUrl,
        isGenerating: isExtractingMetadata || extractMetadataMutation.isPending || generateMutation.isPending,
        isExtractingMetadata,
        generateLook,
        reset,
    };
}
