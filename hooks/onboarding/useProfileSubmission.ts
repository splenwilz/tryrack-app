import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useUploadImage } from '@/api/upload/queries';
import { useCreateProfile, useUpdateProfile, useGetProfile } from '@/api/profile/queries';
import { buildProfilePayload } from '@/components/onboarding/utils';
import type { ProfileFormValues } from '@/components/onboarding/types';
import type { UseFormSetError } from 'react-hook-form';

/**
 * Hook for handling profile form submission
 * 
 * Manages image uploads, payload building, and API submission
 * 
 * @param setError - React Hook Form setError function for error handling
 * @returns Object with submission handler and loading states
 * 
 * @see https://tanstack.com/query/latest/docs/react/guides/mutations - React Query mutations
 */
export function useProfileSubmission(setError: UseFormSetError<ProfileFormValues>) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { mutateAsync: uploadImageMutation, isPending: isUploadingImage } = useUploadImage();
    const { mutateAsync: createProfileMutation, isPending: isCreatingProfile } = useCreateProfile();
    const { mutateAsync: updateProfileMutation, isPending: isUpdatingProfile } = useUpdateProfile();
    const { data: existingProfile } = useGetProfile();
    
    // Check if profile already exists
    const hasExistingProfile = !!existingProfile;

    const handleSubmit = async (data: ProfileFormValues) => {
        setIsSubmitting(true);
        const submissionStartTime = Date.now();

        try {
            // Upload images in parallel if they are local file:// URIs
            // This reduces total time from sequential (image1 + image2) to parallel (max(image1, image2))
            let profilePictureUrl: string | undefined = data.profileImage;
            let fullBodyImageUrl: string | undefined = data.fullBodyImage;

            // Prepare upload promises for images that need uploading
            const uploadPromises: Promise<void>[] = [];

            if (profilePictureUrl?.startsWith('file://')) {
                uploadPromises.push(
                    uploadImageMutation({ imageUri: profilePictureUrl, folder: 'profile' })
                        .then((url) => {
                            profilePictureUrl = url;
                        })
                        .catch((error) => {
                            throw new Error(
                                `Profile picture upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                            );
                        })
                );
            }

            if (fullBodyImageUrl?.startsWith('file://')) {
                uploadPromises.push(
                    uploadImageMutation({ imageUri: fullBodyImageUrl, folder: 'images' })
                        .then((url) => {
                            fullBodyImageUrl = url;
                        })
                        .catch((error) => {
                            throw new Error(
                                `Full body image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                            );
                        })
                );
            }

            // Upload all images in parallel using Promise.all
            // This is faster than sequential uploads (max time instead of sum)
            if (uploadPromises.length > 0) {
                console.log(`[Profile] Starting parallel upload of ${uploadPromises.length} image(s)...`);
                const uploadStartTime = Date.now();
                await Promise.all(uploadPromises);
                const uploadDuration = Date.now() - uploadStartTime;
                console.log(`[Profile] Image uploads completed in ${uploadDuration}ms (parallel)`);
            }

            // Build profile payload using utility function
            const profilePayload = buildProfilePayload(data, profilePictureUrl, fullBodyImageUrl);

            // Submit profile to backend with uploaded image URLs
            console.log('[Profile] Submitting profile payload...');
            const profileStartTime = Date.now();
            
            // Use update if profile exists, otherwise create
            if (hasExistingProfile) {
                await updateProfileMutation(profilePayload);
                console.log('[Profile] Profile updated successfully');
            } else {
                await createProfileMutation(profilePayload);
                console.log('[Profile] Profile created successfully');
            }
            
            const profileDuration = Date.now() - profileStartTime;
            const totalDuration = Date.now() - submissionStartTime;
            console.log(`[Profile] Profile submission completed in ${profileDuration}ms`);
            console.log(`[Profile] Total submission time: ${totalDuration}ms`);

            // Show success message before redirecting
            // Use a small delay to ensure the success state is visible before navigation
            Alert.alert(
                'Profile Complete!',
                'Your profile has been saved successfully. You can now start exploring TryRack!',
                [
                    {
                        text: 'Get Started',
                        onPress: () => {
                            // Navigate to home screen on success
                            router.replace('/(tabs)');
                        },
                    },
                ],
                {
                    cancelable: false, // Prevent dismissing by tapping outside
                }
            );
        } catch (error) {
            const totalDuration = Date.now() - submissionStartTime;
            console.error(`[Profile] Profile submission error (after ${totalDuration}ms):`, error);

            // Extract error message
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to save profile. Please try again.';

            // Set error to root field for display in form
            setError('root', {
                type: 'manual',
                message: errorMessage,
            });

            // Also show alert for immediate feedback
            Alert.alert('Validation Error', errorMessage, [{ text: 'OK' }]);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        handleSubmit,
        isSubmitting,
        isUploadingImage,
        isCreatingProfile: isCreatingProfile || isUpdatingProfile,
    };
}

