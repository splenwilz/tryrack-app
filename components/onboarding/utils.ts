import type { ProfileFormValues } from './types';
import type { ProfileCompletionRequest } from '@/api/profile/types';

/**
 * Normalizes clothing size value (uppercase for letter sizes)
 */
function normalizeClothingSize(value: string): string {
    const trimmed = value.trim().toUpperCase();
    const letterSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    if (letterSizes.includes(trimmed)) {
        return trimmed;
    }
    return value.trim();
}

/**
 * Builds the profile payload from form values for API submission
 * 
 * Maps flattened form structure to backend schema structure:
 * - Converts height_cm and waist_cm from strings to floats
 * - Converts measurements values from strings to floats
 * - Handles gender-specific measurements (bust_cm, hips_cm for female; chest_cm, shoulder_width_cm for male)
 * - Normalizes clothing sizes (uppercase for letter sizes)
 * - Defaults size standards to US if value provided without standard
 * 
 * @param data - Form values
 * @param profilePictureUrl - Uploaded profile picture URL
 * @param fullBodyImageUrl - Uploaded full body image URL
 * @returns Profile completion request payload
 */
export function buildProfilePayload(
    data: ProfileFormValues,
    profilePictureUrl?: string,
    fullBodyImageUrl?: string
): ProfileCompletionRequest {
    // Build measurements object according to backend schema
    // Measurements are dict[str, float] - values must be numbers
    // Keys: bust_cm, hips_cm (female), chest_cm, shoulder_width_cm (male)
    // waist_cm is at top level, not in measurements
    const measurements: Record<string, number> = {};
    const addMeasurement = (key: string, value?: string) => {
        if (value?.trim()) {
            const num = Number(value.trim());
            if (!Number.isNaN(num) && num > 0) {
                measurements[key] = num;
            }
        }
    };

    if (data.gender === 'female') {
        addMeasurement('bust_cm', data.bust_cm);
        addMeasurement('hips_cm', data.hips_cm);
    }
    if (data.gender === 'male') {
        addMeasurement('chest_cm', data.chest_cm);
        addMeasurement('shoulder_width_cm', data.shoulder_width_cm);
    }

    // Convert height_cm and waist_cm from strings to floats
    const heightCm = data.height?.trim() ? Number(data.height.trim()) : undefined;
    const waistCm = data.waist_cm?.trim() ? Number(data.waist_cm.trim()) : undefined;

    // Build profile payload with uploaded image URLs
    // Convert gender to uppercase (backend expects 'MALE' or 'FEMALE')
    const profilePayload: Record<string, unknown> = {
        gender: data.gender.toUpperCase() as 'MALE' | 'FEMALE',
        height_cm: heightCm && !Number.isNaN(heightCm) ? heightCm : undefined,
        waist_cm: waistCm && !Number.isNaN(waistCm) ? waistCm : undefined,
        measurements: Object.keys(measurements).length > 0 ? measurements : undefined,
        profile_picture_url: profilePictureUrl,
        full_body_image_url: fullBodyImageUrl,
    };

    // Add size fields - normalize values and default standards to US if value provided
    const addSizeField = (
        valueField: keyof ProfileFormValues,
        standardField: keyof ProfileFormValues,
        payloadKey: string
    ) => {
        const value = data[valueField] as string | undefined;
        if (value?.trim()) {
            // Normalize clothing sizes (uppercase for letter sizes)
            if (payloadKey !== 'shoe_size_value' && payloadKey !== 'pants_size_value') {
                profilePayload[payloadKey] = normalizeClothingSize(value);
            } else {
                profilePayload[payloadKey] = value.trim();
            }
            // Default to US if standard not provided (matches backend behavior)
            const standard = (data[standardField] as string | undefined) || 'US';
            profilePayload[`${payloadKey.replace('_value', '')}_standard`] = standard;
        }
    };

    addSizeField('shoe_size_value', 'shoe_size_standard', 'shoe_size_value');
    addSizeField('shirt_size_value', 'shirt_size_standard', 'shirt_size_value');
    addSizeField('jacket_size_value', 'jacket_size_standard', 'jacket_size_value');
    addSizeField('pants_size_value', 'pants_size_standard', 'pants_size_value');
    addSizeField('top_size_value', 'top_size_standard', 'top_size_value');
    addSizeField('dress_size_value', 'dress_size_standard', 'dress_size_value');

    return profilePayload as ProfileCompletionRequest;
}

