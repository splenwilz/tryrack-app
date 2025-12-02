/**
 * Wardrobe Browse Modal Component
 * Modal for browsing and selecting wardrobe items with search and filter functionality
 * 
 * @see https://reactnative.dev/docs/modal - React Native Modal
 */

import React, { useState, useMemo } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, ScrollView, TextInput, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colorNameToHex } from '@/utils/color-utils';
import type { WardrobeItemResponse } from '@/api/wardrobe/types';

interface WardrobeBrowseModalProps {
    visible: boolean;
    onClose: () => void;
    wardrobeItems: WardrobeItemResponse[];
    excludeIds: (string | number)[];
    onSelectItem: (item: WardrobeItemResponse) => void;
    isLoading?: boolean;
}

export function WardrobeBrowseModal({
    visible,
    onClose,
    wardrobeItems,
    excludeIds,
    onSelectItem,
    isLoading = false,
}: WardrobeBrowseModalProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const textColor = useThemeColor({}, 'text');
    const borderColor = useThemeColor({}, 'tabIconDefault');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Get available categories from wardrobe items
    const availableCategories = useMemo(() => {
        const categories = new Set<string>();
        wardrobeItems.forEach(item => {
            if (item.category && item.category !== 'processing') {
                categories.add(item.category.toLowerCase());
            }
        });
        return Array.from(categories).sort();
    }, [wardrobeItems]);

    // Filter items
    const filteredItems = useMemo(() => {
        return wardrobeItems.filter(item => {
            // Exclude processing items and already selected items
            if (item.category === 'processing' || excludeIds.includes(item.id)) {
                return false;
            }

            // Filter by status (only clean and planned items - items that can be tried on)
            if (item.status !== 'clean' && item.status !== 'planned') {
                return false;
            }

            // Filter by search query
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const matchesTitle = item.title.toLowerCase().includes(query);
                const matchesTags = item.tags?.some(tag => tag.toLowerCase().includes(query));
                const matchesColors = item.colors?.some(color => color.toLowerCase().includes(query));
                if (!matchesTitle && !matchesTags && !matchesColors) {
                    return false;
                }
            }

            // Filter by category
            if (selectedCategory) {
                if (item.category.toLowerCase() !== selectedCategory.toLowerCase()) {
                    return false;
                }
            }

            return true;
        });
    }, [wardrobeItems, excludeIds, searchQuery, selectedCategory]);

    const handleSelectItem = (item: WardrobeItemResponse) => {
        onSelectItem(item);
        setSearchQuery('');
        setSelectedCategory(null);
    };

    const renderItem = ({ item }: { item: WardrobeItemResponse }) => (
        <TouchableOpacity
            style={[styles.itemCard, { backgroundColor, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
            onPress={() => handleSelectItem(item)}
            activeOpacity={0.7}
        >
            <Image source={{ uri: item.image_url }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
                <ThemedText style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                </ThemedText>
                <ThemedText style={[styles.itemCategory, { color: borderColor }]}>
                    {item.category}
                </ThemedText>
                {item.colors && item.colors.length > 0 && (
                    <View style={styles.colorsContainer}>
                        {item.colors.slice(0, 3).map((color, index) => (
                            <View 
                                key={index} 
                                style={[styles.colorDot, { backgroundColor: colorNameToHex(color) }]} 
                            />
                        ))}
                        {item.colors.length > 3 && (
                            <ThemedText style={[styles.colorCount, { color: borderColor }]}>
                                +{item.colors.length - 3}
                            </ThemedText>
                        )}
                    </View>
                )}
            </View>
            <IconSymbol name="plus.circle.fill" size={24} color={tintColor} />
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                    <ThemedText type="title" style={styles.headerTitle}>
                        Browse Your Wardrobe
                    </ThemedText>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <IconSymbol name="xmark" size={24} color={textColor} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchSection}>
                    <View style={[styles.searchBar, { borderColor, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                        <IconSymbol name="magnifyingglass" size={20} color={textColor} />
                        <TextInput
                            style={[styles.searchInput, { color: textColor }]}
                            placeholder="Search by name, color, or tag..."
                            placeholderTextColor={borderColor}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <IconSymbol name="xmark.circle.fill" size={20} color={borderColor} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Category Filter */}
                {availableCategories.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryFilter}
                        contentContainerStyle={styles.categoryFilterContent}
                    >
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                { backgroundColor: selectedCategory === null ? tintColor : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') },
                            ]}
                            onPress={() => setSelectedCategory(null)}
                        >
                            <ThemedText style={[styles.categoryChipText, { color: selectedCategory === null ? (isDark ? '#000' : 'white') : textColor }]}>
                                All
                            </ThemedText>
                        </TouchableOpacity>
                        {availableCategories.map(category => (
                            <TouchableOpacity
                                key={category}
                                style={[
                                    styles.categoryChip,
                                    { backgroundColor: selectedCategory === category ? tintColor : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') },
                                ]}
                                onPress={() => setSelectedCategory(category)}
                            >
                                <ThemedText style={[styles.categoryChipText, { color: selectedCategory === category ? (isDark ? '#000' : 'white') : textColor }]}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* Items List */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ThemedText style={[styles.loadingText, { color: borderColor }]}>Loading items...</ThemedText>
                    </View>
                ) : filteredItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <IconSymbol name="tshirt" size={64} color={borderColor} style={{ opacity: 0.3 }} />
                        <ThemedText style={[styles.emptyText, { color: borderColor }]}>
                            {searchQuery || selectedCategory
                                ? 'No items match your filters'
                                : 'No items available'}
                        </ThemedText>
                    </View>
                ) : (
                    <FlatList
                        data={filteredItems}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    closeButton: {
        padding: 4,
    },
    searchSection: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    categoryFilter: {
        maxHeight: 50,
        marginBottom: 8,
    },
    categoryFilterContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '500',
    },
    listContent: {
        padding: 20,
        gap: 12,
    },
    row: {
        justifyContent: 'space-between',
    },
    itemCard: {
        width: '48%',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
    },
    itemImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 8,
    },
    itemInfo: {
        marginBottom: 8,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemCategory: {
        fontSize: 12,
        marginBottom: 4,
    },
    colorsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    colorCount: {
        fontSize: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
        textAlign: 'center',
    },
});

