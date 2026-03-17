-- ============================================================
-- MIGRATION: Add checkout/order tables to existing Supabase DB
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Check if customers table exists and add missing columns
DO $$
BEGIN
    -- Add phone column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'phone') THEN
        ALTER TABLE customers ADD COLUMN phone TEXT UNIQUE;
    END IF;
    -- Add verified column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'verified') THEN
        ALTER TABLE customers ADD COLUMN verified BOOLEAN DEFAULT FALSE;
    END IF;
    -- Add email column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'email') THEN
        ALTER TABLE customers ADD COLUMN email TEXT;
    END IF;
    -- Add first_name column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'first_name') THEN
        ALTER TABLE customers ADD COLUMN first_name TEXT;
    END IF;
    -- Add last_name column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'last_name') THEN
        ALTER TABLE customers ADD COLUMN last_name TEXT;
    END IF;
    -- Add auth_user_id column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'auth_user_id') THEN
        ALTER TABLE customers ADD COLUMN auth_user_id UUID;
    END IF;
END $$;

-- 2. Create orders table (safe to run — IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'pending', 'paid', 'shipped', 'delivered', 'cancelled')),
    shipping_address JSONB,
    payment_method TEXT DEFAULT 'credit_card'
        CHECK (payment_method IN ('bank_transfer', 'credit_card')),
    payment_token TEXT,
    payment_id TEXT,
    total INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'TRY',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 3. Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name TEXT,
    size TEXT,
    color TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Done! Tables are ready for checkout.
