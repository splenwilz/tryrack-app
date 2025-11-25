/**
 * Try-On Detail Screen
 * Shows a single virtual try-on session with metadata and selected items
 *
 * @see https://reactnative.dev/docs/scrollview - React Native ScrollView
 */
import { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { CustomHeader } from '@/components/custom-header';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useGetVirtualTryOn } from '@/api/wardrobe/queries';

function formatDate(dateString?: string) {
  if (!dateString) return 'Unknown date';
  return new Date(dateString).toLocaleString();
}

export default function TryOnDetailScreen() {
  const { tryonId } = useLocalSearchParams<{ tryonId?: string }>();
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'card');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const [refreshing, setRefreshing] = useState(false);

  const {
    data: tryon,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetVirtualTryOn(tryonId, { enabled: Boolean(tryonId) });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleBackPress = () => {
    router.back();
  };

  if (!tryonId) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader title="Try-On Detail" showBackButton onBackPress={handleBackPress} />
        <View style={[styles.centered, { flex: 1 }]}>
          <ThemedText>No try-on ID provided.</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading && !tryon) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader title="Try-On Detail" showBackButton onBackPress={handleBackPress} />
        <View style={[styles.centered, { flex: 1 }]}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Loading try-on...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !tryon) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader title="Try-On Detail" showBackButton onBackPress={handleBackPress} />
        <View style={[styles.centered, { flex: 1 }]}>
          <ThemedText style={styles.errorText}>Failed to load try-on.</ThemedText>
          <ThemedText style={styles.errorSubText}>{error instanceof Error ? error.message : 'Unknown error'}</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!tryon) {
    return null;
  }

  const selectedItems = tryon.selected_items ?? [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader title="Try-On Detail" showBackButton onBackPress={handleBackPress} />
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing || isFetching} onRefresh={handleRefresh} tintColor={tintColor} />
        }
      >
        {/* Generated Image */}
        <View style={[styles.imageWrapper, { borderColor }]}>
          <Image source={{ uri: tryon.generated_image_uri }} style={styles.image} resizeMode="cover" />
        </View>

        {/* Metadata */}
        <View style={[styles.section, { backgroundColor: cardColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Session Info
          </ThemedText>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Created:</ThemedText>
            <ThemedText style={styles.infoValue}>{formatDate(tryon.created_at)}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Background:</ThemedText>
            <ThemedText style={[styles.infoTag, { color: tryon.use_clean_background ? '#2E7D32' : '#B26A00' }]}>
              {tryon.use_clean_background ? 'Clean Background' : 'Original Background'}
            </ThemedText>
          </View>
          <View style={styles.infoColumn}>
            <ThemedText style={styles.infoLabel}>Custom Instructions</ThemedText>
            <ThemedText style={styles.infoValue}>
              {tryon.custom_instructions?.trim() || 'No custom instructions provided.'}
            </ThemedText>
          </View>
        </View>

        {/* Selected Items */}
        <View style={[styles.section, { backgroundColor: cardColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Selected Items ({selectedItems.length})
          </ThemedText>
          {selectedItems.length === 0 ? (
            <ThemedText style={styles.infoValue}>No wardrobe items linked to this try-on.</ThemedText>
          ) : (
            selectedItems.map((item) => (
              <View key={`${item.id}-${item.title}`} style={[styles.itemCard, { borderColor }]}>
                <View style={styles.itemHeader}>
                  <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                  <ThemedText style={styles.itemCategory}>{item.category}</ThemedText>
                </View>
                {item.colors?.length > 0 && (
                  <View style={styles.chipRow}>
                    {item.colors.map((color) => (
                      <View key={color} style={[styles.chip, { borderColor: tintColor }]}>
                        <ThemedText style={[styles.chipText, { color: tintColor }]}>{color}</ThemedText>
                      </View>
                    ))}
                  </View>
                )}
                {item.tags?.length > 0 && (
                  <View style={styles.tagRow}>
                    {item.tags.map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <ThemedText style={styles.tagText}>{tag}</ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageWrapper: {
    width: '100%',
    height: 420,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginTop: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  section: {
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoColumn: {
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 15,
    marginTop: 4,
  },
  infoTag: {
    fontWeight: '600',
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  itemHeader: {
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemCategory: {
    fontSize: 13,
    opacity: 0.7,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
  },
  loadingText: {
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorSubText: {
    opacity: 0.7,
    textAlign: 'center',
  },
});

