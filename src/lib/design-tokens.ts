/**
 * CODE-06: Unified Design Tokens.
 * Centralized design system constants shared across CSS and Components.
 */

export const tokens = {
  colors: {
    brand: {
      primary: '#2563eb', // blue-600
      secondary: '#334155', // slate-700
      success: '#10b981', // emerald-500
      danger: '#ef4444', // red-500
    },
    background: {
      light: '#f8fafc',
      dark: '#020617',
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  radii: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1.5rem',
    full: '9999px',
  },
  animations: {
    fast: '150ms',
    standard: '300ms',
    slow: '500ms',
  }
} as const;

export type DesignTokens = typeof tokens;
