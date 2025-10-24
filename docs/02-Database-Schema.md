# Database Schema - Bale Inventory & Accounting System

**Version:** 2.2 (Tally-Compatible with QR Roll Tracking)
**Date:** January 2025
**Database:** PostgreSQL 15+ (Supabase)

---

## Schema Overview

### Table Count: 19 Tables

| Category | Tables | Count |
|----------|--------|-------|
| **Foundation** | companies, users, godowns | 3 |
| **Accounting** | groups, ledgers, voucher_types, vouchers, voucher_ledger_entries, voucher_inventory_entries | 6 |
| **Inventory** | stock_groups, stock_items, barcode_batches, stock_units | 4 |
| **Transactions** | sales_orders, sales_order_items, job_works | 3 |
| **Supporting** | hsn_codes, tally_import_logs | 2 |

### Critical Enhancements (v2.2)

✅ **Tally-Compatible Structure** - Stock items match Tally Prime schema exactly
✅ **QR Roll Tracking** - Individual roll tracking with QR codes (beyond Tally)
✅ **Production Batch Tracking** - Dyeing/printing batch management with quality grading
✅ **Double-Entry Validation** - Database trigger enforces Dr = Cr
✅ **COGS Automation** - Auto-creates cost entries on sales dispatch
✅ **Inventory-Ledger Sync** - Validates inventory amounts match ledger

## 4-Level Inventory Structure

**Tally-Compatible Base:**
```
Stock Group (Tally)
  └─ Stock Item (Tally - each color is separate item)
```

**Our QR Enhancement:**
```
Stock Group (Tally)
  └─ Stock Item (Tally - each color is separate item)
       └─ Batch (Optional - production/purchase grouping)
            └─ Stock Unit (Individual QR-coded roll)
```

**Example:**
```
Stock Group: "Cotton Fabrics"
  └─ Stock Item: "Floral Print - Red - 44\""
       ├─ Batch: DYE-2025-001 (dyeing batch)
       │   ├─ QR-001: 19.5m, Grade A
       │   ├─ QR-002: 17.8m, Grade A
       │   └─ QR-003: 24m, Reject
       │
       └─ Batch: PUR-ABC-123 (purchase receipt)
           ├─ QR-101: 25m, Grade A
           └─ QR-102: 22m, Grade A
```

**Key Design Decisions:**
- ❌ No "variants" table - each color/width = separate stock_item (Tally way)
- ✅ Batches are optional grouping (can have stock_units without batch)
- ✅ All data exportable to Tally XML format
- ✅ QR roll tracking is our value-add beyond Tally

---

## Foundation Tables

### 1. companies

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),

  -- Tax Registration
  gstin VARCHAR(15) UNIQUE,
  pan VARCHAR(10),
  cin VARCHAR(21),

  -- Contact
  email VARCHAR(255),
  phone VARCHAR(20),
  address JSONB,

  -- Financial Year
  financial_year_start DATE NOT NULL DEFAULT '2024-04-01',
  books_beginning_from DATE NOT NULL,

  -- Tally Integration
  tally_company_name VARCHAR(255),
  last_tally_import_at TIMESTAMP,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_companies_gstin ON companies(gstin);
CREATE INDEX idx_companies_active ON companies(is_active);

-- RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own company" ON companies FOR SELECT
  USING (id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

### 2. users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),

  -- Role
  role VARCHAR(50) NOT NULL DEFAULT 'staff', -- admin, staff, warehouse, accountant

  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_role ON users(role);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users in same company" ON users FOR SELECT
  USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

### 3. godowns

```sql
CREATE TABLE godowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  address JSONB,

  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  manager_user_id UUID REFERENCES users(id),

  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(company_id, name)
);

CREATE INDEX idx_godowns_company ON godowns(company_id);

ALTER TABLE godowns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see company godowns" ON godowns FOR ALL
  USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

---

## Accounting Tables

### 4. groups

```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  parent_group_id UUID REFERENCES groups(id),

  name VARCHAR(255) NOT NULL,
  alias VARCHAR(255),

  -- Tally Standard
  is_system_group BOOLEAN DEFAULT false,
  tally_group_name VARCHAR(255),

  -- Classification
  nature VARCHAR(50) NOT NULL, -- Asset, Liability, Income, Expense
  affects_gross_profit BOOLEAN DEFAULT false,
  is_revenue BOOLEAN DEFAULT false,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(company_id, name)
);

CREATE INDEX idx_groups_company ON groups(company_id);
CREATE INDEX idx_groups_parent ON groups(parent_group_id);
CREATE INDEX idx_groups_nature ON groups(company_id, nature);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see company groups" ON groups FOR ALL
  USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

