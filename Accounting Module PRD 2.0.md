# Accounting Module Integration - Product Requirements Document (PRD 2.0)

**Version:** 2.0
**Date:** October 23, 2025
**Status:** Draft for Development
**Owner:** Product & Engineering Team

---

## Executive Summary

### Purpose
This document defines the comprehensive requirements for integrating a full-featured accounting system with the existing Bale Inventory Management System. This integration is **critical for client adoption** - clients will not migrate from their current systems until accounting is fully operational.

### Business Impact
- **Client Onboarding Blocker:** No accounting = No client migration
- **Market Differentiation:** Only fabric inventory system with integrated Indian-compliant accounting
- **Revenue Impact:** Enables 100% client conversion vs current 0% without accounting

### Key Objectives
1. **Complete Financial Management:** Cover all 4 financial statement categories (Revenue, Expenses, Assets, Liabilities)
2. **GST Compliance:** Full compliance with September 2025 GST reforms including e-invoice and e-way bill
3. **CA/Auditor Ready:** Generate all reports required for tax audits and statutory compliance
4. **Tally Integration:** Seamless data export to Tally Prime for accountants
5. **Inventory-Accounting Bridge:** Real-time synchronization between stock movements and financial entries

### Scope
**In Scope:**
- General Ledger & Chart of Accounts
- Accounts Receivable (AR) & Accounts Payable (AP)
- Tax Invoice & Delivery Challan generation
- GST compliance (e-invoice, e-way bill, GSTR-1/2B/3B)
- TDS/TCS management
- Bank & Cash management
- Payment & Receipt vouchers
- Inventory valuation (FIFO/Weighted Average)
- Fixed asset management & depreciation
- Financial reports (P&L, Balance Sheet, Cash Flow)
- Tally Prime XML export
- CA/Auditor reports

**Out of Scope (Future Phases):**
- Multi-currency accounting (beyond INR)
- Payroll management
- Budgeting & forecasting tools
- Advanced cost accounting
- Direct bank integration (ICICI, HDFC APIs)
- Real-time GST filing via API

---

## Problem Statement

### Current State Pain Points

**For Business Owners:**
1. "I maintain inventory in one system and accounting in another - double work"
2. "My CA needs data in Tally format, so I have to manually enter everything twice"
3. "I can't see real-time profit margins because inventory and sales aren't connected to accounting"
4. "GST filing is a nightmare - I have to manually compile data from multiple sources"
5. "I don't know which customers owe me money vs which invoices are linked to which dispatches"

**For Chartered Accountants:**
1. "Clients give me Excel sheets and physical bills - I have to recreate everything in Tally"
2. "Stock valuation is always wrong because they don't track FIFO properly"
3. "GST reconciliation takes days because invoice data doesn't match with actual dispatches"
4. "I can't audit their books properly without seeing the complete trail from stock to sale to payment"

**For Tax Auditors:**
1. "Quantitative details (Clause 31) are incomplete because inventory and accounting aren't linked"
2. "Stock valuation methods are inconsistent - they can't prove FIFO/WA calculations"
3. "Input Tax Credit claims have no supporting documentation trail"

**For Warehouse Staff:**
1. "I dispatch goods but don't know if invoice was generated or payment received"
2. "Boss asks me about customer payments but I only track physical stock"

### Root Cause Analysis
- **System Fragmentation:** Inventory management divorced from financial accounting
- **Manual Data Entry:** Same transaction entered 2-3 times in different systems
- **No Real-time Visibility:** Financial position unknown until month-end reconciliation
- **Compliance Risk:** Manual GST calculations prone to errors and penalties
- **Audit Trail Gaps:** Can't trace financial transaction back to physical stock movement

### Success Criteria
1. **Single Source of Truth:** One transaction creates both inventory and accounting entries
2. **Zero Duplicate Entry:** Goods Dispatch auto-generates Tax Invoice with proper accounting
3. **Real-time Financials:** Live P&L and Balance Sheet accessible anytime
4. **GST Automation:** One-click GSTR-1, 3B generation with 100% accuracy
5. **CA Satisfaction:** Tally export ready without any manual cleanup

---

## User Personas & User Stories

### Persona 1: Textile Business Owner (Primary)

