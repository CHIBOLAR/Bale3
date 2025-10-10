-- =====================================================
-- INVITE SYSTEM
-- =====================================================
-- Supports two types of invites:
-- 1. Platform invites: For new companies to join (invite-only platform)
-- 2. Staff invites: For company owners to invite staff members
-- =====================================================

-- Create invites table
CREATE TABLE invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Invite type
    invite_type TEXT NOT NULL CHECK (invite_type IN ('platform', 'staff')),

    -- Invite code (unique, random)
    code TEXT NOT NULL UNIQUE,

    -- Invitee information
    email TEXT NOT NULL,

    -- For staff invites: which company they're being invited to
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

    -- For staff invites: which warehouse they'll be assigned to (optional)
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,

    -- For staff invites: role they'll be assigned
    role TEXT CHECK (role IN ('admin', 'staff')),

    -- Invite status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),

    -- Who created the invite
    invited_by UUID NOT NULL,

    -- When the invite was accepted
    accepted_at TIMESTAMPTZ,

    -- When the invite expires (48 hours by default)
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),

    -- Metadata (optional notes, custom message, etc.)
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_platform_invite CHECK (
        (invite_type = 'platform' AND company_id IS NULL AND warehouse_id IS NULL AND role IS NULL) OR
        (invite_type = 'staff' AND company_id IS NOT NULL AND role IS NOT NULL)
    )
);

-- Create indexes for performance
CREATE INDEX idx_invites_code ON invites(code);
CREATE INDEX idx_invites_email ON invites(email);
CREATE INDEX idx_invites_company_id ON invites(company_id);
CREATE INDEX idx_invites_status ON invites(status);
CREATE INDEX idx_invites_invite_type ON invites(invite_type);
CREATE INDEX idx_invites_invited_by ON invites(invited_by);
CREATE INDEX idx_invites_expires_at ON invites(expires_at);

-- Create updated_at trigger
CREATE TRIGGER set_invites_updated_at
    BEFORE UPDATE ON invites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Platform admins can manage platform invites
-- (For now, we'll use a super_admin flag in users table or hardcode specific user IDs)
CREATE POLICY "platform_admins_manage_platform_invites" ON invites
    FOR ALL
    USING (
        invite_type = 'platform'
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.auth_user_id = auth.uid()
            AND users.role = 'admin'
            -- Add additional check for super admin if needed
        )
    );

-- Company admins can create staff invites for their company
CREATE POLICY "company_admins_create_staff_invites" ON invites
    FOR INSERT
    WITH CHECK (
        invite_type = 'staff'
        AND company_id = auth.get_company_id()
        AND auth.get_user_role() = 'admin'
    );

-- Company admins can view staff invites for their company
CREATE POLICY "company_admins_view_staff_invites" ON invites
    FOR SELECT
    USING (
        invite_type = 'staff'
        AND company_id = auth.get_company_id()
        AND auth.get_user_role() = 'admin'
    );

-- Company admins can update their own staff invites
CREATE POLICY "company_admins_update_staff_invites" ON invites
    FOR UPDATE
    USING (
        invite_type = 'staff'
        AND company_id = auth.get_company_id()
        AND auth.get_user_role() = 'admin'
    )
    WITH CHECK (
        invite_type = 'staff'
        AND company_id = auth.get_company_id()
        AND auth.get_user_role() = 'admin'
    );

-- Anyone with a valid invite code can view it (for acceptance)
CREATE POLICY "public_view_invite_by_code" ON invites
    FOR SELECT
    USING (
        status = 'pending'
        AND expires_at > NOW()
    );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to generate a unique invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 12-character code (alphanumeric, uppercase)
        code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 12));

        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM invites WHERE invites.code = code) INTO code_exists;

        -- Exit loop if code is unique
        EXIT WHEN NOT code_exists;
    END LOOP;

    RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate and accept an invite
CREATE OR REPLACE FUNCTION accept_invite(
    p_invite_code TEXT,
    p_auth_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_invite RECORD;
    v_result JSONB;
BEGIN
    -- Get the invite
    SELECT * INTO v_invite
    FROM invites
    WHERE code = p_invite_code
    AND status = 'pending'
    AND expires_at > NOW();

    -- Check if invite exists and is valid
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid or expired invite code'
        );
    END IF;

    -- Mark invite as accepted
    UPDATE invites
    SET status = 'accepted',
        accepted_at = NOW(),
        updated_at = NOW()
    WHERE id = v_invite.id;

    -- Return invite details
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

-- Function to create a staff invite
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
    -- Generate unique code
    v_code := generate_invite_code();

    -- Create invite
    INSERT INTO invites (
        invite_type,
        code,
        email,
        company_id,
        warehouse_id,
        role,
        invited_by,
        metadata
    ) VALUES (
        'staff',
        v_code,
        p_email,
        p_company_id,
        p_warehouse_id,
        p_role,
        p_invited_by,
        p_metadata
    ) RETURNING id INTO v_invite_id;

    -- Return invite details
    RETURN jsonb_build_object(
        'success', true,
        'invite_id', v_invite_id,
        'code', v_code,
        'email', p_email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a platform invite
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
    -- Generate unique code
    v_code := generate_invite_code();

    -- Create invite
    INSERT INTO invites (
        invite_type,
        code,
        email,
        invited_by,
        metadata
    ) VALUES (
        'platform',
        v_code,
        p_email,
        p_invited_by,
        p_metadata
    ) RETURNING id INTO v_invite_id;

    -- Return invite details
    RETURN jsonb_build_object(
        'success', true,
        'invite_id', v_invite_id,
        'code', v_code,
        'email', p_email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire old invites (run via cron or manually)
CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE invites
    SET status = 'expired',
        updated_at = NOW()
    WHERE status = 'pending'
    AND expires_at < NOW();

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ADD SUPER ADMIN FLAG TO USERS TABLE
-- =====================================================
-- Add is_super_admin flag for platform-level admin access
ALTER TABLE users ADD COLUMN is_super_admin BOOLEAN NOT NULL DEFAULT false;

-- Create index for super admin lookups
CREATE INDEX idx_users_is_super_admin ON users(is_super_admin) WHERE is_super_admin = true;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE invites IS 'Stores platform and staff invites for controlled access';
COMMENT ON COLUMN invites.invite_type IS 'Type: platform (for new companies) or staff (for existing company)';
COMMENT ON COLUMN invites.code IS 'Unique invite code shared with invitee';
COMMENT ON COLUMN invites.status IS 'Status: pending, accepted, expired, revoked';
COMMENT ON FUNCTION generate_invite_code() IS 'Generates a unique 12-character invite code';
COMMENT ON FUNCTION accept_invite(TEXT, UUID) IS 'Validates and accepts an invite code';
COMMENT ON FUNCTION create_staff_invite(TEXT, UUID, UUID, TEXT, UUID, JSONB) IS 'Creates a staff invite for a company';
COMMENT ON FUNCTION create_platform_invite(TEXT, UUID, JSONB) IS 'Creates a platform invite for new company signup';
