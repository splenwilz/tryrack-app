import { ActivityIndicator, Alert, Image, StyleSheet, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfileCompletionSchema, type ProfileCompletionRequest, type SizeStandard } from '@/api/profile/types';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import type { z } from 'zod';
import { useUploadImage } from '@/api/upload/queries';
import { useUpdateProfile } from '@/api/profile/queries';
import { router } from 'expo-router';

type ProfileFormValues = z.infer<typeof ProfileCompletionSchema>;

/**
 * Profile Completion Screen
 * Collects user body measurements and personal details after signup
 * 
 * Features:
 * - Profile and full-body image upload
 * - Gender selection
 * - Gender-specific body measurements
 * - Clothing sizes
 * - Form validation using React Hook Form and Zod
 * 
 * @see https://react-hook-form.com/ - Form validation library
 */
export default function ProfileCompletionScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const textColor = useThemeColor({}, 'text');

    const SIZE_STANDARD_OPTIONS: SizeStandard[] = ['US', 'UK', 'EU'];

    const formResolver = zodResolver(ProfileCompletionSchema) as Resolver<ProfileFormValues>;

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        setError,
        formState: { errors },
    } = useForm<ProfileFormValues>({
        resolver: formResolver,
        defaultValues: {
            gender: 'female',
            height: '',
            bust: '',
            waist: '',
            hips: '',
            chest: '',
            shoulderWidth: '',
            shoeSize: '',
            shirtSize: '',
            jacketSize: '',
            pantsSize: '',
            topSize: '',
            dressSize: '',
            profileImage: undefined,
            fullBodyImage: undefined,
            shoeSizeStandard: 'US',
            shirtSizeStandard: 'US',
            jacketSizeStandard: 'US',
            pantsSizeStandard: 'US',
            topSizeStandard: 'US',
            dressSizeStandard: 'US',
        },
    });

    const gender = watch('gender');
    const profileImage = watch('profileImage');
    const fullBodyImage = watch('fullBodyImage');

    const [isImageUploading, setIsImageUploading] = useState<'profile' | 'fullBody' | null>(null);

    // React Query hooks
    const { mutateAsync: uploadImageMutation, isPending: isUploadingImage } = useUploadImage();
    // const { mutateAsync: createProfileMutation, isPending: isCreatingProfile } = useCreateProfile();
    const { mutateAsync: updateProfileMutation, isPending: isUpdatingProfile } = useUpdateProfile();

    // Track submission state to disable button immediately
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toNumberOrUndefined = (value?: string) => {
        if (!value?.trim()) return undefined;
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    };

    const addSizeFields = (
        payload: Record<string, unknown>,
        keyPrefix: string,
        value?: string,
        standard?: SizeStandard
    ) => {
        if (!value) return;
        payload[`${keyPrefix}_size_value`] = value;
        payload[`${keyPrefix}_size_standard`] = standard ?? 'US';
    };

    const renderSizeStandardSelector = (
        value: SizeStandard | undefined,
        onChange: (standard: SizeStandard) => void
    ) => (
        <View style={styles.sizeStandardContainer}>
            {SIZE_STANDARD_OPTIONS.map((option) => (
                <TouchableOpacity
                    key={option}
                    style={[
                        styles.sizeStandardPill,
                        value === option && styles.sizeStandardPillActive,
                    ]}
                    onPress={() => onChange(option)}
                >
                    <ThemedText
                        style={[
                            styles.sizeStandardPillText,
                            value === option && styles.sizeStandardPillTextActive,
                        ]}
                    >
                        {option}
                    </ThemedText>
                </TouchableOpacity>
            ))}
        </View>
    );

    /**
     * Validates image before setting it in the form
     */
    const validateImage = (asset: ImagePicker.ImagePickerAsset, type: 'profile' | 'fullBody'): boolean => {
        // Validate file size (max 10MB)
        const maxSizeMB = 10;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (asset.fileSize && asset.fileSize > maxSizeBytes) {
            Alert.alert(
                'File Too Large',
                `Image must be smaller than ${maxSizeMB}MB. Please choose a smaller image or compress it.`,
                [{ text: 'OK' }]
            );
            return false;
        }

        // Validate dimensions for profile photos (minimum 200x200)
        if (type === 'profile') {
            const minDimension = 200;
            if (
                (asset.width && asset.width < minDimension) ||
                (asset.height && asset.height < minDimension)
            ) {
                Alert.alert(
                    'Image Too Small',
                    `Profile photo must be at least ${minDimension}x${minDimension} pixels.`,
                    [{ text: 'OK' }]
                );
                return false;
            }
        }

        return true;
    };

    /**
     * Handles the image picker result
     */
    const handleImageResult = (
        result: ImagePicker.ImagePickerResult,
        type: 'profile' | 'fullBody'
    ) => {
        // Check for user cancellation
        if (result.canceled) {
            setIsImageUploading(null);
            return;
        }

        // Validate result has assets
        if (!result.assets || result.assets.length === 0) {
            Alert.alert('Error', 'No image selected. Please try again.', [{ text: 'OK' }]);
            setIsImageUploading(null);
            return;
        }

        const asset = result.assets[0];

        // Validate image
        if (!validateImage(asset, type)) {
            setIsImageUploading(null);
            return;
        }

        // Set the image URI in the form
        const fieldName = type === 'profile' ? 'profileImage' : 'fullBodyImage';
        setValue(fieldName, asset.uri);
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
                                // Request camera permission
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

                                // Launch camera with appropriate settings
                                const result = await ImagePicker.launchCameraAsync({
                                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                    allowsEditing: isProfile,
                                    ...(isProfile && { aspect: [1, 1] }),
                                    quality: 0.7,
                                });

                                handleImageResult(result, type);
                            } catch (error) {
                                console.error('Camera error:', error);
                                Alert.alert(
                                    'Error',
                                    'Failed to open camera. Please try again.',
                                    [{ text: 'OK' }]
                                );
                                setIsImageUploading(null);
                            }
                        },
                    },
                    {
                        text: 'Choose from Gallery',
                        onPress: async () => {
                            try {
                                // Launch image picker with appropriate settings
                                const result = await ImagePicker.launchImageLibraryAsync({
                                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                    allowsEditing: isProfile, // Enable editing for profile photos only
                                    ...(isProfile && { aspect: [1, 1] }), // Square aspect only for profile photos
                                    quality: 0.7, // Balanced quality
                                });

                                handleImageResult(result, type);
                            } catch (error) {
                                console.error('Image picker error:', error);
                                Alert.alert(
                                    'Error',
                                    'Failed to open image library. Please try again.',
                                    [{ text: 'OK' }]
                                );
                                setIsImageUploading(null);
                            }
                        },
                    },
                ],
                { cancelable: true, onDismiss: () => setIsImageUploading(null) }
            );
        } catch (error) {
            console.error('Image upload error:', error);
            Alert.alert(
                'Error',
                'An unexpected error occurred. Please try again.',
                [{ text: 'OK' }]
            );
            setIsImageUploading(null);
        }
    };

    const onSubmit = async (data: ProfileFormValues) => {
        // Disable button immediately
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
                            throw new Error(`Profile picture upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
                            throw new Error(`Full body image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

            // Build measurements object
            const measurements: Record<string, number> = {};
            const addMeasurement = (key: string, value?: string) => {
                const numericValue = toNumberOrUndefined(value);
                if (typeof numericValue === 'number') {
                    measurements[key] = numericValue;
                }
            };

            addMeasurement('waist_cm', data.waist);
            if (data.gender === 'female') {
                addMeasurement('bust_cm', data.bust);
                addMeasurement('hips_cm', data.hips);
            }
            if (data.gender === 'male') {
                addMeasurement('chest_cm', data.chest);
                addMeasurement('shoulder_width_cm', data.shoulderWidth);
            }

            // Build profile payload with uploaded image URLs
            const profilePayload: Record<string, unknown> = {
                gender: data.gender,
                height_cm: toNumberOrUndefined(data.height),
                weight_kg: toNumberOrUndefined(data.weight),
                measurements: Object.keys(measurements).length ? measurements : undefined,
                profile_picture_url: profilePictureUrl,
                full_body_image_url: fullBodyImageUrl,
            };

            addSizeFields(profilePayload, 'shoe', data.shoeSize, data.shoeSizeStandard);
            addSizeFields(profilePayload, 'shirt', data.shirtSize, data.shirtSizeStandard);
            addSizeFields(profilePayload, 'jacket', data.jacketSize, data.jacketSizeStandard);
            addSizeFields(profilePayload, 'pants', data.pantsSize, data.pantsSizeStandard);
            addSizeFields(profilePayload, 'top', data.topSize, data.topSizeStandard);
            addSizeFields(profilePayload, 'dress', data.dressSize, data.dressSizeStandard);

            // Submit profile to backend with uploaded image URLs
            console.log('[Profile] Submitting profile payload...');
            const profileStartTime = Date.now();
            await updateProfileMutation(profilePayload as ProfileCompletionRequest);
            const profileDuration = Date.now() - profileStartTime;
            const totalDuration = Date.now() - submissionStartTime;
            console.log(`[Profile] Profile submission completed in ${profileDuration}ms`);
            console.log(`[Profile] Total submission time: ${totalDuration}ms`);

            // Navigate to home screen on success
            router.replace('/(tabs)');
        } catch (error) {
            const totalDuration = Date.now() - submissionStartTime;
            console.error(`[Profile] Profile submission error (after ${totalDuration}ms):`, error);

            // Extract error message
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to save profile. Please try again.';

            // Set error to root field for display in form
            setError('root', {
                type: 'manual',
                message: errorMessage,
            });

            // Also show alert for immediate feedback
            Alert.alert(
                'Validation Error',
                errorMessage,
                [{ text: 'OK' }]
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoider}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
            >
                <View style={styles.header}>
                    <TouchableOpacity style={styles.skipButton}>
                        <ThemedText style={[styles.skipText, { color: iconColor }]}>Skip</ThemedText>
                    </TouchableOpacity>
                    <ThemedText type="title" style={styles.title}>Set Up Your Profile</ThemedText>
                    <View style={{ width: 60 }} />
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <ThemedText style={[styles.description, { color: iconColor }]}>
                        Help us personalize your experience. Add details later from your profile settings for better recommendations.
                    </ThemedText>

                    {/* Profile Image */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Profile Photo</ThemedText>
                        <TouchableOpacity
                            style={styles.imageContainer}
                            onPress={() => handleImageUpload('profile')}
                            disabled={isImageUploading === 'profile'}
                            activeOpacity={0.7}
                        >
                            {isImageUploading === 'profile' ? (
                                <View style={[styles.imagePlaceholder, styles.loadingContainer]}>
                                    <ActivityIndicator size="large" color={tintColor} />
                                    <ThemedText style={[styles.placeholderText, { color: iconColor, marginTop: 8 }]}>
                                        Processing...
                                    </ThemedText>
                                </View>
                            ) : profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.profileImage} />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <IconSymbol name="camera.fill" size={40} color={iconColor} />
                                    <ThemedText style={[styles.placeholderText, { color: iconColor }]}>
                                        Tap to add photo
                                    </ThemedText>
                                </View>
                            )}
                            {!isImageUploading && (
                                <View style={[styles.editBadge, { backgroundColor: tintColor }]}>
                                    <IconSymbol name="pencil" size={16} color="white" />
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Full Body Photo for Try-On */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Full Body Photo (For Virtual Try-On)</ThemedText>
                        <ThemedText style={[styles.sectionSubtitle, { color: iconColor }]}>
                            Add a full-body photo to visualize outfits on yourself
                        </ThemedText>
                        <TouchableOpacity
                            style={styles.fullBodyImageContainer}
                            onPress={() => handleImageUpload('fullBody')}
                            disabled={isImageUploading === 'fullBody'}
                            activeOpacity={0.7}
                        >
                            {isImageUploading === 'fullBody' ? (
                                <View style={[styles.fullBodyImagePlaceholder, styles.loadingContainer]}>
                                    <ActivityIndicator size="large" color={tintColor} />
                                    <ThemedText style={[styles.placeholderText, { color: iconColor, marginTop: 8 }]}>
                                        Processing...
                                    </ThemedText>
                                </View>
                            ) : fullBodyImage ? (
                                <Image source={{ uri: fullBodyImage }} style={styles.fullBodyImage} />
                            ) : (
                                <View style={styles.fullBodyImagePlaceholder}>
                                    <IconSymbol name="camera.fill" size={40} color={iconColor} />
                                    <ThemedText style={[styles.placeholderText, { color: iconColor }]}>
                                        Tap to add full-body photo
                                    </ThemedText>
                                    <ThemedText style={[styles.placeholderHint, { color: iconColor }]}>
                                        Stand straight, full view
                                    </ThemedText>
                                </View>
                            )}
                            {!isImageUploading && fullBodyImage && (
                                <View style={[styles.editBadge, { backgroundColor: tintColor }]}>
                                    <IconSymbol name="pencil" size={16} color="white" />
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Gender Selection */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Gender *</ThemedText>
                        <ThemedText style={[styles.sectionSubtitle, { color: iconColor }]}>
                            This helps us provide better size recommendations
                        </ThemedText>
                        <View style={styles.genderContainer}>
                            <Controller
                                control={control}
                                name="gender"
                                render={({ field: { value, onChange } }) => (
                                    <>
                                        <TouchableOpacity
                                            style={[
                                                styles.genderButton,
                                                {
                                                    backgroundColor: value === 'male' ? tintColor : 'transparent',
                                                    borderColor: value === 'male' ? tintColor : iconColor
                                                }
                                            ]}
                                            onPress={() => onChange('male')}
                                        >
                                            <ThemedText style={[
                                                styles.genderText,
                                                { color: value === 'male' ? 'white' : iconColor }
                                            ]}>
                                                Male
                                            </ThemedText>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.genderButton,
                                                {
                                                    backgroundColor: value === 'female' ? tintColor : 'transparent',
                                                    borderColor: value === 'female' ? tintColor : iconColor
                                                }
                                            ]}
                                            onPress={() => onChange('female')}
                                        >
                                            <ThemedText style={[
                                                styles.genderText,
                                                { color: value === 'female' ? 'white' : iconColor }
                                            ]}>
                                                Female
                                            </ThemedText>
                                        </TouchableOpacity>
                                    </>
                                )}
                            />
                        </View>
                        {errors.gender?.message && (
                            <ThemedText style={[styles.errorText, { color: '#FF3B30' }]}>
                                {errors.gender?.message}
                            </ThemedText>
                        )}
                    </View>

                    {/* Body Measurements */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Body Measurements (Optional)</ThemedText>
                        <ThemedText style={[styles.sectionSubtitle, { color: iconColor }]}>
                            These measurements help us recommend clothes that fit you perfectly
                        </ThemedText>

                        <View style={styles.inputRow}>
                            <View style={styles.inputContainer}>
                                <ThemedText style={styles.inputLabel}>Height (cm)</ThemedText>
                                <Controller
                                    control={control}
                                    name="height"
                                    render={({ field: { onChange, value } }) => (
                                        <TextInput
                                            style={[
                                                styles.input,
                                                { color: textColor, borderColor: errors.height ? '#FF3B30' : iconColor }
                                            ]}
                                            placeholder="e.g., 165"
                                            placeholderTextColor={iconColor}
                                            keyboardType="numeric"
                                            value={value}
                                            onChangeText={onChange}
                                        />
                                    )}
                                />
                                {errors.height?.message && (
                                    <ThemedText style={[styles.errorText, { color: '#FF3B30' }]}>
                                        {errors.height?.message}
                                    </ThemedText>
                                )}
                            </View>
                            <View style={styles.inputContainer}>
                                <ThemedText style={styles.inputLabel}>Weight (kg)</ThemedText>
                                <Controller
                                    control={control}
                                    name="weight"
                                    render={({ field: { onChange, value } }) => (
                                        <TextInput
                                            style={[
                                                styles.input,
                                                { color: textColor, borderColor: errors.weight ? '#FF3B30' : iconColor }
                                            ]}
                                            placeholder="e.g., 60"
                                            placeholderTextColor={iconColor}
                                            keyboardType="numeric"
                                            value={value}
                                            onChangeText={onChange}
                                        />
                                    )}
                                />
                                {errors.weight?.message && (
                                    <ThemedText style={[styles.errorText, { color: '#FF3B30' }]}>
                                        {errors.weight?.message}
                                    </ThemedText>
                                )}
                            </View>
                        </View>

                        {/* Female Measurements */}
                        {gender === 'female' && (
                            <>
                                <View style={styles.inputRow}>
                                    <View style={styles.inputContainer}>
                                        <ThemedText style={styles.inputLabel}>Bust (cm)</ThemedText>
                                        <Controller
                                            control={control}
                                            name="bust"
                                            render={({ field: { onChange, value } }) => (
                                                <TextInput
                                                    style={[
                                                        styles.input,
                                                        { color: textColor, borderColor: errors.bust ? '#FF3B30' : iconColor }
                                                    ]}
                                                    placeholder="e.g., 90"
                                                    placeholderTextColor={iconColor}
                                                    keyboardType="numeric"
                                                    value={value}
                                                    onChangeText={onChange}
                                                />
                                            )}
                                        />
                                        {errors.bust?.message && (
                                            <ThemedText style={[styles.errorText, { color: '#FF3B30' }]}>
                                                {errors.bust?.message}
                                            </ThemedText>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.inputRow}>
                                    <View style={styles.inputContainer}>
                                        <ThemedText style={styles.inputLabel}>Waist (cm)</ThemedText>
                                        <Controller
                                            control={control}
                                            name="waist"
                                            render={({ field: { onChange, value } }) => (
                                                <TextInput
                                                    style={[
                                                        styles.input,
                                                        { color: textColor, borderColor: errors.waist ? '#FF3B30' : iconColor }
                                                    ]}
                                                    placeholder="e.g., 70"
                                                    placeholderTextColor={iconColor}
                                                    keyboardType="numeric"
                                                    value={value}
                                                    onChangeText={onChange}
                                                />
                                            )}
                                        />
                                        {errors.waist?.message && (
                                            <ThemedText style={[styles.errorText, { color: '#FF3B30' }]}>
                                                {errors.waist?.message}
                                            </ThemedText>
                                        )}
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <ThemedText style={styles.inputLabel}>Hips (cm)</ThemedText>
                                        <Controller
                                            control={control}
                                            name="hips"
                                            render={({ field: { onChange, value } }) => (
                                                <TextInput
                                                    style={[
                                                        styles.input,
                                                        { color: textColor, borderColor: errors.hips ? '#FF3B30' : iconColor }
                                                    ]}
                                                    placeholder="e.g., 95"
                                                    placeholderTextColor={iconColor}
                                                    keyboardType="numeric"
                                                    value={value}
                                                    onChangeText={onChange}
                                                />
                                            )}
                                        />
                                        {errors.hips?.message && (
                                            <ThemedText style={[styles.errorText, { color: '#FF3B30' }]}>
                                                {errors.hips?.message}
                                            </ThemedText>
                                        )}
                                    </View>
                                </View>
                            </>
                        )}

                        {/* Male Measurements */}
                        {gender === 'male' && (
                            <>
                                <View style={styles.inputRow}>
                                    <View style={styles.inputContainer}>
                                        <ThemedText style={styles.inputLabel}>Chest (cm)</ThemedText>
                                        <Controller
                                            control={control}
                                            name="chest"
                                            render={({ field: { onChange, value } }) => (
                                                <TextInput
                                                    style={[
                                                        styles.input,
                                                        { color: textColor, borderColor: errors.chest ? '#FF3B30' : iconColor }
                                                    ]}
                                                    placeholder="e.g., 100"
                                                    placeholderTextColor={iconColor}
                                                    keyboardType="numeric"
                                                    value={value}
                                                    onChangeText={onChange}
                                                />
                                            )}
                                        />
                                        {errors.chest?.message && (
                                            <ThemedText style={[styles.errorText, { color: '#FF3B30' }]}>
                                                {errors.chest?.message}
                                            </ThemedText>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.inputRow}>
                                    <View style={styles.inputContainer}>
                                        <ThemedText style={styles.inputLabel}>Waist (cm)</ThemedText>
                                        <Controller
                                            control={control}
                                            name="waist"
                                            render={({ field: { onChange, value } }) => (
                                                <TextInput
                                                    style={[
                                                        styles.input,
                                                        { color: textColor, borderColor: errors.waist ? '#FF3B30' : iconColor }
                                                    ]}
                                                    placeholder="e.g., 85"
                                                    placeholderTextColor={iconColor}
                                                    keyboardType="numeric"
                                                    value={value}
                                                    onChangeText={onChange}
                                                />
                                            )}
                                        />
                                        {errors.waist?.message && (
                                            <ThemedText style={[styles.errorText, { color: '#FF3B30' }]}>
                                                {errors.waist?.message}
                                            </ThemedText>
                                        )}
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <ThemedText style={styles.inputLabel}>Shoulder Width (cm)</ThemedText>
                                        <Controller
                                            control={control}
                                            name="shoulderWidth"
                                            render={({ field: { onChange, value } }) => (
                                                <TextInput
                                                    style={[
                                                        styles.input,
                                                        { color: textColor, borderColor: errors.shoulderWidth ? '#FF3B30' : iconColor }
                                                    ]}
                                                    placeholder="e.g., 45"
                                                    placeholderTextColor={iconColor}
                                                    keyboardType="numeric"
                                                    value={value}
                                                    onChangeText={onChange}
                                                />
                                            )}
                                        />
                                        {errors.shoulderWidth?.message && (
                                            <ThemedText style={[styles.errorText, { color: '#FF3B30' }]}>
                                                {errors.shoulderWidth?.message}
                                            </ThemedText>
                                        )}
                                    </View>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Clothing Sizes */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Clothing Sizes</ThemedText>
                        <ThemedText style={[styles.sectionSubtitle, { color: iconColor }]}>
                            Help us recommend clothes that fit you perfectly. Choose your preferred sizing standard for each item.
                        </ThemedText>

                        {/* Common: Shoe Size */}
                        <View style={styles.inputRow}>
                            <View style={styles.inputContainer}>
                                <View style={styles.sizeHeader}>
                                    <ThemedText style={styles.inputLabel}>Shoe Size</ThemedText>
                                    <Controller
                                        control={control}
                                        name="shoeSizeStandard"
                                        render={({ field: { value, onChange } }) =>
                                            renderSizeStandardSelector(value, onChange)
                                        }
                                    />
                                </View>
                                <Controller
                                    control={control}
                                    name="shoeSize"
                                    render={({ field: { onChange, value } }) => (
                                        <TextInput
                                            style={[styles.input, { color: textColor, borderColor: iconColor }]}
                                            placeholder={gender === 'male' ? "e.g., 10" : "e.g., 7"}
                                            placeholderTextColor={iconColor}
                                            keyboardType="numeric"
                                            value={value}
                                            onChangeText={onChange}
                                        />
                                    )}
                                />
                            </View>
                        </View>

                        {/* Gender-specific: Male Sizes */}
                        {gender === 'male' && (
                            <>
                                <View style={styles.inputRow}>
                                    <View style={styles.inputContainer}>
                                        <View style={styles.sizeHeader}>
                                            <ThemedText style={styles.inputLabel}>Shirt Size</ThemedText>
                                            <Controller
                                                control={control}
                                                name="shirtSizeStandard"
                                                render={({ field: { value, onChange } }) =>
                                                    renderSizeStandardSelector(value, onChange)
                                                }
                                            />
                                        </View>
                                        <Controller
                                            control={control}
                                            name="shirtSize"
                                            render={({ field: { onChange, value } }) => (
                                                <TextInput
                                                    style={[styles.input, { color: textColor, borderColor: iconColor }]}
                                                    placeholder="e.g., M"
                                                    placeholderTextColor={iconColor}
                                                    value={value}
                                                    onChangeText={onChange}
                                                />
                                            )}
                                        />
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <View style={styles.sizeHeader}>
                                            <ThemedText style={styles.inputLabel}>Jacket/Blazer Size</ThemedText>
                                            <Controller
                                                control={control}
                                                name="jacketSizeStandard"
                                                render={({ field: { value, onChange } }) =>
                                                    renderSizeStandardSelector(value, onChange)
                                                }
                                            />
                                        </View>
                                        <Controller
                                            control={control}
                                            name="jacketSize"
                                            render={({ field: { onChange, value } }) => (
                                                <TextInput
                                                    style={[styles.input, { color: textColor, borderColor: iconColor }]}
                                                    placeholder="e.g., 40"
                                                    placeholderTextColor={iconColor}
                                                    value={value}
                                                    onChangeText={onChange}
                                                />
                                            )}
                                        />
                                    </View>
                                </View>
                                <View style={styles.inputRow}>
                                    <View style={styles.inputContainer}>
                                        <View style={styles.sizeHeader}>
                                            <ThemedText style={styles.inputLabel}>Pants Size (Waist × Inseam)</ThemedText>
                                            <Controller
                                                control={control}
                                                name="pantsSizeStandard"
                                                render={({ field: { value, onChange } }) =>
                                                    renderSizeStandardSelector(value, onChange)
                                                }
                                            />
                                        </View>
                                        <Controller
                                            control={control}
                                            name="pantsSize"
                                            render={({ field: { onChange, value } }) => (
                                                <TextInput
                                                    style={[styles.input, { color: textColor, borderColor: iconColor }]}
                                                    placeholder="e.g., 32x30"
                                                    placeholderTextColor={iconColor}
                                                    value={value}
                                                    onChangeText={onChange}
                                                />
                                            )}
                                        />
                                    </View>
                                </View>
                            </>
                        )}

                        {/* Gender-specific: Female Sizes */}
                        {gender === 'female' && (
                            <>
                                <View style={styles.inputRow}>
                                    <View style={styles.inputContainer}>
                                        <View style={styles.sizeHeader}>
                                            <ThemedText style={styles.inputLabel}>Top/Blouse Size</ThemedText>
                                            <Controller
                                                control={control}
                                                name="topSizeStandard"
                                                render={({ field: { value, onChange } }) =>
                                                    renderSizeStandardSelector(value, onChange)
                                                }
                                            />
                                        </View>
                                        <Controller
                                            control={control}
                                            name="topSize"
                                            render={({ field: { onChange, value } }) => (
                                                <TextInput
                                                    style={[styles.input, { color: textColor, borderColor: iconColor }]}
                                                    placeholder="e.g., M"
                                                    placeholderTextColor={iconColor}
                                                    value={value}
                                                    onChangeText={onChange}
                                                />
                                            )}
                                        />
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <View style={styles.sizeHeader}>
                                            <ThemedText style={styles.inputLabel}>Dress Size</ThemedText>
                                            <Controller
                                                control={control}
                                                name="dressSizeStandard"
                                                render={({ field: { value, onChange } }) =>
                                                    renderSizeStandardSelector(value, onChange)
                                                }
                                            />
                                        </View>
                                        <Controller
                                            control={control}
                                            name="dressSize"
                                            render={({ field: { onChange, value } }) => (
                                                <TextInput
                                                    style={[styles.input, { color: textColor, borderColor: iconColor }]}
                                                    placeholder="e.g., 8"
                                                    placeholderTextColor={iconColor}
                                                    value={value}
                                                    onChangeText={onChange}
                                                />
                                            )}
                                        />
                                    </View>
                                </View>
                                <View style={styles.inputRow}>
                                    <View style={styles.inputContainer}>
                                        <View style={styles.sizeHeader}>
                                            <ThemedText style={styles.inputLabel}>Pants/Jeans Size</ThemedText>
                                            <Controller
                                                control={control}
                                                name="pantsSizeStandard"
                                                render={({ field: { value, onChange } }) =>
                                                    renderSizeStandardSelector(value, onChange)
                                                }
                                            />
                                        </View>
                                        <Controller
                                            control={control}
                                            name="pantsSize"
                                            render={({ field: { onChange, value } }) => (
                                                <TextInput
                                                    style={[styles.input, { color: textColor, borderColor: iconColor }]}
                                                    placeholder="e.g., 28 or 28x30"
                                                    placeholderTextColor={iconColor}
                                                    value={value}
                                                    onChangeText={onChange}
                                                />
                                            )}
                                        />
                                    </View>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Root Error Display */}
                    {errors.root && (
                        <View style={styles.errorContainer}>
                            <ThemedText style={[styles.errorText, { color: '#FF3B30' }]}>
                                {errors.root.message}
                            </ThemedText>
                        </View>
                    )}

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            { backgroundColor: tintColor },
                            (isSubmitting || isUpdatingProfile || isUploadingImage || isImageUploading) && styles.saveButtonDisabled
                        ]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isSubmitting || isUpdatingProfile || isUploadingImage || Boolean(isImageUploading)}
                    >
                        <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
                        <ThemedText style={styles.saveButtonText}>
                            {isSubmitting || isUpdatingProfile || isUploadingImage
                                ? 'Saving...'
                                : 'Complete Profile'}
                        </ThemedText>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    keyboardAvoider: {
        flex: 1,
    },
    skipButton: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    skipText: {
        fontSize: 16,
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    contentContainer: {
        paddingBottom: 0,
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 8,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f0f0f0',
    },
    imagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E5E5EA',
        borderStyle: 'dashed',
    },
    placeholderText: {
        marginTop: 8,
        fontSize: 12,
    },
    sectionSubtitle: {
        fontSize: 13,
        marginBottom: 12,
        opacity: 0.7,
    },
    fullBodyImageContainer: {
        alignItems: 'center',
        marginBottom: 8,
        position: 'relative',
    },
    fullBodyImage: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    fullBodyImagePlaceholder: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E5E5EA',
        borderStyle: 'dashed',
    },
    placeholderHint: {
        marginTop: 4,
        fontSize: 11,
        opacity: 0.6,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    genderContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    genderButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    genderText: {
        fontSize: 15,
        fontWeight: '600',
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    inputContainer: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    sizeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    sizeStandardContainer: {
        flexDirection: 'row',
        gap: 6,
        flexShrink: 0,
    },
    sizeStandardPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#CCCCCC',
    },
    sizeStandardPillActive: {
        backgroundColor: '#111111',
        borderColor: '#111111',
    },
    sizeStandardPillText: {
        fontSize: 12,
        color: '#666666',
    },
    sizeStandardPillTextActive: {
        color: '#FFFFFF',
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
    },
    errorContainer: {
        marginTop: 16,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#FFEBEE',
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        marginTop: 24,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
});

