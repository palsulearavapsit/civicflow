/**
 * @fileoverview Enhanced Result Pattern Monad for CivicFlow
 *
 * Implements a type-safe, functional Result monad that forces callers to handle
 * both success and failure paths explicitly — eliminating unhandled exceptions.
 *
 * @module types/result
 * @see {@link https://www.sandromaglione.com/articles/result-type-error-handling-functional-programming}
 * @see {@link core/errors}
 */

import type { CivicFlowError } from '@/core/errors';

// ─── Core Result Type ────────────────────────────────────────────────────────

/** A discriminated union representing either a successful value or a failure. */
export type Result<T, E extends Error = CivicFlowError> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

// ─── Constructors ────────────────────────────────────────────────────────────

/**
 * Constructs a successful {@link Result}.
 * @template T - The type of the success value.
 *
 * @example
 * const result = ok(42); // Result<number, never>
 */
export const ok = <T>(data: T): Result<T, never> =>
  Object.freeze({ success: true as const, data });

/**
 * Constructs a failed {@link Result}.
 * @template E - The error type, defaults to {@link CivicFlowError}.
 *
 * @example
 * const result = err(new AuthenticationError()); // Result<never, AuthenticationError>
 */
export const err = <E extends Error>(error: E): Result<never, E> =>
  Object.freeze({ success: false as const, error });

// Legacy aliases for backward compatibility
export const Success = ok;
export const Failure = err;

// ─── Combinators ─────────────────────────────────────────────────────────────

/**
 * Transforms the success value of a {@link Result} using a mapping function.
 * Short-circuits on failure — the error is propagated unchanged.
 *
 * @example
 * const doubled = map(ok(21), (n) => n * 2); // ok(42)
 */
export function map<T, U, E extends Error>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (result.success) return ok(fn(result.data));
  return result as Result<never, E>;
}

/**
 * Chains a Result-producing function onto a successful {@link Result}.
 * Equivalent to monadic `bind` / `flatMap`.
 *
 * @example
 * const chained = flatMap(ok(21), (n) => n > 0 ? ok(n * 2) : err(new ValidationError(...)));
 */
export function flatMap<T, U, E extends Error, F extends Error>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, F>
): Result<U, E | F> {
  if (result.success) return fn(result.data);
  return result as Result<never, E>;
}

/**
 * Transforms the error value of a failed {@link Result}.
 * Success values are propagated unchanged.
 *
 * @example
 * const mapped = mapError(err(new Error('raw')), (e) => new DatabaseError(e.message, e));
 */
export function mapError<T, E extends Error, F extends Error>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  if (!result.success) return err(fn(result.error));
  return result as Result<T, never>;
}

/**
 * Extracts the success value or returns a default if the result is a failure.
 *
 * @example
 * const value = getOrElse(ok(42), 0); // 42
 * const fallback = getOrElse(err(new Error()), 0); // 0
 */
export function getOrElse<T>(result: Result<T, Error>, defaultValue: T): T {
  return result.success ? result.data : defaultValue;
}

/**
 * Executes a side-effect on success without modifying the result.
 * Useful for logging or analytics.
 */
export function tap<T, E extends Error>(
  result: Result<T, E>,
  fn: (value: T) => void
): Result<T, E> {
  if (result.success) fn(result.data);
  return result;
}

/**
 * Executes a side-effect on failure without modifying the result.
 * Useful for error logging.
 */
export function tapError<T, E extends Error>(
  result: Result<T, E>,
  fn: (error: E) => void
): Result<T, E> {
  if (!result.success) fn(result.error);
  return result;
}

// ─── Async Utilities ─────────────────────────────────────────────────────────

/**
 * Wraps a Promise in a {@link Result}, catching any thrown error.
 * Prevents unhandled promise rejections and makes error paths explicit.
 *
 * @example
 * const result = await tryCatch(fetchUserProfile(uid));
 * if (!result.success) console.error(result.error.message);
 */
export async function tryCatch<T>(promise: Promise<T>): Promise<Result<T, Error>> {
  try {
    return ok(await promise);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

/**
 * Like {@link tryCatch} but maps the caught error through a transform function,
 * allowing it to be converted to a domain {@link CivicFlowError}.
 *
 * @example
 * const result = await tryCatchMap(
 *   fetchUser(id),
 *   (e) => new DatabaseError('Fetch failed', e)
 * );
 */
export async function tryCatchMap<T, E extends Error>(
  promise: Promise<T>,
  mapFn: (e: Error) => E
): Promise<Result<T, E>> {
  try {
    return ok(await promise);
  } catch (e) {
    const base = e instanceof Error ? e : new Error(String(e));
    return err(mapFn(base));
  }
}

/**
 * Collects an array of Results and returns a single Result containing
 * all successes, or the first failure encountered.
 *
 * @example
 * const all = collectAll([ok(1), ok(2), ok(3)]); // ok([1, 2, 3])
 */
export function collectAll<T, E extends Error>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];
  for (const result of results) {
    if (!result.success) return result as Result<never, E>;
    values.push(result.data);
  }
  return ok(values);
}

// ─── Type Guards ─────────────────────────────────────────────────────────────

/** Narrows a {@link Result} to its success variant. */
export function isOk<T>(result: Result<T, Error>): result is { success: true; data: T } {
  return result.success;
}

/** Narrows a {@link Result} to its failure variant. */
export function isErr<E extends Error>(result: Result<unknown, E>): result is { success: false; error: E } {
  return !result.success;
}
