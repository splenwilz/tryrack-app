/**
 * Virtual Try-On Screen
 * Main screen for virtual try-on functionality
 * Uses reusable components and custom hooks for separation of concerns
 *
 * @see https://reactnative.dev/docs/scrollview - React Native ScrollView
 */

import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomHeader } from '@/components/custom-header';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useWardrobeItems } from '@/api/wardrobe/queries';
import { useTryOnCompatibility } from '@/hooks/wardrobe/useTryOnCompatibility';
import { useVirtualTryOnPhoto } from '@/hooks/wardrobe/useVirtualTryOnPhoto';
import { useVirtualTryOnItems } from '@/hooks/wardrobe/useVirtualTryOnItems';
import { useVirtualTryOnGeneration } from '@/hooks/wardrobe/useVirtualTryOnGeneration';
import {
    VirtualTryOnSelectedItems,
    VirtualTryOnCompatibleItems,
    VirtualTryOnUserPhoto,
    VirtualTryOnOptions,
    VirtualTryOnGenerateButton,
    VirtualTryOnBrowseSection,
    VirtualTryOnInstructions,
    WardrobeBrowseModal,
    ImageViewModal,
} from '@/components/wardrobe';
import type { WardrobeItemResponse } from '@/api/wardrobe/types';
import type { WardrobeItemTryOn } from '@/hooks/wardrobe/useVirtualTryOnItems';

