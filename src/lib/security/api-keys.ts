import { nanoid } from 'nanoid';
import { SECURITY_CONFIG } from './config';

export interface APIKey {
  id: string;
  keyHash: string; // We store hash, not the actual key
  prefix: string;
  name: string;
  description?: string;
  userId: string;
  permissions: APIKeyPermission[];
  status: 'active' | 'suspended' | 'revoked';
  expiresAt?: Date;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Rate limiting specific to this key
  rateLimit?: {
    requests: number;
    window: number; // in milliseconds
  };
  // IP restrictions
  allowedIPs?: string[];
  // Referer restrictions
  allowedDomains?: string[];
}

export interface APIKeyPermission {
  resource: string; // e.g., 'projects', 'users', 'payments'
  actions: ('read' | 'write' | 'delete' | 'admin')[]; // What actions are allowed
  conditions?: {
    userId?: string; // Only access own resources
    clientId?: string; // Only access specific client resources
  };
}

export interface CreateAPIKeyRequest {
  name: string;
  description?: string;
  permissions: APIKeyPermission[];
  expiresIn?: number; // milliseconds from now
  rateLimit?: {
    requests: number;
    window: number;
  };
  allowedIPs?: string[];
  allowedDomains?: string[];
}

export interface APIKeyValidationResult {
  isValid: boolean;
  key?: APIKey;
  error?: string;
  remainingRequests?: number;
}

// In-memory store for API keys (use database in production)
class APIKeyStore {
  private keys: Map<string, APIKey> = new Map();
  private usageTracking: Map<string, { count: number; windowStart: number }> = new Map();

  async create(request: CreateAPIKeyRequest, userId: string): Promise<{ key: APIKey; token: string }> {
    // Generate the actual API key
    const keyType = this.determineKeyType(request.permissions);
    const prefix = SECURITY_CONFIG.API_KEYS.PREFIXES[keyType] || SECURITY_CONFIG.API_KEYS.PREFIXES.CLIENT;
    const keyId = nanoid(16);
    const secret = nanoid(32);
    const token = `${prefix}${keyId}_${secret}`;

    // Hash the token for storage
    const keyHash = await this.hashToken(token);

    // Create expiration date
    const expiresAt = request.expiresIn 
      ? new Date(Date.now() + request.expiresIn)
      : new Date(Date.now() + SECURITY_CONFIG.API_KEYS.EXPIRATION.DEFAULT);

    const apiKey: APIKey = {
      id: keyId,
      keyHash,
      prefix,
      name: request.name,
      description: request.description,
      userId,
      permissions: request.permissions,
      status: 'active',
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      rateLimit: request.rateLimit,
      allowedIPs: request.allowedIPs,
      allowedDomains: request.allowedDomains,
    };

    // Store the key
    this.keys.set(keyId, apiKey);

    return { key: apiKey, token };
  }

  async validate(token: string, ip?: string, referer?: string): Promise<APIKeyValidationResult> {
    try {
      // Parse the token
      const { keyId, secret } = this.parseToken(token);
      if (!keyId || !secret) {
        return { isValid: false, error: 'Invalid token format' };
      }

      // Find the key
      const key = this.keys.get(keyId);
      if (!key) {
        return { isValid: false, error: 'API key not found' };
      }

      // Check if key is active
      if (key.status !== 'active') {
        return { isValid: false, error: `API key is ${key.status}` };
      }

      // Check expiration
      if (key.expiresAt && new Date() > key.expiresAt) {
        return { isValid: false, error: 'API key has expired' };
      }

      // Verify the token
      const tokenHash = await this.hashToken(token);
      if (tokenHash !== key.keyHash) {
        return { isValid: false, error: 'Invalid API key' };
      }

      // Check IP restrictions
      if (key.allowedIPs && key.allowedIPs.length > 0 && ip) {
        if (!this.isIPAllowed(ip, key.allowedIPs)) {
          return { isValid: false, error: 'IP address not allowed' };
        }
      }

      // Check domain restrictions
      if (key.allowedDomains && key.allowedDomains.length > 0 && referer) {
        if (!this.isDomainAllowed(referer, key.allowedDomains)) {
          return { isValid: false, error: 'Domain not allowed' };
        }
      }

      // Check rate limiting
      if (key.rateLimit) {
        const rateLimitResult = this.checkRateLimit(keyId, key.rateLimit);
        if (!rateLimitResult.allowed) {
          return { 
            isValid: false, 
            error: 'Rate limit exceeded',
            remainingRequests: 0
          };
        }
      }

      // Update last used timestamp
      key.lastUsedAt = new Date();
      key.updatedAt = new Date();

      return { 
        isValid: true, 
        key,
        remainingRequests: key.rateLimit ? this.getRemainingRequests(keyId, key.rateLimit) : undefined
      };
    } catch (error) {
      return { isValid: false, error: 'Validation error' };
    }
  }

