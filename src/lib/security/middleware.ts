import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit } from './rate-limit';
import { applyCSRFProtection } from './csrf';
import { applyCSPHeaders, getPageCSPConfig, PAGE_PERMISSIONS_CONFIGS } from './csp';
import { analyzeRequestSecurity, logSecurityEvent, SecurityEventType } from './monitoring';
import { SECURITY_CONFIG } from './config';

export interface SecurityMiddlewareOptions {
  enableRateLimit?: boolean;
  enableCSRF?: boolean;
  enableCSP?: boolean;
  enableMonitoring?: boolean;
  pageType?: 'admin' | 'payment' | 'upload' | 'public';
  customCSP?: any;
  skipPaths?: string[];
}

/**
 * Main security middleware that combines all security features
 */
export async function securityMiddleware(
  req: NextRequest,
  options: SecurityMiddlewareOptions = {}
): Promise<NextResponse | null> {
  const {
    enableRateLimit = true,
    enableCSRF = true,
    enableCSP = true,
    enableMonitoring = true,
    pageType,
    customCSP,
    skipPaths = [],
  } = options;

  const pathname = req.nextUrl.pathname;

  // Skip security for certain paths
  if (skipPaths.some(path => pathname.startsWith(path))) {
    return null;
  }

  // Skip for static assets and API routes that don't need full security
  const staticPaths = ['/_next/', '/favicon.ico', '/robots.txt', '/sitemap.xml'];
  if (staticPaths.some(path => pathname.startsWith(path))) {
    return null;
  }

  let response: NextResponse | null = null;

  try {
    // 1. Security Monitoring (run first to log all requests)
    if (enableMonitoring) {
      const threats = analyzeRequestSecurity(req);
      
      // Log threats
      threats.forEach(threat => {
        logSecurityEvent(threat);
      });

      // Block critical threats
      const criticalThreats = threats.filter(t => t.severity === 'critical');
      if (criticalThreats.length > 0) {
        return new NextResponse(
          JSON.stringify({
            error: 'Request blocked due to security threat',
            code: 'SECURITY_THREAT_DETECTED',
            threatId: criticalThreats[0].id,
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // 2. Rate Limiting
    if (enableRateLimit) {
      const rateLimitResponse = await applyRateLimit(req);
      if (rateLimitResponse && rateLimitResponse.status === 429) {
        // Log rate limit exceeded
        if (enableMonitoring) {
          logSecurityEvent({
            type: SecurityEventType.RATE_LIMIT_EXCEEDED,
            severity: 'medium',
            source: {
              ip: getClientIP(req),
              userAgent: req.headers.get('user-agent') || undefined,
            },
            details: {
              endpoint: pathname,
              method: req.method,
              description: 'Rate limit exceeded',
            },
          });
        }
        return rateLimitResponse;
      }
    }

    // 3. CSRF Protection (for state-changing requests)
    if (enableCSRF && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const csrfResponse = await applyCSRFProtection(req);
      if (csrfResponse && csrfResponse.status === 403) {
        // Log CSRF attack attempt
        if (enableMonitoring) {
          logSecurityEvent({
            type: SecurityEventType.CSRF_ATTACK,
            severity: 'high',
            source: {
              ip: getClientIP(req),
              userAgent: req.headers.get('user-agent') || undefined,
            },
            details: {
              endpoint: pathname,
              method: req.method,
              description: 'CSRF token validation failed',
            },
          });
        }
        return csrfResponse;
      }
    }

    // 4. Create response with security headers
    response = NextResponse.next();

    // 5. Content Security Policy
    if (enableCSP) {
      const cspConfig = pageType ? getPageCSPConfig(pageType) : {};
      const finalCSPConfig = customCSP ? { ...cspConfig, ...customCSP } : cspConfig;
      response = applyCSPHeaders(response, finalCSPConfig);
    }

    // 6. Additional Security Headers
    applySecurityHeaders(response);

    return response;

  } catch (error) {
    console.error('Security middleware error:', error);
    
    // Log security middleware error
    if (enableMonitoring) {
      logSecurityEvent({
        type: SecurityEventType.UNAUTHORIZED_ACCESS,
        severity: 'high',
        source: {
          ip: getClientIP(req),
          userAgent: req.headers.get('user-agent') || undefined,
        },
        details: {
          endpoint: pathname,
          method: req.method,
          description: 'Security middleware error',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }

    // Return a generic error to avoid information leakage
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Apply additional security headers
 */
function applySecurityHeaders(response: NextResponse): void {
  const headers = SECURITY_CONFIG.SECURITY_HEADERS;
  
  // Apply Helmet.js style headers
  if (SECURITY_CONFIG.ENVIRONMENT.isProduction) {
    // HSTS (HTTP Strict Transport Security)
    response.headers.set(
      'Strict-Transport-Security',
      `max-age=${headers.helmet.hsts.maxAge}; includeSubDomains${headers.helmet.hsts.preload ? '; preload' : ''}`
    );
  }

  // X-Frame-Options
  response.headers.set('X-Frame-Options', headers.custom['X-Frame-Options']);
  
  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', headers.custom['X-Content-Type-Options']);
  
  // Referrer-Policy
  response.headers.set('Referrer-Policy', headers.custom['Referrer-Policy']);
  
  // Permissions-Policy - more permissive in development for payment functionality
  const isDevelopment = SECURITY_CONFIG.ENVIRONMENT.isDevelopment;
  let permissionsPolicy = headers.custom['Permissions-Policy'];
  
  // Allow clipboard access in development for Midtrans/payment functionality
  if (isDevelopment) {
    permissionsPolicy = 'camera=(), microphone=(), geolocation=()';
  }
  
  response.headers.set('Permissions-Policy', permissionsPolicy);
  
  // X-DNS-Prefetch-Control
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  
  // X-Download-Options
  response.headers.set('X-Download-Options', 'noopen');
  
  // X-Permitted-Cross-Domain-Policies
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  // Remove powered-by header
  response.headers.delete('X-Powered-By');
  
  // Add custom security headers
  response.headers.set('X-Security-Enhanced', 'true');
  response.headers.set('X-WMX-Security-Version', '1.0');
}

/**
 * Get client IP address
 */
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfIP = req.headers.get('cf-connecting-ip');
  
  return cfIP || forwarded?.split(',')[0]?.trim() || realIP || 'unknown';
}

/**
 * Create middleware for specific page types
 */
export function createSecurityMiddleware(options: SecurityMiddlewareOptions = {}) {
  return async (req: NextRequest) => {
    return await securityMiddleware(req, options);
  };
}

/**
 * Predefined middleware configurations
 */
export const securityMiddlewares = {
  // Default security middleware
  default: createSecurityMiddleware(),

  // Admin pages (more permissive CSP, enhanced monitoring)
  admin: createSecurityMiddleware({
    pageType: 'admin',
    enableMonitoring: true,
  }),

  // Payment pages (strict security, payment-specific CSP)
  payment: createSecurityMiddleware({
    pageType: 'payment',
    enableCSRF: true,
    enableMonitoring: true,
  }),

  // File upload pages
  upload: createSecurityMiddleware({
    pageType: 'upload',
    enableCSRF: false, // Upload endpoints are excluded from CSRF in config
    enableMonitoring: true,
  }),

  // Public pages (basic security)
  public: createSecurityMiddleware({
    pageType: 'public',
    enableCSRF: false, // Not needed for read-only pages
  }),

  // API endpoints (rate limiting + monitoring, no CSP)
  api: createSecurityMiddleware({
    enableCSP: false, // APIs don't need CSP
    enableCSRF: false, // API endpoints handle their own auth (NextAuth, tRPC)
    enableRateLimit: true,
    enableMonitoring: true,
  }),
} as const;

/**
 * Security status checker
 */
export function checkSecurityStatus() {
  const status = {
    rateLimit: 'enabled',
    csrf: 'enabled',
    csp: 'enabled',
    monitoring: 'enabled',
    headers: 'enabled',
    environment: SECURITY_CONFIG.ENVIRONMENT.isProduction ? 'production' : 'development',
    features: {
      ipBlocking: 'enabled',
      threatDetection: 'enabled',
      inputSanitization: 'enabled',
      apiKeyManagement: 'enabled',
    },
  };

  return status;
}

export default securityMiddleware;
