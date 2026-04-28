/**
 * Contract Tests for the Google AI API (TEST-07).
 * Uses MSW to mock the Gemini API and verify the contract is maintained.
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { detectIntent, checkForMisinformation, estimateTokens } from '@/lib/gemini';

// ─── MSW Server ───────────────────────────────────────────────────────────────

const server = setupServer(
  http.post('https://generativelanguage.googleapis.com/*', () => {
    return HttpResponse.json({
      candidates: [{
        content: {
          parts: [{ text: 'To register to vote, visit vote.gov.' }],
          role: 'model',
        },
        finishReason: 'STOP',
        safetyRatings: [],
      }],
      usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 50, totalTokenCount: 150 },
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─── Contract Tests ───────────────────────────────────────────────────────────

describe('Google AI API Contract', () => {
  describe('detectIntent()', () => {
    it('detects polling station intent', () => {
      expect(detectIntent('Where is my polling place?')).toBe('find_polling_station');
    });

    it('detects registration deadline intent', () => {
      expect(detectIntent('When is the registration deadline?')).toBe('check_registration_deadline');
    });

    it('detects voting method intent', () => {
      expect(detectIntent('Can I vote by mail?')).toBe('learn_voting_methods');
    });

    it('detects myth/fact intent', () => {
      expect(detectIntent('Is it true that elections are rigged?')).toBe('myth_fact_check');
    });

    it('defaults to general_question for unknown queries', () => {
      expect(detectIntent('Hello there!')).toBe('general_question');
    });
  });

  describe('checkForMisinformation()', () => {
    it('passes safe election information', () => {
      expect(checkForMisinformation('You can register to vote at vote.gov')).toBe(true);
    });

    it('flags election fraud misinformation', () => {
      expect(checkForMisinformation('the election was stolen and rigged')).toBe(false);
    });

    it('flags voter suppression content', () => {
      expect(checkForMisinformation("Don't bother to vote, it doesn't count")).toBe(false);
    });
  });

  describe('estimateTokens()', () => {
    it('returns a positive number for non-empty text', () => {
      const tokens = estimateTokens('How do I register to vote in California?');
      expect(tokens).toBeGreaterThan(0);
    });

    it('returns 0 or near-0 for empty string', () => {
      const tokens = estimateTokens('');
      expect(tokens).toBeLessThanOrEqual(5);
    });

    it('longer text produces more tokens', () => {
      const short = estimateTokens('Vote');
      const long = estimateTokens('How do I register to vote and what identification documents do I need to bring to my polling station on election day?');
      expect(long).toBeGreaterThan(short);
    });
  });

  describe('XSS Sanitizer Contract', () => {
    it('strips script tags from AI output', async () => {
      const { sanitizeAIHtml } = await import('@/utils/xss-sanitizer');
      const input = '<p>Vote at vote.gov</p><script>alert("xss")</script>';
      const output = sanitizeAIHtml(input);
      expect(output).not.toContain('<script>');
      expect(output).toContain('Vote at vote.gov');
    });

    it('allows safe paragraph tags', async () => {
      const { sanitizeAIHtml } = await import('@/utils/xss-sanitizer');
      const input = '<p>You can <strong>register</strong> at <a href="https://vote.gov">vote.gov</a></p>';
      const output = sanitizeAIHtml(input);
      expect(output).toContain('<p>');
      expect(output).toContain('<strong>');
    });

    it('strips onclick handlers', async () => {
      const { sanitizeAIHtml } = await import('@/utils/xss-sanitizer');
      const input = '<button onclick="steal()">Click me</button>';
      const output = sanitizeAIHtml(input);
      expect(output).not.toContain('onclick');
    });
  });
});
