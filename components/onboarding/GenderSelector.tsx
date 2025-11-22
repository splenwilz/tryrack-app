import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Controller, type FieldErrors, type Control } from 'react-hook-form';
import type { ProfileFormValues } from './types';

type GenderSelectorProps = {
    control: Control<ProfileFormValues>;
    errors: FieldErrors<ProfileFormValues>;
    tintColor: string;
    iconColor: string;
};

/**
 * Gender Selector Component
 * 
 * Allows users to select their gender (Male/Female) for size recommendations
 * 
 * @see https://react-hook-form.com/docs/controller - React Hook Form Controller
 */
export function GenderSelector({ control, errors, tintColor, iconColor }: GenderSelectorProps) {
    return (
        <View style={styles.container}>
            <Controller
                control={control}
                name="gender"
                render={({ field: { value, onChange } }) => (
                    <>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                {
                                    backgroundColor: value === 'male' ? tintColor : 'transparent',
                                    borderColor: value === 'male' ? tintColor : iconColor,
                                },
                            ]}
                            onPress={() => onChange('male')}
                        >
                            <ThemedText
                                style={[styles.text, { color: value === 'male' ? 'white' : iconColor }]}
                            >
                                Male
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                {
                                    backgroundColor: value === 'female' ? tintColor : 'transparent',
                                    borderColor: value === 'female' ? tintColor : iconColor,
                                },
                            ]}
                            onPress={() => onChange('female')}
                        >
                            <ThemedText
                                style={[styles.text, { color: value === 'female' ? 'white' : iconColor }]}
                            >
                                Female
                            </ThemedText>
                        </TouchableOpacity>
                    </>
                )}
            />
            {errors.gender?.message && (
                <ThemedText style={[styles.errorText, { color: '#FF3B30' }]}>
                    {errors.gender?.message}
                </ThemedText>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 15,
        fontWeight: '600',
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
    },
});

