# Email OTP Authentication Guide

## Why Email OTP Instead of Magic Links?

### ❌ Magic Link Problems (Your Scenario)

**Your use case:**
1. Admin shares invite link via WhatsApp
2. User opens WhatsApp on mobile
3. WhatsApp opens link in in-app browser
4. User clicks magic link from Gmail
5. Gmail opens in different browser/app
6. **Magic link fails** - different browser than where requested!

**Magic link failures:**
- ❌ Opened in different browser/device
- ❌ Email client opens in private/incognito mode
- ❌ Browser blocks cookies
- ❌ WhatsApp in-app browser issues
- ❌ Can be forwarded (security risk)
- ❌ PKCE session dependency

### ✅ Email OTP Benefits

**6-digit code advantages:**
- ✅ **Works on ANY device/browser** (no session required!)
- ✅ **Mobile-friendly** - copy-paste from email
- ✅ **WhatsApp compatible** - receive on phone, enter on laptop
- ✅ **No cookies needed** - pure token-based
- ✅ **More secure** - can't be forwarded
- ✅ **Better UX** - familiar pattern (like Google, Twitter)
- ✅ **Cross-device** - receive email on phone, verify on computer

---

## How It Works

### User Flow

1. **Request Code**
   - User enters email on homepage
   - Clicks "Try Demo"
   - Redirected to verification page

2. **Receive Email**
   - Supabase sends email with 6-digit code
   - Example: "Your code is 123456"
   - Valid for 1 hour

3. **Enter Code**
   - User enters 6-digit code on website
   - Works from ANY browser/device
   - Can copy-paste from email

4. **Verify & Redirect**
   - Code verified server-side
   - Demo account created automatically
   - Redirected to dashboard

---

## File Structure

### 1. Homepage (`app/page.tsx`)
```typescript
// Sends OTP email and redirects to verification
const { error } = await supabase.auth.signInWithOtp({
  email: email,
  options: { shouldCreateUser: true },
});

router.push(`/verify-otp?email=${email}`);
```

### 2. OTP Verification Page (`app/verify-otp/page.tsx`)
- User enters 6-digit code
- Verifies with Supabase
- Creates demo account via API
- Redirects to dashboard

### 3. Demo Account API (`app/api/create-demo-account/route.ts`)
- Verifies user is authenticated
- Checks if user exists
- Creates demo user record:
  - Role: `staff` (read-only via RLS)
  - Company: Demo company (shared)
  - `is_demo: true`

---

## Testing Steps

### 1. Request OTP Code
```
1. Go to http://localhost:3000
2. Enter email: your-email@example.com
3. Click "Try Demo"
4. Redirected to: /verify-otp?email=your-email@example.com
```

### 2. Check Email
- **Subject:** "Confirm your signup"
- **Body:** Contains 6-digit code (e.g., 123456)
- **Sender:** Supabase / Your App

### 3. Enter Code
```
1. Enter 6-digit code from email
2. Click "Verify Code"
3. Wait for verification
4. Redirected to dashboard
```

### 4. Verify Demo Account
- Dashboard shows demo banner
- User role: `staff`
- `is_demo: true`
- Read-only access

---

## Mobile/WhatsApp Scenarios

### Scenario 1: WhatsApp → Email (Your Use Case!)
```
1. Admin shares demo link via WhatsApp
2. User clicks link on mobile
3. Opens in WhatsApp browser
4. Enters email → OTP sent
5. User switches to Gmail app
6. Copies 6-digit code
7. Returns to browser (same or different!)
8. Pastes code → Success! ✅
```

**Why it works:**
- No session dependency
- Code works across browsers
- Mobile-friendly copy-paste

### Scenario 2: Phone → Laptop
```
1. User enters email on phone
2. Receives OTP on phone
3. Opens laptop
4. Goes to /verify-otp?email=...
5. Enters code from phone
6. Success! ✅
```

**Why it works:**
- Cross-device compatible
- Just need the code

### Scenario 3: Incognito Mode
```
1. User opens site in incognito
2. Enters email → OTP sent
3. Enters code
4. Success! ✅
```

**Why it works:**
- No cookies needed
- Token-based verification

---

## Supabase Configuration

### Email Template (Supabase Dashboard)

**Path:** Authentication → Email Templates → Confirm signup

**Current template:**
```
{{ .ConfirmationURL }}
```

**For OTP only (optional change):**
```html
<h2>Your verification code</h2>
<p>Enter this code to continue:</p>
<h1 style="font-size: 32px; letter-spacing: 8px;">{{ .Token }}</h1>
<p>This code expires in 1 hour.</p>
```