**Demographics:**
- Name: Rajesh Mehta
- Age: 42
- Business: Fabric trading with embroidery job work
- Annual Turnover: ₹3.5 crore
- Tech Comfort: Moderate (uses smartphone, basic computer skills)
- Current Pain: Managing Excel + Tally + WhatsApp separately

**Goals:**
- Know exact profit margin on each sale in real-time
- Never miss GST filing deadlines
- Reduce time spent on accounting from 2 hours/day to <30 mins
- Have data ready when CA visits (no panic mode)
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
- All calculations happen automatically (no manual entry)
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
I WANT tax invoices to be auto-generated when goods are dispatched
SO THAT I don't have to create invoices separately

Acceptance Criteria:
- When staff creates Goods Dispatch linked to Sales Order
- If "Generate Tax Invoice" checkbox is selected
- System automatically creates Tax Invoice with:
  - Sequential invoice number (INV-2025-0001)
  - Customer details from Sales Order
  - Product details from Dispatch
  - GST calculation based on place of supply
  - Proper accounting entries (Customer Dr, Sales Cr, GST Cr)
- Invoice PDF is generated and can be:
  - Downloaded
  - Emailed to customer
  - Shared via WhatsApp
- If e-invoice applicable (turnover >₹1 Cr), auto-generates IRN
```

**US-1.5: Cash Flow Visibility**
```
AS A business owner
I WANT TO see my current bank balance and today's expected inflows/outflows
SO THAT I know if I can make large purchases or payments

Acceptance Criteria:
- Dashboard shows:
  - Current cash balance (all bank accounts + cash in hand)
  - Today's collections expected (customer promises)
  - Today's payments due (vendor due dates)
  - Net cash position (current + expected in - expected out)
- Bank balance updates when payment/receipt vouchers are created
- Alerts when balance goes below minimum threshold (e.g., ₹50,000)
```

---

### Persona 2: Chartered Accountant (CA) - Secondary but Critical

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
  - Ledger Masters (all customers, vendors, bank accounts)
  - Stock Item Masters (all products with HSN codes)
  - Godown Masters (all warehouses)
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
I WANT TO reconcile my client's sales invoices with GSTR-2B data
SO THAT I can identify missing invoices or incorrect ITC claims

Acceptance Criteria:
- Import GSTR-2B JSON from GSTN portal
- System matches vendor invoices with GSTR-2B using:
  - Vendor GSTIN
  - Invoice number
  - Invoice date
  - Invoice amount
- Report shows:
  - Matched invoices (green)
  - Invoices in books but not in GSTR-2B (yellow - vendor hasn't filed)
  - Invoices in GSTR-2B but not in books (red - missing entry)
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
- All supporting documents attached (LR copy, transport docs)
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
- Warehouse-wise breakup
- Export to Excel with formulas visible for verification
```

**US-2.5: Form 3CD Quantitative Details**
```
AS A Chartered Accountant doing tax audit (turnover >₹1 Cr)
I WANT TO auto-populate Clause 31 quantitative details
SO THAT I don't have to manually calculate opening/closing stock

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
- Current Pain: Boss asks about payments but I only know about goods

**Goals:**
- Complete dispatch without errors
- Know if I should release goods (payment received or not)
- Help boss with customer payment status

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
  - Oldest unpaid invoice age (e.g., "Invoice from 45 days ago unpaid")
  - Credit limit status (if set) - e.g., "₹50,000 of ₹100,000 used"
- If customer is over credit limit:
  - Show red warning banner
  - Still allow dispatch but require boss approval (OTP/password)
- Green indicator if all payments up to date
```

**US-3.2: Record Customer Payment**
```
AS A warehouse staff member
I WANT TO record cash/cheque payments from customers during dispatch/collection
SO THAT payment is immediately reflected in the system

Acceptance Criteria:
- In Sales Order or Dispatch screen, "Receive Payment" button
- Opens simple payment form:
  - Amount (auto-fills pending invoice amount)
  - Payment mode (Cash/Cheque/UPI/NEFT/RTGS)
  - Payment date (default: today)
  - Reference (cheque number or UPI transaction ID)
  - Select which invoices to adjust (if multiple pending)
- On save:
  - Creates Receipt Voucher
  - Adjusts customer outstanding
  - Updates bank/cash balance
  - Sends SMS receipt to customer (optional)
- Mobile-friendly (can do from phone)
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
  - Who entered the data (user, IP address, timestamp)
  - Any modifications (complete change log)
- Can drill down from:
  - Balance Sheet line item → Ledger → Voucher → Source doc
  - P&L line item → Revenue/Expense entries → Invoices → Stock movement
- All links are clickable and navigable
- Can generate audit trail PDF for any transaction
```

