import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ShimmerPlaceholder } from '@/components/ShimmerPlaceholder';

interface TagInputProps {
    tags: string[];
    onAddTag: (tag: string) => void;
    onRemoveTag: (tag: string) => void;
    showShimmer?: boolean;
}

export function TagInput({ tags, onAddTag, onRemoveTag, showShimmer = false }: TagInputProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const textColor = useThemeColor({}, 'text');
    const borderColor = useThemeColor({}, 'tabIconDefault');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const buttonIconColor = isDark ? '#000' : 'white';
    const [inputValue, setInputValue] = useState('');

    const handleAddTag = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onAddTag(trimmed);
            setInputValue('');
        }
    };

    if (showShimmer && tags.length === 0) {
        return (
            <View style={[styles.section, { backgroundColor }]}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Tags
                </ThemedText>
                <View style={styles.shimmerRow}>
                    <ShimmerPlaceholder width={60} height={30} borderRadius={15} />
                    <ShimmerPlaceholder width={80} height={30} borderRadius={15} style={{ marginLeft: 8 }} />
                    <ShimmerPlaceholder width={70} height={30} borderRadius={15} style={{ marginLeft: 8 }} />
                    <ShimmerPlaceholder width={65} height={30} borderRadius={15} style={{ marginLeft: 8 }} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.section, { backgroundColor }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
                Tags
            </ThemedText>

            <View style={[styles.tagInputContainer, { borderColor }]}>
                <TextInput
                    style={[styles.tagInput, { color: textColor }]}
                    placeholder="Add a tag (e.g., casual, formal, summer)"
                    placeholderTextColor={borderColor}
                    value={inputValue}
                    onChangeText={setInputValue}
                    onSubmitEditing={handleAddTag}
                />
                <TouchableOpacity
                    style={[styles.addTagButton, { backgroundColor: tintColor }]}
                    onPress={handleAddTag}
                    disabled={!inputValue.trim()}
                >
                    <IconSymbol name="plus" size={16} color={buttonIconColor} />
                </TouchableOpacity>
            </View>

            {tags.length > 0 && (
                <View style={styles.tagsContainer}>
                    {tags.map((tag) => (
                        <View
                            key={tag}
                            style={[styles.tagChip, { backgroundColor: `${tintColor}33`, borderColor: tintColor }]}
                        >
                            <ThemedText style={[styles.tagText, { color: tintColor }]}>{tag}</ThemedText>
                            <TouchableOpacity onPress={() => onRemoveTag(tag)}>
                                <IconSymbol name="xmark.circle.fill" size={16} color={tintColor} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}
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
    shimmerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        paddingVertical: 8,
    },
    tagInputContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 12,
        gap: 8,
    },
    tagInput: {
        flex: 1,
        fontSize: 14,
    },
    addTagButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        gap: 6,
    },
    tagText: {
        fontSize: 14,
    },
});

