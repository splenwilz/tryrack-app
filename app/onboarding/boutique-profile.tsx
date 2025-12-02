/**
 * Boutique Profile Completion Screen
 * 
 * Collects boutique/business information after signup
 * 
 * Features:
 * - Business logo upload
 * - Business name and description
 * - Business address
 * - Contact information
 * - Business category/type
 * 
 * @see app/onboarding/profile-completion.tsx - Similar pattern for individual users
 * @see https://react-hook-form.com/ - React Hook Form documentation
 */

import { StyleSheet, View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ProfileImageUpload } from '@/components/onboarding';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '@/api/upload/services';
import { useGetBoutiqueProfile, useCreateBoutiqueProfile, useUpdateBoutiqueProfile } from '@/api/boutique-profile/queries';
import { queryKeys } from '@/api/utils/query-keys';

interface BoutiqueFormData {
    business_name: string;
    business_address: string;
    business_phone: string;
    business_email: string;
    business_category?: string; // Optional category
    logo_url?: string; // S3 URL after upload
}

export default function BoutiqueProfileScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const textColor = useThemeColor({}, 'text');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const cardBg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');
    const borderColor = useThemeColor({}, 'tabIconDefault');

    // Fetch existing boutique profile
    const { data: existingProfile } = useGetBoutiqueProfile();
    const createProfileMutation = useCreateBoutiqueProfile();
    const updateProfileMutation = useUpdateBoutiqueProfile();
    const { queryClient } = createProfileMutation;

    const [formData, setFormData] = useState<BoutiqueFormData>({
        business_name: '',
        business_address: '',
        business_phone: '',
        business_email: '',
        business_category: undefined,
        logo_url: undefined,
    });

    // Local state for logo before upload (for display)
    const [logoLocalUri, setLogoLocalUri] = useState<string | undefined>(undefined);

    const businessCategories = [
        'Fashion & Apparel',
        'Luxury Boutique',
        'Vintage & Thrift',
        'Designer Store',
        'Accessories',
        'Footwear',
        'Other',
    ];

    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof BoutiqueFormData, string>>>({});

    const handleImageUpload = async () => {
        try {
            setIsUploadingLogo(true);

            // Request media library permissions
            const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (mediaStatus !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'We need access to your photos to upload images. Please enable photo library access in your device settings.',
                    [{ text: 'OK' }]
                );
                setIsUploadingLogo(false);
                return;
            }

            // Show options (Camera or Gallery)
            Alert.alert(
                'Add Business Logo',
                'Choose an option',
                [
                    { text: 'Cancel', style: 'cancel', onPress: () => setIsUploadingLogo(false) },
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
                                    setIsUploadingLogo(false);
                                    return;
                                }

                                const result = await ImagePicker.launchCameraAsync({
                                    mediaTypes: 'images',
                                    allowsEditing: true,
                                    aspect: [1, 1],
                                    quality: 0.7,
                                });

                                if (!result.canceled && result.assets && result.assets.length > 0) {
                                    const asset = result.assets[0];
                                    // Validate file size (max 10MB)
                                    if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
                                        Alert.alert('File Too Large', 'Image must be smaller than 10MB. Please choose a smaller image.');
                                        setIsUploadingLogo(false);
                                        return;
                                    }
                                    setLogoLocalUri(asset.uri);
                                }
                                setIsUploadingLogo(false);
                            } catch (error) {
                                console.error('Camera error:', error);
                                Alert.alert('Error', 'Failed to open camera. Please try again.');
                                setIsUploadingLogo(false);
                            }
                        },
                    },
                    {
                        text: 'Choose from Gallery',
                        onPress: async () => {
                            try {
                                const result = await ImagePicker.launchImageLibraryAsync({
                                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                    allowsEditing: true,
                                    aspect: [1, 1],
                                    quality: 0.7,
                                });

                                if (!result.canceled && result.assets && result.assets.length > 0) {
                                    const asset = result.assets[0];
                                    // Validate file size (max 10MB)
                                    if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
                                        Alert.alert('File Too Large', 'Image must be smaller than 10MB. Please choose a smaller image.');
                                        setIsUploadingLogo(false);
                                        return;
                                    }
                                    setLogoLocalUri(asset.uri);
                                }
                                setIsUploadingLogo(false);
                            } catch (error) {
                                console.error('Image picker error:', error);
                                Alert.alert('Error', 'Failed to open image library. Please try again.');
                                setIsUploadingLogo(false);
                            }
                        },
                    },
                ],
                { cancelable: true, onDismiss: () => setIsUploadingLogo(false) }
            );
        } catch (error) {
            console.error('Image upload error:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            setIsUploadingLogo(false);
        }
    };


    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof BoutiqueFormData, string>> = {};

        if (!formData.business_name.trim()) {
            newErrors.business_name = 'Business name is required';
        }

        if (formData.business_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.business_email)) {
            newErrors.business_email = 'Please enter a valid email address';
        }

        if (formData.business_phone && !/^[\d\s\-\+\(\)]+$/.test(formData.business_phone)) {
            newErrors.business_phone = 'Please enter a valid phone number';
        }

        // Note: business_address is NOT validated in the frontend.
        // The backend will:
        // 1. Validate the address format
        // 2. Geocode the address to get coordinates
        // 3. Extract business_city, business_state, business_zip, business_country from geocoding
        // 4. Return appropriate errors if address is invalid or cannot be geocoded

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            // Upload logo to S3 if a local image was selected
            let logoUrl: string | null = formData.logo_url || null;

            if (logoLocalUri && !logoUrl) {
                try {
                    setIsUploadingLogo(true);
                    console.log('[Boutique Profile] Uploading logo to S3...');
                    logoUrl = await uploadImage({
                        imageUri: logoLocalUri,
                        folder: 'boutique-logos',
                    });
                    console.log('[Boutique Profile] Logo uploaded successfully:', logoUrl);
                    setFormData((prev) => ({ ...prev, logo_url: logoUrl || undefined }));
                } catch (uploadError) {
                    console.error('[Boutique Profile] Logo upload failed:', uploadError);
                    Alert.alert(
                        'Upload Error',
                        'Failed to upload logo. Please try again or continue without a logo.',
                        [
                            { text: 'Continue Without Logo', onPress: () => { } },
                            { text: 'Cancel', style: 'cancel', onPress: () => setIsSubmitting(false) },
                        ]
                    );
                    setIsUploadingLogo(false);
                    return;
                } finally {
                    setIsUploadingLogo(false);
                }
            }

            // Payload matches BoutiqueProfile model - only onboarding fields
            // Convert empty strings to undefined (not null) to match API schema
            const payload = {
                business_name: formData.business_name.trim() || undefined,
                business_address: formData.business_address.trim() || undefined,
                business_phone: formData.business_phone.trim() || undefined,
                business_email: formData.business_email.trim() || undefined,
                business_category: formData.business_category || undefined,
                logo_url: logoUrl || undefined, // S3 URL after upload
            };

            // Log payload for backend reference
            console.log('📤 Boutique Profile Payload:', JSON.stringify(payload, null, 2));
            console.log('📤 Payload (formatted):', payload);

            // Create or update boutique profile
            // Backend will:
            // 1. Validate the address format
            // 2. Geocode the address using a geocoding service (Google Maps, Mapbox, etc.)
            // 3. Extract business_city, business_state, business_zip, business_country from geocoding
            // 4. Store the coordinates (latitude, longitude) with the boutique profile
            // 5. Return appropriate errors if address is invalid or cannot be geocoded

            if (existingProfile) {
                // Update existing profile
                console.log('[Boutique Profile] Updating existing profile...');
                await updateProfileMutation.mutateAsync(payload);
            } else {
                // Create new profile
                console.log('[Boutique Profile] Creating new profile...');
                await createProfileMutation.mutateAsync(payload);
            }

            console.log('[Boutique Profile] Profile saved successfully');

            // Invalidate and refetch boutique profile
            await queryClient.invalidateQueries({
                queryKey: queryKeys.boutiqueProfile.current(),
            });

            // Navigate to boutique dashboard
            router.replace('/(boutique_tabs)/dashboard');
        } catch (error) {
            // Backend errors will include address validation/geocoding errors
            // Display them to the user for correction
            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to save boutique profile. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateField = <K extends keyof BoutiqueFormData>(field: K, value: BoutiqueFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
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
                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={() => {
                            Alert.alert(
                                'Skip Profile Setup?',
                                'You can complete your boutique profile later from settings.',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Skip', onPress: () => router.replace('/(boutique_tabs)/dashboard') },
                                ]
                            );
                        }}
                    >
                        <ThemedText style={[styles.skipText, { color: iconColor }]}>Skip</ThemedText>
                    </TouchableOpacity>
                    <ThemedText type="title" style={styles.title}>Set Up Your Boutique</ThemedText>
                    <View style={{ width: 60 }} />
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <ThemedText style={[styles.description, { color: iconColor }]}>
                        Complete your business profile to help customers discover your boutique. You can update these details anytime in your settings.
                    </ThemedText>

                    {/* Business Logo */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Business Logo</ThemedText>
                        <ThemedText style={[styles.sectionSubtitle, { color: iconColor }]}>
                            Upload your business logo to enhance brand visibility and customer recognition
                        </ThemedText>
                        <ProfileImageUpload
                            type="profile"
                            imageUri={logoLocalUri || formData.logo_url}
                            isUploading={isUploadingLogo}
                            onPress={handleImageUpload}
                            tintColor={tintColor}
                            iconColor={iconColor}
                        />
                    </View>

                    {/* Business Name */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Business Name *</ThemedText>
                        <ThemedText style={[styles.sectionSubtitle, { color: iconColor }]}>
                            Enter your official business or brand name as it should appear to customers
                        </ThemedText>
                        <View style={[styles.inputContainer, { backgroundColor: cardBg, borderColor: errors.business_name ? '#FF3B30' : borderColor }]}>
                            <TextInput
                                style={[styles.input, { color: textColor }]}
                                placeholder="Enter your business name"
                                placeholderTextColor={iconColor}
                                value={formData.business_name}
                                onChangeText={(value) => updateField('business_name', value)}
                                autoCapitalize="words"
                            />
                        </View>
                        {errors.business_name && (
                            <ThemedText style={[styles.errorText, { color: '#FF3B30' }]}>
                                {errors.business_name}
                            </ThemedText>
                        )}
                    </View>

                    {/* Business Category */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Business Category (Optional)</ThemedText>
                        <ThemedText style={[styles.sectionSubtitle, { color: iconColor }]}>
                            Select the category that best represents your business. This helps customers find you more easily
                        </ThemedText>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoryContainer}
                        >
                            {businessCategories.map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        styles.categoryChip,
                                        {
                                            backgroundColor: formData.business_category === category ? tintColor : cardBg,
                                            borderColor: formData.business_category === category ? tintColor : borderColor,
                                        },
                                    ]}
                                    onPress={() => updateField('business_category', category)}
                                >
                                    <ThemedText
                                        style={[
                                            styles.categoryText,
                                            {
                                                color: formData.business_category === category
                                                    ? (isDark ? '#000' : '#fff')
                                                    : textColor,
                                            },
                                        ]}
                                    >
                                        {category}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        {formData.business_category && (
                            <TouchableOpacity
                                style={styles.skipCategoryButton}
                                onPress={() => updateField('business_category', undefined)}
                            >
                                <ThemedText style={[styles.skipCategoryText, { color: iconColor }]}>
                                    Clear selection
                                </ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Contact Information */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Contact Information</ThemedText>
                        <ThemedText style={[styles.sectionSubtitle, { color: iconColor }]}>
                            Provide contact details so customers can reach your business
                        </ThemedText>

                        <View style={styles.inputRow}>
                            <View style={[styles.inputContainer, styles.halfWidth, { backgroundColor: cardBg, borderColor: errors.business_email ? '#FF3B30' : borderColor }]}>
                                <TextInput
                                    style={[styles.input, { color: textColor }]}
                                    placeholder="Business Email"
                                    placeholderTextColor={iconColor}
                                    value={formData.business_email}
                                    onChangeText={(value) => updateField('business_email', value)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            <View style={[styles.inputContainer, styles.halfWidth, { backgroundColor: cardBg, borderColor: errors.business_phone ? '#FF3B30' : borderColor }]}>
                                <TextInput
                                    style={[styles.input, { color: textColor }]}
                                    placeholder="Phone Number"
                                    placeholderTextColor={iconColor}
                                    value={formData.business_phone}
                                    onChangeText={(value) => updateField('business_phone', value)}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>
                        {errors.business_email && (
                            <ThemedText style={[styles.errorText, { color: '#FF3B30' }]}>
                                {errors.business_email}
                            </ThemedText>
                        )}
                        {errors.business_phone && (
                            <ThemedText style={[styles.errorText, { color: '#FF3B30' }]}>
                                {errors.business_phone}
                            </ThemedText>
                        )}
                    </View>

                    {/* Business Address */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Business Address (Optional)</ThemedText>
                        <ThemedText style={[styles.sectionSubtitle, { color: iconColor }]}>
                            Enter your primary business address. Additional locations can be added later.
                        </ThemedText>
                        <View style={[styles.textAreaContainer, { backgroundColor: cardBg, borderColor: borderColor }]}>
                            <TextInput
                                style={[styles.textArea, { color: textColor }]}
                                placeholder="Enter your business address (e.g., 123 Victoria Island, Lagos, Nigeria)"
                                placeholderTextColor={iconColor}
                                value={formData.business_address}
                                onChangeText={(value) => updateField('business_address', value)}
                                multiline
                                numberOfLines={2}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            { backgroundColor: tintColor },
                            (isSubmitting || isUploadingLogo || createProfileMutation.isPending || updateProfileMutation.isPending) && styles.saveButtonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={isSubmitting || isUploadingLogo || createProfileMutation.isPending || updateProfileMutation.isPending}
                    >
                        <IconSymbol name="checkmark.circle.fill" size={20} color={isDark ? "#000" : "#fff"} />
                        <ThemedText style={[styles.saveButtonText, { color: isDark ? "#000" : "#fff" }]}>
                            {isSubmitting || createProfileMutation.isPending || updateProfileMutation.isPending ? 'Saving...' : 'Complete Setup'}
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
    sectionSubtitle: {
        fontSize: 13,
        marginBottom: 12,
        opacity: 0.7,
    },
    inputContainer: {
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        minHeight: 50,
        justifyContent: 'center',
    },
    input: {
        fontSize: 16,
        paddingVertical: 12,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    textAreaContainer: {
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 100,
    },
    textArea: {
        fontSize: 16,
        minHeight: 80,
    },
    categoryContainer: {
        gap: 8,
        paddingVertical: 4,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
    },
    skipCategoryButton: {
        marginTop: 12,
        alignSelf: 'flex-start',
    },
    skipCategoryText: {
        fontSize: 13,
        textDecorationLine: 'underline',
        opacity: 0.7,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
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
        fontSize: 16,
        fontWeight: '600',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
});

