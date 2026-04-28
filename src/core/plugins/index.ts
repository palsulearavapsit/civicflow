/**
 * @fileoverview Plugin Architecture for CivicFlow Voting Methods.
 *
 * Allows new voting method calculators to be registered at runtime without
 * modifying core application code. Each plugin encapsulates:
 * - metadata (id, name, description)
 * - eligibility check
 * - step generator
 *
 * @module core/plugins
 * @see {@link https://refactoring.guru/design-patterns/strategy}
 */

import type { UserProfile } from '@/types';
import type { Result } from '@/types/result';
import { ok, err } from '@/types/result';
import { PluginError } from '@/core/errors';

// ─── Plugin Interface ─────────────────────────────────────────────────────────

export interface VotingMethodStep {
  id: string;
  title: string;
  description: string;
  actionUrl?: string;
  requiredBy?: Date;
}

/**
 * A plugin that implements a specific voting method (e.g., mail-in, early, in-person).
 */
export interface IVotingMethodPlugin {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  /** Returns true if this voting method is available for the given profile. */
  isEligible(profile: UserProfile): boolean;
  /** Generates ordered steps for this voting method. */
  getSteps(profile: UserProfile): VotingMethodStep[];
  /** Returns estimated time commitment in minutes. */
  estimatedTimeMinutes: number;
}

// ─── Plugin Registry ──────────────────────────────────────────────────────────

const registry = new Map<string, IVotingMethodPlugin>();

/**
 * Plugin Registry — register, lookup, and enumerate all voting method plugins.
 */
export const VotingMethodPluginRegistry = {
  /**
   * Registers a new plugin. Throws if a plugin with the same ID already exists.
   */
  register(plugin: IVotingMethodPlugin): Result<void, PluginError> {
    if (registry.has(plugin.id)) {
      return err(new PluginError(plugin.id, `Plugin with id '${plugin.id}' is already registered`));
    }
    registry.set(plugin.id, plugin);
    return ok(undefined);
  },

  /** Returns a plugin by ID, or undefined if not found. */
  get(id: string): IVotingMethodPlugin | undefined {
    return registry.get(id);
  },

  /** Returns all registered plugins. */
  getAll(): IVotingMethodPlugin[] {
    return Array.from(registry.values());
  },

  /** Returns only the plugins the given user is eligible for. */
  getEligible(profile: UserProfile): IVotingMethodPlugin[] {
    return this.getAll().filter((p) => {
      try { return p.isEligible(profile); }
      catch { return false; }
    });
  },

  /** Removes a plugin by ID (useful for testing). */
  unregister(id: string): void {
    registry.delete(id);
  },

  /** Clears all plugins (use in tests only). */
  clear(): void {
    registry.clear();
  },
};

// ─── Built-in Plugins ─────────────────────────────────────────────────────────

const InPersonVotingPlugin: IVotingMethodPlugin = {
  id: 'in-person',
  name: 'In-Person Voting',
  description: 'Vote at your designated polling place on Election Day.',
  icon: '🗳️',
  estimatedTimeMinutes: 30,
  isEligible: () => true,
  getSteps: (profile) => [
    { id: 'register', title: 'Confirm Registration', description: `Verify you are registered in ${profile.location.state}`, actionUrl: 'https://vote.gov/register/', requiredBy: new Date('2026-10-04') },
    { id: 'find-poll', title: 'Find Your Polling Place', description: 'Use the map to locate your assigned polling station', actionUrl: '/map' },
    { id: 'vote', title: 'Vote on Election Day', description: 'Bring valid ID and visit your polling place', requiredBy: new Date('2026-11-03') },
  ],
};

const MailInVotingPlugin: IVotingMethodPlugin = {
  id: 'mail-in',
  name: 'Mail-In / Absentee Voting',
  description: 'Request and return a ballot by mail from home.',
  icon: '✉️',
  estimatedTimeMinutes: 20,
  isEligible: (profile) => profile.preferredMethod === 'mail' || profile.ageGroup === '65+',
  getSteps: (profile) => [
    { id: 'request', title: 'Request Mail-In Ballot', description: `Apply for a mail-in ballot in ${profile.location.state}`, actionUrl: 'https://vote.gov/absentee/', requiredBy: new Date('2026-10-20') },
    { id: 'complete', title: 'Complete Your Ballot', description: 'Fill in your ballot carefully at home' },
    { id: 'return', title: 'Return Your Ballot', description: 'Mail or drop off at an official dropbox by the deadline', requiredBy: new Date('2026-11-03') },
  ],
};

const EarlyVotingPlugin: IVotingMethodPlugin = {
  id: 'early',
  name: 'Early Voting',
  description: 'Vote before Election Day at an early voting center.',
  icon: '⏰',
  estimatedTimeMinutes: 25,
  isEligible: (profile) => profile.preferredMethod === 'early',
  getSteps: () => [
    { id: 'check-dates', title: 'Check Early Voting Dates', description: 'Early voting typically opens 1–2 weeks before Election Day', actionUrl: 'https://vote.gov/' },
    { id: 'find-center', title: 'Find an Early Voting Center', description: 'Early voting centers differ from your Election Day polling place', actionUrl: '/map' },
    { id: 'vote-early', title: 'Vote Early', description: 'No appointment needed — just bring valid ID', requiredBy: new Date('2026-11-01') },
  ],
};

// Register built-in plugins
VotingMethodPluginRegistry.register(InPersonVotingPlugin);
VotingMethodPluginRegistry.register(MailInVotingPlugin);
VotingMethodPluginRegistry.register(EarlyVotingPlugin);
