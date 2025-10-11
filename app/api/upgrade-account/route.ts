import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/upgrade-account
 * Upgrades a demo user to an official account (SaaS conversion pattern)
 * User must be logged in as demo user and have valid invite token
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    // Validation
    if (!token) {
      return NextResponse.json(
        { error: 'Invite token is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user (must be logged in)
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'You must be logged in to upgrade your account' },
        { status: 401 }
      );
    }

    // Get user's current profile
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('*, company:companies(*)')
      .eq('auth_user_id', authUser.id)
      .single();

    if (userError || !currentUser) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Verify user is a demo user
    if (!currentUser.is_demo) {
      return NextResponse.json(
        { error: 'This account is already an official account' },
        { status: 400 }
      );
    }

    // Validate invite token
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*')
      .eq('code', token.toUpperCase())
      .eq('email', currentUser.email.toLowerCase())
      .eq('invite_type', 'platform')
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invalid or expired invite token' },
        { status: 400 }
      );
    }

    // Check if invite metadata indicates this is an upgrade
    const isUpgrade = invite.metadata?.is_upgrade === true;
    if (!isUpgrade) {
      return NextResponse.json(
        { error: 'This invite is not for account upgrades' },
        { status: 400 }
      );
    }

    // === PERFORM UPGRADE ===
    console.log('🔄 Upgrading demo user to official:', currentUser.email);

    // 1. Create new company for the user
    const companyName = currentUser.company?.name?.replace(' - Demo Account', '') ||
                       `${currentUser.first_name}'s Company`;

    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: companyName,
        is_demo: false,
      })
      .select()
      .single();

    if (companyError) {
      console.error('Error creating company:', companyError);
      return NextResponse.json(
        { error: 'Failed to create company' },
        { status: 500 }
      );
    }

    // 2. Update user record (upgrade to official)
    const { error: updateUserError } = await supabase
      .from('users')
      .update({
        company_id: newCompany.id,
        role: 'admin',
        is_demo: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentUser.id);

    if (updateUserError) {
      console.error('Error updating user:', updateUserError);
      // Rollback: delete the created company
      await supabase.from('companies').delete().eq('id', newCompany.id);
      return NextResponse.json(
        { error: 'Failed to upgrade user' },
        { status: 500 }
      );
    }

    // 3. Create default warehouse for the new company
    const { error: warehouseError } = await supabase.from('warehouses').insert({
      company_id: newCompany.id,
      name: 'Main Warehouse',
      location: '',
      created_by: authUser.id,
    });

    if (warehouseError) {
      console.error('Error creating warehouse:', warehouseError);
      // Non-critical error, continue
    }

    // 4. Mark invite as accepted
    await supabase
      .from('invites')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', invite.id);

    console.log('✅ Successfully upgraded user:', currentUser.email, '| New company:', newCompany.name);

    return NextResponse.json(
      {
        success: true,
        message: 'Your account has been upgraded to official status!',
        company: {
          id: newCompany.id,
          name: newCompany.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in upgrade-account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
