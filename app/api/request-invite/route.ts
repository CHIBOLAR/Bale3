import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/request-invite
 * DEMO USERS ONLY - Request upgrade from demo to full access
 * Stores request in upgrade_requests table (no user record created until approval)
 */
export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, company, message } = await request.json();

    console.log('🔵 Upgrade request received:', { name, email, phone, company });

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // CRITICAL: User must be logged in
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    console.log('🔵 Auth user:', authUser?.id, authUser?.email);

    if (!authUser) {
      return NextResponse.json(
        { error: 'You must be logged in to request upgrade. Please try the demo first.' },
        { status: 401 }
      );
    }

    // Check if user already has a full account
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, is_demo')
      .eq('auth_user_id', authUser.id)
      .maybeSingle();

    if (existingUser && !existingUser.is_demo) {
      return NextResponse.json(
        { error: 'Your account already has full access' },
        { status: 400 }
      );
    }

    const isDemo = existingUser?.is_demo || !existingUser;

    console.log('🔵 User status:', { isDemo, existingUserId: existingUser?.id, isDemoFlag: existingUser?.is_demo });

    // Check if already requested
    // CRITICAL: For demo users, check by EMAIL only (they share same auth_user_id)
    // For regular users, check by auth_user_id
    const checkField = isDemo ? 'email' : 'auth_user_id';
    const checkValue = isDemo ? email.trim().toLowerCase() : authUser.id;

    console.log('🔵 Checking existing request by:', checkField, '=', checkValue);

    const { data: existingRequest, error: queryError } = await supabase
      .from('upgrade_requests')
      .select('id, status, email')
      .eq(checkField, checkValue)
      .maybeSingle();

    if (queryError) {
      console.error('🔴 Error querying existing request:', queryError);
    }

    console.log('🔵 Existing request:', existingRequest ? { id: existingRequest.id, status: existingRequest.status, email: existingRequest.email } : 'none');

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return NextResponse.json(
          { error: 'Your upgrade request is pending admin approval' },
          { status: 400 }
        );
      } else if (existingRequest.status === 'approved') {
        return NextResponse.json(
          { error: `Your upgrade has been approved! Please log out, then log in using this email: ${existingRequest.email}. Your account will be automatically upgraded on login.` },
          { status: 400 }
        );
      } else if (existingRequest.status === 'rejected' || existingRequest.status === 'cancelled') {
        // Allow re-request if previously rejected or cancelled
        const { error: updateError } = await supabase
          .from('upgrade_requests')
          .update({
            name: name.trim(),
            email: email.trim().toLowerCase(),  // Update email in case they want to change it
            phone: phone?.trim() || null,
            company: company?.trim() || null,
            message: message?.trim() || null,
            status: 'pending',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingRequest.id);

        if (updateError) {
          console.error('Error updating upgrade request:', updateError);
          return NextResponse.json(
            { error: `Failed to update request: ${updateError.message || 'Unknown error'}` },
            { status: 500 }
          );
        }

        console.log('✅ Upgrade request resubmitted:', email);
        return NextResponse.json({
          success: true,
          message: 'Your upgrade request has been resubmitted! Our team will review it and you\'ll receive an email once approved.',
        }, { status: 200 });
      } else if (existingRequest.status === 'completed') {
        return NextResponse.json(
          { error: 'Your account has already been upgraded. You have full access!' },
          { status: 400 }
        );
      }
    }

    // Create new upgrade request (use submitted email, not auth session email)
    console.log('🔵 Creating new upgrade request...');

    const newRequest = {
      auth_user_id: authUser.id,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      phone: phone?.trim() || null,
      company: company?.trim() || null,
      message: message?.trim() || null,
      status: 'pending',
    };

    console.log('🔵 Insert data:', newRequest);

    const { error: insertError } = await supabase
      .from('upgrade_requests')
      .insert(newRequest);

    if (insertError) {
      console.error('Error creating upgrade request:', insertError);

      // Check for specific database errors
      if (insertError.code === '23505') {
        // Unique constraint violation - duplicate email
        return NextResponse.json(
          { error: 'This email address has already been used for an upgrade request.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: `Failed to submit request: ${insertError.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    console.log('✅ Upgrade request created:', authUser.email);

    return NextResponse.json({
      success: true,
      message: 'Your upgrade request has been submitted! Our team will review it and you\'ll receive an email once your account is upgraded.',
    }, { status: 200 });

  } catch (error) {
    console.error('Error in request-invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
