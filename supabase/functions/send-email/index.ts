import { Resend } from 'npm:resend@4.0.0';
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';
import {
  generateOTPEmail,
  generateMagicLinkEmail,
  generateEmailChangeEmail,
  generateRecoveryEmail,
} from '../_shared/email-templates.ts';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')?.replace('v1,whsec_', '');

interface WebhookPayload {
  event?: {
    id: string;
    type: string;
    created_at: string;
  };
  user: {
    id: string;
    email: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

console.log('✅ Send Email Function started');

Deno.serve(async (req: Request) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Verify webhook using Standard Webhooks
    if (!hookSecret) {
      console.error('❌ SEND_EMAIL_HOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the raw body for verification
    const body = await req.text();
    const headers = Object.fromEntries(req.headers.entries());

    // Verify the webhook signature
    const wh = new Webhook(hookSecret);
    let payload: WebhookPayload;

    try {
      payload = wh.verify(body, headers) as WebhookPayload;
    } catch (err) {
      console.error('❌ Webhook verification failed:', err);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('📧 Processing email:', {
      type: payload.email_data.email_action_type,
      email: payload.user.email,
    });

    console.log('📦 Full payload:', JSON.stringify(payload));

    // Prepare email data
    const { email } = payload.user;
    const {
      token,
      token_hash,
      redirect_to,
      email_action_type,
      site_url,
    } = payload.email_data;

    const templateProps = {
      email,
      token,
      token_hash,
      redirect_to,
      email_action_type,
      site_url,
    };

    let emailContent: { subject: string; html: string };

    // Generate email based on action type
    // Force OTP template if token exists (even for magiclink type)
    if (token && (email_action_type === 'magiclink' || email_action_type === 'login' || email_action_type === 'signup')) {
      console.log('🔢 Using OTP template (token present)');
      emailContent = JSON.parse(generateOTPEmail(templateProps));
    } else {
      switch (email_action_type) {
        case 'signup':
        case 'login':
          emailContent = JSON.parse(generateOTPEmail(templateProps));
          break;

        case 'magiclink':
          emailContent = JSON.parse(generateMagicLinkEmail(templateProps));
          break;

        case 'email_change':
          emailContent = JSON.parse(generateEmailChangeEmail(templateProps));
          break;

        case 'recovery':
          emailContent = JSON.parse(generateRecoveryEmail(templateProps));
          break;

        default:
          console.error('❌ Unknown email action type:', email_action_type);
          return new Response(
            JSON.stringify({ error: 'Unknown email action type' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
      }
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: Deno.env.get('RESEND_FROM_EMAIL') || 'onboarding@resend.dev',
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Email sent successfully:', data?.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        email_id: data?.id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
