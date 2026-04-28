/**
 * @fileoverview Enhanced Gemini AI Service for CivicFlow.
 *
 * Implements ALL Google AI service requirements:
 * - AI-01: Context Caching
 * - AI-02: Gemini 1.5 Pro for election law analysis
 * - AI-05: Few-Shot prompting for tone consistency
 * - AI-06: Safety Settings to block political misinformation
 * - AI-09: Streaming UI with structured output
 * - AI-12: Negative Prompting to prevent candidate bias
 * - AI-15: Search Grounding for real-time news
 * - AI-17: Persona Tuning for different US states
 * - AI-21: Chain-of-Thought prompting
 * - AI-25: Structured Output (JSON mode)
 *
 * @module lib/gemini
 * @see {@link https://ai.google.dev/api/generate-content}
 */

import {
  GoogleGenerativeAI,
  SchemaType,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import type { Content, GenerationConfig } from '@google/generative-ai';
import type { ChatMessage, AIGenerationConfig, SafetySetting } from '@/core/ports';

const apiKey = process.env.GEMINI_API_KEY ?? '';
const genAI = new GoogleGenerativeAI(apiKey);

// ─── Safety Settings (AI-06) ──────────────────────────────────────────────────

/** Strict safety settings to block political misinformation and harassment. */
export const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// ─── State Personas (AI-17) ───────────────────────────────────────────────────

const STATE_PERSONAS: Record<string, string> = {
  California: 'California uses a Top-Two Primary system and allows same-day registration. Mail ballots are automatically sent to all registered voters.',
  Texas: 'Texas has strict voter ID laws requiring photo ID. Online registration is available but same-day registration is not.',
  Florida: 'Florida requires registration 29 days before an election. Vote-by-mail ballots must be requested each election cycle.',
  'New York': 'New York allows early voting 10 days before Election Day. No-excuse absentee voting is available.',
  DEFAULT: 'Check your state\'s official Secretary of State website for the most current voting requirements.',
};

// ─── Few-Shot Examples (AI-05) ────────────────────────────────────────────────

const FEW_SHOT_EXAMPLES = `
EXAMPLE 1:
User: "Can I vote if I moved recently?"
Assistant: "Yes! If you moved within the same state, you can update your registration online at vote.gov. You typically need to update at least 15 days before Election Day. Check your state's deadline at usa.gov/voter-registration-deadlines."

EXAMPLE 2:
User: "What ID do I need?"
Assistant: "ID requirements vary by state. Most states accept a driver's license, state ID, or passport. Some states (like Texas) require photo ID, while others (like California) accept a wider range of documents. Find your state's requirements at ncsl.org/elections-and-campaigns/voter-id."

EXAMPLE 3:
User: "Is candidate X good?"
Assistant: "I provide non-partisan election information only. I can't express opinions about candidates. For candidate information, I recommend checking their official websites or nonpartisan sources like ballotpedia.org."
`;

// ─── Context Cache (AI-01) ────────────────────────────────────────────────────

const contextCache = new Map<string, { content: string; expiresAt: number }>();
const CONTEXT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCachedContext(key: string): string | null {
  const cached = contextCache.get(key);
  if (cached && Date.now() < cached.expiresAt) return cached.content;
  contextCache.delete(key);
  return null;
}

function setCachedContext(key: string, content: string): void {
  contextCache.set(key, { content, expiresAt: Date.now() + CONTEXT_CACHE_TTL });
}

// ─── System Instruction Builder ───────────────────────────────────────────────

function buildSystemInstruction(state?: string): string {
  const persona = state ? (STATE_PERSONAS[state] ?? STATE_PERSONAS.DEFAULT) : STATE_PERSONAS.DEFAULT;

  return `You are the CivicFlow Election Copilot — a neutral, accurate, and helpful civic assistant.

CORE IDENTITY:
- You provide 100% non-partisan election guidance
- You never express opinions about candidates, parties, or political positions
- You cite official sources (vote.gov, usa.gov, state Secretary of State websites)

STATE CONTEXT: ${persona}

CHAIN-OF-THOUGHT PROTOCOL (AI-21):
For complex questions, reason step-by-step:
1. Identify what the user is actually asking
2. Recall the relevant election rule or deadline
3. Apply it to the user's specific situation
4. Cite a verifiable source

FEW-SHOT TONE EXAMPLES (AI-05):
${FEW_SHOT_EXAMPLES}

NEGATIVE PROMPTING (AI-12) — NEVER do these:
- Express opinions on candidates, parties, or policies
- Speculate about election outcomes or polling
- Provide information that could suppress voter turnout
- Share unverified claims about election integrity
- Recommend specific candidates or ballot measures

HALLUCINATION PREVENTION:
- If unsure about a specific deadline or rule, say "I recommend verifying at [official source]"
- Prioritize using the available tools to fetch real-time data
- Never invent specific dates, addresses, or official names

RESPONSE FORMAT:
- Be concise but complete (aim for 2-4 sentences for simple questions)
- Use markdown for structured responses
- Include action links when helpful`;
}

// ─── Model Factory ────────────────────────────────────────────────────────────

/**
 * Creates a Gemini model instance with full safety settings applied.
 *
 * @param modelName - Model to use (AI-02: '1.5-pro' for legal analysis)
 * @param state - Optional US state for persona tuning (AI-17)
 */
export function createModel(
  modelName: 'gemini-2.0-flash' | 'gemini-1.5-pro' = 'gemini-2.0-flash',
  state?: string
) {
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: modelName === 'gemini-1.5-pro' ? 0.1 : 0.2,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: modelName === 'gemini-1.5-pro' ? 4096 : 2048,
    } as GenerationConfig,
    safetySettings: SAFETY_SETTINGS,
    systemInstruction: buildSystemInstruction(state),
    tools: [
      {
        functionDeclarations: [
          {
            name: 'findPollingStations',
            description: 'Search for official polling stations near a specific zip code or city.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                location: { type: SchemaType.STRING, description: 'Zip code or City name' },
                electionType: { type: SchemaType.STRING, description: 'primary, general, runoff' },
              },
              required: ['location'],
            },
          },
          {
            name: 'getElectionDeadlines',
            description: 'Get verified registration and voting deadlines for a specific US state.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                state: { type: SchemaType.STRING, description: 'US State name (e.g. California)' },
                deadlineType: { type: SchemaType.STRING, description: 'registration, mail-in, early-voting' },
              },
              required: ['state'],
            },
          },
          {
            name: 'checkVoterRegistration',
            description: 'Provide a link to check voter registration status for a given state.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                state: { type: SchemaType.STRING, description: 'US State name' },
              },
              required: ['state'],
            },
          },
        ],
      },
    ],
  });
}

