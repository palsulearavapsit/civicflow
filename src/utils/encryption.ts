/**
 * Industrial-grade encryption utility for browser storage.
 * Uses AES-GCM for authenticated encryption of sensitive civic data.
 */
export const EncryptionService = {
  async encrypt(text: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const key = await this.getKey(secret);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
    
    return JSON.stringify({
      iv: Buffer.from(iv).toString('base64'),
      data: Buffer.from(new Uint8Array(encrypted)).toString('base64')
    });
  },

  async decrypt(cipherJson: string, secret: string): Promise<string> {
    const { iv, data } = JSON.parse(cipherJson);
    const key = await this.getKey(secret);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: Buffer.from(iv, 'base64') },
      key,
      Buffer.from(data, 'base64')
    );
    return new TextDecoder().decode(decrypted);
  },

  async getKey(secret: string): Promise<CryptoKey> {

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret.padEnd(32, '0').slice(0, 32));
    return crypto.subtle.importKey(
      "raw",
      keyData,
      "AES-GCM",
      false,
      ["encrypt", "decrypt"]
    );
  }
};
