-- Quick add invite system to existing database
-- Run this directly in Supabase Studio SQL Editor

-- Add is_super_admin flag to users table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'is_super_admin') THEN
        ALTER TABLE users ADD COLUMN is_super_admin BOOLEAN NOT NULL DEFAULT false;
        CREATE INDEX idx_users_is_super_admin ON users(is_super_admin) WHERE is_super_admin = true;
    END IF;
END $$;

-- Create invites table
CREATE TABLE IF NOT EXISTS invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_type TEXT NOT NULL CHECK (invite_type IN ('platform', 'staff')),
    code TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    role TEXT CHECK (role IN ('admin', 'staff')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    invited_by UUID NOT NULL,
    accepted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_platform_invite CHECK (
        (invite_type = 'platform' AND company_id IS NULL AND warehouse_id IS NULL AND role IS NULL) OR
        (invite_type = 'staff' AND company_id IS NOT NULL AND role IS NOT NULL)
    )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(code);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_company_id ON invites(company_id);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
CREATE INDEX IF NOT EXISTS idx_invites_invite_type ON invites(invite_type);
CREATE INDEX IF NOT EXISTS idx_invites_invited_by ON invites(invited_by);
CREATE INDEX IF NOT EXISTS idx_invites_expires_at ON invites(expires_at);

-- Enable RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "public_view_invite_by_code" ON invites;
CREATE POLICY "public_view_invite_by_code" ON invites
    FOR SELECT
    USING (
        status = 'pending'
        AND expires_at > NOW()
    );

-- Helper functions
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 12));
        SELECT EXISTS(SELECT 1 FROM invites WHERE invites.code = code) INTO code_exists;
        EXIT WHEN NOT code_exists;
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION accept_invite(
    p_invite_code TEXT,
    p_auth_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_invite RECORD;
BEGIN
    SELECT * INTO v_invite
    FROM invites
    WHERE code = p_invite_code
    AND status = 'pending'
    AND expires_at > NOW();

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invite code');
    END IF;

    UPDATE invites
    SET status = 'accepted', accepted_at = NOW(), updated_at = NOW()
    WHERE id = v_invite.id;

    RETURN jsonb_build_object(
        'success', true,
        'invite', jsonb_build_object(
            'id', v_invite.id,
            'invite_type', v_invite.invite_type,
            'email', v_invite.email,
            'company_id', v_invite.company_id,
            'warehouse_id', v_invite.warehouse_id,
            'role', v_invite.role
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_staff_invite(
    p_email TEXT,
    p_company_id UUID,
    p_warehouse_id UUID,
    p_role TEXT,
    p_invited_by UUID,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
    v_code TEXT;
    v_invite_id UUID;
BEGIN
    v_code := generate_invite_code();
    INSERT INTO invites (invite_type, code, email, company_id, warehouse_id, role, invited_by, metadata)
    VALUES ('staff', v_code, p_email, p_company_id, p_warehouse_id, p_role, p_invited_by, p_metadata)
    RETURNING id INTO v_invite_id;
    RETURN jsonb_build_object('success', true, 'invite_id', v_invite_id, 'code', v_code, 'email', p_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_platform_invite(
    p_email TEXT,
    p_invited_by UUID,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
    v_code TEXT;
    v_invite_id UUID;
BEGIN
    v_code := generate_invite_code();
    INSERT INTO invites (invite_type, code, email, invited_by, metadata)
    VALUES ('platform', v_code, p_email, p_invited_by, p_metadata)
    RETURNING id INTO v_invite_id;
    RETURN jsonb_build_object('success', true, 'invite_id', v_invite_id, 'code', v_code, 'email', p_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Invite system installed successfully!';
END $$;
