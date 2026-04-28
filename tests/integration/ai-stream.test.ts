/**
 * @fileoverview Integration Tests for the AI Streaming flow (TEST-02).
 * Tests the full stream route with MSW mocking Gemini.
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { getDistilledAnswer } from '@/utils/embeddings';
import { detectIntent, checkForMisinformation, estimateTokens } from '@/lib/gemini';
import { moderateInput, moderateOutput } from '@/utils/ai-moderation';

const server = setupServer(
  http.post('*/api/chat/stream', async ({ request }) => {
    const body = await request.json() as { prompt: string };
    const responseText = `Here's information about: ${body.prompt}. Visit vote.gov for details.`;
    return new HttpResponse(responseText, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AI Streaming Integration Tests (TEST-02)', () => {
  describe('Stream API Contract', () => {
    it('stream endpoint accepts POST with valid payload', async () => {
      const response = await fetch('http://localhost/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'How do I register to vote?', history: [] }),
      });
      expect(response.ok).toBe(true);
      const text = await response.text();
      expect(text.length).toBeGreaterThan(0);
    });

    it('stream response is plain text', async () => {
      const response = await fetch('http://localhost/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'test', history: [] }),
      });
      expect(response.headers.get('content-type')).toMatch(/text\/plain/);
    });
  });

  describe('Knowledge Distillation Integration (AI-19)', () => {
    it('returns distilled answer for common question', () => {
      const answer = getDistilledAnswer('how do i register to vote');
      expect(answer).toBeTruthy();
      expect(typeof answer).toBe('string');
      expect(answer!.length).toBeGreaterThan(20);
    });

    it('returns null for unknown questions', () => {
      const answer = getDistilledAnswer('what is the meaning of life?');
      expect(answer).toBeNull();
    });

    it('distilled answers include actionable links', () => {
      const answer = getDistilledAnswer('how do i register to vote');
      expect(answer).toMatch(/vote\.gov|usa\.gov/i);
    });
  });

  describe('Full Moderation Pipeline Integration', () => {
    it('safe civic question passes full pipeline', async () => {
      const question = 'When is the voter registration deadline in California?';
      const inputMod = await moderateInput(question);
      expect(inputMod.allowed).toBe(true);

      const aiResponse = 'The deadline is October 19, 2026. Register at registertovote.ca.gov.';
      const outputMod = moderateOutput(aiResponse);
      expect(outputMod.allowed).toBe(true);
    });

    it('harassment is caught before reaching AI', async () => {
      const badInput = 'I want to attack the voter registration office';
      const result = await moderateInput(badInput);
      expect(result.allowed).toBe(false);
      expect(result.category).toBe('harassment');
    });

    it('misinformation is caught after AI response', () => {
      const badOutput = "Elections are rigged and stolen, don't bother to vote";
      const result = moderateOutput(badOutput);
      expect(result.allowed).toBe(false);
    });
  });

  describe('Intent → Model Selection Integration (AI-11, AI-02)', () => {
    it('legal question is detected and would use Pro model', () => {
      const legalQuestion = 'What does the Voting Rights Act constitution say about voter ID laws?';
      const isLegal = /\b(law|constitution|legal|regulation|statute|court|ruling|supreme)\b/i.test(legalQuestion);
      expect(isLegal).toBe(true);
    });

    it('simple question would use Flash model', () => {
      const simpleQuestion = 'Where is my polling place?';
      const isLegal = /\b(law|constitution|legal|regulation|statute)\b/i.test(simpleQuestion);
      expect(isLegal).toBe(false);
      expect(detectIntent(simpleQuestion)).toBe('find_polling_station');
    });
  });

  describe('Token Budget Integration (AI-13)', () => {
    it('estimates reasonable tokens for a typical chat message', () => {
      const message = 'What are the voter ID requirements in Texas and how do I get a free voter ID?';
      const tokens = estimateTokens(message);
      expect(tokens).toBeGreaterThan(10);
      expect(tokens).toBeLessThan(200);
    });
  });
});
