import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/reject-invite
 * Rejects an invite request
 */
export async function POST(request: NextRequest) {
  try {
    const { requestId } = await request.json();

    // Validation
    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
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

    // Update the invite status to revoked (rejected)
    const { error: updateError } = await supabase
      .from('invites')
      .update({
        status: 'revoked',
        updated_at: new Date().toISOString(),
        metadata: {
          ...(inviteRequest.metadata as any || {}),
          rejected_at: new Date().toISOString(),
          rejected_by: user.id,
        },
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating invite request:', updateError);
      return NextResponse.json(
        { error: 'Failed to update request status' },
        { status: 500 }
      );
    }

    console.log('Invite request rejected:', requestId);

    // TODO: Optionally send rejection email (Phase 8)
    // For now, we just reject silently

    return NextResponse.json(
      {
        success: true,
        message: 'Invite request rejected successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in reject-invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
