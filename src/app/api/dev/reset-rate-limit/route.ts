import { NextRequest, NextResponse } from "next/server";
import { SECURITY_CONFIG } from "@/lib/security/config";
import { resetRateLimit } from "@/lib/security/rate-limit";

// This endpoint should only be available in development
export async function POST(request: NextRequest) {
  // Only allow in development
  if (!SECURITY_CONFIG.ENVIRONMENT.isDevelopment) {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 404 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'all', 'payment', 'auth', etc.
    const ip = searchParams.get('ip'); // specific IP to reset
    
    let result;
    if (ip && type) {
      // Reset specific IP for specific type
      const key = `${type}:${ip}`;
      result = resetRateLimit(key);
    } else if (type) {
      // Reset all entries for specific type
      result = resetRateLimit(undefined, `${type}:`);
    } else {
      // Reset everything
      result = resetRateLimit();
    }
    
    console.log("Rate limit reset requested in development mode", { type, ip, result });
    
    return NextResponse.json({
      success: true,
      message: type ? `Rate limits reset for ${type}` : "All rate limits have been reset",
      type: type || 'all',
      ip: ip || 'all',
      resetCount: typeof result === 'number' ? result : 1,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error("Error resetting rate limits:", error);
    return NextResponse.json(
      { error: "Failed to reset rate limits" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Only allow in development
  if (!SECURITY_CONFIG.ENVIRONMENT.isDevelopment) {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Rate limit reset endpoint",
    usage: "Send POST request to reset rate limits in development",
    environment: SECURITY_CONFIG.ENVIRONMENT,
    rateLimits: {
      auth: SECURITY_CONFIG.RATE_LIMITS.AUTH,
      default: SECURITY_CONFIG.RATE_LIMITS.DEFAULT,
      admin: SECURITY_CONFIG.RATE_LIMITS.ADMIN,
    },
  });
}
