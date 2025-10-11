import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

interface WebhookPayload {
  user: {
    id: string
    email: string
    user_metadata: Record<string, any>
    app_metadata: Record<string, any>
  }
}

Deno.serve(async (req) => {
  try {
    // Parse the webhook payload
    const payload: WebhookPayload = await req.json()
    const { user } = payload

    // Log the signup attempt
    console.log('Validating signup for:', user.email)

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return new Response(
        JSON.stringify({
          error: {
            http_code: 500,
            message: 'Server configuration error'
          }
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get invite code from user metadata (optional)
    const inviteCodeFromUser = user.user_metadata?.invite_code

    // Check for valid platform invite (optional - for two-tier system)
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('id, email, code, expires_at')
      .eq('email', user.email)
      .eq('invite_type', 'platform')
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    // If invite exists AND user provided a code, validate it matches
    if (invite && inviteCodeFromUser) {
      if (inviteCodeFromUser.toUpperCase() !== invite.code.toUpperCase()) {
        console.log('❌ Invalid invite code for:', user.email, '| Expected:', invite.code, '| Got:', inviteCodeFromUser)

        return new Response(
          JSON.stringify({
            error: {
              http_code: 403,
              message: `Invalid invite code. Please check your code and try again.`
            }
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      console.log('✅ Valid invite code verified for:', user.email, '| Invite Code:', invite.code)
    } else if (invite) {
      // Invite exists but no code provided (OAuth or magic link)
      console.log('✅ Valid invite found for:', user.email, '| Invite Code:', invite.code, '| Method: OAuth/Magic Link')
    } else {
      // No invite found - DEMO SIGNUP
      console.log('✅ No invite found - allowing demo signup for:', user.email)
    }

    // ALWAYS ALLOW signup (callback will handle demo vs official assignment)

    return new Response(
      JSON.stringify({ user }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in validate-signup hook:', error)

    // On error, reject signup to be safe
    return new Response(
      JSON.stringify({
        error: {
          http_code: 500,
          message: 'An error occurred during signup validation. Please try again later.'
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
