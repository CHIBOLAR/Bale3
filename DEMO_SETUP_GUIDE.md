# Demo Account Setup Guide

## Overview

This guide documents the complete demo account implementation that allows users to instantly try Bale Inventory with one click from the landing page.

## What Was Implemented

### 1. **Landing Page - Direct Demo Access** ✅

**Changes Made:**
- All "Try Demo" buttons now directly log into demo account (no form required)
- Login button is only for approved users
- Updated messaging to clarify the difference
- Added error handling with user-friendly messages

**Files Modified:**
- `app/page.tsx` - Converted all demo CTAs to direct login buttons
- `app/(auth)/login/page.tsx` - Optimized loading, clarified it's for approved users only

**User Flow:**
1. User clicks "Try Demo" anywhere on landing page
2. System automatically logs them into `demo@bale.inventory`
3. Redirected to dashboard with full sample data
4. No signup, no OTP, instant access

### 2. **Demo Data Population Script** ✅

**Created:**
- `scripts/seed-demo-data.ts` - Comprehensive seeding script
- Added npm script: `npm run seed-demo`

**Data Created:**
- **Company:** Demo Fabrics Ltd (with full profile)
- **Warehouses:** 2 locations (Mumbai, Surat)
- **Partners:** 5 partners (2 customers, 2 suppliers, 1 vendor)
- **Products:** 10 fabric products (Cotton, Silk, Polyester, Linen, Velvet, Wool, Denim)
- **Goods Receipts:** 5 receipts with 15-25 stock units each
- **Stock Units:** ~20-30 units in various statuses
- **Sales Orders:** 8 orders with line items

**Demo Credentials:**
```
Email: demo@bale.inventory
Password: demo1234
```

### 3. **Demo Restrictions System** ✅

**Created Files:**
- `lib/utils/demo-restrictions.ts` - Helper functions for demo limits
- `components/DemoBanner.tsx` - UI component for demo warnings

**Limits Enforced:**
```typescript
MAX_PRODUCTS: 5           // Can create 5 products
MAX_PARTNERS: 3           // Can create 3 partners
MAX_SALES_ORDERS: 3       // Can create 3 sales orders
MAX_GOODS_RECEIPTS: 2     // Can create 2 goods receipts
MAX_GOODS_DISPATCHES: 2   // Can create 2 dispatches
MAX_STAFF: 0              // Cannot create staff
MAX_WAREHOUSES: 0         // Cannot create warehouses
MAX_QR_BATCHES: 1         // Can generate 1 QR batch
```

**Restrictions:**
- ✅ **Read:** Full access to all demo data
- ✅ **Create:** Limited (see limits above)
- ✅ **Update:** Full access (can edit existing records)
- ❌ **Delete:** Blocked (preserves demo data for all users)

**Files Modified:**
- `app/dashboard/products/actions.ts` - Added demo checks to create/delete

### 4. **Demo UX Features**

**What Demo Users Experience:**
- Instant 1-click login from landing page
- Pre-populated dashboard with realistic data
- Can create limited records to "feel" the system
- Clear banners showing remaining quota
- Upgrade CTAs with WhatsApp link
- Cannot delete items (preserves demo integrity)

**Upgrade Paths:**
1. **WhatsApp:** Direct link to request full access
2. **Form:** `/dashboard/request-upgrade` page
3. **Banner CTAs:** Shown when limits are reached

## How to Setup Demo Account

### Step 1: Run the Seed Script

```bash
# Make sure environment variables are set
# NEXT_PUBLIC_SUPABASE_URL
# SUPABASE_SERVICE_ROLE_KEY

npm run seed-demo
```

**What This Does:**
1. Creates/finds demo company (Demo Fabrics Ltd)
2. Creates demo user in Supabase Auth
3. Links user to company in database
4. Populates 2 warehouses
5. Creates 5 partners
6. Creates 10 products
7. Generates 5 goods receipts with stock units
8. Creates 8 sales orders with line items

