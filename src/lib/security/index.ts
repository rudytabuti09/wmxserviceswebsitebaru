// Main security middleware
export { 
  securityMiddleware, 
  createSecurityMiddleware, 
  securityMiddlewares, 
  checkSecurityStatus 
} from './middleware';

// Rate limiting
export { 
  applyRateLimit, 
  createRateLimit, 
  rateLimiters, 
  getRateLimiterForPath 
} from './rate-limit';

// CSRF protection
export { 
  generateCSRFToken, 
  validateCSRFToken, 
  applyCSRFProtection, 
  createCSRFTokenResponse, 
  getCSRFTokenFromCookies,
  revokeCSRFTokens,
  CSRF_CONFIG
} from './csrf';

// Content Security Policy
export { 
  generateNonce, 
  buildCSPHeader, 
  getCSPDirectives, 
  createCSPMiddleware, 
  applyCSPHeaders, 
  handleCSPReport, 
  PAGE_CSP_CONFIGS, 
  getPageCSPConfig, 
  isURLAllowedByCSP 
} from './csp';

// Input sanitization
export { 
  sanitizeInput, 
  sanitizeObject, 
  sanitizeHTML, 
  sanitizeBasicHTML, 
  stripHTML, 
  sanitizeEmail, 
  sanitizePhone, 
  sanitizeURL, 
  sanitizeNumeric, 
  sanitizeName, 
  sanitizeAddress, 
  sanitizeFilePath,
  preventSQLInjection, 
  preventXSS, 
  createSanitizationMiddleware, 
  FIELD_CONFIGS 
} from './sanitization';

// API key management
export { 
  createAPIKey, 
  validateAPIKey, 
  revokeAPIKey, 
  suspendAPIKey, 
  reactivateAPIKey, 
  getUserAPIKeys, 
  updateAPIKeyPermissions, 
  hasPermission, 
  createAPIKeyMiddleware, 
  requirePermission 
} from './api-keys';

// Security monitoring
export { 
  logSecurityEvent, 
  analyzeRequestSecurity, 
  getSecurityEvents, 
  getSecurityStats, 
  blockIP, 
  unblockIP, 
  isIPBlocked, 
  createSecurityMonitoringMiddleware, 
  SecurityEventType, 
  securityMonitor 
} from './monitoring';

// Configuration
export { SECURITY_CONFIG } from './config';

// Types
export type { SecurityEvent } from './monitoring';
export type { APIKey, APIKeyPermission, CreateAPIKeyRequest } from './api-keys';
export type { SanitizationOptions, ValidationResult } from './sanitization';
export type { CSPDirectives } from './csp';
export type { SecurityMiddlewareOptions } from './middleware';
