# Google OAuth Authentication Migration Plan

## Executive Summary

This document outlines the migration plan from OTP-based authentication to Google OAuth for the Bale Inventory system. The change is necessary because Resend requires a verified domain to send OTP emails, which is currently unavailable.

## Current Authentication Flow Analysis

### Tier 1: Demo Access (No changes needed)
- **Entry Point**: `TryDemoButton` component
- **Method**: Direct login with demo credentials (`demo@bale.inventory` / `demo1234`)
- **Status**: ✅ Keep as-is (password-based, no OTP)

### Tier 2: Demo-to-Full Upgrade (Requires migration)
- **Current Flow**:
  1. Demo user submits upgrade request at `/dashboard/request-upgrade`
  2. Request stored in `upgrade_requests` table (status='pending')
  3. Super admin reviews at `/dashboard/admin/invite-requests`
  4. Admin approves → user record created
  5. **Problem**: Resend sends email with OTP for verification
  6. User verifies OTP at `/verify-otp`
  7. User gains full access

### Tier 3: Staff Invites (Requires migration)
- **Current Flow**:
  1. Admin creates staff invite via `/api/admin/create-staff-invite`
  2. **Problem**: Resend sends invite email with signup link
  3. Staff clicks link → `/signup?code={inviteCode}`
  4. **Problem**: OTP verification required
  5. Account linked to staff record

## Problem Statement

1. **OTP Emails Cannot Be Sent**: Resend requires a verified domain to send OTP emails
2. **Invite Emails Cannot Be Sent**: Staff invite emails also cannot be sent
3. **Authentication Blocked**: Users whose access has been approved cannot complete signup/login

## Proposed Solution: Google OAuth Integration

### Why Google OAuth?
- ✅ No email sending required for authentication
- ✅ Trusted, familiar user experience
- ✅ Built-in email verification by Google
- ✅ Native Supabase support
- ✅ Secure and industry-standard

### New Authentication Flow

#### For Approved Upgrade Requests:
1. Demo user submits upgrade request (unchanged)
2. Admin approves request (unchanged)
3. **NEW**: Admin approval creates user record with email in `approved_emails` table
4. User clicks "Sign in with Google" on `/login`
5. Google OAuth redirects back to app
6. **NEW**: System checks if email exists in `approved_emails` table
7. If approved → create/link user account automatically
8. If not approved → show "Access pending approval" message

#### For Staff Invites:
1. Admin creates staff member record directly in database
2. Admin adds email to `approved_emails` table with `invite_type='staff'`
3. **NEW**: Admin sends manual email or Slack message with instructions
4. Staff member goes to `/login` and clicks "Sign in with Google"
5. System matches Google email to `approved_emails` table
6. Account automatically linked to staff record
7. User gains access

## Implementation Plan

### Phase 1: Database Schema Updates

**Create `approved_emails` table**:
```sql
CREATE TABLE approved_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  approval_type TEXT NOT NULL CHECK (approval_type IN ('upgrade', 'staff')),
  company_id UUID REFERENCES companies(id),
  staff_id UUID REFERENCES staff(id),
  approved_by UUID REFERENCES users(auth_user_id),
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_approved_emails_email ON approved_emails(email);
CREATE INDEX idx_approved_emails_used ON approved_emails(used);
```

### Phase 2: Google OAuth Configuration

**Required Steps**:

1. **Create Google Cloud Project**:
   - Go to https://console.cloud.google.com
   - Create new project or select existing
   - Enable Google+ API

2. **Create OAuth 2.0 Credentials**:
   - Navigate to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: Web application
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - Your production URL (when available)
   - Authorized redirect URIs:
     - `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Save Client ID and Client Secret

3. **Configure Supabase**:
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Enter Client ID and Client Secret
   - Or use CLI for local development (see Phase 3)

### Phase 3: Update Environment Variables

**Add to `.env.local`**:
```bash
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Update `supabase/config.toml`**:
```toml
[auth.external.google]
enabled = true
client_id = "env(NEXT_PUBLIC_GOOGLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET)"
skip_nonce_check = false
```

### Phase 3.1: Vercel Deployment Configuration

**Important Notes for Vercel Deployment**:

When deploying to Vercel, you need to configure environment variables in the Vercel dashboard instead of using `.env.local`.

#### Steps to Configure in Vercel:

1. **Navigate to Project Settings**:
   - Go to your project in Vercel Dashboard
   - Click "Settings" → "Environment Variables"

