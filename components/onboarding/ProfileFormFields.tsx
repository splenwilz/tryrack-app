import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Controller, useWatch, type Control } from 'react-hook-form';
import { GenderSelector } from './GenderSelector';
import { MeasurementInput } from './MeasurementInput';
import { SizeInput } from './SizeInput';
import type { ProfileFormValues } from './types';

type ProfileFormFieldsProps = {
    control: Control<ProfileFormValues>;
    errors: any;
    textColor: string;
    iconColor: string;
    tintColor: string;
};

/**
 * Profile Form Fields Component
 * 
 * Renders all form fields for profile completion including:
 * - Gender selection
 * - Body measurements (gender-specific)
 * - Clothing sizes (gender-specific)
 * 
 * Uses useWatch to reactively update when gender changes
 * 
 * @see https://react-hook-form.com/ - React Hook Form documentation
 * @see https://react-hook-form.com/docs/usewatch - useWatch hook for reactive updates
 */
export function ProfileFormFields({
    control,
    errors,
    textColor,
    iconColor,
    tintColor,
}: ProfileFormFieldsProps) {
    // Watch gender value to reactively show/hide gender-specific fields
    const gender = useWatch({
        control,
        name: 'gender',
        defaultValue: 'female',
    }) as 'male' | 'female';
    return (
        <>
            {/* Gender Selection */}
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Gender *</ThemedText>
                <ThemedText style={[styles.sectionSubtitle, { color: iconColor }]}>
                    This helps us provide better size recommendations
                </ThemedText>
                <GenderSelector control={control} errors={errors} tintColor={tintColor} iconColor={iconColor} />
            </View>

            {/* Body Measurements */}
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Body Measurements (Optional)</ThemedText>
                <ThemedText style={[styles.sectionSubtitle, { color: iconColor }]}>
                    These measurements help us recommend clothes that fit you perfectly
                </ThemedText>

                <View style={styles.inputRow}>
                    <MeasurementInput
                        control={control}
                        name="height"
                        label="Height (cm)"
                        placeholder="e.g., 165"
                        errors={errors}
                        textColor={textColor}
                        iconColor={iconColor}
                    />
                    <MeasurementInput
                        control={control}
                        name="waist_cm"
                        label="Waist (cm)"
                        placeholder="e.g., 70"
                        errors={errors}
                        textColor={textColor}
                        iconColor={iconColor}
                    />
                </View>

                {/* Female Measurements */}
                {gender === 'female' && (
                    <View style={styles.inputRow}>
                        <MeasurementInput
                            control={control}
                            name="bust_cm"
                            label="Bust (cm)"
                            placeholder="e.g., 90"
                            errors={errors}
                            textColor={textColor}
                            iconColor={iconColor}
                        />
                        <MeasurementInput
                            control={control}
                            name="hips_cm"
                            label="Hips (cm)"
                            placeholder="e.g., 95"
                            errors={errors}
                            textColor={textColor}
                            iconColor={iconColor}
                        />
                    </View>
                )}

                {/* Male Measurements */}
                {gender === 'male' && (
                    <View style={styles.inputRow}>
                        <MeasurementInput
                            control={control}
                            name="chest_cm"
                            label="Chest (cm)"
                            placeholder="e.g., 100"
                            errors={errors}
                            textColor={textColor}
                            iconColor={iconColor}
                        />
                        <MeasurementInput
                            control={control}
                            name="shoulder_width_cm"
                            label="Shoulder Width (cm)"
                            placeholder="e.g., 45"
                            errors={errors}
                            textColor={textColor}
                            iconColor={iconColor}
                        />
                    </View>
                )}
            </View>

            {/* Clothing Sizes */}
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Clothing Sizes</ThemedText>
                <ThemedText style={[styles.sectionSubtitle, { color: iconColor }]}>
                    Help us recommend clothes that fit you perfectly. Choose your preferred sizing standard for each item.
                </ThemedText>

                {/* Common: Shoe Size */}
                <View style={styles.inputRow}>
                    <SizeInput
                        control={control}
                        valueName="shoe_size_value"
                        standardName="shoe_size_standard"
                        label="Shoe Size"
                        placeholder={gender === 'male' ? 'e.g., 10' : 'e.g., 7'}
                        textColor={textColor}
                        iconColor={iconColor}
                        tintColor={tintColor}
                    />
                </View>

                {/* Gender-specific: Male Sizes */}
                {gender === 'male' && (
                    <>
                        <View style={styles.inputRow}>
                            <SizeInput
                                control={control}
                                valueName="shirt_size_value"
                                standardName="shirt_size_standard"
                                label="Shirt Size"
                                placeholder="e.g., M"
                                textColor={textColor}
                                iconColor={iconColor}
                                tintColor={tintColor}
                            />
                            <SizeInput
                                control={control}
                                valueName="jacket_size_value"
                                standardName="jacket_size_standard"
                                label="Jacket/Blazer Size"
                                placeholder="e.g., 40"
                                textColor={textColor}
                                iconColor={iconColor}
                                tintColor={tintColor}
                            />
                        </View>
                        <View style={styles.inputRow}>
                            <SizeInput
                                control={control}
                                valueName="pants_size_value"
                                standardName="pants_size_standard"
                                label="Pants Size (Waist × Inseam)"
                                placeholder="e.g., 32x30"
                                textColor={textColor}
                                iconColor={iconColor}
                                tintColor={tintColor}
                            />
                        </View>
                    </>
                )}

                {/* Gender-specific: Female Sizes */}
                {gender === 'female' && (
                    <>
                        <View style={styles.inputRow}>
                            <SizeInput
                                control={control}
                                valueName="top_size_value"
                                standardName="top_size_standard"
                                label="Top/Blouse Size"
                                placeholder="e.g., M"
                                textColor={textColor}
                                iconColor={iconColor}
                                tintColor={tintColor}
                            />
                            <SizeInput
                                control={control}
                                valueName="dress_size_value"
                                standardName="dress_size_standard"
                                label="Dress Size"
                                placeholder="e.g., 8"
                                textColor={textColor}
                                iconColor={iconColor}
                                tintColor={tintColor}
                            />
                        </View>
                        <View style={styles.inputRow}>
                            <SizeInput
                                control={control}
                                valueName="pants_size_value"
                                standardName="pants_size_standard"
                                label="Pants/Jeans Size"
                                placeholder="e.g., 28 or 28x30"
                                textColor={textColor}
                                iconColor={iconColor}
                                tintColor={tintColor}
                            />
                        </View>
                    </>
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    sectionSubtitle: {
        fontSize: 13,
        marginBottom: 12,
        opacity: 0.7,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
});

