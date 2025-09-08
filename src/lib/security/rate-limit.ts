import { NextRequest, NextResponse } from 'next/server';
import { SECURITY_CONFIG } from './config';

// In-memory store for rate limiting (in production, use Redis)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class InMemoryStore {
  private store: Map<string, RateLimitEntry> = new Map();

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (existing && now < existing.resetTime) {
      existing.count++;
      return existing;
    }

    // Reset or create new entry
    const resetTime = now + windowMs;
    const entry = { count: 1, resetTime };
    this.store.set(key, entry);

    // Cleanup expired entries periodically
    if (Math.random() < 0.01) { // 1% chance to cleanup
      this.cleanup();
    }

    return entry;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  resetAll(): void {
    this.store.clear();
  }

  resetByPrefix(prefix: string): number {
    let deleted = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        deleted++;
      }
    }
    return deleted;
  }
}

// Global store instance
const globalStore = new InMemoryStore();

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
  keyGenerator?: (req: NextRequest) => string;
  skip?: (req: NextRequest) => boolean;
  onLimitReached?: (req: NextRequest, key: string) => void;
}

export function createRateLimit(config: RateLimitConfig) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    // Check if we should skip this request
    if (config.skip && config.skip(req)) {
      return null;
    }

    // Generate unique key for this request
    const key = config.keyGenerator ? config.keyGenerator(req) : getDefaultKey(req);

    try {
      // Increment counter
      const { count, resetTime } = await globalStore.increment(key, config.windowMs);

      // Add rate limit headers
      const headers = new Headers();
      
      if (config.standardHeaders) {
        headers.set('RateLimit-Limit', config.max.toString());
        headers.set('RateLimit-Remaining', Math.max(0, config.max - count).toString());
        headers.set('RateLimit-Reset', new Date(resetTime).toISOString());
      }

      if (config.legacyHeaders) {
        headers.set('X-RateLimit-Limit', config.max.toString());
        headers.set('X-RateLimit-Remaining', Math.max(0, config.max - count).toString());
        headers.set('X-RateLimit-Reset', Math.floor(resetTime / 1000).toString());
      }

      // Check if limit exceeded
      if (count > config.max) {
        // Call onLimitReached callback if provided
        if (config.onLimitReached) {
          config.onLimitReached(req, key);
        }

        headers.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString());

        return new NextResponse(
          JSON.stringify({
            error: config.message,
            limit: config.max,
            remaining: 0,
            reset: new Date(resetTime).toISOString(),
          }),
          {
            status: 429,
            headers,
          }
        );
      }

      // Attach headers to successful response (will be handled by middleware)
      return new NextResponse(null, { headers });

    } catch (error) {
      console.error('Rate limiting error:', error);
      // On error, allow the request to proceed
      return null;
    }
  };
}

function getDefaultKey(req: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown';
  
  return `${ip}:${req.nextUrl.pathname}`;
}

// Create different rate limiters for different endpoint types
export const rateLimiters = {
  default: createRateLimit(SECURITY_CONFIG.RATE_LIMITS.DEFAULT),
  
  auth: createRateLimit({
    ...SECURITY_CONFIG.RATE_LIMITS.AUTH,
    keyGenerator: (req) => {
      const ip = getDefaultKey(req).split(':')[0];
      return `auth:${ip}`;
    },
    skip: (req) => {
      // Skip rate limiting for localhost in development
      if (SECURITY_CONFIG.ENVIRONMENT.isDevelopment) {
        const ip = getDefaultKey(req).split(':')[0];
        return ip === '127.0.0.1' || ip === 'localhost' || ip === '::1' || ip === 'unknown';
      }
      return false;
    },
    onLimitReached: (req, key) => {
      console.warn(`Authentication rate limit exceeded for ${key}`, {
        ip: key,
        path: req.nextUrl.pathname,
        timestamp: new Date().toISOString(),
      });
    },
  }),
  
  upload: createRateLimit({
    ...SECURITY_CONFIG.RATE_LIMITS.UPLOAD,
    keyGenerator: (req) => {
      const ip = getDefaultKey(req).split(':')[0];
      return `upload:${ip}`;
    },
    onLimitReached: (req, key) => {
      console.warn(`Upload rate limit exceeded for ${key}`, {
        ip: key,
        path: req.nextUrl.pathname,
        timestamp: new Date().toISOString(),
      });
    },
  }),
  
  payment: createRateLimit({
    ...SECURITY_CONFIG.RATE_LIMITS.PAYMENT,
    keyGenerator: (req) => {
      const ip = getDefaultKey(req).split(':')[0];
      return `payment:${ip}`;
    },
    onLimitReached: (req, key) => {
      console.error(`Payment rate limit exceeded for ${key}`, {
        ip: key,
        path: req.nextUrl.pathname,
        timestamp: new Date().toISOString(),
        userAgent: req.headers.get('user-agent'),
      });
    },
  }),
  
  email: createRateLimit({
    ...SECURITY_CONFIG.RATE_LIMITS.EMAIL,
    keyGenerator: (req) => {
      const ip = getDefaultKey(req).split(':')[0];
      return `email:${ip}`;
    },
    onLimitReached: (req, key) => {
      console.warn(`Email rate limit exceeded for ${key}`, {
        ip: key,
        path: req.nextUrl.pathname,
        timestamp: new Date().toISOString(),
      });
    },
  }),
  
  admin: createRateLimit({
    ...SECURITY_CONFIG.RATE_LIMITS.ADMIN,
    keyGenerator: (req) => {
      const ip = getDefaultKey(req).split(':')[0];
      return `admin:${ip}`;
    },
    skip: (req) => {
      // Skip rate limiting for localhost in development
      if (SECURITY_CONFIG.ENVIRONMENT.isDevelopment) {
        const ip = getDefaultKey(req).split(':')[0];
        return ip === '127.0.0.1' || ip === 'localhost' || ip === '::1';
      }
      return false;
    },
  }),
};

// Helper function to apply rate limiting based on path
export function getRateLimiterForPath(pathname: string): ((req: NextRequest) => Promise<NextResponse | null>) {
  // Authentication endpoints
  if (pathname.includes('/api/auth/') || pathname.includes('/auth/')) {
    return rateLimiters.auth;
  }
  
  // Upload endpoints
  if (pathname.includes('/api/upload') || pathname.includes('/api/portfolio')) {
    return rateLimiters.upload;
  }
  
  // Payment endpoints
  if (pathname.includes('/api/payment') || pathname.includes('/payment')) {
    return rateLimiters.payment;
  }
  
  // Email endpoints
  if (pathname.includes('/api/email') || pathname.includes('/api/test/email')) {
    return rateLimiters.email;
  }
  
  // Admin endpoints
  if (pathname.includes('/api/admin') || pathname.includes('/admin/')) {
    return rateLimiters.admin;
  }
  
  // Default rate limiting
  return rateLimiters.default;
}

// Middleware function to be used in Next.js middleware
export async function applyRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const rateLimiter = getRateLimiterForPath(req.nextUrl.pathname);
  return await rateLimiter(req);
}

// Export functions for rate limit management
export function resetRateLimit(key?: string, prefix?: string): boolean | number {
  try {
    if (key) {
      globalStore.reset(key);
      return true;
    } else if (prefix) {
      return globalStore.resetByPrefix(prefix);
    } else {
      globalStore.resetAll();
      return true;
    }
  } catch (error) {
    console.error('Error resetting rate limit:', error);
    return false;
  }
}

export default applyRateLimit;
