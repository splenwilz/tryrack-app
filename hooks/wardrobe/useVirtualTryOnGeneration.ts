/**
 * Custom hook for virtual try-on generation
 * Manages state and handles the generation process
 *
 * @see https://react-query.tanstack.com/guides/mutations - React Query mutations
 */

import { useState } from 'react';
import { Alert } from 'react-native';
import { useGenerateVirtualTryOn, useSaveVirtualTryOn } from '@/api/wardrobe/queries';
import { uploadImage } from '@/api/upload/services';
import type { SaveVirtualTryOnRequest, VirtualTryOnItemDetail } from '@/api/wardrobe/types';
import type { BoutiqueItem, WardrobeItemTryOn } from './useVirtualTryOnItems';
import { mightAddItems } from '@/utils/virtual-tryon';
import { inferItemType } from './useVirtualTryOnItems';

type TryOnItem = BoutiqueItem | WardrobeItemTryOn;

interface UseVirtualTryOnGenerationOptions {
    userPhoto: string | null;
    selectedItems: TryOnItem[];
    useCleanBackground: boolean;
    customPrompt: string;
}

export function useVirtualTryOnGeneration({
    userPhoto,
    selectedItems,
    useCleanBackground,
    customPrompt,
}: UseVirtualTryOnGenerationOptions) {
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [remoteGeneratedImage, setRemoteGeneratedImage] = useState<string | null>(null);

    const generateMutation = useGenerateVirtualTryOn();
    const saveMutation = useSaveVirtualTryOn();

    const generateTryOn = async () => {
        // Validation
        if (!userPhoto) {
            Alert.alert('Photo Required', 'Please add your full body photo first');
            return;
        }

        if (selectedItems.length === 0) {
            Alert.alert('Items Required', 'Please select at least one item to try on');
            return;
        }

        // Check if custom instructions might add items
        const customInstructionsMightAddItems = mightAddItems(customPrompt);
        const hasMoreThanTwoItems = selectedItems.length > 2;
        const hasTwoItemsWithCleanBackground = selectedItems.length >= 2 && useCleanBackground;

        // Warn if more than 2 items OR if custom instructions might add items OR if 2+ items with clean background
        if (hasMoreThanTwoItems || customInstructionsMightAddItems || hasTwoItemsWithCleanBackground) {
            let warningMessage = '';
            const warnings: string[] = [];

            if (hasMoreThanTwoItems) {
                warnings.push('You have selected more than 2 items');
            }
            if (hasTwoItemsWithCleanBackground && !hasMoreThanTwoItems) {
                warnings.push('You have selected 2 items with clean background enabled');
            }
            if (customInstructionsMightAddItems) {
                warnings.push('Your custom instructions may request additional items');
            }

            if (warnings.length > 1) {
                warningMessage = `${warnings.join(', ')}. The result will not preserve your image and will show the combination on a different person. Do you want to continue?`;
            } else if (warnings.length === 1) {
                const issue = warnings[0];
                if (issue.includes('custom instructions')) {
                    warningMessage = `${issue} (e.g., "add shoe", "include belt"). This will not preserve your image and will show the combination on a different person. Do you want to continue?`;
                } else {
                    warningMessage = `${issue}. The result will not preserve your image and will show the combination on a different person. Do you want to continue?`;
                }
            }

            Alert.alert(
                'Image Quality Warning',
                warningMessage,
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => {
                            // User cancelled, don't generate
                        },
                    },
                    {
                        text: 'Continue',
                        onPress: async () => {
                            // Continue with generation
                            await proceedWithGeneration();
                        },
                    },
                ]
            );
            return;
        }

        // Proceed with generation for 2 or fewer items, no clean background, and no item-adding instructions
        await proceedWithGeneration();
    };

    const proceedWithGeneration = async () => {

        // Build item details and image URIs
        const itemImageUris: string[] = [];
        const itemDetails: VirtualTryOnItemDetail[] = [];

        selectedItems.forEach((item) => {
            itemImageUris.push(item.imageUrl);
            itemDetails.push({
                title: item.title,
                category: item.category,
                colors: item.colors || [],
                tags: item.tags || [],
            });
        });

        if (!userPhoto) {
            Alert.alert('Photo Required', 'Please add your full body photo first');
            return;
        }

        try {
            const result = await generateMutation.mutateAsync({
                fullBodyImageUri: userPhoto,
                itemImageUris,
                itemDetails,
                customInstructions: customPrompt.trim() || undefined,
                useCleanBackground,
            });

            setGeneratedImage(result.generatedImageUri);

            // Upload to S3 and save to backend in the background
            void (async () => {
                try {
                    console.log('[Virtual Try-On] ========== UPLOAD & SAVE PROCESS ==========');
                    console.log('[Virtual Try-On] Step 1: Generated image URI (local):', result.generatedImageUri);
                    console.log('[Virtual Try-On] Step 1: Generated image URI type:', result.generatedImageUri.startsWith('file://') ? 'LOCAL FILE' : result.generatedImageUri.startsWith('http') ? 'REMOTE URL' : 'UNKNOWN');

                    console.log('[Virtual Try-On] Step 2: Starting S3 upload...');
                    const uploadStartTime = Date.now();
                    const remoteUri = await uploadImage({
                        imageUri: result.generatedImageUri,
                        folder: 'virtual-tryon',
                    });
                    const uploadDuration = Date.now() - uploadStartTime;

                    console.log('[Virtual Try-On] Step 2: Upload completed in', uploadDuration, 'ms');
                    console.log('[Virtual Try-On] Step 2: Generated image URI (remote/S3):', remoteUri);
                    console.log('[Virtual Try-On] Step 2: Remote URI type:', remoteUri.startsWith('http') ? 'REMOTE URL ✅' : 'UNKNOWN ❌');

                    if (!remoteUri.startsWith('http')) {
                        console.error('[Virtual Try-On] ⚠️ WARNING: Upload did not return HTTP URL! Got:', remoteUri);
                    }

                    setRemoteGeneratedImage(remoteUri);

                    const savePayload: SaveVirtualTryOnRequest = {
                        full_body_image_uri: userPhoto,
                        generated_image_uri: remoteUri,
                        use_clean_background: useCleanBackground,
                        custom_instructions: customPrompt.trim() || null,
                        selected_items: selectedItems.map((item) => {
                            const itemType = inferItemType(item);
                            const baseItem = {
                                id: item.id,
                                title: item.title,
                                category: item.category,
                                colors: item.colors || [],
                                tags: item.tags || [],
                            };

                            // Add boutique fields if item is from boutique
                            if (itemType === 'boutique' && 'boutique' in item) {
                                return {
                                    ...baseItem,
                                    item_type: 'boutique' as const,
                                    product_id: String(item.id), // Product ID for navigation
                                    boutique_id: item.boutique.id,
                                    boutique_name: item.boutique.name,
                                    boutique_logo_url: item.boutique.logo || undefined,
                                };
                            }

                            // Wardrobe item
                            return {
                                ...baseItem,
                                item_type: 'wardrobe' as const,
                            };
                        }),
                    };

                    console.log('[Virtual Try-On] ========================================');
                    console.log('[Virtual Try-On] Step 3: Save payload being sent to backend:');
                    console.log('[Virtual Try-On] Full payload:', JSON.stringify(savePayload, null, 2));
                    console.log('[Virtual Try-On] Generated image URI in payload:', savePayload.generated_image_uri);
                    console.log('[Virtual Try-On] Generated image URI type in payload:', savePayload.generated_image_uri.startsWith('file://') ? 'LOCAL FILE ❌' : savePayload.generated_image_uri.startsWith('http') ? 'REMOTE URL ✅' : 'UNKNOWN');
                    console.log('[Virtual Try-On] Full body image URI:', savePayload.full_body_image_uri);
                    console.log('[Virtual Try-On] Full body image URI type:', savePayload.full_body_image_uri.startsWith('file://') ? 'LOCAL FILE' : savePayload.full_body_image_uri.startsWith('http') ? 'REMOTE URL' : 'UNKNOWN');
                    console.log('[Virtual Try-On] Selected items count:', savePayload.selected_items.length);
                    console.log('[Virtual Try-On] ========================================');

                    await saveMutation.mutateAsync(savePayload);
                    console.log('[Virtual Try-On] ✅ Successfully saved to backend with S3 URL');
                } catch (saveError) {
                    // Log error but don't block the user from seeing the result
                    console.error('[Virtual Try-On] ❌ Failed to save to backend:', saveError);
                    console.error('[Virtual Try-On] Save error details:', saveError instanceof Error ? saveError.message : 'Unknown error');
                    console.error('[Virtual Try-On] Save error stack:', saveError instanceof Error ? saveError.stack : 'No stack trace');

                    // If upload failed, log what we would have sent
                    if (saveError instanceof Error && saveError.message.includes('upload')) {
                        console.error('[Virtual Try-On] Upload failed, would have sent local URI:', result.generatedImageUri);
                    }
                }
            })();
        } catch (error) {
            console.error('[Virtual Try-On] Generation error:', error);
            Alert.alert(
                'Generation Failed',
                error instanceof Error ? error.message : 'Failed to generate virtual try-on. Please try again.'
            );
        }
    };

    return {
        isGenerating: generateMutation.isPending,
        isSavingRemote: saveMutation.isPending,
        generatedImage,
        remoteGeneratedImage,
        error: generateMutation.error || saveMutation.error,
        generateTryOn,
        resetGeneratedImage: () => setGeneratedImage(null),
    };
}

