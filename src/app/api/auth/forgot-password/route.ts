import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email/services";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Store reset token (you'll need to add these fields to User model)
      await prisma.passwordResetToken.create({
        data: {
          token: resetToken,
          email: user.email,
          expires: resetTokenExpiry,
        },
      });

      // Send reset email
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
      
      await sendPasswordResetEmail({
        to: user.email,
        userName: user.name || "User",
        resetUrl,
        expirationTime: "1 hour",
      }, { skipIfDisabled: true });

      // Log the password reset attempt
      await prisma.emailLog.create({
        data: {
          userId: user.id,
          recipient: user.email,
          type: "PASSWORD_RESET",
          status: "SENT",
          sentAt: new Date(),
        },
      }).catch(err => console.error("Failed to log email:", err));
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}
