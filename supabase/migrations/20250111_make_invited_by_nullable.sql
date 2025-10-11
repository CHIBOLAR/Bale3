-- Make invited_by column nullable
-- This column is only set when an admin approves the request
-- It should be NULL when the request is first created

ALTER TABLE invites
ALTER COLUMN invited_by DROP NOT NULL;
