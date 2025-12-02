/**
 * Today's Outfit CTA Button Component
 * Action button for planning/saving today's outfit
 *
 * @see https://reactnative.dev/docs/touchableopacity - React Native TouchableOpacity
 */

import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface TodaysOutfitCTAProps {
    selectedCount: number;
    isUpdating: boolean;
    disabled: boolean;
    onPress: () => void;
}

export function TodaysOutfitCTA({ selectedCount, isUpdating, disabled, onPress }: TodaysOutfitCTAProps) {
    const tintColor = useThemeColor({}, 'tint');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <TouchableOpacity
            style={[
                styles.ctaButton,
                { backgroundColor: tintColor },
                disabled && styles.ctaButtonDisabled,
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            {isUpdating ? (
                <>
                    <ActivityIndicator size="small" color={isDark ? '#000' : 'white'} style={{ marginRight: 8 }} />
                    <ThemedText style={[styles.ctaButtonText, { color: isDark ? '#000' : 'white' }]}>
                        Updating...
                    </ThemedText>
                </>
            ) : (
                <>
                    <IconSymbol name="checkmark.circle.fill" size={20} color={isDark ? '#000' : 'white'} />
                    <ThemedText style={[styles.ctaButtonText, { color: isDark ? '#000' : 'white' }]}>
                        Mark {selectedCount > 0 ? `${selectedCount} ` : ''}as Worn Today
                    </ThemedText>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    ctaButtonDisabled: {
        opacity: 0.5,
    },
    ctaButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

