/**
 * Custom hook for managing virtual try-on item selection
 * Handles adding/removing items, type inference, and selection limits
 */

import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export interface BoutiqueItem {
    id: string;
    title: string;
    brand: string;
    category: string;
    imageUrl: string;
    price: number;
    colors: string[];
    tags: string[];
    boutique: {
        id: string;
        name: string;
        logo: string;
    };
    arAvailable: boolean;
}

export interface WardrobeItemTryOn {
    id: string | number;
    title: string;
    category: string;
    imageUrl: string;
    colors: string[];
    tags: string[];
}

type TryOnItem = BoutiqueItem | WardrobeItemTryOn;

/**
 * Infer item type based on structure
 */
function inferItemType(item: TryOnItem): 'wardrobe' | 'boutique' {
    return 'boutique' in item ? 'boutique' : 'wardrobe';
}

export function useVirtualTryOnItems() {
    const { itemType, itemData } = useLocalSearchParams<{ itemType?: string; itemData?: string }>();
    const [selectedItems, setSelectedItems] = useState<TryOnItem[]>([]);

    // Initialize from route params
    useEffect(() => {
        if (itemType === 'wardrobe' && itemData) {
            try {
                const parsedData = JSON.parse(itemData);
                const wardrobeItem: WardrobeItemTryOn = {
                    id: parsedData.id,
                    title: parsedData.title,
                    category: parsedData.category,
                    imageUrl: parsedData.image_url,
                    colors: parsedData.colors || [],
                    tags: parsedData.tags || [],
                };
                setSelectedItems([wardrobeItem]);
            } catch (error) {
                console.error('Error parsing wardrobe item data:', error);
            }
        }
    }, [itemType, itemData]);

    const addItemToTryOn = (item: TryOnItem) => {
        const candidateType = inferItemType(item);
        const isAlreadySelected = selectedItems.some((selected) => {
            const selectedType = inferItemType(selected);
            return selected.id === item.id && selectedType === candidateType;
        });

        if (isAlreadySelected) {
            Alert.alert('Already Selected', 'This item is already in your try-on list.');
            return;
        }

        const newLength = selectedItems.length + 1;

        // Warn if adding more than 2 items, but allow continuation
        if (newLength > 2) {
            Alert.alert(
                'Image Quality Warning',
                'Adding more than 2 items will not preserve your image. The result will show the combination on a different person. Do you want to continue?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Continue',
                        onPress: () => {
                            setSelectedItems((prev) => [...prev, item]);
                        },
                    },
                ]
            );
        } else {
            // Add item directly if 2 or fewer items
            setSelectedItems((prev) => [...prev, item]);
        }
    };

    const removeItemFromTryOn = (itemToRemove: TryOnItem) => {
        const targetType = inferItemType(itemToRemove);
        setSelectedItems((prev) =>
            prev.filter((item) =>
                item.id !== itemToRemove.id || inferItemType(item) !== targetType
            )
        );
    };

    return {
        selectedItems,
        selectedItem: selectedItems[0] || null,
        itemType,
        addItemToTryOn,
        removeItemFromTryOn,
        inferItemType,
        hasImageQualityWarning: selectedItems.length > 2, // Warning when more than 2 items
    };
}

