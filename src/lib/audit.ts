import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * SEC-12: Immutable Audit Vault Logger.
 * Logs critical user actions to a secure, append-only collection.
 */
export const logAuditEntry = async (userId: string, action: string, metadata: Record<string, any> = {}) => {
  try {
    if (!db) {
      console.warn('Audit Log: Database not initialized');
      return;
    }
    await addDoc(collection(db, 'audit_vault'), {
      userId,
      action,
      metadata,
      timestamp: serverTimestamp(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};

/**
 * GOOGLE-23: Real-time AI Cost Analytics Logger.
 */
export const logCostEntry = async (userId: string, model: string, promptTokens: number, responseTokens: number) => {
  const estimatedCost = (promptTokens * 0.000125 + responseTokens * 0.000375) / 1000; // Mock Gemini 1.5 Flash pricing
  await logAuditEntry(userId, 'ai_cost_event', {
    model,
    promptTokens,
    responseTokens,
    estimatedCost,
  });
};
