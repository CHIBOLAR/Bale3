# Bale Inventory & Accounting System - Product Requirements Document

**Version:** 3.0 (Revised - Practical Implementation Plan)
**Date:** October 2025
**Status:** Inventory Complete ✅ | Accounting In Progress ⏳
**Target Market:** Textile/Fabric Trading Businesses in India

---

## Executive Summary

### Current Status

**Phase 1 Complete:** Advanced inventory module with QR tracking ✅
**Phase 2 Starting:** Adding Tally-compatible accounting module ⏳

### The Strategy

**Build on Existing Inventory + Add Accounting**

This system combines:
1. **Existing Advanced Inventory** (COMPLETE) - QR-coded roll tracking, quality grading, job work, sales orders
2. **New Accounting Module** (TO BUILD) - Tally-compatible Groups, Ledgers, Vouchers integrated with existing inventory
3. **Tally Export Capability** (FUTURE) - CAs can verify data in Tally Prime anytime

### Critical Requirement

**Client Decision:** "Either your app does BOTH accounting AND inventory, OR we stick with Tally only"
- No "inventory-only" app acceptable
- No two-app solution (Tally + separate inventory)
- Must be complete Tally replacement

### Core Differentiators

1. ✅ **Individual Roll Tracking** - QR codes for every fabric roll (BUILT)
2. ✅ **Fabric-Specific Attributes** - GSM, thread count, color, variants (BUILT)
3. ✅ **Mobile Warehouse App** - Receipt/dispatch with QR scanning (BUILT)
4. ✅ **Quality Grading** - A/B/C grade tracking and pricing (BUILT)
5. ✅ **Job Work Management** - Dyeing, printing with progress tracking (BUILT)
6. ✅ **Sales Order Workflow** - End-to-end order fulfillment (BUILT)
7. ⏳ **Tally-Compatible Accounting** - Groups, ledgers, vouchers (TO BUILD)
8. ⏳ **GST Compliance** - GSTR-1/2B/3B, E-invoice, E-way bill (TO BUILD)
9. ⏳ **Tally XML Export** - Full data export for CA verification (TO BUILD)

---

## Scope

### In Scope

**Accounting (Tally Parity - 92 features)**
- Chart of Accounts (Groups & Ledgers)
- Voucher Entry (All 24 Tally types)
- Double-Entry Bookkeeping
- Accounts Receivable/Payable
- GST Compliance
- Bank Reconciliation
- Financial Reports (Trial Balance, P&L, Balance Sheet)

**Inventory (Fabric-Specific - 40 features)**
- Product Master (fabric attributes)
- Individual Roll Tracking (QR codes)
- Stock Receipt/Dispatch
- Warehouse Management (multi-godown)
- Quality Grading (A/B/C)
- Job Work Tracking
- Stock Reports & Valuation

**Tally Integration**
- XML Import (one-time migration)
- XML Export (ongoing CA verification)

### Out of Scope

- Multi-currency accounting
- Payroll & HR
- Manufacturing/Production planning
- Fixed assets management
- Multi-branch consolidation
- Point of Sale (POS)

---

## Target Users

### Primary Users

1. **Business Owner** (Rajesh, 42)
   - Needs: Real-time stock visibility, customer outstanding tracking
   - Pain: Can't trust Excel, stock shrinkage, GST penalties

2. **Chartered Accountant** (Priya, 35)
   - Needs: Tally-compatible data, GST reports, audit trail
   - Pain: Different software for each client, data verification

3. **Warehouse Staff** (Suresh, 28)
   - Needs: Mobile QR scanning, easy receipt/dispatch
   - Pain: Manual registers, can't find stock quickly

### Success Metrics

| Metric | Target |
|--------|--------|
| Onboarding Time | < 2 hours (with Tally import) |
| CA Approval Rate | > 90% |
| Stock Accuracy | > 98% |
| GST Filing Time | < 30 minutes |
| Invoice Generation | Auto on dispatch |

---

## Technical Architecture

### Technology Stack

**Frontend:** Next.js 14+ (TypeScript) + Tailwind CSS + shadcn/ui
**Backend:** Supabase (PostgreSQL 15+)
**Auth:** Supabase Auth with Row Level Security
**Storage:** Supabase Storage (QR codes, invoices, product images)
**Deployment:** Vercel + Supabase Cloud

