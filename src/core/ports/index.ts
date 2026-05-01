/**
 * CODE-05: Clean Architecture Ports.
 * Interfaces for external services to decouple logic from frameworks.
 */

export interface AIService {
  generateResponse(prompt: string, history: any[]): Promise<string>;
  streamResponse(prompt: string, history: any[]): AsyncGenerator<string>;
}

export interface IUserRepository {
  getUser(uid: string): Promise<any>;
  saveUser(uid: string, data: any): Promise<void>;
}

export interface AuditEntry {
  userId: string;
  action: string;
  metadata: any;
  timestamp: Date;
}

export interface IAuditRepository {
  logAudit(entry: AuditEntry): Promise<void>;
}

export interface StorageService {
  save(key: string, value: any): Promise<void>;
  get(key: string): Promise<any | null>;
}