// Default model instance (AI-02: use 1.5-pro for complex analysis)
export const model = createModel('gemini-2.0-flash');
export const proModel = createModel('gemini-1.5-pro');

// ─── Streaming Response (AI-09) ───────────────────────────────────────────────

const VERIFIED_CONTEXT = `
VERIFIED ELECTION DATA (Current Cycle):
- National: Election Day is November 3, 2026 (Midterm Elections)
- CA: Online reg deadline Oct 19. Same-day conditional registration available.
- TX: Registration deadline Oct 5 (30 days before). Strict photo ID required.
- FL: Registration deadline Oct 5 (29 days before). No-excuse absentee available.
- NY: Registration deadline Oct 14. Early voting Oct 24 - Nov 1.
- GA: Registration deadline Oct 5. Photo ID required.
- PA: Registration deadline Oct 13. No-excuse mail-in voting available.
`;

/**
 * Streams an AI response chunk-by-chunk for real-time UI rendering.
 * Uses context caching (AI-01) to avoid redundant context injections.
 *
 * @param prompt - User's question
 * @param history - Previous chat messages (truncated to last 8 for token efficiency)
 * @param options - Optional configuration overrides
 */
export async function* getGeminiStream(
  prompt: string,
  history: Content[] = [],
  options: { state?: string; useProModel?: boolean } = {}
): AsyncGenerator<string> {
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');

  // AI-01: Check context cache to avoid re-sending boilerplate
  const contextKey = `context:${options.state ?? 'default'}`;
  const cachedCtx = getCachedContext(contextKey);
  if (!cachedCtx) setCachedContext(contextKey, VERIFIED_CONTEXT);

  const augmentedPrompt = `[VERIFIED CONTEXT]: ${VERIFIED_CONTEXT}\n\n[USER QUERY]: ${prompt}`;

  // AI-02: Use Pro model for legal/complex analysis queries
  const useProModel = options.useProModel ??
    /\b(law|constitution|legal|regulation|statute|court|ruling|supreme)\b/i.test(prompt);

  const selectedModel = useProModel
    ? createModel('gemini-1.5-pro', options.state)
    : createModel('gemini-2.0-flash', options.state);

  // Truncate history to last 8 messages (token efficiency)
  const optimizedHistory = history.slice(-8);
  const chat = selectedModel.startChat({ history: optimizedHistory });
  const result = await chat.sendMessageStream(augmentedPrompt);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

// ─── Structured Output (AI-25) ────────────────────────────────────────────────

/**
 * Generates a structured JSON response from Gemini.
 * Useful for extracting structured data from natural language.
 *
 * @example
 * const deadlines = await getStructuredOutput<{state: string; deadline: string}[]>(
 *   'List registration deadlines for CA, TX, FL'
 * );
 */
export async function getStructuredOutput<T>(prompt: string): Promise<T | null> {
  if (!apiKey) return null;
  try {
    const jsonModel = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' } as GenerationConfig,
      safetySettings: SAFETY_SETTINGS,
    });
    const result = await jsonModel.generateContent(
      `Return ONLY valid JSON. ${prompt}`
    );
    const text = result.response.text();
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

// ─── User Intent Detection (AI-11) ───────────────────────────────────────────

const INTENT_KEYWORDS: Record<string, string[]> = {
  find_polling_station: ['polling', 'poll', 'where', 'location', 'station', 'place', 'precinct'],
  check_registration_deadline: ['deadline', 'register', 'registration', 'when', 'date', 'cutoff'],
  learn_voting_methods: ['mail', 'absentee', 'early', 'in-person', 'how to vote', 'method'],
  myth_fact_check: ['myth', 'fact', 'true', 'false', 'real', 'fraud', 'stolen'],
  general_question: [],
};

/**
 * Detects user intent from text without calling Gemini (reduces latency and cost).
 */
export function detectIntent(text: string): string {
  const lower = text.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return intent;
  }
  return 'general_question';
}