**US-4.2: Input Tax Credit Verification**
```
AS A Tax Auditor
I WANT TO verify that all ITC claims are supported by valid purchase invoices
SO THAT I can confirm compliance with GST rules

Acceptance Criteria:
- ITC Register shows all purchase invoices with:
  - Vendor GSTIN (validated format)
  - Invoice details (number, date, amount)
  - Goods Receipt link (proving goods were actually received)
  - Payment status (GST rules: can't claim ITC for unpaid invoices >180 days)
  - GSTR-2B matching status
- Can filter:
  - Invoices with valid ITC vs blocked ITC
  - Paid vs unpaid invoices
  - Matched vs unmatched with GSTR-2B
- Export detailed report for audit working papers
```

---

## Feature Specifications

### Feature 1: Chart of Accounts (COA) Setup

#### 1.1 Overview
The Chart of Accounts is the foundation of the accounting system, defining all ledger accounts where financial transactions are recorded. Must follow Schedule III format of the Companies Act for compliance.

#### 1.2 Requirements

**Business Rules:**
- COA is company-level (shared across all warehouses)
- Account numbers follow hierarchical structure (e.g., 1000 Assets, 1100 Current Assets, 1110 Inventory)
- Cannot delete accounts with transaction history
- Must support Indian tax compliance (separate GST ledgers)

**Pre-configured Account Groups:**
```
1. Assets
   1.1 Current Assets
       - Inventory (Raw Material, WIP, Finished Goods, Wastage Stock)
       - Trade Receivables (Sundry Debtors)
       - Cash & Bank (multiple bank accounts, petty cash)
       - GST Input Tax Credit Receivable
       - TDS Receivable
       - Advances to Suppliers
       - Prepaid Expenses
   1.2 Non-Current Assets (Fixed Assets)
       - Machinery & Equipment
       - Vehicles
       - Computers & Software
       - Furniture & Fixtures
       - Accumulated Depreciation (contra account)

2. Liabilities
   2.1 Current Liabilities
       - Trade Payables (Sundry Creditors)
       - GST Payable (CGST, SGST, IGST separate ledgers)
       - TDS/TCS Payable
       - Advances from Customers
       - Outstanding Expenses
   2.2 Non-Current Liabilities
       - Long-term Loans
       - Owner's Capital
       - Retained Earnings

3. Income (Revenue)
   3.1 Operating Revenue
       - Fabric Sales @ 5%
       - Fabric Sales @ 12%
       - Fabric Sales @ 18%
       - Job Work Income
       - Scrap Sales
   3.2 Other Income
       - Interest Income
       - Discount Received
       - Miscellaneous Income

4. Expenses
   4.1 Direct Expenses (COGS)
       - Fabric Purchases @ 5%
       - Fabric Purchases @ 12%
       - Fabric Purchases @ 18%
       - Job Work Expenses (Dyeing, Embroidery, Printing)
       - Inward Freight
   4.2 Operating Expenses
       - Salaries & Wages
       - Warehouse Rent
       - Electricity
       - Commission to Agents (with TDS tracking)
       - Outward Freight
       - Packaging Materials
       - Office Expenses
   4.3 Financial Expenses
       - Interest on Loans
       - Bank Charges
   4.4 Depreciation
       - Depreciation on Machinery
       - Depreciation on Vehicles
       - Depreciation on Computers
```

