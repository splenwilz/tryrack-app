import { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ProcessingIndicator } from './ProcessingIndicator';
import { ImageViewModal } from './ImageViewModal';
import type { ProcessingStage } from '@/types/wardrobe';

interface ImageUploadSectionProps {
    imageUrl: string | null;
    processingStage: ProcessingStage;
    isProcessing: boolean;
    isUploading: boolean;
    onSelectPhoto: () => void;
    onRemovePhoto: () => void;
    showAISuggestions?: boolean;
}

export function ImageUploadSection({
    imageUrl,
    processingStage,
    isProcessing,
    isUploading,
    onSelectPhoto,
    onRemovePhoto,
    showAISuggestions = false,
}: ImageUploadSectionProps) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const borderColor = useThemeColor({}, 'tabIconDefault');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const buttonTextColor = isDark ? '#000' : 'white';
    const buttonIconColor = isDark ? '#000' : 'white';

    const handleViewImage = () => {
        setIsModalVisible(true);
    };

    return (
        <View style={[styles.section, { backgroundColor }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
                Item Photo *
            </ThemedText>

            <TouchableOpacity
                style={[styles.imageUploadButton, { borderColor }]}
                onPress={onSelectPhoto}
                disabled={isProcessing || isUploading}
                activeOpacity={0.85}
            >
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.previewImage} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <IconSymbol name="camera.fill" size={48} color={borderColor} />
                        <ThemedText style={[styles.placeholderText, { color: borderColor }]}>
                            {isProcessing || isUploading ? 'Processing...' : 'Tap to add photo'}
                        </ThemedText>
                    </View>
                )}
            </TouchableOpacity>

            {isProcessing && processingStage && (
                <ProcessingIndicator stage={processingStage} />
            )}

            {showAISuggestions && (
                <View
                    style={[
                        styles.aiSuggestionBadge,
                        { backgroundColor: `${tintColor}20`, borderColor: tintColor },
                    ]}
                >
                    <IconSymbol name="sparkles" size={16} color={tintColor} />
                    <ThemedText style={[styles.aiSuggestionText, { color: tintColor }]}>
                        AI suggestions applied
                    </ThemedText>
                </View>
            )}

            {imageUrl && (
                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                        style={[styles.viewButton, { borderColor: tintColor }]}
                        onPress={handleViewImage}
                        activeOpacity={0.85}
                    >
                        <IconSymbol name="eye.fill" size={16} color={tintColor} />
                        <ThemedText style={[styles.viewButtonText, { color: tintColor }]}>
                            View Full Image
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.removeButton, { backgroundColor: tintColor }]}
                        onPress={onRemovePhoto}
                        activeOpacity={0.85}
                    >
                        <IconSymbol name="trash.fill" size={16} color={buttonIconColor} />
                        <ThemedText style={[styles.removeButtonText, { color: buttonTextColor }]}>
                            Remove Photo
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            )}

            <ImageViewModal
                visible={isModalVisible}
                imageUrl={imageUrl}
                onClose={() => setIsModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128, 128, 128, 0.1)',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    imageUploadButton: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        overflow: 'hidden',
        marginBottom: 12,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        marginTop: 8,
        fontSize: 14,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    viewButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 2,
        gap: 8,
    },
    viewButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    removeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    removeButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    aiSuggestionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        gap: 6,
        marginVertical: 8,
        alignSelf: 'flex-start',
    },
    aiSuggestionText: {
        fontSize: 13,
        fontWeight: '600',
    },
});

