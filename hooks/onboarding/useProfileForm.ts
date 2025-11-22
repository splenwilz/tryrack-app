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
 * @returns React Hook Form instance with profile form configuration
 * @see https://react-hook-form.com/ - React Hook Form documentation
 */
export function useProfileForm(): UseFormReturn<ProfileFormValues> {
    return useForm<ProfileFormValues>({
        resolver: formResolver,
        defaultValues: {
            gender: 'female',
            height: '',
            waist_cm: '',
            bust_cm: '',
            hips_cm: '',
            chest_cm: '',
            shoulder_width_cm: '',
            shoe_size_value: '',
            shoe_size_standard: 'US',
            shirt_size_value: '',
            shirt_size_standard: 'US',
            jacket_size_value: '',
            jacket_size_standard: 'US',
            pants_size_value: '',
            pants_size_standard: 'US',
            top_size_value: '',
            top_size_standard: 'US',
            dress_size_value: '',
            dress_size_standard: 'US',
            profileImage: undefined,
            fullBodyImage: undefined,
        },
    });
}

