/**
 * Try-On History Screen
 * Shows all completed virtual try-ons for the user
 * 
 * @see https://reactnative.dev/docs/flatlist - React Native FlatList
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/custom-header';
import { useGetVirtualTryOns, useDeleteVirtualTryOn } from '@/api/wardrobe/queries';
import type { VirtualTryOnHistoryItem } from '@/api/wardrobe/types';
import { ShimmerPlaceholder } from '@/components/ShimmerPlaceholder';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 2 columns with padding

/**
 * Skeleton component for try-on history item
 */
const TryOnHistoryItemSkeleton: React.FC = () => {
    const cardBg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');

    return (
        <View style={[styles.card, { backgroundColor: cardBg }]}>
            <ShimmerPlaceholder width="100%" height={ITEM_WIDTH * 1.4} borderRadius={0} />
            <View style={styles.cardFooter}>
                <ShimmerPlaceholder width="60%" height={14} borderRadius={4} />
                <View style={{ width: 20 }} />
            </View>
        </View>
    );
};

export default function TryOnHistoryScreen() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    // Fetch virtual try-ons
    const {
        data: tryons = [],
        isLoading,
        isFetching,
        isError,
        error,
        refetch
    } = useGetVirtualTryOns();

    const deleteMutation = useDeleteVirtualTryOn();

    // Check if we're loading (including initial fetch with placeholder data)
    const isDataLoading = isLoading || (isFetching && tryons.length === 0);

    // Theme colors
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const tintColor = useThemeColor({}, 'tint');
    const cardBg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handleSearchPress = () => {
        setShowSearch(!showSearch);
        if (showSearch) {
            setSearchQuery(''); // Clear search when closing
        }
    };

    const handleNotificationPress = () => {
        console.log('Notifications pressed');
        // TODO: Navigate to notifications
    };

    // Auto-refetch when screen comes into focus (e.g., after creating a new try-on)
    useFocusEffect(
        React.useCallback(() => {
            console.log('🔄 Try-Ons screen focused - refetching data...');
            refetch();
        }, [refetch])
    );

    const handleItemPress = (item: VirtualTryOnHistoryItem) => {
        router.push({
            pathname: '/wardrobe/tryon_detail',
            params: {
                tryonId: item.id.toString(),
            },
        });
    };

    const handleDelete = (item: VirtualTryOnHistoryItem, e?: { stopPropagation: () => void }) => {
        if (e) {
            e.stopPropagation();
        }

        Alert.alert(
            'Delete Try-On',
            'Are you sure you want to delete this try-on? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteMutation.mutateAsync(item.id);
                            // Success - no need to show alert, the list will refresh automatically
                        } catch (error) {
                            // Check if error is ApiError with 403 status
                            // If backend returns 403 but deletion still happens, don't show error
                            if (error && typeof error === 'object' && 'status' in error) {
                                const apiError = error as { status: number; message: string };
                                if (apiError.status === 403) {
                                    // 403 but deletion might have succeeded - refresh list silently
                                    // Don't show error since deletion appears to work
                                    await refetch();
                                    return;
                                }
                            }
                            // For other errors, show the error message
                            Alert.alert(
                                'Error',
                                error instanceof Error ? error.message : 'Failed to delete try-on. Please try again.',
                            );
                        }
                    },
                },
            ],
        );
    };

    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
        }
        return date.toLocaleDateString();
    }, []);

    // Filter try-ons based on search query
    const filteredTryons = useMemo(() => {
        if (!tryons) return [];
        if (!searchQuery.trim()) return tryons;

        const query = searchQuery.toLowerCase();
        return tryons.filter((item: VirtualTryOnHistoryItem) => {
            // Search by category from selected items
            const categories = item.selected_items?.map(item => item.category.toLowerCase()).join(' ') || '';
            const date = formatDate(item.created_at).toLowerCase();
            return categories.includes(query) || date.includes(query);
        });
    }, [tryons, searchQuery, formatDate]);

    const renderItem = ({ item }: { item: VirtualTryOnHistoryItem }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: cardBg }]}
            onPress={() => handleItemPress(item)}
            onLongPress={() => handleDelete(item)}
            activeOpacity={0.7}
        >
            <Image
                source={{ uri: item.generated_image_uri }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.cardFooter}>
                <ThemedText style={[styles.dateText, { color: textColor }]} numberOfLines={1}>
                    {formatDate(item.created_at)}
                </ThemedText>
                <TouchableOpacity
                    onPress={(e) => handleDelete(item, e)}
                    style={styles.deleteIconButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialIcons
                        name="delete-outline"
                        size={20}
                        color="#FF3B30"
                    />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <MaterialIcons name="checkroom" size={64} color="#999" />
            <ThemedText style={[styles.emptyText, { color: textColor }]}>No Try-Ons Yet</ThemedText>
            <ThemedText style={[styles.emptySubtext, { color: '#999' }]}>
                Start trying on items from your wardrobe!
            </ThemedText>
            <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: tintColor }]}
                onPress={() => router.push('/(tabs)/wardrobe')}
            >
                <ThemedText style={styles.emptyButtonText}>Go to Wardrobe</ThemedText>
            </TouchableOpacity>
        </View>
    );

    const renderErrorState = () => (
        <View style={styles.emptyContainer}>
            <MaterialIcons name="error-outline" size={64} color="#FF3B30" />
            <ThemedText style={[styles.emptyText, { color: textColor }]}>Failed to Load Try-Ons</ThemedText>
            <ThemedText style={[styles.emptySubtext, { color: '#999' }]}>
                {error instanceof Error ? error.message : 'Unable to load your try-on history. Please try again.'}
            </ThemedText>
            <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: tintColor }]}
                onPress={() => refetch()}
            >
                <ThemedText style={styles.emptyButtonText}>Retry</ThemedText>
            </TouchableOpacity>
        </View>
    );

    // Render loading skeletons
    const renderLoadingSkeletons = () => {
        return (
            <View style={styles.listContent}>
                <View style={styles.row}>
                    <TryOnHistoryItemSkeleton />
                    <TryOnHistoryItemSkeleton />
                </View>
                <View style={styles.row}>
                    <TryOnHistoryItemSkeleton />
                    <TryOnHistoryItemSkeleton />
                </View>
                <View style={styles.row}>
                    <TryOnHistoryItemSkeleton />
                    <TryOnHistoryItemSkeleton />
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <CustomHeader
                title="My Try-Ons"
                showBackButton={false}
                onSearchPress={handleSearchPress}
                onNotificationPress={handleNotificationPress}
                notificationCount={0}
            />

            {/* Search Bar */}
            {showSearch && (
                <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
                    <MaterialIcons name="search" size={20} color="#999" style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: textColor }]}
                        placeholder="Search by category or date..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <MaterialIcons name="close" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Subtitle with count and loading indicator */}
            <View style={styles.subtitleContainer}>
                <ThemedText style={[styles.subtitle, { color: '#999' }]}>
                    {filteredTryons.length || 0} {filteredTryons.length === 1 ? 'result' : 'results'}
                    {searchQuery.trim() && ` for "${searchQuery}"`}
                </ThemedText>
                {isFetching && !refreshing && (
                    <ActivityIndicator size="small" color={tintColor} style={styles.subtitleLoader} />
                )}
            </View>

            {/* Grid */}
            {isDataLoading ? (
                renderLoadingSkeletons()
            ) : isError ? (
                renderErrorState()
            ) : (
                <FlatList
                    data={filteredTryons}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.row}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={tintColor}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 0,
    },
    subtitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
    },
    subtitle: {
        fontSize: 14,
    },
    subtitleLoader: {
        marginLeft: 8,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    card: {
        width: ITEM_WIDTH,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    image: {
        width: '100%',
        height: ITEM_WIDTH * 1.4,
        backgroundColor: '#f0f0f0',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
    },
    dateText: {
        fontSize: 14,
        flex: 1,
    },
    deleteIconButton: {
        padding: 4,
        marginLeft: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
