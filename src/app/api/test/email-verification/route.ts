import { NextRequest, NextResponse } from "next/server";
import { sendVerificationCodeEmail } from "@/lib/email/services";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const testCode = "123456";
    
    const result = await sendVerificationCodeEmail({
      to: email,
      userName: "Test User",
      verificationCode: testCode,
      expiresIn: "10 minutes"
    });

    return NextResponse.json({
      success: true,
      message: "Test verification email sent successfully",
      result,
    });
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { 
        error: "Failed to send test email",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
