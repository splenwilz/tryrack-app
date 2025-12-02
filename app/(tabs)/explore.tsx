import React from 'react';
import { ScrollView, StyleSheet, View, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { CustomHeader } from '@/components/custom-header';
import { usePublicLooks } from '@/api/looks/queries';
import { LookCarousel } from '@/components/boutique/LookCarousel';
import { useShopProducts } from '@/api/shop/queries';
import { useLocation } from '@/hooks/use-location';
import { mapShopProductToBoutiqueItem, type BoutiqueItem } from '@/utils/shop';
import { groupProductsByCategory, getCategoryDisplayName } from '@/utils/shop-categories';
// Boutique Item Card Component
const BoutiqueItemCard: React.FC<{ item: BoutiqueItem }> = ({ item }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleTryOn = () => {
    // Prepare boutique item data for virtual try-on
    const boutiqueItem = {
      id: item.id,
      title: item.title,
      brand: item.brand,
      category: item.category,
      imageUrl: item.imageUrl,
      price: item.price,
      colors: item.colors || [],
      tags: item.tags || [],
      boutique: {
        id: 'shop',
        name: item.boutique.name,
        logo: item.boutique.logo,
      },
      arAvailable: item.arAvailable,
    };

    // Navigate to virtual try-on with product data
    router.push({
      pathname: '/wardrobe/virtual_tryon',
      params: {
        itemType: 'boutique',
        itemData: JSON.stringify(boutiqueItem),
      },
    });
  };

  const handleViewDetails = () => {
    router.push({
      pathname: '/catalog/product_detail',
      params: { productId: item.id, source: 'shop' },
    });
  };

  return (
    <TouchableOpacity style={[styles.itemCard, { backgroundColor }]} onPress={handleViewDetails}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />

      {/* Boutique Logo */}
      <View style={styles.boutiqueLogo}>
        <Image source={{ uri: item.boutique.logo }} style={styles.logoImage} />
      </View>

      <View style={styles.itemDetails}>
        <ThemedText style={styles.brandName}>{item.brand}</ThemedText>
        <ThemedText style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.price}>₦{item.price.toLocaleString()}</ThemedText>

        {/* Try-On Button */}
        <TouchableOpacity
          style={[styles.tryOnButton, { backgroundColor: tintColor }]}
          onPress={handleTryOn}
        >
          <IconSymbol name="plus" size={16} color={isDark ? '#000' : 'white'} />
          <ThemedText style={[styles.tryOnButtonText, { color: isDark ? '#000' : 'white' }]}>
            Try Virtually
          </ThemedText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// Featured Boutique Section
const FeaturedBoutique: React.FC<{ item: BoutiqueItem }> = ({ item }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity style={[styles.featuredCard, { backgroundColor }]}>
      <Image source={{ uri: item.imageUrl }} style={styles.featuredImage} />
      <View style={styles.featuredOverlay}>
        <View style={styles.featuredContent}>
          <ThemedText style={styles.featuredTitle}>Featured Boutique</ThemedText>
          <ThemedText style={styles.featuredBoutique}>{item.boutique.name}</ThemedText>
          <ThemedText style={styles.featuredItem}>{item.title}</ThemedText>
          <TouchableOpacity style={[styles.featuredButton, { backgroundColor: tintColor }]}>
            <ThemedText style={[styles.featuredButtonText, { color: isDark ? '#000' : 'white' }]}>Explore Collection</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Radius Selector Component
const RadiusSelector: React.FC<{
  selectedRadius: number | null;
  onRadiusChange: (radius: number | null) => void;
}> = ({ selectedRadius, onRadiusChange }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const borderColor = useThemeColor({ light: 'rgba(0,0,0,0.1)', dark: 'rgba(255,255,255,0.1)' }, 'background');

  const radiusOptions = [
    { label: 'All', value: null },
    { label: '10 miles', value: 10 },
    { label: '25 miles', value: 25 },
    { label: '50 miles', value: 50 },
    { label: '100 miles', value: 100 },
    { label: '200 miles', value: 200 },
  ];

  return (
    <View style={[styles.radiusContainer, { backgroundColor, borderBottomColor: borderColor }]}>
      <ThemedText style={styles.radiusLabel}>Search Radius:</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.radiusOptions}
      >
        {radiusOptions.map((option) => (
          <TouchableOpacity
            key={option.value ?? 'all'}
            style={[
              styles.radiusOption,
              {
                backgroundColor: selectedRadius === option.value ? tintColor : 'transparent',
                borderColor: tintColor,
              },
            ]}
            onPress={() => onRadiusChange(option.value)}
          >
            <ThemedText
              style={[
                styles.radiusOptionText,
                {
                  color: selectedRadius === option.value
                    ? (isDark ? '#000' : 'white')
                    : iconColor,
                },
              ]}
            >
              {option.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Search and Filter Component
const SearchAndFilter: React.FC = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const iconColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: 'rgba(0,0,0,0.1)', dark: 'rgba(255,255,255,0.1)' }, 'background');
  const searchBgColor = useThemeColor({ light: 'rgba(0,0,0,0.05)', dark: 'rgba(255,255,255,0.05)' }, 'background');
  const filterBgColor = useThemeColor({ light: 'rgba(0,0,0,0.05)', dark: 'rgba(255,255,255,0.05)' }, 'background');

  return (
    <View style={[styles.searchContainer, { backgroundColor, borderBottomColor: borderColor }]}>
      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: searchBgColor }]}>
        <IconSymbol name="magnifyingglass" size={20} color={iconColor} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search boutiques, brands, styles..."
          placeholderTextColor={iconColor}
        />
      </View>

      {/* Filter Buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: filterBgColor }]}>
          <ThemedText style={styles.filterButtonText}>All</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: filterBgColor }]}>
          <ThemedText style={styles.filterButtonText}>Dresses</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: filterBgColor }]}>
          <ThemedText style={styles.filterButtonText}>Outerwear</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: filterBgColor }]}>
          <ThemedText style={styles.filterButtonText}>Shoes</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: filterBgColor }]}>
          <ThemedText style={styles.filterButtonText}>Accessories</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

/**
 * Shop Screen Component
 * Dedicated space for users to browse boutique collections and try items in AR/AI
 * Based on blueprint requirements for boutique discovery and try-on functionality
 */
export default function ShopScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Radius selector state
  const [selectedRadius, setSelectedRadius] = React.useState<number | null>(100);

  // Get user location for location-based product recommendations (optional)
  const { location } = useLocation({ autoRequest: false }); // Don't auto-request

  // Fetch looks from API
  const { data: apiLooks = [], refetch: refetchLooks, isFetching: isFetchingLooks } = usePublicLooks({ featured_only: false });

  // Build shop products query options - only include lat/long if both are available
  const shopProductsOptions = React.useMemo(() => {
    const options: Parameters<typeof useShopProducts>[0] = {
      radius_miles: selectedRadius,
      limit: 50,
    };

    // Only include lat/long if both are available
    if (location?.latitude != null && location?.longitude != null) {
      options.latitude = location.latitude;
      options.longitude = location.longitude;
    }

    return options;
  }, [location?.latitude, location?.longitude, selectedRadius]);

  // Fetch all shop products
  const {
    data: shopData,
    isLoading: isLoadingProducts,
    error: shopError,
    refetch: refetchProducts,
    isFetching: isFetchingProducts
  } = useShopProducts(shopProductsOptions);

  // Handle refresh
  const [refreshing, setRefreshing] = React.useState(false);
  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchProducts(), refetchLooks()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchProducts, refetchLooks]);

  // Map shop products to BoutiqueItem format
  const allProducts = React.useMemo(() => {
    if (!shopData?.items) return [];
    return shopData.items.map(mapShopProductToBoutiqueItem);
  }, [shopData]);

  // Log categories for debugging
  React.useEffect(() => {
    if (allProducts.length > 0) {
      const categories = allProducts.map(p => p.category);
      const uniqueCategories = [...new Set(categories)];
      console.log('[Shop Screen] Total products:', allProducts.length);
      console.log('[Shop Screen] Categories found:', uniqueCategories);
      console.log('[Shop Screen] Products by category:',
        uniqueCategories.map(cat => ({
          category: cat,
          count: allProducts.filter(p => p.category === cat).length
        }))
      );
    }
  }, [allProducts]);

  // Dynamically group products by category
  const { groups: categoryGroups, sortedCategories } = React.useMemo(() => {
    return groupProductsByCategory(allProducts);
  }, [allProducts]);

  // Featured item (first product)
  const featuredItem = allProducts[0] || null;

  // Handler functions for header actions
  const handleSearchPress = () => {
    console.log('Search pressed - implement search functionality');
    // TODO: Navigate to advanced search screen
  };

  const handleNotificationPress = () => {
    console.log('Notifications pressed - implement notification screen');
    // TODO: Navigate to notifications screen
  };

  // Handler for navigating to shop category view
  const handleViewAll = (category: string) => {
    router.push({
      pathname: '/shop/category',
      params: {
        category,
        radius_miles: selectedRadius?.toString() || '100',
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Custom Header */}
      <CustomHeader
        title="Shop"
        onSearchPress={handleSearchPress}
        onNotificationPress={handleNotificationPress}
        notificationCount={2}
      />

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isFetchingProducts || isFetchingLooks}
            onRefresh={handleRefresh}
            tintColor={tintColor}
          />
        }
      >
        {/* Search and Filter Section */}
        <SearchAndFilter />

        {/* Radius Selector */}
        <RadiusSelector
          selectedRadius={selectedRadius}
          onRadiusChange={setSelectedRadius}
        />

        {/* Error State */}
        {shopError && (
          <View style={styles.errorContainer}>
            <ThemedText style={[styles.errorText, { color: iconColor }]}>
              Failed to load products. {shopError instanceof Error ? shopError.message : 'Please try again.'}
            </ThemedText>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: tintColor }]}
              onPress={() => refetchProducts()}
            >
              <ThemedText style={[styles.retryButtonText, { color: isDark ? '#000' : 'white' }]}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Featured Boutique */}
        {featuredItem && <FeaturedBoutique item={featuredItem} />}

        {/* Shop by Look Section */}
        {apiLooks.length > 0 && (
          <LookCarousel
            title="Shop by Look"
            items={apiLooks}
            onViewAll={() => router.push('/shop/looks')}
          />
        )}

        {/* Dynamically render category sections */}
        {sortedCategories.map((categoryKey) => {
          const categoryProducts = categoryGroups[categoryKey];
          if (!categoryProducts || categoryProducts.length === 0) return null;

          const displayName = getCategoryDisplayName(categoryKey);
          // Use the first product's actual category for "View All" navigation
          const firstProductCategory = categoryProducts[0]?.category || categoryKey;

          return (
            <React.Fragment key={categoryKey}>
              <View style={styles.sectionHeader}>
                <ThemedText type="subtitle" style={styles.categoryTitle}>
                  {displayName} ({categoryProducts.length})
                </ThemedText>
                <TouchableOpacity onPress={() => handleViewAll(firstProductCategory)}>
                  <ThemedText style={styles.viewAllText}>View All</ThemedText>
                </TouchableOpacity>
              </View>
              {isLoadingProducts ? (
                <ActivityIndicator size="small" color={tintColor} style={{ marginVertical: 20 }} />
              ) : (
                <FlatList
                  data={categoryProducts}
                  horizontal
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <BoutiqueItemCard item={item} />}
                  contentContainerStyle={styles.horizontalList}
                  showsHorizontalScrollIndicator={false}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Show message if no products */}
        {!isLoadingProducts && allProducts.length === 0 && !shopError && (
          <View style={styles.emptyContainer}>
            <ThemedText style={[styles.emptyText, { color: iconColor }]}>
              No products found. Try adjusting your search radius.
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  radiusContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  radiusOptions: {
    gap: 8,
  },
  radiusOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  radiusOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterScroll: {
    marginHorizontal: -20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  featuredCard: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  featuredImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  featuredContent: {
    alignItems: 'center',
  },
  featuredTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featuredBoutique: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  featuredItem: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 2,
  },
  featuredButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 12,
  },
  featuredButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  horizontalList: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  itemCard: {
    width: 180,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  boutiqueLogo: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    padding: 2,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemDetails: {
    padding: 12,
  },
  brandName: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tryOnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  tryOnButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  lookCard: {
    width: 280,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lookImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  lookBoutiqueLogo: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    padding: 2,
  },
  styleBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  styleBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  lookDetails: {
    padding: 12,
  },
  lookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lookDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
    lineHeight: 16,
  },
  lookItemsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  lookItemsCount: {
    fontSize: 11,
    opacity: 0.7,
  },
  lookPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  shopLookButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  shopLookButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});