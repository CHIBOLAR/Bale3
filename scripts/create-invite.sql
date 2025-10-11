-- =====================================================
-- QUICK INVITE CREATION SCRIPT
-- =====================================================
-- Run this in Supabase Studio SQL Editor
-- This script provides quick commands to create invites
-- =====================================================

-- =====================================================
-- OPTION 1: CREATE PLATFORM INVITE (For New Companies)
-- =====================================================
-- Replace 'email@example.com' with the actual email
-- Replace 'YOUR_USER_ID' with a super admin or admin user ID

SELECT create_platform_invite(
    'email@example.com'::TEXT,
    'YOUR_USER_ID'::UUID
);

-- The function returns JSON with the invite code
-- Example result:
-- {
--   "success": true,
--   "invite_id": "uuid-here",
--   "code": "ABC123DEF456",
--   "email": "email@example.com"
-- }


-- =====================================================
-- OPTION 2: CREATE STAFF INVITE (For Existing Companies)
-- =====================================================
-- Replace values with actual data:
--   - email@example.com: Staff member's email
--   - COMPANY_ID: The company UUID they're joining
--   - WAREHOUSE_ID: The warehouse they'll be assigned to
--   - 'admin' or 'staff': Their role
--   - INVITED_BY_USER_ID: Admin user who is creating the invite

SELECT create_staff_invite(
    'email@example.com'::TEXT,
    'COMPANY_ID'::UUID,
    'WAREHOUSE_ID'::UUID,
    'staff'::TEXT,
    'INVITED_BY_USER_ID'::UUID
);

-- Example result:
-- {
--   "success": true,
--   "invite_id": "uuid-here",
--   "code": "XYZ789GHI012",
--   "email": "email@example.com"
-- }


-- =====================================================
-- HELPER QUERIES
-- =====================================================

-- Get all admin users (to use as invited_by)
SELECT id, email, company_id, role, is_super_admin
FROM users
WHERE role = 'admin' OR is_super_admin = true
ORDER BY is_super_admin DESC, created_at;

-- Get all companies
SELECT id, name, created_at
FROM companies
ORDER BY created_at DESC;

-- Get all warehouses for a specific company
SELECT id, name, company_id, address
FROM warehouses
WHERE company_id = 'YOUR_COMPANY_ID'::UUID
ORDER BY created_at;

-- List all pending invites
SELECT
    code,
    email,
    invite_type,
    status,
    role,
    expires_at,
    created_at
FROM invites
WHERE status = 'pending'
AND expires_at > NOW()
ORDER BY created_at DESC;

-- List all invites (including expired and accepted)
SELECT
    code,
    email,
    invite_type,
    status,
    role,
    expires_at,
    accepted_at,
    created_at
FROM invites
ORDER BY created_at DESC
LIMIT 50;

-- Check a specific invite by code
SELECT
    i.code,
    i.email,
    i.invite_type,
    i.status,
    i.role,
    i.expires_at,
    i.accepted_at,
    i.created_at,
    c.name as company_name,
    w.name as warehouse_name
FROM invites i
LEFT JOIN companies c ON i.company_id = c.id
LEFT JOIN warehouses w ON i.warehouse_id = w.id
WHERE i.code = 'YOUR_INVITE_CODE'::TEXT;

-- Revoke an invite
UPDATE invites
SET status = 'revoked',
    updated_at = NOW()
WHERE code = 'YOUR_INVITE_CODE'::TEXT
AND status = 'pending';

-- Expire old invites (run periodically)
SELECT expire_old_invites();

-- Get invite statistics
SELECT
    invite_type,
    status,
    COUNT(*) as count
FROM invites
GROUP BY invite_type, status
ORDER BY invite_type, status;


-- =====================================================
-- EXAMPLE WORKFLOW: CREATE FIRST PLATFORM INVITE
-- =====================================================

-- Step 1: Get the first admin user ID
-- (Copy the 'id' value from the result)
SELECT id, email, is_super_admin
FROM users
WHERE role = 'admin'
ORDER BY created_at
LIMIT 1;

-- Step 2: Create the platform invite
-- Replace 'ADMIN_USER_ID_FROM_STEP_1' with the actual ID from step 1
SELECT create_platform_invite(
    'newuser@example.com'::TEXT,
    'ADMIN_USER_ID_FROM_STEP_1'::UUID
);

-- Step 3: Copy the invite code from the result
-- Share it with the user at newuser@example.com


-- =====================================================
-- EXAMPLE WORKFLOW: CREATE STAFF INVITE
-- =====================================================

-- Step 1: Get company ID
SELECT id, name FROM companies WHERE name ILIKE '%company name%';

-- Step 2: Get warehouse ID for that company
-- Replace 'COMPANY_ID_FROM_STEP_1'
SELECT id, name FROM warehouses WHERE company_id = 'COMPANY_ID_FROM_STEP_1'::UUID;

-- Step 3: Get admin user ID from that company
-- Replace 'COMPANY_ID_FROM_STEP_1'
SELECT id, email FROM users
WHERE company_id = 'COMPANY_ID_FROM_STEP_1'::UUID
AND role = 'admin';

-- Step 4: Create the staff invite
-- Replace all the IDs from previous steps
SELECT create_staff_invite(
    'staffmember@example.com'::TEXT,
    'COMPANY_ID'::UUID,
    'WAREHOUSE_ID'::UUID,
    'staff'::TEXT,
    'ADMIN_USER_ID'::UUID
);

-- Step 5: Share the invite code with the staff member


-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

-- If you get "function does not exist" error, run the invite system migration:
-- npx supabase db reset (local)
-- or apply migration 0020_invite_system.sql to production

-- Check if invite functions exist:
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%invite%';

-- Expected functions:
-- - generate_invite_code
-- - create_platform_invite
-- - create_staff_invite
-- - accept_invite
-- - expire_old_invites
