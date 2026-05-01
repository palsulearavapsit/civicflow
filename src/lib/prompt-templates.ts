/**
 * GOOGLE-02: Vertex AI Managed Prompts.
 * Centralized schema for AI prompt templates to allow easy versioning.
 */

export const PROMPT_TEMPLATES = {
  ELECTION_PLAN_GENERATOR: {
    version: '2.1.0',
    template: (state: string, isFirstTime: boolean) => `
      Analyze the election requirements for ${state}.
      User is a ${isFirstTime ? 'first-time' : 'returning'} voter.
      Generate a step-by-step compliance checklist.
      Constraint: 100% non-partisan, no candidate mentions.
    `
  },
  PLAIN_LANGUAGE_SIMPLIFIER: {
    version: '1.0.4',
    template: (text: string) => `
      Simplify the following text to a 4th-grade level. 
      Use bullet points and active voice.
      Text: "${text}"
    `
  },
  MYTH_BUSTER_BOT: {
    version: '1.2.0',
    template: (claim: string) => `
      Verify the following election claim using official sources.
      Claim: "${claim}"
      Output format: FACT | MYTH | UNVERIFIED. 
      Include 2 citations.
    `
  }
};

export type PromptTemplateKey = keyof typeof PROMPT_TEMPLATES;
