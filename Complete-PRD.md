# Bale Inventory & Accounting System - Complete Product Requirements Document

**Version:** 2.0
**Date:** January 2025
**Status:** Implementation Ready
**Target Market:** Textile/Fabric Trading & Manufacturing Businesses in India

---

## Document Information

| Property | Value |
|----------|-------|
| Total Tables | 19 (reduced from 21) |
| Total Features | 132 (92 Accounting + 40 Inventory) |
| User Stories | 35+ with acceptance criteria |
| Implementation Phases | 4 phases over 8 months |
| Architecture | Tally-First Strategy |

---

# PART 1: EXECUTIVE SUMMARY & STRATEGY

## 1.1 Executive Summary

### The Tally-First Strategy

This system is **NOT** a standalone accounting software competing with Tally. Instead, it is designed as a **Tally extension and wrapper** that provides advanced fabric inventory management while maintaining 100% compatibility with Tally's accounting structure.

#### Core Philosophy

**"Tally + Advanced Fabric Inventory Management"**

- **Use Tally's Exact Terminology:** Groups, Ledgers, Vouchers, Godowns, Stock Items
- **Import Existing Tally Data:** Migrate clients in hours, not weeks
- **Export to Tally:** CA can work in familiar Tally Prime environment
- **Zero Learning Curve:** CAs and accountants recognize the structure immediately
- **CA-Ready Reports:** Trial Balance, P&L, Balance Sheet in Schedule III format

### What Makes This Different

| Traditional Approach | Our Tally-First Approach |
|---------------------|-------------------------|
| Build accounting from scratch | Use Tally's proven structure |
| Custom terminology | Tally's standard terminology |
| CA needs training | CA understands immediately |
| Migration = manual re-entry | Migration = XML import |
| Vendor lock-in | Export to Tally anytime |
| Compliance uncertainty | Tally-compatible = compliant |

### Key Differentiators

1. **Import Existing Tally Data**
   - Upload Tally XML file
   - Import company, masters, opening balances
   - Ready to use in hours

2. **Bi-Directional Sync**
   - Export new transactions to Tally
   - CAs can work in Tally Prime
   - Parallel running supported

3. **Advanced Fabric Inventory**
   - Individual roll tracking with QR codes
   - Fabric-specific attributes (GSM, thread count, design)
   - Quality grading and wastage tracking
   - Job work management (dyeing, embroidery, printing)

4. **E-commerce Ready**
   - Catalog visibility toggle
   - Product images and descriptions
   - Variant combinations
   - Real-time stock availability

5. **GST & E-Invoice Compliance**
   - GSTR-1, 2B, 3B report generation
   - E-invoice generation (IRN from GSTN)
   - E-way bill generation
   - HSN code master

## 1.2 Business Impact

### Client Onboarding Transformation

**Traditional Accounting Software:**
- Onboarding time: 2-4 weeks
- Data migration: Manual entry of thousands of ledgers
- CA hesitation: "I don't know this software"
- Approval rate: ~40%

**Our Tally-First Approach:**
- Onboarding time: 2 hours
- Data migration: XML import (automated)
- CA reaction: "Oh, this is just like Tally!"
- Approval rate: >90%

### Quantified Business Benefits

| Metric | Current State | With Bale System | Impact |
|--------|--------------|------------------|--------|
| **Onboarding Time** | 2-4 weeks | 2 hours | 99% reduction |
| **Data Entry Errors** | ~5% | <0.1% | Automation |
| **CA Approval Time** | 2-3 days | Same day | Familiar structure |
| **GST Filing Time** | 4-6 hours | 30 minutes | Auto-generation |
| **Inventory Accuracy** | 75-80% | >98% | QR tracking |
| **Order Fulfillment Time** | 2-3 days | 4 hours | Real-time stock |
| **Customer Disputes** | 15-20/month | <2/month | Audit trail |
| **Year-End Closing** | 2 weeks | 3 days | Automated reports |

### Market Credibility

**Instant Trust from Key Stakeholders:**

1. **Chartered Accountants:** "It exports to Tally, so I can verify everything in my familiar environment"
2. **Business Owners:** "My existing CA approves it without hesitation"
3. **Auditors:** "The structure matches Tally, so audit trail is clear"
4. **Tax Officials:** "Tally-compatible means compliance is proven"

### Migration Risk: Zero

**Parallel Running Supported:**
- Keep using Tally for accounting
- Use Bale for inventory + advanced features
- Export transactions to Tally daily/weekly
- Reconcile and verify
- Gradually increase confidence
- Full migration when ready

**Exit Strategy Available:**
- Export all data to Tally XML anytime
- Import into Tally Prime
- Continue business without disruption
- No vendor lock-in

## 1.3 Scope Summary

### In Scope - Complete Feature Set

#### Accounting Features (92 features)
1. **Chart of Accounts** - Groups & Ledgers with Tally hierarchy
2. **Voucher Entry System** - All 24 Tally voucher types
3. **Accounts Receivable** - Bill-wise tracking, aging, reminders
4. **Accounts Payable** - Vendor management, payment scheduling
5. **GST Compliance** - GSTR-1/2B/3B/9, E-invoice, E-way bill
6. **TDS/TCS Management** - Automatic calculation, returns
7. **Bank & Cash Management** - Reconciliation, PDC tracking
8. **Inventory Accounting** - FIFO/Weighted Average, COGS
9. **Financial Reports** - Trial Balance, P&L, Balance Sheet
10. **CA/Auditor Reports** - Form 3CD, Audit trail

#### Inventory Features (40 features)
1. **Product Master** - Stock items with fabric specifications
2. **Warehouse Management** - Godowns, staff assignment
3. **Stock Receipt** - Receipt vouchers, QR generation
4. **Stock Dispatch** - Delivery vouchers, invoice automation
5. **Stock Units** - Individual roll tracking with QR codes
6. **Barcode Batch Management** - Batch creation and tracking
7. **Stock Reports** - Valuation, movement, aging

#### Transaction Management
1. **Sales Orders** - Quote to invoice workflow
2. **Job Work Management** - Outward/inward tracking
3. **Quality Control** - Grading, wastage tracking
4. **E-commerce Catalog** - Product display, variant management

#### Tally Integration
1. **Import from Tally** - Masters, opening balances, vouchers
2. **Export to Tally** - XML export for CA verification
3. **Bi-directional Sync** - Parallel running support

### Out of Scope - Explicitly Excluded

The following features are **NOT** included to maintain focus and simplicity:

1. **Multi-Currency Accounting**
   - Rationale: Most fabric traders operate domestically
   - Alternative: Export to Tally for rare foreign transactions

2. **Payroll & HR Management**
   - Rationale: Tally Prime already handles this well
   - Alternative: Continue using Tally for payroll

3. **Budgeting & Forecasting**
   - Rationale: Complex feature, low usage in target market
   - Alternative: Excel exports for analysis

4. **Direct Bank Integration**
   - Rationale: Security concerns, regulatory complexity
   - Alternative: Manual bank statement reconciliation

5. **Manufacturing/Production Planning**
   - Rationale: Focus is on trading, not manufacturing
   - Alternative: Job work tracking covers basic needs

6. **Fixed Assets Management**
   - Rationale: Tally Prime handles this adequately
   - Alternative: Maintain fixed assets in Tally

7. **Multi-Branch Consolidation**
   - Rationale: Each branch = separate company
   - Alternative: Manual consolidation if needed

8. **Point of Sale (POS)**
   - Rationale: Target market is B2B, not retail
   - Alternative: Not applicable

## 1.4 Strategic Positioning

### Target Market Segments

**Primary Segment (80% focus):**
- Textile fabric traders and wholesalers
- Annual turnover: ₹5 Cr to ₹50 Cr
- Stock keeping units: 500-5,000 items
- Geographic focus: Maharashtra, Gujarat, Tamil Nadu
- Current pain: Using Tally + Excel for inventory

**Secondary Segment (15% focus):**
- Small fabric manufacturers with trading arm
- Job work processors (dyeing, printing houses)
- Embroidery and stitching units

**Tertiary Segment (5% focus):**
- Fabric e-commerce businesses
- Fashion designers with inventory

### Competitive Landscape

| Competitor | Strength | Weakness | Our Advantage |
|-----------|----------|----------|---------------|
| **Tally Prime** | Accounting trust | Weak inventory | Better inventory |
| **Generic ERP** | Full features | Complex, expensive | Simpler, focused |
| **Zoho Books** | Cloud-based | Not Tally-compatible | CA acceptance |
| **Custom Excel** | Flexible | Error-prone, no integration | Automation |

### Value Proposition Canvas

**For:** Textile fabric traders using Tally
**Who:** Need better inventory tracking than Excel
**Our solution:** Provides Tally-compatible accounting + advanced fabric inventory
**Unlike:** Generic ERPs that require complete migration
**We:** Import your Tally data and enhance it, with export back to Tally anytime

### Go-To-Market Strategy

**Phase 1: CA Network (Months 1-3)**
- Demo to 50 CAs in target cities
- Show Tally import/export
- Get testimonials
- CA becomes sales channel

**Phase 2: Existing Tally Users (Months 4-6)**
- "Add inventory to your Tally" messaging
- Free Tally import service
- 30-day trial with full features
- Case studies of migrations

**Phase 3: Referral Growth (Months 7-12)**
- Existing clients refer peers
- Industry association partnerships
- Trade show presence
- WhatsApp community building

---

## 1.5 Success Criteria

### Technical Success Metrics

1. **Tally Compatibility**
   - XML import success rate: >95%
   - XML export validation: 100%
   - Trial balance match: 100%

2. **System Performance**
   - Database query response: <100ms
   - Page load time: <2 seconds
   - Concurrent users: 20+ per company
   - Uptime: 99.9%

3. **Data Accuracy**
   - Stock unit tracking accuracy: >98%
   - GST calculation accuracy: 100%
   - Invoice generation errors: <0.1%

### Business Success Metrics

1. **Adoption**
   - Client onboarding: <2 hours
   - CA approval rate: >90%
   - Daily active users: >80%
   - Feature utilization: >70%

2. **Financial Impact**
   - Inventory shrinkage reduction: >50%
   - Order fulfillment speed: 3x faster
   - GST filing penalties: Zero
   - Customer disputes: >80% reduction

3. **User Satisfaction**
   - NPS score: >50
   - CA recommendation rate: >80%
   - System usability (SUS score): >75
   - Support tickets: <5 per client per month

### Compliance Success Metrics

1. **GST Compliance**
   - On-time filing rate: 100%
   - E-invoice generation success: >98%
   - GSTR matching accuracy: >95%

2. **Audit Readiness**
   - Form 3CD data availability: 100%
   - Audit trail completeness: 100%
   - Document attachment rate: >90%

---

# PART 2: USER PERSONAS & USER STORIES

## 2.1 Persona 1: Textile Business Owner (Rajesh Mehta)

### Profile
- **Age:** 42 years
- **Business:** Mehta Fabrics Pvt Ltd (Est. 1995)
- **Role:** Managing Director
- **Location:** Ichalkaranji, Maharashtra
- **Turnover:** ₹15 Cr annually
- **Team:** 12 staff (2 accountants, 5 warehouse, 5 sales)
- **Current Tech:** Tally Prime + Excel sheets

### Goals
1. Reduce inventory shrinkage from 8% to <2%
2. Know exact stock position before making purchase decisions
3. Fulfill customer orders faster (currently 2-3 days)
4. Reduce customer payment delays (currently 45-60 days)
5. Avoid GST filing penalties (paid ₹50,000 last year)

### Pain Points
- Can't trust Excel inventory numbers
- Stock verification takes 2 full days monthly
- Don't know which items are profitable
- Customer disputes over quantity delivered
- CA takes 3 days to approve financial statements

### User Stories

#### US-1.1: Real-time Customer Outstanding

**As a** business owner
**I want to** see each customer's outstanding amount in real-time
**So that** I can decide whether to approve new orders and follow up on payments

**Acceptance Criteria:**
- [ ] Dashboard shows top 10 customers by outstanding
- [ ] Color-coded aging (0-30, 31-60, 61-90, 90+ days)
- [ ] One-click drill-down to invoice-level details
- [ ] Shows payment promises for overdue amounts
- [ ] Mobile-responsive view for checking on-the-go
- [ ] Automated WhatsApp reminder integration

**Priority:** P0 (Critical)
**Implementation:** Phase 2

---

#### US-1.2: Instant Profit Visibility

**As a** business owner
**I want to** see profit/loss by product category in real-time
**So that** I can focus on high-margin products and phase out loss-making ones

**Acceptance Criteria:**
- [ ] Dashboard widget showing top 10 profitable stock items
- [ ] Comparison: Sales value vs Purchase cost (COGS)
- [ ] Gross margin % for each product
- [ ] Trend graph: This month vs last month
- [ ] Filterable by date range, stock group, customer
- [ ] Export to Excel for deeper analysis

**Priority:** P0 (Critical)
**Implementation:** Phase 2

---

#### US-1.3: One-Click GST Return Preparation

**As a** business owner
**I want to** generate GSTR-1 report with one button click
**So that** I can file GST returns on time without CA dependency

**Acceptance Criteria:**
- [ ] Button: "Generate GSTR-1 for [Month]"
- [ ] Shows B2B invoices with customer GSTIN
- [ ] Shows B2C invoices aggregated by state
- [ ] HSN-wise summary with quantities
- [ ] Validates all required fields before generation
- [ ] Downloads JSON file ready for GSTN portal upload
- [ ] Shows errors/warnings if any data is missing

**Priority:** P0 (Critical)
**Implementation:** Phase 3

---

#### US-1.4: Automatic Invoice on Dispatch

**As a** business owner
**I want** invoices to be auto-generated when warehouse dispatches stock
**So that** billing is never delayed and customers receive invoices immediately

**Acceptance Criteria:**
- [ ] When delivery voucher is saved, system prompts "Generate Invoice?"
- [ ] Pre-fills invoice with stock item details, quantities, rates
- [ ] Auto-calculates GST (CGST/SGST or IGST based on state)
- [ ] Generates PDF invoice with company letterhead
- [ ] Sends invoice via WhatsApp/Email to customer automatically
- [ ] Creates accounting entries (Dr: Customer, Cr: Sales, Dr: CGST/SGST Output)

**Priority:** P0 (Critical)
**Implementation:** Phase 2

---

#### US-1.5: Cash Flow Visibility

**As a** business owner
**I want to** see projected cash flow for next 30 days
**So that** I can plan vendor payments and avoid cash crunches

**Acceptance Criteria:**
- [ ] Dashboard shows: Cash in hand + Bank balance today
- [ ] Expected inflows: Customer payments due in next 30 days
- [ ] Expected outflows: Vendor payments due in next 30 days
- [ ] Net position: Surplus or deficit by week
- [ ] Color-coded warnings if deficit expected
- [ ] Considers payment promise dates from customers

**Priority:** P1 (High)
**Implementation:** Phase 4

---

#### US-1.6: Stock Availability Before Promising

**As a** business owner
**I want to** check real-time stock availability while talking to customer
**So that** I don't promise delivery for out-of-stock items

**Acceptance Criteria:**
- [ ] Mobile-friendly search: Enter product name
- [ ] Shows: Available quantity by godown
- [ ] Shows: Reserved quantity (in pending sales orders)
- [ ] Shows: Expected inbound (in-transit from vendors)
- [ ] Estimated delivery date based on stock position
- [ ] One-click to create sales order if stock available

**Priority:** P0 (Critical)
**Implementation:** Phase 1

---

#### US-1.7: QR Code Scanning for Dispatch

**As a** business owner
**I want** warehouse staff to scan QR codes while dispatching
**So that** exact rolls dispatched are recorded with no manual errors

**Acceptance Criteria:**
- [ ] Mobile app: "Dispatch" screen
- [ ] Scan QR code on roll
- [ ] System validates: Roll is available (not already dispatched)
- [ ] System checks: Roll matches the sales order item
- [ ] Adds roll to dispatch list
- [ ] Shows running total quantity scanned
- [ ] Confirms dispatch when all items scanned

**Priority:** P0 (Critical)
**Implementation:** Phase 1

---

#### US-1.8: Quality Grade Tracking

**As a** business owner
**I want to** record quality grade (A/B/C) for each roll received
**So that** I can price correctly and avoid sending B-grade to A-grade customers

**Acceptance Criteria:**
- [ ] Receipt voucher entry: Dropdown for quality grade (A/B/C)
- [ ] Quality grade printed on QR code label
- [ ] Stock summary report: Shows quantity by grade
- [ ] Sales order: Can specify grade required
- [ ] Dispatch: System warns if wrong grade being scanned
- [ ] Pricing: Can set different rates by grade

**Priority:** P1 (High)
**Implementation:** Phase 1

---

#### US-1.9: Job Work Tracking (Dyeing)

**As a** business owner
**I want to** track grey fabric sent for dyeing and finished fabric received back
**So that** I know exactly what's at job worker's location and avoid losses

**Acceptance Criteria:**
- [ ] Create job work: Select partner (dye house), items, quantities
- [ ] Generates delivery voucher (outward to job worker)
- [ ] Status changes to "In Progress"
- [ ] Upon completion, create receipt voucher (inward from job worker)
- [ ] System allows quantity difference (wastage tracking)
- [ ] Shows pending job works dashboard with aging
- [ ] Records job work charges as expense

**Priority:** P1 (High)
**Implementation:** Phase 1

---

#### US-1.10: E-Way Bill Generation

**As a** business owner
**I want to** generate e-way bills directly from delivery vouchers
**So that** transport can happen immediately without delays

**Acceptance Criteria:**
- [ ] Delivery voucher saved: Button "Generate E-Way Bill"
- [ ] Pre-fills: Supplier GSTIN, Buyer GSTIN, Invoice details
- [ ] Prompts: Vehicle number, Transporter details
- [ ] Calls NIC E-Way Bill API
- [ ] Receives: E-Way Bill number and PDF
- [ ] Stores EWB number with delivery voucher
- [ ] Prints EWB with invoice

**Priority:** P1 (High)
**Implementation:** Phase 3

---

#### US-1.11: Wastage Recording

**As a** business owner
**I want to** record wastage when cutting or dispatching fabric
**So that** stock quantities remain accurate and I can analyze wastage trends

**Acceptance Criteria:**
- [ ] Dispatch voucher: Field for "Wastage quantity"
- [ ] Reason dropdown: Cutting waste, Damaged, Soiled, etc.
- [ ] Generates automatic journal entry: Dr: Wastage Expense, Cr: Inventory
- [ ] Wastage report: Shows wastage by product, by reason, by month
- [ ] Alerts if wastage exceeds threshold (e.g., 5%)

**Priority:** P1 (High)
**Implementation:** Phase 1

---

#### US-1.12: Automated Payment Reminders

**As a** business owner
**I want** system to send automated payment reminders to overdue customers
**So that** collections improve without daily manual follow-ups

**Acceptance Criteria:**
- [ ] Settings: Configure reminder schedule (e.g., 3 days after due date)
- [ ] Reminder via: WhatsApp, SMS, Email
- [ ] Message template: "Dear [Customer], Your invoice [Invoice No.] of ₹[Amount] is overdue by [Days] days. Please arrange payment."
- [ ] Logs all reminders sent
- [ ] Dashboard: Reminder effectiveness (X% paid within Y days)
- [ ] Can pause reminders for specific customers

**Priority:** P1 (High)
**Implementation:** Phase 2

---

#### US-1.13: Stock Transfer Between Godowns

**As a** business owner
**I want to** transfer stock between my two warehouse locations
**So that** both locations have updated inventory records

**Acceptance Criteria:**
- [ ] Create transfer voucher: From Godown A to Godown B
- [ ] Select stock items and quantities
- [ ] Status: Pending → In Transit → Completed
- [ ] Godown A: Stock reduced
- [ ] Godown B: Stock increased
- [ ] Transport details recorded (vehicle, driver, date)
- [ ] Mobile app: Godown B staff confirms receipt by scanning QR codes

**Priority:** P2 (Medium)
**Implementation:** Phase 1

---

#### US-1.14: Credit Limit Management

**As a** business owner
**I want to** set credit limits for each customer
**So that** I can block new orders if customer exceeds their limit

**Acceptance Criteria:**
- [ ] Ledger master: Field for "Credit Limit"
- [ ] Dashboard: Shows customers near limit (90% utilized)
- [ ] Sales order creation: Checks outstanding + new order value against limit
- [ ] Warning message: "Customer has exceeded credit limit by ₹X. Proceed?"
- [ ] Requires approval from admin/owner to proceed
- [ ] Report: Credit utilization by customer

**Priority:** P2 (Medium)
**Implementation:** Phase 2

---

#### US-1.15: Mobile Dashboard for Owner

**As a** business owner
**I want** a mobile dashboard with key metrics
**So that** I can monitor business health while traveling

**Acceptance Criteria:**
- [ ] Mobile-responsive home screen after login
- [ ] Widgets: Today's sales, Today's collections, Stock value, Top 5 overdue customers
- [ ] Refresh button to get latest data
- [ ] Tap on widget to see detailed report
- [ ] Push notifications: Large order received, Payment received, Stock below minimum
- [ ] Works offline (cached data) and syncs when online

