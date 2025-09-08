import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email/services";

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json();

    // Validate input
    if (!userId || !code) {
      return NextResponse.json(
        { error: "User ID and verification code are required" },
        { status: 400 }
      );
    }

    // Find the verification record
    const verification = await prisma.emailVerification.findFirst({
      where: {
        userId: userId,
        code: code,
        verified: false,
      },
      include: {
        user: true,
      },
    });

    if (!verification) {
      // Check if there's any verification for this user to provide better error messages
      const anyVerification = await prisma.emailVerification.findFirst({
        where: { userId: userId },
      });

      if (!anyVerification) {
        return NextResponse.json(
          { error: "No verification request found for this user" },
          { status: 404 }
        );
      }

      if (anyVerification.verified) {
        return NextResponse.json(
          { error: "Email already verified" },
          { status: 400 }
        );
      }

      // Increment attempts for wrong code
      await prisma.emailVerification.update({
        where: { id: anyVerification.id },
        data: { attempts: { increment: 1 } },
      });

      // Check if too many attempts
      if (anyVerification.attempts >= 4) { // Will be 5 after this attempt
        return NextResponse.json(
          { error: "Too many failed attempts. Please request a new code." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { 
          error: "Invalid verification code",
          attemptsRemaining: 5 - (anyVerification.attempts + 1)
        },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (new Date() > verification.expires) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 410 }
      );
    }

    // Check attempts
    if (verification.attempts >= 5) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new code." },
        { status: 429 }
      );
    }

    // Mark verification as complete and activate user
    await prisma.$transaction(async (tx) => {
      // Mark verification as verified
      await tx.emailVerification.update({
        where: { id: verification.id },
        data: { verified: true },
      });

      // Activate the user and mark email as verified
      await tx.user.update({
        where: { id: userId },
        data: {
          isActive: true,
          emailVerified: new Date(),
        },
      });
    });

    // Send welcome email
    try {
      await sendWelcomeEmail({
        to: verification.user.email!,
        userName: verification.user.name || verification.user.email!.split("@")[0],
        userRole: verification.user.role as "CLIENT" | "ADMIN",
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/signin`,
      }, { skipIfDisabled: true });
    } catch (emailError) {
      // Log error but don't fail the verification
      console.error("Failed to send welcome email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now sign in.",
      user: {
        id: verification.user.id,
        email: verification.user.email,
        name: verification.user.name,
        role: verification.user.role,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}

// Resend verification code
export async function PUT(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId && !email) {
      return NextResponse.json(
        { error: "User ID or email is required" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findFirst({
      where: userId ? { id: userId } : { email: email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.isActive && user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // Delete old verification codes
    await prisma.emailVerification.deleteMany({
      where: { userId: user.id },
    });

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

    // Create new verification record
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        email: user.email!,
        code: verificationCode,
        expires: expiresAt,
      },
    });

    // Import the function at the top of the file
    const { sendVerificationCodeEmail } = await import("@/lib/email/services");
    
    // Send new verification code
    try {
      await sendVerificationCodeEmail({
        to: user.email!,
        userName: user.name || user.email!.split("@")[0],
        verificationCode: verificationCode,
        expiresIn: "10 minutes",
      }, { skipIfDisabled: false });
      
      console.log(`New verification code sent to ${user.email}: ${verificationCode}`);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      
      // Clean up the verification code if email fails
      await prisma.emailVerification.deleteMany({
        where: { userId: user.id },
      });
      
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "New verification code sent to your email",
      userId: user.id,
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification code" },
      { status: 500 }
    );
  }
}
