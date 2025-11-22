import { View, TextInput, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Controller, type Control } from 'react-hook-form';
import { SizeStandardSelector } from './SizeStandardSelector';
import type { ProfileFormValues } from './types';

type SizeInputProps = {
    control: Control<ProfileFormValues>;
    valueName: 'shoe_size_value' | 'shirt_size_value' | 'jacket_size_value' | 'pants_size_value' | 'top_size_value' | 'dress_size_value';
    standardName: 'shoe_size_standard' | 'shirt_size_standard' | 'jacket_size_standard' | 'pants_size_standard' | 'top_size_standard' | 'dress_size_standard';
    label: string;
    placeholder: string;
    textColor: string;
    iconColor: string;
    tintColor: string;
};

/**
 * Size Input Component
 * 
 * Combined input for clothing size value and size standard selector
 * 
 * @see https://react-hook-form.com/docs/controller - React Hook Form Controller
 */
export function SizeInput({
    control,
    valueName,
    standardName,
    label,
    placeholder,
    textColor,
    iconColor,
    tintColor,
}: SizeInputProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.label}>{label}</ThemedText>
                                <SizeStandardSelector
                                    control={control}
                                    name={standardName}
                                />
            </View>
            <Controller
                control={control}
                name={valueName}
                render={({ field: { onChange, value } }) => (
                    <TextInput
                        style={[styles.input, { color: textColor, borderColor: iconColor }]}
                        placeholder={placeholder}
                        placeholderTextColor={iconColor}
                        keyboardType={valueName === 'shoe_size_value' ? 'numeric' : 'default'}
                        value={value}
                        onChangeText={onChange}
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },
});

