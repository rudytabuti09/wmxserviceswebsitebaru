import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { coreApi, MidtransNotification } from "@/lib/midtrans";
import { queueEmail } from "@/lib/email/services";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  console.log("🚀 Webhook endpoint called at:", new Date().toISOString());
  console.log("📥 Request headers:", Object.fromEntries(request.headers.entries()));
  
  try {
    const notification: MidtransNotification = await request.json();
    console.log("📨 Received webhook notification:", notification);
    
    // Verify the notification signature
    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;
    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    
    console.log("🔍 Processing webhook for order:", orderId, "status:", notification.transaction_status);
    
    const expectedSignature = crypto
      .createHash("sha512")
      .update(orderId + statusCode + grossAmount + serverKey)
      .digest("hex");
    
    if (notification.signature_key !== expectedSignature) {
      console.error("Invalid signature:", {
        received: notification.signature_key,
        expected: expectedSignature,
      });
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Get transaction status from Midtrans
    const transactionStatus = await coreApi.transaction.status(orderId);
    
    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { midtransOrderId: orderId },
      include: { invoice: true },
    });

    if (!payment) {
      console.error("Payment not found for order:", orderId);
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Update payment status based on Midtrans response
    let paymentStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED" = "PENDING";
    let invoiceStatus: "DRAFT" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED" = "PENDING";
    let paidAt: Date | null = null;

    switch (transactionStatus.transaction_status) {
      case "capture":
      case "settlement":
        paymentStatus = "COMPLETED";
        invoiceStatus = "PAID";
        paidAt = new Date();
        break;
      case "pending":
        paymentStatus = "PENDING";
        invoiceStatus = "PENDING";
        break;
      case "deny":
      case "cancel":
      case "expire":
        paymentStatus = "FAILED";
        invoiceStatus = "PENDING"; // Keep invoice pending for retry
        break;
      case "refund":
        paymentStatus = "REFUNDED";
        invoiceStatus = "PENDING";
        break;
      default:
        paymentStatus = "PROCESSING";
        break;
    }

    // Update payment record
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
        paymentMethod: transactionStatus.payment_type,
        transactionId: transactionStatus.transaction_id,
        paidAt,
      },
    });

    // Update invoice if payment is completed
    if (paymentStatus === "COMPLETED") {
      const updatedInvoice = await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          status: invoiceStatus,
          paidAt,
        },
        include: {
          project: {
            include: {
              client: true,
            },
          },
        },
      });

      // Queue payment confirmation email
      if (updatedInvoice.project?.client) {
        queueEmail({
          type: 'payment_confirmation',
          priority: 'high',
          data: {
            to: updatedInvoice.project.client.email,
            clientName: updatedInvoice.project.client.name,
            invoiceNumber: updatedInvoice.number,
            amount: Number(updatedInvoice.amount),
            currency: 'IDR',
            projectTitle: updatedInvoice.project.title,
            paymentMethod: transactionStatus.payment_type,
            paidDate: paidAt?.toLocaleDateString() || new Date().toLocaleDateString(),
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/client/dashboard`,
          },
        });
      }

      // Create notification for all admin users when client makes payment
      const adminUsers = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      if (adminUsers.length > 0) {
        const notifications = adminUsers.map((admin) => ({
          userId: admin.id,
          title: "💰 Payment Received",
          message: `${updatedInvoice.project?.client?.name || 'Client'} has successfully paid invoice ${updatedInvoice.number} for ${updatedInvoice.project?.title || 'project'} - ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(updatedInvoice.amount))}`,
          type: "SUCCESS" as const,
          entityId: updatedInvoice.id,
          entityType: "INVOICE",
          actionUrl: `/admin/invoices?invoice=${updatedInvoice.id}`,
        }));

        await prisma.notification.createMany({
          data: notifications,
        });
      }
    }

    console.log("Payment webhook processed:", {
      orderId,
      transactionStatus: transactionStatus.transaction_status,
      paymentStatus,
      invoiceStatus,
    });

    return NextResponse.json({ 
      message: "Webhook processed successfully",
      status: paymentStatus,
    });

  } catch (error) {
    console.error("Payment webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
