/**
 * @fileoverview Model Versioning for A/B testing prompts (AI-24).
 *
 * Enables controlled A/B testing of AI models and prompt configurations
 * without deploying new code. Uses user UID hashing for consistent assignment.
 *
 * @module core/model-versioning
 */

export type ModelVariant = {
  id: string;
  model: 'gemini-2.0-flash' | 'gemini-1.5-pro';
  temperature: number;
  systemPromptVariant: 'default' | 'concise' | 'detailed';
  weight: number; // percentage of traffic (0-100)
};

const MODEL_VARIANTS: ModelVariant[] = [
  { id: 'control', model: 'gemini-2.0-flash', temperature: 0.2, systemPromptVariant: 'default', weight: 70 },
  { id: 'concise-flash', model: 'gemini-2.0-flash', temperature: 0.1, systemPromptVariant: 'concise', weight: 15 },
  { id: 'pro-detailed', model: 'gemini-1.5-pro', temperature: 0.2, systemPromptVariant: 'detailed', weight: 15 },
];

/** Deterministically assigns a variant based on the user's UID hash. */
function hashToPercent(uid: string): number {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = ((hash << 5) - hash + uid.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 100;
}

/**
 * Returns the A/B test variant for a given user.
 * Assignment is deterministic — the same user always gets the same variant.
 *
 * @param uid - Firebase Auth UID
 * @returns The assigned {@link ModelVariant}
 */
export function getVariantForUser(uid: string): ModelVariant {
  const percent = hashToPercent(uid);
  let cumulative = 0;
  for (const variant of MODEL_VARIANTS) {
    cumulative += variant.weight;
    if (percent < cumulative) return variant;
  }
  return MODEL_VARIANTS[0];
}

/** Returns all registered variants (for the admin dashboard). */
export function getAllVariants(): ModelVariant[] { return MODEL_VARIANTS; }

/** Registers a new variant programmatically (for runtime experiments). */
export function registerVariant(variant: ModelVariant): void {
  const existing = MODEL_VARIANTS.findIndex((v) => v.id === variant.id);
  if (existing >= 0) MODEL_VARIANTS[existing] = variant;
  else MODEL_VARIANTS.push(variant);
}
