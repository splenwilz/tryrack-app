import { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { CustomHeader } from '@/components/custom-header';
import { useGetBoutiqueProfile, useUpdateBoutiqueProfile } from '@/api/boutique-profile/queries';
import { useSignout } from '@/api/auth/signout/queries';
import { uploadImage } from '@/api/upload/services';
import * as ImagePicker from 'expo-image-picker';
import { queryKeys } from '@/api/utils/query-keys';
import { SimplePicker } from '@/components/boutique/SimplePicker';
import { CURRENCIES, LANGUAGES } from '@/constants/boutique';

/**
 * Boutique Profile Screen
 * Allows boutique owners to manage their business profile, company information, and settings
 * Based on blueprint requirements for boutique business management
 */
export default function BoutiqueProfileScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const cardBg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const textColor = useThemeColor({}, 'text');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // API hooks
    const { data: profile, isLoading: isLoadingProfile, error: profileError } = useGetBoutiqueProfile();
    const updateProfileMutation = useUpdateBoutiqueProfile();
    const { queryClient } = updateProfileMutation;
    const { mutateAsync: signoutMutation, isPending: isSigningOut } = useSignout();

    // Local state for form data
    const [boutiqueInfo, setBoutiqueInfo] = useState({
        businessName: '',
        businessCategory: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        currency: '',
        language: '',
        socialLinks: {
            instagram: '',
            facebook: '',
            twitter: '',
        },
    });

    // Logo state
    const [logoLocalUri, setLogoLocalUri] = useState<string | undefined>(undefined);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    // Cover image state
    const [coverLocalUri, setCoverLocalUri] = useState<string | undefined>(undefined);
    const [isUploadingCover, setIsUploadingCover] = useState(false);

    const [isSaving, setIsSaving] = useState(false);

    // Picker modals state
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
    const [showLanguagePicker, setShowLanguagePicker] = useState(false);

    // Load profile data when it's available
    useEffect(() => {
        if (profile) {
            setBoutiqueInfo({
                businessName: profile.business_name || '',
                businessCategory: profile.business_category || '',
                email: profile.business_email || '',
                phone: profile.business_phone || '',
                address: profile.business_address || '',
                website: profile.business_website || '',
                currency: profile.currency || '',
                language: profile.language || '',
                socialLinks: {
                    instagram: profile.business_social_media?.instagram || '',
                    facebook: profile.business_social_media?.facebook || '',
                    twitter: profile.business_social_media?.twitter || '',
                },
            });
        }
    }, [profile]);

    const handleBackPress = () => {
        router.back();
    };

    const handleCoverImageUpload = async () => {
        try {
            setIsUploadingCover(true);

            // Request media library permissions
            const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (mediaStatus !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'We need access to your photos to upload images. Please enable photo library access in your device settings.',
                    [{ text: 'OK' }]
                );
                setIsUploadingCover(false);
                return;
            }

            // Show options (Camera or Gallery)
            Alert.alert(
                'Add Cover Image',
                'Choose an option',
                [
                    { text: 'Cancel', style: 'cancel', onPress: () => setIsUploadingCover(false) },
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
                                    setIsUploadingCover(false);
                                    return;
                                }

                                const result = await ImagePicker.launchCameraAsync({
                                    mediaTypes: 'images',
                                    allowsEditing: true,
                                    aspect: [16, 9], // Cover images are typically wider
                                    quality: 0.7,
                                });

                                if (!result.canceled && result.assets && result.assets.length > 0) {
                                    const asset = result.assets[0];
                                    if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
                                        Alert.alert('File Too Large', 'Image must be smaller than 10MB. Please choose a smaller image.');
                                        setIsUploadingCover(false);
                                        return;
                                    }
                                    setCoverLocalUri(asset.uri);
                                }
                                setIsUploadingCover(false);
                            } catch (error) {
                                console.error('Camera error:', error);
                                Alert.alert('Error', 'Failed to open camera. Please try again.');
                                setIsUploadingCover(false);
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
                                    aspect: [16, 9], // Cover images are typically wider
                                    quality: 0.7,
                                });

                                if (!result.canceled && result.assets && result.assets.length > 0) {
                                    const asset = result.assets[0];
                                    if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
                                        Alert.alert('File Too Large', 'Image must be smaller than 10MB. Please choose a smaller image.');
                                        setIsUploadingCover(false);
                                        return;
                                    }
                                    setCoverLocalUri(asset.uri);
                                }
                                setIsUploadingCover(false);
                            } catch (error) {
                                console.error('Image picker error:', error);
                                Alert.alert('Error', 'Failed to open image library. Please try again.');
                                setIsUploadingCover(false);
                            }
                        },
                    },
                ],
                { cancelable: true, onDismiss: () => setIsUploadingCover(false) }
            );
        } catch (error) {
            console.error('Cover image upload error:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            setIsUploadingCover(false);
        }
    };

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

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            // Upload logo to S3 if a local image was selected
            let logoUrl: string | undefined = profile?.logo_url || undefined;

            if (logoLocalUri) {
                try {
                    setIsUploadingLogo(true);
                    console.log('[Boutique Profile] Uploading logo to S3...');
                    logoUrl = await uploadImage({
                        imageUri: logoLocalUri,
                        folder: 'boutique-logos',
                    });
                    console.log('[Boutique Profile] Logo uploaded successfully:', logoUrl);
                } catch (uploadError) {
                    console.error('[Boutique Profile] Logo upload failed:', uploadError);
                    Alert.alert(
                        'Upload Error',
                        'Failed to upload logo. Please try again or continue without updating the logo.',
                        [
                            { text: 'Continue Without Logo', onPress: () => { } },
                            { text: 'Cancel', style: 'cancel', onPress: () => setIsSaving(false) },
                        ]
                    );
                    setIsUploadingLogo(false);
                    return;
                } finally {
                    setIsUploadingLogo(false);
                }
            }

            // Upload cover image to S3 if a local image was selected
            let coverImageUrl: string | undefined = profile?.cover_image_url || undefined;

            if (coverLocalUri) {
                try {
                    setIsUploadingCover(true);
                    console.log('[Boutique Profile] Uploading cover image to S3...');
                    coverImageUrl = await uploadImage({
                        imageUri: coverLocalUri,
                        folder: 'boutique-covers',
                    });
                    console.log('[Boutique Profile] Cover image uploaded successfully:', coverImageUrl);
                } catch (uploadError) {
                    console.error('[Boutique Profile] Cover image upload failed:', uploadError);
                    Alert.alert(
                        'Upload Error',
                        'Failed to upload cover image. Please try again or continue without updating the cover image.',
                        [
                            { text: 'Continue Without Cover', onPress: () => { } },
                            { text: 'Cancel', style: 'cancel', onPress: () => setIsSaving(false) },
                        ]
                    );
                    setIsUploadingCover(false);
                    return;
                } finally {
                    setIsUploadingCover(false);
                }
            }

            // Build social media object (only include non-empty values)
            const socialMedia: Record<string, string> = {};
            if (boutiqueInfo.socialLinks.instagram.trim()) {
                socialMedia.instagram = boutiqueInfo.socialLinks.instagram.trim();
            }
            if (boutiqueInfo.socialLinks.facebook.trim()) {
                socialMedia.facebook = boutiqueInfo.socialLinks.facebook.trim();
            }
            if (boutiqueInfo.socialLinks.twitter.trim()) {
                socialMedia.twitter = boutiqueInfo.socialLinks.twitter.trim();
            }

            // Prepare payload matching backend model
            const payload = {
                business_name: boutiqueInfo.businessName.trim() || undefined,
                business_category: boutiqueInfo.businessCategory.trim() || undefined,
                business_email: boutiqueInfo.email.trim() || undefined,
                business_phone: boutiqueInfo.phone.trim() || undefined,
                business_address: boutiqueInfo.address.trim() || undefined,
                business_website: boutiqueInfo.website.trim() || undefined,
                business_social_media: Object.keys(socialMedia).length > 0 ? socialMedia : undefined,
                logo_url: logoUrl,
                cover_image_url: coverImageUrl,
                currency: boutiqueInfo.currency.trim() || undefined,
                language: boutiqueInfo.language.trim() || undefined,
            };

            console.log('[Boutique Profile] Updating profile...', payload);

            // Update profile
            await updateProfileMutation.mutateAsync(payload);

            // Invalidate and refetch boutique profile
            await queryClient.invalidateQueries({
                queryKey: queryKeys.boutiqueProfile.current(),
            });

            // Clear local image URIs since they're now uploaded
            setLogoLocalUri(undefined);
            setCoverLocalUri(undefined);

            Alert.alert('Success', 'Boutique profile updated successfully!');
        } catch (error) {
            console.error('[Boutique Profile] Update failed:', error);
            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to update boutique profile. Please try again.'
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleSwitchToIndividual = () => {
        console.log('handleSwitchToIndividual called');

        // Use setTimeout to ensure Alert is shown after current execution context
        setTimeout(() => {
            Alert.alert(
                'Switch to Individual Mode',
                'Switch to individual mode? You can always switch back in settings.',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => console.log('Cancelled mode switch')
                    },
                    {
                        text: 'Switch',
                        onPress: async () => {
                            console.log('Switching to individual mode...');
                            try {
                                // await setUserType('individual');
                                console.log('User type set, navigating...');
                                router.replace('/(tabs)');
                            } catch (error) {
                                console.error('Error switching mode:', error);
                                Alert.alert('Error', 'Failed to switch mode. Please try again.');
                            }
                        }
                    }
                ]
            );
        }, 100);
    };

    const handleLogout = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signoutMutation();
                            router.replace('/auth/signin');
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert(
                                'Error',
                                error instanceof Error ? error.message : 'Failed to sign out. Please try again.'
                            );
                        }
                    },
                },
            ]
        );
    };

    const handleNavigateToPrivacy = () => {
        console.log('handleNavigateToPrivacy called');
        // router.push('/(boutique)/privacy-security');

    };

    const handleNavigateToHelp = () => {
        console.log('handleNavigateToHelp called');
        // router.push('/(boutique)/help-support');
    };

    const handleNavigateToAbout = () => {
        console.log('handleNavigateToAbout called');
        // router.push('/(boutique)/about');
    };

    // Show loading state while fetching profile
    if (isLoadingProfile) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <CustomHeader
                    title="Boutique Profile"
                    showBackButton={true}
                    onBackPress={handleBackPress}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={tintColor} />
                    <ThemedText style={[styles.loadingText, { color: iconColor }]}>Loading profile...</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    // Show error state if profile fetch failed
    if (profileError) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <CustomHeader
                    title="Boutique Profile"
                    showBackButton={true}
                    onBackPress={handleBackPress}
                />
                <View style={styles.errorContainer}>
                    <IconSymbol name="exclamationmark.triangle.fill" size={48} color="#FF3B30" />
                    <ThemedText style={[styles.errorText, { color: textColor }]}>
                        Failed to load profile. Please try again.
                    </ThemedText>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: tintColor }]}
                        onPress={() => {
                            // Refetch will happen automatically
                            queryClient.invalidateQueries({
                                queryKey: queryKeys.boutiqueProfile.current(),
                            });
                        }}
                    >
                        <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <CustomHeader
                title="Boutique Profile"
                showBackButton={true}
                onBackPress={handleBackPress}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Business Profile Section */}
                <View
                    style={[
                        styles.section,
                        {
                            backgroundColor,
                            shadowColor: isDark ? '#000' : '#000',
                            shadowOpacity: isDark ? 0.3 : 0.1,
                        },
                    ]}
                >
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Business Profile
                    </ThemedText>

                    {/* Cover Image with Overlapping Logo */}
                    <View style={styles.coverAndLogoContainer}>
                        {/* Cover Image */}
                        <View style={styles.coverImageWrapper}>
                            {(coverLocalUri || profile?.cover_image_url) ? (
                                <Image
                                    source={{ uri: coverLocalUri || profile?.cover_image_url || '' }}
                                    style={styles.coverImage}
                                />
                            ) : (
                                <View style={[styles.coverPlaceholder, { backgroundColor: tintColor + '20' }]}>
                                    <IconSymbol name="photo.fill" size={40} color={tintColor} />
                                    <ThemedText style={[styles.coverPlaceholderText, { color: iconColor }]}>
                                        No cover image
                                    </ThemedText>
                                </View>
                            )}

                            {/* Cover Edit Button */}
                            <TouchableOpacity
                                style={[
                                    styles.coverEditButton,
                                    { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)' },
                                ]}
                                onPress={handleCoverImageUpload}
                                disabled={isUploadingCover}
                            >
                                {isUploadingCover ? (
                                    <ActivityIndicator size="small" color={isDark ? '#fff' : tintColor} />
                                ) : (
                                    <IconSymbol name="pencil" size={16} color={isDark ? '#fff' : tintColor} />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Logo - Overlapping Cover Image */}
                        <View style={[styles.logoContainer, { backgroundColor: cardBg }]}>
                            {(logoLocalUri || profile?.logo_url) ? (
                                <Image
                                    source={{ uri: logoLocalUri || profile?.logo_url || '' }}
                                    style={styles.logoImage}
                                />
                            ) : (
                                <View style={[styles.logoPlaceholder, { backgroundColor: tintColor + '20' }]}>
                                    <IconSymbol name="building.2.fill" size={32} color={tintColor} />
                                </View>
                            )}

                            {/* Logo Edit Button */}
                            <TouchableOpacity
                                style={[
                                    styles.logoEditButton,
                                    { backgroundColor: isDark ? '#0a7ea4' : tintColor },
                                ]}
                                onPress={handleImageUpload}
                                disabled={isUploadingLogo}
                            >
                                {isUploadingLogo ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <IconSymbol name="pencil" size={12} color="#fff" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Spacer for overlapping logo */}
                    <View style={styles.logoSpacer} />

                    {/* Business Information */}
                    <View style={styles.infoRow}>
                        <ThemedText style={styles.label}>Business Name</ThemedText>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : backgroundColor,
                                    color: textColor,
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                },
                            ]}
                            value={boutiqueInfo.businessName}
                            onChangeText={(text) => setBoutiqueInfo({ ...boutiqueInfo, businessName: text })}
                            placeholder="Business Name"
                            placeholderTextColor={iconColor}
                        />
                    </View>

                    <View style={styles.infoRow}>
                        <ThemedText style={styles.label}>Business Category</ThemedText>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : backgroundColor,
                                    color: textColor,
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                },
                            ]}
                            value={boutiqueInfo.businessCategory}
                            onChangeText={(text) => setBoutiqueInfo({ ...boutiqueInfo, businessCategory: text })}
                            placeholder="Business Category"
                            placeholderTextColor={iconColor}
                        />
                    </View>
                </View>

                {/* Contact Information */}
                <View
                    style={[
                        styles.section,
                        {
                            backgroundColor,
                            shadowColor: isDark ? '#000' : '#000',
                            shadowOpacity: isDark ? 0.3 : 0.1,
                        },
                    ]}
                >
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Contact Information
                    </ThemedText>

                    <View style={styles.infoRow}>
                        <ThemedText style={styles.label}>Email</ThemedText>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : backgroundColor,
                                    color: textColor,
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                },
                            ]}
                            value={boutiqueInfo.email}
                            onChangeText={(text) => setBoutiqueInfo({ ...boutiqueInfo, email: text })}
                            placeholder="Email"
                            placeholderTextColor={iconColor}
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.infoRow}>
                        <ThemedText style={styles.label}>Phone</ThemedText>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : backgroundColor,
                                    color: textColor,
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                },
                            ]}
                            value={boutiqueInfo.phone}
                            onChangeText={(text) => setBoutiqueInfo({ ...boutiqueInfo, phone: text })}
                            placeholder="Phone"
                            placeholderTextColor={iconColor}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.infoRow}>
                        <ThemedText style={styles.label}>Address</ThemedText>
                        <TextInput
                            style={[
                                styles.textArea,
                                {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : backgroundColor,
                                    color: textColor,
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                },
                            ]}
                            value={boutiqueInfo.address}
                            onChangeText={(text) => setBoutiqueInfo({ ...boutiqueInfo, address: text })}
                            placeholder="Business Address"
                            placeholderTextColor={iconColor}
                            multiline
                            numberOfLines={2}
                        />
                    </View>

                    <View style={styles.infoRow}>
                        <ThemedText style={styles.label}>Website</ThemedText>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : backgroundColor,
                                    color: textColor,
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                },
                            ]}
                            value={boutiqueInfo.website}
                            onChangeText={(text) => setBoutiqueInfo({ ...boutiqueInfo, website: text })}
                            placeholder="Website"
                            placeholderTextColor={iconColor}
                            keyboardType="url"
                        />
                    </View>
                </View>

                {/* Business Settings */}
                <View
                    style={[
                        styles.section,
                        {
                            backgroundColor,
                            shadowColor: isDark ? '#000' : '#000',
                            shadowOpacity: isDark ? 0.3 : 0.1,
                        },
                    ]}
                >
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Business Settings
                    </ThemedText>

                    <View style={styles.infoRow}>
                        <ThemedText style={styles.label}>Currency</ThemedText>
                        <TouchableOpacity
                            style={[styles.pickerButton, { backgroundColor, borderColor: iconColor + '40' }]}
                            onPress={() => setShowCurrencyPicker(true)}
                        >
                            <ThemedText style={[styles.pickerButtonText, { color: boutiqueInfo.currency ? textColor : iconColor }]}>
                                {boutiqueInfo.currency
                                    ? CURRENCIES.find((c) => c.code === boutiqueInfo.currency)?.name || boutiqueInfo.currency
                                    : 'Select currency'}
                            </ThemedText>
                            <IconSymbol name="chevron.down" size={16} color={iconColor} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoRow}>
                        <ThemedText style={styles.label}>Language</ThemedText>
                        <TouchableOpacity
                            style={[styles.pickerButton, { backgroundColor, borderColor: iconColor + '40' }]}
                            onPress={() => setShowLanguagePicker(true)}
                        >
                            <ThemedText style={[styles.pickerButtonText, { color: boutiqueInfo.language ? textColor : iconColor }]}>
                                {boutiqueInfo.language
                                    ? LANGUAGES.find((l) => l.code === boutiqueInfo.language)?.name || boutiqueInfo.language
                                    : 'Select language'}
                            </ThemedText>
                            <IconSymbol name="chevron.down" size={16} color={iconColor} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Social Media Links */}
                <View
                    style={[
                        styles.section,
                        {
                            backgroundColor,
                            shadowColor: isDark ? '#000' : '#000',
                            shadowOpacity: isDark ? 0.3 : 0.1,
                        },
                    ]}
                >
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Social Media
                    </ThemedText>

                    <View style={styles.infoRow}>
                        <IconSymbol name="camera.fill" size={20} color={tintColor} />
                        <ThemedText style={styles.label}>Instagram</ThemedText>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : backgroundColor,
                                    color: textColor,
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                    flex: 1,
                                },
                            ]}
                            value={boutiqueInfo.socialLinks.instagram}
                            onChangeText={(text) => setBoutiqueInfo({
                                ...boutiqueInfo,
                                socialLinks: { ...boutiqueInfo.socialLinks, instagram: text }
                            })}
                            placeholder="@username"
                            placeholderTextColor={iconColor}
                        />
                    </View>

                    <View style={styles.infoRow}>
                        <IconSymbol name="info.circle" size={20} color={tintColor} />
                        <ThemedText style={styles.label}>Facebook</ThemedText>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : backgroundColor,
                                    color: textColor,
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                    flex: 1,
                                },
                            ]}
                            value={boutiqueInfo.socialLinks.facebook}
                            onChangeText={(text) => setBoutiqueInfo({
                                ...boutiqueInfo,
                                socialLinks: { ...boutiqueInfo.socialLinks, facebook: text }
                            })}
                            placeholder="Page Name"
                            placeholderTextColor={iconColor}
                        />
                    </View>

                    <View style={styles.infoRow}>
                        <IconSymbol name="pencil" size={20} color={tintColor} />
                        <ThemedText style={styles.label}>Twitter/X</ThemedText>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : backgroundColor,
                                    color: textColor,
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                    flex: 1,
                                },
                            ]}
                            value={boutiqueInfo.socialLinks.twitter}
                            onChangeText={(text) => setBoutiqueInfo({
                                ...boutiqueInfo,
                                socialLinks: { ...boutiqueInfo.socialLinks, twitter: text }
                            })}
                            placeholder="@username"
                            placeholderTextColor={iconColor}
                        />
                    </View>
                </View>

                {/* Business Stats */}
                <View
                    style={[
                        styles.section,
                        {
                            backgroundColor,
                            shadowColor: isDark ? '#000' : '#000',
                            shadowOpacity: isDark ? 0.3 : 0.1,
                        },
                    ]}
                >
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Business Statistics
                    </ThemedText>

                    <View style={styles.statsGrid}>
                        {profile?.created_at && (
                            <View style={[styles.statCard, { backgroundColor: `${tintColor}20` }]}>
                                <IconSymbol name="calendar" size={24} color={tintColor} />
                                <ThemedText style={styles.statValue}>
                                    {new Date(profile.created_at).getFullYear()}
                                </ThemedText>
                                <ThemedText style={[styles.statLabel, { color: iconColor }]}>Established</ThemedText>
                            </View>
                        )}

                        <View style={[styles.statCard, { backgroundColor: `${tintColor}20` }]}>
                            <IconSymbol name="bag.fill" size={24} color={tintColor} />
                            <ThemedText style={styles.statValue}>45</ThemedText>
                            <ThemedText style={[styles.statLabel, { color: iconColor }]}>Products</ThemedText>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: `${tintColor}20` }]}>
                            <IconSymbol name="person.fill" size={24} color={tintColor} />
                            <ThemedText style={styles.statValue}>128</ThemedText>
                            <ThemedText style={[styles.statLabel, { color: iconColor }]}>Customers</ThemedText>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: `${tintColor}20` }]}>
                            <IconSymbol name="star.fill" size={24} color={tintColor} />
                            <ThemedText style={styles.statValue}>4.8</ThemedText>
                            <ThemedText style={[styles.statLabel, { color: iconColor }]}>Rating</ThemedText>
                        </View>
                    </View>
                </View>

                {/* Account Settings */}
                <View
                    style={[
                        styles.section,
                        {
                            backgroundColor,
                            shadowColor: isDark ? '#000' : '#000',
                            shadowOpacity: isDark ? 0.3 : 0.1,
                        },
                    ]}
                >
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Account Settings
                    </ThemedText>

                    <TouchableOpacity style={styles.settingItem} onPress={handleSwitchToIndividual}>
                        <IconSymbol name="person.fill" size={20} color={tintColor} />
                        <ThemedText style={[styles.settingText, { color: textColor }]}>
                            Switch to Individual Mode
                        </ThemedText>
                        <IconSymbol name="chevron.right" size={16} color={iconColor} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem} onPress={handleNavigateToPrivacy}>
                        <IconSymbol name="lock" size={20} color={tintColor} />
                        <ThemedText style={[styles.settingText, { color: textColor }]}>
                            Privacy & Security
                        </ThemedText>
                        <IconSymbol name="chevron.right" size={16} color={iconColor} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem} onPress={handleNavigateToHelp}>
                        <IconSymbol name="questionmark.circle" size={20} color={tintColor} />
                        <ThemedText style={[styles.settingText, { color: textColor }]}>
                            Help & Support
                        </ThemedText>
                        <IconSymbol name="chevron.right" size={16} color={iconColor} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem} onPress={handleNavigateToAbout}>
                        <IconSymbol name="info.circle" size={20} color={tintColor} />
                        <ThemedText style={[styles.settingText, { color: textColor }]}>
                            About
                        </ThemedText>
                        <IconSymbol name="chevron.right" size={16} color={iconColor} />
                    </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            { backgroundColor: isDark ? '#0a7ea4' : tintColor },
                            (isSaving || isUploadingLogo || isUploadingCover || updateProfileMutation.isPending) && styles.saveButtonDisabled
                        ]}
                        onPress={handleSaveChanges}
                        disabled={isSaving || isUploadingLogo || isUploadingCover || updateProfileMutation.isPending}
                    >
                        {(isSaving || isUploadingLogo || updateProfileMutation.isPending) ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.logoutButton,
                            { borderColor: tintColor },
                            isSigningOut && styles.logoutButtonDisabled
                        ]}
                        onPress={handleLogout}
                        disabled={isSigningOut}
                    >
                        {isSigningOut ? (
                            <ActivityIndicator size="small" color="#FF3B30" />
                        ) : (
                            <>
                                <IconSymbol name="rectangle.portrait.and.arrow.right" size={18} color="#FF3B30" />
                                <ThemedText style={[styles.logoutText, { color: '#FF3B30' }]}>Sign Out</ThemedText>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Currency Picker Modal */}
            <SimplePicker
                visible={showCurrencyPicker}
                onClose={() => setShowCurrencyPicker(false)}
                onSelect={(value) => setBoutiqueInfo({ ...boutiqueInfo, currency: value })}
                options={CURRENCIES}
                selectedValue={boutiqueInfo.currency}
                title="Select Currency"
                searchPlaceholder="Search currency..."
                getDisplayValue={(option) => `${option.name} (${option.code})`}
                getOptionValue={(option) => option.code}
            />

            {/* Language Picker Modal */}
            <SimplePicker
                visible={showLanguagePicker}
                onClose={() => setShowLanguagePicker(false)}
                onSelect={(value) => setBoutiqueInfo({ ...boutiqueInfo, language: value })}
                options={LANGUAGES}
                selectedValue={boutiqueInfo.language}
                title="Select Language"
                searchPlaceholder="Search language..."
                getDisplayValue={(option) => `${option.name} (${option.code})`}
                getOptionValue={(option) => option.code}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        marginTop: 20,
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    coverAndLogoContainer: {
        position: 'relative',
        width: '100%',
        marginBottom: 24,
        borderRadius: 12,
        overflow: 'visible',
    },
    coverImage: {
        width: '100%',
        height: 160,
        resizeMode: 'cover',
        borderRadius: 12,
    },
    coverImageWrapper: {
        position: 'relative',
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    coverPlaceholder: {
        width: '100%',
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: 'rgba(0,0,0,0.2)',
    },
    coverPlaceholderText: {
        marginTop: 8,
        fontSize: 14,
    },
    coverEditButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    logoContainer: {
        position: 'absolute',
        bottom: -40,
        left: 16,
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#fff',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    logoImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    logoPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoEditButton: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    logoSpacer: {
        height: 48, // Space for overlapping logo
    },
    infoRow: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.8,
    },
    input: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
    },
    textArea: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        height: 80,
        textAlignVertical: 'top',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: '48%',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        opacity: 0.7,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        gap: 12,
    },
    settingText: {
        flex: 1,
        fontSize: 16,
    },
    actionButtons: {
        gap: 12,
        marginBottom: 32,
    },
    saveButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    logoutButtonDisabled: {
        opacity: 0.6,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        gap: 16,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        minHeight: 44,
    },
    pickerButtonText: {
        fontSize: 16,
        flex: 1,
    },
});
