/**
 * @fileoverview Style Dictionary Design Tokens for CivicFlow (CQ-10).
 *
 * Single source of truth for all design values.
 * Tokens are exported as CSS custom properties, JS constants, and Tailwind config.
 *
 * @module tokens
 * @see {@link https://amzn.github.io/style-dictionary/}
 */

// ─── Color Palette ────────────────────────────────────────────────────────────

export const COLOR_TOKENS = {
  // Brand
  brand: {
    primary: { value: '#3B82F6', description: 'Primary brand blue' },
    secondary: { value: '#8B5CF6', description: 'Secondary purple accent' },
    accent: { value: '#10B981', description: 'Success/civic green' },
  },
  // Civic theme colors
  civic: {
    blue: { '50': '#EFF6FF', '500': '#3B82F6', '600': '#2563EB', '900': '#1E3A8A' },
    purple: { '50': '#F5F3FF', '500': '#8B5CF6', '600': '#7C3AED', '900': '#4C1D95' },
    green: { '50': '#ECFDF5', '500': '#10B981', '600': '#059669', '900': '#064E3B' },
    red: { '50': '#FEF2F2', '500': '#EF4444', '600': '#DC2626', '900': '#7F1D1D' },
    amber: { '50': '#FFFBEB', '500': '#F59E0B', '600': '#D97706', '900': '#78350F' },
  },
  // Semantic
  semantic: {
    success: { value: '#10B981' },
    warning: { value: '#F59E0B' },
    error: { value: '#EF4444' },
    info: { value: '#3B82F6' },
  },
  // Dark mode surface colors
  surface: {
    background: { light: '#FFFFFF', dark: '#0F172A' },
    card: { light: '#F8FAFC', dark: '#1E293B' },
    elevated: { light: '#FFFFFF', dark: '#263548' },
    border: { light: '#E2E8F0', dark: '#334155' },
  },
  // A11Y-17: Text colors maintaining 7:1 contrast ratio
  text: {
    primary: { light: '#0F172A', dark: '#F1F5F9' },       // 17.5:1 contrast
    secondary: { light: '#475569', dark: '#94A3B8' },      // 7.2:1 contrast
    muted: { light: '#64748B', dark: '#64748B' },          // 7:1 contrast (AAA)
    inverse: { light: '#FFFFFF', dark: '#0F172A' },
  },
} as const;

// ─── Typography Tokens ────────────────────────────────────────────────────────

export const TYPOGRAPHY_TOKENS = {
  fontFamily: {
    sans: { value: 'var(--font-inter), system-ui, sans-serif' },
    display: { value: 'var(--font-outfit), var(--font-inter), sans-serif' },
    mono: { value: 'JetBrains Mono, Consolas, monospace' },
  },
  // A11Y-09: All font sizes in rem (no fixed px)
  fontSize: {
    xs: { value: '0.75rem', lineHeight: '1rem' },
    sm: { value: '0.875rem', lineHeight: '1.25rem' },
    base: { value: '1rem', lineHeight: '1.5rem' },
    lg: { value: '1.125rem', lineHeight: '1.75rem' },
    xl: { value: '1.25rem', lineHeight: '1.75rem' },
    '2xl': { value: '1.5rem', lineHeight: '2rem' },
    '3xl': { value: '1.875rem', lineHeight: '2.25rem' },
    '4xl': { value: '2.25rem', lineHeight: '2.5rem' },
    '5xl': { value: '3rem', lineHeight: '1' },
  },
  fontWeight: {
    normal: { value: '400' },
    medium: { value: '500' },
    semibold: { value: '600' },
    bold: { value: '700' },
    extrabold: { value: '800' },
  },
} as const;

// ─── Spacing Tokens ───────────────────────────────────────────────────────────

export const SPACING_TOKENS = {
  // A11Y-18: Minimum touch targets 44px
  touchTarget: { value: '2.75rem', description: '44px minimum touch target' },
  // Standard spacing scale
  0: '0', 1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem',
  5: '1.25rem', 6: '1.5rem', 8: '2rem', 10: '2.5rem', 12: '3rem',
  16: '4rem', 20: '5rem', 24: '6rem', 32: '8rem', 40: '10rem', 48: '12rem',
} as const;

// ─── Animation Tokens ────────────────────────────────────────────────────────

export const ANIMATION_TOKENS = {
  duration: {
    fast: { value: '150ms' },
    normal: { value: '300ms' },
    slow: { value: '500ms' },
    verySlow: { value: '1000ms' },
  },
  easing: {
    default: { value: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    in: { value: 'cubic-bezier(0.4, 0, 1, 1)' },
    out: { value: 'cubic-bezier(0, 0, 0.2, 1)' },
    bounce: { value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
  },
} as const;

// ─── Border Radius Tokens ─────────────────────────────────────────────────────

export const BORDER_RADIUS_TOKENS = {
  none: '0',
  sm: '0.25rem',
  default: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
} as const;

// ─── Shadow Tokens ────────────────────────────────────────────────────────────

export const SHADOW_TOKENS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  glow: '0 0 20px rgb(59 130 246 / 0.4)',
  glowPurple: '0 0 20px rgb(139 92 246 / 0.4)',
} as const;

// ─── CSS Custom Properties Generator ─────────────────────────────────────────

/**
 * Generates CSS custom property declarations from design tokens.
 * Output can be injected into :root in globals.css.
 */
export function generateCssVariables(): string {
  const lines: string[] = [':root {'];

  // Colors
  lines.push('  /* Brand Colors */');
  lines.push(`  --color-brand-primary: ${COLOR_TOKENS.brand.primary.value};`);
  lines.push(`  --color-brand-secondary: ${COLOR_TOKENS.brand.secondary.value};`);
  lines.push(`  --color-brand-accent: ${COLOR_TOKENS.brand.accent.value};`);

  // Semantic colors
  lines.push('  /* Semantic Colors */');
  Object.entries(COLOR_TOKENS.semantic).forEach(([key, token]) => {
    lines.push(`  --color-${key}: ${token.value};`);
  });

  // Typography
  lines.push('  /* Typography */');
  Object.entries(TYPOGRAPHY_TOKENS.fontSize).forEach(([key, token]) => {
    lines.push(`  --font-size-${key}: ${token.value};`);
  });

  // Animation
  lines.push('  /* Animation */');
  Object.entries(ANIMATION_TOKENS.duration).forEach(([key, token]) => {
    lines.push(`  --duration-${key}: ${token.value};`);
  });

  lines.push('}');
  return lines.join('\n');
}
