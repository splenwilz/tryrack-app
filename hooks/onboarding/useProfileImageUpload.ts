import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { UseFormSetValue } from 'react-hook-form';
import type { ProfileFormValues } from '@/components/onboarding/types';

/**
 * Image validation configuration
 */
const IMAGE_CONFIG = {
    maxSizeMB: 10,
    maxSizeBytes: 10 * 1024 * 1024,
    minProfileDimension: 200,
} as const;

/**
 * Validates image before setting it in the form
 * 
 * @param asset - Image picker asset
 * @param type - Type of image (profile or fullBody)
 * @returns true if image is valid, false otherwise
 */
function validateImage(
    asset: ImagePicker.ImagePickerAsset,
    type: 'profile' | 'fullBody'
): boolean {
    // Validate file size
    if (asset.fileSize && asset.fileSize > IMAGE_CONFIG.maxSizeBytes) {
        Alert.alert(
            'File Too Large',
            `Image must be smaller than ${IMAGE_CONFIG.maxSizeMB}MB. Please choose a smaller image or compress it.`,
            [{ text: 'OK' }]
        );
        return false;
    }

    // Validate dimensions for profile photos
    if (type === 'profile') {
        if (
            (asset.width && asset.width < IMAGE_CONFIG.minProfileDimension) ||
            (asset.height && asset.height < IMAGE_CONFIG.minProfileDimension)
        ) {
            Alert.alert(
                'Image Too Small',
                `Profile photo must be at least ${IMAGE_CONFIG.minProfileDimension}x${IMAGE_CONFIG.minProfileDimension} pixels.`,
                [{ text: 'OK' }]
            );
            return false;
        }
    }

    return true;
}

/**
 * Hook for handling profile image uploads
 * 
 * Manages image picker, permissions, and form state updates
 * 
 * @param setValue - React Hook Form setValue function
 * @returns Object with image upload handler and loading state
 * 
 * @see https://docs.expo.dev/versions/latest/sdk/image-picker/ - Expo Image Picker documentation
 */
export function useProfileImageUpload(
    setValue: UseFormSetValue<ProfileFormValues>
) {
    const [isImageUploading, setIsImageUploading] = useState<'profile' | 'fullBody' | null>(null);

    /**
     * Handles the image picker result
     */
    const handleImageResult = (
        result: ImagePicker.ImagePickerResult,
        type: 'profile' | 'fullBody'
    ) => {
        if (result.canceled) {
            setIsImageUploading(null);
            return;
        }

        if (!result.assets || result.assets.length === 0) {
            Alert.alert('Error', 'No image selected. Please try again.', [{ text: 'OK' }]);
            setIsImageUploading(null);
            return;
        }

        const asset = result.assets[0];

        if (!validateImage(asset, type)) {
            setIsImageUploading(null);
            return;
        }

        const fieldName = type === 'profile' ? 'profileImage' : 'fullBodyImage';
        setValue(fieldName, asset.uri, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
        });
        setIsImageUploading(null);
    };

    /**
     * Handles image upload with proper permission checks and error handling
     */
    const handleImageUpload = async (type: 'profile' | 'fullBody') => {
        const isProfile = type === 'profile';
        const photoType = isProfile ? 'Profile Photo' : 'Full Body Photo';

        try {
            setIsImageUploading(type);

            // Request media library permissions
            const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (mediaStatus !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'We need access to your photos to upload images. Please enable photo library access in your device settings.',
                    [{ text: 'OK' }]
                );
                setIsImageUploading(null);
                return;
            }

            // Show options (Camera or Gallery)
            Alert.alert(
                `Add ${photoType}`,
                'Choose an option',
                [
                    { text: 'Cancel', style: 'cancel', onPress: () => setIsImageUploading(null) },
                    {
                        text: 'Take Photo',
                        onPress: async () => {
                            try {
                                const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
                                if (cameraStatus !== 'granted') {
                                    Alert.alert(
                                        'Permission Required',
                                        'Camera access is required to take photos. Please enable camera access in your device settings.',
                                        [{ text: 'OK' }]
                                    );
                                    setIsImageUploading(null);
                                    return;
                                }

                                const result = await ImagePicker.launchCameraAsync({
                                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                    allowsEditing: isProfile,
                                    ...(isProfile && { aspect: [1, 1] }),
                                    quality: 0.7,
                                });

                                handleImageResult(result, type);
                            } catch (error) {
                                console.error('Camera error:', error);
                                Alert.alert('Error', 'Failed to open camera. Please try again.', [{ text: 'OK' }]);
                                setIsImageUploading(null);
                            }
                        },
                    },
                    {
                        text: 'Choose from Gallery',
                        onPress: async () => {
                            try {
                                const result = await ImagePicker.launchImageLibraryAsync({
                                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                    allowsEditing: isProfile,
                                    ...(isProfile && { aspect: [1, 1] }),
                                    quality: 0.7,
                                });

                                handleImageResult(result, type);
                            } catch (error) {
                                console.error('Image picker error:', error);
                                Alert.alert('Error', 'Failed to open image library. Please try again.', [{ text: 'OK' }]);
                                setIsImageUploading(null);
                            }
                        },
                    },
                ],
                { cancelable: true, onDismiss: () => setIsImageUploading(null) }
            );
        } catch (error) {
            console.error('Image upload error:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.', [{ text: 'OK' }]);
            setIsImageUploading(null);
        }
    };

    return {
        handleImageUpload,
        isImageUploading,
    };
}

