import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { snap, MidtransTransactionRequest } from "@/lib/midtrans";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.error("Payment token creation failed: No session or user found");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    console.log("Creating payment token for user:", session.user.id, "role:", session.user.role);

    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    // Get invoice details
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        clientId: session.user.id, // Ensure user can only pay their own invoices
        status: "PENDING",
      },
      include: {
        project: true,
        client: true,
      },
    });

    if (!invoice) {
      console.error(`Invoice not found: ${invoiceId} for user: ${session.user.id}`);
      return NextResponse.json(
        { error: "Invoice not found or already paid" },
        { status: 404 }
      );
    }
    
    console.log("Found invoice:", invoice.id, "amount:", invoice.amount);

    // Create unique order ID for Midtrans
    const orderId = `WMX-${invoice.invoiceNumber}-${Date.now()}`;

    // Configure webhook notification URL
    const webhookUrl = `${process.env.NEXTAUTH_URL}/api/payment/webhook`;
    
    const transactionDetails: MidtransTransactionRequest = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(invoice.amount), // Midtrans requires integer
      },
      customer_details: {
        first_name: invoice.client.name?.split(" ")[0] || "Customer",
        last_name: invoice.client.name?.split(" ").slice(1).join(" ") || "",
        email: invoice.client.email,
      },
      item_details: [
        {
          id: invoice.id,
          name: `${invoice.project.title} - ${invoice.invoiceNumber}`,
          price: Math.round(invoice.amount),
          quantity: 1,
          category: "Digital Service",
        },
      ],
      callbacks: {
        finish: `${process.env.NEXTAUTH_URL}/client/payment?status=success&invoice=${invoice.id}`,
        error: `${process.env.NEXTAUTH_URL}/client/payment?status=error&invoice=${invoice.id}`,
        pending: `${process.env.NEXTAUTH_URL}/client/payment?status=pending&invoice=${invoice.id}`,
      },
      // Store webhook URL in custom fields for reference (Midtrans webhooks are usually configured in dashboard)
      custom_field1: webhookUrl,
      custom_field2: invoice.id,
      custom_field3: session.user.id,
    };

    // Create payment token
    console.log("Creating Midtrans transaction with details:", transactionDetails);
    const transaction = await snap.createTransaction(transactionDetails);
    console.log("Midtrans transaction created:", transaction);

    // Store the order ID in the database for tracking
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: invoice.amount,
        currency: invoice.currency,
        status: "PENDING",
        midtransOrderId: orderId,
      },
    });

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      orderId,
    });

  } catch (error) {
    console.error("Payment token creation error:", error);
    // Return more specific error information in development
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      { 
        error: "Failed to create payment token",
        ...(isDev && { details: error instanceof Error ? error.message : String(error) })
      },
      { status: 500 }
    );
  }
}
