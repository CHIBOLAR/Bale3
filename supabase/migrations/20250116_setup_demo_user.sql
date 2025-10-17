-- Create demo user account for public access
-- This user has read-only access to demo data

-- First, ensure the demo company exists
DO $$
DECLARE
  demo_company_id UUID;
BEGIN
  -- Get or create demo company
  SELECT id INTO demo_company_id FROM companies WHERE is_demo = true LIMIT 1;

  IF demo_company_id IS NULL THEN
    INSERT INTO companies (name, is_demo, is_active)
    VALUES ('Demo Fabric Company', true, true)
    RETURNING id INTO demo_company_id;
  END IF;

  -- Note: The actual auth user must be created through Supabase Dashboard or Auth API
  -- because we cannot directly insert into auth.users from SQL

  -- After creating the auth user through the dashboard with:
  -- Email: demo@bale.inventory
  -- Password: demo1234
  -- You need to get the auth user ID and update this query:

  -- Create or update the demo user record in the users table
  -- Replace 'YOUR_AUTH_USER_ID' with the actual auth user ID from Supabase Dashboard

  RAISE NOTICE 'Demo company ID: %', demo_company_id;
  RAISE NOTICE 'Please create auth user in Supabase Dashboard:';
  RAISE NOTICE 'Email: demo@bale.inventory';
  RAISE NOTICE 'Password: demo1234';
  RAISE NOTICE 'Then link to company_id: %', demo_company_id;

END $$;

-- Template for linking the auth user after creation:
--
-- INSERT INTO users (
--   company_id,
--   auth_user_id,
--   email,
--   first_name,
--   last_name,
--   role,
--   is_active,
--   is_demo
-- ) VALUES (
--   (SELECT id FROM companies WHERE is_demo = true LIMIT 1),
--   'YOUR_AUTH_USER_ID_HERE',
--   'demo@bale.inventory',
--   'Demo',
--   'User',
--   'admin',
--   true,
--   true
-- )
-- ON CONFLICT (auth_user_id) DO UPDATE SET
--   company_id = EXCLUDED.company_id,
--   email = EXCLUDED.email,
--   is_demo = true,
--   is_active = true;
