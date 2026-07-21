// Operator FRONTEND client. Talks ONLY to the operator backend with a player JWT.
// No aggregator keys, no signing in the browser.

const CFG_KEY = 'opCfg';
const TOKEN_KEY = 'opToken';

const DEFAULTS = {
  operatorUrl: 'https://operator-backend-sez2.onrender.com',
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
  return getConfig().operatorUrl.replace(/\/$/, '');
}

async function req(method, path, body, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;
  const res = await fetch(`${base()}${path}`, {
    method,
    headers,
    body: body == null ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
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
export const getTransactions = () => req('GET', '/api/transactions');

/** Aggregator-approved games for this operator (proxied + signed by the operator backend). */
export const getGames = () => req('GET', '/api/games');

/** Launch a game for the logged-in player → { launchUrl, token, socketUrl }. */
export async function launchGame({ gameCode, currency } = {}) {
  const cfg = getConfig();
  return req('POST', '/api/launch', { gameCode: gameCode || cfg.gameCode, currency: currency || cfg.currency });
}
