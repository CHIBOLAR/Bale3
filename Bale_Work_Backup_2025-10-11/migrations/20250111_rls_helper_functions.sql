-- Migration: RLS Helper Functions
-- Description: Creates helper functions used by RLS policies
-- Created: 2025-01-11

-- =====================================================
-- HELPER FUNCTIONS FOR RLS POLICIES
-- =====================================================

-- Get the company ID for the current authenticated user
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT company_id
        FROM users
        WHERE auth_user_id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if current user is a company admin
CREATE OR REPLACE FUNCTION is_company_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM users
        WHERE auth_user_id = auth.uid()
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get the warehouse ID for the current authenticated user
CREATE OR REPLACE FUNCTION get_user_warehouse_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT warehouse_id
        FROM users
        WHERE auth_user_id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Add helpful comments
COMMENT ON FUNCTION get_user_company_id() IS 'Returns the company_id for the current authenticated user';
COMMENT ON FUNCTION is_company_admin() IS 'Returns true if the current user has admin role';
COMMENT ON FUNCTION get_user_warehouse_id() IS 'Returns the warehouse_id for the current authenticated user';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE '✅ RLS helper functions created successfully!';
END $$;
