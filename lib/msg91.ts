/**
 * MSG91 WhatsApp Integration
 * Handles sending magic link invites via WhatsApp and Email
 */

export interface SendInviteParams {
  phone?: string;
  email?: string;
  magicLink: string;
  recipientName?: string;
}

/**
 * Send invite via WhatsApp using MSG91
 */
export async function sendWhatsAppInvite(
  phone: string,
  magicLink: string,
  recipientName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const authKey = process.env.MSG91_AUTH_KEY;
    const senderId = process.env.MSG91_SENDER_ID;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey || !senderId || !templateId) {
      console.error('MSG91 configuration missing');
      return { success: false, error: 'WhatsApp service not configured' };
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/[^\d+]/g, '');

    // MSG91 WhatsApp API endpoint
    const url = 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/';

    const payload = {
      integrated_number: senderId,
      content_type: 'template',
      payload: {
        to: cleanPhone,
        type: 'template',
        template: {
          name: templateId,
          language: {
            code: 'en',
            policy: 'deterministic',
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: recipientName || 'there',
                },
                {
                  type: 'text',
                  text: magicLink,
                },
              ],
            },
            {
              type: 'button',
              sub_type: 'url',
              index: '0',
              parameters: [
                {
                  type: 'text',
                  text: magicLink,
                },
              ],
            },
          ],
        },
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'authkey': authKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('MSG91 API error:', errorData);
      return { success: false, error: 'Failed to send WhatsApp message' };
    }

    const result = await response.json();
    console.log('WhatsApp sent successfully:', result);

    return { success: true };
  } catch (error: any) {
    console.error('Error sending WhatsApp:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send invite via Email using MSG91
 * REQUIRES: Domain verification in MSG91 dashboard
 * TODO: Enable after domain setup with SPF/DKIM/DMARC records
 */
export async function sendEmailInvite(
  email: string,
  magicLink: string,
  recipientName?: string,
  isUpgrade: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    const authKey = process.env.MSG91_AUTH_KEY;
    const fromEmail = process.env.MSG91_FROM_EMAIL; // e.g., 'noreply@yourdomain.com'
    const fromName = process.env.NEXT_PUBLIC_APP_NAME || 'Bale Inventory';

    // Check if email sending is enabled (requires domain)
    if (!authKey || !fromEmail) {
      console.log('📧 Email sending disabled (domain not configured)');
      console.log('🔗 Manual link for:', email);
      console.log('🔗 Link:', magicLink);
      return { success: false, error: 'Email service not configured' };
    }

    // MSG91 Email API endpoint
    const url = 'https://api.msg91.com/api/v5/email/send';

    const subject = isUpgrade
      ? `Your Bale Inventory Access is Approved! 🎉`
      : `Welcome to Bale Inventory`;

    const html = isUpgrade
      ? generateUpgradeEmailHTML(magicLink, recipientName || 'there')
      : generateSignupEmailHTML(magicLink, recipientName || 'there');

    const payload = {
      to: [
        {
          email: email,
          name: recipientName || email.split('@')[0],
        },
      ],
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject: subject,
      html: html,
    };

    /* COMMENTED OUT UNTIL DOMAIN IS READY
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'authkey': authKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('MSG91 Email API error:', errorData);
      return { success: false, error: 'Failed to send email' };
    }

    const result = await response.json();
    console.log('✅ Email sent successfully via MSG91:', result);
    return { success: true };
    */

    // FOR TESTING: Just log the email details
    console.log('📧 Email would be sent to:', email);
    console.log('📧 Subject:', subject);
    console.log('🔗 Magic link:', magicLink);
    console.log('ℹ️  Enable MSG91 email in .env after domain setup');

    return { success: false, error: 'Email service disabled (domain required)' };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
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

/**
 * Send invite via both WhatsApp and Email, or fallback to email only
 */
export async function sendInvite(params: SendInviteParams): Promise<{
  success: boolean;
  sentVia: ('whatsapp' | 'email')[];
  errors: string[];
}> {
  const sentVia: ('whatsapp' | 'email')[] = [];
  const errors: string[] = [];

  // Try WhatsApp if phone number provided
  if (params.phone) {
    const whatsappResult = await sendWhatsAppInvite(
      params.phone,
      params.magicLink,
      params.recipientName
    );

    if (whatsappResult.success) {
      sentVia.push('whatsapp');
    } else {
      errors.push(`WhatsApp: ${whatsappResult.error}`);
    }
  }

  // Try Email if email provided
  if (params.email) {
    const emailResult = await sendEmailInvite(
      params.email,
      params.magicLink,
      params.recipientName
    );

    if (emailResult.success) {
      sentVia.push('email');
    } else {
      errors.push(`Email: ${emailResult.error}`);
    }
  }

  return {
    success: sentVia.length > 0,
    sentVia,
    errors,
  };
}

/**
 * Generate a secure random token for magic links
 */
export function generateInviteToken(): string {
  // Generate 32 random bytes and convert to URL-safe base64
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const token = Buffer.from(randomBytes)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return token;
}
