import { useState } from 'react';
import {
    Modal,
    View,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    StatusBar,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SimplePickerProps<T extends { code?: string; value?: string; name?: string; label?: string }> {
    visible: boolean;
    onClose: () => void;
    onSelect: (value: string) => void;
    options: readonly T[];
    selectedValue?: string;
    title: string;
    searchPlaceholder?: string;
    getDisplayValue: (option: T) => string;
    getOptionValue: (option: T) => string;
}

/**
 * Simple Picker Modal Component
 * 
 * A reusable modal picker for selecting from a list of options with search functionality
 * 
 * @see https://reactnative.dev/docs/modal - React Native Modal
 */
export function SimplePicker<T extends { code?: string; value?: string; name?: string; label?: string }>({
    visible,
    onClose,
    onSelect,
    options,
    selectedValue,
    title,
    searchPlaceholder = 'Search...',
    getDisplayValue,
    getOptionValue,
}: SimplePickerProps<T>) {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const borderColor = useThemeColor({}, 'tabIconDefault');
    const colorScheme = useColorScheme();
    const barStyle: 'light-content' | 'dark-content' =
        colorScheme === 'dark' ? 'light-content' : 'dark-content';

    const [searchQuery, setSearchQuery] = useState('');

    // Filter options based on search query
    const filteredOptions = options.filter((option) => {
        const displayValue = getDisplayValue(option).toLowerCase();
        return displayValue.includes(searchQuery.toLowerCase());
    });

    const handleSelect = (option: T) => {
        onSelect(getOptionValue(option));
        setSearchQuery('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
            onRequestClose={onClose}
        >
            <StatusBar barStyle={barStyle} />
            <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'bottom']}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: borderColor + '30' }]}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <IconSymbol name="xmark" size={24} color={textColor} />
                    </TouchableOpacity>
                    <ThemedText type="subtitle" style={styles.title}>
                        {title}
                    </ThemedText>
                    <View style={styles.closeButton} />
                </View>

                {/* Search Bar */}
                <View style={[styles.searchContainer, { backgroundColor: borderColor + '10' }]}>
                    <IconSymbol name="magnifyingglass" size={20} color={iconColor} />
                    <TextInput
                        style={[styles.searchInput, { color: textColor }]}
                        placeholder={searchPlaceholder}
                        placeholderTextColor={iconColor}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <IconSymbol name="xmark.circle.fill" size={20} color={iconColor} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Options List */}
                <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                    {filteredOptions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <ThemedText style={[styles.emptyText, { color: iconColor }]}>
                                No results found
                            </ThemedText>
                        </View>
                    ) : (
                        filteredOptions.map((option) => {
                            const optionValue = getOptionValue(option);
                            const displayValue = getDisplayValue(option);
                            const isSelected = selectedValue === optionValue;

                            return (
                                <TouchableOpacity
                                    key={optionValue}
                                    style={[
                                        styles.optionItem,
                                        { borderBottomColor: borderColor + '20' },
                                        isSelected && { backgroundColor: tintColor + '15' },
                                    ]}
                                    onPress={() => handleSelect(option)}
                                >
                                    <ThemedText
                                        style={[
                                            styles.optionText,
                                            { color: textColor },
                                            isSelected && { color: tintColor, fontWeight: '600' },
                                        ]}
                                    >
                                        {displayValue}
                                    </ThemedText>
                                    {isSelected && (
                                        <IconSymbol name="checkmark" size={20} color={tintColor} />
                                    )}
                                </TouchableOpacity>
                            );
                        })
                    )}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    optionsList: {
        flex: 1,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    optionText: {
        fontSize: 16,
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    },
});

