# NP Wellness Store - E-commerce Database Setup Guide

This guide provides step-by-step instructions for setting up the comprehensive e-commerce database schema for your NP wellness store using Supabase.

## 🎯 Overview

The database schema includes 13 core tables with proper relationships, indexes, and Row Level Security (RLS) policies designed specifically for an Indian wellness store with discreet billing requirements.

## 📋 Table Structure

### Core Tables Created:
1. **Users** - Customer management with authentication
2. **Categories** - Product categorization (toys, accessories, etc.)
3. **Products** - Enhanced product management with stock
4. **Product Images** - Multiple images per product
5. **Product Variants** - Size/color variants
6. **Inventory** - Stock management
7. **Shopping Cart** - Persistent cart functionality
8. **Orders (Enhanced)** - New orders table with proper relationships
9. **Order Items** - Multiple items per order
10. **Payment Transactions** - Payment tracking
11. **Shipping Addresses** - Customer address book
12. **Product Reviews** - Customer ratings and reviews
13. **Coupons** - Discount management

## 🔧 Setup Instructions

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in with your credentials
3. Select your project: **sextoy** (Project ID: ctdakdqpmntycertugvz)

### Step 2: Navigate to SQL Editor

1. From the left sidebar, click on **"SQL Editor"**
2. Click **"New query"** to create a new SQL window

### Step 3: Execute Tables in Order

Execute the following SQL files in the specified order. Each file is designed to be run independently:

#### **Phase 1: Core Structure**
```sql
-- Execute this first
-- File: 01_create_users_table.sql
```
```sql
-- File: 02_create_categories_table.sql
```
```sql
-- File: 03_create_products_table.sql
```

#### **Phase 2: Enhanced Features**
```sql
-- File: 04_create_enhanced_orders_table.sql
```
```sql
-- File: 05_create_order_items_table.sql
```
```sql
-- File: 06_create_shopping_cart_table.sql
```
```sql
-- File: 07_create_shipping_addresses_table.sql
```
```sql
-- File: 08_create_coupons_table.sql
```

### Step 4: Optional Advanced Tables

For complete functionality, you can also create these tables:

```sql
-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text JSONB,
    image_type TEXT DEFAULT 'main' CHECK (image_type IN ('main', 'gallery', 'thumbnail', 'lifestyle')),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL,
    name JSONB,
    variant_type JSONB,
    price DECIMAL(10,2),
    compare_price DECIMAL(10,2),
    weight DECIMAL(8,3),
    barcode TEXT,
    inventory_tracking BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    reorder_level INTEGER DEFAULT 5,
    reorder_quantity INTEGER DEFAULT 20,
    cost_per_unit DECIMAL(10,2),
    location TEXT,
    batch_number TEXT,
    expiry_date DATE,
    last_stock_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_product_or_variant CHECK (
        (product_id IS NOT NULL AND variant_id IS NULL) OR
        (product_id IS NULL AND variant_id IS NOT NULL)
    )
);

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders_new(id) ON DELETE CASCADE,
    transaction_id TEXT UNIQUE NOT NULL,
    gateway TEXT NOT NULL,
    gateway_order_id TEXT,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'cancelled', 'refunded')),
    payment_method JSONB,
    gateway_response JSONB,
    failure_reason TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Reviews Table
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders_new(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title JSONB,
    review_text JSONB,
    images TEXT[],
    helpful_count INTEGER DEFAULT 0,
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    is_anonymous BOOLEAN DEFAULT false,
    moderation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_verified_review UNIQUE (product_id, user_id, order_id)
);
```

### Step 5: Migrate Existing Orders

If you have existing data in the old `orders` table, run this migration:

```sql
-- Migrate existing orders to new structure
INSERT INTO orders_new (
    order_number,
    full_name,
    phone,
    shipping_address,
    subtotal,
    shipping_cost,
    total_amount,
    status,
    payment_status,
    created_at,
    updated_at
)
SELECT
    'NP-' || TO_CHAR(created_at, 'YYYYMMDD') || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 3, '0'),
    full_name,
    phone,
    jsonb_build_object(
        'address_line_1', address,
        'city', city,
        'state', state,
        'pincode', pincode
    ),
    subtotal,
    shipping_cost,
    total_amount,
    status,
    payment_status,
    created_at,
    updated_at
FROM orders;
```

## 🎯 Key Features Implemented

### ✅ Bilingual Support
- All text fields use JSONB for English/Hindi content
- Example: `{"en": "Product Name", "hi": "उत्पाद नाम"}`

### ✅ Indian Address Format
- Proper support for Indian address structure
- Pincode validation
- State and city fields

### ✅ UPI Payment Support
- Payment method tracking for UPI transactions
- Gateway response storage
- Multi-payment gateway support

### ✅ Discreet Billing
- `is_discreet` flag on products
- Anonymous review support
- Privacy-focused customer data handling

### ✅ Row Level Security
- Complete RLS implementation
- User-based access control
- Service role admin access

### ✅ Performance Optimization
- Strategic indexing on all foreign keys
- GIN indexes for array and JSONB columns
- Composite indexes for common queries

### ✅ Data Integrity
- Foreign key constraints
- CHECK constraints for valid data
- Generated columns for computed values

## 🚀 Next Steps

1. **Test the Schema**: Insert test data to verify relationships work correctly
2. **Update Frontend**: Update your React components to use the new schema
3. **Implement Auth**: Set up Supabase Auth for user management
4. **Create Admin Panel**: Build admin interface for product and order management
5. **Set Up Storage**: Configure Supabase Storage for product images

## 🔍 Verification

After completing the setup, verify by running:

```sql
-- List all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'categories', 'products', 'orders_new', 'shopping_cart', 'coupons');

-- Check indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('users', 'products', 'orders_new');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## 🆘 Troubleshooting

### Common Issues:

1. **Foreign Key Errors**: Ensure tables are created in the correct order
2. **RLS Policy Errors**: Run the policies after creating all tables
3. **Permission Issues**: Use the service_role_key for setup operations

### Support:
- [Supabase Documentation](https://supabase.com/docs)
- [Complete Schema Reference](complete_ecommerce_schema.sql)
- [MCP Server Setup](MCP-SETUP.md)

Your NP wellness store e-commerce database is now ready for production! 🎉