2. **Add the Following Environment Variables**:

   | Variable Name | Value | Environment |
   |---------------|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<your-project-ref>.supabase.co` | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
   | `NEXT_PUBLIC_SITE_URL` | Your production URL (e.g., `https://your-app.vercel.app`) | Production |
   | `NEXT_PUBLIC_SITE_URL` | Your preview URL (e.g., `https://your-app-git-*.vercel.app`) | Preview |
   | `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Development |
   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Your Google OAuth Client ID | Production, Preview, Development |

   **Note**: `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` is NOT needed in Vercel because:
   - Google OAuth configuration is done in **Supabase Dashboard**, not in your Next.js app
   - The secret is securely stored in Supabase's backend
   - Your Next.js app only needs the public Client ID

3. **Important: Update Google OAuth Redirect URIs**:

   When deploying to Vercel, you must update your Google Cloud OAuth configuration:

   - Go to Google Cloud Console → APIs & Services → Credentials
   - Edit your OAuth 2.0 Client ID
   - Update "Authorized JavaScript origins":
     - Add: `https://your-app.vercel.app` (production)
     - Add: `https://*.vercel.app` (for preview deployments)
   - **Keep the redirect URI pointing to Supabase**:
     - `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - This is crucial: OAuth redirects go through Supabase, not your Vercel domain

4. **Update Supabase Site URL**:

   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Set "Site URL" to your production Vercel URL: `https://your-app.vercel.app`
   - This ensures OAuth callbacks redirect to the correct domain

5. **Redeploy After Configuration**:

   After adding environment variables in Vercel:
   - Trigger a new deployment (or it will auto-deploy)
   - Verify all environment variables are loaded correctly
   - Test Google OAuth flow in production

#### Environment Variables Summary:

**Local Development (`.env.local`)**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>

# Only needed for local Supabase development
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

**Vercel Production**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>
```

**Key Differences**:
- ✅ `NEXT_PUBLIC_SITE_URL` changes from `localhost:3000` to your Vercel domain
- ✅ Google OAuth secret is configured in **Supabase Dashboard**, not in Vercel
- ✅ OAuth redirects always go to `*.supabase.co/auth/v1/callback`, not your Vercel domain
- ✅ All `NEXT_PUBLIC_*` variables are exposed to the browser and used client-side

#### Common Vercel Deployment Issues:

**Issue 1: OAuth Redirect Mismatch**
- **Error**: "redirect_uri_mismatch"
- **Fix**: Ensure Google Cloud OAuth redirect URI is set to Supabase callback URL, not Vercel URL

**Issue 2: Wrong Site URL After Login**
- **Error**: Redirects to wrong domain after OAuth
- **Fix**: Update "Site URL" in Supabase Dashboard → Authentication → URL Configuration

**Issue 3: Environment Variables Not Loading**
- **Error**: "Invalid project credentials"
- **Fix**:
  - Check all `NEXT_PUBLIC_*` variables are set in Vercel
  - Ensure environment is selected correctly (Production/Preview/Development)
  - Redeploy after adding variables

**Issue 4: Preview Deployments Failing**
- **Error**: OAuth fails on preview branches
- **Fix**: Add wildcard to Google OAuth origins: `https://*.vercel.app`

### Phase 4: Code Implementation

#### File Changes Required:

**1. Create New Server Action: `app/actions/auth/google-auth.ts`**
- `signInWithGoogle()` - Initiate Google OAuth flow
- `handleGoogleCallback()` - Process OAuth callback
- `checkEmailApproval()` - Verify email is approved
- `linkGoogleAccount()` - Link Google account to existing user record

**2. Update Login Page: `app/(auth)/login/page.tsx`**
- Remove OTP email input form
- Add "Sign in with Google" button
- Add error handling for unapproved emails
- Keep demo login option

**3. Update Signup Page: `app/(auth)/signup/page.tsx`**
- Remove OTP-based signup
- Add "Sign up with Google" button (for invite codes)
- Validate invite code before initiating Google OAuth
- Link Google account to staff invite

**4. Create OAuth Callback Handler: `app/auth/callback/route.ts`**
- Handle Google OAuth redirect
- Check if email is in `approved_emails` table
- Create user record if approved
- Link to staff/company records as appropriate
- Redirect to dashboard or show error

**5. Update Admin Approval Flow: `app/api/admin/approve-upgrade/route.ts`**
- When approving upgrade request, insert email into `approved_emails`
- Set `approval_type='upgrade'`
- Store company_id for later linking
- Remove OTP email sending logic

**6. Update Staff Invite Flow: `app/api/admin/create-staff-invite/route.ts`**
- Create staff record
- Insert email into `approved_emails` with `approval_type='staff'`
- Store staff_id for later linking
- Remove Resend email sending
- Return instructions for manual communication

**7. Remove/Archive Old Files**:
- `app/verify-otp/page.tsx` - No longer needed
- Update references to OTP verification in other files

### Phase 5: Middleware & Authorization Updates

