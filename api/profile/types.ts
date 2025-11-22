import { z } from "zod";

/**
 * Profile completion form schema
 * Validates user body measurements and clothing sizes
 * 
 * Matches backend UserProfileCreate validation:
 * - height_cm: Optional float, 0-300
 * - waist_cm: Optional float, 0-200
 * - measurements: Optional dict[str, float] with positive values
 * - Size values: Validated formats (numeric, letter sizes, pants format)
 * - Size standards: Default to US if value provided without standard
 */
const sizeStandardOptions = ['US', 'UK', 'EU'] as const;
export type SizeStandard = typeof sizeStandardOptions[number];

/**
 * Validates shoe size: numeric only (e.g., '7', '7.5', '40')
 */
const shoeSizeValidator = z.string()
    .max(20, 'Shoe size must be 20 characters or less')
    .optional()
    .refine(
        (val) => !val || /^\d+(\.\d+)?$/.test(val.trim()),
        { message: "Shoe size must be numeric (e.g., '7', '7.5', '40')" }
    );

/**
 * Validates clothing size: letter sizes (XS-XXXL) or numeric
 */
const clothingSizeValidator = z.string()
    .max(20, 'Size must be 20 characters or less')
    .optional()
    .refine(
        (val) => {
            if (!val) return true;
            const trimmed = val.trim().toUpperCase();
            const letterSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
            return letterSizes.includes(trimmed) || /^\d+(\.\d+)?$/.test(trimmed);
        },
        { message: "Size must be letter size (XS-XXXL) or numeric (e.g., '10')" }
    );

/**
 * Validates pants size: numeric waist or combined waist x inseam
 */
const pantsSizeValidator = z.string()
    .max(20, 'Pants size must be 20 characters or less')
    .optional()
    .refine(
        (val) => !val || /^\d+$/.test(val.trim()) || /^\d+x\d+$/.test(val.trim()),
        { message: "Pants size must be numeric (e.g., '32') or combined (e.g., '32x34')" }
    );

/**
 * Profile form schema - validates form inputs (strings, lowercase gender, flat structure)
 * Used for React Hook Form validation
 * 
 * Note: Form uses flattened structure (bust_cm, hips_cm at top level)
 * Backend uses nested structure (measurements: { bust_cm, hips_cm })
 */
export const ProfileFormSchema = z.object({
    gender: z.enum(['male', 'female']).optional(),

    // Body measurements - form inputs are strings
    height_cm: z.string()
        .optional()
        .refine(
            (val) => {
                if (!val || !val.trim()) return true;
                const num = Number(val.trim());
                return !Number.isNaN(num) && num >= 0 && num <= 300;
            },
            { message: 'Height must be a valid number between 0 and 300 cm' }
        ),

    waist_cm: z.string()
        .optional()
        .refine(
            (val) => {
                if (!val || !val.trim()) return true;
                const num = Number(val.trim());
                return !Number.isNaN(num) && num >= 0 && num <= 200;
            },
            { message: 'Waist must be a valid number between 0 and 200 cm' }
        ),

    // Measurements: flattened for form (bust_cm, hips_cm, chest_cm, shoulder_width_cm at top level)
    // These will be nested into measurements object in backend schema
    bust_cm: z.string()
        .optional()
        .refine(
            (val) => {
                if (!val || !val.trim()) return true;
                const num = Number(val.trim());
                return !Number.isNaN(num) && num > 0;
            },
            { message: 'Bust must be a positive number' }
        ),
    hips_cm: z.string()
        .optional()
        .refine(
            (val) => {
                if (!val || !val.trim()) return true;
                const num = Number(val.trim());
                return !Number.isNaN(num) && num > 0;
            },
            { message: 'Hips must be a positive number' }
        ),
    chest_cm: z.string()
        .optional()
        .refine(
            (val) => {
                if (!val || !val.trim()) return true;
                const num = Number(val.trim());
                return !Number.isNaN(num) && num > 0;
            },
            { message: 'Chest must be a positive number' }
        ),
    shoulder_width_cm: z.string()
        .optional()
        .refine(
            (val) => {
                if (!val || !val.trim()) return true;
                const num = Number(val.trim());
                return !Number.isNaN(num) && num > 0;
            },
            { message: 'Shoulder width must be a positive number' }
        ),

    // Clothing sizes - all optional with format validation
    shoe_size_value: shoeSizeValidator,
    shoe_size_standard: z.enum(sizeStandardOptions).optional(),

    // Male clothing sizes
    shirt_size_value: clothingSizeValidator,
    shirt_size_standard: z.enum(sizeStandardOptions).optional(),
    jacket_size_value: clothingSizeValidator,
    jacket_size_standard: z.enum(sizeStandardOptions).optional(),
    pants_size_value: pantsSizeValidator,
    pants_size_standard: z.enum(sizeStandardOptions).optional(),

    // Female clothing sizes
    top_size_value: clothingSizeValidator,
    top_size_standard: z.enum(sizeStandardOptions).optional(),
    dress_size_value: clothingSizeValidator,
    dress_size_standard: z.enum(sizeStandardOptions).optional(),

    // Images - optional, max 500 chars
    profile_picture_url: z.string()
        .max(500, 'Profile picture URL must be 500 characters or less')
        .optional(),
    full_body_image_url: z.string()
        .max(500, 'Full body image URL must be 500 characters or less')
        .optional(),
})
    .refine(
        // Ensure size standards align with provided values
        // If standard is provided without value, that's invalid
        // If value is provided without standard, default to US (handled in buildProfilePayload)
        (data) => {
            const sizePairs = [
                ['shoe_size_value', 'shoe_size_standard'],
                ['shirt_size_value', 'shirt_size_standard'],
                ['jacket_size_value', 'jacket_size_standard'],
                ['pants_size_value', 'pants_size_standard'],
                ['top_size_value', 'top_size_standard'],
                ['dress_size_value', 'dress_size_standard'],
            ] as const;

            for (const [valueField, standardField] of sizePairs) {
                const value = data[valueField];
                const standard = data[standardField];
                // If standard is provided without value, that's invalid
                if (standard && !value) {
                    return false;
                }
            }
            return true;
        },
        {
            message: 'Size standard cannot be provided without a corresponding size value',
            path: ['size_standard'],
        }
    );