**Priority:** P2 (Medium)
**Implementation:** Phase 4

---

## 2.2 Persona 2: Chartered Accountant (CA Priya Sharma)

### Profile
- **Age:** 35 years
- **Practice:** Sharma & Associates, Mumbai
- **Clients:** 80+ businesses (20 in textile/fabric)
- **Role:** Tax consultant & auditor
- **Experience:** 12 years post-qualification
- **Current Tech:** Tally Prime expert (uses daily)

### Goals
1. Minimize time spent on data verification
2. Ensure 100% GST compliance for clients
3. Complete tax audits (3CB/3CD) efficiently
4. Avoid penalties due to data errors
5. Scale practice without hiring more staff

### Pain Points
- Clients use different software, need to learn each one
- Inventory data often doesn't match accounting data
- Form 3CD quantitative details require manual Excel work
- Can't verify transactions easily (no audit trail)
- Year-end closing takes too long

### User Stories

#### US-2.1: Tally-Ready Data Export

**As a** CA
**I want to** export client data to Tally XML format
**So that** I can verify and work in my familiar Tally environment

**Acceptance Criteria:**
- [ ] Menu: "Export to Tally XML"
- [ ] Options: Masters only, Transactions only, Full export
- [ ] Date range selection for transactions
- [ ] Generates valid Tally XML v2.1.0 file
- [ ] Validates file against Tally schema before download
- [ ] Import into Tally Prime: 100% success (no errors)
- [ ] All ledgers, vouchers, stock items appear correctly

**Priority:** P0 (Critical)
**Implementation:** Phase 2

---

#### US-2.2: GST Reconciliation Report

**As a** CA
**I want** a GSTR-2B vs Books reconciliation report
**So that** I can identify and fix mismatches before filing GSTR-3B

**Acceptance Criteria:**
- [ ] Upload GSTR-2B JSON file from GSTN portal
- [ ] System compares: GSTR-2B purchases vs Purchase vouchers in books
- [ ] Shows matched invoices (green)
- [ ] Shows unmatched invoices in GSTR-2B but not in books (red)
- [ ] Shows invoices in books but not in GSTR-2B (amber)
- [ ] Drill-down to invoice level for investigation
- [ ] Export mismatch report to Excel for client discussion

**Priority:** P0 (Critical)
**Implementation:** Phase 3

---

#### US-2.3: Audit Trail Report

**As a** CA
**I want** to see complete audit trail for any voucher
**So that** I can verify who created/modified transactions and when

**Acceptance Criteria:**
- [ ] Every voucher shows: Created by, Created date, Modified by, Modified date
- [ ] "View History" button on voucher: Shows all modifications
- [ ] Change log: Old value → New value, Timestamp, User
- [ ] Cannot delete history (immutable log)
- [ ] Audit trail report: All changes in date range
- [ ] Meets Companies Act 2013 audit requirements

**Priority:** P0 (Critical)
**Implementation:** Phase 2

---

#### US-2.4: Stock Valuation Report

**As a** CA
**I want** month-end stock valuation report with FIFO/Weighted Average method
**So that** I can verify cost of goods sold and closing stock value

**Acceptance Criteria:**
- [ ] Select date: Stock valuation as on [Date]
- [ ] Choose method: FIFO or Weighted Average
- [ ] Shows: Opening stock, Purchases, Sales, Closing stock (quantity & value)
- [ ] Cost of goods sold calculation shown
- [ ] Detailed view: Shows individual receipts and their consumption
- [ ] Matches with accounting ledger: Stock Inventory account balance
- [ ] Export to Excel with all details

**Priority:** P0 (Critical)
**Implementation:** Phase 4

---

#### US-2.5: Form 3CD Quantitative Details

**As a** CA
**I want** system-generated quantitative details for Form 3CD Clause 31
**So that** I don't have to prepare this manually in Excel

**Acceptance Criteria:**
- [ ] Menu: "Reports > Tax Audit > Form 3CD Clause 31"
- [ ] Select financial year
- [ ] System generates: Opening stock, Purchases, Sales, Closing stock by major items
- [ ] Shows: Quantity, Rate, Value
- [ ] Validates: Opening + Purchases = Sales + Closing (quantity reconciliation)
- [ ] Highlights discrepancies if any
- [ ] Export to Excel in Form 3CD format
- [ ] Can import into CA's tax audit software

**Priority:** P1 (High)
**Implementation:** Phase 4

---

#### US-2.6: Trial Balance Verification

**As a** CA
**I want** instant trial balance as on any date
**So that** I can verify debit = credit before finalizing accounts

**Acceptance Criteria:**
- [ ] Enter date: Trial Balance as on [Date]
- [ ] Shows: All ledgers with opening balance, Dr/Cr total, closing balance
- [ ] Grouped by: Assets, Liabilities, Income, Expenses
- [ ] Total Dr = Total Cr validation (highlighted if mismatch)
- [ ] Drill-down: Click ledger to see vouchers
- [ ] Export to Excel/PDF
- [ ] Matches Tally trial balance 100%

**Priority:** P0 (Critical)
**Implementation:** Phase 2

---

#### US-2.7: Bank Reconciliation Statement

**As a** CA
**I want** system-generated bank reconciliation statement
**So that** I can verify all bank transactions are recorded

**Acceptance Criteria:**
- [ ] Select bank ledger and date range
- [ ] Shows: Balance as per books
- [ ] Add: Cheques deposited but not cleared
- [ ] Less: Cheques issued but not presented
- [ ] Add/Less: Bank charges, interest
- [ ] Equals: Balance as per bank statement
- [ ] Can mark transactions as "reconciled"
- [ ] Shows unreconciled transactions separately

**Priority:** P1 (High)
**Implementation:** Phase 2

---

#### US-2.8: Financial Statements (Schedule III)

**As a** CA
**I want** Balance Sheet and P&L in Schedule III format
**So that** they comply with Companies Act 2013 requirements

**Acceptance Criteria:**
- [ ] Balance Sheet: Assets (Non-current, Current), Liabilities (Equity, Non-current, Current)
- [ ] Profit & Loss: Revenue, Other Income, Expenses, Tax, Net Profit
- [ ] Shows: Current year vs Previous year (comparative)
- [ ] All mandatory notes and disclosures included
- [ ] Auto-populated from trial balance (no manual entry)
- [ ] Export to Excel/PDF for inclusion in annual report

**Priority:** P0 (Critical)
**Implementation:** Phase 2

---

#### US-2.9: TDS Computation and Return

**As a** CA
**I want** automatic TDS computation and Form 26Q preparation
**So that** quarterly TDS returns are filed correctly

**Acceptance Criteria:**
- [ ] Payment vouchers: Auto-calculates TDS based on section
- [ ] TDS register: Shows all TDS deductions by quarter
- [ ] Form 26Q: Auto-generates text file for TRACES upload
- [ ] Validates: PAN, TDS rate, Amount
- [ ] Supports: 194C (Contractor), 194H (Commission), 194J (Professional)
- [ ] TDS challan tracking: Payment date, BSR code, Challan number

**Priority:** P1 (High)
**Implementation:** Phase 3

---

#### US-2.10: Document Attachments

**As a** CA
**I want** to attach supporting documents (bills, contracts) to vouchers
**So that** all audit evidence is digitally available

**Acceptance Criteria:**
- [ ] Every voucher: "Attach Document" button
- [ ] Upload PDF, JPG, PNG files (max 5 MB each)
- [ ] Multiple attachments allowed per voucher
- [ ] Thumbnail preview in voucher view
- [ ] Download all attachments as ZIP file
- [ ] During audit: Can search and view documents easily

**Priority:** P2 (Medium)
**Implementation:** Phase 4

---

## 2.3 Persona 3: Warehouse Staff (Suresh Patil)

### Profile
- **Age:** 28 years
- **Role:** Warehouse Supervisor
- **Experience:** 5 years in fabric warehouse
- **Education:** 12th pass
- **Tech Comfort:** Can use smartphone apps, not computer-savvy
- **Languages:** Marathi (primary), Hindi

### Goals
1. Record stock receipt and dispatch accurately
2. Find stock items quickly for dispatch
3. Avoid errors that cause customer complaints
4. Complete daily tasks faster

### Pain Points
- Manual register entry is time-consuming
- Can't find specific rolls in large warehouse
- Owner blames when stock doesn't match
- No visibility into pending orders

### User Stories

#### US-3.1: Mobile QR Scanning for Receipt

**As a** warehouse staff
**I want to** scan barcodes on received rolls using my phone
**So that** I don't have to manually enter each roll's details

**Acceptance Criteria:**
- [ ] Mobile app: "Stock Receipt" screen
- [ ] Scan product barcode or select from dropdown
- [ ] Enter quantity (number of rolls)
- [ ] Select quality grade (A/B/C)
- [ ] Button: "Generate QR Codes"
- [ ] System creates QR codes for each roll and prints labels
- [ ] Paste labels on rolls
- [ ] All rolls added to inventory automatically

**Priority:** P0 (Critical)
**Implementation:** Phase 1

---

#### US-3.2: Pending Dispatch List

**As a** warehouse staff
**I want to** see list of sales orders pending dispatch
**So that** I know what to prepare for sending

**Acceptance Criteria:**
- [ ] Mobile app: "Pending Orders" tab
- [ ] Shows: Customer name, Order date, Items & Quantities
- [ ] Sorted by: Oldest first (FIFO)
- [ ] Can filter by: Customer, Date range
- [ ] Tap order to start dispatch process
- [ ] Shows which godown/rack to pick from

**Priority:** P0 (Critical)
**Implementation:** Phase 1

---

#### US-3.3: QR Code Dispatch Scanning

**As a** warehouse staff
**I want to** scan QR codes while loading truck
**So that** system records exactly which rolls are dispatched

**Acceptance Criteria:**
- [ ] Mobile app: "Dispatch Order" screen
- [ ] Shows items required for order
- [ ] Scan QR code on roll
- [ ] System validates: Roll matches order item, Roll is available
- [ ] Shows green tick if correct, red error if wrong
- [ ] Running count: 5/10 rolls scanned
- [ ] When complete: Button "Confirm Dispatch"

**Priority:** P0 (Critical)
**Implementation:** Phase 1

---

#### US-3.4: Stock Location Finder

**As a** warehouse staff
**I want to** search for a product and see where it's kept
**So that** I can find items quickly for dispatch

**Acceptance Criteria:**
- [ ] Mobile app: Search bar
- [ ] Type product name or scan barcode
- [ ] Shows: Godown name, Rack number, Available quantity
- [ ] Photo of location (if configured)
- [ ] Can filter by quality grade
- [ ] "Navigate" button (if GPS-enabled warehouse)

**Priority:** P2 (Medium)
**Implementation:** Phase 1

---

#### US-3.5: Daily Stock Summary

**As a** warehouse staff
**I want** to see today's receipts and dispatches
**So that** I can report progress to owner

**Acceptance Criteria:**
- [ ] Mobile app: "Today's Summary" widget
- [ ] Shows: Receipts (X rolls), Dispatches (Y rolls)
- [ ] Pending dispatches for today
- [ ] My performance: Tasks completed vs pending
- [ ] Can share summary via WhatsApp to owner

**Priority:** P2 (Medium)
**Implementation:** Phase 1

---

## 2.4 Persona 4: Tax Auditor (CA Anil Kumar)

### Profile
- **Age:** 45 years
- **Role:** Tax Auditor
- **Experience:** 20 years
- **Focus:** Conducts tax audits under Section 44AB
- **Current Tech:** Relies on client-provided data

### Goals
1. Verify quantitative details (Form 3CD)
2. Ensure proper audit trail exists
3. Complete audit efficiently
4. Identify red flags early

### Pain Points
- Clients don't maintain proper quantitative records
- Stock register vs accounting ledger mismatch
- No proper documentation for high-value transactions
- Wastes time on data collection instead of analysis

### User Stories

#### US-4.1: Form 3CD Quantitative Verification

**As a** tax auditor
**I want** system to show opening, purchases, sales, closing quantities
**So that** I can verify Form 3CD Clause 31 accuracy

**Acceptance Criteria:**
- [ ] Report: Quantitative details by major stock items
- [ ] Reconciliation: Opening + Purchases = Sales + Closing
- [ ] Shows discrepancies if any (with red highlighting)
- [ ] Drill-down to voucher level for verification
- [ ] Export to Excel for working papers
- [ ] Period: Full financial year

**Priority:** P1 (High)
**Implementation:** Phase 4

---

#### US-4.2: High-Value Transaction Report

**As a** tax auditor
**I want** list of all transactions above ₹10 lakhs
**So that** I can verify supporting documents and section 40A(3) compliance

**Acceptance Criteria:**
- [ ] Report: All vouchers with amount > ₹10,00,000
- [ ] Shows: Date, Party name, Amount, Payment mode
- [ ] Filter by: Voucher type, Date range
- [ ] For cash payments > threshold: Show remarks/justification
- [ ] Can view attached supporting documents
- [ ] Export to Excel

**Priority:** P1 (High)
**Implementation:** Phase 4

---

#### US-4.3: Modification Log for Audit Trail

**As a** tax auditor
**I want** to see all post-dated voucher modifications
**So that** I can verify no backdated entries were made

**Acceptance Criteria:**
- [ ] Report: All vouchers modified after voucher date
- [ ] Shows: Voucher date, Modification date, Modified by, Changes made
- [ ] Red flag: Modifications after financial year-end
- [ ] Can filter by: User, Date range, Voucher type
- [ ] Immutable log (cannot be deleted)

**Priority:** P1 (High)
**Implementation:** Phase 2

---

## 2.5 Persona 5: Sports Fabric Trader (From existing PRD.md)

### Profile
- **Name:** Amit Desai
- **Business:** Sports fabric trading (jerseys, track pants)
- **Unique Need:** Width and finish variants critical

### User Stories

#### US-5.1: Variant Management

**As a** sports fabric trader
**I want to** create product variants for width and finish combinations
**So that** customers can order exactly what they need

**Acceptance Criteria:**
- [ ] Stock item master: Can define variants (Width: 44", 58"; Finish: Matte, Glossy)
- [ ] Each variant combination is trackable separately
- [ ] Dispatch: Can select specific variant
- [ ] Reports: Stock summary by variant
- [ ] E-commerce catalog: Customers see variant options

**Priority:** P2 (Medium)
**Implementation:** Phase 1

---

## 2.6 Persona 6: Embroidery Trader (From existing PRD.md)

### Profile
- **Name:** Priya Textiles
- **Business:** Embroidered fabric wholesale
- **Unique Need:** Design catalog for customers

### User Stories

#### US-6.1: E-Commerce Catalog

**As an** embroidery trader
**I want** customers to browse my catalog online with images
**So that** I can get orders digitally without physical samples

**Acceptance Criteria:**
- [ ] Stock item: Can upload multiple product images
- [ ] Toggle: "Show on Catalog" (Yes/No)
- [ ] Public URL: www.bale.com/catalog/priya-textiles
- [ ] Customers see: Images, Description, Price, Availability
- [ ] Can submit inquiry with contact details
- [ ] Notification to owner when inquiry received

**Priority:** P2 (Medium)
**Implementation:** Phase 4

---

## Summary: User Stories Overview

| Persona | User Stories Count | Priority P0 | Priority P1 | Priority P2 |
|---------|-------------------|-------------|-------------|-------------|
| Business Owner (Rajesh) | 15 | 7 | 6 | 2 |
| CA (Priya) | 10 | 5 | 4 | 1 |
| Warehouse Staff (Suresh) | 5 | 3 | 0 | 2 |
| Tax Auditor (Anil) | 3 | 0 | 3 | 0 |
| Sports Trader (Amit) | 1 | 0 | 0 | 1 |
| Embroidery Trader (Priya T) | 1 | 0 | 0 | 1 |
| **TOTAL** | **35** | **15** | **13** | **7** |

**Implementation Priority:**
- **Phase 1:** All P0 stories related to inventory (15 stories)
- **Phase 2:** P0 + P1 stories related to accounting (13 stories)
- **Phase 3:** GST & compliance stories (5 stories)
- **Phase 4:** P2 and advanced features (7 stories)

---

# PART 3: TECHNICAL ARCHITECTURE

## 3.1 Technology Stack

### Frontend

**Framework:** Next.js 14+ with App Router
- **Rationale:** Server Components for performance, built-in API routes, excellent TypeScript support
- **Key Features Used:**
  - React Server Components (RSC) for reduced JavaScript bundle
  - Server Actions for forms and mutations
  - Streaming SSR for progressive page loading
  - Optimistic updates for instant feedback
  - Edge runtime where applicable

**Language:** TypeScript (Strict mode)
- Type safety across entire codebase
- Reduced runtime errors
- Better IDE autocomplete and refactoring

**UI Framework:** Tailwind CSS + shadcn/ui
- Utility-first CSS for rapid development
- Pre-built accessible components from shadcn
- Consistent design system
- Dark mode support (future)

**State Management:**
- Server state: React Query / TanStack Query
- Client state: React Context + Zustand (minimal)
- Form state: React Hook Form with Zod validation

**Charts & Visualizations:** Recharts
- Dashboard widgets
- Financial reports
- Trend graphs

### Backend

**Primary Backend:** Supabase
- **PostgreSQL 15+** as database
- **Row Level Security (RLS)** for multi-tenancy
- **Realtime subscriptions** for live updates
- **Edge Functions** for serverless compute
- **Supabase Auth** for authentication
- **Supabase Storage** for file uploads

**Rationale:**
- Mature open-source project (not vendor lock-in)
- PostgreSQL's ACID compliance critical for accounting
- RLS eliminates need for middleware authorization
- Self-hostable if needed in future

**Alternative Considered:** Custom Node.js + PostgreSQL
- Rejected: More maintenance overhead
- Supabase provides batteries-included solution

### Database

**Engine:** PostgreSQL 15+

**Key Features Used:**
- JSONB for flexible nested data (address, variants)
- Array types for tags, image URLs
- UUID for primary keys (better distribution)
- Triggers for automatic created_at/updated_at
- Views for complex report queries
- Functions for business logic (FIFO calculation)
- Transactions for voucher double-entry integrity

**Database Schema Management:**
- Migration-based (Supabase CLI)
- Version controlled migrations
- Rollback support

### Deployment & Hosting

**Primary Hosting:** Vercel
- Seamless Next.js deployment
- Automatic preview deployments per PR
- Edge Network (CDN) for fast global access
- Serverless functions (Next.js API routes)

**Database Hosting:** Supabase Cloud
- Managed PostgreSQL
- Automatic backups (daily)
- Point-in-time recovery
- Connection pooling (PgBouncer)

**Alternative for Enterprise:** Self-hosted
- Next.js on any Node.js host
- Supabase can be self-hosted (Docker)
- PostgreSQL on dedicated server

### Authentication & Authorization

**Authentication:** Supabase Auth
- Magic link (email)
- OTP (phone SMS) - optional
- Google OAuth - optional
- Password-based (with strong password policy)

**Session Management:**
- JWT tokens (short-lived: 1 hour)
- Refresh token (long-lived: 30 days)
- Automatic refresh on activity

**Authorization:** Row Level Security (RLS)
- Every table has RLS policy
- Policy enforces: `company_id = auth.jwt() -> company_id`
- Users see only their company's data
- No data leakage possible (database-enforced)

### File Storage

**Storage:** Supabase Storage
- QR code images (PNG)
- Invoice PDFs
- Product images (catalog)
- Document attachments (voucher supporting docs)

**Organization:**
- Buckets: `qrcodes`, `invoices`, `products`, `documents`
- RLS policies on storage buckets
- Public access for catalog images only

### API Integration (External)

**GST Network (GSTN):**
- E-invoice generation (IRN)
- E-way bill generation
- GSTR-2B download

**Implementation:**
- Next.js API routes as proxy
- Credentials stored in Supabase secrets/environment variables
- Retry logic with exponential backoff
- Error logging

**SMS/WhatsApp:**
- Twilio or MSG91 for SMS
- WhatsApp Business API for order notifications
- Template-based messages

### Mobile Support

**Approach:** Progressive Web App (PWA)
- Responsive web app works on mobile browsers
- Install as PWA (Add to Home Screen)
- Offline support via Service Worker (Phase 4)
- Camera API for QR scanning

**Rationale:**
- Single codebase (vs native iOS + Android apps)
- Instant updates (no app store approval)
- Lower development cost

**Native App (Future consideration):**
- React Native or Flutter if needed
- Same backend (Supabase APIs)

---

## 3.2 Architecture Layers

### Layer 1: Tally Foundation (Accounting Base)

**Purpose:** Replicate Tally's accounting structure exactly

**Components:**

1. **Chart of Accounts**
   - 28 predefined groups (Tally standard)
   - Unlimited custom groups
   - Hierarchical structure (group under group)
   - Ledgers under groups

