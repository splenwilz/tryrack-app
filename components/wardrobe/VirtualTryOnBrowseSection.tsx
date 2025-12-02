/**
 * Browse Wardrobe Section Component
 * Button to open wardrobe browse modal
 *
 * @see https://reactnative.dev/docs/touchableopacity - React Native TouchableOpacity
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface VirtualTryOnBrowseSectionProps {
    onOpenModal: () => void;
}

export function VirtualTryOnBrowseSection({ onOpenModal }: VirtualTryOnBrowseSectionProps) {
    const tintColor = useThemeColor({}, 'tint');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={styles.container}>
            <ThemedText type="subtitle" style={styles.title}>
                Browse Your Wardrobe
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: '#999', marginBottom: 12 }]}>
                Add any item from your wardrobe to complete your outfit
            </ThemedText>
            <TouchableOpacity
                style={[styles.button, { backgroundColor: tintColor, borderColor: tintColor }]}
                onPress={onOpenModal}
            >
                <IconSymbol name="magnifyingglass" size={20} color={isDark ? '#000' : 'white'} />
                <ThemedText style={[styles.buttonText, { color: isDark ? '#000' : 'white' }]}>
                    Browse & Search Items
                </ThemedText>
            </TouchableOpacity>
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
    subtitle: {
        fontSize: 12,
        marginTop: 4,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

