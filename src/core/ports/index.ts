/**
 * @fileoverview Hexagonal Architecture — Domain Ports (Interfaces)
 *
 * Defines the abstract "ports" that the application core depends on.
 * All concrete implementations (Firebase, Gemini, etc.) must implement
 * these interfaces — never the other way around.
 *
 * "The application is hexagonal: the core is surrounded by adapters
 * that translate between the core and the outside world." — Alistair Cockburn
 *
 * @module core/ports
 * @see {@link https://alistair.cockburn.us/hexagonal-architecture/}
 * @see {@link core/adapters/firebase-adapter}
 */

import type { UserProfile, ElectionTask, PollingStation, PersonalizedPlan } from '@/types';
import type { Result } from '@/types/result';
import type { CivicFlowError } from '@/core/errors';

// ─── Driving Ports (inbound / primary) ───────────────────────────────────────

/**
 * Port for all user-facing use cases.
 * UI components interact with the application core through this interface only.
 *
 * @see {@link core/adapters/user-use-cases}
 */
export interface IUserPort {
  /** Retrieves the current user's profile. */
  getMyProfile(): Promise<Result<UserProfile | null>>;
  /** Persists profile updates. */
  saveMyProfile(data: Partial<UserProfile>): Promise<Result<void>>;
  /** Initiates the Google OAuth sign-in flow. */
  signInWithGoogle(): Promise<Result<UserProfile>>;
  /** Signs the current user out and revokes all sessions. */
  signOut(): Promise<Result<void>>;
}

/**
 * Port for election information use cases.
 */
export interface IElectionPort {
  /** Generates a personalized voting plan. */
  getPersonalizedPlan(profile: UserProfile): Promise<Result<PersonalizedPlan>>;
  /** Retrieves upcoming election tasks by location. */
  getElectionTasks(state: string): Promise<Result<ElectionTask[]>>;
}

/**
 * Port for the AI copilot use cases.
 */
export interface IAIPort {
  /** Sends a message and returns an async stream of text chunks. */
  streamMessage(prompt: string, history: ChatMessage[]): AsyncGenerator<string>;
  /** Classifies the user's intent before calling a full model. */
  detectIntent(text: string): Promise<Result<UserIntent>>;
  /** Analyzes an uploaded image (e.g., voter ID). */
  analyzeImage(imageBase64: string, mimeType: string): Promise<Result<ImageAnalysisResult>>;
}

// ─── Driven Ports (outbound / secondary) ─────────────────────────────────────

/**
 * Port for all persistence operations.
 * Firebase, Supabase, or any other DB can implement this.
 *
 * @see {@link core/adapters/firebase-adapter}
 */
export interface IUserRepository {
  findById(uid: string): Promise<Result<UserProfile | null, CivicFlowError>>;
  save(profile: UserProfile): Promise<Result<void, CivicFlowError>>;
  update(uid: string, data: Partial<UserProfile>): Promise<Result<void, CivicFlowError>>;
  delete(uid: string): Promise<Result<void, CivicFlowError>>;
}

/**
 * Port for the audit log persistence layer.
 */
export interface IAuditRepository {
  log(entry: AuditEntry): Promise<Result<void, CivicFlowError>>;
  findByUser(uid: string, limit?: number): Promise<Result<AuditEntry[], CivicFlowError>>;
}

/**
 * Port for the AI service infrastructure (Gemini, Vertex AI, etc.).
 */
export interface IAIService {
  generateStream(prompt: string, config: AIGenerationConfig): AsyncGenerator<string>;
  generateStructured<T>(prompt: string, schema: object): Promise<Result<T, CivicFlowError>>;
  embedText(text: string): Promise<Result<number[], CivicFlowError>>;
}

/**
 * Port for feature flag evaluation.
 * @see {@link core/feature-flags}
 */
export interface IFeatureFlagService {
  isEnabled(key: FeatureFlagKey): boolean;
  getValue<T>(key: FeatureFlagKey): T | undefined;
}

/**
 * Port for session management (revocation, rotation).
 * @see {@link core/session-manager}
 */
export interface ISessionService {
  createSession(uid: string): Promise<Result<string, CivicFlowError>>;
  revokeSession(sessionId: string): Promise<Result<void, CivicFlowError>>;
  revokeAllSessions(uid: string): Promise<Result<void, CivicFlowError>>;
  validateSession(sessionId: string): Promise<Result<boolean, CivicFlowError>>;
}

// ─── Shared Domain Types ──────────────────────────────────────────────────────

/** A message in the AI chat history. */
export interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

/** Detected user intent from natural language. */
export type UserIntent =
  | 'find_polling_station'
  | 'check_registration_deadline'
  | 'learn_voting_methods'
  | 'myth_fact_check'
  | 'general_question';

/** Result of multimodal image analysis. */
export interface ImageAnalysisResult {
  documentType: 'voter_id' | 'ballot' | 'registration_form' | 'unknown';
  extractedText: string;
  warnings: string[];
  isValid: boolean;
}

/** An entry in the immutable audit log. */
export interface AuditEntry {
  uid: string;
  action: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
  signature?: string; // HMAC-SHA256
  userAgent?: string;
}

/** Configuration for AI generation requests. */
export interface AIGenerationConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  safetySettings?: SafetySetting[];
  history?: ChatMessage[];
  systemInstruction?: string;
}

/** Gemini safety setting pair. */
export interface SafetySetting {
  category: string;
  threshold: string;
}

/** All available feature flag keys. */
export type FeatureFlagKey =
  | 'ai_multimodal'
  | 'vertex_ai'
  | 'gemini_1_5_pro'
  | 'search_grounding'
  | 'voice_recognition'
  | 'ppr_dashboard'
  | 'wasm_election_logic'
  | 'ai_feedback_loop'
  | 'cost_tracking'
  | 'model_ab_testing';
