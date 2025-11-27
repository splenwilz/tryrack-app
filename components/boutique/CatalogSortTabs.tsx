import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SortOption {
  key: string;
  label: string;
}

interface CatalogSortTabsProps {
  options: SortOption[];
  value: string;
  onChange: (key: string) => void;
  containerStyle?: ViewStyle;
}

/**
 * CatalogSortTabs
 * Displays horizontally scrollable sort pills
 */
export const CatalogSortTabs: React.FC<CatalogSortTabsProps> = ({
  options,
  value,
  onChange,
  containerStyle,
}) => {
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'tabIconDefault');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.sortContainer, containerStyle]}
    >
      {options.map((option) => {
        const isSelected = value === option.key;
        return (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.sortTab,
              { backgroundColor: isSelected ? tintColor : backgroundColor, borderColor },
              isSelected && styles.activeSortTab,
            ]}
            onPress={() => onChange(option.key)}
            activeOpacity={0.7}
          >
            <ThemedText
              style={[
                styles.sortText,
                { color: isSelected ? (isDark ? '#000' : 'white') : iconColor },
              ]}
            >
              {option.label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sortContainer: {
    paddingRight: 20,
  },
  sortTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  activeSortTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

