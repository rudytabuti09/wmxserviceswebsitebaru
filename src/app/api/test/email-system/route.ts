import { NextRequest, NextResponse } from "next/server";
import { 
  sendWelcomeEmail,
  sendVerificationCodeEmail,
  sendInvoiceReminderEmail,
  sendProjectStatusEmail,
  sendChatNotificationEmail,
  sendPaymentConfirmationEmail,
  queueEmail,
  processEmailQueue,
  getEmailQueueStatus
} from "@/lib/email/services";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const test = url.searchParams.get('test');
    const to = url.searchParams.get('to') || 'test@wmx-services.dev';
    
    if (!test) {
      return NextResponse.json({
        error: "Please specify a test type",
        availableTests: [
          "welcome",
          "verification",
          "invoice-reminder", 
          "project-status",
          "chat-notification",
          "payment-confirmation",
          "queue-status",
          "process-queue",
          "all"
        ]
      });
    }

    const results: any = {};

    switch (test) {
      case 'welcome':
        results.welcome = await sendWelcomeEmail({
          to,
          userName: "Test User",
          userRole: "CLIENT",
          loginUrl: "https://localhost:3000/auth/signin"
        }, { skipIfDisabled: false });
        break;

      case 'verification':
        results.verification = await sendVerificationCodeEmail({
          to,
          userName: "Test User",
          verificationCode: "123456",
          expiresIn: "10 minutes"
        }, { skipIfDisabled: false });
        break;

      case 'invoice-reminder':
        results.invoiceReminder = await sendInvoiceReminderEmail({
          to,
          clientName: "Test Client",
          invoiceNumber: "INV-2024-001",
          amount: 1000000,
          currency: "IDR",
          dueDate: "2024-12-31",
          projectTitle: "Test Project",
          paymentUrl: "https://localhost:3000/client/payment",
          isOverdue: false
        }, { skipIfDisabled: false });
        break;

      case 'project-status':
        results.projectStatus = await sendProjectStatusEmail({
          to,
          clientName: "Test Client",
          projectTitle: "Test Project",
          previousStatus: "IN_PROGRESS",
          newStatus: "COMPLETED",
          progress: 100,
          message: "Your project has been completed successfully!",
          milestones: [
            { title: "Planning", status: "COMPLETED" },
            { title: "Development", status: "COMPLETED" },
            { title: "Testing", status: "COMPLETED" }
          ],
          dashboardUrl: "https://localhost:3000/client/dashboard"
        }, { skipIfDisabled: false });
        break;

      case 'chat-notification':
        results.chatNotification = await sendChatNotificationEmail({
          to,
          recipientName: "Test Client",
          senderName: "WMX Team",
          projectTitle: "Test Project",
          message: "This is a test message from the WMX team. How are things going?",
          timestamp: new Date().toLocaleString(),
          chatUrl: "https://localhost:3000/client/projects/test-id#chat",
          isAdminSender: true
        }, { skipIfDisabled: false });
        break;

      case 'payment-confirmation':
        results.paymentConfirmation = await sendPaymentConfirmationEmail({
          to,
          clientName: "Test Client",
          invoiceNumber: "INV-2024-001",
          amount: 1000000,
          currency: "IDR",
          projectTitle: "Test Project",
          paymentMethod: "Bank Transfer",
          paidDate: new Date().toLocaleDateString(),
          dashboardUrl: "https://localhost:3000/client/dashboard"
        }, { skipIfDisabled: false });
        break;

      case 'queue-status':
        results.queueStatus = getEmailQueueStatus();
        break;

      case 'process-queue':
        results.processQueue = await processEmailQueue();
        break;

      case 'all':
        // Test queue functionality
        queueEmail({
          type: 'welcome',
          priority: 'high',
          data: {
            to,
            userName: "Queue Test User",
            userRole: "CLIENT"
          }
        });

        queueEmail({
          type: 'payment_confirmation',
          priority: 'normal',
          data: {
            to,
            clientName: "Queue Test Client",
            invoiceNumber: "QUEUE-001",
            amount: 500000,
            currency: "IDR",
            projectTitle: "Queue Test Project",
            paymentMethod: "Credit Card",
            paidDate: new Date().toLocaleDateString(),
            dashboardUrl: "https://localhost:3000/client/dashboard"
          }
        });

        results.queuedEmails = 2;
        results.queueStatus = getEmailQueueStatus();
        results.processResult = await processEmailQueue();
        results.finalQueueStatus = getEmailQueueStatus();
        break;

      default:
        return NextResponse.json({ error: "Invalid test type" });
    }

    return NextResponse.json({
      success: true,
      test,
      testEmail: to,
      timestamp: new Date().toISOString(),
      results
    });

  } catch (error) {
    console.error("Email test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { test, to = 'test@wmx-services.dev', data } = body;

    if (!test) {
      return NextResponse.json({
        error: "Please specify a test type in request body"
      });
    }

    let result;

    switch (test) {
      case 'custom-welcome':
        result = await sendWelcomeEmail({
          to,
          userName: data.userName || "Custom Test User",
          userRole: data.userRole || "CLIENT",
          loginUrl: data.loginUrl
        }, { skipIfDisabled: false });
        break;

      case 'queue-custom':
        queueEmail({
          type: data.emailType,
          priority: data.priority || 'normal',
          data: { to, ...data.emailData }
        });
        result = { queued: true, queueStatus: getEmailQueueStatus() };
        break;

      default:
        return NextResponse.json({ error: "Invalid test type for POST" });
    }

    return NextResponse.json({
      success: true,
      test,
      testEmail: to,
      timestamp: new Date().toISOString(),
      result
    });

  } catch (error) {
    console.error("Email test POST error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
