# Bale Inventory - Technical Implementation Guide

## Project Overview

**Bale Inventory** is a multi-tenant fabric inventory management system built for Indian textile traders. The application provides inventory tracking, sales order management, job work processing, and barcode-based stock tracking.

## Tech Stack

### Core Technologies
- **Framework**: Next.js 15.1.4 (App Router, React 19)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (Magic Links, OAuth)
- **Backend**: Supabase (Database, Auth, Storage)
- **Deployment**: Hostinger VPS + Supabase Cloud

### Key Libraries
- `@supabase/ssr` - Server-side Supabase client with cookie handling
- `@supabase/supabase-js` - Supabase JavaScript client
- `lucide-react` - Icon library
- `next` - React framework with App Router

### Development Tools
- **Local Database**: Supabase CLI with Docker
- **Version Control**: Git + GitHub
- **Process Manager**: PM2 (production)
- **Package Manager**: npm

## Architecture Patterns

### 1. Multi-Tenant Architecture

**Tenant Isolation Strategy: Company-based Row-Level Isolation**

```
auth.users (Supabase Auth Layer)
    ↓ FK: auth_user_id
public.users (Application User Records)
    ↓ FK: company_id
companies (Tenant Root)
    ↓ FK: company_id (on ALL data tables)
ALL 25 DATA TABLES (Tenant-Isolated)
```

**Key Design Decisions:**
- **One User = One Company**: No members junction table (fits textile trader use case)
- **Manual Filtering NOW**: All queries manually filter by `company_id`
- **RLS Later**: Row Level Security deferred to security hardening phase
- **Auth Hooks Ready**: Infrastructure in place, configuration deferred

**Warehouse Scoping:**
- Admin users: `users.warehouse_id = NULL` → Access ALL company warehouses
- Staff users: `users.warehouse_id` set → Limited to ONE assigned warehouse

### 2. Two-Tier Access System

**Tier 1: Demo Access**
- User exists in `auth.users` ONLY
- NO record in `public.users`
- Can authenticate and view dashboard
- Read-only access to demo data (future)

**Tier 2: Full Access**
- User exists in BOTH `auth.users` AND `public.users`
- Created via upgrade request approval
- Full CRUD operations
- Company isolation enforced

**Transition Flow:**
1. Demo user requests upgrade → saved to `upgrade_requests` table
2. Admin approves → Atomically creates:
   - Company record
   - User record (links auth_user_id)
   - Default warehouse
3. User can now log in with full access

### 3. Database Schema Overview

**Core Tables (Foundation):**
```sql
companies (id, name, is_demo, created_at, updated_at)
users (id, auth_user_id, company_id, role, warehouse_id, is_demo, is_superadmin)
warehouses (id, company_id, name, location, is_active)
upgrade_requests (id, auth_user_id, email, name, phone, company, status)
```

**Product & Inventory:**
```sql
products (25+ fields: name, material, color, gsm, price, dimensions, tags)
stock_units (id, company_id, warehouse_id, product_id, unit_number, qr_code, size_quantity, wastage, quality_grade, status)
```

**Goods Movement:**
```sql
goods_receipts (id, company_id, warehouse_id, receipt_number, partner_id, link_type, receipt_date)
goods_receipt_items (id, receipt_id, product_id, quantity_received)
goods_dispatches (id, company_id, warehouse_id, dispatch_number, partner_id, link_type, dispatch_date, status)
goods_dispatch_items (id, dispatch_id, stock_unit_id)
```

**Partners & Orders:**
```sql
partners (id, company_id, company_name, first_name, last_name, partner_type, phone_number, email, gst_number, pan_number, address fields)
sales_orders (id, company_id, order_number, partner_id, order_date, status, total_amount)
job_works (id, company_id, work_number, partner_id, work_type, status)
```

**QR/Barcode:**
```sql
barcode_batches (id, company_id, warehouse_id, batch_name, layout_config, status)
barcode_batch_items (id, batch_id, stock_unit_id)
```

**All tables include:**
- `company_id` for tenant isolation
- `created_at`, `updated_at` timestamps
- `created_by`, `modified_by` audit fields (user IDs)
- `deleted_at` for soft deletes (where applicable)

### 4. File Structure & Organization

