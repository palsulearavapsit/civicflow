import { z } from "zod";

// --- SCHEMAS ---

export const LocationSchema = z.object({
  state: z.string(),
  county: z.string().optional(),
  zipCode: z.string().regex(/^\d{5}$/, "Invalid Zip Code"),
});

export const UserProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email().nullable(),
  displayName: z.string().min(2).nullable(),
  onboarded: z.boolean().default(false),
  location: LocationSchema,
  ageGroup: z.enum(['18-24', '25-44', '45-64', '65+']).default('25-44'),
  isFirstTimeVoter: z.boolean().default(false),
  preferredMethod: z.enum(['in-person', 'early', 'mail']).default('in-person'),
  language: z.string().default('en'),
  accessibilityNeeds: z.array(z.string()).default([]),
  lastUpdated: z.any(),
});

export const ElectionTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  deadline: z.date(),
  type: z.enum(['registration', 'verification', 'early-voting', 'election-day', 'results']),
  status: z.enum(['upcoming', 'active', 'closed', 'completed']),
  actionUrl: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
});

export const PollingStationSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  hours: z.string(),
  accessibility: z.array(z.string()),
  distance: z.number().optional(),
});

// --- TYPES ---

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type ElectionTask = z.infer<typeof ElectionTaskSchema>;
export type PollingStation = z.infer<typeof PollingStationSchema>;

export interface PersonalizedPlan {
  tasks: ElectionTask[];
  riskLevel: 'low' | 'medium' | 'high';
  nextAction: ElectionTask | null;
}

export interface MythFact {
  id: string;
  myth: string;
  fact: string;
  source: string;
  sourceUrl: string;
  category: string;
}
