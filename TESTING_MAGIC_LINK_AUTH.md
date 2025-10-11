# Testing Magic Link Authentication Flow

## Prerequisites
✅ Server running at http://localhost:3000
✅ Supabase project configured
✅ Email access to receive magic links

---

## Test 1: Magic Link Demo Signup

### Steps:
1. **Open homepage**
   ```
   Navigate to: http://localhost:3000
   ```

2. **Fill in "Try Demo" form**
   - Enter your email address (use a real email you can access)
   - Click "Try Demo" button

3. **Expected Result:**
   - ✅ Form shows: "Check Your Email!"
   - ✅ Console log: "Magic link sent"
   - ✅ Email received in inbox (check spam too)

4. **Check Email**
   - **Subject:** Confirm your signup
   - **From:** Supabase / Bale Inventory
   - **Contains:** "Confirm your sign up" button/link

5. **Click Magic Link**
   - Link format: `http://localhost:3000/auth/callback?token_hash=...&type=email&next=/`
   - Should open in browser
   - Should redirect to `/dashboard`

6. **Verify Demo Account Created**
   - ✅ Dashboard loads successfully
   - ✅ Blue demo banner visible at top
   - ✅ Banner says "Demo Mode"
   - ✅ Welcome message shows your name
   - ✅ Company name ends with "(Demo Account)"
   - ✅ Quick Actions show "View only" text

### Database Verification:
```sql
-- Check user was created correctly
SELECT
  id, email, first_name, last_name,
  role, is_demo, company_id
FROM users
WHERE email = 'your-test-email@example.com';

-- Expected result:
-- role: 'customer'
-- is_demo: true
-- company_id: [demo_company_id]

-- Check they're in demo company
SELECT * FROM companies WHERE is_demo = true;
```

---

## Test 2: Request Official Access (Upgrade Flow)

### Steps:
1. **While logged into demo account**, click "Request Official Access" button on demo banner
   - OR navigate to: http://localhost:3000/request-invite

2. **Fill Request Form**
   - Name: Your name
   - Email: **SAME EMAIL** used for demo
   - Phone: 10-digit number
   - Company: Your company name
   - Message: (optional) "Testing upgrade flow"
   - Click "Submit Request"

3. **Expected Result:**
   - ✅ Success message: "Request Received!"
   - ✅ No error about "email already exists"
   - ✅ Console log: "Demo user requesting upgrade"

### Database Verification:
```sql
-- Check request was created
SELECT * FROM invite_requests
WHERE email = 'your-test-email@example.com'
ORDER BY created_at DESC LIMIT 1;

-- Expected:
-- status: 'pending'
-- email matches your demo email
```

---

## Test 3: Admin Approval

### Steps:
1. **Log in as admin user**
   - Navigate to: http://localhost:3000/login
   - Use admin credentials

2. **Go to invite requests page**
   ```
   http://localhost:3000/dashboard/admin/invite-requests
   ```

3. **Find your pending request**
   - Should see your name, email, company
   - Status: Pending (yellow badge)

4. **Click "Approve" button**

5. **Expected Result:**
   - ✅ Modal appears with:
     - "✅ Request Approved!"
     - Type: **Upgrade** (not "New Signup")
     - Invite Code: 12-character code
     - **Upgrade Link** (copyable with "Copy" button)
   - ✅ Link format: `http://localhost:3000/upgrade?token=XXXXX`

6. **Copy the upgrade link**

### Console Verification:
Check terminal/console for logs:
```
🔄 Created upgrade invite for: your-test-email@example.com | Code: XXXXX
📧 Upgrade link: http://localhost:3000/upgrade?token=XXXXX
```

### Database Verification:
```sql
-- Check invite was created
SELECT * FROM invites
WHERE email = 'your-test-email@example.com'
ORDER BY created_at DESC LIMIT 1;

-- Expected:
-- status: 'pending'
-- invite_type: 'platform'
-- metadata includes: { "is_upgrade": true }

-- Check request was updated
SELECT status, invite_id FROM invite_requests
WHERE email = 'your-test-email@example.com';

-- Expected:
-- status: 'approved'
-- invite_id: [uuid of created invite]
```

---

## Test 4: Execute Upgrade (Critical Test!)

### Steps:
1. **IMPORTANT: Stay logged in as demo user**
   - Do NOT log out
   - Do NOT close the browser
   - This tests the seamless upgrade flow

2. **In the SAME browser**, paste the upgrade link from Test 3**
   ```
   http://localhost:3000/upgrade?token=XXXXX
   ```

3. **Expected Result:**
   - ✅ Upgrade page loads
   - ✅ Shows: "Upgrade to Official Account"
   - ✅ Shows benefits list (4 checkmarks)
   - ✅ "Upgrade to Official Account" button visible
   - ✅ NO login prompt (already logged in)

4. **Click "Upgrade to Official Account" button**

