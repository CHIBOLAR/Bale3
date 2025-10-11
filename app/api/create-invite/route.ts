import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get authenticated user (admin creating the invite)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate 4-digit code (1000-9999)
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Create invite
    const { data: invite, error } = await supabase
      .from('invites')
      .insert({
        email: email.toLowerCase(),
        code: code,
        invite_type: 'platform',
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invite:', error);
      return NextResponse.json(
        { error: 'Failed to create invite' },
        { status: 500 }
      );
    }

    // Generate magic link
    const origin = request.nextUrl.origin;
    const magicLink = `${origin}/signup?invite=${code}&email=${encodeURIComponent(email.toLowerCase())}`;

    return NextResponse.json({
      success: true,
      invite: {
        email: invite.email,
        code: invite.code,
        magicLink: magicLink,
        expiresAt: invite.expires_at,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error in create-invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