2. **Voucher System**
   - 24 predefined voucher types (Tally standard)
   - Custom voucher types
   - Double-entry bookkeeping enforcement
   - Voucher numbering (auto/manual with prefixes)

3. **Double-Entry Enforcement**
   - Every voucher has entries in `voucher_ledger_entries`
   - Database constraint: `SUM(amount) = 0` for each voucher
   - No voucher can be saved if Dr ≠ Cr

4. **Financial Reports**
   - Trial Balance (real-time)
   - Profit & Loss Statement
   - Balance Sheet
   - All derived from voucher ledger entries

**Data Flow:**
```
User creates Sales Voucher
    ↓
System creates voucher record
    ↓
System creates voucher_ledger_entries:
  - Dr: Customer Ledger (+₹10,000)
  - Cr: Sales Ledger (-₹10,000)
    ↓
Trial Balance auto-updates
```

---

### Layer 2: Operational Tracking (Fabric-Specific)

**Purpose:** Track individual rolls and fabric-specific attributes

**Components:**

1. **Stock Units (Individual Rolls)**
   - Each roll = one stock_unit record
   - QR code assigned
   - Tracks: Product, Godown, Quantity, Quality Grade, Status
   - Status workflow: Available → Reserved → Dispatched

2. **QR Code System**
   - Generated on stock receipt
   - Format: `{company_id}-{product_id}-{sequential_no}`
   - Printed as label (thermal printer or laser)
   - Scanned during dispatch

3. **Barcode Batches**
   - Groups of QR codes generated together
   - Useful for bulk operations

4. **Quality Grading**
   - A/B/C grades
   - Different pricing by grade
   - Grade-specific dispatch

5. **Wastage Tracking**
   - Recorded during dispatch or job work
   - Categorized by reason (cutting, damage, etc.)
   - Accounting entry: Dr Wastage Expense, Cr Inventory

**Data Flow:**
```
Warehouse receives 100 rolls
    ↓
Creates Receipt Voucher (100 rolls)
    ↓
System generates 100 stock_units
    ↓
System generates 100 QR codes
    ↓
Prints QR labels
    ↓
Staff pastes labels on rolls
    ↓
Rolls now trackable individually
```

---

### Layer 3: Transaction Management

**Purpose:** Handle business workflows (Orders, Job Works)

**Components:**

1. **Sales Orders**
   - Customer inquiry → Quote → Confirmed order
   - Tracks items, quantities, rates
   - Status: Draft → Confirmed → Partial Dispatch → Fully Dispatched
   - Links to vouchers for fulfillment

2. **Job Works**
   - Send fabric to job worker (dyeing, printing, etc.)
   - Track: Sent quantity, Expected completion, Received quantity
   - Handles wastage (sent 100m, received 98m)
   - Links to vouchers:
     - Outward: Delivery Note (stock out)
     - Inward: Receipt Note (stock in)

3. **Order Fulfillment**
   - Sales order → Pick stock units → Create delivery voucher → Auto-generate invoice
   - Stock units status changes: Available → Dispatched

**Data Flow:**
```
Customer orders 50 rolls
    ↓
Create sales_order
    ↓
Warehouse picks 50 rolls (scans QR codes)
    ↓
Create delivery voucher (links to sales_order)
    ↓
Create voucher_inventory_entries (50 rolls out)
    ↓
Mark stock_units as dispatched
    ↓
Auto-create Sales Voucher
    ↓
Auto-create voucher_ledger_entries (Dr Customer, Cr Sales)
    ↓
Generate PDF invoice, send via WhatsApp
```

---

### Layer 4: Presentation Layer (UI/UX)

**Purpose:** User interfaces for all personas

**Components:**

1. **Dashboard (Owner)**
   - Key metrics: Outstanding, Stock value, Today's sales
   - Quick actions: Create order, Check stock
   - Alerts: Low stock, Overdue payments

2. **Voucher Entry Screens**
   - Tally-like interface (keyboard shortcuts)
   - F5: Payment, F6: Receipt, F7: Journal, F8: Sales, F9: Purchase
   - Tab navigation between fields
   - Auto-suggestions for ledgers, stock items

3. **Master Management**
   - CRUD for: Ledgers, Stock Items, Godowns
   - Bulk import from CSV
   - Tally XML import

4. **Reports**
   - Financial: Trial Balance, P&L, Balance Sheet
   - GST: GSTR-1, GSTR-2B, GSTR-3B
   - Inventory: Stock summary, Valuation, Movement
   - Audit: Audit trail, Modification log

5. **Mobile App (PWA)**
   - Stock receipt with QR generation
   - Stock dispatch with QR scanning
   - Pending orders list
   - Stock search and location

**Design Principles:**
- **Familiar to Tally users:** Similar navigation, keyboard shortcuts
- **Mobile-first for warehouse:** Large touch targets, camera integration
- **Fast:** < 2 second page loads
- **Accessible:** WCAG AA compliance

---

## 3.3 Security & Multi-Tenancy

### Multi-Tenancy Strategy: Row-Level Security (RLS)

**Approach:** Shared database, data isolation via RLS policies

**How It Works:**

Every table has a `company_id` foreign key referencing `companies(id)`.

RLS policy enforces:
```sql
CREATE POLICY "Users can only see their company data"
ON stock_items
FOR ALL
USING (company_id = auth.jwt() -> 'app_metadata' ->> 'company_id');
```

**Benefits:**
- Database-enforced isolation (no application logic can bypass)
- Simpler application code (no WHERE company_id filters needed)
- No risk of data leakage

**Limitations:**
- Slight performance overhead (negligible for <1000 companies)
- All tables must have company_id column

### Authentication Security

**Password Policy:**
- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 number
- Password hashing: bcrypt (Supabase default)
- Rate limiting: Max 5 failed attempts, then 15-minute lockout

**Session Security:**
- JWT tokens signed with secret key
- Tokens stored in httpOnly cookies (not localStorage, prevents XSS)
- CSRF protection via SameSite=Lax

**Magic Links:**
- One-time use
- Expire after 1 hour
- Rate limited: Max 3 per hour per email

### Data Security

**Encryption:**
- Data at rest: Database-level encryption (Supabase default)
- Data in transit: HTTPS/TLS 1.3
- Sensitive fields (PAN, bank account): Consider column-level encryption if needed (Phase 4)

**Backup:**
- Daily automated backups (Supabase)
- Retention: 30 days
- Point-in-time recovery available

**Audit Logging:**
- All vouchers: Created by, Modified by, Timestamps
- Immutable modification log
- IP address logging (future)

### API Security

**Rate Limiting:**
- Anonymous requests: 10 req/sec per IP
- Authenticated requests: 100 req/sec per user
- Prevents DDoS and abuse

**Input Validation:**
- Zod schemas for all API inputs
- SQL injection: Protected by Supabase prepared statements
- XSS: React escapes by default, sanitize user HTML if needed

**CORS Policy:**
- Allow only application domain
- No wildcard CORS origins

### Role-Based Access Control (RBAC)

**Roles:**

1. **Admin**
   - Full access to all features
   - Can create users
   - Can modify/delete vouchers

2. **Staff**
   - Can create vouchers
   - Cannot delete vouchers
   - Limited report access

**Implementation:**
- User role stored in `users.role` column
- RLS policies check role:
  ```sql
  CREATE POLICY "Only admin can delete vouchers"
  ON vouchers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
  ```

### Compliance & Data Privacy

**GDPR Considerations (if applicable):**
- Right to erasure: Soft delete users (mark inactive)
- Data export: Provide Tally XML export
- Data processing agreement with Supabase

**Indian Data Laws:**
- Data stored in India region if available (Supabase Asia Pacific)
- Consent for SMS/WhatsApp marketing

**Accounting Compliance:**
- Audit trail: Immutable log of all changes (Companies Act 2013)
- Data retention: Financial data retained for 7 years (tax law)

---

## 3.4 Scalability Considerations

### Database Scaling

**Current:** Single PostgreSQL instance (Supabase)
- Supports: 100+ concurrent companies
- Up to 10,000 users total
- Millions of vouchers

**Future Scaling:**
- Read replicas for reports (heavy queries)
- Connection pooling (PgBouncer, enabled by default)
- Partitioning large tables by date (vouchers, voucher_entries)

### Application Scaling

**Horizontal Scaling:** Vercel automatically scales Next.js
- Serverless functions scale with traffic
- No manual intervention needed

**Caching Strategy:**
- Static pages: Next.js static generation
- API responses: React Query with stale-while-revalidate
- CDN: Vercel Edge Network for global caching

### File Storage Scaling

**Current:** Supabase Storage
- Handles: 100,000s of files
- CDN-backed

**Future:**
- Move to Cloudflare R2 or AWS S3 if needed
- Implement image optimization (next/image)

---

## 3.5 Development Workflow

### Version Control

**Git Strategy:**
- Main branch: Production-ready code
- Development branch: Staging environment
- Feature branches: `feature/voucher-entry`, `fix/qr-scanning`
- Pull request required for merging to main

### Environments

1. **Local Development**
   - Docker Compose for local Supabase
   - Seed data for testing

2. **Staging**
   - Vercel preview deployment
   - Supabase staging project
   - Used for QA testing

3. **Production**
   - Vercel production
   - Supabase production project
   - Requires approval for deployment

### CI/CD Pipeline

**GitHub Actions:**
- On PR: Lint, type-check, unit tests
- On merge to main: Deploy to production (Vercel auto-deploys)
- Database migrations: Manual approval step

### Testing Strategy

**Unit Tests:** Vitest
- Business logic functions
- Utility functions (date formatting, GST calculation)

**Integration Tests:** Playwright
- Critical user flows (voucher creation, order fulfillment)
- Run in staging environment

**Manual Testing:**
- User acceptance testing by stakeholders
- Pilot users test in production with demo company

---

## 3.6 Monitoring & Observability

### Error Tracking

**Tool:** Sentry
- Frontend errors (React component crashes)
- API errors (Next.js API routes)
- Database errors (via Supabase logs)

**Alerts:**
- Email to dev team on critical errors
- Slack notification for high error rates

### Performance Monitoring

**Tool:** Vercel Analytics
- Page load times
- Core Web Vitals
- Largest Contentful Paint (LCP), First Input Delay (FID)

**Database Performance:**
- Supabase dashboard: Query performance
- Slow query log (>1 second queries)

### Application Logging

**Logs Captured:**
- API requests (endpoint, user, timestamp)
- Voucher creation (user, voucher type, amount)
- Tally import/export (success/failure)

**Log Retention:** 30 days

### Uptime Monitoring

**Tool:** Better Uptime or UptimeRobot
- Ping production URL every 5 minutes
- Alert if down for >2 minutes

---

# PART 4: COMPLETE DATABASE SCHEMA

## 4.1 Database Design Principles

### Design Philosophy

**1. Tally Compatibility First**
- Table and column names mirror Tally's terminology
- Group hierarchy matches Tally's 28 standard groups
- Voucher types identical to Tally's 24 types
- Data structure allows lossless import/export

**2. PostgreSQL Best Practices**
- UUID primary keys for better distribution and scalability
- Foreign key constraints for referential integrity
- Check constraints for data validation
- Triggers for automatic timestamps and audit logging
- Indexes on frequently queried columns

**3. Multi-Tenancy via Row-Level Security**
- Every table has `company_id` column
- RLS policies enforce data isolation
- No cross-company data leakage possible

**4. Audit Trail Built-In**
- Every transaction table tracks: created_by, created_at, updated_by, updated_at
- Immutable modification log
- Meets Companies Act 2013 requirements

### Schema Statistics

| Category | Count |
|----------|-------|
| **Total Tables** | 19 |
| **Core/Foundation Tables** | 3 |
| **Accounting Tables** | 6 |
| **Inventory Tables** | 5 |
| **Transaction Tables** | 3 |
| **Supporting Tables** | 2 |
| **Total Columns** | ~180 |
| **Foreign Key Relationships** | 24 |
| **Indexes (Custom)** | 18 |

---

## 4.2 Core Foundation Tables

### Table 1: companies

**Purpose:** Multi-tenant company master table

**Schema:**

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  gstin VARCHAR(15) UNIQUE,
  pan VARCHAR(10),
  cin VARCHAR(21),

  -- Contact Information
  email VARCHAR(255),
  phone VARCHAR(20),
  website VARCHAR(255),

  -- Address (JSONB for flexibility)
  address JSONB, -- {line1, line2, city, state, pincode, country}

  -- Financial Year Settings
  financial_year_start DATE NOT NULL DEFAULT '2024-04-01',
  books_beginning_from DATE NOT NULL,

  -- Tally Import Metadata
  tally_company_name VARCHAR(255),
  last_tally_import_at TIMESTAMP,

  -- Settings
  settings JSONB DEFAULT '{}', -- {currency: "INR", decimal_places: 2, date_format: "DD/MM/YYYY"}

  -- Status
  is_active BOOLEAN DEFAULT true,
  subscription_plan VARCHAR(50) DEFAULT 'trial', -- trial, basic, professional, enterprise
  subscription_expires_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_companies_gstin ON companies(gstin);
CREATE INDEX idx_companies_active ON companies(is_active);

-- RLS Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their company"
ON companies FOR SELECT
USING (id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

**Notes:**
- `address` is JSONB to support various address formats across India
- `settings` stores company-specific preferences
- `subscription_plan` determines feature access

---

### Table 2: users

**Purpose:** Application users with role-based access

**Schema:**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id), -- Links to Supabase Auth
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Profile
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),

  -- Role & Access
  role VARCHAR(50) NOT NULL DEFAULT 'staff', -- admin, staff, warehouse, accountant
  permissions JSONB DEFAULT '{}', -- Granular permissions if needed

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,

  -- Preferences
  preferences JSONB DEFAULT '{}', -- {theme: "light", language: "en", notifications: true}

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see users in their company"
ON users FOR SELECT
USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

**Notes:**
- `id` references Supabase auth.users table
- Role-based access: admin (full), staff (create vouchers), warehouse (inventory only), accountant (reports only)

---

### Table 3: godowns

**Purpose:** Warehouse/Storage locations (Tally: Godowns)

**Schema:**

```sql
CREATE TABLE godowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50), -- Short code for quick entry
  description TEXT,

  -- Location
  address JSONB,
  gps_coordinates JSONB, -- {lat: 19.123, lng: 73.456}

  -- Settings
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Staff Assignment
  manager_user_id UUID REFERENCES users(id),

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),

  UNIQUE(company_id, name)
);

-- Indexes
CREATE INDEX idx_godowns_company ON godowns(company_id);
CREATE INDEX idx_godowns_active ON godowns(company_id, is_active);

-- RLS Policies
ALTER TABLE godowns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see godowns in their company"
ON godowns FOR ALL
USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

---

## 4.3 Accounting Tables (Tally Foundation)

### Table 4: groups

**Purpose:** Chart of Accounts - Group hierarchy (Tally: Groups)

**Schema:**

```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Hierarchy
  parent_group_id UUID REFERENCES groups(id), -- NULL for top-level groups

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  alias VARCHAR(255),

  -- Tally Standard Groups (28 predefined)
  is_system_group BOOLEAN DEFAULT false, -- true for Tally's 28 groups
  tally_group_name VARCHAR(255), -- Maps to Tally standard name

  -- Classification
  nature VARCHAR(50) NOT NULL, -- Asset, Liability, Income, Expense
  affects_gross_profit BOOLEAN DEFAULT false,

  -- Behavior
  is_revenue BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),

  UNIQUE(company_id, name)
);

-- Indexes
CREATE INDEX idx_groups_company ON groups(company_id);
CREATE INDEX idx_groups_parent ON groups(parent_group_id);
CREATE INDEX idx_groups_nature ON groups(company_id, nature);

-- RLS Policies
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see groups in their company"
ON groups FOR ALL
USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

**Predefined Groups (Seeded on Company Creation):**

The 28 standard Tally groups will be created automatically:

```
Assets:
- Current Assets
  - Bank Accounts
  - Cash in Hand
  - Deposits (Assets)
  - Loans & Advances (Assets)
  - Stock in Hand
  - Sundry Debtors
- Fixed Assets
- Investments

Liabilities:
- Current Liabilities
  - Duties & Taxes
  - Provisions
  - Sundry Creditors
- Loans (Liability)
- Capital Account

Income:
- Direct Income
- Indirect Income

Expenses:
- Direct Expenses
- Indirect Expenses
```

---

### Table 5: ledgers

**Purpose:** Individual accounts under groups (Tally: Ledgers)

**Schema:**

```sql
CREATE TABLE ledgers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Hierarchy
  group_id UUID NOT NULL REFERENCES groups(id),

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  alias VARCHAR(255),
  code VARCHAR(50), -- For quick entry

  -- Contact Info (for Sundry Debtors/Creditors)
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address JSONB,

  -- GST Details
  gstin VARCHAR(15),
  state_code VARCHAR(2), -- For CGST/SGST calculation
  pan VARCHAR(10),

  -- Banking Details (for Party ledgers)
  bank_account_number VARCHAR(50),
  bank_ifsc VARCHAR(11),
  bank_name VARCHAR(255),

  -- Credit Management
  credit_limit DECIMAL(15, 2),
  credit_period_days INTEGER, -- Payment terms

  -- Opening Balance
  opening_balance DECIMAL(15, 2) DEFAULT 0,
  opening_balance_type VARCHAR(2) CHECK (opening_balance_type IN ('Dr', 'Cr')),

  -- Bill-wise Details (for receivables/payables)
  maintain_bill_wise BOOLEAN DEFAULT false,

  -- Cost Centers (future)
  track_cost_centers BOOLEAN DEFAULT false,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),

  UNIQUE(company_id, name)
);

-- Indexes
CREATE INDEX idx_ledgers_company ON ledgers(company_id);
CREATE INDEX idx_ledgers_group ON ledgers(group_id);
CREATE INDEX idx_ledgers_gstin ON ledgers(gstin);
CREATE INDEX idx_ledgers_active ON ledgers(company_id, is_active);

-- RLS Policies
ALTER TABLE ledgers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see ledgers in their company"
ON ledgers FOR ALL
USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

---

### Table 6: voucher_types

**Purpose:** Voucher type master (Tally: 24 standard voucher types)

**Schema:**

```sql
CREATE TABLE voucher_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Basic Info
  name VARCHAR(100) NOT NULL,
  abbreviation VARCHAR(20),

  -- Tally Standard Types
  is_system_type BOOLEAN DEFAULT false, -- true for Tally's 24 types
  tally_voucher_type VARCHAR(50), -- payment, receipt, journal, sales, purchase, etc.

  -- Numbering
  prefix VARCHAR(20), -- e.g., "INV-", "PMT-"
  starting_number INTEGER DEFAULT 1,
  suffix VARCHAR(20),
  number_method VARCHAR(20) DEFAULT 'auto', -- auto, manual

  -- Classification
  category VARCHAR(50) NOT NULL, -- accounting, inventory, order
  affects_stock BOOLEAN DEFAULT false,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(company_id, name)
);

-- Indexes
CREATE INDEX idx_voucher_types_company ON voucher_types(company_id);

-- RLS Policies
ALTER TABLE voucher_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see voucher types in their company"
ON voucher_types FOR ALL
USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

**Predefined Voucher Types (Seeded):**

```
Accounting:
- Payment (F5)
- Receipt (F6)
- Journal (F7)
- Contra
- Credit Note
- Debit Note

Inventory:
- Sales (F8)
- Purchase (F9)
- Sales Order
- Purchase Order
- Delivery Note
- Receipt Note
- Stock Journal
- Physical Stock

Mixed:
- Sales Return
- Purchase Return
```

---

### Table 7: vouchers

**Purpose:** Main voucher/transaction table (Tally: Vouchers)

**Schema:**

