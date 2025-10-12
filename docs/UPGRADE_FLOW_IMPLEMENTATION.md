# Upgrade Flow Implementation

## Overview
Implemented a complete upgrade request system that allows demo users to request full platform access without creating database records until admin approval.

## Date: 2025-10-12

## Problem Solved
- Demo users could authenticate but had no user record in `public.users` table
- Request upgrade page was failing with 406 errors due to RLS policies
- Original flow tried to create user records on request (breaking the "no DB record until approval" design)

## Solution Architecture

### 1. Database Changes

#### New Table: `upgrade_requests`
Created a dedicated table to store upgrade requests separate from the users table.

**Schema:**
```sql
CREATE TABLE upgrade_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  UNIQUE(auth_user_id)
);
```

**RLS Policies:**
- Users can view their own upgrade requests
- Users can create upgrade requests
- Admins can view all upgrade requests
- Admins can update upgrade requests (approve/reject)

**Migration:** `allow_users_to_query_own_auth_id`
Added RLS policy to allow authenticated users to query for their own `auth_user_id` in the users table, even if no record exists.

### 2. API Changes

#### `/api/request-invite` (POST)
**Purpose:** Submit upgrade request from demo user

**Flow:**
1. Verify user is authenticated
2. Check if user already has full access (if user record exists)
3. Check for existing upgrade requests
4. Allow re-submission if previously rejected
5. Create new upgrade request in `upgrade_requests` table
6. NO user record created until approval

**Key Changes:**
- Changed from updating `users.upgrade_requested` to inserting into `upgrade_requests`
- Removed user record creation logic
- Added support for re-requesting after rejection

#### `/api/admin/approve-upgrade` (POST)
**Purpose:** Approve upgrade request and create full user account

**Flow:**
1. Verify admin is superadmin
2. Fetch upgrade request by ID
3. Validate request is pending
4. Create new company for the user
5. Create OR update user record with full access
6. Create default warehouse
7. Mark request as approved

**Key Changes:**
- Changed from accepting `userId` to `requestId`
- Added logic to create user record on approval
- Handles both new users and existing demo users
- Creates company, user, and warehouse in single transaction
- Fixed column name: `is_super_admin` → `is_superadmin`

### 3. Frontend Changes

#### `/app/dashboard/request-upgrade/page.tsx`
**Purpose:** Demo users request upgrade to full access

**Changes:**
- Changed `.single()` to `.maybeSingle()` to handle users without DB records
- Added fallback logic to treat users without records as demo users
- Uses auth user email if no user record exists

#### `/app/dashboard/admin/invite-requests/page.tsx`
**Purpose:** Admin dashboard to review upgrade requests

**Changes:**
- Fetches from `upgrade_requests` table instead of users table
- Fixed column name: `is_super_admin` → `is_superadmin`
- Updated to query pending requests

#### `/app/dashboard/admin/invite-requests/InviteRequestsClient.tsx`
**Purpose:** Client component for managing upgrade requests

**Changes:**
- Updated interface to match `upgrade_requests` table structure
- Changed API call to send `requestId` instead of `userId`
- Simplified data display to use flat structure

#### `/app/(auth)/login/page.tsx`
**Purpose:** Login page for existing users

**Status:** CREATED (was previously deleted)

**Features:**
- Email + OTP authentication
- Two-step flow: email → OTP verification
- Redirects to dashboard after login
- Link to try demo for new users

### 4. Bug Fixes

#### Column Name Consistency
Fixed inconsistent column naming throughout codebase:
- `is_super_admin` → `is_superadmin` (database column name)

#### RLS Policy Issues
- Added policy to allow users to query their own `auth_user_id`
- Fixed INSERT policy to work with server-side auth context

#### Superadmin Account Fix
Updated bale.inventory@gmail.com account:
- role: `staff` → `admin`
- is_demo: `true` → `false`
- Kept is_superadmin: `true`

## User Flow

### Demo User Journey
1. User authenticates via OTP (exists in `auth.users` only)
2. User accesses dashboard in demo mode (no `public.users` record)
3. User clicks "Request Upgrade" button
4. User fills form: name, phone, company, message
5. Request stored in `upgrade_requests` table
6. User continues using demo while waiting for approval

### Admin Approval Journey
1. Admin logs in as superadmin (bale.inventory@gmail.com)
2. Admin navigates to `/dashboard/admin/invite-requests`
3. Admin sees pending upgrade requests with user details
4. Admin clicks "Approve & Upgrade Instantly"
5. System creates:
   - New company (with provided company name)
   - User record in `public.users` (with is_demo=false, role=admin)
   - Default warehouse
