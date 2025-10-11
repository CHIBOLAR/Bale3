-- Migration: Demo System RLS Policies
-- Description: Updates RLS policies to support demo users with read-only access
-- Created: 2025-01-11

-- =====================================================
-- HELPER FUNCTION FOR DEMO USERS
-- =====================================================

-- Check if current user is a demo user
CREATE OR REPLACE FUNCTION is_demo_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE users.auth_user_id = auth.uid()
        AND users.is_demo = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get demo company ID
CREATE OR REPLACE FUNCTION get_demo_company_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT id FROM companies WHERE is_demo = TRUE LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PRODUCTS TABLE - UPDATE POLICIES
-- =====================================================

-- Drop and recreate SELECT policy to include demo access
DROP POLICY IF EXISTS "Users can view products in their company" ON products;

CREATE POLICY "Users can view products in their company"
ON products
FOR SELECT
TO authenticated
USING (
    -- Demo users see demo company products
    (is_demo_user() AND company_id = get_demo_company_id())
    OR
    -- Normal users see their own company products
    (NOT is_demo_user() AND company_id = get_user_company_id())
);

-- Update INSERT policy to block demo users
DROP POLICY IF EXISTS "Company admins can manage products" ON products;

CREATE POLICY "Company admins can manage products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
);

-- Update UPDATE policy to block demo users
DROP POLICY IF EXISTS "Company admins can update products" ON products;

CREATE POLICY "Company admins can update products"
ON products
FOR UPDATE
TO authenticated
USING (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
)
WITH CHECK (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
);

-- Update DELETE policy to block demo users
DROP POLICY IF EXISTS "Company admins can delete products" ON products;

CREATE POLICY "Company admins can delete products"
ON products
FOR DELETE
TO authenticated
USING (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
);

-- =====================================================
-- STOCK UNITS TABLE - UPDATE POLICIES
-- =====================================================

-- Drop and recreate SELECT policy to include demo access
DROP POLICY IF EXISTS "Users can view stock units in their scope" ON stock_units;

CREATE POLICY "Users can view stock units in their scope"
ON stock_units
FOR SELECT
TO authenticated
USING (
    -- Demo users see demo company stock units
    (is_demo_user() AND company_id = get_demo_company_id())
    OR
    -- Normal users see their own scope
    (NOT is_demo_user() AND company_id = get_user_company_id() AND (
        is_company_admin() OR warehouse_id = get_user_warehouse_id()
    ))
);

-- Update INSERT policy to block demo users
DROP POLICY IF EXISTS "Users can create stock units in their scope" ON stock_units;

CREATE POLICY "Users can create stock units in their scope"
ON stock_units
FOR INSERT
TO authenticated
WITH CHECK (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND (
        is_company_admin() OR warehouse_id = get_user_warehouse_id()
    )
);

-- Update UPDATE policy to block demo users
DROP POLICY IF EXISTS "Users can update stock units in their scope" ON stock_units;

CREATE POLICY "Users can update stock units in their scope"
ON stock_units
FOR UPDATE
TO authenticated
USING (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND (
        is_company_admin() OR warehouse_id = get_user_warehouse_id()
    )
)
WITH CHECK (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND (
        is_company_admin() OR warehouse_id = get_user_warehouse_id()
    )
);

-- Update DELETE policy to block demo users
DROP POLICY IF EXISTS "Users can delete stock units in their scope" ON stock_units;

CREATE POLICY "Users can delete stock units in their scope"
ON stock_units
FOR DELETE
TO authenticated
USING (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND (
        is_company_admin() OR warehouse_id = get_user_warehouse_id()
    )
);

-- =====================================================
-- PARTNERS TABLE - UPDATE POLICIES
-- =====================================================

-- Drop and recreate SELECT policy to include demo access
DROP POLICY IF EXISTS "Users can view partners in their company" ON partners;

CREATE POLICY "Users can view partners in their company"
ON partners
FOR SELECT
TO authenticated
USING (
    -- Demo users see demo company partners
    (is_demo_user() AND company_id = get_demo_company_id())
    OR
    -- Normal users see their own company partners
    (NOT is_demo_user() AND company_id = get_user_company_id())
);

-- Update INSERT policy to block demo users
DROP POLICY IF EXISTS "Company admins can create partners" ON partners;

CREATE POLICY "Company admins can create partners"
ON partners
FOR INSERT
TO authenticated
WITH CHECK (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
);

-- Update UPDATE policy to block demo users
DROP POLICY IF EXISTS "Company admins can update partners" ON partners;

CREATE POLICY "Company admins can update partners"
ON partners
FOR UPDATE
TO authenticated
USING (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
)
WITH CHECK (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
);

-- Update DELETE policy to block demo users
DROP POLICY IF EXISTS "Company admins can delete partners" ON partners;

CREATE POLICY "Company admins can delete partners"
ON partners
FOR DELETE
TO authenticated
USING (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
);

-- =====================================================
-- WAREHOUSES TABLE - UPDATE POLICIES
-- =====================================================

-- Drop and recreate SELECT policy to include demo access
DROP POLICY IF EXISTS "Users can view warehouses in their company" ON warehouses;

CREATE POLICY "Users can view warehouses in their company"
ON warehouses
FOR SELECT
TO authenticated
USING (
    -- Demo users see demo company warehouses
    (is_demo_user() AND company_id = get_demo_company_id())
    OR
    -- Normal users see their own company warehouses
    (NOT is_demo_user() AND company_id = get_user_company_id())
);

-- Block demo users from creating warehouses
DROP POLICY IF EXISTS "Company admins can create warehouses" ON warehouses;

