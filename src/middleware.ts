import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { securityMiddlewares } from "./lib/security/middleware";
import { logSecurityEvent, SecurityEventType } from "./lib/security/monitoring";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply security middleware first
  let securityResponse: NextResponse | null = null;
  
  // Choose appropriate security middleware based on path
  // API routes should be checked first to take precedence
  if (pathname.startsWith('/api/')) {
    securityResponse = await securityMiddlewares.api(request);
  } else if (pathname.startsWith('/admin')) {
    securityResponse = await securityMiddlewares.admin(request);
  } else if (pathname.startsWith('/client/payment')) {
    securityResponse = await securityMiddlewares.payment(request);
  } else if (pathname.includes('upload') || pathname.includes('portfolio')) {
    securityResponse = await securityMiddlewares.upload(request);
  } else {
    // Public pages
    securityResponse = await securityMiddlewares.public(request);
  }

  // If security middleware blocked the request, return early
  if (securityResponse && (securityResponse.status === 403 || securityResponse.status === 429)) {
    return securityResponse;
  }

  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Public routes that don't need authentication
  const publicRoutes = ['/', '/services', '/portfolio', '/contact', '/privacy', '/terms'];
  const authRoutes = ['/auth/signin', '/auth/signup', '/auth/verify-request', '/auth/error'];
  const apiRoutes = ['/api/'];
  
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isApiRoute = apiRoutes.some(route => pathname.startsWith(route));

  // If it's a public route or auth route, apply security headers and allow access
  if (isPublicRoute || isAuthRoute || isApiRoute) {
    return securityResponse || NextResponse.next();
  }

  // Check if user is authenticated for protected routes
  if (!token) {
    // Log unauthorized access attempt
    logSecurityEvent({
      type: SecurityEventType.UNAUTHORIZED_ACCESS,
      severity: 'medium',
      source: {
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined,
      },
      details: {
        endpoint: pathname,
        method: request.method,
        description: 'Attempted access to protected route without authentication',
      },
    });

    const url = request.nextUrl.clone();
    url.pathname = '/auth/signin';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    if (token.role !== "ADMIN") {
      // Log privilege escalation attempt
      logSecurityEvent({
        type: SecurityEventType.PRIVILEGE_ESCALATION,
        severity: 'high',
        source: {
          ip: getClientIP(request),
          userAgent: request.headers.get('user-agent') || undefined,
          userId: token.sub,
        },
        details: {
          endpoint: pathname,
          method: request.method,
          description: `User with role ${token.role} attempted to access admin area`,
          userRole: token.role as string,
          attemptedAccess: 'admin',
        },
      });
      
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Client routes protection
  if (pathname.startsWith("/client")) {
    if (token.role !== "CLIENT" && token.role !== "ADMIN") {
      // Log unauthorized access
      logSecurityEvent({
        type: SecurityEventType.UNAUTHORIZED_ACCESS,
        severity: 'medium',
        source: {
          ip: getClientIP(request),
          userAgent: request.headers.get('user-agent') || undefined,
          userId: token.sub,
        },
        details: {
          endpoint: pathname,
          method: request.method,
          description: `User with role ${token.role} attempted to access client area`,
          userRole: token.role as string,
          attemptedAccess: 'client',
        },
      });
      
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Log successful authentication
  if (token && !pathname.startsWith('/api/')) {
    logSecurityEvent({
      type: SecurityEventType.SUCCESSFUL_LOGIN,
      severity: 'low',
      source: {
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined,
        userId: token.sub,
      },
      details: {
        endpoint: pathname,
        method: request.method,
        description: 'Successful access to protected route',
        userRole: token.role as string,
      },
    });
  }

  return securityResponse || NextResponse.next();
}

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip');
  
  return cfIP || forwarded?.split(',')[0]?.trim() || realIP || 'unknown';
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
