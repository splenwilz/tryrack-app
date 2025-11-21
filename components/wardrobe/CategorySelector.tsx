import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ShimmerPlaceholder } from '@/components/ShimmerPlaceholder';
import { CATEGORIES } from '@/constants/wardrobe';

interface CategorySelectorProps {
    value: string;
    onChange: (value: string) => void;
    showShimmer?: boolean;
}

export function CategorySelector({ value, onChange, showShimmer = false }: CategorySelectorProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const textColor = useThemeColor({}, 'text');
    const borderColor = useThemeColor({}, 'tabIconDefault');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    if (showShimmer && !value) {
        return <ShimmerPlaceholder width="60%" height={48} style={{ marginBottom: 12 }} />;
    }

    return (
        <View style={[styles.section, { backgroundColor }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
                Category *
            </ThemedText>

            <View style={[styles.inputContainer, { borderColor, marginBottom: 12 }]}>
                <TextInput
                    style={[styles.textInput, { color: textColor }]}
                    placeholder="e.g., denim jacket, cargo pants, sneakers"
                    placeholderTextColor={borderColor}
                    value={value}
                    onChangeText={onChange}
                />
            </View>

            <ThemedText style={[styles.helperText, { color: borderColor, marginBottom: 8 }]}>
                Or select a quick option:
            </ThemedText>

            <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.value}
                        style={[
                            styles.categoryButton,
                            {
                                backgroundColor: value === cat.value ? tintColor : `${borderColor}33`,
                                borderColor: value === cat.value ? tintColor : borderColor,
                            },
                        ]}
                        onPress={() => onChange(cat.value)}
                        activeOpacity={0.85}
                    >
                        <ThemedText
                            style={[
                                styles.categoryButtonText,
                                {
                                    color: value === cat.value
                                        ? (isDark ? '#000' : 'white')
                                        : textColor
                                },
                            ]}
                        >
                            {cat.label}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
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
    inputContainer: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    textInput: {
        fontSize: 16,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    categoryButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
    },
    categoryButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

