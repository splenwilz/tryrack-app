import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CustomHeader } from '@/components/custom-header';
import { router } from 'expo-router';
import { ImageUploadSection } from '@/components/wardrobe/ImageUploadSection';
import { ItemDetailsInput } from '@/components/wardrobe/ItemDetailsInput';
import { CategorySelector } from '@/components/wardrobe/CategorySelector';
import { ColorSelector } from '@/components/wardrobe/ColorSelector';
import { TagInput } from '@/components/wardrobe/TagInput';
import { useWardrobeForm } from '@/hooks/wardrobe/useWardrobeForm';
import { useWardrobeImageProcessing } from '@/hooks/wardrobe/useWardrobeImageProcessing';
import { useCreateWardrobeItem } from '@/api/wardrobe/queries';
import { queryKeys } from '@/api/utils/query-keys';
import { ApiError } from '@/api/client';

const AddItemScreen = () => {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const buttonTextColor = isDark ? '#000' : 'white';
    const activityIndicatorColor = isDark ? '#000' : 'white';

    const {
        formData,
        updateField,
        updateForm,
        addTag,
        removeTag,
    } = useWardrobeForm();

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

    const { mutateAsync: createWardrobeItem, isPending: isCreating, queryClient } = useCreateWardrobeItem();

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
            const requestPayload = {
                title: formData.title.trim(),
                category: formData.category.trim(),
                colors: formData.colors,
                tags: formData.tags,
                image_url: formData.imageUrl, // API uses snake_case, validated above
                status: 'clean' as const, // Default status
            };

            console.log('[Wardrobe] Creating wardrobe item:', requestPayload);

            // Call the mutation
            const response = await createWardrobeItem(requestPayload);

            console.log('[Wardrobe] Wardrobe item created successfully:', response);

            // Invalidate wardrobe queries to refetch the list
            // This ensures the new item appears in the wardrobe screen
            queryClient.invalidateQueries({ queryKey: queryKeys.wardrobe.items() });
            queryClient.invalidateQueries({ queryKey: queryKeys.wardrobe.all() });

            // Show success message
            Alert.alert(
                'Success',
                'Wardrobe item added successfully!',
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
            console.error('[Wardrobe] Failed to create wardrobe item:', error);

            // Handle API errors with user-friendly messages
            let errorMessage = 'Unable to save wardrobe item. Please try again.';
            if (error instanceof ApiError) {
                errorMessage = error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            Alert.alert('Save Failed', errorMessage);
        }
    };

    const isProcessing = Boolean(processingStage) || isUploadingImage || isCreating;
    const showShimmer = false; // Can be controlled by loading state

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <CustomHeader title="Add Item" showBackButton={true} onBackPress={handleBackPress} />

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
                    {isUploadingImage || isCreating ? (
                        <ActivityIndicator color={activityIndicatorColor} />
                    ) : (
                        <ThemedText style={[styles.saveButtonText, { color: buttonTextColor }]}>
                            Add to Wardrobe
                        </ThemedText>
                    )}
                </TouchableOpacity>

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    );
};

export default AddItemScreen;

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
});
