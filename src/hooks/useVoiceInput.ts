'use client';
/**
 * @fileoverview useVoiceInput — Web Speech API for ZIP code input (A11Y-03).
 *
 * Implements voice recognition using the browser's Web Speech API.
 * Protected by {@link core/feature-flags} `voice_recognition` flag.
 * Extracts 5-digit ZIP codes from spoken input using regex post-processing.
 *
 * @module hooks/useVoiceInput
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API}
 */

import { useState, useRef, useCallback } from 'react';
import { FeatureFlagService } from '@/core/feature-flags';

type VoiceInputState = 'idle' | 'listening' | 'processing' | 'error';

interface UseVoiceInputReturn {
  state: VoiceInputState;
  transcript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
}

const ZIP_REGEX = /\b\d{5}\b/;

/**
 * Provides voice input functionality, extracting ZIP codes from speech.
 *
 * @param onResult - Callback with the extracted ZIP code string
 *
 * @example
 * const { startListening, state } = useVoiceInput((zip) => setZipCode(zip));
 */
export function useVoiceInput(onResult: (value: string) => void): UseVoiceInputReturn {
  const [state, setState] = useState<VoiceInputState>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported =
    FeatureFlagService.isEnabled('voice_recognition') &&
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Voice recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognitionCtor =
      (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ??
      (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;
    recognitionRef.current = recognition;

    recognition.onstart = () => { setState('listening'); setError(null); };
    recognition.onend = () => { setState('idle'); };

    recognition.onresult = (event) => {
      setState('processing');
      const results = Array.from(event.results);
      const allTranscripts = results
        .flatMap((r) => Array.from(r))
        .map((alt) => alt.transcript);

      for (const text of allTranscripts) {
        setTranscript(text);
        const match = ZIP_REGEX.exec(text.replace(/\s/g, ''));
        if (match) {
          onResult(match[0]);
          recognition.stop();
          return;
        }
        // Handle spoken digits: "nine four one zero two" → "94102"
        const spokenDigits = text.toLowerCase()
          .replace(/\b(zero|oh)\b/g, '0').replace(/\bone\b/g, '1')
          .replace(/\btwo\b/g, '2').replace(/\bthree\b/g, '3')
          .replace(/\bfour\b/g, '4').replace(/\bfive\b/g, '5')
          .replace(/\bsix\b/g, '6').replace(/\bseven\b/g, '7')
          .replace(/\beight\b/g, '8').replace(/\bnine\b/g, '9')
          .replace(/\s/g, '');
        const digitMatch = ZIP_REGEX.exec(spokenDigits);
        if (digitMatch) {
          onResult(digitMatch[0]);
          recognition.stop();
          return;
        }
      }
    };

    recognition.onerror = (event) => {
      setError(`Voice recognition error: ${event.error}`);
      setState('error');
    };

    recognition.start();
  }, [isSupported, onResult]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState('idle');
  }, []);

  return { state, transcript, error, isSupported, startListening, stopListening };
}
