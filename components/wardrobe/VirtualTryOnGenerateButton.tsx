/**
 * Generate Button Component
 * Main CTA for generating virtual try-on
 *
 * @see https://reactnative.dev/docs/touchableopacity - React Native TouchableOpacity
 */

import React from 'react';
import { TouchableOpacity, View, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

interface VirtualTryOnGenerateButtonProps {
    isGenerating: boolean;
    isDisabled: boolean;
    tryonStatus?: string;
    onPress: () => void;
}

export function VirtualTryOnGenerateButton({
    isGenerating,
    isDisabled,
    tryonStatus,
    onPress,
}: VirtualTryOnGenerateButtonProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const tintColor = useThemeColor({}, 'tint');

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: tintColor },
                isDisabled && styles.disabledButton
            ]}
            onPress={onPress}
            disabled={isDisabled}
        >
            {isGenerating ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={isDark ? '#000' : 'white'} />
                    <ThemedText style={[styles.buttonText, { color: isDark ? '#000' : 'white' }]}>
                        {tryonStatus === 'processing' ? 'AI Generating...' : 'Uploading...'}
                    </ThemedText>
                </View>
            ) : (
                <>
                    <IconSymbol name="plus" size={20} color={isDark ? '#000' : 'white'} />
                    <ThemedText style={[styles.buttonText, { color: isDark ? '#000' : 'white' }]}>
                        Generate Virtual Try-On
                    </ThemedText>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    disabledButton: {
        opacity: 0.5,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

