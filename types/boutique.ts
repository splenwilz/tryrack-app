/**
 * Shared boutique types
 * Centralizes catalog domain models so multiple components/hooks can reuse them.
 * 
 * Note: This is the frontend representation. Backend uses snake_case.
 * Use mapping functions to convert between frontend (camelCase) and backend (snake_case).
 */

export interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  brand?: string; // Optional
  price: number;
  costPrice?: number; // Cost price for profit tracking (maps to cost_price in backend)
  discountPrice?: number; // Discount price for display (maps to discount_price in backend, was originalPrice)
  imageUrl: string; // Maps to image_url in backend
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  tags: string[];
  colors: string[];
  description: string;
  createdAt: string; // Maps to created_at in backend
  lastUpdated: string; // Maps to updated_at in backend
  // Note: sales, revenue, views, rating, reviews are not part of create/update API
  // They are managed separately by the backend
}

