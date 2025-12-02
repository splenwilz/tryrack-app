import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { CustomHeader } from '@/components/custom-header';
import { useThemeColor } from '@/hooks/use-theme-color';

interface WardrobeItemDetailErrorProps {
    onBackPress: () => void;
}

/**
 * Error state component for wardrobe item detail screen
 * 
 * @param onBackPress - Callback when back button is pressed
 * @see https://reactnative.dev/docs/view - React Native View component
 */
export function WardrobeItemDetailError({ onBackPress }: WardrobeItemDetailErrorProps) {
    const backgroundColor = useThemeColor({}, 'background');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <CustomHeader title="Item Details" showBackButton={true} onBackPress={onBackPress} />
            <View style={styles.centerContent}>
                <ThemedText type="subtitle" style={styles.errorText}>Item not found</ThemedText>
                <ThemedText style={styles.errorDescription}>
                    The item you&apos;re looking for doesn&apos;t exist or has been deleted.
                </ThemedText>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorText: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 12,
    },
    errorDescription: {
        fontSize: 14,
        opacity: 0.7,
        textAlign: 'center',
    },
});