```sql
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Type & Number
  voucher_type_id UUID NOT NULL REFERENCES voucher_types(id),
  voucher_number VARCHAR(100) NOT NULL,
  voucher_date DATE NOT NULL,

  -- Reference
  ref_number VARCHAR(100), -- Customer PO number, Invoice ref, etc.
  ref_date DATE,

  -- Parties (if applicable)
  party_ledger_id UUID REFERENCES ledgers(id), -- Customer/Vendor

  -- Amounts
  total_amount DECIMAL(15, 2) NOT NULL,

  -- Narration
  narration TEXT,

  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, posted, cancelled
  is_cancelled BOOLEAN DEFAULT false,
  cancelled_reason TEXT,
  cancelled_at TIMESTAMP,
  cancelled_by UUID REFERENCES users(id),

  -- Links
  sales_order_id UUID, -- Reference to sales_orders (if applicable)
  job_work_id UUID, -- Reference to job_works (if applicable)

  -- GST E-Invoice
  irn VARCHAR(64), -- Invoice Reference Number from GSTN
  ack_no VARCHAR(20), -- Acknowledgement number
  ack_date TIMESTAMP,
  qr_code_url TEXT,

  -- E-Way Bill
  ewb_no VARCHAR(12),
  ewb_date DATE,
  ewb_valid_till DATE,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),

  UNIQUE(company_id, voucher_type_id, voucher_number)
);

-- Indexes
CREATE INDEX idx_vouchers_company ON vouchers(company_id);
CREATE INDEX idx_vouchers_type ON vouchers(voucher_type_id);
CREATE INDEX idx_vouchers_date ON vouchers(voucher_date);
CREATE INDEX idx_vouchers_party ON vouchers(party_ledger_id);
CREATE INDEX idx_vouchers_status ON vouchers(company_id, status);
CREATE INDEX idx_vouchers_sales_order ON vouchers(sales_order_id);

-- RLS Policies
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see vouchers in their company"
ON vouchers FOR ALL
USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

---

### Table 8: voucher_ledger_entries

**Purpose:** Double-entry accounting entries (Tally: Ledger Entries)

**Schema:**

```sql
CREATE TABLE voucher_ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Ledger
  ledger_id UUID NOT NULL REFERENCES ledgers(id),

  -- Amount (positive = debit, negative = credit)
  amount DECIMAL(15, 2) NOT NULL,
  entry_type VARCHAR(2) NOT NULL CHECK (entry_type IN ('Dr', 'Cr')),

  -- Bill-wise details (for receivables/payables)
  bill_ref_number VARCHAR(100),
  bill_ref_date DATE,
  bill_due_date DATE,

  -- GST Details (for tax ledgers)
  taxable_amount DECIMAL(15, 2),
  gst_rate DECIMAL(5, 2),
  cgst_amount DECIMAL(15, 2),
  sgst_amount DECIMAL(15, 2),
  igst_amount DECIMAL(15, 2),

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vle_voucher ON voucher_ledger_entries(voucher_id);
CREATE INDEX idx_vle_ledger ON voucher_ledger_entries(ledger_id);
CREATE INDEX idx_vle_company ON voucher_ledger_entries(company_id);

-- Constraint: Sum of entries must be 0 (Dr = Cr)
-- This is validated at application level before voucher save

-- RLS Policies
ALTER TABLE voucher_ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see entries in their company"
ON voucher_ledger_entries FOR ALL
USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

---

### Table 9: voucher_inventory_entries

**Purpose:** Stock item entries in vouchers (Tally: Inventory Entries)

**Schema:**

```sql
CREATE TABLE voucher_inventory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Stock Item
  stock_item_id UUID NOT NULL REFERENCES stock_items(id),
  godown_id UUID REFERENCES godowns(id),

  -- Quantity
  quantity DECIMAL(15, 3) NOT NULL,
  rate DECIMAL(15, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL, -- meter, kg, piece, etc.

  -- Entry Type
  entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('inward', 'outward')),

  -- Amount
  amount DECIMAL(15, 2) NOT NULL, -- quantity * rate

  -- Discount
  discount_percent DECIMAL(5, 2),
  discount_amount DECIMAL(15, 2),

  -- GST
  taxable_amount DECIMAL(15, 2),
  cgst_rate DECIMAL(5, 2),
  cgst_amount DECIMAL(15, 2),
  sgst_rate DECIMAL(5, 2),
  sgst_amount DECIMAL(15, 2),
  igst_rate DECIMAL(5, 2),
  igst_amount DECIMAL(15, 2),

  -- Total
  total_amount DECIMAL(15, 2),

  -- Attributes (fabric-specific)
  quality_grade VARCHAR(10), -- A, B, C
  attributes JSONB, -- {color, design, width, gsm, etc.}

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vie_voucher ON voucher_inventory_entries(voucher_id);
CREATE INDEX idx_vie_stock_item ON voucher_inventory_entries(stock_item_id);
CREATE INDEX idx_vie_godown ON voucher_inventory_entries(godown_id);
CREATE INDEX idx_vie_company ON voucher_inventory_entries(company_id);

-- RLS Policies
ALTER TABLE voucher_inventory_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see inventory entries in their company"
ON voucher_inventory_entries FOR ALL
USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

---

## 4.4 Inventory Tables

### Table 10: stock_items

**Purpose:** Product/Stock Item master (Tally: Stock Items)

**Schema:**

```sql
CREATE TABLE stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100), -- SKU or item code
  alias VARCHAR(255),
  description TEXT,

  -- Category
  stock_group_id UUID REFERENCES stock_groups(id), -- Similar to ledger groups

  -- Units
  base_unit VARCHAR(50) NOT NULL, -- meter, kg, piece
  alternate_units JSONB, -- [{unit: "roll", conversion_factor: 50}]

  -- Pricing
  purchase_rate DECIMAL(15, 2),
  sales_rate DECIMAL(15, 2),
  mrp DECIMAL(15, 2),

  -- Inventory Tracking
  track_individual_items BOOLEAN DEFAULT true, -- Track as stock_units (rolls)
  opening_stock DECIMAL(15, 3) DEFAULT 0,
  opening_value DECIMAL(15, 2) DEFAULT 0,
  minimum_stock_level DECIMAL(15, 3),
  reorder_quantity DECIMAL(15, 3),

  -- GST
  hsn_code VARCHAR(8),
  gst_rate DECIMAL(5, 2),

  -- Fabric-Specific Attributes
  fabric_type VARCHAR(100), -- Cotton, Polyester, Silk, etc.
  design VARCHAR(255),
  color VARCHAR(100),
  width_inch DECIMAL(6, 2),
  gsm DECIMAL(8, 2), -- Grams per square meter
  thread_count VARCHAR(50),
  finish VARCHAR(100), -- Matte, Glossy, etc.

  -- Variant Management
  has_variants BOOLEAN DEFAULT false,
  variant_attributes JSONB, -- {width: ["44\"", "58\""], finish: ["Matte", "Glossy"]}

  -- E-Commerce
  show_on_catalog BOOLEAN DEFAULT false,
  catalog_images TEXT[], -- Array of image URLs
  catalog_description TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),

  UNIQUE(company_id, name)
);

-- Indexes
CREATE INDEX idx_stock_items_company ON stock_items(company_id);
CREATE INDEX idx_stock_items_group ON stock_items(stock_group_id);
CREATE INDEX idx_stock_items_hsn ON stock_items(hsn_code);
CREATE INDEX idx_stock_items_active ON stock_items(company_id, is_active);
CREATE INDEX idx_stock_items_catalog ON stock_items(company_id, show_on_catalog);

-- RLS Policies
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see stock items in their company"
ON stock_items FOR ALL
USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

---

### Table 11: stock_units

**Purpose:** Individual roll/unit tracking with QR codes

**Schema:**

```sql
CREATE TABLE stock_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Stock Item
  stock_item_id UUID NOT NULL REFERENCES stock_items(id),

  -- QR Code
  qr_code VARCHAR(255) UNIQUE NOT NULL,
  barcode_batch_id UUID REFERENCES barcode_batches(id),

  -- Location
  godown_id UUID NOT NULL REFERENCES godowns(id),
  rack_location VARCHAR(100),

  -- Quantity
  quantity DECIMAL(15, 3) NOT NULL,
  unit VARCHAR(50) NOT NULL,

  -- Cost
  purchase_rate DECIMAL(15, 2),
  purchase_date DATE,
  supplier_ledger_id UUID REFERENCES ledgers(id),

  -- Quality
  quality_grade VARCHAR(10), -- A, B, C

  -- Attributes (variant combination or specific properties)
  attributes JSONB, -- {color: "Red", width: "58\"", design: "Floral"}

  -- Status
  status VARCHAR(50) DEFAULT 'available', -- available, reserved, dispatched, in_transit

  -- Links
  receipt_voucher_id UUID REFERENCES vouchers(id),
  dispatch_voucher_id UUID REFERENCES vouchers(id),
  sales_order_id UUID REFERENCES sales_orders(id),
  job_work_id UUID REFERENCES job_works(id),

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_stock_units_company ON stock_units(company_id);
CREATE INDEX idx_stock_units_item ON stock_units(stock_item_id);
CREATE INDEX idx_stock_units_qr ON stock_units(qr_code);
CREATE INDEX idx_stock_units_godown ON stock_units(godown_id);
CREATE INDEX idx_stock_units_status ON stock_units(company_id, status);

-- RLS Policies
ALTER TABLE stock_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see stock units in their company"
ON stock_units FOR ALL
USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

---

### Table 12: barcode_batches

**Purpose:** Batch of QR codes generated together

**Schema:**

```sql
CREATE TABLE barcode_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Batch Info
  batch_name VARCHAR(255),
  prefix VARCHAR(50),
  starting_number INTEGER,
  ending_number INTEGER,
  total_count INTEGER,

  -- Generated For
  stock_item_id UUID REFERENCES stock_items(id),
  godown_id UUID REFERENCES godowns(id),

  -- PDF Generation
  pdf_url TEXT,

  -- Status
  is_printed BOOLEAN DEFAULT false,
  printed_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_barcode_batches_company ON barcode_batches(company_id);

-- RLS Policies
ALTER TABLE barcode_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see barcode batches in their company"
ON barcode_batches FOR ALL
USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

---

### Table 13: stock_groups

**Purpose:** Stock item categorization (similar to ledger groups)

**Schema:**

```sql
CREATE TABLE stock_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Hierarchy
  parent_group_id UUID REFERENCES stock_groups(id),

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(company_id, name)
);

-- Indexes
CREATE INDEX idx_stock_groups_company ON stock_groups(company_id);
CREATE INDEX idx_stock_groups_parent ON stock_groups(parent_group_id);

-- RLS Policies
ALTER TABLE stock_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see stock groups in their company"
ON stock_groups FOR ALL
USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

---

## 4.5 Transaction Tables

### Table 14: sales_orders

**Purpose:** Sales order management (quote to invoice workflow)

**Schema:**

```sql
CREATE TABLE sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Order Info
  order_number VARCHAR(100) NOT NULL,
  order_date DATE NOT NULL,

  -- Customer
  customer_ledger_id UUID NOT NULL REFERENCES ledgers(id),

  -- Shipping Address
  shipping_address JSONB,

  -- Amounts
  subtotal DECIMAL(15, 2),
  discount_amount DECIMAL(15, 2),
  tax_amount DECIMAL(15, 2),
  total_amount DECIMAL(15, 2) NOT NULL,

  -- Payment Terms
  payment_terms VARCHAR(255),
  credit_days INTEGER,
  due_date DATE,

  -- Delivery
  expected_delivery_date DATE,
  delivery_note TEXT,

  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, confirmed, partial, completed, cancelled

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),

  UNIQUE(company_id, order_number)
);

-- Indexes
CREATE INDEX idx_sales_orders_company ON sales_orders(company_id);
CREATE INDEX idx_sales_orders_customer ON sales_orders(customer_ledger_id);
CREATE INDEX idx_sales_orders_status ON sales_orders(company_id, status);
CREATE INDEX idx_sales_orders_date ON sales_orders(order_date);

-- RLS Policies
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see sales orders in their company"
ON sales_orders FOR ALL
USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

---

### Table 15: sales_order_items

**Purpose:** Line items in sales orders

**Schema:**

```sql
CREATE TABLE sales_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Stock Item
  stock_item_id UUID NOT NULL REFERENCES stock_items(id),

  -- Quantity
  quantity DECIMAL(15, 3) NOT NULL,
  unit VARCHAR(50) NOT NULL,

  -- Pricing
  rate DECIMAL(15, 2) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,

  -- Discount
  discount_percent DECIMAL(5, 2),
  discount_amount DECIMAL(15, 2),

  -- GST
  taxable_amount DECIMAL(15, 2),
  gst_rate DECIMAL(5, 2),
  gst_amount DECIMAL(15, 2),

  -- Total
  total_amount DECIMAL(15, 2),

  -- Fulfillment
  quantity_dispatched DECIMAL(15, 3) DEFAULT 0,
  quantity_pending DECIMAL(15, 3),

  -- Attributes
  quality_grade VARCHAR(10),
  attributes JSONB,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_soi_sales_order ON sales_order_items(sales_order_id);
CREATE INDEX idx_soi_stock_item ON sales_order_items(stock_item_id);

-- RLS Policies
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see sales order items in their company"
ON sales_order_items FOR ALL
USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

---

### Table 16: job_works

**Purpose:** Job work management (dyeing, printing, embroidery)

**Schema:**

```sql
CREATE TABLE job_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Job Work Info
  job_work_number VARCHAR(100) NOT NULL,
  job_work_date DATE NOT NULL,

  -- Job Worker (Partner)
  job_worker_ledger_id UUID NOT NULL REFERENCES ledgers(id),

  -- Job Type
  job_type VARCHAR(100) NOT NULL, -- dyeing, printing, embroidery, stitching, etc.
  description TEXT,

  -- Stock Items Sent
  stock_item_id UUID NOT NULL REFERENCES stock_items(id),
  quantity_sent DECIMAL(15, 3) NOT NULL,
  unit VARCHAR(50) NOT NULL,

  -- Expected Return
  expected_quantity DECIMAL(15, 3),
  expected_completion_date DATE,

  -- Actual Return
  quantity_received DECIMAL(15, 3) DEFAULT 0,
  actual_completion_date DATE,

  -- Wastage
  wastage_quantity DECIMAL(15, 3) DEFAULT 0,
  wastage_reason TEXT,

  -- Job Work Charges
  job_work_rate DECIMAL(15, 2),
  job_work_amount DECIMAL(15, 2),

  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, sent, in_progress, completed, cancelled

  -- Links
  outward_voucher_id UUID REFERENCES vouchers(id),
  inward_voucher_id UUID REFERENCES vouchers(id),

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),

  UNIQUE(company_id, job_work_number)
);

-- Indexes
CREATE INDEX idx_job_works_company ON job_works(company_id);
CREATE INDEX idx_job_works_job_worker ON job_works(job_worker_ledger_id);
CREATE INDEX idx_job_works_status ON job_works(company_id, status);

-- RLS Policies
ALTER TABLE job_works ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see job works in their company"
ON job_works FOR ALL
USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

---

## 4.6 Supporting Tables

### Table 17: hsn_codes

**Purpose:** HSN code master for GST compliance

**Schema:**

```sql
CREATE TABLE hsn_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- HSN Code
  hsn_code VARCHAR(8) UNIQUE NOT NULL,
  description TEXT NOT NULL,

  -- GST Rates
  gst_rate DECIMAL(5, 2),
  cgst_rate DECIMAL(5, 2),
  sgst_rate DECIMAL(5, 2),
  igst_rate DECIMAL(5, 2),

  -- Additional Cess (if applicable)
  cess_rate DECIMAL(5, 2),

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_hsn_codes_code ON hsn_codes(hsn_code);

-- No RLS: HSN codes are system-wide, not company-specific
```

**Note:** This table is seeded with common textile HSN codes:
- 5407: Woven fabrics of synthetic filament yarn
- 5408: Woven fabrics of artificial filament yarn
- 5512: Woven fabrics of synthetic staple fibres
- 5801: Woven pile fabrics and chenille fabrics
- etc.

---

### Table 18: tally_import_logs

**Purpose:** Track Tally XML import operations

**Schema:**

```sql
CREATE TABLE tally_import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Import Info
  import_type VARCHAR(50) NOT NULL, -- masters, opening_balances, transactions, full
  file_name VARCHAR(255),
  file_size_kb INTEGER,

  -- Statistics
  groups_imported INTEGER DEFAULT 0,
  ledgers_imported INTEGER DEFAULT 0,
  stock_items_imported INTEGER DEFAULT 0,
  vouchers_imported INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(50) DEFAULT 'processing', -- processing, completed, failed
  error_message TEXT,
  error_details JSONB,

  -- Timing
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_seconds INTEGER,

  -- Metadata
  created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_tally_import_logs_company ON tally_import_logs(company_id);
CREATE INDEX idx_tally_import_logs_status ON tally_import_logs(status);

-- RLS Policies
ALTER TABLE tally_import_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see import logs in their company"
ON tally_import_logs FOR ALL
USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

---

### Table 19: tally_export_logs

**Purpose:** Track Tally XML export operations

**Schema:**

```sql
CREATE TABLE tally_export_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Export Info
  export_type VARCHAR(50) NOT NULL, -- masters, transactions, full
  date_from DATE,
  date_to DATE,

  -- File
  file_name VARCHAR(255),
  file_url TEXT,
  file_size_kb INTEGER,

  -- Statistics
  groups_exported INTEGER DEFAULT 0,
  ledgers_exported INTEGER DEFAULT 0,
  stock_items_exported INTEGER DEFAULT 0,
  vouchers_exported INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(50) DEFAULT 'processing', -- processing, completed, failed
  error_message TEXT,

  -- Timing
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_seconds INTEGER,

  -- Metadata
  created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_tally_export_logs_company ON tally_export_logs(company_id);
CREATE INDEX idx_tally_export_logs_status ON tally_export_logs(status);

-- RLS Policies
ALTER TABLE tally_export_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see export logs in their company"
ON tally_export_logs FOR ALL
USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

---

## 4.7 Database Views (Materialized for Performance)

### View 1: current_stock_summary

**Purpose:** Real-time stock summary by item and godown

```sql
CREATE MATERIALIZED VIEW current_stock_summary AS
SELECT
  su.company_id,
  su.stock_item_id,
  si.name AS stock_item_name,
  su.godown_id,
  g.name AS godown_name,
  su.quality_grade,
  COUNT(su.id) AS roll_count,
  SUM(su.quantity) AS total_quantity,
  si.base_unit AS unit,
  su.status
FROM stock_units su
JOIN stock_items si ON su.stock_item_id = si.id
JOIN godowns g ON su.godown_id = g.id
WHERE su.status IN ('available', 'reserved')
GROUP BY su.company_id, su.stock_item_id, si.name, su.godown_id, g.name, su.quality_grade, si.base_unit, su.status;

CREATE UNIQUE INDEX idx_current_stock_summary ON current_stock_summary(company_id, stock_item_id, godown_id, quality_grade, status);

-- Refresh strategy: Refresh after stock transactions
```

---

### View 2: ledger_balances

**Purpose:** Current balance for each ledger

```sql
CREATE MATERIALIZED VIEW ledger_balances AS
SELECT
  l.company_id,
  l.id AS ledger_id,
  l.name AS ledger_name,
  l.opening_balance,
  COALESCE(SUM(CASE WHEN vle.entry_type = 'Dr' THEN vle.amount ELSE 0 END), 0) AS total_debit,
  COALESCE(SUM(CASE WHEN vle.entry_type = 'Cr' THEN vle.amount ELSE 0 END), 0) AS total_credit,
  l.opening_balance +
    COALESCE(SUM(CASE WHEN vle.entry_type = 'Dr' THEN vle.amount ELSE -vle.amount END), 0) AS closing_balance
FROM ledgers l
LEFT JOIN voucher_ledger_entries vle ON l.id = vle.ledger_id
LEFT JOIN vouchers v ON vle.voucher_id = v.id AND v.status = 'posted'
GROUP BY l.company_id, l.id, l.name, l.opening_balance;

CREATE UNIQUE INDEX idx_ledger_balances ON ledger_balances(company_id, ledger_id);

-- Refresh strategy: Refresh after voucher posting
```

---

## 4.8 Database Functions & Triggers

### Function 1: update_modified_timestamp

**Purpose:** Automatically update updated_at column

```sql
CREATE OR REPLACE FUNCTION update_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_companies_timestamp BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_modified_timestamp();

-- Repeat for other tables: users, ledgers, stock_items, etc.
```

---

### Function 2: calculate_fifo_cost

**Purpose:** Calculate COGS using FIFO method

```sql
CREATE OR REPLACE FUNCTION calculate_fifo_cost(
  p_company_id UUID,
  p_stock_item_id UUID,
  p_quantity DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
  v_total_cost DECIMAL := 0;
  v_remaining_qty DECIMAL := p_quantity;
  v_receipt RECORD;
BEGIN
  -- Get receipt vouchers in FIFO order (oldest first)
  FOR v_receipt IN
    SELECT su.id, su.quantity, su.purchase_rate
    FROM stock_units su
    WHERE su.company_id = p_company_id
      AND su.stock_item_id = p_stock_item_id
      AND su.status = 'available'
    ORDER BY su.created_at ASC
  LOOP
    IF v_remaining_qty <= 0 THEN
      EXIT;
    END IF;

    IF v_receipt.quantity <= v_remaining_qty THEN
      v_total_cost := v_total_cost + (v_receipt.quantity * v_receipt.purchase_rate);
      v_remaining_qty := v_remaining_qty - v_receipt.quantity;
    ELSE
      v_total_cost := v_total_cost + (v_remaining_qty * v_receipt.purchase_rate);
      v_remaining_qty := 0;
    END IF;
  END LOOP;

  RETURN v_total_cost;
END;
$$ LANGUAGE plpgsql;
```

---

### Function 3: refresh_stock_summary

**Purpose:** Refresh materialized view after stock transactions

```sql
CREATE OR REPLACE FUNCTION refresh_stock_summary()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY current_stock_summary;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_stock_after_insert AFTER INSERT ON stock_units
  FOR EACH STATEMENT EXECUTE FUNCTION refresh_stock_summary();

CREATE TRIGGER refresh_stock_after_update AFTER UPDATE ON stock_units
  FOR EACH STATEMENT EXECUTE FUNCTION refresh_stock_summary();
```