### 5. ledgers

```sql
CREATE TABLE ledgers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  group_id UUID NOT NULL REFERENCES groups(id),

  name VARCHAR(255) NOT NULL,
  alias VARCHAR(255),
  code VARCHAR(50),

  -- Contact (for party ledgers)
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address JSONB,

  -- GST
  gstin VARCHAR(15),
  state_code VARCHAR(2),
  pan VARCHAR(10),

  -- Banking
  bank_account_number VARCHAR(50),
  bank_ifsc VARCHAR(11),

  -- Credit Management
  credit_limit DECIMAL(15, 2),
  credit_period_days INTEGER,

  -- Opening Balance (migrated to vouchers in v2.1)
  opening_balance DECIMAL(15, 2) DEFAULT 0,
  opening_balance_type VARCHAR(2) CHECK (opening_balance_type IN ('Dr', 'Cr')),

  maintain_bill_wise BOOLEAN DEFAULT false,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(company_id, name)
);

CREATE INDEX idx_ledgers_company ON ledgers(company_id);
CREATE INDEX idx_ledgers_group ON ledgers(group_id);
CREATE INDEX idx_ledgers_gstin ON ledgers(gstin);

ALTER TABLE ledgers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see company ledgers" ON ledgers FOR ALL
  USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

### 6. voucher_types

```sql
CREATE TABLE voucher_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL,
  abbreviation VARCHAR(20),

  is_system_type BOOLEAN DEFAULT false,
  tally_voucher_type VARCHAR(50),

  -- Numbering
  prefix VARCHAR(20),
  starting_number INTEGER DEFAULT 1,
  number_method VARCHAR(20) DEFAULT 'auto',

  category VARCHAR(50) NOT NULL, -- accounting, inventory, order
  affects_stock BOOLEAN DEFAULT false,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(company_id, name)
);

CREATE INDEX idx_voucher_types_company ON voucher_types(company_id);

ALTER TABLE voucher_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see company voucher types" ON voucher_types FOR ALL
  USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

### 7. vouchers

```sql
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  voucher_type_id UUID NOT NULL REFERENCES voucher_types(id),
  voucher_number VARCHAR(100) NOT NULL,
  voucher_date DATE NOT NULL,

  ref_number VARCHAR(100),
  ref_date DATE,

  party_ledger_id UUID REFERENCES ledgers(id),

  total_amount DECIMAL(15, 2) NOT NULL,
  narration TEXT,

  status VARCHAR(50) DEFAULT 'draft', -- draft, posted, cancelled
  is_cancelled BOOLEAN DEFAULT false,

  -- Links
  sales_order_id UUID,
  job_work_id UUID,

  -- E-Invoice
  irn VARCHAR(64),
  ack_no VARCHAR(20),
  ack_date TIMESTAMP,

  -- E-Way Bill
  ewb_no VARCHAR(12),
  ewb_date DATE,

  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),

  UNIQUE(company_id, voucher_type_id, voucher_number)
);

CREATE INDEX idx_vouchers_company ON vouchers(company_id);
CREATE INDEX idx_vouchers_type ON vouchers(voucher_type_id);
CREATE INDEX idx_vouchers_date ON vouchers(voucher_date);
CREATE INDEX idx_vouchers_party ON vouchers(party_ledger_id);
CREATE INDEX idx_vouchers_status ON vouchers(company_id, status);

ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see company vouchers" ON vouchers FOR ALL
  USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

### 8. voucher_ledger_entries

```sql
CREATE TABLE voucher_ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  ledger_id UUID NOT NULL REFERENCES ledgers(id),

  amount DECIMAL(15, 2) NOT NULL,
  entry_type VARCHAR(2) NOT NULL CHECK (entry_type IN ('Dr', 'Cr')),

  -- Bill-wise details
  bill_ref_number VARCHAR(100),
  bill_ref_date DATE,
  bill_due_date DATE,

  -- GST Details
  taxable_amount DECIMAL(15, 2),
  gst_rate DECIMAL(5, 2),
  cgst_amount DECIMAL(15, 2),
  sgst_amount DECIMAL(15, 2),
  igst_amount DECIMAL(15, 2),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vle_voucher ON voucher_ledger_entries(voucher_id);
CREATE INDEX idx_vle_ledger ON voucher_ledger_entries(ledger_id);
CREATE INDEX idx_vle_company ON voucher_ledger_entries(company_id);

ALTER TABLE voucher_ledger_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see company entries" ON voucher_ledger_entries FOR ALL
  USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

### 9. voucher_inventory_entries

