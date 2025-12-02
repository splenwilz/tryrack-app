import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PROCESSING_STAGE_CONFIG, PROCESSING_STAGE_ICONS } from '@/constants/wardrobe';
import type { ProcessingStage } from '@/types/wardrobe';

interface ProcessingIndicatorProps {
    stage: ProcessingStage;
}

export function ProcessingIndicator({ stage }: ProcessingIndicatorProps) {
    const tintColor = useThemeColor({}, 'tint');

    if (!stage) return null;

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <ThemedText style={styles.icon}>
                    {PROCESSING_STAGE_ICONS[stage]}
                </ThemedText>
            </View>
            <ThemedText style={[styles.message, { color: tintColor }]}>
                {PROCESSING_STAGE_CONFIG[stage].message}
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        alignItems: 'center',
        gap: 8,
    },
    iconContainer: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 32,
    },
    message: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});

