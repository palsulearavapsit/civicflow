"use client";

import { useState, useCallback, useEffect } from 'react';

/**
 * TEST-27: Time-Travel UI Snapshot Logger.
 * Records state changes for debugging and automated replay in tests.
 */
export function useTimeTravel<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const pushState = useCallback((state: T) => {
    setHistory(prev => [...prev.slice(0, currentIndex + 1), state]);
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) setCurrentIndex(prev => prev + 1);
  }, [currentIndex, history.length]);

  return {
    state: history[currentIndex],
    pushState,
    undo,
    redo,
    history,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1
  };
}
