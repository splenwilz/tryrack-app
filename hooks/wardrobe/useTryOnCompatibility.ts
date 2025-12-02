/**
 * Compatibility Hook for Virtual Try-On
 * 
 * Calculates compatibility scores for wardrobe items based on:
 * - Category compatibility (e.g., top → bottom, outerwear, shoes, accessories)
 * - Color matching (complementary or matching colors)
 * - Tag similarity (shared tags)
 * 
 * @see https://reactnative.dev/docs/hooks - React Hooks
 */

import { useMemo } from 'react';
import type { WardrobeItemResponse } from '@/api/wardrobe/types';

export interface CompatibilitySuggestion {
    id: number;
    title: string;
    category: string;
    image_clean?: string;
    image_original?: string;
    imageUrl?: string;
    colors?: string[];
    tags?: string[];
    compatibility_score: number;
    compatibility_reasons: string[];
}

/**
 * Category compatibility mapping
 * Defines which categories work well together
 * Supports comprehensive fashion categories for both male and female items
 * 
 * Categories are normalized to lowercase for matching
 */
const CATEGORY_COMPATIBILITY: Record<string, string[]> = {
    // Tops - match with bottoms, outerwear, shoes, accessories
    'top': ['bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'leggings', 'outerwear', 'coat', 'jacket', 'blazer', 'sweater', 'hoodie', 'cardigan', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    't-shirt': ['bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'leggings', 'outerwear', 'coat', 'jacket', 'blazer', 'sweater', 'hoodie', 'cardigan', 'shoes', 'sneakers', 'boots', 'sandals', 'flats', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'shirt': ['bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'leggings', 'outerwear', 'coat', 'jacket', 'blazer', 'sweater', 'cardigan', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'loafers', 'dress shoes', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'blouse': ['bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'leggings', 'outerwear', 'coat', 'jacket', 'blazer', 'sweater', 'cardigan', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'polo': ['bottom', 'jeans', 'trousers', 'shorts', 'outerwear', 'jacket', 'blazer', 'sweater', 'shoes', 'sneakers', 'boots', 'sandals', 'loafers', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'crop top': ['bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'leggings', 'outerwear', 'jacket', 'blazer', 'shoes', 'sneakers', 'boots', 'sandals', 'flats', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'tank top': ['bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'leggings', 'outerwear', 'jacket', 'blazer', 'sweater', 'cardigan', 'shoes', 'sneakers', 'boots', 'sandals', 'flats', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'camisole': ['bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'leggings', 'outerwear', 'jacket', 'blazer', 'sweater', 'cardigan', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'bodysuit': ['bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'leggings', 'outerwear', 'jacket', 'blazer', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'sweater': ['bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'leggings', 'outerwear', 'coat', 'jacket', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'hoodie': ['bottom', 'jeans', 'trousers', 'shorts', 'leggings', 'joggers', 'sweatpants', 'outerwear', 'jacket', 'shoes', 'sneakers', 'boots', 'sandals', 'accessories', 'hat', 'scarf', 'bag'],
    'sweatshirt': ['bottom', 'jeans', 'trousers', 'shorts', 'leggings', 'joggers', 'sweatpants', 'outerwear', 'jacket', 'shoes', 'sneakers', 'boots', 'sandals', 'accessories', 'hat', 'scarf', 'bag'],
    'cardigan': ['top', 't-shirt', 'shirt', 'blouse', 'bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'leggings', 'dress', 'outerwear', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'vest': ['top', 't-shirt', 'shirt', 'blouse', 'bottom', 'jeans', 'trousers', 'shorts', 'outerwear', 'shoes', 'sneakers', 'boots', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],

    // Bottoms - match with tops, outerwear, shoes, accessories
    'bottom': ['top', 't-shirt', 'shirt', 'blouse', 'polo', 'crop top', 'tank top', 'camisole', 'bodysuit', 'sweater', 'hoodie', 'sweatshirt', 'cardigan', 'vest', 'outerwear', 'coat', 'jacket', 'blazer', 'sweater', 'hoodie', 'cardigan', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'loafers', 'dress shoes', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'jeans': ['top', 't-shirt', 'shirt', 'blouse', 'polo', 'crop top', 'tank top', 'sweater', 'hoodie', 'sweatshirt', 'cardigan', 'vest', 'outerwear', 'coat', 'jacket', 'blazer', 'sweater', 'hoodie', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'loafers', 'dress shoes', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'trousers': ['top', 't-shirt', 'shirt', 'blouse', 'polo', 'sweater', 'cardigan', 'vest', 'outerwear', 'coat', 'jacket', 'blazer', 'sweater', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'loafers', 'dress shoes', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'shorts': ['top', 't-shirt', 'shirt', 'blouse', 'polo', 'crop top', 'tank top', 'camisole', 'bodysuit', 'sweater', 'hoodie', 'sweatshirt', 'cardigan', 'outerwear', 'jacket', 'blazer', 'shoes', 'sneakers', 'boots', 'sandals', 'flats', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'cargo pants': ['top', 't-shirt', 'shirt', 'polo', 'sweater', 'hoodie', 'sweatshirt', 'outerwear', 'jacket', 'shoes', 'sneakers', 'boots', 'sandals', 'accessories', 'hat', 'scarf', 'belt', 'bag'],
    'joggers': ['top', 't-shirt', 'sweater', 'hoodie', 'sweatshirt', 'outerwear', 'jacket', 'shoes', 'sneakers', 'boots', 'sandals', 'accessories', 'hat', 'scarf', 'bag'],
    'sweatpants': ['top', 't-shirt', 'sweater', 'hoodie', 'sweatshirt', 'outerwear', 'jacket', 'shoes', 'sneakers', 'boots', 'sandals', 'accessories', 'hat', 'scarf', 'bag'],
    'leggings': ['top', 't-shirt', 'shirt', 'blouse', 'crop top', 'tank top', 'camisole', 'bodysuit', 'sweater', 'hoodie', 'sweatshirt', 'cardigan', 'outerwear', 'jacket', 'blazer', 'sweater', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'skirt': ['top', 't-shirt', 'shirt', 'blouse', 'polo', 'crop top', 'tank top', 'camisole', 'bodysuit', 'sweater', 'cardigan', 'vest', 'outerwear', 'coat', 'jacket', 'blazer', 'sweater', 'cardigan', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'wedges', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],

    // Dresses & One-Piece - match with outerwear, shoes, accessories
    'dress': ['outerwear', 'coat', 'jacket', 'blazer', 'trench coat', 'cardigan', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'wedges', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'jumpsuit': ['outerwear', 'coat', 'jacket', 'blazer', 'cardigan', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'wedges', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'playsuit': ['outerwear', 'jacket', 'blazer', 'cardigan', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'wedges', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'romper': ['outerwear', 'jacket', 'blazer', 'cardigan', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'wedges', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],

    // Outerwear - match with tops, bottoms, dresses, shoes, accessories
    'outerwear': ['top', 't-shirt', 'shirt', 'blouse', 'polo', 'sweater', 'hoodie', 'sweatshirt', 'cardigan', 'bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'leggings', 'dress', 'jumpsuit', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'coat': ['top', 't-shirt', 'shirt', 'blouse', 'sweater', 'cardigan', 'bottom', 'skirt', 'jeans', 'trousers', 'dress', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'jacket': ['top', 't-shirt', 'shirt', 'blouse', 'polo', 'sweater', 'hoodie', 'sweatshirt', 'cardigan', 'bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'leggings', 'dress', 'jumpsuit', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'blazer': ['top', 't-shirt', 'shirt', 'blouse', 'polo', 'sweater', 'cardigan', 'bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'dress', 'jumpsuit', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'loafers', 'dress shoes', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'trench coat': ['top', 't-shirt', 'shirt', 'blouse', 'sweater', 'cardigan', 'bottom', 'skirt', 'jeans', 'trousers', 'dress', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'puffer jacket': ['top', 't-shirt', 'sweater', 'hoodie', 'sweatshirt', 'bottom', 'jeans', 'trousers', 'shorts', 'leggings', 'shoes', 'sneakers', 'boots', 'sandals', 'accessories', 'hat', 'scarf', 'bag'],
    'bomber jacket': ['top', 't-shirt', 'shirt', 'polo', 'sweater', 'hoodie', 'bottom', 'jeans', 'trousers', 'shorts', 'shoes', 'sneakers', 'boots', 'sandals', 'accessories', 'hat', 'scarf', 'bag'],
    'raincoat': ['top', 't-shirt', 'shirt', 'sweater', 'bottom', 'jeans', 'trousers', 'shorts', 'dress', 'shoes', 'sneakers', 'boots', 'sandals', 'accessories', 'hat', 'bag'],
    'poncho': ['top', 't-shirt', 'shirt', 'sweater', 'bottom', 'jeans', 'trousers', 'shorts', 'dress', 'shoes', 'sneakers', 'boots', 'sandals', 'accessories', 'hat', 'bag'],

    // Footwear - match with everything except underwear/swimwear
    'shoes': ['top', 't-shirt', 'shirt', 'blouse', 'polo', 'sweater', 'hoodie', 'sweatshirt', 'cardigan', 'bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'leggings', 'dress', 'jumpsuit', 'outerwear', 'coat', 'jacket', 'blazer', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'sneakers': ['top', 't-shirt', 'shirt', 'polo', 'sweater', 'hoodie', 'sweatshirt', 'cardigan', 'bottom', 'jeans', 'trousers', 'shorts', 'leggings', 'joggers', 'sweatpants', 'dress', 'jumpsuit', 'outerwear', 'jacket', 'blazer', 'activewear', 'sportswear', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'boots': ['top', 't-shirt', 'shirt', 'blouse', 'sweater', 'hoodie', 'cardigan', 'bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'leggings', 'dress', 'jumpsuit', 'outerwear', 'coat', 'jacket', 'blazer', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'heels': ['top', 't-shirt', 'shirt', 'blouse', 'sweater', 'cardigan', 'bottom', 'skirt', 'jeans', 'trousers', 'dress', 'jumpsuit', 'outerwear', 'coat', 'jacket', 'blazer', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'sandals': ['top', 't-shirt', 'shirt', 'blouse', 'polo', 'crop top', 'tank top', 'sweater', 'cardigan', 'bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'leggings', 'dress', 'jumpsuit', 'outerwear', 'jacket', 'blazer', 'swimwear', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'slides': ['top', 't-shirt', 'polo', 'sweater', 'hoodie', 'sweatshirt', 'bottom', 'jeans', 'trousers', 'shorts', 'leggings', 'joggers', 'sweatpants', 'outerwear', 'jacket', 'swimwear', 'activewear', 'sportswear', 'accessories', 'hat', 'scarf', 'bag'],
    'loafers': ['top', 't-shirt', 'shirt', 'blouse', 'polo', 'sweater', 'cardigan', 'bottom', 'jeans', 'trousers', 'shorts', 'dress', 'outerwear', 'jacket', 'blazer', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'dress shoes': ['top', 'shirt', 'blouse', 'sweater', 'cardigan', 'bottom', 'jeans', 'trousers', 'dress', 'outerwear', 'coat', 'jacket', 'blazer', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'flats': ['top', 't-shirt', 'shirt', 'blouse', 'sweater', 'cardigan', 'bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'leggings', 'dress', 'jumpsuit', 'outerwear', 'jacket', 'blazer', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'wedges': ['top', 't-shirt', 'shirt', 'blouse', 'sweater', 'cardigan', 'bottom', 'skirt', 'jeans', 'trousers', 'dress', 'jumpsuit', 'outerwear', 'jacket', 'blazer', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'],
    'slippers': ['top', 't-shirt', 'sweater', 'hoodie', 'sweatshirt', 'bottom', 'leggings', 'joggers', 'sweatpants', 'accessories', 'bag'],

    // Accessories - match with most items
    'accessories': ['top', 't-shirt', 'shirt', 'blouse', 'polo', 'sweater', 'hoodie', 'sweatshirt', 'cardigan', 'bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'leggings', 'dress', 'jumpsuit', 'outerwear', 'coat', 'jacket', 'blazer', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats'],
    'jewelry': ['top', 't-shirt', 'shirt', 'blouse', 'polo', 'sweater', 'cardigan', 'bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'dress', 'jumpsuit', 'outerwear', 'coat', 'jacket', 'blazer', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'accessories', 'hat', 'scarf', 'belt', 'bag'],
    'hat': ['top', 't-shirt', 'shirt', 'blouse', 'polo', 'sweater', 'hoodie', 'sweatshirt', 'cardigan', 'outerwear', 'coat', 'jacket', 'blazer', 'accessories', 'jewelry', 'scarf', 'bag'],
    'cap': ['top', 't-shirt', 'polo', 'sweater', 'hoodie', 'sweatshirt', 'outerwear', 'jacket', 'blazer', 'accessories', 'bag'],
    'beanie': ['top', 't-shirt', 'sweater', 'hoodie', 'sweatshirt', 'outerwear', 'coat', 'jacket', 'accessories', 'bag'],
    'scarf': ['top', 't-shirt', 'shirt', 'blouse', 'sweater', 'cardigan', 'outerwear', 'coat', 'jacket', 'blazer', 'accessories', 'jewelry', 'hat', 'bag'],
    'gloves': ['top', 't-shirt', 'shirt', 'sweater', 'outerwear', 'coat', 'jacket', 'accessories', 'bag'],
    'belt': ['bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'dress', 'jumpsuit', 'accessories', 'jewelry', 'bag'],
    'sunglasses': ['top', 't-shirt', 'shirt', 'blouse', 'polo', 'sweater', 'cardigan', 'outerwear', 'jacket', 'blazer', 'swimwear', 'activewear', 'sportswear', 'accessories', 'jewelry', 'hat', 'bag'],
    'bag': ['top', 't-shirt', 'shirt', 'blouse', 'polo', 'sweater', 'hoodie', 'sweatshirt', 'cardigan', 'bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'leggings', 'dress', 'jumpsuit', 'outerwear', 'coat', 'jacket', 'blazer', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'accessories', 'jewelry', 'hat', 'scarf', 'belt'],
    'backpack': ['top', 't-shirt', 'shirt', 'polo', 'sweater', 'hoodie', 'sweatshirt', 'bottom', 'jeans', 'trousers', 'shorts', 'leggings', 'joggers', 'sweatpants', 'outerwear', 'jacket', 'blazer', 'activewear', 'sportswear', 'shoes', 'sneakers', 'boots', 'sandals', 'accessories', 'hat', 'scarf'],
    'purse': ['top', 't-shirt', 'shirt', 'blouse', 'sweater', 'cardigan', 'bottom', 'skirt', 'jeans', 'trousers', 'dress', 'jumpsuit', 'outerwear', 'coat', 'jacket', 'blazer', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'accessories', 'jewelry', 'hat', 'scarf', 'belt'],
    'clutch': ['top', 'shirt', 'blouse', 'sweater', 'cardigan', 'bottom', 'skirt', 'jeans', 'trousers', 'dress', 'jumpsuit', 'outerwear', 'coat', 'jacket', 'blazer', 'shoes', 'heels', 'sandals', 'flats', 'wedges', 'accessories', 'jewelry', 'hat', 'scarf', 'belt'],
    'tote bag': ['top', 't-shirt', 'shirt', 'blouse', 'sweater', 'cardigan', 'bottom', 'skirt', 'jeans', 'trousers', 'shorts', 'dress', 'jumpsuit', 'outerwear', 'jacket', 'blazer', 'shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'accessories', 'jewelry', 'hat', 'scarf', 'belt'],
    'wallet': ['top', 't-shirt', 'shirt', 'blouse', 'polo', 'sweater', 'cardigan', 'bottom', 'jeans', 'trousers', 'shorts', 'outerwear', 'jacket', 'blazer', 'accessories', 'bag'],
    'watch': ['top', 't-shirt', 'shirt', 'blouse', 'polo', 'sweater', 'cardigan', 'bottom', 'jeans', 'trousers', 'shorts', 'dress', 'jumpsuit', 'outerwear', 'coat', 'jacket', 'blazer', 'accessories', 'jewelry', 'belt', 'bag'],
    'tie': ['top', 'shirt', 'blouse', 'sweater', 'cardigan', 'outerwear', 'coat', 'jacket', 'blazer', 'accessories', 'jewelry'],

    // Underwear/Intimates - limited matching (usually not shown in try-on)
    'underwear': ['outerwear', 'accessories'],
    'lingerie': ['outerwear', 'accessories'],
    'bra': ['outerwear', 'accessories'],
    'panties': ['outerwear', 'accessories'],
    'briefs': ['outerwear', 'accessories'],
    'boxers': ['outerwear', 'accessories'],
    'shapewear': ['outerwear', 'accessories'],
    'undershirt': ['outerwear', 'accessories'],

    // Swimwear - matches with beach accessories
    'swimwear': ['outerwear', 'jacket', 'accessories', 'hat', 'scarf', 'bag', 'sandals', 'slides'],
    'bikini': ['outerwear', 'jacket', 'accessories', 'hat', 'scarf', 'bag', 'sandals', 'slides'],
    'swimsuit': ['outerwear', 'jacket', 'accessories', 'hat', 'scarf', 'bag', 'sandals', 'slides'],
    'swim shorts': ['outerwear', 'jacket', 'accessories', 'hat', 'scarf', 'bag', 'sandals', 'slides'],
    'trunks': ['outerwear', 'jacket', 'accessories', 'hat', 'scarf', 'bag', 'sandals', 'slides'],

    // Activewear/Sportswear - matches with activewear and casual items
    'activewear': ['activewear', 'sportswear', 'shoes', 'sneakers', 'boots', 'sandals', 'accessories', 'hat', 'cap', 'scarf', 'bag', 'backpack'],
    'sportswear': ['activewear', 'sportswear', 'shoes', 'sneakers', 'boots', 'sandals', 'accessories', 'hat', 'cap', 'scarf', 'bag', 'backpack'],
    'sports bra': ['activewear', 'sportswear', 'bottom', 'shorts', 'leggings', 'joggers', 'sweatpants', 'outerwear', 'jacket', 'shoes', 'sneakers', 'boots', 'sandals', 'accessories', 'hat', 'scarf', 'bag', 'backpack'],
    'yoga pants': ['activewear', 'sportswear', 'top', 't-shirt', 'tank top', 'sports bra', 'outerwear', 'jacket', 'shoes', 'sneakers', 'boots', 'sandals', 'accessories', 'hat', 'scarf', 'bag', 'backpack'],
    'compression wear': ['activewear', 'sportswear', 'shoes', 'sneakers', 'boots', 'accessories', 'hat', 'scarf', 'bag', 'backpack'],
    'gym shorts': ['activewear', 'sportswear', 'top', 't-shirt', 'tank top', 'sports bra', 'outerwear', 'jacket', 'shoes', 'sneakers', 'boots', 'sandals', 'accessories', 'hat', 'scarf', 'bag', 'backpack'],
    'active tops': ['activewear', 'sportswear', 'bottom', 'shorts', 'leggings', 'joggers', 'sweatpants', 'yoga pants', 'outerwear', 'jacket', 'shoes', 'sneakers', 'boots', 'sandals', 'accessories', 'hat', 'scarf', 'bag', 'backpack'],
    'running jacket': ['activewear', 'sportswear', 'top', 't-shirt', 'tank top', 'sports bra', 'bottom', 'shorts', 'leggings', 'joggers', 'sweatpants', 'yoga pants', 'shoes', 'sneakers', 'boots', 'accessories', 'hat', 'scarf', 'bag', 'backpack'],
};

/**
 * Default compatibility categories for fallback
 * Used when a category is not found in the mapping
 */
const DEFAULT_COMPATIBILITY = ['top', 'bottom', 'outerwear', 'shoes', 'accessories', 'jewelry', 'hat', 'scarf', 'belt', 'bag'];

/**
 * Color compatibility groups
 * Colors that work well together
 */
const COLOR_GROUPS: Record<string, string[]> = {
    neutral: ['black', 'white', 'gray', 'grey', 'beige', 'tan', 'navy', 'brown'],
    warm: ['red', 'orange', 'yellow', 'pink', 'coral', 'peach'],
    cool: ['blue', 'green', 'purple', 'teal', 'turquoise'],
};

/**
 * Normalize category name for consistent matching
 * @param category - Category name to normalize
 * @returns Normalized category (lowercase, trimmed)
 */
function normalizeCategory(category?: string): string {
    return category?.trim().toLowerCase() ?? '';
}

/**
 * Find color group for a given color
 */
function getColorGroup(color: string): string | null {
    const normalizedColor = normalizeCategory(color);
    for (const [group, colors] of Object.entries(COLOR_GROUPS)) {
        if (colors.some(c => c.toLowerCase() === normalizedColor)) {
            return group;
        }
    }
    return null;
}

/**
 * Get compatible categories for a given category
 * Returns fallback categories if category is not found
 */
function getCompatibleCategories(category: string): string[] {
    const normalized = normalizeCategory(category);
    return CATEGORY_COMPATIBILITY[normalized] || DEFAULT_COMPATIBILITY;
}

/**
 * Calculate compatibility score between selected item and candidate item
 */
function calculateCompatibility(
    selectedItem: { category: string; colors?: string[]; tags?: string[] },
    candidateItem: WardrobeItemResponse
): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];
    const scoreBreakdown = {
        category: 0,
        color: 0,
        tags: 0,
    };

    // Category compatibility (40% weight)
    // Exclude same category - don't match trousers with trousers
    const selectedCategory = normalizeCategory(selectedItem.category);
    const candidateCategory = normalizeCategory(candidateItem.category);

    console.log(`\n[Compatibility] Evaluating: "${candidateItem.title}" (${candidateCategory})`);
    console.log(`  Selected item: "${selectedItem.category}" (${selectedCategory})`);
    console.log(`  Selected colors:`, selectedItem.colors || []);
    console.log(`  Selected tags:`, selectedItem.tags || []);
    console.log(`  Candidate colors:`, candidateItem.colors || []);
    console.log(`  Candidate tags:`, candidateItem.tags || []);

    // Skip if same category
    if (selectedCategory === candidateCategory) {
        console.log(`  ❌ Same category - excluded (score: 0)`);
        return { score: 0, reasons: [] };
    }

    // Check compatibility mapping with fallback
    const compatibleCategories = getCompatibleCategories(selectedItem.category);
    const isUsingFallback = !CATEGORY_COMPATIBILITY[selectedCategory];

    if (compatibleCategories.includes(candidateCategory)) {
        score += 0.4;
        scoreBreakdown.category = 0.4;
        reasons.push(`Complements ${selectedItem.category}`);
        if (isUsingFallback) {
            console.log(`  ✅ Category match (fallback): +0.4 (${selectedCategory} → ${candidateCategory})`);
        } else {
            console.log(`  ✅ Category match: +0.4 (${selectedCategory} → ${candidateCategory})`);
        }
    } else {
        console.log(`  ❌ Category mismatch: ${selectedCategory} not compatible with ${candidateCategory}`);
        if (isUsingFallback) {
            console.log(`     Using fallback compatibility for unknown category`);
        } else {
            console.log(`     Available matches for ${selectedCategory}:`, compatibleCategories.slice(0, 5), compatibleCategories.length > 5 ? '...' : '');
        }
    }

    // Color matching (35% weight)
    if (selectedItem.colors && selectedItem.colors.length > 0 && candidateItem.colors && candidateItem.colors.length > 0) {
        const selectedColorGroups = selectedItem.colors
            .map(c => getColorGroup(c))
            .filter((g): g is string => g !== null);

        const candidateColorGroups = candidateItem.colors
            .map(c => getColorGroup(c))
            .filter((g): g is string => g !== null);

        // Check for exact color matches
        const exactMatches = selectedItem.colors.filter(sc =>
            candidateItem.colors?.some(cc => cc.toLowerCase() === sc.toLowerCase())
        );
        if (exactMatches.length > 0) {
            score += 0.2;
            scoreBreakdown.color = 0.2;
            reasons.push(`Matches ${exactMatches[0]} color`);
            console.log(`  ✅ Exact color match: +0.2 (${exactMatches.join(', ')})`);
        } else {
            // Check for color group matches
            const groupMatches = selectedColorGroups.filter(sg =>
                candidateColorGroups.includes(sg)
            );
            if (groupMatches.length > 0) {
                score += 0.15;
                scoreBreakdown.color = 0.15;
                reasons.push(`Harmonious color palette`);
                console.log(`  ✅ Color group match: +0.15 (${groupMatches.join(', ')} groups)`);
            } else {
                console.log(`  ❌ No color match`);
                console.log(`     Selected color groups:`, selectedColorGroups);
                console.log(`     Candidate color groups:`, candidateColorGroups);
            }
        }
    } else {
        console.log(`  ⚠️  No colors to compare`);
    }

    // Tag similarity (25% weight)
    if (selectedItem.tags && selectedItem.tags.length > 0 && candidateItem.tags && candidateItem.tags.length > 0) {
        const sharedTags = selectedItem.tags.filter(st =>
            candidateItem.tags?.some(ct => ct.toLowerCase() === st.toLowerCase())
        );
        if (sharedTags.length > 0) {
            const tagScore = Math.min(0.25, sharedTags.length * 0.1);
            score += tagScore;
            scoreBreakdown.tags = tagScore;
            reasons.push(`Shared style: ${sharedTags[0]}`);
            console.log(`  ✅ Tag match: +${tagScore.toFixed(2)} (${sharedTags.length} shared: ${sharedTags.join(', ')})`);
        } else {
            console.log(`  ❌ No tag match`);
            console.log(`     Selected tags:`, selectedItem.tags);
            console.log(`     Candidate tags:`, candidateItem.tags);
        }
    } else {
        console.log(`  ⚠️  No tags to compare`);
    }

    console.log(`  📊 Final Score: ${score.toFixed(2)} (${Math.round(score * 100)}%)`);
    console.log(`     Breakdown: Category=${scoreBreakdown.category}, Color=${scoreBreakdown.color}, Tags=${scoreBreakdown.tags}`);
    console.log(`     Reasons:`, reasons);

    return { score, reasons };
}

/**
 * Hook to calculate compatibility suggestions for virtual try-on
 * 
 * @param selectedItem - The currently selected item for try-on
 * @param wardrobeItems - All available wardrobe items to check compatibility against
 * @param excludeIds - Item IDs to exclude from suggestions (already selected items)
 * @returns Sorted array of compatible items with scores and reasons
 */
export function useTryOnCompatibility(
    selectedItem: { category: string; colors?: string[]; tags?: string[] } | null,
    wardrobeItems: WardrobeItemResponse[],
    excludeIds: (string | number)[] = []
): CompatibilitySuggestion[] {
    return useMemo(() => {
        if (!selectedItem || wardrobeItems.length === 0) {
            console.log('[Compatibility] No selected item or wardrobe items available');
            return [];
        }

        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('[Compatibility] Starting compatibility calculation');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('Selected Item:', {
            category: selectedItem.category,
            colors: selectedItem.colors,
            tags: selectedItem.tags,
        });
        console.log(`Total wardrobe items: ${wardrobeItems.length}`);
        console.log(`Excluded IDs:`, excludeIds);

        // Filter out excluded items and processing items
        const candidates = wardrobeItems.filter(
            item =>
                item.category !== 'processing' &&
                item.status === 'clean' &&
                !excludeIds.includes(item.id)
        );

        console.log(`\nCandidates after filtering: ${candidates.length}`);
        console.log(`  - Excluded processing items`);
        console.log(`  - Excluded non-clean items`);
        console.log(`  - Excluded already selected items`);

        // Calculate compatibility for each candidate
        const suggestions: CompatibilitySuggestion[] = candidates.map(item => {
            const { score, reasons } = calculateCompatibility(selectedItem, item);

            return {
                id: item.id,
                title: item.title,
                category: item.category,
                image_clean: item.image_url,
                image_original: item.image_url,
                imageUrl: item.image_url,
                colors: item.colors || [],
                tags: item.tags || [],
                compatibility_score: score,
                compatibility_reasons: reasons.length > 0 ? reasons : ['Compatible item'],
            };
        });

        // Filter out items with score 0
        const validSuggestions = suggestions.filter(s => s.compatibility_score > 0);
        console.log(`\nValid suggestions (score > 0): ${validSuggestions.length} out of ${suggestions.length}`);

        // Sort by compatibility score (highest first)
        const sorted = validSuggestions.sort((a, b) => b.compatibility_score - a.compatibility_score);

        console.log('\n📈 Top 5 Suggestions:');
        sorted.slice(0, 5).forEach((suggestion, index) => {
            console.log(`  ${index + 1}. ${suggestion.title} (${suggestion.category})`);
            console.log(`     Score: ${suggestion.compatibility_score.toFixed(2)} (${Math.round(suggestion.compatibility_score * 100)}%)`);
            console.log(`     Reasons: ${suggestion.compatibility_reasons.join(', ')}`);
        });
        console.log('═══════════════════════════════════════════════════════════\n');

        return sorted;
    }, [selectedItem, wardrobeItems, excludeIds]);
}

