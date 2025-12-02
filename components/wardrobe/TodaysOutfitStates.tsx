/**
 * Today's Outfit State Components
 * Loading, error, and empty states for Today's Outfit screen
 *
 * @see https://reactnative.dev/docs/view - React Native View component
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomHeader } from '@/components/custom-header';
import { router } from 'expo-router';

interface TodaysOutfitLoadingStateProps {
    onBackPress: () => void;
}

export function TodaysOutfitLoadingState({ onBackPress }: TodaysOutfitLoadingStateProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <CustomHeader title="Today's Outfit" showBackButton={true} onBackPress={onBackPress} />
            <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={tintColor} />
                <ThemedText style={styles.loadingText}>Loading your wardrobe...</ThemedText>
            </View>
        </SafeAreaView>
    );
}

interface TodaysOutfitErrorStateProps {
    onBackPress: () => void;
}

export function TodaysOutfitErrorState({ onBackPress }: TodaysOutfitErrorStateProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <CustomHeader title="Today's Outfit" showBackButton={true} onBackPress={onBackPress} />
            <View style={styles.centerContent}>
                <ThemedText style={styles.errorText}>Error loading wardrobe</ThemedText>
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: tintColor }]}
                    onPress={onBackPress}
                >
                    <ThemedText style={[styles.buttonText, { color: isDark ? '#000' : 'white' }]}>
                        Go Back
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

interface TodaysOutfitEmptyStateProps {
    onBackPress: () => void;
}

export function TodaysOutfitEmptyState({ onBackPress }: TodaysOutfitEmptyStateProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <CustomHeader title="Today's Outfit" showBackButton={true} onBackPress={onBackPress} />
            <View style={styles.centerContent}>
                <IconSymbol name="tshirt" size={64} color={textColor} style={{ opacity: 0.3, marginBottom: 16 }} />
                <ThemedText type="title" style={styles.emptyTitle}>No Clean Items</ThemedText>
                <ThemedText style={styles.emptyText}>
                    You don&apos;t have any clean items in your wardrobe. Add items or mark existing items as clean to get started.
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
        paddingHorizontal: 20,
    },
    loadingText: {
        marginTop: 16,
        opacity: 0.7,
    },
    errorText: {
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    emptyTitle: {
        marginBottom: 8,
    },
    emptyText: {
        textAlign: 'center',
        opacity: 0.7,
        lineHeight: 20,
    },
});

