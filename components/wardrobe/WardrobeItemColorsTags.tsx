import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { WardrobeItemResponse } from '@/api/wardrobe/types';

interface WardrobeItemColorsTagsProps {
    item: WardrobeItemResponse;
}

/**
 * Displays wardrobe item colors and tags in a card layout
 * 
 * @param item - The wardrobe item to display colors and tags for
 * @see https://reactnative.dev/docs/view - React Native View component
 */
export function WardrobeItemColorsTags({ item }: WardrobeItemColorsTagsProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const borderColor = useThemeColor({}, 'tabIconDefault');
    const textColor = useThemeColor({}, 'text');

    if (!item.colors?.length && !item.tags?.length) {
        return null;
    }

    return (
        <View style={[styles.detailsCard, { backgroundColor }]}>
            {item.colors && item.colors.length > 0 && (
                <View style={styles.detailBlock}>
                    <ThemedText style={styles.detailBlockLabel}>COLORS</ThemedText>
                    <View style={styles.chipContainer}>
                        {item.colors.map((color: string) => (
                            <View
                                key={color}
                                style={[styles.colorChip, { backgroundColor: tintColor + '20', borderColor: tintColor }]}
                            >
                                <ThemedText style={[styles.colorChipText, { color: tintColor }]}>{color}</ThemedText>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {item.tags && item.tags.length > 0 && (
                <View style={[styles.detailBlock, item.colors && item.colors.length > 0 && styles.detailBlockWithBorder]}>
                    <ThemedText style={styles.detailBlockLabel}>TAGS</ThemedText>
                    <View style={styles.chipContainer}>
                        {item.tags.map((tag: string) => (
                            <View key={tag} style={[styles.tagChip, { borderColor }]}>
                                <IconSymbol name="tag.fill" size={11} color={textColor} />
                                <ThemedText style={[styles.tagText, { color: textColor }]}>{tag}</ThemedText>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    detailsCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    detailBlock: {
        marginBottom: 0,
    },
    detailBlockWithBorder: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128, 128, 128, 0.15)',
    },
    detailBlockLabel: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 12,
        opacity: 0.5,
        letterSpacing: 1,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    colorChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
    },
    colorChipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 18,
        borderWidth: 1.5,
        backgroundColor: 'transparent',
    },
    tagText: {
        fontSize: 12,
        fontWeight: '500',
    },
});

