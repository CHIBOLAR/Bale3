import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/resend';

/**
 * POST /api/admin/approve-upgrade
 * Two modes:
 * 1. Admin approval: Mark as approved + send email with login link
 * 2. Auto-upgrade on login: Create company + user after successful OTP login
 */
export async function POST(request: NextRequest) {
  try {
    const { requestId, autoUpgrade } = await request.json();

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Use service role to fetch upgrade request (bypasses RLS)
    // We verify admin permissions in handleAdminApproval
    const adminClient = createServiceRoleClient();
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

    // MODE 1: Auto-upgrade on login (after OTP verification)
    if (autoUpgrade) {
      return await handleAutoUpgrade(supabase, adminClient, upgradeRequest);
    }

    // MODE 2: Admin approval (mark as approved + send email)
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
 * Admin marks request as approved and sends email with login link
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

  // Mark as approved using service role (bypasses RLS)
  const { error: approveError } = await adminClient
    .from('upgrade_requests')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: adminUser.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', upgradeRequest.id);

  if (approveError) {
    console.error('Error marking request as approved:', approveError);
    return NextResponse.json(
      { error: 'Failed to approve request' },
      { status: 500 }
    );
  }

  console.log('✅ Admin approved upgrade request for:', upgradeRequest.email);

  // Send email with login link
  const loginLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login?email=${encodeURIComponent(upgradeRequest.email || '')}`;

  const subject = '🎉 Your Bale Inventory Upgrade is Approved!';
  const recipientName = upgradeRequest?.name || 'there';
  const html = generateUpgradeApprovalEmailHTML(loginLink, recipientName);

  try {
    await sendEmail({
      to: upgradeRequest.email,
      subject,
      html,
    });
    console.log('✅ Upgrade approval email sent to:', upgradeRequest.email);
  } catch (emailError) {
    console.error('Error sending email:', emailError);
    // Non-critical, continue
  }

  return NextResponse.json(
    {
      success: true,
      message: `Upgrade approved! Email sent to ${upgradeRequest.email}`,
      loginLink,
    },
    { status: 200 }
  );
}

/**
 * Auto-upgrade: Create company + user after successful login
 */
async function handleAutoUpgrade(supabase: any, adminClient: any, upgradeRequest: any) {
  // Verify request is approved
  if (upgradeRequest.status !== 'approved') {
    return NextResponse.json(
      { error: 'Request is not approved yet' },
      { status: 400 }
    );
  }

  // CRITICAL: Get the CURRENT authenticated user's auth_user_id
  // This is NOT the same as upgradeRequest.auth_user_id (old demo auth)
  console.log('🔐 Getting current authenticated user...');
  const {
    data: { user: currentAuthUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error('❌ Auth error getting user:', authError);
    console.error('❌ Auth error details:', JSON.stringify(authError, null, 2));
    return NextResponse.json(
      { error: `Authentication failed: ${authError.message}` },
      { status: 401 }
    );
  }

  if (!currentAuthUser) {
    console.error('❌ No authenticated user found');
    return NextResponse.json(
      { error: 'Not authenticated - no user session' },
      { status: 401 }
    );
  }

  console.log('🔄 Processing auto-upgrade for:', upgradeRequest.email);
  console.log('📧 Current auth user:', currentAuthUser.email, '| Auth ID:', currentAuthUser.id);
  console.log('📧 Upgrade request email:', upgradeRequest.email, '| Old demo Auth ID:', upgradeRequest.auth_user_id);

  // Check if CURRENT user already has a full account (use service role to bypass RLS)
  console.log('🔍 Checking for existing user with auth_user_id:', currentAuthUser.id);
  const { data: existingUser, error: userCheckError } = await adminClient
    .from('users')
    .select('id, is_demo, email, company_id')
    .eq('auth_user_id', currentAuthUser.id)  // Use CURRENT auth user, not old demo auth
    .maybeSingle();

  console.log('🔍 Existing user check result:', { existingUser, userCheckError });

  if (existingUser && !existingUser.is_demo) {
    console.log('⚠️ User already has full access, aborting upgrade');
    return NextResponse.json(
      { error: 'User already has full access' },
      { status: 400 }
    );
  }

  console.log('✅ User eligible for upgrade. Existing user:', existingUser ? 'YES (will update)' : 'NO (will create new)');

  // 1. Create new company (use service role to bypass RLS)
  const userName = upgradeRequest?.name || 'User';
  const companyName = upgradeRequest?.company || `${userName}'s Company`;

  console.log('🏢 Creating company:', companyName, '| is_demo: false');
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
    console.error('❌ Company error details:', JSON.stringify(companyError, null, 2));
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }

  console.log('✅ Created company:', newCompany.name, '| ID:', newCompany.id, '| is_demo:', newCompany.is_demo);

  // 2. Parse name into first/last
  const nameParts = (userName || 'User').trim().split(' ');
  const firstName = nameParts[0] || 'User';
  const lastName = nameParts.slice(1).join(' ') || '';

  // 3. Create or update user record
  let finalUserId: string;

  if (existingUser) {
    // Update existing user record (linked to CURRENT auth session, use service role)
    console.log('🔄 Updating existing user:', existingUser.id, '| Setting is_demo: false');
    const { error: updateError } = await adminClient
      .from('users')
      .update({
        email: upgradeRequest?.email || 'user@example.com',
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
      console.error('❌ Update error details:', JSON.stringify(updateError, null, 2));
      // Rollback: delete company (use service role)
      await adminClient.from('companies').delete().eq('id', newCompany.id);
      return NextResponse.json(
        { error: 'Failed to upgrade user' },
        { status: 500 }
      );
    }

    finalUserId = existingUser.id;
    console.log('✅ Updated existing user to full access | ID:', finalUserId, '| is_demo: false');
  } else {
    // Create new user record (linked to CURRENT auth session, use service role)
    console.log('➕ Creating new user | auth_user_id:', currentAuthUser.id, '| is_demo: false');
    const { data: newUser, error: createError } = await adminClient
      .from('users')
      .insert({
        auth_user_id: currentAuthUser.id,  // ✅ CRITICAL: Use CURRENT auth user, not old demo auth
        email: upgradeRequest?.email || 'user@example.com',
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

    if (createError || !newUser) {
      console.error('❌ Error creating user:', createError);
      console.error('❌ Create error details:', JSON.stringify(createError, null, 2));
      // Rollback: delete company (use service role)
      await adminClient.from('companies').delete().eq('id', newCompany.id);
      return NextResponse.json(
        { error: 'Failed to create user record' },
        { status: 500 }
      );
    }

    finalUserId = newUser.id;
    console.log('✅ Created new user with full access | ID:', finalUserId, '| is_demo: false');
  }

  // 4. Create default warehouse (use service role)
  const { error: warehouseError } = await adminClient.from('warehouses').insert({
    company_id: newCompany.id,
    name: 'Main Warehouse',
    created_by: currentAuthUser.id,  // ✅ Use CURRENT auth user
  });

  if (warehouseError) {
    console.error('Error creating warehouse:', warehouseError);
    // Non-critical, continue
  } else {
    console.log('✅ Created default warehouse');
  }

  // 5. Mark request as completed (use service role to bypass RLS)
  await adminClient
    .from('upgrade_requests')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', upgradeRequest.id);

  console.log('🎉 AUTO-UPGRADE COMPLETE |', upgradeRequest.email, '|', newCompany.name);

  return NextResponse.json(
    {
      success: true,
      message: 'Account upgraded successfully!',
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
 * Generate HTML for upgrade approval email
 */
function generateUpgradeApprovalEmailHTML(loginLink: string, recipientName: string): string {
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
            <h1 style="margin: 0;">🎉 Access Approved!</h1>
          </div>
          <div class="content">
            <h2>Hi ${recipientName}!</h2>
            <p>Great news! Your request for full access to Bale Inventory has been <strong>approved</strong>.</p>

            <div class="steps">
              <h3 style="margin-top: 0; color: #f59e0b;">Next Steps:</h3>
              <div class="step">1. Log out of your demo account (if you're still logged in)</div>
              <div class="step">2. Click the button below to log in with your email</div>
              <div class="step">3. Enter the OTP code we'll send to your email</div>
              <div class="step">4. Your account will be automatically upgraded!</div>
            </div>

            <div style="text-align: center;">
              <a href="${loginLink}" class="button">Login to Activate Your Account</a>
            </div>

            <div class="features">
              <h3>What you'll get:</h3>
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
