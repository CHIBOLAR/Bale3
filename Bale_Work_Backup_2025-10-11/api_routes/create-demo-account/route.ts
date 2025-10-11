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

    // Check if user already exists in database
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', userId)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 200 }
      );
    }

    // Get demo company
    const { data: demoCompany, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('is_demo', true)
      .single();

    if (companyError || !demoCompany) {
      console.error('Demo company not found:', companyError);
      return NextResponse.json(
        { error: 'Demo company not found. Please contact support.' },
        { status: 500 }
      );
    }

    // Extract first name from email
    const firstName = email.split('@')[0] || 'User';

    // Create demo user record
    const { error: userError } = await supabase.from('users').insert({
      company_id: demoCompany.id,
      first_name: firstName,
      last_name: '',
      phone_number: '',
      email: email,
      role: 'staff', // Staff role for demo users (limited by RLS policies)
      is_demo: true,
      auth_user_id: userId,
    });

    if (userError) {
      console.error('Error creating demo user:', userError);
      return NextResponse.json(
        { error: 'Failed to create demo account' },
        { status: 500 }
      );
    }

    console.log('✅ Demo account created for:', email);

    return NextResponse.json(
      {
        success: true,
        message: 'Demo account created successfully'
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
