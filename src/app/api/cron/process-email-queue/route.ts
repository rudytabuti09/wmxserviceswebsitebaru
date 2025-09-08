import { NextRequest, NextResponse } from "next/server";
import { processEmailQueue } from "@/lib/email/services";

export async function GET(request: NextRequest) {
  try {
    // Verify that this is a legitimate cron job request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // In production, verify the cron secret
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Process the email queue
    const result = await processEmailQueue();

    return NextResponse.json({
      success: true,
      message: "Email queue processed successfully",
      processed: result.processed,
      skipped: result.skipped,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Email queue processing error:", error);
    return NextResponse.json(
      { error: "Failed to process email queue" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Allow POST requests as well for flexibility
  return GET(request);
}
