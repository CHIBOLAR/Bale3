# Magic Link Two-Tier System - Implementation Plan

## 📋 Overview

This document outlines the complete implementation plan for converting Bale Inventory to a **two-tier authentication system** using Supabase Magic Links:

1. **Tier 1: Public Demo Access** - Anyone can try via magic link (shared demo company)
2. **Tier 2: Official Account** - Invite-only dedicated company setup

---

## 🎯 Business Goals

### Primary Objectives
- ✅ **Reduce signup friction** - No password required for demo
- ✅ **Showcase product** - Pre-loaded demo data to explore features
- ✅ **Qualify leads** - Users try before requesting official access
- ✅ **Maintain exclusivity** - Invite-only for real company accounts
- ✅ **Onboarding value** - Free setup call for approved users

### Success Metrics
- 50%+ demo signup conversion (vs current password flow)
- 20%+ demo-to-invite request conversion
- 10%+ invite approval-to-active customer conversion

---

## 🏗️ System Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOMEPAGE                                 │
│  "Try Demo" → Enter Email → Get Magic Link                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   Click Magic Link    │
         │   (Supabase Auth)     │
         └───────────┬───────────┘
                     │
         ┌───────────▼────────────┐
         │    Auth Hook Fires     │
         │  (Always Allows Now)   │
         └───────────┬────────────┘
                     │
         ┌───────────▼────────────┐
         │   Auth Callback        │
         │  Check for Invite?     │
         └───────────┬────────────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
   NO INVITE                  HAS INVITE
        │                          │
        ▼                          ▼
┌───────────────┐          ┌──────────────┐
│  DEMO USER    │          │ OFFICIAL USER│
│ (Demo Company)│          │(New Company) │
│ Read-Only     │          │ Full Access  │
└───────┬───────┘          └──────┬───────┘
        │                         │
        ▼                         ▼
   DASHBOARD                 DASHBOARD
   (Demo Data)              (Own Data)
        │
        ▼
"Request Invite" → Form → Admin Review → Approved
                                              │
                                              ▼
                                        Get Invite Code
                                              │
                                              ▼
                                    Sign Up with Invite
                                              │
                                              ▼
                                       New Company Created
```

---

## 📐 Technical Implementation

### Phase 1: Database Changes (Estimated: 2 hours)

#### Migration 1: Add Demo Flags
**File:** `supabase/migrations/20250111_add_demo_system.sql`

```sql
-- Add is_demo flag to companies
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

-- Add is_demo flag to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

-- Add request status to invite_requests (already exists in schema)
-- No changes needed - table created in 20250111_magic_link_token_system.sql

-- Create the shared demo company
DO $$
DECLARE
  demo_company_id UUID;
  demo_warehouse_id UUID;
BEGIN
  -- Create demo company
  INSERT INTO companies (name, is_demo, created_at)
  VALUES ('Bale Inventory - Demo Account', TRUE, NOW())
  RETURNING id INTO demo_company_id;

  -- Create demo warehouse
  INSERT INTO warehouses (company_id, name, location, created_at)
  VALUES (demo_company_id, 'Demo Warehouse - Mumbai', 'Mumbai, Maharashtra', NOW())
  RETURNING id INTO demo_warehouse_id;

  -- Print IDs for reference
  RAISE NOTICE 'Demo Company ID: %', demo_company_id;
  RAISE NOTICE 'Demo Warehouse ID: %', demo_warehouse_id;
END $$;

-- Comments
COMMENT ON COLUMN companies.is_demo IS 'True for the shared demo company';
COMMENT ON COLUMN users.is_demo IS 'True for demo users (read-only access)';
```

#### Migration 2: Demo Data Population
**File:** `supabase/migrations/20250111_populate_demo_data.sql`

```sql
-- This will be populated with sample products, partners, stock units, etc.
-- To be created after demo company is set up

-- Example structure:
-- INSERT INTO products (company_id, name, fabric_type, gsm, color, ...)
-- VALUES (demo_company_id, 'Cotton Fabric - White', 'Cotton', 180, ...)
-- (50+ sample products)

-- INSERT INTO partners (company_id, name, partner_type, ...)
-- VALUES (demo_company_id, 'ABC Textiles', 'Supplier', ...)
-- (10+ sample partners)

