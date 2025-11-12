import { createClient } from '@supabase/supabase-js'
import type {
  User,
  Category,
  Product as DatabaseProduct,
  ProductImage,
  ProductVariant,
  Inventory,
  ShoppingCart,
  Order,
  OrderItem,
  PaymentTransaction,
  ShippingAddressDB,
  ProductReview,
  Coupon
} from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Legacy Order interface (maintained for backward compatibility)
export interface LegacyOrder {
  id: string
  product_id: string
  product_name: {
    en: string
    hi: string
  }
  product_price: number
  quantity: number
  subtotal: number
  shipping_cost: number
  total_amount: number

  // Customer information
  full_name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  upi_id: string

  // Order status and timestamps
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed'

  created_at: string
  updated_at: string
}

export interface LegacyOrderInsert {
  product_id: string
  product_name: {
    en: string
    hi: string
  }
  product_price: number
  quantity: number
  subtotal: number
  shipping_cost: number
  total_amount: number

  full_name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  upi_id: string

  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_status?: 'pending' | 'paid' | 'failed'
}

// Enhanced database services
export class DatabaseService {
  // Users
  static async getUser(userId: string) {
    return await supabase.from('users').select('*').eq('id', userId).single()
  }

  static async createUser(userData: Partial<User>) {
    return await supabase.from('users').insert([userData]).select().single()
  }

  // Categories
  static async getCategories() {
    return await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
  }

  static async getCategoryBySlug(slug: string) {
    return await supabase.from('categories').select('*').eq('slug', slug).single()
  }

  // Products
  static async getProducts(options?: {
    categoryId?: string
    featured?: boolean
    discreet?: boolean
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        images:product_images(id, image_url, alt_text, sort_order, is_primary)
      `)
      .eq('status', 'active')

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId)
    }
    if (options?.featured) {
      query = query.eq('is_featured', true)
    }
    if (options?.discrete !== undefined) {
      query = query.eq('is_discreet', options.discreet)
    }

    return await query
      .order('created_at', { ascending: false })
      .limit(options?.limit || 50)
      .range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 50) - 1)
  }

  static async getProductById(productId: string) {
    return await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        images:product_images(id, image_url, alt_text, sort_order, is_primary),
        variants:product_variants(*),
        inventory:inventory(*),
        reviews:product_reviews(id, rating, title, review_text, helpful_count, created_at)
      `)
      .eq('id', productId)
      .single()
  }

  static async getProductBySKU(sku: string) {
    return await supabase.from('products').select('*').eq('sku', sku).single()
  }

  // Shopping Cart
  static async getCartItems(userId?: string, sessionId?: string) {
    let query = supabase
      .from('shopping_cart')
      .select(`
        *,
        product:products(id, name, price, is_discreet),
        variant:product_variants(id, name, price)
      `)

    if (userId) {
      query = query.eq('user_id', userId)
    } else if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    return await query.order('added_at', { ascending: false })
  }

  static async addToCart(item: {
    user_id?: string
    session_id?: string
    product_id: string
    variant_id?: string
    quantity: number
    unit_price: number
  }) {
    return await supabase.from('shopping_cart').insert([item]).select().single()
  }

  static async updateCartItem(cartItemId: string, updates: { quantity: number }) {
    return await supabase
      .from('shopping_cart')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', cartItemId)
      .select()
      .single()
  }

  static async removeFromCart(cartItemId: string) {
    return await supabase.from('shopping_cart').delete().eq('id', cartItemId)
  }

  static async clearCart(userId?: string, sessionId?: string) {
    let query = supabase.from('shopping_cart').delete()

    if (userId) {
      query = query.eq('user_id', userId)
    } else if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    return await query
  }

  // Orders
  static async createOrder(orderData: Partial<Order>) {
    return await supabase.from('orders').insert([orderData]).select().single()
  }

