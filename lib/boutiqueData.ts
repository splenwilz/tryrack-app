// Shared boutique data types and mock data
// Used across shop screens, wishlist, and home feed

export interface BoutiqueItem {
  id: string;
  title: string;
  brand: string;
  category: string;
  imageUrl: string;
  price: number;
  colors: string[];
  tags: string[];
  boutique: {
    id: string;
    name: string;
    logo: string;
  };
  arAvailable: boolean;
}

export const mockBoutiqueData: BoutiqueItem[] = [
  {
    id: '1',
    title: 'Designer Blazer',
    brand: 'Fashion Forward',
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=300&h=400&fit=crop',
    price: 45000,
    colors: ['navy', 'black'],
    tags: ['formal', 'business'],
    boutique: {
      id: 'b1',
      name: 'Luxe Boutique',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: true
  },
  {
    id: '2',
    title: 'Silk Evening Dress',
    brand: 'Elegance Co',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop',
    price: 75000,
    colors: ['black', 'navy'],
    tags: ['elegant', 'formal'],
    boutique: {
      id: 'b2',
      name: 'Elegance Co',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: true
  },
  {
    id: '3',
    title: 'Summer Maxi Dress',
    brand: 'Casual Chic',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0c29b8b0b8c?w=300&h=400&fit=crop',
    price: 35000,
    colors: ['blue', 'pink'],
    tags: ['casual', 'summer'],
    boutique: {
      id: 'b3',
      name: 'Casual Chic',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: true
  },
  {
    id: '4',
    title: 'Cocktail Dress',
    brand: 'Party Perfect',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0c29b8b0b8c?w=300&h=400&fit=crop',
    price: 55000,
    colors: ['red', 'black'],
    tags: ['party', 'cocktail'],
    boutique: {
      id: 'b4',
      name: 'Party Perfect',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: true
  },
  {
    id: '5',
    title: 'Designer Handbag',
    brand: 'Luxury Accessories',
    category: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop',
    price: 120000,
    colors: ['black', 'brown'],
    tags: ['luxury', 'designer'],
    boutique: {
      id: 'b5',
      name: 'Luxury Accessories',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: false
  },
  {
    id: '6',
    title: 'Leather Jacket',
    brand: 'Urban Style',
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    price: 85000,
    colors: ['black', 'brown'],
    tags: ['leather', 'urban'],
    boutique: {
      id: 'b6',
      name: 'Urban Style',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: true
  }
];
