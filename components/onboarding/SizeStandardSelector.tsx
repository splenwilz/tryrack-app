import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { SIZE_STANDARD_OPTIONS, type ProfileFormValues } from './types';
import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';

type SizeStandardSelectorProps = {
    control: Control<ProfileFormValues>;
    name: 'shoe_size_standard' | 'shirt_size_standard' | 'jacket_size_standard' | 'pants_size_standard' | 'top_size_standard' | 'dress_size_standard';
};

/**
 * Size Standard Selector Component
 * 
 * Allows users to select sizing standard (US, UK, EU) for clothing items
 * 
 * @see https://reactnative.dev/docs/touchableopacity - TouchableOpacity documentation
 */
export function SizeStandardSelector({ control, name }: SizeStandardSelectorProps) {
    return (
        <View style={styles.container}>
            {SIZE_STANDARD_OPTIONS.map((option) => (
                <Controller
                    key={option}
                    control={control}
                    name={name}
                    render={({ field: { value, onChange } }) => (
                        <TouchableOpacity
                            style={[
                                styles.pill,
                                value === option && styles.pillActive,
                            ]}
                            onPress={() => onChange(option)}
                        >
                            <ThemedText
                                style={[
                                    styles.pillText,
                                    value === option && styles.pillTextActive,
                                ]}
                            >
                                {option}
                            </ThemedText>
                        </TouchableOpacity>
                    )}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 6,
        flexShrink: 0,
    },
    pill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#CCCCCC',
    },
    pillActive: {
        backgroundColor: '#111111',
        borderColor: '#111111',
    },
    pillText: {
        fontSize: 12,
        color: '#666666',
    },
    pillTextActive: {
        color: '#FFFFFF',
    },
});

