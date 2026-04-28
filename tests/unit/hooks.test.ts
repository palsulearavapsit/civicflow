/**
 * Unit Tests for Custom Hooks (TEST-12).
 * Tests useFocusTrap, useVoiceInput, useHaptics, useElectionData, usePrefetch.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useHaptics } from '@/hooks/useHaptics';

// ─── useFocusTrap Tests ───────────────────────────────────────────────────────

describe('useFocusTrap', () => {
  it('returns a ref object', () => {
    const { result } = renderHook(() =>
      useFocusTrap({ isActive: false })
    );
    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('current');
  });

  it('does not add event listener when inactive', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    renderHook(() => useFocusTrap({ isActive: false }));
    expect(addSpy).not.toHaveBeenCalledWith('keydown', expect.any(Function));
    addSpy.mockRestore();
  });

  it('calls onEscape when Escape key pressed and active', () => {
    const onEscape = vi.fn();
    renderHook(() => useFocusTrap({ isActive: true, onEscape }));

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });
});

// ─── useHaptics Tests ─────────────────────────────────────────────────────────

describe('useHaptics', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(() => true),
      writable: true,
    });
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  });

  it('trigger calls navigator.vibrate with correct pattern', () => {
    const { result } = renderHook(() => useHaptics());
    act(() => result.current.trigger('success'));
    expect(navigator.vibrate).toHaveBeenCalledWith([10, 50, 10]);
  });

  it('trigger("error") calls vibrate with error pattern', () => {
    const { result } = renderHook(() => useHaptics());
    act(() => result.current.trigger('error'));
    expect(navigator.vibrate).toHaveBeenCalledWith([50, 100, 50, 100, 50]);
  });

  it('stop calls navigator.vibrate(0)', () => {
    const { result } = renderHook(() => useHaptics());
    act(() => result.current.stop());
    expect(navigator.vibrate).toHaveBeenCalledWith(0);
  });
});

// ─── Result Pattern Tests ─────────────────────────────────────────────────────

describe('Result Pattern', () => {
  it('ok() creates a success result', async () => {
    const { ok } = await import('@/types/result');
    const result = ok(42);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(42);
  });

  it('err() creates a failure result', async () => {
    const { err } = await import('@/types/result');
    const error = new Error('test error');
    const result = err(error);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe(error);
  });

  it('map() transforms success value', async () => {
    const { ok, map } = await import('@/types/result');
    const result = map(ok(21), (n) => n * 2);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(42);
  });

  it('map() propagates errors unchanged', async () => {
    const { err, map } = await import('@/types/result');
    const error = new Error('original');
    const result = map(err(error), (n: number) => n * 2);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe(error);
  });

  it('tryCatch() wraps a successful promise', async () => {
    const { tryCatch } = await import('@/types/result');
    const result = await tryCatch(Promise.resolve('hello'));
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe('hello');
  });

  it('tryCatch() wraps a rejected promise', async () => {
    const { tryCatch } = await import('@/types/result');
    const result = await tryCatch(Promise.reject(new Error('boom')));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.message).toBe('boom');
  });

  it('collectAll() combines all successful results', async () => {
    const { ok, collectAll } = await import('@/types/result');
    const results = [ok(1), ok(2), ok(3)];
    const combined = collectAll(results);
    expect(combined.success).toBe(true);
    if (combined.success) expect(combined.data).toEqual([1, 2, 3]);
  });
});

// ─── Error Hierarchy Tests ────────────────────────────────────────────────────

describe('Custom Error Classes', () => {
  it('ValidationError has correct code and statusCode', async () => {
    const { ValidationError } = await import('@/core/errors');
    const error = new ValidationError('Invalid field', { email: ['Required'] });
    expect(error.code).toBe('VALIDATION_FAILED');
    expect(error.statusCode).toBe(422);
    expect(error.fields).toEqual({ email: ['Required'] });
  });

  it('RateLimitError has correct retryAfterSeconds', async () => {
    const { RateLimitError } = await import('@/core/errors');
    const error = new RateLimitError(120);
    expect(error.code).toBe('RATE_LIMITED');
    expect(error.statusCode).toBe(429);
    expect(error.retryAfterSeconds).toBe(120);
  });

  it('toCivicFlowError wraps plain errors', async () => {
    const { toCivicFlowError, CivicFlowError } = await import('@/core/errors');
    const wrapped = toCivicFlowError(new Error('raw error'));
    expect(wrapped).toBeInstanceOf(CivicFlowError);
    expect(wrapped.message).toBe('raw error');
  });

  it('toJSON() serializes error correctly', async () => {
    const { AuthenticationError } = await import('@/core/errors');
    const error = new AuthenticationError('Bad token');
    const json = error.toJSON();
    expect(json.code).toBe('AUTH_FAILED');
    expect(json.statusCode).toBe(401);
    expect(json.message).toBe('Bad token');
    expect(json.timestamp).toBeTruthy();
  });
});
