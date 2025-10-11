# Quick Test Guide - Auth Hook

## ✅ Status: Hook is ENABLED and DEPLOYED

---

## 🧪 Test Now (2 Simple Tests)

### Test 1: Uninvited User (Should BLOCK) ❌

**What to do:**
1. Open incognito browser
2. Go to: `http://localhost:3000/signup` (or your production URL)
3. Click "Sign in with Google"
4. Choose ANY Google account that you haven't invited

**Expected:**
- Google OAuth succeeds
- Supabase shows error: "No platform invitation found for [email]"
- No account created in `auth.users` ✓

**Check with SQL:**
```sql
-- Run in Supabase SQL Editor
SELECT email FROM auth.users WHERE email = 'the-email-you-tried@gmail.com';
-- Should return: 0 rows
```

---

### Test 2: Invited User (Should WORK) ✅

**Step 1: Create Test Invite**

Option A - Use the SQL script:
1. Open `scripts/create-test-invite.sql`
2. Change `'your-test-email@gmail.com'` to your test Google email
3. Run in Supabase SQL Editor
4. Note the invite code shown

Option B - Quick SQL (uses helper function):
```sql
-- Replace YOUR_EMAIL with your test Google email
SELECT create_platform_invite(
  'YOUR_EMAIL@gmail.com',
  (SELECT id FROM auth.users LIMIT 1)
);

-- Verify
SELECT email, code, status FROM invites WHERE email = 'YOUR_EMAIL@gmail.com';
```

**Step 2: Try Signup**
1. Open incognito browser
2. Go to: `http://localhost:3000/signup`
3. Click "Sign in with Google"
4. Choose the invited email

**Expected:**
- Google OAuth succeeds
- Auth hook validates → allows signup ✓
- Redirected to `/dashboard`
- Company, user, warehouse created

**Verify with SQL:**
```sql
-- Check everything was created
SELECT
  u.email,
  u.role,
  c.name as company,
  w.name as warehouse,
  i.status as invite_status,
  i.code as invite_code
FROM users u
JOIN companies c ON c.id = u.company_id
JOIN warehouses w ON w.company_id = c.id
JOIN auth.users au ON au.id = u.auth_user_id
LEFT JOIN invites i ON i.email = u.email
WHERE u.email = 'YOUR_EMAIL@gmail.com';

-- Should show:
-- email | role  | company      | warehouse      | invite_status | invite_code
-- your  | admin | Your Company | Main Warehouse | accepted      | ABC123XYZ
```

---

## 🔍 Check for Orphaned Accounts

**Run this after both tests:**

```bash
# Use the check script
code scripts/check-orphaned-accounts.sql
```

Or run directly:
```sql
-- Find orphaned accounts
SELECT au.email, au.created_at
FROM auth.users au
LEFT JOIN users u ON u.auth_user_id = au.id
WHERE u.id IS NULL;

-- Expected: 0 rows (no orphaned accounts)
```

---

## 📊 View Auth Hook Logs

Check what the hook is doing:

1. Go to: https://supabase.com/dashboard/project/xejyeglxigdeznfitaxc/functions/validate-signup/logs

2. Look for:
```
✅ "Validating signup for: email@example.com"
✅ "Valid invite found for: email@example.com | Invite Code: XXX"
❌ "No valid platform invite found for: email@example.com"
```

---

## 🎉 Success Criteria

After running both tests:

- ✅ Test 1: Blocked user has NO account in `auth.users`
- ✅ Test 2: Invited user has account + company + warehouse
- ✅ Zero orphaned accounts in database
- ✅ Hook logs show validation messages

---

## 🐛 If Something Goes Wrong

**Test 1 passes (uninvited user CAN signup):**
- Check hook is enabled in Dashboard
- Check function logs for errors
- Verify function deployed: `npx supabase functions list`

**Test 2 fails (invited user CANNOT signup):**
- Verify invite exists: `SELECT * FROM invites WHERE email = 'YOUR_EMAIL'`
- Check invite is `pending` and not expired
- Check function logs to see what hook found

**"Server configuration error":**
- Edge function missing env vars (should auto-populate)
- Check Dashboard → Functions → validate-signup → Settings

---

## ⏭️ After Testing

Once both tests pass, you're ready to move on to the next phase!

**Created**: January 10, 2025
