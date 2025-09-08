import { NextRequest, NextResponse } from 'next/server';
import { SECURITY_CONFIG } from './config';

export interface CSPDirectives {
  'default-src'?: string[];
  'script-src'?: string[];
  'script-src-elem'?: string[];
  'script-src-attr'?: string[];
  'style-src'?: string[];
  'style-src-elem'?: string[];
  'style-src-attr'?: string[];
  'img-src'?: string[];
  'font-src'?: string[];
  'connect-src'?: string[];
  'media-src'?: string[];
  'object-src'?: string[];
  'child-src'?: string[];
  'frame-src'?: string[];
  'worker-src'?: string[];
  'frame-ancestors'?: string[];
  'form-action'?: string[];
  'base-uri'?: string[];
  'manifest-src'?: string[];
  'prefetch-src'?: string[];
  'navigate-to'?: string[];
  'report-uri'?: string[];
  'report-to'?: string[];
  'require-trusted-types-for'?: string[];
  'trusted-types'?: string[];
  'upgrade-insecure-requests'?: boolean;
  'block-all-mixed-content'?: boolean;
  'plugin-types'?: string[];
  'sandbox'?: string[];
  'disown-opener'?: boolean;
}

// Generate nonce for inline scripts and styles
export function generateNonce(): string {
  // Use Web Crypto API for Edge Runtime compatibility
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// Build CSP header string from directives
export function buildCSPHeader(directives: CSPDirectives, nonce?: string): string {
  const policies: string[] = [];
  const isDevelopment = process.env.NODE_ENV === 'development';

  for (const [directive, value] of Object.entries(directives)) {
    if (value === undefined || value === null) continue;

    const kebabDirective = directive.replace(/([A-Z])/g, '-$1').toLowerCase();

    if (typeof value === 'boolean') {
      if (value) {
        policies.push(kebabDirective);
      }
    } else if (Array.isArray(value)) {
      if (value.length > 0) {
        let directiveValue = value.join(' ');
        
        // For Next.js compatibility, we need to handle inline scripts and styles properly
        // When nonce is present, unsafe-inline is ignored, so we need to ensure proper handling
        if (isDevelopment || process.env.NODE_ENV !== 'production') {
          if (directive === 'script-src' && !directiveValue.includes("'unsafe-eval'")) {
            directiveValue = `'self' 'unsafe-eval' 'unsafe-inline' ${directiveValue.replace("'self'", '').trim()}`;
          }
          if (directive === 'script-src-elem' && !directiveValue.includes("'unsafe-inline'")) {
            directiveValue = `'self' 'unsafe-inline' ${directiveValue.replace("'self'", '').trim()}`;
          }
          if (directive === 'style-src' && !directiveValue.includes("'unsafe-inline'")) {
            directiveValue = `'self' 'unsafe-inline' ${directiveValue.replace("'self'", '').trim()}`;
          }
        } else {
          // In production with nonces, make sure we include unsafe-inline as fallback
          if (directive === 'script-src') {
            directiveValue = `'self' 'unsafe-inline' 'unsafe-eval' ${directiveValue.replace("'self'", '').trim()}`;
          }
          if (directive === 'style-src') {
            directiveValue = `'self' 'unsafe-inline' ${directiveValue.replace("'self'", '').trim()}`;
          }
        }
        
        // Add nonce to script-src and style-src if needed (production only)
        if (nonce && process.env.NODE_ENV === 'production' && (directive === 'script-src' || directive === 'style-src')) {
          // Don't add nonce as it overrides unsafe-inline, causing issues with Next.js
          // directiveValue += ` 'nonce-${nonce}'`;
        }
        
        policies.push(`${kebabDirective} ${directiveValue}`);
      }
    } else {
      policies.push(`${kebabDirective} ${value}`);
    }
  }

  return policies.join('; ');
}

// Get environment-specific CSP directives
export function getCSPDirectives(isDevelopment: boolean = false): CSPDirectives {
  const baseDirectives = SECURITY_CONFIG.CSP.directives;
  
  if (isDevelopment) {
    // More permissive settings for development
    return {
      'default-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'", 'data:', 'blob:'],
      'script-src': [
        "'self'",
        "'unsafe-eval'",
        "'unsafe-inline'",
        'http://localhost:*',
        'https://localhost:*',
        'ws://localhost:*',
        'wss://localhost:*',
        'https://app.midtrans.com',
        'https://app.sandbox.midtrans.com',
        'https://js.stripe.com',
        'https://checkout.stripe.com',
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        ...baseDirectives.scriptSrc.filter(src => !src.startsWith("'") && !src.includes('localhost') && !src.includes('midtrans') && !src.includes('stripe') && !src.includes('google')),
      ],
      'script-src-elem': [
        "'self'",
        "'unsafe-inline'",
        'http://localhost:*',
        'https://localhost:*',
        'https://app.midtrans.com',
        'https://app.sandbox.midtrans.com',
        'https://js.stripe.com',
        'https://checkout.stripe.com',
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        ...baseDirectives.scriptSrc.filter(src => !src.startsWith("'") && !src.includes('localhost') && !src.includes('midtrans') && !src.includes('stripe') && !src.includes('google')),
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'http://localhost:*',
        'https://localhost:*',
        'data:',
        ...baseDirectives.styleSrc.filter(src => !src.startsWith("'")),
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'http:',
        'https:',
        'http://localhost:*',
        'https://localhost:*',
        ...baseDirectives.imgSrc.filter(src => !src.startsWith("'") && !src.includes(':')),
      ],
      'font-src': ["'self'", 'data:', 'blob:', ...baseDirectives.fontSrc.filter(src => !src.startsWith("'"))],
      'connect-src': [
        "'self'",
        'http://localhost:*',
        'https://localhost:*',
        'ws://localhost:*',
        'wss://localhost:*',
        ...baseDirectives.connectSrc.filter(src => !src.startsWith("'")),
      ],
      'media-src': ["'self'", 'data:', 'blob:', '*'],
      'object-src': ["'self'"],
      'child-src': ["'self'", 'blob:'],
      'frame-src': [
        "'self'",
        'https://app.midtrans.com',
        'https://app.sandbox.midtrans.com',
        'https://js.stripe.com',
        'https://checkout.stripe.com',
        ...baseDirectives.frameSrc.filter(src => !src.startsWith("'") && !src.includes('midtrans') && !src.includes('stripe')),
      ],
      'worker-src': ["'self'", 'blob:', 'data:'],
      'frame-ancestors': ["'self'"],
      'form-action': ["'self'"],
      'base-uri': ["'self'"],
      'manifest-src': ["'self'"],
    };
  }

  // Production CSP directives
  return {
    'default-src': baseDirectives.defaultSrc,
    'script-src': baseDirectives.scriptSrc,
    'style-src': baseDirectives.styleSrc,
    'img-src': baseDirectives.imgSrc,
    'font-src': baseDirectives.fontSrc,
    'connect-src': baseDirectives.connectSrc,
    'media-src': ["'self'", 'https:'],
    'object-src': baseDirectives.objectSrc,
    'child-src': ["'none'"],
    'frame-src': baseDirectives.frameSrc,
    'worker-src': ["'self'"],
    'frame-ancestors': baseDirectives.frameAncestors,
    'form-action': baseDirectives.formAction,
    'base-uri': baseDirectives.baseUri,
    'manifest-src': ["'self'"],
    'upgrade-insecure-requests': process.env.NODE_ENV === 'production',
    'block-all-mixed-content': process.env.NODE_ENV === 'production',
  };
}

// Create CSP middleware
export function createCSPMiddleware(customDirectives?: Partial<CSPDirectives>) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    const isDevelopment = SECURITY_CONFIG.ENVIRONMENT.isDevelopment;
    const nonce = generateNonce();
    
    // Get base directives
    const baseDirectives = getCSPDirectives(isDevelopment);
    
    // Merge with custom directives if provided
    const directives = customDirectives 
      ? { ...baseDirectives, ...customDirectives }
      : baseDirectives;

    // Build CSP header
    const cspHeader = buildCSPHeader(directives, nonce);

    // Create response with CSP headers
    const response = new NextResponse(null, {
      headers: {
        'Content-Security-Policy': cspHeader,
        'X-Content-Security-Policy': cspHeader, // Legacy support
        'X-WebKit-CSP': cspHeader, // Legacy support
        'X-CSP-Nonce': nonce, // Pass nonce to be used in templates
      },
    });

    return response;
  };
}

