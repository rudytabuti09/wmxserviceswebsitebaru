import { sendEmail, EMAIL_CONFIG } from './resend';

export interface EmailServiceOptions {
  skipIfDisabled?: boolean;
  priority?: 'high' | 'normal' | 'low';
  tags?: string[];
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  data: {
    to: string;
    userName: string;
    userRole: string;
    loginUrl: string;
  },
  options: EmailServiceOptions = {}
) {
  if (!EMAIL_CONFIG.enabled && options.skipIfDisabled) {
    console.log('Email disabled, skipping welcome email');
    return { success: true, skipped: true };
  }

  const template = getWelcomeEmailTemplate(data);
  
  try {
    const result = await sendEmail({
      to: data.to,
      subject: `🎉 Welcome to WMX Services!`,
      html: template.html,
      text: template.text,
    });

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send project status update email to client
 */
export async function sendProjectStatusEmail(
  data: {
    to: string;
    clientName: string;
    projectTitle: string;
    previousStatus: string;
    newStatus: string;
    progress: number;
    message?: string;
    milestones: Array<{ title: string; status: string }>;
    dashboardUrl: string;
  },
  options: EmailServiceOptions = {}
) {
  if (!EMAIL_CONFIG.enabled && options.skipIfDisabled) {
    console.log('Email disabled, skipping project status email');
    return { success: true, skipped: true };
  }

  const template = getProjectStatusEmailTemplate(data);
  
  try {
    const result = await sendEmail({
      to: data.to,
      subject: `📊 Project Update: ${data.projectTitle}`,
      html: template.html,
      text: template.text,
    });

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Failed to send project status email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send chat notification email
 */
export async function sendChatNotificationEmail(
  data: {
    to: string;
    recipientName: string;
    senderName: string;
    projectTitle: string;
    message: string;
    timestamp: string;
    chatUrl: string;
    isAdminSender: boolean;
  },
  options: EmailServiceOptions = {}
) {
  if (!EMAIL_CONFIG.enabled && options.skipIfDisabled) {
    console.log('Email disabled, skipping chat notification email');
    return { success: true, skipped: true };
  }

  const template = getChatNotificationEmailTemplate(data);
  
  try {
    const result = await sendEmail({
      to: data.to,
      subject: `💬 New message in ${data.projectTitle}`,
      html: template.html,
      text: template.text,
    });

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Failed to send chat notification email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send verification code email
 */
export async function sendVerificationCodeEmail(
  data: {
    to: string;
    userName: string;
    verificationCode: string;
    expiresIn: string;
  },
  options: EmailServiceOptions = {}
) {
  if (!EMAIL_CONFIG.enabled && options.skipIfDisabled) {
    console.log('Email disabled, skipping verification email');
    return { success: true, skipped: true };
  }

  const template = getVerificationCodeEmailTemplate(data);
  
  try {
    const result = await sendEmail({
      to: data.to,
      subject: `🔐 Your verification code: ${data.verificationCode}`,
      html: template.html,
      text: template.text,
    });

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send invoice reminder email
 */
/**
 * Send invoice notification email to client when new invoice is created
 */
export async function sendInvoiceNotificationEmail(
  data: {
    to: string;
    clientName: string;
    invoiceNumber: string;
    projectTitle: string;
    amount: number;
    currency: string;
    dueDate: string;
    issuedDate: string;
    description?: string;
    paymentUrl: string;
    companyName?: string;
    companyLogo?: string;
  },
  options: EmailServiceOptions = {}
) {
  if (!EMAIL_CONFIG.enabled && options.skipIfDisabled) {
    console.log('Email disabled, skipping invoice notification email');
    return { success: true, skipped: true };
  }

  const template = getInvoiceNotificationEmailTemplate(data);
  
  try {
    const result = await sendEmail({
      to: data.to,
      subject: `📄 New Invoice: ${data.invoiceNumber} - ${data.projectTitle}`,
      html: template.html,
      text: template.text,
    });

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Failed to send invoice notification email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendInvoiceReminderEmail(
  data: {
    to: string;
    clientName: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    dueDate: string;
    projectTitle: string;
    paymentUrl: string;
    isOverdue: boolean;
  },
  options: EmailServiceOptions = {}
) {
  if (!EMAIL_CONFIG.enabled && options.skipIfDisabled) {
    console.log('Email disabled, skipping invoice reminder email');
    return { success: true, skipped: true };
  }

  const template = getInvoiceReminderEmailTemplate(data);
  
  try {
    const result = await sendEmail({
      to: data.to,
      subject: data.isOverdue 
        ? `🚨 Overdue Invoice: ${data.invoiceNumber}`
        : `💰 Payment Reminder: ${data.invoiceNumber}`,
      html: template.html,
      text: template.text,
    });

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Failed to send invoice reminder email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Email Template Functions

/**
 * Main email template wrapper using retro design
 */
function getEmailTemplate({
  title,
  preheader,
  content,
  footerText
}: {
  title: string;
  preheader?: string;
  content: string;
  footerText?: string;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        
        ${preheader ? `
        <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all;">
          ${preheader}
        </div>
        ` : ''}
        
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        </style>
      </head>
      
      <body style="margin: 0; padding: 0; background-color: #f8f5f2; font-family: 'Inter', Arial, sans-serif;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="center" style="padding: 40px 20px; background-color: #f8f5f2;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto;">
                
                <!-- Header -->
                <tr>
                  <td align="center" style="background-color: #3D52F1; border: 3px solid #111111; box-shadow: 4px 4px 0px #111111; padding: 32px; margin-bottom: 30px;">
                    <h1 style="color: #FFFFFF; font-size: 36px; font-weight: 800; letter-spacing: 3px; margin: 0; text-shadow: 3px 3px 0px #111111; font-family: 'Poppins', Arial, sans-serif; text-transform: uppercase;">
                      WMX SERVICES
                    </h1>
                    <p style="color: #FFFFFF; font-size: 14px; font-weight: 600; margin: 8px 0 0 0; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">
                      Digital Solutions That Drive Growth
                    </p>
                  </td>
                </tr>
                
                <!-- Main content -->
                <tr>
                  <td style="background-color: #FFFFFF; border: 3px solid #111111; box-shadow: 6px 6px 0px #111111; padding: 40px; font-family: 'Inter', Arial, sans-serif;">
                    ${content}
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 32px 20px 20px 20px;">
                    
                    ${footerText ? `
                    <p style="font-size: 16px; color: #333333; line-height: 1.6; margin-bottom: 20px; text-align: center; font-family: 'Inter', Arial, sans-serif;">
                      ${footerText}
                    </p>
                    ` : ''}
                    
                    <div style="background-color: #FFFFFF; border: 2px solid #111111; box-shadow: 4px 4px 0px #111111; padding: 24px; text-align: center;">
                      <p style="font-size: 14px; color: #333333; margin: 0 0 12px 0; font-family: 'Inter', Arial, sans-serif;">
                        <strong>WMX Services</strong><br>
                        Professional Digital Solutions & Web Development
                      </p>
                      <p style="font-size: 12px; color: #666666; margin: 0; font-family: 'Inter', Arial, sans-serif;">
                        © ${new Date().getFullYear()} WMX Services. All rights reserved.<br>
                        You're receiving this email because you're a valued client or team member.
                      </p>
                    </div>
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function getWelcomeEmailTemplate(data: {
  userName: string;
  userRole: string;
  loginUrl: string;
}) {
  const isClient = data.userRole === 'CLIENT';
  
  const html = getEmailTemplate({
    title: 'Welcome to WMX Services! 🎉',
    preheader: 'Your account has been created successfully',
    content: `
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="font-size: 64px; margin-bottom: 24px;">🚀</div>
        <h1 style="font-size: 32px; font-weight: 800; color: #111111; margin-bottom: 16px; text-transform: uppercase;">
          Welcome to WMX Services!
        </h1>
        <p style="font-size: 18px; color: #333333; margin-bottom: 32px;">
          Hi ${data.userName}! Your account has been created successfully.
        </p>
      </div>

      <div style="background-color: #F8F5F2; border: 2px solid #111111; padding: 24px; margin-bottom: 32px;">
        <h2 style="font-size: 20px; font-weight: 700; color: #111111; margin-bottom: 16px; text-transform: uppercase;">
          ${isClient ? '🎯 For Clients' : '⚡ For Admins'}
        </h2>
        <ul style="margin: 0; padding-left: 20px; color: #333333;">
          ${isClient ? `
            <li style="margin-bottom: 8px;">Track your project progress in real-time</li>
            <li style="margin-bottom: 8px;">Chat directly with our team</li>
            <li style="margin-bottom: 8px;">View and pay invoices securely</li>
            <li style="margin-bottom: 8px;">Access project files and deliverables</li>
          ` : `
            <li style="margin-bottom: 8px;">Manage client projects efficiently</li>
            <li style="margin-bottom: 8px;">Track project milestones and progress</li>
            <li style="margin-bottom: 8px;">Handle invoicing and payments</li>
            <li style="margin-bottom: 8px;">Communicate with clients seamlessly</li>
          `}
        </ul>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <a href="${data.loginUrl}" 
           style="display: inline-block; background-color: #FFC700; color: #111111; padding: 16px 32px; text-decoration: none; border: 3px solid #111111; box-shadow: 4px 4px 0px #111111; font-family: 'Poppins', sans-serif; font-weight: 700; text-transform: uppercase; font-size: 16px;">
          Access Your Dashboard
        </a>
      </div>

      <div style="background-color: #E8F4FD; border: 2px dashed #111111; padding: 20px; text-align: center; margin-top: 32px;">
        <p style="font-size: 14px; color: #111111; margin: 0;">
          <strong>Need Help?</strong> Our support team is here to help you get started. 
          Just reply to this email with any questions!
        </p>
      </div>
    `,
    footerText: `Welcome to the WMX Services family! We're excited to work with you.`
  });

  const text = `
Welcome to WMX Services!

Hi ${data.userName}!

Your account has been created successfully. You can now access your dashboard to ${isClient ? 'track your projects, chat with our team, and manage payments' : 'manage projects, handle client communications, and track progress'}.

Access your dashboard: ${data.loginUrl}

${isClient ? `
As a client, you can:
• Track your project progress in real-time
• Chat directly with our team
• View and pay invoices securely
• Access project files and deliverables
` : `
As an admin, you can:
• Manage client projects efficiently
• Track project milestones and progress
• Handle invoicing and payments
• Communicate with clients seamlessly
`}

Need help? Just reply to this email with any questions!

Welcome to the WMX Services family!
`;

  return { html, text };
}

/**
 * Generate invoice notification email template using React Email component
 */
function getInvoiceNotificationEmailTemplate(data: {
  clientName: string;
  invoiceNumber: string;
  projectTitle: string;
  amount: number;
  currency: string;
  dueDate: string;
  issuedDate: string;
  description?: string;
  paymentUrl: string;
  companyName?: string;
  companyLogo?: string;
}) {
  // For now, use simplified template to avoid React Email issues
  // TODO: Re-enable React Email template once issues are resolved
  
  const formatCurrency = (amount: number, currency: string) => {
    const locale = currency === 'IDR' ? 'id-ID' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Invoice - ${data.invoiceNumber}</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background-color: #FFC700; padding: 20px; text-align: center; border: 3px solid #111111; margin-bottom: 20px;">
          <h1 style="margin: 0; color: #111111; text-transform: uppercase; font-weight: bold;">WMX Services</h1>
          <p style="margin: 5px 0 0 0; color: #111111; font-weight: bold;">Digital Solutions That Drive Growth</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border: 3px solid #111111; box-shadow: 4px 4px 0px #111111;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #111111; font-size: 28px; margin: 0 0 10px 0;">📄 NEW INVOICE</h1>
            <p style="color: #666; font-size: 16px; margin: 0;">Invoice ${data.invoiceNumber}</p>
          </div>
          
          <p style="font-size: 16px; color: #333;">Dear ${data.clientName},</p>
          
          <p style="font-size: 14px; color: #333; line-height: 1.6;">We hope this email finds you well. We are pleased to send you a new invoice for your project.</p>
          
          <div style="background-color: #f9fafb; border: 2px solid #111111; padding: 20px; margin: 20px 0;">
            <h2 style="color: #111111; font-size: 18px; margin: 0 0 15px 0;">📋 Invoice Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Invoice Number:</td>
                <td style="padding: 8px 0; color: #111; font-size: 14px; font-weight: bold;">${data.invoiceNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Project:</td>
                <td style="padding: 8px 0; color: #111; font-size: 14px;">${data.projectTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Amount:</td>
                <td style="padding: 8px 0; color: #111; font-size: 18px; font-weight: bold;">${formatCurrency(data.amount, data.currency)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Issued Date:</td>
                <td style="padding: 8px 0; color: #111; font-size: 14px;">${data.issuedDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Due Date:</td>
                <td style="padding: 8px 0; color: #111; font-size: 14px; font-weight: bold;">${data.dueDate}</td>
              </tr>
              ${data.description ? `
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Description:</td>
                <td style="padding: 8px 0; color: #111; font-size: 14px;">${data.description}</td>
              </tr>` : ''}
            </table>
          </div>
          
          <div style="background-color: #f0f9ff; border: 2px solid #0ea5e9; padding: 20px; text-align: center; margin: 20px 0;">
            <h2 style="color: #0ea5e9; font-size: 18px; margin: 0 0 15px 0;">💳 Payment Instructions</h2>
            <p style="color: #333; font-size: 14px; margin: 0 0 20px 0;">To make your payment quickly and securely, please click the button below:</p>
            <a href="${data.paymentUrl}" style="display: inline-block; background-color: #FFC700; color: #111111; padding: 15px 30px; text-decoration: none; border: 3px solid #111111; font-weight: bold; text-transform: uppercase; font-size: 16px; box-shadow: 4px 4px 0px #111111;">PAY INVOICE NOW</a>
          </div>
          
          <div style="background-color: #fefce8; border: 2px solid #eab308; padding: 15px; margin: 20px 0;">
            <h3 style="color: #a16207; font-size: 16px; margin: 0 0 10px 0;">ℹ️ Important Information</h3>
            <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 14px;">
              <li>Please keep this email for your records</li>
              <li>Payment is due by <strong>${data.dueDate}</strong></li>
              <li>Late payments may incur additional charges</li>
              <li>Contact us if you have any questions</li>
            </ul>
          </div>
          
          <p style="color: #333; font-size: 14px; line-height: 1.6;">If you have any questions about this invoice, please don't hesitate to contact us.</p>
          
          <p style="color: #333; font-size: 14px;">Best regards,<br><strong>${data.companyName || 'WMX Services'} Team</strong></p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          This is an automated message. Please do not reply to this email.<br>
          © ${new Date().getFullYear()} ${data.companyName || 'WMX Services'}. All rights reserved.
        </div>
      </body>
    </html>
  `;

  const text = `
New Invoice from ${data.companyName || 'WMX Services'}

Dear ${data.clientName},

We hope this email finds you well. We are pleased to send you a new invoice for your project.

Invoice Details:
• Invoice Number: ${data.invoiceNumber}
• Project: ${data.projectTitle}
• Amount: ${formatCurrency(data.amount, data.currency)}
• Issued Date: ${data.issuedDate}
• Due Date: ${data.dueDate}
${data.description ? `• Description: ${data.description}` : ''}

To make your payment quickly and securely, please visit our payment portal:
${data.paymentUrl}

You can pay using various methods including bank transfer, credit card, and e-wallet options.

Important Information:
• Please keep this email for your records
• Payment is due by ${data.dueDate}
• Late payments may incur additional charges
• Contact us if you have any questions about this invoice

If you have any questions about this invoice, please don't hesitate to contact us.

Best regards,
${data.companyName || 'WMX Services'} Team

This is an automated message. Please do not reply to this email.
© ${new Date().getFullYear()} ${data.companyName || 'WMX Services'}. All rights reserved.
  `;

  return { html, text };
}

function getVerificationCodeEmailTemplate(data: {
  userName: string;
  verificationCode: string;
  expiresIn: string;
}) {
  const html = getEmailTemplate({
    title: 'Verify Your Email Address',
    preheader: `Your verification code is: ${data.verificationCode}`,
    content: `
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="font-size: 64px; margin-bottom: 24px;">🔐</div>
        <h1 style="font-size: 32px; font-weight: 800; color: #111111; margin-bottom: 16px; text-transform: uppercase;">
          Verify Your Email
        </h1>
        <p style="font-size: 18px; color: #333333; margin-bottom: 32px;">
          Hi ${data.userName}! Please enter the verification code below to complete your registration.
        </p>
      </div>

      <div style="background-color: #F0F9FF; border: 3px solid #3D52F1; box-shadow: 6px 6px 0px #111111; padding: 40px; margin: 40px 0; text-align: center;">
        <h2 style="font-size: 16px; font-weight: 700; color: #111111; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 2px;">
          Your Verification Code
        </h2>
        <div style="display: inline-block; background-color: #FFFFFF; border: 3px solid #111111; box-shadow: 4px 4px 0px #111111; padding: 20px 40px;">
          <span style="font-family: 'Courier New', monospace; font-size: 48px; font-weight: 900; color: #3D52F1; letter-spacing: 8px;">
            ${data.verificationCode}
          </span>
        </div>
        <p style="font-size: 14px; color: #666666; margin: 24px 0 0 0;">
          This code expires in <strong>${data.expiresIn}</strong>
        </p>
      </div>

      <div style="background-color: #FFF8DC; border: 2px dashed #111111; padding: 24px; text-align: center; margin: 32px 0;">
        <h3 style="font-size: 16px; font-weight: 700; color: #111111; margin-bottom: 12px; text-transform: uppercase;">
          🛡️ Security Tips
        </h3>
        <ul style="margin: 0; padding: 0; list-style: none; color: #111111; font-size: 14px;">
          <li style="margin-bottom: 8px;">• Never share this code with anyone</li>
          <li style="margin-bottom: 8px;">• We'll never ask for this code via phone or email</li>
          <li style="margin-bottom: 8px;">• If you didn't request this, please ignore this email</li>
        </ul>
      </div>

      <div style="background-color: #E8F4FD; border: 2px solid #111111; padding: 20px; text-align: center;">
        <p style="font-size: 14px; color: #111111; margin: 0;">
          <strong>Having trouble?</strong> Copy and paste the code manually, or contact our support team for assistance.
        </p>
      </div>
    `,
    footerText: `Complete your registration to start using WMX Services!`
  });

  const text = `
Email Verification - WMX Services

Hi ${data.userName}!

Please enter the verification code below to complete your registration:

Verification Code: ${data.verificationCode}

This code expires in ${data.expiresIn}.

Security Tips:
• Never share this code with anyone
• We'll never ask for this code via phone or email  
• If you didn't request this, please ignore this email

Having trouble? Contact our support team for assistance.

Complete your registration to start using WMX Services!
`;

  return { html, text };
}

function getProjectStatusEmailTemplate(data: {
  clientName: string;
  projectTitle: string;
  previousStatus: string;
  newStatus: string;
  progress: number;
  message?: string;
  milestones: Array<{ title: string; status: string }>;
  dashboardUrl: string;
}) {
  const statusColors: Record<string, string> = {
    'PLANNING': '#FFC700',
    'IN_PROGRESS': '#3D52F1',
    'REVIEW': '#FF3EA5',
    'COMPLETED': '#00FF00',
    'ON_HOLD': '#FF6B6B'
  };

  const getStatusEmoji = (status: string) => {
    const emojis: Record<string, string> = {
      'PLANNING': '📋',
      'IN_PROGRESS': '🚀',
      'REVIEW': '👀',
      'COMPLETED': '✅',
      'ON_HOLD': '⏸️'
    };
    return emojis[status] || '📊';
  };

  const milestonesHtml = data.milestones.map(milestone => `
    <div style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #E0E0E0;">
      <div style="width: 20px; height: 20px; border-radius: 50%; background-color: ${milestone.status === 'COMPLETED' ? '#00FF00' : '#E0E0E0'}; margin-right: 12px; border: 2px solid #111111;"></div>
      <span style="color: #111111; font-size: 14px;">${milestone.title}</span>
    </div>
  `).join('');

  const html = getEmailTemplate({
    title: `Project Update: ${data.projectTitle}`,
    preheader: `Status changed from ${data.previousStatus} to ${data.newStatus}`,
    content: `
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 48px; margin-bottom: 16px;">${getStatusEmoji(data.newStatus)}</div>
        <h1 style="font-size: 28px; font-weight: 800; color: #111111; margin-bottom: 8px; text-transform: uppercase;">
          Project Status Update
        </h1>
        <p style="font-size: 16px; color: #666666;">
          ${data.projectTitle}
        </p>
      </div>

      <div style="background-color: #FFFFFF; border: 2px solid #111111; box-shadow: 4px 4px 0px #111111; padding: 24px; margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 700; color: #111111; margin-bottom: 16px;">Status Change</h2>
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <span style="padding: 8px 16px; background-color: #E0E0E0; color: #111111; border: 2px solid #111111; font-weight: 700; text-transform: uppercase; font-size: 12px;">
            ${data.previousStatus.replace('_', ' ')}
          </span>
          <span style="margin: 0 16px; font-size: 24px;">→</span>
          <span style="padding: 8px 16px; background-color: ${statusColors[data.newStatus] || '#FFC700'}; color: #111111; border: 2px solid #111111; font-weight: 700; text-transform: uppercase; font-size: 12px; box-shadow: 2px 2px 0px #111111;">
            ${data.newStatus.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div style="background-color: #FFFFFF; border: 2px solid #111111; box-shadow: 4px 4px 0px #111111; padding: 24px; margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 700; color: #111111; margin-bottom: 16px;">Progress</h2>
        <div style="background-color: #E0E0E0; border: 2px solid #111111; height: 20px; position: relative;">
          <div style="background-color: #00FF00; height: 100%; width: ${data.progress}%; border-right: 2px solid #111111;"></div>
          <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 12px; font-weight: 700; color: #111111;">
            ${data.progress}%
          </span>
        </div>
      </div>

      ${data.milestones.length > 0 ? `
        <div style="background-color: #FFFFFF; border: 2px solid #111111; box-shadow: 4px 4px 0px #111111; padding: 24px; margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #111111; margin-bottom: 16px;">Milestones</h2>
          ${milestonesHtml}
        </div>
      ` : ''}

      ${data.message ? `
        <div style="background-color: #F0F9FF; border: 2px solid #111111; box-shadow: 4px 4px 0px #111111; padding: 24px; margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #111111; margin-bottom: 16px;">Message from Team</h2>
          <p style="color: #111111; line-height: 1.6; margin: 0;">${data.message}</p>
        </div>
      ` : ''}

      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.dashboardUrl}" 
           style="display: inline-block; background-color: #3D52F1; color: #FFFFFF; padding: 16px 32px; text-decoration: none; border: 3px solid #111111; box-shadow: 4px 4px 0px #111111; font-family: 'Poppins', sans-serif; font-weight: 700; text-transform: uppercase; font-size: 16px;">
          View Project Dashboard
        </a>
      </div>
    `,
    footerText: `Stay updated with your project progress. Questions? Just reply to this email!`
  });

  const text = `
Project Status Update: ${data.projectTitle}

Hi ${data.clientName},

Your project status has been updated:
${data.previousStatus.replace('_', ' ')} → ${data.newStatus.replace('_', ' ')}

Progress: ${data.progress}%

${data.message ? `Message from team: ${data.message}` : ''}

${data.milestones.length > 0 ? `
Milestones:
${data.milestones.map(m => `• ${m.title} - ${m.status}`).join('\n')}
` : ''}

View your project dashboard: ${data.dashboardUrl}

Questions? Just reply to this email!
`;

  return { html, text };
}

function getChatNotificationEmailTemplate(data: {
  recipientName: string;
  senderName: string;
  projectTitle: string;
  message: string;
  timestamp: string;
  chatUrl: string;
  isAdminSender: boolean;
}) {
  const html = getEmailTemplate({
    title: `New message in ${data.projectTitle}`,
    preheader: `${data.senderName}: ${data.message.substring(0, 50)}...`,
    content: `
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 48px; margin-bottom: 16px;">💬</div>
        <h1 style="font-size: 28px; font-weight: 800; color: #111111; margin-bottom: 8px; text-transform: uppercase;">
          New Message
        </h1>
        <p style="font-size: 16px; color: #666666;">
          ${data.projectTitle}
        </p>
      </div>

      <div style="background-color: ${data.isAdminSender ? '#F0F9FF' : '#FFF8DC'}; border: 2px solid #111111; box-shadow: 4px 4px 0px #111111; padding: 24px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <div style="width: 40px; height: 40px; background-color: ${data.isAdminSender ? '#3D52F1' : '#FFC700'}; border: 2px solid #111111; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-weight: 800; color: ${data.isAdminSender ? '#FFFFFF' : '#111111'};">
            ${data.senderName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="font-weight: 700; color: #111111; font-size: 14px;">
              ${data.senderName}
            </div>
            <div style="font-size: 12px; color: #666666;">
              ${data.timestamp}
            </div>
          </div>
        </div>
        
        <div style="background-color: #FFFFFF; border: 2px solid #111111; padding: 16px; border-radius: 0;">
          <p style="color: #111111; line-height: 1.6; margin: 0; white-space: pre-wrap;">${data.message}</p>
        </div>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.chatUrl}" 
           style="display: inline-block; background-color: #FF3EA5; color: #FFFFFF; padding: 16px 32px; text-decoration: none; border: 3px solid #111111; box-shadow: 4px 4px 0px #111111; font-family: 'Poppins', sans-serif; font-weight: 700; text-transform: uppercase; font-size: 16px;">
          Reply to Message
        </a>
      </div>

      <div style="background-color: #F5F5F5; border: 2px dashed #111111; padding: 16px; text-align: center;">
        <p style="font-size: 12px; color: #666666; margin: 0;">
          You're receiving this because you have notifications enabled for this project.
        </p>
      </div>
    `,
    footerText: `Stay connected with your project team through real-time messaging.`
  });

  const text = `
New Message in ${data.projectTitle}

From: ${data.senderName}
Time: ${data.timestamp}

Message:
${data.message}

Reply to this message: ${data.chatUrl}

You're receiving this because you have notifications enabled for this project.
`;

  return { html, text };
}

function getInvoiceReminderEmailTemplate(data: {
  clientName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate: string;
  projectTitle: string;
  paymentUrl: string;
  isOverdue: boolean;
}) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const html = getEmailTemplate({
    title: data.isOverdue ? `Overdue Invoice: ${data.invoiceNumber}` : `Payment Reminder: ${data.invoiceNumber}`,
    preheader: `${formatCurrency(data.amount, data.currency)} ${data.isOverdue ? 'overdue' : 'due'} ${data.dueDate}`,
    content: `
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 48px; margin-bottom: 16px;">${data.isOverdue ? '🚨' : '💰'}</div>
        <h1 style="font-size: 28px; font-weight: 800; color: #111111; margin-bottom: 8px; text-transform: uppercase;">
          ${data.isOverdue ? 'Payment Overdue' : 'Payment Reminder'}
        </h1>
        <p style="font-size: 16px; color: #666666;">
          Invoice ${data.invoiceNumber}
        </p>
      </div>

      <div style="background-color: ${data.isOverdue ? '#FFE4E1' : '#F0F9FF'}; border: 2px solid #111111; box-shadow: 4px 4px 0px #111111; padding: 24px; margin-bottom: 24px;">
        <h2 style="font-size: 20px; font-weight: 700; color: #111111; margin-bottom: 16px; text-transform: uppercase;">
          Invoice Details
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <div style="font-size: 12px; color: #666666; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Invoice Number</div>
            <div style="font-size: 16px; color: #111111; font-weight: 700;">${data.invoiceNumber}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #666666; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Amount</div>
            <div style="font-size: 24px; color: ${data.isOverdue ? '#FF3EA5' : '#111111'}; font-weight: 800;">${formatCurrency(data.amount, data.currency)}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #666666; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Project</div>
            <div style="font-size: 16px; color: #111111; font-weight: 700;">${data.projectTitle}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #666666; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Due Date</div>
            <div style="font-size: 16px; color: ${data.isOverdue ? '#FF3EA5' : '#111111'}; font-weight: 700;">${data.dueDate}</div>
          </div>
        </div>
      </div>

      ${data.isOverdue ? `
        <div style="background-color: #FF3EA5; color: #FFFFFF; border: 2px solid #111111; box-shadow: 4px 4px 0px #111111; padding: 24px; margin-bottom: 24px; text-align: center;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 12px; text-transform: uppercase;">
            ⚠️ Payment Overdue
          </h2>
          <p style="margin: 0; font-size: 16px;">
            This invoice is past due. Please make payment as soon as possible to avoid any service interruptions.
          </p>
        </div>
      ` : ''}

      <div style="text-align: center; margin: 40px 0;">
        <a href="${data.paymentUrl}" 
           style="display: inline-block; background-color: #00FF00; color: #111111; padding: 20px 40px; text-decoration: none; border: 3px solid #111111; box-shadow: 6px 6px 0px #111111; font-family: 'Poppins', sans-serif; font-weight: 800; text-transform: uppercase; font-size: 18px;">
          Pay Now - ${formatCurrency(data.amount, data.currency)}
        </a>
      </div>

      <div style="background-color: #F8F5F2; border: 2px dashed #111111; padding: 20px; margin-top: 32px;">
        <h3 style="font-size: 16px; font-weight: 700; color: #111111; margin-bottom: 12px; text-transform: uppercase;">
          Payment Methods Accepted
        </h3>
        <p style="color: #111111; margin: 0; font-size: 14px;">
          💳 Credit/Debit Cards • 🏧 Bank Transfer • 💰 Digital Wallets • 🇮🇩 Local Indonesian Payment Methods
        </p>
      </div>

      <div style="text-align: center; margin-top: 32px; padding: 16px; background-color: #E8F4FD; border: 2px solid #111111;">
        <p style="font-size: 14px; color: #111111; margin: 0;">
          <strong>Need help?</strong> Contact our support team or reply to this email with any questions about your invoice.
        </p>
      </div>
    `,
    footerText: `Thank you for your business! We appreciate your prompt payment.`
  });

  const text = `
${data.isOverdue ? 'PAYMENT OVERDUE' : 'PAYMENT REMINDER'}

Invoice: ${data.invoiceNumber}
Amount: ${formatCurrency(data.amount, data.currency)}
Due Date: ${data.dueDate}
Project: ${data.projectTitle}

${data.isOverdue ? `
⚠️ This invoice is past due. Please make payment as soon as possible to avoid any service interruptions.
` : ''}

Pay now: ${data.paymentUrl}

Payment methods accepted:
• Credit/Debit Cards
• Bank Transfer  
• Digital Wallets
• Local Indonesian Payment Methods

Need help? Contact our support team or reply to this email.

Thank you for your business!
`;

  return { html, text };
}
