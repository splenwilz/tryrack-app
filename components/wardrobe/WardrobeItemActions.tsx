import { View, TouchableOpacity, StyleSheet, ActivityIndicator, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { WardrobeItemStatusButton } from './WardrobeItemStatusButton';
import type { WardrobeItemResponse } from '@/api/wardrobe/types';

type StatusType = 'clean' | 'dirty' | 'worn';

interface WardrobeItemActionsProps {
    item: WardrobeItemResponse;
    updatingStatus: StatusType | null;
    isDeleting?: boolean;
    onTryVirtually: () => void;
    onMarkAsWorn: () => void;
    onMarkAsClean: () => void;
    onMarkAsDirty: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

/**
 * Displays all action buttons for a wardrobe item
 * 
 * @param item - The wardrobe item
 * @param updatingStatus - Currently updating status (if any)
 * @param onTryVirtually - Callback for try virtually action
 * @param onMarkAsWorn - Callback for mark as worn action
 * @param onMarkAsClean - Callback for mark as clean action
 * @param onMarkAsDirty - Callback for mark as dirty action
 * @param onEdit - Callback for edit action
 * @param onDelete - Callback for delete action
 * @see https://reactnative.dev/docs/touchableopacity - React Native TouchableOpacity
 */
export function WardrobeItemActions({
    item,
    updatingStatus,
    isDeleting = false,
    onTryVirtually,
    onMarkAsWorn,
    onMarkAsClean,
    onMarkAsDirty,
    onEdit,
    onDelete,
}: WardrobeItemActionsProps) {
    const tintColor = useThemeColor({}, 'tint');
    const borderColor = useThemeColor({}, 'tabIconDefault');
    const textColor = useThemeColor({}, 'text');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const renderStatusButtons = () => {
        if (item.status === 'clean') {
            return (
                <>
                    <WardrobeItemStatusButton
                        status="worn"
                        isUpdating={updatingStatus === 'worn'}
                        onPress={onMarkAsWorn}
                        tintColor={tintColor}
                        borderColor={borderColor}
                    />
                    <WardrobeItemStatusButton
                        status="dirty"
                        isUpdating={updatingStatus === 'dirty'}
                        onPress={onMarkAsDirty}
                        tintColor={tintColor}
                        borderColor={borderColor}
                    />
                </>
            );
        }

        if (item.status === 'worn') {
            return (
                <>
                    <WardrobeItemStatusButton
                        status="clean"
                        isUpdating={updatingStatus === 'clean'}
                        onPress={onMarkAsClean}
                        tintColor={tintColor}
                        borderColor={borderColor}
                    />
                    <WardrobeItemStatusButton
                        status="dirty"
                        isUpdating={updatingStatus === 'dirty'}
                        onPress={onMarkAsDirty}
                        tintColor={tintColor}
                        borderColor={borderColor}
                    />
                </>
            );
        }

        if (item.status === 'dirty') {
            return (
                <WardrobeItemStatusButton
                    status="clean"
                    isUpdating={updatingStatus === 'clean'}
                    onPress={onMarkAsClean}
                    tintColor={tintColor}
                    borderColor={borderColor}
                />
            );
        }

        return null;
    };

    return (
        <View style={styles.actionsSection}>
            <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: tintColor }]}
                onPress={onTryVirtually}
            >
                <IconSymbol name="camera.fill" size={20} color={isDark ? '#000' : 'white'} />
                <ThemedText style={[styles.primaryButtonText, { color: isDark ? '#000' : 'white' }]}>Try Virtually</ThemedText>
            </TouchableOpacity>

            <View style={styles.secondaryActions}>{renderStatusButtons()}</View>

            <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                    style={[styles.actionButton, { borderColor }]}
                    onPress={onEdit}
                >
                    <IconSymbol name="pencil" size={18} color={textColor} />
                    <ThemedText style={[styles.actionButtonText, { color: textColor }]}>Edit Item</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
                    onPress={onDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                        <ActivityIndicator size="small" color="#FF3B30" />
                    ) : (
                        <IconSymbol name="trash" size={18} color="#FF3B30" />
                    )}
                    <ThemedText style={[styles.actionButtonText, styles.deleteButtonText, isDeleting && styles.deleteButtonTextDisabled]}>
                        {isDeleting ? 'Deleting...' : 'Delete Item'}
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    actionsSection: {
        marginBottom: 20,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginBottom: 12,
        gap: 8,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryActions: {
        marginBottom: 12,
        gap: 8,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 8,
        backgroundColor: 'transparent',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    deleteButton: {
        borderColor: '#FF3B30',
        backgroundColor: 'rgba(255, 59, 48, 0.08)',
    },
    deleteButtonText: {
        color: '#FF3B30',
    },
    deleteButtonDisabled: {
        opacity: 0.5,
    },
    deleteButtonTextDisabled: {
        opacity: 0.7,
    },
});