  async revoke(keyId: string, userId: string): Promise<boolean> {
    const key = this.keys.get(keyId);
    if (!key || key.userId !== userId) {
      return false;
    }

    key.status = 'revoked';
    key.updatedAt = new Date();
    return true;
  }

  async suspend(keyId: string, userId: string): Promise<boolean> {
    const key = this.keys.get(keyId);
    if (!key || key.userId !== userId) {
      return false;
    }

    key.status = 'suspended';
    key.updatedAt = new Date();
    return true;
  }

  async reactivate(keyId: string, userId: string): Promise<boolean> {
    const key = this.keys.get(keyId);
    if (!key || key.userId !== userId) {
      return false;
    }

    key.status = 'active';
    key.updatedAt = new Date();
    return true;
  }

  async getUserKeys(userId: string): Promise<APIKey[]> {
    const userKeys: APIKey[] = [];
    for (const key of this.keys.values()) {
      if (key.userId === userId) {
        userKeys.push(key);
      }
    }
    return userKeys.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updatePermissions(keyId: string, userId: string, permissions: APIKeyPermission[]): Promise<boolean> {
    const key = this.keys.get(keyId);
    if (!key || key.userId !== userId) {
      return false;
    }

    key.permissions = permissions;
    key.updatedAt = new Date();
    return true;
  }

  // Private methods
  private async hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private parseToken(token: string): { keyId?: string; secret?: string } {
    // Remove prefix
    let cleanToken = token;
    for (const prefix of Object.values(SECURITY_CONFIG.API_KEYS.PREFIXES)) {
      if (token.startsWith(prefix)) {
        cleanToken = token.substring(prefix.length);
        break;
      }
    }

    // Split keyId and secret
    const parts = cleanToken.split('_');
    if (parts.length !== 2) {
      return {};
    }

    return { keyId: parts[0], secret: parts[1] };
  }

  private determineKeyType(permissions: APIKeyPermission[]): keyof typeof SECURITY_CONFIG.API_KEYS.PREFIXES {
    // Check if has admin permissions
    const hasAdminPermission = permissions.some(p => p.actions.includes('admin'));
    if (hasAdminPermission) {
      return 'ADMIN';
    }

    // Check if has write permissions
    const hasWritePermission = permissions.some(p => p.actions.includes('write') || p.actions.includes('delete'));
    if (hasWritePermission) {
      return 'CLIENT';
    }

    // Default to public for read-only access
    return 'PUBLIC';
  }

  private isIPAllowed(ip: string, allowedIPs: string[]): boolean {
    // Support CIDR notation and exact matches
    return allowedIPs.some(allowedIP => {
      if (allowedIP.includes('/')) {
        // CIDR notation - simplified check
        return this.isIPInCIDR(ip, allowedIP);
      }
      return ip === allowedIP;
    });
  }

  private isIPInCIDR(ip: string, cidr: string): boolean {
    // Simplified CIDR check - in production, use a proper library like 'ip' or 'cidr-matcher'
    const [network, prefixLength] = cidr.split('/');
    const ipParts = ip.split('.').map(Number);
    const networkParts = network.split('.').map(Number);
    const prefix = parseInt(prefixLength, 10);

    // Convert to 32-bit integers for comparison
    const ipInt = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
    const networkInt = (networkParts[0] << 24) | (networkParts[1] << 16) | (networkParts[2] << 8) | networkParts[3];
    const mask = ~((1 << (32 - prefix)) - 1);

    return (ipInt & mask) === (networkInt & mask);
  }

  private isDomainAllowed(referer: string, allowedDomains: string[]): boolean {
    try {
      const url = new URL(referer);
      const domain = url.hostname.toLowerCase();
      
      return allowedDomains.some(allowedDomain => {
        const normalizedDomain = allowedDomain.toLowerCase();
        // Support wildcard subdomains
        if (normalizedDomain.startsWith('*.')) {
          const baseDomain = normalizedDomain.substring(2);
          return domain === baseDomain || domain.endsWith('.' + baseDomain);
        }
        return domain === normalizedDomain;
      });
    } catch {
      return false;
    }
  }

  private checkRateLimit(keyId: string, rateLimit: { requests: number; window: number }): { allowed: boolean } {
    const now = Date.now();
    const usage = this.usageTracking.get(keyId);

    if (!usage || now - usage.windowStart > rateLimit.window) {
      // Reset or initialize usage tracking
      this.usageTracking.set(keyId, { count: 1, windowStart: now });
      return { allowed: true };
    }

    if (usage.count >= rateLimit.requests) {
      return { allowed: false };
    }

    usage.count++;
    return { allowed: true };
  }

  private getRemainingRequests(keyId: string, rateLimit: { requests: number; window: number }): number {
    const usage = this.usageTracking.get(keyId);
    if (!usage) {
      return rateLimit.requests;
    }

    const now = Date.now();
    if (now - usage.windowStart > rateLimit.window) {
      return rateLimit.requests;
    }

    return Math.max(0, rateLimit.requests - usage.count);
  }

  // Clean up expired keys and usage tracking
  cleanup(): void {
    const now = Date.now();
    
    // Remove expired keys
    for (const [keyId, key] of this.keys.entries()) {
      if (key.expiresAt && new Date() > key.expiresAt) {
        this.keys.delete(keyId);
        this.usageTracking.delete(keyId);
      }
    }

    // Clean up old usage tracking
    for (const [keyId, usage] of this.usageTracking.entries()) {
      const key = this.keys.get(keyId);
      if (!key) {
        this.usageTracking.delete(keyId);
        continue;
      }
      
      if (key.rateLimit && now - usage.windowStart > key.rateLimit.window) {
        this.usageTracking.delete(keyId);
      }
    }
  }
}

// Global store instance
const apiKeyStore = new APIKeyStore();

// Periodic cleanup
setInterval(() => {
  apiKeyStore.cleanup();
}, 5 * 60 * 1000); // Every 5 minutes

// Public API functions
export async function createAPIKey(request: CreateAPIKeyRequest, userId: string): Promise<{ key: APIKey; token: string }> {
  return apiKeyStore.create(request, userId);
}

export async function validateAPIKey(token: string, ip?: string, referer?: string): Promise<APIKeyValidationResult> {
  return apiKeyStore.validate(token, ip, referer);
}

export async function revokeAPIKey(keyId: string, userId: string): Promise<boolean> {
  return apiKeyStore.revoke(keyId, userId);
}

export async function suspendAPIKey(keyId: string, userId: string): Promise<boolean> {
  return apiKeyStore.suspend(keyId, userId);
}

export async function reactivateAPIKey(keyId: string, userId: string): Promise<boolean> {
  return apiKeyStore.reactivate(keyId, userId);
}

export async function getUserAPIKeys(userId: string): Promise<APIKey[]> {
  return apiKeyStore.getUserKeys(userId);
}

export async function updateAPIKeyPermissions(keyId: string, userId: string, permissions: APIKeyPermission[]): Promise<boolean> {
  return apiKeyStore.updatePermissions(keyId, userId, permissions);
}

// Permission checking utility
export function hasPermission(key: APIKey, resource: string, action: 'read' | 'write' | 'delete' | 'admin', context?: { userId?: string; clientId?: string }): boolean {
  for (const permission of key.permissions) {
    // Check resource match (exact or wildcard)
    if (permission.resource !== '*' && permission.resource !== resource) {
      continue;
    }

    // Check action permission
    if (!permission.actions.includes(action) && !permission.actions.includes('admin')) {
      continue;
    }

    // Check conditions
    if (permission.conditions) {
      if (permission.conditions.userId && context?.userId !== permission.conditions.userId) {
        continue;
      }
      if (permission.conditions.clientId && context?.clientId !== permission.conditions.clientId) {
        continue;
      }
    }

    return true;
  }

  return false;
}

// Middleware for API key authentication
export function createAPIKeyMiddleware() {
  return async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    const apiKeyHeader = req.headers['x-api-key'];
    
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7)
      : apiKeyHeader;

    if (!token) {
      return res.status(401).json({ error: 'API key required' });
    }

    const ip = req.ip || req.connection.remoteAddress;
    const referer = req.headers.referer || req.headers.origin;

    const validation = await validateAPIKey(token, ip, referer);
    
    if (!validation.isValid) {
      return res.status(401).json({ 
        error: 'Invalid API key',
        details: validation.error
      });
    }

    // Attach key info to request
    req.apiKey = validation.key;
    req.apiKeyUserId = validation.key?.userId;

    // Add rate limit headers
    if (validation.remainingRequests !== undefined) {
      res.setHeader('X-RateLimit-Remaining', validation.remainingRequests.toString());
    }

    next();
  };
}

// Permission middleware
export function requirePermission(resource: string, action: 'read' | 'write' | 'delete' | 'admin') {
  return (req: any, res: any, next: any) => {
    if (!req.apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    const context = {
      userId: req.params?.userId || req.body?.userId,
      clientId: req.params?.clientId || req.body?.clientId,
    };

    if (!hasPermission(req.apiKey, resource, action, context)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: `${action} access to ${resource}`,
      });
    }

    next();
  };
}

export { apiKeyStore };
export default validateAPIKey;