**Data Model:**
```typescript
interface ChartOfAccounts {
  id: string; // UUID
  account_code: string; // e.g., "1110" (unique)
  account_name: string; // e.g., "Inventory - Raw Material"
  account_type: AccountType; // Asset, Liability, Income, Expense
  account_group: string; // Current Assets, Fixed Assets, etc.
  parent_account_id: string | null; // For hierarchical structure
  is_system_account: boolean; // true for pre-configured accounts (can't delete)
  is_active: boolean;
  description: string | null;

  // Tax-related
  affects_gross_profit: boolean; // For P&L classification
  is_cash_account: boolean; // For cash flow statement
  is_bank_account: boolean;
  bank_details?: {
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    branch: string;
  };

  // GST-specific
  gst_applicable: boolean;
  gst_ledger_type: 'input' | 'output' | 'payable' | null;
  hsn_sac_code: string | null; // For GST returns

  // Audit
  company_id: string; // FK
  created_at: timestamp;
  updated_at: timestamp;
  created_by: string; // FK to users
  modified_by: string;
}

enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  INCOME = 'income',
  EXPENSE = 'expense'
}
```

**Acceptance Criteria:**
- [ ] System creates pre-configured COA on company setup
- [ ] Admin can add custom accounts under existing groups
- [ ] Account codes are unique and sequential
- [ ] Cannot delete system accounts
- [ ] Cannot delete accounts with transactions (soft delete only)
- [ ] Account hierarchy displays in tree view (expandable/collapsible)
- [ ] Search accounts by code or name
- [ ] Export COA to Excel

#### 1.3 UI/UX Requirements

**List View:**
- Tree structure showing account hierarchy
- Columns: Account Code, Account Name, Type, Group, Balance (Dr/Cr)
- Expand/collapse groups
- Color coding: Assets (blue), Liabilities (red), Income (green), Expenses (orange)

**Add/Edit Account:**
- Form fields:
  - Account Code (auto-suggest next available)
  - Account Name (required)
  - Parent Account (dropdown with hierarchy)
  - Account Type (dropdown)
  - Account Group (dropdown based on type)
  - Description (textarea)
  - Is Bank Account? (checkbox)
    - If yes, show bank details section
  - GST Applicable? (checkbox)
    - If yes, show GST ledger type and HSN/SAC
- Validation:
  - Account code must be unique
  - Cannot create duplicate account names
  - Parent account must exist

---

### Feature 2: Tax Invoice Generation

#### 2.1 Overview
Automatically generate GST-compliant tax invoices when goods are dispatched to customers. Supports both B2B and B2C invoices with proper GST calculation based on place of supply.

#### 2.2 Requirements

**Business Rules:**
- Tax invoice generated from Goods Dispatch (if linked to Sales Order)
- Sequential invoice numbering: INV-{FY}-{SEQUENCE} (e.g., INV-2526-00001 for FY 2025-26)
- GST calculation:
  - Intrastate: CGST + SGST
  - Interstate: IGST
  - Rate based on product HSN code (5%, 12%, or 18%)
- For turnover >₹1 crore: Must generate e-invoice (IRN from GSTN)
- Invoice cannot be deleted (only cancelled with reason)

**Invoice Types:**
1. **B2B Invoice:** Customer with valid GSTIN (most common for fabric traders)
2. **B2C Large:** Sale >₹2.5 lakh to unregistered customer
3. **B2C Small:** Sale <₹2.5 lakh to unregistered customer
4. **Export Invoice:** Customer outside India (with LUT/bond)