5. **Expected Result:**
   - ✅ Success message: "Upgrade Complete!"
   - ✅ Shows new company name
   - ✅ "Redirecting to your dashboard..."
   - ✅ Auto-redirects to `/dashboard` after 2 seconds

6. **Verify Post-Upgrade Dashboard**
   - ✅ NO demo banner (banner disappeared)
   - ✅ Company name changed (no longer says "Demo Account")
   - ✅ Quick Actions changed to "Add New Product" (not "View Products")
   - ✅ Can access all features

### Database Verification (CRITICAL):
```sql
-- Check user was upgraded
SELECT
  id, email, first_name,
  role, is_demo, company_id
FROM users
WHERE email = 'your-test-email@example.com';

-- Expected AFTER upgrade:
-- role: 'admin' (changed from 'customer')
-- is_demo: false (changed from true)
-- company_id: [NEW company id, different from demo]

-- Check NEW company was created
SELECT * FROM companies
WHERE id = (
  SELECT company_id FROM users
  WHERE email = 'your-test-email@example.com'
);

-- Expected:
-- is_demo: false
-- name: "[YourName]'s Company"

-- Check warehouse was created
SELECT * FROM warehouses
WHERE company_id = (
  SELECT company_id FROM users
  WHERE email = 'your-test-email@example.com'
);

-- Expected:
-- name: 'Main Warehouse'

-- Check invite was marked accepted
SELECT status, accepted_at FROM invites
WHERE email = 'your-test-email@example.com'
AND invite_type = 'platform'
ORDER BY created_at DESC LIMIT 1;

-- Expected:
-- status: 'accepted'
-- accepted_at: [timestamp]
```

---

## Common Issues & Solutions

### Issue 1: "Email already exists" when requesting access
**Symptom:** Error when demo user tries to request official access
**Cause:** Old code that blocked existing users
**Fix:** Code updated in `app/api/request-invite/route.ts:31-49`
**Verify:** Should allow demo users to request

### Issue 2: Upgrade link gives "Invalid token"
**Symptom:** Upgrade page shows error
**Causes:**
- Token expired (7 days)
- Token already used
- Wrong email (invite for different email)
**Fix:** Admin creates new invite

### Issue 3: Upgrade button does nothing
**Symptom:** Click upgrade button, nothing happens
**Check:** Browser console for errors
**Verify:** User is logged in: `supabase.auth.getUser()`

### Issue 4: User gets logout prompt on upgrade page
**Symptom:** "You must be logged in to upgrade"
**Cause:** User logged out between request and upgrade
**Fix:** User logs back in, then clicks upgrade link again

### Issue 5: Demo banner still shows after upgrade
**Symptom:** Banner doesn't disappear
**Cause:** Page not refreshed after upgrade
**Fix:** Hard refresh (Ctrl+F5) or check `is_demo` in database

---

## Expected Console Logs (Normal Flow)

### Test 1 - Magic Link Sent:
```
POST /api/auth/... 200
Sending magic link to: test@example.com
```

### Test 2 - Request Created:
```
POST /api/request-invite 201
Demo user requesting upgrade: test@example.com
New invite request created: [uuid]
```

### Test 3 - Admin Approval:
```
POST /api/admin/approve-invite 200
🔄 Created upgrade invite for: test@example.com | Code: XXXXX
📧 Upgrade link: http://localhost:3000/upgrade?token=XXXXX
```

### Test 4 - Upgrade Execution:
```
POST /api/upgrade-account 200
🔄 Upgrading demo user to official: test@example.com
✅ Successfully upgraded user: test@example.com | New company: [Name]'s Company
```

---

## Quick Test Checklist

- [ ] Server running (http://localhost:3000)
- [ ] Test email accessible
- [ ] Magic link received in email
- [ ] Magic link redirects to dashboard
- [ ] Demo banner visible
- [ ] Can request access with same email
- [ ] Request shows as "pending" for admin
- [ ] Admin approval shows "Type: Upgrade"
- [ ] Upgrade link copied successfully
- [ ] Upgrade page loads while logged in
- [ ] Upgrade button executes successfully
- [ ] Demo banner disappears after upgrade
- [ ] User role changed to "admin"
- [ ] is_demo changed to "false"
- [ ] New company created
- [ ] New warehouse created

---

## Test Data Cleanup (After Testing)

```sql
-- Remove test user (cascades to company if they own it)
DELETE FROM users WHERE email = 'your-test-email@example.com';

-- Remove test invite request
DELETE FROM invite_requests WHERE email = 'your-test-email@example.com';

-- Remove test invite
DELETE FROM invites WHERE email = 'your-test-email@example.com';

-- Optional: Remove test company (only if no longer needed)
DELETE FROM companies WHERE name LIKE '%YourName%' AND is_demo = false;
```

---

## Next Steps After Successful Test

1. ✅ Magic link authentication works
2. ✅ Demo account creation works
3. ✅ Upgrade flow works seamlessly
4. ✅ Database state is correct

**Ready for:**
- Production deployment
- MSG91 email integration (when domain ready)
- User onboarding at scale
