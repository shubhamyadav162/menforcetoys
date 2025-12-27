-- ========================================
-- 5. PRODUCT VARIANTS TABLE
-- ========================================

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100),

    -- Variant information
    name VARCHAR(255),
    slug VARCHAR(255) UNIQUE,

    -- Bilingual content
    display_name JSONB DEFAULT '{"en": "", "hi": ""}'::jsonb,

    -- Pricing (stored in paise)
    price INTEGER NOT NULL CHECK (price >= 0),
    compare_price INTEGER CHECK (compare_price >= price),
    cost_price INTEGER CHECK (cost_price >= 0),

    -- Variant options (size, color, etc.)
    variant_options JSONB NOT NULL DEFAULT '{}'::jsonb, -- {size: "M", color: "Red", etc.}
    variant_type VARCHAR(50), -- "size", "color", "material", etc.

    -- Inventory
    track_inventory BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    stock_status VARCHAR(20) DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock', 'on_backorder', 'discontinued')),
    low_stock_threshold INTEGER DEFAULT 10 CHECK (low_stock_threshold >= 0),
    allow_backorder BOOLEAN DEFAULT false,

    -- Weight and dimensions
    weight NUMERIC(8,3), -- in grams
    dimensions JSONB, -- {length, width, height} in cm

    -- Digital product specifics
    is_digital BOOLEAN DEFAULT false,
    file_url TEXT,
    file_size INTEGER, -- in bytes

    -- Status and visibility
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    is_available BOOLEAN DEFAULT true,

    -- Shipping
    requires_shipping BOOLEAN DEFAULT true,
    shipping_class VARCHAR(50),
    additional_shipping_cost INTEGER DEFAULT 0 CHECK (additional_shipping_cost >= 0), -- in paise

    -- Wellness store specific
    is_discreet BOOLEAN DEFAULT true, -- Inherit from product but can be overridden
    age_restricted BOOLEAN DEFAULT false, -- Different from product level if needed

    -- Analytics
    sales_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,

    -- Metadata
    attributes JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for product_variants table
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_variants_barcode ON product_variants(barcode);
CREATE INDEX idx_product_variants_slug ON product_variants(slug);
CREATE INDEX idx_product_variants_status ON product_variants(status);
CREATE INDEX idx_product_variants_is_available ON product_variants(is_available);
CREATE INDEX idx_product_variants_price ON product_variants(price);
CREATE INDEX idx_product_variants_stock_quantity ON product_variants(stock_quantity);
CREATE INDEX idx_product_variants_stock_status ON product_variants(stock_status);
CREATE INDEX idx_product_variants_variant_type ON product_variants(variant_type);
CREATE INDEX idx_product_variants_sales_count ON product_variants(sales_count);

-- GIN index for variant options JSONB
CREATE INDEX idx_product_variants_variant_options ON product_variants USING GIN(variant_options);

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_variants table
CREATE POLICY "Anyone can view active variants of active products" ON product_variants
    FOR SELECT USING (
        status = 'active' AND
        is_available = true AND
        EXISTS (
            SELECT 1 FROM products
            WHERE products.id = product_variants.product_id
            AND products.status = 'active'
            AND products.visibility = 'public'
        )
    );

CREATE POLICY "Service role can manage all product variants" ON product_variants
    FOR ALL USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_product_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();