/**
 * Selected Items Section Component
 * Displays items selected for virtual try-on
 *
 * @see https://reactnative.dev/docs/view - React Native View
 */

import { View, Image, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { BoutiqueItem, WardrobeItemTryOn } from '@/hooks/wardrobe/useVirtualTryOnItems';

type TryOnItem = BoutiqueItem | WardrobeItemTryOn;

interface VirtualTryOnSelectedItemsProps {
    selectedItems: TryOnItem[];
    itemType?: string;
    onRemoveItem: (item: TryOnItem) => void;
    hasImageQualityWarning?: boolean; // Warning when more than 2 items
}

export function VirtualTryOnSelectedItems({
    selectedItems,
    itemType,
    onRemoveItem,
    hasImageQualityWarning = false,
}: VirtualTryOnSelectedItemsProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const textColor = isDark ? '#000' : 'white';

    return (
        <View style={styles.container}>
            <ThemedText type="subtitle" style={styles.title}>
                {selectedItems.length === 1
                    ? (itemType === 'wardrobe' ? 'Your Item' : 'Product')
                    : `Items to Try On (${selectedItems.length})`
                }
            </ThemedText>
            {hasImageQualityWarning && (
                <View style={[styles.warningContainer, { backgroundColor: `${tintColor}20`, borderColor: tintColor }]}>
                    <IconSymbol name="exclamationmark.triangle.fill" size={16} color={tintColor} />
                    <ThemedText style={[styles.warningText, { color: tintColor }]}>
                        More than 2 items will not preserve your image. Result will show combination on a different person.
                    </ThemedText>
                </View>
            )}

            {selectedItems.map((item, index) => (
                <View key={`${item.id}-${index}`} style={[styles.card, { backgroundColor, marginBottom: 12 }]}>
                    <View style={styles.cardHeader}>
                        <Image source={{ uri: item.imageUrl }} style={styles.image} />
                        {selectedItems.length > 1 && (
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => onRemoveItem(item)}
                            >
                                <IconSymbol name="xmark.circle.fill" size={20} color="#ff4444" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.info}>
                        {'brand' in item && <ThemedText style={styles.brandName}>{item.brand}</ThemedText>}
                        <ThemedText style={styles.title}>{item.title}</ThemedText>
                        {'price' in item && <ThemedText style={styles.price}>₦{item.price.toLocaleString()}</ThemedText>}
                        {'colors' in item && item.colors && (
                            <View style={styles.colorsContainer}>
                                <ThemedText style={styles.colorsLabel}>Colors:</ThemedText>
                                <View style={styles.colorsList}>
                                    {item.colors.map((color: string) => (
                                        <View key={color} style={[styles.colorChip, { backgroundColor: tintColor }]}>
                                            <ThemedText style={[styles.colorText, { color: textColor }]}>{color}</ThemedText>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            ))}
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
        marginTop: 16,
    },
    card: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        position: 'relative',
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
        padding: 4,
        zIndex: 1,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    brandName: {
        fontSize: 12,
        fontWeight: '500',
        opacity: 0.7,
        marginBottom: 2,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    colorsContainer: {
        marginTop: 8,
    },
    colorsLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
        opacity: 0.7,
    },
    colorsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    colorChip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    colorText: {
        fontSize: 12,
        fontWeight: '500',
        color: 'white',
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 8,
        marginBottom: 8,
        gap: 8,
    },
    warningText: {
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
        lineHeight: 16,
    },
});

