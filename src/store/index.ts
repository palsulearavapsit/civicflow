/**
 * @fileoverview Zustand + Immer global state store for CivicFlow.
 *
 * Implements EFF-13 (Zustand) and CQ-09 (Immutability-first with Immer).
 * All state mutations go through Immer draft producers — the state is never
 * directly mutated, guaranteeing referential equality for unchanged slices.
 *
 * @module store
 * @see {@link https://github.com/pmndrs/zustand}
 * @see {@link https://immerjs.github.io/immer/}
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import type { UserProfile, ElectionTask, PersonalizedPlan } from '@/types';

// ─── State Slices ─────────────────────────────────────────────────────────────

interface UIState {
  isChatOpen: boolean;
  isOnboarding: boolean;
  activeModal: string | null;
  theme: 'dark' | 'light' | 'system';
  language: string;
}

interface ElectionState {
  plan: PersonalizedPlan | null;
  tasks: ElectionTask[];
  lastFetched: number | null;
  isLoading: boolean;
}

interface AIState {
  sessionTokensUsed: number;
  sessionTokenBudget: number;
  feedbackHistory: Array<{ interactionId: string; rating: 'positive' | 'negative' }>;
  activeModel: 'gemini-2.0-flash' | 'gemini-1.5-pro';
}

interface CivicFlowStore {
  // Slices
  ui: UIState;
  election: ElectionState;
  ai: AIState;
  user: { profile: UserProfile | null };

  // UI Actions
  openChat(): void;
  closeChat(): void;
  setActiveModal(id: string | null): void;
  setTheme(theme: UIState['theme']): void;
  setLanguage(lang: string): void;

  // Election Actions
  setPlan(plan: PersonalizedPlan): void;
  setElectionTasks(tasks: ElectionTask[]): void;
  markTaskComplete(taskId: string): void;
  setElectionLoading(loading: boolean): void;
  invalidateElectionCache(): void;

  // AI Actions
  consumeTokens(count: number): void;
  resetTokenBudget(): void;
  recordFeedback(interactionId: string, rating: 'positive' | 'negative'): void;
  switchModel(model: AIState['activeModel']): void;

  // User Actions
  setProfile(profile: UserProfile | null): void;
  updateProfileField<K extends keyof UserProfile>(key: K, value: UserProfile[K]): void;

  // Computed
  isTokenBudgetExhausted(): boolean;
  pendingTaskCount(): number;
  isElectionDataStale(): boolean;
}

// ─── Store Creation ───────────────────────────────────────────────────────────

const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export const useCivicStore = create<CivicFlowStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // ── Initial State ──
        ui: {
          isChatOpen: false,
          isOnboarding: false,
          activeModal: null,
          theme: 'system',
          language: 'en',
        },
        election: {
          plan: null,
          tasks: [],
          lastFetched: null,
          isLoading: false,
        },
        ai: {
          sessionTokensUsed: 0,
          sessionTokenBudget: 10000,
          feedbackHistory: [],
          activeModel: 'gemini-2.0-flash',
        },
        user: { profile: null },

        // ── UI Actions ──
        openChat: () => set((state) => { state.ui.isChatOpen = true; }),
        closeChat: () => set((state) => { state.ui.isChatOpen = false; }),
        setActiveModal: (id) => set((state) => { state.ui.activeModal = id; }),
        setTheme: (theme) => set((state) => { state.ui.theme = theme; }),
        setLanguage: (lang) => set((state) => { state.ui.language = lang; }),

        // ── Election Actions ──
        setPlan: (plan) => set((state) => {
          state.election.plan = plan;
          state.election.lastFetched = Date.now();
        }),
        setElectionTasks: (tasks) => set((state) => {
          state.election.tasks = tasks;
          state.election.lastFetched = Date.now();
        }),
        markTaskComplete: (taskId) => set((state) => {
          const task = state.election.tasks.find((t) => t.id === taskId);
          if (task) task.status = 'completed';
        }),
        setElectionLoading: (loading) => set((state) => { state.election.isLoading = loading; }),
        invalidateElectionCache: () => set((state) => { state.election.lastFetched = null; }),

        // ── AI Actions ──
        consumeTokens: (count) => set((state) => { state.ai.sessionTokensUsed += count; }),
        resetTokenBudget: () => set((state) => { state.ai.sessionTokensUsed = 0; }),
        recordFeedback: (interactionId, rating) => set((state) => {
          state.ai.feedbackHistory.push({ interactionId, rating });
        }),
        switchModel: (model) => set((state) => { state.ai.activeModel = model; }),

        // ── User Actions ──
        setProfile: (profile) => set((state) => { state.user.profile = profile; }),
        updateProfileField: (key, value) => set((state) => {
          if (state.user.profile) {
            (state.user.profile as Record<string, unknown>)[key as string] = value;
          }
        }),

        // ── Computed ──
        isTokenBudgetExhausted: () => {
          const { sessionTokensUsed, sessionTokenBudget } = get().ai;
          return sessionTokensUsed >= sessionTokenBudget;
        },
        pendingTaskCount: () =>
          get().election.tasks.filter((t) => t.status !== 'completed').length,
        isElectionDataStale: () => {
          const { lastFetched } = get().election;
          if (!lastFetched) return true;
          return Date.now() - lastFetched > STALE_THRESHOLD_MS;
        },
      })),
      {
        name: 'civicflow-store',
        storage: createJSONStorage(() =>
          typeof window !== 'undefined' ? localStorage : {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        ),
        // Only persist UI preferences and AI settings, not sensitive data
        partialize: (state) => ({
          ui: { theme: state.ui.theme, language: state.ui.language },
          ai: { sessionTokenBudget: state.ai.sessionTokenBudget, activeModel: state.ai.activeModel },
        }),
      }
    ),
    { name: 'CivicFlowStore', enabled: process.env.NODE_ENV === 'development' }
  )
);

// ─── Selector Hooks ───────────────────────────────────────────────────────────

/** Returns the current user profile from the store. */
export const useProfile = () => useCivicStore((s) => s.user.profile);
/** Returns the current election plan. */
export const useElectionPlan = () => useCivicStore((s) => s.election.plan);
/** Returns the AI token usage ratio (0–1). */
export const useTokenUsageRatio = () =>
  useCivicStore((s) => s.ai.sessionTokensUsed / s.ai.sessionTokenBudget);
/** Returns whether the chat panel is open. */
export const useIsChatOpen = () => useCivicStore((s) => s.ui.isChatOpen);
