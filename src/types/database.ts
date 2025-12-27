// NP Wellness Store - Complete Database Type Definitions
// Generated for the comprehensive e-commerce schema

// Common JSONB types
export interface BilingualText {
  en: string;
  hi: string;
}

export interface BilingualArray {
  en: string[];
  hi: string[];
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

export interface VariantType {
  color?: string;
  size?: string;
  [key: string]: any;
}

export interface ShippingAddress {
  address_line_1: string;
  address_line_2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface PaymentMethod {
  type: 'upi' | 'card' | 'netbanking' | 'cod';
  upi_id?: string;
  card_last4?: string;
  bank_name?: string;
  transaction_id?: string;
}

export interface ShippingMethod {
  type: 'standard' | 'express' | 'overnight';
  name: string;
  days: string;
  cost: number;
}

// 1. Users Table
export interface User {
  id: string;
  email: string;
  phone?: string;
  password_hash?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  date_of_birth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  preferences: Record<string, any>;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserInsert {
  email: string;
  phone?: string;
  password_hash?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  preferences?: Record<string, any>;
}

// 2. Categories Table
export interface Category {
  id: string;
  name: BilingualText;
  slug: string;
  description?: BilingualText;
  image_url?: string;
  icon?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  meta_title?: BilingualText;
  meta_description?: BilingualText;
  created_at: string;
  updated_at: string;
}

export interface CategoryInsert {
  name: BilingualText;
  slug: string;
  description?: BilingualText;
  image_url?: string;
  icon?: string;
  parent_id?: string;
  sort_order?: number;
  is_active?: boolean;
  meta_title?: BilingualText;
  meta_description?: BilingualText;
}

// 3. Products Table
export interface Product {
  id: string;
  category_id: string;
  sku: string;
  name: BilingualText;
  description?: BilingualText;
  short_description?: BilingualText;
  price: number;
  compare_price?: number;
  cost_price?: number;
  weight?: number;
  dimensions?: Dimensions;
  materials?: BilingualArray;
  features?: any[];
  tags: string[];
  status: 'draft' | 'active' | 'inactive' | 'archived';
  is_discreet: boolean;
  requires_age_verification: boolean;
  seo_title?: BilingualText;
  seo_description?: BilingualText;
  meta_keywords: string[];
  view_count: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductInsert {
  category_id: string;
  sku: string;
  name: BilingualText;
  description?: BilingualText;
  short_description?: BilingualText;
  price: number;
  compare_price?: number;
  cost_price?: number;
  weight?: number;
  dimensions?: Dimensions;
  materials?: BilingualArray;
  features?: any[];
  tags?: string[];
  status?: 'draft' | 'active' | 'inactive' | 'archived';
  is_discreet?: boolean;
  requires_age_verification?: boolean;
  seo_title?: BilingualText;
  seo_description?: BilingualText;
  meta_keywords?: string[];
}

// 4. Product Images Table
export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: BilingualText;
  image_type: 'main' | 'gallery' | 'thumbnail' | 'lifestyle';
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// 5. Product Variants Table
export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  name?: BilingualText;
  variant_type?: VariantType;
  price?: number;
  compare_price?: number;
  weight?: number;
  barcode?: string;
  inventory_tracking: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 6. Inventory Table
export interface Inventory {
  id: string;
  product_id?: string;
  variant_id?: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  reorder_level: number;
  reorder_quantity: number;
  cost_per_unit?: number;
  location?: string;
  batch_number?: string;
  expiry_date?: Date;
  last_stock_update: string;
  created_at: string;
  updated_at: string;
}

// 7. Shopping Cart Table
export interface ShoppingCart {
  id: string;
  user_id?: string;
  session_id?: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  added_at: string;
  updated_at: string;
  created_at: string;
}

export interface ShoppingCartInsert {
  user_id?: string;
  session_id?: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
}

// 8. Orders Table (Enhanced)
export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  full_name: string;
  phone: string;
  email?: string;
  shipping_address: ShippingAddress;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  payment_method?: PaymentMethod;
  payment_details?: Record<string, any>;
  shipping_method?: ShippingMethod;
  tracking_number?: string;
  estimated_delivery?: Date;
  delivered_at?: string;
  notes?: BilingualText;
  internal_notes?: Record<string, any>;
  coupon_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderInsert {
  user_id?: string;
  full_name: string;
  phone: string;
  email?: string;
  shipping_address: ShippingAddress;
  subtotal: number;
  shipping_cost?: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  payment_method?: PaymentMethod;
  payment_details?: Record<string, any>;
  shipping_method?: ShippingMethod;
  notes?: BilingualText;
  internal_notes?: Record<string, any>;
  coupon_id?: string;
}

// 9. Order Items Table
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  sku: string;
  product_name: BilingualText;
  variant_name?: BilingualText;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_snapshot: Record<string, any>;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  created_at: string;
  updated_at: string;
}

// 10. Payment Transactions Table
export interface PaymentTransaction {
  id: string;
  order_id: string;
  transaction_id: string;
  gateway: string;
  gateway_order_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded';
  payment_method: PaymentMethod;
  gateway_response: Record<string, any>;
  failure_reason?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

// 11. Shipping Addresses Table
export interface ShippingAddressDB {
  id: string;
  user_id: string;
  address_type: 'shipping' | 'billing';
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
  special_instructions?: BilingualText;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddressInsert {
  user_id: string;
  address_type?: 'shipping' | 'billing';
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  is_default?: boolean;
  special_instructions?: BilingualText;
}

// 12. Product Reviews Table
export interface ProductReview {
  id: string;
  product_id: string;
  variant_id?: string;
  user_id?: string;
  order_id?: string;
  rating: number;
  title?: BilingualText;
  review_text?: BilingualText;
  images: string[];
  helpful_count: number;
  is_verified_purchase: boolean;
  is_approved: boolean;
  is_anonymous: boolean;
  moderation_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductReviewInsert {
  product_id: string;
  variant_id?: string;
  user_id?: string;
  order_id?: string;
  rating: number;
  title?: BilingualText;
  review_text?: BilingualText;
  images?: string[];
  is_anonymous?: boolean;
}

// 13. Coupons Table
export interface Coupon {
  id: string;
  code: string;
  name: BilingualText;
  description?: BilingualText;
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping';
  discount_value: number;
  minimum_order_value: number;
  maximum_discount_amount?: number;
  usage_limit?: number;
  usage_limit_per_customer: number;
  usage_count: number;
  applicable_products: string[];
  applicable_categories: string[];
  excluded_products: string[];
  excluded_categories: string[];
  starts_at?: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CouponInsert {
  code: string;
  name: BilingualText;
  description?: BilingualText;
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping';
  discount_value: number;
  minimum_order_value?: number;
  maximum_discount_amount?: number;
  usage_limit?: number;
  usage_limit_per_customer?: number;
  applicable_products?: string[];
  applicable_categories?: string[];
  excluded_products?: string[];
  excluded_categories?: string[];
  starts_at?: string;
  expires_at?: string;
  is_active?: boolean;
}

// Database Response Types
export type DatabaseResponse<T> = {
  data: T | null;
  error: any;
};

export type DatabaseListResponse<T> = {
  data: T[] | null;
  error: any;
};

// Helper Types for Joins
export interface ProductWithCategory extends Product {
  category: Category;
}

export interface ProductWithImages extends Product {
  images: ProductImage[];
}

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
}

export interface ProductWithReviews extends Product {
  reviews: ProductReview[];
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface OrderWithUser extends Order {
  user: User;
}

export interface CartWithProduct extends ShoppingCart {
  product: Product;
  variant?: ProductVariant;
}

// Type guards and utilities
export function isBilingualText(obj: any): obj is BilingualText {
  return obj && typeof obj === 'object' && 'en' in obj && 'hi' in obj;
}

export function isShippingAddress(obj: any): obj is ShippingAddress {
  return obj && typeof obj === 'object' &&
         'address_line_1' in obj &&
         'city' in obj &&
         'state' in obj &&
         'pincode' in obj;
}

// Currency conversion utilities
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

// Formatted price display
export function formatPrice(paise: number): string {
  return `₹${paiseToRupees(paise).toFixed(2)}`;
}

export function formatPriceWithoutSymbol(paise: number): string {
  return paiseToRupees(paise).toFixed(2);
}