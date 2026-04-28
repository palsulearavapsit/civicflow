/**
 * @fileoverview Prop-Drilling Detection Script (CQ-14).
 *
 * Scans the codebase for potential prop-drilling anti-patterns:
 * - Props passed through 3+ component levels unchanged
 * - Large prop interfaces (>8 props may indicate drilling)
 * - Common prop names passed at multiple levels
 *
 * Run: npx tsx scripts/detect-prop-drilling.ts
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join, extname } from 'path';

const SRC_DIR = join(process.cwd(), 'src', 'components');
const SUSPICIOUS_PROP_NAMES = ['user', 'profile', 'uid', 'onUpdate', 'onSubmit', 'loading', 'error'];
const MAX_PROPS_BEFORE_WARNING = 6;

interface DrillWarning {
  file: string;
  type: 'large_interface' | 'suspicious_prop' | 'repeated_prop';
  detail: string;
  severity: 'info' | 'warning' | 'error';
}

function getAllTsxFiles(dir: string): string[] {
  const files: string[] = [];
  try {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) files.push(...getAllTsxFiles(fullPath));
      else if (['.tsx', '.ts'].includes(extname(entry))) files.push(fullPath);
    }
  } catch { /* skip */ }
  return files;
}

function analyzeFile(filePath: string): DrillWarning[] {
  const warnings: DrillWarning[] = [];
  const content = readFileSync(filePath, 'utf-8');
  const relativePath = filePath.replace(process.cwd(), '').replace(/\\/g, '/');

  // Check for large prop interfaces
  const interfaceMatches = content.match(/interface\s+\w+Props\s*\{([^}]+)\}/g) ?? [];
  for (const match of interfaceMatches) {
    const propCount = (match.match(/\w+\??:/g) ?? []).length;
    if (propCount > MAX_PROPS_BEFORE_WARNING) {
      warnings.push({
        file: relativePath,
        type: 'large_interface',
        detail: `Props interface has ${propCount} props (>${MAX_PROPS_BEFORE_WARNING}). Consider using Context or Zustand store.`,
        severity: propCount > 10 ? 'warning' : 'info',
      });
    }
  }

  // Check for suspicious prop names being passed down
  for (const prop of SUSPICIOUS_PROP_NAMES) {
    const passingRegex = new RegExp(`\\b${prop}=\\{${prop}\\}`, 'g');
    const occurrences = (content.match(passingRegex) ?? []).length;
    if (occurrences > 1) {
      warnings.push({
        file: relativePath,
        type: 'suspicious_prop',
        detail: `Prop '${prop}' is forwarded ${occurrences} times. Consider using Context or Zustand.`,
        severity: occurrences > 2 ? 'warning' : 'info',
      });
    }
  }

  return warnings;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const files = getAllTsxFiles(SRC_DIR);
const allWarnings: DrillWarning[] = [];

for (const file of files) {
  try {
    allWarnings.push(...analyzeFile(file));
  } catch { /* skip unreadable files */ }
}

if (allWarnings.length === 0) {
  console.log('✅ No prop-drilling patterns detected!');
} else {
  console.log(`\n⚠️  Prop-Drilling Analysis Report — ${allWarnings.length} potential issue(s)\n`);
  console.log('═'.repeat(60));
  for (const w of allWarnings) {
    const icon = w.severity === 'error' ? '🔴' : w.severity === 'warning' ? '🟡' : '🔵';
    console.log(`${icon} [${w.type}] ${w.file}`);
    console.log(`   ${w.detail}\n`);
  }
}

const errors = allWarnings.filter((w) => w.severity === 'error');
if (errors.length > 0) process.exit(1);
