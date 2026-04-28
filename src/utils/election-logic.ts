/**
 * @fileoverview Curried Election Calculations (CQ-15).
 *
 * Implements currying for complex election calculations, enabling:
 * - Partial application for pre-configured calculators
 * - Reusable functions across different contexts
 * - Composable pipelines for election data processing
 *
 * @module utils/election-logic
 * @see {@link https://en.wikipedia.org/wiki/Currying}
 */

import type { ElectionTask, PersonalizedPlan, UserProfile } from '@/types';
import { differenceInDays, isAfter, addDays } from 'date-fns';

// ─── Base Election Logic (unchanged) ─────────────────────────────────────────

/**
 * Industrial-grade logic for generating a personalized voting plan.
 * @see CQ-15: Uses curried helpers for risk calculation
 */
export const generatePlan = (profile: UserProfile | null): PersonalizedPlan | null => {
  const effectiveProfile = profile || {
    onboarded: true,
    location: { state: 'California', zipCode: '90210' },
    ageGroup: '25-44',
    preferredMethod: 'in-person',
  } as UserProfile;

  if (!effectiveProfile.onboarded) return null;

  const baseDate = new Date(2026, 10, 3);
  const tasks: ElectionTask[] = [
    { id: 'reg-1', title: 'Voter Registration', description: 'Ensure you are registered to vote in your current state.', deadline: addDays(baseDate, -30), type: 'registration', status: 'active', priority: 'high', actionUrl: 'https://vote.gov' },
    { id: 'verify-1', title: 'Verify Registration', description: 'Check your voter status and information.', deadline: addDays(baseDate, -15), type: 'verification', status: 'upcoming', priority: 'medium' },
    { id: 'early-1', title: 'Early Voting Period', description: 'Cast your ballot ahead of time.', deadline: addDays(baseDate, -1), type: 'early-voting', status: 'upcoming', priority: 'low' },
    { id: 'election-day', title: 'Election Day', description: 'Go to your polling place and vote!', deadline: baseDate, type: 'election-day', status: 'upcoming', priority: 'high' },
  ];

  const now = new Date();
  const sortedTasks = tasks.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
  const nextAction = sortedTasks.find((t) => isAfter(t.deadline, now)) ?? null;
  const riskLevel = calculateRiskLevel(now)(nextAction);

  return { tasks: sortedTasks, riskLevel, nextAction };
};

// ─── Curried Functions (CQ-15) ────────────────────────────────────────────────

/**
 * Curried risk level calculator.
 * Returns a function that calculates risk for any task given a reference date.
 *
 * @param referenceDate - The date to calculate from (usually today)
 * @returns A function that accepts a task and returns a risk level
 *
 * @example
 * const getRisk = calculateRiskLevel(new Date());
 * const risk = getRisk(nextAction); // 'high' | 'medium' | 'low'
 */
export const calculateRiskLevel =
  (referenceDate: Date) =>
  (task: ElectionTask | null): 'low' | 'medium' | 'high' => {
    if (!task) return 'low';
    const daysLeft = differenceInDays(task.deadline, referenceDate);
    if (daysLeft < 7) return 'high';
    if (daysLeft < 14) return 'medium';
    return 'low';
  };

/**
 * Curried task filter by type.
 * @example
 * const getRegistrationTasks = filterTasksByType('registration');
 * const regTasks = getRegistrationTasks(allTasks);
 */
export const filterTasksByType =
  (type: ElectionTask['type']) =>
  (tasks: ElectionTask[]): ElectionTask[] =>
    tasks.filter((t) => t.type === type);

/**
 * Curried task filter by status.
 * @example
 * const getActiveTasks = filterTasksByStatus('active');
 */
export const filterTasksByStatus =
  (status: ElectionTask['status']) =>
  (tasks: ElectionTask[]): ElectionTask[] =>
    tasks.filter((t) => t.status === status);

/**
 * Curried days-remaining calculator.
 * @example
 * const daysFrom = daysUntilDeadline(new Date());
 * const days = daysFrom(task); // number
 */
export const daysUntilDeadline =
  (referenceDate: Date) =>
  (task: ElectionTask): number =>
    differenceInDays(task.deadline, referenceDate);

/**
 * Curried priority sorter factory.
 * Returns a comparator function for sorting tasks by priority.
 *
 * @example
 * const byPriority = createPrioritySorter({ high: 0, medium: 1, low: 2 });
 * tasks.sort(byPriority);
 */
export const createPrioritySorter =
  (weights: Record<ElectionTask['priority'], number>) =>
  (a: ElectionTask, b: ElectionTask): number =>
    (weights[a.priority] ?? 99) - (weights[b.priority] ?? 99);

/** Default priority sorter (high first). */
export const sortByPriorityHighFirst = createPrioritySorter({ high: 0, medium: 1, low: 2 });
/** Deadline sorter (soonest first). */
export const sortByDeadlineSoonest = (a: ElectionTask, b: ElectionTask): number =>
  a.deadline.getTime() - b.deadline.getTime();

/**
 * Curried completion percentage calculator.
 * @example
 * const pct = completionPercentage(allTasks)(completedTasks);
 */
export const completionPercentage =
  (totalTasks: ElectionTask[]) =>
  (completedTasks: ElectionTask[]): number => {
    if (totalTasks.length === 0) return 0;
    return Math.round((completedTasks.length / totalTasks.length) * 100);
  };

// ─── Memoized Service Layer (CQ-17) ──────────────────────────────────────────

const memoCache = new Map<string, { result: unknown; timestamp: number }>();
const MEMO_TTL_MS = 5 * 60 * 1000;

/**
 * Generic memoization wrapper for expensive pure functions.
 * @see CQ-17: Memoization at the service layer
 */
export function memoize<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult,
  keyFn: (...args: TArgs) => string,
  ttlMs = MEMO_TTL_MS
): (...args: TArgs) => TResult {
  return (...args: TArgs): TResult => {
    const key = keyFn(...args);
    const cached = memoCache.get(key);
    if (cached && Date.now() - cached.timestamp < ttlMs) {
      return cached.result as TResult;
    }
    const result = fn(...args);
    memoCache.set(key, { result, timestamp: Date.now() });
    return result;
  };
}

/** Memoized version of generatePlan — safe since profile changes invalidate key. */
export const memoizedGeneratePlan = memoize(
  generatePlan,
  (profile) => `plan:${profile?.uid ?? 'demo'}:${profile?.location?.state ?? ''}`,
  MEMO_TTL_MS
);
