import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/request-invite
 * DEMO USERS ONLY - Request upgrade from demo to full access
 * Stores request in upgrade_requests table (no user record created until approval)
 */
export async function POST(request: NextRequest) {
  try {
    const { name, phone, company, message } = await request.json();

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // CRITICAL: User must be logged in
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

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

    // Check if already requested
    const { data: existingRequest } = await supabase
      .from('upgrade_requests')
      .select('id, status')
      .eq('auth_user_id', authUser.id)
      .maybeSingle();

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return NextResponse.json(
          { error: 'Your upgrade request is pending admin approval' },
          { status: 400 }
        );
      } else if (existingRequest.status === 'approved') {
        return NextResponse.json(
          { error: 'Your upgrade has been approved. Please log out and log back in.' },
          { status: 400 }
        );
      } else if (existingRequest.status === 'rejected') {
        // Allow re-request if previously rejected
        const { error: updateError } = await supabase
          .from('upgrade_requests')
          .update({
            name: name.trim(),
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
            { error: 'Failed to submit request' },
            { status: 500 }
          );
        }

        console.log('✅ Upgrade request resubmitted:', authUser.email);
        return NextResponse.json({
          success: true,
          message: 'Your upgrade request has been resubmitted! Our team will review it and you\'ll receive an email once approved.',
        }, { status: 200 });
      }
    }

    // Create new upgrade request
    const { error: insertError } = await supabase
      .from('upgrade_requests')
      .insert({
        auth_user_id: authUser.id,
        email: authUser.email || '',
        name: name.trim(),
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        message: message?.trim() || null,
        status: 'pending',
      });

    if (insertError) {
      console.error('Error creating upgrade request:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit request' },
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
