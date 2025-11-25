/**
 * EmptyWardrobeState Component
 * Shown when wardrobe is empty, encouraging users to add their first item
 *
 * @see https://reactnative.dev/docs/accessibility - React Native accessibility patterns
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';

export const EmptyWardrobeState: React.FC = () => {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');

    const handleAddFirstItem = () => {
        router.push('/wardrobe/manage-item');
    };

    return (
        <View style={[styles.emptyState, { backgroundColor }]}>
            <View style={styles.emptyStateIcon}>
                <ThemedText style={styles.emptyStateEmoji}>👕</ThemedText>
            </View>
            <ThemedText type="title" style={styles.emptyStateTitle}>
                Your Wardrobe is Empty
            </ThemedText>
            <ThemedText style={styles.emptyStateDescription}>
                Start building your digital wardrobe by adding your favorite clothing items.
            </ThemedText>
            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: tintColor }]}
                onPress={handleAddFirstItem}
            >
                <ThemedText style={styles.addButtonText}>Add Your First Item</ThemedText>
            </TouchableOpacity>

            <View style={styles.quickTips}>
                <ThemedText style={styles.quickTipsTitle}>Quick Tips:</ThemedText>
                <ThemedText style={styles.quickTip}>• Take photos of your clothes</ThemedText>
                <ThemedText style={styles.quickTip}>• Organize by categories</ThemedText>
                <ThemedText style={styles.quickTip}>• Get outfit recommendations</ThemedText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyStateIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyStateEmoji: {
        fontSize: 48,
    },
    emptyStateTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    emptyStateDescription: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.7,
        lineHeight: 24,
        marginBottom: 32,
    },
    addButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 32,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    quickTips: {
        alignItems: 'flex-start',
    },
    quickTipsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    quickTip: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 4,
    },
});

