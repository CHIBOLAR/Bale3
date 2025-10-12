import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  const supabase = await createClient();

  // Handle magic link OTP (token_hash + type)
  if (token_hash && type) {
    console.log('🔗 Magic link callback detected');

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (error) {
      console.error('Error verifying OTP:', error);
      return NextResponse.redirect(`${origin}/login?error=invalid_magic_link`);
    }

    if (data.user) {
      console.log('✅ Magic link verified for:', data.user.email);

      // Check if user record exists in our database
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .single();

      // If user doesn't exist, create demo account
      if (!existingUser) {
        try {
          const email = data.user.email!;
          console.log('🎭 Creating demo account for:', email);

          // Get demo company
          const { data: demoCompany } = await supabase
            .from('companies')
            .select('id')
            .eq('is_demo', true)
            .single();

          if (!demoCompany) {
            throw new Error('Demo company not found. Please run migrations.');
          }

          const firstName = data.user.email?.split('@')[0] || 'User';

          // Create demo user record (staff role, read-only via RLS)
          const { error: userError } = await supabase.from('users').insert({
            company_id: demoCompany.id,
            first_name: firstName,
            last_name: '',
            phone_number: '',
            email: email,
            role: 'staff', // Staff role for demo users (limited by RLS policies)
            is_demo: true,
            auth_user_id: data.user.id,
          });

          if (userError) throw userError;

          console.log('✅ Demo user created for:', email);
        } catch (err) {
          console.error('Error creating demo user:', err);
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/?error=demo_creation_failed`);
        }
      }

      // Redirect to dashboard
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Handle OAuth callback (code parameter)
  if (code) {
    console.log('🔐 OAuth callback detected');

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${origin}/login?error=authentication_failed`);
    }

    if (data.user) {
      // Check if user record exists in our database
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .single();

      // If user doesn't exist, create company and user record
      // Two-tier system: Demo (no invite) vs Official (with invite)
      if (!existingUser) {
        try {
          const email = data.user.email!;

          // Check for platform invite (optional now)
          const { data: invite } = await supabase
            .from('invites')
            .select('*')
            .eq('email', email)
            .eq('invite_type', 'platform')
            .in('status', ['pending', 'accepted'])
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();

          // Extract user info from metadata (works for both password and OAuth signup)
          const firstName = data.user.user_metadata.given_name ||
                           data.user.user_metadata.first_name ||
                           data.user.email?.split('@')[0] ||
                           'User';
          const lastName = data.user.user_metadata.family_name ||
                          data.user.user_metadata.last_name ||
                          '';

          if (invite) {
            // ===== OFFICIAL SIGNUP (WITH INVITE) =====
            console.log('🎫 Official signup with invite:', email);

            // Mark invite as accepted
            await supabase
              .from('invites')
              .update({ status: 'accepted' })
              .eq('id', invite.id);

            // Create new company for official user
            const companyName = data.user.user_metadata.full_name
                                 ? `${data.user.user_metadata.full_name}'s Company`
                                 : `${firstName}'s Company`;

            const { data: company, error: companyError } = await supabase
              .from('companies')
              .insert({
                name: companyName,
                is_demo: false,
              })
              .select()
              .single();

            if (companyError) throw companyError;

            // Create user record (official, admin role)
            const { error: userError } = await supabase.from('users').insert({
              company_id: company.id,
              first_name: firstName,
              last_name: lastName,
              phone_number: data.user.user_metadata.phone || '',
              email: email,
              role: 'admin',
              is_demo: false,
              auth_user_id: data.user.id,
            });

            if (userError) throw userError;

            // Create default warehouse
            await supabase.from('warehouses').insert({
              company_id: company.id,
              name: 'Main Warehouse',
              created_by: data.user.id,
            });

            console.log('✅ Official user onboarding completed for:', email);

          } else {
            // ===== DEMO SIGNUP (NO INVITE) =====
            console.log('🎭 Demo signup without invite:', email);

            // Get demo company
            const { data: demoCompany } = await supabase
              .from('companies')
              .select('id')
              .eq('is_demo', true)
              .single();

            if (!demoCompany) {
              throw new Error('Demo company not found. Please run migrations.');
            }

            // Create demo user record (staff role, read-only via RLS)
            const { error: userError } = await supabase.from('users').insert({
              company_id: demoCompany.id,
              first_name: firstName,
              last_name: lastName,
              phone_number: data.user.user_metadata.phone || '',
              email: email,
              role: 'staff', // Staff role for demo users (limited by RLS policies)
              is_demo: true,
              auth_user_id: data.user.id,
            });

            if (userError) throw userError;

            console.log('✅ Demo user created for:', email);
          }

        } catch (err) {
          console.error('Error creating user profile:', err);
          // Sign out the user and redirect to signup with error
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/signup?error=profile_creation_failed`);
        }
      }

      // Redirect to dashboard
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // If no code or other error, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
