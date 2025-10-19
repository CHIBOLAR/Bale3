import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/resend';

/**
 * POST /api/admin/approve-upgrade
 * Admin approves upgrade request and immediately creates full account:
 * 1. Create auth user in Supabase Auth
 * 2. Create company
 * 3. Create user record
 * 4. Create default warehouse
 * 5. Send email with login link
 *
 * This creates the complete account instantly when admin approves.
 */
export async function POST(request: NextRequest) {
  try {
    const { requestId } = await request.json();

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const adminClient = createServiceRoleClient();

    // Fetch upgrade request
    const { data: upgradeRequest, error: requestError } = await adminClient
      .from('upgrade_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !upgradeRequest) {
      console.error('Error fetching upgrade request:', requestError);
      return NextResponse.json(
        { error: 'Upgrade request not found' },
        { status: 404 }
      );
    }

    return await handleAdminApproval(supabase, adminClient, upgradeRequest);

  } catch (error) {
    console.error('Error in approve-upgrade:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Admin approves request and immediately creates full account
 */
async function handleAdminApproval(supabase: any, adminClient: any, upgradeRequest: any) {
  // Verify current user is super admin
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { data: adminUser } = await supabase
    .from('users')
    .select('id, role, is_demo, is_superadmin')
    .eq('auth_user_id', authUser.id)
    .maybeSingle();

  if (!adminUser || adminUser.role !== 'admin' || adminUser.is_demo || !adminUser.is_superadmin) {
    return NextResponse.json(
      { error: 'Forbidden: Super admin access required' },
      { status: 403 }
    );
  }

  // Validate request is pending
  if (upgradeRequest.status !== 'pending') {
    return NextResponse.json(
      { error: `Request has already been ${upgradeRequest.status}` },
      { status: 400 }
    );
  }

  console.log('🔄 Creating full account for:', upgradeRequest.email);
  console.log('🔑 Service role key present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log('🌐 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

  // 1. Get or create auth user in Supabase Auth
  console.log('👤 Checking for existing auth user...');
  let authUserId: string;

  // First, try to find existing auth user by email
  const { data: existingAuthUsers } = await adminClient.auth.admin.listUsers();
  const existingAuthUser = existingAuthUsers?.users?.find(
    (u) => u.email?.toLowerCase() === upgradeRequest.email.toLowerCase()
  );

  if (existingAuthUser) {
    console.log('✅ Found existing auth user:', existingAuthUser.email, '| ID:', existingAuthUser.id);
    authUserId = existingAuthUser.id;
  } else {
    // Create new auth user if doesn't exist
    console.log('👤 Creating new auth user...');
    const { data: newAuthUser, error: authError } = await adminClient.auth.admin.createUser({
      email: upgradeRequest.email,
      email_confirm: true,
      user_metadata: {
        name: upgradeRequest.name,
        company: upgradeRequest.company,
      },
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError);
      console.error('❌ Auth error message:', authError.message);
      console.error('❌ Auth error details:', JSON.stringify(authError, null, 2));
      return NextResponse.json(
        { error: `Failed to create auth user: ${authError.message}` },
        { status: 500 }
      );
    }

    if (!newAuthUser?.user) {
      console.error('❌ No user returned from createUser');
      console.error('❌ newAuthUser data:', JSON.stringify(newAuthUser, null, 2));
      return NextResponse.json(
        { error: 'Failed to create auth user: No user data returned' },
        { status: 500 }
      );
    }

    authUserId = newAuthUser.user.id;
    console.log('✅ Created new auth user:', newAuthUser.user.email, '| ID:', authUserId);
  }

  // 2. Create company
  const userName = upgradeRequest?.name || 'User';
  const companyName = upgradeRequest?.company || `${userName}'s Company`;

  console.log('🏢 Creating company:', companyName);
  const { data: newCompany, error: companyError } = await adminClient
    .from('companies')
    .insert({
      name: companyName,
      is_demo: false,
    })
    .select()
    .single();

  if (companyError || !newCompany) {
    console.error('❌ Error creating company:', companyError);
    // Note: We don't delete auth user on rollback if it existed before
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }

  console.log('✅ Created company:', newCompany.name, '| ID:', newCompany.id);

  // 3. Create or update user record
  const nameParts = (userName || 'User').trim().split(' ');
  const firstName = nameParts[0] || 'User';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Check if user record already exists for this auth user
  console.log('🔍 Checking for existing user record with auth_user_id:', authUserId);
  const { data: existingUser } = await adminClient
    .from('users')
    .select('id, is_demo, company_id')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  let finalUserId: string;

  if (existingUser) {
    // Update existing demo user to full access
    console.log('🔄 Updating existing user record:', existingUser.id, '| Setting is_demo: false');
    const { error: updateError } = await adminClient
      .from('users')
      .update({
        email: upgradeRequest.email,
        company_id: newCompany.id,
        is_demo: false,
        role: 'admin',
        first_name: firstName,
        last_name: lastName,
        phone_number: upgradeRequest?.phone || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingUser.id);

    if (updateError) {
      console.error('❌ Error updating user:', updateError);
      // Rollback: delete company
      await adminClient.from('companies').delete().eq('id', newCompany.id);
      return NextResponse.json(
        { error: 'Failed to upgrade user record' },
        { status: 500 }
      );
    }

    finalUserId = existingUser.id;
    console.log('✅ Updated user record to full access | ID:', finalUserId);
  } else {
    // Create new user record
    console.log('👤 Creating new user record...');
    const { data: newUser, error: userError } = await adminClient
      .from('users')
      .insert({
        auth_user_id: authUserId,
        email: upgradeRequest.email,
        first_name: firstName,
        last_name: lastName,
        phone_number: upgradeRequest?.phone || '',
        company_id: newCompany.id,
        role: 'admin',
        is_demo: false,
        is_active: true,
      })
      .select('id')
      .single();

    if (userError || !newUser) {
      console.error('❌ Error creating user:', userError);
      // Rollback: delete company
      await adminClient.from('companies').delete().eq('id', newCompany.id);
      return NextResponse.json(
        { error: 'Failed to create user record' },
        { status: 500 }
      );
    }

    finalUserId = newUser.id;
    console.log('✅ Created user record | ID:', finalUserId);
  }

  // 4. Create default warehouse
  console.log('🏭 Creating default warehouse...');
  const { error: warehouseError } = await adminClient.from('warehouses').insert({
    company_id: newCompany.id,
    name: 'Main Warehouse',
    created_by: authUserId,
  });

  if (warehouseError) {
    console.error('⚠️ Error creating warehouse:', warehouseError);
    // Non-critical, continue
  } else {
    console.log('✅ Created default warehouse');
  }

  // 5. Mark request as completed
  const { error: updateError } = await adminClient
    .from('upgrade_requests')
    .update({
      status: 'completed',
      approved_at: new Date().toISOString(),
      approved_by: adminUser.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', upgradeRequest.id);

  if (updateError) {
    console.error('⚠️ Error updating upgrade request:', updateError);
    // Non-critical, continue
  }

  console.log('🎉 ACCOUNT CREATED SUCCESSFULLY |', upgradeRequest.email, '|', newCompany.name);

  // 6. Send email with login link
  const loginLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login?email=${encodeURIComponent(upgradeRequest.email || '')}`;

  const subject = '🎉 Your Bale Inventory Account is Ready!';
  const recipientName = upgradeRequest?.name || 'there';
  const html = generateAccountCreatedEmailHTML(loginLink, recipientName);

  try {
    await sendEmail({
      to: upgradeRequest.email,
      subject,
      html,
    });
    console.log('✅ Account creation email sent to:', upgradeRequest.email);
  } catch (emailError) {
    console.error('⚠️ Error sending email:', emailError);
    // Non-critical, continue
  }

  return NextResponse.json(
    {
      success: true,
      message: `Account created successfully! Email sent to ${upgradeRequest.email}`,
      user: {
        id: finalUserId,
        email: upgradeRequest.email,
      },
      company: {
        id: newCompany.id,
        name: newCompany.name,
      },
    },
    { status: 200 }
  );
}

/**
 * Generate HTML for account creation email
 */
function generateAccountCreatedEmailHTML(loginLink: string, recipientName: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background-color: #f9fafb; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 16px 32px; background-color: #2563eb; color: white !important; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .button:hover { background-color: #1e40af; }
          .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feature-item { display: flex; align-items: start; margin: 15px 0; }
          .checkmark { color: #10b981; margin-right: 10px; font-size: 20px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .steps { background: #fff7ed; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .step { margin: 10px 0; padding-left: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎉 Your Account is Ready!</h1>
          </div>
          <div class="content">
            <h2>Hi ${recipientName}!</h2>
            <p>Great news! Your Bale Inventory account has been <strong>created and activated</strong>.</p>

            <div class="steps">
              <h3 style="margin-top: 0; color: #f59e0b;">How to Access Your Account:</h3>
              <div class="step">1. Click the login button below</div>
              <div class="step">2. Enter your email address</div>
              <div class="step">3. Check your email for a 6-digit OTP code</div>
              <div class="step">4. Enter the code and you're in!</div>
            </div>

            <div style="text-align: center;">
              <a href="${loginLink}" class="button">Login to Your Account</a>
            </div>

            <div class="features">
              <h3>What you get:</h3>
              <div class="feature-item">
                <span class="checkmark">✓</span>
                <div>
                  <strong>Your Own Company</strong><br>
                  <span style="color: #6b7280;">Dedicated company account with complete data isolation</span>
                </div>
              </div>
              <div class="feature-item">
                <span class="checkmark">✓</span>
                <div>
                  <strong>Full Access</strong><br>
                  <span style="color: #6b7280;">Create, edit, and delete inventory, orders, and partners</span>
                </div>
              </div>
              <div class="feature-item">
                <span class="checkmark">✓</span>
                <div>
                  <strong>Team Collaboration</strong><br>
                  <span style="color: #6b7280;">Invite team members with different roles</span>
                </div>
              </div>
              <div class="feature-item">
                <span class="checkmark">✓</span>
                <div>
                  <strong>Priority Support</strong><br>
                  <span style="color: #6b7280;">Direct support channel for your queries</span>
                </div>
              </div>
            </div>

            <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
              <strong>Note:</strong> This is a regular login link (not a magic link). You'll need to verify your email with an OTP code.
            </p>
          </div>
          <div class="footer">
            <p>This is an automated message from Bale Inventory.</p>
            <p>Built for Indian textile traders.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
