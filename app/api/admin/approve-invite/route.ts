import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/approve-invite
 * Approves an invite request and creates a platform invite
 */
export async function POST(request: NextRequest) {
  try {
    const { requestId, email, name } = await request.json();

    // Validation
    if (!requestId || !email) {
      return NextResponse.json(
        { error: 'Request ID and email are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user and verify they're an admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role, is_demo, is_super_admin')
      .eq('auth_user_id', user.id)
      .single();

    // Only super admins can approve access requests
    if (!userData || userData.role !== 'admin' || userData.is_demo || !userData.is_super_admin) {
      return NextResponse.json(
        { error: 'Forbidden: Super admin access required' },
        { status: 403 }
      );
    }

    // Check if request exists and is pending in invites table
    const { data: inviteRequest, error: fetchError } = await supabase
      .from('invites')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !inviteRequest) {
      return NextResponse.json(
        { error: 'Invite request not found' },
        { status: 404 }
      );
    }

    if (inviteRequest.status !== 'pending') {
      return NextResponse.json(
        { error: `Request is already ${inviteRequest.status}` },
        { status: 400 }
      );
    }

    // Extract metadata from the invite
    const metadata = inviteRequest.metadata as any || {};

    // Check if user is a demo user (upgrade flow)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, is_demo, auth_user_id')
      .eq('email', email.toLowerCase())
      .single();

    const isUpgrade = metadata.is_demo_upgrade || (existingUser && existingUser.is_demo);

    // Update invite status - super admin approval
    const { error: updateError } = await supabase
      .from('invites')
      .update({
        status: 'approved',
        invited_by: user.id,
        updated_at: new Date().toISOString(),
        metadata: {
          ...metadata,
          approved_at: new Date().toISOString(),
          approved_by: user.id,
        },
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating invite:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve request' },
        { status: 500 }
      );
    }

    const inviteId = requestId;
    const inviteCode = inviteRequest.code;
    const inviteType = inviteRequest.invite_type;

    console.log(
      '✅ Super admin approved',
      inviteType === 'platform' ? 'NEW COMPANY request' : 'STAFF request',
      '| Email:',
      email,
      '| Code:',
      inviteCode,
      '| Is Upgrade:',
      isUpgrade
    );

    // Generate invite link - always use /signup for both staff and upgrades
    const signupLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/signup?code=${inviteCode}`;
    const inviteLink = signupLink;

    // Send email using Supabase Auth
    try {
      // Platform invites = Demo upgrades (existing demo users)
      // Staff invites = New staff members (uses admin invite)

      if (inviteType === 'staff') {
        // STAFF INVITE: New staff member joining existing company
        const { data: inviteData, error: inviteEmailError } = await supabase.auth.admin.inviteUserByEmail(
          email,
          {
            data: {
              invite_code: inviteCode,
              invite_link: signupLink,
              invited_by: user.id,
              name: metadata.name || 'there',
            },
            redirectTo: signupLink,
          }
        );

        if (inviteEmailError) {
          console.error('Error sending staff invite email:', inviteEmailError);
          console.log('⚠️ Email not sent. Please configure custom SMTP in Supabase Dashboard.');
          console.log('📧 Staff invite link:', signupLink);
        } else {
          console.log('✅ Staff invite email sent successfully to:', email);
        }
      } else if (inviteType === 'platform') {
        // PLATFORM INVITE: Demo user upgrading to full access
        if (!isUpgrade) {
          console.error('❌ ERROR: Platform invite without demo upgrade flag!');
          console.log('This should not happen. Platform invites must be for demo upgrades only.');
          throw new Error('Invalid platform invite: must be for demo user upgrade');
        }

        // Send signup link to demo user (they'll verify via OTP)
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: email,
          options: {
            data: {
              invite_code: inviteCode,
              signup_link: signupLink,
              is_upgrade: true,
            },
            shouldCreateUser: false, // User already exists (demo user)
          },
        });

        if (otpError) {
          console.error('Error sending upgrade notification:', otpError);
          console.log('⚠️ Email not sent. Please configure custom SMTP in Supabase Dashboard.');
          console.log('📧 Signup link:', signupLink);
        } else {
          console.log('✅ Upgrade notification sent to:', email);
        }
      } else {
        throw new Error(`Unknown invite type: ${inviteType}`);
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      console.log('⚠️ Email sending failed. Please ensure custom SMTP is configured in Supabase Dashboard.');
      console.log('📋 Manual action required: Send this link to the user:');
      console.log('📧', inviteLink);
    }

    console.log('📧 Invite link:', inviteLink);

    return NextResponse.json(
      {
        success: true,
        message: isUpgrade
          ? 'Upgrade approved! User will receive signup link via email.'
          : 'Invite request approved successfully',
        inviteId,
        inviteCode,
        isUpgrade,
        inviteLink: signupLink,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in approve-invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
