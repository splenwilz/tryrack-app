import type { BoutiqueItem } from './shop';

/**
 * Category display name mapping
 * Maps API category values to user-friendly display names
 */
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'dress': 'Dresses',
  'dresses': 'Dresses',
  'shirt': 'Shirts',
  't-shirt': 'Shirts',
  'tshirt': 'Shirts',
  'shirts': 'Shirts',
  'top': 'Tops',
  'blouse': 'Blouses',
  'jeans': 'Jeans',
  'trouser': 'Pants',
  'trousers': 'Pants',
  'pants': 'Pants',
  'pant': 'Pants',
  'outerwear': 'Outerwear',
  'jacket': 'Jackets',
  'coats': 'Coats',
  'coat': 'Coats',
  'shoes': 'Shoes',
  'shoe': 'Shoes',
  'sneakers': 'Sneakers',
  'accessories': 'Accessories',
  'accessory': 'Accessories',
  'bag': 'Bags',
  'bags': 'Bags',
  'jewelry': 'Jewelry',
  'jewellery': 'Jewelry',
};

/**
 * Category grouping mapping
 * Groups similar categories together for display
 */
const CATEGORY_GROUPS: Record<string, string> = {
  'dress': 'dress',
  'dresses': 'dress',
  'shirt': 'shirt',
  't-shirt': 'shirt',
  'tshirt': 'shirt',
  'shirts': 'shirt',
  'top': 'top',
  'blouse': 'blouse',
  'jeans': 'pants',
  'trouser': 'pants',
  'trousers': 'pants',
  'pants': 'pants',
  'pant': 'pants',
  'outerwear': 'outerwear',
  'jacket': 'outerwear',
  'coats': 'outerwear',
  'coat': 'outerwear',
  'shoes': 'shoes',
  'shoe': 'shoes',
  'sneakers': 'shoes',
  'accessories': 'accessories',
  'accessory': 'accessories',
  'bag': 'accessories',
  'bags': 'accessories',
  'jewelry': 'accessories',
  'jewellery': 'accessories',
};

/**
 * Get display name for a category
 * Falls back to capitalized category name if no mapping exists
 */
export function getCategoryDisplayName(category: string): string {
  const normalized = category.toLowerCase().trim();
  return CATEGORY_DISPLAY_NAMES[normalized] || category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Get normalized category group key
 * Groups similar categories together
 */
export function getCategoryGroup(category: string): string {
  const normalized = category.toLowerCase().trim();
  return CATEGORY_GROUPS[normalized] || normalized;
}

/**
 * Group products by category dynamically
 * Returns groups sorted by item count (descending)
 */
export function groupProductsByCategory(products: BoutiqueItem[]): {
  groups: Record<string, BoutiqueItem[]>;
  sortedCategories: string[];
} {
  const groups: Record<string, BoutiqueItem[]> = {};

  products.forEach((product) => {
    const categoryGroup = getCategoryGroup(product.category);
    if (!groups[categoryGroup]) {
      groups[categoryGroup] = [];
    }
    groups[categoryGroup].push(product);
  });

  // Sort categories by item count (descending), then alphabetically
  const sortedCategories = Object.keys(groups).sort((a, b) => {
    const countDiff = groups[b].length - groups[a].length;
    if (countDiff !== 0) return countDiff;
    return a.localeCompare(b);
  });

  return { groups, sortedCategories };
}

