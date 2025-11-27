import { useState, useCallback } from 'react';
import type { CatalogProduct } from '@/types/boutique';

export interface CatalogProductFormData {
    name: string;
    category: string;
    brand: string;
    price: string;
    costPrice: string;
    discountPrice: string;
    description: string;
    stock: string;
    tags: string[];
    colors: string[];
    imageUrl: string;
}

const initialFormData: CatalogProductFormData = {
    name: '',
    category: '',
    brand: '',
    price: '',
    costPrice: '',
    discountPrice: '',
    description: '',
    stock: '',
    tags: [],
    colors: [],
    imageUrl: '',
};

/**
 * Hook for managing catalog product form state
 * Provides form state management and helper methods
 * 
 * @param initialData - Optional initial form data (for edit mode)
 * @returns Form state and update methods
 */
export function useCatalogProductForm(initialData?: Partial<CatalogProductFormData>) {
    const [formData, setFormData] = useState<CatalogProductFormData>({
        ...initialFormData,
        ...initialData,
    });

    const updateField = useCallback(<K extends keyof CatalogProductFormData>(
        field: K,
        value: CatalogProductFormData[K]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const updateForm = useCallback((updates: Partial<CatalogProductFormData>) => {
        setFormData((prev) => ({ ...prev, ...updates }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData({ ...initialFormData, ...initialData });
    }, [initialData]);

    const addTag = useCallback((tag: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.includes(tag) ? prev.tags : [...prev.tags, tag],
        }));
    }, []);

    const removeTag = useCallback((tag: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((existingTag) => existingTag !== tag),
        }));
    }, []);

    const toggleColor = useCallback((color: string) => {
        setFormData((prev) => {
            const isSelected = prev.colors.includes(color);
            return {
                ...prev,
                colors: isSelected
                    ? prev.colors.filter((c) => c !== color)
                    : [...prev.colors, color],
            };
        });
    }, []);

    /**
     * Populate form from product data (for edit mode)
     */
    const populateFromProduct = useCallback((product: CatalogProduct) => {
        setFormData({
            name: product.name,
            category: product.category,
            brand: product.brand || '',
            price: product.price.toString(),
            costPrice: product.costPrice?.toString() || '',
            discountPrice: product.discountPrice?.toString() || '',
            description: product.description,
            stock: product.stock.toString(),
            tags: product.tags || [],
            colors: product.colors || [],
            imageUrl: product.imageUrl,
        });
    }, []);

    return {
        formData,
        updateField,
        updateForm,
        resetForm,
        addTag,
        removeTag,
        toggleColor,
        populateFromProduct,
    };
}

