import { Alert } from 'react-native';
import type { CatalogProductFormData } from '@/hooks/boutique/useCatalogProductForm';

export interface ValidationResult {
    isValid: boolean;
    errorMessage?: string;
}

/**
 * Validates catalog product form data
 * @param formData - Form data to validate
 * @returns Validation result with error message if invalid
 */
export function validateCatalogProductForm(formData: CatalogProductFormData): ValidationResult {
    // Required fields
    if (!formData.name || !formData.category || !formData.price) {
        return {
            isValid: false,
            errorMessage: 'Please fill in all required fields (Name, Category, Selling Price)',
        };
    }

    const price = parseInt(formData.price);
    const costPrice = formData.costPrice ? parseInt(formData.costPrice) : undefined;
    const discountPrice = formData.discountPrice ? parseInt(formData.discountPrice) : undefined;
    const stock = parseInt(formData.stock) || 0;

    // Validate selling price
    if (Number.isNaN(price) || price <= 0) {
        return {
            isValid: false,
            errorMessage: 'Please enter a valid selling price greater than 0',
        };
    }

    // Validate cost price
    if (costPrice && (Number.isNaN(costPrice) || costPrice <= 0)) {
        return {
            isValid: false,
            errorMessage: 'Please enter a valid cost price greater than 0',
        };
    }

    // Validate cost price vs selling price
    if (costPrice && costPrice >= price) {
        return {
            isValid: false,
            errorMessage: 'Selling price must be greater than cost price to make a profit',
        };
    }

    // Validate discount price
    if (discountPrice && (Number.isNaN(discountPrice) || discountPrice <= price)) {
        return {
            isValid: false,
            errorMessage: 'Discount price must be greater than selling price to show a discount',
        };
    }

    // Validate image
    if (!formData.imageUrl) {
        return {
            isValid: false,
            errorMessage: 'Please upload a product image first.',
        };
    }

    return { isValid: true };
}

/**
 * Calculates profit information from form data
 * @param formData - Form data containing cost and selling prices
 * @returns Profit information or null if calculation not possible
 */
export function calculateProfit(formData: CatalogProductFormData): {
    profit: number;
    margin: number;
} | null {
    const costPrice = formData.costPrice ? parseInt(formData.costPrice) : undefined;
    const price = parseInt(formData.price);

    if (
        !costPrice ||
        !price ||
        Number.isNaN(costPrice) ||
        Number.isNaN(price) ||
        costPrice <= 0 ||
        price <= costPrice
    ) {
        return null;
    }

    const profit = price - costPrice;
    const margin = Math.round((profit / costPrice) * 100);

    return { profit, margin };
}