---

## 4.9 Data Seeding Strategy

### Company Creation Seeds

When a new company is created, automatically seed:

1. **28 Standard Groups** (from Tally hierarchy)
2. **24 Standard Voucher Types**
3. **Default Ledgers:**
   - Cash in Hand
   - Bank Account (dummy)
   - Sales
   - Purchases
   - CGST Input/Output
   - SGST Input/Output
   - IGST Input/Output
4. **Default Godown:** "Main Warehouse"
5. **HSN Codes:** Common textile HSN codes

### Migration Scripts

Provide SQL migration files for:
- Initial schema setup
- Each subsequent schema change
- Data migration helpers

---

## 4.10 Database Performance Optimization

### Indexing Strategy

**Primary Keys:** UUID with gen_random_uuid() for even distribution
**Foreign Keys:** Indexed automatically by PostgreSQL
**Custom Indexes:** Created on frequently queried columns

### Query Optimization

1. **Use Materialized Views** for complex aggregations
2. **Partition Large Tables** (vouchers, entries) by date if needed
3. **Connection Pooling** via PgBouncer (enabled by Supabase)
4. **Query Caching** at application level (React Query)

### Backup & Recovery

- **Daily Automated Backups** (Supabase)
- **Point-in-Time Recovery** up to 30 days
- **Export to Tally** as additional backup mechanism

---

**End of PART 4: Complete Database Schema**

---

# PART 5: INVENTORY FEATURES (40 Features)

## 5.1 Feature Categories Overview

| Category | Feature Count | Priority | Phase |
|----------|--------------|----------|-------|
| **Product Master Management** | 8 | P0 | Phase 1 |
| **Warehouse & Godown Management** | 5 | P0 | Phase 1 |
| **Stock Receipt** | 6 | P0 | Phase 1 |
| **Stock Dispatch** | 6 | P0 | Phase 1 |
| **Individual Roll Tracking** | 7 | P0 | Phase 1 |
| **Stock Reports** | 5 | P0 | Phase 1 |
| **Advanced Features** | 3 | P1-P2 | Phase 2-4 |
| **Total** | **40** | | |

---

## 5.2 Product Master Management (8 Features)

### INV-001: Create Stock Item

**Description:** Add new stock items (fabric products) to inventory

**User Flow:**
1. Navigate to Inventory > Stock Items > New
2. Enter basic details: Name, Code, Description
3. Select stock group (category)
4. Set base unit (meter, kg, piece)
5. Enter purchase rate, sales rate, MRP
6. Add fabric-specific attributes: Type, Design, Color, Width, GSM, Thread count, Finish
7. Set GST: Select HSN code, GST rate auto-populated
8. Set opening stock and value
9. Set minimum stock level and reorder quantity
10. Save

**Acceptance Criteria:**
- [ ] Name is unique within company
- [ ] Base unit is mandatory
- [ ] HSN code validates against master table
- [ ] Opening stock value = Opening quantity × Rate
- [ ] Duplicate name check before save
- [ ] Audit log: Created by, Created at

**Technical Notes:**
- Table: `stock_items`
- Validation: Check duplicate names, HSN code existence
- Trigger: Create default ledger under "Stock in Hand" group

---

### INV-002: Edit Stock Item

**Description:** Modify existing stock item details

**User Flow:**
1. Search and select stock item
2. Modify editable fields
3. Save changes

**Acceptance Criteria:**
- [ ] Cannot change: Opening stock (frozen after transactions)
- [ ] Can change: Rates, attributes, minimum levels
- [ ] Audit log: Modified by, Modified at
- [ ] Confirmation prompt for rate changes

---

### INV-003: Stock Item with Variants

**Description:** Create product variants (e.g., Width: 44", 58"; Finish: Matte, Glossy)

**User Flow:**
1. Create stock item
2. Enable "Has Variants" checkbox
3. Define variant attributes: Add attribute name (Width), values (44", 58")
4. System creates variant combinations automatically
5. Each combination tracked separately in stock_units

**Acceptance Criteria:**
- [ ] Up to 3 variant attributes allowed
- [ ] Each combination gets unique identifier
- [ ] Reports show stock by variant
- [ ] Dispatch allows variant selection

**Technical Notes:**
- Stored in: `stock_items.variant_attributes` (JSONB)
- Combination tracking in: `stock_units.attributes`

---

### INV-004: Fabric-Specific Attributes

**Description:** Capture fabric industry-specific properties

**Attributes Supported:**
- Fabric Type: Cotton, Polyester, Silk, Wool, Linen, Blend
- Design: Floral, Striped, Checked, Plain, Embroidered, Printed
- Color: Free text or predefined palette
- Width (inch): 44, 58, 60, 72, etc.
- GSM (grams per square meter): Weight specification
- Thread Count: e.g., 200TC, 300TC
- Finish: Matte, Glossy, Textured

**Acceptance Criteria:**
- [ ] All fields optional but recommended
- [ ] Searchable and filterable in reports
- [ ] Displayed on QR labels
- [ ] Used in catalog display

---

### INV-005: HSN Code Assignment

**Description:** Link stock items to HSN codes for GST compliance

**User Flow:**
1. In stock item form, click "Select HSN Code"
2. Search HSN master by code or description
3. Select HSN code
4. GST rate auto-populates from HSN master
5. Can override GST rate if needed

**Acceptance Criteria:**
- [ ] HSN code validates against `hsn_codes` table
- [ ] GST rate defaults from HSN but editable
- [ ] Required for GST invoicing
- [ ] Shows in GSTR-1 HSN summary

**HSN Codes Preloaded:**
- 5407: Synthetic filament fabrics
- 5408: Artificial filament fabrics
- 5512: Synthetic staple fiber fabrics
- 5801: Pile and chenille fabrics
- [+50 more textile HSN codes]

---

### INV-006: Minimum Stock Alerts

**Description:** Get notified when stock falls below minimum level

**User Flow:**
1. Set "Minimum Stock Level" in stock item
2. Set "Reorder Quantity" (optional)
3. Dashboard shows "Low Stock" widget
4. Email/SMS alerts (configurable)

**Acceptance Criteria:**
- [ ] Dashboard widget: Items below minimum
- [ ] Red indicator on stock item list
- [ ] Optional: Email alert to admin daily
- [ ] Report: Low stock items by godown

---

### INV-007: E-Commerce Catalog Toggle

**Description:** Make products visible on e-commerce catalog

**User Flow:**
1. Edit stock item
2. Enable "Show on Catalog" checkbox
3. Upload product images (up to 5)
4. Write catalog description
5. Public URL: `{company-slug}/catalog`
6. Customers browse, submit inquiry

**Acceptance Criteria:**
- [ ] Toggle controls visibility
- [ ] Images stored in Supabase Storage
- [ ] Real-time stock availability shown
- [ ] Inquiry form captures customer details

**Technical Notes:**
- Public route (no auth required)
- RLS: Only active, catalog-enabled items shown
- Inquiry emails sent to admin

---

### INV-008: Stock Item Deactivation

**Description:** Deactivate (not delete) discontinued stock items

**User Flow:**
1. Select stock item
2. Click "Deactivate"
3. Confirmation prompt
4. Item marked inactive

**Acceptance Criteria:**
- [ ] Inactive items hidden from dropdowns
- [ ] Historical transactions preserved
- [ ] Can reactivate anytime
- [ ] Reports: Option to include/exclude inactive

---

## 5.3 Warehouse & Godown Management (5 Features)

### INV-009: Create Godown (Warehouse)

**Description:** Add warehouse/storage locations

**User Flow:**
1. Navigate to Inventory > Godowns > New
2. Enter name, code (optional short code)
3. Add description
4. Enter address (multi-line)
5. Add GPS coordinates (optional, for mobile navigation)
6. Assign manager (user)
7. Set as default godown (checkbox)
8. Save

**Acceptance Criteria:**
- [ ] Name unique within company
- [ ] At least one godown required
- [ ] Code used for quick entry in transactions
- [ ] Manager receives notifications

---

### INV-010: Multi-Godown Support

**Description:** Manage stock across multiple warehouses

**Features:**
- Each stock receipt/dispatch linked to godown
- Stock reports by godown
- Stock transfer between godowns
- Godown-wise valuation

**Acceptance Criteria:**
- [ ] Godown selection mandatory in receipts/dispatches
- [ ] Default godown auto-selected
- [ ] Stock summary: Shows quantity per godown
- [ ] Cannot dispatch from godown with zero stock

---

### INV-011: Godown Staff Assignment

**Description:** Assign warehouse manager to godown

**User Flow:**
1. Edit godown
2. Select manager from user dropdown
3. Manager sees "My Godown" dashboard
4. Receives alerts for low stock in assigned godown

**Acceptance Criteria:**
- [ ] One manager per godown
- [ ] Manager can view only assigned godown (optional RLS)
- [ ] Dashboard filters by godown

---

### INV-012: Stock Transfer Between Godowns

**Description:** Transfer stock from one warehouse to another

**User Flow:**
1. Create Stock Transfer voucher
2. Select: From Godown, To Godown
3. Add stock items and quantities
4. Can scan QR codes for specific rolls
5. Status: Draft → In Transit → Completed
6. From Godown: Stock reduced immediately
7. To Godown: Stock increased on completion

**Acceptance Criteria:**
- [ ] From Godown stock validates availability
- [ ] Status workflow tracked
- [ ] Can add transport details (vehicle, driver, date)
- [ ] Receiving godown confirms receipt (mobile app)
- [ ] Accounting entry: No ledger impact (only location change)

**User Story:** US-1.13: Stock Transfer Between Godowns

---

### INV-013: Rack/Bin Location

**Description:** Track exact location within warehouse

**User Flow:**
1. In stock receipt, enter "Rack Location" (e.g., A-12, B-05)
2. Location stored with stock_unit
3. Search: "Where is item X?" → Shows rack location
4. Mobile app: Navigate to rack (if GPS configured)

**Acceptance Criteria:**
- [ ] Free text field (flexible naming)
- [ ] Searchable in stock search
- [ ] Shows in dispatch picking list
- [ ] Optional: Photo of rack location

---

## 5.4 Stock Receipt (6 Features)

### INV-014: Purchase Receipt Voucher

**Description:** Record stock received from supplier

**User Flow:**
1. Create Receipt Note voucher (F6)
2. Select supplier ledger
3. Select godown
4. Add stock items: Item, Quantity, Rate
5. GST auto-calculated based on item HSN
6. Enter reference: Supplier invoice no., date
7. Total amount shown
8. Save: Stock increases, Accounting entries created

**Accounting Entries:**
```
Dr: Stock Item Ledger (Inventory)
Dr: CGST Input
Dr: SGST Input (or IGST)
Cr: Supplier Ledger (Payable)
```

**Acceptance Criteria:**
- [ ] Stock quantity increases in selected godown
- [ ] If track_individual_items = true, stock_units created
- [ ] If track_individual_items = false, only voucher_inventory_entries created
- [ ] Supplier outstanding increases
- [ ] GST input credit recorded

---

### INV-015: Generate QR Codes on Receipt

**Description:** Auto-generate QR codes for received rolls

**User Flow:**
1. During receipt entry, enter quantity (e.g., 100 rolls)
2. Click "Generate QR Codes"
3. System creates 100 stock_unit records
4. QR format: `{company_id}-{item_code}-{sequential_no}`
5. Generates PDF with QR labels (thermal or A4 sheet)
6. Print labels
7. Staff pastes labels on physical rolls

**Acceptance Criteria:**
- [ ] One QR per roll
- [ ] QR codes unique globally
- [ ] PDF generated with: QR code, Item name, Grade, Godown
- [ ] Batch tracking: Groups codes generated together
- [ ] Barcode scanners and mobile cameras can read QR

**Technical Notes:**
- QR Library: `qrcode` npm package
- PDF Library: `pdfkit` or `jspdf`
- Storage: Supabase Storage bucket `qrcodes/`

---

### INV-016: Quality Grade Assignment

**Description:** Assign quality grade (A/B/C) on receipt

**User Flow:**
1. Receipt voucher: For each item, select quality grade
2. Grade options: A (Premium), B (Standard), C (Seconds)
3. Grade printed on QR label
4. Different pricing by grade

**Acceptance Criteria:**
- [ ] Grade dropdown: A, B, C
- [ ] Grade stored in stock_unit.quality_grade
- [ ] Reports: Stock summary by grade
- [ ] Dispatch: Can filter by grade
- [ ] Sales: Different rates for different grades

**User Story:** US-1.8: Quality Grade Tracking

---

### INV-017: Opening Stock Entry

**Description:** Enter opening balances for existing inventory

**User Flow:**
1. Create "Physical Stock" voucher (voucher type)
2. Select date: Books Beginning From date
3. Add stock items with quantities
4. Enter cost rate (for valuation)
5. Save: Creates stock_units if tracking enabled

**Accounting Entries:**
```
Dr: Stock Item Ledger (Inventory)
Cr: Opening Stock Adjustment (Equity)
```

**Acceptance Criteria:**
- [ ] Allowed only once per item (for opening balance)
- [ ] Date must be books_beginning_from date
- [ ] Stock valuation method: Avg Cost or FIFO

---

### INV-018: Bulk Receipt via CSV Import

**Description:** Import multiple receipt entries from CSV

**User Flow:**
1. Download CSV template
2. Fill: Item Code, Quantity, Rate, Godown, Grade
3. Upload CSV
4. System validates all rows
5. Shows preview with errors (if any)
6. Confirm import
7. Multiple stock_units created

**Acceptance Criteria:**
- [ ] CSV validation: Item codes exist, Godowns exist
- [ ] Error report: Row-wise errors shown
- [ ] Atomicity: All or nothing (if one row fails, entire import fails)
- [ ] Audit log: Imported by, Count, Timestamp

---

### INV-019: Receipt from Job Worker

**Description:** Receive finished goods from job worker

**User Flow:**
1. Select job work order (shows items sent)
2. Create Receipt Note voucher linked to job work
3. Enter received quantity
4. System calculates wastage: Sent - Received
5. Wastage recorded with reason
6. Job work status: Completed

**Acceptance Criteria:**
- [ ] Links to job_works table
- [ ] Wastage entry: Dr Wastage Expense, Cr Inventory
- [ ] Job work closes when all items received
- [ ] Can receive partially (multiple receipts)

**User Story:** US-1.9: Job Work Tracking

---

## 5.5 Stock Dispatch (6 Features)

### INV-020: Delivery Note Voucher

**Description:** Record stock dispatched to customer

**User Flow:**
1. Create Delivery Note voucher (F8)
2. Select customer ledger
3. Select godown to dispatch from
4. Add stock items and quantities
5. Can scan QR codes to pick specific rolls
6. Enter vehicle details (for e-way bill)
7. Save: Stock reduces, Status changes to Dispatched
8. Option: Auto-generate Sales Invoice

**Acceptance Criteria:**
- [ ] Stock validates availability in godown
- [ ] Stock_units status: Available → Dispatched
- [ ] If linked to sales order, order status updates
- [ ] Delivery note PDF generated
- [ ] Option to send via WhatsApp to customer

---

### INV-021: QR Code Scanning for Dispatch

**Description:** Scan QR codes to pick rolls for dispatch

**User Flow:**
1. Mobile app: Open "Dispatch Order"
2. Select sales order or create new dispatch
3. Tap "Scan QR Code"
4. Camera opens, scan roll QR
5. System validates: Roll is available, Matches order item
6. Shows green tick if valid, red error if invalid
7. Running count: 5/10 rolls scanned
8. When complete, click "Confirm Dispatch"

**Acceptance Criteria:**
- [ ] Camera permissions handled
- [ ] QR decode using `html5-qrcode` library
- [ ] Validation: Roll exists, Status = available, Godown matches
- [ ] Duplicate scan: Error "Already scanned"
- [ ] Offline mode: Queue scans, sync when online (Phase 4)

**User Story:** US-1.7: QR Code Scanning for Dispatch
**User Story:** US-3.3: QR Code Dispatch Scanning

---

### INV-022: Auto-Generate Invoice on Dispatch

**Description:** Automatically create sales invoice when dispatch confirmed

**User Flow:**
1. Dispatch voucher saved
2. System prompts: "Generate Sales Invoice?"
3. Click Yes
4. Pre-fills invoice: Items, Quantities, Rates from dispatch
5. GST auto-calculated
6. Accounting entries created
7. Invoice PDF generated
8. Sends via WhatsApp/Email

**Accounting Entries:**
```
Dr: Customer Ledger (Receivable)
Cr: Sales Ledger (Revenue)
Cr: CGST Output
Cr: SGST Output (or IGST)
```

**Acceptance Criteria:**
- [ ] One dispatch = One invoice (1:1 link)
- [ ] Invoice number auto-incremented
- [ ] Rates default from stock item sales_rate
- [ ] Can edit rates before confirming
- [ ] Customer outstanding increases

**User Story:** US-1.4: Automatic Invoice on Dispatch

---

### INV-023: Wastage Recording

**Description:** Record wastage during cutting or dispatch

**User Flow:**
1. Dispatch voucher: Field "Wastage Quantity"
2. Enter wastage amount
3. Select reason: Cutting waste, Damaged, Soiled, Torn
4. Save: Wastage deducted from stock
5. Accounting entry: Dr Wastage Expense, Cr Inventory

**Acceptance Criteria:**
- [ ] Wastage reduces available stock
- [ ] Wastage report: By product, by reason, by month
- [ ] Alert if wastage exceeds threshold (e.g., 5%)
- [ ] Wastage included in COGS calculation

**User Story:** US-1.11: Wastage Recording

---

### INV-024: Dispatch to Job Worker

**Description:** Send fabric to job worker for processing

**User Flow:**
1. Create Job Work order
2. Select job worker (ledger)
3. Select items to send, quantities
4. Create Delivery Note voucher (outward)
5. Stock status: Available → In Transit (job work)
6. Job work status: Sent

**Acceptance Criteria:**
- [ ] Links to job_works table
- [ ] Stock not available for sale while at job worker
- [ ] Tracking: Job worker location, Expected return date
- [ ] Can send multiple times to same job worker

**User Story:** US-1.9: Job Work Tracking

---

### INV-025: Dispatch Against Sales Order

**Description:** Fulfill sales orders by dispatching stock

**User Flow:**
1. Open sales order (status: Confirmed)
2. Click "Create Dispatch"
3. System pre-fills items from order
4. Scan QR codes or select stock units
5. Partial dispatch allowed
6. Order status: Partial Fulfillment
7. When all dispatched: Order status: Completed

**Acceptance Criteria:**
- [ ] Links dispatch to sales_order_id
- [ ] Tracks: Quantity ordered, Quantity dispatched, Quantity pending
- [ ] Multiple dispatches per order allowed
- [ ] Sales order report: Shows fulfillment status

---

## 5.6 Individual Roll Tracking (7 Features)

### INV-026: Stock Unit Creation

**Description:** Track each roll/unit individually

**How It Works:**
- Each physical roll = one `stock_unit` record
- Assigned unique QR code
- Tracks: Godown, Quality grade, Attributes, Status

**Lifecycle:**
```
Receipt → QR Generated → Available → Scanned for Dispatch → Dispatched
```

**Acceptance Criteria:**
- [ ] stock_unit.id = UUID
- [ ] stock_unit.qr_code = Unique globally
- [ ] Status workflow: available → reserved → dispatched
- [ ] Links to vouchers: receipt_voucher_id, dispatch_voucher_id

---

### INV-027: Roll-Level Attributes

**Description:** Each roll can have unique attributes

**Use Case:** Same stock item, but different color/width variants

**Example:**
- Stock Item: "Polyester Jersey Fabric"
- Roll 1: {color: "Red", width: "58\"", grade: "A"}
- Roll 2: {color: "Blue", width: "44\"", grade: "B"}

**Attributes stored in:**
- `stock_units.attributes` (JSONB)

**Acceptance Criteria:**
- [ ] Attributes entered during receipt
- [ ] Searchable: "Find all Red, Grade A rolls"
- [ ] Dispatch: Filter by attributes
- [ ] Reports: Stock summary by attribute combination

---

### INV-028: QR Code Label Printing

**Description:** Print QR labels for pasting on rolls

**Label Contains:**
- QR Code (scannable)
- Stock Item Name
- Roll Number (sequential)
- Quality Grade
- Godown
- Date Received

**Print Options:**
1. **Thermal Printer** (2" × 1" labels)
2. **A4 Sheet** (21 labels per sheet, Avery template)

**Acceptance Criteria:**
- [ ] PDF generation: Fast (<2 seconds for 100 labels)
- [ ] Printable on any printer
- [ ] QR size: Minimum 1cm × 1cm (scannable from 30cm distance)
- [ ] Batch printing: Generate all labels for a receipt

**Technical Notes:**
- Library: `qrcode`, `pdfkit`
- Storage: Supabase Storage `qrcodes/{batch_id}.pdf`

---

### INV-029: Stock Unit Search

**Description:** Find specific rolls by scanning or searching

