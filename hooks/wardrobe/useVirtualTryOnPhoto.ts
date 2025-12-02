/**
 * Custom hook for managing virtual try-on photo selection
 * Handles profile photo fetching, camera/gallery selection, and photo state
 *
 * @see https://reactnative.dev/docs/imagepicker - Expo Image Picker
 */

import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useGetProfile } from '@/api/profile/queries';

export function useVirtualTryOnPhoto() {
    const { data: profile, isLoading: isLoadingProfile, isFetching: isFetchingProfile } = useGetProfile();

    const [userPhoto, setUserPhoto] = useState<string | null>(null);
    const [hasUsedExistingPhoto, setHasUsedExistingPhoto] = useState(false);
    const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

    // Initialize photo from profile when available
    useEffect(() => {
        if (!isLoadingProfile && !isFetchingProfile) {
            setHasCheckedProfile(true);
            if (profile?.full_body_image_url && !hasUsedExistingPhoto && !userPhoto) {
                setUserPhoto(profile.full_body_image_url);
            }
        }
    }, [profile?.full_body_image_url, hasUsedExistingPhoto, isLoadingProfile, isFetchingProfile, userPhoto]);

    const handleUseExistingPhoto = () => {
        setHasUsedExistingPhoto(true);
        Alert.alert('Photo Ready', 'Using your existing full body photo for virtual try-on');
    };

    const handleSelectNewPhoto = async () => {
        Alert.alert(
            'Select New Photo',
            'Choose how you\'d like to upload a new photo',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Take Photo',
                    onPress: async () => {
                        try {
                            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

                            if (!permissionResult.granted) {
                                Alert.alert('Permission Required', 'Camera access is needed to take photos');
                                return;
                            }

                            const result = await ImagePicker.launchCameraAsync({
                                mediaTypes: 'images',
                                allowsEditing: false,
                                quality: 0.8,
                            });

                            if (!result.canceled && result.assets[0]) {
                                setUserPhoto(result.assets[0].uri);
                                setHasUsedExistingPhoto(true);
                                Alert.alert('Photo Taken', 'Photo captured successfully!');
                            }
                        } catch (error) {
                            console.error('Error taking photo:', error);
                            Alert.alert('Error', 'Failed to take photo');
                        }
                    }
                },
                {
                    text: 'Choose from Gallery',
                    onPress: async () => {
                        try {
                            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

                            if (!permissionResult.granted) {
                                Alert.alert('Permission Required', 'Photo library access is needed');
                                return;
                            }

                            const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: 'images',
                                quality: 0.8,
                                allowsEditing: false,
                            });

                            if (!result.canceled && result.assets[0]) {
                                setUserPhoto(result.assets[0].uri);
                                setHasUsedExistingPhoto(true);
                                Alert.alert('Photo Selected', 'Photo selected from gallery!');
                            }
                        } catch (error) {
                            console.error('Error selecting photo:', error);
                            Alert.alert('Error', 'Failed to select photo');
                        }
                    }
                }
            ]
        );
    };

    const handleSelectPhoto = () => {
        if (profile?.full_body_image_url && !hasUsedExistingPhoto) {
            Alert.alert(
                'Select Photo',
                'You have a saved full body photo. Would you like to use it or upload a new one?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Use Existing Photo',
                        onPress: handleUseExistingPhoto
                    },
                    {
                        text: 'Upload New Photo',
                        onPress: handleSelectNewPhoto
                    }
                ]
            );
        } else {
            handleSelectNewPhoto();
        }
    };

    const handleRemovePhoto = () => {
        setUserPhoto(null);
        setHasUsedExistingPhoto(false);
    };

    return {
        userPhoto,
        hasUsedExistingPhoto,
        hasCheckedProfile,
        isLoadingProfile,
        isFetchingProfile,
        hasExistingPhoto: !!profile?.full_body_image_url,
        handleSelectPhoto,
        handleUseExistingPhoto,
        handleSelectNewPhoto,
        handleRemovePhoto,
    };
}

