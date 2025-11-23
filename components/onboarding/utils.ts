import type { ProfileFormValues } from './types';
import type { ProfileCompletionRequest, ProfileCompletionResponse, SizeStandard } from '@/api/profile/types';
import { ProfileCompletionRequestSchema } from '@/api/profile/types';
import { ZodError } from 'zod';

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

    // Helper to parse string to number, preserving 0 values
    // Returns undefined only if value is empty or NaN
    const parseNumber = (value?: string): number | undefined => {
        if (!value?.trim()) return undefined;
        const num = Number(value.trim());
        return Number.isNaN(num) ? undefined : num;
    };

    // Convert height_cm and waist_cm from strings to numbers
    // Note: parseNumber preserves 0 values (schema allows 0-300 for height, 0-200 for waist)
    const heightCm = parseNumber(data.height_cm);
    const waistCm = parseNumber(data.waist_cm);

    // Build profile payload with uploaded image URLs
    // Type matches ProfileCompletionRequestSchema (numbers, uppercase gender, nested measurements)
    const profilePayload: Partial<ProfileCompletionRequest> = {
        ...(data.gender && { gender: data.gender.toUpperCase() as 'MALE' | 'FEMALE' }),
        height_cm: heightCm,
        waist_cm: waistCm,
        measurements: Object.keys(measurements).length > 0 ? measurements : undefined,
        profile_picture_url: profilePictureUrl,
        full_body_image_url: fullBodyImageUrl,
    };

    // Add size fields - normalize values and default standards to US if value provided
    const addSizeField = (
        valueField: keyof ProfileFormValues,
        standardField: keyof ProfileFormValues,
        payloadKey: keyof ProfileCompletionRequest
    ) => {
        const value = data[valueField] as string | undefined;
        if (value?.trim()) {
            // Normalize clothing sizes (uppercase for letter sizes)
            if (payloadKey !== 'shoe_size_value' && payloadKey !== 'pants_size_value') {
                (profilePayload[payloadKey] as string) = normalizeClothingSize(value);
            } else {
                (profilePayload[payloadKey] as string) = value.trim();
            }
            // Default to US if standard not provided (matches backend behavior)
            const standard = (data[standardField] as string | undefined) || 'US';
            const standardKey = `${payloadKey.toString().replace('_value', '')}_standard` as keyof ProfileCompletionRequest;
            (profilePayload[standardKey] as SizeStandard) = standard as SizeStandard;
        }
    };

    addSizeField('shoe_size_value', 'shoe_size_standard', 'shoe_size_value');
    addSizeField('shirt_size_value', 'shirt_size_standard', 'shirt_size_value');
    addSizeField('jacket_size_value', 'jacket_size_standard', 'jacket_size_value');
    addSizeField('pants_size_value', 'pants_size_standard', 'pants_size_value');
    addSizeField('top_size_value', 'top_size_standard', 'top_size_value');
    addSizeField('dress_size_value', 'dress_size_standard', 'dress_size_value');

    // Validate payload against schema to ensure type safety
    // This ensures the payload matches ProfileCompletionRequest exactly
    try {
        const validatedPayload = ProfileCompletionRequestSchema.parse(profilePayload);
        return validatedPayload;
    } catch (error) {
        // Format Zod validation errors into user-friendly messages
        if (error instanceof ZodError) {
            // Map technical field names to user-friendly labels
            const fieldNameMap: Record<string, string> = {
                'shirt_size_value': 'Shirt Size',
                'jacket_size_value': 'Jacket Size',
                'pants_size_value': 'Pants Size',
                'top_size_value': 'Top Size',
                'dress_size_value': 'Dress Size',
                'shoe_size_value': 'Shoe Size',
                'height_cm': 'Height',
                'waist_cm': 'Waist',
                'gender': 'Gender',
                'profile_picture_url': 'Profile Picture',
                'full_body_image_url': 'Full Body Image',
            };

            const errorMessages = error.issues.map((issue) => {
                const fieldPath = issue.path.join('.');
                // Use mapped name if available, otherwise convert snake_case to readable format
                const readableFieldName = fieldNameMap[fieldPath] ||
                    fieldPath
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase());

                // Clean up the error message to be more user-friendly
                let message = issue.message;
                // Remove technical details like "Input should be..." and just show the requirement
                message = message.replace(/^Input should be /i, 'Must be ');
                message = message.replace(/^Expected /i, '');

                return `${readableFieldName}: ${message}`;
            });
            throw new Error(errorMessages.join('\n'));
        }
        throw error;
    }
}

