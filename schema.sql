[
  {
    "table_name": "account_groups",
    "table_definition": "\nCREATE TABLE account_groups (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  name character varying(100) NOT NULL,\n  parent_group_id uuid,\n  nature character varying(20) NOT NULL,\n  is_system_group boolean DEFAULT false,\n  display_order integer DEFAULT 0,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: parent_group_id -> account_groups(id),\n  FK: company_id -> companies(id)"
  },
  {
    "table_name": "accounting_periods",
    "table_definition": "\nCREATE TABLE accounting_periods (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  period_name character varying(50) NOT NULL,\n  start_date date NOT NULL,\n  end_date date NOT NULL,\n  is_closed boolean DEFAULT false,\n  closed_by uuid,\n  closed_date timestamp with time zone,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: company_id -> companies(id),\n  FK: closed_by -> users(id)"
  },
  {
    "table_name": "asset_types",
    "table_definition": "\nCREATE TABLE asset_types (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  code character varying(3) NOT NULL,\n  name character varying(50) NOT NULL,\n  symbol character varying(5) NOT NULL,\n  is_base_currency boolean DEFAULT false,\n  is_active boolean DEFAULT true,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);"
  },
  {
    "table_name": "bank_statements",
    "table_definition": "\nCREATE TABLE bank_statements (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  bank_account_id uuid NOT NULL,\n  statement_date date NOT NULL,\n  transaction_type character varying(10),\n  amount numeric NOT NULL,\n  reference_number character varying(100),\n  description text,\n  reconciled boolean DEFAULT false,\n  reconciled_with_type character varying(20),\n  reconciled_with_id uuid,\n  created_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: bank_account_id -> cash_bank_accounts(id)"
  },
  {
    "table_name": "barcode_batch_items",
    "table_definition": "\nCREATE TABLE barcode_batch_items (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  batch_id uuid NOT NULL,\n  stock_unit_id uuid NOT NULL,\n  barcode_generated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: batch_id -> barcode_batches(id),\n  FK: stock_unit_id -> stock_units(id)"
  },
  {
    "table_name": "barcode_batches",
    "table_definition": "\nCREATE TABLE barcode_batches (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  warehouse_id uuid NOT NULL,\n  batch_name character varying(100) NOT NULL,\n  layout_config jsonb,\n  fields_selected ARRAY,\n  pdf_url text,\n  status character varying(20) NOT NULL DEFAULT 'generated'::character varying,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now(),\n  created_by uuid,\n  modified_by uuid,\n  receipt_item_id uuid\n);\n-- Foreign Keys:\n-- FK: company_id -> companies(id),\n  FK: receipt_item_id -> goods_receipt_items(id),\n  FK: modified_by -> users(id),\n  FK: created_by -> users(id),\n  FK: warehouse_id -> warehouses(id)"
  },
  {
    "table_name": "batches",
    "table_definition": "\nCREATE TABLE batches (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  batch_number character varying(50) NOT NULL,\n  created_by uuid,\n  status character varying(20) NOT NULL DEFAULT 'draft'::character varying,\n  entry_count integer DEFAULT 0,\n  total_debit numeric DEFAULT 0,\n  total_credit numeric DEFAULT 0,\n  submitted_date timestamp with time zone,\n  approved_by uuid,\n  approved_date timestamp with time zone,\n  rejection_reason text,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: approved_by -> users(id),\n  FK: company_id -> companies(id),\n  FK: created_by -> users(id)"
  },
  {
    "table_name": "cash_bank_accounts",
    "table_definition": "\nCREATE TABLE cash_bank_accounts (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  account_name character varying(100) NOT NULL,\n  account_type character varying(20) NOT NULL,\n  account_number character varying(50),\n  bank_name character varying(100),\n  ifsc_code character varying(11),\n  current_balance numeric DEFAULT 0,\n  currency_id uuid,\n  is_active boolean DEFAULT true,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: currency_id -> asset_types(id),\n  FK: company_id -> companies(id)"
  },
  {
    "table_name": "cash_denominations",
    "table_definition": "\nCREATE TABLE cash_denominations (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  cash_account_id uuid NOT NULL,\n  denomination_date date NOT NULL,\n  notes_2000 integer DEFAULT 0,\n  notes_500 integer DEFAULT 0,\n  notes_200 integer DEFAULT 0,\n  notes_100 integer DEFAULT 0,\n  notes_50 integer DEFAULT 0,\n  notes_20 integer DEFAULT 0,\n  notes_10 integer DEFAULT 0,\n  coins_10 integer DEFAULT 0,\n  coins_5 integer DEFAULT 0,\n  coins_2 integer DEFAULT 0,\n  coins_1 integer DEFAULT 0,\n  total_calculated numeric,\n  total_declared numeric NOT NULL,\n  variance numeric,\n  counted_by uuid,\n  verified_by uuid,\n  created_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: counted_by -> users(id),\n  FK: cash_account_id -> cash_bank_accounts(id),\n  FK: verified_by -> users(id)"
  },
  {
    "table_name": "catalog_configurations",
    "table_definition": "\nCREATE TABLE catalog_configurations (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  catalog_name character varying(100),\n  logo_url text,\n  primary_color character varying(7),\n  secondary_color character varying(7),\n  font_family character varying(50),\n  favicon_url text,\n  show_fields jsonb,\n  filter_options jsonb,\n  sort_options jsonb,\n  terms_conditions text,\n  return_policy text,\n  privacy_policy text,\n  contact_phone character varying(15),\n  contact_email character varying(100),\n  contact_address text,\n  is_public boolean DEFAULT false,\n  domain_slug character varying(50),\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now(),\n  created_by uuid,\n  modified_by uuid\n);\n-- Foreign Keys:\n-- FK: modified_by -> users(id),\n  FK: created_by -> users(id),\n  FK: company_id -> companies(id)"
  },
  {
    "table_name": "colors",
    "table_definition": "\nCREATE TABLE colors (\n  id uuid NOT NULL DEFAULT gen_random_uuid(),\n  company_id uuid NOT NULL,\n  name character varying(100) NOT NULL,\n  hex_code character varying(7) NOT NULL,\n  usage_count integer DEFAULT 1,\n  created_at timestamp with time zone DEFAULT now(),\n  updated_at timestamp with time zone DEFAULT now(),\n  pantone_code character varying(20)\n);\n-- Foreign Keys:\n-- FK: company_id -> companies(id)"
  },
  {
    "table_name": "companies",
    "table_definition": "\nCREATE TABLE companies (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  name character varying(100) NOT NULL,\n  address_line1 character varying(255),\n  address_line2 character varying(255),\n  city character varying(100),\n  state character varying(100),\n  country character varying(100) DEFAULT 'India'::character varying,\n  pin_code character varying(10),\n  business_type character varying(50),\n  gst_number character varying(15),\n  pan_number character varying(10),\n  logo_url text,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now(),\n  created_by uuid,\n  modified_by uuid,\n  deleted_at timestamp with time zone,\n  is_demo boolean DEFAULT false\n);"
  },
  {
    "table_name": "compliance_limits",
    "table_definition": "\nCREATE TABLE compliance_limits (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  limit_type character varying(20) NOT NULL,\n  limit_amount numeric NOT NULL,\n  effective_from date NOT NULL,\n  effective_to date,\n  description text,\n  created_at timestamp with time zone NOT NULL DEFAULT now()\n);"
  },
  {
    "table_name": "contra_entries",
    "table_definition": "\nCREATE TABLE contra_entries (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  contra_number character varying(50) NOT NULL,\n  from_account_id uuid NOT NULL,\n  to_account_id uuid NOT NULL,\n  amount numeric NOT NULL,\n  transfer_date date NOT NULL,\n  narration text,\n  journal_entry_id uuid,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: company_id -> companies(id),\n  FK: to_account_id -> cash_bank_accounts(id),\n  FK: from_account_id -> cash_bank_accounts(id),\n  FK: journal_entry_id -> journal_entries(id)"
  },
  {
    "table_name": "e_invoice_logs",
    "table_definition": "\nCREATE TABLE e_invoice_logs (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  invoice_id uuid NOT NULL,\n  request_date timestamp with time zone NOT NULL DEFAULT now(),\n  api_endpoint character varying(200),\n  request_payload jsonb,\n  response_payload jsonb,\n  irn character varying(100),\n  ack_number bigint,\n  ack_date timestamp with time zone,\n  status character varying(20),\n  error_message text,\n  cost_incurred numeric DEFAULT 0.50,\n  created_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: invoice_id -> invoices(id)"
  },
  {
    "table_name": "exchange_rates",
    "table_definition": "\nCREATE TABLE exchange_rates (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  from_currency_id uuid NOT NULL,\n  to_currency_id uuid NOT NULL,\n  rate numeric NOT NULL,\n  effective_date date NOT NULL,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: from_currency_id -> asset_types(id),\n  FK: to_currency_id -> asset_types(id)"
  },
  {
    "table_name": "expenses",
    "table_definition": "\nCREATE TABLE expenses (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  expense_number character varying(50) NOT NULL,\n  category character varying(50) NOT NULL,\n  amount numeric NOT NULL,\n  payment_method character varying(20) NOT NULL,\n  expense_date date NOT NULL,\n  description text,\n  ledger_account_id uuid,\n  payment_account_id uuid,\n  receipt_number character varying(50),\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: payment_account_id -> cash_bank_accounts(id),\n  FK: ledger_account_id -> ledger_accounts(id),\n  FK: company_id -> companies(id)"
  },
  {
    "table_name": "goods_dispatch_items",
    "table_definition": "\nCREATE TABLE goods_dispatch_items (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  dispatch_id uuid NOT NULL,\n  stock_unit_id uuid NOT NULL,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now(),\n  dispatched_quantity numeric,\n  sales_order_item_id uuid,\n  invoiced_quantity numeric DEFAULT 0\n);\n-- Foreign Keys:\n-- FK: dispatch_id -> goods_dispatches(id),\n  FK: sales_order_item_id -> sales_order_items(id),\n  FK: sales_order_item_id -> sales_order_items(id),\n  FK: stock_unit_id -> stock_units(id),\n  FK: company_id -> companies(id)"
  },
  {
    "table_name": "goods_dispatches",
    "table_definition": "\nCREATE TABLE goods_dispatches (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  warehouse_id uuid NOT NULL,\n  dispatch_number character varying(50) NOT NULL,\n  dispatch_to_partner_id uuid,\n  dispatch_to_warehouse_id uuid,\n  agent_id uuid,\n  link_type character varying(20),\n  sales_order_id uuid,\n  job_work_id uuid,\n  dispatch_date date NOT NULL DEFAULT CURRENT_DATE,\n  due_date date,\n  invoice_number character varying(50),\n  invoice_amount numeric,\n  transport_details text,\n  status character varying(20) NOT NULL DEFAULT 'dispatched'::character varying,\n  notes text,\n  attachments ARRAY,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now(),\n  created_by uuid,\n  modified_by uuid,\n  deleted_at timestamp with time zone\n);\n-- Foreign Keys:\n-- FK: created_by -> users(id),\n  FK: company_id -> companies(id),\n  FK: warehouse_id -> warehouses(id),\n  FK: dispatch_to_partner_id -> partners(id),\n  FK: dispatch_to_warehouse_id -> warehouses(id),\n  FK: agent_id -> partners(id),\n  FK: sales_order_id -> sales_orders(id),\n  FK: job_work_id -> job_works(id),\n  FK: modified_by -> users(id)"
  },
  {
    "table_name": "goods_receipt_items",
    "table_definition": "\nCREATE TABLE goods_receipt_items (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  receipt_id uuid NOT NULL,\n  product_id uuid NOT NULL,\n  quantity_received integer NOT NULL,\n  notes text,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now(),\n  quality_grade character varying(10),\n  wastage numeric DEFAULT 0,\n  location_description text,\n  variant_combination jsonb,\n  manufacturing_date date\n);\n-- Foreign Keys:\n-- FK: receipt_id -> goods_receipts(id),\n  FK: product_id -> products(id),\n  FK: company_id -> companies(id)"
  },
  {
    "table_name": "goods_receipts",
    "table_definition": "\nCREATE TABLE goods_receipts (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  warehouse_id uuid NOT NULL,\n  receipt_number character varying(50) NOT NULL,\n  issued_by_partner_id uuid,\n  issued_by_warehouse_id uuid,\n  agent_id uuid,\n  link_type character varying(20),\n  sales_order_id uuid,\n  job_work_id uuid,\n  receipt_date date NOT NULL DEFAULT CURRENT_DATE,\n  invoice_number character varying(50),\n  invoice_amount numeric,\n  transport_details text,\n  notes text,\n  attachments ARRAY,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now(),\n  created_by uuid,\n  modified_by uuid,\n  deleted_at timestamp with time zone\n);\n-- Foreign Keys:\n-- FK: warehouse_id -> warehouses(id),\n  FK: issued_by_partner_id -> partners(id),\n  FK: issued_by_warehouse_id -> warehouses(id),\n  FK: agent_id -> partners(id),\n  FK: sales_order_id -> sales_orders(id),\n  FK: job_work_id -> job_works(id),\n  FK: created_by -> users(id),\n  FK: modified_by -> users(id),\n  FK: company_id -> companies(id)"
  },
  {
    "table_name": "gst_settings",
    "table_definition": "\nCREATE TABLE gst_settings (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  gstin character varying(15) NOT NULL,\n  state_code character varying(2) NOT NULL,\n  default_gst_rate numeric DEFAULT 18.00,\n  e_invoice_enabled boolean DEFAULT false,\n  e_invoice_threshold numeric DEFAULT 500000,\n  eway_bill_enabled boolean DEFAULT false,\n  eway_bill_threshold numeric DEFAULT 50000,\n  gst_filing_enabled boolean DEFAULT false,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: company_id -> companies(id)"
  },
  {
    "table_name": "inventory_summary",
    "table_definition": "\nCREATE TABLE inventory_summary (\n  company_id uuid,\n  product_id uuid,\n  product_name character varying(200),\n  product_number character varying(50),\n  material character varying(50),\n  color character varying(50),\n  warehouse_id uuid,\n  warehouse_name character varying(100),\n  total_units bigint,\n  available_units bigint,\n  reserved_units bigint,\n  dispatched_units bigint,\n  total_quantity numeric,\n  available_quantity numeric,\n  measuring_unit character varying(20)\n);"
  },
  {
    "table_name": "invoice_audit_log",
    "table_definition": "\nCREATE TABLE invoice_audit_log (\n  id uuid NOT NULL DEFAULT gen_random_uuid(),\n  invoice_id uuid NOT NULL,\n  changed_at timestamp with time zone NOT NULL DEFAULT now(),\n  changed_by uuid NOT NULL,\n  changes jsonb NOT NULL,\n  change_type character varying(20) NOT NULL,\n  created_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: invoice_id -> invoices(id),\n  FK: changed_by -> users(id)"
  },
  {
    "table_name": "invoice_items",
    "table_definition": "\nCREATE TABLE invoice_items (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  invoice_id uuid NOT NULL,\n  dispatch_item_id uuid,\n  product_id uuid NOT NULL,\n  description text,\n  quantity numeric NOT NULL,\n  unit_rate numeric NOT NULL,\n  discount_percent numeric DEFAULT 0,\n  discount_amount numeric DEFAULT 0,\n  taxable_amount numeric NOT NULL,\n  cgst_rate numeric DEFAULT 0,\n  cgst_amount numeric DEFAULT 0,\n  sgst_rate numeric DEFAULT 0,\n  sgst_amount numeric DEFAULT 0,\n  igst_rate numeric DEFAULT 0,\n  igst_amount numeric DEFAULT 0,\n  line_total numeric NOT NULL,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: company_id -> companies(id),\n  FK: invoice_id -> invoices(id),\n  FK: dispatch_item_id -> goods_dispatch_items(id),\n  FK: product_id -> products(id)"
  },
  {
    "table_name": "invoices",
    "table_definition": "\nCREATE TABLE invoices (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  invoice_number character varying(50) NOT NULL,\n  customer_id uuid NOT NULL,\n  dispatch_id uuid,\n  invoice_date date NOT NULL,\n  due_date date,\n  subtotal numeric NOT NULL,\n  gst_amount numeric DEFAULT 0,\n  total_amount numeric NOT NULL,\n  payment_status character varying(20) DEFAULT 'unpaid'::character varying,\n  currency_id uuid,\n  exchange_rate numeric DEFAULT 1.0000,\n  total_in_base_currency numeric,\n  tally_voucher_guid character varying(100),\n  e_invoice_irn character varying(100),\n  e_invoice_ack_no bigint,\n  e_invoice_ack_date timestamp with time zone,\n  e_invoice_qr text,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now(),\n  status character varying(20) DEFAULT 'draft'::character varying,\n  discount_amount numeric DEFAULT 0,\n  adjustment_amount numeric DEFAULT 0,\n  notes text,\n  finalized_at timestamp with time zone,\n  finalized_by uuid,\n  total_paid numeric DEFAULT 0,\n  balance_due numeric,\n  edited_at timestamp with time zone,\n  edited_by uuid,\n  credit_note_for uuid,\n  is_credit_note boolean DEFAULT false\n);\n-- Foreign Keys:\n-- FK: currency_id -> asset_types(id),\n  FK: company_id -> companies(id),\n  FK: edited_by -> users(id),\n  FK: finalized_by -> users(id),\n  FK: customer_id -> partners(id),\n  FK: dispatch_id -> goods_dispatches(id),\n  FK: credit_note_for -> invoices(id)"
  },
  {
    "table_name": "job_work_finished_goods",
    "table_definition": "\nCREATE TABLE job_work_finished_goods (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  job_work_id uuid NOT NULL,\n  product_id uuid NOT NULL,\n  expected_quantity numeric NOT NULL,\n  received_quantity numeric DEFAULT 0,\n  pending_quantity numeric,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: job_work_id -> job_works(id),\n  FK: company_id -> companies(id),\n  FK: product_id -> products(id)"
  },
  {
    "table_name": "job_work_progress",
    "table_definition": "\nCREATE TABLE job_work_progress (\n  company_id uuid,\n  job_work_id uuid,\n  job_number character varying(50),\n  job_type character varying(50),\n  status character varying(20),\n  start_date date,\n  due_date date,\n  vendor_name text,\n  vendor_company character varying(200),\n  warehouse_name character varying(100),\n  raw_required_qty numeric,\n  raw_dispatched_qty numeric,\n  raw_pending_qty numeric,\n  finished_expected_qty numeric,\n  finished_received_qty numeric,\n  finished_pending_qty numeric,\n  completion_percentage numeric\n);"
  },
  {
    "table_name": "job_work_raw_materials",
    "table_definition": "\nCREATE TABLE job_work_raw_materials (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  job_work_id uuid NOT NULL,\n  product_id uuid NOT NULL,\n  required_quantity numeric NOT NULL,\n  dispatched_quantity numeric DEFAULT 0,\n  pending_quantity numeric,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: product_id -> products(id),\n  FK: company_id -> companies(id),\n  FK: job_work_id -> job_works(id)"
  },
  {
    "table_name": "job_works",
    "table_definition": "\nCREATE TABLE job_works (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  warehouse_id uuid NOT NULL,\n  job_number character varying(50) NOT NULL,\n  job_type character varying(50) DEFAULT 'processing'::character varying,\n  partner_id uuid NOT NULL,\n  agent_id uuid,\n  start_date date,\n  expected_delivery_date date NOT NULL,\n  sales_order_id uuid,\n  status character varying(20) NOT NULL DEFAULT 'pending'::character varying,\n  job_description text,\n  attachments ARRAY,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now(),\n  created_by uuid,\n  modified_by uuid,\n  deleted_at timestamp with time zone,\n  unit text\n);\n-- Foreign Keys:\n-- FK: partner_id -> partners(id),\n  FK: created_by -> users(id),\n  FK: sales_order_id -> sales_orders(id),\n  FK: agent_id -> partners(id),\n  FK: modified_by -> users(id),\n  FK: warehouse_id -> warehouses(id),\n  FK: company_id -> companies(id)"
  },
  {
    "table_name": "journal_entries",
    "table_definition": "\nCREATE TABLE journal_entries (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  batch_id uuid,\n  entry_number character varying(50) NOT NULL,\n  entry_date date NOT NULL,\n  transaction_type character varying(50) NOT NULL,\n  transaction_id uuid,\n  narration text,\n  tally_voucher_guid character varying(100),\n  is_opening_entry boolean DEFAULT false,\n  imported_from_tally boolean DEFAULT false,\n  created_by uuid,\n  approved_by uuid,\n  approval_date timestamp with time zone,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: company_id -> companies(id),\n  FK: created_by -> users(id),\n  FK: batch_id -> batches(id),\n  FK: approved_by -> users(id)"
  },
  {
    "table_name": "journal_entry_lines",
    "table_definition": "\nCREATE TABLE journal_entry_lines (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  journal_entry_id uuid NOT NULL,\n  ledger_account_id uuid NOT NULL,\n  debit_amount numeric DEFAULT 0,\n  credit_amount numeric DEFAULT 0,\n  bill_reference character varying(100),\n  currency_id uuid,\n  exchange_rate numeric DEFAULT 1.0000,\n  amount_in_base_currency numeric,\n  created_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: ledger_account_id -> ledger_accounts(id),\n  FK: journal_entry_id -> journal_entries(id),\n  FK: currency_id -> asset_types(id)"
  },
  {
    "table_name": "ledger_accounts",
    "table_definition": "\nCREATE TABLE ledger_accounts (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  account_group_id uuid NOT NULL,\n  name character varying(100) NOT NULL,\n  account_type character varying(50) NOT NULL,\n  partner_id uuid,\n  currency_id uuid,\n  current_balance numeric DEFAULT 0,\n  balance_type character varying(10),\n  is_system_ledger boolean DEFAULT false,\n  is_active boolean DEFAULT true,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: account_group_id -> account_groups(id),\n  FK: company_id -> companies(id),\n  FK: partner_id -> partners(id),\n  FK: currency_id -> asset_types(id)"
  },
  {
    "table_name": "opening_stock",
    "table_definition": "\nCREATE TABLE opening_stock (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  product_id uuid NOT NULL,\n  opening_quantity numeric NOT NULL,\n  opening_value numeric NOT NULL,\n  as_on_date date NOT NULL,\n  created_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: company_id -> companies(id),\n  FK: product_id -> products(id)"
  },
  {
    "table_name": "partner_verifications",
    "table_definition": "\nCREATE TABLE partner_verifications (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  partner_id uuid NOT NULL,\n  verification_type character varying(10),\n  verified_at timestamp with time zone NOT NULL DEFAULT now(),\n  verified_by uuid,\n  api_response jsonb,\n  legal_name character varying(200),\n  trade_name character varying(200),\n  address text,\n  state character varying(100),\n  is_verified boolean DEFAULT false,\n  verification_status character varying(20),\n  created_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: partner_id -> partners(id),\n  FK: verified_by -> users(id)"
  },
  {
    "table_name": "partners",
    "table_definition": "\nCREATE TABLE partners (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  first_name character varying(50) NOT NULL,\n  last_name character varying(50) NOT NULL,\n  company_name character varying(200),\n  phone_number character varying(15) NOT NULL,\n  email character varying(100),\n  partner_type character varying(20) NOT NULL,\n  gst_number character varying(15),\n  pan_number character varying(10),\n  address_line1 character varying(255),\n  address_line2 character varying(255),\n  city character varying(100),\n  state character varying(100),\n  country character varying(100) DEFAULT 'India'::character varying,\n  pin_code character varying(10),\n  notes text,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now(),\n  created_by uuid,\n  modified_by uuid,\n  deleted_at timestamp with time zone\n);\n-- Foreign Keys:\n-- FK: modified_by -> users(id),\n  FK: created_by -> users(id),\n  FK: company_id -> companies(id)"
  },
  {
    "table_name": "partners_with_computed",
    "table_definition": "\nCREATE TABLE partners_with_computed (\n  id uuid,\n  company_id uuid,\n  first_name character varying(50),\n  last_name character varying(50),\n  company_name character varying(200),\n  phone_number character varying(15),\n  email character varying(100),\n  partner_type character varying(20),\n  gst_number character varying(15),\n  pan_number character varying(10),\n  address_line1 character varying(255),\n  address_line2 character varying(255),\n  city character varying(100),\n  state character varying(100),\n  country character varying(100),\n  pin_code character varying(10),\n  notes text,\n  created_at timestamp with time zone,\n  updated_at timestamp with time zone,\n  created_by uuid,\n  modified_by uuid,\n  deleted_at timestamp with time zone,\n  partner_name text\n);"
  },
  {
    "table_name": "payments_made",
    "table_definition": "\nCREATE TABLE payments_made (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  payment_number character varying(50) NOT NULL,\n  supplier_id uuid NOT NULL,\n  bill_id uuid,\n  amount numeric NOT NULL,\n  payment_method character varying(20) NOT NULL,\n  payment_date date NOT NULL,\n  bank_account_id uuid,\n  cheque_number character varying(50),\n  currency_id uuid,\n  exchange_rate numeric DEFAULT 1.0000,\n  notes text,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: company_id -> companies(id),\n  FK: supplier_id -> partners(id),\n  FK: bill_id -> purchase_bills(id),\n  FK: bank_account_id -> cash_bank_accounts(id),\n  FK: currency_id -> asset_types(id)"
  },
  {
    "table_name": "payments_received",
    "table_definition": "\nCREATE TABLE payments_received (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  payment_number character varying(50) NOT NULL,\n  customer_id uuid NOT NULL,\n  invoice_id uuid,\n  amount numeric NOT NULL,\n  payment_method character varying(20) NOT NULL,\n  payment_date date NOT NULL,\n  bank_account_id uuid,\n  cheque_number character varying(50),\n  upi_ref character varying(100),\n  currency_id uuid,\n  exchange_rate numeric DEFAULT 1.0000,\n  notes text,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: bank_account_id -> cash_bank_accounts(id),\n  FK: company_id -> companies(id),\n  FK: customer_id -> partners(id),\n  FK: invoice_id -> invoices(id),\n  FK: currency_id -> asset_types(id)"
  },
  {
    "table_name": "permissions",
    "table_definition": "\nCREATE TABLE permissions (\n  id uuid NOT NULL DEFAULT gen_random_uuid(),\n  name character varying(100) NOT NULL,\n  category character varying(50) NOT NULL,\n  description text,\n  created_at timestamp with time zone NOT NULL DEFAULT now()\n);"
  },
  {
    "table_name": "petty_cash_expenses",
    "table_definition": "\nCREATE TABLE petty_cash_expenses (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  float_id uuid NOT NULL,\n  expense_number character varying(50) NOT NULL,\n  category character varying(50) NOT NULL,\n  amount numeric NOT NULL,\n  expense_date date NOT NULL,\n  description text,\n  receipt_number character varying(50),\n  approved_by uuid,\n  created_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: approved_by -> users(id),\n  FK: float_id -> petty_cash_floats(id)"
  },
  {
    "table_name": "petty_cash_floats",
    "table_definition": "\nCREATE TABLE petty_cash_floats (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  float_number character varying(50) NOT NULL,\n  custodian_id uuid NOT NULL,\n  float_amount numeric NOT NULL,\n  allocated_date date NOT NULL,\n  current_balance numeric DEFAULT 0,\n  status character varying(20) DEFAULT 'active'::character varying,\n  closed_date date,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: custodian_id -> users(id),\n  FK: company_id -> companies(id)"
  },
  {
    "table_name": "petty_cash_replenishments",
    "table_definition": "\nCREATE TABLE petty_cash_replenishments (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  float_id uuid NOT NULL,\n  replenishment_number character varying(50) NOT NULL,\n  amount numeric NOT NULL,\n  replenishment_date date NOT NULL,\n  payment_account_id uuid,\n  voucher_number character varying(50),\n  created_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: float_id -> petty_cash_floats(id),\n  FK: payment_account_id -> cash_bank_accounts(id)"
  },
  {
    "table_name": "product_variant_items",
    "table_definition": "\nCREATE TABLE product_variant_items (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  variant_id uuid NOT NULL,\n  product_id uuid NOT NULL,\n  variant_value character varying(100) NOT NULL,\n  display_order integer DEFAULT 0\n);\n-- Foreign Keys:\n-- FK: variant_id -> product_variants(id),\n  FK: product_id -> products(id)"
  },
  {
    "table_name": "product_variants",
    "table_definition": "\nCREATE TABLE product_variants (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  variant_name character varying(100) NOT NULL,\n  variant_type character varying(50),\n  display_order integer DEFAULT 0,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: company_id -> companies(id)"
  },
  {
    "table_name": "products",
    "table_definition": "\nCREATE TABLE products (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  product_number character varying(50) NOT NULL,\n  name character varying(200) NOT NULL,\n  show_on_catalog boolean DEFAULT true,\n  material character varying(50),\n  color character varying(50),\n  color_code character varying(7),\n  gsm integer,\n  thread_count_cm integer,\n  tags ARRAY,\n  measuring_unit character varying(20) NOT NULL,\n  cost_price_per_unit numeric,\n  selling_price_per_unit numeric,\n  min_stock_alert boolean DEFAULT false,\n  min_stock_threshold integer DEFAULT 0,\n  hsn_code character varying(20),\n  notes text,\n  product_images ARRAY,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now(),\n  created_by uuid,\n  modified_by uuid,\n  deleted_at timestamp with time zone\n);\n-- Foreign Keys:\n-- FK: company_id -> companies(id),\n  FK: created_by -> users(id),\n  FK: modified_by -> users(id)"
  },
  {
    "table_name": "purchase_bills",
    "table_definition": "\nCREATE TABLE purchase_bills (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  bill_number character varying(50) NOT NULL,\n  supplier_id uuid NOT NULL,\n  receipt_id uuid,\n  bill_date date NOT NULL,\n  due_date date,\n  subtotal numeric NOT NULL,\n  gst_amount numeric DEFAULT 0,\n  total_amount numeric NOT NULL,\n  payment_status character varying(20) DEFAULT 'unpaid'::character varying,\n  currency_id uuid,\n  exchange_rate numeric DEFAULT 1.0000,\n  total_in_base_currency numeric,\n  tally_voucher_guid character varying(100),\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: company_id -> companies(id),\n  FK: supplier_id -> partners(id),\n  FK: receipt_id -> goods_receipts(id),\n  FK: currency_id -> asset_types(id)"
  },
  {
    "table_name": "role_permissions",
    "table_definition": "\nCREATE TABLE role_permissions (\n  role_id uuid NOT NULL,\n  permission_id uuid NOT NULL,\n  created_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: permission_id -> permissions(id),\n  FK: role_id -> roles(id)"
  },
  {
    "table_name": "roles",
    "table_definition": "\nCREATE TABLE roles (\n  id uuid NOT NULL DEFAULT gen_random_uuid(),\n  name character varying(50) NOT NULL,\n  display_name character varying(100) NOT NULL,\n  description text,\n  is_system_role boolean DEFAULT true,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);"
  },
  {
    "table_name": "sales_order_items",
    "table_definition": "\nCREATE TABLE sales_order_items (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  sales_order_id uuid NOT NULL,\n  product_id uuid NOT NULL,\n  required_quantity numeric NOT NULL,\n  dispatched_quantity numeric DEFAULT 0,\n  pending_quantity numeric,\n  unit_rate numeric,\n  line_total numeric,\n  notes text,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: sales_order_id -> sales_orders(id),\n  FK: product_id -> products(id),\n  FK: company_id -> companies(id)"
  },
  {
    "table_name": "sales_order_status",
    "table_definition": "\nCREATE TABLE sales_order_status (\n  company_id uuid,\n  sales_order_id uuid,\n  order_number character varying(50),\n  status character varying(20),\n  order_date date,\n  expected_delivery_date date,\n  customer_name text,\n  customer_company character varying(200),\n  total_amount numeric,\n  total_items bigint,\n  total_required_qty numeric,\n  total_dispatched_qty numeric,\n  total_pending_qty numeric,\n  completion_percentage numeric\n);"
  },
  {
    "table_name": "sales_orders",
    "table_definition": "\nCREATE TABLE sales_orders (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  order_number character varying(50) NOT NULL,\n  customer_id uuid NOT NULL,\n  agent_id uuid,\n  order_date date NOT NULL DEFAULT CURRENT_DATE,\n  expected_delivery_date date NOT NULL,\n  fulfillment_warehouse_id uuid,\n  advance_amount numeric DEFAULT 0,\n  discount_amount numeric DEFAULT 0,\n  total_amount numeric DEFAULT 0,\n  status character varying(20) NOT NULL DEFAULT 'pending'::character varying,\n  notes text,\n  attachments ARRAY,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now(),\n  created_by uuid,\n  modified_by uuid,\n  deleted_at timestamp with time zone\n);\n-- Foreign Keys:\n-- FK: company_id -> companies(id),\n  FK: agent_id -> partners(id),\n  FK: fulfillment_warehouse_id -> warehouses(id),\n  FK: customer_id -> partners(id),\n  FK: created_by -> users(id),\n  FK: modified_by -> users(id)"
  },
  {
    "table_name": "stock_categories",
    "table_definition": "\nCREATE TABLE stock_categories (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  name character varying(100) NOT NULL,\n  description text,\n  is_active boolean DEFAULT true,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: company_id -> companies(id)"
  },
  {
    "table_name": "stock_groups",
    "table_definition": "\nCREATE TABLE stock_groups (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  name character varying(100) NOT NULL,\n  parent_group_id uuid,\n  description text,\n  is_system_group boolean DEFAULT false,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: parent_group_id -> stock_groups(id),\n  FK: company_id -> companies(id)"
  },
  {
    "table_name": "stock_units",
    "table_definition": "\nCREATE TABLE stock_units (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  product_id uuid NOT NULL,\n  warehouse_id uuid NOT NULL,\n  unit_number character varying(100) NOT NULL,\n  qr_code text,\n  size_quantity numeric NOT NULL,\n  wastage numeric DEFAULT 0,\n  quality_grade character varying(20) DEFAULT 'A'::character varying,\n  location_description text,\n  status character varying(20) NOT NULL DEFAULT 'received'::character varying,\n  date_received date NOT NULL DEFAULT CURRENT_DATE,\n  manufacturing_date date,\n  notes text,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now(),\n  created_by uuid,\n  modified_by uuid,\n  deleted_at timestamp with time zone,\n  receipt_item_id uuid\n);\n-- Foreign Keys:\n-- FK: receipt_item_id -> goods_receipt_items(id),\n  FK: modified_by -> users(id),\n  FK: created_by -> users(id),\n  FK: warehouse_id -> warehouses(id),\n  FK: product_id -> products(id),\n  FK: company_id -> companies(id)"
  },
  {
    "table_name": "tally_import_logs",
    "table_definition": "\nCREATE TABLE tally_import_logs (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  import_date timestamp with time zone NOT NULL DEFAULT now(),\n  period_from date,\n  period_to date,\n  import_type character varying(50),\n  status character varying(20),\n  records_processed integer DEFAULT 0,\n  records_failed integer DEFAULT 0,\n  error_details jsonb,\n  file_url text,\n  imported_by uuid,\n  created_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: company_id -> companies(id),\n  FK: imported_by -> users(id)"
  },
  {
    "table_name": "unit_conversions",
    "table_definition": "\nCREATE TABLE unit_conversions (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  from_unit_id uuid NOT NULL,\n  to_unit_id uuid NOT NULL,\n  conversion_factor numeric NOT NULL,\n  created_at timestamp with time zone NOT NULL DEFAULT now()\n);\n-- Foreign Keys:\n-- FK: to_unit_id -> units_of_measure(id),\n  FK: from_unit_id -> units_of_measure(id)"
  },
  {
    "table_name": "units_of_measure",
    "table_definition": "\nCREATE TABLE units_of_measure (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  code character varying(10) NOT NULL,\n  name character varying(50) NOT NULL,\n  symbol character varying(10),\n  decimal_places integer DEFAULT 2,\n  is_system_unit boolean DEFAULT false,\n  is_active boolean DEFAULT true,\n  created_at timestamp with time zone NOT NULL DEFAULT now()\n);"
  },
  {
    "table_name": "users",
    "table_definition": "\nCREATE TABLE users (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  first_name character varying(50) NOT NULL,\n  last_name character varying(50) NOT NULL,\n  phone_number character varying(15),\n  email character varying(100),\n  profile_image_url text,\n  additional_notes text,\n  role character varying(20) NOT NULL,\n  warehouse_id uuid,\n  is_active boolean DEFAULT true,\n  auth_user_id uuid,\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now(),\n  created_by uuid,\n  modified_by uuid,\n  deleted_at timestamp with time zone,\n  upgrade_requested boolean DEFAULT false,\n  upgrade_request_data jsonb,\n  upgrade_request_date timestamp with time zone,\n  upgrade_approved boolean DEFAULT false,\n  upgrade_approved_at timestamp with time zone,\n  upgrade_approved_by uuid,\n  is_superadmin boolean DEFAULT false,\n  onboarding_completed boolean DEFAULT false,\n  is_demo boolean DEFAULT false,\n  role_id uuid,\n  custom_permissions jsonb\n);\n-- Foreign Keys:\n-- FK: company_id -> companies(id),\n  FK: warehouse_id -> warehouses(id),\n  FK: role_id -> roles(id)"
  },
  {
    "table_name": "warehouses",
    "table_definition": "\nCREATE TABLE warehouses (\n  id uuid NOT NULL DEFAULT uuid_generate_v4(),\n  company_id uuid NOT NULL,\n  name character varying(100) NOT NULL,\n  address_line1 character varying(255),\n  address_line2 character varying(255),\n  city character varying(100),\n  state character varying(100),\n  country character varying(100) DEFAULT 'India'::character varying,\n  pin_code character varying(10),\n  created_at timestamp with time zone NOT NULL DEFAULT now(),\n  updated_at timestamp with time zone NOT NULL DEFAULT now(),\n  created_by uuid,\n  modified_by uuid,\n  deleted_at timestamp with time zone\n);\n-- Foreign Keys:\n-- FK: created_by -> users(id),\n  FK: modified_by -> users(id),\n  FK: company_id -> companies(id)"
  },
  {
    "table_name": "warehouses_with_computed",
    "table_definition": "\nCREATE TABLE warehouses_with_computed (\n  id uuid,\n  company_id uuid,\n  name character varying(100),\n  address_line1 character varying(255),\n  address_line2 character varying(255),\n  city character varying(100),\n  state character varying(100),\n  country character varying(100),\n  pin_code character varying(10),\n  created_at timestamp with time zone,\n  updated_at timestamp with time zone,\n  created_by uuid,\n  modified_by uuid,\n  deleted_at timestamp with time zone,\n  warehouse_name character varying(100)\n);"
  }
]

