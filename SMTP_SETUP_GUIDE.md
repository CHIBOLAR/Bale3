# Supabase SMTP Setup Guide

## Overview

The Bale Inventory app now automatically sends invite emails when admins approve access requests. However, Supabase's default SMTP only sends emails to team members (users in your Supabase organization).

For production use, you MUST configure a custom SMTP provider.

---

## Quick Setup (Recommended: Resend)

### 1. Create Resend Account
- Visit [resend.com](https://resend.com)
- Sign up for free account (100 emails/day free tier)
- Verify your domain (or use `onboarding@resend.dev` for testing)

### 2. Get API Key
- Go to **API Keys** in Resend dashboard
- Create new API key
- Copy the key (starts with `re_`)

### 3. Configure Supabase
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **xejyeglxigdeznfitaxc**
3. Navigate to **Authentication → Email Templates**
4. Scroll to **SMTP Settings**
5. Enable **Custom SMTP**
6. Enter settings:
   - **Host**: `smtp.resend.com`
   - **Port**: `587`
   - **Username**: `resend`
   - **Password**: Your Resend API key (e.g., `re_123...`)
   - **Sender Email**: Your verified email (e.g., `noreply@yourdomain.com`)
   - **Sender Name**: `Bale Inventory`

### 4. Test
- Approve an invite request in the admin panel
- Check user's email inbox
- Check Supabase logs: **Logs → Auth**

---

## Alternative Providers

### AWS SES
```
Host: email-smtp.us-east-1.amazonaws.com
Port: 587
Username: <Your SMTP Username>
Password: <Your SMTP Password>
```

### SendGrid
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: <Your SendGrid API Key>
```

### Postmark
```
Host: smtp.postmarkapp.com
Port: 587
Username: <Your Server Token>
Password: <Your Server Token>
```

---

## Email Templates

### Customize Email Templates
1. Go to **Authentication → Email Templates** in Supabase Dashboard
2. Edit the **Invite user** template for new signups
3. Edit the **Magic Link** template for demo upgrades

### Available Variables
- `{{ .ConfirmationURL }}` - The invite/upgrade link
- `{{ .Token }}` - 6-digit OTP code
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your app URL

### Example Template (Invite)
```html
<h2>Welcome to Bale Inventory!</h2>
<p>You've been approved for full access to Bale Inventory.</p>
<p><a href="{{ .ConfirmationURL }}">Complete your signup</a></p>
<p>Or use this code: <strong>{{ .Token }}</strong></p>
```

---

## Testing Before Production

### Local Testing (Team Members Only)
The default SMTP works for emails belonging to your Supabase team:
1. Add test email addresses to your Supabase organization
2. Go to **Organization Settings → Team**
3. Invite team members
4. Test invite approval flow

### Production Testing
1. Configure custom SMTP (see above)
2. Create test access request with real external email
3. Approve the request as admin
4. Verify email delivery

---

## Troubleshooting

### ⚠️ "Email address not authorized"
**Problem**: Using default SMTP with non-team email
**Solution**: Configure custom SMTP or add email to Supabase team

### ⚠️ "SMTP authentication failed"
**Problem**: Invalid SMTP credentials
**Solution**: Double-check username/password from email provider

### ⚠️ No email received
**Check**:
1. Spam folder
2. Supabase Auth logs: **Logs → Auth**
3. Email provider logs (Resend, SendGrid, etc.)
4. Sender email is verified with provider

### ⚠️ Email sending works but user can't sign up
**Problem**: Status mismatch (already fixed in latest code)
**Solution**: Ensure you're running the latest code with both bug fixes

---

## Current Implementation

### New User Signup Flow
```
Admin approves → admin.inviteUserByEmail() → Supabase sends invite email → User clicks link → Signs up with password
```

### Demo User Upgrade Flow
```
Admin approves → signInWithOtp() → Supabase sends magic link → User clicks link → Redirects to upgrade page → Upgrades account
```

---

## Rate Limits

### Default SMTP
- 30 emails/hour (Supabase default)
- Only team members

### Custom SMTP
- Configure rate limits in **Authentication → Rate Limits**
- Recommended: 100-500 emails/hour depending on provider
- Check your email provider's limits:
  - Resend free: 100/day, 3000/month
  - SendGrid free: 100/day
  - AWS SES: 200/day (sandbox), unlimited (production)

---

## Next Steps

1. ✅ Configure custom SMTP in Supabase Dashboard
2. ✅ Customize email templates
3. ✅ Test with real email addresses
4. ✅ Monitor email delivery in provider dashboard
5. ✅ Set up domain verification for better deliverability

---

## Support

- **Supabase Docs**: https://supabase.com/docs/guides/auth/auth-smtp
- **Resend Docs**: https://resend.com/docs/send-with-supabase-smtp
- **Email Template Guide**: https://supabase.com/docs/guides/auth/auth-email-templates
