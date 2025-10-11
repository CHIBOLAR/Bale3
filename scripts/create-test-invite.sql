-- Quick SQL to create a test invite
-- Replace 'your@email.com' with the email you want to invite

INSERT INTO invites (email, code, invite_type, status, expires_at)
VALUES (
  'your@email.com',  -- Change this to the email you want to invite
  LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0'),  -- Random 4-digit code
  'platform',
  'pending',
  NOW() + INTERVAL '7 days'
)
RETURNING
  email,
  code,
  'Magic Link: http://localhost:3000/signup?invite=' || code || '&email=' || email as magic_link,
  expires_at;

-- Example output:
-- email: your@email.com
-- code: 1234
-- magic_link: http://localhost:3000/signup?invite=1234&email=your@email.com
-- expires_at: 2025-10-17 16:45:00
