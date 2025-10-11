-- Fix RLS policies for invites table to allow public access request submissions

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public insert for access requests" ON invites;
DROP POLICY IF EXISTS "Allow service role full access" ON invites;
DROP POLICY IF EXISTS "Users can view their own invites" ON invites;
DROP POLICY IF EXISTS "Admins can view all invites" ON invites;
DROP POLICY IF EXISTS "Admins can update invites" ON invites;

-- Enable RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- 1. Allow anonymous users to INSERT access requests (for /api/request-invite)
CREATE POLICY "Allow public insert for access requests"
ON invites
FOR INSERT
TO anon
WITH CHECK (
  invite_type = 'platform'
  AND status = 'pending'
  AND (metadata->>'request_type')::text = 'access_request'
);

-- 2. Allow service role full access (for API endpoints using service role key)
CREATE POLICY "Allow service role full access"
ON invites
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Allow authenticated users to view their own invites
CREATE POLICY "Users can view their own invites"
ON invites
FOR SELECT
TO authenticated
USING (
  auth.email() = email
);

-- 4. Allow admins to view all invites
CREATE POLICY "Admins can view all invites"
ON invites
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_user_id = auth.uid()
      AND users.role = 'admin'
      AND users.is_demo = false
  )
);

-- 5. Allow admins to update invites (approve/reject)
CREATE POLICY "Admins can update invites"
ON invites
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_user_id = auth.uid()
      AND users.role = 'admin'
      AND users.is_demo = false
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_user_id = auth.uid()
      AND users.role = 'admin'
      AND users.is_demo = false
  )
);

-- Verify policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'invites'
ORDER BY policyname;
