import { render } from '@react-email/render';
import { sendEmail, EMAIL_CONFIG } from './resend';

// Import email templates
import WelcomeEmail from '../../emails/welcome';
import InvoiceReminderEmail from '../../emails/invoice-reminder';
import ProjectStatusEmail from '../../emails/project-status';
import ChatNotificationEmail from '../../emails/chat-notification';
import PasswordResetEmail from '../../emails/password-reset';
import VerificationCodeEmail from '../../emails/verification-code';
import PaymentConfirmationEmail from '../../emails/payment-confirmation';

export interface EmailServiceOptions {
  skipIfDisabled?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail({
  to,
  userName,
  userRole,
  loginUrl,
}: {
  to: string;
  userName: string;
  userRole: 'CLIENT' | 'ADMIN';
  loginUrl?: string;
}, options: EmailServiceOptions = {}) {
  if (!EMAIL_CONFIG.enabled && options.skipIfDisabled) {
    return { success: true, skipped: true, message: 'Email service disabled' };
  }

  try {
    return await sendEmail({
      to,
      subject: `Welcome to WMX Services, ${userName}! 🚀`,
      react: (
        <WelcomeEmail 
          name={userName}
          loginUrl={loginUrl || `${EMAIL_CONFIG.appUrl}/auth/signin`}
        />
      ),
      replyTo: 'support@wmx-services.dev',
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
}

/**
 * Send invoice notification email (for newly created invoices)
 */
export async function sendInvoiceNotificationEmail({
  to,
  clientName,
  invoiceNumber,
  amount,
  currency = 'USD',
  dueDate,
  issuedDate,
  projectTitle,
  description,
  paymentUrl,
  companyName = 'WMX Services',
}: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  currency?: string;
  dueDate: string;
  issuedDate: string;
  projectTitle: string;
  description?: string;
  paymentUrl: string;
  companyName?: string;
}, options: EmailServiceOptions = {}) {
  if (!EMAIL_CONFIG.enabled && options.skipIfDisabled) {
    return { success: true, skipped: true, message: 'Email service disabled' };
  }

  const subject = `📧 New Invoice ${invoiceNumber} from ${companyName}`;

  try {
    return await sendEmail({
      to,
      subject,
      react: (
        <InvoiceReminderEmail
          clientName={clientName}
          invoiceNumber={invoiceNumber}
          amount={amount}
          currency={currency}
          dueDate={dueDate}
          projectTitle={projectTitle}
          paymentUrl={paymentUrl}
          isOverdue={false}
        />
      ),
      replyTo: 'billing@wmx-services.dev',
    });
  } catch (error) {
    console.error('Failed to send invoice notification email:', error);
    throw new Error('Failed to send invoice notification email');
  }
}

/**
 * Send invoice reminder email
 */
export async function sendInvoiceReminderEmail({
  to,
  clientName,
  invoiceNumber,
  amount,
  currency = 'USD',
  dueDate,
  projectTitle,
  paymentUrl,
  isOverdue = false,
}: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  currency?: string;
  dueDate: string;
  projectTitle: string;
  paymentUrl: string;
  isOverdue?: boolean;
}, options: EmailServiceOptions = {}) {
  if (!EMAIL_CONFIG.enabled && options.skipIfDisabled) {
    return { success: true, skipped: true, message: 'Email service disabled' };
  }

  const subject = isOverdue 
    ? `⚠️ OVERDUE: Invoice ${invoiceNumber} - Action Required`
    : `📧 Payment Reminder: Invoice ${invoiceNumber} - Due ${dueDate}`;

  try {
    return await sendEmail({
      to,
      subject,
      react: (
        <InvoiceReminderEmail
          clientName={clientName}
          invoiceNumber={invoiceNumber}
          amount={amount}
          currency={currency}
          dueDate={dueDate}
          projectTitle={projectTitle}
          paymentUrl={paymentUrl}
          isOverdue={isOverdue}
        />
      ),
      replyTo: 'billing@wmx-services.dev',
    });
  } catch (error) {
    console.error('Failed to send invoice reminder email:', error);
    throw new Error('Failed to send invoice reminder email');
  }
}

/**
 * Send project status update email
 */
export async function sendProjectStatusEmail({
  to,
  clientName,
  projectTitle,
  previousStatus,
  newStatus,
  progress,
  message,
  milestones,
  dashboardUrl,
}: {
  to: string;
  clientName: string;
  projectTitle: string;
  previousStatus: string;
  newStatus: string;
  progress: number;
  message?: string;
  milestones?: Array<{
    title: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  }>;
  dashboardUrl: string;
}, options: EmailServiceOptions = {}) {
  if (!EMAIL_CONFIG.enabled && options.skipIfDisabled) {
    return { success: true, skipped: true, message: 'Email service disabled' };
  }

  const statusEmoji = newStatus === 'COMPLETED' ? '🎉' : '📊';
  const subject = `${statusEmoji} Project Update: ${projectTitle} - ${newStatus.replace('_', ' ')}`;

  try {
    return await sendEmail({
      to,
      subject,
      react: (
        <ProjectStatusEmail
          clientName={clientName}
          projectTitle={projectTitle}
          previousStatus={previousStatus}
          newStatus={newStatus}
          progress={progress}
          message={message}
          milestones={milestones}
          dashboardUrl={dashboardUrl}
        />
      ),
      replyTo: 'projects@wmx-services.dev',
    });
  } catch (error) {
    console.error('Failed to send project status email:', error);
    throw new Error('Failed to send project status email');
  }
}

/**
 * Send chat message notification email
 */
export async function sendChatNotificationEmail({
  to,
  recipientName,
  senderName,
  projectTitle,
  message,
  timestamp,
  chatUrl,
  isAdminSender = false,
}: {
  to: string;
  recipientName: string;
  senderName: string;
  projectTitle: string;
  message: string;
  timestamp: string;
  chatUrl: string;
  isAdminSender?: boolean;
}, options: EmailServiceOptions = {}) {
  if (!EMAIL_CONFIG.enabled && options.skipIfDisabled) {
    return { success: true, skipped: true, message: 'Email service disabled' };
  }

  const truncatedMessage = message.length > 50 ? message.substring(0, 50) + '...' : message;
  const subject = `💬 New message from ${senderName}: ${truncatedMessage}`;

  try {
    return await sendEmail({
      to,
      subject,
      react: (
        <ChatNotificationEmail
          recipientName={recipientName}
          senderName={senderName}
          projectTitle={projectTitle}
          message={message}
          timestamp={timestamp}
          chatUrl={chatUrl}
          isAdminSender={isAdminSender}
        />
      ),
      replyTo: 'noreply@wmx-services.dev',
    });
  } catch (error) {
    console.error('Failed to send chat notification email:', error);
    throw new Error('Failed to send chat notification email');
  }
}

/**
 * Send email verification code
 */
export async function sendVerificationCodeEmail({
  to,
  userName,
  verificationCode,
  expiresIn = '10 minutes',
}: {
  to: string;
  userName?: string;
  verificationCode: string;
  expiresIn?: string;
}, options: EmailServiceOptions = {}) {
  if (!EMAIL_CONFIG.enabled && options.skipIfDisabled) {
    return { success: true, skipped: true, message: 'Email service disabled' };
  }

  try {
    // Use React component for better email rendering
    return await sendEmail({
      to,
      subject: `${verificationCode} is your WMX Services verification code`,
      react: (
        <VerificationCodeEmail
          userName={userName}
          verificationCode={verificationCode}
          expiresIn={expiresIn}
        />
      ),
      replyTo: 'noreply@wmx-services.dev',
    });
  } catch (error) {
    // Log error for debugging but don't expose details
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail({
  to,
  clientName,
  invoiceNumber,
  amount,
  currency = 'IDR',
  projectTitle,
  paymentMethod = 'Online Payment',
  paidDate,
  dashboardUrl,
}: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  currency?: string;
  projectTitle: string;
  paymentMethod?: string;
  paidDate: string;
  dashboardUrl: string;
}, options: EmailServiceOptions = {}) {
  if (!EMAIL_CONFIG.enabled && options.skipIfDisabled) {
    return { success: true, skipped: true, message: 'Email service disabled' };
  }

  try {
    return await sendEmail({
      to,
      subject: `✅ Payment Confirmed - Invoice ${invoiceNumber}`,
      react: (
        <PaymentConfirmationEmail
          clientName={clientName}
          invoiceNumber={invoiceNumber}
          amount={amount}
          currency={currency}
          projectTitle={projectTitle}
          paymentMethod={paymentMethod}
          paidDate={paidDate}
          dashboardUrl={dashboardUrl}
        />
      ),
      replyTo: 'billing@wmx-services.dev',
    });
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error);
    throw new Error('Failed to send payment confirmation email');
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail({
  to,
  userName,
  resetUrl,
  expirationTime = '1 hour',
}: {
  to: string;
  userName: string;
  resetUrl: string;
  expirationTime?: string;
}, options: EmailServiceOptions = {}) {
  if (!EMAIL_CONFIG.enabled && options.skipIfDisabled) {
    return { success: true, skipped: true, message: 'Email service disabled' };
  }

  try {
    return await sendEmail({
      to,
      subject: '🔒 Reset your WMX Services password - Action required',
      react: (
        <PasswordResetEmail
          name={userName}
          resetUrl={resetUrl}
          expirationTime={expirationTime}
        />
      ),
      replyTo: 'security@wmx-services.dev',
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

/**
 * Send bulk welcome emails (for multiple users)
 */
export async function sendBulkWelcomeEmails(
  users: Array<{
    email: string;
    name: string;
    role: 'CLIENT' | 'ADMIN';
    loginUrl?: string;
  }>,
  options: EmailServiceOptions = {}
) {
  if (!EMAIL_CONFIG.enabled && options.skipIfDisabled) {
    return { success: true, skipped: true, total: users.length };
  }

  const emailPromises = users.map(user => 
    sendWelcomeEmail({
      to: user.email,
      userName: user.name,
      userRole: user.role,
      loginUrl: user.loginUrl,
    }, options)
  );

  const results = await Promise.allSettled(emailPromises);
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return {
    success: true,
    total: users.length,
    successful,
    failed,
    results,
  };
}

/**
 * Queue email for later sending (useful for batching)
 */
interface QueuedEmail {
  type: 'welcome' | 'invoice' | 'project_status' | 'chat' | 'password_reset' | 'payment_confirmation';
  data: any;
  scheduledFor?: Date;
  priority: 'high' | 'normal' | 'low';
}

const emailQueue: QueuedEmail[] = [];

export function queueEmail(email: QueuedEmail) {
  emailQueue.push(email);
}

/**
 * Process queued emails
 */
export async function processEmailQueue() {
  if (!EMAIL_CONFIG.enabled) {
    emailQueue.length = 0; // Clear queue
    return { processed: 0, skipped: 0 };
  }

  const now = new Date();
  const emailsToSend = emailQueue.filter(email => 
    !email.scheduledFor || email.scheduledFor <= now
  );

  if (emailsToSend.length === 0) {
    return { processed: 0, skipped: 0 };
  }

  // Sort by priority (high -> normal -> low)
  const priorityOrder = { high: 0, normal: 1, low: 2 };
  emailsToSend.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  let processed = 0;
  let skipped = 0;

  for (const email of emailsToSend) {
    try {
      switch (email.type) {
        case 'welcome':
          await sendWelcomeEmail(email.data);
          break;
        case 'invoice':
          await sendInvoiceReminderEmail(email.data);
          break;
        case 'project_status':
          await sendProjectStatusEmail(email.data);
          break;
        case 'chat':
          await sendChatNotificationEmail(email.data);
          break;
        case 'password_reset':
          await sendPasswordResetEmail(email.data);
          break;
        case 'payment_confirmation':
          await sendPaymentConfirmationEmail(email.data);
          break;
        default:
          console.warn(`Unknown email type: ${email.type}`);
          skipped++;
          continue;
      }
      processed++;
    } catch (error) {
      console.error(`Failed to send ${email.type} email:`, error);
      skipped++;
    }

    // Remove from queue
    const index = emailQueue.indexOf(email);
    if (index > -1) {
      emailQueue.splice(index, 1);
    }
  }

  console.log(`Email queue processed: ${processed} sent, ${skipped} skipped`);
  return { processed, skipped };
}

/**
 * Get email queue status
 */
export function getEmailQueueStatus() {
  return {
    total: emailQueue.length,
    byPriority: {
      high: emailQueue.filter(e => e.priority === 'high').length,
      normal: emailQueue.filter(e => e.priority === 'normal').length,
      low: emailQueue.filter(e => e.priority === 'low').length,
    },
    emailEnabled: EMAIL_CONFIG.enabled,
  };
}