-- INSERT INTO sales_orders (company_id, ...)
-- VALUES (demo_company_id, ...)
-- (5+ sample orders)
```

#### Migration 3: RLS Policies for Demo
**File:** `supabase/migrations/20250111_demo_rls_policies.sql`

```sql
-- Demo users can READ company data from demo company
CREATE POLICY "Demo users can view demo company products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND (
        -- Demo users see demo company products
        (users.is_demo = TRUE AND products.company_id = (
          SELECT id FROM companies WHERE is_demo = TRUE LIMIT 1
        ))
        -- Normal users see their own company products
        OR (users.is_demo = FALSE AND users.company_id = products.company_id)
      )
    )
  );

-- Demo users CANNOT insert products
CREATE POLICY "Demo users cannot create products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.is_demo = TRUE
    )
  );

-- Similar policies for other tables: stock_units, partners, sales_orders, etc.
-- Pattern: Allow SELECT for demo users, block INSERT/UPDATE/DELETE
```

**Estimated Time:** 2 hours (writing + testing migrations)

---

### Phase 2: Auth Hook Modification (Estimated: 1 hour)

#### Update: `supabase/functions/validate-signup/index.ts`

**Current Logic:**
```typescript
// Rejects if no invite found
if (!invite) {
  return /* REJECT */
}
```

**New Logic:**
```typescript
// Check for invite (optional now)
const { data: invite } = await supabase
  .from('invites')
  .select('*')
  .eq('email', user.email)
  .eq('invite_type', 'platform')
  .eq('status', 'pending')
  .gt('expires_at', new Date().toISOString())
  .maybeSingle();

// If invite exists AND user provided code, validate code
if (invite && inviteCodeFromUser) {
  if (inviteCodeFromUser !== invite.code) {
    console.log('Invalid invite code');
    return /* REJECT - wrong code */
  }
}

// ALWAYS ALLOW signup (demo or official)
// Callback will determine company assignment
console.log(invite ?
  '✅ Invite found - official signup' :
  '✅ No invite - demo signup'
);