### Database Overview

**Existing Tables (Inventory Module - BUILT):**
- ✅ Foundation: companies, users, warehouses, partners
- ✅ Products: products, product_variants, product_variant_items, colors
- ✅ Inventory: stock_units, barcode_batches, barcode_batch_items
- ✅ Transactions: goods_receipts, goods_receipt_items, goods_dispatches, goods_dispatch_items
- ✅ Orders: sales_orders, sales_order_items, job_works, job_work_raw_materials, job_work_finished_goods
- ✅ Catalog: catalog_configurations
- ✅ Views: inventory_summary, sales_order_status, job_work_progress, partners_with_computed, warehouses_with_computed

**New Tables (Accounting Module - TO BUILD):**
- ⏳ Accounting: groups, ledgers, voucher_types, vouchers, voucher_ledger_entries, voucher_inventory_entries
- ⏳ Supporting: hsn_codes
- ⏳ Views: ledger_balances

**Design Principles:**
- 🔗 **Integrated, Not Separate** - Accounting links to existing partners, products, warehouses
- 📱 **Application Logic, Not Triggers** - Business logic in TypeScript, not database triggers
- 🚀 **Performance First** - Materialized views for balance caching
- 🔐 **Security** - Row Level Security (RLS) on all tables

See: [Database Schema Document](./02-Database-Schema.md)

---

## Key Features

### Accounting Features (P0 - Critical)

1. **Chart of Accounts**
   - 28 predefined Tally groups
   - Hierarchical group structure
   - Custom groups under standard hierarchy

2. **Voucher Entry**
   - 24 Tally-standard voucher types
   - Keyboard shortcuts (F5-F9)
   - Double-entry enforcement
   - Bill-wise tracking

3. **Financial Reports**
   - Trial Balance (real-time)
   - Profit & Loss Statement
   - Balance Sheet (Schedule III format)
   - Ledger reports

4. **GST Compliance**
   - GSTR-1/2B/3B generation
   - E-invoice (IRN from GSTN)
   - E-way bill generation
   - HSN code master

### Inventory Features (P0 - Critical)

1. **Product Master**
   - Fabric attributes (type, design, color, width, GSM)
   - Variants (width/finish combinations)
   - HSN code assignment
   - Minimum stock alerts

2. **QR Code Roll Tracking**
   - Auto-generate QR on receipt
   - Unique QR per roll
   - Mobile scanning (receipt/dispatch)
   - Complete audit trail

3. **Quality Grading**
   - A/B/C grade assignment
   - Grade-specific pricing
   - Grade filters in reports

4. **Stock Operations**
   - Receipt vouchers (purchase)
   - Dispatch vouchers (sales)
   - Stock transfers (godown to godown)
   - Job work tracking (dyeing, printing)

5. **Warehouse Management**
   - Multi-godown support
   - Rack/bin location tracking
   - Staff assignment
   - Mobile warehouse app

See: [Feature Specifications](./03-Feature-Specifications.md)

---

## Implementation Strategy

### ✅ Phase 1: Inventory Module (COMPLETE)

**Built:**
- ✅ Product management with variants
- ✅ Stock units with QR tracking
- ✅ Goods receipts & dispatches
- ✅ Multi-warehouse management
- ✅ Sales orders with fulfillment tracking
- ✅ Job work management (dyeing, printing)
- ✅ Quality grading (A/B/C)
- ✅ Barcode batch generation
- ✅ Real-time inventory summary views
- ✅ E-commerce catalog module

**Current Status:** Production-ready for inventory operations

---

### ⏳ Phase 2: Accounting Foundation (NEXT - 6 weeks)
**Goal:** Core accounting integrated with existing inventory

**Week 1-2: Database & Setup**
- Add 7 accounting tables to existing schema
- Seed 28 Tally groups + 24 voucher types
- Link ledgers to existing partners table
- Create materialized view for balance caching

**Week 3-4: Core Features**
- Ledger CRUD (UI + API)
- Basic voucher entry (Payment, Receipt, Journal)
- VoucherService with double-entry validation
- Trial Balance report

