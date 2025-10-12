import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/approve-upgrade
 * Super admin approves an upgrade request
 * Creates user record, company, and marks request as approved
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

    // Check if user already has a full account
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, is_demo')
      .eq('auth_user_id', upgradeRequest.auth_user_id)
      .maybeSingle();

    if (existingUser && !existingUser.is_demo) {
      return NextResponse.json(
        { error: 'User already has full access' },
        { status: 400 }
      );
    }

    console.log('🔄 Processing upgrade approval for:', upgradeRequest.email);

    // 1. Create new company
    const companyName = upgradeRequest.company || `${upgradeRequest.name}'s Company`;

    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: companyName,
        is_demo: false,
      })
      .select()
      .single();

    if (companyError || !newCompany) {
      console.error('Error creating company:', companyError);
      return NextResponse.json(
        { error: 'Failed to create company' },
        { status: 500 }
      );
    }

    console.log('✅ Created company:', newCompany.name);

    // 2. Parse name into first/last
    const nameParts = upgradeRequest.name.trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    // 3. Create or update user record
    let finalUserId: string;

    if (existingUser) {
      // Update existing demo user
      const { error: updateError } = await supabase
        .from('users')
        .update({
          company_id: newCompany.id,
          is_demo: false,
          role: 'admin',
          first_name: firstName,
          last_name: lastName,
          phone_number: upgradeRequest.phone || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id);

      if (updateError) {
        console.error('Error updating user:', updateError);
        // Rollback: delete company
        await supabase.from('companies').delete().eq('id', newCompany.id);
        return NextResponse.json(
          { error: 'Failed to upgrade user' },
          { status: 500 }
        );
      }

      finalUserId = existingUser.id;
      console.log('✅ Updated existing user to full access');
    } else {
      // Create new user record
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          auth_user_id: upgradeRequest.auth_user_id,
          email: upgradeRequest.email,
          first_name: firstName,
          last_name: lastName,
          phone_number: upgradeRequest.phone || '',
          company_id: newCompany.id,
          role: 'admin',
          is_demo: false,
          is_active: true,
        })
        .select('id')
        .single();

      if (createError || !newUser) {
        console.error('Error creating user:', createError);
        // Rollback: delete company
        await supabase.from('companies').delete().eq('id', newCompany.id);
        return NextResponse.json(
          { error: 'Failed to create user record' },
          { status: 500 }
        );
      }

      finalUserId = newUser.id;
      console.log('✅ Created new user with full access');
    }

    // 4. Create default warehouse
    const { error: warehouseError } = await supabase.from('warehouses').insert({
      company_id: newCompany.id,
      name: 'Main Warehouse',
      created_by: upgradeRequest.auth_user_id,
    });

    if (warehouseError) {
      console.error('Error creating warehouse:', warehouseError);
      // Non-critical, continue
    } else {
      console.log('✅ Created default warehouse');
    }

    // 5. Mark upgrade request as approved
    const { error: approveError } = await supabase
      .from('upgrade_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: adminUser.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (approveError) {
      console.error('Error marking request as approved:', approveError);
      // Non-critical, user is already upgraded
    }

    console.log('🎉 UPGRADE COMPLETE |', upgradeRequest.email, '|', newCompany.name);

    return NextResponse.json(
      {
        success: true,
        message: `User ${upgradeRequest.email} has been upgraded successfully!`,
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
  } catch (error) {
    console.error('Error in approve-upgrade:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