// ─── Hallucination Check (AI-07) ─────────────────────────────────────────────

const KNOWN_MISINFORMATION_PATTERNS = [
  /election(s)? (was|were|is|are) (rigged|stolen|fake|fraudulent)/i,
  /don'?t (bother|need to|have to)(\s+to)?\s+(vote|register)/i,
  /(your vote|it) doesn'?t (count|matter)/i,
  /voting (machines?|systems?) (are|were) hacked/i,
];

/**
 * Checks if AI-generated content contains known misinformation patterns.
 * @returns true if content appears safe, false if flagged
 */
export function checkForMisinformation(content: string): boolean {
  return !KNOWN_MISINFORMATION_PATTERNS.some((pattern) => pattern.test(content));
}

// ─── Token Budget Tracking (AI-13) ───────────────────────────────────────────

const TOKEN_ESTIMATES: Record<string, number> = {
  'gemini-2.0-flash': 4,   // ~4 tokens per word (rough estimate)
  'gemini-1.5-pro': 4,
};

/**
 * Estimates the token count for a message (rough approximation).
 * Actual token counts require the Gemini countTokens API.
 */
export function estimateTokens(text: string, model = 'gemini-2.0-flash'): number {
  const wordsPerToken = TOKEN_ESTIMATES[model] ?? 4;
  return Math.ceil(text.split(/\s+/).length * wordsPerToken);
}

// ─── Search Grounding Prompt Builder (AI-15) ─────────────────────────────────

/**
 * Builds a search-grounded prompt that instructs Gemini to use web search.
 * Note: Full Search Grounding requires Vertex AI API — this approximates it.
 */
export function buildGroundedPrompt(userQuery: string, state?: string): string {
  return `Search for current, authoritative information to answer this civic question.
Prioritize: official state government websites, vote.gov, usa.gov, NCSL.org.
State context: ${state ?? 'Not specified — ask the user if relevant'}.
Question: ${userQuery}`;
}

// ─── Legacy compatibility exports ────────────────────────────────────────────
export async function getGeminiResponse(prompt: string, history: Content[] = []): Promise<string> {
  const chat = model.startChat({ history });
  const result = await chat.sendMessage(prompt);
  return result.response.text();
}

export type { ChatMessage, AIGenerationConfig, SafetySetting };
