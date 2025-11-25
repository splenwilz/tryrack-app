/**
 * Color utility functions
 * Converts color names to hex values for display
 */

/**
 * Map of common color names to hex values
 */
const COLOR_NAME_TO_HEX: Record<string, string> = {
    // Basic colors
    black: '#000000',
    white: '#FFFFFF',
    gray: '#808080',
    grey: '#808080',
    
    // Primary colors
    red: '#FF0000',
    blue: '#0000FF',
    green: '#008000',
    yellow: '#FFFF00',
    orange: '#FFA500',
    purple: '#800080',
    pink: '#FFC0CB',
    brown: '#A52A2A',
    
    // Extended colors
    navy: '#000080',
    beige: '#F5F5DC',
    tan: '#D2B48C',
    teal: '#008080',
    turquoise: '#40E0D0',
    coral: '#FF7F50',
    peach: '#FFE5B4',
    
    // Common fashion colors
    maroon: '#800000',
    burgundy: '#800020',
    khaki: '#C3B091',
    olive: '#808000',
    mint: '#98FF98',
    lavender: '#E6E6FA',
    salmon: '#FA8072',
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
};

/**
 * Convert a color name to hex value
 * Returns the hex value if found, otherwise returns a default color
 * 
 * @param colorName - The color name (e.g., "blue", "red")
 * @param defaultColor - Default color to return if not found (default: gray)
 * @returns Hex color string
 */
export function colorNameToHex(colorName: string, defaultColor: string = '#808080'): string {
    if (!colorName) return defaultColor;
    
    const normalized = colorName.toLowerCase().trim();
    return COLOR_NAME_TO_HEX[normalized] || defaultColor;
}

