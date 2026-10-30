// Operator FRONTEND client. Talks ONLY to the operator backend with a player JWT.
// No aggregator keys, no signing in the browser.

const CFG_KEY = 'opCfg';
const TOKEN_KEY = 'opToken';

// ── Operator backend base URL — SINGLE SOURCE OF TRUTH. Change it here. ──
// Not read from localStorage anymore, so it can't drift per browser.
// const OPERATOR_BASE_URL = 'http://localhost:5001';
const OPERATOR_BASE_URL = 'https://operator-backend-sez2.onrender.com'; // deployed

const DEFAULTS = {
  gameCode: 'duck_hunt_96',
  currency: 'USD',
};

export function getConfig() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(CFG_KEY) || '{}') };
  } catch {
    return { ...DEFAULTS };
  }
}
export function saveConfig(patch) {
  const next = { ...getConfig(), ...patch };
  localStorage.setItem(CFG_KEY, JSON.stringify(next));
  return next;
}

export const getToken = () => localStorage.getItem(TOKEN_KEY) || '';
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));
export const logout = () => setToken('');

function base() {
  return OPERATOR_BASE_URL.replace(/\/$/, '');
}

// The operator backend runs on a host that SLEEPS when idle (Render free tier),
// so the first request after a lull can take 30–60s to cold-start. A single
// fetch on a slow/mobile network gives up and surfaces "Failed to fetch". To
// survive that: a generous per-attempt timeout + retry ONLY on network failures
// (no HTTP response was received → the request never reached the server, so a
// retry is safe even for POST). Once the box is awake, later calls are instant.
const ATTEMPT_TIMEOUT_MS = 60000; // cold start can be ~50s
const MAX_RETRIES = 3;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithTimeout(url, opts) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ATTEMPT_TIMEOUT_MS);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function req(method, path, body, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;
  const opts = { method, headers, body: body == null ? undefined : JSON.stringify(body) };

  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(`${base()}${path}`, opts);
      // Got an HTTP response → do NOT retry (a 4xx/5xx is a real answer).
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
      return data;
    } catch (err) {
      // Only network-level failures (fetch threw / aborted) are retryable — an
      // HTTP error above is rethrown here too, so distinguish by err.name/message.
      const isNetwork = err.name === 'AbortError' || err.name === 'TypeError' || /Failed to fetch|NetworkError|Load failed/i.test(err.message || '');
      lastErr = isNetwork
        ? new Error('Server is waking up or unreachable. Please wait a moment and retry.')
        : err;
      if (!isNetwork || attempt === MAX_RETRIES) throw lastErr;
      await sleep(1500 * (attempt + 1)); // back off: 1.5s, 3s, 4.5s while it boots
    }
  }
  throw lastErr;
}

/**
 * Wake the sleeping backend early. Fire-and-forget on app load so by the time the
 * user submits login/signup the box is already booting (or awake). Never throws.
 */
export async function warmUp() {
  try { await fetchWithTimeout(`${base()}/health`, { method: 'GET' }); } catch { /* best-effort */ }
}

// ── auth ──
export async function signup({ username, email, password }) {
  const out = await req('POST', '/api/auth/signup', { username, email, password }, false);
  setToken(out.token);
  return out;
}
export async function login({ usernameOrEmail, password }) {
  const out = await req('POST', '/api/auth/login', { usernameOrEmail, password }, false);
  setToken(out.token);
  return out;
}

// ── player ──
export const me = () => req('GET', '/api/me');
export const deposit = (amount) => req('POST', '/api/deposit', { amount });
// amount can be a number or the string 'all' to drain the wallet to 0.
export const withdraw = (amount) => req('POST', '/api/withdraw', { amount });
export const getTransactions = () => req('GET', '/api/transactions');

/** Aggregator-approved games for this operator (proxied + signed by the operator backend). */
export const getGames = () => req('GET', '/api/games');

/** Launch a game for the logged-in player → { launchUrl, token, socketUrl }.
 *  mode: 'real' (default) or 'demo' (fake-money sandbox wallet). */
export async function launchGame({ gameCode, currency, mode = 'real' } = {}) {
  const cfg = getConfig();
  return req('POST', '/api/launch', {
    gameCode: gameCode || cfg.gameCode,
    currency: currency || cfg.currency,
    mode,
  });
}
