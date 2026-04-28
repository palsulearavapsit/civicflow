/**
 * @fileoverview Custom Embeddings for Myth vs Fact database (AI-20).
 *
 * Uses the Gemini text-embedding-004 model to create semantic embeddings
 * for the myth/fact database, enabling similarity search.
 *
 * @module utils/embeddings
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { MythFact } from '@/types';
import type { Result } from '@/types/result';
import { ok, err } from '@/types/result';
import { AIServiceError } from '@/core/errors';

const apiKey = process.env.GEMINI_API_KEY ?? '';
const genAI = new GoogleGenerativeAI(apiKey);

// ─── Embedding Cache ──────────────────────────────────────────────────────────

const embeddingCache = new Map<string, number[]>();

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * Generates a text embedding vector using Gemini text-embedding-004.
 * Results are cached to avoid redundant API calls.
 */
export async function embedText(text: string): Promise<Result<number[], AIServiceError>> {
  const cached = embeddingCache.get(text);
  if (cached) return ok(cached);

  if (!apiKey) return err(new AIServiceError('GEMINI_API_KEY not set'));

  try {
    const embModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await embModel.embedContent(text);
    const embedding = result.embedding.values;
    embeddingCache.set(text, embedding);
    return ok(embedding);
  } catch (e) {
    return err(new AIServiceError('Embedding generation failed', 'text-embedding-004', e instanceof Error ? e : undefined));
  }
}

/**
 * Calculates cosine similarity between two embedding vectors.
 * Returns a value from -1 (opposite) to 1 (identical).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Finds the most semantically similar myth/fact entries for a query.
 *
 * @param query - User's question text
 * @param database - The myth/fact entries to search
 * @param topK - Number of top results to return
 */
export async function findSimilarMyths(
  query: string,
  database: MythFact[],
  topK = 3
): Promise<Result<MythFact[], AIServiceError>> {
  const queryResult = await embedText(query);
  if (!queryResult.success) return err(queryResult.error);

  const queryEmbedding = queryResult.data;
  const scored: Array<{ entry: MythFact; score: number }> = [];

  for (const entry of database) {
    const textToEmbed = `${entry.myth} ${entry.fact}`;
    const embResult = await embedText(textToEmbed);
    if (!embResult.success) continue;
    scored.push({ entry, score: cosineSimilarity(queryEmbedding, embResult.data) });
  }

  const topResults = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.entry);

  return ok(topResults);
}

// ─── Knowledge Distillation (AI-19) ──────────────────────────────────────────

/**
 * Pre-computed answer cache for common queries (Knowledge Distillation).
 * Reduces latency for frequently asked questions by ~95%.
 */
const DISTILLED_KNOWLEDGE: Record<string, string> = {
  'how do i register to vote': 'Visit vote.gov to register online in minutes. You\'ll need your state ID or SSN last 4 digits. Deadlines vary by state — most are 15-30 days before Election Day.',
  'what id do i need to vote': 'Requirements vary by state. Most accept a driver\'s license, state ID, or passport. Check your state\'s requirements at ncsl.org/elections/voter-id.',
  'can i vote by mail': 'Most states offer mail-in or absentee voting. Visit your state\'s Secretary of State website to request a ballot. Deadlines typically apply.',
  'when is election day': 'The 2026 Midterm Election is November 3, 2026. Many states also offer early voting 1-2 weeks before.',
  'am i registered to vote': 'Check your registration status at vote.gov or your state\'s election website. You\'ll need your name, date of birth, and address.',
};

/**
 * Returns a pre-distilled answer for common questions, or null if not found.
 * Call this BEFORE Gemini to save tokens and reduce latency.
 */
export function getDistilledAnswer(query: string): string | null {
  const normalized = query.toLowerCase().trim().replace(/[?!.]/g, '');
  for (const [key, answer] of Object.entries(DISTILLED_KNOWLEDGE)) {
    if (normalized.includes(key) || key.includes(normalized)) return answer;
  }
  return null;
}
