import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/request-invite
 * Public endpoint for website visitors to request access
 */
export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, company, message } = await request.json();

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if user already exists (allow demo users to request upgrade)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, is_demo')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser && !existingUser.is_demo) {
      // Official user already exists - reject
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Demo user exists - allow request (will trigger upgrade flow)
    if (existingUser && existingUser.is_demo) {
      console.log('Demo user requesting upgrade:', email);
    }

    // Check if there's already an active invite
    const { data: existingInvite } = await supabase
      .from('invites')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .eq('invite_type', 'platform')
      .in('status', ['pending'])
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (existingInvite) {
      return NextResponse.json(
        { error: 'You already have an active invitation. Check your email.' },
        { status: 400 }
      );
    }

    // Generate a unique code for this request
    const code = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Store the request in the invites table with special metadata
    const { data: invite, error: createError } = await supabase
      .from('invites')
      .insert({
        invite_type: 'platform',
        code: code,
        email: email.toLowerCase().trim(),
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        metadata: {
          request_type: 'access_request',
          name: name.trim(),
          phone: phone?.trim() || null,
          company: company?.trim() || null,
          message: message?.trim() || null,
          is_demo_upgrade: existingUser?.is_demo || false,
          generation_method: 'api',
        },
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating invite request:', createError);
      return NextResponse.json(
        { error: 'Failed to submit request' },
        { status: 500 }
      );
    }

    console.log('📬 New access request created:', invite.id);

    // TODO: Send email notification to super admin

    return NextResponse.json({
      success: true,
      message: 'Your access request has been submitted successfully! You will receive an email once it is approved.',
    }, { status: 201 });

  } catch (error) {
    console.error('Error in request-invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
