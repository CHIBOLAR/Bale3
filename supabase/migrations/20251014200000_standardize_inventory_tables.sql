-- Migration: Standardize inventory table names to use plural form
-- Date: 2025-10-14
-- Description: Ensures all inventory tables use consistent plural naming

-- Check if goods_receipt exists (singular) and rename to goods_receipts (plural)
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'goods_receipt'
    ) THEN
        ALTER TABLE goods_receipt RENAME TO goods_receipts;
        RAISE NOTICE 'Renamed goods_receipt to goods_receipts';
    END IF;
END $$;

-- Ensure goods_dispatches exists (should already be plural)
-- This is just a validation check
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'goods_dispatches'
    ) THEN
        RAISE EXCEPTION 'Table goods_dispatches not found - check schema';
    END IF;
END $$;

-- Ensure barcode_batches exists (should already be plural)
-- This is just a validation check
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'barcode_batches'
    ) THEN
        RAISE EXCEPTION 'Table barcode_batches not found - check schema';
    END IF;
END $$;

-- Update any foreign key constraints that reference goods_receipt
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Find all constraints referencing the old table name
    FOR constraint_record IN
        SELECT
            tc.table_name,
            tc.constraint_name,
            kcu.column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND kcu.table_name IN ('stock_units', 'goods_receipt_items')
            AND kcu.column_name LIKE '%receipt%'
    LOOP
        RAISE NOTICE 'Found foreign key: % on table % column %',
            constraint_record.constraint_name,
            constraint_record.table_name,
            constraint_record.column_name;
    END LOOP;
END $$;

-- Add comment for documentation
COMMENT ON TABLE goods_receipts IS 'Standardized plural naming - tracks incoming inventory transactions';
COMMENT ON TABLE goods_dispatches IS 'Tracks outgoing inventory transactions';
COMMENT ON TABLE barcode_batches IS 'Tracks QR code generation batches';
