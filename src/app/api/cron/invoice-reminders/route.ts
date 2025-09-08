import { NextRequest, NextResponse } from "next/server";
import { processPendingInvoiceReminders } from "@/lib/email/hooks";

/**
 * API route for processing invoice reminders
 * Can be triggered by:
 * 1. Vercel Cron Jobs (https://vercel.com/docs/cron-jobs)
 * 2. External cron services (cron-job.org, EasyCron, etc.)
 * 3. GitHub Actions scheduled workflows
 * 
 * Example Vercel cron configuration in vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/invoice-reminders",
 *       "schedule": "0 9 * * *"
 *     }
 *   ]
 * }
 */

export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication for cron job
    // You can use a secret token in headers or query params
    const authHeader = request.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Starting invoice reminder processing...");
    
    // Process pending invoice reminders
    const result = await processPendingInvoiceReminders();
    
    console.log(`Invoice reminder processing complete:`, result);

    return NextResponse.json({
      success: true,
      message: "Invoice reminders processed successfully",
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to process invoice reminders",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
