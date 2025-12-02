import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface CatalogFilterBarProps {
  hasActiveFilters: boolean;
  activeFilterCount: number;
  onFilterPress: () => void;
  onClearFilters: () => void;
}

/**
 * CatalogFilterBar
 * Reusable filter bar for boutique catalog screen
 */
export const CatalogFilterBar: React.FC<CatalogFilterBarProps> = ({
  hasActiveFilters,
  activeFilterCount,
  onFilterPress,
  onClearFilters,
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'tabIconDefault');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.filterBar}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          { backgroundColor, borderColor },
          hasActiveFilters && { borderColor: tintColor, borderWidth: 2 },
        ]}
        onPress={onFilterPress}
        activeOpacity={0.7}
      >
        <IconSymbol
          name="slider.horizontal.3"
          size={18}
          color={hasActiveFilters ? tintColor : borderColor}
        />
        <ThemedText
          style={[
            styles.filterButtonText,
            { color: hasActiveFilters ? tintColor : textColor },
          ]}
        >
          Filters
        </ThemedText>
        {hasActiveFilters && (
          <View style={[styles.filterBadge, { backgroundColor: tintColor }]}>
            <ThemedText style={styles.filterBadgeText}>{activeFilterCount}</ThemedText>
          </View>
        )}
      </TouchableOpacity>

      {hasActiveFilters && (
        <TouchableOpacity
          style={styles.clearFiltersButton}
          onPress={onClearFilters}
          activeOpacity={0.7}
        >
          <ThemedText style={[styles.clearFiltersText, { color: tintColor }]}>
            Clear
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  clearFiltersButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