```sql
CREATE TABLE voucher_inventory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  stock_item_id UUID NOT NULL REFERENCES stock_items(id),
  godown_id UUID REFERENCES godowns(id),

  quantity DECIMAL(15, 3) NOT NULL,
  rate DECIMAL(15, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,

  entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('inward', 'outward')),

  amount DECIMAL(15, 2) NOT NULL,

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

  total_amount DECIMAL(15, 2),

  -- Fabric-specific
  quality_grade VARCHAR(10),
  attributes JSONB,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vie_voucher ON voucher_inventory_entries(voucher_id);
CREATE INDEX idx_vie_stock_item ON voucher_inventory_entries(stock_item_id);
CREATE INDEX idx_vie_godown ON voucher_inventory_entries(godown_id);

ALTER TABLE voucher_inventory_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see company inventory entries" ON voucher_inventory_entries FOR ALL
  USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

---

## 🔧 CRITICAL FIXES (v2.1)

### Fix 1: Double-Entry Validation Trigger

```sql
-- Function to validate voucher balance
CREATE OR REPLACE FUNCTION validate_double_entry()
RETURNS TRIGGER AS $$
DECLARE
  v_balance DECIMAL(15, 2);
  v_voucher_status VARCHAR(50);
BEGIN
  -- Only validate for posted vouchers
  SELECT status INTO v_voucher_status
  FROM vouchers WHERE id = NEW.voucher_id;

  IF v_voucher_status != 'posted' THEN
    RETURN NEW;
  END IF;

  -- Calculate net balance (Dr - Cr)
  SELECT COALESCE(SUM(
    CASE WHEN entry_type = 'Dr' THEN amount
         WHEN entry_type = 'Cr' THEN -amount
    END
  ), 0) INTO v_balance
  FROM voucher_ledger_entries
  WHERE voucher_id = NEW.voucher_id;

  -- Enforce balance (allow small rounding errors)
  IF ABS(v_balance) > 0.01 THEN
    RAISE EXCEPTION 'Voucher not balanced! Dr-Cr difference: ₹%', v_balance;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on INSERT/UPDATE
CREATE TRIGGER enforce_double_entry
  AFTER INSERT OR UPDATE ON voucher_ledger_entries
  FOR EACH ROW
  EXECUTE FUNCTION validate_double_entry();
```

### Fix 2: Automatic COGS Calculation

```sql
-- Function to auto-create COGS entries on sales dispatch
CREATE OR REPLACE FUNCTION auto_create_cogs()
RETURNS TRIGGER AS $$
DECLARE
  v_cogs_amount DECIMAL(15, 2);
  v_cogs_ledger_id UUID;
  v_inventory_ledger_id UUID;
BEGIN
  -- Only for outward (sales/dispatch) entries
  IF NEW.entry_type != 'outward' THEN
    RETURN NEW;
  END IF;

  -- Calculate FIFO cost
  v_cogs_amount := calculate_fifo_cost(
    NEW.company_id,
    NEW.stock_item_id,
    NEW.quantity
  );

  -- Get COGS ledger
  SELECT id INTO v_cogs_ledger_id
  FROM ledgers
  WHERE company_id = NEW.company_id
    AND name = 'Cost of Goods Sold';

  -- Get Inventory ledger
  SELECT id INTO v_inventory_ledger_id
  FROM ledgers l
  JOIN stock_items si ON si.stock_group_id = l.group_id
  WHERE si.id = NEW.stock_item_id
    AND l.company_id = NEW.company_id
  LIMIT 1;

  -- Create COGS entry: Dr COGS, Cr Inventory
  INSERT INTO voucher_ledger_entries (
    voucher_id, company_id, ledger_id, amount, entry_type
  ) VALUES
    (NEW.voucher_id, NEW.company_id, v_cogs_ledger_id, v_cogs_amount, 'Dr'),
    (NEW.voucher_id, NEW.company_id, v_inventory_ledger_id, v_cogs_amount, 'Cr');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_cogs
  AFTER INSERT ON voucher_inventory_entries
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_cogs();
```

### Fix 3: FIFO Cost Calculation Function

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
  v_unit RECORD;
BEGIN
  -- Get available stock units in FIFO order (oldest first)
  FOR v_unit IN
    SELECT id, quantity, purchase_rate
    FROM stock_units
    WHERE company_id = p_company_id
      AND stock_item_id = p_stock_item_id
      AND status = 'available'
    ORDER BY created_at ASC
  LOOP
    IF v_remaining_qty <= 0 THEN
      EXIT;
    END IF;

    IF v_unit.quantity <= v_remaining_qty THEN
      v_total_cost := v_total_cost + (v_unit.quantity * v_unit.purchase_rate);
      v_remaining_qty := v_remaining_qty - v_unit.quantity;
    ELSE
      v_total_cost := v_total_cost + (v_remaining_qty * v_unit.purchase_rate);
      v_remaining_qty := 0;
    END IF;
  END LOOP;

  RETURN v_total_cost;
END;
$$ LANGUAGE plpgsql;
```

