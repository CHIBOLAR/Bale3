import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/create-staff-invite
 * Creates invite for staff member (called by admin from Staff Management module)
 */
export async function POST(request: NextRequest) {
  try {
    const { staffUserId } = await request.json();

    if (!staffUserId) {
      return NextResponse.json(
        { error: 'Staff user ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user (admin)
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify admin permissions
    const { data: adminUser } = await supabase
      .from('users')
      .select('role, is_demo, company_id')
      .eq('auth_user_id', authUser.id)
      .single();

    if (!adminUser || adminUser.role !== 'admin' || adminUser.is_demo) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get staff user details
    const { data: staffUser, error: staffError } = await supabase
      .from('users')
      .select('*, warehouse:warehouses(name)')
      .eq('id', staffUserId)
      .eq('company_id', adminUser.company_id) // Ensure same company
      .single();

    if (staffError || !staffUser) {
      return NextResponse.json(
        { error: 'Staff user not found or does not belong to your company' },
        { status: 404 }
      );
    }

    // Check if staff already has auth_user_id (already signed up)
    if (staffUser.auth_user_id) {
      return NextResponse.json(
        { error: 'This staff member has already signed up' },
        { status: 400 }
      );
    }

    // Check if there's already an active invite for this staff
    const { data: existingInvite } = await supabase
      .from('invites')
      .select('id, status, code')
      .eq('company_id', adminUser.company_id)
      .eq('invite_type', 'staff')
      .in('status', ['approved'])
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (existingInvite) {
      // Return existing invite
      const signupLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/signup?code=${existingInvite.code}`;

      return NextResponse.json({
        success: true,
        message: 'Active invite already exists for this staff member',
        inviteCode: existingInvite.code,
        signupLink,
        existing: true,
      }, { status: 200 });
    }

    // Generate unique code
    const code = `STAFF-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create staff invite
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .insert({
        invite_type: 'staff',
        code: code,
        email: staffUser.email,
        company_id: adminUser.company_id,
        role: 'staff',
        status: 'approved', // Auto-approved (admin created)
        invited_by: authUser.id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        metadata: {
          staff_user_id: staffUserId, // Link to existing staff record
          staff_name: `${staffUser.first_name} ${staffUser.last_name}`,
          warehouse_name: staffUser.warehouse?.name || null,
          generation_method: 'admin_staff_module',
          created_by_admin: authUser.id,
        },
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating staff invite:', inviteError);
      return NextResponse.json(
        { error: 'Failed to create invite' },
        { status: 500 }
      );
    }

    // Generate signup link
    const signupLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/signup?code=${code}`;

    console.log('✅ Staff invite created:', invite.id, '| Staff:', staffUser.email);

    // TODO: Send email to staff with signup link
    // For now, return the link so admin can share it manually

    return NextResponse.json({
      success: true,
      message: 'Staff invite created successfully',
      inviteCode: code,
      signupLink,
      staffEmail: staffUser.email,
      staffName: `${staffUser.first_name} ${staffUser.last_name}`,
    }, { status: 201 });

  } catch (error) {
    console.error('Error in create-staff-invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
