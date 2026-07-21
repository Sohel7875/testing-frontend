// Browser-side HMAC-SHA256 signing that mirrors the aggregator's
// src/security/signature.js. FOR LOCAL TESTING ONLY — this puts the operator
// inboundSecret in the browser, which a real operator would never do (signing
// happens on their backend). Here the test frontend plays the operator.

const enc = new TextEncoder();

function bufToHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function sha256Hex(str) {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(str ?? ''));
  return bufToHex(digest);
}

// canonical = METHOD \n PATH \n TIMESTAMP \n NONCE \n sha256hex(body)
export async function buildCanonical({ method, path, timestamp, nonce, body }) {
  const bodyHash = await sha256Hex(typeof body === 'string' ? body : JSON.stringify(body ?? ''));
  return [String(method).toUpperCase(), path, String(timestamp), String(nonce), bodyHash].join('\n');
}

export async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return bufToHex(sig);
}

export async function sign({ secret, method, path, timestamp, nonce, body }) {
  const canonical = await buildCanonical({ method, path, timestamp, nonce, body });
  return hmacHex(secret, canonical);
}

export function newNonce() {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const nowSeconds = () => Math.floor(Date.now() / 1000);
