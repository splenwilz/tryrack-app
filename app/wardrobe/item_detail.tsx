import { useState } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/custom-header';
import { router, useLocalSearchParams } from 'expo-router';
import { useWardrobeItem, useUpdateWardrobeItem, useMarkAsWorn, useDeleteWardrobeItem } from '@/api/wardrobe/queries';
import {
    WardrobeItemImage,
    WardrobeItemInfo,
    WardrobeItemColorsTags,
    WardrobeItemActions,
    WardrobeItemWearHistory,
    WardrobeItemMetadata,
    WardrobeItemDetailLoading,
    WardrobeItemDetailError,
} from '@/components/wardrobe';
import type { WardrobeItemResponse } from '@/api/wardrobe/types';

/**
 * Wardrobe Item Detail Screen
 * Comprehensive view of a single wardrobe item with full actions
 * 
 * @see https://reactnative.dev/docs/view - React Native View component
 * @see https://reactnative.dev/docs/scrollview - React Native ScrollView component
 */
export default function WardrobeItemDetailScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');

    // Get itemId from route params
    const { itemId } = useLocalSearchParams<{ itemId: string }>();

    // Fetch wardrobe item data
    // Disable query when deleting to prevent 404 errors from refetch
    const deleteMutation = useDeleteWardrobeItem(itemId || '');
    const { data: item, isLoading, isFetching, error } = useWardrobeItem(itemId || '', {
        enabled: !deleteMutation.isPending,
    });

    // Update mutation hooks
    const updateMutation = useUpdateWardrobeItem(itemId || '');
    const markAsWornMutation = useMarkAsWorn(itemId || '');
    const [updatingStatus, setUpdatingStatus] = useState<'clean' | 'dirty' | 'worn' | null>(null);

    // Navigation handlers
    const handleBackPress = () => {
        router.back();
    };

    const handleTryVirtually = () => {
        if (!item) return;
        // Navigate to virtual try-on screen with wardrobe item data
        router.push({
            pathname: '/wardrobe/virtual_tryon',
            params: {
                itemType: 'wardrobe',
                itemData: JSON.stringify({
                    id: item.id,
                    title: item.title,
                    category: item.category,
                    image_url: item.image_url,
                    colors: item.colors || [],
                    tags: item.tags || [],
                }),
            },
        });
    };

    // Status update handlers
    const handleMarkAsWorn = async () => {
        if (!item) return;
        setUpdatingStatus('worn');
        try {
            await markAsWornMutation.mutateAsync();
            Alert.alert('Updated', `"${item.title}" marked as worn`);
        } catch (error) {
            console.error('Failed to mark as worn:', error);
            Alert.alert('Error', 'Failed to mark as worn. Please try again.');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleMarkAsClean = async () => {
        if (!item) return;
        setUpdatingStatus('clean');
        try {
            await updateMutation.mutateAsync({ status: 'clean' });
            Alert.alert('Updated', `"${item.title}" marked as clean`);
        } catch (error) {
            console.error('Failed to update status:', error);
            Alert.alert('Error', 'Failed to update status. Please try again.');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleMarkAsDirty = async () => {
        if (!item) return;
        setUpdatingStatus('dirty');
        try {
            await updateMutation.mutateAsync({ status: 'dirty' });
            Alert.alert('Updated', `"${item.title}" marked as dirty. Mark as clean after washing.`);
        } catch (error) {
            console.error('Failed to update status:', error);
            Alert.alert('Error', 'Failed to update status. Please try again.');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleEditItem = () => {
        if (!item) return;
        router.push(`/wardrobe/manage-item?itemId=${item.id}`);
    };

    const handleDeleteItem = async () => {
        if (!item || deleteMutation.isPending) return;

        Alert.alert(
            'Delete Item',
            `Are you sure you want to delete "${item.title}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        // Prevent duplicate calls
                        if (deleteMutation.isPending) return;

                        try {
                            await deleteMutation.mutateAsync();
                            // Navigate back immediately after successful delete
                            // This prevents any refetch attempts that would result in 404
                            router.replace('/(tabs)/wardrobe');
                        } catch (error) {
                            console.error('Failed to delete item:', error);
                            // Only show error if it's not a 404 (item already deleted)
                            if (error instanceof Error && error.message.includes('not found')) {
                                // Item was already deleted, just navigate away
                                router.replace('/(tabs)/wardrobe');
                            } else {
                                Alert.alert(
                                    'Delete Failed',
                                    error instanceof Error ? error.message : 'Unable to delete item. Please try again.'
                                );
                            }
                        }
                    },
                },
            ]
        );
    };

    // Loading state
    if (isLoading && !item) {
        return <WardrobeItemDetailLoading onBackPress={handleBackPress} />;
    }

    // Error state
    if (error && !item) {
        return <WardrobeItemDetailError onBackPress={handleBackPress} />;
    }

    // Return null if no item (should be handled by loading/error states above)
    if (!item) {
        return null;
    }

    const currentItem: WardrobeItemResponse = item;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <CustomHeader title="Item Details" showBackButton={true} onBackPress={handleBackPress} />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Show subtle loading indicator if refetching in background */}
                {isFetching && !isLoading && currentItem && (
                    <View style={styles.refetchIndicator}>
                        <ActivityIndicator size="small" color={tintColor} />
                        <ThemedText style={styles.refetchText}>Updating...</ThemedText>
                    </View>
                )}

                <WardrobeItemImage item={currentItem} />
                <WardrobeItemInfo item={currentItem} />
                <WardrobeItemColorsTags item={currentItem} />
                <WardrobeItemActions
                    item={currentItem}
                    updatingStatus={updatingStatus}
                    isDeleting={deleteMutation.isPending}
                    onTryVirtually={handleTryVirtually}
                    onMarkAsWorn={handleMarkAsWorn}
                    onMarkAsClean={handleMarkAsClean}
                    onMarkAsDirty={handleMarkAsDirty}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                />
                <WardrobeItemWearHistory item={currentItem} />
                <WardrobeItemMetadata item={currentItem} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        marginTop: 20,
    },
    refetchIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 8,
        marginBottom: 8,
    },
    refetchText: {
        fontSize: 12,
        opacity: 0.6,
    },
});
