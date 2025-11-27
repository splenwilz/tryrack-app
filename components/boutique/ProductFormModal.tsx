/**
 * Product Form Modal Component
 * Reusable modal for adding/editing catalog products
 * 
 * @see https://reactnative.dev/docs/modal - React Native Modal
 */

import React from 'react';
import { Modal, StyleSheet, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ImageUploadSection } from '@/components/wardrobe/ImageUploadSection';
import { CategorySelector } from '@/components/wardrobe/CategorySelector';
import { ColorSelector } from '@/components/wardrobe/ColorSelector';
import { TagInput } from '@/components/wardrobe/TagInput';
import type { CatalogProduct } from '@/types/boutique';
import type { CatalogProductFormData } from '@/hooks/boutique/useCatalogProductForm';
import { calculateProfit } from '@/utils/catalog-validation';

interface ProductFormModalProps {
    visible: boolean;
    editingProduct: CatalogProduct | null;
    formData: CatalogProductFormData;
    onClose: () => void;
    onSave: () => void;
    onUpdateField: <K extends keyof CatalogProductFormData>(field: K, value: CatalogProductFormData[K]) => void;
    onUpdateColors: (colors: string[]) => void;
    onAddTag: (tag: string) => void;
    onRemoveTag: (tag: string) => void;
    onImageUpload: () => Promise<void>;
    onRemovePhoto: () => void;
    imageUrl: string;
    processingStage: string | null;
    isPickingPhoto: boolean;
    isUploadingImage: boolean;
    isSaving: boolean;
}