/**
 * Profile completion request schema - matches backend payload format exactly
 * Uses numbers, uppercase gender, nested measurements structure
 */
export const ProfileCompletionRequestSchema = z.object({
    gender: z.enum(['MALE', 'FEMALE']).optional(),

    // Body measurements - backend expects numbers
    height_cm: z.number()
        .min(0, 'Height must be 0 or greater')
        .max(300, 'Height must be 300 cm or less')
        .optional(),

    waist_cm: z.number()
        .min(0, 'Waist must be 0 or greater')
        .max(200, 'Waist must be 200 cm or less')
        .optional(),

    // Measurements: dict[str, float] - backend expects numbers
    measurements: z.record(z.string(), z.number().positive()).optional(),

    // Clothing sizes - backend accepts strings
    shoe_size_value: shoeSizeValidator,
    shoe_size_standard: z.enum(sizeStandardOptions).optional(),

    shirt_size_value: clothingSizeValidator,
    shirt_size_standard: z.enum(sizeStandardOptions).optional(),

    jacket_size_value: clothingSizeValidator,
    jacket_size_standard: z.enum(sizeStandardOptions).optional(),

    pants_size_value: pantsSizeValidator,
    pants_size_standard: z.enum(sizeStandardOptions).optional(),

    top_size_value: clothingSizeValidator,
    top_size_standard: z.enum(sizeStandardOptions).optional(),

    dress_size_value: clothingSizeValidator,
    dress_size_standard: z.enum(sizeStandardOptions).optional(),

    // Images
    profile_picture_url: z.string()
        .max(500, 'Profile picture URL must be 500 characters or less')
        .optional(),
    full_body_image_url: z.string()
        .max(500, 'Full body image URL must be 500 characters or less')
        .optional(),
})
    .refine(
        (data) => {
            const sizePairs = [
                ['shoe_size_value', 'shoe_size_standard'],
                ['shirt_size_value', 'shirt_size_standard'],
                ['jacket_size_value', 'jacket_size_standard'],
                ['pants_size_value', 'pants_size_standard'],
                ['top_size_value', 'top_size_standard'],
                ['dress_size_value', 'dress_size_standard'],
            ] as const;

            for (const [valueField, standardField] of sizePairs) {
                const value = data[valueField];
                const standard = data[standardField];
                if (standard && !value) {
                    return false;
                }
            }
            return true;
        },
        {
            message: 'Size standard cannot be provided without a corresponding size value',
            path: ['size_standard'],
        }
    );

// Response schema - backend returns numbers for measurements, not strings
export const ProfileCompletionResponseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    gender: z.enum(['male', 'female', 'MALE', 'FEMALE']).optional(),
    height_cm: z.number().optional(),
    waist_cm: z.number().optional(),
    measurements: z.record(z.string(), z.number()).optional(),
    shoe_size_value: z.string().optional(),
    shoe_size_standard: z.enum(sizeStandardOptions).optional(),
    shirt_size_value: z.string().optional(),
    shirt_size_standard: z.enum(sizeStandardOptions).optional(),
    jacket_size_value: z.string().optional(),
    jacket_size_standard: z.enum(sizeStandardOptions).optional(),
    pants_size_value: z.string().optional(),
    pants_size_standard: z.enum(sizeStandardOptions).optional(),
    top_size_value: z.string().optional(),
    top_size_standard: z.enum(sizeStandardOptions).optional(),
    dress_size_value: z.string().optional(),
    dress_size_standard: z.enum(sizeStandardOptions).optional(),
    profile_picture_url: z.string().optional(),
    full_body_image_url: z.string().optional(),
});

// Form values type - inferred from form schema (strings, lowercase gender, flat structure)
export type ProfileFormValues = z.infer<typeof ProfileFormSchema>;

// Backend request type - inferred from request schema (numbers, uppercase gender, nested measurements)
export type ProfileCompletionRequest = z.infer<typeof ProfileCompletionRequestSchema>;

// Backend response type
export type ProfileCompletionResponse = z.infer<typeof ProfileCompletionResponseSchema>;

// Legacy export for backward compatibility
export const ProfileCompletionSchema = ProfileCompletionRequestSchema;

