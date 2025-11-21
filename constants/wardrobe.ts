import type { CategoryOption, ProcessingStage, ProcessingStageConfig } from '@/types/wardrobe';

/**
 * Available wardrobe item categories
 */
export const CATEGORIES: CategoryOption[] = [
    { value: 'shirt', label: 'Shirt' },
    { value: 'jacket', label: 'Jacket' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'pants', label: 'Pants' },
    { value: 'skirt', label: 'Skirt' },
    { value: 'dress', label: 'Dress' },
    { value: 'shoe', label: 'Shoe' },
    { value: 'bag', label: 'Bag' },
    { value: 'accessory', label: 'Accessory' },
    { value: 'underwear', label: 'Underwear' },
    { value: 'swimwear', label: 'Swimwear' },
    { value: 'top', label: 'Top' },
    { value: 'other', label: 'Other' },
];

/**
 * Common color options for wardrobe items
 */
export const COMMON_COLORS = [
    'black',
    'white',
    'navy',
    'gray',
    'beige',
    'brown',
    'red',
    'blue',
    'green',
    'yellow',
    'pink',
    'purple',
    'orange',
] as const;

/**
 * Processing stage configuration
 */
export const PROCESSING_STAGE_CONFIG: Record<Exclude<ProcessingStage, null>, ProcessingStageConfig> = {
    uploading: {
        message: 'Uploading image...',
        duration: 1000,
    },
    analyzing: {
        message: 'AI analyzing your item...',
        duration: 4000,
    },
    enhancing: {
        message: 'Enhancing background...',
        duration: 3000,
    },
    extracting: {
        message: 'Extracting colors & details...',
        duration: 2000,
    },
    complete: {
        message: '✓ Ready!',
        duration: 500,
    },
};

/**
 * Processing stage icons (emojis)
 */
export const PROCESSING_STAGE_ICONS: Record<Exclude<ProcessingStage, null>, string> = {
    uploading: '☁️',
    analyzing: '🤖',
    enhancing: '✨',
    extracting: '🔍',
    complete: '✓',
};

