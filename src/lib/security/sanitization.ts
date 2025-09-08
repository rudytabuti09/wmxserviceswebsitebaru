import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import validator from 'validator';
import { SECURITY_CONFIG } from './config';

// Initialize DOMPurify with JSDOM for server-side usage
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

export interface SanitizationOptions {
  allowHTML?: boolean;
  allowBasicHTML?: boolean;
  maxLength?: number;
  trimWhitespace?: boolean;
  convertToLowercase?: boolean;
  removeEmptyLines?: boolean;
  allowedTags?: string[];
  allowedAttributes?: { [key: string]: string[] };
  customValidator?: (value: string) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  errors: string[];
  warnings: string[];
}

// Configure DOMPurify with our security settings
purify.setConfig({
  ALLOWED_TAGS: SECURITY_CONFIG.SANITIZATION.ALLOWED_TAGS.extended,
  ALLOWED_ATTR: Object.keys(SECURITY_CONFIG.SANITIZATION.ALLOWED_ATTRIBUTES),
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: true,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'iframe'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  USE_PROFILES: { html: true },
  SANITIZE_DOM: true,
  KEEP_CONTENT: true,
});

/**
 * Main sanitization function
 */
export function sanitizeInput(
  value: any,
  fieldName: string,
  options: SanitizationOptions = {}
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Handle null/undefined values
  if (value === null || value === undefined) {
    return {
      isValid: true,
      sanitizedValue: '',
      errors,
      warnings,
    };
  }

  // Convert to string
  let sanitizedValue = String(value);

  // Trim whitespace if enabled (default: true)
  if (options.trimWhitespace !== false) {
    sanitizedValue = sanitizedValue.trim();
  }

  // Check max length
  if (options.maxLength && sanitizedValue.length > options.maxLength) {
    errors.push(`${fieldName} exceeds maximum length of ${options.maxLength} characters`);
    sanitizedValue = sanitizedValue.substring(0, options.maxLength);
    warnings.push(`${fieldName} was truncated to ${options.maxLength} characters`);
  }

  // Apply field-specific sanitization rules
  sanitizedValue = applySanitizationRules(sanitizedValue, fieldName, options);

  // HTML sanitization
  if (options.allowHTML) {
    sanitizedValue = sanitizeHTML(sanitizedValue, options.allowedTags, options.allowedAttributes);
  } else if (options.allowBasicHTML) {
    sanitizedValue = sanitizeBasicHTML(sanitizedValue);
  } else {
    // Strip all HTML tags for text-only fields
    sanitizedValue = stripHTML(sanitizedValue);
  }

  // Apply additional transformations
  if (options.convertToLowercase) {
    sanitizedValue = sanitizedValue.toLowerCase();
  }

  if (options.removeEmptyLines) {
    sanitizedValue = sanitizedValue.replace(/^\s*[\r\n]/gm, '');
  }

  // Custom validation
  if (options.customValidator && !options.customValidator(sanitizedValue)) {
    errors.push(`${fieldName} failed custom validation`);
  }

  return {
    isValid: errors.length === 0,
    sanitizedValue,
    errors,
    warnings,
  };
}

/**
 * Apply field-specific sanitization rules
 */
function applySanitizationRules(
  value: string,
  fieldName: string,
  options: SanitizationOptions
): string {
  const lowerFieldName = fieldName.toLowerCase();

  // Email fields
  if (lowerFieldName.includes('email')) {
    return sanitizeEmail(value);
  }

  // Phone fields
  if (lowerFieldName.includes('phone') || lowerFieldName.includes('tel')) {
    return sanitizePhone(value);
  }

  // URL fields
  if (lowerFieldName.includes('url') || lowerFieldName.includes('website') || lowerFieldName.includes('link')) {
    return sanitizeURL(value);
  }

  // Numeric fields
  if (lowerFieldName.includes('price') || lowerFieldName.includes('amount') || lowerFieldName.includes('number')) {
    return sanitizeNumeric(value);
  }

  // Name fields
  if (lowerFieldName.includes('name') || lowerFieldName.includes('title')) {
    return sanitizeName(value);
  }

  // Address fields
  if (lowerFieldName.includes('address')) {
    return sanitizeAddress(value);
  }

  return value;
}

/**
 * HTML sanitization functions
 */
export function sanitizeHTML(
  html: string,
  allowedTags?: string[],
  allowedAttributes?: { [key: string]: string[] }
): string {
  const config: any = {};

  if (allowedTags) {
    config.ALLOWED_TAGS = allowedTags;
  }

  if (allowedAttributes) {
    config.ALLOWED_ATTR = Object.keys(allowedAttributes);
  }

  return purify.sanitize(html, config);
}

export function sanitizeBasicHTML(html: string): string {
  return purify.sanitize(html, {
    ALLOWED_TAGS: SECURITY_CONFIG.SANITIZATION.ALLOWED_TAGS.basic,
    ALLOWED_ATTR: [],
  });
}

