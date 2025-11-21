import { z } from "zod";

/**
 * Profile completion form schema
 * Validates user body measurements and clothing sizes
 */
const sizeStandardOptions = ['US', 'UK', 'EU'] as const;
export type SizeStandard = typeof sizeStandardOptions[number];

export const ProfileCompletionSchema = z.object({
    gender: z.enum(['male', 'female']),
    // Body measurements - all optional but validated when provided
    height: z.string().optional().refine(
        (val) => !val || (!Number.isNaN(Number(val)) && Number(val) > 0 && Number(val) < 300),
        { message: 'Height must be a valid number between 0 and 300 cm' }
    ),
    weight: z.string().optional().refine(
        (val) => !val || (!Number.isNaN(Number(val)) && Number(val) > 0 && Number(val) < 500),
        { message: 'Weight must be a valid number between 0 and 500 kg' }
    ),
    // Female measurements
    bust: z.string().optional().refine(
        (val) => !val || (!Number.isNaN(Number(val)) && Number(val) > 0 && Number(val) < 200),
        { message: 'Bust must be a valid number between 0 and 200 cm' }
    ),
    waist: z.string().optional().refine(
        (val) => !val || (!Number.isNaN(Number(val)) && Number(val) > 0 && Number(val) < 200),
        { message: 'Waist must be a valid number between 0 and 200 cm' }
    ),
    hips: z.string().optional().refine(
        (val) => !val || (!Number.isNaN(Number(val)) && Number(val) > 0 && Number(val) < 200),
        { message: 'Hips must be a valid number between 0 and 200 cm' }
    ),
    // Male measurements
    chest: z.string().optional().refine(
        (val) => !val || (!Number.isNaN(Number(val)) && Number(val) > 0 && Number(val) < 200),
        { message: 'Chest must be a valid number between 0 and 200 cm' }
    ),
    shoulderWidth: z.string().optional().refine(
        (val) => !val || (!Number.isNaN(Number(val)) && Number(val) > 0 && Number(val) < 100),
        { message: 'Shoulder width must be a valid number between 0 and 100 cm' }
    ),
    // Clothing sizes - all optional
    shoeSize: z.string().optional(),
    shoeSizeStandard: z.enum(sizeStandardOptions).default('US'),
    // Male clothing sizes
    shirtSize: z.string().optional(),
    shirtSizeStandard: z.enum(sizeStandardOptions).default('US'),
    jacketSize: z.string().optional(),
    jacketSizeStandard: z.enum(sizeStandardOptions).default('US'),
    pantsSize: z.string().optional(),
    pantsSizeStandard: z.enum(sizeStandardOptions).default('US'),
    // Female clothing sizes
    topSize: z.string().optional(),
    topSizeStandard: z.enum(sizeStandardOptions).default('US'),
    dressSize: z.string().optional(),
    dressSizeStandard: z.enum(sizeStandardOptions).default('US'),
    // Images - optional
    profileImage: z.string().optional(),
    fullBodyImage: z.string().optional(),
});

export const ProfileCompletionResponseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type ProfileCompletionRequest = z.infer<typeof ProfileCompletionSchema>;
export type ProfileCompletionResponse = z.infer<typeof ProfileCompletionResponseSchema>;