**Data Model:**
```typescript
interface TaxInvoice {
  id: string; // UUID
  invoice_number: string; // "INV-2526-00001" (unique per company per FY)
  invoice_date: date; // Default: today
  financial_year: string; // "2025-26"
  invoice_type: InvoiceType; // B2B, B2C_Large, B2C_Small, Export

  // Links to inventory system
  sales_order_id: string; // FK
  dispatch_id: string; // FK (must exist)

  // Customer details
  customer_id: string; // FK to partners
  customer_name: string; // Denormalized for invoice printing
  customer_gstin: string | null; // Required for B2B
  customer_address: Address;
  customer_phone: string;

  // Shipping details (if different from customer)
  shipping_address: Address | null;

  // Supply details
  place_of_supply: string; // State name
  place_of_supply_state_code: string; // "27" for Maharashtra
  is_interstate: boolean; // Auto-calculated from company state vs place of supply

  // Commercial details
  payment_terms: string | null; // "Net 30 days", "Advance", etc.
  due_date: date | null; // Calculated from payment terms

  // Line items (from dispatch)
  line_items: InvoiceLineItem[];

  // Calculations
  gross_amount: number; // Sum of all line items before discount
  discount_amount: number; // Total discount
  taxable_value: number; // gross_amount - discount_amount
  cgst_amount: number; // For intrastate
  sgst_amount: number; // For intrastate
  igst_amount: number; // For interstate
  cess_amount: number; // Usually 0 for fabrics
  round_off: number; // To make total a round number
  net_amount: number; // Final payable amount
  amount_in_words: string; // "Rupees One Lakh Five Thousand Only"

  // Transport details
  transport_mode: TransportMode | null; // Road, Rail, Air, Ship
  vehicle_number: string | null;
  lr_number: string | null; // Lorry Receipt
  lr_date: date | null;
  transporter_name: string | null;
  transporter_gstin: string | null;

  // E-invoice details (for turnover >₹1 Cr)
  einvoice_applicable: boolean;
  irn: string | null; // 64-character hash from GSTN
  ack_number: string | null;
  ack_date: timestamp | null;
  qr_code: string | null; // Base64 encoded QR for invoice
  signed_invoice: JSON | null; // Full signed JSON from GSTN
  einvoice_status: EInvoiceStatus;

  // E-way bill details (if value >₹50,000)
  ewaybill_required: boolean; // Auto-calculated
  ewaybill_number: string | null;
  ewaybill_date: timestamp | null;
  ewaybill_valid_until: timestamp | null;

  // Status
  invoice_status: InvoiceStatus; // Draft, Generated, Cancelled
  is_cancelled: boolean;
  cancelled_at: timestamp | null;
  cancelled_by: string | null; // FK to users
  cancellation_reason: string | null;
  cancellation_note_number: string | null; // Credit note if cancelled

  // Accounting entries (auto-created)
  journal_entry_id: string | null; // FK to journal_entries
  accounting_posted: boolean; // True when accounting entries created
  posted_at: timestamp | null;

  // Attachments
  attachment_urls: string[]; // Supporting documents

  // Audit
  company_id: string; // FK
  warehouse_id: string; // FK (from dispatch)
  created_at: timestamp;
  updated_at: timestamp;
  created_by: string; // FK to users
  modified_by: string;
}

interface InvoiceLineItem {
  id: string;
  sequence_number: number; // Line number on invoice (1, 2, 3...)

  // Product details
  product_id: string; // FK
  product_name: string; // Denormalized
  product_number: string; // Denormalized
  hsn_code: string; // Required for GST
  description: string | null; // Additional details

  // Quantity
  quantity: number;
  unit_of_measurement: string; // Meters, KG, Pieces, etc.

  // Pricing
  rate_per_unit: number;
  gross_amount: number; // quantity × rate
  discount_percentage: number; // 0-100
  discount_amount: number; // (gross_amount × discount_percentage) / 100
  taxable_value: number; // gross_amount - discount_amount

  // GST
  gst_rate: number; // 5, 12, or 18
  cgst_rate: number; // gst_rate / 2 (for intrastate)
  cgst_amount: number;
  sgst_rate: number; // gst_rate / 2 (for intrastate)
  sgst_amount: number;
  igst_rate: number; // gst_rate (for interstate)
  igst_amount: number;
  cess_rate: number; // Usually 0
  cess_amount: number;

  total_amount: number; // taxable_value + cgst + sgst + igst + cess

  // Stock units dispatched (for traceability)
  stock_unit_ids: string[]; // FKs to stock_units
}

enum InvoiceType {
  B2B = 'B2B',
  B2C_LARGE = 'B2C_large',
  B2C_SMALL = 'B2C_small',
  EXPORT = 'export',
  DEEMED_EXPORT = 'deemed_export'
}

enum TransportMode {
  ROAD = 'road',
  RAIL = 'rail',
  AIR = 'air',
  SHIP = 'ship'
}

enum EInvoiceStatus {
  NOT_APPLICABLE = 'not_applicable', // Turnover <₹1 Cr
  PENDING = 'pending', // To be generated
  GENERATED = 'generated', // IRN received
  CANCELLED = 'cancelled', // E-invoice cancelled
  FAILED = 'failed' // Generation failed
}

enum InvoiceStatus {
  DRAFT = 'draft', // Created but not finalized
  GENERATED = 'generated', // Finalized and numbered
  CANCELLED = 'cancelled' // Cancelled with credit note
}
```

