/**
 * Today's Outfit Instructions Component
 * Displays instructions for the Today's Outfit screen
 *
 * @see https://reactnative.dev/docs/view - React Native View component
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function TodaysOutfitInstructions() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.instructionsCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
            <ThemedText style={styles.instructionsText}>
                Select the items you&apos;re planning to wear today. Tap items to select or deselect them.
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    instructionsCard: {
        marginTop: 20,
        marginBottom: 20,
        padding: 12,
        borderRadius: 8,
    },
    instructionsText: {
        fontSize: 14,
        opacity: 0.8,
        lineHeight: 20,
    },
});

