-- Add GST compliance fields to invoices and invoice_items tables
-- This migration adds all mandatory fields required for GST-compliant invoices per Section 31 CGST Act 2017

-- Add GST compliance fields to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS place_of_supply VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_type VARCHAR(20) DEFAULT 'B2C';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reverse_charge BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cgst_amount NUMERIC(15,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sgst_amount NUMERIC(15,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS igst_amount NUMERIC(15,2) DEFAULT 0;

-- Add transport details to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS vehicle_number VARCHAR(50);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS lr_rr_number VARCHAR(50);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS lr_rr_date DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS transport_mode VARCHAR(50);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS transporter_name VARCHAR(200);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS distance_km NUMERIC(10,2);

-- Add E-Way Bill fields to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS e_way_bill_number VARCHAR(20);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS e_way_bill_date DATE;

-- Add terms and conditions
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;

-- Add HSN/SAC codes and UOM to invoice_items
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(20);
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS sac_code VARCHAR(20);
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS unit_of_measurement VARCHAR(20) DEFAULT 'PCS';

-- Add helpful comment
COMMENT ON COLUMN invoices.place_of_supply IS 'State name and code where goods/services are supplied, e.g., Maharashtra (27)';
COMMENT ON COLUMN invoices.invoice_type IS 'B2B (with GSTIN) or B2C (without GSTIN)';
COMMENT ON COLUMN invoices.reverse_charge IS 'Indicates if tax is payable by recipient under reverse charge mechanism';
COMMENT ON COLUMN invoice_items.hsn_code IS 'Harmonized System of Nomenclature code for goods';
COMMENT ON COLUMN invoice_items.sac_code IS 'Services Accounting Code for services';
COMMENT ON COLUMN invoice_items.unit_of_measurement IS 'Unit of measurement like PCS, KG, MTR, etc.';