### Fix 4: Inventory-Ledger Sync Validation

```sql
CREATE OR REPLACE FUNCTION validate_inventory_ledger_sync()
RETURNS TRIGGER AS $$
DECLARE
  v_inventory_total DECIMAL;
  v_ledger_total DECIMAL;
BEGIN
  -- Sum all inventory entries for this voucher
  SELECT COALESCE(SUM(total_amount), 0) INTO v_inventory_total
  FROM voucher_inventory_entries
  WHERE voucher_id = NEW.voucher_id;

  -- Sum stock/inventory ledger entries
  SELECT COALESCE(SUM(amount), 0) INTO v_ledger_total
  FROM voucher_ledger_entries vle
  JOIN ledgers l ON vle.ledger_id = l.id
  JOIN groups g ON l.group_id = g.id
  WHERE vle.voucher_id = NEW.voucher_id
    AND g.name IN ('Stock in Hand', 'Inventory');

  IF ABS(v_inventory_total - v_ledger_total) > 0.01 THEN
    RAISE EXCEPTION 'Inventory-Ledger mismatch! Inventory: ₹%, Ledger: ₹%',
      v_inventory_total, v_ledger_total;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_inventory_sync
  AFTER INSERT OR UPDATE ON voucher_inventory_entries
  FOR EACH ROW
  EXECUTE FUNCTION validate_inventory_ledger_sync();
```

---

## Inventory Tables

### 10. stock_items

```sql
CREATE TABLE stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  code VARCHAR(100),
  stock_group_id UUID REFERENCES stock_groups(id),

  base_unit VARCHAR(50) NOT NULL,

  -- Pricing
  purchase_rate DECIMAL(15, 2),
  sales_rate DECIMAL(15, 2),
  mrp DECIMAL(15, 2),

  -- Inventory
  track_individual_items BOOLEAN DEFAULT true,
  opening_stock DECIMAL(15, 3) DEFAULT 0,
  opening_value DECIMAL(15, 2) DEFAULT 0,
  minimum_stock_level DECIMAL(15, 3),

  -- GST
  hsn_code VARCHAR(8),
  gst_rate DECIMAL(5, 2),

  -- Fabric-Specific
  fabric_type VARCHAR(100),
  design VARCHAR(255),
  color VARCHAR(100),
  width_inch DECIMAL(6, 2),
  gsm DECIMAL(8, 2),
  thread_count VARCHAR(50),
  finish VARCHAR(100),

  has_variants BOOLEAN DEFAULT false,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(company_id, name)
);

CREATE INDEX idx_stock_items_company ON stock_items(company_id);
CREATE INDEX idx_stock_items_hsn ON stock_items(hsn_code);

ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see company stock items" ON stock_items FOR ALL
  USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

### 11. barcode_batches

**Purpose:** Group stock units by production batch, purchase receipt, or job work

**Batch Types:**
- `purchase_receipt` - Goods received from supplier (same invoice/challan)
- `dyeing` - Dyeing job work batch
- `printing` - Printing/screen printing batch
- `finishing` - Calendaring, mercerizing, heat setting, etc.
- `qr_printing` - Internal QR label printing logistics
- `transfer` - Stock transfer between godowns

```sql
CREATE TABLE barcode_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  batch_number VARCHAR(100) NOT NULL,   -- "DYE-2025-001", "PUR-INV-123"
  batch_name VARCHAR(255),              -- Display name
  batch_date DATE NOT NULL,

  -- Batch Type & Status
  batch_type VARCHAR(50) NOT NULL,      -- 'purchase_receipt', 'dyeing', 'printing', 'finishing', 'qr_printing', 'transfer'
  status VARCHAR(50) NOT NULL,          -- See status values per type below

  -- Stock Item Reference
  stock_item_id UUID NOT NULL REFERENCES stock_items(id), -- Which stock item this batch produces/handles

  -- Production Details (for job work batches)
  job_worker_ledger_id UUID REFERENCES ledgers(id),       -- Job worker party

  expected_quantity DECIMAL(15, 3),     -- Target quantity
  success_quantity DECIMAL(15, 3),      -- Actual good output (Grade A+B)
  reject_quantity DECIMAL(15, 3),       -- Failed/defective output

  processing_cost DECIMAL(15, 2),       -- Total batch cost
  cost_per_unit DECIMAL(15, 2),         -- Calculated: cost / success_quantity

  failure_reason TEXT,                  -- Why batch failed/had rejects

  -- Purchase Receipt Details (for supplier purchases)
  supplier_ledger_id UUID REFERENCES ledgers(id),
  supplier_invoice_number VARCHAR(100),
  supplier_invoice_date DATE,

  -- QR Printing Details (internal use)
  pdf_url TEXT,                         -- QR label PDF
  layout_config JSONB,                  -- Label layout settings
  fields_selected TEXT[],               -- Which fields on label

  -- Voucher Links
  outward_voucher_id UUID REFERENCES vouchers(id), -- Sent to job worker
  inward_voucher_id UUID REFERENCES vouchers(id),  -- Received back

  godown_id UUID REFERENCES godowns(id),

  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(company_id, batch_number)
);

