# Feature Specifications - Bale Inventory & Accounting System

**Version:** 2.1
**Date:** January 2025

---

## Overview

**Total Features:** 132 (92 Accounting + 40 Inventory)
**Priority Levels:** P0 (Critical), P1 (High), P2 (Medium)

This document covers **P0 features only** (MVP requirements).

---

## P0 Accounting Features (32 features)

### 1. Chart of Accounts Management

#### ACC-001: Create Group
- Navigate to Masters > Groups > New
- Enter: Name, Parent Group, Nature (Asset/Liability/Income/Expense)
- System groups (28 predefined) cannot be deleted
- Custom groups can be created under any group

**Acceptance Criteria:**
- ✅ Name unique within company
- ✅ Parent selection shows hierarchical dropdown
- ✅ System groups marked read-only
- ✅ Audit trail: Created by, Date

#### ACC-002: Create Ledger
- Navigate to Masters > Ledgers > New
- Required: Name, Group
- Optional: Contact, Address, GSTIN, Opening Balance, Credit Limit
- For party ledgers (Sundry Debtors/Creditors): Enable bill-wise tracking

**Acceptance Criteria:**
- ✅ Name unique within company
- ✅ GSTIN validation (15 characters)
- ✅ Opening balance creates opening voucher
- ✅ Credit limit alerts when exceeded

### 2. Voucher Entry

#### ACC-003: Payment Voucher (F5)
**User Flow:**
1. Press F5 or click Payment
2. Select payment date
3. Select bank/cash ledger (paying from)
4. Add multiple payment entries:
   - Select party ledger (paying to)
   - Enter amount
   - Add narration
5. System auto-balances credit entry
6. Save (Ctrl+A)

**Accounting Entries:**
```
Dr: Party Ledger (amount paid)
Cr: Bank/Cash Ledger (amount paid from)
```

**Acceptance Criteria:**
- ✅ Dr = Cr enforced
- ✅ Negative amounts not allowed
- ✅ Voucher number auto-incremented
- ✅ Can attach bill references for payment against invoice

#### ACC-004: Receipt Voucher (F6)
Similar to Payment, but money received

**Accounting Entries:**
```
Dr: Bank/Cash Ledger (received into)
Cr: Party Ledger (received from)
```

#### ACC-005: Journal Voucher (F7)
General journal entry for adjustments, opening balances, corrections

**User Flow:**
1. Press F7
2. Add Dr entries (one or more)
3. Add Cr entries (one or more)
4. Must balance before save

**Acceptance Criteria:**
- ✅ Total Dr = Total Cr
- ✅ Minimum 1 Dr and 1 Cr entry
- ✅ Narration mandatory

#### ACC-006: Sales Voucher (F8)
**User Flow:**
1. Press F8 or create from Delivery Note
2. Select customer ledger
3. Select stock items, quantities, rates
4. GST auto-calculated based on customer state
5. Save

**Accounting Entries:**
```
Dr: Customer Ledger (total invoice amount)
Cr: Sales Ledger (taxable amount)
Cr: CGST Output (if intra-state)
Cr: SGST Output (if intra-state)
Cr: IGST Output (if inter-state)
```

**Acceptance Criteria:**
- ✅ Auto-creates from delivery note
- ✅ GST calculation: Intra-state (CGST+SGST), Inter-state (IGST)
- ✅ Invoice PDF generation
- ✅ E-invoice IRN generation (if enabled)
- ✅ Updates customer outstanding
- ✅ Creates COGS entry automatically

#### ACC-007: Purchase Voucher (F9)
Similar to Sales, but recording purchases

**Accounting Entries:**
```
Dr: Purchase Ledger (taxable amount)
Dr: CGST Input
Dr: SGST Input (or IGST)
Cr: Supplier Ledger (total bill amount)
```

### 3. Financial Reports

#### ACC-008: Trial Balance
**User Flow:**
1. Navigate to Reports > Trial Balance
2. Select "As on Date"
3. View all ledgers with opening, Dr/Cr totals, closing balance

