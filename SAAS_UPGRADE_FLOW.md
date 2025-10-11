# SaaS Upgrade Flow Documentation

## Overview
Standard SaaS conversion pattern where demo users seamlessly upgrade to official accounts without re-authenticating.

## Complete User Journey

### 1. Demo Access (Frictionless Entry)
**User Action:**
- Visits homepage (/)
- Enters email in "Try Demo" form
- Clicks "Try Demo"

**System:**
- Sends magic link via Supabase Auth
- User clicks link → authenticated
- Callback handler creates demo account:
  - Assigns to shared demo company
  - Role: `customer` (read-only)
  - `is_demo: true`
- User lands in dashboard with demo banner

**Authentication:** Magic link (passwordless)

---

### 2. Request Upgrade (Demo User Wants Official Access)
**User Action:**
- While logged into demo account, sees banner: "Request Official Access"
- Clicks button → goes to `/request-invite`
- Fills form with same email used for demo

**System:**
- API validates: allows demo users to request with same email
- Creates `invite_request` record with `status: 'pending'`
- User sees: "Your request has been submitted"

**Key Change:** Previously blocked users with existing accounts. Now allows demo users.

**Code:** `app/api/request-invite/route.ts:31-49`

---

### 3. Admin Approval (Human Review)
**Admin Action:**
- Admin logs in → goes to `/dashboard/admin/invite-requests`
- Sees pending request with user details
- Clicks "Approve"

**System:**
- Detects if user is demo (checks `users` table)
- Creates platform invite with metadata:
  ```json
  {
    "is_upgrade": true,
    "user_id": "existing_demo_user_id"
  }
  ```
- Generates upgrade link: `/upgrade?token=XXXXX`
- Updates request status: `approved`
- (Phase 8) Sends email with upgrade link

**Code:** `app/api/admin/approve-invite/route.ts:68-128`

---

### 4. Upgrade Execution (Seamless Conversion)
**User Action:**
- Receives email: "Your access has been approved!"
- Clicks upgrade link → goes to `/upgrade?token=XXXXX`
- Still logged in (same browser session)
- Sees upgrade page with benefits
- Clicks "Upgrade to Official Account"

**System:**
1. Validates user is logged in
2. Verifies user is demo user
3. Validates invite token matches user's email
4. **Performs Upgrade:**
   - Creates new dedicated company
   - Updates user record:
     - `company_id` → new company
     - `is_demo: false`
     - `role: 'admin'`
   - Creates default warehouse
   - Marks invite as `accepted`
5. Shows success message
6. Redirects to dashboard

**Key:** User stays authenticated throughout. No password/OAuth needed.

**Code:**
- Page: `app/upgrade/page.tsx`
- API: `app/api/upgrade-account/route.ts`

---

### 5. Post-Upgrade Experience
**User sees:**
- Dashboard without demo banner
- Company name: "[FirstName]'s Company"
- Full write access to all features
- Empty inventory ready to populate

**What changed:**
- `is_demo: false`
- `role: admin`
- `company_id: [new_company_uuid]`
- Access to admin features (invite team, settings)

---

## Authentication Methods by Flow

| Flow | Entry Point | Auth Method | Creates |
|------|-------------|-------------|---------|
| **Demo Signup** | Homepage `/` | Magic Link | Demo account in shared company |
| **Official Signup** | `/signup?code=XXXXX` | Password or Google OAuth | Official account in new company |
| **Upgrade (SaaS)** | `/upgrade?token=XXXXX` | Already logged in (no auth) | Upgrades existing demo user |

---

## Key Database Changes

### Before Upgrade
```sql
-- User record
user_id: abc-123
email: rajesh@company.com
company_id: [demo_company_id]
role: customer
is_demo: true
auth_user_id: auth-xyz
```

### After Upgrade
```sql
-- User record (updated)
user_id: abc-123  -- SAME USER ID
email: rajesh@company.com
company_id: [new_company_id]  -- CHANGED
role: admin  -- CHANGED
is_demo: false  -- CHANGED
auth_user_id: auth-xyz  -- SAME AUTH

-- New company created
company_id: [new_company_id]
name: "Rajesh's Company"
is_demo: false

-- New warehouse created
warehouse_id: [new_warehouse_id]
company_id: [new_company_id]
name: "Main Warehouse"
```

---

## Benefits of This Approach

### User Experience
✅ No re-authentication needed
✅ Same email throughout journey
✅ Stay logged in during upgrade
✅ Seamless conversion (standard SaaS pattern)

### Technical
✅ One user record per person
✅ Clean data model (no duplicates)
✅ Preserves auth session
✅ Simple rollback if needed

### Business
✅ Higher conversion rate (less friction)
✅ Matches user mental model
✅ Familiar pattern (Slack, Notion, etc.)
✅ Clear upgrade funnel

---

## Error Handling

### User Not Logged In
- Redirect to `/login` with message
- After login, redirect back to upgrade link

### Already Upgraded
- Show success message
- Redirect to dashboard
- No error, just confirmation

### Invalid Token
- Show error: "Invalid or expired invite"
- Link to request new invite

### Token for Different Email
- Show error: "This invite is for a different email"
- User must log out and use correct account

---

## Files Created/Modified

