import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/reject-upgrade
 * Super admin rejects an upgrade request
 */
export async function POST(request: NextRequest) {
  try {
    const { requestId, reason } = await request.json();

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

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

    // Get the upgrade request
    const { data: upgradeRequest, error: requestError } = await supabase
      .from('upgrade_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !upgradeRequest) {
      return NextResponse.json(
        { error: 'Upgrade request not found' },
        { status: 404 }
      );
    }

    // Validate request is pending
    if (upgradeRequest.status !== 'pending') {
      return NextResponse.json(
        { error: `Request has already been ${upgradeRequest.status}` },
        { status: 400 }
      );
    }

    // Mark as rejected
    const { error: rejectError } = await supabase
      .from('upgrade_requests')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: adminUser.id,
        rejection_reason: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (rejectError) {
      console.error('Error rejecting request:', rejectError);
      return NextResponse.json(
        { error: 'Failed to reject request' },
        { status: 500 }
      );
    }

    console.log('✅ Admin rejected upgrade request for:', upgradeRequest.email);

    return NextResponse.json(
      {
        success: true,
        message: `Request for ${upgradeRequest.email} has been rejected`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in reject-upgrade:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
