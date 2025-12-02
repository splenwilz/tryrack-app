/**
 * Try-On Options Section Component
 * Background toggle and custom prompt editor
 *
 * @see https://reactnative.dev/docs/textinput - React Native TextInput
 */

import { View, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { mightAddItems } from '@/utils/virtual-tryon';

interface VirtualTryOnOptionsProps {
    useCleanBackground: boolean;
    customPrompt: string;
    showPromptEditor: boolean;
    onToggleBackground: () => void;
    onTogglePromptEditor: () => void;
    onCustomPromptChange: (text: string) => void;
    hasImageQualityWarning?: boolean; // Warning when more than 2 items selected
}

export function VirtualTryOnOptions({
    useCleanBackground,
    customPrompt,
    showPromptEditor,
    onToggleBackground,
    onTogglePromptEditor,
    onCustomPromptChange,
    hasImageQualityWarning = false,
}: VirtualTryOnOptionsProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const textColor = useThemeColor({}, 'text');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <>
            {/* Background Toggle */}
            <View style={styles.container}>
                <View style={styles.toggleRow}>
                    <View style={styles.toggleInfo}>
                        <ThemedText style={styles.toggleLabel}>Clean Background</ThemedText>
                        <ThemedText style={[styles.toggleSubtext, { color: '#999' }]}>
                            {useCleanBackground ? 'Professional studio backdrop' : 'Keep your original background'}
                        </ThemedText>
                    </View>
                    <TouchableOpacity
                        style={[styles.toggle, useCleanBackground && { backgroundColor: tintColor }]}
                        onPress={onToggleBackground}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.toggleThumb, useCleanBackground && styles.toggleThumbActive]} />
                    </TouchableOpacity>
                </View>
                {useCleanBackground && hasImageQualityWarning && (
                    <View style={[styles.warningContainer, { backgroundColor: `${tintColor}20`, borderColor: tintColor, marginTop: 8 }]}>
                        <IconSymbol name="exclamationmark.triangle.fill" size={16} color={tintColor} />
                        <ThemedText style={[styles.warningText, { color: tintColor }]}>
                            Clean background with multiple items may not preserve your image quality.
                        </ThemedText>
                    </View>
                )}
            </View>

            {/* Custom Prompt Editor */}
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.toggleRow}
                    onPress={onTogglePromptEditor}
                    activeOpacity={0.7}
                >
                    <View style={styles.toggleInfo}>
                        <ThemedText style={styles.toggleLabel}>Custom Instructions (Advanced)</ThemedText>
                        <ThemedText style={[styles.toggleSubtext, { color: '#999' }]}>
                            {showPromptEditor ? 'Tap to hide editor' : 'Tap to customize AI prompt'}
                        </ThemedText>
                    </View>
                    <IconSymbol
                        name={showPromptEditor ? "chevron.up" : "chevron.down"}
                        size={20}
                        color={iconColor}
                    />
                </TouchableOpacity>

                {showPromptEditor && (
                    <View style={[styles.promptEditorContainer, { backgroundColor }]}>
                        <ThemedText style={[styles.promptEditorLabel, { color: '#999', marginBottom: 8 }]}>
                            Customize how the AI generates your try-on. Leave empty to use default.
                        </ThemedText>
                        <TextInput
                            style={[styles.promptEditor, { backgroundColor, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: textColor }]}
                            placeholder="Example: Make the outfit look casual and relaxed, keep my natural pose..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={6}
                            value={customPrompt}
                            onChangeText={onCustomPromptChange}
                            textAlignVertical="top"
                        />
                        {mightAddItems(customPrompt) && (
                            <View style={[styles.warningContainer, { backgroundColor: `${tintColor}20`, borderColor: tintColor }]}>
                                <IconSymbol name="exclamationmark.triangle.fill" size={16} color={tintColor} />
                                <ThemedText style={[styles.warningText, { color: tintColor }]}>
                                    {hasImageQualityWarning
                                        ? 'Your instructions may request additional items. This will not preserve your image.'
                                        : 'Your instructions may request additional items. This may not preserve your image if too many items are added.'}
                                </ThemedText>
                            </View>
                        )}
                        <ThemedText style={[styles.promptEditorHint, { color: '#999', fontSize: 12, marginTop: 8 }]}>
                            💡 Tip: Describe the style, pose, or look you want. The AI will preserve your face and body shape.
                        </ThemedText>
                    </View>
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    toggleInfo: {
        flex: 1,
        marginRight: 16,
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    toggleSubtext: {
        fontSize: 13,
    },
    toggle: {
        width: 50,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#ccc',
        padding: 2,
        justifyContent: 'center',
    },
    toggleThumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleThumbActive: {
        alignSelf: 'flex-end',
    },
    promptEditorContainer: {
        marginTop: 12,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    promptEditorLabel: {
        fontSize: 14,
        marginBottom: 8,
    },
    promptEditor: {
        minHeight: 120,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        fontSize: 14,
        textAlignVertical: 'top',
    },
    promptEditorHint: {
        fontSize: 12,
        marginTop: 8,
        fontStyle: 'italic',
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 12,
        gap: 8,
    },
    warningText: {
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
        lineHeight: 16,
    },
});

