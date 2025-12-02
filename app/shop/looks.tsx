import React from 'react';
import { ScrollView, StyleSheet, View, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { CustomHeader } from '@/components/custom-header';
import { usePublicLooks } from '@/api/looks/queries';
import { mapLookFromBackendResponse, type Look } from '@/utils/looks';
import type { LookResponse } from '@/api/looks/types';

// Mock look data (fallback if API returns empty)
const mockLooksData: Look[] = [
  {
    id: 'look1',
    title: 'Business Professional',
    description: 'Perfect for office meetings and formal events',
    imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=400&h=500&fit=crop',
    style: 'business',
    items: [
      {
        id: '1',
        title: 'Designer Blazer',
        category: 'outerwear',
        price: 45000,
        imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=300&h=400&fit=crop',
      },
      {
        id: '2',
        title: 'Silk Evening Dress',
        category: 'dress',
        price: 85000,
        imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop',
      },
    ],
    totalPrice: 130000,
    boutique: {
      id: 'b1',
      name: 'Luxe Boutique',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    },
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'look2',
    title: 'Casual Weekend',
    description: 'Comfortable and stylish for everyday wear',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=500&fit=crop',
    style: 'casual',
    items: [
      {
        id: '3',
        title: 'Casual Denim Jacket',
        category: 'outerwear',
        price: 25000,
        imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&h=400&fit=crop',
      },
      {
        id: '4',
        title: 'Premium Sneakers',
        category: 'shoes',
        price: 35000,
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=400&fit=crop',
      },
    ],
    totalPrice: 60000,
    boutique: {
      id: 'b3',
      name: 'Street Fashion',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    },
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'look3',
    title: 'Evening Elegance',
    description: 'Sophisticated look for special occasions',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
    style: 'evening',
    items: [
      {
        id: '2',
        title: 'Silk Evening Dress',
        category: 'dress',
        price: 85000,
        imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop',
      },
      {
        id: '5',
        title: 'Luxury Handbag',
        category: 'accessories',
        price: 120000,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop',
      },
    ],
    totalPrice: 205000,
    boutique: {
      id: 'b2',
      name: 'Chic Collection',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    },
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'look4',
    title: 'Summer Vibes',
    description: 'Light and breezy for warm weather',
    imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop',
    style: 'casual',
    items: [
      {
        id: '6',
        title: 'Summer Maxi Dress',
        category: 'dress',
        price: 32000,
        imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop',
      },
      {
        id: '5',
        title: 'Luxury Handbag',
        category: 'accessories',
        price: 120000,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop',
      },
    ],
    totalPrice: 152000,
    boutique: {
      id: 'b6',
      name: 'Bohemian Dreams',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    },
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'look5',
    title: 'Formal Attire',
    description: 'Classic and timeless for important events',
    imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=400&h=500&fit=crop',
    style: 'formal',
    items: [
      {
        id: '1',
        title: 'Designer Blazer',
        category: 'outerwear',
        price: 45000,
        imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=300&h=400&fit=crop',
      },
      {
        id: '5',
        title: 'Luxury Handbag',
        category: 'accessories',
        price: 120000,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop',
      },
    ],
    totalPrice: 165000,
    boutique: {
      id: 'b1',
      name: 'Luxe Boutique',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    },
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Look Card Component
const LookCard: React.FC<{ look: Look }> = ({ look }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  const handleViewLook = () => {
    // TODO: Navigate to look detail screen when implemented
    console.log(`View look details for ${look.id}`);
  };

  return (
    <TouchableOpacity style={[styles.lookCard, { backgroundColor }]} onPress={handleViewLook}>
      <Image source={{ uri: look.imageUrl }} style={styles.lookImage} />
      
      {/* Boutique Logo */}
      <View style={styles.lookBoutiqueLogo}>
        <Image source={{ uri: look.boutique.logo }} style={styles.logoImage} />
      </View>

      {/* Style Badge */}
      <View style={[styles.styleBadge, { backgroundColor: tintColor }]}>
        <ThemedText style={styles.styleBadgeText}>{look.style}</ThemedText>
      </View>

      <View style={styles.lookDetails}>
        <ThemedText style={styles.lookTitle} numberOfLines={1}>
          {look.title}
        </ThemedText>
        <ThemedText style={styles.lookDescription} numberOfLines={2}>
          {look.description}
        </ThemedText>
        
        {/* Items Count */}
        <View style={styles.lookItemsInfo}>
          <IconSymbol name="tshirt.fill" size={12} color={tintColor} />
          <ThemedText style={styles.lookItemsCount}>{look.items.length} items</ThemedText>
        </View>

        {/* Total Price */}
        <ThemedText style={styles.lookPrice}>₦{look.totalPrice.toLocaleString()}</ThemedText>

        {/* Shop Look Button */}
        <TouchableOpacity
          style={[styles.shopLookButton, { backgroundColor: tintColor }]}
          onPress={handleViewLook}
        >
          <ThemedText style={styles.shopLookButtonText}>Shop Look</ThemedText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Shop by Look Screen
 * Displays all available outfit looks/combinations
 * Users can browse complete outfits and shop entire looks
 */
export default function LooksScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  // Fetch looks from API
  const { data: apiLooks = [], isLoading } = usePublicLooks({ featured_only: false });

  // Map API looks to frontend format
  const looks = React.useMemo(() => {
    if (apiLooks.length > 0) {
      return apiLooks.map((look: LookResponse) => mapLookFromBackendResponse(look));
    }
    return mockLooksData; // Fallback to mock data if API returns empty
  }, [apiLooks]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader
          title="Shop by Look"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Loading looks...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title="Shop by Look"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <ThemedText type="title" style={styles.pageTitle}>
            Complete Outfits
          </ThemedText>
          <ThemedText style={styles.pageDescription}>
            Discover curated looks and shop entire outfits at once
          </ThemedText>
        </View>

        <View style={styles.looksGrid}>
          {looks.map((look) => (
            <LookCard key={look.id} look={look} />
          ))}
        </View>
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
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pageDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  looksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  lookCard: {
    width: '47%',
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
    height: 250,
    resizeMode: 'cover',
  },
  lookBoutiqueLogo: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'white',
    padding: 2,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  styleBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  styleBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  lookDetails: {
    padding: 12,
  },
  lookTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lookDescription: {
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 8,
    lineHeight: 14,
  },
  lookItemsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  lookItemsCount: {
    fontSize: 10,
    opacity: 0.7,
  },
  lookPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  shopLookButton: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  shopLookButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