// Apply CSP headers to a response
export function applyCSPHeaders(
  response: NextResponse,
  customDirectives?: Partial<CSPDirectives>,
  nonce?: string
): NextResponse {
  const isDevelopment = SECURITY_CONFIG.ENVIRONMENT.isDevelopment;
  const cspNonce = nonce || generateNonce();
  
  // Get base directives
  const baseDirectives = getCSPDirectives(isDevelopment);
  
  // Merge with custom directives if provided
  const directives = customDirectives 
    ? { ...baseDirectives, ...customDirectives }
    : baseDirectives;

  // Build CSP header
  const cspHeader = buildCSPHeader(directives, cspNonce);

  // Set headers
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Content-Security-Policy', cspHeader);
  response.headers.set('X-WebKit-CSP', cspHeader);
  response.headers.set('X-CSP-Nonce', cspNonce);

  return response;
}

// CSP violation reporting endpoint handler
export async function handleCSPReport(req: NextRequest): Promise<NextResponse> {
  try {
    const report = await req.json();
    
    // Log CSP violation
    console.error('CSP Violation Report:', {
      timestamp: new Date().toISOString(),
      userAgent: req.headers.get('user-agent'),
      ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
      report: report,
    });

    // In production, you might want to send this to a monitoring service
    // like Sentry, DataDog, or a custom logging service
    
    if (process.env.CSP_REPORT_WEBHOOK) {
      try {
        await fetch(process.env.CSP_REPORT_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'csp_violation',
            timestamp: new Date().toISOString(),
            userAgent: req.headers.get('user-agent'),
            ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
            report,
          }),
        });
      } catch (webhookError) {
        console.error('Failed to send CSP report to webhook:', webhookError);
      }
    }

    return new NextResponse('OK', { status: 204 });
  } catch (error) {
    console.error('Error handling CSP report:', error);
    return new NextResponse('Bad Request', { status: 400 });
  }
}

  // Page-specific Permissions Policy configurations
