import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ShimmerPlaceholder } from '@/components/ShimmerPlaceholder';
import { COMMON_COLORS } from '@/constants/wardrobe';
import { useState, useEffect } from 'react';

interface ColorSelectorProps {
    value: string[];
    onChange: (colors: string[]) => void;
    showShimmer?: boolean;
}

export function ColorSelector({ value, onChange, showShimmer = false }: ColorSelectorProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const textColor = useThemeColor({}, 'text');
    const borderColor = useThemeColor({}, 'tabIconDefault');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [inputValue, setInputValue] = useState('');

    // Clear input when colors change externally (e.g., from AI)
    useEffect(() => {
        if (inputValue && !inputValue.split(',').some((c) => value.includes(c.trim()))) {
            setInputValue('');
        }
    }, [value, inputValue]);

    const handleInputChange = (text: string) => {
        setInputValue(text);
        const colors = text
            .split(',')
            .map((c) => c.trim())
            .filter((c) => c.length > 0);
        onChange(colors);
    };

    const handleToggleColor = (color: string) => {
        setInputValue('');
        const isSelected = value.includes(color);
        onChange(
            isSelected ? value.filter((c) => c !== color) : [...value, color]
        );
    };

    if (showShimmer && value.length === 0) {
        return (
            <View style={[styles.section, { backgroundColor }]}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Colors
                </ThemedText>
                <View style={styles.shimmerRow}>
                    <ShimmerPlaceholder width={70} height={32} borderRadius={16} />
                    <ShimmerPlaceholder width={90} height={32} borderRadius={16} style={{ marginLeft: 8 }} />
                    <ShimmerPlaceholder width={60} height={32} borderRadius={16} style={{ marginLeft: 8 }} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.section, { backgroundColor }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
                Colors
            </ThemedText>

            <View style={[styles.inputContainer, { borderColor, marginBottom: 12 }]}>
                <TextInput
                    style={[styles.textInput, { color: textColor }]}
                    placeholder="e.g., navy blue, burgundy, olive green"
                    placeholderTextColor={borderColor}
                    value={inputValue || value.join(', ')}
                    onChangeText={handleInputChange}
                    onBlur={() => setInputValue('')}
                    autoCapitalize="words"
                />
            </View>

            <ThemedText style={[styles.helperText, { color: borderColor, marginBottom: 8 }]}>
                Or select a quick option:
            </ThemedText>

            <View style={styles.colorGrid}>
                {COMMON_COLORS.map((color) => {
                    const isSelected = value.includes(color);
                    return (
                        <TouchableOpacity
                            key={color}
                            style={[
                                styles.colorButton,
                                {
                                    backgroundColor: isSelected ? tintColor : `${borderColor}33`,
                                    borderColor: isSelected ? tintColor : borderColor,
                                },
                            ]}
                            onPress={() => handleToggleColor(color)}
                            activeOpacity={0.85}
                        >
                            <ThemedText
                                style={[
                                    styles.colorButtonText, 
                                    { 
                                        color: isSelected 
                                            ? (isDark ? '#000' : 'white') 
                                            : textColor 
                                    }
                                ]}
                            >
                                {color}
                            </ThemedText>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128, 128, 128, 0.1)',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    helperText: {
        fontSize: 13,
        fontStyle: 'italic',
    },
    shimmerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        paddingVertical: 8,
    },
    inputContainer: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    textInput: {
        fontSize: 16,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorButton: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1,
    },
    colorButtonText: {
        fontSize: 14,
        textTransform: 'capitalize',
    },
});

