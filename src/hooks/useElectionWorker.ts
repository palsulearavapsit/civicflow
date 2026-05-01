import { useState, useEffect, useCallback } from 'react';
import { PersonalizedPlan, UserProfile } from '@/types';

/**
 * EFF-16: Hook to interface with the Election Web Worker.
 */
export const useElectionWorker = (profile: UserProfile | null) => {
  const [plan, setPlan] = useState<PersonalizedPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const calculatePlan = useCallback((userProfile: UserProfile | null) => {
    setLoading(true);
    const worker = new Worker(new URL('../workers/election.worker.ts', import.meta.url));
    
    worker.onmessage = (e: MessageEvent<PersonalizedPlan | null>) => {
      setPlan(e.data);
      setLoading(false);
      worker.terminate();
    };

    worker.onerror = (err) => {
      console.error('Worker Error:', err);
      setLoading(false);
      worker.terminate();
    };

    worker.postMessage(userProfile);
  }, []);

  useEffect(() => {
    if (profile) {
      calculatePlan(profile);
    }
  }, [profile, calculatePlan]);

  return { plan, loading, recalculate: () => calculatePlan(profile) };
};
