# Implementation Roadmap - Bale Inventory & Accounting System

**Version:** 2.1
**Date:** January 2025
**Duration:** 8 months to production-ready
**Team Size:** 2-3 developers

---

## Overview

### Development Phases

| Phase | Duration | Focus | Deliverable |
|-------|----------|-------|-------------|
| **Phase 1** | Months 1-2 | Foundation & Core Accounting | Basic voucher entry working |
| **Phase 2** | Months 3-4 | Inventory & QR System | Complete fabric tracking |
| **Phase 3** | Months 5-6 | GST & Compliance | GST filing ready |
| **Phase 4** | Months 7-8 | Advanced Features & Polish | Production ready |

---

## Phase 1: Foundation & Core Accounting (Months 1-2)

### Week 1-2: Database Setup

**Tasks:**
- [ ] Create Supabase project
- [ ] Run database schema migration (all 19 tables)
- [ ] Add critical triggers (double-entry, COGS, validation)
- [ ] Create seed data script (28 groups, 24 voucher types)
- [ ] Set up RLS policies
- [ ] Test database functions

**Deliverable:** Database ready with sample data

---

### Week 3-4: Authentication & Foundation UI

**Tasks:**
- [ ] Supabase Auth integration
- [ ] Login/Signup screens
- [ ] Company creation flow
- [ ] User management (admin can add staff)
- [ ] Dashboard skeleton
- [ ] Navigation sidebar

**Tech Stack:**
- Next.js 14 App Router
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod validation

**Deliverable:** Users can login, create company

---

### Week 5-6: Masters Module

**Tasks:**
- [ ] Group master (CRUD)
  - List view with hierarchy
  - Create/Edit forms
  - Delete validation (check if has ledgers)
