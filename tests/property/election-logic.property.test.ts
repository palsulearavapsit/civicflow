/**
 * Property-Based Tests for election calculations (TEST-04).
 * Uses fast-check to verify election logic invariants hold for all inputs.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generatePlan } from '@/utils/election-logic';
import { cosineSimilarity } from '@/utils/embeddings';
import type { UserProfile } from '@/types';

const arbitraryProfile = (): fc.Arbitrary<UserProfile> =>
  fc.record({
    uid: fc.string({ minLength: 10, maxLength: 20 }),
    email: fc.emailAddress().map((e) => e),
    displayName: fc.string({ minLength: 2, maxLength: 50 }),
    onboarded: fc.constant(true),
    location: fc.record({
      state: fc.constantFrom('California', 'Texas', 'Florida', 'New York', 'Georgia'),
      zipCode: fc.stringMatching(/^\d{5}$/),
      county: fc.option(fc.string({ minLength: 2, maxLength: 30 }), { nil: undefined }),
    }),
    ageGroup: fc.constantFrom('18-24', '25-44', '45-64', '65+') as fc.Arbitrary<UserProfile['ageGroup']>,
    isFirstTimeVoter: fc.boolean(),
    preferredMethod: fc.constantFrom('in-person', 'early', 'mail') as fc.Arbitrary<UserProfile['preferredMethod']>,
    language: fc.constantFrom('en', 'es', 'zh', 'fr'),
    accessibilityNeeds: fc.array(fc.string(), { maxLength: 3 }),
    lastUpdated: fc.option(fc.date(), { nil: undefined }),
  });

describe('Property-Based Testing — Election Logic', () => {
  it('generatePlan always returns a plan for onboarded users', () => {
    fc.assert(
      fc.property(arbitraryProfile(), (profile) => {
        const plan = generatePlan(profile);
        expect(plan).not.toBeNull();
        expect(plan?.tasks.length).toBeGreaterThan(0);
      }),
      { numRuns: 50 }
    );
  });

  it('plan tasks are always sorted by deadline (ascending)', () => {
    fc.assert(
      fc.property(arbitraryProfile(), (profile) => {
        const plan = generatePlan(profile);
        if (!plan) return;
        for (let i = 1; i < plan.tasks.length; i++) {
          expect(plan.tasks[i].deadline.getTime()).toBeGreaterThanOrEqual(
            plan.tasks[i - 1].deadline.getTime()
          );
        }
      }),
      { numRuns: 50 }
    );
  });

  it('riskLevel is always one of low|medium|high', () => {
    fc.assert(
      fc.property(arbitraryProfile(), (profile) => {
        const plan = generatePlan(profile);
        if (!plan) return;
        expect(['low', 'medium', 'high']).toContain(plan.riskLevel);
      }),
      { numRuns: 50 }
    );
  });

  it('nextAction is always in the task list or null', () => {
    fc.assert(
      fc.property(arbitraryProfile(), (profile) => {
        const plan = generatePlan(profile);
        if (!plan || !plan.nextAction) return;
        const ids = plan.tasks.map((t) => t.id);
        expect(ids).toContain(plan.nextAction.id);
      }),
      { numRuns: 50 }
    );
  });

  it('generatePlan returns null for non-onboarded profiles', () => {
    fc.assert(
      fc.property(
        arbitraryProfile().map((p) => ({ ...p, onboarded: false })),
        (profile) => {
          const plan = generatePlan(profile);
          expect(plan).toBeNull();
        }
      ),
      { numRuns: 20 }
    );
  });
});

describe('Property-Based Testing — Cosine Similarity', () => {
  it('similarity of identical vectors is 1', () => {
    fc.assert(
      fc.property(fc.array(fc.float({ noNaN: true, min: -1, max: 1 }), { minLength: 5, maxLength: 20 }), (vec) => {
        const sim = cosineSimilarity(vec, vec);
        expect(sim).toBeCloseTo(1, 5);
      }),
      { numRuns: 30 }
    );
  });

  it('similarity is between -1 and 1 for all valid vectors', () => {
    fc.assert(
      fc.property(
        fc.array(fc.float({ noNaN: true, min: -10, max: 10 }), { minLength: 5, maxLength: 20 }),
        fc.array(fc.float({ noNaN: true, min: -10, max: 10 }), { minLength: 5, maxLength: 20 }),
        (a, b) => {
          const len = Math.min(a.length, b.length);
          const sim = cosineSimilarity(a.slice(0, len), b.slice(0, len));
          expect(sim).toBeGreaterThanOrEqual(-1 - 1e-9);
          expect(sim).toBeLessThanOrEqual(1 + 1e-9);
        }
      ),
      { numRuns: 30 }
    );
  });
});
