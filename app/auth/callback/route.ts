import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${origin}/login?error=authentication_failed`);
    }

    if (data.user) {
      // Check if user record exists in our database
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .single();

      // If user doesn't exist, create company and user record
      if (!existingUser) {
        try {
          const email = data.user.email!;

          // Check if user has a valid platform invite
          const { data: invite, error: inviteError } = await supabase
            .from('invites')
            .select('*')
            .eq('email', email)
            .eq('invite_type', 'platform')
            .eq('status', 'pending')
            .gt('expires_at', new Date().toISOString())
            .single();

          if (inviteError || !invite) {
            console.error('No valid invite found for:', email);
            await supabase.auth.signOut();
            return NextResponse.redirect(`${origin}/signup?error=no_invite_found`);
          }

          // Mark invite as accepted
          await supabase
            .from('invites')
            .update({ status: 'accepted', accepted_at: new Date().toISOString() })
            .eq('id', invite.id);

          // Extract user info from Google OAuth
          const firstName = data.user.user_metadata.given_name || data.user.email?.split('@')[0] || 'User';
          const lastName = data.user.user_metadata.family_name || '';

          // Create company (use email domain or user's name)
          const companyName = data.user.user_metadata.full_name
            ? `${data.user.user_metadata.full_name}'s Company`
            : `${firstName}'s Company`;

          const { data: company, error: companyError } = await supabase
            .from('companies')
            .insert({
              name: companyName,
            })
            .select()
            .single();

          if (companyError) throw companyError;

          // Create user record
          const { error: userError } = await supabase.from('users').insert({
            company_id: company.id,
            first_name: firstName,
            last_name: lastName,
            phone_number: data.user.user_metadata.phone || '', // Default empty string if no phone
            email: email,
            role: 'admin',
            auth_user_id: data.user.id,
          });

          if (userError) throw userError;

          // Create default warehouse
          await supabase.from('warehouses').insert({
            company_id: company.id,
            name: 'Main Warehouse',
            created_by: data.user.id,
          });

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