  static async getOrder(orderId: string) {
    return await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*, product:products(id, name, image_url)),
        payment_transactions:payment_transactions(*)
      `)
      .eq('id', orderId)
      .single()
  }

  static async getOrders(options?: {
    userId?: string
    status?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        items:order_items(id, product_id, quantity, unit_price, total_price)
      `)

    if (options?.userId) {
      query = query.eq('user_id', options.userId)
    }
    if (options?.status) {
      query = query.eq('status', options.status)
    }

    return await query
      .order('created_at', { ascending: false })
      .limit(options?.limit || 50)
      .range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 50) - 1)
  }

  static async updateOrderStatus(orderId: string, status: string, paymentStatus?: string) {
    const updates: any = { status, updated_at: new Date().toISOString() }
    if (paymentStatus) {
      updates.payment_status = paymentStatus
    }

    return await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single()
  }

  static async deleteOrder(orderId: string) {
    return await supabase.from('orders').delete().eq('id', orderId)
  }

  // Reviews
  static async getProductReviews(productId: string) {
    return await supabase
      .from('product_reviews')
      .select(`
        *,
        user:users(id, full_name)
      `)
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
  }

  static async createReview(reviewData: Partial<ProductReview>) {
    return await supabase.from('product_reviews').insert([reviewData]).select().single()
  }

  // Coupons
  static async validateCoupon(code: string) {
    return await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .or('starts_at.is.null,starts_at.lte.now()')
      .or('expires_at.is.null,expires_at.gte.now()')
      .single()
  }

  static async applyCoupon(couponId: string) {
    return await supabase
      .from('coupons')
      .update({ usage_count: supabase.rpc('increment', { count: 1 }) })
      .eq('id', couponId)
  }

  // Analytics
  static async getOrderStats(startDate?: string, endDate?: string) {
    let query = supabase
      .from('orders')
      .select('status, total_amount, created_at')
      .eq('status', 'delivered')

    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    return await query
  }

  static async getLowStockProducts() {
    return await supabase
      .from('inventory')
      .select(`
        *,
        product:products(id, name, sku, is_active)
      `)
      .lt('available_quantity', supabase.rpc('reorder_level'))
      .order('available_quantity', { ascending: true })
  }

  // Legacy compatibility functions
  static async createLegacyOrder(orderData: LegacyOrderInsert) {
    // Convert legacy order to new format and create
    const newOrderData = {
      order_number: `NP${Date.now().toString(36).toUpperCase()}`,
      full_name: orderData.full_name,
      phone: orderData.phone,
      shipping_address: {
        address_line_1: orderData.address,
        city: orderData.city,
        state: orderData.state,
        pincode: orderData.pincode,
        country: 'India'
      },
      subtotal: orderData.subtotal * 100, // Convert to paise
      shipping_cost: orderData.shipping_cost * 100,
      total_amount: orderData.total_amount * 100,
      status: orderData.status || 'pending',
      payment_status: orderData.payment_status || 'pending',
      payment_method: {
        type: 'upi' as const,
        upi_id: orderData.upi_id
      }
    }

    return await this.createOrder(newOrderData as Partial<Order>)
  }
}

// Export types
export {
  User,
  Category,
  DatabaseProduct,
  ProductImage,
  ProductVariant,
  Inventory,
  ShoppingCart,
  Order,
  OrderItem,
  PaymentTransaction,
  ShippingAddressDB,
  ProductReview,
  Coupon
}

// SQL schema for creating the orders table
export const ORDERS_TABLE_SCHEMA = `
-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Product information
  product_id TEXT NOT NULL,
  product_name JSONB NOT NULL,
  product_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal INTEGER NOT NULL,
  shipping_cost INTEGER NOT NULL DEFAULT 50,
  total_amount INTEGER NOT NULL,

  -- Customer information
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  upi_id TEXT NOT NULL,

  -- Order status and timestamps
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own orders (if you have authentication)
-- For now, allow read access to all orders since this is a simple implementation
CREATE POLICY "Allow read access to all orders"
    ON orders FOR SELECT
    USING (true);

-- Create policy to allow insert operations
CREATE POLICY "Allow insert operations"
    ON orders FOR INSERT
    WITH CHECK (true);

-- Create policy to allow update operations
CREATE POLICY "Allow update operations"
    ON orders FOR UPDATE
    USING (true);
`

// Function to initialize the database schema
export const initializeDatabase = async () => {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query: ORDERS_TABLE_SCHEMA
    })

    if (error) {
      console.error('Error initializing database:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (err) {
    console.error('Database initialization error:', err)
    return { success: false, error: err }
  }
}