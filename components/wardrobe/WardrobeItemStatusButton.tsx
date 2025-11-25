import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

type StatusType = 'clean' | 'dirty' | 'worn';

interface WardrobeItemStatusButtonProps {
    status: StatusType;
    isUpdating: boolean;
    onPress: () => void;
    disabled?: boolean;
    tintColor?: string;
    borderColor?: string;
}

const STATUS_CONFIG: Record<StatusType, { icon: string; label: string; color: string }> = {
    worn: {
        icon: 'tshirt.fill',
        label: 'Mark as Worn Today',
        color: '#007AFF', // Will use tintColor from theme
    },
    clean: {
        icon: 'checkmark.circle.fill',
        label: 'Mark as Clean',
        color: '#007AFF', // Will use tintColor from theme
    },
    dirty: {
        icon: 'exclamationmark.circle.fill',
        label: 'Mark as Dirty',
        color: '#FF3B30',
    },
};

/**
 * Reusable button component for wardrobe item status updates
 * 
 * @param status - The status type (clean, dirty, or worn)
 * @param isUpdating - Whether the status update is in progress
 * @param onPress - Callback when button is pressed
 * @param disabled - Whether the button is disabled
 * @see https://reactnative.dev/docs/touchableopacity - React Native TouchableOpacity
 */
export function WardrobeItemStatusButton({
    status,
    isUpdating,
    onPress,
    disabled = false,
    tintColor = '#007AFF',
    borderColor,
}: WardrobeItemStatusButtonProps) {
    const config = STATUS_CONFIG[status];
    const buttonColor = status === 'dirty' ? config.color : tintColor;
    const buttonBorderColor = borderColor || buttonColor;

    return (
        <TouchableOpacity
            style={[
                styles.secondaryButton,
                { borderColor: buttonBorderColor },
                (isUpdating || disabled) && styles.secondaryButtonDisabled,
            ]}
            onPress={onPress}
            disabled={isUpdating || disabled}
        >
            {isUpdating ? (
                <ActivityIndicator size="small" color={buttonColor} />
            ) : (
                <IconSymbol name={config.icon} size={18} color={buttonColor} />
            )}
            <ThemedText
                style={[
                    styles.secondaryButtonText,
                    { color: buttonColor },
                    (isUpdating || disabled) && styles.secondaryButtonTextDisabled,
                ]}
            >
                {isUpdating ? 'Updating...' : config.label}
            </ThemedText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        gap: 8,
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    secondaryButtonDisabled: {
        opacity: 0.5,
    },
    secondaryButtonTextDisabled: {
        opacity: 0.7,
    },
});