- [ ] Ledger master (CRUD)
  - List view with search/filter
  - Create/Edit forms with tabs:
    - General (Name, Group, Opening balance)
    - Contact (Address, Phone, Email)
    - GST (GSTIN, State, PAN)
    - Banking (Account#, IFSC)
    - Credit (Limit, Period)
  - Bill-wise toggle
- [ ] Godown master (CRUD)

**Acceptance Criteria:**
- Can create custom groups
- Can create ledgers under any group
- Opening balance creates opening voucher
- GSTIN validation (15 chars, format check)

**Deliverable:** Master data entry working

---

### Week 7-8: Voucher Entry System

**Tasks:**
- [ ] Voucher entry screen (generic)
  - Header: Type, Number, Date, Party
  - Ledger entries table (Dr/Cr)
  - Narration
  - Save/Post buttons
- [ ] Payment voucher (F5 shortcut)
- [ ] Receipt voucher (F6)
- [ ] Journal voucher (F7)
- [ ] Keyboard shortcuts implementation
- [ ] Double-entry validation (frontend + backend)
- [ ] Voucher list view with filters

**Key Features:**
- Auto-balancing (when user enters Dr, auto-calc Cr)
- Narration templates
- Save as draft
- Post (makes it final)
- Edit only draft vouchers

**Acceptance Criteria:**
- Can create payment/receipt/journal
- Dr = Cr enforced
- Trial balance updates real-time
- Audit trail (created_by, updated_by)

**Deliverable:** Basic accounting transactions working

---

## Phase 2: Inventory & QR System (Months 3-4)

### Week 1-2: Product Master & Stock Groups

**Tasks:**
- [ ] Stock group master (CRUD with hierarchy)
- [ ] Stock item master (CRUD)
  - Basic tab (Name, Code, Group, Unit)
  - Pricing tab (Purchase, Sales, MRP)
  - Fabric tab (Type, Design, Color, Width, GSM, Thread count, Finish)
  - GST tab (HSN, Rate)
  - Inventory tab (Opening stock, Min level, Track individual items)
- [ ] HSN code master (preloaded textile codes)
- [ ] Product variant management
  - Define variant attributes (Width, Finish)
  - Generate combinations

**Deliverable:** Product catalog ready

---

### Week 3-4: Stock Vouchers

**Tasks:**
- [ ] Receipt Note voucher
  - Select supplier
  - Select godown
  - Add items with qty, rate, quality grade
  - GST calculation
  - Generate stock_units if track_individual_items=true
  - Accounting entries (Dr Stock, Dr GST Input, Cr Supplier)
- [ ] Delivery Note voucher
  - Select customer
  - Select godown
  - Add items or scan QR codes
  - Update stock_units.status = 'dispatched'
  - Option to auto-generate Sales Invoice
- [ ] Purchase voucher (F9) - with inventory
- [ ] Sales voucher (F8) - with inventory
- [ ] COGS automation testing

**Acceptance Criteria:**
- Receipt increases stock
- Dispatch reduces stock
- COGS entry auto-created on sales
- Stock summary updates real-time

**Deliverable:** Stock transactions working

---

### Week 5-6: QR Code System

**Tasks:**
- [ ] QR code generation
  - On receipt save: Generate QR codes for quantity
  - Format: `{company_id}-{item_code}-{sequential}`
  - Create stock_unit records
  - Store in barcode_batch
- [ ] QR label PDF generation
  - Use `qrcode` npm package
  - Use `pdfkit` for PDF
  - A4 template (21 labels per sheet)
  - Thermal template (2" × 1")
  - Download functionality
- [ ] QR scanning (mobile PWA)
  - Install PWA on mobile
  - Camera permission
  - Scan QR using html5-qrcode
  - Validate QR exists & available
  - Add to dispatch list
- [ ] Stock unit detail view
  - View by QR code
  - Complete history (receipt → dispatch)

**Tech Stack:**
- `qrcode` for QR generation
- `pdfkit` or `jspdf` for labels
- `html5-qrcode` for scanning

**Deliverable:** QR system end-to-end working

---

### Week 7-8: Mobile Warehouse App

**Tasks:**
- [ ] PWA setup (manifest.json, service worker)
- [ ] Mobile-optimized UI
  - Large touch targets
  - Simplified navigation
  - Bottom tab bar
- [ ] Receipt screen (mobile)
  - Basic item entry
  - Quality grade selection
  - Generate QR codes
- [ ] Dispatch screen (mobile)
  - Select order
  - Scan QR codes
  - Running count display
  - Confirm dispatch
- [ ] Stock search (mobile)
  - Search by item name
  - Shows godown, rack, grade
  - Navigate to location (if GPS)
- [ ] Offline support (basic)
  - Cache product list
  - Queue scans when offline
  - Sync when online

**Deliverable:** Mobile warehouse app working

---

## Phase 3: GST & Compliance (Months 5-6)

### Week 1-2: GST Reports

**Tasks:**
- [ ] GSTR-1 Report
  - B2B invoices section
  - B2C invoices (state-wise aggregate)
  - HSN summary with quantities
  - JSON export (GSTN schema v1.0)
  - Excel summary
- [ ] GSTR-2B Reconciliation
  - Upload GSTR-2B JSON
  - Compare with purchase vouchers
  - Show matched/unmatched invoices
  - Mismatch report
- [ ] GSTR-3B Report
  - Outward supplies
  - ITC available
  - Net tax payable
  - JSON export

**Deliverable:** GST reports ready

---

### Week 3-4: E-Invoice Integration

**Tasks:**
- [ ] NIC E-Invoice API integration
  - Authentication (API credentials)
  - Generate IRN API call
  - Handle response (IRN, Ack#, QR)
  - Store in vouchers.irn
  - Error handling
- [ ] E-Invoice generation flow
  - Button on sales invoice
  - Pre-validate (GSTIN, amounts)
  - Call API
  - Update invoice PDF with IRN + QR
- [ ] E-Invoice cancellation
  - Cancel within 24 hours
  - Update status

**API:** https://einvoice1.gst.gov.in/
**Sandbox:** Available for testing

**Deliverable:** E-invoicing working

---

### Week 5-6: E-Way Bill & Other Compliance

**Tasks:**
- [ ] E-Way Bill generation
  - From delivery note
  - Vehicle details entry
  - Call E-Way Bill API
  - Store EWB number
  - PDF generation
- [ ] TDS calculation (basic)
  - Payment voucher: Auto-calc TDS based on section
  - TDS deduction entry
  - TDS register
- [ ] Tax reports
  - TDS report (Form 26Q preparation)
  - Tax ledger summaries

**Deliverable:** Compliance features ready

---

### Week 7-8: Financial Reports

**Tasks:**
- [ ] Trial Balance
  - Real-time query (optimized)
  - Opening, Dr/Cr, Closing
  - Drill-down to ledger
  - Export Excel/PDF
- [ ] Profit & Loss Statement
  - Period selection
  - Schedule III format
  - Comparative (This Year vs Last Year)
  - Export
- [ ] Balance Sheet
  - As on date
  - Schedule III format
  - Assets = Liabilities check
  - Export
- [ ] Ledger report
  - Opening balance
  - All voucher entries
  - Running balance
  - Closing balance

**Deliverable:** Complete financial reporting

---

## Phase 4: Advanced Features & Polish (Months 7-8)

### Week 1-2: Sales Order Management

**Tasks:**
- [ ] Sales order entry
  - Customer, Items, Quantities, Rates
  - Save as quote (status: draft)
  - Confirm (status: confirmed)
- [ ] Order fulfillment
  - Dispatch against order
  - Partial dispatch support
  - Track: Ordered, Dispatched, Pending
  - Status: Partial/Completed
- [ ] Sales order reports
  - Pending orders
  - Order status
  - Fulfillment summary

**Deliverable:** Order-to-invoice workflow

---

### Week 3-4: Job Work Management

**Tasks:**
- [ ] Job work order
  - Create job work
  - Select job worker (ledger)
  - Select items to send
  - Job type (dyeing, printing, etc.)
  - Expected return date
- [ ] Send to job worker
  - Delivery note (outward)
  - Stock status: in_transit
- [ ] Receive from job worker
  - Receipt note (inward)
  - Wastage calculation
  - Wastage accounting entry
- [ ] Job work reports
  - Pending job works
  - Aging
  - Wastage analysis

**Deliverable:** Job work tracking

---

### Week 5-6: Tally Integration

**Tasks:**
- [ ] Tally XML parser
  - Parse company XML
  - Parse group XML
  - Parse ledger XML
  - Parse stock item XML
  - Parse voucher XML
- [ ] Tally import wizard
  - Upload XML file
  - Preview import data
  - Validation
  - Confirm import
  - Import progress
  - Summary report
- [ ] Tally XML generator
  - Export groups to XML
  - Export ledgers to XML
  - Export vouchers to XML
  - Tally XML v2.1.0 format
- [ ] Tally export wizard
  - Select date range
  - Select: Masters/Transactions/Full
  - Generate XML
  - Download
- [ ] Reconciliation report
  - Compare: Your trial balance vs Tally trial balance
  - Highlight differences

**Testing:**
- Import real Tally data
- Verify trial balance matches
- Export to XML
- Import into Tally Prime
- Verify in Tally

**Deliverable:** Tally import/export working

---

### Week 7-8: Polish & Production Prep

**Tasks:**
- [ ] Dashboard widgets
  - Today's sales/collections
  - Stock value
  - Top 10 overdue customers
  - Low stock alerts
  - Pending orders
- [ ] Stock valuation report
  - FIFO method implementation
  - Opening, Purchases, Sales, Closing
  - COGS calculation
  - Export
- [ ] Stock aging report
  - Items > 90 days
  - Slow-moving inventory
- [ ] User preferences
  - Theme (light/dark - future)
  - Keyboard shortcuts customization
  - Default godown
- [ ] Performance optimization
  - Index optimization
  - Query optimization
  - Pagination on large lists
  - Lazy loading
- [ ] Error handling & logging
  - Sentry integration
  - Error boundaries
  - User-friendly error messages
- [ ] Help & Documentation
  - In-app tooltips
  - Video tutorials (links)
  - User manual (PDF)
- [ ] Testing
  - Unit tests (key functions)
  - Integration tests (voucher entry)
  - E2E tests (Playwright - critical flows)
  - CA review with real data

**Deliverable:** Production-ready application

---

## Testing Strategy

### Unit Tests
**Coverage:** Business logic functions
- FIFO cost calculation
- GST calculation
- Double-entry validation
- Date/number formatting

**Tool:** Vitest

### Integration Tests
**Coverage:** API routes
- Voucher creation
- Stock transactions
- Report generation

**Tool:** Vitest + Supertest

### E2E Tests
**Coverage:** Critical user flows
- Login → Create voucher → Trial balance
- Receipt → QR generation → Dispatch → Invoice
- Import Tally → Verify data → Export Tally

**Tool:** Playwright

### Manual Testing
- CA review with real company data
- Mobile device testing (iOS, Android)
- Browser compatibility (Chrome, Safari, Firefox)

---

## Deployment Strategy

### Environments

**Development**
- Local Supabase (Docker)
- Vercel preview deployments

**Staging**
- Supabase staging project
- Vercel production (staging subdomain)
- Used for QA testing

**Production**
- Supabase production project
- Vercel production
- Custom domain

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
On PR:
  - Lint (ESLint)
  - Type-check (TypeScript)
  - Unit tests
  - Vercel preview deployment

On merge to main:
  - All above checks
  - E2E tests (Playwright)
  - Deploy to production (Vercel)
  - Database migrations (manual approval)
```

### Migration Strategy

1. **Schema migrations:** Manual review + approval
2. **Seed data:** Automated on new company creation
3. **Rollback plan:** Database backups before each migration

---

## Resource Requirements

### Team

| Role | Count | Responsibility |
|------|-------|----------------|
| **Full-Stack Developer** | 2 | Features, UI, API |
| **CA/Accountant (Part-time)** | 1 | Review, testing, Tally export validation |
| **QA Tester** | 1 | Testing (Phase 4) |

### Third-Party Services

| Service | Cost (Monthly) | Purpose |
|---------|----------------|---------|
| **Supabase** | $25 (Pro) | Database, Auth, Storage |
| **Vercel** | $20 (Pro) | Hosting, Serverless functions |
| **Sentry** | $26 (Team) | Error tracking |
| **Better Uptime** | $10 | Uptime monitoring |
| **Total** | **~$81/month** | |

### Tools

- VS Code
- Postman (API testing)
- Tally Prime (testing XML import/export)
- Figma (UI design - optional)

---

## Success Metrics (End of Phase 4)

### Technical
- [ ] Trial balance matches 100%
- [ ] Page load time < 2 seconds
- [ ] Stock accuracy > 98%
- [ ] Zero critical bugs
- [ ] 80% test coverage (unit tests)

### Business
- [ ] 5 pilot customers onboarded
- [ ] 90% CA approval rate from pilots
- [ ] Tally XML export validated by CA
- [ ] Average onboarding time < 2 hours

### User Experience
- [ ] Mobile warehouse app works offline
- [ ] Keyboard shortcuts working
- [ ] Zero data loss incidents
- [ ] < 5 support tickets per customer per month

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Double-entry bugs | Critical | Medium | Database triggers, comprehensive tests, CA review |
| COGS calculation errors | High | Medium | Use proven FIFO algorithm, manual verification option |
| Tally export incompatibility | High | Medium | Test with multiple Tally versions, iterative fixes |
| Performance issues | Medium | Low | Optimize queries, proper indexing, pagination |

### Schedule Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Feature creep | Delays | Strict scope control, P0 focus only for MVP |
| Third-party API delays (E-Invoice) | Medium | Build core features first, API integration last |
| Team availability | High | Buffer time (1 week) in each phase |

---

## Next Steps

1. **Review & Approve:** Team reviews this roadmap
2. **Setup:** Create Supabase + Vercel projects
3. **Sprint Planning:** Break Phase 1 into 2-week sprints
4. **Start Development:** Week 1 begins!

---

**See Also:**
- [Main PRD](./01-Main-PRD.md)
- [Database Schema](./02-Database-Schema.md)
- [Feature Specifications](./03-Feature-Specifications.md)
- [Tally Integration Guide](./05-Tally-Integration.md)