export const PAGE_PERMISSIONS_CONFIGS = {
  // Admin pages
  admin: {
    'clipboard-read': ['self'],
    'clipboard-write': ['self'],
  },

  // Payment pages need clipboard access for Midtrans functionality
  payment: {
    'clipboard-read': ['*'],
    'clipboard-write': ['*'],
  },

  // Public pages (more restrictive)
  public: {
    'clipboard-read': [],
    'clipboard-write': [],
  },
} as const;

// Page-specific CSP configurations
export const PAGE_CSP_CONFIGS = {
  // Admin pages might need more permissive policies
  admin: {
    'script-src': [
      "'self'",
      "'unsafe-inline'", // For admin dashboards that might use inline scripts
      'https://cdn.jsdelivr.net', // For admin libraries
      'https://unpkg.com', // For admin libraries
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'https://cdn.jsdelivr.net',
    ],
  },

  // Payment pages need stripe/midtrans integration
  payment: {
    'script-src': [
      "'self'",
      'https://js.stripe.com',
      'https://checkout.stripe.com',
      'https://app.midtrans.com',
      'https://app.sandbox.midtrans.com',
    ],
    'script-src-elem': [
      "'self'",
      "'unsafe-inline'",
      'https://js.stripe.com',
      'https://checkout.stripe.com',
      'https://app.midtrans.com',
      'https://app.sandbox.midtrans.com',
    ],
    'frame-src': [
      'https://checkout.stripe.com',
      'https://js.stripe.com',
      'https://app.midtrans.com',
      'https://app.sandbox.midtrans.com',
    ],
    'connect-src': [
      "'self'",
      'https://api.stripe.com',
      'https://api.midtrans.com',
      'https://api.sandbox.midtrans.com',
    ],
  },

  // File upload pages
  upload: {
    'connect-src': [
      "'self'",
      process.env.NEXT_PUBLIC_R2_URL || 'https://cdn.wmx-services.com',
      'https://*.amazonaws.com', // For S3 uploads
    ],
  },

  // Public pages (more restrictive)
  public: {
    'script-src': [
      "'self'",
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
    ],
    'connect-src': [
      "'self'",
      'https://www.google-analytics.com',
    ],
  },
} as const;

// Get CSP config for specific page type
export function getPageCSPConfig(pageType: keyof typeof PAGE_CSP_CONFIGS): Partial<CSPDirectives> {
  return PAGE_CSP_CONFIGS[pageType] || {};
}

// Utility to check if a URL is allowed by CSP
export function isURLAllowedByCSP(url: string, directive: keyof CSPDirectives): boolean {
  const directives = getCSPDirectives();
  const allowedSources = directives[directive];

  if (!allowedSources || !Array.isArray(allowedSources)) {
    return false;
  }

  // Check if URL matches any of the allowed sources
  for (const source of allowedSources) {
    if (source === "'self'" && url.startsWith(process.env.NEXT_PUBLIC_APP_URL || '')) {
      return true;
    }
    if (source === 'https:' && url.startsWith('https://')) {
      return true;
    }
    if (source === 'data:' && url.startsWith('data:')) {
      return true;
    }
    if (typeof source === 'string' && url.startsWith(source)) {
      return true;
    }
  }

  return false;
}

export default createCSPMiddleware;
