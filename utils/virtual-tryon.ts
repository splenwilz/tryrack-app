/**
 * Virtual Try-On Utility Functions
 * Helper functions for virtual try-on feature
 */

/**
 * Keywords that suggest adding items in custom instructions
 * These are checked in real-time as the user types
 */
const ITEM_ADDITION_KEYWORDS = [
    'add',
    'include',
    'with',
    'also',
    'plus',
    'and',
    'accessorize',
    'accessories',
    'shoe',
    'shoes',
    'belt',
    'hat',
    'bag',
    'jewelry',
    'watch',
    'scarf',
    'gloves',
    'sunglasses',
    'put on',
    'wear',
    'wearing',
];

/**
 * Detects if custom instructions might request adding items
 * This function is called on every render/keystroke for real-time detection
 * @param customInstructions - The custom instructions text
 * @returns true if instructions likely request adding items
 */
export function mightAddItems(customInstructions: string): boolean {
    if (!customInstructions || !customInstructions.trim()) {
        return false;
    }

    const lowerText = customInstructions.toLowerCase().trim();

    // Check for keywords that suggest adding items
    // Using word boundaries to avoid false positives
    return ITEM_ADDITION_KEYWORDS.some(keyword => {
        // Look for patterns like "add shoe", "include belt", "with hat", etc.
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        return regex.test(lowerText);
    });
}