**Search Options:**
1. By QR Code (scan)
2. By Stock Item
3. By Godown
4. By Quality Grade
5. By Attributes (color, width, etc.)
6. By Date Received

**Mobile App Feature:**
- Search bar: Type item name
- Shows: Godown, Rack, Quantity, Grade
- "Navigate" button (if GPS enabled)

**Acceptance Criteria:**
- [ ] Search results: Real-time (< 500ms)
- [ ] Filters combinable: Item + Godown + Grade
- [ ] Mobile-responsive
- [ ] Shows only available units (not dispatched)

**User Story:** US-3.4: Stock Location Finder

---

### INV-030: Stock Unit Reservation

**Description:** Reserve rolls for confirmed orders

**User Flow:**
1. Sales order confirmed
2. System checks stock availability
3. Can reserve specific rolls
4. Reserved rolls: Status = Reserved
5. Cannot be used in other orders
6. Unreserved if order cancelled

**Acceptance Criteria:**
- [ ] Reserved stock not shown in available stock
- [ ] Reservation expires after X days (configurable)
- [ ] Manual reserve/unreserve allowed
- [ ] Report: Reserved stock by order

---

### INV-031: Stock Unit History

**Description:** Complete audit trail for each roll

**Tracks:**
- Received: Date, Voucher, Supplier, Rate, Grade
- Moved: From Godown A to Godown B, Date, User
- Reserved: For Order#, Date
- Dispatched: To Customer, Date, Voucher, Invoice

**Acceptance Criteria:**
- [ ] Immutable log
- [ ] Shows on stock unit detail page
- [ ] Export to PDF for dispute resolution
- [ ] Links to all related vouchers

---

### INV-032: Stock Unit Aging

**Description:** Track how long rolls have been in stock

**User Flow:**
1. Report: Stock Aging
2. Shows: Item, QR Code, Days in Stock
3. Filters: > 30 days, > 60 days, > 90 days
4. Color-coded: Green, Yellow, Red

**Acceptance Criteria:**
- [ ] Aging calculated: Today - Receipt Date
- [ ] Dashboard widget: Items > 90 days
- [ ] Email alert: Old stock reminder
- [ ] Helps identify slow-moving inventory

---

## 5.7 Stock Reports (5 Features)

### INV-033: Stock Summary Report

**Description:** Current stock position by item and godown

**Columns:**
- Stock Item Name
- Godown
- Quality Grade
- Roll Count
- Total Quantity
- Unit
- Purchase Rate (Avg)
- Stock Value

**Filters:**
- Stock Group
- Godown
- Grade
- Date (as on date)

**Acceptance Criteria:**
- [ ] Real-time data (or refreshed materialized view)
- [ ] Export to Excel
- [ ] Drilldown: Click item to see individual rolls
- [ ] Grand total: Stock value across all items

**Data Source:** Materialized view `current_stock_summary`

---

### INV-034: Stock Valuation Report

**Description:** Inventory valuation using FIFO or Weighted Average

**User Flow:**
1. Select date: "Stock Valuation as on 31-Mar-2024"
2. Select method: FIFO or Weighted Average
3. Generate report

**Columns:**
- Stock Item
- Opening Stock (Qty, Value)
- Purchases (Qty, Value)
- Sales (Qty, Value)
- Closing Stock (Qty, Value)
- Cost of Goods Sold (COGS)

**Acceptance Criteria:**
- [ ] FIFO: Uses `calculate_fifo_cost()` function
- [ ] Weighted Avg: (Total Value / Total Qty)
- [ ] Closing Stock = Opening + Purchases - Sales
- [ ] Matches with Stock Ledger balance in accounting
- [ ] Schedule III compliant

**User Story:** US-2.4: Stock Valuation Report

---

### INV-035: Stock Movement Report

**Description:** All inward/outward movements for a period

**Columns:**
- Date
- Voucher Type
- Voucher Number
- Party (Supplier/Customer)
- Stock Item
- Inward Qty
- Outward Qty
- Balance Qty
- Godown

**Filters:**
- Date range
- Stock Item
- Godown
- Voucher Type

**Acceptance Criteria:**
- [ ] Shows running balance
- [ ] Opening and closing balance shown
- [ ] Can filter to single item to see all movements
- [ ] Export to Excel

---

### INV-036: Low Stock Alert Report

**Description:** Items below minimum stock level

**Columns:**
- Stock Item
- Current Stock
- Minimum Level
- Deficit
- Reorder Quantity
- Last Purchase Rate

**Acceptance Criteria:**
- [ ] Dashboard widget: Count of low stock items
- [ ] Email alert: Daily (optional)
- [ ] One-click: Create purchase order

**User Story:** US-1.6: Stock Availability Before Promising

---

### INV-037: Stock Aging Report

**Description:** Inventory classified by age

**Age Buckets:**
- 0-30 days
- 31-60 days
- 61-90 days
- 90+ days

**Columns:**
- Stock Item
- Godown
- QR Code
- Receipt Date
- Days in Stock
- Quantity
- Value

**Acceptance Criteria:**
- [ ] Color-coded: Green, Yellow, Orange, Red
- [ ] Highlights slow-moving inventory
- [ ] Helps plan clearance sales
- [ ] Export to Excel

---

## 5.8 Advanced Inventory Features (3 Features)

### INV-038: Stock Audit (Physical Verification)

**Description:** Periodic physical stock verification

**User Flow:**
1. Create "Stock Audit" voucher
2. Select godown
3. For each item: Enter physically counted quantity
4. System compares with system stock
5. Shows variance: Physical - System
6. Adjustment voucher generated for differences

**Acceptance Criteria:**
- [ ] Audit date: Locks stock for that godown
- [ ] Variance report: Item-wise differences
- [ ] Adjustment: Dr/Cr Stock Adjustment account
- [ ] Audit trail: Who verified, When

---

### INV-039: Batch Expiry Tracking (Future)

**Description:** Track expiry dates for fabrics (if applicable)

**Use Case:** Some specialty fabrics have shelf life

**Fields:**
- Batch Number
- Manufacturing Date
- Expiry Date

**Acceptance Criteria:**
- [ ] Alert: Items nearing expiry (30 days before)
- [ ] FIFO dispatch: Oldest batches dispatched first
- [ ] Report: Expiry register

**Priority:** P2 (Phase 4)

---

### INV-040: Barcode Scanner Integration

**Description:** Use handheld barcode scanners for warehouse operations

**Supported Devices:**
- Bluetooth barcode scanners (Honeywell, Zebra)
- Mobile camera (via web app)

**User Flow:**
1. Pair Bluetooth scanner with mobile/tablet
2. Scan QR codes during receipt/dispatch
3. Auto-fills form fields

**Acceptance Criteria:**
- [ ] Bluetooth API compatibility
- [ ] Batch scanning: Scan multiple codes quickly
- [ ] Beep sound on successful scan
- [ ] Error sound on invalid QR

**Priority:** P1 (Phase 2)

---

## 5.9 Mobile App Features (Inventory)

### Mobile-Specific Features:

1. **Stock Receipt (Mobile)**
   - Camera QR generation
   - Print via Bluetooth printer

2. **Stock Dispatch (Mobile)**
   - Scan QR codes
   - Mark dispatch complete

3. **Stock Search (Mobile)**
   - Voice search
   - Navigation to rack location

4. **Pending Orders Dashboard**
   - My tasks: Items to pick
   - Mark tasks complete

5. **Daily Summary**
   - Today's receipts/dispatches
   - My performance metrics

**User Stories:**
- US-3.1: Mobile QR Scanning for Receipt
- US-3.2: Pending Dispatch List
- US-3.3: QR Code Dispatch Scanning
- US-3.4: Stock Location Finder
- US-3.5: Daily Stock Summary

---

## 5.10 Inventory Feature Integration Matrix

| Feature | Accounting Impact | GST Impact | Reports | Mobile | Priority |
|---------|------------------|------------|---------|--------|----------|
| Stock Receipt | Yes (Inventory Dr) | Yes (Input Credit) | Stock Summary | Yes | P0 |
| QR Generation | No | No | Barcode Batch | Yes | P0 |
| Quality Grading | No | No | Stock by Grade | Yes | P1 |
| Stock Dispatch | Yes (Inventory Cr) | Yes (Output Tax) | Stock Movement | Yes | P0 |
| Auto-Invoice | Yes (Revenue Cr) | Yes (Output Tax) | Sales Register | No | P0 |
| Wastage | Yes (Expense Dr) | No | Wastage Report | Yes | P1 |
| Job Work | Yes (Location Change) | No | Job Work Register | Yes | P1 |
| Stock Transfer | No (Location Change) | No | Transfer Register | Yes | P2 |
| Stock Audit | Yes (Adjustment) | No | Variance Report | Yes | P2 |

---

## 5.11 Inventory Data Flow

### Receipt Flow:
```
Supplier → Receipt Voucher → Stock Increases → QR Generated → Labels Printed → Pasted on Rolls
   ↓
Accounting: Dr Inventory, Cr Supplier
   ↓
GST Input Credit Recorded
```

### Dispatch Flow:
```
Customer Order → Pick Rolls → Scan QR → Dispatch Voucher → Invoice Generated → WhatsApp Sent
   ↓
Stock Decreases (Status: Dispatched)
   ↓
Accounting: Dr Customer, Cr Sales
   ↓
GST Output Tax Recorded
```

### Job Work Flow:
```
Outward → Job Worker → Processing → Inward → Wastage Recorded
   ↓
Stock Status: In Transit (job work)
   ↓
Accounting: No impact (location change only)
   ↓
On return: Wastage → Dr Expense, Cr Inventory
```

---

**End of PART 5: Inventory Features (40 Features)**

---

# PART 6: ACCOUNTING FEATURES (92 Features)

## 6.1 Feature Categories Overview

| Category | Feature Count | Priority | Phase |
|----------|--------------|----------|-------|
| **Chart of Accounts Management** | 10 | P0 | Phase 2 |
| **Voucher Entry System** | 15 | P0 | Phase 2 |
| **Accounts Receivable** | 8 | P0 | Phase 2 |
| **Accounts Payable** | 7 | P0 | Phase 2 |
| **Banking & Cash Management** | 6 | P0 | Phase 2 |
| **GST Compliance** | 12 | P0 | Phase 3 |
| **TDS/TCS Management** | 6 | P1 | Phase 3 |
| **Financial Reporting** | 10 | P0 | Phase 2 |
| **Period Closing** | 5 | P1 | Phase 2 |
| **Audit & Compliance** | 8 | P1 | Phase 4 |
| **Advanced Accounting** | 5 | P2 | Phase 4 |
| **Total** | **92** | | |

---

## 6.2 Chart of Accounts Management (10 Features)

### ACC-001: Create Group

**Description:** Create groups in chart of accounts hierarchy

**User Flow:**
1. Navigate to Accounts > Groups > New
2. Select parent group (28 predefined Tally groups available)
3. Enter group name
4. Set nature: Asset, Liability, Income, Expense
5. Toggle: Affects Gross Profit (for trading accounts)
6. Save

**Acceptance Criteria:**
- [ ] Group name unique within company
- [ ] Hierarchy: Can create sub-groups under system groups
- [ ] Nature inherited from parent if not specified
- [ ] System groups cannot be deleted
- [ ] Audit log: Created by, timestamp

**Tally 28 Standard Groups Created:**
- Assets: Current Assets, Fixed Assets, Investments
- Liabilities: Current Liabilities, Loans, Capital Account
- Income: Direct Income, Indirect Income
- Expenses: Direct Expenses, Indirect Expenses

---

### ACC-002: Create Ledger

**Description:** Create individual ledger accounts under groups

**User Flow:**
1. Navigate to Accounts > Ledgers > New
2. Enter ledger name
3. Select parent group
4. Enter contact details (if customer/vendor)
5. Enter GST details: GSTIN, State code, PAN
6. Set opening balance (Dr/Cr)
7. For customers: Set credit limit, credit period
8. Toggle: Maintain bill-wise details (for receivables/payables)
9. Save

**Acceptance Criteria:**
- [ ] Ledger name unique within company
- [ ] Group selection mandatory
- [ ] GSTIN validation: 15 characters, checksum digit
- [ ] Opening balance creates automatic journal entry
- [ ] Bill-wise required for Sundry Debtors/Creditors
- [ ] Code field for quick entry (keyboard shortcuts)

**Technical Notes:**
- Table: `ledgers`
- On save: If opening_balance > 0, create opening voucher

---

### ACC-003: Ledger Master Edit

**Description:** Modify ledger details (rates, limits, contacts)

**User Flow:**
1. Search ledger
2. Click Edit
3. Modify allowed fields
4. Cannot change: Opening balance, Group (if transactions exist)
5. Save with confirmation

**Acceptance Criteria:**
- [ ] Audit log: All changes tracked
- [ ] If GSTIN changed: Warn about past invoices
- [ ] Credit limit change: Requires approval (configurable)

---

### ACC-004: Chart of Accounts Report

**Description:** Hierarchical display of all groups and ledgers

**Display:**
- Tree view: Expandable/collapsible
- Shows: Group → Sub-groups → Ledgers
- Balance as on date
- Color-coded: Assets (green), Liabilities (red), Income/Expense (blue)

**Acceptance Criteria:**
- [ ] Drill-down: Click ledger → See vouchers
- [ ] Export to Excel with hierarchy preserved
- [ ] Print-friendly format
- [ ] Shows inactive ledgers (optional filter)

---

### ACC-005: Ledger Grouping & Categorization

**Description:** Organize ledgers by custom categories

**Features:**
- Tag ledgers: VIP Customer, Local Supplier, etc.
- Filter by tags in reports
- Bulk tagging: Select multiple ledgers

**Acceptance Criteria:**
- [ ] Tags stored as array in ledger table
- [ ] Searchable: "Show all VIP customers"
- [ ] Report: Outstanding by tag

---

### ACC-006: Duplicate Ledger Check

**Description:** Prevent duplicate customer/supplier ledgers

**How It Works:**
- On ledger creation, check: Name similarity (fuzzy match)
- If similar found: Warn "Did you mean: Mehta Fabrics?"
- Option: Create anyway or Merge

**Acceptance Criteria:**
- [ ] Fuzzy matching: Levenshtein distance < 3
- [ ] Case-insensitive check
- [ ] Checks: Name, Phone, GSTIN, PAN

---

### ACC-007: Ledger Merge

**Description:** Merge duplicate ledgers

**User Flow:**
1. Select two ledgers to merge
2. Choose primary ledger (keep this)
3. All transactions of secondary ledger moved to primary
4. Secondary ledger deactivated

**Acceptance Criteria:**
- [ ] All vouchers re-linked to primary ledger
- [ ] Outstanding balances combined
- [ ] Audit trail: Merge log maintained
- [ ] Cannot undo (show warning)

---

### ACC-008: Inactive Ledger Management

**Description:** Deactivate unused ledgers

**User Flow:**
1. Select ledger with zero balance
2. Mark as inactive
3. Hidden from dropdowns
4. Can reactivate anytime

**Acceptance Criteria:**
- [ ] Cannot deactivate if non-zero balance
- [ ] Cannot deactivate if pending orders
- [ ] Historical vouchers preserved
- [ ] Report: Inactive ledgers with last transaction date

---

### ACC-009: Mass Ledger Import

**Description:** Bulk import ledgers from CSV/Tally XML

**User Flow:**
1. Upload CSV file (Name, Group, Opening Balance, GSTIN)
2. Map columns to fields
3. Validate all rows
4. Show preview with errors
5. Confirm import

**Acceptance Criteria:**
- [ ] Validates: Group exists, GSTIN format, Duplicate names
- [ ] Creates all or nothing (atomic transaction)
- [ ] Import log: Count created, errors
- [ ] Support Tally XML format (Phase 2)

---

### ACC-010: Ledger Balance Enquiry

**Description:** Quick balance check for any ledger

**User Flow:**
1. Press shortcut: Alt+F1
2. Type ledger name (autocomplete)
3. Shows: Opening, Dr total, Cr total, Closing balance
4. Click to see detailed vouchers

**Acceptance Criteria:**
- [ ] Real-time balance (< 100ms query)
- [ ] Keyboard shortcut works globally
- [ ] Mobile-responsive popup
- [ ] Drill-down to voucher list

---

## 6.3 Voucher Entry System (15 Features)

### ACC-011: Payment Voucher (F5)

**Description:** Record cash/bank payments

**User Flow:**
1. Press F5 or click Payment
2. Select account paid from: Cash/Bank ledger
3. Add multiple payees: Ledger, Amount, Narration
4. System auto-balances: Total = Sum of all lines
5. Save: Voucher number auto-generated

**Accounting Entries:**
```
Dr: Expense/Vendor/Any Ledger
Cr: Cash/Bank Ledger
```

**Acceptance Criteria:**
- [ ] Validates: Cash/Bank has sufficient balance (optional check)
- [ ] Supports multiple ledgers in single payment
- [ ] Bill-wise selection if vendor payment
- [ ] TDS deduction if applicable (auto-calculate)
- [ ] Cheque/NEFT details: Number, Date

**User Story:** US-1.5: Cash Flow Visibility

---

### ACC-012: Receipt Voucher (F6)

**Description:** Record cash/bank receipts

**User Flow:**
1. Press F6 or click Receipt
2. Select account received in: Cash/Bank ledger
3. Add multiple payers: Customer Ledger, Amount
4. Bill-wise allocation if customer payment
5. Save

**Accounting Entries:**
```
Dr: Cash/Bank Ledger
Cr: Customer/Income Ledger
```

**Acceptance Criteria:**
- [ ] Bill-wise: Match against pending invoices
- [ ] Overpayment: Creates advance (Cr balance)
- [ ] Payment method: Cash, Cheque, NEFT, UPI
- [ ] Bank reconciliation: Mark as cleared

---

### ACC-013: Journal Voucher (F7)

**Description:** Record non-cash entries (adjustments, provisions)

**User Flow:**
1. Press F7 or click Journal
2. Add Dr entries: Ledger, Amount
3. Add Cr entries: Ledger, Amount
4. Total Dr must equal Total Cr
5. Save

**Use Cases:**
- Depreciation entry
- Provision for bad debts
- Expense accruals
- Correction entries

**Acceptance Criteria:**
- [ ] Validation: Dr total = Cr total (enforced)
- [ ] Supports multiple Dr and Cr ledgers
- [ ] Narration mandatory for audit
- [ ] Cannot post if unbalanced

---

### ACC-014: Sales Voucher (F8)

**Description:** Record sales invoices (with inventory impact)

**User Flow:**
1. Press F8 or click Sales
2. Select customer ledger
3. Add stock items: Item, Qty, Rate
4. GST auto-calculated based on customer state
5. If same state: CGST + SGST
6. If different state: IGST
7. Save: Invoice generated, Stock reduced

**Accounting Entries:**
```
Dr: Customer Ledger (Total with GST)
Cr: Sales Ledger (Taxable amount)
Cr: CGST Output
Cr: SGST Output (or IGST)
Cr: Stock Ledger (COGS)
Dr: Cost of Goods Sold Ledger (COGS)
```

**Acceptance Criteria:**
- [ ] Invoice PDF auto-generated
- [ ] E-invoice IRN generation (Phase 3)
- [ ] Links to delivery voucher if dispatched
- [ ] Bill-wise entry created for receivables

**User Story:** US-1.4: Automatic Invoice on Dispatch

---

### ACC-015: Purchase Voucher (F9)

**Description:** Record purchase invoices (with inventory impact)

**User Flow:**
1. Press F9 or click Purchase
2. Select supplier ledger
3. Add stock items received
4. GST input credit recorded
5. Save: Stock increases, Supplier payable increases

**Accounting Entries:**
```
Dr: Purchase Ledger
Dr: CGST Input
Dr: SGST Input (or IGST)
Cr: Supplier Ledger
```

**Acceptance Criteria:**
- [ ] Supplier GSTIN validated
- [ ] Stock item ledger updated
- [ ] Input credit tracked for GSTR-2B matching

---

### ACC-016: Contra Voucher

**Description:** Cash to Bank or Bank to Cash transfers

**User Flow:**
1. Click Contra voucher
2. Select: Cash deposited to Bank (or vice versa)
3. Enter amount
4. Save: Cash reduced, Bank increased

**Accounting Entries:**
```
Dr: Bank Account
Cr: Cash in Hand
```

**Acceptance Criteria:**
- [ ] Both sides must be Cash or Bank ledgers
- [ ] Instant balance update

---

### ACC-017: Credit Note Voucher

**Description:** Record sales returns or reductions

**User Flow:**
1. Create Credit Note
2. Select customer
3. Select original invoice (optional)
4. Enter items returned or reduction amount
5. Reversal GST entry

**Accounting Entries:**
```
Dr: Sales Return Ledger
Dr: CGST Output (reversal)
Dr: SGST Output (reversal)
Cr: Customer Ledger
```

**Acceptance Criteria:**
- [ ] Can link to original invoice
- [ ] Stock returns: Increase stock if goods returned
- [ ] GST reversal in GSTR-1

---

### ACC-018: Debit Note Voucher

**Description:** Record purchase returns or additions

