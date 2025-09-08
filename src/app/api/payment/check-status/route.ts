import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { coreApi } from "@/lib/midtrans";
import { queueEmail } from "@/lib/email/services";

export async function POST(request: NextRequest) {
  try {
    console.log("=== Payment Status Check Started ===");
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.log("No session or user found");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    console.log("User authenticated:", session.user.id, "role:", session.user.role);

    const { orderId } = await request.json();

    if (!orderId) {
      console.log("No order ID provided");
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    console.log("Checking payment status for order:", orderId);

    // Get transaction status from Midtrans
    let transactionStatus;
    try {
      transactionStatus = await coreApi.transaction.status(orderId);
      console.log("Midtrans transaction status:", transactionStatus);
    } catch (midtransError) {
      console.error("Midtrans API error:", midtransError);
      return NextResponse.json(
        { 
          error: "Failed to get transaction status from Midtrans",
          details: midtransError instanceof Error ? midtransError.message : String(midtransError)
        },
        { status: 500 }
      );
    }
    
    // Find payment record
    console.log("Searching for payment with order ID:", orderId);
    const payment = await prisma.payment.findUnique({
      where: { midtransOrderId: orderId },
      include: { 
        invoice: {
          include: {
            project: {
              include: {
                client: true
              }
            }
          }
        }
      },
    });
    
    console.log("Payment found:", payment ? "Yes" : "No");
    if (payment) {
      console.log("Payment status:", payment.status);
      console.log("Invoice ID:", payment.invoice?.id);
      console.log("Invoice status:", payment.invoice?.status);
    }

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Check if user can access this payment
    if (payment.invoice.clientId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
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
        paidAt = new Date(transactionStatus.transaction_time);
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

    // Only update if status has changed
    const needsUpdate = payment.status !== paymentStatus;
    
    if (needsUpdate) {
      console.log(`Updating payment status from ${payment.status} to ${paymentStatus}`);
      
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
        });

        // Queue payment confirmation email
        if (payment.invoice.project?.client) {
          queueEmail({
            type: 'payment_confirmation',
            priority: 'high',
            data: {
              to: payment.invoice.project.client.email,
              clientName: payment.invoice.project.client.name,
              invoiceNumber: payment.invoice.invoiceNumber,
              amount: Number(payment.invoice.amount),
              currency: 'IDR',
              projectTitle: payment.invoice.project.title,
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
            message: `${payment.invoice.project?.client?.name || 'Client'} has successfully paid invoice ${payment.invoice.invoiceNumber} for ${payment.invoice.project?.title || 'project'} - ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(payment.invoice.amount))}`,
            type: "SUCCESS" as const,
            entityId: payment.invoice.id,
            entityType: "INVOICE",
            actionUrl: `/admin/invoices?invoice=${payment.invoice.id}`,
          }));

          await prisma.notification.createMany({
            data: notifications,
          });
        }
      }
    }

    return NextResponse.json({
      orderId,
      midtransStatus: transactionStatus.transaction_status,
      paymentStatus,
      invoiceStatus,
      updated: needsUpdate,
      paidAt,
      transactionId: transactionStatus.transaction_id,
    });

  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { 
        error: "Failed to check payment status",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
