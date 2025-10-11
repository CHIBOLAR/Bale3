# Supabase Configuration Checklist

## Required Settings in Supabase Dashboard

### 1. Navigate to Authentication Settings
- Go to https://supabase.com/dashboard
- Select your project
- Click **Authentication** in sidebar
- Click **URL Configuration**

### 2. Site URL (CRITICAL)
```
Site URL: http://localhost:3000
```
This is where Supabase will redirect users after email verification.

### 3. Redirect URLs (CRITICAL)
Add this to the **Redirect URLs** list:
```
http://localhost:3000/auth/callback
```
This allows Supabase to redirect to your callback handler.

### 4. Email Templates (Optional Check)
- Click **Email Templates** in Authentication settings
- Check "Confirm signup" template
- Should contain: `{{ .ConfirmationURL }}`
- This will generate the correct magic link

### 5. PKCE Flow (Should be disabled for magic links)
- In **URL Configuration**, scroll down
- Look for any PKCE-related settings
- Magic links should NOT use PKCE

---

## What We Fixed

### Before (PKCE Flow - Broken):
```typescript
// homepage - client-side
await supabase.auth.signInWithOtp({
  email: email,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`, // ❌ Triggers PKCE
  },
});

// Result: Supabase sends ?code=XXXXX (requires PKCE verifier)
// Error: "both auth code and code verifier should be non-empty"
```

### After (OTP Flow - Fixed):
```typescript
// homepage - client-side
await supabase.auth.signInWithOtp({
  email: email,
  options: {
    shouldCreateUser: true,
    // ✅ No emailRedirectTo = simple OTP flow
  },
});

// Result: Supabase sends ?token_hash=XXXXX&type=magiclink
// Success: Verified with verifyOtp() - no PKCE needed!
```

---

## Testing Steps

### 1. Clear Browser Cache
- Press `Ctrl + Shift + Delete`
- Clear all cookies and site data
- This removes old PKCE verifiers

### 2. Request Fresh Magic Link
```
1. Go to http://localhost:3000
2. Enter your email
3. Click "Try Demo"
4. Check your email inbox
```

### 3. Click Magic Link
- Link should look like:
  ```
  http://localhost:3000/auth/callback?token_hash=XXXXX&type=magiclink
  ```
- **NOT** like this (old PKCE flow):
  ```
  http://localhost:3000/auth/callback?code=XXXXX
  ```

### 4. Expected Server Logs
```bash
🔗 Magic link callback detected
✅ Magic link verified for: your-email@example.com
🎭 Creating demo account for: your-email@example.com
✅ Demo user created for: your-email@example.com
GET /auth/callback?token_hash=... 307
GET /dashboard 200
```

### 5. Verify Dashboard Access
- Should see dashboard with demo banner
- Welcome message with your email username
- Company name: "Demo Company (Demo Account)"
- Blue banner: "Demo Mode - Request Official Access"

---

## If Still Not Working

### Check Email Link Format
1. Open email from Supabase
2. Right-click "Confirm your signup" button
3. Copy link address
4. Check if it contains:
   - ✅ `token_hash` parameter → Good (OTP flow)
   - ❌ `code` parameter → Bad (PKCE flow)

### If email contains `code` parameter:
- Supabase is still using PKCE despite our fix
- Check Supabase email template
- May need to update template in dashboard

### If email contains `token_hash`:
- Our fix is working!
- Check server logs for errors
- Verify callback handler is receiving the parameters

---

## Troubleshooting

### Error: "Invalid magic link"
- Magic link expired (default: 1 hour)
- Request a new one

### Error: "Demo creation failed"
- Check if demo company exists in database
- Run: `SELECT * FROM companies WHERE is_demo = true;`
- Should return 1 demo company

### Still seeing PKCE errors:
- Old magic links are still using PKCE
- Clear browser cache
- Request NEW magic link after the code changes
- New links will use OTP flow

---

## Success Indicators

✅ No PKCE errors in server logs
✅ Server logs show "Magic link callback detected"
✅ Dashboard loads with demo banner
✅ User created with `is_demo: true` and `role: customer`
✅ Can navigate around dashboard (read-only mode)

