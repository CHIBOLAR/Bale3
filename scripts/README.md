# Bale Inventory - Invite Management Scripts

This folder contains scripts to help you create and manage invites for the Bale Inventory platform.

## Available Scripts

### 1. Node.js Script (Recommended)
**File:** `manage-invites.js`

A full-featured command-line tool for managing invites.

#### Prerequisites
```bash
# Ensure you have Node.js installed and dependencies installed
npm install
```

#### Setup
Make sure your `.env.local` file has the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### Usage

**Create a Platform Invite** (for new companies):
```bash
node scripts/manage-invites.js create-platform newuser@example.com
```

**Create a Staff Invite** (for existing companies):
```bash
node scripts/manage-invites.js create-staff staff@example.com <company_id> <warehouse_id> staff
```

**List All Invites:**
```bash
node scripts/manage-invites.js list
```

**List Platform Invites Only:**
```bash
node scripts/manage-invites.js list platform
```

**List Staff Invites Only:**
```bash
node scripts/manage-invites.js list staff
```

**Check Invite Status:**
```bash
node scripts/manage-invites.js check ABC123DEF456
```

**Revoke an Invite:**
```bash
node scripts/manage-invites.js revoke ABC123DEF456
```

#### Features
- ✅ Automatic validation of company and warehouse IDs
- ✅ Auto-detects admin user if not provided
- ✅ Beautiful formatted output
- ✅ Shows invite details including signup URL
- ✅ Lists all invites with status indicators
- ✅ Checks invite validity

---

### 2. SQL Script (Quick Method)
**File:** `create-invite.sql`

Direct SQL commands to run in Supabase Studio SQL Editor.

#### Usage

1. Open Supabase Studio:
   - **Local:** http://localhost:54323
   - **Production:** https://supabase.com/dashboard

2. Navigate to **SQL Editor**

3. Copy and paste commands from `create-invite.sql`

4. Replace placeholder values with actual data

5. Run the query

#### Example: Create Platform Invite

```sql
-- Step 1: Get admin user ID
SELECT id, email FROM users WHERE role = 'admin' LIMIT 1;

-- Step 2: Create invite (replace the UUID with actual ID from step 1)
SELECT create_platform_invite(
    'newuser@example.com'::TEXT,
    'abc12345-6789-0def-ghij-klmnopqrstuv'::UUID
);

-- Result will include the invite code to share with the user
```

---

## Invite Types

### Platform Invites
- **Purpose:** Allow new companies to join the platform
- **Who creates:** Super admins or designated platform administrators
- **What happens:** User signs up → Creates new company + admin user + default warehouse
- **Fields required:** Email, Invited by (admin user ID)

### Staff Invites
- **Purpose:** Allow company admins to invite staff members
- **Who creates:** Company admins
- **What happens:** User signs up → Joins existing company as staff member
- **Fields required:** Email, Company ID, Warehouse ID, Role (admin/staff), Invited by (admin user ID)

---

## Invite Flow

### 1. Create Invite
```
Admin creates invite → System generates 12-character code → Share code with user
```

### 2. User Signup

**Method A: Email/Password**
```
User goes to /signup → Enters invite code → Validates → Signup form → Creates account
```

**Method B: Google OAuth**
```
User goes to /signup → Clicks "Sign in with Google" → Google auth → Auto-validates by email → Creates account
```

### 3. Invite Status
- **pending:** Invite created, not yet used
- **accepted:** User successfully signed up with this invite
- **expired:** Invite expired (48 hours passed)
- **revoked:** Invite manually revoked by admin

---

## Common Workflows

### Create First Platform Invite (Bootstrap)

**Using Node.js Script:**
```bash
# Will auto-detect first admin user
node scripts/manage-invites.js create-platform newcompany@example.com
```

**Using SQL:**
```sql
-- Get first admin
SELECT id FROM users WHERE role = 'admin' LIMIT 1;

-- Create invite
SELECT create_platform_invite('newcompany@example.com', 'USER_ID_HERE'::UUID);
```

### Add Staff to Existing Company

**Using Node.js Script:**
```bash
# First, list companies to get IDs
node scripts/manage-invites.js list

# Create staff invite
node scripts/manage-invites.js create-staff \
  staffuser@example.com \
  company-uuid-here \
  warehouse-uuid-here \
  staff
```

**Using SQL:**
```sql
-- Find company
SELECT id, name FROM companies WHERE name ILIKE '%textile%';

-- Find warehouse in company
SELECT id, name FROM warehouses WHERE company_id = 'COMPANY_ID';

-- Create staff invite
SELECT create_staff_invite(
    'staffuser@example.com',
    'COMPANY_ID'::UUID,
    'WAREHOUSE_ID'::UUID,
    'staff'::TEXT,
    'ADMIN_USER_ID'::UUID
);
```

### Check Active Invites

**Using Node.js Script:**
```bash
node scripts/manage-invites.js list
```

**Using SQL:**
```sql
SELECT code, email, invite_type, status, expires_at
FROM invites
WHERE status = 'pending' AND expires_at > NOW()
ORDER BY created_at DESC;
```

### Revoke Unused Invite

**Using Node.js Script:**
```bash
node scripts/manage-invites.js revoke ABC123DEF456
```

**Using SQL:**
```sql
UPDATE invites
SET status = 'revoked', updated_at = NOW()
WHERE code = 'ABC123DEF456' AND status = 'pending';
```

---

## Invite Code Format

- **Length:** 12 characters
- **Format:** Alphanumeric (A-Z, 0-9)
- **Case:** Uppercase
- **Example:** `ABC123DEF456`
- **Uniqueness:** Guaranteed unique across all invites

---

## Expiration

- **Default:** 48 hours from creation
- **Auto-expire:** Run `SELECT expire_old_invites();` to mark expired invites
- **Recommendation:** Set up a cron job to run expire function daily

---

## Security Notes

⚠️ **Important:**
- Never share service role key publicly
- Invite codes should be shared securely (email, direct message)
- Regularly clean up expired invites
- Review and revoke unused invites periodically
- Super admin flag should be granted carefully

---

## Troubleshooting

### "Function does not exist" error
```bash
# Make sure invite system migration is applied
npx supabase db reset  # local
# or
npx supabase db push   # production
```

### "No admin user found"
```sql
-- Create a super admin manually
UPDATE users
SET is_super_admin = true
WHERE email = 'youradmin@example.com';
```

### Cannot find company/warehouse
```sql
-- List all companies
SELECT id, name FROM companies;

-- List all warehouses
SELECT id, name, company_id FROM warehouses;
```

### Invite not working
```bash
# Check invite details
node scripts/manage-invites.js check ABC123DEF456
```

```sql
-- Check in database
SELECT * FROM invites WHERE code = 'ABC123DEF456';
```

---

## Environment Setup

### Local Development
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key
```

Get local service role key:
```bash
npx supabase status | grep "service_role key"
```

### Production
```env
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

Get production service role key from Supabase Dashboard → Settings → API

---

## Additional Resources

- [Invite System Setup Guide](../INVITE_SYSTEM_SETUP.md)
- [Google OAuth Setup Guide](../GOOGLE_OAUTH_SETUP.md)
- [Project Documentation](./.claude.md)
- [Database Migrations](../supabase/migrations/)

---

## Support

For issues or questions:
1. Check this README
2. Review `create-invite.sql` for SQL examples
3. Run script with `--help` flag (Node.js script)
4. Check Supabase logs in Studio
