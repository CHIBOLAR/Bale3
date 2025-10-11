# Auth Hook Configuration Guide

## ✅ What's Been Done

1. ✅ Created `validate-signup` Edge Function
2. ✅ Deployed to Supabase production (project: xejyeglxigdeznfitaxc)
3. ⏳ Need to configure in Dashboard (follow steps below)

---

## 📋 Steps to Configure Auth Hook

### Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/xejyeglxigdeznfitaxc
2. Login with your Supabase account

### Step 2: Navigate to Auth Hooks

1. In the left sidebar, click **Authentication**
2. Click on the **Hooks** tab
3. You should see "Hooks allow you to customize behavior at key points in the auth flow"

### Step 3: Enable "Validate a user's sign-up" Hook

1. Find the section: **"Validate a user's sign-up"**
2. Click **Enable Hook**
3. In the dropdown, select: **`validate-signup`** (the function we just deployed)
4. Click **Save** or **Confirm**

### Step 4: Verify Hook is Active

You should see:
```
✓ Validate a user's sign-up
  Function: validate-signup
  Status: Enabled
```

---

## 🧪 How It Works Now

### Before Hook (Old Flow):
```
User → Google OAuth → Account Created in auth.users → Callback validates → Sign out if no invite
Problem: Orphaned accounts in auth.users
```

### After Hook (New Flow):
```
User → Google OAuth → Hook validates invite FIRST → Only creates account if valid
Result: No orphaned accounts! 🎉
```

### What Happens During Signup:

1. **User clicks "Sign in with Google"**
2. **Google authenticates user**
3. **Supabase calls `validate-signup` hook BEFORE creating account**
4. **Hook checks for valid platform invite**
   - ✅ Valid invite → Account created → User continues to callback
   - ❌ No invite → Account NOT created → User sees error from Google OAuth

---

## 🔍 Testing After Configuration

### Test 1: User WITHOUT Invite (Should Fail)
```bash
# Try signing up with an email that has no invite
# Expected: Google OAuth completes, but Supabase shows error:
# "No platform invitation found for email@example.com"
```

### Test 2: User WITH Valid Invite (Should Succeed)
```bash
# 1. Create invite first
# 2. Try signing up with that email
# Expected: Account created, redirected to dashboard
```

---

## 📊 Monitoring Hook

### View Hook Logs

1. Go to: https://supabase.com/dashboard/project/xejyeglxigdeznfitaxc/functions
2. Click on **`validate-signup`**
3. Click **Logs** tab
4. You'll see:
   - "Validating signup for: user@email.com"
   - "Valid invite found for: user@email.com | Invite Code: XXX"
   - "No valid platform invite found for: user@email.com"

### Check Function Invocations

1. In the Functions dashboard, you can see:
   - Total invocations
   - Success rate
   - Error rate
   - Average execution time

---

## 🐛 Troubleshooting

### Issue: Hook not firing
**Solution**:
- Verify hook is enabled in Dashboard
- Check function is deployed: `npx supabase functions list`
- Check function logs for errors

### Issue: "Server configuration error"
**Solution**:
- Edge Function needs environment variables
- They should auto-populate from project
- Check in Functions → validate-signup → Settings

### Issue: All signups failing
**Solution**:
- Check function logs in Dashboard
- Verify database connection
- Check invites table has valid data

---

## 🔧 Update Hook Code (If Needed)

```bash
# 1. Edit the function
code supabase/functions/validate-signup/index.ts

# 2. Redeploy
npx supabase functions deploy validate-signup --project-ref xejyeglxigdeznfitaxc

# Changes take effect immediately (no need to reconfigure)
```

---

## 🎯 Next Steps After Configuration

1. ✅ Enable the hook in Supabase Dashboard (follow steps above)
2. ✅ Test with an email that has NO invite (should fail)
3. ✅ Create a test invite
4. ✅ Test with the invited email (should succeed)
5. ✅ Check function logs to verify it's working

---

## 📝 Notes

- The hook runs BEFORE account creation (this is the key improvement!)
- Hook has access to service role (can query invites table)
- Hook must return specific JSON format to accept/reject
- Failed signups won't appear in auth.users table anymore
- Hook adds ~100-200ms to signup flow (acceptable overhead)

---

**Created**: January 10, 2025
**Function URL**: https://xejyeglxigdeznfitaxc.supabase.co/functions/v1/validate-signup
**Dashboard URL**: https://supabase.com/dashboard/project/xejyeglxigdeznfitaxc/functions/validate-signup
