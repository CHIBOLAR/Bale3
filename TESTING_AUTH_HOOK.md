# Testing Auth Hook Implementation

## 🎯 What We're Testing

The auth hook should **prevent account creation** for users without valid invites.

---

## ⚠️ FIRST: Enable the Auth Hook

**You MUST do this before testing!**

1. Go to: https://supabase.com/dashboard/project/xejyeglxigdeznfitaxc/authentication/hooks
2. Find: **"Validate a user's sign-up"**
3. Click **Enable Hook**
4. Select: **`validate-signup`** from dropdown
5. Click **Save**

✅ Verify it shows: `Status: Enabled`

---

## 🧪 Test Scenarios

### Test 1: User WITHOUT Invite (Should FAIL) ❌

**Goal**: Verify auth hook blocks signup for uninvited emails

**Steps**:
1. Open incognito/private browser window
2. Go to: http://localhost:3000/signup (or your production URL)
3. Click **"Sign in with Google"**
4. Select a Google account with email: `test-no-invite@gmail.com` (or any email NOT in invites table)

**Expected Result**:
- Google OAuth completes successfully
- But Supabase shows error message
- Error: "No platform invitation found for test-no-invite@gmail.com"
- You're redirected back to signup page
- **Account is NOT created in auth.users table** 🎉

**Verify**:
```sql
-- Check auth.users table in Supabase Dashboard
SELECT email FROM auth.users WHERE email = 'test-no-invite@gmail.com';
-- Should return: 0 rows
```

---

### Test 2: User WITH Valid Invite (Should SUCCEED) ✅

**Goal**: Verify auth hook allows signup for invited emails

**Steps**:

#### 2.1: Create a Platform Invite
```sql
-- Run this in Supabase SQL Editor
-- Replace with YOUR actual user ID (from auth.users or users table)
SELECT create_platform_invite('invited-user@gmail.com', 'YOUR_USER_ID'::uuid);
```

This returns an invite code like: `7DBF2F52C315`

**Or create invite manually**:
```sql
INSERT INTO invites (
  email,
  invite_code,
  invite_type,
  status,
  expires_at,
  invited_by
) VALUES (
  'invited-user@gmail.com',
  'TEST12345678',
  'platform',
  'pending',
  NOW() + INTERVAL '48 hours',
  'YOUR_USER_ID'::uuid
);
```

#### 2.2: Verify Invite Exists
```sql
SELECT email, invite_code, status, expires_at
FROM invites
WHERE email = 'invited-user@gmail.com' AND status = 'pending';
```

Should return your invite.

#### 2.3: Try Signing Up
1. Open incognito/private browser window
2. Go to: http://localhost:3000/signup
3. Click **"Sign in with Google"**
4. Select Google account: `invited-user@gmail.com`

**Expected Result**:
- Google OAuth completes
- Auth hook validates invite → ALLOWS signup ✅
- Account created in auth.users
- Callback creates company, user, warehouse
- Redirected to: http://localhost:3000/dashboard
- You see dashboard with company name

**Verify**:
```sql
-- 1. Check auth.users
SELECT id, email FROM auth.users WHERE email = 'invited-user@gmail.com';
-- Should return: 1 row

-- 2. Check invite was marked accepted
SELECT status, accepted_at FROM invites WHERE email = 'invited-user@gmail.com';
-- Should show: status = 'accepted', accepted_at = [timestamp]

-- 3. Check company was created
SELECT c.name, u.email, u.role
FROM companies c
JOIN users u ON u.company_id = c.id
WHERE u.email = 'invited-user@gmail.com';
-- Should show: company name, email, role = 'admin'

-- 4. Check warehouse was created
SELECT w.name, c.name as company_name
FROM warehouses w
JOIN companies c ON c.id = w.company_id
JOIN users u ON u.company_id = c.id
WHERE u.email = 'invited-user@gmail.com';
-- Should show: 'Main Warehouse'
```

---

### Test 3: Expired Invite (Should FAIL) ❌

**Goal**: Verify auth hook rejects expired invites

**Steps**:

#### 3.1: Create Expired Invite
```sql
INSERT INTO invites (
  email,
  invite_code,
  invite_type,
  status,
  expires_at,  -- Already expired!
  invited_by
) VALUES (
  'expired-invite@gmail.com',
  'EXPIRED12345',
  'platform',
  'pending',
  NOW() - INTERVAL '1 hour',  -- Expired 1 hour ago
  'YOUR_USER_ID'::uuid
);
```

