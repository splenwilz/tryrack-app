import React from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, Image, StatusBar, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ImageViewModalProps {
    visible: boolean;
    imageUrl: string | null;
    onClose: () => void;
}

/**
 * Image View Modal Component
 * Displays the full processed image
 * 
 * @see https://reactnative.dev/docs/modal - React Native Modal documentation
 */
export function ImageViewModal({
    visible,
    imageUrl,
    onClose,
}: ImageViewModalProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const borderColor = useThemeColor({}, 'tabIconDefault');
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const barStyle: 'light-content' | 'dark-content' =
        colorScheme === 'dark' ? 'light-content' : 'dark-content';

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={false}
            onRequestClose={onClose}
        >
            <StatusBar barStyle={barStyle} />
            <View style={[styles.modalContainer, { backgroundColor, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                {/* Header */}
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <IconSymbol name="xmark" size={24} color={borderColor} />
                    </TouchableOpacity>
                    <ThemedText type="title" style={styles.modalTitle}>
                        Processed Image
                    </ThemedText>
                    <View style={styles.closeButton} />
                </View>

                {/* Full Image View */}
                {imageUrl ? (
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
                    </View>
                ) : (
                    <View style={[styles.imageContainer, styles.placeholderContainer]}>
                        <IconSymbol name="camera.fill" size={64} color={borderColor} />
                        <ThemedText style={[styles.placeholderText, { color: borderColor }]}>
                            No image available
                        </ThemedText>
                    </View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128, 128, 128, 0.1)',
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    imageContainer: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 20,
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
    placeholderContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    placeholderText: {
        marginTop: 16,
        fontSize: 16,
    },
});

