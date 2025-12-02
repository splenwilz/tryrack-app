/**
 * TodayOutfitCTA Component
 * Call-to-action card for selecting today's outfit
 *
 * @see https://reactnative.dev/docs/touchableopacity - React Native TouchableOpacity patterns
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface TodayOutfitCTAProps {
    onPress?: () => void;
}

export const TodayOutfitCTA: React.FC<TodayOutfitCTAProps> = ({ onPress }) => {
    const tintColor = useThemeColor({}, 'tint');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const textColor = isDark ? '#000' : 'white';
    const iconColor = isDark ? '#000' : 'white';

    return (
        <TouchableOpacity
            style={[styles.todaysOutfitCTA, { backgroundColor: tintColor }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <IconSymbol name="tshirt.fill" size={24} color={iconColor} />
            <View style={styles.ctaTextContainer}>
                <ThemedText style={[styles.ctaTitle, { color: textColor }]}>Select Today&apos;s Outfit</ThemedText>
                <ThemedText style={[styles.ctaSubtitle, { color: textColor }]}>
                    Quickly mark what you&apos;re wearing
                </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color={iconColor} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    todaysOutfitCTA: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        gap: 12,
    },
    ctaTextContainer: {
        flex: 1,
    },
    ctaTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    ctaSubtitle: {
        fontSize: 12,
        opacity: 0.9,
    },
});

