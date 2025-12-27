-- ========================================
-- 3. PRODUCTS TABLE
-- ========================================

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,

    -- Bilingual content
    display_name JSONB NOT NULL DEFAULT '{"en": "", "hi": ""}'::jsonb,
    description JSONB DEFAULT '{"en": "", "hi": ""}'::jsonb,
    short_description JSONB DEFAULT '{"en": "", "hi": ""}'::jsonb,

    -- Pricing (stored in paise)
    base_price INTEGER NOT NULL CHECK (base_price >= 0),
    compare_price INTEGER CHECK (compare_price >= base_price),
    cost_price INTEGER CHECK (cost_price >= 0),
    tax_rate NUMERIC(5,4) DEFAULT 0.1800 CHECK (tax_rate >= 0 AND tax_rate <= 1),

    -- Category and classification
    category_id UUID NOT NULL REFERENCES categories(id),
    subcategory_id UUID REFERENCES categories(id),
    tags TEXT[],

    -- Product details
    brand VARCHAR(100),
    manufacturer VARCHAR(100),
    country_of_origin VARCHAR(100),
    ingredients TEXT,
    nutritional_info JSONB,
    usage_instructions TEXT,

    -- Digital/Physical product
    is_digital BOOLEAN DEFAULT false,
    file_url TEXT,

    -- Inventory and fulfillment
    track_inventory BOOLEAN DEFAULT true,
    allow_backorder BOOLEAN DEFAULT false,
    weight NUMERIC(8,3) CHECK (weight >= 0), -- in grams
    dimensions JSONB, -- {length, width, height} in cm

    -- Product status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'archived')),
    is_featured BOOLEAN DEFAULT false,

    -- Wellness store specific fields
    is_discreet BOOLEAN DEFAULT true, -- All products are discreet by default
    requires_age_verification BOOLEAN DEFAULT false,
    is_adult_product BOOLEAN DEFAULT false,
    health_benefits TEXT[],

    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    search_keywords TEXT[],

    -- Visibility and availability
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'hidden')),
    available_from TIMESTAMPTZ DEFAULT NOW(),
    available_until TIMESTAMPTZ,

    -- Analytics
    view_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    average_rating NUMERIC(3,2) DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5),
    review_count INTEGER DEFAULT 0,

    -- Metadata
    attributes JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Create indexes for products table
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_subcategory_id ON products(subcategory_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_is_discreet ON products(is_discreet);
CREATE INDEX idx_products_requires_age_verification ON products(requires_age_verification);
CREATE INDEX idx_products_visibility ON products(visibility);
CREATE INDEX idx_products_base_price ON products(base_price);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_products_search_keywords ON products USING GIN(search_keywords);
CREATE INDEX idx_products_average_rating ON products(average_rating);
CREATE INDEX idx_products_sales_count ON products(sales_count);
CREATE INDEX idx_products_view_count ON products(view_count);

-- Full text search index
CREATE INDEX idx_products_search ON products USING GIN(
    to_tsvector('english',
        COALESCE(display_name->>'en', '') || ' ' ||
        COALESCE(display_name->>'hi', '') || ' ' ||
        COALESCE(description->>'en', '') || ' ' ||
        COALESCE(description->>'hi', '') || ' ' ||
        COALESCE(search_keywords, array_to_string(search_keywords, ' '))
    )
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products table
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (status = 'active' AND visibility = 'public');

CREATE POLICY "Anyone can view featured products" ON products
    FOR SELECT USING (is_featured = true AND status = 'active');

CREATE POLICY "Authenticated users can search products" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage all products" ON products
    FOR ALL USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();