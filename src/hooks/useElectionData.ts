'use client';
/**
 * @fileoverview useElectionData — SWR-style election data hook (EFF-02).
 *
 * Implements Stale-While-Revalidate caching: returns cached data immediately,
 * then revalidates in the background. Integrates with the Zustand store.
 *
 * @module hooks/useElectionData
 */

import { useEffect, useCallback, useState } from 'react';
import { useCivicStore } from '@/store';
import { generatePlan } from '@/utils/election-logic';
import type { PersonalizedPlan } from '@/types';

const REVALIDATION_INTERVAL_MS = 5 * 60 * 1000;

interface UseElectionDataReturn {
  plan: PersonalizedPlan | null;
  isLoading: boolean;
  isStale: boolean;
  revalidate: () => Promise<void>;
  error: Error | null;
}

/**
 * Returns the user's election plan with SWR-style caching.
 * Data is served from cache immediately; background revalidation updates it.
 *
 * @example
 * const { plan, isLoading, revalidate } = useElectionData();
 */
export function useElectionData(): UseElectionDataReturn {
  const profile = useCivicStore((s) => s.user.profile);
  const plan = useCivicStore((s) => s.election.plan);
  const isLoading = useCivicStore((s) => s.election.isLoading);
  const isElectionDataStale = useCivicStore((s) => s.isElectionDataStale);
  const setPlan = useCivicStore((s) => s.setPlan);
  const setLoading = useCivicStore((s) => s.setElectionLoading);
  const [error, setError] = useState<Error | null>(null);

  const revalidate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate async plan generation (in prod, this would be a server fetch)
      await new Promise((r) => setTimeout(r, 0));
      const newPlan = generatePlan(profile);
      if (newPlan) setPlan(newPlan);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load election data'));
    } finally {
      setLoading(false);
    }
  }, [profile, setPlan, setLoading]);

  // Initial load + background revalidation
  useEffect(() => {
    if (isElectionDataStale()) {
      revalidate();
    }

    const interval = setInterval(() => {
      if (isElectionDataStale()) revalidate();
    }, REVALIDATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isElectionDataStale, revalidate]);

  return { plan, isLoading, isStale: isElectionDataStale(), revalidate, error };
}
