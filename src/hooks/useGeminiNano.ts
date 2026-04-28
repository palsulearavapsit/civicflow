'use client';
/**
 * @fileoverview useGeminiNano — On-device AI for offline queries (AI-14).
 *
 * Uses the Chrome Built-in AI (Gemini Nano) API for basic offline queries.
 * Falls back to the cloud API when the on-device model is unavailable.
 *
 * @module hooks/useGeminiNano
 * @see {@link https://developer.chrome.com/docs/ai/built-in}
 */

import { useState, useCallback } from 'react';

type NanoState = 'checking' | 'available' | 'downloading' | 'unavailable';

// Extend Window type for Chrome AI APIs
declare global {
  interface Window {
    ai?: {
      languageModel?: {
        capabilities(): Promise<{ available: 'readily' | 'after-download' | 'no' }>;
        create(options?: { systemPrompt?: string }): Promise<{
          prompt(text: string): Promise<string>;
          destroy(): void;
        }>;
      };
    };
  }
}

const CIVICFLOW_SYSTEM_PROMPT = `You are a brief civic assistant. Answer voting questions in 1-2 sentences using only factual, non-partisan information. If you are uncertain, say so.`;

/**
 * Provides access to on-device Gemini Nano for fast, offline-capable AI responses.
 * Automatically falls back gracefully when unavailable.
 *
 * @example
 * const { ask, isAvailable, state } = useGeminiNano();
 * const answer = await ask('What ID do I need to vote?');
 */
export function useGeminiNano() {
  const [state, setState] = useState<NanoState>('checking');
  const [isChecked, setIsChecked] = useState(false);

  const checkAvailability = useCallback(async () => {
    if (isChecked) return;
    setIsChecked(true);

    if (typeof window === 'undefined' || !window.ai?.languageModel) {
      setState('unavailable');
      return;
    }

    try {
      const caps = await window.ai.languageModel.capabilities();
      if (caps.available === 'readily') setState('available');
      else if (caps.available === 'after-download') setState('downloading');
      else setState('unavailable');
    } catch {
      setState('unavailable');
    }
  }, [isChecked]);

  const ask = useCallback(async (question: string): Promise<string | null> => {
    await checkAvailability();

    if (state === 'unavailable' || !window.ai?.languageModel) return null;

    try {
      const session = await window.ai.languageModel.create({
        systemPrompt: CIVICFLOW_SYSTEM_PROMPT,
      });
      const response = await session.prompt(question);
      session.destroy();
      return response;
    } catch {
      return null;
    }
  }, [state, checkAvailability]);

  return {
    ask,
    state,
    isAvailable: state === 'available',
    checkAvailability,
  };
}
