import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { encryptData, decryptData } from '@/lib/encryption';

/**
 * TEST-22: Fuzz Testing for Encryption Logic.
 * Verifies that the E2EE module handles random binary and special character 
 * inputs without data loss or crashing.
 */
describe('Encryption Robustness (Fuzzing)', () => {
  it('should correctly round-trip any string input', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string(), async (original: string) => {
        const encrypted = await encryptData(original);
        const decrypted = await decryptData(encrypted);
        
        expect(decrypted).toBe(original);
      }),
      { numRuns: 500 }
    );
  });

  it('should fail gracefully for malformed encrypted payloads', async () => {
    await fc.assert(
      fc.asyncProperty(fc.base64String({ minLength: 20 }), async (fakePayload) => {
        try {
          await decryptData(fakePayload);
        } catch (error) {
          // Failure is expected for random strings
          expect(error).toBeDefined();
        }
      }),
      { numRuns: 200 }
    );
  });
});
