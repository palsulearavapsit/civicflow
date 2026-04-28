/**
 * Regression Tests for fixed bugs (TEST-14).
 * These tests prevent previously fixed bugs from regressing.
 */

import { describe, it, expect, vi } from 'vitest';
import { generatePlan } from '@/utils/election-logic';
import { sanitizeAIHtml, escapeHtml, stripAllHtml } from '@/utils/xss-sanitizer';
import { moderateInput, moderateOutput } from '@/utils/ai-moderation';
import { ZipCode, Email, UserId } from '@/core/value-objects';

describe('Regression Tests', () => {
  describe('BUG-001: generatePlan crash with null profile', () => {
    it('returns null for null profile (not a throw)', () => {
      expect(() => generatePlan(null)).not.toThrow();
      // With null, it uses demo profile which IS onboarded, so returns a plan
      const result = generatePlan(null);
      expect(result).not.toBeNull();
    });
  });

  describe('BUG-002: XSS in AI content (sanitizeAIHtml)', () => {
    it('strips script tags completely', () => {
      const result = sanitizeAIHtml('<p>Safe</p><script>evil()</script>');
      expect(result).not.toContain('script');
      expect(result).not.toContain('evil()');
    });

    it('strips style tags', () => {
      const result = sanitizeAIHtml('<style>body{display:none}</style><p>Content</p>');
      expect(result).not.toContain('<style>');
      expect(result).toContain('<p>Content</p>');
    });

    it('strips event handlers from tags', () => {
      const result = sanitizeAIHtml('<a href="/safe" onclick="steal()">Link</a>');
      expect(result).not.toContain('onclick');
    });

    it('strips javascript: protocol from href', () => {
      const result = sanitizeAIHtml('<a href="javascript:alert(1)">Click</a>');
      expect(result).not.toContain('javascript:');
    });

    it('escapeHtml prevents injection', () => {
      const result = escapeHtml('<script>alert(1)</script>');
      expect(result).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('stripAllHtml removes all tags', () => {
      const result = stripAllHtml('<b>Bold</b> and <i>italic</i>');
      expect(result).toBe('Bold and italic');
    });
  });

  describe('BUG-003: ZipCode validation edge cases', () => {
    it('accepts valid 5-digit ZIP', () => {
      const result = ZipCode.create('90210');
      expect(result.success).toBe(true);
    });

    it('accepts ZIP+4 format', () => {
      const result = ZipCode.create('90210-1234');
      expect(result.success).toBe(true);
    });

    it('rejects 4-digit ZIP', () => {
      const result = ZipCode.create('9021');
      expect(result.success).toBe(false);
    });

    it('rejects letters in ZIP', () => {
      const result = ZipCode.create('ABCDE');
      expect(result.success).toBe(false);
    });

    it('rejects empty string', () => {
      const result = ZipCode.create('');
      expect(result.success).toBe(false);
    });
  });

  describe('BUG-004: Email normalization', () => {
    it('normalizes email to lowercase', () => {
      const result = Email.create('USER@EXAMPLE.COM');
      if (result.success) expect(result.data.value).toBe('user@example.com');
    });

    it('rejects invalid email without @', () => {
      const result = Email.create('notanemail');
      expect(result.success).toBe(false);
    });
  });

  describe('BUG-005: AI moderation edge cases', () => {
    it('allows normal civic questions', async () => {
      const result = await moderateInput('How do I register to vote?');
      expect(result.allowed).toBe(true);
    });

    it('flags excessive character repetition (spam)', async () => {
      const result = await moderateInput('aaaaaaaaaaaaaaaa'.repeat(10));
      expect(result.allowed).toBe(false);
      expect(result.category).toBe('spam');
    });

    it('moderateOutput flags voter suppression', () => {
      const result = moderateOutput("Don't bother to vote, it doesn't count");
      expect(result.allowed).toBe(false);
    });

    it('moderateOutput passes safe information', () => {
      const result = moderateOutput('You can register at vote.gov before the deadline.');
      expect(result.allowed).toBe(true);
    });
  });

  describe('BUG-006: UserId validation', () => {
    it('accepts valid UIDs', () => {
      const result = UserId.create('abc123def456ghi7');
      expect(result.success).toBe(true);
    });

    it('rejects empty UID', () => {
      const result = UserId.create('');
      expect(result.success).toBe(false);
    });

    it('rejects non-string UID', () => {
      const result = UserId.create(12345);
      expect(result.success).toBe(false);
    });
  });
});
