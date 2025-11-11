-- Create Products table with enhanced product management
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES categories(id),
    sku TEXT UNIQUE NOT NULL,
    name JSONB NOT NULL, -- { "en": "Product Name", "hi": "उत्पाद नाम" }
    description JSONB,
    short_description JSONB,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    compare_price DECIMAL(10,2), -- MRP/discount price
    cost_price DECIMAL(10,2), -- For profit tracking
    weight DECIMAL(8,3), -- in grams
    dimensions JSONB, -- { "length": 10, "width": 5, "height": 3, "unit": "cm" }
    materials JSONB, -- { "en": ["Silicone", "ABS Plastic"], "hi": ["सिलिकॉन", "एबीएस प्लास्टिक"] }
    features JSONB, -- Array of features
    tags TEXT[], -- Search tags
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'archived')),
    is_discreet BOOLEAN DEFAULT true, -- For discreet billing
    requires_age_verification BOOLEAN DEFAULT false,
    seo_title JSONB,
    seo_description JSONB,
    meta_keywords TEXT[],
    view_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Service role can manage products" ON products FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_products_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_products_updated_at();