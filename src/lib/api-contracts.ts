import { z } from 'zod';

/**
 * CODE-03: Unified API Contracts.
 * Shared Zod schemas for client and server validation.
 */

export const ChatRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    parts: z.array(z.object({ text: z.string() }))
  })).optional(),
  state: z.string().optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const VoterProfileUpdateSchema = z.object({
  location: z.object({
    state: z.string(),
    zipCode: z.string().length(5),
  }).optional(),
  preferredMethod: z.enum(['in-person', 'early', 'mail']).optional(),
  onboarded: z.boolean().optional(),
});

export type VoterProfileUpdate = z.infer<typeof VoterProfileUpdateSchema>;