**User Flow:**
1. Create Debit Note
2. Select supplier
3. Items returned to supplier
4. GST input credit reversal

**Accounting Entries:**
```
Dr: Supplier Ledger
Cr: Purchase Return Ledger
Cr: CGST Input (reversal)
Cr: SGST Input (reversal)
```

---

### ACC-019: Voucher Numbering

**Description:** Auto-generate voucher numbers with prefixes

**Configuration:**
- Per voucher type: Set prefix, starting number, suffix
- Examples: INV-001, PMT-2024-001, RCT-0001

**Acceptance Criteria:**
- [ ] Auto-increment by 1
- [ ] Reset yearly (optional)
- [ ] Manual override allowed for admins
- [ ] No duplicate numbers (unique constraint)

---

### ACC-020: Voucher Duplication

**Description:** Copy existing voucher as template

**User Flow:**
1. Open voucher
2. Click "Duplicate"
3. New voucher created with same ledgers/items
4. Change date, amounts
5. Save as new voucher

**Acceptance Criteria:**
- [ ] Voucher number is new
- [ ] Date defaults to today
- [ ] Reference shows: "Copied from Voucher#"

---

### ACC-021: Voucher Deletion/Cancellation

**Description:** Cancel posted vouchers (not delete)

**User Flow:**
1. Open voucher
2. Click "Cancel"
3. Enter reason (mandatory)
4. Voucher marked cancelled
5. Reversal entries created

**Acceptance Criteria:**
- [ ] Cannot delete posted vouchers
- [ ] Cancel creates reverse voucher automatically
- [ ] Original voucher preserved for audit
- [ ] Status: Cancelled, Reason, Cancelled by, Date

**User Story:** US-2.3: Audit Trail Report

---

### ACC-022: Recurring Vouchers

**Description:** Auto-create monthly recurring entries

**Use Cases:**
- Monthly rent payment
- Salary payment
- Loan EMI

**User Flow:**
1. Create template voucher
2. Set recurrence: Monthly, Quarterly, Yearly
3. Set start date, end date
4. System auto-creates vouchers on schedule

**Acceptance Criteria:**
- [ ] Auto-creation runs daily (cron job)
- [ ] Email notification: "5 vouchers created today"
- [ ] Can edit before posting

---

### ACC-023: Voucher Approval Workflow

**Description:** Require approval for vouchers above threshold

**Configuration:**
- Set approval required for: Payments > ₹50,000
- Approver: Admin role users

**User Flow:**
1. Staff creates payment voucher
2. Status: Pending Approval
3. Admin receives notification
4. Admin approves/rejects
5. If approved: Posted, If rejected: Back to draft

**Acceptance Criteria:**
- [ ] Notification via email/in-app
- [ ] Rejection requires reason
- [ ] Audit log: Approved by, Date

---

### ACC-024: Multi-Currency Support (Phase 4)

**Description:** Handle foreign currency transactions

**User Flow:**
1. Create voucher
2. Select currency: USD, EUR, etc.
3. Enter exchange rate
4. System records base currency amount

**Acceptance Criteria:**
- [ ] Exchange rate auto-fetched (API)
- [ ] Gain/Loss on realization recorded
- [ ] Reports show both currencies

**Priority:** P2 (Phase 4 - Explicit "Out of Scope" but listed for future)

---

### ACC-025: Voucher Templates

**Description:** Save frequent voucher patterns as templates

**User Flow:**
1. Create voucher (e.g., Monthly salary payment)
2. Save as template: "Salary Template"
3. Next time: Load template → Change amounts → Save

**Acceptance Criteria:**
- [ ] Templates stored per user
- [ ] Quick access: Dropdown in voucher entry
- [ ] Can share templates with team

---

## 6.4 Accounts Receivable (8 Features)

### ACC-026: Customer Outstanding Report

**Description:** View receivables from all customers

**Columns:**
- Customer Name
- Total Outstanding
- Age Buckets: 0-30, 31-60, 61-90, 90+ days
- Overdue Amount
- Last Payment Date

**Acceptance Criteria:**
- [ ] Real-time balance
- [ ] Color-coded aging (green, yellow, red)
- [ ] Dashboard widget: Top 10 overdue
- [ ] Drill-down: Click to see invoice-wise details

**User Story:** US-1.1: Real-time Customer Outstanding

---

### ACC-027: Bill-Wise Details (Receivables)

**Description:** Track invoices and payments against each customer

**How It Works:**
- Each sales invoice = one bill
- Payment receipt allocates to specific bills
- Shows: Bill Date, Due Date, Amount, Paid, Balance

**Acceptance Criteria:**
- [ ] Payment matching: Auto-match oldest bills (FIFO)
- [ ] Partial payments supported
- [ ] Advance payments: Adjusted against future invoices

---

### ACC-028: Payment Reminder Automation

**Description:** Send automated payment reminders to customers

**Configuration:**
- Schedule: 3 days after due date
- Channels: WhatsApp, SMS, Email
- Template: "Dear {Customer}, Your invoice {Invoice No} of ₹{Amount} is overdue..."

**User Flow:**
1. System checks daily: Overdue invoices
2. Sends reminders via configured channel
3. Logs: Reminder sent, Date, Channel

**Acceptance Criteria:**
- [ ] Exclude customers: Can pause reminders
- [ ] Effectiveness report: % paid within X days
- [ ] Templates customizable

**User Story:** US-1.12: Automated Payment Reminders

---

### ACC-029: Customer Statement

**Description:** Generate statement of account for customer

**Includes:**
- Opening balance
- All invoices (date, number, amount)
- All payments (date, amount, mode)
- Running balance
- Closing balance

**Acceptance Criteria:**
- [ ] Date range selection
- [ ] PDF export with company letterhead
- [ ] Email to customer directly
- [ ] Shows: Bill-wise pending invoices

---

### ACC-030: Credit Limit Management

**Description:** Set and enforce credit limits per customer

**User Flow:**
1. Ledger master: Set credit_limit = ₹5,00,000
2. When creating sales order:
   - Check: Outstanding + New Order Value
   - If exceeds limit: Warning popup
   - Can proceed with admin approval

**Acceptance Criteria:**
- [ ] Dashboard: Customers near limit (>90%)
- [ ] Alert: Credit limit exceeded
- [ ] Override: Requires admin password

**User Story:** US-1.14: Credit Limit Management

---

### ACC-031: Customer Aging Analysis

**Description:** Detailed aging report by invoice

**Age Buckets:**
- Current (0-30 days)
- 31-60 days
- 61-90 days
- 90+ days

**Shows:**
- Customer-wise subtotals
- Invoice-wise details within each bucket

**Acceptance Criteria:**
- [ ] Export to Excel
- [ ] Filter by customer, salesperson, region
- [ ] Graphical view: Pie chart by age bucket

---

### ACC-032: Customer Payment Promise Tracking

**Description:** Record promised payment dates

**User Flow:**
1. Call customer about overdue invoice
2. Customer promises: "Will pay by 15th March"
3. Record promise date in system
4. Dashboard shows: Promises due this week

**Acceptance Criteria:**
- [ ] Dashboard: Promises due today
- [ ] Follow-up alert: Promise not fulfilled
- [ ] Report: Promise vs Actual payment analysis

---

### ACC-033: Bad Debt Provision

**Description:** Provision for doubtful debts

**User Flow:**
1. End of year: Review long overdue invoices (>365 days)
2. Create provision: Dr Bad Debts Expense, Cr Provision for Bad Debts
3. If actually unrecoverable: Write-off against provision

**Acceptance Criteria:**
- [ ] Report: Aged receivables > 365 days
- [ ] Suggested provision: 50% of >365 days, 100% of >730 days
- [ ] Journal voucher for provision

---

## 6.5 Accounts Payable (7 Features)

### ACC-034: Vendor Outstanding Report

**Description:** View payables to all suppliers

**Columns:**
- Supplier Name
- Total Outstanding
- Age Buckets
- Next Due Date
- Payment Priority

**Acceptance Criteria:**
- [ ] Sorted by: Oldest first or Highest amount
- [ ] Dashboard widget: Payments due this week
- [ ] Drill-down to bill-wise details

---

### ACC-035: Bill-Wise Details (Payables)

**Description:** Track purchase invoices and payments to vendors

**How It Works:**
- Each purchase invoice = one bill
- Payment allocates to specific bills
- Shows pending bills with due dates

**Acceptance Criteria:**
- [ ] Payment scheduling: Auto-suggest bills to pay
- [ ] Early payment discount tracking
- [ ] Overdue penalty calculation (if applicable)

---

### ACC-036: Payment Scheduling

**Description:** Plan vendor payments based on cash flow

**User Flow:**
1. Report: Payments due in next 30 days
2. Filter by: Priority, Due date, Amount
3. Select bills to pay
4. Click "Schedule Payment"
5. Payment vouchers created

**Acceptance Criteria:**
- [ ] Cash flow check: Bank balance vs Scheduled payments
- [ ] Warning if insufficient funds
- [ ] Bulk payment creation

---

### ACC-037: Vendor Statement Reconciliation

**Description:** Match our records with vendor statement

**User Flow:**
1. Vendor sends monthly statement
2. Upload vendor statement (PDF/Excel)
3. System compares: Our purchases vs Vendor invoices
4. Highlights: Missing entries, Amount mismatches

**Acceptance Criteria:**
- [ ] OCR for PDF statements (Phase 4)
- [ ] Excel import with column mapping
- [ ] Reconciliation report: Matched, Unmatched

---

### ACC-038: Purchase Order Tracking

**Description:** Track POs from creation to invoice receipt

**Status Workflow:**
- Draft → Sent to Vendor → Partially Received → Fully Received → Invoiced

**User Flow:**
1. Create Purchase Order
2. Send to vendor (email)
3. As goods received: Create Receipt voucher (links to PO)
4. PO status updates automatically

**Acceptance Criteria:**
- [ ] PO vs GRN vs Invoice matching (3-way match)
- [ ] Report: Pending POs
- [ ] Email to vendor with PDF attachment

---

### ACC-039: Vendor Performance Report

**Description:** Analyze vendor reliability

**Metrics:**
- On-time delivery %
- Quality rejection %
- Average lead time
- Price competitiveness

**Acceptance Criteria:**
- [ ] Tracks: PO date, Delivery date (actual vs promised)
- [ ] Quality: If items rejected/returned
- [ ] Report: Vendor rating (1-5 stars)

---

### ACC-040: Debit Note Management

**Description:** Track debit notes issued to vendors

**Use Cases:**
- Goods returned (defective)
- Price difference claimed
- Short supply

**Acceptance Criteria:**
- [ ] Links to original purchase invoice
- [ ] Reduces vendor outstanding
- [ ] GST input credit reversal

---

## 6.6 Banking & Cash Management (6 Features)

### ACC-041: Bank Reconciliation

**Description:** Match bank statement with book entries

**User Flow:**
1. Upload bank statement (PDF/CSV)
2. System auto-matches transactions by amount, date
3. Shows: Matched, Unmatched from books, Unmatched from bank
4. Manually match remaining transactions
5. Generate Bank Reconciliation Statement (BRS)

**BRS Format:**
```
Balance as per Books: ₹1,00,000
Add: Cheques deposited not cleared: ₹20,000
Less: Cheques issued not presented: ₹15,000
Add/Less: Bank charges, Interest
Balance as per Bank: ₹1,05,000
```

**Acceptance Criteria:**
- [ ] Auto-match: 80%+ accuracy
- [ ] CSV import: SBI, HDFC, ICICI formats
- [ ] Mark transactions as "Reconciled"
- [ ] Report: Unreconciled items

**User Story:** US-2.7: Bank Reconciliation Statement

---

### ACC-042: Cheque Management (PDC)

**Description:** Track Post-Dated Cheques (received and issued)

**Cheques Received (From Customers):**
- Record: Cheque no, Date, Bank, Amount, Customer
- Status: Received → Deposited → Cleared/Bounced
- Alert: Deposit due date

**Cheques Issued (To Suppliers):**
- Record: Cheque no, Date, Bank, Amount, Supplier
- Status: Issued → Presented → Cleared
- Alert: Maintain sufficient balance

**Acceptance Criteria:**
- [ ] Dashboard: PDC Register (Received, Issued)
- [ ] Auto-update status on bank reconciliation
- [ ] Bounced cheque handling: Reverse entry, Penalty

---

### ACC-043: Cash Book

**Description:** Daily cash transactions register

**Shows:**
- Date
- Receipt: Source, Amount
- Payment: Purpose, Amount
- Running Balance

**Acceptance Criteria:**
- [ ] Opening balance = Previous day closing
- [ ] Drill-down: Click amount to see voucher
- [ ] Daily closing: Physical cash count vs Book balance

---

### ACC-044: Bank Book

**Description:** Bank-wise transaction register

**Shows:**
- Date
- Deposits (Receipts)
- Withdrawals (Payments)
- Bank Charges
- Running Balance

**Features:**
- Multiple bank accounts supported
- Filter by bank
- Export to Excel

---

### ACC-045: Petty Cash Management

**Description:** Track small cash expenses

**User Flow:**
1. Create "Petty Cash" ledger
2. Transfer from main cash: ₹10,000 (Contra voucher)
3. Record petty expenses: Tea, Stationery, etc.
4. Replenish when low

**Acceptance Criteria:**
- [ ] Separate petty cash voucher type
- [ ] Report: Petty cash summary by category
- [ ] Alert: Petty cash balance < ₹1,000

---

### ACC-046: Cash Flow Statement

**Description:** Classify cash flows by activity

**Categories:**
1. **Operating Activities:** Sales, Purchases, Expenses
2. **Investing Activities:** Fixed asset purchases/sales
3. **Financing Activities:** Loans, Capital

**Format:**
```
Cash Flow from Operations: +₹5,00,000
Cash Flow from Investing: -₹2,00,000
Cash Flow from Financing: +₹1,00,000
Net Increase in Cash: ₹4,00,000
```

**Acceptance Criteria:**
- [ ] Date range selection
- [ ] Indirect method (starting from net profit)
- [ ] Schedule III compliant

**User Story:** US-1.5: Cash Flow Visibility

---

## 6.7 GST Compliance (12 Features)

### ACC-047: GSTR-1 Generation

**Description:** Generate GSTR-1 return (outward supplies)

**Includes:**
- B2B invoices with customer GSTIN
- B2C invoices (aggregated by state)
- Credit/Debit notes
- HSN-wise summary

**User Flow:**
1. Select month: "March 2024"
2. Click "Generate GSTR-1"
3. System fetches all sales invoices
4. Validates: GSTIN, Invoice date, Amounts
5. Generates JSON file
6. Upload to GSTN portal

**Acceptance Criteria:**
- [ ] JSON format: As per GSTN API specification
- [ ] Validation: All mandatory fields present
- [ ] Error report: Missing GSTIN, Invalid invoices
- [ ] Preview before download

**User Story:** US-1.3: One-Click GST Return Preparation

---

### ACC-048: GSTR-2B Download & Matching

**Description:** Import GSTR-2B and reconcile with purchases

**User Flow:**
1. Download GSTR-2B JSON from GSTN portal
2. Upload to system
3. System compares: GSTR-2B invoices vs Purchase vouchers
4. Shows: Matched (green), Unmatched in 2B (red), Unmatched in books (amber)

**Acceptance Criteria:**
- [ ] Auto-match by: Supplier GSTIN, Invoice no, Amount
- [ ] Mismatch report: Amount difference, Missing invoices
- [ ] Action: Contact supplier for missing invoice upload

**User Story:** US-2.2: GST Reconciliation Report

---

### ACC-049: GSTR-3B Preparation

**Description:** Generate GSTR-3B return (summary return)

**Sections:**
- Outward supplies (from GSTR-1)
- Inward supplies (from GSTR-2B)
- Input Tax Credit (ITC) available
- Tax payable

**Acceptance Criteria:**
- [ ] Auto-populated from GSTR-1 and purchase data
- [ ] ITC reversal: For personal use, blocked credits
- [ ] Interest calculation if late filing
- [ ] JSON/PDF export

---

### ACC-050: E-Invoice Generation (IRN)

**Description:** Generate e-invoice via GSTN IRP

**User Flow:**
1. Create sales invoice (amount > ₹5 Cr turnover mandatory)
2. Click "Generate E-Invoice"
3. System calls GSTN IRP API
4. Receives: IRN, QR code, Signed invoice
5. IRN printed on invoice

**Acceptance Criteria:**
- [ ] API integration: GSTN IRP (Sandbox + Production)
- [ ] Retry logic: If API fails, queue for retry
- [ ] IRN storage: vouchers.irn column
- [ ] QR code on PDF invoice

**User Story:** US-1.10: E-Way Bill Generation (related)

---

### ACC-051: E-Way Bill Generation

**Description:** Generate e-way bill for goods movement

**User Flow:**
1. Delivery voucher saved
2. Click "Generate E-Way Bill"
3. Enter: Vehicle no, Transporter details
4. Calls NIC E-Way Bill API
5. Receives: EWB number, Valid till date

**Acceptance Criteria:**
- [ ] Mandatory if: Goods value > ₹50,000
- [ ] API integration: NIC E-Way Bill portal
- [ ] EWB printed with invoice
- [ ] Can update: Vehicle number for Part-B

**User Story:** US-1.10: E-Way Bill Generation

---

### ACC-052: HSN-wise Summary Report

**Description:** HSN-wise quantity and value for GSTR-1

**Columns:**
- HSN Code
- UQC (Unit Quantity Code): MTR, KGS, PCS
- Total Quantity
- Taxable Value
- Tax Amount (CGST + SGST + IGST)

**Acceptance Criteria:**
- [ ] Auto-grouped by HSN code
- [ ] Required for GSTR-1 (if turnover > ₹5 Cr)
- [ ] Export to Excel

---

### ACC-053: GST Rate Master

**Description:** Manage GST rates for different products/services

**Predefined Rates:**
- 0% (Exempted goods)
- 5% (Essential items)
- 12% (Processed foods)
- 18% (Most goods/services)
- 28% (Luxury items)

**Acceptance Criteria:**
- [ ] HSN code → GST rate mapping
- [ ] Rate changes: Historical tracking
- [ ] Stock items inherit rate from HSN

---

### ACC-054: GST Notices Management

**Description:** Track GST notices from department

**User Flow:**
1. Receive notice from GST department
2. Record: Notice no, Date, Section, Description
3. Upload PDF
4. Set response due date
5. Mark status: Open → Response Submitted → Closed

**Acceptance Criteria:**
- [ ] Alert: Response due date approaching
- [ ] Document attachment
- [ ] Status tracking

---

### ACC-055: Input Tax Credit (ITC) Register

**Description:** Track GST input credit available and utilized

**Columns:**
- Month
- ITC Available (from purchases)
- ITC Reversed (blocked credits, personal use)
- ITC Utilized (against output tax)
- ITC Carried Forward

**Acceptance Criteria:**
- [ ] Real-time ITC balance
- [ ] Rule-based reversal: 17(5) blocked credits
- [ ] Report: ITC aging (if not utilized for 1 year)

---

### ACC-056: Reverse Charge Mechanism

**Description:** Handle RCM purchases (where buyer pays GST)

**Use Cases:**
- Services from unregistered vendors
- Import of services
- Specified goods/services (Section 9(3))

**Accounting:**
```
Dr: Purchase Ledger
Dr: CGST Input (RCM)
Dr: SGST Input (RCM)
Cr: Supplier Ledger
Cr: CGST Output (RCM) [Liability]
Cr: SGST Output (RCM) [Liability]
```

**Acceptance Criteria:**
- [ ] RCM flag in purchase voucher
- [ ] ITC and Liability both recorded
- [ ] Shows in GSTR-3B Table 4(A)(5)

---

### ACC-057: GST Return Filing Status

**Description:** Track GST return filing status

**Dashboard:**
- Month-wise filing status
- Color-coded: Filed (green), Due (yellow), Late (red)
- Due dates: 11th, 20th, etc.

**Acceptance Criteria:**
- [ ] Automated due date reminders
- [ ] Integration: Track via GSTN API (Phase 4)
- [ ] Shows: Filed on date, Acknowledgement number

---

### ACC-058: Tax Invoice Format

**Description:** Generate GST-compliant tax invoices

**Mandatory Fields:**
- Supplier GSTIN, Name, Address
- Customer GSTIN (if B2B), Name, Address
- Invoice number, Date
- HSN code, Quantity, Rate
- Taxable value, GST rate, GST amount
- Total invoice value in words

**Acceptance Criteria:**
- [ ] Company letterhead
- [ ] IRN QR code (if e-invoice)
- [ ] Terms and conditions
- [ ] Bank details for payment

---

## 6.8 TDS/TCS Management (6 Features)

### ACC-059: TDS Deduction at Source

**Description:** Automatically calculate and deduct TDS on payments

**TDS Sections Supported:**
- 194C: Payments to contractors (1% or 2%)
- 194H: Commission/Brokerage (5%)
- 194J: Professional fees (10%)
- 194I: Rent (10%)

