-- ============================================================
-- MIGRATION: Add stock tracking to products table
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- 1. Add stock_quantity column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_quantity') THEN
        ALTER TABLE products ADD COLUMN stock_quantity INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Create RPC function to safely decrement stock and update is_out_of_stock
-- This function returns FALSE when stock is insufficient.
CREATE OR REPLACE FUNCTION decrement_product_stock(
    p_product_id UUID,
    p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_stock INTEGER;
BEGIN
    IF p_quantity IS NULL OR p_quantity <= 0 THEN
        RETURN FALSE;
    END IF;

    SELECT stock_quantity INTO v_current_stock
    FROM products
    WHERE id = p_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    IF v_current_stock IS NULL OR v_current_stock < p_quantity THEN
        RETURN FALSE;
    END IF;

    UPDATE products
    SET
        stock_quantity = stock_quantity - p_quantity,
        is_out_of_stock = (stock_quantity - p_quantity = 0),
        updated_at = NOW()
    WHERE id = p_product_id;

    RETURN TRUE;
END;
$$;

-- Done! Stock management is ready.