CREATE INDEX idx_batches_company ON barcode_batches(company_id);
CREATE INDEX idx_batches_type ON barcode_batches(company_id, batch_type);
CREATE INDEX idx_batches_status ON barcode_batches(company_id, status);
CREATE INDEX idx_batches_date ON barcode_batches(batch_date);
CREATE INDEX idx_batches_stock_item ON barcode_batches(stock_item_id);
CREATE INDEX idx_batches_supplier ON barcode_batches(supplier_ledger_id);
CREATE INDEX idx_batches_job_worker ON barcode_batches(job_worker_ledger_id);

ALTER TABLE barcode_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see company batches" ON barcode_batches FOR ALL
  USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

**Status Values by Batch Type:**

| Batch Type | Status Flow |
|------------|-------------|
| `purchase_receipt` | `received` → `verified` → `stocked` |
| `dyeing` | `created` → `sent` → `processing` → `received` → `completed`/`failed`/`partial` |
| `printing` | `created` → `sent` → `processing` → `received` → `completed`/`failed`/`partial` |
| `finishing` | `created` → `sent` → `processing` → `received` → `completed`/`failed`/`partial` |
| `transfer` | `initiated` → `in_transit` → `received` |
| `qr_printing` | `generated` → `printed` → `applied` |

**Batch Status Values:**
- `completed` - 100% success, no rejects
- `partial` - Some success, some rejects (common in dyeing/printing)
- `failed` - Total failure, 100% reject

### 12. stock_units

**Purpose:** Individual physical rolls/pieces with QR codes (Tally enhancement)

```sql
CREATE TABLE stock_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  stock_item_id UUID NOT NULL REFERENCES stock_items(id),

  qr_code VARCHAR(255) UNIQUE NOT NULL,

  -- OPTIONAL: Batch grouping (NULL for direct purchases)
  batch_id UUID REFERENCES barcode_batches(id),

  godown_id UUID NOT NULL REFERENCES godowns(id),
  rack_location VARCHAR(100),

  quantity DECIMAL(15, 3) NOT NULL,
  unit VARCHAR(50) NOT NULL,

  -- Purchase/Cost Details
  purchase_rate DECIMAL(15, 2),
  purchase_date DATE,
  supplier_ledger_id UUID REFERENCES ledgers(id),

  -- Quality & Attributes
  quality_grade VARCHAR(10),            -- 'A', 'B', 'C', 'Reject'
  attributes JSONB,                     -- Flexible attributes (width, GSM, etc.)

  -- Status Tracking
  status VARCHAR(50) DEFAULT 'available',
  -- Status values:
  -- 'available' - In stock, ready to sell
  -- 'reserved' - Allocated to order but not dispatched
  -- 'dispatched' - Sold and sent to customer
  -- 'sent_for_processing' - Sent to job worker (dyeing/printing)
  -- 'consumed' - Used in production/processing

  -- Voucher Links
  receipt_voucher_id UUID REFERENCES vouchers(id),
  dispatch_voucher_id UUID REFERENCES vouchers(id),

  -- Job Work Tracking (for processed rolls)
  source_unit_id UUID REFERENCES stock_units(id), -- Original greige roll (if dyed/printed)
  processing_notes TEXT,                           -- Processing details

  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stock_units_company ON stock_units(company_id);
CREATE INDEX idx_stock_units_item ON stock_units(stock_item_id);
CREATE INDEX idx_stock_units_batch ON stock_units(batch_id);
CREATE INDEX idx_stock_units_qr ON stock_units(qr_code);
CREATE INDEX idx_stock_units_godown ON stock_units(godown_id);
CREATE INDEX idx_stock_units_status ON stock_units(company_id, status);
CREATE INDEX idx_stock_units_quality ON stock_units(quality_grade);
CREATE INDEX idx_stock_units_source ON stock_units(source_unit_id);

ALTER TABLE stock_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see company stock units" ON stock_units FOR ALL
  USING (company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid);
```