**Columns:**
- Ledger Name
- Opening Balance (Dr/Cr)
- Debit Total (period)
- Credit Total (period)
- Closing Balance (Dr/Cr)

**Footer:**
- Total Dr = Total Cr (must match)

**Acceptance Criteria:**
- ✅ Real-time (no caching)
- ✅ Drill-down to ledger vouchers
- ✅ Export to Excel/PDF
- ✅ Matches Tally trial balance 100%

#### ACC-009: Profit & Loss Statement
**User Flow:**
1. Reports > P&L Statement
2. Select period (From Date - To Date)
3. View Income vs Expenses

**Structure:**
```
Revenue (Sales)
- Direct Expenses (Purchases, COGS)
= Gross Profit

- Indirect Expenses (Rent, Salaries, etc.)
= Net Profit Before Tax

- Tax
= Net Profit After Tax
```

**Acceptance Criteria:**
- ✅ Schedule III format (for companies)
- ✅ Comparative columns (This Year vs Last Year)
- ✅ Export to Excel/PDF

#### ACC-010: Balance Sheet
**User Flow:**
1. Reports > Balance Sheet
2. Select "As on Date"

**Structure:**
```
Assets = Liabilities

Assets:
- Fixed Assets
- Current Assets (Stock, Debtors, Cash, Bank)

Liabilities:
- Capital
- Current Liabilities (Creditors, Duties & Taxes)
- Profit/Loss (from P&L)
```

**Acceptance Criteria:**
- ✅ Schedule III format
- ✅ Assets = Liabilities (balanced)
- ✅ Shows current year + previous year

### 4. GST Compliance (8 features)

#### ACC-011: GSTR-1 Report
**User Flow:**
1. Reports > GST > GSTR-1
2. Select month
3. Generate report

**Sections:**
- B2B Invoices (with GSTIN)
- B2C Invoices (aggregated by state)
- HSN Summary

**Output:**
- JSON file for GSTN portal upload
- Excel summary

**Acceptance Criteria:**
- ✅ All outward supplies included
- ✅ Customer GSTIN validation
- ✅ HSN-wise summary with quantities
- ✅ JSON format matches GSTN schema v1.0

#### ACC-012: GSTR-3B Report
Summary return (monthly)

**Sections:**
- Outward supplies (from sales)
- Input tax credit (from purchases)
- Net tax payable

#### ACC-013: E-Invoice Generation
**User Flow:**
1. Create sales invoice
2. Click "Generate E-Invoice"
3. System calls GSTN API
4. Receives IRN + QR code
5. Updates invoice with IRN

**Acceptance Criteria:**
- ✅ Calls NIC E-Invoice API
- ✅ Stores IRN in vouchers.irn
- ✅ QR code embedded in invoice PDF
- ✅ Handles API errors gracefully

---

## P0 Inventory Features (28 features)

### 1. Product Master (8 features)

#### INV-001: Create Stock Item
**User Flow:**
1. Masters > Stock Items > New
2. Basic: Name, Code, Stock Group
3. Units: Base unit (meter/kg/piece)
4. Pricing: Purchase rate, Sales rate, MRP
5. Fabric: Type, Design, Color, Width, GSM, Thread count, Finish
6. GST: HSN code, GST rate
7. Inventory: Opening stock, Minimum level

**Acceptance Criteria:**
- ✅ Name unique
- ✅ HSN code validates against master
- ✅ Track individual items checkbox (for QR tracking)

#### INV-002: Fabric-Specific Attributes
**Attributes:**
- Fabric Type: Cotton, Polyester, Silk, Wool, Blend
- Design: Floral, Striped, Checked, Plain, Printed
- Color: Free text or color picker
- Width (inch): 44", 58", 60", 72"
- GSM: Weight (grams per sq meter)
- Thread Count: 200TC, 300TC, etc.
- Finish: Matte, Glossy, Textured

