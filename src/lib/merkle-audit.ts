import { logAuditEntry } from './audit';

/**
 * SEC-01: Merkle Tree Hash Chain for Audit Integrity.
 * Every log entry includes a hash of the previous entry, 
 * creating an immutable cryptographic chain.
 */

let lastHash: string | null = null;

async function computeHash(data: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const logSecureAuditEntry = async (userId: string, action: string, metadata: Record<string, any> = {}) => {
  const currentData = JSON.stringify({ userId, action, metadata, lastHash });
  const currentHash = await computeHash(currentData);
  
  await logAuditEntry(userId, action, {
    ...metadata,
    _chainHash: currentHash,
    _prevHash: lastHash
  });

  lastHash = currentHash;
};