```
/app
  /(auth)                           # Auth routes
    /login/page.tsx                 # OTP login page
  /dashboard                        # Protected dashboard routes
    /page.tsx                       # Dashboard home with stats
    /products/                      # Products module
      page.tsx                      # List page (server component)
      ProductsClient.tsx            # Client component with search/filters
      ProductForm.tsx               # Reusable form component
      actions.ts                    # Server actions (CRUD)
      add/page.tsx                  # Create page
      [id]/page.tsx                 # Detail page
      [id]/edit/page.tsx            # Edit page
    /partners/                      # Partners module (same pattern)
    /inventory/                     # Inventory module
      /goods-receipts/
      /goods-dispatch/
      /stock-units/
      /qr-codes/
    /admin/                         # Admin-only routes
      /invite-requests/
  /api                              # API routes
    /request-invite/route.ts        # Upgrade request submission
    /admin/approve-upgrade/route.ts # Admin approval endpoint
  /auth/callback/route.ts           # OAuth callback handler
/components
  /layouts
    DashboardNav.tsx                # Navigation component
  /ui                               # Reusable UI components
/lib
  /supabase
    /client.ts                      # Browser Supabase client
    /server.ts                      # Server Supabase client (cookies)
  /types
    /inventory.ts                   # Inventory type definitions
    /database.ts                    # Database types (generated)
  /utils                            # Utility functions
/supabase
  /migrations/                      # Database migrations (27 files)
/middleware.ts                      # Route protection
```

### 5. Component Patterns

**Server Components (Default):**
- Used for data fetching
- Direct database access via `@/lib/supabase/server`
- No interactivity (no useState, useEffect)
- Examples: page.tsx files, detail views

```typescript
// app/dashboard/products/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function ProductsPage() {
  const supabase = await createClient()

  // Get user and company_id
  const { data: { user } } = await supabase.auth.getUser()
  const { data: userData } = await supabase
    .from('users')
    .select('company_id, is_demo')
    .eq('auth_user_id', user.id)
    .single()

  // Fetch company data with company_id filter
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return <ProductsClient products={products} isDemo={userData.is_demo} />
}
```

**Client Components ('use client'):**
- Used for interactivity (forms, search, filters, state)
- Cannot directly access server-side Supabase
- Must receive data as props from Server Components
- Examples: forms, modals, search/filter UIs

```typescript
// app/dashboard/products/ProductsClient.tsx
'use client'

import { useState, useMemo } from 'react'

export default function ProductsClient({
  products,
  isDemo
}: {
  products: Product[]
  isDemo: boolean
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [products, searchTerm])

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### 6. Server Actions Pattern

**Purpose:** Handle mutations (create, update, delete) from client components

**Location:** `actions.ts` files in feature directories

**Pattern:**
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPartner(formData: FormData) {
  try {
    const supabase = await createClient()

    // 1. Authenticate
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // 2. Get user's company_id and internal user id
    const { data: userData } = await supabase
      .from('users')
      .select('company_id, id')
      .eq('auth_user_id', user.id)
      .single()
    if (!userData?.company_id) return { error: 'Company not found' }

    // 3. Prepare data with company_id and audit fields
    const partnerData = {
      company_id: userData.company_id,
      company_name: formData.get('company_name') as string,
      partner_type: formData.get('partner_type') as string,
      // ... other fields
      created_by: userData.id,
      modified_by: userData.id,
    }

    // 4. Insert to database
    const { error } = await supabase
      .from('partners')
      .insert([partnerData])

    if (error) return { error: error.message }

    // 5. Revalidate affected paths
    revalidatePath('/dashboard/partners')
    return { success: true }

  } catch (error: any) {
    return { error: error.message }
  }
}
```

**Key Points:**
- Always validate authentication first
- Always get company_id from authenticated user
- Always include audit fields (created_by, modified_by)
- Always revalidate affected paths
- Return `{ success: true }` or `{ error: string }`
- Use try-catch for unexpected errors

### 7. Form Handling Pattern

**Client Component Form:**
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPartner } from './actions'

