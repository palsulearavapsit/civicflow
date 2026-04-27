import { describe, it, expect, vi } from 'vitest';
import { generatePlan } from './election-logic';
import { UserProfile } from '@/types';

describe('generatePlan', () => {
  const mockProfile: UserProfile = {
    uid: 'test-user-id-12345678',
    email: 'test@example.com',
    displayName: 'Test User',
    onboarded: true,
    location: { state: 'California', zipCode: '90210' },
    ageGroup: '25-44',
    isFirstTimeVoter: false,
    preferredMethod: 'in-person',
    language: 'en',
    accessibilityNeeds: [],
    lastUpdated: new Date()
  };

  it('should return null if user is not onboarded', () => {
    const nonOnboarded = { ...mockProfile, onboarded: false };
    expect(generatePlan(nonOnboarded)).toBeNull();
  });

  it('should generate exactly 4 tasks for a standard user', () => {
    const plan = generatePlan(mockProfile);
    expect(plan?.tasks).toHaveLength(4);
  });

  it('should calculate "high" risk if next action is within 7 days', () => {
    // Mock date to be 6 days before election day (Nov 3, 2026)
    vi.setSystemTime(new Date(2026, 9, 28)); 
    const plan = generatePlan(mockProfile);
    expect(plan?.riskLevel).toBe('high');
    vi.useRealTimers();
  });

  it('should calculate "medium" risk if next action is within 14 days', () => {
    // Mock date to be 10 days before election day
    vi.setSystemTime(new Date(2026, 9, 24));
    const plan = generatePlan(mockProfile);
    expect(plan?.riskLevel).toBe('medium');
    vi.useRealTimers();
  });

  it('should sort tasks by deadline', () => {
    const plan = generatePlan(mockProfile);
    const deadlines = plan?.tasks.map(t => t.deadline.getTime());
    const sortedDeadlines = [...(deadlines || [])].sort((a, b) => a - b);
    expect(deadlines).toEqual(sortedDeadlines);
  });
});