export default function VirtualTryOnScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');

    // Custom hooks for business logic
    const {
        selectedItems,
        selectedItem,
        itemType,
        addItemToTryOn,
        removeItemFromTryOn,
        hasImageQualityWarning,
    } = useVirtualTryOnItems();

    const {
        userPhoto,
        hasUsedExistingPhoto,
        hasCheckedProfile,
        isLoadingProfile,
        isFetchingProfile,
        hasExistingPhoto,
        handleSelectPhoto,
        handleUseExistingPhoto,
        handleSelectNewPhoto,
        handleRemovePhoto,
    } = useVirtualTryOnPhoto();

    // Options state
    const [useCleanBackground, setUseCleanBackground] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');
    const [showPromptEditor, setShowPromptEditor] = useState(false);
    const [showBrowseModal, setShowBrowseModal] = useState(false);
    const [showImageViewModal, setShowImageViewModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    // Fetch wardrobe items for suggestions
    const { data: wardrobeItems = [], isLoading: isLoadingWardrobe, isFetching: isFetchingWardrobe, error: wardrobeError } = useWardrobeItems();

    // Calculate compatibility suggestions
    const selectedItemForCompatibility = selectedItem ? {
        category: selectedItem.category,
        colors: selectedItem.colors || [],
        tags: selectedItem.tags || [],
    } : null;

    const excludeIds = selectedItems.map(item => item.id);
    const compatibilitySuggestions = useTryOnCompatibility(
        selectedItemForCompatibility,
        wardrobeItems,
        excludeIds
    );

    // Virtual try-on generation
    const {
        isGenerating,
        generatedImage,
        generateTryOn,
    } = useVirtualTryOnGeneration({
        userPhoto,
        selectedItems,
        useCleanBackground,
        customPrompt,
    });

    // Handlers
    const handleBackPress = () => {
        router.back();
    };

    const handleGenerateTryOn = () => {
        generateTryOn();
    };

    const ensureLocalResultUri = async (): Promise<string> => {
        if (!generatedImage) {
            throw new Error('No generated image to save.');
        }

        if (generatedImage.startsWith('file://')) {
            return generatedImage;
        }

        const filename = `tryon-${Date.now()}.jpg`;
        const downloadResult = await FileSystem.downloadAsync(
            generatedImage,
            `${FileSystem.cacheDirectory}${filename}`
        );

        return downloadResult.uri;
    };

    const handleSaveResult = async () => {
        if (!generatedImage || isSaving) {
            if (!generatedImage) {
                Alert.alert('No Image', 'Generate a virtual try-on before saving.');
            }
            return;
        }

        setIsSaving(true);
        try {
            const permission = await MediaLibrary.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Media library permission is required to save the virtual try-on.'
                );
                return;
            }

            const localUri = await ensureLocalResultUri();
            await MediaLibrary.saveToLibraryAsync(localUri);
            Alert.alert('Saved', 'Virtual try-on saved to your Photos.');
        } catch (error) {
            console.error('[Virtual Try-On] Save error:', error);
            Alert.alert(
                'Save Failed',
                error instanceof Error ? error.message : 'Unable to save the virtual try-on.'
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleShareResult = async () => {
        if (!generatedImage || isSharing) {
            if (!generatedImage) {
                Alert.alert('No Image', 'Generate a virtual try-on before sharing.');
            }
            return;
        }

        setIsSharing(true);
        try {
            const localUri = await ensureLocalResultUri();
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(localUri);
            } else {
                await Share.share({
                    url: localUri,
                    message: 'Check out this outfit from my virtual try-on!',
                });
            }
        } catch (error) {
            console.error('[Virtual Try-On] Share error:', error);
            Alert.alert(
                'Share Failed',
                error instanceof Error ? error.message : 'Unable to share the virtual try-on.'
            );
        } finally {
            setIsSharing(false);
        }
    };

    const handleAddFromBrowse = (item: WardrobeItemResponse) => {
        const itemToAdd: WardrobeItemTryOn = {
            id: item.id,
            title: item.title,
            category: item.category,
            imageUrl: item.image_url,
            colors: item.colors || [],
            tags: item.tags || [],
        };
        addItemToTryOn(itemToAdd);
        setShowBrowseModal(false);
    };

    // Early return if no item selected
    if (!selectedItem) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <CustomHeader
                    title="Virtual Try-On"
                    showBackButton={true}
                    onBackPress={handleBackPress}
                />
                <View style={styles.errorContainer}>
                    <ThemedText style={styles.errorText}>Item not found</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <CustomHeader
                title="Virtual Try-On"
                showBackButton={true}
                onBackPress={handleBackPress}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Selected Items Section */}
                <VirtualTryOnSelectedItems
                    selectedItems={selectedItems}
                    itemType={itemType}
                    onRemoveItem={removeItemFromTryOn}
                    hasImageQualityWarning={hasImageQualityWarning}
                />

                {/* Compatible Items Section */}
                {selectedItem && (
                    <VirtualTryOnCompatibleItems
                        suggestions={compatibilitySuggestions}
                        isLoading={isLoadingWardrobe}
                        isFetching={isFetchingWardrobe}
                        error={wardrobeError}
                        onAddItem={addItemToTryOn}
                    />
                )}

                {/* Browse Wardrobe Section */}
                {selectedItem && (
                    <VirtualTryOnBrowseSection
                        onOpenModal={() => setShowBrowseModal(true)}
                    />
                )}

                {/* Wardrobe Browse Modal */}
                <WardrobeBrowseModal
                    visible={showBrowseModal}
                    onClose={() => setShowBrowseModal(false)}
                    wardrobeItems={wardrobeItems}
                    excludeIds={excludeIds}
                    onSelectItem={handleAddFromBrowse}
                    isLoading={isLoadingWardrobe}
                />

                {/* User Photo Section */}
                <VirtualTryOnUserPhoto
                    userPhoto={userPhoto}
                    hasUsedExistingPhoto={hasUsedExistingPhoto}
                    hasCheckedProfile={hasCheckedProfile}
                    isLoadingProfile={isLoadingProfile}
                    isFetchingProfile={isFetchingProfile}
                    hasExistingPhoto={hasExistingPhoto}
                    onSelectPhoto={handleSelectPhoto}
                    onUseExistingPhoto={handleUseExistingPhoto}
                    onSelectNewPhoto={handleSelectNewPhoto}
                    onRemovePhoto={handleRemovePhoto}
                />

                {/* Options Section */}
                <VirtualTryOnOptions
                    useCleanBackground={useCleanBackground}
                    customPrompt={customPrompt}
                    showPromptEditor={showPromptEditor}
                    onToggleBackground={() => setUseCleanBackground(!useCleanBackground)}
                    onTogglePromptEditor={() => setShowPromptEditor(!showPromptEditor)}
                    onCustomPromptChange={setCustomPrompt}
                    hasImageQualityWarning={hasImageQualityWarning}
                />

                {/* Generate Button */}
                <VirtualTryOnGenerateButton
                    isGenerating={isGenerating}
                    isDisabled={selectedItems.length === 0 || !userPhoto || isGenerating}
                    tryonStatus={isGenerating ? 'processing' : undefined}
                    onPress={handleGenerateTryOn}
                />

                {/* Generated Result Section - TODO: Extract to component */}
                {generatedImage && (
                    <View style={styles.resultSection}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>Virtual Try-On Result</ThemedText>
                        <View style={[styles.resultCard, { backgroundColor }]}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => setShowImageViewModal(true)}
                            >
                                <Image source={{ uri: generatedImage }} style={styles.resultImage} />
                            </TouchableOpacity>
                            <View style={styles.resultActions}>
                                <TouchableOpacity
                                    style={[styles.viewButton, { borderColor: tintColor }]}
                                    onPress={() => setShowImageViewModal(true)}
                                    activeOpacity={0.85}
                                >
                                    <IconSymbol name="eye.fill" size={16} color={tintColor} />
                                    {/* <ThemedText style={[styles.viewButtonText, { color: tintColor }]}>
                                        View Full Image
                                    </ThemedText> */}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        isSaving && styles.actionButtonDisabled,
                                    ]}
                                    onPress={handleSaveResult}
                                    disabled={isSaving}
                                >
                                    <IconSymbol
                                        name="square.and.arrow.down"
                                        size={16}
                                        color={tintColor}
                                    />
                                    <ThemedText
                                        style={[
                                            styles.actionButtonText,
                                            isSaving && styles.actionButtonTextDisabled,
                                        ]}
                                    >
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        isSharing && styles.actionButtonDisabled,
                                    ]}
                                    onPress={handleShareResult}
                                    disabled={isSharing}
                                >
                                    <IconSymbol
                                        name="square.and.arrow.up"
                                        size={16}
                                        color={tintColor}
                                    />
                                    <ThemedText
                                        style={[
                                            styles.actionButtonText,
                                            isSharing && styles.actionButtonTextDisabled,
                                        ]}
                                    >
                                        {isSharing ? 'Sharing...' : 'Share'}
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* Image View Modal */}
                <ImageViewModal
                    visible={showImageViewModal}
                    imageUrl={generatedImage}
                    onClose={() => setShowImageViewModal(false)}
                    title="Virtual Try-On Result"
                />

                {/* Instructions Section */}
                <VirtualTryOnInstructions />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        opacity: 0.7,
    },
    resultSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    resultCard: {
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    resultImage: {
        width: '100%',
        height: 400,
        borderRadius: 8,
        marginBottom: 16,
    },
    resultActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        marginTop: 12,
    },
    viewButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        gap: 6,
    },
    viewButtonText: {
        fontSize: 14,
        fontWeight: '600',
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
    actionButtonDisabled: {
        opacity: 0.6,
    },
    actionButtonTextDisabled: {
        color: '#999',
    },
});
