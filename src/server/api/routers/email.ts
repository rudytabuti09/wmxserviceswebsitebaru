import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import {
  sendWelcomeEmail,
  sendInvoiceReminderEmail,
  sendProjectStatusEmail,
  sendChatNotificationEmail,
  sendPasswordResetEmail,
  sendBulkWelcomeEmails,
  queueEmail,
  processEmailQueue,
  getEmailQueueStatus,
} from "../../../lib/email/services";

export const emailRouter = createTRPCRouter({
  /**
   * Send welcome email to a new user
   */
  sendWelcome: adminProcedure
    .input(z.object({
      to: z.string().email(),
      userName: z.string(),
      userRole: z.enum(['CLIENT', 'ADMIN']),
      loginUrl: z.string().url().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await sendWelcomeEmail({
          to: input.to,
          userName: input.userName,
          userRole: input.userRole,
          loginUrl: input.loginUrl,
        }, { skipIfDisabled: true });

        return {
          success: true,
          message: 'Welcome email sent successfully',
          data: result,
        };
      } catch (error) {
        console.error('Failed to send welcome email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send welcome email',
        });
      }
    }),

  /**
   * Send invoice reminder email
   */
  sendInvoiceReminder: adminProcedure
    .input(z.object({
      invoiceId: z.string(),
      isOverdue: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get invoice details from database
        const invoice = await ctx.db.invoice.findUnique({
          where: { id: input.invoiceId },
          include: {
            client: true,
            project: true,
          },
        });

        if (!invoice) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invoice not found',
          });
        }

        if (!invoice.client.email) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Client email not found',
          });
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
          isOverdue: input.isOverdue,
        }, { skipIfDisabled: true });

        return {
          success: true,
          message: 'Invoice reminder sent successfully',
          data: result,
        };
      } catch (error) {
        console.error('Failed to send invoice reminder:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send invoice reminder',
        });
      }
    }),

  /**
   * Send project status update email
   */
  sendProjectStatus: adminProcedure
    .input(z.object({
      projectId: z.string(),
      message: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get project details from database
        const project = await ctx.db.project.findUnique({
          where: { id: input.projectId },
          include: {
            client: true,
            milestones: {
              orderBy: { order: 'asc' },
            },
          },
        });

        if (!project) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Project not found',
          });
        }

        if (!project.client.email) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Client email not found',
          });
        }

        // Get previous status from some tracking (this would need to be implemented)
        const previousStatus = 'PLANNING'; // This should come from a status history table
        const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/client/projects/${project.id}`;
        
        const result = await sendProjectStatusEmail({
          to: project.client.email,
          clientName: project.client.name || 'Valued Client',
          projectTitle: project.title,
          previousStatus,
          newStatus: project.status,
          progress: project.progress,
          message: input.message,
          milestones: project.milestones.map(m => ({
            title: m.title,
            status: m.status,
          })),
          dashboardUrl,
        }, { skipIfDisabled: true });

        return {
          success: true,
          message: 'Project status email sent successfully',
          data: result,
        };
      } catch (error) {
        console.error('Failed to send project status email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send project status email',
        });
      }
    }),

  /**
   * Send chat notification email
   */
  sendChatNotification: protectedProcedure
    .input(z.object({
      messageId: z.string(),
      recipientId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get message and recipient details
        const message = await ctx.db.chatMessage.findUnique({
          where: { id: input.messageId },
          include: {
            sender: true,
            project: true,
          },
        });

        const recipient = await ctx.db.user.findUnique({
          where: { id: input.recipientId },
        });

        if (!message || !recipient) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Message or recipient not found',
          });
        }

        if (!recipient.email) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Recipient email not found',
          });
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
          isAdminSender: message.sender.role === 'ADMIN',
        }, { skipIfDisabled: true });

        return {
          success: true,
          message: 'Chat notification sent successfully',
          data: result,
        };
      } catch (error) {
        console.error('Failed to send chat notification:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send chat notification',
        });
      }
    }),

  /**
   * Send password reset email
   */
  sendPasswordReset: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      resetToken: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get user details
        const user = await ctx.db.user.findUnique({
          where: { email: input.email },
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${input.resetToken}`;
        
        const result = await sendPasswordResetEmail({
          to: input.email,
          userName: user.name || 'User',
          resetUrl,
        }, { skipIfDisabled: true });

        return {
          success: true,
          message: 'Password reset email sent successfully',
          data: result,
        };
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send password reset email',
        });
      }
    }),

  /**
   * Send bulk welcome emails
   */
  sendBulkWelcome: adminProcedure
    .input(z.object({
      userIds: z.array(z.string()),
      loginUrl: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get user details
        const users = await ctx.db.user.findMany({
          where: {
            id: { in: input.userIds },
          },
        });

        if (users.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No users found',
          });
        }

        const emailData = users.map(user => ({
          email: user.email,
          name: user.name || 'User',
          role: user.role,
          loginUrl: input.loginUrl,
        }));

        const result = await sendBulkWelcomeEmails(emailData, { skipIfDisabled: true });

        return {
          success: true,
          message: `Bulk welcome emails sent to ${result.successful} users`,
          data: result,
        };
      } catch (error) {
        console.error('Failed to send bulk welcome emails:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send bulk welcome emails',
        });
      }
    }),

  /**
   * Queue email for later sending
   */
  queueEmail: adminProcedure
    .input(z.object({
      type: z.enum(['welcome', 'invoice', 'project_status', 'chat', 'password_reset']),
      data: z.record(z.any()),
      priority: z.enum(['high', 'normal', 'low']).default('normal'),
      scheduledFor: z.date().optional(),
    }))
    .mutation(({ input }) => {
      queueEmail({
        type: input.type,
        data: input.data,
        priority: input.priority,
        scheduledFor: input.scheduledFor,
      });

      return {
        success: true,
        message: 'Email queued successfully',
      };
    }),

  /**
   * Process email queue
   */
  processQueue: adminProcedure
    .mutation(async () => {
      try {
        const result = await processEmailQueue();
        return {
          success: true,
          message: `Processed ${result.processed} emails, skipped ${result.skipped}`,
          data: result,
        };
      } catch (error) {
        console.error('Failed to process email queue:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process email queue',
        });
      }
    }),

  /**
   * Get email queue status
   */
  getQueueStatus: adminProcedure
    .query(() => {
      const status = getEmailQueueStatus();
      return {
        success: true,
        data: status,
      };
    }),

  /**
   * Test email configuration
   */
  testEmail: adminProcedure
    .input(z.object({
      to: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await sendWelcomeEmail({
          to: input.to,
          userName: 'Test User',
          userRole: 'ADMIN',
        }, { skipIfDisabled: false });

        return {
          success: true,
          message: 'Test email sent successfully',
          data: result,
        };
      } catch (error) {
        console.error('Failed to send test email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send test email',
        });
      }
    }),
});
