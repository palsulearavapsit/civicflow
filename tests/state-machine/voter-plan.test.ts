/**
 * @fileoverview State Machine Tests for the Voter plan (TEST-08).
 * Models the onboarding/voter-plan workflow as a finite state machine and
 * verifies all valid state transitions and guards.
 */

import { describe, it, expect } from 'vitest';

// ─── Voter Plan State Machine Definition ──────────────────────────────────────

type VoterPlanState =
  | 'unauthenticated'
  | 'authenticated_not_onboarded'
  | 'onboarding'
  | 'onboarded'
  | 'plan_viewing'
  | 'chat_active'
  | 'map_viewing';

type VoterPlanEvent =
  | 'SIGN_IN'
  | 'SIGN_OUT'
  | 'START_ONBOARDING'
  | 'COMPLETE_ONBOARDING'
  | 'BACK_TO_PLAN'
  | 'OPEN_CHAT'
  | 'CLOSE_CHAT'
  | 'OPEN_MAP'
  | 'CLOSE_MAP';

// Transition table: [state][event] = nextState | undefined (invalid)
const TRANSITIONS: Partial<Record<VoterPlanState, Partial<Record<VoterPlanEvent, VoterPlanState>>>> = {
  unauthenticated: {
    SIGN_IN: 'authenticated_not_onboarded',
  },
  authenticated_not_onboarded: {
    SIGN_OUT: 'unauthenticated',
    START_ONBOARDING: 'onboarding',
  },
  onboarding: {
    COMPLETE_ONBOARDING: 'onboarded',
    SIGN_OUT: 'unauthenticated',
  },
  onboarded: {
    SIGN_OUT: 'unauthenticated',
    OPEN_CHAT: 'chat_active',
    OPEN_MAP: 'map_viewing',
    BACK_TO_PLAN: 'plan_viewing',
  },
  plan_viewing: {
    SIGN_OUT: 'unauthenticated',
    OPEN_CHAT: 'chat_active',
    OPEN_MAP: 'map_viewing',
  },
  chat_active: {
    CLOSE_CHAT: 'plan_viewing',
    SIGN_OUT: 'unauthenticated',
  },
  map_viewing: {
    CLOSE_MAP: 'plan_viewing',
    OPEN_CHAT: 'chat_active',
    SIGN_OUT: 'unauthenticated',
  },
};

function transition(state: VoterPlanState, event: VoterPlanEvent): VoterPlanState | null {
  return TRANSITIONS[state]?.[event] ?? null;
}

// ─── State Machine Tests ──────────────────────────────────────────────────────

describe('Voter Plan State Machine Tests (TEST-08)', () => {
  describe('Authentication flow', () => {
    it('unauthenticated → SIGN_IN → authenticated_not_onboarded', () => {
      expect(transition('unauthenticated', 'SIGN_IN')).toBe('authenticated_not_onboarded');
    });

    it('any state → SIGN_OUT → unauthenticated', () => {
      const statesWithSignOut: VoterPlanState[] = [
        'authenticated_not_onboarded', 'onboarding', 'onboarded', 'plan_viewing', 'chat_active', 'map_viewing'
      ];
      statesWithSignOut.forEach((state) => {
        expect(transition(state, 'SIGN_OUT')).toBe('unauthenticated');
      });
    });
  });

  describe('Onboarding flow', () => {
    it('authenticated_not_onboarded → START_ONBOARDING → onboarding', () => {
      expect(transition('authenticated_not_onboarded', 'START_ONBOARDING')).toBe('onboarding');
    });

    it('onboarding → COMPLETE_ONBOARDING → onboarded', () => {
      expect(transition('onboarding', 'COMPLETE_ONBOARDING')).toBe('onboarded');
    });

    it('unauthenticated cannot start onboarding directly', () => {
      expect(transition('unauthenticated', 'START_ONBOARDING')).toBeNull();
    });

    it('onboarded cannot complete onboarding again', () => {
      expect(transition('onboarded', 'COMPLETE_ONBOARDING')).toBeNull();
    });
  });

  describe('Navigation flow', () => {
    it('onboarded → OPEN_CHAT → chat_active', () => {
      expect(transition('onboarded', 'OPEN_CHAT')).toBe('chat_active');
    });

    it('chat_active → CLOSE_CHAT → plan_viewing', () => {
      expect(transition('chat_active', 'CLOSE_CHAT')).toBe('plan_viewing');
    });

    it('onboarded → OPEN_MAP → map_viewing', () => {
      expect(transition('onboarded', 'OPEN_MAP')).toBe('map_viewing');
    });

    it('map_viewing → CLOSE_MAP → plan_viewing', () => {
      expect(transition('map_viewing', 'CLOSE_MAP')).toBe('plan_viewing');
    });

    it('unauthenticated cannot open chat', () => {
      expect(transition('unauthenticated', 'OPEN_CHAT')).toBeNull();
    });
  });

  describe('Invalid transitions', () => {
    it('unauthenticated → COMPLETE_ONBOARDING is invalid', () => {
      expect(transition('unauthenticated', 'COMPLETE_ONBOARDING')).toBeNull();
    });

    it('chat_active → OPEN_MAP is invalid (must close chat first)', () => {
      // Chat active doesn't support opening map in this implementation
      const result = transition('chat_active', 'OPEN_MAP');
      expect(result).toBeNull();
    });
  });

  describe('Full happy path simulation', () => {
    it('complete user journey: sign in → onboard → plan → chat → exit', () => {
      let state: VoterPlanState = 'unauthenticated';
      const events: VoterPlanEvent[] = [
        'SIGN_IN', 'START_ONBOARDING', 'COMPLETE_ONBOARDING',
        'OPEN_CHAT', 'CLOSE_CHAT', 'SIGN_OUT',
      ];
      const expectedStates: VoterPlanState[] = [
        'authenticated_not_onboarded', 'onboarding', 'onboarded',
        'chat_active', 'plan_viewing', 'unauthenticated',
      ];

      for (let i = 0; i < events.length; i++) {
        const next = transition(state, events[i]);
        expect(next).toBe(expectedStates[i]);
        state = next!;
      }
    });
  });
});