**Acceptance Criteria:**
- [ ] Invoice auto-created when Goods Dispatch is linked to Sales Order
- [ ] Sequential invoice numbering per financial year
- [ ] GST calculated correctly based on place of supply (intra/interstate)
- [ ] For B2B: Customer GSTIN validated (15 characters, checksum)
- [ ] For turnover >₹1 Cr: E-invoice IRN generated via API
- [ ] Invoice PDF generated with all GST compliance fields
- [ ] PDF includes:
  - [ ] Company logo and GSTIN
  - [ ] Invoice number and date
  - [ ] Customer details and GSTIN
  - [ ] Place of supply
  - [ ] HSN-wise product details
  - [ ] Taxable value, GST breakup, net amount
  - [ ] Amount in words
  - [ ] Bank details for payment
  - [ ] Terms and conditions
  - [ ] Authorized signatory
  - [ ] For e-invoice: QR code and IRN
- [ ] Invoice cannot be deleted (only cancelled)
- [ ] Cancellation creates credit note automatically
- [ ] Accounting entries auto-posted:
  - [ ] Customer Ledger: Debit
  - [ ] Sales Ledger (by GST rate): Credit
  - [ ] CGST/SGST or IGST Ledger: Credit
- [ ] E-way bill generation if value >₹50,000
- [ ] Email/WhatsApp invoice to customer

#### 2.3 UI/UX Requirements

**Invoice Generation Flow:**
```
Goods Dispatch Screen
  ↓
[Generate Tax Invoice] button (appears if linked to Sales Order)
  ↓
Invoice Preview Screen:
  - Auto-filled from Sales Order and Dispatch data
  - Editable fields:
    - Invoice date (default: today)
    - Payment terms
    - Transport details
    - Additional notes
  - Read-only calculated fields:
    - All amounts and GST
  - Show warnings:
    - "E-invoice will be generated (turnover >₹1 Cr)"
    - "E-way bill required (value >₹50,000)"
  ↓
[Confirm & Generate] button
  ↓
- Invoice number assigned
- Accounting entries posted
- If e-invoice applicable: API call to GSTN
- If e-way bill required: Navigate to e-way bill screen
  ↓
Invoice Details Screen:
  - View PDF
  - Download PDF
  - Email to customer
  - Share on WhatsApp
  - Print
  - [Cancel Invoice] button (requires reason)
  - View accounting entries
  - View e-invoice details (IRN, QR code)
  - View/update e-way bill
```

**Invoice List View:**
- Filters:
  - Date range
  - Customer
  - Invoice status (Generated, Cancelled)
  - E-invoice status
  - Payment status (Paid, Unpaid, Partial)
- Columns:
  - Invoice Number
  - Invoice Date
  - Customer Name
  - Net Amount
  - GST Amount
  - Payment Status (colored indicator)
  - E-invoice Status (icon)
  - Actions (View, Download, Email, Cancel)
- Bulk actions:
  - Export to Excel
  - Generate GSTR-1 for selected invoices
  - Send reminder emails for unpaid invoices

