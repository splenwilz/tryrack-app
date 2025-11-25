import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUploadImage } from '@/api/upload/queries';
import { useExtractWardrobeMetadata, useGenerateWardrobeImage } from '@/api/wardrobe/queries';
import { PROCESSING_STAGE_CONFIG } from '@/constants/wardrobe';
import type { ProcessingStage } from '@/types/wardrobe';
import type { WardrobeMetadata } from '@/api/wardrobe/types';

interface UseWardrobeImageProcessingOptions {
    onMetadataExtracted?: (metadata: { title: string; category: string; colors: string[]; tags: string[] }) => void;
    onImageReady?: (imageUrl: string) => void;
}

export function useWardrobeImageProcessing(options?: UseWardrobeImageProcessingOptions) {
    const [processingStage, setProcessingStage] = useState<ProcessingStage>(null);
    const [isPickingPhoto, setIsPickingPhoto] = useState(false);

    const { mutateAsync: uploadImageMutation, isPending: isUploadingImage } = useUploadImage();
    const { mutateAsync: extractMetadataMutation } = useExtractWardrobeMetadata();
    const { mutateAsync: generateImageMutation } = useGenerateWardrobeImage();

    const resetProcessingState = () => {
        setProcessingStage(null);
    };

    /**
     * Processes the selected image (metadata extraction and image generation)
     */
    const processImage = async (asset: ImagePicker.ImagePickerAsset): Promise<{ imageUrl: string | null; metadata: WardrobeMetadata | null }> => {
        if (!asset?.uri) {
            Alert.alert('Image Error', 'Unable to read the selected image.');
            resetProcessingState();
            return { imageUrl: null, metadata: null };
        }

        try {
            // Step 1: Start both metadata extraction and image generation in parallel
            setProcessingStage('analyzing');
            console.log('[Wardrobe] Starting parallel AI analysis (metadata + image generation)...');

            const request = {
                imageUri: asset.uri,
                mimeType: asset.mimeType || undefined,
            };

            // Start both operations in parallel
            const metadataPromise = extractMetadataMutation(request);
            const imagePromise = generateImageMutation(request);

            // Step 2: Pre-fill form as soon as metadata arrives (this is faster)
            setProcessingStage('extracting');
            console.log('[Wardrobe] Waiting for metadata...');
            const metadata = await metadataPromise;
            console.log('[Wardrobe] Metadata received! Pre-filling form...');

            options?.onMetadataExtracted?.(metadata);

            // Step 3: Upload processed image when it's ready (this takes longer)
            setProcessingStage('enhancing');
            console.log('[Wardrobe] Waiting for processed image...');
            const { processedImageUri } = await imagePromise;
            console.log('[Wardrobe] Processed image ready! Uploading...');

            // Upload processed image to S3
            const processedImageUrl = await uploadImageMutation({
                imageUri: processedImageUri,
                folder: 'wardrobe',
            });

            options?.onImageReady?.(processedImageUrl);

            setProcessingStage('complete');
            setTimeout(() => {
                resetProcessingState();
            }, PROCESSING_STAGE_CONFIG.complete.duration + 250);

            return { imageUrl: processedImageUrl, metadata };
        } catch (error) {
            console.error('[Wardrobe] Image processing failed:', error);
            Alert.alert(
                'Processing Failed',
                error instanceof Error ? error.message : 'Unable to process image. Please try again.'
            );
            resetProcessingState();
            return { imageUrl: null, metadata: null };
        }
    };

    const handleSelectPhoto = async (): Promise<{ imageUrl: string | null; metadata: WardrobeMetadata | null }> => {
        try {
            setIsPickingPhoto(true);

            // Request media library permissions first (needed for both camera and gallery)
            const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (mediaStatus !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please enable photo library permissions to add a wardrobe item image.'
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
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
                        console.error('[Wardrobe] Camera error:', error);
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
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
                        console.error('[Wardrobe] Image picker error:', error);
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
                    'Add Item Photo',
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
            console.error('[Wardrobe] Image selection failed:', error);
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

