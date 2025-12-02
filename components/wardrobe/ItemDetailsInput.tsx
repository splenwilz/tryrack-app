import { StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ShimmerPlaceholder } from '@/components/ShimmerPlaceholder';

interface ItemDetailsInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    showShimmer?: boolean;
}

export function ItemDetailsInput({
    value,
    onChange,
    placeholder = 'e.g., White Cotton T-Shirt',
    showShimmer = false,
}: ItemDetailsInputProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const borderColor = useThemeColor({}, 'tabIconDefault');

    if (showShimmer && !value) {
        return (
            <View style={[styles.section, { backgroundColor }]}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Item Details *
                </ThemedText>
                <ShimmerPlaceholder width="80%" height={48} />
            </View>
        );
    }

    return (
        <View style={[styles.section, { backgroundColor }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
                Item Details *
            </ThemedText>

            <View style={[styles.inputContainer, { borderColor }]}>
                <TextInput
                    style={[styles.textInput, { color: textColor }]}
                    placeholder={placeholder}
                    placeholderTextColor={borderColor}
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="sentences"
                />
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
    inputContainer: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    textInput: {
        fontSize: 16,
    },
});

