/**
 * Today's Outfit Screen
 * Quick selection interface for users to plan and manage today's outfit
 * 
 * @see https://reactnative.dev/docs/scrollview - React Native ScrollView
 */

import { StyleSheet, View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CustomHeader } from '@/components/custom-header';
import { router } from 'expo-router';
import { useTodaysOutfit } from '@/hooks/wardrobe/useTodaysOutfit';
import {
    TodaysOutfitSummary,
    TodaysOutfitCategorySection,
    TodaysOutfitCTA,
    TodaysOutfitInstructions,
    TodaysOutfitLoadingState,
    TodaysOutfitErrorState,
    TodaysOutfitEmptyState,
} from '@/components/wardrobe';

export default function TodaysOutfitScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const {
        items,
        groupedItems,
        selectedItems,
        selectedItemIds,
        isLoading,
        isFetchingClean,
        isFetchingPlanned,
        isUpdating,
        showLoadingState,
        showErrorState,
        showEmptyState,
        toggleItemSelection,
        handlePlanOutfit,
        handleRefresh,
    } = useTodaysOutfit();

    const handleBackPress = () => {
        router.back();
    };

    // Show loading state
    if (showLoadingState) {
        return <TodaysOutfitLoadingState onBackPress={handleBackPress} />;
    }

    // Show error state
    if (showErrorState) {
        return <TodaysOutfitErrorState onBackPress={handleBackPress} />;
    }

    // Show empty state
    if (showEmptyState) {
        return <TodaysOutfitEmptyState onBackPress={handleBackPress} />;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <CustomHeader title="Select Today&apos;s Outfit" showBackButton={true} onBackPress={handleBackPress} />

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={(isFetchingClean || isFetchingPlanned) && !isLoading}
                        onRefresh={handleRefresh}
                        tintColor={tintColor}
                    />
                }
            >
                {/* Show subtle loading indicator if refetching in background */}
                {(isFetchingClean || isFetchingPlanned) && !isLoading && items.length > 0 && (
                    <View style={styles.refetchIndicator}>
                        <ActivityIndicator size="small" color={tintColor} />
                        <ThemedText style={styles.refetchText}>Updating...</ThemedText>
                    </View>
                )}

                {/* Summary Section */}
                <TodaysOutfitSummary items={selectedItems} />

                {/* Instructions */}
                <TodaysOutfitInstructions />

                {/* Items by Category */}
                {groupedItems.sortedCategories.map(category => (
                    <TodaysOutfitCategorySection
                        key={category}
                        category={category}
                        items={groupedItems.groups[category]}
                        selectedItemIds={selectedItemIds}
                        onItemPress={toggleItemSelection}
                    />
                ))}
            </ScrollView>

            {/* Fixed CTA Button */}
            <View style={[styles.footer, { backgroundColor, borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                <TodaysOutfitCTA
                    selectedCount={selectedItemIds.size}
                    isUpdating={isUpdating}
                    disabled={selectedItemIds.size === 0 || isUpdating}
                    onPress={handlePlanOutfit}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
    },
    refetchIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 8,
    },
    refetchText: {
        fontSize: 12,
        opacity: 0.6,
    },
});