---

## Data Seeding

### Seed 28 Tally Groups

```sql
INSERT INTO groups (company_id, name, tally_group_name, nature, is_system_group) VALUES
  -- Assets
  ('{company_id}', 'Current Assets', 'Current Assets', 'Asset', true),
  ('{company_id}', 'Bank Accounts', 'Bank Accounts', 'Asset', true),
  ('{company_id}', 'Cash in Hand', 'Cash-in-Hand', 'Asset', true),
  ('{company_id}', 'Stock in Hand', 'Stock-in-Hand', 'Asset', true),
  ('{company_id}', 'Sundry Debtors', 'Sundry Debtors', 'Asset', true),
  ('{company_id}', 'Fixed Assets', 'Fixed Assets', 'Asset', true),

  -- Liabilities
  ('{company_id}', 'Current Liabilities', 'Current Liabilities', 'Liability', true),
  ('{company_id}', 'Sundry Creditors', 'Sundry Creditors', 'Liability', true),
  ('{company_id}', 'Duties & Taxes', 'Duties & Taxes', 'Liability', true),
  ('{company_id}', 'Capital Account', 'Capital Account', 'Liability', true),

  -- Income
  ('{company_id}', 'Sales Accounts', 'Sales Accounts', 'Income', true),
  ('{company_id}', 'Direct Incomes', 'Direct Incomes', 'Income', true),
  ('{company_id}', 'Indirect Incomes', 'Indirect Incomes', 'Income', true),

  -- Expenses
  ('{company_id}', 'Purchase Accounts', 'Purchase Accounts', 'Expense', true),
  ('{company_id}', 'Direct Expenses', 'Direct Expenses', 'Expense', true),
  ('{company_id}', 'Indirect Expenses', 'Indirect Expenses', 'Expense', true);
```

### Seed 24 Voucher Types

```sql
INSERT INTO voucher_types (company_id, name, tally_voucher_type, category, is_system_type) VALUES
  -- Accounting
  ('{company_id}', 'Payment', 'Payment', 'accounting', true),
  ('{company_id}', 'Receipt', 'Receipt', 'accounting', true),
  ('{company_id}', 'Journal', 'Journal', 'accounting', true),
  ('{company_id}', 'Contra', 'Contra', 'accounting', true),

  -- Inventory
  ('{company_id}', 'Sales', 'Sales', 'inventory', true),
  ('{company_id}', 'Purchase', 'Purchase', 'inventory', true),
  ('{company_id}', 'Receipt Note', 'Receipt Note', 'inventory', true),
  ('{company_id}', 'Delivery Note', 'Delivery Note', 'inventory', true),
  ('{company_id}', 'Stock Journal', 'Stock Journal', 'inventory', true);
```

---

## Real-World Scenarios

### Scenario 1: Direct Purchase (No Batch)

**User buys 1 roll directly from local market:**

```sql
-- Step 1: Ensure stock item exists
-- Stock Item: "Cotton Print - Red - 44\""

-- Step 2: Create stock unit without batch
INSERT INTO stock_units (
  company_id, stock_item_id, qr_code, batch_id,
  godown_id, quantity, unit,
  purchase_rate, purchase_date,
  quality_grade, status
) VALUES (
  'company-uuid',
  'red-cotton-item-uuid',
  'QR-001',
  NULL,  -- No batch!
  'main-godown-uuid',
  25.0,
  'meter',
  180.00,
  '2025-01-15',
  'A',
  'available'
);
```

**Result:**
- Single roll tracked independently
- No batch association
- Ready for sale

---

### Scenario 2: Supplier Purchase Receipt (With Batch)

**Receive 50 rolls from Supplier ABC on Invoice #INV-2025-123:**

