import type { UserProfile } from '@/types';
import type { Result } from '@/types/result';
import type { DatabaseError } from '@/core/errors';

export interface AIService {
  generateResponse(prompt: string, history: any[]): Promise<string>;
  streamResponse(prompt: string, history: any[]): AsyncGenerator<string>;
}

export interface IUserRepository {
  findById(uid: string): Promise<Result<UserProfile | null, DatabaseError>>;
  save(profile: UserProfile): Promise<Result<void, DatabaseError>>;
  update(uid: string, data: Partial<UserProfile>): Promise<Result<void, DatabaseError>>;
  delete(uid: string): Promise<Result<void, DatabaseError>>;
}

export interface AuditEntry {
  userId: string;
  action: string;
  metadata: any;
  timestamp: Date;
  signature?: string;
}

export interface IAuditRepository {
  log(entry: AuditEntry): Promise<Result<void, DatabaseError>>;
  findByUser(uid: string, limitN?: number): Promise<Result<AuditEntry[], DatabaseError>>;
}

export interface StorageService {
  save(key: string, value: any): Promise<void>;
  get(key: string): Promise<any | null>;
}
