# Bale Inventory & Accounting System - Complete Product Requirements Document

**Version:** 3.0 (Comprehensive)
**Date:** October 23, 2025
**Status:** Final for Development
**Strategic Approach:** Tally-First Architecture

---

## Executive Summary

### Purpose
This document defines the complete product requirements for **Bale** - a comprehensive fabric inventory management and accounting system built specifically for Indian textile traders. This system combines advanced inventory tracking with Tally-compatible accounting to become the only purpose-built solution for fabric trading businesses.

### Strategic Decision: Tally-First Architecture

**The Game-Changing Insight:**
Instead of building a separate accounting system that exports to Tally, we build **using Tally's exact structure and terminology** as our foundation, then add advanced inventory capabilities on top.

```
Traditional Approach:
Our Accounting System → Complex Mapping → Tally Export

Our Approach:
Tally Structure + Inventory Extensions = Bale System
```

### Business Impact

**Why This Matters:**
- **Zero Learning Curve for CAs:** They already know Tally terminology (Ledgers, Vouchers, Godowns)
- **Instant Data Migration:** Import existing Tally data in minutes, not weeks
- **Seamless Export:** Export to Tally is trivial (data already in Tally format)
- **Market Credibility:** Position as "Tally + Advanced Inventory" vs "Another Accounting System"
- **Client Onboarding:** From weeks to hours

**Market Positioning:**
> "Tally Prime + Advanced Fabric Inventory Management"
>
> Not "Inventory system with accounting" but "Tally with better inventory for fabrics"

### Key Objectives

1. **Complete Financial Management** - Cover all 4 categories (Revenue, Expenses, Assets, Liabilities) using Tally's Chart of Accounts
2. **GST Compliance** - Full compliance with Indian GST including e-invoice and e-way bill
3. **CA/Auditor Ready** - Generate all reports for tax audits in formats CAs expect
4. **Tally Integration** - Bi-directional sync: Import from client's Tally, Export to CA's Tally
5. **Advanced Inventory** - Fabric-specific tracking (roll, color, weight, quality) beyond what Tally offers
6. **Real-time Bridge** - Automatic accounting entries from inventory transactions

---

## Table of Contents

