import { describe, it, expect } from 'vitest';
import { addDays, differenceInDays } from 'date-fns';
import { UserProfileSchema, PollingStationSchema } from '../types';

// Logic to test
function calculateRisk(deadline: Date, now: Date) {
  const daysLeft = differenceInDays(deadline, now);
  if (daysLeft < 7) return 'high';
  if (daysLeft < 14) return 'medium';
  return 'low';
}

describe('CivicFlow Logic Engine', () => {
  describe('Risk Assessment', () => {
    it('should return high risk if deadline is less than 7 days away', () => {
      const now = new Date();
      const deadline = addDays(now, 5);
      expect(calculateRisk(deadline, now)).toBe('high');
    });

    it('should return medium risk if deadline is 10 days away', () => {
      const now = new Date();
      const deadline = addDays(now, 10);
      expect(calculateRisk(deadline, now)).toBe('medium');
    });
  });

  describe('Data Integrity (Zod Schemas)', () => {
    it('should validate a correct user profile', () => {
      const validProfile = {
        uid: "user-123",
        email: "test@example.com",
        displayName: "John Doe",
        onboarded: true,
        location: { state: "CA", zipCode: "90210" },
        ageGroup: '25-44',
        isFirstTimeVoter: false,
        preferredMethod: 'in-person',
        language: 'en',
        accessibilityNeeds: [],
        lastUpdated: new Date()
      };
      const result = UserProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it('should reject a profile with an invalid zip code', () => {
      const invalidProfile = {
        uid: "user-123",
        email: "test@example.com",
        displayName: "John Doe",
        location: { state: "CA", zipCode: "9021" }, // 4 digits only
      };
      const result = UserProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it('should validate a correct polling station', () => {
      const validStation = {
        id: "station-1",
        name: "Community Center",
        address: "123 Main St",
        location: { lat: 34.0, lng: -118.0 },
        hours: "7 AM - 8 PM",
        accessibility: ["Wheelchair"]
      };
      const result = PollingStationSchema.safeParse(validStation);
      expect(result.success).toBe(true);
    });
  });
});
