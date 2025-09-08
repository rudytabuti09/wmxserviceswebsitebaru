import { Resend } from 'resend';

// Validate environment variables
if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set - email functionality will be disabled');
}

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'WMX Services <noreply@wmx-services.dev>',
  enabled: process.env.EMAIL_ENABLED === 'true' && !!process.env.RESEND_API_KEY,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

export interface EmailOptions {
  to: string | string[];
  subject: string;
  react?: React.ReactElement;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Send email using Resend
 */
export async function sendEmail({
  to,
  subject,
  react,
  html,
  text,
  from = process.env.EMAIL_FROM || 'WMX Services <noreply@wmx-services.com>',
  replyTo,
  attachments
}: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react,
      html,
      text,
      reply_to: replyTo,
      attachments,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

/**
 * Send bulk emails (for notifications to multiple users)
 */
export async function sendBulkEmails(emails: EmailOptions[]) {
  try {
    const promises = emails.map(email => sendEmail(email));
    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(r => r.status === 'fulfilled');
    const failed = results.filter(r => r.status === 'rejected');
    
    return {
      successful: successful.length,
      failed: failed.length,
      results
    };
  } catch (error) {
    console.error('Failed to send bulk emails:', error);
    throw error;
  }
}

export default resend;
