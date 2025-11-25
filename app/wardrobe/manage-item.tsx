import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CustomHeader } from '@/components/custom-header';
import { router, useLocalSearchParams } from 'expo-router';
import { ImageUploadSection } from '@/components/wardrobe/ImageUploadSection';
import { ItemDetailsInput } from '@/components/wardrobe/ItemDetailsInput';
import { CategorySelector } from '@/components/wardrobe/CategorySelector';
import { ColorSelector } from '@/components/wardrobe/ColorSelector';
import { TagInput } from '@/components/wardrobe/TagInput';
import { useWardrobeForm } from '@/hooks/wardrobe/useWardrobeForm';
import { useWardrobeImageProcessing } from '@/hooks/wardrobe/useWardrobeImageProcessing';
import { useCreateWardrobeItem, useUpdateWardrobeItem, useWardrobeItem } from '@/api/wardrobe/queries';
import { queryKeys } from '@/api/utils/query-keys';
import { ApiError } from '@/api/client';
import { useEffect, useMemo } from 'react';

/**
 * Wardrobe Item Management Screen
 * Handles both creating new wardrobe items and editing existing ones
 * 
 * @see https://reactnative.dev/docs/scrollview - React Native ScrollView component
 */
const ManageWardrobeItemScreen = () => {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const buttonTextColor = isDark ? '#000' : 'white';
    const activityIndicatorColor = isDark ? '#000' : 'white';

    // Get itemId from route params for editing
    const { itemId } = useLocalSearchParams<{ itemId?: string }>();
    const isEditMode = !!itemId;

    // Fetch existing item data when editing
    const { data: existingItem, isLoading: isLoadingItem } = useWardrobeItem(itemId || '');

    // Map existing item to form data format
    const initialFormData = useMemo(() => {
        if (!existingItem) return undefined;
        return {
            title: existingItem.title || '',
            category: existingItem.category || '',
            colors: existingItem.colors || [],
            tags: existingItem.tags || [],
            imageUrl: existingItem.image_url || null,
        };
    }, [existingItem]);

    const {
        formData,
        updateField,
        updateForm,
        addTag,
        removeTag,
    } = useWardrobeForm(initialFormData);

    // Update form when item data loads
    useEffect(() => {
        if (existingItem && initialFormData) {
            updateForm(initialFormData);
        }
    }, [existingItem, initialFormData, updateForm]);

    const {
        handleSelectPhoto,
        processingStage,
        isPickingPhoto,
        isUploadingImage,
        resetProcessingState,
    } = useWardrobeImageProcessing({
        onMetadataExtracted: (metadata) => {
            updateForm({
                title: metadata.title,
                category: metadata.category,
                colors: metadata.colors,
                tags: metadata.tags,
            });
        },
        onImageReady: (imageUrl) => {
            updateField('imageUrl', imageUrl);
        },
    });

    const { mutateAsync: createWardrobeItem, isPending: isCreating, queryClient: createQueryClient } = useCreateWardrobeItem();
    const { mutateAsync: updateWardrobeItem, isPending: isUpdating, queryClient: updateQueryClient } = useUpdateWardrobeItem(itemId || '');

    const isSaving = isCreating || isUpdating;
    const queryClient = isEditMode ? updateQueryClient : createQueryClient;

    const handleBackPress = () => {
        router.back();
    };

    const handleRemovePhoto = () => {
        updateField('imageUrl', null);
        resetProcessingState();
    };

    /**
     * Validate form data before submission
     */
    const validateForm = (): string | null => {
        if (!formData.title?.trim()) {
            return 'Title is required';
        }
        if (!formData.category?.trim()) {
            return 'Category is required';
        }
        if (!formData.imageUrl) {
            return 'Image is required';
        }
        if (formData.colors.length === 0) {
            return 'At least one color is required';
        }
        return null;
    };

    /**
     * Handle saving wardrobe item
     * Transforms form data to API request format and calls the mutation
     * Supports both creating new items and updating existing ones
     */
    const handleSave = async () => {
        // Validate form
        const validationError = validateForm();
        if (validationError) {
            Alert.alert('Validation Error', validationError);
            return;
        }

        try {
            // At this point, validation ensures imageUrl is not null
            if (!formData.imageUrl) {
                Alert.alert('Validation Error', 'Image is required');
                return;
            }

            // Transform form data to API request format
            // API expects: image_url (snake_case) and status field
            if (isEditMode) {
                // For updates, status is optional
                const updatePayload = {
                    title: formData.title.trim(),
                    category: formData.category.trim(),
                    colors: formData.colors,
                    tags: formData.tags,
                    image_url: formData.imageUrl, // API uses snake_case, validated above
                };
                console.log('[Wardrobe] Updating wardrobe item:', itemId, updatePayload);
                await updateWardrobeItem(updatePayload);
                console.log('[Wardrobe] Wardrobe item updated successfully');
            } else {
                // For creates, status is required
                const createPayload = {
                    title: formData.title.trim(),
                    category: formData.category.trim(),
                    colors: formData.colors,
                    tags: formData.tags,
                    image_url: formData.imageUrl, // API uses snake_case, validated above
                    status: 'clean' as const,
                };
                console.log('[Wardrobe] Creating wardrobe item:', createPayload);
                await createWardrobeItem(createPayload);
                console.log('[Wardrobe] Wardrobe item created successfully');
            }

            // Invalidate wardrobe queries to refetch the list
            queryClient.invalidateQueries({ queryKey: queryKeys.wardrobe.items() });
            queryClient.invalidateQueries({ queryKey: queryKeys.wardrobe.all() });
            if (isEditMode && itemId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.wardrobe.itemById(itemId) });
            }

            // Show success message
            Alert.alert(
                'Success',
                isEditMode ? 'Wardrobe item updated successfully!' : 'Wardrobe item added successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Navigate back to wardrobe screen
                            router.back();
                        },
                    },
                ]
            );
        } catch (error) {
            console.error(`[Wardrobe] Failed to ${isEditMode ? 'update' : 'create'} wardrobe item:`, error);

            // Handle API errors with user-friendly messages
            let errorMessage = `Unable to ${isEditMode ? 'update' : 'save'} wardrobe item. Please try again.`;
            if (error instanceof ApiError) {
                errorMessage = error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            Alert.alert('Save Failed', errorMessage);
        }
    };

    const isProcessing = Boolean(processingStage) || isUploadingImage || isSaving || isLoadingItem;
    const showShimmer = false; // Can be controlled by loading state

    // Show loading state while fetching item data for editing
    if (isEditMode && isLoadingItem) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <CustomHeader title="Edit Item" showBackButton={true} onBackPress={handleBackPress} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={tintColor} />
                    <ThemedText style={styles.loadingText}>Loading item details...</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <CustomHeader title={isEditMode ? "Edit Item" : "Add Item"} showBackButton={true} onBackPress={handleBackPress} />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <ImageUploadSection
                    imageUrl={formData.imageUrl}
                    processingStage={processingStage}
                    isProcessing={isPickingPhoto || isUploadingImage}
                    isUploading={isUploadingImage}
                    onSelectPhoto={handleSelectPhoto}
                    onRemovePhoto={handleRemovePhoto}
                    showAISuggestions={Boolean(formData.imageUrl)}
                />

                <ItemDetailsInput
                    value={formData.title}
                    onChange={(value) => updateField('title', value)}
                    showShimmer={showShimmer}
                />

                <CategorySelector
                    value={formData.category}
                    onChange={(value) => updateField('category', value)}
                    showShimmer={showShimmer}
                />

                <ColorSelector
                    value={formData.colors}
                    onChange={(colors) => updateField('colors', colors)}
                    showShimmer={showShimmer}
                />

                <TagInput
                    tags={formData.tags}
                    onAddTag={addTag}
                    onRemoveTag={removeTag}
                    showShimmer={showShimmer}
                />

                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        {
                            backgroundColor: tintColor,
                            opacity: isProcessing ? 0.6 : 1,
                        },
                    ]}
                    onPress={handleSave}
                    disabled={isProcessing}
                >
                    {isUploadingImage || isSaving ? (
                        <ActivityIndicator color={activityIndicatorColor} />
                    ) : (
                        <ThemedText style={[styles.saveButtonText, { color: buttonTextColor }]}>
                            {isEditMode ? 'Update Item' : 'Add to Wardrobe'}
                        </ThemedText>
                    )}
                </TouchableOpacity>

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    );
};

export default ManageWardrobeItemScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    saveButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginHorizontal: 20,
        marginTop: 20,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    bottomSpacing: {
        height: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
});

