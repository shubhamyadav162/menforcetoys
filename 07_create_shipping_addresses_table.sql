-- Create Shipping Addresses table for customer address book
CREATE TABLE IF NOT EXISTS shipping_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address_type TEXT DEFAULT 'shipping' CHECK (address_type IN ('shipping', 'billing')),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    landmark TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    is_default BOOLEAN DEFAULT false,
    special_instructions JSONB, -- { "en": "Leave at door", "hi": "दरवाजे पर छोड़ें" }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user ON shipping_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_default ON shipping_addresses(user_id, is_default);

-- Enable Row Level Security
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own addresses" ON shipping_addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage addresses" ON shipping_addresses FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_shipping_addresses_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shipping_addresses_updated_at BEFORE UPDATE ON shipping_addresses FOR EACH ROW EXECUTE FUNCTION update_shipping_addresses_updated_at();