/**
 * Maps profile API response to form values
 * 
 * Converts backend response format to flattened form structure:
 * - Converts numbers to strings for form inputs
 * - Converts gender from uppercase to lowercase
 * - Flattens measurements object
 * - Maps image URLs to form fields
 * 
 * @param profile - Profile response from API
 * @returns Form values for React Hook Form
 */
export function mapProfileToFormValues(profile: ProfileCompletionResponse): Partial<ProfileFormValues> {
    const formValues: Partial<ProfileFormValues> = {};

    // Convert gender from 'MALE'/'FEMALE' to 'male'/'female'
    if (profile.gender) {
        const genderLower = typeof profile.gender === 'string'
            ? profile.gender.toLowerCase()
            : String(profile.gender).toLowerCase();
        if (genderLower === 'male' || genderLower === 'female') {
            formValues.gender = genderLower as 'male' | 'female';
        }
    }

    // Convert height_cm from number to string
    if (profile.height_cm !== undefined && profile.height_cm !== null) {
        formValues.height_cm = String(profile.height_cm);
    }

    // Convert waist_cm from number to string
    if (profile.waist_cm !== undefined && profile.waist_cm !== null) {
        formValues.waist_cm = String(profile.waist_cm);
    }

    // Flatten measurements object
    if (profile.measurements) {
        if (profile.measurements.bust_cm !== undefined && profile.measurements.bust_cm !== null) {
            formValues.bust_cm = String(profile.measurements.bust_cm);
        }
        if (profile.measurements.hips_cm !== undefined && profile.measurements.hips_cm !== null) {
            formValues.hips_cm = String(profile.measurements.hips_cm);
        }
        if (profile.measurements.chest_cm !== undefined && profile.measurements.chest_cm !== null) {
            formValues.chest_cm = String(profile.measurements.chest_cm);
        }
        if (profile.measurements.shoulder_width_cm !== undefined && profile.measurements.shoulder_width_cm !== null) {
            formValues.shoulder_width_cm = String(profile.measurements.shoulder_width_cm);
        }
    }

    // Map size fields
    if (profile.shoe_size_value) {
        formValues.shoe_size_value = profile.shoe_size_value;
        formValues.shoe_size_standard = profile.shoe_size_standard || 'US';
    }
    if (profile.shirt_size_value) {
        formValues.shirt_size_value = profile.shirt_size_value;
        formValues.shirt_size_standard = profile.shirt_size_standard || 'US';
    }
    if (profile.jacket_size_value) {
        formValues.jacket_size_value = profile.jacket_size_value;
        formValues.jacket_size_standard = profile.jacket_size_standard || 'US';
    }
    if (profile.pants_size_value) {
        formValues.pants_size_value = profile.pants_size_value;
        formValues.pants_size_standard = profile.pants_size_standard || 'US';
    }
    if (profile.top_size_value) {
        formValues.top_size_value = profile.top_size_value;
        formValues.top_size_standard = profile.top_size_standard || 'US';
    }
    if (profile.dress_size_value) {
        formValues.dress_size_value = profile.dress_size_value;
        formValues.dress_size_standard = profile.dress_size_standard || 'US';
    }

    // Map image URLs
    if (profile.profile_picture_url) {
        formValues.profileImage = profile.profile_picture_url;
    }
    if (profile.full_body_image_url) {
        formValues.fullBodyImage = profile.full_body_image_url;
    }

    return formValues;
}

