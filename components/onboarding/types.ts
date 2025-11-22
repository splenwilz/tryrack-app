import type { SizeStandard } from '@/api/profile/types';

/**
 * Form values type - flattened structure for easier form handling
 * Maps to ProfileCompletionRequest when submitting
 * 
 * @see https://react-hook-form.com/ - React Hook Form documentation
 */
export type ProfileFormValues = {
    gender: 'male' | 'female';
    height: string; // Maps to height_cm in backend
    waist_cm: string;
    // Measurements (flattened for form)
    bust_cm: string;
    hips_cm: string;
    chest_cm: string;
    shoulder_width_cm: string;
    // Clothing sizes
    shoe_size_value: string;
    shoe_size_standard: SizeStandard;
    shirt_size_value: string;
    shirt_size_standard: SizeStandard;
    jacket_size_value: string;
    jacket_size_standard: SizeStandard;
    pants_size_value: string;
    pants_size_standard: SizeStandard;
    top_size_value: string;
    top_size_standard: SizeStandard;
    dress_size_value: string;
    dress_size_standard: SizeStandard;
    // Images (local URIs before upload)
    profileImage?: string;
    fullBodyImage?: string;
};

/**
 * Size standard options for clothing sizes
 */
export const SIZE_STANDARD_OPTIONS: SizeStandard[] = ['US', 'UK', 'EU'];

