/**
 * User Photo Section Component
 * Handles photo selection, display, and upload
 *
 * @see https://reactnative.dev/docs/image - React Native Image
 */

import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ShimmerPlaceholder } from '@/components/ShimmerPlaceholder';

const { width: screenWidth } = Dimensions.get('window');

interface VirtualTryOnUserPhotoProps {
    userPhoto: string | null;
    hasUsedExistingPhoto: boolean;
    hasCheckedProfile: boolean;
    isLoadingProfile: boolean;
    isFetchingProfile: boolean;
    hasExistingPhoto: boolean;
    onSelectPhoto: () => void;
    onUseExistingPhoto: () => void;
    onSelectNewPhoto: () => void;
    onRemovePhoto: () => void;
}

export function VirtualTryOnUserPhoto({
    userPhoto,
    hasUsedExistingPhoto,
    hasCheckedProfile,
    isLoadingProfile,
    isFetchingProfile,
    hasExistingPhoto,
    onSelectPhoto,
    onUseExistingPhoto,
    onSelectNewPhoto,
    onRemovePhoto,
}: VirtualTryOnUserPhotoProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');

    const isLoading = isLoadingProfile || isFetchingProfile || !hasCheckedProfile;
    const showLoading = isLoading && !userPhoto;
    const showExistingPhotoPrompt = hasCheckedProfile && !isLoading && userPhoto && !hasUsedExistingPhoto;
    const showSelectedPhoto = hasCheckedProfile && !isLoading && userPhoto && hasUsedExistingPhoto;
    const showAddButton = hasCheckedProfile && !isLoading && !userPhoto;

    return (
        <View style={styles.container}>
            <ThemedText type="subtitle" style={styles.title}>Your Photo</ThemedText>

            {showLoading && (
                <View style={[styles.photoButton, { backgroundColor }]}>
                    <ShimmerPlaceholder
                        width={screenWidth - 80}
                        height={300}
                        borderRadius={12}
                    />
                </View>
            )}

            {showExistingPhotoPrompt && (
                <View style={styles.existingPhotoContainer}>
                    <View style={[styles.photoCard, { backgroundColor }]}>
                        <Image source={{ uri: userPhoto! }} style={styles.existingPhoto} />
                        <View style={styles.existingPhotoInfo}>
                            <ThemedText style={styles.existingPhotoTitle}>Use your saved full body photo?</ThemedText>
                            <ThemedText style={styles.existingPhotoSubtext}>
                                We found your existing full body photo. You can use it or upload a new one.
                            </ThemedText>
                            <View style={styles.photoActionButtons}>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: `${tintColor}22` }]}
                                    onPress={onUseExistingPhoto}
                                >
                                    <IconSymbol name="checkmark.circle.fill" size={16} color={tintColor} />
                                    <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
                                        Use This Photo
                                    </ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: `${tintColor}22` }]}
                                    onPress={onSelectNewPhoto}
                                >
                                    <IconSymbol name="camera.fill" size={16} color={tintColor} />
                                    <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
                                        Upload New
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {showSelectedPhoto && (
                <TouchableOpacity style={[styles.photoButton, { backgroundColor }]} onPress={onSelectPhoto}>
                    <View style={styles.photoContainer}>
                        <Image source={{ uri: userPhoto! }} style={styles.userPhoto} />
                        <TouchableOpacity
                            style={styles.removePhotoButton}
                            onPress={onRemovePhoto}
                        >
                            <IconSymbol name="plus" size={16} color="white" style={{ transform: [{ rotate: '45deg' }] }} />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            )}

            {showAddButton && (
                <TouchableOpacity style={[styles.photoButton, { backgroundColor }]} onPress={onSelectPhoto}>
                    <View style={styles.photoPlaceholder}>
                        <IconSymbol name="plus" size={32} color={iconColor} />
                        <ThemedText style={styles.photoPlaceholderText}>Add Your Photo</ThemedText>
                        <ThemedText style={styles.photoPlaceholderSubtext}>
                            Take a photo or choose from gallery
                        </ThemedText>
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    photoButton: {
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    photoPlaceholder: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    photoPlaceholderText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 4,
    },
    photoPlaceholderSubtext: {
        fontSize: 14,
        opacity: 0.7,
        textAlign: 'center',
    },
    photoContainer: {
        position: 'relative',
    },
    userPhoto: {
        width: screenWidth - 80,
        height: 300,
        borderRadius: 12,
    },
    removePhotoButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    existingPhotoContainer: {
        marginBottom: 16,
    },
    photoCard: {
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    existingPhoto: {
        width: '100%',
        height: 300,
        borderRadius: 8,
        marginBottom: 12,
    },
    existingPhotoInfo: {
        paddingHorizontal: 4,
    },
    existingPhotoTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    existingPhotoSubtext: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 16,
        lineHeight: 20,
    },
    photoActionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 6,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

