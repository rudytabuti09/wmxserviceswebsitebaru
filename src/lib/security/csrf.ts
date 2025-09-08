import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

// CSRF Token configuration
const CSRF_CONFIG = {
  // Token length and expiration
  TOKEN_LENGTH: 32,
  TOKEN_EXPIRY: 60 * 60 * 1000, // 1 hour in milliseconds
  
  // Cookie settings
  COOKIE_NAME: '__Host-csrf-token',
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 60 * 60, // 1 hour in seconds
  },
  
  // Header names
  HEADER_NAME: 'X-CSRF-Token',
  META_TAG_NAME: 'csrf-token',
  
  // Methods that require CSRF protection
  PROTECTED_METHODS: ['POST', 'PUT', 'PATCH', 'DELETE'],
  
  // Paths that should be excluded from CSRF protection
  EXCLUDED_PATHS: [
    '/api/auth', // All NextAuth routes (callbacks, signin, etc.)
    '/auth', // Auth pages (signin, signup, etc.)
    '/api/payment/webhook', // Payment webhooks
    '/api/payment/create-token', // Payment token creation (has session auth)
    '/api/webhooks', // Other webhooks
    '/api/trpc', // tRPC endpoints - they have their own auth middleware
    '/api/upload', // Upload endpoints - they have their own auth middleware
    '/api/csrf', // CSRF token endpoint
  ],
};

interface CSRFToken {
  value: string;
  createdAt: number;
  userId?: string;
  sessionId?: string;
}

// In-memory storage for CSRF tokens (use Redis in production)
class CSRFTokenStore {
  private tokens: Map<string, CSRFToken> = new Map();

  generateToken(userId?: string, sessionId?: string): string {
    const tokenValue = nanoid(CSRF_CONFIG.TOKEN_LENGTH);
    const token: CSRFToken = {
      value: tokenValue,
      createdAt: Date.now(),
      userId,
      sessionId,
    };
    
    this.tokens.set(tokenValue, token);
    
    // Cleanup expired tokens periodically
    if (Math.random() < 0.1) { // 10% chance
      this.cleanup();
    }
    
    return tokenValue;
  }

  validateToken(tokenValue: string, userId?: string, sessionId?: string): boolean {
    const token = this.tokens.get(tokenValue);
    
    if (!token) {
      return false;
    }
    
    // Check if token is expired
    if (Date.now() - token.createdAt > CSRF_CONFIG.TOKEN_EXPIRY) {
      this.tokens.delete(tokenValue);
      return false;
    }
    
    // Validate user/session association if provided
    if (userId && token.userId && token.userId !== userId) {
      return false;
    }
    
    if (sessionId && token.sessionId && token.sessionId !== sessionId) {
      return false;
    }
    
    return true;
  }

  revokeToken(tokenValue: string): void {
    this.tokens.delete(tokenValue);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, token] of this.tokens.entries()) {
      if (now - token.createdAt > CSRF_CONFIG.TOKEN_EXPIRY) {
        this.tokens.delete(key);
      }
    }
  }

  // Revoke all tokens for a user
  revokeUserTokens(userId: string): void {
    for (const [key, token] of this.tokens.entries()) {
      if (token.userId === userId) {
        this.tokens.delete(key);
      }
    }
  }
}

const tokenStore = new CSRFTokenStore();

// Generate CSRF token for a request
export function generateCSRFToken(userId?: string, sessionId?: string): string {
  return tokenStore.generateToken(userId, sessionId);
}

// Validate CSRF token from request
export function validateCSRFToken(
  req: NextRequest,
  userId?: string,
  sessionId?: string
): { valid: boolean; error?: string } {
  // Skip validation for excluded paths
  const pathname = req.nextUrl.pathname;
  if (CSRF_CONFIG.EXCLUDED_PATHS.some(path => pathname.startsWith(path))) {
    return { valid: true };
  }

  // Only check CSRF for state-changing methods
  if (!CSRF_CONFIG.PROTECTED_METHODS.includes(req.method)) {
    return { valid: true };
  }

  // Get token from headers
  const headerToken = req.headers.get(CSRF_CONFIG.HEADER_NAME);
  
  // Get token from form data (for traditional form submissions)
  let formToken: string | null = null;
  const contentType = req.headers.get('content-type');
  
  if (contentType?.includes('application/x-www-form-urlencoded')) {
    // For form submissions, we'll need to parse the body
    // This is a simplified check - in practice, you might need to parse the body
  }

  const token = headerToken || formToken;
  
  if (!token) {
    return { valid: false, error: 'CSRF token missing' };
  }

  const isValid = tokenStore.validateToken(token, userId, sessionId);
  
  if (!isValid) {
    return { valid: false, error: 'Invalid or expired CSRF token' };
  }

  return { valid: true };
}

