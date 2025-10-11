# Google OAuth Setup Guide

## Overview
This guide will help you complete the Google OAuth integration for Bale Inventory.

## What's Already Done ✅
- ✅ Google OAuth credentials added to `.env.local`
- ✅ Login page updated with "Sign in with Google" button
- ✅ Signup page updated with "Sign up with Google" button
- ✅ OAuth callback handler created at `/app/auth/callback/route.ts`

## What You Need to Do

### Step 1: Configure Google Provider in Supabase Studio

**For Local Development:**

1. **Open Supabase Studio** (while Supabase is running):
   - Go to: http://localhost:54323

2. **Navigate to Authentication Settings**:
   - Click on "Authentication" in the left sidebar
   - Click on "Providers" tab

3. **Enable Google Provider**:
   - Find "Google" in the list of providers
   - Toggle it to **Enabled**

4. **Add Google Credentials**:
   - Copy the **Client ID** and **Client Secret** values from your `.env.local` file
   - Click **Save**

5. **Verify Redirect URI**:
   - The redirect URI should be: `http://127.0.0.1:54321/auth/v1/callback`
   - This is already configured in your Google OAuth settings

---

### Step 2: Test the Google Sign-In Flow

1. **Start Your Development Server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Test Login Page**:
   - Go to: http://localhost:3000/login
   - You should see the "Sign in with Google" button
   - Click it to test the OAuth flow

3. **Test Signup Page**:
   - Go to: http://localhost:3000/signup
   - You should see the "Sign up with Google" button
   - Click it to test the OAuth flow

4. **Expected Flow**:
   - Click "Sign in with Google" → Google consent screen → Redirects back to app
   - If it's a new user: Creates company, user record, and default warehouse
   - Redirects to: http://localhost:3000/dashboard

---

### Step 3: Verify Database Records

After signing in with Google, verify the data was created:

1. **Open Supabase Studio**: http://localhost:54323

2. **Check Tables**:
   - Navigate to "Table Editor" → `users` table
   - You should see a new user with your Google email
   - Check that `role` is set to `admin`
   - Check that `auth_user_id` matches your Supabase auth user ID

3. **Check Company**:
   - Navigate to `companies` table
   - You should see a new company created

4. **Check Warehouse**:
   - Navigate to `warehouses` table
   - You should see "Main Warehouse" created

---

## For Production Deployment

When deploying to Hostinger + Supabase Cloud:

### Step 1: Update Google OAuth Settings
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" → "Credentials"
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URIs:
   ```
   https://your-supabase-project.supabase.co/auth/v1/callback
   https://yourdomain.com/auth/callback
   ```

### Step 2: Configure Supabase Production
1. Open your Supabase production project dashboard
2. Navigate to "Authentication" → "Providers"
3. Enable Google and add the credentials from your `.env.local` file
4. Add to `.env.production` (use same values from `.env.local`)

---

## Troubleshooting

### Error: "Invalid OAuth Configuration"
- **Solution**: Check that you've enabled and saved the Google provider in Supabase Studio
- Verify the Client ID and Secret are correct

### Error: "Redirect URI mismatch"
- **Solution**: Ensure your Google OAuth settings include:
  - `http://127.0.0.1:54321/auth/v1/callback` (for local Supabase)
  - `http://localhost:3000/auth/callback` (for local app)

### Google Sign-In Opens but Gets Stuck
- **Solution**:
  - Check browser console for errors
  - Verify Supabase is running: `npx supabase status`
  - Restart Next.js dev server: `npm run dev`

### User Profile Not Created
- **Solution**: Check the callback route logs
- Verify RLS policies allow user creation
- Check Supabase logs in Studio → "Logs" → "Postgres Logs"

---

## Security Notes

⚠️ **Important**: Store OAuth credentials securely in environment variables.

For production:
- Consider rotating the client secret
- Use environment variables for all sensitive data
- Never commit `.env.local` or `.env.production` to Git
- Add proper domain restrictions in Google Cloud Console

---

## What the Code Does

### Login/Signup Flow:
1. User clicks "Sign in with Google"
2. `supabase.auth.signInWithOAuth()` redirects to Google
3. User authorizes the app
4. Google redirects to: `http://localhost:3000/auth/callback?code=...`
5. `/app/auth/callback/route.ts` handles the callback:
   - Exchanges code for session
   - Checks if user exists in database
   - If new user: Creates company, user record, and warehouse
   - Redirects to dashboard

### Session Management:
- Supabase Auth handles JWT tokens automatically
- Sessions are stored in cookies (via `@supabase/ssr`)
- Your middleware protects routes requiring authentication

---

## Next Steps

After setting up Google OAuth:
1. Test the complete flow (login, signup, logout)
2. Verify multi-tenancy is working (users see only their company data)
3. Test with multiple Google accounts
4. Continue building products management (Phase 5)

---

## Files Modified

- `.env.local` - Added Google OAuth credentials
- `.env.example` - Added Google OAuth template
- `app/(auth)/login/page.tsx` - Added Google Sign-In button
- `app/(auth)/signup/page.tsx` - Added Google Sign-Up button
- `app/auth/callback/route.ts` - Created OAuth callback handler

---

**Last Updated**: January 2025
