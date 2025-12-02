/**
 * StatusGrid Component
 * Grid display for wardrobe items by status (worn/dirty)
 *
 * @see https://reactnative.dev/docs/image - React Native Image component
 */

import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { formatLastWorn } from '@/utils/wardrobe';
import type { WardrobeItemCard } from './types';

interface StatusGridProps {
    title: string;
    subtitle: string;
    items: WardrobeItemCard[];
    onStatusChange?: (itemId: string, newStatus: 'clean' | 'worn' | 'dirty' | 'planned') => void;
    onItemPress?: (itemId: string | number) => void;
    updatingItems?: Set<string>; // Items currently being updated
    onMarkAsWorn?: (itemId: string) => void; // Optional: For planned items to convert to worn
}

export const StatusGrid: React.FC<StatusGridProps> = ({
    title,
    subtitle,
    items,
    onStatusChange,
    onItemPress,
    updatingItems = new Set(),
    onMarkAsWorn,
}) => {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const buttonTextColor = isDark ? '#000' : 'white';
    const buttonIconColor = isDark ? '#000' : 'white';

    if (items.length === 0) {
        return null;
    }

    return (
        <View style={styles.statusSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
                {title}
            </ThemedText>
            <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
            <View style={styles.statusGrid}>
                {items.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.statusCard, { backgroundColor }]}
                        onPress={() => onItemPress?.(item.id)}
                        activeOpacity={0.7}
                    >
                        <Image source={{ uri: item.imageUrl }} style={styles.statusCardImage} />
                        <View style={styles.statusCardInfo}>
                            <ThemedText style={styles.statusCardTitle} numberOfLines={2}>
                                {item.title}
                            </ThemedText>
                            {formatLastWorn(item.last_worn_at) && (
                                <ThemedText style={styles.statusCardSubtitle}>
                                    {formatLastWorn(item.last_worn_at)}
                                </ThemedText>
                            )}
                            {onMarkAsWorn && item.status === 'planned' ? (
                                // For planned items, show "Mark as Worn" button
                                <TouchableOpacity
                                    style={[
                                        styles.cleanButton,
                                        { backgroundColor: tintColor },
                                        updatingItems.has(item.id) && styles.cleanButtonDisabled,
                                    ]}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        if (!updatingItems.has(item.id)) {
                                            onMarkAsWorn(item.id);
                                        }
                                    }}
                                    disabled={updatingItems.has(item.id)}
                                >
                                    {updatingItems.has(item.id) ? (
                                        <ActivityIndicator size="small" color={buttonIconColor} />
                                    ) : (
                                        <IconSymbol name="tshirt.fill" size={14} color={buttonIconColor} />
                                    )}
                                    <ThemedText style={[styles.cleanButtonText, { color: buttonTextColor }]}>
                                        {updatingItems.has(item.id) ? 'Updating...' : 'Mark as Worn'}
                                    </ThemedText>
                                </TouchableOpacity>
                            ) : (
                                // For other items (worn/dirty), show "Mark Clean" button
                            <TouchableOpacity
                                    style={[
                                        styles.cleanButton,
                                        { backgroundColor: tintColor },
                                        updatingItems.has(item.id) && styles.cleanButtonDisabled,
                                    ]}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        if (!updatingItems.has(item.id)) {
                                            onStatusChange?.(item.id, 'clean');
                                        }
                                    }}
                                    disabled={updatingItems.has(item.id)}
                            >
                                    {updatingItems.has(item.id) ? (
                                        <ActivityIndicator size="small" color={buttonIconColor} />
                                    ) : (
                                <IconSymbol name="checkmark.circle.fill" size={14} color={buttonIconColor} />
                                    )}
                                    <ThemedText style={[styles.cleanButtonText, { color: buttonTextColor }]}>
                                        {updatingItems.has(item.id) ? 'Updating...' : 'Mark Clean'}
                                    </ThemedText>
                            </TouchableOpacity>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    statusSection: {
        marginTop: 32,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 16,
    },
    statusGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statusCard: {
        width: '48%',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusCardImage: {
        width: '100%',
        height: 120,
    },
    statusCardInfo: {
        padding: 12,
    },
    statusCardTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    statusCardSubtitle: {
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 8,
    },
    cleanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        gap: 6,
    },
    cleanButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cleanButtonDisabled: {
        opacity: 0.6,
    },
});

