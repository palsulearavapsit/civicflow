import type { UserProfile } from '@/types';
import type { Result } from '@/types/result';
import type { DatabaseError } from '@/core/errors';

export interface AIService {
  generateResponse(prompt: string, history: any[]): Promise<string>;
  streamResponse(prompt: string, history: any[]): AsyncGenerator<string>;
}

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

export interface IUserRepository {
  findById(uid: string): Promise<Result<UserProfile | null, DatabaseError>>;
  save(profile: UserProfile): Promise<Result<void, DatabaseError>>;
  update(uid: string, data: Partial<UserProfile>): Promise<Result<void, DatabaseError>>;
  delete(uid: string): Promise<Result<void, DatabaseError>>;
}

export interface AuditEntry {
  uid: string;
  action: string;
  metadata: any;
  timestamp: Date;
  userAgent?: string;
  signature?: string;
}

export interface IAuditRepository {
  log(entry: AuditEntry): Promise<Result<void, DatabaseError>>;
  findByUser(uid: string, limitN?: number): Promise<Result<AuditEntry[], DatabaseError>>;
}

export interface ISessionService {
  createSession(uid: string): Promise<Result<string, Error>>;
  revokeSession(sessionId: string): Promise<Result<void, Error>>;
  revokeAllSessions(uid: string): Promise<Result<void, Error>>;
  validateSession(sessionId: string): Promise<Result<boolean, Error>>;
}

export interface StorageService {
  save(key: string, value: any): Promise<void>;
  get(key: string): Promise<any | null>;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface AIGenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
}

export interface SafetySetting {
  category: string;
  threshold: string;
}
