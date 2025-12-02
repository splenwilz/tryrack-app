import { useState, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUploadImage } from '@/api/upload/queries';
import { useExtractWardrobeMetadata, useGenerateWardrobeImage } from '@/api/wardrobe/queries';
import { PROCESSING_STAGE_CONFIG } from '@/constants/wardrobe';
import type { ProcessingStage } from '@/types/wardrobe';
import type { WardrobeMetadata } from '@/api/wardrobe/types';

/**
 * Catalog product metadata extracted from image
 * Maps wardrobe metadata to catalog product fields
 */
export interface CatalogProductMetadata {
    name: string; // Maps from wardrobe metadata title
    category: string;
    tags: string[];
    colors?: string[]; // Optional, can be used for product description
    description?: string; // Generated from metadata
}

interface UseCatalogImageProcessingOptions {
    onMetadataExtracted?: (metadata: CatalogProductMetadata) => void;
    onImageReady?: (imageUrl: string) => void;
}

/**
 * Hook for processing catalog product images
 * Extracts metadata and uploads processed image to S3
 * 
 * Similar to wardrobe image processing but adapted for catalog products
 * 
 * @see hooks/wardrobe/useWardrobeImageProcessing.ts - Reference implementation
 */
export function useCatalogImageProcessing(options?: UseCatalogImageProcessingOptions) {
    const [processingStage, setProcessingStage] = useState<ProcessingStage>(null);
    const [isPickingPhoto, setIsPickingPhoto] = useState(false);

    // Store callbacks in refs to prevent re-renders when they change
    const callbacksRef = useRef(options);
    useEffect(() => {
        callbacksRef.current = options;
    }, [options]);

    const { mutateAsync: uploadImageMutation, isPending: isUploadingImage } = useUploadImage();
    const { mutateAsync: extractMetadataMutation } = useExtractWardrobeMetadata();
    const { mutateAsync: generateImageMutation } = useGenerateWardrobeImage();

    const resetProcessingState = () => {
        setProcessingStage(null);
    };

    /**
     * Generates a product description from extracted metadata
     */
    const generateDescription = (metadata: WardrobeMetadata): string => {
        const parts: string[] = [];
        
        // Start with a descriptive phrase about the item
        if (metadata.colors && metadata.colors.length > 0) {
            const colorsText = metadata.colors.length === 1 
                ? metadata.colors[0] 
                : metadata.colors.slice(0, -1).join(', ') + ' and ' + metadata.colors[metadata.colors.length - 1];
            parts.push(`${colorsText.charAt(0).toUpperCase() + colorsText.slice(1)} ${metadata.category}`);
        } else {
            parts.push(metadata.category.charAt(0).toUpperCase() + metadata.category.slice(1));
        }
        
        // Add tags if available
        if (metadata.tags && metadata.tags.length > 0) {
            const tagsText = metadata.tags.slice(0, 3).join(', '); // Use first 3 tags
            parts.push(`featuring ${tagsText} style`);
        }
        
        // Create a complete sentence
        let description = parts.join(' ');
        description += '. Perfect for various occasions and styling needs.';
        
        return description;
    };

    /**
     * Maps wardrobe metadata to catalog product metadata
     */
    const mapToCatalogMetadata = (wardrobeMetadata: WardrobeMetadata): CatalogProductMetadata => {
        return {
            name: wardrobeMetadata.title,
            category: wardrobeMetadata.category,
            tags: wardrobeMetadata.tags,
            colors: wardrobeMetadata.colors,
            description: generateDescription(wardrobeMetadata),
        };
    };

    /**
     * Processes the selected image (metadata extraction and image generation)
     */
    const processImage = async (asset: ImagePicker.ImagePickerAsset): Promise<{ imageUrl: string | null; metadata: CatalogProductMetadata | null }> => {
        if (!asset?.uri) {
            Alert.alert('Image Error', 'Unable to read the selected image.');
            resetProcessingState();
            return { imageUrl: null, metadata: null };
        }

        try {
            // Step 1: Start both metadata extraction and image generation in parallel
            setProcessingStage('analyzing');
            console.log('[Catalog] Starting parallel AI analysis (metadata + image generation)...');

            const request = {
                imageUri: asset.uri,
                mimeType: asset.mimeType || undefined,
            };

            // Start both operations in parallel
            const metadataPromise = extractMetadataMutation(request);
            const imagePromise = generateImageMutation(request);

            // Step 2: Pre-fill form as soon as metadata arrives (this is faster)
            setProcessingStage('extracting');
            console.log('[Catalog] Waiting for metadata...');
            const wardrobeMetadata = await metadataPromise;
            console.log('[Catalog] Metadata received! Pre-filling form...');

            // Map wardrobe metadata to catalog metadata
            const catalogMetadata = mapToCatalogMetadata(wardrobeMetadata);
            callbacksRef.current?.onMetadataExtracted?.(catalogMetadata);

            // Step 3: Upload processed image when it's ready (this takes longer)
            setProcessingStage('enhancing');
            console.log('[Catalog] Waiting for processed image...');
            const { processedImageUri } = await imagePromise;
            console.log('[Catalog] Processed image ready! Uploading...');

            // Upload processed image to S3 (folder: 'catalog')
            const processedImageUrl = await uploadImageMutation({
                imageUri: processedImageUri,
                folder: 'catalog',
            });

            callbacksRef.current?.onImageReady?.(processedImageUrl);

            setProcessingStage('complete');
            setTimeout(() => {
                resetProcessingState();
            }, PROCESSING_STAGE_CONFIG.complete.duration + 250);

            return { imageUrl: processedImageUrl, metadata: catalogMetadata };
        } catch (error) {
            console.error('[Catalog] Image processing failed:', error);
            Alert.alert(
                'Processing Failed',
                error instanceof Error ? error.message : 'Unable to process image. Please try again.'
            );
            resetProcessingState();
            return { imageUrl: null, metadata: null };
        }
    };

    const handleSelectPhoto = async (): Promise<{ imageUrl: string | null; metadata: CatalogProductMetadata | null }> => {
        try {
            setIsPickingPhoto(true);

            // Request media library permissions first (needed for both camera and gallery)
            const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (mediaStatus !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please enable photo library permissions to add a product image.'
                );
                resetProcessingState();
                setIsPickingPhoto(false);
                return { imageUrl: null, metadata: null };
            }

            // Show options (Camera or Gallery) and wait for user choice
            return new Promise((resolve) => {
                const handleCamera = async () => {
                    try {
                        setProcessingStage('uploading');
                        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
                        if (cameraStatus !== 'granted') {
                            Alert.alert(
                                'Permission Required',
                                'Camera access is required to take photos. Please enable camera access in your device settings.'
                            );
                            resetProcessingState();
                            setIsPickingPhoto(false);
                            resolve({ imageUrl: null, metadata: null });
                            return;
                        }

                        const result = await ImagePicker.launchCameraAsync({
                            mediaTypes: 'images',
                            allowsEditing: false,
                            quality: 0.8,
                        });

                        if (result.canceled || !result.assets?.length) {
                            resetProcessingState();
                            setIsPickingPhoto(false);
                            resolve({ imageUrl: null, metadata: null });
                            return;
                        }

                        const processed = await processImage(result.assets[0]);
                        setIsPickingPhoto(false);
                        resolve(processed);
                    } catch (error) {
                        console.error('[Catalog] Camera error:', error);
                        Alert.alert('Error', 'Failed to open camera. Please try again.');
                        resetProcessingState();
                        setIsPickingPhoto(false);
                        resolve({ imageUrl: null, metadata: null });
                    }
                };

                const handleGallery = async () => {
                    try {
                        setProcessingStage('uploading');
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: 'images',
                            allowsEditing: false,
                            quality: 0.8,
                        });

                        if (result.canceled || !result.assets?.length) {
                            resetProcessingState();
                            setIsPickingPhoto(false);
                            resolve({ imageUrl: null, metadata: null });
                            return;
                        }

                        const processed = await processImage(result.assets[0]);
                        setIsPickingPhoto(false);
                        resolve(processed);
                    } catch (error) {
                        console.error('[Catalog] Image picker error:', error);
                        Alert.alert('Error', 'Failed to open image library. Please try again.');
                        resetProcessingState();
                        setIsPickingPhoto(false);
                        resolve({ imageUrl: null, metadata: null });
                    }
                };

                const handleCancel = () => {
                    resetProcessingState();
                    setIsPickingPhoto(false);
                    resolve({ imageUrl: null, metadata: null });
                };

                Alert.alert(
                    'Add Product Photo',
                    'Choose an option',
                    [
                        { text: 'Cancel', style: 'cancel', onPress: handleCancel },
                        { text: 'Take Photo', onPress: handleCamera },
                        { text: 'Choose from Gallery', onPress: handleGallery },
                    ],
                    {
                        cancelable: true,
                        onDismiss: handleCancel,
                    }
                );
            });
        } catch (error) {
            console.error('[Catalog] Image selection failed:', error);
            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
            );
            resetProcessingState();
            setIsPickingPhoto(false);
            return { imageUrl: null, metadata: null };
        }
    };

    return {
        handleSelectPhoto,
        processingStage,
        isPickingPhoto,
        isUploadingImage,
        resetProcessingState,
    };
}

