-- Migration: Populate Demo Data
-- Description: Creates realistic sample data for the demo company
-- Created: 2025-01-11

DO $$
DECLARE
  demo_company_id UUID;
  demo_warehouse_id UUID;
  demo_user_id UUID;

  -- Product IDs
  cotton_white_id UUID;
  cotton_blue_id UUID;
  polyester_black_id UUID;
  silk_red_id UUID;
  linen_beige_id UUID;
  denim_indigo_id UUID;
  cotton_poly_grey_id UUID;
  viscose_green_id UUID;

  -- Partner IDs
  customer_1_id UUID;
  customer_2_id UUID;
  customer_3_id UUID;
  supplier_1_id UUID;
  supplier_2_id UUID;

BEGIN
  -- Get demo company and warehouse IDs
  SELECT id INTO demo_company_id FROM companies WHERE is_demo = TRUE LIMIT 1;
  SELECT id INTO demo_warehouse_id FROM warehouses WHERE company_id = demo_company_id LIMIT 1;

  -- Create a demo system user for created_by fields
  INSERT INTO users (
    company_id, first_name, last_name, email, phone_number, role, is_demo,
    auth_user_id, created_at
  ) VALUES (
    demo_company_id, 'Demo', 'Admin', 'demo@baleinventory.com', '0000000000', 'admin', TRUE,
    '00000000-0000-0000-0000-000000000000', NOW()
  ) RETURNING id INTO demo_user_id;

  RAISE NOTICE 'Demo User ID: %', demo_user_id;

  -- =====================================================
  -- PRODUCTS
  -- =====================================================

  -- Cotton Fabrics
  INSERT INTO products (
    company_id, product_number, name, material, color, color_hex, gsm,
    measuring_unit, cost_price_per_unit, selling_price_per_unit,
    show_on_catalog, tags, hsn_code, notes, created_by
  ) VALUES
  (
    demo_company_id, 'PROD-001', 'Premium Cotton White', 'Cotton', 'White', '#FFFFFF', 180,
    'Meters', 120.00, 180.00, TRUE,
    ARRAY['Premium', 'Pure Cotton', 'White'], '52081100',
    'High-quality pure cotton fabric, ideal for shirts and light garments',
    demo_user_id
  ) RETURNING id INTO cotton_white_id;

  INSERT INTO products (
    company_id, product_number, name, material, color, color_hex, gsm,
    measuring_unit, cost_price_per_unit, selling_price_per_unit,
    show_on_catalog, tags, hsn_code, notes, created_by
  ) VALUES
  (
    demo_company_id, 'PROD-002', 'Cotton Sky Blue', 'Cotton', 'Sky Blue', '#87CEEB', 160,
    'Meters', 100.00, 150.00, TRUE,
    ARRAY['Cotton', 'Blue', 'Casual'], '52081200',
    'Light blue cotton fabric for summer wear',
    demo_user_id
  ) RETURNING id INTO cotton_blue_id;

  -- Synthetic Fabrics
  INSERT INTO products (
    company_id, product_number, name, material, color, color_hex, gsm,
    measuring_unit, cost_price_per_unit, selling_price_per_unit,
    show_on_catalog, tags, hsn_code, notes, created_by
  ) VALUES
  (
    demo_company_id, 'PROD-003', 'Polyester Black', 'Polyester', 'Black', '#000000', 200,
    'Meters', 80.00, 130.00, TRUE,
    ARRAY['Polyester', 'Black', 'Formal'], '54071000',
    'Durable polyester fabric for formal wear and uniforms',
    demo_user_id
  ) RETURNING id INTO polyester_black_id;

  -- Premium Fabrics
  INSERT INTO products (
    company_id, product_number, name, material, color, color_hex, gsm,
    measuring_unit, cost_price_per_unit, selling_price_per_unit,
    show_on_catalog, tags, hsn_code, notes, created_by
  ) VALUES
  (
    demo_company_id, 'PROD-004', 'Pure Silk Crimson', 'Silk', 'Crimson', '#DC143C', 120,
    'Meters', 500.00, 750.00, TRUE,
    ARRAY['Silk', 'Premium', 'Red', 'Luxury'], '50071000',
    'Luxurious pure silk fabric for high-end garments',
    demo_user_id
  ) RETURNING id INTO silk_red_id;

  INSERT INTO products (
    company_id, product_number, name, material, color, color_hex, gsm,
    measuring_unit, cost_price_per_unit, selling_price_per_unit,
    show_on_catalog, tags, hsn_code, notes, created_by
  ) VALUES
  (
    demo_company_id, 'PROD-005', 'Custom Linen Beige', 'Custom', 'Beige', '#F5F5DC', 220,
    'Meters', 180.00, 280.00, TRUE,
    ARRAY['Linen', 'Natural', 'Beige', 'Breathable'], '53091100',
    'Natural linen fabric, perfect for summer clothing',
    demo_user_id
  ) RETURNING id INTO linen_beige_id;

  -- Specialty Fabrics
  INSERT INTO products (
    company_id, product_number, name, material, color, color_hex, gsm,
    measuring_unit, cost_price_per_unit, selling_price_per_unit,
    show_on_catalog, tags, hsn_code, notes, created_by
  ) VALUES
  (
    demo_company_id, 'PROD-006', 'Custom Denim Indigo', 'Custom', 'Indigo', '#4B0082', 320,
    'Meters', 150.00, 220.00, TRUE,
    ARRAY['Denim', 'Heavy', 'Blue', 'Casual'], '52091100',
    'Heavy-duty denim fabric for jeans and jackets',
    demo_user_id
  ) RETURNING id INTO denim_indigo_id;

  -- Blended Fabrics
  INSERT INTO products (
    company_id, product_number, name, material, color, color_hex, gsm,
    measuring_unit, cost_price_per_unit, selling_price_per_unit,
    show_on_catalog, tags, hsn_code, notes, created_by
  ) VALUES
  (
    demo_company_id, 'PROD-007', 'Cotton-Poly Grey Blend', 'Blend', 'Grey', '#808080', 180,
    'Meters', 95.00, 145.00, TRUE,
    ARRAY['Blend', 'Grey', 'Wrinkle-Free'], '55151200',
    '65% Cotton 35% Polyester blend, wrinkle-resistant',
    demo_user_id
  ) RETURNING id INTO cotton_poly_grey_id;

  INSERT INTO products (
    company_id, product_number, name, material, color, color_hex, gsm,
    measuring_unit, cost_price_per_unit, selling_price_per_unit,
    show_on_catalog, tags, hsn_code, notes, created_by
  ) VALUES
  (
    demo_company_id, 'PROD-008', 'Custom Viscose Emerald', 'Custom', 'Emerald Green', '#50C878', 140,
    'Meters', 110.00, 170.00, TRUE,
    ARRAY['Viscose', 'Green', 'Soft'], '54020000',
    'Soft viscose fabric with excellent drape',
    demo_user_id
  ) RETURNING id INTO viscose_green_id;

  RAISE NOTICE 'Created % demo products', 8;

  -- =====================================================
  -- PARTNERS - CUSTOMERS
  -- =====================================================

  INSERT INTO partners (
    company_id, first_name, last_name, company_name, phone_number, email,
    partner_type, gst_number, address_line1, city, state, pin_code,
    notes, created_by
  ) VALUES
  (
    demo_company_id, 'Rajesh', 'Kumar', 'Kumar Textiles Pvt Ltd', '9876543210',
    'rajesh@kumartextiles.com', 'Customer', '27AAAAA1234A1Z5',
    '123 Textile Market, Kalbadevi', 'Mumbai', 'Maharashtra', '400002',
    'Regular customer, orders bulk quantities monthly',
    demo_user_id
  ) RETURNING id INTO customer_1_id;

  INSERT INTO partners (
    company_id, first_name, last_name, company_name, phone_number, email,
    partner_type, gst_number, address_line1, city, state, pin_code,
    notes, created_by
  ) VALUES
  (
    demo_company_id, 'Priya', 'Sharma', 'Sharma Fashion House', '9823456789',
    'priya@sharmafashion.com', 'Customer', '29BBBBB5678B1Z5',
    '456 MG Road', 'Bangalore', 'Karnataka', '560001',
    'Premium client, prefers high-quality silk and linen',
    demo_user_id
  ) RETURNING id INTO customer_2_id;

  INSERT INTO partners (
    company_id, first_name, last_name, company_name, phone_number, email,
    partner_type, gst_number, address_line1, city, state, pin_code,
    notes, created_by
  ) VALUES
  (
    demo_company_id, 'Amit', 'Patel', 'Patel Garments', '9898765432',
    'amit@patelgarments.com', 'Customer', '24CCCCC9012C1Z5',
    '789 Ring Road', 'Ahmedabad', 'Gujarat', '380001',
    'New customer, trial orders',
    demo_user_id
  ) RETURNING id INTO customer_3_id;

  -- =====================================================
  -- PARTNERS - SUPPLIERS
  -- =====================================================

  INSERT INTO partners (
    company_id, first_name, last_name, company_name, phone_number, email,
    partner_type, gst_number, address_line1, city, state, pin_code,
    notes, created_by
  ) VALUES
  (
    demo_company_id, 'Suresh', 'Verma', 'Verma Cotton Mills', '9812345678',
    'suresh@vermacotton.com', 'Supplier', '27DDDDD3456D1Z5',
    '321 Mill Area, Worli', 'Mumbai', 'Maharashtra', '400030',
    'Primary cotton supplier, excellent quality',
    demo_user_id
  ) RETURNING id INTO supplier_1_id;

  INSERT INTO partners (
    company_id, first_name, last_name, company_name, phone_number, email,
    partner_type, gst_number, address_line1, city, state, pin_code,
    notes, created_by
  ) VALUES
  (
    demo_company_id, 'Meena', 'Singh', 'Singh Synthetics Ltd', '9845678901',
    'meena@singhsynth.com', 'Supplier', '29EEEEE7890E1Z5',
    '654 Industrial Estate', 'Surat', 'Gujarat', '395008',
    'Reliable polyester and synthetic fabrics supplier',
    demo_user_id
  ) RETURNING id INTO supplier_2_id;

  RAISE NOTICE 'Created % demo partners', 5;

  -- =====================================================
  -- STOCK UNITS
  -- =====================================================

  -- Cotton White - 5 rolls
  INSERT INTO stock_units (
    company_id, product_id, warehouse_id, unit_number, size_quantity,
    wastage, quality_grade, status, created_by
  ) VALUES
  (demo_company_id, cotton_white_id, demo_warehouse_id, 'PROD-001-SU000001', 100.0, 2.5, 'A+', 'available', demo_user_id),
  (demo_company_id, cotton_white_id, demo_warehouse_id, 'PROD-001-SU000002', 95.0, 1.8, 'A', 'available', demo_user_id),
  (demo_company_id, cotton_white_id, demo_warehouse_id, 'PROD-001-SU000003', 98.5, 2.0, 'A+', 'available', demo_user_id),
  (demo_company_id, cotton_white_id, demo_warehouse_id, 'PROD-001-SU000004', 102.0, 3.0, 'A', 'available', demo_user_id),
  (demo_company_id, cotton_white_id, demo_warehouse_id, 'PROD-001-SU000005', 88.0, 4.5, 'B+', 'available', demo_user_id);

  -- Cotton Blue - 3 rolls
  INSERT INTO stock_units (
    company_id, product_id, warehouse_id, unit_number, size_quantity,
    wastage, quality_grade, status, created_by
  ) VALUES
  (demo_company_id, cotton_blue_id, demo_warehouse_id, 'PROD-002-SU000001', 110.0, 2.0, 'A+', 'available', demo_user_id),
  (demo_company_id, cotton_blue_id, demo_warehouse_id, 'PROD-002-SU000002', 105.5, 1.5, 'A+', 'available', demo_user_id),
  (demo_company_id, cotton_blue_id, demo_warehouse_id, 'PROD-002-SU000003', 92.0, 3.0, 'A', 'available', demo_user_id);

  -- Polyester Black - 4 rolls
  INSERT INTO stock_units (
    company_id, product_id, warehouse_id, unit_number, size_quantity,
    wastage, quality_grade, status, created_by
  ) VALUES
  (demo_company_id, polyester_black_id, demo_warehouse_id, 'PROD-003-SU000001', 150.0, 1.0, 'A+', 'available', demo_user_id),
  (demo_company_id, polyester_black_id, demo_warehouse_id, 'PROD-003-SU000002', 148.5, 0.8, 'A+', 'available', demo_user_id),
  (demo_company_id, polyester_black_id, demo_warehouse_id, 'PROD-003-SU000003', 145.0, 1.2, 'A', 'available', demo_user_id),
  (demo_company_id, polyester_black_id, demo_warehouse_id, 'PROD-003-SU000004', 140.0, 2.5, 'A', 'available', demo_user_id);

  -- Silk Red - 2 rolls (premium)
  INSERT INTO stock_units (
    company_id, product_id, warehouse_id, unit_number, size_quantity,
    wastage, quality_grade, status, created_by
  ) VALUES
  (demo_company_id, silk_red_id, demo_warehouse_id, 'PROD-004-SU000001', 50.0, 0.5, 'A+', 'available', demo_user_id),
  (demo_company_id, silk_red_id, demo_warehouse_id, 'PROD-004-SU000002', 48.0, 0.3, 'A+', 'available', demo_user_id);

  -- Linen Beige - 3 rolls
  INSERT INTO stock_units (
    company_id, product_id, warehouse_id, unit_number, size_quantity,
    wastage, quality_grade, status, created_by
  ) VALUES
  (demo_company_id, linen_beige_id, demo_warehouse_id, 'PROD-005-SU000001', 75.0, 1.5, 'A', 'available', demo_user_id),
  (demo_company_id, linen_beige_id, demo_warehouse_id, 'PROD-005-SU000002', 80.0, 1.0, 'A+', 'available', demo_user_id),
  (demo_company_id, linen_beige_id, demo_warehouse_id, 'PROD-005-SU000003', 78.5, 1.2, 'A', 'available', demo_user_id);

  -- Denim Indigo - 4 rolls
  INSERT INTO stock_units (
    company_id, product_id, warehouse_id, unit_number, size_quantity,
    wastage, quality_grade, status, created_by
  ) VALUES
  (demo_company_id, denim_indigo_id, demo_warehouse_id, 'PROD-006-SU000001', 120.0, 2.0, 'A', 'available', demo_user_id),
  (demo_company_id, denim_indigo_id, demo_warehouse_id, 'PROD-006-SU000002', 118.0, 1.8, 'A+', 'available', demo_user_id),
  (demo_company_id, denim_indigo_id, demo_warehouse_id, 'PROD-006-SU000003', 115.0, 2.5, 'A', 'available', demo_user_id),
  (demo_company_id, denim_indigo_id, demo_warehouse_id, 'PROD-006-SU000004', 110.0, 3.0, 'B+', 'available', demo_user_id);

  -- Cotton-Poly Grey - 3 rolls
  INSERT INTO stock_units (
    company_id, product_id, warehouse_id, unit_number, size_quantity,
    wastage, quality_grade, status, created_by
  ) VALUES
  (demo_company_id, cotton_poly_grey_id, demo_warehouse_id, 'PROD-007-SU000001', 130.0, 1.5, 'A+', 'available', demo_user_id),
  (demo_company_id, cotton_poly_grey_id, demo_warehouse_id, 'PROD-007-SU000002', 125.0, 2.0, 'A', 'available', demo_user_id),
  (demo_company_id, cotton_poly_grey_id, demo_warehouse_id, 'PROD-007-SU000003', 128.0, 1.8, 'A+', 'available', demo_user_id);

  -- Viscose Green - 3 rolls
  INSERT INTO stock_units (
    company_id, product_id, warehouse_id, unit_number, size_quantity,
    wastage, quality_grade, status, created_by
  ) VALUES
  (demo_company_id, viscose_green_id, demo_warehouse_id, 'PROD-008-SU000001', 85.0, 1.0, 'A+', 'available', demo_user_id),
  (demo_company_id, viscose_green_id, demo_warehouse_id, 'PROD-008-SU000002', 90.0, 0.8, 'A+', 'available', demo_user_id),
  (demo_company_id, viscose_green_id, demo_warehouse_id, 'PROD-008-SU000003', 88.5, 1.2, 'A', 'available', demo_user_id);

  RAISE NOTICE 'Created % demo stock units', 29;

  RAISE NOTICE '✅ Demo data populated successfully!';
  RAISE NOTICE 'Summary: 8 products, 5 partners, 29 stock units';

END $$;
