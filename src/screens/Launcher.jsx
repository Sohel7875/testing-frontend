import { useEffect, useMemo, useState } from 'react';

/**
 * Standalone mobile token launcher (QA tool). Open /launcher on any phone, pick a
 * game + player, tap Generate → get a launch link you can open right there. Calls
 * the aggregator's admin demo-launch endpoint directly (CORS is open).
 *
 * The admin key + operatorId + base URL are stored in localStorage on THIS device
 * (entered once) — never hardcoded, because this repo is public.
 */

const LS_KEY = 'launcherCfg';
const DEFAULTS = {
  base: 'https://slot-aggregator.onsdlc.cloud',
  operatorId: 'playslot',
  adminKey: '',
};
const GAMES = [
  'super_ace_96',
  'celestial_guardians_96',
  'angliam_bayan_96',
  'duck_hunt_96',
  'crazy_emoji_96',
];

function loadCfg() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(LS_KEY) || '{}') }; }
  catch { return { ...DEFAULTS }; }
}

export default function Launcher() {
  const [cfg, setCfg] = useState(loadCfg);
  const [gameCode, setGameCode] = useState(GAMES[0]);
  const [player, setPlayer] = useState('raj_2');
  const [currency, setCurrency] = useState('USD');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { token, launchUrl, socketUrl }
  const [error, setError] = useState('');
  const [showCfg, setShowCfg] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(''); // which field was copied

  useEffect(() => { setShowCfg(!cfg.adminKey); }, []); // force setup on first use

  const saveCfg = (patch) => {
    const next = { ...cfg, ...patch };
    setCfg(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  };

  const generate = async () => {
    setError(''); setResult(null);
    if (!cfg.adminKey) { setShowCfg(true); setError('Enter the admin key first.'); return; }
    setBusy(true);
    try {
      const base = cfg.base.replace(/\/$/, '');
      const res = await fetch(`${base}/v1/admin/operators/${encodeURIComponent(cfg.operatorId)}/demo-launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Key': cfg.adminKey },
        body: JSON.stringify({ gameCode, operatorPlayerId: player || 'demo-player', currency }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || json.error || `HTTP ${res.status}`);
      const data = json.data || json;
      if (!data.launchUrl) throw new Error('No launchUrl in response');
      setResult(data);
    } catch (e) {
      setError(e.message || 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text, which) => {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); setCopied(which); setTimeout(() => setCopied(''), 1500); } catch { /* ignore */ }
  };

  // The query string the game is launched with: token=…&socket=…&game=…&lang=en
  const launchParams = useMemo(() => (result?.launchUrl?.split('?')[1] || ''), [result]);

  // A QR of the launch link, so a second phone can scan it too. Uses a public
  // QR image service — the launchUrl (with token) is the only thing encoded.
  const qrSrc = useMemo(() => {
    if (!result?.launchUrl) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(result.launchUrl)}`;
  }, [result]);

  const field = 'w-full px-3 py-2.5 rounded-lg bg-stake-900 border border-stake-600 text-white outline-none focus:border-stake-blue';
  const label = 'text-stake-text text-xs uppercase tracking-wide mb-1 block';

  return (
    <div className="min-h-screen bg-stake-900 text-white px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-extrabold">🎰 Token Launcher</h1>
          <button onClick={() => setShowCfg((v) => !v)} className="text-stake-text hover:text-white text-sm">
            {showCfg ? 'Hide setup' : 'Setup'}
          </button>
        </div>

        {showCfg && (
          <div className="mb-5 grid gap-3 p-4 rounded-xl bg-stake-800 border border-stake-600">
            <div>
              <span className={label}>Aggregator base URL</span>
              <input className={field} value={cfg.base} onChange={(e) => saveCfg({ base: e.target.value })} />
            </div>
            <div>
              <span className={label}>Operator id</span>
              <input className={field} value={cfg.operatorId} onChange={(e) => saveCfg({ operatorId: e.target.value })} />
            </div>
            <div>
              <span className={label}>Admin key (saved on this device only)</span>
              <div className="relative">
                <input className={`${field} pr-16`} type={showKey ? 'text' : 'password'} placeholder="X-Admin-Key"
                  value={cfg.adminKey} onChange={(e) => saveCfg({ adminKey: e.target.value })} />
                <button type="button" onClick={() => setShowKey((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-stake-blue hover:text-white px-2 py-1">
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-3">
          <div>
            <span className={label}>Game</span>
            <select className={field} value={gameCode} onChange={(e) => setGameCode(e.target.value)}>
              {GAMES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className={label}>Player id</span>
              <input className={field} value={player} onChange={(e) => setPlayer(e.target.value)} />
            </div>
            <div>
              <span className={label}>Currency</span>
              <input className={field} value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} />
            </div>
          </div>

          <button onClick={generate} disabled={busy}
            className={`mt-1 py-3 rounded-lg font-bold ${busy ? 'bg-stake-600 text-stake-text' : 'bg-stake-green hover:bg-stake-greenh text-stake-900'}`}>
            {busy ? 'Generating…' : 'Generate token'}
          </button>
        </div>

        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

        {result && (
          <div className="mt-6 grid gap-3 p-4 rounded-xl bg-stake-800 border border-stake-600">
            <a href={result.launchUrl} target="_blank" rel="noreferrer"
              className="py-3 rounded-lg font-extrabold text-center bg-stake-blue hover:opacity-90 text-white">
              ▶ Open game
            </a>

            <div>
              <span className={label}>Launch params (token=…&socket=…&game=…&lang=en)</span>
              <div className="font-mono text-xs break-all bg-stake-900 border border-stake-600 rounded p-2 text-white">
                {launchParams}
              </div>
              <button onClick={() => copy(launchParams, 'params')}
                className="mt-2 w-full py-2.5 rounded-lg font-semibold bg-stake-green hover:bg-stake-greenh text-stake-900 text-sm">
                {copied === 'params' ? 'Copied ✓' : 'Copy launch params'}
              </button>
            </div>

            <button onClick={() => copy(result.launchUrl, 'url')}
              className="py-2.5 rounded-lg font-semibold bg-stake-700 hover:bg-stake-600 text-white text-sm">
              {copied === 'url' ? 'Copied ✓' : 'Copy full launch link'}
            </button>

            <div>
              <span className={label}>Token only</span>
              <div className="font-mono text-xs break-all bg-stake-900 border border-stake-600 rounded p-2 text-stake-text">
                {result.token}
              </div>
            </div>

            {qrSrc && (
              <div className="flex flex-col items-center gap-2 pt-1">
                <img src={qrSrc} alt="Launch QR" className="rounded-lg bg-white p-2" width={200} height={200} />
                <span className="text-stake-text text-xs">Scan to open on another device</span>
              </div>
            )}
          </div>
        )}

        <p className="mt-6 text-[11px] text-stake-text text-center leading-relaxed">
          Demo (sandbox) tokens. Admin key stays on this device (localStorage) — clear your
          browser data to remove it. Don’t share this URL with the key set on a shared phone.
        </p>
      </div>
    </div>
  );
}
