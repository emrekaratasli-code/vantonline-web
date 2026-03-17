-- ============================================================
-- FIX: Add missing columns to existing orders table
-- Run in Supabase SQL Editor
-- ============================================================

-- Add payment_method column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'credit_card';

-- Add payment_token column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_token TEXT;

-- Add payment_id column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- Add shipping_address column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;

-- Add currency column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'TRY';

-- Add total column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total INTEGER DEFAULT 0;

-- Add updated_at column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Fix order_items too
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price INTEGER DEFAULT 0;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Done! Try checkout again.
