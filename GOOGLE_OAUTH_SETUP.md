# Google OAuth Setup Instructions

This guide will help you configure Google OAuth authentication for your Bale inventory app.

## Prerequisites

- A Google Cloud Console account
- Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
- Access to your Supabase project dashboard

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Navigate to https://console.cloud.google.com
   - Create a new project or select an existing one for your app

2. **Enable Google+ API** (if not already enabled)
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Select "Web application" as the application type
   - Give it a name (e.g., "Bale Inventory App")

4. **Configure Authorized Redirect URIs**

   Add the following URIs:

   **For Production:**
   ```
   https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   ```

   **For Local Development:**
   ```
   http://localhost:54321/auth/v1/callback
   ```

   > **Note:** Replace `<your-supabase-project-ref>` with your actual Supabase project reference ID.
   > You can find this in your Supabase project settings URL: `https://supabase.com/dashboard/project/<project-ref>`

5. **Copy your credentials**
   - After creating the OAuth client, you'll see:
     - Client ID (looks like: `xxxxx.apps.googleusercontent.com`)
     - Client Secret
   - Copy both of these values - you'll need them in the next step

## Step 2: Configure Supabase

1. **Navigate to Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your Bale project

2. **Enable Google Provider**
   - Go to "Authentication" → "Providers"
   - Find "Google" in the list of providers
   - Click to expand it

3. **Enter Google Credentials**
   - Toggle "Enable Sign in with Google" to ON
   - Paste your **Client ID** from Step 1
   - Paste your **Client Secret** from Step 1
   - Click "Save"

4. **Configure Email Settings** (if not already done)
   - Go to "Authentication" → "Email Templates"
   - Ensure the "Confirm signup" and "Magic Link" templates are configured
   - Update the redirect URL in templates to your production domain

## Step 3: Update Environment Variables (Optional)

If you want to display the Google sign-in option differently or add any custom configuration:

1. **In your local `.env.local` file:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```

2. **In Vercel:**
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Ensure these variables are set for Production/Preview/Development

## Step 4: Test the Authentication Flow

### Local Testing

1. **Start Supabase locally** (if using local development):
   ```bash
   npx supabase start
   ```

2. **Run your Next.js app**:
   ```bash
   npm run dev
   ```

3. **Test the flow**:
   - Go to http://localhost:3000/signup
   - Click "Continue with Google"
   - You should be redirected to Google's OAuth consent screen
   - After approving, you should be redirected back to the onboarding page

### Production Testing

1. **Deploy to Vercel**:
   ```bash
   git add .
   git commit -m "Add Google OAuth authentication"
   git push
   ```

2. **Test the flow**:
   - Go to https://your-app.vercel.app/signup
   - Click "Continue with Google"
   - Complete the OAuth flow
   - Verify you land on the onboarding page
   - Complete onboarding
   - Verify you land on the dashboard

## Step 5: Verify Database Records

After a successful OAuth sign-up:

1. **Check auth.users table** (in Supabase SQL Editor):
   ```sql
   SELECT id, email, created_at
   FROM auth.users
   ORDER BY created_at DESC
   LIMIT 5;
   ```

2. **Check users table** (after onboarding):
   ```sql
   SELECT id, email, name, company_id, onboarding_completed
   FROM users
   ORDER BY created_at DESC
   LIMIT 5;
   ```

3. **Check companies table** (after onboarding):
   ```sql
   SELECT id, name, industry, created_at
   FROM companies
   ORDER BY created_at DESC
   LIMIT 5;
   ```

## Troubleshooting

### "Error: redirect_uri_mismatch"

**Problem:** Google rejects the OAuth callback because the redirect URI doesn't match.

**Solution:**
- Verify the redirect URI in Google Cloud Console exactly matches:
  `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
- Ensure there are no trailing slashes
- Wait a few minutes after adding the URI (Google's changes can take time to propagate)

### "Email already registered"

**Problem:** User tries to sign up with Google but email is already in auth.users.

**Solution:**
- This is expected behavior if the user previously signed up with Email OTP
- User should use the login page instead
- Both auth methods (Google + Email OTP) work for the same email

### User redirected to onboarding on every login

**Problem:** User completes onboarding but still gets redirected to /onboarding.

**Solution:**
- Check the users table:
  ```sql
  SELECT auth_user_id, onboarding_completed
  FROM users
  WHERE email = 'user@example.com';
  ```
- If `onboarding_completed` is false, manually update it:
  ```sql
  UPDATE users
  SET onboarding_completed = TRUE
  WHERE email = 'user@example.com';
  ```
- Clear browser cookies and try again

### OAuth callback fails with 404

**Problem:** After Google authentication, redirect to /auth/callback fails.

**Solution:**
- Verify the file exists at: `app/(auth)/auth/callback/route.ts`
- Ensure your Next.js app has been deployed with the latest code
- Check Vercel build logs for any deployment errors

## Email OTP Setup (Already Configured)

Email OTP should work out of the box since you're using Supabase's built-in email service. However, if you want to use a custom email provider:

1. **Configure SMTP Settings**:
   - Go to "Project Settings" → "Auth" in Supabase
   - Scroll to "SMTP Settings"
   - Enable custom SMTP and enter your provider details

2. **Supported providers**:
   - SendGrid
   - AWS SES
   - Mailgun
   - Resend (recommended - already in package.json)

## Security Best Practices

1. **Never commit credentials**:
   - Keep Client ID and Client Secret in environment variables
   - Add `.env.local` to `.gitignore`

2. **Use separate OAuth clients**:
   - One for development (localhost redirect)
   - One for production (your domain redirect)

3. **Enable email verification**:
   - In Supabase → Authentication → Providers → Email
   - Enable "Confirm email" to verify user emails

4. **Set up proper RLS policies**:
   - Ensure your database has Row Level Security enabled
   - Verify users can only access their company's data

## Next Steps

Once Google OAuth is working:

1. ✅ Test the complete signup → onboarding → dashboard flow
2. ✅ Test the login flow (existing users)
3. ✅ Test email OTP as alternative auth method
4. ⏳ Clean up remaining `is_demo` references in the codebase
5. ⏳ Implement performance optimizations (Phase 2)
6. ⏳ Standardize goods receipt logic (Phase 3)

## Support Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication Patterns](https://nextjs.org/docs/authentication)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side-rendering)

---

**Last Updated:** January 2025
**Maintainer:** Bale Development Team
