import { describe, it, expect } from 'vitest';
import { generatePlan } from './election-logic';

describe('Performance: generatePlan', () => {
  it('should execute in under 10ms for a standard profile (Master Goal)', () => {
    const start = performance.now();
    
    // Run 100 times to get a stable average
    for(let i = 0; i < 100; i++) {
      generatePlan({
        uid: 'user-' + i,
        onboarded: true,
        location: { state: 'California', zipCode: '90210' },
        ageGroup: '25-44',
        preferredMethod: 'in-person',
        language: 'en',
        accessibilityNeeds: [],
        email: 'test@example.com',

        displayName: 'Test User',
        isFirstTimeVoter: false,
        lastUpdated: new Date()
      });

    }
    
    const end = performance.now();
    const average = (end - start) / 100;
    
    console.log(`Average execution time: ${average.toFixed(4)}ms`);
    expect(average).toBeLessThan(10); 
  });
});
