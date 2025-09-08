import { NextRequest } from 'next/server';

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: {
    ip: string;
    userAgent?: string;
    userId?: string;
    sessionId?: string;
    country?: string;
    isp?: string;
  };
  details: {
    endpoint?: string;
    method?: string;
    payload?: any;
    error?: string;
    description: string;
    [key: string]: any;
  };
  metadata?: {
    blocked: boolean;
    actionTaken?: string;
    falsePositive?: boolean;
    notes?: string;
  };
}

export enum SecurityEventType {
  // Authentication & Authorization
  FAILED_LOGIN = 'failed_login',
  SUCCESSFUL_LOGIN = 'successful_login',
  SUSPICIOUS_LOGIN = 'suspicious_login',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  DDOS_ATTEMPT = 'ddos_attempt',
  
  // Input Security
  XSS_ATTEMPT = 'xss_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  CSRF_ATTACK = 'csrf_attack',
  MALICIOUS_INPUT = 'malicious_input',
  
  // API Security
  API_KEY_MISUSE = 'api_key_misuse',
  API_ABUSE = 'api_abuse',
  INVALID_API_KEY = 'invalid_api_key',
  
  // File Security
  MALICIOUS_FILE_UPLOAD = 'malicious_file_upload',
  SUSPICIOUS_FILE_ACCESS = 'suspicious_file_access',
  
  // System Security
  SUSPICIOUS_USER_AGENT = 'suspicious_user_agent',
  GEO_ANOMALY = 'geo_anomaly',
  TIME_ANOMALY = 'time_anomaly',
  
  // Business Logic
  UNUSUAL_TRANSACTION = 'unusual_transaction',
  ACCOUNT_TAKEOVER_ATTEMPT = 'account_takeover_attempt',
  FRAUD_ATTEMPT = 'fraud_attempt',
  
  // Infrastructure
  VULNERABILITY_SCAN = 'vulnerability_scan',
  PORT_SCAN = 'port_scan',
  BRUTE_FORCE = 'brute_force',
  
  // Data Protection
  PII_EXPOSURE = 'pii_exposure',
  DATA_EXFILTRATION = 'data_exfiltration',
  UNAUTHORIZED_DATA_ACCESS = 'unauthorized_data_access',
}

