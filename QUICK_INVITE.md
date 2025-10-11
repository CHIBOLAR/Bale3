# Quick Invite Creation Guide

## Simple Method - Just Run the Script!

### Step 1: Make sure Supabase is running

```bash
# For local development
npx supabase start
```

### Step 2: Run the invite script

```bash
node scripts/create-invite.js
```

### Step 3: Enter email when prompted

```
Enter email address: newuser@example.com
```

### Step 4: Copy the invite code and share it!

The script will display something like:

```
✅ Invite created successfully!

════════════════════════════════════════════════════
  Email:        newuser@example.com
  Invite Code:  7DBF2F52C315
  Type:         Platform (New Company)
  Expires:      48 hours from now
════════════════════════════════════════════════════

📋 Share this invite code with the user:

   7DBF2F52C315

🔗 Signup URL:

   http://localhost:3000/signup?invite=7DBF2F52C315
```

---

## That's it! 🎉

Just share the invite code with your user and they can sign up at `/signup` using:
- **Email/Password + Invite Code**
- **Google OAuth** (auto-validates by email)

---

## Troubleshooting

### Error: "Missing environment variables"
Make sure you have `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Get your service role key:
```bash
npx supabase status | grep "service_role key"
```

### Error: "No admin user found"
Create a test company first by signing up at `/signup` with a platform invite, or create an admin manually in the database.

---

## For Production

1. Update `.env.local` with production Supabase credentials
2. Run the script the same way
3. Share the production signup URL with the invite code

That's all! No SQL needed. 🚀
