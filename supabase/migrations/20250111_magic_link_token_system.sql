-- Migration: Magic Link Token System
-- Adds token-based invites, invite requests table, and role system

-- Add token column to invites table (unique tokens for magic links)
ALTER TABLE invites
  ADD COLUMN IF NOT EXISTS token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);

-- Create invite_requests table for website access requests
CREATE TABLE IF NOT EXISTS invite_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  generated_invite_id UUID REFERENCES invites(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for invite_requests
CREATE INDEX IF NOT EXISTS idx_invite_requests_status ON invite_requests(status);
CREATE INDEX IF NOT EXISTS idx_invite_requests_email ON invite_requests(email);
CREATE INDEX IF NOT EXISTS idx_invite_requests_requested_at ON invite_requests(requested_at DESC);

-- Add role column to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer'
  CHECK (role IN ('super_admin', 'field_agent', 'admin', 'customer'));

-- Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Comments for documentation
COMMENT ON COLUMN invites.token IS 'Unique token for magic link authentication (replaces manual code entry)';
COMMENT ON COLUMN invites.phone IS 'Phone number for WhatsApp invite delivery';
COMMENT ON TABLE invite_requests IS 'Stores access requests from the public website';
COMMENT ON COLUMN users.role IS 'User role: super_admin (full access), field_agent (can generate invites), admin (company admin), customer (regular user)';

-- RLS Policies for invite_requests
ALTER TABLE invite_requests ENABLE ROW LEVEL SECURITY;

-- Super admins and field agents can view all requests
CREATE POLICY "Super admins can view all invite requests"
  ON invite_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'field_agent')
    )
  );

-- Super admins can update requests (approve/reject)
CREATE POLICY "Super admins can update invite requests"
  ON invite_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Anyone can create an invite request (public form)
CREATE POLICY "Anyone can create invite requests"
  ON invite_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
