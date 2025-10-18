/**
 * Email templates for Supabase Auth emails
 * Styled to match the Resend email templates in lib/email/resend.ts
 */

interface EmailTemplateProps {
  email: string;
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
  site_url: string;
}

/**
 * Generate OTP email (for login and signup)
 */
export function generateOTPEmail(props: EmailTemplateProps): string {
  const { email, token, email_action_type } = props;

  const subject = email_action_type === 'signup'
    ? 'Welcome to Bale Inventory - Verify Your Email'
    : 'Sign In to Bale Inventory';

  const title = email_action_type === 'signup'
    ? '🎉 Welcome to Bale Inventory!'
    : 'Welcome Back!';

  const message = email_action_type === 'signup'
    ? 'Thank you for signing up. Please verify your email to complete your account setup.'
    : 'Please verify your email to sign in to your account.';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #026AA2; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background-color: #f9fafb; border: 1px solid #e5e7eb; }
          .otp-code { background: #FEFBF4; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #026AA2; border: 2px solid #026AA2; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .warning { background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">${title}</h1>
          </div>
          <div class="content">
            <h2>Hi there!</h2>
            <p>${message}</p>

            <p style="font-size: 16px; font-weight: bold;">Your verification code:</p>
            <div class="otp-code">${token}</div>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong> This code expires in 60 minutes. Never share this code with anyone. Bale Inventory staff will never ask for this code.
            </div>

            <p style="font-size: 12px; color: #6b7280;">
              <em>If you didn't request this code, you can safely ignore this email.</em>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated message from Bale Inventory.</p>
            <p>Built for Indian textile traders.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return JSON.stringify({
    subject,
    html,
  });
}

/**
 * Generate Magic Link email
 */
export function generateMagicLinkEmail(props: EmailTemplateProps): string {
  const { token_hash, email_action_type, site_url, redirect_to } = props;

  const actionUrl = `${site_url}/auth/confirm?token_hash=${token_hash}&type=magiclink${redirect_to ? `&redirect_to=${redirect_to}` : ''}`;

  const subject = 'Sign In to Bale Inventory - Magic Link';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #026AA2; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background-color: #f9fafb; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 16px 32px; background-color: #2563eb; color: white !important; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .button:hover { background-color: #1e40af; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .link-box { background: #e0e7ff; padding: 15px; border-radius: 8px; word-break: break-all; margin: 15px 0; }
          .warning { background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔐 Sign In to Bale Inventory</h1>
          </div>
          <div class="content">
            <h2>Hi there!</h2>
            <p>Click the button below to sign in to your Bale Inventory account.</p>

            <div style="text-align: center;">
              <a href="${actionUrl}" class="button">Sign In to Bale Inventory</a>
            </div>

            <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link:</p>
            <div class="link-box">
              <code style="color: #2563eb;">${actionUrl}</code>
            </div>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong> This link expires in 60 minutes. Never share this link with anyone. Bale Inventory staff will never ask for this link.
            </div>

            <p style="font-size: 12px; color: #6b7280;">
              <em>If you didn't request this link, you can safely ignore this email.</em>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated message from Bale Inventory.</p>
            <p>Built for Indian textile traders.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return JSON.stringify({
    subject,
    html,
  });
}

/**
 * Generate email change confirmation email
 */
export function generateEmailChangeEmail(props: EmailTemplateProps): string {
  const { token_hash, site_url, redirect_to, email } = props;

  const actionUrl = `${site_url}/auth/confirm?token_hash=${token_hash}&type=email_change${redirect_to ? `&redirect_to=${redirect_to}` : ''}`;

  const subject = 'Confirm Your Email Change - Bale Inventory';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background-color: #f9fafb; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 16px 32px; background-color: #f59e0b; color: white !important; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .button:hover { background-color: #d97706; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .link-box { background: #fef3c7; padding: 15px; border-radius: 8px; word-break: break-all; margin: 15px 0; }
          .warning { background: #fee2e2; border: 1px solid #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #991b1b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">📧 Confirm Email Change</h1>
          </div>
          <div class="content">
            <h2>Confirm Your New Email</h2>
            <p>You requested to change your email address to <strong>${email}</strong>.</p>
            <p>Click the button below to confirm this change:</p>

            <div style="text-align: center;">
              <a href="${actionUrl}" class="button">Confirm Email Change</a>
            </div>

            <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link:</p>
            <div class="link-box">
              <code style="color: #d97706;">${actionUrl}</code>
            </div>

            <div class="warning">
              <strong>⚠️ Important:</strong> If you didn't request this change, please ignore this email and your email address will remain unchanged. Someone may have entered your email by mistake.
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message from Bale Inventory.</p>
            <p>Built for Indian textile traders.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return JSON.stringify({
    subject,
    html,
  });
}

/**
 * Generate password recovery email
 */
export function generateRecoveryEmail(props: EmailTemplateProps): string {
  const { token_hash, site_url, redirect_to } = props;

  const actionUrl = `${site_url}/auth/confirm?token_hash=${token_hash}&type=recovery${redirect_to ? `&redirect_to=${redirect_to}` : ''}`;

  const subject = 'Reset Your Password - Bale Inventory';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background-color: #f9fafb; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 16px 32px; background-color: #dc2626; color: white !important; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .button:hover { background-color: #991b1b; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .link-box { background: #fee2e2; padding: 15px; border-radius: 8px; word-break: break-all; margin: 15px 0; }
          .warning { background: #fee2e2; border: 1px solid #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #991b1b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔑 Reset Your Password</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password for your Bale Inventory account.</p>
            <p>Click the button below to reset your password:</p>

            <div style="text-align: center;">
              <a href="${actionUrl}" class="button">Reset Password</a>
            </div>

            <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link:</p>
            <div class="link-box">
              <code style="color: #dc2626;">${actionUrl}</code>
            </div>

            <div class="warning">
              <strong>⚠️ Security Alert:</strong> This link expires in 60 minutes. If you didn't request a password reset, please ignore this email and your password will remain unchanged. Consider changing your password if you suspect unauthorized access.
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message from Bale Inventory.</p>
            <p>Built for Indian textile traders.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return JSON.stringify({
    subject,
    html,
  });
}
