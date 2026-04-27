"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

interface ThemeContextType {
  reducedMotion: boolean;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Master Theme Provider for 'Inclusive Excellence'.
 * Manages reduced motion, high contrast, and accessibility preferences globally.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // 1. Detect System Reduced Motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(motionQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener("change", handler);
    return () => motionQuery.removeEventListener("change", handler);

  }, []);

  const value = useMemo(() => ({
    reducedMotion,
    highContrast,
    setHighContrast
  }), [reducedMotion, highContrast]);

  return (
    <ThemeContext.Provider value={value}>
      <div className={highContrast ? "high-contrast" : ""}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