### Rate Limits

**Supabase Free Tier:**
- 4 emails per hour per email address
- Sufficient for testing

**Production (with MSG91):**
- 5,000 emails per month
- Much higher rate limits

---

## Code Examples

### Send OTP
```typescript
const supabase = createClient();

const { error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    shouldCreateUser: true, // Auto-create Supabase auth user
  },
});
```

### Verify OTP
```typescript
const { data, error } = await supabase.auth.verifyOtp({
  email: 'user@example.com',
  token: '123456', // 6-digit code
  type: 'email',
});

if (data.user) {
  console.log('Verified!', data.user.email);
}
```

### Check User Exists
```typescript
const { data: existingUser } = await supabase
  .from('users')
  .select('id')
  .eq('auth_user_id', data.user.id)
  .single();

if (!existingUser) {
  // Create demo account
}
```

---

## Security Features

### OTP Security
- ✅ **Expires:** 1 hour (Supabase default)
- ✅ **One-time:** Cannot be reused
- ✅ **Rate limited:** 4 per hour per email
- ✅ **Cannot forward:** Code must be entered manually
- ✅ **Server-verified:** No client-side bypass

### Demo Account Security
- ✅ **Read-only:** Limited by RLS policies
- ✅ **Shared company:** Isolated from real data
- ✅ **Staff role:** Cannot invite others
- ✅ **Marked demo:** `is_demo: true` flag

---

## Error Handling

### Invalid Code
```
Error: "Invalid or expired code"
Solution: Request new code (click "Resend Code")
```

### Expired Code
```
Error: "Email link is invalid or has expired"
Solution: Codes expire after 1 hour, request new one
```

### Rate Limit
```
Error: "Email rate limit exceeded"
Solution: Wait 1 hour before requesting new code
```

### Demo Company Missing
```
Error: "Demo company not found"
Solution: Run migrations to create demo company
```

---

## Comparison: Magic Link vs OTP

| Feature | Magic Link | Email OTP |
|---------|-----------|-----------|
| **Cross-browser** | ❌ Fails | ✅ Works |
| **Cross-device** | ❌ Fails | ✅ Works |
| **WhatsApp compatible** | ❌ Issues | ✅ Perfect |
| **Mobile-friendly** | ⚠️ Limited | ✅ Excellent |
| **No cookies needed** | ❌ Required | ✅ Token-based |
| **Forwardable** | ⚠️ Security risk | ✅ Safe (manual entry) |
| **User familiarity** | ⚠️ Uncommon | ✅ Standard (Google, Twitter) |
| **Implementation** | Complex (PKCE) | Simple |

---

## Production Considerations

### Phase 8: MSG91 Email Integration

When domain is configured, update email templates:

**OTP Email Template:**
```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2563eb;">Bale Inventory</h1>
    <h2>Your Verification Code</h2>
    <p>Enter this code to access your demo account:</p>

    <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
      <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">
        123456
      </span>
    </div>

    <p style="color: #6b7280;">
      This code expires in 1 hour.<br>
      Do not share this code with anyone.
    </p>

    <p style="margin-top: 40px; color: #9ca3af; font-size: 12px;">
      Built for Indian textile traders
    </p>
  </div>
</body>
</html>
```

---

## Advantages for Your Business

### WhatsApp Marketing
- ✅ Share demo link via WhatsApp
- ✅ Users can verify on any device
- ✅ No browser compatibility issues
- ✅ Higher conversion rate

### Mobile Users
- ✅ 70%+ of Indian users are mobile-first
- ✅ Copy-paste friendly
- ✅ Works with Gmail app
- ✅ Works with default browser

### Customer Support
- ✅ Easy to explain ("enter the 6-digit code")
- ✅ Fewer support tickets
- ✅ Users understand the pattern

---

## Next Steps

1. ✅ **Test OTP flow** - Enter email, get code, verify
2. ✅ **Test cross-device** - Request on phone, verify on laptop
3. ✅ **Test WhatsApp** - Share link via WhatsApp, complete signup
4. ⏳ **Phase 8** - Configure MSG91 for branded emails

---

## Summary

**We switched from magic links to email OTP because:**

1. **Your use case demands it** - WhatsApp + mobile browsers
2. **Better mobile experience** - Copy-paste friendly
3. **Cross-device support** - Receive on phone, verify anywhere
4. **Simpler implementation** - No PKCE complexity
5. **Industry standard** - Users are familiar with the pattern

**Result:** Higher conversion rate, fewer support tickets, happier users!
