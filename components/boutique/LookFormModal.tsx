/**
 * Look Form Modal Component
 * Modal for creating/editing complete outfit looks with AI-generated images
 * 
 * @see https://reactnative.dev/docs/modal - React Native Modal
 */

import React from 'react';
import { Modal, StyleSheet, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, FlatList, Image, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLookImageGeneration } from '@/hooks/boutique/useLookImageGeneration';
import { ImageViewModal } from '@/components/wardrobe/ImageViewModal';
import type { CatalogProduct } from '@/types/boutique';
import type { LookMetadata } from '@/api/looks/types';

export interface LookFormData {
    title: string;
    description: string;
    style: string;
    productIds: string[];
    imageUrl: string;
    isFeatured: boolean;
    customPrompt?: string;
}

interface LookFormModalProps {
    visible: boolean;
    editingLook: { id: string } | null;
    formData: LookFormData;
    availableProducts: CatalogProduct[];
    onClose: () => void;
    onSave: () => void;
    onUpdateField: <K extends keyof LookFormData>(field: K, value: LookFormData[K]) => void;
    onToggleProduct: (productId: string) => void;
    isSaving: boolean;
}

export function LookFormModal({
    visible,
    editingLook,
    formData,
    availableProducts,
    onClose,
    onSave,
    onUpdateField,
    onToggleProduct,
    isSaving,
}: LookFormModalProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const textColor = useThemeColor({}, 'text');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const cardBg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');

    const [showPromptEditor, setShowPromptEditor] = React.useState(false);
    const [showImageViewModal, setShowImageViewModal] = React.useState(false);

    const selectedProducts = availableProducts.filter((p) => formData.productIds.includes(p.id));
    const totalPrice = selectedProducts.reduce((sum, p) => sum + (p.discountPrice || p.price), 0);

    // Memoize metadata extraction callback
    const handleMetadataExtracted = React.useCallback((metadata: LookMetadata) => {
        // Pre-fill form with extracted metadata
        onUpdateField('title', metadata.title);
        onUpdateField('description', metadata.description);
        onUpdateField('style', metadata.style);
    }, [onUpdateField]);

    // Look image generation hook with metadata extraction
    const {
        generatedImage,
        remoteImageUrl,
        isGenerating,
        isExtractingMetadata,
        generateLook,
    } = useLookImageGeneration({
        selectedProducts,
        customPrompt: formData.customPrompt,
        onMetadataExtracted: handleMetadataExtracted,
    });

    // Update imageUrl when generation completes - use ref to prevent infinite loops
    const imageUrlUpdatedRef = React.useRef<string | null>(null);
    const onUpdateFieldRef = React.useRef(onUpdateField);
    React.useEffect(() => {
        onUpdateFieldRef.current = onUpdateField;
    }, [onUpdateField]);

    React.useEffect(() => {
        const newImageUrl = remoteImageUrl || generatedImage;
        if (newImageUrl && newImageUrl !== imageUrlUpdatedRef.current) {
            imageUrlUpdatedRef.current = newImageUrl;
            onUpdateFieldRef.current('imageUrl', newImageUrl);
        }
    }, [remoteImageUrl, generatedImage]);

    const handleGenerate = async () => {
        if (selectedProducts.length < 2) {
            Alert.alert('Products Required', 'Please select at least 2 products to generate a look');
            return;
        }
        const result = await generateLook();
        if (result?.imageUrl) {
            onUpdateField('imageUrl', result.imageUrl);
        }
    };

    const canSave = formData.title.trim().length > 0 &&
        formData.style.length > 0 &&
        formData.productIds.length >= 2 &&
        formData.productIds.length <= 5 &&
        formData.imageUrl.length > 0;

    const displayImageUrl = formData.imageUrl || generatedImage;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
                <View style={[styles.modalHeader,]}>
                    <TouchableOpacity onPress={onClose}>
                        <ThemedText style={[styles.modalCancelText, { color: tintColor }]}>
                            Cancel
                        </ThemedText>
                    </TouchableOpacity>
                    <ThemedText type="subtitle" style={styles.modalTitle}>
                        {editingLook ? 'Edit Look' : 'Create New Look'}
                    </ThemedText>
                    <TouchableOpacity
                        onPress={onSave}
                        disabled={!canSave || isSaving || isGenerating}
                        style={{ opacity: (!canSave || isSaving || isGenerating) ? 0.5 : 1 }}
                    >
                        <ThemedText style={[styles.modalSaveText, { color: tintColor }]}>
                            Save
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                    {/* Products Section - Top */}
                    <View style={styles.productsSection}>
                        <ThemedText style={styles.inputLabel}>
                            Products ({formData.productIds.length}/5) *
                        </ThemedText>
                        <ThemedText style={[styles.helperText, { color: iconColor }]}>
                            Select 2-5 products
                        </ThemedText>
                        <FlatList
                            data={availableProducts}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => {
                                const isSelected = formData.productIds.includes(item.id);
                                const isDisabled = !isSelected && formData.productIds.length >= 5;
                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.productCardCompact,
                                            { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                                            isSelected && { borderColor: tintColor, borderWidth: 2 },
                                            isDisabled && { opacity: 0.5 },
                                        ]}
                                        onPress={() => !isDisabled && onToggleProduct(item.id)}
                                        disabled={isDisabled}
                                    >
                                        <Image source={{ uri: item.imageUrl }} style={styles.productImageCompact} />
                                        <ThemedText style={styles.productNameCompact} numberOfLines={2}>
                                            {item.name}
                                        </ThemedText>
                                        {isSelected && (
                                            <View style={[styles.selectedBadgeCompact, { backgroundColor: tintColor }]}>
                                                <IconSymbol name="checkmark" size={12} color="white" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                            contentContainerStyle={styles.productListCompact}
                        />
                    </View>

                    {/* AI Pre-filling Note */}
                    <View style={[styles.aiNoteContainer, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                        <IconSymbol name="sparkles" size={16} color={tintColor} />
                        <View style={styles.aiNoteContent}>
                            <ThemedText style={[styles.aiNoteText, { color: textColor }]}>
                                AI will automatically analyze your products and pre-fill the title, description, and style fields below.
                            </ThemedText>
                            <ThemedText style={[styles.aiNoteSubtext, { color: iconColor }]}>
                                💡 Tip: If you want custom styling, add it in the Custom Styling Instructions section below before generating.
                            </ThemedText>
                        </View>
                    </View>

                    {/* Generate Button - After Products */}
                    <TouchableOpacity
                        style={[
                            styles.generateButton,
                            { backgroundColor: tintColor },
                            selectedProducts.length < 2 && { opacity: 0.5 },
                        ]}
                        onPress={handleGenerate}
                        disabled={isGenerating || selectedProducts.length < 2}
                    >
                        {isGenerating ? (
                            <>
                                <ActivityIndicator color={isDark ? '#000' : 'white'} />
                                <ThemedText style={[styles.generateButtonText, { color: isDark ? '#000' : 'white' }]}>
                                    {isExtractingMetadata ? 'Analyzing products...' : 'Generating look...'}
                                </ThemedText>
                            </>
                        ) : (
                            <>
                                <IconSymbol name="sparkles" size={20} color={isDark ? '#000' : 'white'} />
                                <ThemedText style={[styles.generateButtonText, { color: isDark ? '#000' : 'white' }]}>
                                    Generate Look
                                </ThemedText>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Form Fields Section - Below Products */}
                    <View style={styles.formSection}>
                        {/* Title */}
                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.inputLabel}>Look Title *</ThemedText>
                            <TextInput
                                style={[styles.textInput, { backgroundColor: cardBg, color: textColor, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                                value={formData.title}
                                onChangeText={(text) => onUpdateField('title', text)}
                                placeholder="e.g., Business Professional"
                                placeholderTextColor={iconColor}
                            />
                        </View>

                        {/* Description */}
                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.inputLabel}>Description</ThemedText>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: cardBg, color: textColor, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                                value={formData.description}
                                onChangeText={(text) => onUpdateField('description', text)}
                                placeholder="Describe this outfit combination..."
                                placeholderTextColor={iconColor}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {/* Style Input */}
                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.inputLabel}>Style *</ThemedText>
                            <TextInput
                                style={[styles.textInput, { backgroundColor: cardBg, color: textColor, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                                value={formData.style}
                                onChangeText={(text) => onUpdateField('style', text)}
                                placeholder="e.g., Business, Casual, Formal"
                                placeholderTextColor={iconColor}
                            />
                        </View>
                    </View>

                    {/* Generated Look Image Section */}
                    {displayImageUrl && (
                        <View style={[styles.generationSection, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                            <ThemedText type="subtitle" style={styles.sectionTitle}>
                                Generated Look Image
                            </ThemedText>
                            <View style={styles.generatedImageContainer}>
                                <TouchableOpacity
                                    style={styles.imageTouchable}
                                    onPress={() => setShowImageViewModal(true)}
                                    activeOpacity={0.9}
                                >
                                    <Image
                                        source={{ uri: displayImageUrl }}
                                        style={styles.generatedImage}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                                <View style={styles.imageActionButtons}>
                                    <TouchableOpacity
                                        style={[styles.viewFullImageButton, { borderColor: tintColor }]}
                                        onPress={() => setShowImageViewModal(true)}
                                        activeOpacity={0.85}
                                    >
                                        <IconSymbol name="eye.fill" size={16} color={tintColor} />
                                        <ThemedText style={[styles.viewFullImageButtonText, { color: tintColor }]}>
                                            View Full Image
                                        </ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.regenerateButton,
                                            { borderColor: tintColor },
                                            (isGenerating || isExtractingMetadata) && { opacity: 0.6 },
                                        ]}
                                        onPress={handleGenerate}
                                        disabled={isGenerating || isExtractingMetadata || selectedProducts.length < 2}
                                    >
                                        {(isGenerating || isExtractingMetadata) ? (
                                            <>
                                                <ActivityIndicator size="small" color={tintColor} />
                                                <ThemedText style={[styles.regenerateButtonText, { color: tintColor }]}>
                                                    {isExtractingMetadata ? 'Analyzing...' : 'Regenerating...'}
                                                </ThemedText>
                                            </>
                                        ) : (
                                            <>
                                                <IconSymbol name="arrow.clockwise" size={16} color={tintColor} />
                                                <ThemedText style={[styles.regenerateButtonText, { color: tintColor }]}>
                                                    Regenerate
                                                </ThemedText>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Full Screen Image Viewer Modal */}
                    <ImageViewModal
                        visible={showImageViewModal}
                        imageUrl={displayImageUrl || ''}
                        onClose={() => setShowImageViewModal(false)}
                        title="Generated Look"
                    />

                    {/* Custom Prompt Section */}
                    <View style={[styles.customPromptSection, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                        <TouchableOpacity
                            style={styles.promptToggleRow}
                            onPress={() => setShowPromptEditor(!showPromptEditor)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.promptToggleInfo}>
                                <ThemedText style={styles.promptToggleLabel}>Custom Styling Instructions (Advanced)</ThemedText>
                                <ThemedText style={[styles.promptToggleSubtext, { color: iconColor }]}>
                                    {showPromptEditor ? 'Tap to hide' : 'Tap to customize AI styling'}
                                </ThemedText>
                            </View>
                            <IconSymbol
                                name={showPromptEditor ? "chevron.up" : "chevron.down"}
                                size={20}
                                color={iconColor}
                            />
                        </TouchableOpacity>

                        {showPromptEditor && (
                            <View style={styles.promptEditorContainer}>
                                <ThemedText style={[styles.promptEditorLabel, { color: iconColor }]}>
                                    Describe how you want the outfit styled. Leave empty to use default.
                                </ThemedText>
                                <TextInput
                                    style={[styles.promptEditor, { backgroundColor, color: textColor, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                                    placeholder="Example: Make it look casual and relaxed, use natural lighting..."
                                    placeholderTextColor={iconColor}
                                    multiline
                                    numberOfLines={4}
                                    value={formData.customPrompt || ''}
                                    onChangeText={(text) => onUpdateField('customPrompt', text)}
                                    textAlignVertical="top"
                                />
                            </View>
                        )}
                    </View>

                    {/* Total Price & Featured Toggle */}
                    <View style={[styles.footerSection, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                        {selectedProducts.length > 0 && (
                            <View style={styles.totalPriceRow}>
                                <ThemedText style={styles.totalPriceLabel}>Total Look Price:</ThemedText>
                                <ThemedText style={[styles.totalPriceAmount, { color: tintColor }]}>
                                    ₦{totalPrice.toLocaleString()}
                                </ThemedText>
                            </View>
                        )}

                        <View style={styles.featuredToggleRow}>
                            <ThemedText style={styles.featuredLabel}>Feature this look</ThemedText>
                            <Switch
                                trackColor={{ false: iconColor + '40', true: tintColor }}
                                thumbColor={formData.isFeatured ? (isDark ? '#000' : 'white') : (isDark ? '#fff' : '#f4f3f4')}
                                ios_backgroundColor={iconColor + '40'}
                                onValueChange={(value) => onUpdateField('isFeatured', value)}
                                value={formData.isFeatured}
                            />
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            {
                                backgroundColor: tintColor,
                                opacity: (!canSave || isSaving || isGenerating) ? 0.6 : 1,
                            },
                        ]}
                        onPress={onSave}
                        disabled={!canSave || isSaving || isGenerating}
                    >
                        {isSaving ? (
                            <ActivityIndicator color={isDark ? '#000' : 'white'} />
                        ) : (
                            <ThemedText style={[styles.submitButtonText, { color: isDark ? '#000' : 'white' }]}>
                                {editingLook ? 'Update Look' : 'Create Look'}
                            </ThemedText>
                        )}
                    </TouchableOpacity>

                    <View style={styles.bottomSpacing} />
                </ScrollView>

            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0, 0.1)',
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '500',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    modalSaveText: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    productsSection: {
        marginTop: 20,
    },
    formSection: {
        marginTop: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    helperText: {
        fontSize: 12,
        marginBottom: 8,
    },
    aiNoteContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 16,
        marginBottom: 12,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        gap: 10,
    },
    aiNoteContent: {
        flex: 1,
    },
    aiNoteText: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 4,
    },
    aiNoteSubtext: {
        fontSize: 12,
        lineHeight: 16,
        fontStyle: 'italic',
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    productListCompact: {
        paddingVertical: 8,
    },
    productCardCompact: {
        width: 100,
        marginRight: 12,
        borderRadius: 8,
        borderWidth: 1,
        padding: 8,
        position: 'relative',
    },
    productImageCompact: {
        width: '100%',
        height: 80,
        borderRadius: 6,
        marginBottom: 6,
    },
    productNameCompact: {
        fontSize: 11,
        fontWeight: '500',
    },
    selectedBadgeCompact: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    generationSection: {
        marginTop: 20,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    sectionDescription: {
        fontSize: 13,
        marginBottom: 16,
    },
    generatedImageContainer: {
        alignItems: 'center',
        width: '100%',
    },
    imageTouchable: {
        width: '100%',
        marginBottom: 12,
    },
    generatedImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
    imageActionButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    viewFullImageButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        gap: 6,
    },
    viewFullImageButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    generateButton: {
        marginTop: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
    },
    generateButtonText: {

        fontSize: 16,
        fontWeight: '600',
    },
    regenerateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        gap: 6,
    },
    regenerateButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    customPromptSection: {
        marginTop: 20,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    promptToggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    promptToggleInfo: {
        flex: 1,
        marginRight: 12,
    },
    promptToggleLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    promptToggleSubtext: {
        fontSize: 13,
    },
    promptEditorContainer: {
        marginTop: 12,
    },
    promptEditorLabel: {
        fontSize: 13,
        marginBottom: 8,
    },
    promptEditor: {
        minHeight: 100,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        fontSize: 14,
        textAlignVertical: 'top',
    },
    footerSection: {
        marginTop: 20,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    totalPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalPriceLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    totalPriceAmount: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    featuredToggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    featuredLabel: {
        fontSize: 16,
    },
    submitButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    bottomSpacing: {
        height: 40,
    },
});
