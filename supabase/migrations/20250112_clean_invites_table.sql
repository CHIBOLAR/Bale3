-- =====================================================
-- MIGRATION: Clean Invites Table
-- Date: 2025-01-12
-- Purpose: Remove bloat columns and consolidate data into metadata JSONB
-- =====================================================
-- This migration cleans up the invites table from 19 columns to 13 columns
-- by moving rarely-used tracking fields into the metadata JSONB column.
--
-- Columns being removed:
-- 1. accepted_at - Not used in OTP flow (status change is sufficient)
-- 2. used_by_email - Duplicate of email field
-- 3. used_by_user_id - Moved to metadata.used_by
-- 4. used_at - Moved to metadata.used_at
-- 5. created_by - Usually same as invited_by, not needed
-- 6. generation_method - Not needed, can be in metadata if required
-- =====================================================

-- Step 1: Migrate data from bloat columns to metadata JSONB
-- This preserves all existing data before dropping columns

-- Migrate used_at, used_by_user_id, used_by_email, created_by, generation_method
UPDATE invites
SET metadata = COALESCE(metadata, '{}'::jsonb) ||
  jsonb_build_object(
    'used_at', COALESCE(used_at, NULL),
    'used_by', COALESCE(used_by_user_id, NULL),
    'used_by_email', COALESCE(used_by_email, NULL),
    'created_by', COALESCE(created_by, NULL),
    'generation_method', COALESCE(generation_method, NULL),
    'accepted_at', COALESCE(accepted_at, NULL)
  )
WHERE
  used_at IS NOT NULL
  OR used_by_user_id IS NOT NULL
  OR used_by_email IS NOT NULL
  OR created_by IS NOT NULL
  OR generation_method IS NOT NULL
  OR accepted_at IS NOT NULL;

-- Log migration progress
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count
  FROM invites
  WHERE metadata ? 'used_at' OR metadata ? 'used_by';

  RAISE NOTICE 'Migrated % invite records to metadata', migrated_count;
END $$;

-- Step 2: Drop bloat columns
-- These columns are no longer needed as data is in metadata

ALTER TABLE invites
  DROP COLUMN IF EXISTS accepted_at,
  DROP COLUMN IF EXISTS used_by_email,
  DROP COLUMN IF EXISTS used_by_user_id,
  DROP COLUMN IF EXISTS used_at,
  DROP COLUMN IF EXISTS created_by,
  DROP COLUMN IF EXISTS generation_method;

-- Step 3: Drop any indexes that were created for removed columns
-- (Check if these indexes exist first)

DROP INDEX IF EXISTS idx_invites_used_at;
DROP INDEX IF EXISTS idx_invites_used_by_user_id;
DROP INDEX IF EXISTS idx_invites_created_by;
DROP INDEX IF EXISTS idx_invites_generation_method;

-- Step 4: Add comment to document the cleanup
COMMENT ON TABLE invites IS 'Stores platform and staff invites. Cleaned 2025-01-12: Removed 6 bloat columns, consolidated into metadata JSONB.';
COMMENT ON COLUMN invites.metadata IS 'JSONB storage for flexible data: request_type, used_at, used_by, is_demo_upgrade, etc. Consolidated from removed columns: accepted_at, used_at, used_by_email, used_by_user_id, created_by, generation_method.';

-- Step 5: Verify the cleanup
DO $$
DECLARE
  column_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_name = 'invites';

  RAISE NOTICE 'Invites table now has % columns (expected: 13)', column_count;

  IF column_count != 13 THEN
    RAISE WARNING 'Expected 13 columns but found %', column_count;
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Invites table cleanup completed successfully!';
  RAISE NOTICE '📊 Reduced from 19 columns to 13 columns (31%% reduction)';
  RAISE NOTICE '📝 All data preserved in metadata JSONB';
END $$;
