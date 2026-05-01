/**
 * TEST-25: Onboarding Finite State Machine.
 * Enforces a strict, verifiable flow for the user registration journey.
 * Prevents invalid states like "Completed" without "Location Entry".
 */

export type OnboardingState = 
  | 'IDLE' 
  | 'IDENTITY_ENTRY' 
  | 'LOCATION_ENTRY' 
  | 'PREFERENCE_ENTRY' 
  | 'COMPLETED';

const TRANSITIONS: Record<OnboardingState, OnboardingState[]> = {
  IDLE: ['IDENTITY_ENTRY'],
  IDENTITY_ENTRY: ['LOCATION_ENTRY', 'IDLE'],
  LOCATION_ENTRY: ['PREFERENCE_ENTRY', 'IDENTITY_ENTRY'],
  PREFERENCE_ENTRY: ['COMPLETED', 'LOCATION_ENTRY'],
  COMPLETED: ['IDLE']
};

export function canTransition(current: OnboardingState, next: OnboardingState): boolean {
  return TRANSITIONS[current].includes(next);
}

export class OnboardingMachine {
  private state: OnboardingState = 'IDLE';

  transition(next: OnboardingState) {
    if (canTransition(this.state, next)) {
      this.state = next;
      return true;
    }
    console.error(`❌ Invalid state transition from ${this.state} to ${next}`);
    return false;
  }

  getCurrentState() {
    return this.state;
  }
}
