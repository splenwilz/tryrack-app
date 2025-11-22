import { useForm, type Resolver, type UseFormReturn } from 'react-hook-form';
import type { ProfileFormValues } from '@/components/onboarding/types';

/**
 * Custom resolver that validates against schema but allows flattened form structure
 * We skip validation at form level and validate when submitting to match backend schema
 * 
 * @see https://react-hook-form.com/docs/useform - React Hook Form useForm hook
 */
const formResolver: Resolver<ProfileFormValues> = async (values) => {
    return { values, errors: {} };
};

/**
 * Hook for managing profile completion form state
 * 
 * Provides form control, validation, and default values for profile completion
 * 
 * @param defaultValues - Optional default values to populate form (e.g., from existing profile)
 * @returns React Hook Form instance with profile form configuration
 * @see https://react-hook-form.com/ - React Hook Form documentation
 */
export function useProfileForm(defaultValues?: Partial<ProfileFormValues>): UseFormReturn<ProfileFormValues> {
    return useForm<ProfileFormValues>({
        resolver: formResolver,
        defaultValues: {
            gender: defaultValues?.gender || 'female',
            height: defaultValues?.height || '',
            waist_cm: defaultValues?.waist_cm || '',
            bust_cm: defaultValues?.bust_cm || '',
            hips_cm: defaultValues?.hips_cm || '',
            chest_cm: defaultValues?.chest_cm || '',
            shoulder_width_cm: defaultValues?.shoulder_width_cm || '',
            shoe_size_value: defaultValues?.shoe_size_value || '',
            shoe_size_standard: defaultValues?.shoe_size_standard || 'US',
            shirt_size_value: defaultValues?.shirt_size_value || '',
            shirt_size_standard: defaultValues?.shirt_size_standard || 'US',
            jacket_size_value: defaultValues?.jacket_size_value || '',
            jacket_size_standard: defaultValues?.jacket_size_standard || 'US',
            pants_size_value: defaultValues?.pants_size_value || '',
            pants_size_standard: defaultValues?.pants_size_standard || 'US',
            top_size_value: defaultValues?.top_size_value || '',
            top_size_standard: defaultValues?.top_size_standard || 'US',
            dress_size_value: defaultValues?.dress_size_value || '',
            dress_size_standard: defaultValues?.dress_size_standard || 'US',
            profileImage: defaultValues?.profileImage,
            fullBodyImage: defaultValues?.fullBodyImage,
        },
    });
}

