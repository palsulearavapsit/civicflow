import { generatePlan } from '../utils/election-logic';
import { UserProfile } from '../types';

/**
 * EFF-16: Web Worker for Election Logic.
 * Offloads heavy plan generation to a background thread to maintain 60fps.
 */
self.onmessage = (e: MessageEvent<UserProfile | null>) => {
  const profile = e.data;
  const plan = generatePlan(profile);
  self.postMessage(plan);
};
