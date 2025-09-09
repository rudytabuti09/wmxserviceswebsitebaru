import { Resend } from "resend";
import { render } from "@react-email/render";
import { 
  WelcomeEmail, 
  ProjectStatusEmail,
  InvoiceReminderEmail,
  ChatNotificationEmail,
  PaymentConfirmationEmail,
  PasswordResetEmail,
  VerificationCodeEmail 
} from "@/emails";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  projectUpdates: boolean;
  paymentReminders: boolean;
  chatNotifications: boolean;
  marketingEmails: boolean;
}

export class EmailNotificationService {
  private static instance: EmailNotificationService;
  private defaultFrom = process.env.EMAIL_FROM || "WMX Services <notifications@wmxservices.com>";

  private constructor() {}

  static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }

  private async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { data, error } = await resend.emails.send({
        from: options.from || this.defaultFrom,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo,
      });

      if (error) {
        console.error("Email sending failed:", error);
        return { success: false, error: error.message };
      }

      console.log("Email sent successfully:", data?.id);
      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error("Email service error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }

  // Welcome Email for New Users
  async sendWelcomeEmail(userEmail: string, userName: string, userRole: "CLIENT" | "ADMIN" = "CLIENT") {
    try {
      const emailHtml = render(WelcomeEmail({ 
        userFirstName: userName,
        userRole: userRole
      }));

      return await this.sendEmail({
        to: userEmail,
        subject: "🎉 Welcome to WMX Services - Your Digital Journey Begins!",
        html: emailHtml
      });
    } catch (error) {
      console.error("Welcome email error:", error);
      return { success: false, error: "Failed to send welcome email" };
    }
  }

  // Project Status Update Email
  async sendProjectStatusEmail(
    userEmail: string, 
    userName: string, 
    projectName: string, 
    oldStatus: string, 
    newStatus: string,
    projectUrl?: string
  ) {
    try {
      const emailHtml = render(ProjectStatusEmail({
        userFirstName: userName,
        projectName,
        oldStatus,
        newStatus,
        projectUrl
      }));

      const statusEmojis: Record<string, string> = {
        'PLANNING': '📋',
        'IN_PROGRESS': '🚀',
        'REVIEW': '👀',
        'COMPLETED': '✅',
        'DELIVERED': '🎉',
        'ON_HOLD': '⏸️'
      };

      const emoji = statusEmojis[newStatus] || '📢';

      return await this.sendEmail({
        to: userEmail,
        subject: `${emoji} Project Update: ${projectName} - Now ${newStatus.replace('_', ' ')}`,
        html: emailHtml
      });
    } catch (error) {
      console.error("Project status email error:", error);
      return { success: false, error: "Failed to send project status email" };
    }
  }

  // Invoice Reminder Email
  async sendInvoiceReminderEmail(
    userEmail: string,
    userName: string,
    invoiceId: string,
    amount: number,
    dueDate: Date,
    projectName: string,
    paymentUrl?: string
  ) {
    try {
      const emailHtml = render(InvoiceReminderEmail({
        userFirstName: userName,
        invoiceId,
        amount,
        dueDate: dueDate.toLocaleDateString(),
        projectName,
        paymentUrl
      }));

      const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      const urgencyEmoji = daysUntilDue <= 3 ? "🚨" : daysUntilDue <= 7 ? "⚠️" : "📄";

      return await this.sendEmail({
        to: userEmail,
        subject: `${urgencyEmoji} Invoice Reminder: ${invoiceId} - ${projectName} ($${amount})`,
        html: emailHtml
      });
    } catch (error) {
      console.error("Invoice reminder email error:", error);
      return { success: false, error: "Failed to send invoice reminder email" };
    }
  }

  // Chat Notification Email
  async sendChatNotificationEmail(
    userEmail: string,
    userName: string,
    senderName: string,
    messagePreview: string,
    projectName: string,
    chatUrl: string,
    unreadCount: number = 1
  ) {
    try {
      const emailHtml = render(ChatNotificationEmail({
        userFirstName: userName,
        senderName,
        messagePreview,
        projectName,
        chatUrl,
        unreadCount
      }));

      return await this.sendEmail({
        to: userEmail,
        subject: `💬 New message from ${senderName} - ${projectName}`,
        html: emailHtml
      });
    } catch (error) {
      console.error("Chat notification email error:", error);
      return { success: false, error: "Failed to send chat notification email" };
    }
  }

  // Payment Confirmation Email
  async sendPaymentConfirmationEmail(
    userEmail: string,
    userName: string,
    transactionId: string,
    amount: number,
    projectName: string,
    paymentMethod: string,
    receiptUrl?: string
  ) {
    try {
      const emailHtml = render(PaymentConfirmationEmail({
        userFirstName: userName,
        transactionId,
        amount,
        projectName,
        paymentMethod,
        receiptUrl
      }));

      return await this.sendEmail({
        to: userEmail,
        subject: `✅ Payment Confirmed: $${amount} for ${projectName}`,
        html: emailHtml
      });
    } catch (error) {
      console.error("Payment confirmation email error:", error);
      return { success: false, error: "Failed to send payment confirmation email" };
    }
  }

  // Password Reset Email
  async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetToken: string,
    resetUrl: string
  ) {
    try {
      const emailHtml = render(PasswordResetEmail({
        userFirstName: userName,
        resetToken,
        resetUrl
      }));

      return await this.sendEmail({
        to: userEmail,
        subject: "🔐 Reset Your WMX Services Password",
        html: emailHtml
      });
    } catch (error) {
      console.error("Password reset email error:", error);
      return { success: false, error: "Failed to send password reset email" };
    }
  }

  // Verification Code Email
  async sendVerificationCodeEmail(
    userEmail: string,
    userName: string,
    verificationCode: string,
    expiresIn: number = 15
  ) {
    try {
      const emailHtml = render(VerificationCodeEmail({
        userFirstName: userName,
        verificationCode,
        expiresIn
      }));

      return await this.sendEmail({
        to: userEmail,
        subject: `🔑 Your WMX Services Verification Code: ${verificationCode}`,
        html: emailHtml
      });
    } catch (error) {
      console.error("Verification code email error:", error);
      return { success: false, error: "Failed to send verification code email" };
    }
  }

  // Bulk Email for Announcements
  async sendBulkNotificationEmail(
    recipients: string[],
    subject: string,
    htmlContent: string,
    batchSize: number = 50
  ) {
    const results = [];
    
    // Send in batches to avoid rate limiting
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      try {
        const result = await this.sendEmail({
          to: batch,
          subject,
          html: htmlContent
        });
        results.push(result);
        
        // Add delay between batches
        if (i + batchSize < recipients.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Batch email error for batch ${i}-${i + batchSize}:`, error);
        results.push({ success: false, error: "Batch send failed" });
      }
    }
    
    return results;
  }

  // Check User Notification Preferences
  async getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      // This would typically fetch from your database
      // For now, return default preferences
      return {
        userId,
        emailNotifications: true,
        projectUpdates: true,
        paymentReminders: true,
        chatNotifications: true,
        marketingEmails: false
      };
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      return null;
    }
  }

  // Update User Notification Preferences
  async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>) {
    try {
      // This would typically update your database
      console.log(`Updating notification preferences for user ${userId}:`, preferences);
      return { success: true };
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      return { success: false, error: "Failed to update preferences" };
    }
  }
}

// Export singleton instance
export const emailService = EmailNotificationService.getInstance();
