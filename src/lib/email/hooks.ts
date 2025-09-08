import { sendWelcomeEmail, sendProjectStatusEmail, sendChatNotificationEmail, sendInvoiceReminderEmail } from './services';
import { prisma } from '@/lib/prisma';

/**
 * Hook to send welcome email after user registration
 * Should be called after successful user creation
 */
export async function onUserRegistered(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.email) {
      console.error('User not found or email missing:', userId);
      return { success: false, error: 'User not found' };
    }

    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin`;
    
    const result = await sendWelcomeEmail({
      to: user.email,
      userName: user.name || 'User',
      userRole: user.role,
      loginUrl,
    }, { skipIfDisabled: true });

    // Log email event in database (optional)
    await prisma.emailLog.create({
      data: {
        userId: user.id,
        type: 'WELCOME',
        recipient: user.email,
        status: result.success ? 'SENT' : 'FAILED',
        sentAt: new Date(),
      },
    }).catch(err => console.error('Failed to log email event:', err));

    return result;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Hook to send project status update email
 * Should be called when project status changes
 */
export async function onProjectStatusChanged(
  projectId: string, 
  previousStatus: string,
  message?: string
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        milestones: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!project || !project.client.email) {
      console.error('Project or client email not found:', projectId);
      return { success: false, error: 'Project or client not found' };
    }

    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/client/projects/${project.id}`;
    
    const result = await sendProjectStatusEmail({
      to: project.client.email,
      clientName: project.client.name || 'Valued Client',
      projectTitle: project.title,
      previousStatus,
      newStatus: project.status,
      progress: project.progress,
      message,
      milestones: project.milestones.map(m => ({
        title: m.title,
        status: m.status,
      })),
      dashboardUrl,
    }, { skipIfDisabled: true });

    // Log email event
    await prisma.emailLog.create({
      data: {
        userId: project.clientId,
        projectId: project.id,
        type: 'PROJECT_UPDATE',
        recipient: project.client.email,
        status: result.success ? 'SENT' : 'FAILED',
        sentAt: new Date(),
      },
    }).catch(err => console.error('Failed to log email event:', err));

    return result;
  } catch (error) {
    console.error('Failed to send project status email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Hook to send chat notification email
 * Should be called when new message is sent and recipient is offline
 */
export async function onNewChatMessage(messageId: string) {
  try {
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        sender: true,
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!message) {
      console.error('Message not found:', messageId);
      return { success: false, error: 'Message not found' };
    }

    // Determine recipient based on sender role
    const isAdminSender = message.sender.role === 'ADMIN';
    const recipient = isAdminSender ? message.project.client : await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!recipient || !recipient.email) {
      console.error('Recipient not found for message:', messageId);
      return { success: false, error: 'Recipient not found' };
    }

    // Check if recipient is online (you might implement this differently)
    // For now, we'll always send the notification
    const isRecipientOnline = await checkUserOnlineStatus(recipient.id);
    if (isRecipientOnline) {
      console.log('Recipient is online, skipping email notification');
      return { success: true, skipped: true };
    }

    const chatUrl = `${process.env.NEXT_PUBLIC_APP_URL}/client/projects/${message.project.id}#chat`;
    
    const result = await sendChatNotificationEmail({
      to: recipient.email,
      recipientName: recipient.name || 'There',
      senderName: message.sender.name || 'Team Member',
      projectTitle: message.project.title,
      message: message.content,
      timestamp: message.createdAt.toLocaleString(),
      chatUrl,
      isAdminSender,
    }, { skipIfDisabled: true });

    // Log email event
    await prisma.emailLog.create({
      data: {
        userId: recipient.id,
        projectId: message.projectId,
        type: 'CHAT_NOTIFICATION',
        recipient: recipient.email,
        status: result.success ? 'SENT' : 'FAILED',
        sentAt: new Date(),
      },
    }).catch(err => console.error('Failed to log email event:', err));

    return result;
  } catch (error) {
    console.error('Failed to send chat notification email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Hook to send invoice reminder email
 * Should be called by scheduled job or manually
 */
export async function onInvoiceReminder(invoiceId: string, isOverdue: boolean = false) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: true,
        project: true,
      },
    });

    if (!invoice || !invoice.client.email) {
      console.error('Invoice or client email not found:', invoiceId);
      return { success: false, error: 'Invoice or client not found' };
    }

    // Don't send reminders for paid invoices
    if (invoice.status === 'PAID') {
      console.log('Invoice already paid, skipping reminder');
      return { success: true, skipped: true };
    }

    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/client/payment?invoice=${invoice.id}`;
    
    const result = await sendInvoiceReminderEmail({
      to: invoice.client.email,
      clientName: invoice.client.name || 'Valued Client',
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      currency: invoice.currency,
      dueDate: invoice.dueDate.toLocaleDateString(),
      projectTitle: invoice.project.title,
      paymentUrl,
      isOverdue,
    }, { skipIfDisabled: true });

    // Update invoice reminder status
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        lastReminderSent: new Date(),
        reminderCount: { increment: 1 },
      },
    });

    // Log email event
    await prisma.emailLog.create({
      data: {
        userId: invoice.clientId,
        projectId: invoice.projectId,
        type: isOverdue ? 'INVOICE_OVERDUE' : 'INVOICE_REMINDER',
        recipient: invoice.client.email,
        status: result.success ? 'SENT' : 'FAILED',
        sentAt: new Date(),
      },
    }).catch(err => console.error('Failed to log email event:', err));

    return result;
  } catch (error) {
    console.error('Failed to send invoice reminder email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Helper function to check if user is online
 * This is a placeholder - implement based on your session tracking
 */
async function checkUserOnlineStatus(userId: string): Promise<boolean> {
  // You can implement this by:
  // 1. Checking active sessions
  // 2. Using Socket.io presence
  // 3. Checking last activity timestamp
  // For now, return false to always send emails
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastActiveAt: true },
  });

  if (!user?.lastActiveAt) return false;

  // Consider user online if active in last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return user.lastActiveAt > fiveMinutesAgo;
}

/**
 * Process pending invoice reminders
 * Should be called by a scheduled job (cron)
 */
export async function processPendingInvoiceReminders() {
  try {
    const now = new Date();
    
    // Find invoices that need reminders
    const invoices = await prisma.invoice.findMany({
      where: {
        status: { in: ['PENDING', 'OVERDUE'] },
        OR: [
          // First reminder: 3 days before due date
          {
            dueDate: {
              gte: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
              lte: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
            },
            lastReminderSent: null,
          },
          // Overdue reminder: After due date
          {
            dueDate: { lt: now },
            OR: [
              { lastReminderSent: null },
              // Send reminder every 3 days for overdue invoices
              {
                lastReminderSent: {
                  lt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
                },
              },
            ],
          },
        ],
      },
    });

    const results = await Promise.all(
      invoices.map(invoice => {
        const isOverdue = invoice.dueDate < now;
        return onInvoiceReminder(invoice.id, isOverdue);
      })
    );

    const successful = results.filter(r => r.success && !r.skipped).length;
    const skipped = results.filter(r => r.skipped).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Invoice reminders processed: ${successful} sent, ${skipped} skipped, ${failed} failed`);
    
    return { successful, skipped, failed };
  } catch (error) {
    console.error('Failed to process invoice reminders:', error);
    return { successful: 0, skipped: 0, failed: 0 };
  }
}