export function stripHTML(html: string): string {
  return purify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/**
 * Specific field sanitizers
 */
export function sanitizeEmail(email: string): string {
  // Remove potentially dangerous characters
  let sanitized = email.replace(/[<>\"'`]/g, '');
  
  // Normalize and validate
  if (validator.isEmail(sanitized)) {
    return validator.normalizeEmail(sanitized) || sanitized;
  }
  
  return sanitized;
}

export function sanitizePhone(phone: string): string {
  // Remove non-numeric characters except +, -, (, ), and spaces
  return phone.replace(/[^\d+\-\(\)\s]/g, '');
}

export function sanitizeURL(url: string): string {
  // Basic URL cleaning
  let sanitized = url.trim();
  
  // Remove dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  for (const protocol of dangerousProtocols) {
    if (sanitized.toLowerCase().startsWith(protocol)) {
      return '';
    }
  }

  // Validate URL format
  if (validator.isURL(sanitized, {
    protocols: ['http', 'https'],
    require_protocol: false,
  })) {
    // Add protocol if missing
    if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
      sanitized = 'https://' + sanitized;
    }
  }

  return sanitized;
}

export function sanitizeNumeric(value: string): string {
  // Remove non-numeric characters except decimal point and minus sign
  return value.replace(/[^\d.-]/g, '');
}

export function sanitizeName(name: string): string {
  // Remove HTML and special characters, keep letters, numbers, spaces, hyphens, and apostrophes
  let sanitized = stripHTML(name);
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-']/g, '');
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  return sanitized.trim();
}

export function sanitizeAddress(address: string): string {
  // Strip HTML but allow common address characters
  let sanitized = stripHTML(address);
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-'.,#]/g, '');
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  return sanitized.trim();
}

/**
 * Bulk sanitization for objects
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fieldConfigs: Record<string, SanitizationOptions>
): { sanitized: T; errors: Record<string, string[]>; warnings: Record<string, string[]> } {
  const sanitized = { ...obj };
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};

  for (const [fieldName, value] of Object.entries(obj)) {
    const config = fieldConfigs[fieldName] || {};
    const result = sanitizeInput(value, fieldName, config);
    
    sanitized[fieldName as keyof T] = result.sanitizedValue as T[keyof T];
    
    if (result.errors.length > 0) {
      errors[fieldName] = result.errors;
    }
    
    if (result.warnings.length > 0) {
      warnings[fieldName] = result.warnings;
    }
  }

  return { sanitized, errors, warnings };
}

/**
 * Predefined sanitization configurations
 */
export const FIELD_CONFIGS = {
  // User profile fields
  name: {
    maxLength: 100,
    trimWhitespace: true,
    allowHTML: false,
  } as SanitizationOptions,

  email: {
    maxLength: 255,
    trimWhitespace: true,
    convertToLowercase: true,
    allowHTML: false,
  } as SanitizationOptions,

  phone: {
    maxLength: 20,
    trimWhitespace: true,
    allowHTML: false,
  } as SanitizationOptions,

  // Content fields
  title: {
    maxLength: 200,
    trimWhitespace: true,
    allowHTML: false,
  } as SanitizationOptions,

  description: {
    maxLength: 2000,
    trimWhitespace: true,
    allowBasicHTML: true,
    removeEmptyLines: true,
  } as SanitizationOptions,

  message: {
    maxLength: 5000,
    trimWhitespace: true,
    allowBasicHTML: true,
    removeEmptyLines: true,
  } as SanitizationOptions,

  // Address fields
  address: {
    maxLength: 500,
    trimWhitespace: true,
    allowHTML: false,
  } as SanitizationOptions,

  // URL fields
  website: {
    maxLength: 500,
    trimWhitespace: true,
    allowHTML: false,
  } as SanitizationOptions,

  // Numeric fields
  amount: {
    maxLength: 20,
    trimWhitespace: true,
    allowHTML: false,
  } as SanitizationOptions,
};

/**
 * Express/Next.js middleware for request sanitization
 */
export function createSanitizationMiddleware(fieldConfigs: Record<string, SanitizationOptions>) {
  return (req: any, res: any, next: any) => {
    if (req.body && typeof req.body === 'object') {
      const result = sanitizeObject(req.body, fieldConfigs);
      
      req.body = result.sanitized;
      req.sanitizationErrors = result.errors;
      req.sanitizationWarnings = result.warnings;

      // Check for validation errors
      const hasErrors = Object.keys(result.errors).length > 0;
      if (hasErrors) {
        return res.status(400).json({
          error: 'Validation failed',
          details: result.errors,
        });
      }
    }

    if (req.query && typeof req.query === 'object') {
      const result = sanitizeObject(req.query, fieldConfigs);
      req.query = result.sanitized;
    }

    next();
  };
}

/**
 * SQL injection prevention (additional layer)
 */
export function preventSQLInjection(value: string): string {
  // Remove common SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
    /(--|\/\*|\*\/|;|'|")/g,
    /(\b(OR|AND)\b.*[=<>])/gi,
    /(\b(XP_|SP_)\w*)/gi,
  ];

  let sanitized = value;
  for (const pattern of sqlPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }

  return sanitized;
}

/**
 * XSS prevention (additional layer)
 */
export function preventXSS(value: string): string {
  // Remove common XSS patterns
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  ];

  let sanitized = value;
  for (const pattern of xssPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }

  return sanitized;
}

/**
 * File path sanitization
 */
export function sanitizeFilePath(filePath: string): string {
  // Remove path traversal attempts
  let sanitized = filePath.replace(/\.\.\//g, '').replace(/\.\.\\g/, '');
  
  // Remove non-standard characters
  sanitized = sanitized.replace(/[^\w\-_./]/g, '');
  
  // Normalize slashes
  sanitized = sanitized.replace(/\\+/g, '/').replace(/\/+/g, '/');
  
  return sanitized;
}

export default sanitizeInput;
