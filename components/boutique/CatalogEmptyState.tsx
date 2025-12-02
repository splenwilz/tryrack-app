import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface CatalogEmptyStateProps {
  title?: string;
  description?: string;
}

/**
 * CatalogEmptyState
 * Shared empty state for catalog list
 */
export const CatalogEmptyState: React.FC<CatalogEmptyStateProps> = ({
  title = 'No Products Found',
  description = 'No products match the selected filter.',
}) => {
  const iconColor = useThemeColor({}, 'icon');

  return (
    <View style={styles.emptyState}>
      <IconSymbol name="bag.fill" size={48} color={iconColor} />
      <ThemedText type="subtitle" style={styles.emptyStateTitle}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.emptyStateDescription, { color: iconColor }]}>
        {description}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});