```sql
-- Step 1: Create purchase receipt batch
INSERT INTO barcode_batches (
  company_id, batch_number, batch_name, batch_date,
  batch_type, status,
  stock_item_id,
  supplier_ledger_id, supplier_invoice_number, supplier_invoice_date,
  godown_id
) VALUES (
  'company-uuid',
  'PUR-ABC-2025-001',
  'Purchase from ABC Traders - INV-123',
  '2025-01-15',
  'purchase_receipt',
  'received',
  'red-cotton-item-uuid',
  'abc-traders-ledger-uuid',
  'INV-2025-123',
  '2025-01-14',
  'main-godown-uuid'
);

-- Step 2: Create 50 stock units linked to this batch
-- (In practice, this would be done in a loop or bulk insert)
INSERT INTO stock_units (
  company_id, stock_item_id, batch_id,
  qr_code, godown_id,
  quantity, unit, purchase_rate, purchase_date,
  supplier_ledger_id, quality_grade, status
) VALUES
  ('company-uuid', 'red-cotton-item-uuid', 'batch-uuid', 'QR-101', 'godown-uuid', 25.0, 'meter', 180, '2025-01-15', 'abc-ledger-uuid', 'A', 'available'),
  ('company-uuid', 'red-cotton-item-uuid', 'batch-uuid', 'QR-102', 'godown-uuid', 22.0, 'meter', 180, '2025-01-15', 'abc-ledger-uuid', 'A', 'available'),
  ('company-uuid', 'red-cotton-item-uuid', 'batch-uuid', 'QR-103', 'godown-uuid', 20.0, 'meter', 180, '2025-01-15', 'abc-ledger-uuid', 'B', 'available');
  -- ... (47 more rolls)
```

**Result:**
- All 50 rolls grouped by purchase batch
- Can query "Which rolls came from ABC Invoice #123?"
- Batch tracks supplier, invoice, date

---

### Scenario 3: Dyeing Job Work (With Batch + Quality Tracking)

**Send 5 greige rolls (100m) for dyeing, receive back with mixed quality:**

```sql
-- BEFORE: We have greige fabric stock items
-- Stock Item 1: "Cotton Greige - 44\"" (undyed)
-- Stock Item 2: "Cotton Print - Red - 44\"" (target dyed fabric)

-- Step 1: Create dyeing batch
INSERT INTO barcode_batches (
  company_id, batch_number, batch_name, batch_date,
  batch_type, status,
  stock_item_id,  -- Target stock item (red dyed)
  job_worker_ledger_id,
  expected_quantity, processing_cost,
  godown_id
) VALUES (
  'company-uuid',
  'DYE-2025-001',
  'Dyeing Batch - Red Color',
  '2025-01-10',
  'dyeing',
  'created',
  'red-dyed-item-uuid',  -- Target: Red dyed fabric
  'xyz-dyers-ledger-uuid',
  100.0,
  5000.00,
  'main-godown-uuid'
);

-- Step 2: Update greige rolls - send to job worker
UPDATE stock_units
SET
  batch_id = 'dye-batch-uuid',
  status = 'sent_for_processing'
WHERE id IN (
  'greige-qr-001',
  'greige-qr-002',
  'greige-qr-003',
  'greige-qr-004',
  'greige-qr-005'
);

-- Step 3: Update batch status when sent
UPDATE barcode_batches
SET status = 'sent', outward_voucher_id = 'delivery-note-voucher-uuid'
WHERE id = 'dye-batch-uuid';

-- ... (Wait for job worker to complete dyeing) ...

-- Step 4: Receive back - create NEW red dyed stock units
INSERT INTO stock_units (
  company_id, stock_item_id, batch_id,
  qr_code, godown_id, quantity, unit,
  purchase_rate, quality_grade, status,
  source_unit_id, processing_notes
) VALUES
  -- Success: Roll 1 (slight shrinkage)
  ('company-uuid', 'red-dyed-item-uuid', 'dye-batch-uuid',
   'QR-D001', 'godown-uuid', 19.5, 'meter',
   68.00, 'A', 'available',
   'greige-qr-001', 'Dyed successfully, 2.5% shrinkage'),

  -- Success: Roll 2
  ('company-uuid', 'red-dyed-item-uuid', 'dye-batch-uuid',
   'QR-D002', 'godown-uuid', 17.8, 'meter',
   68.00, 'A', 'available',
   'greige-qr-002', 'Dyed successfully'),

  -- Success but Grade B: Roll 4 (minor shade variation)
  ('company-uuid', 'red-dyed-item-uuid', 'dye-batch-uuid',
   'QR-D004', 'godown-uuid', 21.5, 'meter',
   68.00, 'B', 'available',
   'greige-qr-004', 'Minor shade variation'),

  -- Success: Roll 5
  ('company-uuid', 'red-dyed-item-uuid', 'dye-batch-uuid',
   'QR-D005', 'godown-uuid', 14.8, 'meter',
   68.00, 'A', 'available',
   'greige-qr-005', 'Dyed successfully');

-- Step 5: Handle FAILED roll (stays as greige, marked Reject)
UPDATE stock_units
SET
  quality_grade = 'Reject',
  status = 'available',
  processing_notes = 'Dyeing failed - severe color variation'
WHERE id = 'greige-qr-003';

-- Step 6: Update batch with final results
UPDATE barcode_batches
SET
  status = 'partial',  -- Partial success
  success_quantity = 73.6,  -- 19.5 + 17.8 + 21.5 + 14.8
  reject_quantity = 24.0,
  cost_per_unit = 5000.00 / 73.6,  -- ₹68/meter
  failure_reason = 'QR-003 (24m) had severe color variation - rejected',
  inward_voucher_id = 'receipt-note-voucher-uuid'
WHERE id = 'dye-batch-uuid';
```

