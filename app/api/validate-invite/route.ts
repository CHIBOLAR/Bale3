import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, email } = await request.json();

    if (!code || !email) {
      return NextResponse.json(
        { valid: false, error: 'Invite code and email are required' },
        { status: 200 }
      );
    }

    // Validate code format (4 digits)
    if (!/^\d{4}$/.test(code)) {
      return NextResponse.json(
        { valid: false, error: 'Invite code must be 4 digits' },
        { status: 200 }
      );
    }

    const supabase = await createClient();

    // Check if invite exists and is valid
    const { data: invite, error } = await supabase
      .from('invites')
      .select('*')
      .eq('code', code)
      .eq('email', email.toLowerCase())
      .eq('invite_type', 'platform')
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !invite) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid or expired invite code for this email. Please check your invite email.'
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ valid: true, invite }, { status: 200 });
  } catch (error) {
    console.error('Error validating invite:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate invite code' },
      { status: 200 }
    );
  }
}
