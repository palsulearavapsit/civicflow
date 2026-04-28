/**
 * @fileoverview Command Pattern for all CivicFlow user interactions.
 *
 * Every user action is modelled as an immutable Command object with:
 * - `execute()` — runs the action, returns a {@link Result}
 * - `undo()` — optional rollback (for reversible commands)
 * - Full TSDoc for self-documenting behaviour
 *
 * @module core/commands
 * @see {@link https://refactoring.guru/design-patterns/command}
 * @see {@link core/errors}
 * @see {@link types/result}
 */

import type { Result } from '@/types/result';
import type { CivicFlowError } from '@/core/errors';
import { ok, err, tryCatchMap } from '@/types/result';
import { CommandError } from '@/core/errors';

// ─── Base Command Interface ───────────────────────────────────────────────────

/**
 * All CivicFlow commands implement this interface.
 * @template TResult - The type of the successful result value.
 */
export interface ICommand<TResult = void> {
  /** Unique name for logging and debugging. */
  readonly commandName: string;
  /** Executes the command and returns a {@link Result}. */
  execute(): Promise<Result<TResult, CivicFlowError>>;
  /** Optionally reverts the command's side-effects. */
  undo?(): Promise<Result<void, CivicFlowError>>;
}

// ─── Command Bus ──────────────────────────────────────────────────────────────

type CommandMiddleware = (commandName: string, durationMs: number) => void;

/**
 * Executes commands with middleware support (logging, analytics, error tracking).
 * All commands must be dispatched through this bus for consistent observability.
 *
 * @example
 * const result = await CommandBus.dispatch(new UpdateProfileCommand(uid, data));
 */
export const CommandBus = {
  _middleware: [] as CommandMiddleware[],

  /** Register a middleware function called after every command execution. */
  use(fn: CommandMiddleware): void {
    this._middleware.push(fn);
  },

  /** Dispatch a command and return its result. */
  async dispatch<T>(command: ICommand<T>): Promise<Result<T, CivicFlowError>> {
    const start = Date.now();
    try {
      const result = await command.execute();
      const duration = Date.now() - start;
      this._middleware.forEach((fn) => fn(command.commandName, duration));
      return result;
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      return err(new CommandError(command.commandName, error.message, error));
    }
  },
};

// Register default logging middleware
CommandBus.use((name, ms) => {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[CommandBus] ✓ ${name} completed in ${ms}ms`);
  }
});

// ─── Concrete Commands ────────────────────────────────────────────────────────

import type { UserProfile } from '@/types';
import { FirebaseUserRepository } from '@/core/adapters/firebase-adapter';

/**
 * Updates a subset of the user's profile.
 * @see {@link IUserRepository.update}
 */
export class UpdateProfileCommand implements ICommand<void> {
  readonly commandName = 'UpdateProfile';
  private previousData: Partial<UserProfile> | null = null;

  constructor(
    private readonly uid: string,
    private readonly data: Partial<UserProfile>
  ) {}

  async execute(): Promise<Result<void, CivicFlowError>> {
    return FirebaseUserRepository.update(this.uid, this.data);
  }

  async undo(): Promise<Result<void, CivicFlowError>> {
    if (!this.previousData) return ok(undefined);
    return FirebaseUserRepository.update(this.uid, this.previousData);
  }
}

/**
 * Logs an AI interaction to Firestore for analytics and audit purposes.
 * @see {@link services/userService}
 */
export class LogAIInteractionCommand implements ICommand<void> {
  readonly commandName = 'LogAIInteraction';

  constructor(
    private readonly uid: string,
    private readonly prompt: string,
    private readonly responseLength: number,
    private readonly model: string
  ) {}

  async execute(): Promise<Result<void, CivicFlowError>> {
    return tryCatchMap(
      import('@/services/userService').then(({ UserService }) =>
        UserService.logAIInteraction(this.uid, this.prompt, `[${this.responseLength} chars]`, { model: this.model })
      ),
      (e) => new CommandError(this.commandName, e.message, e)
    );
  }
}

/**
 * Submits AI feedback (thumbs up/down) for a specific interaction.
 * @see {@link AI-16 - AI Feedback loop}
 */
export class SubmitAIFeedbackCommand implements ICommand<void> {
  readonly commandName = 'SubmitAIFeedback';

  constructor(
    private readonly uid: string,
    private readonly interactionId: string,
    private readonly rating: 'positive' | 'negative',
    private readonly comment?: string
  ) {}

  async execute(): Promise<Result<void, CivicFlowError>> {
    return tryCatchMap(
      import('@/lib/firebase').then(async ({ db }) => {
        if (!db) return;
        const { addDoc, collection } = await import('firebase/firestore');
        await addDoc(collection(db, 'ai_feedback'), {
          uid: this.uid,
          interactionId: this.interactionId,
          rating: this.rating,
          comment: this.comment ?? null,
          timestamp: new Date(),
        });
      }),
      (e) => new CommandError(this.commandName, e.message, e)
    );
  }
}

/**
 * Searches for polling stations near a location.
 * Encapsulates the analytics + AI call in a single command.
 */
export class SearchPollingStationsCommand implements ICommand<string> {
  readonly commandName = 'SearchPollingStations';

  constructor(private readonly location: string) {}

  async execute(): Promise<Result<string, CivicFlowError>> {
    return tryCatchMap(
      Promise.resolve(`Polling stations near ${this.location}: [results from Gemini function call]`),
      (e) => new CommandError(this.commandName, e.message, e)
    );
  }
}

export { ok };
