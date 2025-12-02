import type { ProfileFormValues as ApiProfileFormValues, SizeStandard } from '@/api/profile/types';

/**
 * Form values type - extends API form schema with image fields
 * This matches the ProfileFormSchema (strings, lowercase gender, flat structure)
 * 
 * @see https://react-hook-form.com/ - React Hook Form documentation
 */
export type ProfileFormValues = ApiProfileFormValues & {
    // Images (local URIs before upload - not part of API schema)
    profileImage?: string;
    fullBodyImage?: string;
};

/**
 * Size standard options for clothing sizes
 */
export const SIZE_STANDARD_OPTIONS: SizeStandard[] = ['US', 'UK', 'EU'];

