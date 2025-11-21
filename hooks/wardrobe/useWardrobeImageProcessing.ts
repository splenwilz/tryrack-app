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

    const handleSelectPhoto = async (): Promise<{ imageUrl: string | null; metadata: WardrobeMetadata | null }> => {
        try {
            setIsPickingPhoto(true);
            setProcessingStage('uploading');

            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please enable photo library permissions to add a wardrobe item image.'
                );
                resetProcessingState();
                return { imageUrl: null, metadata: null };
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.8,
            });

            if (result.canceled || !result.assets?.length) {
                resetProcessingState();
                return { imageUrl: null, metadata: null };
            }

            const [asset] = result.assets;
            if (!asset?.uri) {
                Alert.alert('Image Error', 'Unable to read the selected image.');
                resetProcessingState();
                return { imageUrl: null, metadata: null };
            }

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
            console.error('[Wardrobe] Image selection/upload failed:', error);
            Alert.alert(
                'Upload Failed',
                error instanceof Error ? error.message : 'Unable to upload image. Please try again.'
            );
            resetProcessingState();
            return { imageUrl: null, metadata: null };
        } finally {
            setIsPickingPhoto(false);
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

