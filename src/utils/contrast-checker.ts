/**
 * A11Y-05: WCAG 2.2 AAA Contrast Checker.
 * Mathematically verifies if a foreground and background color pair 
 * meets the 7:1 (AAA) contrast ratio requirement.
 */

function getLuminance(hex: string): number {
  const rgb = hex.startsWith('#') ? hex.slice(1) : hex;
  const r = parseInt(rgb.slice(0, 2), 16) / 255;
  const g = parseInt(rgb.slice(2, 4), 16) / 255;
  const b = parseInt(rgb.slice(4, 6), 16) / 255;

  const res = [r, g, b].map(v => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * res[0] + 0.7152 * res[1] + 0.0722 * res[2];
}

export function getContrastRatio(fg: string, bg: string): number {
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);

  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);

  return (brightest + 0.05) / (darkest + 0.05);
}

export function verifyAAAPass(fg: string, bg: string): boolean {
  return getContrastRatio(fg, bg) >= 7.0;
}
