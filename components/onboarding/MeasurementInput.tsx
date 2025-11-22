import { View, TextInput, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Controller, type FieldErrors, type Control } from 'react-hook-form';
import type { ProfileFormValues } from './types';

type MeasurementInputProps = {
    control: Control<ProfileFormValues>;
    name: keyof ProfileFormValues;
    label: string;
    placeholder: string;
    errors: FieldErrors<ProfileFormValues>;
    textColor: string;
    iconColor: string;
};

/**
 * Measurement Input Component
 * 
 * Reusable input field for body measurements (height, weight, bust, etc.)
 * 
 * @see https://reactnative.dev/docs/textinput - React Native TextInput
 */
export function MeasurementInput({
    control,
    name,
    label,
    placeholder,
    errors,
    textColor,
    iconColor,
}: MeasurementInputProps) {
    return (
        <View style={styles.container}>
            <ThemedText style={styles.label}>{label}</ThemedText>
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, value } }) => (
                    <TextInput
                        style={[
                            styles.input,
                            { color: textColor, borderColor: errors?.[name] ? '#FF3B30' : iconColor },
                        ]}
                        placeholder={placeholder}
                        placeholderTextColor={iconColor}
                        keyboardType="numeric"
                        value={value}
                        onChangeText={onChange}
                    />
                )}
            />
            {errors[name]?.message && (
                <ThemedText style={[styles.errorText, { color: '#FF3B30' }]}>
                    {errors[name]?.message}
                </ThemedText>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
    },
});

