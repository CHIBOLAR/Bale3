-- ============================================
-- Check for Orphaned Accounts
-- ============================================
-- This checks if there are any accounts in auth.users that don't have
-- corresponding records in the users table (orphaned accounts)

-- Find orphaned accounts (accounts without user profiles)
SELECT
  au.id,
  au.email,
  au.created_at,
  'ORPHANED - No user profile' as status
FROM auth.users au
LEFT JOIN users u ON u.auth_user_id = au.id
WHERE u.id IS NULL
ORDER BY au.created_at DESC;

-- Expected result AFTER auth hook implementation:
-- Should return 0 rows (no orphaned accounts)

-- Additional check: Show all users with their status
SELECT
  au.email as auth_email,
  u.email as profile_email,
  u.role,
  c.name as company_name,
  au.created_at,
  CASE
    WHEN u.id IS NULL THEN '❌ ORPHANED'
    ELSE '✅ Complete'
  END as status
FROM auth.users au
LEFT JOIN users u ON u.auth_user_id = au.id
LEFT JOIN companies c ON c.id = u.company_id
ORDER BY au.created_at DESC;
