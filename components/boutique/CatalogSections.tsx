import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FeaturedProductItem } from './FeaturedProductItem';
import { ProductCarousel } from './ProductCarousel';
import { ProductStatusGrid } from './ProductStatusGrid';
import type { ProductCard } from './ProductItemCard';

interface CatalogSectionsProps {
  featuredProduct: ProductCard | null;
  recentProducts: ProductCard[];
  groupedByCategory: {
    sortedCategories: string[];
    groups: Record<string, ProductCard[]>;
  };
  outOfStockProducts: ProductCard[];
  inactiveProducts: ProductCard[];
  onItemPress: (id: string) => void;
  onViewAll: (category: string) => void;
}

/**
 * CatalogSections
 * Renders featured, recent, category, and status sections
 */
export const CatalogSections: React.FC<CatalogSectionsProps> = ({
  featuredProduct,
  recentProducts,
  groupedByCategory,
  outOfStockProducts,
  inactiveProducts,
  onItemPress,
  onViewAll,
}) => {
  return (
    <>
      {featuredProduct && (
        <View style={styles.featuredSection}>
          <FeaturedProductItem item={featuredProduct} onPress={() => onItemPress(featuredProduct.id)} />
        </View>
      )}

      {recentProducts.length > 0 && (
        <ProductCarousel
          title="Recently Added"
          items={recentProducts}
          onViewAll={() => onViewAll('recent')}
          style={!featuredProduct ? { marginTop: 24 } : undefined}
          onItemPress={onItemPress}
        />
      )}

      {groupedByCategory.sortedCategories.map((category) => {
        const items = groupedByCategory.groups[category];
        const displayTitle = category
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        const pluralSuffix = category.endsWith('s') ? '' : 's';

        return (
          <ProductCarousel
            key={category}
            title={`${displayTitle}${pluralSuffix} (${items.length})`}
            items={items}
            onViewAll={() => onViewAll(category)}
            onItemPress={onItemPress}
          />
        );
      })}

      {outOfStockProducts.length > 0 && (
        <ProductStatusGrid
          title="Out of Stock"
          subtitle="Restock these items to continue selling"
          items={outOfStockProducts}
          onItemPress={onItemPress}
        />
      )}

      {inactiveProducts.length > 0 && (
        <ProductStatusGrid
          title="Inactive Products"
          subtitle="Activate these products to make them available"
          items={inactiveProducts}
          onItemPress={onItemPress}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  featuredSection: {
    marginBottom: 32,
    marginTop: 20,
  },
});

