#!/usr/bin/env node

/**
 * Bale Inventory - Invite Management Script
 *
 * This script helps create and manage invites for the platform.
 *
 * Usage:
 *   node scripts/manage-invites.js create-platform <email> [invited_by_user_id]
 *   node scripts/manage-invites.js create-staff <email> <company_id> <warehouse_id> <role> [invited_by_user_id]
 *   node scripts/manage-invites.js list [type]
 *   node scripts/manage-invites.js revoke <invite_code>
 *   node scripts/manage-invites.js check <invite_code>
 *
 * Examples:
 *   node scripts/manage-invites.js create-platform user@example.com
 *   node scripts/manage-invites.js create-staff staff@example.com <company_id> <warehouse_id> admin
 *   node scripts/manage-invites.js list platform
 *   node scripts/manage-invites.js list staff
 *   node scripts/manage-invites.js revoke ABC123DEF456
 *   node scripts/manage-invites.js check ABC123DEF456
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing environment variables');
  console.error('   Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Utility function to prompt for input
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Get first super admin user ID (for invited_by field)
async function getDefaultInvitedBy() {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, is_super_admin')
    .eq('is_super_admin', true)
    .limit(1)
    .single();

  if (error || !users) {
    console.warn('⚠️  No super admin found. Using first admin user...');
    const { data: adminUsers } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'admin')
      .limit(1)
      .single();

    return adminUsers?.id || null;
  }

  return users.id;
}

// Create a platform invite
async function createPlatformInvite(email, invitedBy) {
  console.log('\n📧 Creating platform invite...\n');

  if (!invitedBy) {
    invitedBy = await getDefaultInvitedBy();
    if (!invitedBy) {
      console.error('❌ Error: No admin user found in database');
      console.error('   Please provide invited_by_user_id manually');
      process.exit(1);
    }
  }

  const { data, error } = await supabase.rpc('create_platform_invite', {
    p_email: email,
    p_invited_by: invitedBy,
    p_metadata: { created_via: 'script' }
  });

  if (error) {
    console.error('❌ Error creating invite:', error.message);
    process.exit(1);
  }

  if (data.success) {
    console.log('✅ Platform invite created successfully!\n');
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║               PLATFORM INVITE DETAILS                 ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log(`   Email:        ${data.email}`);
    console.log(`   Invite Code:  ${data.code}`);
    console.log(`   Type:         Platform (New Company)`);
    console.log(`   Expires:      48 hours from now`);
    console.log('');
    console.log('📋 Share this invite code with the user:');
    console.log(`   ${data.code}`);
    console.log('');
    console.log('🔗 Signup URL:');
    console.log(`   ${SUPABASE_URL.replace(/:\d+$/, ':3000')}/signup?invite=${data.code}`);
    console.log('');
  } else {
    console.error('❌ Failed to create invite');
  }
}

// Create a staff invite
async function createStaffInvite(email, companyId, warehouseId, role, invitedBy) {
  console.log('\n📧 Creating staff invite...\n');

  // Validate company exists
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name')
    .eq('id', companyId)
    .single();

  if (companyError || !company) {
    console.error('❌ Error: Company not found');
    process.exit(1);
  }

  // Validate warehouse exists and belongs to company
  const { data: warehouse, error: warehouseError } = await supabase
    .from('warehouses')
    .select('id, name, company_id')
    .eq('id', warehouseId)
    .eq('company_id', companyId)
    .single();

  if (warehouseError || !warehouse) {
    console.error('❌ Error: Warehouse not found or does not belong to company');
    process.exit(1);
  }

  // Get invited_by if not provided
  if (!invitedBy) {
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('company_id', companyId)
      .eq('role', 'admin')
      .limit(1)
      .single();

    invitedBy = adminUser?.id;

    if (!invitedBy) {
      console.error('❌ Error: No admin user found for this company');
      console.error('   Please provide invited_by_user_id manually');
      process.exit(1);
    }
  }

  const { data, error } = await supabase.rpc('create_staff_invite', {
    p_email: email,
    p_company_id: companyId,
    p_warehouse_id: warehouseId,
    p_role: role,
    p_invited_by: invitedBy,
    p_metadata: { created_via: 'script' }
  });

  if (error) {
    console.error('❌ Error creating invite:', error.message);
    process.exit(1);
  }

  if (data.success) {
    console.log('✅ Staff invite created successfully!\n');
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║                 STAFF INVITE DETAILS                  ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log(`   Email:        ${data.email}`);
    console.log(`   Invite Code:  ${data.code}`);
    console.log(`   Type:         Staff (Existing Company)`);
    console.log(`   Company:      ${company.name}`);
    console.log(`   Warehouse:    ${warehouse.name}`);
    console.log(`   Role:         ${role}`);
    console.log(`   Expires:      48 hours from now`);
    console.log('');
    console.log('📋 Share this invite code with the user:');
    console.log(`   ${data.code}`);
    console.log('');
    console.log('🔗 Signup URL:');
    console.log(`   ${SUPABASE_URL.replace(/:\d+$/, ':3000')}/signup?invite=${data.code}`);
    console.log('');
  } else {
    console.error('❌ Failed to create invite');
  }
}

// List invites
async function listInvites(type = null) {
  console.log('\n📋 Listing invites...\n');

  let query = supabase
    .from('invites')
    .select(`
      id,
      code,
      email,
      invite_type,
      status,
      role,
      expires_at,
      accepted_at,
      created_at,
      companies (name),
      warehouses (name)
    `)
    .order('created_at', { ascending: false });

  if (type) {
    query = query.eq('invite_type', type);
  }

  const { data: invites, error } = await query;

  if (error) {
    console.error('❌ Error fetching invites:', error.message);
    process.exit(1);
  }

  if (!invites || invites.length === 0) {
    console.log('ℹ️  No invites found');
    return;
  }

  console.log(`Found ${invites.length} invite(s):\n`);
  console.log('═'.repeat(120));
  console.log(
    'Code'.padEnd(15) +
    'Email'.padEnd(30) +
    'Type'.padEnd(10) +
    'Status'.padEnd(12) +
    'Role'.padEnd(8) +
    'Expires'
  );
  console.log('═'.repeat(120));

  invites.forEach((invite) => {
    const expiresAt = new Date(invite.expires_at);
    const isExpired = expiresAt < new Date();
    const statusIcon =
      invite.status === 'accepted' ? '✓' :
      invite.status === 'revoked' ? '✗' :
      isExpired ? '⏱' : '⏳';

    console.log(
      invite.code.padEnd(15) +
      invite.email.substring(0, 28).padEnd(30) +
      invite.invite_type.padEnd(10) +
      `${statusIcon} ${invite.status}`.padEnd(12) +
      (invite.role || '-').padEnd(8) +
      expiresAt.toLocaleDateString()
    );

    if (invite.companies) {
      console.log(`   Company: ${invite.companies.name}`);
    }
    if (invite.warehouses) {
      console.log(`   Warehouse: ${invite.warehouses.name}`);
    }
    console.log('');
  });
}

// Check invite details
async function checkInvite(code) {
  console.log(`\n🔍 Checking invite: ${code}\n`);

  const { data: invite, error } = await supabase
    .from('invites')
    .select(`
      *,
      companies (id, name),
      warehouses (id, name)
    `)
    .eq('code', code)
    .single();

  if (error || !invite) {
    console.error('❌ Invite not found');
    process.exit(1);
  }

  const expiresAt = new Date(invite.expires_at);
  const isExpired = expiresAt < new Date();
  const isValid = invite.status === 'pending' && !isExpired;

  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║                   INVITE DETAILS                      ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log(`   Code:         ${invite.code}`);
  console.log(`   Email:        ${invite.email}`);
  console.log(`   Type:         ${invite.invite_type}`);
  console.log(`   Status:       ${invite.status} ${isValid ? '✓' : '✗'}`);
  console.log(`   Expires:      ${expiresAt.toLocaleString()}`);
  console.log(`   Created:      ${new Date(invite.created_at).toLocaleString()}`);

  if (invite.accepted_at) {
    console.log(`   Accepted:     ${new Date(invite.accepted_at).toLocaleString()}`);
  }

  if (invite.companies) {
    console.log(`   Company:      ${invite.companies.name}`);
  }

  if (invite.warehouses) {
    console.log(`   Warehouse:    ${invite.warehouses.name}`);
  }

  if (invite.role) {
    console.log(`   Role:         ${invite.role}`);
  }

  console.log('');
  console.log(`   Valid:        ${isValid ? '✅ Yes' : '❌ No'}`);
  console.log('');
}

// Revoke invite
async function revokeInvite(code) {
  console.log(`\n🚫 Revoking invite: ${code}\n`);

  const { data: invite, error: fetchError } = await supabase
    .from('invites')
    .select('*')
    .eq('code', code)
    .single();

  if (fetchError || !invite) {
    console.error('❌ Invite not found');
    process.exit(1);
  }

  if (invite.status !== 'pending') {
    console.error(`❌ Cannot revoke invite with status: ${invite.status}`);
    process.exit(1);
  }

  const { error } = await supabase
    .from('invites')
    .update({ status: 'revoked', updated_at: new Date().toISOString() })
    .eq('code', code);

  if (error) {
    console.error('❌ Error revoking invite:', error.message);
    process.exit(1);
  }

  console.log('✅ Invite revoked successfully');
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║       Bale Inventory - Invite Management Tool         ║');
  console.log('╚═══════════════════════════════════════════════════════╝');

  if (!command) {
    console.log('\nUsage:');
    console.log('  create-platform <email> [invited_by_user_id]');
    console.log('  create-staff <email> <company_id> <warehouse_id> <role> [invited_by_user_id]');
    console.log('  list [type]');
    console.log('  check <invite_code>');
    console.log('  revoke <invite_code>');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/manage-invites.js create-platform user@example.com');
    console.log('  node scripts/manage-invites.js create-staff staff@example.com <company_id> <warehouse_id> admin');
    console.log('  node scripts/manage-invites.js list platform');
    console.log('  node scripts/manage-invites.js check ABC123DEF456');
    console.log('  node scripts/manage-invites.js revoke ABC123DEF456');
    console.log('');
    process.exit(0);
  }

  try {
    switch (command) {
      case 'create-platform':
        if (!args[1]) {
          console.error('\n❌ Error: Email is required');
          console.log('Usage: create-platform <email> [invited_by_user_id]\n');
          process.exit(1);
        }
        await createPlatformInvite(args[1], args[2]);
        break;

      case 'create-staff':
        if (!args[1] || !args[2] || !args[3] || !args[4]) {
          console.error('\n❌ Error: Missing required arguments');
          console.log('Usage: create-staff <email> <company_id> <warehouse_id> <role> [invited_by_user_id]\n');
          process.exit(1);
        }
        await createStaffInvite(args[1], args[2], args[3], args[4], args[5]);
        break;

      case 'list':
        await listInvites(args[1]);
        break;

      case 'check':
        if (!args[1]) {
          console.error('\n❌ Error: Invite code is required');
          console.log('Usage: check <invite_code>\n');
          process.exit(1);
        }
        await checkInvite(args[1]);
        break;

      case 'revoke':
        if (!args[1]) {
          console.error('\n❌ Error: Invite code is required');
          console.log('Usage: revoke <invite_code>\n');
          process.exit(1);
        }
        await revokeInvite(args[1]);
        break;

      default:
        console.error(`\n❌ Error: Unknown command: ${command}\n`);
        process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run main function
main();
