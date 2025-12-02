/**
 * Location Filter Component
 * 
 * Allows users to enable/disable location-based filtering and set radius
 * 
 * @example
 * ```tsx
 * <LocationFilter
 *   enabled={locationFilter.enabled}
 *   radiusKm={locationFilter.radiusKm}
 *   onToggle={(enabled) => setLocationFilter(prev => ({ ...prev, enabled }))}
 *   onRadiusChange={(radius) => setLocationFilter(prev => ({ ...prev, radiusKm: radius }))}
 * />
 * ```
 */

import { View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface LocationFilterProps {
    /**
     * Whether location filter is enabled
     */
    enabled: boolean;
    /**
     * Current radius in kilometers
     */
    radiusKm: number;
    /**
     * Callback when filter is toggled
     */
    onToggle: (enabled: boolean) => void;
    /**
     * Callback when radius changes
     */
    onRadiusChange: (radius: number) => void;
    /**
     * Whether location permission is granted
     */
    hasPermission?: boolean;
    /**
     * Callback to request location permission
     */
    onRequestPermission?: () => void;
}

const RADIUS_OPTIONS = [
    { label: '1 km', value: 1 },
    { label: '5 km', value: 5 },
    { label: '10 km', value: 10 },
    { label: '25 km', value: 25 },
    { label: '50 km', value: 50 },
    { label: 'All', value: 0 }, // 0 means no radius limit
];

export function LocationFilter({
    enabled,
    radiusKm,
    onToggle,
    onRadiusChange,
    hasPermission = false,
    onRequestPermission,
}: LocationFilterProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const textColor = useThemeColor({}, 'text');
    const cardBg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');
    const borderColor = useThemeColor({}, 'tabIconDefault');

    const handleToggle = (value: boolean) => {
        if (value && !hasPermission && onRequestPermission) {
            // Request permission when enabling
            onRequestPermission();
        }
        onToggle(value);
    };

    return (
        <View style={[styles.container, { backgroundColor: cardBg, borderColor: borderColor }]}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <IconSymbol name="location.fill" size={20} color={tintColor} />
                    <ThemedText style={[styles.title, { color: textColor }]}>
                        Nearby Boutiques
                    </ThemedText>
                </View>
                <Switch
                    value={enabled && hasPermission}
                    onValueChange={handleToggle}
                    trackColor={{ false: iconColor + '40', true: tintColor + '80' }}
                    thumbColor={enabled && hasPermission ? tintColor : '#f4f3f4'}
                />
            </View>

            {enabled && hasPermission && (
                <View style={styles.radiusContainer}>
                    <ThemedText style={[styles.radiusLabel, { color: iconColor }]}>
                        Within:
                    </ThemedText>
                    <View style={styles.radiusOptions}>
                        {RADIUS_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.radiusChip,
                                    {
                                        backgroundColor:
                                            radiusKm === option.value ? tintColor : backgroundColor,
                                        borderColor: radiusKm === option.value ? tintColor : borderColor,
                                    },
                                ]}
                                onPress={() => onRadiusChange(option.value)}
                            >
                                <ThemedText
                                    style={[
                                        styles.radiusChipText,
                                        {
                                            color:
                                                radiusKm === option.value
                                                    ? (enabled ? '#fff' : textColor)
                                                    : textColor,
                                        },
                                    ]}
                                >
                                    {option.label}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {enabled && !hasPermission && (
                <TouchableOpacity
                    style={[styles.permissionButton, { backgroundColor: tintColor + '20' }]}
                    onPress={onRequestPermission}
                >
                    <IconSymbol name="location.fill" size={16} color={tintColor} />
                    <ThemedText style={[styles.permissionText, { color: tintColor }]}>
                        Enable Location Access
                    </ThemedText>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    radiusContainer: {
        marginTop: 12,
    },
    radiusLabel: {
        fontSize: 14,
        marginBottom: 8,
    },
    radiusOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    radiusChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
    },
    radiusChipText: {
        fontSize: 12,
        fontWeight: '500',
    },
    permissionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
        marginTop: 8,
    },
    permissionText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