#### 3.2: Try Signing Up
1. Open incognito window
2. Go to signup page
3. Click "Sign in with Google"
4. Use email: `expired-invite@gmail.com`

**Expected Result**:
- Auth hook checks invite
- Finds invite but it's expired (expires_at < NOW())
- Rejects signup
- Error: "No platform invitation found..." (invite doesn't meet criteria)
- Account NOT created

---

### Test 4: Already Used Invite (Should FAIL) ❌

**Goal**: Verify auth hook rejects used invites

**Steps**:

#### 4.1: Use Test 2's Invite Again
1. Sign out from dashboard
2. Try signing up again with `invited-user@gmail.com`

**Expected Result**:
- Auth hook finds invite but status = 'accepted'
- Rejects signup (only 'pending' invites are valid)
- Error message shown
- **BUT** since user already exists, they can just login normally

---

### Test 5: Returning User (Should SUCCEED) ✅

**Goal**: Verify existing users can login without issues

**Steps**:
1. Use account from Test 2 (`invited-user@gmail.com`)
2. Go to: http://localhost:3000/login
3. Click "Sign in with Google"
4. Select the account

**Expected Result**:
- Auth hook does NOT fire (only fires on NEW signups)
- User logs in successfully
- Redirected to dashboard
- All data intact

---

## 📊 Monitoring During Tests

### View Auth Hook Logs

1. Go to: https://supabase.com/dashboard/project/xejyeglxigdeznfitaxc/functions/validate-signup/logs

2. You should see logs like:
```
Validating signup for: test-no-invite@gmail.com
No valid platform invite found for: test-no-invite@gmail.com
```

```
Validating signup for: invited-user@gmail.com
Valid invite found for: invited-user@gmail.com | Invite Code: TEST12345678
```

### View Application Logs

In your terminal running `npm run dev`, look for:
```
✅ New user onboarding completed for: invited-user@gmail.com
```

Or errors:
```
UNEXPECTED: User passed auth hook but no invite found for: ...
```

---

## 🐛 Troubleshooting

### Issue: Test 1 passes (user WITHOUT invite CAN signup)

**Problem**: Hook is not enabled or not firing

**Solutions**:
1. Check hook is enabled in Dashboard
2. Verify function is deployed: `npx supabase functions list`
3. Check function logs for errors
4. Try redeploying: `npx supabase functions deploy validate-signup --project-ref xejyeglxigdeznfitaxc`

---

### Issue: Test 2 fails (user WITH invite CANNOT signup)

**Problem**: Invite validation logic might be too strict or invite not found

**Debug**:
1. Check function logs - what does it say?
2. Verify invite exists:
```sql
SELECT * FROM invites WHERE email = 'invited-user@gmail.com';
```
3. Check invite criteria:
   - `invite_type = 'platform'`
   - `status = 'pending'`
   - `expires_at > NOW()`

---

### Issue: "Server configuration error"

**Problem**: Edge Function missing environment variables

**Solution**:
- Environment variables should auto-populate
- Check in: Dashboard → Functions → validate-signup → Settings
- Should have: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

---

### Issue: Callback shows "UNEXPECTED: User passed auth hook but no invite found"

**Problem**: Race condition or invite was deleted/modified between hook and callback

**Debug**:
1. Check invite still exists and is pending
2. Check function logs to see what hook saw
3. Verify system time is correct

---

## ✅ Success Criteria

After running all tests, you should have:

- ✅ Test 1: Uninvited user blocked (no account created)
- ✅ Test 2: Invited user succeeds (account + company + warehouse created)
- ✅ Test 3: Expired invite blocked
- ✅ Test 4: Used invite blocked (but user can login)
- ✅ Test 5: Existing user can login

**Most Important**: Check `auth.users` table has NO orphaned accounts from failed signups!

---

## 🎉 What You've Achieved

**Before**: Users without invites could create accounts in auth.users, then get blocked in callback → orphaned accounts

**After**: Auth hook validates BEFORE account creation → clean database, no orphans! 🎉

---

## 📝 Next Steps After Testing

Once all tests pass:

1. ✅ Update documentation with new auth flow
2. ✅ Create admin panel for invite management (future)
3. ✅ Set up email notifications for invites (future)
4. ✅ Monitor auth hook performance in production

---

**Created**: January 10, 2025
**Function**: validate-signup
**Project**: xejyeglxigdeznfitaxc
