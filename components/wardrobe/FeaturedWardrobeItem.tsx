/**
 * FeaturedWardrobeItem Component
 * Large display card for featured wardrobe items
 *
 * @see https://reactnative.dev/docs/image - React Native Image component
 */

import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { WardrobeItemCard } from './types';

interface FeaturedWardrobeItemProps {
    item: WardrobeItemCard;
    onPress?: () => void;
}

export const FeaturedWardrobeItem: React.FC<FeaturedWardrobeItemProps> = ({ item, onPress }) => {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const tagTextColor = isDark ? '#000' : 'white';

    return (
        <TouchableOpacity
            style={[styles.featuredCard, { backgroundColor }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Image source={{ uri: item.imageUrl }} style={styles.featuredImage} />
            <View style={styles.featuredContent}>
                <ThemedText type="subtitle" style={styles.featuredTitle}>
                    {item.title}
                </ThemedText>
                <ThemedText style={styles.featuredDescription}>
                    Perfect for your next outfit
                </ThemedText>
                <View style={styles.featuredTags}>
                    {item.tags.map((tag: string) => (
                        <View key={tag} style={[styles.featuredTag, { backgroundColor: tintColor }]}>
                            <ThemedText style={[styles.featuredTagText, { color: tagTextColor }]}>{tag}</ThemedText>
                        </View>
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    featuredCard: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    featuredImage: {
        width: '100%',
        height: 200,
    },
    featuredContent: {
        padding: 16,
    },
    featuredTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    featuredDescription: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 12,
    },
    featuredTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    featuredTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
        marginBottom: 4,
    },
    featuredTagText: {
        fontSize: 12,
        fontWeight: '500',
    },
});

