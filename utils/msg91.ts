/**
 * MSG91 WhatsApp Integration
 * Handles sending magic link invites via WhatsApp and Email
 *
 * NOTE: Email functionality has been migrated to Resend (see lib/email/resend.ts)
 * This file now only handles WhatsApp messages via MSG91
 */

import { sendStaffInviteEmail, sendUpgradeApprovalEmail, sendSignupInviteEmail } from '@/lib/email/resend';

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
 * Send invite via Email using Resend
 * Migrated from MSG91 to Resend for better email deliverability
 */
export async function sendEmailInvite(
  email: string,
  magicLink: string,
  recipientName?: string,
  isUpgrade: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use Resend for email delivery
    if (isUpgrade) {
      return await sendUpgradeApprovalEmail(email, magicLink, recipientName);
    } else {
      return await sendSignupInviteEmail(email, magicLink, recipientName);
    }
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
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
