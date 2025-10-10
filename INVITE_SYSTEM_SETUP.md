# Invite System - Quick Setup

## What Was Added

### 1. Database (Run this in Supabase Studio SQL Editor)
Open **Supabase Studio** → SQL Editor → Run `ADD_INVITE_SYSTEM.sql`

This creates:
- `invites` table with platform & staff invite types
- Helper functions to create/accept invites
- `is_super_admin` flag on users table

### 2. Signup Page Updated
- Now requires invite code (12-character code)
- Invite-only platform

## How to Use

### Step 1: Run the SQL Script
1. Open http://localhost:54323 (Supabase Studio)
2. Click "SQL Editor" → "New Query"
3. Copy contents from `ADD_INVITE_SYSTEM.sql`
4. Click "Run"

### Step 2: Create Your First Platform Invite (Manual)
Run this in SQL Editor to create an invite:

```sql
-- Create a platform invite
SELECT create_platform_invite(
    'user@example.com',  -- Email
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1),  -- Your admin user ID
    '{"note": "First invite"}'::jsonb  -- Optional metadata
);
```

Copy the returned `code` value (12 characters).

### Step 3: Test Signup
1. Go to http://localhost:3000/signup
2. Enter the invite code
3. Fill in company & user details
4. Complete signup

## Quick Reference

### Create Platform Invite (SQL)
```sql
SELECT create_platform_invite('email@example.com', 'YOUR_USER_ID'::uuid);
```

### Create Staff Invite (Future - via UI)
Owners will be able to invite staff through the dashboard.

### Check All Invites
```sql
SELECT code, email, invite_type, status, expires_at
FROM invites
ORDER BY created_at DESC;
```

### Mark User as Super Admin
```sql
UPDATE users
SET is_super_admin = true
WHERE email = 'your@email.com';
```

## Files Modified
- `ADD_INVITE_SYSTEM.sql` - Database setup
- `app/(auth)/signup/page.tsx` - Invite code required
- `GOOGLE_OAUTH_SETUP.md` - Google OAuth guide

## Google OAuth Status
✅ Code integrated (login/signup buttons added)
⚠️ Needs manual Supabase Studio configuration:
1. Open http://localhost:54323
2. Authentication → Providers → Enable Google
3. Add Client ID & Secret from `.env.local`

## Next Steps
1. Run `ADD_INVITE_SYSTEM.sql` in Supabase Studio
2. Create your first invite (SQL above)
3. Test signup with invite code
4. Configure Google OAuth (optional, see GOOGLE_OAUTH_SETUP.md)
5. Build staff invite UI (dashboard feature)

---
Done! Platform is now invite-only. 🎉
