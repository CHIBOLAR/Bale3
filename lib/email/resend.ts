import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
}: SendEmailParams): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Email sent successfully via Resend:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send invite email for new staff members
 */
export async function sendStaffInviteEmail(
  email: string,
  inviteCode: string,
  recipientName?: string
): Promise<{ success: boolean; error?: string }> {
  const signupLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/signup?code=${inviteCode}`;

  const subject = 'Welcome to Bale Inventory - Join Your Team';
  const html = generateStaffInviteHTML(signupLink, inviteCode, recipientName || 'there');

  return sendEmail({ to: email, subject, html });
}

/**
 * Send upgrade approval email for demo users
 */
export async function sendUpgradeApprovalEmail(
  email: string,
  upgradeLink: string,
  recipientName?: string
): Promise<{ success: boolean; error?: string }> {
  const subject = '🎉 Your Bale Inventory Access is Approved!';
  const html = generateUpgradeEmailHTML(upgradeLink, recipientName || 'there');

  return sendEmail({ to: email, subject, html });
}

/**
 * Send general invite email (for new signups)
 */
export async function sendSignupInviteEmail(
  email: string,
  inviteLink: string,
  recipientName?: string
): Promise<{ success: boolean; error?: string }> {
  const subject = 'Welcome to Bale Inventory';
  const html = generateSignupEmailHTML(inviteLink, recipientName || 'there');

  return sendEmail({ to: email, subject, html });
}

/**
 * Generate HTML for staff invite email
 */
function generateStaffInviteHTML(signupLink: string, inviteCode: string, recipientName: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background-color: #f9fafb; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 16px 32px; background-color: #2563eb; color: white !important; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .button:hover { background-color: #1e40af; }
          .invite-code { background: #e0e7ff; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #2563eb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .link-box { background: #e0e7ff; padding: 15px; border-radius: 8px; word-break: break-all; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎉 You're Invited!</h1>
          </div>
          <div class="content">
            <h2>Hi ${recipientName}!</h2>
            <p>You've been invited to join your team on <strong>Bale Inventory</strong>, the modern fabric inventory management system built for Indian textile traders.</p>

            <p style="font-size: 16px;">Your invite code:</p>
            <div class="invite-code">${inviteCode}</div>

            <div style="text-align: center;">
              <a href="${signupLink}" class="button">Join Your Team</a>
            </div>

            <p>Click the button above to create your account. You can sign up with your email or use Google OAuth for quick access.</p>

            <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link:</p>
            <div class="link-box">
              <code style="color: #2563eb;">${signupLink}</code>
            </div>

            <p style="font-size: 12px; color: #6b7280;"><em>This invitation expires in 72 hours.</em></p>
          </div>
          <div class="footer">
            <p>This is an automated message from Bale Inventory.</p>
            <p>Built for Indian textile traders.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate HTML for upgrade email
 */
function generateUpgradeEmailHTML(upgradeLink: string, recipientName: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background-color: #f9fafb; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 16px 32px; background-color: #2563eb; color: white !important; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .button:hover { background-color: #1e40af; }
          .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feature-item { display: flex; align-items: start; margin: 15px 0; }
          .checkmark { color: #10b981; margin-right: 10px; font-size: 20px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .link-box { background: #e0e7ff; padding: 15px; border-radius: 8px; word-break: break-all; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎉 Access Approved!</h1>
          </div>
          <div class="content">
            <h2>Hi ${recipientName}!</h2>
            <p>Great news! Your request for official access to Bale Inventory has been <strong>approved</strong>.</p>
            <p>Your demo account will be upgraded to a full official account with your own dedicated company.</p>

            <div style="text-align: center;">
              <a href="${upgradeLink}" class="button">Upgrade to Official Account</a>
            </div>

            <div class="features">
              <h3>What you'll get:</h3>
              <div class="feature-item">
                <span class="checkmark">✓</span>
                <div>
                  <strong>Your Own Company</strong><br>
                  <span style="color: #6b7280;">Dedicated company account with complete data isolation</span>
                </div>
              </div>
              <div class="feature-item">
                <span class="checkmark">✓</span>
                <div>
                  <strong>Full Access</strong><br>
                  <span style="color: #6b7280;">Create, edit, and delete inventory, orders, and partners</span>
                </div>
              </div>
              <div class="feature-item">
                <span class="checkmark">✓</span>
                <div>
                  <strong>Team Collaboration</strong><br>
                  <span style="color: #6b7280;">Invite team members with different roles</span>
                </div>
              </div>
              <div class="feature-item">
                <span class="checkmark">✓</span>
                <div>
                  <strong>Priority Support</strong><br>
                  <span style="color: #6b7280;">Direct support channel for your queries</span>
                </div>
              </div>
            </div>

            <p><strong>Important:</strong> Stay logged in to your demo account and click the button above. No password needed!</p>

            <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link:</p>
            <div class="link-box">
              <code style="color: #2563eb;">${upgradeLink}</code>
            </div>

            <p style="font-size: 12px; color: #6b7280;"><em>This link expires in 7 days.</em></p>
          </div>
          <div class="footer">
            <p>This is an automated message from Bale Inventory.</p>
            <p>Built for Indian textile traders.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate HTML for new signup email
 */
function generateSignupEmailHTML(signupLink: string, recipientName: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background-color: #f9fafb; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 16px 32px; background-color: #2563eb; color: white !important; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .button:hover { background-color: #1e40af; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .link-box { background: #e0e7ff; padding: 15px; border-radius: 8px; word-break: break-all; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Welcome to Bale Inventory! 🎉</h1>
          </div>
          <div class="content">
            <h2>Hi ${recipientName}!</h2>
            <p>You've been invited to join Bale Inventory, the modern fabric inventory management system built for Indian textile traders.</p>

            <div style="text-align: center;">
              <a href="${signupLink}" class="button">Create Your Account</a>
            </div>

            <p>Click the button above to set up your account. You can sign up with your email and password, or use Google OAuth for quick access.</p>

            <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link:</p>
            <div class="link-box">
              <code style="color: #2563eb;">${signupLink}</code>
            </div>

            <p style="font-size: 12px; color: #6b7280;"><em>This invitation link expires in 7 days.</em></p>
          </div>
          <div class="footer">
            <p>This is an automated message from Bale Inventory.</p>
            <p>Built for Indian textile traders.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
