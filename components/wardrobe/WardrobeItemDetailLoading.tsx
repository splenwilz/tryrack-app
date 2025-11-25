import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { CustomHeader } from '@/components/custom-header';
import { useThemeColor } from '@/hooks/use-theme-color';

interface WardrobeItemDetailLoadingProps {
    onBackPress: () => void;
}

/**
 * Loading state component for wardrobe item detail screen
 * 
 * @param onBackPress - Callback when back button is pressed
 * @see https://reactnative.dev/docs/activityindicator - React Native ActivityIndicator
 */
export function WardrobeItemDetailLoading({ onBackPress }: WardrobeItemDetailLoadingProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <CustomHeader title="Item Details" showBackButton={true} onBackPress={onBackPress} />
            <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={tintColor} />
                <ThemedText style={styles.loadingText}>Loading item details...</ThemedText>
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
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
});