**Expected Output:**
```
🌱 Starting demo data seeding...
📦 Step 1: Setting up demo company...
  ✅ Created demo company: <uuid>
👤 Step 2: Setting up demo user...
  ✅ Created auth user: <uuid>
🏭 Step 3: Creating warehouses...
  ✅ Created/updated 2 warehouses
🤝 Step 4: Creating partners...
  ✅ Created/updated 5 partners
🧵 Step 5: Creating products...
  ✅ Created/updated 10 products
📥 Step 6: Creating goods receipts and stock units...
  ✅ Created 5 goods receipts with stock units
📋 Step 7: Creating sales orders...
  ✅ Created 8 sales orders with line items
✅ Demo data seeding completed successfully!
```

### Step 2: Verify Demo Login

1. Go to homepage: `http://localhost:3000`
2. Click "Try Demo" button
3. Should automatically log in and redirect to dashboard
4. Verify you see sample data in all modules

### Step 3: Test Demo Restrictions

**Test Create Limits:**
1. Go to Products → Add Product
2. Try creating 6 products (should block at 5)
3. Verify error message shows upgrade CTA

**Test Delete Block:**
1. Try to delete any product
2. Should see: "Deleting items is disabled in demo mode"

**Test Update (Should Work):**
1. Edit any existing product
2. Changes should save successfully

## Testing Checklist

- [ ] Landing page "Try Demo" button logs in directly
- [ ] Login page is only for approved users
- [ ] Demo account has extensive sample data
- [ ] Can view all products, partners, orders
- [ ] Can create up to 5 products
- [ ] Cannot create 6th product (blocked with message)
- [ ] Cannot delete any items
- [ ] Can update existing items
- [ ] Demo banner shows remaining quota
- [ ] Upgrade CTAs link to WhatsApp

## Architecture Notes

### No RLS (Application-Level Control)

We're NOT using Row Level Security policies. Instead:
- Demo checks happen in server actions
- Helper functions validate limits before database operations
- Cleaner error messages
- Easier to modify limits
- Can add RLS later if needed

### Demo vs Full Users

**Demo Users:**
- `is_demo: true` in users table
- Limited create permissions
- No delete permissions
- Redirected to upgrade CTAs

**Full Users:**
- `is_demo: false` in users table
- Unlimited permissions
- Full CRUD access
- Their own company data

## Maintenance

### Updating Demo Limits

Edit `lib/utils/demo-restrictions.ts`:
```typescript
export const DEMO_LIMITS = {
  MAX_PRODUCTS: 5,  // Change this
  MAX_PARTNERS: 3,  // Or this
  // etc...
}
```

### Resetting Demo Data

Run the seed script again:
```bash
npm run seed-demo
```

The script uses `upsert` so it won't duplicate data.

### Adding More Demo Actions

1. Import restrictions in action file:
```typescript
import { isDemoUser, checkDemoLimit, isDemoActionAllowed } from '@/lib/utils/demo-restrictions'
```

2. Check demo status:
```typescript
const { data: userData } = await supabase
  .from('users')
  .select('company_id, id, is_demo')
  .eq('auth_user_id', user.id)
  .single()
```

3. Enforce limits:
```typescript
if (isDemoUser(userData)) {
  const limitCheck = await checkDemoLimit(
    supabase,
    userData.company_id,
    'table_name',
    'MAX_RESOURCE_NAME'
  );

  if (!limitCheck.allowed) {
    return { error: limitCheck.message };
  }
}
```

## Future Enhancements

- [ ] Add demo banner to all create pages
- [ ] Show quota progress bars
- [ ] Track demo user analytics
- [ ] Auto-reset demo data weekly
- [ ] Add more realistic demo data
- [ ] Demo video walkthrough
- [ ] Guided tour for new demo users
- [ ] A/B test demo limits

## Support

**For Users:**
- WhatsApp: +91 8928466864
- Email: bale.inventory@gmail.com

**For Developers:**
- See `.claude.md` for architecture details
- See `.todo.md` for development status
- Check Supabase logs for errors
