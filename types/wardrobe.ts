/**
 * Wardrobe item form data structure
 */
export interface WardrobeItemForm {
    title: string;
    category: string;
    colors: string[];
    tags: string[];
    imageUrl: string | null;
}

/**
 * Processing stage for wardrobe item upload/analysis
 */
export type ProcessingStage = 'uploading' | 'analyzing' | 'enhancing' | 'extracting' | 'complete' | null;

/**
 * Configuration for processing stages
 */
export interface ProcessingStageConfig {
    message: string;
    duration: number;
}

/**
 * Category option for wardrobe items
 */
export interface CategoryOption {
    value: string;
    label: string;
}

