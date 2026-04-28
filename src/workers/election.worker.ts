/**
 * @fileoverview Web Worker for background election data processing (EFF-14).
 *
 * Offloads heavy computations to a background thread so the UI thread
 * remains responsive. Handles:
 * - Election plan generation for large task lists
 * - Sorting and filtering operations
 * - Token estimation for large prompts
 *
 * @module workers/election.worker
 */

/// <reference lib="webworker" />

import type { UserProfile, ElectionTask, PersonalizedPlan } from '../types';
import { differenceInDays, isAfter, addDays } from 'date-fns';

// ─── Message Types ────────────────────────────────────────────────────────────

type WorkerRequest =
  | { type: 'GENERATE_PLAN'; payload: { profile: UserProfile } }
  | { type: 'FILTER_TASKS'; payload: { tasks: ElectionTask[]; filter: string } }
  | { type: 'ESTIMATE_TOKENS'; payload: { text: string } };

type WorkerResponse =
  | { type: 'PLAN_GENERATED'; payload: PersonalizedPlan | null; requestId: string }
  | { type: 'TASKS_FILTERED'; payload: ElectionTask[]; requestId: string }
  | { type: 'TOKENS_ESTIMATED'; payload: number; requestId: string }
  | { type: 'ERROR'; error: string; requestId: string };

// ─── Worker Logic ─────────────────────────────────────────────────────────────

function generatePlanInWorker(profile: UserProfile): PersonalizedPlan | null {
  if (!profile.onboarded) return null;

  const baseDate = new Date(2026, 10, 3);
  const tasks: ElectionTask[] = [
    { id: 'reg-1', title: 'Voter Registration', description: 'Ensure you are registered', deadline: addDays(baseDate, -30), type: 'registration', status: 'active', priority: 'high', actionUrl: 'https://vote.gov' },
    { id: 'verify-1', title: 'Verify Registration', description: 'Check your voter status', deadline: addDays(baseDate, -15), type: 'verification', status: 'upcoming', priority: 'medium' },
    { id: 'early-1', title: 'Early Voting Period', description: 'Cast ballot early', deadline: addDays(baseDate, -1), type: 'early-voting', status: 'upcoming', priority: 'low' },
    { id: 'election-day', title: 'Election Day', description: 'Go vote!', deadline: baseDate, type: 'election-day', status: 'upcoming', priority: 'high' },
  ];

  const now = new Date();
  const sortedTasks = tasks.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
  const nextAction = sortedTasks.find((t) => isAfter(t.deadline, now)) ?? null;

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (nextAction) {
    const daysLeft = differenceInDays(nextAction.deadline, now);
    if (daysLeft < 7) riskLevel = 'high';
    else if (daysLeft < 14) riskLevel = 'medium';
  }

  return { tasks: sortedTasks, riskLevel, nextAction };
}

function estimateTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).length * 4);
}

// ─── Message Handler ──────────────────────────────────────────────────────────

self.addEventListener('message', (event: MessageEvent<WorkerRequest & { requestId: string }>) => {
  const { type, requestId } = event.data;

  try {
    switch (type) {
      case 'GENERATE_PLAN': {
        const plan = generatePlanInWorker(event.data.payload.profile);
        self.postMessage({ type: 'PLAN_GENERATED', payload: plan, requestId } satisfies WorkerResponse);
        break;
      }
      case 'FILTER_TASKS': {
        const { tasks, filter } = event.data.payload;
        const filtered = tasks.filter((t) =>
          t.title.toLowerCase().includes(filter.toLowerCase()) ||
          t.description.toLowerCase().includes(filter.toLowerCase())
        );
        self.postMessage({ type: 'TASKS_FILTERED', payload: filtered, requestId } satisfies WorkerResponse);
        break;
      }
      case 'ESTIMATE_TOKENS': {
        const tokens = estimateTokens(event.data.payload.text);
        self.postMessage({ type: 'TOKENS_ESTIMATED', payload: tokens, requestId } satisfies WorkerResponse);
        break;
      }
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Worker error',
      requestId,
    } satisfies WorkerResponse);
  }
});
