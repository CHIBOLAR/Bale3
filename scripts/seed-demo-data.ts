/**
 * Seed Demo Data Script
 *
 * This script populates the demo account with comprehensive sample data
 * Run with: npx tsx scripts/seed-demo-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗');
  console.error('\nPlease check your .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Demo account credentials
const DEMO_EMAIL = 'demo@bale.inventory';
const DEMO_PASSWORD = 'demo1234';

async function seedDemoData() {
  console.log('🌱 Starting demo data seeding...\n');

  try {
    // 1. Get or create demo company
    console.log('📦 Step 1: Setting up demo company...');
    console.log('   Connecting to Supabase...');
    const { data: demoCompany, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_demo', true)
      .single();

    console.log('   Query completed. Error:', companyError?.message || 'none');

    let companyId: string;

    if (companyError || !demoCompany) {
      console.log('  Creating new demo company...');
      const { data: newCompany, error: createError } = await supabase
        .from('companies')
        .insert({
          name: 'Demo Fabrics Ltd',
          business_type: 'Trader',
          is_demo: true,
          address_line1: '123 Textile Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          pin_code: '400001',
          gst_number: 'DEMO123456789',
        })
        .select()
        .single();

      if (createError) throw createError;
      companyId = newCompany.id;
      console.log(`  ✅ Created demo company: ${companyId}`);
    } else {
      companyId = demoCompany.id;
      console.log(`  ✅ Using existing demo company: ${companyId}`);
    }

    // 2. Create/get demo user in Supabase Auth
    console.log('\n👤 Step 2: Setting up demo user...');

    // Try to sign in first to check if user exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });

    let authUserId: string;

    if (signInError) {
      // User doesn't exist, create it
      console.log('  Creating demo user in Supabase Auth...');
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        email_confirm: true,
      });

      if (signUpError) throw signUpError;
      authUserId = signUpData.user.id;
      console.log(`  ✅ Created auth user: ${authUserId}`);
    } else {
      authUserId = signInData.user.id;
      console.log(`  ✅ Using existing auth user: ${authUserId}`);
    }

    // Create/update user record in users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', authUserId)
      .single();

    let userId: string;

    if (!existingUser) {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          auth_user_id: authUserId,
          company_id: companyId,
          email: DEMO_EMAIL,
          first_name: 'Demo',
          last_name: 'User',
          role: 'admin',
          is_demo: true,
          is_active: true,
          warehouse_id: null, // Admin has access to all warehouses
        })
        .select()
        .single();

      if (userError) throw userError;
      userId = newUser.id;
      console.log('  ✅ Created user record in database');
    } else {
      userId = existingUser.id;
      console.log('  ✅ User record already exists');
    }

    // 3. Create warehouses
    console.log('\n🏭 Step 3: Creating warehouses...');
    const warehouses = [
      {
        company_id: companyId,
        name: 'Main Warehouse',
        address_line1: '123 Textile Street',
        address_line2: 'Near Market',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pin_code: '400001',
      },
      {
        company_id: companyId,
        name: 'Secondary Warehouse',
        address_line1: '456 Fabric Lane',
        address_line2: 'Industrial Area',
        city: 'Surat',
        state: 'Gujarat',
        country: 'India',
        pin_code: '395001',
      },
    ];

    const { data: createdWarehouses, error: warehouseError } = await supabase
      .from('warehouses')
      .upsert(warehouses, { onConflict: 'company_id,name', ignoreDuplicates: true })
      .select();

    if (warehouseError) throw warehouseError;
    console.log(`  ✅ Created/updated ${createdWarehouses?.length || 0} warehouses`);

    const mainWarehouseId = createdWarehouses?.[0]?.id;

    // 4. Create partners
    console.log('\n🤝 Step 4: Creating partners...');
    const partners = [
      // Customers
      {
        company_id: companyId,
        partner_type: 'Customer',
        company_name: 'Fashionista Boutique',
        first_name: 'Priya',
        last_name: 'Sharma',
        phone_number: '+91 9876543212',
        email: 'priya@fashionista.com',
        gst_number: '27AABCU9603R1ZM',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      },
      {
        company_id: companyId,
        partner_type: 'Customer',
        company_name: 'Textile Traders Co',
        first_name: 'Rajesh',
        last_name: 'Mehta',
        phone_number: '+91 9876543213',
        email: 'rajesh@textiletraders.com',
        gst_number: '24AABCU9603R1ZN',
        city: 'Ahmedabad',
        state: 'Gujarat',
        country: 'India',
      },
      // Suppliers
      {
        company_id: companyId,
        partner_type: 'Supplier',
        company_name: 'Cotton Mills India',
        first_name: 'Anil',
        last_name: 'Agarwal',
        phone_number: '+91 9876543214',
        email: 'anil@cottonmills.com',
        gst_number: '07AABCU9603R1ZO',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
      },
      {
        company_id: companyId,
        partner_type: 'Supplier',
        company_name: 'Silk Emporium',
        first_name: 'Meena',
        last_name: 'Reddy',
        phone_number: '+91 9876543215',
        email: 'meena@silkemporium.com',
        gst_number: '36AABCU9603R1ZP',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
      },
      // Vendors/Job Workers
      {
        company_id: companyId,
        partner_type: 'Vendor',
        company_name: 'Printing Works Ltd',
        first_name: 'Vijay',
        last_name: 'Singh',
        phone_number: '+91 9876543216',
        email: 'vijay@printingworks.com',
        gst_number: '09AABCU9603R1ZQ',
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
      },
    ];

    // Check if partners already exist, if not create them
    const { data: existingPartners } = await supabase
      .from('partners')
      .select('email')
      .eq('company_id', companyId);

    const existingEmails = new Set(existingPartners?.map(p => p.email) || []);
    const newPartners = partners.filter(p => !existingEmails.has(p.email));

    let createdPartners = existingPartners || [];
    if (newPartners.length > 0) {
      const { data: inserted, error: partnerError } = await supabase
        .from('partners')
        .insert(newPartners)
        .select();

      if (partnerError) throw partnerError;
      createdPartners = [...createdPartners, ...(inserted || [])];
    }

    console.log(`  ✅ Created ${newPartners.length} new partners (${existingPartners?.length || 0} already existed)`);

    // 5. Create products
    console.log('\n🧵 Step 5: Creating products...');
    const products = [
      // Cotton fabrics
      {
        company_id: companyId,
        name: 'Premium Cotton Plain',
        product_number: 'DEMO-COT-001',
        material: 'Cotton',
        color: 'White',
        color_hex: '#FFFFFF',
        gsm: 150,
        thread_count_cm: null,
        measuring_unit: 'Meters',
        cost_price_per_unit: 120,
        selling_price_per_unit: 150,
        min_stock_alert: true,
        min_stock_threshold: 100,
        show_on_catalog: true,
        tags: ['cotton', 'plain', 'white'],
        hsn_code: '52081100',
        notes: 'High-quality plain cotton fabric, perfect for shirts and dresses',
        product_images: null,
        created_by: userId,
        modified_by: userId,
      },
      {
        company_id: companyId,
        name: 'Cotton Printed Floral',
        product_number: 'DEMO-COT-002',
        material: 'Cotton',
        color: 'Multi',
        color_hex: '#FF6B9D',
        gsm: 140,
        thread_count_cm: null,
        measuring_unit: 'Meters',
        cost_price_per_unit: 150,
        selling_price_per_unit: 190,
        min_stock_alert: true,
        min_stock_threshold: 80,
        show_on_catalog: true,
        tags: ['cotton', 'printed', 'floral'],
        hsn_code: '52081200',
        notes: 'Beautiful floral print cotton fabric',
        product_images: null,
        created_by: userId,
        modified_by: userId,
      },
      // Silk fabrics
      {
        company_id: companyId,
        name: 'Pure Silk Saree',
        product_number: 'DEMO-SLK-001',
        material: 'Silk',
        color: 'Royal Blue',
        color_hex: '#4169E1',
        gsm: 200,
        thread_count_cm: null,
        measuring_unit: 'Meters',
        cost_price_per_unit: 800,
        selling_price_per_unit: 1000,
        min_stock_alert: true,
        min_stock_threshold: 20,
        show_on_catalog: true,
        tags: ['silk', 'saree', 'royal-blue'],
        hsn_code: '50071000',
        notes: 'Luxurious pure silk fabric for sarees',
        product_images: null,
        created_by: userId,
        modified_by: userId,
      },
      {
        company_id: companyId,
        name: 'Silk Blend Dupatta',
        product_number: 'DEMO-SLK-002',
        material: 'Silk',
        color: 'Maroon',
        color_hex: '#800000',
        gsm: 180,
        thread_count_cm: null,
        measuring_unit: 'Meters',
        cost_price_per_unit: 450,
        selling_price_per_unit: 600,
        min_stock_alert: true,
        min_stock_threshold: 30,
        show_on_catalog: true,
        tags: ['silk', 'dupatta', 'maroon'],
        hsn_code: '50072000',
        notes: 'Elegant silk blend for dupattas',
        product_images: null,
        created_by: userId,
        modified_by: userId,
      },
      // Polyester fabrics
      {
        company_id: companyId,
        name: 'Polyester Georgette',
        product_number: 'DEMO-PLY-001',
        material: 'Polyester',
        color: 'Black',
        color_hex: '#000000',
        gsm: 100,
        thread_count_cm: null,
        measuring_unit: 'Meters',
        cost_price_per_unit: 80,
        selling_price_per_unit: 110,
        min_stock_alert: true,
        min_stock_threshold: 150,
        show_on_catalog: true,
        tags: ['polyester', 'georgette', 'black'],
        hsn_code: '54076100',
        notes: 'Lightweight polyester georgette fabric',
        product_images: null,
        created_by: userId,
        modified_by: userId,
      },
      {
        company_id: companyId,
        name: 'Polyester Satin',
        product_number: 'DEMO-PLY-002',
        material: 'Polyester',
        color: 'Champagne',
        color_hex: '#F7E7CE',
        gsm: 120,
        thread_count_cm: null,
        measuring_unit: 'Meters',
        cost_price_per_unit: 95,
        selling_price_per_unit: 130,
        min_stock_alert: true,
        min_stock_threshold: 120,
        show_on_catalog: true,
        tags: ['polyester', 'satin', 'champagne'],
        hsn_code: '54076200',
        notes: 'Smooth satin polyester fabric',
        product_images: null,
        created_by: userId,
        modified_by: userId,
      },
      // Linen fabrics
      {
        company_id: companyId,
        name: 'Pure Linen Natural',
        product_number: 'DEMO-LIN-001',
        material: 'Linen',
        color: 'Beige',
        color_hex: '#F5F5DC',
        gsm: 180,
        thread_count_cm: null,
        measuring_unit: 'Meters',
        cost_price_per_unit: 250,
        selling_price_per_unit: 320,
        min_stock_alert: true,
        min_stock_threshold: 50,
        show_on_catalog: true,
        tags: ['linen', 'natural', 'beige'],
        hsn_code: '53091100',
        notes: 'Premium quality natural linen',
        product_images: null,
        created_by: userId,
        modified_by: userId,
      },
      // Velvet fabrics
      {
        company_id: companyId,
        name: 'Velvet Crush',
        product_number: 'DEMO-VLV-001',
        material: 'Velvet',
        color: 'Deep Purple',
        color_hex: '#6A0DAD',
        gsm: 220,
        thread_count_cm: null,
        measuring_unit: 'Meters',
        cost_price_per_unit: 180,
        selling_price_per_unit: 240,
        min_stock_alert: true,
        min_stock_threshold: 40,
        show_on_catalog: true,
        tags: ['velvet', 'crush', 'purple'],
        hsn_code: '58012600',
        notes: 'Luxurious crush velvet fabric',
        product_images: null,
        created_by: userId,
        modified_by: userId,
      },
      // Wool blend
      {
        company_id: companyId,
        name: 'Wool Blend Suiting',
        product_number: 'DEMO-WOL-001',
        material: 'Wool',
        color: 'Charcoal Grey',
        color_hex: '#36454F',
        gsm: 300,
        thread_count_cm: null,
        measuring_unit: 'Meters',
        cost_price_per_unit: 350,
        selling_price_per_unit: 450,
        min_stock_alert: true,
        min_stock_threshold: 30,
        show_on_catalog: true,
        tags: ['wool', 'suiting', 'grey'],
        hsn_code: '51121100',
        notes: 'Premium wool blend for suits',
        product_images: null,
        created_by: userId,
        modified_by: userId,
      },
      // Denim
      {
        company_id: companyId,
        name: 'Denim Stretch',
        product_number: 'DEMO-DEN-001',
        material: 'Denim',
        color: 'Indigo Blue',
        color_hex: '#4B0082',
        gsm: 250,
        thread_count_cm: null,
        measuring_unit: 'Meters',
        cost_price_per_unit: 200,
        selling_price_per_unit: 270,
        min_stock_alert: true,
        min_stock_threshold: 70,
        show_on_catalog: true,
        tags: ['denim', 'stretch', 'indigo'],
        hsn_code: '52091100',
        notes: 'Comfortable stretch denim fabric',
        product_images: null,
        created_by: userId,
        modified_by: userId,
      },
    ];

    // Check if products already exist
    const { data: existingProducts } = await supabase
      .from('products')
      .select('product_number, id, selling_price_per_unit')
      .eq('company_id', companyId);

    const existingProductNumbers = new Set(existingProducts?.map(p => p.product_number) || []);
    const newProducts = products.filter(p => !existingProductNumbers.has(p.product_number));

    let createdProducts = existingProducts || [];
    if (newProducts.length > 0) {
      const { data: inserted, error: productError } = await supabase
        .from('products')
        .insert(newProducts)
        .select();

      if (productError) throw productError;
      createdProducts = [...createdProducts, ...(inserted || [])];
    }

    console.log(`  ✅ Created ${newProducts.length} new products (${existingProducts?.length || 0} already existed)`);

    // 6. Create goods receipts and stock units
    console.log('\n📥 Step 6: Creating goods receipts and stock units...');

    if (createdProducts && createdProducts.length > 0 && createdPartners && mainWarehouseId) {
      const supplierId = createdPartners.find(p => p.partner_type === 'Supplier')?.id;

      if (supplierId) {
        // Create 5 goods receipts
        for (let i = 1; i <= 5; i++) {
          const receiptDate = new Date();
          receiptDate.setDate(receiptDate.getDate() - (30 - i * 5));

          const month = String(receiptDate.getMonth() + 1).padStart(2, '0');
          const year = receiptDate.getFullYear();
          const sequence = String(i).padStart(5, '0');

          const { data: receipt, error: receiptError } = await supabase
            .from('goods_receipts')
            .insert({
              company_id: companyId,
              receipt_number: `GR-${year}-${month}-${sequence}`,
              warehouse_id: mainWarehouseId,
              receipt_type: 'purchase',
              receipt_date: receiptDate.toISOString(),
              issued_by_partner_id: supplierId,
              status: 'completed',
              notes: `Demo goods receipt #${i}`,
            })
            .select()
            .single();

          if (receiptError) {
            console.log(`  ⚠️ Error creating receipt ${i}:`, receiptError.message);
            continue;
          }

          // Create 3-5 stock units for each receipt
          const numUnits = 3 + Math.floor(Math.random() * 3);
          for (let j = 1; j <= numUnits; j++) {
            const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
            const quantity = 50 + Math.floor(Math.random() * 150); // 50-200 meters

            await supabase
              .from('stock_units')
              .insert({
                company_id: companyId,
                warehouse_id: mainWarehouseId,
                product_id: randomProduct.id,
                unit_number: `UNIT-${String(i * 10 + j).padStart(6, '0')}`,
                quantity,
                quality_grade: ['A', 'B', 'A', 'A'][Math.floor(Math.random() * 4)],
                status: ['in_stock', 'in_stock', 'in_stock', 'reserved'][Math.floor(Math.random() * 4)],
                created_from_receipt_id: receipt.id,
              });
          }
        }

        console.log(`  ✅ Created 5 goods receipts with stock units`);
      }
    }

    // 7. Create sales orders
    console.log('\n📋 Step 7: Creating sales orders...');

    if (createdPartners && createdProducts && mainWarehouseId) {
      const customerId = createdPartners.find(p => p.partner_type === 'Customer')?.id;

      if (customerId) {
        for (let i = 1; i <= 8; i++) {
          const orderDate = new Date();
          orderDate.setDate(orderDate.getDate() - (25 - i * 3));

          const deliveryDate = new Date(orderDate);
          deliveryDate.setDate(deliveryDate.getDate() + 7);

          const month = String(orderDate.getMonth() + 1).padStart(2, '0');
          const year = orderDate.getFullYear();
          const sequence = String(i).padStart(5, '0');

          const { data: order, error: orderError } = await supabase
            .from('sales_orders')
            .insert({
              company_id: companyId,
              order_number: `SO-${year}-${month}-${sequence}`,
              customer_id: customerId,
              order_date: orderDate.toISOString(),
              expected_delivery_date: deliveryDate.toISOString(),
              fulfillment_warehouse_id: mainWarehouseId,
              status: ['pending', 'confirmed', 'in_progress', 'completed'][Math.floor(Math.random() * 4)],
              total_amount: 0, // Will be calculated from items
              discount_amount: 0,
              advance_amount: 0,
            })
            .select()
            .single();

          if (orderError) {
            console.log(`  ⚠️ Error creating order ${i}:`, orderError.message);
            continue;
          }

          // Create 2-4 line items for each order
          const numItems = 2 + Math.floor(Math.random() * 3);
          let totalAmount = 0;

          for (let j = 0; j < numItems; j++) {
            const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
            const quantity = 20 + Math.floor(Math.random() * 80); // 20-100 meters
            const lineTotal = quantity * (randomProduct.selling_price_per_unit || 100);
            totalAmount += lineTotal;

            await supabase
              .from('sales_order_items')
              .insert({
                sales_order_id: order.id,
                product_id: randomProduct.id,
                required_quantity: quantity,
                unit_rate: randomProduct.selling_price_per_unit || 100,
              });
          }

          // Update order total
          await supabase
            .from('sales_orders')
            .update({ total_amount: totalAmount })
            .eq('id', order.id);
        }

        console.log(`  ✅ Created 8 sales orders with line items`);
      }
    }

    console.log('\n✅ Demo data seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Company: Demo Fabrics Ltd`);
    console.log(`   - Email: ${DEMO_EMAIL}`);
    console.log(`   - Password: ${DEMO_PASSWORD}`);
    console.log(`   - Warehouses: 2`);
    console.log(`   - Partners: 5`);
    console.log(`   - Products: 10`);
    console.log(`   - Goods Receipts: 5 (with stock units)`);
    console.log(`   - Sales Orders: 8 (with line items)`);
    console.log('\n🎉 Demo account is ready to use!');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  }
}

// Run the seed function
seedDemoData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });