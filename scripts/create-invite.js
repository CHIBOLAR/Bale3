#!/usr/bin/env node

/**
 * Simple Invite Creator for Bale Inventory
 *
 * Usage: node scripts/create-invite.js
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing environment variables in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║     Create Platform Invite - Bale Inventory     ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  try {
    // Get email
    const email = await question('Enter email address: ');

    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address');
      rl.close();
      process.exit(1);
    }

    console.log('\n⏳ Creating invite...');

    // Get first admin user
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (!adminUser) {
      console.error('❌ No admin user found in database');
      rl.close();
      process.exit(1);
    }

    // Create platform invite
    const { data, error } = await supabase.rpc('create_platform_invite', {
      p_email: email,
      p_invited_by: adminUser.id,
      p_metadata: { created_via: 'quick_script' }
    });

    if (error) {
      console.error('❌ Error:', error.message);
      rl.close();
      process.exit(1);
    }

    // Display result
    console.log('\n✅ Invite created successfully!\n');
    console.log('════════════════════════════════════════════════════');
    console.log(`  Email:        ${email}`);
    console.log(`  Invite Code:  ${data.code}`);
    console.log(`  Type:         Platform (New Company)`);
    console.log(`  Expires:      48 hours from now`);
    console.log('════════════════════════════════════════════════════\n');
    console.log('📋 Share this invite code with the user:\n');
    console.log(`   ${data.code}\n`);
    console.log('🔗 Signup URL:\n');

    const appUrl = SUPABASE_URL.includes('localhost') || SUPABASE_URL.includes('127.0.0.1')
      ? 'http://localhost:3000'
      : SUPABASE_URL.replace(/\.supabase\.co.*/, '').replace('https://', 'https://app.');

    console.log(`   ${appUrl}/signup?invite=${data.code}\n`);

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    rl.close();
    process.exit(1);
  }

  rl.close();
}

main();
