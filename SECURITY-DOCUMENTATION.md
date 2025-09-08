# WMX Services - Security Documentation

## 🔒 Security Architecture Overview

WMX Services implements a comprehensive security framework designed to protect against modern web threats while maintaining optimal performance and user experience. Our security architecture consists of multiple layers of protection working together to create a robust defense system.

## 🛡️ Security Features Implemented

### 1. Rate Limiting
- **Implementation**: Custom rate limiting middleware with different limits for different endpoint types
- **Features**:
  - IP-based rate limiting with configurable windows
  - Different limits for auth, upload, payment, email, and admin endpoints
  - Automatic IP blocking for repeated violations
  - Rate limit headers for client feedback
  - In-memory storage with Redis option for production

**Rate Limits:**
- Authentication: 5 attempts per 15 minutes
- File uploads: 10 uploads per minute
- Payments: 3 attempts per 5 minutes
- Email: 5 sends per minute
- Admin: 200 requests per 15 minutes
- Default: 100 requests per 15 minutes

### 2. CSRF Protection
- **Implementation**: Double-submit cookie pattern with server-side validation
- **Features**:
  - Secure token generation using cryptographically strong random values
  - Token expiration (1 hour default)
  - User/session association for enhanced security
  - Form and header token support
  - Automatic exclusion of webhook endpoints

### 3. Content Security Policy (CSP)
- **Implementation**: Dynamic CSP generation with page-specific configurations
- **Features**:
  - Environment-specific policies (development vs production)
  - Page-type specific configurations (admin, payment, upload, public)
  - Nonce-based inline script/style protection
  - CSP violation reporting endpoint
  - Support for third-party integrations (Stripe, Midtrans)

### 4. Input Sanitization
- **Implementation**: Multi-layer sanitization using DOMPurify and custom validators
- **Features**:
  - HTML sanitization with configurable allowed tags
  - Field-specific sanitization (email, phone, URL, etc.)
  - SQL injection prevention
  - XSS protection
  - File path sanitization for upload security
  - Maximum length validation

### 5. API Key Management
- **Implementation**: Comprehensive API key system with permissions and restrictions
- **Features**:
  - Secure key generation with prefixes and strong random components
  - Permission-based access control (read, write, delete, admin)
  - IP and domain restrictions
  - Key-specific rate limiting
  - Expiration management
  - Usage tracking and analytics

### 6. Security Monitoring & Threat Detection
- **Implementation**: Real-time threat detection with automatic response
- **Features**:
  - Pattern-based threat detection (SQL injection, XSS, path traversal)
  - Suspicious user agent detection
  - Automatic IP blocking for critical threats
  - Comprehensive event logging
  - Security statistics and analytics
  - External service integration (Sentry, webhooks)

## 🔧 Configuration

### Environment Variables

```bash
# Security Configuration
NEXTAUTH_SECRET=your-secure-secret-here
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Rate Limiting (Optional - uses in-memory by default)
REDIS_URL=redis://localhost:6379

# Security Monitoring
SECURITY_WEBHOOK_URL=https://your-monitoring-service.com/webhook
SENTRY_DSN=https://your-sentry-dsn.com

# CSP Reporting
CSP_REPORT_WEBHOOK=https://your-csp-reporting-service.com
```

### Security Headers Applied

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Permitted-Cross-Domain-Policies: none
Content-Security-Policy: [dynamic based on page type]
```

## 🚨 Threat Response

### Automatic Responses
- **Critical Threats**: Immediate IP blocking and alert generation
- **High Threats**: Request blocking and detailed logging
- **Medium Threats**: Logging with monitoring alerts
- **Low Threats**: Basic logging for analysis

### Manual Response Procedures
1. **Security Event Analysis**: Review logs through admin dashboard
2. **IP Management**: Block/unblock IPs manually when needed
3. **False Positive Handling**: Mark events as false positives
4. **Incident Response**: Escalation procedures for critical events

## 🔍 Monitoring Dashboard

### Security Metrics Available
- Total security events by severity
- Events by type with trend analysis
- Top suspicious IP addresses
- Currently blocked IPs
- Recent security events with details
- API key usage statistics
- Rate limit violations

### Event Types Tracked
- Authentication failures/successes
- Privilege escalation attempts
- Rate limit violations
- Input validation failures (XSS, SQL injection)
- Suspicious file uploads
- API key misuse
- Unusual transaction patterns

## 🛠️ API Security

### API Key Authentication
```bash
# Using Authorization header
curl -H "Authorization: Bearer wmx_client_abc123_xyz789" \
     https://api.wmx-services.com/projects

