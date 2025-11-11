-- ========================================
-- 4. PRODUCT IMAGES TABLE
-- ========================================

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    -- Image URLs
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text VARCHAR(255),
    title VARCHAR(255),

    -- Image properties
    width INTEGER,
    height INTEGER,
    file_size INTEGER, -- in bytes
    mime_type VARCHAR(100),

    -- Display order
    sort_order INTEGER DEFAULT 0,

    -- Image type and visibility
    image_type VARCHAR(50) DEFAULT 'product' CHECK (image_type IN ('product', 'thumbnail', 'gallery', 'variant', 'lifestyle')),
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for product_images table
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_sort_order ON product_images(sort_order);
CREATE INDEX idx_product_images_is_primary ON product_images(is_primary);
CREATE INDEX idx_product_images_is_active ON product_images(is_active);
CREATE INDEX idx_product_images_image_type ON product_images(image_type);

-- Ensure only one primary image per product
CREATE UNIQUE INDEX idx_product_images_unique_primary ON product_images(product_id)
WHERE is_primary = true AND is_active = true;

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_images table
CREATE POLICY "Anyone can view active product images" ON product_images
    FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage all product images" ON product_images
    FOR ALL USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_product_images_updated_at
    BEFORE UPDATE ON product_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();