-- Migration: Update invites table to support generic single-use codes
-- These codes are not tied to emails initially, anyone can use them

-- Make email nullable (codes can be generic now)
ALTER TABLE invites
  ALTER COLUMN email DROP NOT NULL;

-- Add tracking fields
ALTER TABLE invites
  ADD COLUMN IF NOT EXISTS used_by_email TEXT,
  ADD COLUMN IF NOT EXISTS used_by_user_id UUID,
  ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS generation_method TEXT DEFAULT 'manual'; -- 'manual', 'admin_dashboard', 'api'

-- Add index for faster code lookups
CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(code);
CREATE INDEX IF NOT EXISTS idx_invites_status_expires ON invites(status, expires_at);

-- Update existing invites to have proper status
UPDATE invites
SET status = 'used'
WHERE status = 'accepted';

-- Comments
COMMENT ON COLUMN invites.email IS 'Optional: Pre-assigned email for targeted invites. NULL for generic codes.';
COMMENT ON COLUMN invites.used_by_email IS 'Email of the user who actually used this code';
COMMENT ON COLUMN invites.used_by_user_id IS 'Auth user ID who used this code';
COMMENT ON COLUMN invites.generation_method IS 'How this invite was created: manual, admin_dashboard, api';
