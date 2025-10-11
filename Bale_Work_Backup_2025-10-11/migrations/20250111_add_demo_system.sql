-- Migration: Add Demo System Support
-- Description: Adds is_demo flags to companies and users tables, creates shared demo company
-- Created: 2025-01-11

-- Add is_demo flag to companies table
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

-- Add is_demo flag to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

-- Create the shared demo company and warehouse
DO $$
DECLARE
  demo_company_id UUID;
  demo_warehouse_id UUID;
BEGIN
  -- Check if demo company already exists
  SELECT id INTO demo_company_id
  FROM companies
  WHERE is_demo = TRUE
  LIMIT 1;

  -- Only create if it doesn't exist
  IF demo_company_id IS NULL THEN
    -- Create demo company
    INSERT INTO companies (name, is_demo, created_at)
    VALUES ('Bale Inventory - Demo Account', TRUE, NOW())
    RETURNING id INTO demo_company_id;

    -- Create demo warehouse
    INSERT INTO warehouses (company_id, name, city, state, country, created_at)
    VALUES (demo_company_id, 'Demo Warehouse - Mumbai', 'Mumbai', 'Maharashtra', 'India', NOW())
    RETURNING id INTO demo_warehouse_id;

    -- Print IDs for reference
    RAISE NOTICE 'Demo Company ID: %', demo_company_id;
    RAISE NOTICE 'Demo Warehouse ID: %', demo_warehouse_id;
  ELSE
    RAISE NOTICE 'Demo company already exists with ID: %', demo_company_id;
  END IF;
END $$;

-- Add helpful comments
COMMENT ON COLUMN companies.is_demo IS 'True for the shared demo company that all trial users access';
COMMENT ON COLUMN users.is_demo IS 'True for demo users who have read-only access to the demo company';

-- Create index for faster demo company lookups
CREATE INDEX IF NOT EXISTS idx_companies_is_demo ON companies(is_demo) WHERE is_demo = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_is_demo ON users(is_demo);
