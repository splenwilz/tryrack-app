import { StyleSheet, View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useWatch } from 'react-hook-form';
import { useProfileForm } from '@/hooks/onboarding/useProfileForm';
import { useProfileImageUpload } from '@/hooks/onboarding/useProfileImageUpload';
import { useProfileSubmission } from '@/hooks/onboarding/useProfileSubmission';
import { ProfileImageUpload, ProfileFormFields } from '@/components/onboarding';
import { router } from 'expo-router';
import { useGetProfile } from '@/api/profile/queries';
import { mapProfileToFormValues } from '@/components/onboarding/utils';
import { useEffect } from 'react';

/**
 * Profile Completion Screen
 * 
 * Collects user body measurements and personal details after signup
 * 
 * Features:
 * - Profile and full-body image upload
 * - Gender selection
 * - Gender-specific body measurements
 * - Clothing sizes
 * - Form validation using React Hook Form
 * 
 * @see https://react-hook-form.com/ - React Hook Form documentation
 * @see https://docs.expo.dev/versions/latest/sdk/image-picker/ - Expo Image Picker documentation
 */
export default function ProfileCompletionScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const textColor = useThemeColor({}, 'text');

    // Fetch existing profile
    const { data: existingProfile, isLoading: isLoadingProfile, refetch: refetchProfile, isRefetching } = useGetProfile();

    // Map existing profile to form values
    const defaultFormValues = existingProfile ? mapProfileToFormValues(existingProfile) : undefined;

    // Form management - initialize with existing profile data if available
    const {
        control,
        handleSubmit: formHandleSubmit,
        setValue,
        setError,
        reset,
        formState: { errors },
    } = useProfileForm(defaultFormValues);

    // Update form when profile data loads (for cases where profile loads after form initialization)
    useEffect(() => {
        if (existingProfile) {
            const formValues = mapProfileToFormValues(existingProfile);
            reset(formValues);
        }
    }, [existingProfile, reset]);

    // Use useWatch to reactively update when image values change
    const profileImage = useWatch({
        control,
        name: 'profileImage',
    });
    const fullBodyImage = useWatch({
        control,
        name: 'fullBodyImage',
    });

    // Image upload handling
    const { handleImageUpload, isImageUploading } = useProfileImageUpload(setValue);

    // Form submission handling
    const {
        handleSubmit,
        isSubmitting,
        isUploadingImage,
        isCreatingProfile,
    } = useProfileSubmission(setError);

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
                                'You can complete your profile later from settings.',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Skip', onPress: () => router.replace('/(tabs)') },
                                ]
                            );
                        }}
                    >
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
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={() => refetchProfile()}
                            tintColor={tintColor}
                        />
                    }
                >
                    <ThemedText style={[styles.description, { color: iconColor }]}>
                        Help us personalize your experience. Add details later from your profile settings for better recommendations.
                    </ThemedText>

                    {/* Profile Image */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Profile Photo</ThemedText>
                        <ProfileImageUpload
                            type="profile"
                            imageUri={profileImage}
                            isUploading={isImageUploading === 'profile'}
                            onPress={() => handleImageUpload('profile')}
                            tintColor={tintColor}
                            iconColor={iconColor}
                        />
                    </View>

                    {/* Full Body Photo for Try-On */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Full Body Photo (For Virtual Try-On)</ThemedText>
                        <ThemedText style={[styles.sectionSubtitle, { color: iconColor }]}>
                            Add a full-body photo to visualize outfits on yourself
                        </ThemedText>
                        <ProfileImageUpload
                            type="fullBody"
                            imageUri={fullBodyImage}
                            isUploading={isImageUploading === 'fullBody'}
                            onPress={() => handleImageUpload('fullBody')}
                            tintColor={tintColor}
                            iconColor={iconColor}
                        />
                    </View>

                    {/* Form Fields */}
                    <ProfileFormFields
                        control={control}
                        errors={errors}
                        textColor={textColor}
                        iconColor={iconColor}
                        tintColor={tintColor}
                    />

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
                            (isSubmitting || isCreatingProfile || isUploadingImage || isImageUploading) &&
                            styles.saveButtonDisabled,
                        ]}
                        onPress={formHandleSubmit(handleSubmit)}
                        disabled={
                            isSubmitting || isCreatingProfile || isUploadingImage || Boolean(isImageUploading)
                        }
                    >
                        <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
                        <ThemedText style={styles.saveButtonText}>
                            {isSubmitting || isCreatingProfile || isUploadingImage
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
    sectionSubtitle: {
        fontSize: 13,
        marginBottom: 12,
        opacity: 0.7,
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

