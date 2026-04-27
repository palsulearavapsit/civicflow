/**
 * Industrial-grade Result pattern for type-safe error handling.
 * This prevents unhandled exceptions and makes error states explicit.
 */
export type Result<T, E = Error> = 
  | { success: true; data: T } 
  | { success: false; error: E };

export const Success = <T>(data: T): Result<T, never> => ({ success: true, data });
export const Failure = <E>(error: E): Result<never, E> => ({ success: false, error });

/**
 * Utility to wrap async calls in a Result pattern.
 */
export async function tryCatch<T>(promise: Promise<T>): Promise<Result<T, Error>> {
  try {
    const data = await promise;
    return Success(data);
  } catch (e) {
    return Failure(e instanceof Error ? e : new Error(String(e)));
  }
}