**User Flow:**
1. Payment voucher: Select vendor
2. If TDS applicable: System checks threshold
3. Auto-calculates TDS
4. Deducts from payment: Net = Gross - TDS

**Accounting:**
```
Dr: Expense Ledger (Gross)
Cr: Vendor Ledger (Net = Gross - TDS)
Cr: TDS Payable Ledger (TDS amount)
```

**Acceptance Criteria:**
- [ ] PAN validation: TDS deducted only if PAN available
- [ ] Threshold check: Rs 30,000 for 194C
- [ ] TDS certificate generation (Form 16A)

**User Story:** US-2.9: TDS Computation and Return

---

### ACC-060: TDS Register

**Description:** Monthly TDS register for all deductions

**Columns:**
- Deductee name, PAN
- Section (194C, 194J, etc.)
- Gross Amount
- TDS Rate
- TDS Deducted
- Voucher details

**Acceptance Criteria:**
- [ ] Filter by: Month, Section, Deductee
- [ ] Export to Excel
- [ ] Quarterly summary for Form 26Q

---

### ACC-061: Form 26Q Generation

**Description:** Generate TDS return file for TRACES

**User Flow:**
1. Select quarter: Q1, Q2, Q3, Q4
2. Click "Generate Form 26Q"
3. System creates text file in FVU format
4. Upload to TRACES portal

**Acceptance Criteria:**
- [ ] FVU format: As per NSDL TRACES specification
- [ ] Validation: PAN, TAN, Amounts
- [ ] Pre-validation before export

---

### ACC-062: TDS Challan Tracking

**Description:** Track TDS tax paid to government

**User Flow:**
1. TDS challan paid via net banking
2. Record: Challan no, BSR code, Date, Amount
3. Link challan to TDS deductions

**Acceptance Criteria:**
- [ ] Challan no stored with payment voucher
- [ ] Report: Challan-wise TDS deductions
- [ ] Required for Form 26Q filing

---

### ACC-063: TDS Certificate (Form 16A)

**Description:** Issue TDS certificate to deductees

**User Flow:**
1. Select deductee (vendor)
2. Select period: Quarter/Year
3. Generate Form 16A PDF
4. Send to vendor via email

**Acceptance Criteria:**
- [ ] Auto-populated: Deductor TAN, Deductee PAN
- [ ] Shows: Deductions, Challan details
- [ ] Digital signature (Phase 4)

---

### ACC-064: TCS Collection at Source

**Description:** Collect TCS on specified goods

**Applicable if:**
- Turnover > ₹10 Cr
- Sale of goods > ₹50 lakhs to single buyer

**Rate:** 0.1% (if PAN available), 1% (if no PAN)

**Acceptance Criteria:**
- [ ] Auto-calculation in sales invoice
- [ ] TCS return filing (Form 27EQ)
- [ ] TCS certificate to buyer

**Priority:** P2 (Phase 4)

---

## 6.9 Financial Reporting (10 Features)

### ACC-065: Trial Balance

**Description:** List of all ledgers with Dr/Cr totals

**Columns:**
- Ledger Name
- Group
- Opening Balance (Dr/Cr)
- Transactions Dr Total
- Transactions Cr Total
- Closing Balance (Dr/Cr)

**Footer:**
- Total Dr = Total Cr (must balance)

**Acceptance Criteria:**
- [ ] As on date selection
- [ ] Grouped by: Assets, Liabilities, Income, Expenses
- [ ] Drill-down: Click ledger to see vouchers
- [ ] Export to Excel/PDF

**User Story:** US-2.6: Trial Balance Verification

---

### ACC-066: Profit & Loss Statement

**Description:** Income statement for the period

**Format (Schedule III):**
```
Revenue from Operations: ₹50,00,000
  Less: Cost of Goods Sold: ₹30,00,000
Gross Profit: ₹20,00,000
  Less: Operating Expenses: ₹10,00,000
Operating Profit (EBITDA): ₹10,00,000
  Less: Interest, Depreciation, Tax
Net Profit: ₹6,00,000
```

**Acceptance Criteria:**
- [ ] Date range selection
- [ ] Comparative: Current year vs Previous year
- [ ] Auto-calculated from trial balance
- [ ] Affects Gross Profit toggle (from groups)

**User Story:** US-2.8: Financial Statements (Schedule III)

---

### ACC-067: Balance Sheet

**Description:** Financial position as on date

**Format (Schedule III):**

**Assets:**
- Non-Current Assets: Fixed Assets, Investments
- Current Assets: Cash, Debtors, Stock

**Liabilities:**
- Capital & Reserves: Share Capital, Retained Earnings
- Non-Current Liabilities: Long-term Loans
- Current Liabilities: Creditors, Short-term Loans

**Accounting Equation:**
```
Assets = Liabilities + Equity
```

**Acceptance Criteria:**
- [ ] As on date selection
- [ ] Comparative: Current vs Previous year
- [ ] Auto-calculated from trial balance
- [ ] Schedule III format

**User Story:** US-2.8: Financial Statements (Schedule III)

---

### ACC-068: Cash Flow Statement

**Description:** Cash movements classified by activity

(Already described in ACC-046)

---

### ACC-069: Ledger Report

**Description:** All transactions for a specific ledger

**Columns:**
- Date
- Voucher Type, Number
- Particulars (Narration)
- Dr Amount
- Cr Amount
- Running Balance

**Acceptance Criteria:**
- [ ] Date range filter
- [ ] Opening and closing balance
- [ ] Drill-down: Click voucher to open
- [ ] Export to PDF with letterhead

---

### ACC-070: Day Book

**Description:** All vouchers for a specific day

**Columns:**
- Voucher Type
- Voucher Number
- Party (if applicable)
- Dr Ledger, Dr Amount
- Cr Ledger, Cr Amount
- Total

**Acceptance Criteria:**
- [ ] Date selection
- [ ] Group by voucher type
- [ ] Shows total Dr = Total Cr
- [ ] Drill-down to voucher details

---

### ACC-071: Sales Register

**Description:** All sales invoices with GST details

**Columns:**
- Date, Invoice No
- Customer Name, GSTIN
- Taxable Value
- CGST, SGST, IGST
- Total Invoice Value

**Acceptance Criteria:**
- [ ] Date range filter
- [ ] Subtotals by: Customer, HSN, GST rate
- [ ] Export to Excel
- [ ] Matches with GSTR-1

---

### ACC-072: Purchase Register

**Description:** All purchase invoices with GST details

**Columns:**
- Date, Bill No
- Supplier Name, GSTIN
- Taxable Value
- CGST, SGST, IGST (Input Credit)
- Total Bill Value

**Acceptance Criteria:**
- [ ] Date range filter
- [ ] Subtotals by: Supplier, HSN, GST rate
- [ ] Matches with GSTR-2B
- [ ] ITC available shown

---

### ACC-073: Ratio Analysis

**Description:** Key financial ratios

**Ratios:**
- **Liquidity:** Current Ratio, Quick Ratio
- **Profitability:** Gross Margin %, Net Margin %
- **Efficiency:** Debtors Turnover, Inventory Turnover
- **Leverage:** Debt to Equity

**Acceptance Criteria:**
- [ ] Auto-calculated from financial statements
- [ ] Benchmark comparison (industry average)
- [ ] Trend graph: This year vs Last 3 years

---

### ACC-074: Comparative Financial Statements

**Description:** Side-by-side comparison of multiple periods

**Formats:**
- P&L: This year vs Last year
- Balance Sheet: This year vs Last year
- Shows: Absolute change (₹), Percentage change (%)

**Acceptance Criteria:**
- [ ] Up to 3 years comparison
- [ ] Highlights: Significant variances (>20%)
- [ ] Export to PDF for board meetings

---

## 6.10 Period Closing (5 Features)

### ACC-075: Month-End Closing

**Description:** Lock transactions for previous month

**User Flow:**
1. Verify: All vouchers posted for the month
2. Run month-end reports: Trial Balance, P&L
3. Review and approve
4. Click "Close Month"
5. Month locked: No edits allowed

**Acceptance Criteria:**
- [ ] Cannot post vouchers with date < Closed month
- [ ] Can reopen with admin password (for corrections)
- [ ] Audit log: Closed by, Date

---

### ACC-076: Year-End Closing

**Description:** Financial year closing process

**Steps:**
1. Close last month of year (March)
2. Run final reports: P&L, Balance Sheet
3. Calculate Net Profit/Loss
4. Transfer to Retained Earnings

**Accounting Entry:**
```
Dr: All Income Ledgers
Cr: All Expense Ledgers
Difference = Net Profit

Dr: P&L Account
Cr: Retained Earnings (Net Profit)
```

**Acceptance Criteria:**
- [ ] All months closed before year-end
- [ ] P&L ledgers reset to zero
- [ ] Balance sheet ledgers carry forward
- [ ] Next year: New financial year created

---

### ACC-077: Opening Balances (Next Year)

**Description:** Carry forward balances to new year

**Auto-Carried Forward:**
- All ledger balances (except P&L ledgers)
- Stock values
- Fixed asset values

**Acceptance Criteria:**
- [ ] Opening balance = Previous year closing balance
- [ ] Verification report: Closing vs Opening match
- [ ] Cannot edit opening balances manually

---

### ACC-078: Depreciation Calculation

**Description:** Calculate and post depreciation on fixed assets

**Method:** Written Down Value (WDV) or Straight Line (SLM)

**User Flow:**
1. Fixed asset register: All assets with rates
2. Click "Calculate Depreciation"
3. System creates journal voucher

**Accounting Entry:**
```
Dr: Depreciation Expense
Cr: Accumulated Depreciation
```

**Acceptance Criteria:**
- [ ] Depreciation rates as per Income Tax Act
- [ ] Pro-rata depreciation for part-year assets
- [ ] Depreciation schedule report

---

### ACC-079: Audit Lock

**Description:** Lock entire financial year for audit

**User Flow:**
1. Year-end closed
2. Auditor reviews books
3. Auditor approves
4. Admin clicks "Audit Lock"
5. Entire year locked: No changes possible

**Acceptance Criteria:**
- [ ] Cannot be unlocked (permanent)
- [ ] Tooltip: "Audit locked on DD-MM-YYYY by [User]"
- [ ] Read-only access to all vouchers

---

## 6.11 Audit & Compliance (8 Features)

### ACC-080: Audit Trail Report

**Description:** Complete modification log for all transactions

**Shows:**
- Voucher number
- Created by, Created date
- Modified by, Modified date
- Changes: Old value → New value

**Acceptance Criteria:**
- [ ] Immutable log (cannot be deleted)
- [ ] Filter by: Date range, User, Voucher type
- [ ] Export to PDF for auditor
- [ ] Meets Companies Act 2013 requirements

**User Story:** US-2.3: Audit Trail Report
**User Story:** US-4.3: Modification Log for Audit Trail

---

### ACC-081: Form 3CB/3CD Preparation

**Description:** Tax audit report under Section 44AB

**Form 3CD Clauses:**
- Clause 31: Quantitative details (from inventory)
- Clause 32: Related party transactions
- Clause 33: Disallowances u/s 40(a)

**Acceptance Criteria:**
- [ ] Auto-populated from vouchers, stock reports
- [ ] Quantitative reconciliation: Opening + Purchases = Sales + Closing
- [ ] Export to Excel in prescribed format
- [ ] Import into tax audit software

**User Story:** US-2.5: Form 3CD Quantitative Details
**User Story:** US-4.1: Form 3CD Quantitative Verification

---

### ACC-082: High-Value Transaction Report

**Description:** List of transactions above threshold

**Threshold:** ₹10,00,000 (configurable)

**Columns:**
- Date, Voucher No
- Party Name
- Amount
- Payment Mode
- Purpose

**Acceptance Criteria:**
- [ ] Filter by: Amount threshold
- [ ] Shows: Cash transactions above ₹10,000 (Section 40A(3))
- [ ] Document attachment check

**User Story:** US-4.2: High-Value Transaction Report

---

### ACC-083: Related Party Transaction Register

**Description:** Track transactions with related parties

**Related Parties:** (As per Companies Act)
- Directors
- Key Managerial Personnel
- Relatives
- Associate companies

**User Flow:**
1. Mark ledgers as "Related Party"
2. System flags all transactions with these ledgers
3. Report: Related party transactions

**Acceptance Criteria:**
- [ ] Disclosure in financial statements (Schedule III)
- [ ] Form 3CD clause 32
- [ ] Board approval tracking (if required)

---

### ACC-084: Document Attachment to Vouchers

**Description:** Attach supporting documents to vouchers

**Documents:**
- Purchase invoice PDF
- Delivery challan
- Contract copy
- Email correspondence

**User Flow:**
1. Open voucher
2. Click "Attach Document"
3. Upload file (PDF, JPG, PNG)
4. Multiple attachments allowed

**Acceptance Criteria:**
- [ ] Max file size: 5 MB per file
- [ ] Storage: Supabase Storage
- [ ] Thumbnail preview
- [ ] Download as ZIP (all attachments)

**User Story:** US-2.10: Document Attachments

---

### ACC-085: User Access Log

**Description:** Track all user logins and actions

**Logs:**
- Login: Date, Time, IP address
- Actions: Voucher created/modified/deleted
- Reports viewed/exported

**Acceptance Criteria:**
- [ ] Retention: 1 year
- [ ] Export to Excel
- [ ] Security compliance: Shows unauthorized access attempts

---

### ACC-086: Data Export for Auditor

**Description:** Export all data for external audit

**Export Options:**
- All vouchers (CSV/Excel)
- All ledgers (with balances)
- Trial Balance, P&L, Balance Sheet
- Tally XML export

**Acceptance Criteria:**
- [ ] One-click: "Export Audit Package"
- [ ] ZIP file with all reports
- [ ] Password-protected ZIP

**User Story:** US-2.1: Tally-Ready Data Export

---

### ACC-087: Compliance Checklist

**Description:** Checklist for statutory compliances

**Checklist:**
- [ ] GST returns filed (monthly/quarterly)
- [ ] TDS returns filed (quarterly)
- [ ] Income tax advance tax paid
- [ ] PF/ESI remittance (if applicable)
- [ ] Annual filing: ITR, ROC returns

**Acceptance Criteria:**
- [ ] Dashboard widget: Pending compliances
- [ ] Due date reminders
- [ ] Mark as completed with reference number

---

## 6.12 Advanced Accounting Features (5 Features)

### ACC-088: Cost Center Tracking

**Description:** Track profitability by department/project

**Use Case:** Multi-branch business wants P&L by branch

**User Flow:**
1. Create cost centers: Branch A, Branch B, Head Office
2. In vouchers: Allocate to cost center
3. Reports: P&L by cost center

**Acceptance Criteria:**
- [ ] Cost center master
- [ ] Voucher-wise allocation
- [ ] Report: Branch-wise P&L

**Priority:** P2 (Phase 4)

---

### ACC-089: Budget vs Actual

**Description:** Compare actual expenses against budget

**User Flow:**
1. Create annual budget: Set budgets for each expense ledger
2. Monthly report: Budget vs Actual
3. Shows: Variance (₹ and %)

**Acceptance Criteria:**
- [ ] Budget by: Ledger, Month
- [ ] Alert: If expense exceeds budget
- [ ] Graphical view: Line chart

**Priority:** P2 (Phase 4)

---

### ACC-090: Intercompany Transactions

**Description:** Handle transactions between group companies

**Use Case:** Parent company sells to subsidiary

**Accounting:**
- Parent: Dr Subsidiary Ledger, Cr Sales
- Subsidiary: Dr Purchase, Cr Parent Ledger

**Acceptance Criteria:**
- [ ] Elimination entries for consolidation
- [ ] Intercompany balance confirmation
- [ ] Report: Intercompany transactions

**Priority:** P2 (Phase 4 - "Out of Scope")

---

### ACC-091: Fixed Asset Register

**Description:** Track fixed assets and depreciation

**Master:**
- Asset name, Date of purchase
- Cost, Depreciation rate
- Accumulated depreciation, Written down value

**Acceptance Criteria:**
- [ ] Depreciation schedule
- [ ] Asset disposal: Gain/Loss calculation
- [ ] Schedule III: Fixed asset movement

**Priority:** P2 (Phase 4 - Tally handles this already)

---

### ACC-092: Salary & Payroll Integration

**Description:** Import salary data from payroll software

**User Flow:**
1. Export salary sheet from payroll software (Excel)
2. Import into system
3. Creates journal voucher: Dr Salary Expense, Cr Bank/Employee payables

**Acceptance Criteria:**
- [ ] Salary components: Basic, HRA, Conveyance, etc.
- [ ] Deductions: PF, ESI, TDS
- [ ] Net payable to employees

**Priority:** P2 (Phase 4 - "Out of Scope", Tally handles this)

---

## 6.13 Accounting Feature Integration Matrix

| Feature Category | # Features | Database Impact | Reports | Mobile | Priority |
|-----------------|-----------|----------------|---------|--------|----------|
| Chart of Accounts | 10 | High | Trial Balance | No | P0 |
| Voucher Entry | 15 | High | Day Book, Ledger | No | P0 |
| Receivables | 8 | Medium | Outstanding, Aging | Yes | P0 |
| Payables | 7 | Medium | Outstanding, Aging | No | P0 |
| Banking | 6 | Medium | BRS, Cash/Bank Book | No | P0 |
| GST Compliance | 12 | High | GSTR-1/2B/3B | No | P0 |
| TDS/TCS | 6 | Medium | TDS Register | No | P1 |
| Financial Reports | 10 | Low (Read) | P&L, Balance Sheet | No | P0 |
| Period Closing | 5 | High | Year-end reports | No | P1 |
| Audit | 8 | Low (Read) | Audit Trail | No | P1 |
| Advanced | 5 | Medium | Cost Center P&L | No | P2 |

---

## 6.14 Accounting Data Flow

### Sales Transaction Flow:
```
Sales Order → Dispatch → Sales Invoice Generated → GST Calculated → Customer Receivable Increased → GSTR-1 Included
```

### Purchase Transaction Flow:
```
Purchase Order → Receipt → Purchase Invoice → GST Input Credit → Vendor Payable Increased → GSTR-2B Match
```

### Payment Flow:
```
Vendor Bill Due → Payment Voucher → TDS Deducted (if applicable) → Bank Balance Reduced → Bill-wise Allocation → Vendor Outstanding Reduced
```

### GST Return Flow:
```
Monthly Transactions → GSTR-1 Generated → GSTR-2B Downloaded → Reconciliation → GSTR-3B Filed → Tax Paid
```

---

## 6.15 Accounting Business Rules

### Double-Entry Enforcement:
- Every voucher: Dr total = Cr total (database check)
- No unbalanced voucher can be saved
- Voucher_ledger_entries: SUM(amount) = 0 per voucher

### GST Business Rules:
- **Same State Transaction:** CGST + SGST
- **Interstate Transaction:** IGST
- **Reverse Charge:** Buyer pays GST (RCM)
- **E-Invoice:** Mandatory if turnover > ₹5 Cr

### TDS Business Rules:
- **Threshold:** Section 194C: ₹30,000 single, ₹1,00,000 aggregate
- **Rate:** 1% (individual/HUF contractor), 2% (company contractor)
- **No PAN:** TDS @ 20%

### Credit Limit Rules:
- Outstanding + New Order ≤ Credit Limit
- Warning if 90% utilized
- Block if exceeded (override requires approval)

### Bill-wise Tracking:
- **Receivables:** All customer ledgers under "Sundry Debtors"
- **Payables:** All vendor ledgers under "Sundry Creditors"
- Each invoice = one bill
- Payments allocated FIFO (oldest first)

---

## 6.16 Accounting Performance Optimizations

### Materialized Views:
- `ledger_balances`: Real-time balance per ledger
- `customer_outstanding`: Aging buckets pre-calculated
- Refresh: After voucher posting (trigger)

### Indexed Queries:
- vouchers: (company_id, voucher_date)
- voucher_ledger_entries: (ledger_id, voucher_id)
- ledgers: (company_id, group_id)

### Report Caching:
- Trial Balance: Cached for 5 minutes (unless new voucher posted)
- Financial Statements: Cached per day
- Invalidate cache on voucher save

---

## 6.17 Accounting User Experience

### Keyboard Shortcuts (Tally-like):
- F5: Payment Voucher
- F6: Receipt Voucher
- F7: Journal Voucher
- F8: Sales Voucher
- F9: Purchase Voucher
- Ctrl+A: Accept/Save
- Esc: Cancel/Go Back
- Alt+F1: Balance Enquiry
- Alt+F2: Ledger Master
- Alt+D: Delete voucher

### Auto-Suggestions:
- Ledger name: Autocomplete as you type
- GST rate: Auto-filled from HSN code
- Credit days: Auto-filled from ledger master
- Voucher number: Auto-incremented

### Validation Messages:
- "Dr total (₹10,000) ≠ Cr total (₹9,500). Please check."
- "Customer credit limit exceeded by ₹50,000. Approve?"
- "GSTIN format invalid. Expected: 27AABCU9603R1ZS"

---

**End of PART 6: Accounting Features (92 Features)**

---