6. Request marked as approved
7. User can now log in with full access

### After Approval
1. User logs out and back in
2. Middleware and RLS policies detect user record exists
3. User now has:
   - Own company
   - Admin role
   - Full CRUD permissions
   - Ability to invite staff

## Files Changed

### Database
- `supabase/migrations/create_upgrade_requests_table.sql` - New table
- `supabase/migrations/allow_users_to_query_own_auth_id.sql` - RLS policy

### API Routes
- `app/api/request-invite/route.ts` - Rewritten to use upgrade_requests
- `app/api/admin/approve-upgrade/route.ts` - Rewritten to create user on approval

### Pages
- `app/dashboard/request-upgrade/page.tsx` - Fixed to handle users without DB records
- `app/dashboard/admin/invite-requests/page.tsx` - Updated to fetch from upgrade_requests
- `app/(auth)/login/page.tsx` - Created login page

### Components
- `app/dashboard/admin/invite-requests/InviteRequestsClient.tsx` - Updated interface

## Technical Decisions

### Why Separate Table?
1. **Clean separation of concerns** - Upgrade requests are distinct from user records
2. **No premature data creation** - Keeps "no user record until approval" design
3. **Audit trail** - Can track request history (pending, approved, rejected)
4. **Allows re-requests** - Users can resubmit after rejection
5. **Simpler RLS** - Easier to control who can see requests

### Why NOT Store in auth.users metadata?
1. Harder to query and manage
2. No relational constraints
3. Difficult for admins to review
4. No audit trail

### Why Create User Record on Approval?
1. Full access requires RLS policies based on user record
2. Company association needs user record
3. Role-based permissions need user record
4. Simpler than maintaining dual auth contexts

## Testing Checklist

### Demo User Flow
- [x] User can authenticate without user record
- [x] User can access dashboard in demo mode
- [x] User can view request-upgrade page
- [x] User can submit upgrade request
- [x] Request stored correctly in database
- [x] User can continue using demo after request

### Admin Flow
- [x] Admin can access admin panel
- [x] Admin can see pending requests
- [x] Admin can approve requests
- [x] Approval creates company + user + warehouse
- [x] Request marked as approved

### After Approval
- [ ] User can log back in
- [ ] User has full access (not demo)
- [ ] User sees own company data
- [ ] User can perform CRUD operations
- [ ] User can invite staff members

## Known Issues / Future Improvements

1. **Email Notifications** - Not implemented yet for approval
2. **Rejection Flow** - Admin can't reject requests (only approve)
3. **Request Details** - Could add more fields (business size, industry, etc.)
4. **Approval Notes** - Admin can't add notes when approving
5. **Request Expiry** - No automatic expiry of old requests

## Configuration

### Environment Variables
No new environment variables required.

### Database Permissions
Ensure service role key is used for admin operations (creating users on approval).

### Supabase Auth Settings
- Email OTP enabled
- Rate limiting configured for OTP requests

## Security Considerations

1. **RLS Policies** - Properly restrict access to upgrade_requests
2. **Admin Verification** - Superadmin check on approval endpoint
3. **Input Validation** - Name, phone, company validated
4. **Rate Limiting** - OTP requests rate limited
5. **No Sensitive Data** - Avoid storing sensitive info in requests

## Performance

- Queries use indexes on `auth_user_id` and `status`
- Admin page only fetches pending requests
- No N+1 query issues

## Rollback Plan

If issues arise:
1. Revert migration to drop `upgrade_requests` table
2. Revert API changes to previous version
3. Old flow: Users request via `users.upgrade_requested` field

## Future Enhancements

1. **Email notifications** on approval/rejection
2. **Admin dashboard** with statistics
3. **Request analytics** (approval rates, time to approval)
4. **Batch approval** for multiple requests
5. **Request filtering** by date, status, company
6. **User communication** in-app messaging for requests
7. **Rejection reasons** required field for admins
8. **Request expiry** auto-reject after X days
9. **Priority queue** for certain business types
10. **Integration testing** automated test suite

## Migration from Old System

Old system had:
- `users.upgrade_requested` boolean
- `users.upgrade_request_data` jsonb
- `users.upgrade_approved` boolean

New system:
- Separate `upgrade_requests` table
- Cleaner data model
- Better audit trail

**Migration Strategy:**
No migration needed as old fields are still in users table but unused.

## Support

For issues or questions:
1. Check Supabase logs for RLS policy errors
2. Check browser console for API errors
3. Verify user has correct permissions
4. Ensure migrations are applied

## Contributors

- Implementation: Claude + Chirag
- Date: 2025-10-12
- Version: 1.0.0