**Update: `middleware.ts`**
- Ensure OAuth callback routes are public
- Keep existing protection for dashboard routes

**Update: `app/dashboard/layout.tsx`**
- Verify user has completed Google OAuth
- Check user is not demo when accessing restricted features

### Phase 6: UI/UX Components

**Create: `components/auth/GoogleSignInButton.tsx`**
```tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
      alert('Failed to sign in with Google')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        {/* Google icon SVG */}
      </svg>
      {loading ? 'Signing in...' : 'Continue with Google'}
    </button>
  )
}
```

### Phase 7: Admin Communication Tools

**Create: `app/dashboard/admin/approved-emails/page.tsx`**
- Show list of approved emails
- Show usage status (used/unused)
- Allow admins to see which emails can access the system
- Provide copy-paste instructions for manual email/Slack communication

**Email Template for Manual Communication**:
```
Subject: Your Bale Inventory Access is Approved

Hello [Name],

Your access request to Bale Inventory has been approved!

To access your account:
1. Go to https://[your-domain]/login
2. Click "Sign in with Google"
3. Use the email address: [approved-email]

You'll be automatically signed in and can start using the system.

If you have any questions, please contact support.

Best regards,
Bale Inventory Team
```

## Migration Checklist

### Pre-Migration
- [ ] Create Google Cloud Project
- [ ] Generate OAuth 2.0 credentials
- [ ] Configure Supabase Google provider
- [ ] Update environment variables
- [ ] Create `approved_emails` table
- [ ] Test OAuth flow in development

### Migration
- [ ] Update admin approval endpoints
- [ ] Update staff invite endpoints
- [ ] Create Google OAuth button component
- [ ] Update login page
- [ ] Update signup page
- [ ] Create OAuth callback handler
- [ ] Update middleware
- [ ] Create admin tools for approved emails

### Post-Migration
- [ ] Remove OTP verification page
- [ ] Remove Resend email code
- [ ] Update documentation
- [ ] Notify existing demo users about new login method
- [ ] Test complete flows:
  - [ ] Demo account login (password-based)
  - [ ] Upgrade request approval + Google login
  - [ ] Staff invite + Google login
  - [ ] Unapproved email rejection

### Testing Scenarios

**Test Case 1: Approved Upgrade User**
1. Create upgrade request as demo user
2. Approve request as admin
3. Verify email added to `approved_emails`
4. Sign in with Google using approved email
5. Verify user account created and linked to company
6. Verify dashboard access granted

**Test Case 2: Staff Invite**
1. Admin creates staff member
2. Admin adds email to approved list
3. Staff member signs in with Google
4. Verify account linked to staff record
5. Verify correct permissions applied

**Test Case 3: Unapproved Email**
1. Attempt to sign in with Google using unapproved email
2. Verify error message: "Your access request is pending approval"
3. Verify no account created

**Test Case 4: Demo Access (Unchanged)**
1. Click "Try Demo" button
2. Verify immediate access to demo account
3. Verify demo restrictions still apply

## Rollback Plan

If issues arise:
1. Keep OTP code in separate branch
2. Re-enable OTP endpoints if needed
3. Disable Google OAuth provider in Supabase
4. Revert login/signup page changes
5. Restore OTP verification page

## Timeline Estimate

- **Phase 1-3** (Setup & Config): 1-2 hours
- **Phase 4-5** (Code Implementation): 3-4 hours
- **Phase 6-7** (UI/UX & Admin Tools): 2-3 hours
- **Testing**: 2 hours
- **Total**: ~8-11 hours

## Security Considerations

1. **Email Verification**: Google provides verified emails
2. **Approved List**: Only pre-approved emails can access system
3. **Session Management**: Supabase handles secure session tokens
4. **PKCE Flow**: Supabase implements PKCE for OAuth security
5. **Database RLS**: Ensure Row-Level Security policies updated for new flow

## Benefits of This Approach

1. ✅ **No Domain Required**: Google OAuth doesn't need email sending
2. ✅ **Better UX**: One-click sign-in, no OTP code entry
3. ✅ **Secure**: Industry-standard OAuth 2.0 protocol
4. ✅ **Scalable**: Easy to add more OAuth providers later
5. ✅ **Email Verified**: Google ensures email ownership
6. ✅ **Mobile Friendly**: Works seamlessly on mobile devices
7. ✅ **Reduces Friction**: Fewer steps to authenticate

## Next Steps

1. Review and approve this plan
2. Obtain Google OAuth credentials
3. Begin Phase 1 implementation
4. Test in development environment
5. Deploy to production when ready

---

**Document Version**: 1.0
**Last Updated**: 2025-10-17
**Author**: Claude Code
**Status**: Pending Approval