**Acceptance Criteria:**
- ✅ All fields optional
- ✅ Searchable in reports
- ✅ Shown on QR labels

#### INV-003: Product Variants
**User Flow:**
1. Create stock item
2. Enable "Has Variants"
3. Define attributes:
   - Variant 1: Width (44", 58")
   - Variant 2: Finish (Matte, Glossy)
4. System creates 4 combinations automatically

**Acceptance Criteria:**
- ✅ Max 3 variant attributes
- ✅ Each combination tracked separately in stock_units
- ✅ Dispatch allows variant selection

### 2. QR Code System (7 features)

#### INV-004: Generate QR Codes on Receipt
**User Flow:**
1. Create Receipt Note voucher
2. Enter: Stock item, Quantity (e.g., 100 rolls), Rate
3. Click "Generate QR Codes"
4. System creates 100 stock_unit records
5. QR format: `{company_id}-{item_code}-{seq}`
6. Downloads QR label PDF (A4 or thermal)
7. Print and paste on rolls

**Acceptance Criteria:**
- ✅ One QR per roll
- ✅ QR globally unique
- ✅ Scannable by mobile cameras
- ✅ PDF contains: QR code, Item name, Grade, Godown

#### INV-005: QR Scanning for Dispatch
**User Flow (Mobile App):**
1. Open "Dispatch" screen
2. Select sales order (or create ad-hoc)
3. Tap "Scan QR"
4. Scan each roll's QR code
5. System validates: Roll available, Matches order item
6. Shows running count: 5/10 scanned
7. Confirm dispatch when complete

**Acceptance Criteria:**
- ✅ Camera permission handled
- ✅ Invalid QR shows error
- ✅ Duplicate scan prevented
- ✅ Updates stock_units.status to 'dispatched'

#### INV-006: Stock Unit Search
**Search by:**
- QR Code (scan)
- Stock Item
- Godown
- Quality Grade
- Attributes (color, width)
- Date received

**Shows:**
- Godown location
- Rack number
- Quality grade
- Current status
- Purchase rate

### 3. Warehouse Operations (6 features)

#### INV-007: Stock Receipt Voucher
**User Flow:**
1. Create Receipt Note voucher
2. Select supplier
3. Select godown
4. Add items: Stock item, Qty, Rate, Quality grade
5. GST auto-calculated
6. Reference: Supplier invoice #
7. Save → Stock increases, Accounting entries created

**Accounting Entries:**
```
Dr: Stock Ledger (inventory value)
Dr: CGST Input
Dr: SGST Input
Cr: Supplier Ledger (total payable)
```

**Acceptance Criteria:**
- ✅ Stock quantity increases in godown
- ✅ If track_individual_items=true, creates stock_units
- ✅ Supplier outstanding increases

#### INV-008: Stock Dispatch Voucher
**User Flow:**
1. Create Delivery Note voucher
2. Select customer
3. Select godown
4. Scan QR codes or add items manually
5. Save → Stock reduces, Status = dispatched
6. Option: Auto-generate Sales Invoice

**Acceptance Criteria:**
- ✅ Validates stock availability
- ✅ Updates stock_units.status to 'dispatched'
- ✅ Links to sales order if exists
- ✅ Auto-invoice option

#### INV-009: Quality Grade Assignment
**User Flow:**
1. During receipt, select grade: A (Premium), B (Standard), C (Seconds)
2. Grade printed on QR label
3. Dispatch: Can filter by grade
4. Pricing: Different rates by grade

**Acceptance Criteria:**
- ✅ Grade stored in stock_units.quality_grade
- ✅ Reports show stock by grade
- ✅ Sales invoice can have grade-specific rates

#### INV-010: Multi-Godown Support
**Features:**
- Create multiple warehouses
- Each receipt/dispatch specifies godown
- Stock reports by godown
- Transfer stock between godowns

**Acceptance Criteria:**
- ✅ Godown selection mandatory in transactions
- ✅ Cannot dispatch from godown with zero stock
- ✅ Transfer voucher updates both godowns

