import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing userId or email' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user already has a full account
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_user_id', userId)
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          success: true,
          message: 'User already has full access',
          hasFullAccess: true
        },
        { status: 200 }
      );
    }

    // No user record = demo mode
    // User can access dashboard in demo mode without a database record
    // Full account will be created only after approval of upgrade request
    console.log('✅ Demo access granted for:', email);

    return NextResponse.json(
      {
        success: true,
        message: 'Demo access granted',
        hasFullAccess: false
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error in create-demo-account:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