// Threat detection patterns
const THREAT_PATTERNS = {
  // SQL Injection patterns
  SQL_INJECTION: [
    /(\bSELECT\b.*\bFROM\b)/i,
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bEXEC\b.*\bXP_)/i,
    /(;|--|\/\*|\*\/)/,
    /(\bOR\b.*1=1)/i,
    /(\bAND\b.*1=1)/i,
  ],
  
  // XSS patterns
  XSS: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b/gi,
    /<object\b/gi,
    /<embed\b/gi,
    /<link\b/gi,
    /<meta\b/gi,
  ],
  
  // Path traversal
  PATH_TRAVERSAL: [
    /\.\.\//g,
    /\.\.\\g/,
    /%2e%2e%2f/gi,
    /%2e%2e%5c/gi,
    /\.\./g,
  ],
  
  // Command injection
  COMMAND_INJECTION: [
    /;\s*(rm|del|format|cat|type)\b/i,
    /\|\s*(curl|wget|nc|ncat)\b/i,
    /`[^`]*`/,
    /\$\([^)]*\)/,
    /&&|;|\|/,
  ],
  
  // Suspicious user agents
  SUSPICIOUS_AGENTS: [
    /sqlmap/i,
    /nmap/i,
    /nikto/i,
    /burp/i,
    /acunetix/i,
    /nessus/i,
    /openvas/i,
    /w3af/i,
    /havij/i,
    /dirbuster/i,
  ],
};

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private maxEvents = 10000; // Keep last 10k events in memory
  private suspiciousIPs = new Map<string, { count: number; firstSeen: Date; lastSeen: Date }>();
  private blockedIPs = new Set<string>();
  
  // Whitelisted IPs that should never be blocked
  private whitelistedIPs = new Set<string>([
    '127.0.0.1',
    '::1',
    'localhost',
    '0.0.0.0',
    '::',
  ]);

  // Log a security event
  logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
    };

    // Add to events array
    this.events.push(securityEvent);
    
    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Update suspicious IPs tracking
    this.updateSuspiciousIPTracking(securityEvent);

    // Console log for immediate visibility
    this.logToConsole(securityEvent);

    // Send to external monitoring services if configured
    this.sendToExternalServices(securityEvent);

    // Auto-block if critical
    if (securityEvent.severity === 'critical') {
      this.handleCriticalThreat(securityEvent);
    }
  }

  // Analyze request for threats
  analyzeRequest(req: NextRequest, userId?: string, sessionId?: string): SecurityEvent[] {
    const threats: SecurityEvent[] = [];
    const ip = this.getClientIP(req);
    const userAgent = req.headers.get('user-agent') || '';
    const url = req.nextUrl.toString();
    const method = req.method;

    // Check if IP is already blocked
    if (this.blockedIPs.has(ip)) {
      threats.push({
        id: this.generateEventId(),
        timestamp: new Date(),
        type: SecurityEventType.UNAUTHORIZED_ACCESS,
        severity: 'high',
        source: { ip, userAgent, userId, sessionId },
        details: {
          endpoint: url,
          method,
          description: 'Request from blocked IP address',
        },
        metadata: { blocked: true },
      });
    }

    // Analyze user agent
    const userAgentThreat = this.analyzeUserAgent(userAgent, ip, userId, sessionId);
    if (userAgentThreat) threats.push(userAgentThreat);

    // Analyze URL for path traversal
    const pathThreat = this.analyzePathTraversal(url, ip, userAgent, userId, sessionId);
    if (pathThreat) threats.push(pathThreat);

    // Analyze query parameters and body for injection attacks
    this.analyzeQueryParams(req, ip, userAgent, userId, sessionId).forEach(threat => {
      threats.push(threat);
    });

    return threats;
  }

  // Get events by criteria
  getEvents(criteria?: {
    type?: SecurityEventType;
    severity?: string;
    ip?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): SecurityEvent[] {
    let filteredEvents = [...this.events];

    if (criteria) {
      if (criteria.type) {
        filteredEvents = filteredEvents.filter(e => e.type === criteria.type);
      }
      if (criteria.severity) {
        filteredEvents = filteredEvents.filter(e => e.severity === criteria.severity);
      }
      if (criteria.ip) {
        filteredEvents = filteredEvents.filter(e => e.source.ip === criteria.ip);
      }
      if (criteria.userId) {
        filteredEvents = filteredEvents.filter(e => e.source.userId === criteria.userId);
      }
      if (criteria.startDate) {
        filteredEvents = filteredEvents.filter(e => e.timestamp >= criteria.startDate!);
      }
      if (criteria.endDate) {
        filteredEvents = filteredEvents.filter(e => e.timestamp <= criteria.endDate!);
      }
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit
    if (criteria?.limit) {
      filteredEvents = filteredEvents.slice(0, criteria.limit);
    }

    return filteredEvents;
  }

  // Get security statistics
  getSecurityStats(): {
    totalEvents: number;
    eventsBySeverity: Record<string, number>;
    eventsByType: Record<string, number>;
    topSuspiciousIPs: Array<{ ip: string; count: number; firstSeen: Date; lastSeen: Date }>;
    blockedIPs: string[];
    recentEvents: SecurityEvent[];
  } {
    const eventsBySeverity: Record<string, number> = {};
    const eventsByType: Record<string, number> = {};

    this.events.forEach(event => {
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    });

    const topSuspiciousIPs = Array.from(this.suspiciousIPs.entries())
      .map(([ip, data]) => ({ ip, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: this.events.length,
      eventsBySeverity,
      eventsByType,
      topSuspiciousIPs,
      blockedIPs: Array.from(this.blockedIPs),
      recentEvents: this.getEvents({ limit: 20 }),
    };
  }

  // Block IP address
  blockIP(ip: string, reason: string): void {
    // Don't block whitelisted IPs
    if (this.whitelistedIPs.has(ip)) {
      console.log(`⚠️ Attempted to block whitelisted IP ${ip}, skipping block`);
      return;
    }
    
    this.blockedIPs.add(ip);
    
    this.logSecurityEvent({
      type: SecurityEventType.UNAUTHORIZED_ACCESS,
      severity: 'high',
      source: { ip },
      details: {
        description: `IP address blocked: ${reason}`,
        actionTaken: 'IP_BLOCKED',
      },
      metadata: { blocked: true, actionTaken: 'IP_BLOCKED' },
    });
  }

  // Unblock IP address
  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
    
    this.logSecurityEvent({
      type: SecurityEventType.UNAUTHORIZED_ACCESS,
      severity: 'medium',
      source: { ip },
      details: {
        description: `IP address unblocked`,
        actionTaken: 'IP_UNBLOCKED',
      },
      metadata: { blocked: false, actionTaken: 'IP_UNBLOCKED' },
    });
  }

  // Check if IP is blocked
  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  // Private methods
  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private getClientIP(req: NextRequest): string {
    // Try to get real IP from various headers
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const cfIP = req.headers.get('cf-connecting-ip');
    
    return cfIP || forwarded?.split(',')[0]?.trim() || realIP || 'unknown';
  }

  private analyzeUserAgent(userAgent: string, ip: string, userId?: string, sessionId?: string): SecurityEvent | null {
    for (const pattern of THREAT_PATTERNS.SUSPICIOUS_AGENTS) {
      if (pattern.test(userAgent)) {
        return {
          id: this.generateEventId(),
          timestamp: new Date(),
          type: SecurityEventType.SUSPICIOUS_USER_AGENT,
          severity: 'medium',
          source: { ip, userAgent, userId, sessionId },
          details: {
            description: 'Suspicious user agent detected',
            userAgent,
            pattern: pattern.source,
          },
        };
      }
    }
    return null;
  }

  private analyzePathTraversal(url: string, ip: string, userAgent?: string, userId?: string, sessionId?: string): SecurityEvent | null {
    for (const pattern of THREAT_PATTERNS.PATH_TRAVERSAL) {
      if (pattern.test(url)) {
        return {
          id: this.generateEventId(),
          timestamp: new Date(),
          type: SecurityEventType.MALICIOUS_INPUT,
          severity: 'high',
          source: { ip, userAgent, userId, sessionId },
          details: {
            description: 'Path traversal attempt detected',
            url,
            pattern: pattern.source,
          },
        };
      }
    }
    return null;
  }

  private analyzeQueryParams(req: NextRequest, ip: string, userAgent?: string, userId?: string, sessionId?: string): SecurityEvent[] {
    const threats: SecurityEvent[] = [];
    const url = req.nextUrl.toString();

    // Analyze URL parameters
    req.nextUrl.searchParams.forEach((value, key) => {
      // Check for SQL injection
      for (const pattern of THREAT_PATTERNS.SQL_INJECTION) {
        if (pattern.test(value)) {
          threats.push({
            id: this.generateEventId(),
            timestamp: new Date(),
            type: SecurityEventType.SQL_INJECTION_ATTEMPT,
            severity: 'critical',
            source: { ip, userAgent, userId, sessionId },
            details: {
              description: 'SQL injection attempt detected in query parameter',
              parameter: key,
              value,
              pattern: pattern.source,
              url,
            },
          });
        }
      }

      // Check for XSS
      for (const pattern of THREAT_PATTERNS.XSS) {
        if (pattern.test(value)) {
          threats.push({
            id: this.generateEventId(),
            timestamp: new Date(),
            type: SecurityEventType.XSS_ATTEMPT,
            severity: 'high',
            source: { ip, userAgent, userId, sessionId },
            details: {
              description: 'XSS attempt detected in query parameter',
              parameter: key,
              value,
              pattern: pattern.source,
              url,
            },
          });
        }
      }
    });

    return threats;
  }

  private updateSuspiciousIPTracking(event: SecurityEvent): void {
    const ip = event.source.ip;
    const existing = this.suspiciousIPs.get(ip);
    
    if (existing) {
      existing.count++;
      existing.lastSeen = event.timestamp;
    } else {
      this.suspiciousIPs.set(ip, {
        count: 1,
        firstSeen: event.timestamp,
        lastSeen: event.timestamp,
      });
    }

    // Auto-block IPs with too many suspicious events
    const ipData = this.suspiciousIPs.get(ip)!;
    if (ipData.count >= 10 && !this.blockedIPs.has(ip)) {
      this.blockIP(ip, `Too many suspicious events (${ipData.count})`);
    }
  }

  private logToConsole(event: SecurityEvent): void {
    const logLevel = event.severity === 'critical' ? 'error' : 
                    event.severity === 'high' ? 'warn' : 'info';
    
    console[logLevel]('🔒 Security Event:', {
      type: event.type,
      severity: event.severity,
      ip: event.source.ip,
      description: event.details.description,
      timestamp: event.timestamp.toISOString(),
    });
  }

  private sendToExternalServices(event: SecurityEvent): void {
    // Send to external monitoring services (Sentry, DataDog, etc.)
    if (process.env.SECURITY_WEBHOOK_URL) {
      fetch(process.env.SECURITY_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch(error => {
        console.error('Failed to send security event to webhook:', error);
      });
    }

    // Send to Sentry if configured
    if (process.env.SENTRY_DSN && (event.severity === 'high' || event.severity === 'critical')) {
      // In a real implementation, you would use Sentry SDK here
      console.log('Would send to Sentry:', event);
    }
  }

  private handleCriticalThreat(event: SecurityEvent): void {
    // Auto-block IP for critical threats
    if (!this.blockedIPs.has(event.source.ip)) {
      this.blockIP(event.source.ip, `Critical threat: ${event.type}`);
    }

    // Send immediate alerts
    console.error('🚨 CRITICAL SECURITY THREAT:', event);
    
    // In production, you might send email/SMS/Slack alerts here
  }
}

// Global security monitor instance
const securityMonitor = new SecurityMonitor();

// Convenience functions
export function logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
  securityMonitor.logSecurityEvent(event);
}

export function analyzeRequestSecurity(req: NextRequest, userId?: string, sessionId?: string): SecurityEvent[] {
  return securityMonitor.analyzeRequest(req, userId, sessionId);
}

export function getSecurityEvents(criteria?: Parameters<SecurityMonitor['getEvents']>[0]): SecurityEvent[] {
  return securityMonitor.getEvents(criteria);
}

export function getSecurityStats(): ReturnType<SecurityMonitor['getSecurityStats']> {
  return securityMonitor.getSecurityStats();
}

export function blockIP(ip: string, reason: string): void {
  securityMonitor.blockIP(ip, reason);
}

export function unblockIP(ip: string): void {
  securityMonitor.unblockIP(ip);
}

export function isIPBlocked(ip: string): boolean {
  return securityMonitor.isIPBlocked(ip);
}

// Middleware for automatic threat detection
export function createSecurityMonitoringMiddleware() {
  return async (req: any, res: any, next: any) => {
    const nextReq = req as NextRequest;
    const userId = req.user?.id || req.session?.user?.id;
    const sessionId = req.sessionID || req.session?.id;

    // Analyze request for threats
    const threats = analyzeRequestSecurity(nextReq, userId, sessionId);
    
    // Log all threats
    threats.forEach(threat => {
      securityMonitor.logSecurityEvent(threat);
    });

    // Block request if critical threats detected
    const criticalThreats = threats.filter(t => t.severity === 'critical');
    if (criticalThreats.length > 0) {
      return res.status(403).json({
        error: 'Request blocked due to security threat',
        threatId: criticalThreats[0].id,
      });
    }

    // Check if IP is blocked
    const clientIP = securityMonitor['getClientIP'](nextReq);
    if (securityMonitor.isIPBlocked(clientIP)) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'IP_BLOCKED',
      });
    }

    next();
  };
}

export { securityMonitor };
export default securityMonitor;
