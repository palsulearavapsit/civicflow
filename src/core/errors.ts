/**
 * @fileoverview CivicFlow Custom Error Class Hierarchy
 *
 * Provides a structured, granular error taxonomy for all application layers.
 * Every error includes a machine-readable `code`, HTTP-compatible `statusCode`,
 * and optional `cause` for error chaining (Node 16.9+ AggregateError pattern).
 *
 * @module core/errors
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause}
 */

// ─── Base ────────────────────────────────────────────────────────────────────

/**
 * Root class for all CivicFlow domain errors.
 * Never throw this directly — use a subclass.
 */
export class CivicFlowError extends Error {
  /** Machine-readable error code for programmatic handling. */
  public readonly code: string;
  /** HTTP status code equivalent. */
  public readonly statusCode: number;
  /** ISO timestamp of when the error occurred. */
  public readonly timestamp: string;

  constructor(message: string, code: string, statusCode = 500, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /** Serialize error for logging/transport. */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
    };
  }
}

// ─── Domain Errors ───────────────────────────────────────────────────────────

/**
 * Thrown when user authentication fails or session is invalid.
 * @see {@link CivicFlowError}
 */
export class AuthenticationError extends CivicFlowError {
  constructor(message = 'Authentication failed', cause?: Error) {
    super(message, 'AUTH_FAILED', 401, { cause });
  }
}

/**
 * Thrown when a user lacks permission to access a resource.
 */
export class AuthorizationError extends CivicFlowError {
  constructor(message = 'Access denied', cause?: Error) {
    super(message, 'ACCESS_DENIED', 403, { cause });
  }
}

/**
 * Thrown when request validation fails at the Zod schema layer.
 * @see {@link https://zod.dev}
 */
export class ValidationError extends CivicFlowError {
  public readonly fields: Record<string, string[]>;

  constructor(message: string, fields: Record<string, string[]> = {}) {
    super(message, 'VALIDATION_FAILED', 422);
    this.fields = fields;
  }
}

/**
 * Thrown when a requested resource does not exist in Firestore.
 */
export class NotFoundError extends CivicFlowError {
  public readonly resource: string;

  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` (id: ${id})` : ''} not found`, 'NOT_FOUND', 404);
    this.resource = resource;
  }
}

/**
 * Thrown when a rate limit is exceeded (brute-force, API abuse).
 */
export class RateLimitError extends CivicFlowError {
  public readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds = 60) {
    super(`Rate limit exceeded. Retry after ${retryAfterSeconds}s`, 'RATE_LIMITED', 429);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Thrown for all Firebase/Firestore infrastructure failures.
 */
export class DatabaseError extends CivicFlowError {
  constructor(message = 'Database operation failed', cause?: Error) {
    super(message, 'DB_ERROR', 503, { cause });
  }
}

/**
 * Thrown when the Gemini AI service is unavailable or returns an error.
 */
export class AIServiceError extends CivicFlowError {
  public readonly model: string;

  constructor(message: string, model = 'gemini-2.0-flash', cause?: Error) {
    super(message, 'AI_SERVICE_ERROR', 502, { cause });
    this.model = model;
  }
}

/**
 * Thrown when AI content fails moderation or hallucination checks.
 */
export class AIContentError extends CivicFlowError {
  constructor(message = 'AI content failed safety checks') {
    super(message, 'AI_CONTENT_UNSAFE', 422);
  }
}

/**
 * Thrown when a token budget is exhausted for a user session.
 * @see {@link core/token-budget}
 */
export class TokenBudgetExhaustedError extends CivicFlowError {
  constructor() {
    super('Token budget exhausted for this session', 'TOKEN_BUDGET_EXHAUSTED', 429);
  }
}

/**
 * Thrown when feature flag prevents access to a capability.
 * @see {@link core/feature-flags}
 */
export class FeatureDisabledError extends CivicFlowError {
  public readonly featureKey: string;

  constructor(featureKey: string) {
    super(`Feature '${featureKey}' is currently disabled`, 'FEATURE_DISABLED', 403);
    this.featureKey = featureKey;
  }
}

/**
 * Thrown when a plugin fails to load or execute.
 * @see {@link core/plugins}
 */
export class PluginError extends CivicFlowError {
  public readonly pluginId: string;

  constructor(pluginId: string, message: string, cause?: Error) {
    super(`Plugin '${pluginId}': ${message}`, 'PLUGIN_ERROR', 500, { cause });
    this.pluginId = pluginId;
  }
}

/**
 * Thrown when a Command fails to execute.
 * @see {@link core/commands}
 */
export class CommandError extends CivicFlowError {
  public readonly commandName: string;

  constructor(commandName: string, message: string, cause?: Error) {
    super(`Command '${commandName}' failed: ${message}`, 'COMMAND_FAILED', 500, { cause });
    this.commandName = commandName;
  }
}

/**
 * Thrown when encryption or decryption fails.
 */
export class EncryptionError extends CivicFlowError {
  constructor(message = 'Encryption/decryption failed', cause?: Error) {
    super(message, 'ENCRYPTION_ERROR', 500, { cause });
  }
}

/**
 * Thrown when a network request fails (certificate pinning, CORS, etc.).
 */
export class NetworkError extends CivicFlowError {
  constructor(message = 'Network request failed', cause?: Error) {
    super(message, 'NETWORK_ERROR', 503, { cause });
  }
}

// ─── Type Guards ─────────────────────────────────────────────────────────────

/** Narrows an unknown value to a {@link CivicFlowError}. */
export function isCivicFlowError(err: unknown): err is CivicFlowError {
  return err instanceof CivicFlowError;
}

/** Narrows to {@link ValidationError}. */
export function isValidationError(err: unknown): err is ValidationError {
  return err instanceof ValidationError;
}

/** Narrows to {@link AuthenticationError}. */
export function isAuthError(err: unknown): err is AuthenticationError {
  return err instanceof AuthenticationError;
}

/** Narrows to {@link RateLimitError}. */
export function isRateLimitError(err: unknown): err is RateLimitError {
  return err instanceof RateLimitError;
}

/**
 * Converts any unknown thrown value into a {@link CivicFlowError}.
 * Useful in catch blocks for consistent error handling.
 *
 * @example
 * try { ... }
 * catch (e) { throw toCivicFlowError(e); }
 */
export function toCivicFlowError(err: unknown): CivicFlowError {
  if (err instanceof CivicFlowError) return err;
  if (err instanceof Error) return new CivicFlowError(err.message, 'UNKNOWN_ERROR', 500, { cause: err });
  return new CivicFlowError(String(err), 'UNKNOWN_ERROR', 500);
}
