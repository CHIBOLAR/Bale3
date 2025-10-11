# Auth Debug Checklist

## Issue: Dashboard opens but no data in database

### Please check the following:

1. **Which database are you checking?**
   - Local Supabase (http://localhost:54323) - NOT RUNNING
   - Production Supabase (https://xejyeglxigdeznfitaxc.supabase.co) - ACTIVE

   ⚠️ **You should be checking PRODUCTION Supabase** since .env.local points to production!

2. **Check auth.users table in PRODUCTION:**
   ```sql
   -- Run in Production Supabase SQL Editor
   SELECT email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;
   ```

3. **Check Edge Function logs:**
   - Go to: https://supabase.com/dashboard/project/xejyeglxigdeznfitaxc/functions/validate-signup/logs
   - Look for recent logs showing your signup attempt
   - Should see either:
     - "Valid invite found for: [email]" (allowed)
     - "No valid platform invite found for: [email]" (blocked)

4. **Check if auth hook is actually configured:**
   - Go to: https://supabase.com/dashboard/project/xejyeglxigdeznfitaxc/authentication/hooks
   - Verify "Validate a user's sign-up" shows:
     - Status: Enabled
     - Function: validate-signup

5. **What email did you use?**
   - Did you use the email you created an invite for?
   - Check invites table:
   ```sql
   SELECT email, code, status FROM invites ORDER BY created_at DESC LIMIT 5;
   ```

## Most Likely Issues:

### Issue 1: Hook not enabled in production
**Fix**: Go to Auth Hooks page and enable it manually

### Issue 2: Checking wrong database
**Fix**: Check PRODUCTION Supabase, not local

### Issue 3: User already existed
**Fix**: Check if this email already had an account from previous tests

### Issue 4: Hook failed silently
**Fix**: Check Edge Function logs for errors
