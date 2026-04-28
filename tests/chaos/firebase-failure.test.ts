/**
 * Chaos Engineering Tests — Simulating Firebase failures (TEST-01).
 * Verifies the application degrades gracefully when Firestore is unavailable.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Firebase before imports
vi.mock('@/lib/firebase', () => ({
  db: null,
  auth: null,
  isConfigValid: false,
}));

describe('Chaos Engineering — Firebase Failure Scenarios', () => {
  describe('FirebaseUserRepository under failure', () => {
    it('returns ok(null) when db is null (graceful degradation)', async () => {
      const { FirebaseUserRepository } = await import('@/core/adapters/firebase-adapter');
      const result = await FirebaseUserRepository.findById('uid-123');
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBeNull();
    });

    it('returns ok(undefined) on save when db is null', async () => {
      const { FirebaseUserRepository } = await import('@/core/adapters/firebase-adapter');
      const profile = {
        uid: 'uid-123', email: 'test@test.com', displayName: 'Test',
        onboarded: false, location: { state: 'California', zipCode: '90210' },
        ageGroup: '25-44' as const, isFirstTimeVoter: false,
        preferredMethod: 'in-person' as const, language: 'en', accessibilityNeeds: [],
      };
      const result = await FirebaseUserRepository.save(profile);
      expect(result.success).toBe(true);
    });

    it('returns ok(undefined) on update when db is null', async () => {
      const { FirebaseUserRepository } = await import('@/core/adapters/firebase-adapter');
      const result = await FirebaseUserRepository.update('uid-123', { language: 'es' });
      expect(result.success).toBe(true);
    });
  });

  describe('UserService under Firebase failure', () => {
    it('getProfile returns null gracefully when Firebase is down', async () => {
      const { UserService } = await import('@/services/userService');
      const profile = await UserService.getProfile('uid-123');
      expect(profile).toBeNull();
    });

    it('createProfile does not throw when Firebase is down', async () => {
      const { UserService } = await import('@/services/userService');
      const profile = {
        uid: 'uid-chaos', email: null, displayName: 'Chaos User',
        onboarded: false, location: { state: 'Texas', zipCode: '73301' },
        ageGroup: '18-24' as const, isFirstTimeVoter: true,
        preferredMethod: 'in-person' as const, language: 'en', accessibilityNeeds: [],
      };
      await expect(UserService.createProfile(profile)).resolves.not.toThrow();
    });
  });

  describe('AuditService under Firebase failure', () => {
    it('audit log silently succeeds when db is null', async () => {
      const { AuditService } = await import('@/services/auditService');
      const result = await AuditService.log('uid-chaos', 'TEST_ACTION', {});
      expect(result.success).toBe(true);
    });
  });

  describe('Network simulation', () => {
    beforeEach(() => {
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
    });
    afterEach(() => vi.restoreAllMocks());

    it('signedFetch propagates network errors', async () => {
      const { signedFetch } = await import('@/utils/payload-signing');
      await expect(signedFetch('/api/test', { prompt: 'test' })).rejects.toThrow('Network error');
    });
  });
});
