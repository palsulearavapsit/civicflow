/**
 * @fileoverview Value Object pattern for IDs and Emails.
 *
 * Value Objects are immutable, self-validating domain primitives.
 * They prevent primitive obsession and make invalid states unrepresentable.
 *
 * @module core/value-objects
 * @see {@link https://martinfowler.com/bliki/ValueObject.html}
 */

import type { Result } from '@/types/result';
import { ok, err } from '@/types/result';
import { ValidationError } from '@/core/errors';

// ─── Base Value Object ────────────────────────────────────────────────────────

abstract class ValueObject<T> {
  protected constructor(protected readonly _value: T) {
    Object.freeze(this);
  }
  get value(): T { return this._value; }
  equals(other: ValueObject<T>): boolean { return this._value === other._value; }
  toString(): string { return String(this._value); }
}

// ─── UserId ───────────────────────────────────────────────────────────────────

/**
 * Represents a validated Firebase Auth UID.
 * Must be a non-empty string of 1–128 characters.
 *
 * @example
 * const id = UserId.create('abc123');
 * if (id.success) console.log(id.data.value);
 */
export class UserId extends ValueObject<string> {
  private constructor(value: string) { super(value); }

  static create(raw: unknown): Result<UserId, ValidationError> {
    if (typeof raw !== 'string' || raw.trim().length === 0 || raw.length > 128) {
      return err(new ValidationError('Invalid UserId', { uid: ['Must be a non-empty string ≤ 128 chars'] }));
    }
    return ok(new UserId(raw.trim()));
  }

  static unsafeCreate(value: string): UserId {
    return new UserId(value);
  }
}

// ─── Email ────────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Represents a validated email address.
 * Normalised to lowercase on creation.
 *
 * @example
 * const email = Email.create('User@Example.com');
 * // email.data.value === 'user@example.com'
 */
export class Email extends ValueObject<string> {
  private constructor(value: string) { super(value); }

  static create(raw: unknown): Result<Email, ValidationError> {
    if (typeof raw !== 'string' || !EMAIL_REGEX.test(raw.trim())) {
      return err(new ValidationError('Invalid email address', { email: ['Must be a valid email'] }));
    }
    return ok(new Email(raw.trim().toLowerCase()));
  }
}

// ─── ZipCode ──────────────────────────────────────────────────────────────────

const ZIP_REGEX = /^\d{5}(-\d{4})?$/;

/**
 * Represents a validated US ZIP code (5-digit or ZIP+4 format).
 */
export class ZipCode extends ValueObject<string> {
  private constructor(value: string) { super(value); }

  static create(raw: unknown): Result<ZipCode, ValidationError> {
    if (typeof raw !== 'string' || !ZIP_REGEX.test(raw.trim())) {
      return err(new ValidationError('Invalid ZIP code', { zipCode: ['Must be 5-digit or ZIP+4 format'] }));
    }
    return ok(new ZipCode(raw.trim()));
  }

  /** Returns the base 5-digit ZIP (strips +4 extension). */
  get base(): string { return this._value.slice(0, 5); }
}

// ─── StateName ────────────────────────────────────────────────────────────────

const US_STATES = new Set([
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming','District of Columbia',
]);

/**
 * Represents a validated US state name.
 */
export class StateName extends ValueObject<string> {
  private constructor(value: string) { super(value); }

  static create(raw: unknown): Result<StateName, ValidationError> {
    if (typeof raw !== 'string' || !US_STATES.has(raw.trim())) {
      return err(new ValidationError('Invalid US state name', { state: ['Must be a valid US state'] }));
    }
    return ok(new StateName(raw.trim()));
  }

  static isValid(raw: string): boolean { return US_STATES.has(raw.trim()); }
}

// ─── SessionToken ─────────────────────────────────────────────────────────────

/**
 * Represents an opaque session token (UUID v4 format).
 */
export class SessionToken extends ValueObject<string> {
  private constructor(value: string) { super(value); }

  static generate(): SessionToken {
    const token = typeof crypto !== 'undefined'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return new SessionToken(token);
  }

  static create(raw: unknown): Result<SessionToken, ValidationError> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (typeof raw !== 'string' || !uuidRegex.test(raw)) {
      return err(new ValidationError('Invalid session token', { token: ['Must be a valid UUID v4'] }));
    }
    return ok(new SessionToken(raw));
  }
}
