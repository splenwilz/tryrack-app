/**
 * Compatible Items Section Component
 * Displays compatibility suggestions from wardrobe
 *
 * @see https://reactnative.dev/docs/scrollview - React Native ScrollView
 */

import { View, ScrollView, Image, TouchableOpacity, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { CompatibilitySuggestion } from '@/hooks/wardrobe/useTryOnCompatibility';
import type { WardrobeItemTryOn } from '@/hooks/wardrobe/useVirtualTryOnItems';

interface VirtualTryOnCompatibleItemsProps {
    suggestions: CompatibilitySuggestion[];
    isLoading: boolean;
    isFetching: boolean;
    error: Error | null;
    onAddItem: (item: WardrobeItemTryOn) => void;
}

export function VirtualTryOnCompatibleItems({
    suggestions,
    isLoading,
    isFetching,
    error,
    onAddItem,
}: VirtualTryOnCompatibleItemsProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const hasData = suggestions.length > 0;

    return (
        <View style={styles.container}>
            <ThemedText type="subtitle" style={styles.title}>
                Compatible Items from Your Wardrobe
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: '#999' }]}>
                Add items to create a complete outfit
                {isFetching && hasData && (
                    <ThemedText style={styles.updatingText}> • Updating...</ThemedText>
                )}
            </ThemedText>

            {error && !hasData ? (
                <ThemedText style={[styles.subtitle, { color: '#999', textAlign: 'center', marginVertical: 20 }]}>
                    Unable to load suggestions. Try again later.
                </ThemedText>
            ) : isLoading && !hasData ? (
                <ActivityIndicator size="small" color={tintColor} style={styles.loadingIndicator} />
            ) : hasData ? (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.scroll}
                >
                    {suggestions.map((suggestion) => (
                        <TouchableOpacity
                            key={suggestion.id}
                            style={[styles.card, { backgroundColor }]}
                            onPress={() => {
                                const itemToAdd: WardrobeItemTryOn = {
                                    id: suggestion.id.toString(),
                                    title: suggestion.title,
                                    category: suggestion.category,
                                    imageUrl: suggestion.image_clean || suggestion.image_original || suggestion.imageUrl || '',
                                    colors: suggestion.colors || [],
                                    tags: suggestion.tags || [],
                                };
                                onAddItem(itemToAdd);
                            }}
                        >
                            <Image
                                source={{ uri: suggestion.image_clean || suggestion.image_original || suggestion.imageUrl }}
                                style={styles.image}
                            />
                            <View style={styles.info}>
                                <ThemedText style={styles.itemTitle} numberOfLines={2}>
                                    {suggestion.title}
                                </ThemedText>
                                <View style={styles.score}>
                                    <IconSymbol name="star.fill" size={12} color={tintColor} />
                                    <ThemedText style={[styles.scoreText, { color: tintColor }]}>
                                        {Math.round(suggestion.compatibility_score * 100)}% match
                                    </ThemedText>
                                </View>
                                {suggestion.compatibility_reasons && suggestion.compatibility_reasons.length > 0 && (
                                    <ThemedText style={[styles.reason, { color: tintColor, fontSize: 11 }]} numberOfLines={1}>
                                        {suggestion.compatibility_reasons[0]}
                                    </ThemedText>
                                )}
                            </View>
                            <View style={[styles.addButton, { backgroundColor: tintColor }]}>
                                <IconSymbol name="plus" size={16} color={isDark ? '#000' : 'white'} />
                                <ThemedText style={[styles.addButtonText, { color: isDark ? '#000' : 'white' }]}>
                                    Add
                                </ThemedText>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            ) : (
                !isLoading && (
                    <ThemedText style={[styles.subtitle, { color: '#999', textAlign: 'center', marginVertical: 20 }]}>
                        No compatible items found in your wardrobe. Add more items to get suggestions!
                    </ThemedText>
                )
            )}
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
    subtitle: {
        fontSize: 12,
        marginTop: 4,
        marginBottom: 12,
    },
    updatingText: {
        fontSize: 11,
        opacity: 0.6,
    },
    loadingIndicator: {
        marginVertical: 20,
    },
    scroll: {
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    card: {
        width: 140,
        marginRight: 12,
        borderRadius: 12,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 8,
    },
    info: {
        marginBottom: 8,
    },
    itemTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    score: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 4,
    },
    scoreText: {
        fontSize: 11,
        fontWeight: '600',
    },
    reason: {
        fontSize: 10,
        marginTop: 2,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 6,
        gap: 4,
        marginTop: 'auto',
    },
    addButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
});

