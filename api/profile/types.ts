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

export const ProfileCompletionSchema = z.object({
    gender: z.enum(['male', 'female']).optional(),

    // Body measurements - validated as floats in backend (0-300 for height, 0-200 for waist)
    // Form uses "height" but backend expects "height_cm" - conversion happens in buildProfilePayload
    height: z.string()
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

    // Measurements: dict[str, float] - all values must be positive numbers
    measurements: z.record(z.string(), z.string())
        .optional()
        .refine(
            (val) => {
                if (!val) return true;
                for (const value of Object.values(val)) {
                    if (typeof value === 'string') {
                        const num = Number(value);
                        if (Number.isNaN(num) || num < 0) {
                            return false;
                        }
                    } else if (typeof value !== 'number' || value < 0) {
                        return false;
                    }
                }
                return true;
            },
            { message: 'All measurements must be positive numbers' }
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

export const ProfileCompletionResponseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type ProfileCompletionRequest = z.infer<typeof ProfileCompletionSchema>;
export type ProfileCompletionResponse = z.infer<typeof ProfileCompletionResponseSchema>;

