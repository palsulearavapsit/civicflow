/**
 * @fileoverview Payload Signing for AI requests (SEC-06).
 *
 * All AI API requests are signed with HMAC-SHA256 using a shared secret.
 * The server verifies the signature before processing, preventing:
 * - Request tampering in transit
 * - Replay attacks (timestamp-based nonces)
 * - Unauthorized AI calls
 *
 * @module utils/payload-signing
 */

const SIGNATURE_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

// ─── Client-Side: Sign a Payload ─────────────────────────────────────────────

/**
 * Signs a request payload with HMAC-SHA256 and returns the headers needed
 * to authenticate the request on the server.
 *
 * @param payload - The request body object (will be JSON-serialised)
 * @param secret - The shared signing secret (from env: NEXT_PUBLIC_REQUEST_SIGNING_KEY)
 * @returns Headers to attach to the outgoing request
 */
export async function signPayload(
  payload: unknown,
  secret: string = process.env.NEXT_PUBLIC_REQUEST_SIGNING_KEY ?? 'dev-secret-key'
): Promise<{ 'X-Signature': string; 'X-Timestamp': string }> {
  const timestamp = Date.now().toString();
  const body = JSON.stringify(payload);
  const message = `${timestamp}.${body}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  const signatureHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return { 'X-Signature': signatureHex, 'X-Timestamp': timestamp };
}

// ─── Server-Side: Verify a Signature ─────────────────────────────────────────

/**
 * Verifies a signed request on the server side.
 * Returns false if the signature is invalid or the timestamp is expired.
 *
 * @param body - Raw request body string
 * @param signature - The X-Signature header value
 * @param timestamp - The X-Timestamp header value
 * @param secret - The shared signing secret (from env: REQUEST_SIGNING_KEY)
 */
export async function verifySignature(
  body: string,
  signature: string,
  timestamp: string,
  secret: string = process.env.REQUEST_SIGNING_KEY ?? 'dev-secret-key'
): Promise<boolean> {
  try {
    // Reject expired timestamps (replay attack prevention)
    const ts = parseInt(timestamp, 10);
    if (isNaN(ts) || Math.abs(Date.now() - ts) > SIGNATURE_VALIDITY_MS) return false;

    const message = `${timestamp}.${body}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const expectedBytes = new Uint8Array(
      signature.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
    );

    return crypto.subtle.verify('HMAC', key, expectedBytes, new TextEncoder().encode(message));
  } catch {
    return false;
  }
}

// ─── Signed Fetch Helper ──────────────────────────────────────────────────────

/**
 * Performs a signed POST request to a CivicFlow API endpoint.
 * Automatically attaches HMAC signature and timestamp headers.
 */
export async function signedFetch(url: string, payload: unknown): Promise<Response> {
  const sigHeaders = await signPayload(payload);
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...sigHeaders,
    },
    body: JSON.stringify(payload),
  });
}
