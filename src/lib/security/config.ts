export const SECURITY_CONFIG = {
  // Rate Limiting Configuration
  RATE_LIMITS: {
    // General API endpoints
    DEFAULT: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    
    // Authentication endpoints (more strict)
    AUTH: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: process.env.NODE_ENV === 'development' ? 10000 : 50, // Much higher limit in development
      message: 'Too many authentication attempts, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    
    // File upload endpoints
    UPLOAD: {
      windowMs: 60 * 1000, // 1 minute
      max: 10, // limit each IP to 10 uploads per minute
      message: 'Too many file uploads, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    
    // Payment endpoints (reasonable limits for user experience)
    PAYMENT: {
      windowMs: process.env.NODE_ENV === 'development' ? 1 * 60 * 1000 : 5 * 60 * 1000, // 1 minute in dev, 5 minutes in prod
      max: process.env.NODE_ENV === 'development' ? 50 : 10, // 50 attempts in dev, 10 in prod
      message: 'Too many payment attempts, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    
    // Email endpoints
    EMAIL: {
      windowMs: 60 * 1000, // 1 minute
      max: 5, // limit each IP to 5 email sends per minute
      message: 'Too many email requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    
    // Admin endpoints
    ADMIN: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 200, // higher limit for admin users
      message: 'Too many admin requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
  },
  
  // Content Security Policy
  CSP: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Next.js in development
        "'unsafe-eval'", // Required for Next.js in development
        "https://app.midtrans.com",
        "https://app.sandbox.midtrans.com",
        "https://js.stripe.com",
        "https://checkout.stripe.com",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for styled-components and CSS-in-JS
        "https://fonts.googleapis.com",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:", // for inline fonts
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:", // Allow images from HTTPS sources
        process.env.NEXT_PUBLIC_R2_URL || "https://cdn.wmx-services.com",
        "https://lh3.googleusercontent.com", // Google profile images
        "https://avatars.githubusercontent.com", // GitHub profile images
      ],
      connectSrc: [
        "'self'",
        "https://api.midtrans.com",
        "https://api.sandbox.midtrans.com",
        "https://api.stripe.com",
        "https://api.resend.com",
        "https://www.google-analytics.com",
        process.env.NEXT_PUBLIC_API_URL || "https://api.wmx-services.com",
      ],
      frameSrc: [
        "'self'",
        "https://checkout.stripe.com",
        "https://js.stripe.com",
        "https://app.midtrans.com",
        "https://app.sandbox.midtrans.com",
      ],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  
  // Input Sanitization Rules
  SANITIZATION: {
    // HTML content fields
    HTML_FIELDS: ['description', 'message', 'content', 'notes'],
    
    // Fields that should be completely stripped of HTML
    TEXT_ONLY_FIELDS: ['name', 'title', 'email', 'phone', 'address'],
    
    // Fields that allow basic formatting
    BASIC_HTML_FIELDS: ['bio', 'summary'],
    
    // Allowed HTML tags for basic formatting
    ALLOWED_TAGS: {
      basic: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
      extended: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'ul', 'ol', 'li', 'a'],
    },
    
    // Allowed attributes
    ALLOWED_ATTRIBUTES: {
      a: ['href', 'title'],
    },
  },
  
  // API Key Management
  API_KEYS: {
    // Key expiration times
    EXPIRATION: {
      DEFAULT: 30 * 24 * 60 * 60 * 1000, // 30 days
      TEMPORARY: 24 * 60 * 60 * 1000, // 24 hours
      LONG_TERM: 365 * 24 * 60 * 60 * 1000, // 1 year
    },
    
    // Key prefixes for different types
    PREFIXES: {
      CLIENT: 'wmx_client_',
      ADMIN: 'wmx_admin_',
      WEBHOOK: 'wmx_webhook_',
      PUBLIC: 'wmx_public_',
    },
    
    // Permissions
    PERMISSIONS: {
      READ: 'read',
      WRITE: 'write',
      DELETE: 'delete',
      ADMIN: 'admin',
    },
  },
  
  // Security Headers
  SECURITY_HEADERS: {
    // Helmet.js configuration
    helmet: {
      contentSecurityPolicy: false, // We handle CSP separately
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'cross-origin' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      dnsPrefetchControl: true,
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permittedCrossDomainPolicies: false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
    },
    
    // Custom headers
    custom: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()', // Remove clipboard restrictions for payment functionality
    },
  },
  
  // Trusted domains for CORS
  CORS_ORIGINS: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'https://wmx-services.com',
    'https://www.wmx-services.com',
    'https://app.wmx-services.com',
  ],
  
  // Environment-specific settings
  ENVIRONMENT: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },
};

export default SECURITY_CONFIG;
