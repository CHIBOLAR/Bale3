# Configure Supabase Auth to Use Resend for Emails

The Edge Function `send-email` has been successfully deployed! Now follow these steps to complete the setup.

## ✅ What's Been Done

1. ✅ Created email templates in `supabase/functions/_shared/email-templates.ts`
2. ✅ Created Edge Function in `supabase/functions/send-email/index.ts`
3. ✅ Deployed function to Supabase (Function ID: `cf9de441-4c95-48ce-93bc-9c7d87a2ee39`)

## 🔧 Configuration Steps

### Step 1: Set Edge Function Secrets

Go to your Supabase Dashboard and add these secrets:

**Dashboard Link:** https://supabase.com/dashboard/project/xejyeglxigdeznfitaxc/settings/functions

1. Click on **Edge Functions** in the left sidebar
2. Click on the **send-email** function
3. Go to the **Secrets** tab
4. Add the following secrets:

   ```
   RESEND_API_KEY = re_M8FtU1sN_4trN174ZYrYT4xqUE8ETzodB
   RESEND_FROM_EMAIL = onboarding@resend.dev
   ```

### Step 2: Configure Auth Hook

**Dashboard Link:** https://supabase.com/dashboard/project/xejyeglxigdeznfitaxc/auth/hooks

1. Navigate to **Authentication** → **Hooks** in your Supabase Dashboard
2. Click **Enable Hook** or **Add New Hook**
3. Select **Send Email Hook**
4. Configure the hook:

   **Hook Type:** HTTPS Hook

   **URL:** `https://xejyeglxigdeznfitaxc.supabase.co/functions/v1/send-email`

   **HTTP Headers:** Leave empty (not needed)

   **Secret:** Click **Generate** to create a new secret

5. **IMPORTANT:** Copy the generated secret immediately
   - The secret will look like: `v1,whsec_xxxxxxxxxxxxxxxxxxxxx`
   - **You must remove the `v1,whsec_` prefix before using it**
   - Only use the part after the underscore: `xxxxxxxxxxxxxxxxxxxxx`

### Step 3: Add Webhook Secret to Edge Function

After generating the webhook secret in Step 2:

1. Go back to **Edge Functions** → **send-email** → **Secrets**
2. Add a new secret:
   ```
   SEND_EMAIL_HOOK_SECRET = <paste the secret WITHOUT the v1,whsec_ prefix>
   ```
   Example: If your secret was `v1,whsec_abc123xyz`, enter only `abc123xyz`
3. Save the secret

### Step 4: Test the Configuration

Test that emails are working:

1. Try logging in at: http://localhost:3000/login
2. Or create a new staff invite at: http://localhost:3000/dashboard/staff/add
3. Check your email inbox for the OTP code

## 📧 Email Types Supported

The Edge Function handles all these auth email types:

- ✅ **OTP Login** - Magic code for sign in
- ✅ **OTP Signup** - Email verification for new accounts
- ✅ **Magic Link** - Passwordless login link
- ✅ **Email Change** - Confirm new email address
- ✅ **Password Recovery** - Reset password link

## 🎨 Email Templates

All emails are styled to match your existing Resend templates in `lib/email/resend.ts`:
- Blue gradient header
- Professional layout
- Security warnings
- Mobile-friendly design

## 🔍 Monitoring & Debugging

### View Function Logs

**Dashboard Link:** https://supabase.com/dashboard/project/xejyeglxigdeznfitaxc/logs/edge-functions

1. Go to **Edge Functions** → **send-email** → **Logs**
2. Look for log messages:
   - `✅ Send Email Function started`
   - `📧 Processing email: {...}`
   - `✅ Email sent successfully: {email_id}`
   - `❌ Resend error: {...}` (if there are issues)

### Common Issues

**Issue: "Missing webhook signature or secret"**
- Solution: Make sure `SEND_EMAIL_HOOK_SECRET` is set in Edge Function secrets

**Issue: "Failed to send email"**
- Solution: Check that `RESEND_API_KEY` is correctly set
- Verify your Resend API key is valid at https://resend.com/api-keys

**Issue: "Unauthorized"**
- Solution: Regenerate the Auth Hook secret and update the Edge Function secret

## 🚀 Next Steps

After configuration:
1. Test login/signup flows
2. Monitor Edge Function logs for any errors
3. Update `RESEND_FROM_EMAIL` to use your verified domain (e.g., `noreply@yourdomain.com`)

## 📝 Notes

- The Edge Function is deployed and active
- OTP codes expire after 60 minutes
- All auth emails are now sent via Resend instead of Supabase's default email service
- Staff invite emails (from the staff management module) continue to work via the existing Resend integration