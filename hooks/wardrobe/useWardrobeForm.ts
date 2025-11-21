import { useState, useCallback } from 'react';
import type { WardrobeItemForm } from '@/types/wardrobe';

const initialFormData: WardrobeItemForm = {
    title: '',
    category: '',
    colors: [],
    tags: [],
    imageUrl: null,
};

export function useWardrobeForm(initialData?: Partial<WardrobeItemForm>) {
    const [formData, setFormData] = useState<WardrobeItemForm>({
        ...initialFormData,
        ...initialData,
    });

    const updateField = useCallback(<K extends keyof WardrobeItemForm>(
        field: K,
        value: WardrobeItemForm[K]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const updateForm = useCallback((updates: Partial<WardrobeItemForm>) => {
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

    return {
        formData,
        updateField,
        updateForm,
        resetForm,
        addTag,
        removeTag,
        toggleColor,
    };
}