**Week 5-6: Inventory Integration**
- Auto-create Purchase vouchers from goods_receipts
- Auto-create Sales vouchers from goods_dispatches
- Link vouchers to sales_orders
- Stock-to-ledger sync

**Deliverable:** Can track money alongside inventory

---

### ⏳ Phase 3: GST & Compliance (8 weeks)
**Goal:** GST filing ready

**Features:**
- GST calculation (CGST/SGST/IGST)
- GSTR-1 report (B2B, B2C, HSN summary)
- GSTR-3B report (tax payable)
- E-invoice generation (IRN from GSTN)
- E-way bill generation

**Deliverable:** GST filing without CA dependency

---

### ⏳ Phase 4: Advanced Features (6 weeks)
**Goal:** Complete Tally replacement

**Features:**
- Financial reports (P&L, Balance Sheet)
- Bill-wise receivables/payables
- Bank reconciliation
- Tally XML export
- Advanced reports & analytics

**Deliverable:** Production-ready accounting system

See: [Implementation Roadmap](./04-Implementation-Roadmap.md)

---

## Tally Integration

### Import from Tally (One-time Migration)

**Process:**
1. Export from Tally Prime → XML file
2. Upload XML to Bale system
3. Parse and import:
   - Company details
   - Groups & Ledgers
   - Stock items
   - Opening balances
4. Verification report
5. Ready to use

**Time:** 2-4 hours for typical company

### Export to Tally (Ongoing Verification)

**Process:**
1. Select date range
2. Export → Tally XML v2.1.0
3. Download file
4. Import into Tally Prime
5. CA verifies in Tally

**Use Cases:**
- Year-end verification
- CA audit preparation
- Parallel running (transition period)
- Backup/exit strategy

See: [Tally Integration Guide](./05-Tally-Integration.md)

---

## Risk Mitigation

### Technical Risks

| Risk | Mitigation |
|------|-----------|
| Double-entry bugs | Application-layer validation + comprehensive tests, NOT database triggers |
| Breaking existing inventory | Accounting module is additive only - no changes to existing tables |
| Performance (large datasets) | Materialized views for balances, proper indexing, cursor pagination |
| Tally export incompatibility | Start with simple export, test with real Tally Prime, iterate |

### Business Risks

| Risk | Mitigation |
|------|-----------|
| CA rejection | Build trial balance first, get early feedback, provide Tally export |
| Complex accounting | Focus on 80% use case (Payment, Receipt, Sales, Purchase only initially) |
| GST rule changes | Modular GST layer in application code, easy to update |
| Integration bugs | Thorough testing of goods_receipt → voucher and goods_dispatch → voucher flows |

### Implementation Risks

| Risk | Mitigation |
|------|-----------|
| Scope creep | Stick to phased approach, Phase 2 must ship in 6 weeks max |
| Over-engineering | Use application logic, avoid complex triggers, JSONB for flexibility |
| Poor integration | Link ledgers to partners, vouchers to existing receipts/dispatches from day 1 |

---

## Success Criteria

### Technical
- ✅ Trial balance matches 100%
- ✅ Tally XML import success rate > 95%
- ✅ Stock accuracy > 98%
- ✅ Page load time < 2 seconds

### Business
- ✅ CA approval rate > 90%
- ✅ Onboarding time < 2 hours
- ✅ GST filing time reduction: 4 hours → 30 minutes
- ✅ Inventory shrinkage reduction > 50%

### User Satisfaction
- ✅ NPS score > 50
- ✅ Daily active usage > 80%
- ✅ Support tickets < 5 per client per month

---

## Related Documents

1. **[Database Schema](./02-Database-Schema.md)** - Complete schema with fixes
2. **[Feature Specifications](./03-Feature-Specifications.md)** - Detailed user stories
3. **[Implementation Roadmap](./04-Implementation-Roadmap.md)** - Phase-wise plan
4. **[Tally Integration Guide](./05-Tally-Integration.md)** - Import/export specs

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.0 | Oct 2025 | Revised to reflect inventory completion, practical accounting implementation plan |
| 2.1 | Jan 2025 | Added critical database fixes, clarified full replacement strategy |
| 2.0 | Jan 2025 | Initial comprehensive PRD |

---

**Next Step:** Review [Database Schema](./02-Database-Schema.md) for implementation details.
