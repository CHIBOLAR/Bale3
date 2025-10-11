/**
 * Quick script to generate a test invite with magic link
 * Usage: npx tsx scripts/generate-invite.ts <email>
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generateInvite(email: string) {
  // Generate 4-digit code
  const code = Math.floor(1000 + Math.random() * 9000).toString();

  // Create invite
  const { data: invite, error } = await supabase
    .from('invites')
    .insert({
      email: email.toLowerCase(),
      code: code,
      invite_type: 'platform',
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating invite:', error);
    process.exit(1);
  }

  // Generate magic link
  const magicLink = `http://localhost:3000/signup?invite=${code}&email=${encodeURIComponent(email.toLowerCase())}`;

  console.log('\n✅ Invite Created Successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 Email:      ${invite.email}`);
  console.log(`🔑 Code:       ${invite.code}`);
  console.log(`⏰ Expires:    ${new Date(invite.expires_at).toLocaleString()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🔗 Magic Link:');
  console.log(magicLink);
  console.log('\n');
}

const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: npx tsx scripts/generate-invite.ts <email>');
  process.exit(1);
}

generateInvite(email);
