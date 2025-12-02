import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatLastWorn } from '@/utils/wardrobe';
import type { WardrobeItemResponse } from '@/api/wardrobe/types';

interface WardrobeItemWearHistoryProps {
    item: WardrobeItemResponse;
}

/**
 * Displays wear history information (last worn date and total wear count)
 * 
 * @param item - The wardrobe item to display wear history for
 * @see https://reactnative.dev/docs/view - React Native View component
 */
export function WardrobeItemWearHistory({ item }: WardrobeItemWearHistoryProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');

    if (!item.last_worn_at && (!item.wear_count || item.wear_count === 0)) {
        return null;
    }

    return (
        <View style={[styles.detailsCard, { backgroundColor }]}>
            <ThemedText style={styles.detailBlockLabel}>WEAR HISTORY</ThemedText>
            <View style={styles.wearHistoryRow}>
                {item.last_worn_at && (
                    <View style={styles.wearHistoryItem}>
                        <IconSymbol name="calendar" size={16} color={tintColor} />
                        <View style={styles.wearHistoryText}>
                            <ThemedText style={styles.wearHistoryLabel}>Last Worn</ThemedText>
                            <ThemedText style={[styles.wearHistoryValue, { color: tintColor }]}>
                                {formatLastWorn(item.last_worn_at) || new Date(item.last_worn_at).toLocaleDateString()}
                            </ThemedText>
                        </View>
                    </View>
                )}
                {item.wear_count && item.wear_count > 0 && (
                    <View style={styles.wearHistoryItem}>
                        <IconSymbol name="tshirt.fill" size={16} color={tintColor} />
                        <View style={styles.wearHistoryText}>
                            <ThemedText style={styles.wearHistoryLabel}>Total Wears</ThemedText>
                            <ThemedText style={[styles.wearHistoryValue, { color: tintColor }]}>
                                {item.wear_count} {item.wear_count === 1 ? 'time' : 'times'}
                            </ThemedText>
                        </View>
                    </View>
                )}
            </View>
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
    detailBlockLabel: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 12,
        opacity: 0.5,
        letterSpacing: 1,
    },
    wearHistoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 12,
    },
    wearHistoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    wearHistoryText: {
        flexDirection: 'column',
    },
    wearHistoryLabel: {
        fontSize: 11,
        opacity: 0.6,
        marginBottom: 2,
    },
    wearHistoryValue: {
        fontSize: 14,
        fontWeight: '600',
    },
});

