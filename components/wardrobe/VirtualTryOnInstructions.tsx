/**
 * Instructions Section Component
 * How it works guide
 *
 * @see https://reactnative.dev/docs/view - React Native View
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export function VirtualTryOnInstructions() {
    return (
        <View style={styles.container}>
            <ThemedText type="subtitle" style={styles.title}>How It Works</ThemedText>
            <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                    <ThemedText style={styles.instructionNumberText}>1</ThemedText>
                </View>
                <ThemedText style={styles.instructionText}>
                    Take a clear photo of yourself in good lighting
                </ThemedText>
            </View>
            <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                    <ThemedText style={styles.instructionNumberText}>2</ThemedText>
                </View>
                <ThemedText style={styles.instructionText}>
                    Our AI will combine your photo with the product image
                </ThemedText>
            </View>
            <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                    <ThemedText style={styles.instructionNumberText}>3</ThemedText>
                </View>
                <ThemedText style={styles.instructionText}>
                    See how the item looks on you before buying
                </ThemedText>
            </View>
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
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    instructionNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    instructionNumberText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    instructionText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
});