### New Files
- `app/api/upgrade-account/route.ts` - Upgrade API endpoint
- `app/upgrade/page.tsx` - Upgrade confirmation page
- `SAAS_UPGRADE_FLOW.md` - This documentation

### Modified Files
- `app/api/request-invite/route.ts` - Allow demo users to request
- `app/api/admin/approve-invite/route.ts` - Detect upgrades, generate upgrade links
- `app/dashboard/admin/invite-requests/InviteRequestsClient.tsx` - Show upgrade type in admin

---

## Testing the Flow

### Manual Test Steps

1. **Create Demo Account**
   ```
   1. Go to http://localhost:3000
   2. Enter email: test@example.com
   3. Click "Try Demo"
   4. Check email, click magic link
   5. Verify: Dashboard shows demo banner, role=customer
   ```

2. **Request Upgrade**
   ```
   1. While logged in as demo, click "Request Official Access"
   2. Fill form with SAME email: test@example.com
   3. Submit
   4. Verify: Request created successfully
   ```

3. **Admin Approve**
   ```
   1. Log in as admin
   2. Go to /dashboard/admin/invite-requests
   3. Find pending request for test@example.com
   4. Click "Approve"
   5. Verify: Alert shows "Type: Upgrade"
   6. Copy upgrade link from console/logs
   ```

4. **Execute Upgrade**
   ```
   1. In SAME browser (still logged in), paste upgrade link
   2. Go to /upgrade?token=XXXXX
   3. Click "Upgrade to Official Account"
   4. Verify: Success message, redirect to dashboard
   5. Verify: No demo banner, role=admin, new company
   ```

### Expected Results
- ✅ User stays logged in throughout
- ✅ Same email used for demo and official
- ✅ New company created
- ✅ User role changed from customer to admin
- ✅ is_demo changed from true to false
- ✅ No re-authentication required

---

## Phase 8 TODO: Email Integration

When implementing Resend (Phase 8), send:

**For Demo Users (Upgrade):**
```
Subject: Your Bale Inventory Access is Approved! 🎉
Body:
  Hi [Name],

  Great news! Your request for official access has been approved.

  Click below to upgrade your demo account to full access:
  [Upgrade to Official Account]
  Link: /upgrade?token=XXXXX

  What you'll get:
  • Your own dedicated company
  • Full write access to all features
  • Team collaboration
  • Priority support

  Stay logged in and click the button - no password needed!
```

**For New Users (No Demo):**
```
Subject: Welcome to Bale Inventory! 🎉
Body:
  Hi [Name],

  You've been invited to join Bale Inventory.

  Click below to create your account:
  [Sign Up]
  Link: /signup?code=XXXXX

  Your invite code: XXXXX
  Use this to sign up with password or Google OAuth.
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                          │
└─────────────────────────────────────────────────────────────┘

Homepage (/)
    │
    │ Enter Email → Magic Link
    ├──────────────────────┐
    │                      │
    ▼                      ▼
Demo Account         (Email Sent)
    │                      │
    │ Explore Features     │ Click Link
    │                      │
    ▼                      ▼
Demo Banner          Auth Callback
    │                      │
    │ "Request Access"     │ Create Demo User
    │                      │
    ▼                      └──────────────┐
Request Form (/request-invite)           │
    │                                     │
    │ Submit (Same Email Allowed)        │
    │                                     │
    ▼                                     ▼
Invite Request (pending)            Dashboard (Demo Mode)
    │                                     ▲
    │                                     │
    ▼                                     │
Admin Review (/admin/invite-requests)    │
    │                                     │
    │ Approve                             │
    │                                     │
    ▼                                     │
Check: Demo User?                        │
    │                                     │
    ├─YES (is_demo=true)                 │
    │   Create invite with:              │
    │   { is_upgrade: true }             │
    │   Link: /upgrade?token=XXX         │
    │                                     │
    ├─NO (new user)                      │
    │   Create invite with:              │
    │   { is_upgrade: false }            │
    │   Link: /signup?code=XXX           │
    │                                     │
    ▼                                     │
Email Sent (Phase 8)                     │
    │                                     │
    │ User clicks link                   │
    │ (STAYS LOGGED IN)                  │
    │                                     │
    ▼                                     │
Upgrade Page (/upgrade)                  │
    │                                     │
    │ Click "Upgrade"                    │
    │                                     │
    ▼                                     │
API: /api/upgrade-account                │
    │                                     │
    │ 1. Validate token                  │
    │ 2. Create company                  │
    │ 3. Update user:                    │
    │    - is_demo: false                │
    │    - role: admin                   │
    │    - company_id: new               │
    │ 4. Create warehouse                │
    │                                     │
    ▼                                     │
Success! Redirect                        │
    │                                     │
    └─────────────────────────────────────┘
                   │
                   ▼
          Dashboard (Official)
       • No demo banner
       • Full write access
       • Admin features enabled
```

---

## Conclusion

This implements the standard SaaS freemium → paid conversion pattern:
- Frictionless demo entry (magic link)
- Seamless upgrade (no re-auth)
- Clear value demonstration
- Human approval for quality control
- Clean data architecture

The user's email remains constant, they stay logged in, and the upgrade is just a database record update - simple and effective.