1. [Problem Statement & Market Opportunity](#problem-statement)
2. [User Personas & User Stories](#user-personas)
3. [Technical Architecture](#technical-architecture)
4. [Tally-First Database Design](#database-design)
5. [Feature Specifications - Inventory Module](#inventory-features)
6. [Feature Specifications - Accounting Module](#accounting-features)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Success Metrics & KPIs](#success-metrics)

---

<a name="problem-statement"></a>
## Problem Statement & Market Opportunity

### Current State Pain Points

**For Business Owners:**
1. "I maintain inventory in one system and accounting in another - double work"
2. "My CA needs data in Tally format, so I manually enter everything twice"
3. "I can't see real-time profit margins because inventory and sales aren't connected"
4. "GST filing is a nightmare - I manually compile data from multiple sources"
5. "I don't know which customers owe me money vs which invoices link to which dispatches"

**For Chartered Accountants:**
1. "Clients give me Excel sheets and physical bills - I recreate everything in Tally"
2. "Stock valuation is always wrong because they don't track FIFO properly"
3. "GST reconciliation takes days because invoice data doesn't match dispatches"
4. "I can't audit properly without seeing the complete trail from stock to sale to payment"

**For Tax Auditors:**
1. "Quantitative details (Clause 31) are incomplete because inventory and accounting aren't linked"
2. "Stock valuation methods are inconsistent - they can't prove FIFO/WA calculations"
3. "Input Tax Credit claims have no supporting documentation trail"

### Market Opportunity

- **TAM:** ₹18.5 lakh crore textile market (11.98% CAGR)
- **SAM:** Fabric trading intermediary layer (70% of domestic production)
- **SOM:** ₹14-70 crore (1-5% penetration of eligible MSME traders)

### Solution: Bale System

**Vision:** Digitize India's fabric trading ecosystem with purpose-built tools

**Positioning:** "Tally Prime + Advanced Inventory for Fabric Traders"

**Core Value Props:**
- Tally-compatible accounting (use familiar terminology, import/export seamlessly)
- Fabric-specific inventory tracking (roll, color, weight, quality, barcode)
- One transaction = Complete entry (dispatch creates invoice + accounting automatically)
- GST automation (e-invoice, e-way bill, GSTR-1/3B with one click)
- CA-ready exports (Tally XML, audit reports, Schedule III formats)

**Competitive Advantage:**
- **vs Tally:** Better inventory management for fabrics
- **vs Generic Software (Vyapar):** Built for fabric specifications + CA-grade accounting
- **vs Enterprise ERP:** Right-sized complexity and affordable

---

<a name="user-personas"></a>
## User Personas & User Stories

### Persona 1: Textile Business Owner (Primary)

**Demographics:**
- Name: Rajesh Mehta
- Age: 42
- Business: Fabric trading with embroidery job work
- Annual Turnover: ₹3.5 crore
- Tech Comfort: Moderate (uses smartphone, basic computer skills)
- Current Pain: Managing Excel + Tally + WhatsApp separately

**Daily Workflow:**
- Check WhatsApp orders from clients
- Coordinate between suppliers, job workers, and customers
- Update Excel sheets manually
- Physical visits to check work progress
- Month-end panic when CA asks for data

**Goals:**
- Know exact profit margin on each sale in real-time
- Never miss GST filing deadlines
- Reduce accounting time from 2 hours/day to <30 mins
- Have data ready when CA visits
- Make business decisions based on accurate financial data

**Frustrations:**
- "I sold fabric 30 days ago but don't know if customer paid"
- "My CA called asking for September data and I spent 3 days compiling"
- "I paid ₹25,000 GST penalty last year due to late filing"
- "I don't know if I'm making profit or loss until year-end"

#### User Stories

**US-1.1: Real-time Customer Outstanding**
```
AS A business owner
I WANT TO see which customers owe me money with aging (30/60/90 days)
SO THAT I can follow up on payments before they become bad debts

Acceptance Criteria:
- Dashboard shows top 10 customers with outstanding amount
- Color coding: Green (<30 days), Yellow (30-60), Orange (60-90), Red (90+)
- Click on customer opens detailed invoice list with dispatch references
- One-click WhatsApp/SMS reminder to customer
- Shows total outstanding across all customers
- Updates in real-time when payment is recorded
```

**US-1.2: Instant Profit Visibility**
```
AS A business owner
I WANT TO see profit/loss for each sales order
SO THAT I can identify which products/customers are most profitable

Acceptance Criteria:
- Sales Order detail page shows:
  - Total Sale Value
  - Cost of Goods (from inventory valuation)
  - Gross Profit = Sale Value - COGS
  - Gross Margin % = (Profit / Sale Value) × 100
- Dashboard shows:
  - Today's profit
  - This month's profit vs last month
  - Product-wise profitability ranking
- All calculations happen automatically
```

**US-1.3: One-Click GST Return Preparation**
```
AS A business owner
I WANT TO generate GSTR-1 and GSTR-3B reports with one click
SO THAT my CA can file returns without asking me for data

Acceptance Criteria:
- Select month (e.g., "September 2025")
- Click "Generate GSTR-1" button
- System generates complete report with:
  - B2B invoices (customer-wise, invoice-wise)
  - B2C invoices (state-wise summary)
  - HSN-wise summary
  - Taxable value, CGST, SGST, IGST breakdown
- Export to Excel/PDF/JSON (for GSTN portal upload)
- Similarly for GSTR-3B with ITC reconciliation
- Warning if any invoice is missing GSTIN or HSN code
```

**US-1.4: Automatic Invoice on Dispatch**
```
AS A business owner
I WANT tax invoices auto-generated when goods are dispatched
SO THAT I don't have to create invoices separately

Acceptance Criteria:
- When staff creates Goods Dispatch linked to Sales Order
- System automatically creates Tax Invoice with:
  - Sequential invoice number (INV-2526-0001)
  - Customer details from Sales Order
  - Product details from Dispatch
  - GST calculation based on place of supply
  - Proper accounting entries (Customer Dr, Sales Cr, GST Cr)
- Invoice PDF generated and can be:
  - Downloaded, Emailed, Shared via WhatsApp
- If e-invoice applicable (turnover >₹1 Cr), auto-generates IRN
```

**US-1.5: Cash Flow Visibility**
```
AS A business owner
I WANT TO see current bank balance and today's expected inflows/outflows
SO THAT I know if I can make large purchases or payments

Acceptance Criteria:
- Dashboard shows:
  - Current cash balance (all bank accounts + cash in hand)
  - Today's collections expected (customer promises)
  - Today's payments due (vendor due dates)
  - Net cash position (current + expected in - expected out)
- Bank balance updates when payment/receipt vouchers created
- Alerts when balance goes below minimum threshold
```

---

### Persona 2: Chartered Accountant (CA) - Critical Secondary

**Demographics:**
- Name: CA Priya Sharma
- Age: 35
- Practice: Serves 50+ MSME clients including 10 textile businesses
- Tech Comfort: High (expert in Tally, Excel, GSTN portal)
- Current Pain: Clients give incomplete, unorganized data

**Goals:**
- Receive audit-ready books from clients
- Complete GST filing for all clients in first week of month
- Spend time on advisory vs data entry
- Ensure 100% compliance to avoid client penalties

**Frustrations:**
- "Clients send WhatsApp images of bills instead of proper data"
- "Stock valuation is always a guessing game"
- "I find errors after submitting GST returns"
- "No proper audit trail to support ITC claims"

#### User Stories

**US-2.1: Tally-Ready Data Export**
```
AS A Chartered Accountant
I WANT TO import my client's complete accounting data into Tally Prime
SO THAT I can work in my familiar system without manual data entry

Acceptance Criteria:
- Export functionality with date range selector
- Generates Tally XML file with:
  - Groups and Ledger Masters
  - Stock Item Masters and Godowns
  - Vouchers (Sales, Purchase, Payment, Receipt, Journal)
  - GST details properly structured
- XML validates against Tally Prime schema
- Import into Tally succeeds without errors
- Trial balance matches between both systems
- Can do incremental exports (only new transactions)
```

**US-2.2: GST Reconciliation Report**
```
AS A Chartered Accountant
I WANT TO reconcile client's sales invoices with GSTR-2B data
SO THAT I can identify missing invoices or incorrect ITC claims

Acceptance Criteria:
- Import GSTR-2B JSON from GSTN portal
- System matches vendor invoices with GSTR-2B using:
  - Vendor GSTIN, Invoice number, Date, Amount
- Report shows:
  - Matched invoices (green)
  - Invoices in books but not in GSTR-2B (yellow)
  - Invoices in GSTR-2B but not in books (red)
  - Amount mismatches (orange)
- Can click on mismatch to see details and correct
- Summary of total ITC available vs claimed
```

**US-2.3: Audit Trail Report**
```
AS A Chartered Accountant conducting tax audit
I WANT TO see complete transaction trail from stock to sale to payment
SO THAT I can verify all accounting entries have supporting documents

Acceptance Criteria:
- Select any Tax Invoice
- View complete trail:
  - Linked Sales Order (customer, date, terms)
  - Linked Goods Dispatch (stock units, warehouse, date)
  - Stock Units origins (which Goods Receipt they came from)
  - Payment receipts against this invoice
  - Who created each document (user, timestamp)
  - Any modifications made (with old vs new values)
- All supporting documents attached
- Can export trail as PDF for audit file
```

**US-2.4: Stock Valuation Report**
```
AS A Chartered Accountant preparing annual accounts
I WANT TO get detailed stock valuation with method disclosure
SO THAT I can verify closing stock value for Balance Sheet

Acceptance Criteria:
- Select valuation date (usually March 31)
- Select valuation method (FIFO or Weighted Average)
- Report shows for each product:
  - Opening quantity and value
  - Receipts during year (quantity, rate, value)
  - Dispatches during year (quantity, rate, value)
  - Closing quantity and value
  - For FIFO: Shows layers with dates and rates
  - For WA: Shows average rate calculation
- Total closing stock value
- Product-wise breakup (Raw Material, WIP, Finished Goods)
- Export to Excel with formulas visible
```

**US-2.5: Form 3CD Quantitative Details**
```
AS A Chartered Accountant doing tax audit (turnover >₹1 Cr)
I WANT TO auto-populate Clause 31 quantitative details
SO THAT I don't manually calculate opening/closing stock

Acceptance Criteria:
- For each major product:
  - Opening stock (quantity, rate, value)
  - Purchases (quantity, rate, value)
  - Sales (quantity, rate, value)
  - Closing stock (quantity, rate, value)
- Validates: Opening + Purchases = Sales + Closing + Wastage
- Highlights discrepancies (stock shortages/excesses)
- Generates in Excel format matching Form 3CD structure
- Includes HSN codes for each product
```

---

### Persona 3: Warehouse Staff - Operational User

**Demographics:**
- Name: Suresh Patil
- Age: 28
- Role: Warehouse supervisor & dispatch handling
- Tech Comfort: Basic smartphone usage
- Education: Limited formal education

**Daily Workflow:**
- Handle physical roll movements (50+ rolls daily)
- Update manual dispatch sheets
- Coordinate with sales team on stock availability
- Process returns and damaged inventory

**Goals:**
- Complete dispatch without errors
- Know if I should release goods (payment received or not)
- Help boss with customer payment status

**Pain Points:**
- Paper-based systems lead to errors
- No instant stock lookup
- End-of-day reconciliation time-consuming
- Limited technology skills

#### User Stories

**US-3.1: Payment Status During Dispatch**
```
AS A warehouse staff member
I WANT TO see if customer has outstanding payments when creating dispatch
SO THAT I can alert boss before releasing goods to defaulting customers

Acceptance Criteria:
- When selecting customer in Goods Dispatch form
- System shows:
  - Total outstanding amount from previous invoices
  - Oldest unpaid invoice age (e.g., "45 days ago")
  - Credit limit status (e.g., "₹50K of ₹100K used")
- If customer is over credit limit:
  - Show red warning banner
  - Still allow dispatch but require boss approval (OTP)
- Green indicator if all payments up to date
```

**US-3.2: Record Customer Payment**
```
AS A warehouse staff member
I WANT TO record cash/cheque payments from customers during dispatch
SO THAT payment is immediately reflected in the system

Acceptance Criteria:
- "Receive Payment" button in Sales Order/Dispatch screen
- Opens simple payment form:
  - Amount (auto-fills pending invoice amount)
  - Payment mode (Cash/Cheque/UPI/NEFT/RTGS)
  - Payment date (default: today)
  - Reference (cheque number or UPI transaction ID)
  - Select which invoices to adjust
- On save:
  - Creates Receipt Voucher
  - Adjusts customer outstanding
  - Updates bank/cash balance
  - Sends SMS receipt to customer (optional)
- Mobile-friendly
```

---

### Persona 4: Tax Auditor - External Stakeholder

**Demographics:**
- Name: CA Vikram Desai (Tax Auditor)
- Role: Conducts tax audits for companies with turnover >₹1 Cr
- Tech Comfort: Very High
- Current Pain: Clients have poor documentation and audit trail

#### User Stories

**US-4.1: Complete Transaction Traceability**
```
AS A Tax Auditor
I WANT TO trace any financial entry back to its source document
SO THAT I can verify authenticity and compliance

Acceptance Criteria:
- For any General Ledger entry, can see:
  - Source voucher (Invoice/Payment/Journal)
  - Source transaction (Sales Order/Goods Receipt/Dispatch)
  - Original physical document reference
  - Who entered the data (user, IP, timestamp)
  - Any modifications (complete change log)
- Can drill down from:
  - Balance Sheet line item → Ledger → Voucher → Source doc
  - P&L line item → Revenue/Expense → Invoices → Stock movement
- All links are clickable and navigable
- Can generate audit trail PDF for any transaction
```

**US-4.2: Input Tax Credit Verification**
```
AS A Tax Auditor
I WANT TO verify all ITC claims are supported by valid purchase invoices
SO THAT I can confirm compliance with GST rules

Acceptance Criteria:
- ITC Register shows all purchase invoices with:
  - Vendor GSTIN (validated format)
  - Invoice details (number, date, amount)
  - Goods Receipt link (proving goods were received)
  - Payment status (can't claim ITC for unpaid invoices >180 days)
  - GSTR-2B matching status
- Can filter:
  - Invoices with valid ITC vs blocked ITC
  - Paid vs unpaid invoices
  - Matched vs unmatched with GSTR-2B
- Export detailed report for audit working papers
```

---

<a name="technical-architecture"></a>
## Technical Architecture

### Core Technology Stack

**MVP Architecture:**
- **Frontend:** Next.js with Tailwind CSS (mobile-focused web app + desktop)
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Authentication:** Supabase Auth (JWT-based)
- **File Storage:** Supabase Storage
- **Deployment:** Hostinger
- **Backend:** Direct Supabase client integration (no custom backend for MVP)

**Post-MVP:**
- **Backend:** Rust + Axum (as system complexity grows)
- **Deployment:** Railway or Fly.io

**Additional Services:**
- **PDF Generation:** For invoices, barcodes, reports
- **Barcode/QR Generation:** For stock units
- **Image Processing:** Product image optimization
- **GST Integration:** E-invoice API, E-way bill API (Sandbox then Production)

### Architecture Decisions

- **Tally-First Design:** Database schema mirrors Tally structure with inventory extensions
- **Multi-tenant:** Company-based isolation with warehouse-level staff access
- **Role-based Access:** Admin (full access) + Staff (warehouse-specific operations)
- **Mobile-first:** Primary interface for warehouse operations
- **Desktop-optimized:** Accounting screens with keyboard shortcuts (like Tally)

---

<a name="database-design"></a>
## Tally-First Database Design

### Core Principle

```
Base Schema (Tally-compatible)
    +
Inventory-Specific Extensions
    =
Complete Bale System
```

**Key Insight:** We use Tally's exact field names and structure. When exporting to Tally, it's direct mapping (not complex transformation). CAs will recognize everything immediately.

### 1. Groups Table (Tally's 28 Predefined Groups)

Tally has 28 predefined account groups that form the foundation of Chart of Accounts:

**15 Primary Groups:**
- **Balance Sheet (9):** Capital Account, Current Assets, Current Liabilities, Fixed Assets, Investments, Loans (Liability), Branch/Divisions, Suspense Account, Miscellaneous Expenses (Asset)
- **Profit & Loss (6):** Sales Accounts, Purchase Accounts, Direct Incomes, Indirect Incomes, Direct Expenses, Indirect Expenses

**13 Sub-Groups:**
- Bank Accounts, Cash-in-Hand, Deposits (Asset), Loans & Advances (Asset), Stock-in-Hand, Sundry Debtors, Sundry Creditors, Duties & Taxes, Provisions, Reserves & Surplus, Secured Loans, Unsecured Loans, Bank OD A/c

```sql
CREATE TABLE groups (
  -- Tally Standard Fields
  guid UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  alias VARCHAR(255),
  parent_guid UUID REFERENCES groups(guid), -- For sub-groups

  primary_group VARCHAR(100), -- Capital Account, Current Assets, etc.

  -- Group Nature (Tally terminology)
  nature VARCHAR(20) NOT NULL, -- 'Assets', 'Liabilities', 'Income', 'Expenses'

  -- Tally Behavior Flags
  is_revenue BOOLEAN DEFAULT FALSE, -- Affects P&L vs Balance Sheet
  affects_gross_profit BOOLEAN DEFAULT FALSE,

  -- Reserved/System Groups
  is_reserved BOOLEAN DEFAULT FALSE, -- Cannot be deleted (28 predefined)
  is_sub_group BOOLEAN DEFAULT FALSE, -- Sub-group vs Primary

  -- Cost Center Support (Tally feature)
  is_cost_centres_on BOOLEAN DEFAULT FALSE,

  -- Behavior Settings
  is_deemed_positive BOOLEAN DEFAULT FALSE, -- Credit balance shown as positive
  is_nett_debit_or_credit_totals BOOLEAN DEFAULT FALSE,

  -- Audit
  company_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(company_id, name)
);

-- Seed with Tally's 28 predefined groups on company creation
```

### 2. Ledgers Table (Tally-Compatible)

Individual accounts under groups (Customers, Vendors, Bank accounts, Expense accounts, etc.)

```sql
CREATE TABLE ledgers (
  -- Tally Standard Fields
  guid UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  alias VARCHAR(255),

  parent_group_guid UUID NOT NULL REFERENCES groups(guid),

  -- Tally Mailing/Address Details
  mailing_name VARCHAR(255),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  address_line3 VARCHAR(255),
  address_line4 VARCHAR(255),
  address_line5 VARCHAR(255),
  country VARCHAR(100) DEFAULT 'India',
  state VARCHAR(100),
  state_code VARCHAR(2), -- GST state code (27, 24, etc.)
  pincode VARCHAR(10),

  -- Contact Details
  ledger_phone VARCHAR(50),
  ledger_mobile VARCHAR(50),
  ledger_fax VARCHAR(50),
  email VARCHAR(255),

  -- GST Details (Tally GST structure)
  gstin VARCHAR(15), -- 15-character GSTIN
  gst_registration_type VARCHAR(50), -- Regular, Composition, Consumer
  pan_it_number VARCHAR(10), -- PAN number

  -- Tax Details
  is_gst_applicable BOOLEAN DEFAULT TRUE,
  gst_type_of_supply VARCHAR(20), -- 'Goods', 'Services'

  -- Bill-by-Bill (Tally's AR/AP tracking)
  is_bill_wise_on BOOLEAN DEFAULT FALSE,
  maintain_balances_bill_by_bill BOOLEAN DEFAULT FALSE,
  default_credit_period INTEGER, -- Days

  -- Opening Balance
  opening_balance DECIMAL(18, 2) DEFAULT 0,
  opening_balance_type VARCHAR(10), -- 'Dr' or 'Cr'

  -- Bank Specific Fields
  bank_account_number VARCHAR(50),
  bank_ifsc_code VARCHAR(15),
  bank_swift_code VARCHAR(20),
  bank_branch VARCHAR(255),
  enable_cheque_printing BOOLEAN DEFAULT FALSE,
  cheque_book_nos VARCHAR(255),

  -- TDS/TCS Settings
  is_tds_applicable BOOLEAN DEFAULT FALSE,
  tds_section VARCHAR(10), -- '194C', '194H', etc.
  tds_rate DECIMAL(5, 2),
  is_tcs_applicable BOOLEAN DEFAULT FALSE,

  -- Our Extension (link to Partner module)
  partner_id UUID REFERENCES partners(id),

  -- Audit
  company_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(company_id, name)
);
```

### 3. Stock Groups Table (Tally-Compatible)

Categories for stock items (Raw Material, Finished Goods, etc.)

```sql
CREATE TABLE stock_groups (
  guid UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  alias VARCHAR(255),

  parent_group_guid UUID REFERENCES stock_groups(guid), -- Hierarchy

  -- GST Settings at Group Level
  gst_applicable VARCHAR(20), -- 'Applicable', 'Not Applicable'
  hsn_code VARCHAR(10), -- Can be set at group level

  -- Our Extensions for Fabric
  is_raw_material BOOLEAN DEFAULT FALSE,
  is_finished_goods BOOLEAN DEFAULT TRUE,
  is_work_in_process BOOLEAN DEFAULT FALSE,

  -- Audit
  company_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(company_id, name)
);
```

### 4. Stock Items Table (Tally-Compatible + Fabric Extensions)

```sql
CREATE TABLE stock_items (
  guid UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL, -- Product name
  alias VARCHAR(255),

  parent_stock_group_guid UUID NOT NULL REFERENCES stock_groups(guid),

  -- Tally Stock Item Fields
  base_units VARCHAR(50) NOT NULL, -- 'Meters', 'KGS', 'PCS'
  alternate_unit VARCHAR(50),
  conversion_factor DECIMAL(10, 4),

  -- Valuation
  costing_method VARCHAR(20) DEFAULT 'Avg. Cost', -- 'Avg. Cost', 'FIFO'
  rate_of_duty DECIMAL(5, 2), -- GST rate (5, 12, 18)

  -- GST Details
  hsn_code VARCHAR(10),
  gst_applicable BOOLEAN DEFAULT TRUE,
  gst_type_of_supply VARCHAR(20) DEFAULT 'Goods',
  taxability VARCHAR(20) DEFAULT 'Taxable',
  is_reverse_charge_applicable BOOLEAN DEFAULT FALSE,

  -- Rate Details
  cgst_rate DECIMAL(5, 2),
  sgst_rate DECIMAL(5, 2),
  igst_rate DECIMAL(5, 2),
  cess_rate DECIMAL(5, 2) DEFAULT 0,

  -- Opening Stock
  opening_balance_quantity DECIMAL(18, 4) DEFAULT 0,
  opening_balance_rate DECIMAL(18, 2) DEFAULT 0,
  opening_balance_value DECIMAL(18, 2) DEFAULT 0,
  opening_balance_godown_guid UUID REFERENCES godowns(guid),

  -- Tracking Settings
  is_batch_wise_on BOOLEAN DEFAULT FALSE,

  -- Pricing
  standard_cost DECIMAL(18, 2), -- Cost price
  standard_price DECIMAL(18, 2), -- Selling price

  -- ======= OUR FABRIC-SPECIFIC EXTENSIONS =======
  product_id UUID REFERENCES products(id), -- Link to product master

  -- Fabric Specifications
  material VARCHAR(50),
  color VARCHAR(50),
  gsm INTEGER,
  thread_count INTEGER,
  design_code VARCHAR(100),

  -- Images (Tally doesn't store images)
  image_urls TEXT[],

  -- Additional Fabric Info
  min_stock_alert INTEGER,
  quality_grade VARCHAR(50),
  tags TEXT[],

  -- Catalog
  show_on_catalog BOOLEAN DEFAULT TRUE,

  -- Audit
  company_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(company_id, name)
);
```

### 5. Godowns Table (Tally-Compatible + Extensions)

Warehouses/storage locations in Tally terminology

```sql
CREATE TABLE godowns (
  guid UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  alias VARCHAR(255),

  parent_godown_guid UUID REFERENCES godowns(guid), -- Hierarchy

  -- Tally Godown Fields
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  address_line3 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),

  -- ======= OUR EXTENSIONS =======
  warehouse_id UUID REFERENCES warehouses(id), -- Link to warehouse module

  -- Staff Assignment
  assigned_staff_ids UUID[],

  is_active BOOLEAN DEFAULT TRUE,

  -- Audit
  company_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(company_id, name)
);
```

### 6. Voucher Types Table (Tally's 24 Predefined Types)

Transaction templates in Tally (Receipt, Payment, Sales, Purchase, Journal, etc.)

```sql
CREATE TABLE voucher_types (
  guid UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL, -- 'Sales', 'Purchase', 'Receipt'

  -- Tally Voucher Type Fields
  parent VARCHAR(100), -- Base voucher type it extends
  voucher_type_class VARCHAR(50), -- 'Receipt', 'Payment', 'Sales'

  -- Numbering
  numbering_method VARCHAR(50) DEFAULT 'Auto',
  starting_number INTEGER DEFAULT 1,
  prefix_details VARCHAR(50),
  suffix_details VARCHAR(50),
  width_of_numerical_part INTEGER DEFAULT 4,

  -- Behavior
  use_for_pos BOOLEAN DEFAULT FALSE,
  is_invoice_voucher BOOLEAN DEFAULT FALSE,
  is_optional BOOLEAN DEFAULT FALSE,

  -- Printing
  use_common_narration BOOLEAN DEFAULT FALSE,
  print_after_saving BOOLEAN DEFAULT FALSE,

  -- Reserved System Vouchers
  is_system_voucher BOOLEAN DEFAULT FALSE, -- 24 predefined

  -- Audit
  company_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(company_id, name)
);

-- Seed with Tally's 24 predefined voucher types on company creation
```

### 7. Vouchers Table (Tally-Compatible)

Actual transaction entries

```sql
CREATE TABLE vouchers (
  guid UUID PRIMARY KEY,

  -- Tally Voucher Standard Fields
  voucher_type_name VARCHAR(100) NOT NULL,
  voucher_number VARCHAR(100) NOT NULL,
  voucher_date DATE NOT NULL,
  reference_number VARCHAR(100),
  reference_date DATE,

  -- Transaction Details
  narration TEXT,

  -- Party/Ledger Information
  party_ledger_name VARCHAR(255),

  -- Amounts (calculated from ledger entries)
  voucher_total_amount DECIMAL(18, 2),

  -- GST Invoice Details
  place_of_supply VARCHAR(100),
  gst_registration_type VARCHAR(50),
  buyer_gstin VARCHAR(15),
  supplier_gstin VARCHAR(15),
  supply_type VARCHAR(20), -- 'Goods', 'Services'

  -- Transport Details (for e-way bill)
  transport_mode VARCHAR(20),
  vehicle_number VARCHAR(50),
  transporter_name VARCHAR(255),
  transporter_id VARCHAR(15),
  lr_number VARCHAR(100),
  lr_date DATE,
  distance_km INTEGER,

  -- E-Invoice Details
  is_einvoice_applicable BOOLEAN DEFAULT FALSE,
  irn VARCHAR(64),
  ack_number VARCHAR(50),
  ack_date TIMESTAMP,
  einvoice_qr_code TEXT,
  signed_invoice_json JSONB,

  -- E-Way Bill
  ewaybill_number VARCHAR(12),
  ewaybill_date TIMESTAMP,
  ewaybill_valid_upto TIMESTAMP,

  -- Status
  is_optional BOOLEAN DEFAULT FALSE,
  is_invoice BOOLEAN DEFAULT FALSE,
  is_accounting_voucher BOOLEAN DEFAULT TRUE,
  is_inventory_voucher BOOLEAN DEFAULT FALSE,
  is_order_voucher BOOLEAN DEFAULT FALSE,

  -- Cancellation
  is_cancelled BOOLEAN DEFAULT FALSE,
  altered_by VARCHAR(100),

  -- ======= OUR EXTENSIONS =======
  sales_order_id UUID REFERENCES sales_orders(id),
  dispatch_id UUID REFERENCES goods_dispatches(id),
  receipt_id UUID REFERENCES goods_receipts(id),
  job_work_id UUID REFERENCES job_works(id),

  -- Audit
  company_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,

  UNIQUE(company_id, voucher_type_name, voucher_number)
);
```

### 8. Voucher Ledger Entries Table (Double-Entry)

```sql
CREATE TABLE voucher_ledger_entries (
  guid UUID PRIMARY KEY,
  voucher_guid UUID NOT NULL REFERENCES vouchers(guid) ON DELETE CASCADE,

  -- Ledger Details
  ledger_name VARCHAR(255) NOT NULL,
  ledger_guid UUID REFERENCES ledgers(guid),

  -- Amount (Tally convention: Positive = Debit, Negative = Credit)
  amount DECIMAL(18, 2) NOT NULL,

  -- Bill-by-Bill Adjustment
  bill_allocations JSONB,

  -- Cost Center Allocation
  cost_centre_allocations JSONB,

  -- Narration (line-item specific)
  ledger_narration TEXT,

  -- GST Component Flag
  is_party_ledger BOOLEAN DEFAULT FALSE,
  gst_class VARCHAR(50),

  created_at TIMESTAMP DEFAULT NOW()
);
```

### 9. Voucher Inventory Entries Table (Stock Movements)

```sql
CREATE TABLE voucher_inventory_entries (
  guid UUID PRIMARY KEY,
  voucher_guid UUID NOT NULL REFERENCES vouchers(guid) ON DELETE CASCADE,

  -- Stock Item Details
  stock_item_name VARCHAR(255) NOT NULL,
  stock_item_guid UUID REFERENCES stock_items(guid),

  -- Quantity (Tally convention: Positive = Inward, Negative = Outward)
  actual_quantity DECIMAL(18, 4) NOT NULL,
  billed_quantity DECIMAL(18, 4) NOT NULL,

  -- Rate and Amount
  rate DECIMAL(18, 2),
  per_unit VARCHAR(50),
  amount DECIMAL(18, 2),

  -- Discount
  discount DECIMAL(18, 2) DEFAULT 0,

  -- Godown/Batch Allocation
  godown_allocations JSONB,
  batch_allocations JSONB,

  -- Tracking Numbers (for our stock units)
  tracking_numbers JSONB,

  -- GST Details (Line-item level)
  hsn_code VARCHAR(10),
  gst_rate DECIMAL(5, 2),
  taxable_value DECIMAL(18, 2),
  cgst_amount DECIMAL(18, 2),
  sgst_amount DECIMAL(18, 2),
  igst_amount DECIMAL(18, 2),
  cess_amount DECIMAL(18, 2),

  -- ======= OUR EXTENSIONS =======
  stock_unit_ids UUID[], -- Link to our stock_units

  created_at TIMESTAMP DEFAULT NOW()
);
```

---

*[Continuing in next message due to length...]*
