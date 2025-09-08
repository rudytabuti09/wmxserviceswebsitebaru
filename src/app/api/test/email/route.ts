import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/resend';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  sendWelcomeEmail,
  sendInvoiceReminderEmail,
  sendProjectStatusEmail,
  sendChatNotificationEmail,
  sendVerificationCodeEmail,
} from "@/lib/email/services";

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { type, to, data } = await request.json();

    if (!to || !type) {
      return NextResponse.json(
        { error: "Missing required fields: 'to' and 'type'" },
        { status: 400 }
      );
    }

    let result;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    switch (type) {
      case "welcome":
        result = await sendWelcomeEmail({
          to,
          userName: data?.userName || "Test User",
          userRole: data?.userRole || "CLIENT",
          loginUrl: `${baseUrl}/auth/signin`,
        });
        break;

      case "invoice":
        result = await sendInvoiceReminderEmail({
          to,
          clientName: data?.clientName || "Test Client",
          invoiceNumber: data?.invoiceNumber || "INV-TEST-001",
          amount: data?.amount || 1000,
          currency: data?.currency || "USD",
          dueDate: data?.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          projectTitle: data?.projectTitle || "Test Project",
          paymentUrl: `${baseUrl}/client/payment`,
          isOverdue: data?.isOverdue || false,
        });
        break;

      case "project":
        result = await sendProjectStatusEmail({
          to,
          clientName: data?.clientName || "Test Client",
          projectTitle: data?.projectTitle || "Test Project",
          previousStatus: data?.previousStatus || "PLANNING",
          newStatus: data?.newStatus || "IN_PROGRESS",
          progress: data?.progress || 50,
          message: data?.message || "Your project is progressing well!",
          milestones: data?.milestones || [
            { title: "Design", status: "COMPLETED" },
            { title: "Development", status: "IN_PROGRESS" },
            { title: "Testing", status: "PENDING" },
          ],
          dashboardUrl: `${baseUrl}/client/dashboard`,
        });
        break;

      case "chat":
        result = await sendChatNotificationEmail({
          to,
          recipientName: data?.recipientName || "Test Recipient",
          senderName: data?.senderName || "Test Sender",
          projectTitle: data?.projectTitle || "Test Project",
          message: data?.message || "This is a test chat message",
          timestamp: new Date().toLocaleString(),
          chatUrl: `${baseUrl}/client/projects/test-id`,
          isAdminSender: data?.isAdminSender || false,
        });
        break;

      case "verification":
        result = await sendVerificationCodeEmail({
          to,
          userName: data?.userName || "Test User",
          verificationCode: data?.verificationCode || "123456",
          expiresIn: "10 minutes",
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid email type. Valid types: welcome, invoice, project, chat, verification" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully`,
      type,
      recipient: to,
      result,
    });

  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { 
        error: "Failed to send test email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to show available test email types
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized - Admin access required" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    message: "Email Test API - Send POST request with email type and recipient",
    availableTypes: [
      {
        type: "welcome",
        description: "Welcome email for new users",
        requiredFields: ["to"],
        optionalFields: ["userName", "userRole"],
      },
      {
        type: "invoice",
        description: "Invoice reminder email",
        requiredFields: ["to"],
        optionalFields: ["clientName", "invoiceNumber", "amount", "currency", "dueDate", "projectTitle", "isOverdue"],
      },
      {
        type: "project",
        description: "Project status update email",
        requiredFields: ["to"],
        optionalFields: ["clientName", "projectTitle", "previousStatus", "newStatus", "progress", "message", "milestones"],
      },
      {
        type: "chat",
        description: "Chat notification email",
        requiredFields: ["to"],
        optionalFields: ["recipientName", "senderName", "projectTitle", "message", "isAdminSender"],
      },
      {
        type: "verification",
        description: "Email verification code",
        requiredFields: ["to"],
        optionalFields: ["userName", "verificationCode"],
      },
    ],
    exampleRequest: {
      type: "welcome",
      to: "test@example.com",
      data: {
        userName: "John Doe",
        userRole: "CLIENT",
      },
    },
  });
}