### 4. Stock Reports (5 features)

#### INV-011: Stock Summary Report
**Columns:**
- Stock Item
- Godown
- Quality Grade
- Roll Count
- Total Quantity
- Average Rate
- Stock Value

**Filters:**
- Stock group
- Godown
- Grade
- Date (as on)

**Acceptance Criteria:**
- ✅ Real-time data
- ✅ Export to Excel
- ✅ Drill-down to individual rolls
- ✅ Grand total stock value

#### INV-012: Stock Valuation Report
**User Flow:**
1. Select date: "Stock Valuation as on 31-Mar-2024"
2. Select method: FIFO or Weighted Average
3. Generate

**Columns:**
- Stock Item
- Opening Stock (Qty, Value)
- Purchases (Qty, Value)
- Sales (Qty, Value)
- Closing Stock (Qty, Value)
- COGS

**Acceptance Criteria:**
- ✅ FIFO method uses calculate_fifo_cost() function
- ✅ Matches balance sheet stock value
- ✅ Shows detailed FIFO consumption layers

#### INV-013: Stock Movement Report
**Shows:**
- All receipts (inward)
- All dispatches (outward)
- Transfers
- Opening and closing balance

**Period:** From Date - To Date

### 5. Job Work Management (2 features)

#### INV-014: Send to Job Worker
**User Flow:**
1. Create Job Work order
2. Select job worker (ledger)
3. Select items to send
4. Job type: Dyeing, Printing, Embroidery
5. Create Delivery Note → Stock status = 'in_transit'

**Acceptance Criteria:**
- ✅ Stock not available for sale while at job worker
- ✅ Tracks expected return date
- ✅ Dashboard shows pending job works

#### INV-015: Receive from Job Worker
**User Flow:**
1. Select job work order
2. Create Receipt Note
3. Enter received quantity
4. Wastage = Sent - Received
5. Wastage accounting entry created

**Accounting Entry for Wastage:**
```
Dr: Wastage Expense
Cr: Inventory
```

---

## User Story Examples (Top 5)

### US-1: Real-time Customer Outstanding
**As a** business owner
**I want** to see each customer's outstanding in real-time
**So that** I can decide on credit approvals

**Acceptance Criteria:**
- Dashboard widget: Top 10 customers by outstanding
- Color-coded aging (0-30, 31-60, 61-90, 90+ days)
- Drill-down to invoice level
- Mobile responsive

### US-2: QR Code Dispatch Accuracy
**As** warehouse staff
**I want** to scan QR codes during dispatch
**So that** exact rolls are recorded with zero errors

**Acceptance Criteria:**
- Mobile camera QR scanning
- Validates roll availability
- Running count displayed
- Error for invalid/duplicate scans

### US-3: One-Click GSTR-1 Generation
**As a** business owner
**I want** GSTR-1 report with one click
**So that** I can file GST on time

**Acceptance Criteria:**
- Button: "Generate GSTR-1 for [Month]"
- JSON output ready for GSTN upload
- Validation errors highlighted
- Excel summary for review

### US-4: Auto-Invoice on Dispatch
**As a** business owner
**I want** invoices auto-generated on dispatch
**So that** billing is never delayed

**Acceptance Criteria:**
- Dispatch → Prompt "Generate Invoice?"
- Pre-fills: Items, quantities, rates
- GST auto-calculated
- PDF generated + WhatsApp sent

### US-5: Tally Export for CA Verification
**As a** CA
**I want** to export data to Tally XML
**So that** I can verify in my familiar environment

**Acceptance Criteria:**
- Export: Masters, Transactions, Full
- Valid Tally XML v2.1.0
- Imports into Tally Prime with 100% success
- Trial balance matches exactly

---

**See Also:**
- [Database Schema](./02-Database-Schema.md) for technical implementation
- [Implementation Roadmap](./04-Implementation-Roadmap.md) for development phases
- [Tally Integration Guide](./05-Tally-Integration.md) for export/import details