**Result:**
- Batch tracks: 76% success rate (73.6m / 97.6m actual vs 100m expected)
- 4 new red dyed rolls created (Grade A and B)
- 1 failed roll stays as greige Reject
- Cost: ₹68/meter for successful output
- Full traceability: Each dyed roll links back to original greige roll

---

## Query Examples

### Get all rolls from a specific batch

```sql
SELECT
  su.qr_code,
  su.quantity,
  su.quality_grade,
  su.status,
  si.name as stock_item_name,
  bb.batch_number,
  bb.batch_type
FROM stock_units su
JOIN stock_items si ON su.stock_item_id = si.id
JOIN barcode_batches bb ON su.batch_id = bb.id
WHERE bb.batch_number = 'DYE-2025-001'
ORDER BY su.quality_grade, su.qr_code;
```

### Batch success rate report

```sql
SELECT
  bb.batch_number,
  bb.batch_type,
  si.name as stock_item,
  bb.expected_quantity,
  bb.success_quantity,
  bb.reject_quantity,
  ROUND((bb.success_quantity / NULLIF(bb.expected_quantity, 0) * 100), 2) as success_rate_pct,
  bb.cost_per_unit,
  bb.status,
  bb.failure_reason
FROM barcode_batches bb
JOIN stock_items si ON bb.stock_item_id = si.id
WHERE bb.batch_type IN ('dyeing', 'printing', 'finishing')
  AND bb.company_id = 'company-uuid'
ORDER BY bb.batch_date DESC;
```

### Job worker performance

```sql
SELECT
  l.name as job_worker,
  bb.batch_type,
  COUNT(*) as total_batches,
  SUM(bb.expected_quantity) as total_expected,
  SUM(bb.success_quantity) as total_success,
  SUM(bb.reject_quantity) as total_rejects,
  ROUND(AVG(bb.success_quantity / NULLIF(bb.expected_quantity, 0) * 100), 2) as avg_success_rate,
  ROUND(AVG(bb.cost_per_unit), 2) as avg_cost_per_meter
FROM barcode_batches bb
JOIN ledgers l ON bb.job_worker_ledger_id = l.id
WHERE bb.batch_type IN ('dyeing', 'printing', 'finishing')
  AND bb.company_id = 'company-uuid'
GROUP BY l.name, bb.batch_type
ORDER BY avg_success_rate DESC;
```

### Find source of a dyed roll (traceability)

```sql
SELECT
  dyed.qr_code as dyed_roll,
  dyed.quantity as dyed_quantity,
  dyed.quality_grade,
  greige.qr_code as source_greige_roll,
  greige.quantity as original_quantity,
  (greige.quantity - dyed.quantity) as shrinkage,
  ROUND(((greige.quantity - dyed.quantity) / greige.quantity * 100), 2) as shrinkage_pct
FROM stock_units dyed
JOIN stock_units greige ON dyed.source_unit_id = greige.id
WHERE dyed.qr_code = 'QR-D001';
```

### Stock availability by quality grade

```sql
SELECT
  si.name,
  su.quality_grade,
  COUNT(*) as roll_count,
  SUM(su.quantity) as total_quantity,
  AVG(su.purchase_rate) as avg_rate
FROM stock_units su
JOIN stock_items si ON su.stock_item_id = si.id
WHERE su.status = 'available'
  AND su.company_id = 'company-uuid'
GROUP BY si.name, su.quality_grade
ORDER BY si.name, su.quality_grade;
```

---

## Summary

### ✅ Tally-Compatible Base
- Stock Groups → Stock Items (each color separate)
- Matches Tally Prime structure exactly
- Exportable to Tally XML

### ✅ QR Enhancement (Beyond Tally)
- Individual roll tracking with QR codes
- Batches for production/purchase grouping
- Quality grading per roll
- Complete traceability

### ✅ All Scenarios Supported
1. **Direct purchases** - No batch, single roll
2. **Supplier receipts** - Purchase batch grouping
3. **Job work processing** - Dyeing/printing batches with quality tracking
4. **Quality grading** - A/B/C/Reject at roll level
5. **Traceability** - Track dyed roll back to greige source

---

**Next:** See [Feature Specifications](./03-Feature-Specifications.md) for detailed user stories.
