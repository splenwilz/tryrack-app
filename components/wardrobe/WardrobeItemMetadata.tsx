import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { WardrobeItemResponse } from '@/api/wardrobe/types';

interface WardrobeItemMetadataProps {
    item: WardrobeItemResponse;
}

/**
 * Displays wardrobe item metadata (created and updated dates)
 * 
 * @param item - The wardrobe item to display metadata for
 * @see https://reactnative.dev/docs/view - React Native View component
 */
export function WardrobeItemMetadata({ item }: WardrobeItemMetadataProps) {
    return (
        <View style={styles.metadataSection}>
            <ThemedText style={styles.metadataLabel}>
                Added on {new Date(item.created_at).toLocaleDateString()}
            </ThemedText>
            {item.updated_at && (
                <ThemedText style={styles.metadataLabel}>
                    Last updated {new Date(item.updated_at).toLocaleDateString()}
                </ThemedText>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    metadataSection: {
        paddingTop: 20,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
        marginTop: 20,
    },
    metadataLabel: {
        fontSize: 12,
        opacity: 0.6,
        marginBottom: 4,
    },
});

