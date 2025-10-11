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
      .select('role, is_demo')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData || userData.role !== 'admin' || userData.is_demo) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
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

    // Use the existing invite record - just update status to accepted and set invited_by
    const { error: updateError } = await supabase
      .from('invites')
      .update({
        status: 'accepted',
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

    console.log(
      isUpgrade ? '🔄 Approved upgrade request for:' : '✨ Approved new access request for:',
      email,
      '| Code:',
      inviteCode
    );

    // TODO: Send email with invite link using Resend
    // This will be implemented in Phase 8
    const upgradeLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/upgrade?token=${inviteCode}`;
    const signupLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/signup?code=${inviteCode}`;

    console.log('TODO: Send invite email to:', email, '| Invite code:', inviteCode);
    console.log(isUpgrade ? '📧 Upgrade link:' : '📧 Signup link:', isUpgrade ? upgradeLink : signupLink);

    return NextResponse.json(
      {
        success: true,
        message: isUpgrade
          ? 'Upgrade approved! User will receive upgrade link via email.'
          : 'Invite request approved successfully',
        inviteId,
        inviteCode,
        isUpgrade,
        inviteLink: isUpgrade ? upgradeLink : signupLink,
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
