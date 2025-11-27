/**
 * Catalog Category View Component
 * Displays all products in a specific catalog category
 * Reusable component for showing filtered catalog products
 * 
 * @see components/wardrobe/CategoryView.tsx - Similar pattern for wardrobe
 */

import { useMemo } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { CustomHeader } from '@/components/custom-header';

interface CatalogItem {
    id: string;
    title: string;
    category: string;
    imageUrl: string;
    colors: string[];
    tags: string[];
    status: string;
    created_at?: string;
}

interface CatalogCategoryViewProps {
    category: string;
    items: CatalogItem[];
    isLoading?: boolean;
    error?: unknown;
    onItemPress?: (itemId: string) => void;
}

/**
 * Catalog Product Card Component
 * Displays individual catalog products in the grid
 */
const CatalogProductCard: React.FC<{ item: CatalogItem; onPress?: (itemId: string) => void }> = ({ item, onPress }) => {
    const backgroundColor = useThemeColor({}, 'background');
    const borderColor = useThemeColor({}, 'tabIconDefault');

    const handlePress = () => {
        if (onPress) {
            onPress(item.id);
        } else {
            // Default: navigate to edit product (since catalog is for boutique owners)
            router.push({
                pathname: '/(boutique_tabs)/catalog',
                params: { editProductId: item.id },
            });
        }
    };

    return (
        <TouchableOpacity
            style={[styles.itemCard, { backgroundColor, borderColor }]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            <ThemedText style={styles.itemTitle} numberOfLines={2}>
                {item.title}
            </ThemedText>
        </TouchableOpacity>
    );
};

/**
 * Catalog Category View Component
 * Displays all products in a specific catalog category
 */
export function CatalogCategoryView({
    category,
    items,
    isLoading = false,
    error,
    onItemPress,
}: CatalogCategoryViewProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const iconColor = useThemeColor({}, 'icon');

    const handleBackPress = () => {
        router.back();
    };

    // Format category name for display
    const categoryDisplayName = useMemo(() => {
        if (!category) return 'Category';
        if (category === 'recent') return 'Recently Added';
        return category
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }, [category]);

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <CustomHeader
                    title={categoryDisplayName}
                    showBackButton={true}
                    onBackPress={handleBackPress}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={iconColor} />
                    <ThemedText style={[styles.loadingText, { color: iconColor }]}>
                        Loading products...
                    </ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (error) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <CustomHeader
                    title={categoryDisplayName}
                    showBackButton={true}
                    onBackPress={handleBackPress}
                />
                <View style={styles.errorContainer}>
                    <ThemedText style={[styles.errorText, { color: textColor }]}>
                        Failed to load products. Please try again.
                    </ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    // Empty state
    if (items.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <CustomHeader
                    title={categoryDisplayName}
                    showBackButton={true}
                    onBackPress={handleBackPress}
                />
                <View style={styles.emptyContainer}>
                    <ThemedText style={[styles.emptyText, { color: iconColor }]}>
                        No products found in this category
                    </ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <CustomHeader
                title={categoryDisplayName}
                showBackButton={true}
                onBackPress={handleBackPress}
            />
            <FlatList
                data={items}
                renderItem={({ item }) => (
                    <CatalogProductCard item={item} onPress={onItemPress} />
                )}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    listContent: {
        padding: 16,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    itemCard: {
        width: '48%',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    itemTitle: {
        padding: 12,
        fontSize: 14,
        fontWeight: '500',
    },
});

