import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationCodeEmail } from "@/lib/email/services";

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength (at least 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Check if user is already verified
      if (existingUser.isActive) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }
      
      // If user exists but not active, delete old verification codes and allow re-registration
      await prisma.emailVerification.deleteMany({
        where: { userId: existingUser.id }
      });
      
      // Delete the unverified user to allow fresh registration
      await prisma.user.delete({
        where: { id: existingUser.id }
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

    // Create the user (inactive until verified)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split("@")[0],
        role: "CLIENT", // Default role for new signups
        isActive: false, // User is inactive until email is verified
        emailVerifications: {
          create: {
            email,
            code: verificationCode,
            expires: expiresAt,
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Send verification code email
    try {
      await sendVerificationCodeEmail({
        to: user.email!,
        userName: user.name || user.email!.split("@")[0],
        verificationCode: verificationCode,
        expiresIn: "10 minutes",
      }, { skipIfDisabled: false });
      
      console.log(`Verification code sent to ${email}: ${verificationCode}`);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      
      // Clean up: delete the user and verification code if email fails
      await prisma.user.delete({
        where: { id: user.id }
      });
      
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
      userId: user.id,
      requiresVerification: true,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