**Invoice PDF Template:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Company Logo]              TAX INVOICE                    │
│ Your Company Name                                          │
│ Address Line 1, Address Line 2                            │
│ City - Pincode                                             │
│ GSTIN: 27AABCT1234N1Z5    Phone: +91 XXXXXXXXXX          │
│                                                            │
│ Invoice No: INV-2526-00001          Date: 03/10/2025     │
│ Place of Supply: Karnataka (State Code: 29)              │
│                                                            │
│ Bill To:                           Ship To (if different):│
│ Customer Name                      [Same as Bill To]      │
│ GSTIN: 29AABCT5678M1Z9                                   │
│ Address                                                    │
│                                                            │
├─────┬───────────┬─────┬────┬──────┬──────┬─────┬─────┬────┤
│ S.No│ HSN  │Product │Qty│Rate│Taxable│CGST │SGST │Total│
│     │      │        │   │    │Value  │2.5% │2.5% │     │
├─────┼───────────┼─────┼────┼──────┼──────┼─────┼─────┼────┤
│  1  │ 5209 │Cotton  │500│200 │100000│ 2500│ 2500│105000│
│     │      │Fabric  │MTR│    │      │     │     │     │
├─────┴───────────┴─────┴────┴──────┴──────┴─────┴─────┴────┤
│                                                            │
│ Total Taxable Value:                      ₹1,00,000.00   │
│ CGST @ 2.5%:                                  ₹2,500.00   │
│ SGST @ 2.5%:                                  ₹2,500.00   │
│ Round Off:                                        ₹0.00   │
│ ────────────────────────────────────────────────────────  │
│ Invoice Total:                            ₹1,05,000.00   │
│                                                            │
│ Amount in Words: Rupees One Lakh Five Thousand Only       │
│                                                            │
│ Bank Details:                                             │
│ HDFC Bank, Account: 50200012345678, IFSC: HDFC0001234   │
│                                                            │
│ Payment Terms: Net 30 Days    Due Date: 02/11/2025       │
│                                                            │
│ [QR Code]          IRN: 64-character-hash-here-xxxxxx... │
│                    Ack No: 112025123456789                │
│                    Ack Date: 03/10/2025 11:30 AM          │
│                                                            │
│ Terms & Conditions:                                       │
│ 1. Goods once sold will not be taken back                 │
│ 2. Interest @ 18% p.a. will be charged on delayed payment │
│                                                            │
│                                 For Your Company Name      │
│                                 Authorized Signatory       │
└─────────────────────────────────────────────────────────────┘
```

---

### Feature 3: Payment & Receipt Vouchers

#### 3.1 Overview
Record all money inflows (receipts from customers) and outflows (payments to vendors) with proper bank/cash account tracking and invoice adjustments.

#### 3.2 Requirements

**Business Rules:**
- Receipt Voucher: Money received (Customer → Bank/Cash)
- Payment Voucher: Money paid (Bank/Cash → Vendor)
- Must link to outstanding invoices (bill-wise accounting)
- Cannot receive more than invoice outstanding amount
- TDS deduction on vendor payments (automatic calculation)
- Support multiple payment modes (Cash, Cheque, UPI, NEFT, RTGS, DD)

**Data Model:**
```typescript
interface PaymentVoucher {
  id: string;
  voucher_number: string; // "PAY-2526-00001"
  voucher_type: 'payment' | 'receipt';
  voucher_date: date;
  financial_year: string;

  // Party details
  party_id: string; // FK to partners (vendor for payment, customer for receipt)
  party_name: string; // Denormalized
  party_type: 'customer' | 'vendor';

  // Bank/Cash account
  bank_account_id: string; // FK to chart_of_accounts (must be bank/cash account)
  bank_account_name: string; // Denormalized

  // Payment details
  payment_mode: PaymentMode;
  payment_reference: string | null; // Cheque no, UPI ref, NEFT ref, etc.
  payment_date: date; // For PDC (post-dated cheque), different from voucher_date

  // Amount
  amount: number; // Gross amount

  // TDS (for payments only)
  tds_applicable: boolean;
  tds_section: string | null; // "194C", "194H", etc.
  tds_rate: number | null; // 1%, 5%, etc.
  tds_amount: number | null; // Auto-calculated
  net_amount: number; // amount - tds_amount (for payments)

  // Invoice adjustments (bill-wise)
  invoice_adjustments: InvoiceAdjustment[];

  // Notes
  narration: string | null; // Description
  internal_notes: string | null;

  // Accounting
  journal_entry_id: string | null; // FK
  accounting_posted: boolean;

  // Status
  is_cancelled: boolean;
  cancelled_at: timestamp | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;

  // PDC tracking
  is_post_dated: boolean; // For cheques
  cheque_status: ChequeStatus | null; // For cheques only
  cheque_cleared_date: date | null;
  cheque_bounce_reason: string | null;

  // Attachments
  attachment_urls: string[]; // Receipt copy, cheque image, etc.

  // Audit
  company_id: string;
  created_at: timestamp;
  created_by: string;
  updated_at: timestamp;
  modified_by: string;
}

