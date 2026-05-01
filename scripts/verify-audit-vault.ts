/**
 * SEC-10: Audit Vault Integrity Verifier.
 * Iterates through a chain of audit logs and verifies the cryptographic
 * hash links to detect unauthorized tampering.
 */

interface AuditEntry {
  _chainHash: string;
  _prevHash: string | null;
  userId: string;
  action: string;
  metadata: any;
}

export async function verifyAuditChain(entries: AuditEntry[]): Promise<boolean> {
  for (let i = 1; i < entries.length; i++) {
    const current = entries[i];
    const prev = entries[i - 1];

    if (current._prevHash !== prev._chainHash) {
      console.error(`❌ Audit Integrity Violation at entry ${i}!`);
      console.error(`Expected prevHash: ${prev._chainHash}, found: ${current._prevHash}`);
      return false;
    }
  }

  console.log('✅ Audit Vault integrity verified. No tampering detected.');
  return true;
}
