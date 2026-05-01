import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generatePlan } from '@/utils/election-logic';
import { UserProfile } from '@/types';

/**
 * TEST-25: Property-Based Testing for Election Logic.
 * Verifies that the plan generator never crashes and maintains invariants 
 * across thousands of random user profiles.
 */
describe('Election Logic Invariants', () => {
  it('should always generate a valid plan for any user profile', () => {
    fc.assert(
      fc.property(
        fc.record({
          uid: fc.string(),
          email: fc.emailAddress(),
          displayName: fc.option(fc.string()),
          onboarded: fc.boolean(),
          location: fc.record({
            state: fc.oneof(fc.constant('California'), fc.constant('Texas'), fc.constant('New York'), fc.constant('Florida')),
            zipCode: fc.string({ minLength: 5, maxLength: 5 })
          }),
          ageGroup: fc.oneof(fc.constant('18-24'), fc.constant('25-44'), fc.constant('45-64'), fc.constant('65+')),
          isFirstTimeVoter: fc.boolean(),
          preferredMethod: fc.oneof(fc.constant('in-person'), fc.constant('early'), fc.constant('mail')),
          language: fc.constant('en'),
          accessibilityNeeds: fc.array(fc.string()),
          lastUpdated: fc.date()
        }),
        (profile) => {
          const plan = generatePlan(profile as unknown as UserProfile);
          
          // Invariants
          expect(plan).toBeDefined();
          expect(plan?.tasks.length).toBeGreaterThan(0);
          expect(['high', 'medium', 'low']).toContain(plan?.riskLevel);
          expect(plan?.nextAction).toBeDefined();
        }
      ),
      { numRuns: 1000 } // Test 1000 random profiles
    );
  });
});
