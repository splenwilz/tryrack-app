/**
 * Distance Badge Component
 * 
 * Displays distance to a location in a compact badge format
 * 
 * @example
 * ```tsx
 * <DistanceBadge distance={2.5} unit="km" />
 * // Displays: "2.5 km"
 * ```
 */

import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { DistanceUnit } from '@/types/location';

interface DistanceBadgeProps {
    /**
     * Distance value
     */
    distance?: number;
    /**
     * Distance unit
     */
    unit?: DistanceUnit;
    /**
     * Formatted distance string (if already formatted)
     */
    formattedDistance?: string;
    /**
     * Show location icon
     */
    showIcon?: boolean;
    /**
     * Size variant
     */
    size?: 'small' | 'medium' | 'large';
}

export function DistanceBadge({
    distance,
    unit = 'km',
    formattedDistance,
    showIcon = true,
    size = 'medium',
}: DistanceBadgeProps) {
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');

    // Format distance if not already formatted
    let displayText: string;
    if (formattedDistance) {
        displayText = formattedDistance;
    } else if (distance !== undefined) {
        if (distance < 1) {
            // Show in meters
            const meters = Math.round(distance * 1000);
            displayText = `${meters} m`;
        } else {
            displayText = `${distance.toFixed(1)} ${unit}`;
        }
    } else {
        return null;
    }

    const fontSize = size === 'small' ? 11 : size === 'large' ? 14 : 12;
    const iconSize = size === 'small' ? 12 : size === 'large' ? 16 : 14;
    const padding = size === 'small' ? 4 : size === 'large' ? 8 : 6;

    return (
        <View style={[styles.container, { paddingHorizontal: padding, paddingVertical: padding / 2 }]}>
            {showIcon && (
                <IconSymbol
                    name="location.fill"
                    size={iconSize}
                    color={tintColor}
                    style={styles.icon}
                />
            )}
            <ThemedText style={[styles.text, { fontSize, color: iconColor }]}>
                {displayText}
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
    icon: {
        marginRight: 4,
    },
    text: {
        fontWeight: '500',
    },
});