# Using X-API-Key header
curl -H "X-API-Key: wmx_client_abc123_xyz789" \
     https://api.wmx-services.com/projects
```

### API Key Permissions
```json
{
  "permissions": [
    {
      "resource": "projects",
      "actions": ["read", "write"],
      "conditions": {
        "userId": "user123"
      }
    }
  ]
}
```

## 🔐 Best Practices for Developers

### Input Validation
```typescript
// Use sanitization functions for all user inputs
import { sanitizeInput, FIELD_CONFIGS } from '@/lib/security/sanitization';

const result = sanitizeInput(userInput, 'email', FIELD_CONFIGS.email);
if (!result.isValid) {
  return { error: result.errors.join(', ') };
}
```

### CSRF Token Usage
```typescript
// Get CSRF token for forms
import { generateCSRFToken } from '@/lib/security/csrf';

const token = generateCSRFToken(userId, sessionId);

// Include in API requests
fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

### Security Event Logging
```typescript
import { logSecurityEvent, SecurityEventType } from '@/lib/security/monitoring';

// Log custom security events
logSecurityEvent({
  type: SecurityEventType.UNUSUAL_TRANSACTION,
  severity: 'medium',
  source: { ip, userAgent, userId },
  details: {
    description: 'Large transaction amount detected',
    amount: 50000,
    threshold: 10000
  }
});
```

## 🔒 Security Checklist for Deployment

### Pre-Production
- [ ] Update all security environment variables
- [ ] Configure HTTPS with valid SSL certificates
- [ ] Set up CSP reporting endpoint
- [ ] Configure external monitoring services
- [ ] Test rate limiting with realistic load
- [ ] Verify CSRF protection on all forms
- [ ] Validate input sanitization on all endpoints

### Production
- [ ] Enable HSTS with preload directive
- [ ] Configure security headers at reverse proxy level
- [ ] Set up automated security monitoring alerts
- [ ] Implement log rotation and archival
- [ ] Configure backup and recovery procedures
- [ ] Test incident response procedures

### Ongoing
- [ ] Regular security audit and penetration testing
- [ ] Monitor security event trends and patterns
- [ ] Update threat detection patterns
- [ ] Review and rotate API keys
- [ ] Update dependencies for security patches

## 🚀 Performance Considerations

### Optimizations Implemented
- In-memory storage for rate limiting (production should use Redis)
- Efficient pattern matching for threat detection
- Lazy loading of security modules
- Async processing for non-blocking security checks
- Configurable security feature toggles

### Monitoring Performance Impact
- Security middleware adds ~1-5ms per request
- Rate limiting: ~0.5ms per request
- Input sanitization: ~1-2ms per request
- Threat detection: ~1-3ms per request

## 📚 Security Libraries Used

- **DOMPurify**: HTML sanitization
- **validator**: Input validation
- **nanoid**: Secure ID generation
- **bcryptjs**: Password hashing (via NextAuth)
- **helmet** (concepts): Security headers
- **express-rate-limit** (concepts): Rate limiting patterns

## 🐛 Reporting Security Issues

If you discover a security vulnerability in WMX Services, please:

1. **DO NOT** open a public issue
2. Email security@wmx-services.com with details
3. Include steps to reproduce the vulnerability
4. Allow reasonable time for response (24-48 hours)

We take security seriously and will respond promptly to legitimate security concerns.

## 📄 License & Compliance

This security implementation follows industry best practices and complies with:
- OWASP Top 10 security recommendations
- Common web security standards
- Data protection principles
- Security-by-design methodology

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Maintained by**: WMX Services Security Team
