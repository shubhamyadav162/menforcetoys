-- ========================================
-- 6. INVENTORY TABLE
-- ========================================

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,

    -- Location information
    location_code VARCHAR(100) DEFAULT 'MAIN', -- Warehouse, store location
    location_name VARCHAR(255),

    -- Stock levels
    quantity_on_hand INTEGER NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    quantity_allocated INTEGER NOT NULL DEFAULT 0 CHECK (quantity_allocated >= 0), -- Reserved for orders
    quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_allocated) STORED,
    quantity_on_order INTEGER DEFAULT 0 CHECK (quantity_on_order >= 0), -- Incoming stock

    -- Stock thresholds
    reorder_point INTEGER DEFAULT 10 CHECK (reorder_point >= 0),
    max_stock_level INTEGER DEFAULT 1000 CHECK (max_stock_level >= 0),
    safety_stock INTEGER DEFAULT 5 CHECK (safety_stock >= 0),

    -- Cost and valuation
    unit_cost INTEGER CHECK (unit_cost >= 0), -- in paise
    total_cost INTEGER GENERATED ALWAYS AS (quantity_on_hand * COALESCE(unit_cost, 0)) STORED,

    -- Status
    stock_status VARCHAR(20) GENERATED ALWAYS AS (
        CASE
            WHEN quantity_on_hand = 0 THEN 'out_of_stock'
            WHEN quantity_on_hand <= reorder_point THEN 'low_stock'
            WHEN quantity_on_hand > reorder_point THEN 'in_stock'
            ELSE 'unknown'
        END
    ) STORED,

    -- Tracking
    last_counted_at TIMESTAMPTZ,
    counted_by UUID REFERENCES users(id),
    is_tracked BOOLEAN DEFAULT true,

    -- Notes and metadata
    notes TEXT,
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for inventory table
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_variant_id ON inventory(variant_id);
CREATE INDEX idx_inventory_location_code ON inventory(location_code);
CREATE INDEX idx_inventory_quantity_available ON inventory(quantity_available);
CREATE INDEX idx_inventory_stock_status ON inventory(stock_status);
CREATE INDEX idx_inventory_reorder_point ON inventory(reorder_point);
CREATE INDEX idx_inventory_is_tracked ON inventory(is_tracked);

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory table
CREATE POLICY "Service role can manage all inventory" ON inventory
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can view all inventory" ON inventory
    FOR SELECT USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();