interface InvoiceAdjustment {
  id: string;
  payment_voucher_id: string; // FK
  invoice_id: string; // FK to tax_invoices or purchase_invoices
  invoice_number: string; // Denormalized
  invoice_date: date; // Denormalized
  invoice_amount: number; // Original invoice total
  previous_paid_amount: number; // Already paid before this payment
  current_paid_amount: number; // Amount being paid now
  remaining_amount: number; // Still outstanding after this payment
}

enum PaymentMode {
  CASH = 'cash',
  CHEQUE = 'cheque',
  UPI = 'upi',
  NEFT = 'neft',
  RTGS = 'rtgs',
  IMPS = 'imps',
  DD = 'demand_draft',
  CARD = 'card',
  OTHER = 'other'
}

enum ChequeStatus {
  ISSUED = 'issued', // Cheque issued
  DEPOSITED = 'deposited', // Deposited in bank
  CLEARED = 'cleared', // Cheque cleared
  BOUNCED = 'bounced', // Cheque bounced
  CANCELLED = 'cancelled' // Cheque cancelled
}
```

**Acceptance Criteria:**

**Receipt Voucher:**
- [ ] Select customer from dropdown
- [ ] Show customer's outstanding invoices with amounts
- [ ] Select payment mode and enter reference
- [ ] Enter amount (with warning if exceeds total outstanding)
- [ ] Select which invoices to adjust (allow partial payments)
- [ ] If amount > outstanding, ask if it's advance payment
- [ ] Accounting entries auto-created:
  - [ ] Bank/Cash: Debit
  - [ ] Customer: Credit
- [ ] Outstanding amount updated in real-time
- [ ] SMS receipt sent to customer (optional)
- [ ] Print receipt voucher

**Payment Voucher:**
- [ ] Select vendor from dropdown
- [ ] Show vendor's outstanding invoices with amounts
- [ ] Select payment mode and enter reference
- [ ] Enter amount
- [ ] If TDS applicable (from vendor master):
  - [ ] Auto-calculate TDS based on section (194C, 194H, etc.)
  - [ ] Show: Gross Amount, TDS Amount, Net Payment
  - [ ] Create TDS liability entry
- [ ] Select which invoices to adjust
- [ ] Accounting entries auto-created:
  - [ ] Vendor: Debit
  - [ ] TDS Payable: Credit (if TDS applicable)
  - [ ] Bank/Cash: Credit (net amount)
- [ ] For PDC (post-dated cheque):
  - [ ] Mark as post-dated
  - [ ] Set cheque date
  - [ ] Show in PDC register until cleared
- [ ] Print payment voucher

#### 3.3 UI/UX Requirements

**Receipt Voucher Screen:**
```
┌─────────────────────────────────────────────────────┐
│ RECEIPT VOUCHER                                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Receipt No: REC-2526-00045 (auto)   Date: [Today]  │
│                                                      │
│ Received From: [Customer Dropdown ▼]                │
│   → Outstanding: ₹1,50,000 (3 invoices)            │
│                                                      │
│ Payment Mode: [UPI ▼]                               │
│ Reference: [UPI Ref: 123456789012]                 │
│                                                      │
│ Amount Received: [₹ 50,000]                         │
│                                                      │
│ Adjust Against Invoices:                            │
│ ┌──────────┬────────┬───────┬────────┬─────────┐  │
│ │☑│Invoice │ Date   │Amount │Paid    │Adjust   │  │
│ ├──────────┼────────┼───────┼────────┼─────────┤  │
│ │☑│INV-001 │01/09/25│50,000 │0       │[50,000] │  │
│ │☐│INV-012 │15/09/25│75,000 │25,000  │[0     ] │  │
│ │☐│INV-018 │28/09/25│25,000 │0       │[0     ] │  │
│ └──────────┴────────┴───────┴────────┴─────────┘  │
│                                                      │
│ Narration: [Payment for September invoices]         │
│                                                      │
│ ☐ Send SMS receipt to customer                      │
│                                                      │
│ [Cancel]  [Save Draft]  [Save & Print]              │
└─────────────────────────────────────────────────────┘
```

---

I need to continue with more features. Let me update the todo and continue writing.
