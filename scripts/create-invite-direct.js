#!/usr/bin/env node

/**
 * Direct Invite Creator (bypasses RPC functions)
 * Creates invite directly in database table
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Generate a unique 12-character code
function generateCode() {
  return crypto.randomBytes(6).toString('hex').toUpperCase().substring(0, 12);
}

async function createInvite(email) {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║     Create Platform Invite - Direct Method      ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // Get first admin user
  const { data: adminUser, error: adminError } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single();

  if (adminError || !adminUser) {
    console.error('❌ No admin user found');
    process.exit(1);
  }

  // Generate unique code
  const code = generateCode();

  // Create invite directly
  const { data, error } = await supabase
    .from('invites')
    .insert({
      invite_type: 'platform',
      code: code,
      email: email,
      invited_by: adminUser.id,
      status: 'pending',
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      metadata: { created_via: 'direct_script' }
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  console.log('✅ Invite created successfully!\n');
  console.log('════════════════════════════════════════════════════');
  console.log(`  Email:        ${email}`);
  console.log(`  Invite Code:  ${code}`);
  console.log(`  Type:         Platform (New Company)`);
  console.log(`  Expires:      48 hours from now`);
  console.log('════════════════════════════════════════════════════\n');
  console.log('📋 Share this invite code:\n');
  console.log(`   ${code}\n`);

  const appUrl = SUPABASE_URL.includes('localhost') || SUPABASE_URL.includes('127.0.0.1')
    ? 'http://localhost:3000'
    : 'https://yourdomain.com';

  console.log('🔗 Signup URL:\n');
  console.log(`   ${appUrl}/signup?invite=${code}\n`);
}

// Get email from command line or prompt
const email = process.argv[2] || 'bale.inventory@gmail.com';

if (!email.includes('@')) {
  console.error('❌ Invalid email');
  process.exit(1);
}

createInvite(email);
