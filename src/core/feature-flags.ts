/**
 * @fileoverview Feature Flag System for CivicFlow
 *
 * Provides controlled feature rollouts using a multi-source evaluation model:
 * 1. Remote config (Firestore `feature_flags` collection)
 * 2. Environment variables (for CI/CD pipeline control)
 * 3. Local defaults (always-available fallback)
 *
 * Flags are evaluated at runtime without a page reload, enabling progressive
 * delivery, A/B testing, and safe emergency disablement.
 *
 * @module core/feature-flags
 * @see {@link IFeatureFlagService}
 * @see {@link core/ports}
 */

import type { FeatureFlagKey } from '@/core/ports';

// ─── Default Flag Configuration ───────────────────────────────────────────────

/**
 * Default feature flag values — the "safe off" state.
 * All flags are disabled by default and must be explicitly enabled.
 *
 * Edit these to control what is on in each environment.
 */
const DEFAULT_FLAGS: Record<FeatureFlagKey, boolean> = {
  ai_multimodal: true,          // CQ-11 / AI-03: Voter ID image upload
  vertex_ai: false,             // AI-18: Vertex AI (requires enterprise setup)
  gemini_1_5_pro: true,         // AI-02: Gemini 1.5 Pro for legal analysis
  search_grounding: true,       // AI-15: Search grounding for real-time news
  voice_recognition: true,      // A11Y-03: Web Speech API for ZIP input
  ppr_dashboard: true,          // EFF-01: Partial Prerendering
  wasm_election_logic: false,   // EFF-03: WASM (experimental)
  ai_feedback_loop: true,       // AI-16: Thumbs up/down feedback
  cost_tracking: true,          // AI-23: Token/cost dashboard
  model_ab_testing: false,      // AI-24: A/B testing (requires backend)
};

// ─── Environment Override Layer ───────────────────────────────────────────────

function getEnvFlags(): Partial<Record<FeatureFlagKey, boolean>> {
  const overrides: Partial<Record<FeatureFlagKey, boolean>> = {};
  const keys = Object.keys(DEFAULT_FLAGS) as FeatureFlagKey[];

  for (const key of keys) {
    const envKey = `NEXT_PUBLIC_FLAG_${key.toUpperCase()}`;
    const envVal = process.env[envKey];
    if (envVal !== undefined) {
      overrides[key] = envVal === 'true' || envVal === '1';
    }
  }

  return overrides;
}

// ─── Remote Config (Firestore) ────────────────────────────────────────────────

type RemoteFlags = Partial<Record<FeatureFlagKey, boolean>>;

let remoteFlags: RemoteFlags = {};
let lastFetched = 0;
const REMOTE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches feature flags from Firestore `feature_flags/global` document.
 * Results are cached for 5 minutes to minimize database reads.
 */
export async function refreshRemoteFlags(): Promise<void> {
  if (Date.now() - lastFetched < REMOTE_TTL_MS) return;

  try {
    // Dynamic import to avoid circular dependencies
    const { db } = await import('@/lib/firebase');
    if (!db) return;

    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'feature_flags', 'global'));
    if (snap.exists()) {
      remoteFlags = snap.data() as RemoteFlags;
      lastFetched = Date.now();
    }
  } catch {
    // Remote flags are optional — silently fall back to defaults
  }
}

// ─── FeatureFlagService (Singleton) ──────────────────────────────────────────

/**
 * The CivicFlow feature flag service.
 *
 * Evaluation priority: Remote Config > Env Variables > Default
 *
 * @example
 * if (FeatureFlagService.isEnabled('ai_multimodal')) {
 *   // show voter ID upload
 * }
 */
export const FeatureFlagService = {
  /**
   * Returns true if a feature flag is currently enabled.
   * @param key - One of the known {@link FeatureFlagKey} identifiers.
   */
  isEnabled(key: FeatureFlagKey): boolean {
    const envFlags = getEnvFlags();
    // Evaluation order: remote → env → default
    if (key in remoteFlags) return !!remoteFlags[key];
    if (key in envFlags) return !!envFlags[key];
    return DEFAULT_FLAGS[key] ?? false;
  },

  /**
   * Returns a typed value associated with a flag (for multi-variant flags).
   * @template T - Expected value type.
   */
  getValue<T>(key: FeatureFlagKey): T | undefined {
    return (remoteFlags[key] as unknown as T) ?? undefined;
  },

  /**
   * Returns a snapshot of all currently resolved flag values.
   * Useful for debugging and the admin dashboard.
   */
  getAllFlags(): Record<FeatureFlagKey, boolean> {
    const envFlags = getEnvFlags();
    const result = { ...DEFAULT_FLAGS };
    for (const key of Object.keys(DEFAULT_FLAGS) as FeatureFlagKey[]) {
      if (key in remoteFlags) result[key] = !!remoteFlags[key];
      else if (key in envFlags) result[key] = !!envFlags[key];
    }
    return result;
  },
} as const;

// Export the type for use in context/hooks
export type { FeatureFlagKey };
