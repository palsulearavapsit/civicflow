/**
 * Master Security Utility
 * Provides industrial-grade protection for client-side operations.
 */

export const SecurityService = {
  /**
   * Securely masks sensitive information like emails or IDs in logs.
   * Prevents PII (Personally Identifiable Information) from leaking into logging systems.
   */
  maskPII(data: string): string {
    if (data.includes('@')) {
      const [user, domain] = data.split('@');
      return `${user[0]}${'*'.repeat(user.length - 1)}@${domain}`;
    }
    return data.slice(0, 3) + '*'.repeat(Math.max(0, data.length - 3));
  },

  /**
   * Validates if a redirect URL is safe (prevents Open Redirect vulnerabilities).
   */
  isSafeUrl(url: string): boolean {
    try {
      const parsed = new URL(url, window.location.origin);
      return parsed.origin === window.location.origin;
    } catch {
      return false;
    }
  },

  /**
   * Recursively masks PII in objects/arrays for safe logging.
   */
  maskObjectPII(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(item => this.maskObjectPII(item));

    const masked: any = {};
    const sensitiveKeys = ['email', 'password', 'zipCode', 'address', 'phoneNumber', 'ssn'];

    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveKeys.includes(key) && typeof value === 'string') {
        masked[key] = this.maskPII(value);
      } else {
        masked[key] = this.maskObjectPII(value);
      }
    }
    return masked;
  },

  /**
   * Sanitizes user input for basic display to prevent injection.
   */
  sanitize(text: string): string {
    return text.replace(/[<>]/g, '');
  }
};
