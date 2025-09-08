import { prisma } from '@/lib/prisma';
import { ActivityType } from '@prisma/client';

interface ActivityLogData {
  userId: string;
  projectId?: string;
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: any;
}

/**
 * Log an activity to the database
 */
export async function logActivity(data: ActivityLogData) {
  try {
    return await prisma.activityLog.create({
      data: {
        userId: data.userId,
        projectId: data.projectId,
        type: data.type,
        title: data.title,
        description: data.description,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw error to prevent breaking the main functionality
    return null;
  }
}

/**
 * Log project creation activity
 */
export async function logProjectCreated(userId: string, projectId: string, projectTitle: string) {
  return logActivity({
    userId,
    projectId,
    type: 'PROJECT_CREATED',
    title: 'New project created',
    description: `Project "${projectTitle}" has been created`,
  });
}

/**
 * Log project status change activity
 */
export async function logProjectStatusChanged(
  userId: string, 
  projectId: string, 
  projectTitle: string, 
  previousStatus: string, 
  newStatus: string
) {
  return logActivity({
    userId,
    projectId,
    type: 'PROJECT_STATUS_CHANGED',
    title: 'Project status updated',
    description: `Project "${projectTitle}" status changed from ${previousStatus} to ${newStatus}`,
    metadata: { previousStatus, newStatus },
  });
}

/**
 * Log project progress update activity
 */
export async function logProjectProgressUpdated(
  userId: string, 
  projectId: string, 
  projectTitle: string, 
  previousProgress: number, 
  newProgress: number
) {
  return logActivity({
    userId,
    projectId,
    type: 'PROJECT_PROGRESS_UPDATED',
    title: 'Project progress updated',
    description: `Project "${projectTitle}" progress updated to ${newProgress}%`,
    metadata: { previousProgress, newProgress },
  });
}

/**
 * Log project completion activity
 */
export async function logProjectCompleted(userId: string, projectId: string, projectTitle: string) {
  return logActivity({
    userId,
    projectId,
    type: 'PROJECT_COMPLETED',
    title: 'Project completed',
    description: `Project "${projectTitle}" has been completed`,
  });
}

/**
 * Log milestone completion activity
 */
export async function logMilestoneCompleted(
  userId: string, 
  projectId: string, 
  milestoneTitle: string, 
  projectTitle: string
) {
  return logActivity({
    userId,
    projectId,
    type: 'MILESTONE_COMPLETED',
    title: 'Milestone completed',
    description: `Milestone "${milestoneTitle}" completed in project "${projectTitle}"`,
    metadata: { milestoneTitle },
  });
}

/**
 * Log milestone status update activity
 */
export async function logMilestoneUpdated(
  userId: string, 
  projectId: string, 
  milestoneTitle: string, 
  previousStatus: string, 
  newStatus: string,
  projectTitle: string
) {
  return logActivity({
    userId,
    projectId,
    type: 'MILESTONE_UPDATED',
    title: 'Milestone updated',
    description: `Milestone "${milestoneTitle}" in project "${projectTitle}" changed from ${previousStatus} to ${newStatus}`,
    metadata: { milestoneTitle, previousStatus, newStatus },
  });
}

/**
 * Log message sent activity
 */
export async function logMessageSent(
  userId: string, 
  projectId: string, 
  projectTitle: string, 
  messageContent: string
) {
  return logActivity({
    userId,
    projectId,
    type: 'MESSAGE_SENT',
    title: 'Message sent',
    description: `Sent a message in project "${projectTitle}"`,
    metadata: { messageLength: messageContent.length },
  });
}

/**
 * Log message received activity
 */
export async function logMessageReceived(
  userId: string, 
  projectId: string, 
  projectTitle: string, 
  senderName: string
) {
  return logActivity({
    userId,
    projectId,
    type: 'MESSAGE_RECEIVED',
    title: 'New message received',
    description: `Received a message from ${senderName} in project "${projectTitle}"`,
    metadata: { senderName },
  });
}

/**
 * Log payment received activity
 */
export async function logPaymentReceived(
  userId: string, 
  projectId: string, 
  amount: number, 
  currency: string, 
  invoiceNumber: string,
  projectTitle: string
) {
  return logActivity({
    userId,
    projectId,
    type: 'PAYMENT_RECEIVED',
    title: 'Payment received',
    description: `Received payment of ${currency} ${amount} for invoice ${invoiceNumber} (${projectTitle})`,
    metadata: { amount, currency, invoiceNumber },
  });
}

/**
 * Log invoice creation activity
 */
export async function logInvoiceCreated(
  userId: string, 
  projectId: string, 
  invoiceNumber: string, 
  amount: number, 
  currency: string,
  projectTitle: string
) {
  return logActivity({
    userId,
    projectId,
    type: 'INVOICE_CREATED',
    title: 'New invoice created',
    description: `Invoice ${invoiceNumber} created for ${currency} ${amount} (${projectTitle})`,
    metadata: { invoiceNumber, amount, currency },
  });
}

/**
 * Log invoice paid activity
 */
export async function logInvoicePaid(
  userId: string, 
  projectId: string, 
  invoiceNumber: string, 
  amount: number, 
  currency: string,
  projectTitle: string
) {
  return logActivity({
    userId,
    projectId,
    type: 'INVOICE_PAID',
    title: 'Invoice paid',
    description: `Invoice ${invoiceNumber} has been paid (${currency} ${amount} for ${projectTitle})`,
    metadata: { invoiceNumber, amount, currency },
  });
}

/**
 * Log user registration activity
 */
export async function logUserRegistered(userId: string, userName: string, userRole: string) {
  return logActivity({
    userId,
    type: 'USER_REGISTERED',
    title: 'Account created',
    description: `Welcome to WMX Services! Your ${userRole} account has been created`,
    metadata: { userName, userRole },
  });
}

/**
 * Log user login activity
 */
export async function logUserLogin(userId: string, userName: string) {
  return logActivity({
    userId,
    type: 'USER_LOGIN',
    title: 'Logged in',
    description: `${userName} logged into the dashboard`,
    metadata: { userName },
  });
}
