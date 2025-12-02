import { useMemo } from 'react';
import type { CatalogProduct } from '@/types/boutique';
import type { ProductFilters } from '@/components/boutique';
import type { ProductCard } from '@/components/boutique/ProductItemCard';

interface UseCatalogDataOptions {
  products: CatalogProduct[];
  filters: ProductFilters;
  sortBy: string;
}

interface CatalogDataResult {
  productCards: ProductCard[];
  featuredProduct: ProductCard | null;
  recentProducts: ProductCard[];
  groupedByCategory: {
    sortedCategories: string[];
    groups: Record<string, ProductCard[]>;
  };
  outOfStockProducts: ProductCard[];
  inactiveProducts: ProductCard[];
  availableCategories: string[];
  availableBrands: string[];
  availableTags: string[];
  hasActiveFilters: boolean;
  filteredCount: number;
}

/**
 * useCatalogData
 * Derives catalog UI data from products, filters, and sort options.
 */
export function useCatalogData({
  products,
  filters,
  sortBy,
}: UseCatalogDataOptions): CatalogDataResult {
  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.status !== 'all' ||
    filters.category !== null ||
    filters.brand !== null ||
    filters.tag !== null;

  const { availableCategories, availableBrands, availableTags } = useMemo(() => {
    const categories = new Set<string>();
    const brands = new Set<string>();
    const tags = new Set<string>();

    products.forEach((product) => {
      if (product.category) {
        categories.add(product.category.toLowerCase().trim());
      }
      if (product.brand) {
        brands.add(product.brand.trim());
      }
      if (product.tags && product.tags.length > 0) {
        product.tags.forEach((tag) => tags.add(tag.toLowerCase().trim()));
      }
    });

    return {
      availableCategories: Array.from(categories).sort(),
      availableBrands: Array.from(brands).sort(),
      availableTags: Array.from(tags).sort(),
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((product) => product.status === filters.status);
    }

    if (filters.category) {
      filtered = filtered.filter(
        (product) => product.category.toLowerCase().trim() === filters.category?.toLowerCase()
      );
    }

    if (filters.brand) {
      filtered = filtered.filter((product) => product.brand.trim() === filters.brand);
    }

    if (filters.tag) {
      filtered = filtered.filter((product) =>
        product.tags?.some((tag) => tag.toLowerCase().trim() === filters.tag?.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'sales':
          return b.sales - a.sales;
        case 'revenue':
          return b.revenue - a.revenue;
        case 'views':
          return b.views - a.views;
        case 'price':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, filters, sortBy]);

  const productCards: ProductCard[] = useMemo(() => {
    return filteredProducts.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      imageUrl: product.imageUrl,
      status: product.status,
      tags: product.tags,
      stock: product.stock,
    }));
  }, [filteredProducts]);

  const featuredProduct = useMemo(() => {
    if (productCards.length === 0) return null;

    const bestSeller = [...productCards].sort((a, b) => {
      const productA = products.find((p) => p.id === a.id);
      const productB = products.find((p) => p.id === b.id);
      return (productB?.sales || 0) - (productA?.sales || 0);
    })[0];

    return bestSeller || null;
  }, [productCards, products]);

  const recentProducts = useMemo(() => {
    return productCards
      .filter((card) => {
        const product = products.find((p) => p.id === card.id);
        return product && product.status === 'active';
      })
      .sort((a, b) => {
        const productA = products.find((p) => p.id === a.id);
        const productB = products.find((p) => p.id === b.id);
        return (
          new Date(productB?.createdAt || 0).getTime() -
          new Date(productA?.createdAt || 0).getTime()
        );
      })
      .slice(0, 10);
  }, [productCards, products]);

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, ProductCard[]> = {};
    const categories = new Set<string>();

    productCards.forEach((card) => {
      if (card.status === 'active') {
        const category = card.category.toLowerCase().trim();
        if (!groups[category]) {
          groups[category] = [];
          categories.add(category);
        }
        groups[category].push(card);
      }
    });

    const sortedCategories = Array.from(categories).sort(
      (a, b) => groups[b].length - groups[a].length
    );

    return { groups, sortedCategories };
  }, [productCards]);

  const outOfStockProducts = useMemo(
    () => productCards.filter((card) => card.status === 'out_of_stock'),
    [productCards]
  );

  const inactiveProducts = useMemo(
    () => productCards.filter((card) => card.status === 'inactive'),
    [productCards]
  );

  return {
    productCards,
    featuredProduct,
    recentProducts,
    groupedByCategory,
    outOfStockProducts,
    inactiveProducts,
    availableCategories,
    availableBrands,
    availableTags,
    hasActiveFilters,
    filteredCount: productCards.length,
  };
}