export default function PartnerForm({ mode = 'create', partner = null }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const result = mode === 'create'
      ? await createPartner(formData)
      : await updatePartner(formData)

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      router.push('/dashboard/partners')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <input name="company_name" defaultValue={partner?.company_name} required />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

### 8. Multi-Tenant Data Access Pattern

**CRITICAL: ALL queries must filter by company_id**

```typescript
// ✅ CORRECT - Filters by company_id
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('company_id', userData.company_id)  // ← REQUIRED
  .is('deleted_at', null)

// ❌ WRONG - Missing company_id filter (security issue!)
const { data: products } = await supabase
  .from('products')
  .select('*')
```

**Standard Query Pattern:**
```typescript
// 1. Get authenticated user
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')

// 2. Get user's company_id
const { data: userData } = await supabase
  .from('users')
  .select('company_id, is_demo, warehouse_id, role')
  .eq('auth_user_id', user.id)
  .single()

if (!userData?.company_id) redirect('/error')

// 3. Query with company_id filter
const { data } = await supabase
  .from('table_name')
  .select('*')
  .eq('company_id', userData.company_id)  // ← Always required

// 4. Optional: Apply warehouse scoping for staff
if (userData.role === 'staff' && userData.warehouse_id) {
  query = query.eq('warehouse_id', userData.warehouse_id)
}
```

### 9. Demo Mode Pattern

**Check demo status:**
```typescript
const { data: userData } = await supabase
  .from('users')
  .select('is_demo')
  .eq('auth_user_id', user.id)
  .single()

const canEdit = !userData.is_demo
```

**Conditional rendering:**
```typescript
{canEdit ? (
  <button onClick={handleEdit}>Edit</button>
) : (
  <div className="demo-banner">
    Demo Mode - Read Only
    <Link href="/dashboard/request-upgrade">Request Access</Link>
  </div>
)}
```

**Server-side enforcement:**
```typescript
// In server action
const { data: userData } = await supabase
  .from('users')
  .select('is_demo')
  .eq('auth_user_id', user.id)
  .single()

if (userData.is_demo) {
  return { error: 'Demo users cannot modify data' }
}
```

### 10. Supabase Relationship Queries

**Simple Relationships:**
```typescript
// One-to-one or many-to-one
const { data } = await supabase
  .from('stock_units')
  .select(`
    *,
    products (id, name, material, color),
    warehouses (id, name)
  `)
```

**Ambiguous Relationships (Multiple FKs to Same Table):**

When a table has multiple foreign keys to the same table, use explicit FK hints:

```typescript
// ❌ WRONG - Ambiguous (goods_dispatches has 2 FKs to warehouses)
.select(`
  *,
  warehouses (id, name)
`)

// ✅ CORRECT - Explicit FK hint
.select(`
  *,
  warehouses!goods_dispatches_warehouse_id_fkey (id, name),
  dispatch_to_warehouse:warehouses!goods_dispatches_dispatch_to_warehouse_id_fkey (id, name)
`)
```

**Aliasing Relationships:**
```typescript
.select(`
  *,
  source_warehouse:warehouses!goods_dispatches_warehouse_id_fkey (id, name),
  destination_warehouse:warehouses!goods_dispatches_dispatch_to_warehouse_id_fkey (id, name),
  customer:partners!goods_dispatches_dispatch_to_partner_id_fkey (id, company_name)
`)
```

### 11. Type Safety

**Database Types:**
- Located in `lib/types/database.ts`
- Auto-generated via `npx supabase gen types typescript`
- Regenerate when schema changes

**Feature Types:**
- Located in `lib/types/inventory.ts` (or feature-specific files)
- Define interfaces for forms, API responses, etc.

```typescript
// lib/types/inventory.ts
export interface GoodsDispatchFormData {
  warehouse_id: string
  link_type: GoodsDispatchLinkType
  dispatch_to_partner_id?: string
  dispatch_date: string
  stock_unit_ids: string[]
  // ... other fields
}

export type GoodsDispatchLinkType = 'sales_order' | 'job_work' | 'purchase_return' | 'other'
export type GoodsDispatchStatus = 'pending' | 'in_transit' | 'delivered' | 'cancelled'
```

### 12. Common Gotchas & Solutions

**Problem 1: Column name mismatches**
- Database: `material` vs Code: `fabric_type`
- Database: `company_name` vs Code: `name`
- Solution: Always verify column names in database schema

**Problem 2: Database CHECK constraints**
- Example: `measuring_unit` only allows: 'Meters', 'Yards', 'KG', 'Pieces' (capitalized)
- Solution: Form options must match database constraints exactly

**Problem 3: Missing warehouse_id in forms**
- Many inventory operations require `warehouse_id`
- Solution: Always include warehouse dropdown in forms

**Problem 4: Ambiguous relationships**
- PostgREST error when multiple FKs point to same table
- Solution: Use explicit FK hints in `.select()` queries

**Problem 5: TypeScript type mismatches**
- Database types don't match application types
- Solution: Keep `database.ts` synced, define feature types separately

**Problem 6: Status values not matching constraints**
- Database: ['pending', 'in_transit', 'delivered', 'cancelled']
- Code: ['pending', 'dispatched', 'delivered', 'cancelled']
- Solution: Align TypeScript types with database constraints

### 13. Migration Strategy

**Current Approach:**
- 27 migration files in `supabase/migrations/`
- Applied incrementally via `npx supabase db push`
- No RLS enabled (deferred to security hardening)

**Migration Naming:**
- Format: `YYYYMMDD_descriptive_name.sql`
- Example: `20251015_fix_goods_dispatch_status_constraint.sql`

**Recent Migrations:**
- `create_upgrade_requests_table` - Upgrade request system
- `allow_users_to_query_own_auth_id` - RLS policy for demo users
- `fix_goods_dispatch_status_constraint` - Status values fix

### 14. Current Implementation Status

**✅ Completed Modules:**
- Phase 1: Foundation & Setup
- Phase 2: Authentication & Security
- Phase 2B: Upgrade Request System
- Phase 3: Dashboard Layout
- Phase 4: Deployment Preparation
- Phase 5: Products Management (CRUD, search, filters)
- Phase 8: Partners Management (CRUD, search, filters)
- Goods Dispatch Fixes (warehouse field, status constraint, relationships)

**🚧 Partially Complete:**
- Phase 6: Inventory Management
  - ✅ Goods receipts (exists)
  - ✅ Stock units (exists)
  - ✅ Goods dispatch (fixed)
  - ❌ Full inventory browser
  - ❌ Stock movement history

**📋 Pending:**
- Phase 7: Sales Orders
- Phase 9: Settings & Administration
- Phase 10: Job Works
- Phase 11: Barcode System
- Phase 12: Public Sales Catalog

### 15. Environment Setup

**Required Environment Variables:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xejyeglxigdeznfitaxc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OAuth (optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

**Local Development:**
```bash
# Start Supabase (Docker required)
npx supabase start

# Run Next.js dev server
npm run dev

# Access app: http://localhost:3000
# Access Supabase Studio: http://localhost:54323
```

**Production:**
```bash
# Build
npm run build

# Start with PM2
pm2 start npm --name "bale-inventory" -- start
```

### 16. Testing Data

**Current Production Data:**
- Company: "Chi fabrics" (ID: a86a3118-0a77-4527-bb09-969e849b64e3)
- User: Chirag Bolar (productmanagerchiragbolar@gmail.com)
- 5 goods dispatches created (GD-2025-10-00001 to GD-2025-10-00005)
- 10 stock units with status 'dispatched'
- Multiple partners, products, warehouses

### 17. Coding Conventions

**Naming:**
- Components: PascalCase (ProductForm, DashboardNav)
- Files: kebab-case for routes, PascalCase for components
- Functions: camelCase (createPartner, handleSubmit)
- Database tables: snake_case (goods_dispatches, stock_units)
- Database columns: snake_case (company_id, created_at)

**Imports:**
- Use absolute imports with `@/` prefix
- Group imports: React → Next → External → Internal → Types

**TypeScript:**
- Use explicit types for function parameters and return values
- Use interfaces for object shapes
- Use type aliases for unions and primitives
- Enable strict mode

**Error Handling:**
- Always use try-catch in server actions
- Return `{ error: string }` for known errors
- Log errors to console for debugging
- Display user-friendly error messages

---

## Quick Reference

### Create New Feature Module

1. Create directory: `app/dashboard/feature-name/`
2. Create files:
   - `page.tsx` (server component, data fetching)
   - `FeatureClient.tsx` (client component, UI)
   - `FeatureForm.tsx` (form component)
   - `actions.ts` (server actions)
   - `add/page.tsx` (create page)
   - `[id]/page.tsx` (detail page)
   - `[id]/edit/page.tsx` (edit page)

3. Follow patterns from `app/dashboard/partners/` or `app/dashboard/products/`

### Standard Page Structure

```typescript
// page.tsx (Server Component)
import { createClient } from '@/lib/supabase/server'
import FeatureClient from './FeatureClient'

export default async function FeaturePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: userData } = await supabase
    .from('users')
    .select('company_id, is_demo')
    .eq('auth_user_id', user.id)
    .single()

  const { data: items } = await supabase
    .from('table_name')
    .select('*')
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)

  return <FeatureClient items={items} canEdit={!userData.is_demo} />
}
```

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Project Repo**: https://github.com/CHIBOLAR/Bale3
- **Supabase Project**: xejyeglxigdeznfitaxc (production)
- **Deployment Guide**: See DEPLOYMENT_GUIDE.md
- **Context Files**: .claude.md, .todo.md for current status
