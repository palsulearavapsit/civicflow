#!/usr/bin/env node
/**
 * @fileoverview Automated Dependency Graph Visualization (CQ-04).
 *
 * Generates a Mermaid.js dependency graph of the CivicFlow module structure.
 * Run: npx tsx scripts/dep-graph.ts
 *
 * @module scripts/dep-graph
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join, relative, extname } from 'path';

const SRC_DIR = join(process.cwd(), 'src');
const OUTPUT_FILE = join(process.cwd(), 'DEPENDENCY_GRAPH.md');

// ─── File Scanner ─────────────────────────────────────────────────────────────

function getAllFiles(dir: string, exts = ['.ts', '.tsx']): string[] {
  const files: string[] = [];
  try {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        files.push(...getAllFiles(fullPath, exts));
      } else if (exts.includes(extname(entry))) {
        files.push(fullPath);
      }
    }
  } catch { /* skip inaccessible dirs */ }
  return files;
}

// ─── Import Extractor ─────────────────────────────────────────────────────────

function extractImports(filePath: string): string[] {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const importRegex = /(?:import|from)\s+['"](@\/[^'"]+|\.\/[^'"]+|\.\.\/[^'"]+)['"]/g;
    const imports: string[] = [];
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    return imports;
  } catch {
    return [];
  }
}

// ─── Graph Builder ────────────────────────────────────────────────────────────

function moduleId(filePath: string): string {
  return relative(SRC_DIR, filePath)
    .replace(/\\/g, '/')
    .replace(/\.(ts|tsx)$/, '')
    .replace(/\/index$/, '');
}

function resolveImport(imp: string): string {
  return imp.replace('@/', '').replace(/\.(ts|tsx)$/, '').replace(/\/index$/, '');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const files = getAllFiles(SRC_DIR);
const edges = new Set<string>();
const nodes = new Set<string>();

for (const file of files) {
  const source = moduleId(file);
  nodes.add(source);
  const imports = extractImports(file);
  for (const imp of imports) {
    if (imp.startsWith('@/')) {
      const target = resolveImport(imp);
      nodes.add(target);
      edges.add(`  ${source.replace(/\//g, '_').replace(/-/g, '_')} --> ${target.replace(/\//g, '_').replace(/-/g, '_')}`);
    }
  }
}

const mermaid = [
  '# CivicFlow Dependency Graph',
  '',
  '```mermaid',
  'graph TD',
  '  %% Core Layer',
  '  subgraph Core["🏗 Core (Hexagonal)"]',
  '    core_errors["errors"]',
  '    core_ports["ports"]',
  '    core_commands["commands"]',
  '    core_feature_flags["feature-flags"]',
  '    core_plugins["plugins"]',
  '    core_value_objects["value-objects"]',
  '  end',
  '',
  '  %% Infrastructure Layer',
  '  subgraph Adapters["🔌 Adapters (Infrastructure)"]',
  '    core_adapters_firebase_adapter["firebase-adapter"]',
  '  end',
  '',
  '  %% Application Layer',
  '  subgraph Services["📦 Services"]',
  '    services_userService["userService"]',
  '    services_auditService["auditService"]',
  '  end',
  '',
  '  %% UI Layer',
  '  subgraph UI["🎨 UI Components"]',
  '    components_atoms["atoms"]',
  '    components_molecules["molecules"]',
  '  end',
  '',
  '  %% Dependency edges (internal @/ imports)',
  ...Array.from(edges).slice(0, 50), // limit to 50 edges for readability
  '```',
  '',
  `> Generated at ${new Date().toISOString()} | ${nodes.size} modules | ${edges.size} dependencies`,
].join('\n');

writeFileSync(OUTPUT_FILE, mermaid);
console.log(`✅ Dependency graph written to ${OUTPUT_FILE}`);
console.log(`   Modules: ${nodes.size} | Dependencies: ${edges.size}`);