// Middleware function for CSRF protection
export async function applyCSRFProtection(req: NextRequest): Promise<NextResponse | null> {
  const validation = validateCSRFToken(req);
  
  if (!validation.valid) {
    return new NextResponse(
      JSON.stringify({
        error: validation.error || 'CSRF validation failed',
        code: 'CSRF_TOKEN_INVALID',
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  return null;
}

// Create CSRF token response with cookie
export function createCSRFTokenResponse(
  response: NextResponse,
  userId?: string,
  sessionId?: string
): NextResponse {
  const token = generateCSRFToken(userId, sessionId);
  
  // Set CSRF token as HTTP-only cookie
  response.cookies.set(CSRF_CONFIG.COOKIE_NAME, token, {
    ...CSRF_CONFIG.COOKIE_OPTIONS,
    secure: process.env.NODE_ENV === 'production',
  });
  
  // Also include token in response headers for client-side access
  response.headers.set('X-CSRF-Token', token);
  
  return response;
}

// Utility to get CSRF token from cookies
export function getCSRFTokenFromCookies(req: NextRequest): string | null {
  return req.cookies.get(CSRF_CONFIG.COOKIE_NAME)?.value || null;
}

// React hook for CSRF token management
export function getCSRFTokenForClient(): string {
  // This would be used in client-side code to get the CSRF token
  // from meta tags or make a request to get a new token
  if (typeof window !== 'undefined') {
    const metaTag = document.querySelector(`meta[name="${CSRF_CONFIG.META_TAG_NAME}"]`);
    return metaTag?.getAttribute('content') || '';
  }
  return '';
}

// API endpoint to generate CSRF token
export async function handleCSRFTokenRequest(req: NextRequest): Promise<NextResponse> {
  // Extract user/session info from request if available
  const userId = req.headers.get('x-user-id') || undefined;
  const sessionId = req.headers.get('x-session-id') || undefined;
  
  const token = generateCSRFToken(userId, sessionId);
  
  const response = NextResponse.json({
    token,
    expiresIn: CSRF_CONFIG.TOKEN_EXPIRY,
  });

  return createCSRFTokenResponse(response, userId, sessionId);
}

// Double Submit Cookie pattern
export function createDoubleSubmitToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateDoubleSubmitToken(cookieToken: string, headerToken: string): boolean {
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  // Simple constant-time comparison
  if (cookieToken.length !== headerToken.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    result |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
  }
  
  return result === 0;
}

// Revoke CSRF tokens (useful for logout)
export function revokeCSRFTokens(userId: string): void {
  tokenStore.revokeUserTokens(userId);
}

// CSRF token utilities for forms
export interface CSRFFormData {
  token: string;
  formAction: string;
  timestamp: number;
}

export function createCSRFFormToken(formAction: string, userId?: string): CSRFFormData {
  const token = generateCSRFToken(userId);
  
  return {
    token,
    formAction,
    timestamp: Date.now(),
  };
}

export function validateCSRFFormToken(
  formData: CSRFFormData,
  expectedAction: string,
  userId?: string
): boolean {
  // Validate token
  if (!tokenStore.validateToken(formData.token, userId)) {
    return false;
  }
  
  // Validate form action
  if (formData.formAction !== expectedAction) {
    return false;
  }
  
  // Check timestamp (prevent replay attacks)
  const maxAge = 30 * 60 * 1000; // 30 minutes
  if (Date.now() - formData.timestamp > maxAge) {
    return false;
  }
  
  return true;
}

export { CSRF_CONFIG, tokenStore };
export default applyCSRFProtection;