CREATE POLICY "Company admins can create warehouses"
ON warehouses
FOR INSERT
TO authenticated
WITH CHECK (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
);

-- Block demo users from updating warehouses
DROP POLICY IF EXISTS "Company admins can update warehouses" ON warehouses;

CREATE POLICY "Company admins can update warehouses"
ON warehouses
FOR UPDATE
TO authenticated
USING (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
)
WITH CHECK (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
);

-- Block demo users from deleting warehouses
DROP POLICY IF EXISTS "Company admins can delete warehouses" ON warehouses;

CREATE POLICY "Company admins can delete warehouses"
ON warehouses
FOR DELETE
TO authenticated
USING (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
);

-- =====================================================
-- SALES ORDERS TABLE - UPDATE POLICIES
-- =====================================================

-- Drop and recreate SELECT policy to include demo access
DROP POLICY IF EXISTS "Users can view sales orders in their company" ON sales_orders;

CREATE POLICY "Users can view sales orders in their company"
ON sales_orders
FOR SELECT
TO authenticated
USING (
    -- Demo users see demo company orders
    (is_demo_user() AND company_id = get_demo_company_id())
    OR
    -- Normal users see their own company orders
    (NOT is_demo_user() AND company_id = get_user_company_id())
);

-- Block demo users from creating orders
DROP POLICY IF EXISTS "Admins can create sales orders" ON sales_orders;

CREATE POLICY "Admins can create sales orders"
ON sales_orders
FOR INSERT
TO authenticated
WITH CHECK (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
);

-- Block demo users from updating orders
DROP POLICY IF EXISTS "Admins can update sales orders" ON sales_orders;

CREATE POLICY "Admins can update sales orders"
ON sales_orders
FOR UPDATE
TO authenticated
USING (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
)
WITH CHECK (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
);

-- Block demo users from deleting orders
DROP POLICY IF EXISTS "Admins can delete sales orders" ON sales_orders;

CREATE POLICY "Admins can delete sales orders"
ON sales_orders
FOR DELETE
TO authenticated
USING (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
);

-- =====================================================
-- SALES ORDER ITEMS TABLE - UPDATE POLICIES
-- =====================================================

-- Drop and recreate SELECT policy to include demo access
DROP POLICY IF EXISTS "Users can view order items in their company" ON sales_order_items;

CREATE POLICY "Users can view order items in their company"
ON sales_order_items
FOR SELECT
TO authenticated
USING (
    -- Demo users see demo company order items
    (is_demo_user() AND company_id = get_demo_company_id())
    OR
    -- Normal users see their own company order items
    (NOT is_demo_user() AND company_id = get_user_company_id())
);

-- Block demo users from modifying order items
DROP POLICY IF EXISTS "Admins can manage order items" ON sales_order_items;

CREATE POLICY "Admins can manage order items"
ON sales_order_items
FOR ALL
TO authenticated
USING (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
)
WITH CHECK (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
);

-- =====================================================
-- COMPANIES TABLE - READ-ONLY FOR DEMO
-- =====================================================

-- Demo users can view the demo company
DROP POLICY IF EXISTS "Users can view their company" ON companies;

CREATE POLICY "Users can view their company"
ON companies
FOR SELECT
TO authenticated
USING (
    -- Demo users see demo company
    (is_demo_user() AND id = get_demo_company_id())
    OR
    -- Normal users see their own company
    (NOT is_demo_user() AND id = get_user_company_id())
);

-- Only non-demo admins can update companies
DROP POLICY IF EXISTS "Admins can update their company" ON companies;

CREATE POLICY "Admins can update their company"
ON companies
FOR UPDATE
TO authenticated
USING (
    NOT is_demo_user() AND
    id = get_user_company_id() AND
    is_company_admin()
)
WITH CHECK (
    NOT is_demo_user() AND
    id = get_user_company_id() AND
    is_company_admin()
);

-- =====================================================
-- USERS TABLE - DEMO USERS READ-ONLY
-- =====================================================

-- Users can view other users in their company (including demo)
DROP POLICY IF EXISTS "Users can view users in their company" ON users;

CREATE POLICY "Users can view users in their company"
ON users
FOR SELECT
TO authenticated
USING (
    -- Demo users see demo company users
    (is_demo_user() AND company_id = get_demo_company_id())
    OR
    -- Normal users see their own company users
    (NOT is_demo_user() AND company_id = get_user_company_id())
);

-- Block demo users from creating users
DROP POLICY IF EXISTS "Admins can create users" ON users;

CREATE POLICY "Admins can create users"
ON users
FOR INSERT
TO authenticated
WITH CHECK (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
);

-- Block demo users from updating users
DROP POLICY IF EXISTS "Admins can update users" ON users;

CREATE POLICY "Admins can update users"
ON users
FOR UPDATE
TO authenticated
USING (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
)
WITH CHECK (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
);

-- Block demo users from deleting users
DROP POLICY IF EXISTS "Admins can delete users" ON users;

CREATE POLICY "Admins can delete users"
ON users
FOR DELETE
TO authenticated
USING (
    NOT is_demo_user() AND
    company_id = get_user_company_id() AND
    is_company_admin()
);

-- =====================================================
-- COMMENTS AND SUMMARY
-- =====================================================

COMMENT ON FUNCTION is_demo_user() IS 'Returns true if the current authenticated user is a demo user';
COMMENT ON FUNCTION get_demo_company_id() IS 'Returns the UUID of the demo company';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE '✅ Demo RLS policies updated successfully!';
    RAISE NOTICE 'Demo users now have read-only access to demo company data';
    RAISE NOTICE 'All write operations (INSERT/UPDATE/DELETE) are blocked for demo users';
END $$;