return new Response(
  JSON.stringify({ user }),
  { status: 200, headers: { 'Content-Type': 'application/json' } }
);
```

**Testing:**
- Test signup without invite → Should succeed
- Test signup with valid invite → Should succeed
- Test signup with invalid code → Should fail
- Verify logs show correct path

**Estimated Time:** 1 hour

---

### Phase 3: Callback Handler Update (Estimated: 2 hours)

#### Update: `app/auth/callback/route.ts`

**Key Changes:**

```typescript
if (!existingUser) {
  const email = data.user.email!;

  // Check for platform invite
  const { data: invite } = await supabase
    .from('invites')
    .select('*')
    .eq('email', email)
    .eq('invite_type', 'platform')
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .single();

  if (invite) {
    // ✅ OFFICIAL SIGNUP - Create new company
    await supabase
      .from('invites')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', invite.id);

    const { data: company } = await supabase
      .from('companies')
      .insert({
        name: `${data.user.user_metadata.given_name || email.split('@')[0]}'s Company`,
        is_demo: false
      })
      .select()
      .single();

    await supabase.from('users').insert({
      company_id: company.id,
      first_name: data.user.user_metadata.given_name || email.split('@')[0],
      last_name: data.user.user_metadata.family_name || '',
      email: email,
      role: 'admin',
      is_demo: false,
      auth_user_id: data.user.id,
    });

    await supabase.from('warehouses').insert({
      company_id: company.id,
      name: 'Main Warehouse',
      created_by: data.user.id,
    });

    console.log('✅ Official signup completed');
  } else {
    // ❌ DEMO SIGNUP - Assign to demo company
    const { data: demoCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('is_demo', true)
      .single();

    if (!demoCompany) {
      throw new Error('Demo company not found - run migrations');
    }

    await supabase.from('users').insert({
      company_id: demoCompany.id,
      first_name: data.user.user_metadata.given_name || email.split('@')[0],
      last_name: data.user.user_metadata.family_name || '',
      email: email,
      role: 'customer', // Limited role
      is_demo: true,
      auth_user_id: data.user.id,
    });

    console.log('✅ Demo signup completed');
  }
}

return NextResponse.redirect(`${origin}/dashboard`);
```

**Testing:**
- Test magic link without invite → Assigned to demo company
- Test magic link with invite → Creates new company
- Verify user record has correct `is_demo` flag
- Check dashboard shows correct company name

**Estimated Time:** 2 hours

---

### Phase 4: Homepage with Magic Link Access (Estimated: 3 hours)

#### Create: `app/page.tsx`

**Features:**
- Hero section with value proposition
- Email input + "Try Demo" button
- `signInWithOtp()` call
- Success state showing "Check your email"
- Features grid
- Link to "Request Official Access"

**Components Needed:**
- Email input with validation
- Loading state during magic link send
- Success confirmation
- Error handling

**Testing:**
- Enter email → Receive magic link
- Click link → Redirected to callback → Demo company assigned
- Check email in inbox (verify deliverability)

**Estimated Time:** 3 hours

---

### Phase 5: Invite Request Form (Estimated: 2 hours)

#### Create: `app/request-invite/page.tsx`

**Form Fields:**
- Full Name (required)
- Email (required)
- Phone (required)
- Company Name (required)
- Optional: Business description

**Backend:**

#### Create: `app/api/request-invite/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const { name, email, phone, company } = await request.json();

  const supabase = await createClient();

  // Insert into invite_requests table
  const { error } = await supabase
    .from('invite_requests')
    .insert({
      name,
      email,
      phone,
      company,
      status: 'pending',
      requested_at: new Date().toISOString(),
    });

  if (error) {
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
```

**Testing:**
- Submit form → Data inserted into `invite_requests`
- Verify validation works
- Check success message displays

**Estimated Time:** 2 hours

---

### Phase 6: Admin Invite Management (Estimated: 4 hours)

#### Create: `app/dashboard/admin/invite-requests/page.tsx`

**Features:**
- List all pending invite requests
- Filter by status (pending/approved/rejected)
- Actions: Approve, Reject
- Approve → Creates platform invite + sends email
- Reject → Updates status + optional reason

**Backend:**

#### Create: `app/api/admin/approve-invite/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const { requestId, userId } = await request.json();

  const supabase = await createClient();

  // Get request details
  const { data: request } = await supabase
    .from('invite_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  // Create platform invite
  const { data: invite } = await supabase.rpc('create_platform_invite', {
    p_email: request.email,
    p_invited_by: userId,
  });

  // Update request status
  await supabase
    .from('invite_requests')
    .update({
      status: 'approved',
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
      generated_invite_id: invite.id,
    })
    .eq('id', requestId);

  // TODO: Send email with invite code

  return NextResponse.json({ success: true, inviteCode: invite.code });
}
```

**Estimated Time:** 4 hours

---

### Phase 7: Dashboard UX for Demo Users (Estimated: 2 hours)

#### Update: `app/dashboard/layout.tsx` or `page.tsx`

**Add Demo Banner:**

```tsx
{user.is_demo && (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-yellow-700">
          You're viewing a <strong>demo account</strong> with sample data.
          <a href="/request-invite" className="font-medium underline ml-1">
            Request official access
          </a> to get your own company setup.
        </p>
      </div>
    </div>
  </div>
)}
```

**Disable Create Buttons for Demo:**

```tsx
<button
  disabled={user.is_demo}
  className={`... ${user.is_demo ? 'opacity-50 cursor-not-allowed' : ''}`}
  title={user.is_demo ? 'Not available in demo mode' : ''}
>
  Create Product
</button>
```

**Estimated Time:** 2 hours

---

### Phase 8: Email Setup (Resend) (Estimated: 2 hours)

#### Install Resend

```bash
npm install resend
```

#### Create: `lib/email.ts`

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInviteEmail(email: string, inviteCode: string) {
  const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?invite=${inviteCode}&email=${email}`;

  await resend.emails.send({
    from: 'Bale Inventory <invites@yourdomain.com>',
    to: email,
    subject: 'Your Bale Inventory Invitation',
    html: `
      <h1>Welcome to Bale Inventory!</h1>
      <p>You've been invited to join our platform.</p>
      <p><strong>Your invite code:</strong> ${inviteCode}</p>
      <p><a href="${magicLink}">Click here to sign up</a></p>
    `,
  });
}
```

**Configuration:**
- Add `RESEND_API_KEY` to `.env.local`
- Add sender domain in Resend dashboard
- Verify domain ownership

**Estimated Time:** 2 hours

---

### Phase 9: Testing & QA (Estimated: 4 hours)

#### Test Scenarios

**Demo Flow:**
1. Homepage → Enter email → Receive magic link
2. Click link → Account created → Dashboard shows demo company
3. Explore products, orders (read-only)
4. Try to create product → Button disabled
5. Click "Request Invite" → Fill form → Success

**Invite Flow:**
1. Admin sees pending request → Approves
2. User receives invite email
3. User clicks invite link (or enters code)
4. Magic link sent → Click → New company created
5. Dashboard shows own company (not demo)
6. Can create products, orders (full access)

**Edge Cases:**
- Magic link expires (1 hour)
- Email already in demo → Try to get invite
- Click magic link twice
- Invalid invite code
- Expired invite code

**Estimated Time:** 4 hours

---

### Phase 10: Production Deployment (Estimated: 3 hours)

#### Checklist

**1. Resend Setup**
- [ ] Create production Resend account
- [ ] Add domain
- [ ] Verify domain
- [ ] Update `RESEND_API_KEY` in production env

**2. Supabase Config**
- [ ] Push migrations to production
- [ ] Verify demo company created
- [ ] Populate demo data
- [ ] Test RLS policies
- [ ] Redeploy auth hook

**3. Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xejyeglxigdeznfitaxc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**4. Deploy**
```bash
npm run build
# Upload to Hostinger
pm2 restart bale-inventory
```

**5. Verify**
- [ ] Homepage loads
- [ ] Magic link sends
- [ ] Demo signup works
- [ ] Invite request works
- [ ] Invite approval works
- [ ] Official signup works

**Estimated Time:** 3 hours

---

## 📊 Total Estimated Time

| Phase | Task | Hours |
|-------|------|-------|
| 1 | Database changes | 2 |
| 2 | Auth hook | 1 |
| 3 | Callback handler | 2 |
| 4 | Homepage | 3 |
| 5 | Request form | 2 |
| 6 | Admin panel | 4 |
| 7 | Dashboard UX | 2 |
| 8 | Email setup | 2 |
| 9 | Testing | 4 |
| 10 | Deployment | 3 |
| **TOTAL** | | **25 hours** |

**Timeline:** 3-4 working days (full-time) or 1-2 weeks (part-time)

---

## 🎯 Success Criteria

### Functional Requirements
- ✅ Homepage magic link sends successfully
- ✅ Demo users assigned to demo company
- ✅ Demo users have read-only access
- ✅ Invite requests saved to database
- ✅ Admin can approve/reject requests
- ✅ Approved users receive invite code
- ✅ Official signup creates new company
- ✅ Dashboard differentiates demo vs official

### Non-Functional Requirements
- ✅ Page load < 2 seconds
- ✅ Magic link delivery < 30 seconds
- ✅ Mobile-responsive UI
- ✅ No data leakage between companies
- ✅ RLS policies enforced

---

## 🚀 Post-Launch Enhancements

### Phase 11: Analytics
- Track demo signup rate
- Track invite request rate
- Track approval rate
- Track demo-to-official conversion

### Phase 12: Automation
- Auto-approve requests based on criteria
- Scheduled invite expiry cleanup
- Demo account cleanup (delete after 30 days of inactivity)

### Phase 13: Communication
- Welcome email for demo users
- Reminder email after 3 days (if no invite request)
- Admin notification on new invite request
- SMS notification for approved invites (MSG91)

---

## 📝 Documentation Updates

### Files to Update
- [x] `MAGIC_LINK_IMPLEMENTATION_PLAN.md` (this file)
- [ ] `.todo.md` - Add Phase 2B
- [ ] `.claude.md` - Update auth section
- [ ] `.context.md` - Add demo system details
- [ ] `README.md` - Update testing instructions

---

## 🔐 Security Considerations

### Demo Account
- ✅ Read-only access enforced via RLS
- ✅ Cannot modify/delete data
- ✅ Cannot create new records
- ✅ Isolated from real companies

### Invite System
- ✅ Email verification via magic link
- ✅ Invite codes expire after 48 hours
- ✅ One-time use only
- ✅ Admin approval required

### RLS Policies
- ✅ Company isolation maintained
- ✅ Demo users see only demo company
- ✅ Official users see only their company
- ✅ No cross-company data access

---

**Last Updated:** January 11, 2025
**Status:** Ready for Implementation
**Owner:** Development Team
