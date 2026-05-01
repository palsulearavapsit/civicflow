/**
 * SEC-22: End-to-End Encryption (E2EE) Utility.
 * Encrypts and decrypts sensitive data using the Web Crypto API.
 * Ensures PII is never stored in plaintext on the server/database.
 */

const ENCRYPTION_KEY_NAME = 'civicflow-e2ee-key';

/** Generates or retrieves a persistent master key from IndexedDB/Storage. */
async function getMasterKey(): Promise<CryptoKey> {
  // In a real production app, this would be derived from the user's password or biometrics
  const existing = localStorage.getItem(ENCRYPTION_KEY_NAME);
  if (existing) {
    const raw = Uint8Array.from(atob(existing), c => c.charCodeAt(0));
    return await crypto.subtle.importKey('raw', raw, 'AES-GCM', true, ['encrypt', 'decrypt']);
  }

  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  const exported = await crypto.subtle.exportKey('raw', key);
  localStorage.setItem(ENCRYPTION_KEY_NAME, btoa(String.fromCharCode(...new Uint8Array(exported))));
  return key;
}

/** Encrypts a string and returns a base64 encoded payload with IV. */
export async function encryptData(text: string): Promise<string> {
  const key = await getMasterKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

/** Decrypts a base64 encoded payload. */
export async function decryptData(payload: string): Promise<string> {
  const key = await getMasterKey();
  const combined = Uint8Array.from(atob(payload), c => c.charCodeAt(0));
  
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  return new TextDecoder().decode(decrypted);
}
