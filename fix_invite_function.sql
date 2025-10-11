-- Fix ambiguous column reference in generate_invite_code function
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
    v_code TEXT;
    v_code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 12-character code (alphanumeric, uppercase)
        v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 12));

        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM invites WHERE invites.code = v_code) INTO v_code_exists;

        -- Exit loop if code is unique
        EXIT WHEN NOT v_code_exists;
    END LOOP;

    RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
