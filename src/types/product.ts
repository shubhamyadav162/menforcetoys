export type Language = "en" | "hi";

// Legacy Product interface - maintained for backward compatibility
// New code should use the database Product type from src/types/database.ts
export interface Product {
  id: string;
  name: {
    en: string;
    hi: string;
  };
  description: {
    en: string;
    hi: string;
  };
  price: number;
  image: string;
  category: string;
  specs: string[];
  // Add new fields for enhanced functionality
  sku?: string;
  stock_quantity?: number;
  is_active?: boolean;
  is_featured?: boolean;
  is_discreet?: boolean;
  isTest?: boolean;
  weight?: number;
  compare_price?: number;
  rating?: number;
  review_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
  variant_id?: string;
  unit_price?: number;
  total_price?: number;
}

// Import new database types
export type {
  Product as DatabaseProduct,
  ProductImage,
  ProductVariant,
  Category,
  BilingualText,
  ShoppingCart,
  Order,
  OrderItem,
  PaymentTransaction,
  ProductReview,
  Coupon,
  Inventory
} from './database';

// Helper function to convert legacy Product to DatabaseProduct
export function convertToDatabaseProduct(legacyProduct: Product): DatabaseProduct {
  return {
    id: legacyProduct.id,
    category_id: legacyProduct.category || 'default-category',
    sku: legacyProduct.sku || `SKU-${legacyProduct.id}`,
    name: {
      en: legacyProduct.name.en,
      hi: legacyProduct.name.hi
    },
    description: {
      en: legacyProduct.description.en,
      hi: legacyProduct.description.hi
    },
    short_description: {
      en: legacyProduct.description.en.substring(0, 150),
      hi: legacyProduct.description.hi.substring(0, 150)
    },
    price: legacyProduct.price * 100, // Convert to paise
    weight: legacyProduct.weight,
    materials: {
      en: legacyProduct.specs,
      hi: legacyProduct.specs
    },
    features: legacyProduct.specs,
    tags: [legacyProduct.category],
    status: legacyProduct.is_active === false ? 'inactive' : 'active',
    is_discreet: legacyProduct.is_discreet ?? true, // Default to discreet for adult wellness
    requires_age_verification: true,
    view_count: 0,
    rating: legacyProduct.rating || 0,
    review_count: legacyProduct.review_count || 0,
    created_at: legacyProduct.created_at || new Date().toISOString(),
    updated_at: legacyProduct.updated_at || new Date().toISOString()
  };
}

// Helper function to convert DatabaseProduct to legacy Product (for existing components)
export function convertToLegacyProduct(dbProduct: DatabaseProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || dbProduct.short_description || { en: '', hi: '' },
    price: dbProduct.price / 100, // Convert from paise to rupees
    image: '', // Will be loaded from ProductImages table
    category: '', // Will be loaded from Category relationship
    specs: dbProduct.materials?.en || [],
    sku: dbProduct.sku,
    stock_quantity: dbProduct.inventory_tracking ? dbProduct.stock_quantity : undefined,
    is_active: dbProduct.status === 'active',
    is_featured: dbProduct.is_featured,
    is_discreet: dbProduct.is_discreet,
    weight: dbProduct.weight,
    compare_price: dbProduct.compare_price ? dbProduct.compare_price / 100 : undefined,
    rating: dbProduct.rating,
    review_count: dbProduct.review_count,
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at
  };
}