export function ProductFormModal({
    visible,
    editingProduct,
    formData,
    onClose,
    onSave,
    onUpdateField,
    onUpdateColors,
    onAddTag,
    onRemoveTag,
    onImageUpload,
    onRemovePhoto,
    imageUrl,
    processingStage,
    isPickingPhoto,
    isUploadingImage,
    isSaving,
}: ProductFormModalProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const textColor = useThemeColor({}, 'text');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const fabIconColor = isDark ? '#000' : 'white';
    const cardBg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');
    const borderColor = useThemeColor({}, 'tabIconDefault');

    const profitInfo = calculateProfit(formData);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={onClose}>
                        <ThemedText style={[styles.modalCancelText, { color: tintColor }]}>
                            Cancel
                        </ThemedText>
                    </TouchableOpacity>
                    <ThemedText type="subtitle" style={styles.modalTitle}>
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </ThemedText>
                    <TouchableOpacity onPress={onSave}>
                        <ThemedText style={[styles.modalSaveText, { color: tintColor }]}>
                            Save
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                    {/* Image Upload Section */}
                    <ImageUploadSection
                        imageUrl={imageUrl}
                        processingStage={processingStage}
                        isProcessing={isPickingPhoto || isUploadingImage}
                        isUploading={isUploadingImage}
                        onSelectPhoto={onImageUpload}
                        onRemovePhoto={onRemovePhoto}
                        showAISuggestions={Boolean(imageUrl && (formData.name || formData.category))}
                    />

                    {/* Product Details Form */}
                    <View style={styles.formSection}>
                        <ThemedText style={styles.sectionLabel}>Product Details</ThemedText>

                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.inputLabel}>Product Name *</ThemedText>
                            <TextInput
                                style={[styles.textInput, { backgroundColor: cardBg, color: textColor, borderColor: borderColor }]}
                                value={formData.name}
                                onChangeText={(text) => onUpdateField('name', text)}
                                placeholder="Enter product name"
                                placeholderTextColor={iconColor}
                            />
                        </View>
                    </View>

                    {/* Category Selector */}
                    <CategorySelector
                        value={formData.category}
                        onChange={(value) => onUpdateField('category', value)}
                    />

                    {/* Color Selector */}
                    <ColorSelector
                        value={formData.colors}
                        onChange={onUpdateColors}
                    />

                    {/* Additional Product Details */}
                    <View style={styles.formSection}>
                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <ThemedText style={styles.inputLabel}>Brand</ThemedText>
                                <TextInput
                                    style={[styles.textInput, { backgroundColor: cardBg, color: textColor, borderColor: borderColor }]}
                                    value={formData.brand}
                                    onChangeText={(text) => onUpdateField('brand', text)}
                                    placeholder="Brand name (optional)"
                                    placeholderTextColor={iconColor}
                                />
                            </View>
                        </View>

                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <ThemedText style={styles.inputLabel}>Cost Price (₦)</ThemedText>
                                <ThemedText style={[styles.helperText, { color: iconColor, marginBottom: 8 }]}>
                                    What you paid for it
                                </ThemedText>
                                <TextInput
                                    style={[styles.textInput, { backgroundColor: cardBg, color: textColor, borderColor: borderColor }]}
                                    value={formData.costPrice}
                                    onChangeText={(text) => onUpdateField('costPrice', text)}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    placeholderTextColor={iconColor}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                <ThemedText style={styles.inputLabel}>Selling Price (₦) *</ThemedText>
                                <ThemedText style={[styles.helperText, { color: iconColor, marginBottom: 8 }]}>
                                    What customers will pay
                                </ThemedText>
                                <TextInput
                                    style={[styles.textInput, { backgroundColor: cardBg, color: textColor, borderColor: borderColor }]}
                                    value={formData.price}
                                    onChangeText={(text) => onUpdateField('price', text)}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    placeholderTextColor={iconColor}
                                />
                            </View>
                        </View>

                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <ThemedText style={styles.inputLabel}>Discount Price (₦)</ThemedText>
                                <ThemedText style={[styles.helperText, { color: iconColor, marginBottom: 8 }]}>
                                    Only if on sale/discount
                                </ThemedText>
                                <TextInput
                                    style={[styles.textInput, { backgroundColor: cardBg, color: textColor, borderColor: borderColor }]}
                                    value={formData.discountPrice}
                                    onChangeText={(text) => onUpdateField('discountPrice', text)}
                                    placeholder="Leave empty if not on sale"
                                    placeholderTextColor={iconColor}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        {/* Profit Display - Read-only information card */}
                        {profitInfo && (
                            <View style={[styles.profitContainer, { backgroundColor: cardBg, borderColor: borderColor }]}>
                                <View style={styles.profitRow}>
                                    <ThemedText style={styles.profitLabel}>Profit per item:</ThemedText>
                                    <ThemedText style={[styles.profitAmount, { color: tintColor }]}>
                                        ₦{profitInfo.profit.toLocaleString()}
                                    </ThemedText>
                                </View>
                                <ThemedText style={styles.profitMargin}>
                                    {profitInfo.margin}% profit margin
                                </ThemedText>
                            </View>
                        )}

                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <ThemedText style={styles.inputLabel}>Stock Quantity</ThemedText>
                                <TextInput
                                    style={[styles.textInput, { backgroundColor: cardBg, color: textColor, borderColor: borderColor }]}
                                    value={formData.stock}
                                    onChangeText={(text) => onUpdateField('stock', text)}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    placeholderTextColor={iconColor}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.inputLabel}>Description</ThemedText>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: cardBg, color: textColor, borderColor: borderColor }]}
                                value={formData.description}
                                onChangeText={(text) => onUpdateField('description', text)}
                                placeholder="Describe your product..."
                                placeholderTextColor={iconColor}
                                multiline
                                numberOfLines={4}
                            />
                        </View>
                    </View>

                    {/* Tag Input */}
                    <TagInput
                        tags={formData.tags}
                        onAddTag={onAddTag}
                        onRemoveTag={onRemoveTag}
                    />

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            {
                                backgroundColor: tintColor,
                                opacity: (isPickingPhoto || isUploadingImage || isSaving) ? 0.6 : 1,
                            },
                        ]}
                        onPress={onSave}
                        disabled={isPickingPhoto || isUploadingImage || isSaving}
                    >
                        {(isPickingPhoto || isUploadingImage || isSaving) ? (
                            <ActivityIndicator color={fabIconColor} />
                        ) : (
                            <ThemedText style={[styles.submitButtonText, { color: fabIconColor }]}>
                                {editingProduct ? 'Update Product' : 'Add Product'}
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
        borderBottomColor: 'rgba(0,0,0,0.1)',
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
    },
    formSection: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128, 128, 128, 0.1)',
    },
    sectionLabel: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
        opacity: 0.8,
    },
    helperText: {
        fontSize: 12,
        fontStyle: 'italic',
        opacity: 0.7,
        marginBottom: 8,
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
        paddingVertical: 12,
        fontSize: 16,
        textAlignVertical: 'top',
        minHeight: 100,
    },
    submitButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        marginBottom: 20,
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    submitButtonText: {
        fontSize: 18,
        fontWeight: '600',
    },
    bottomSpacing: {
        height: 20,
    },
    profitContainer: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 12,
        marginBottom: 8,
    },
    profitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    profitLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    profitAmount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    profitMargin: {
        fontSize: 12,
        opacity: 0.7,
        marginTop: 4,
    },
});

