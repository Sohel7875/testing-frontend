import { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, FlaskConical, Loader2, X, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { GameContext } from '../context/GameContext';
import { getGames, getToken, launchGame } from '../aggregator/api.js';

const hueOf = (s = '') => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
};

export default function GameDetail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { setAuthModal } = useContext(GameContext);

  const [games, setGames] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ok | error
  const [launching, setLaunching] = useState(null); // 'real' | 'demo' | null
  const [iframeSrc, setIframeSrc] = useState('');

  const load = async () => {
    setStatus('loading');
    try { setGames(await getGames()); setStatus('ok'); }
    catch { setStatus('error'); }
  };
  useEffect(() => { load(); }, []);

  const game = useMemo(() => (games || []).find((g) => g.game_code === code), [games, code]);
  const title = game?.name || code;
  const poster = game?.gamePoster || game?.thumbnail;
  const hue = hueOf(code);
  const bg = `linear-gradient(150deg, hsl(${hue} 70% 22%) 0%, hsl(${(hue + 40) % 360} 65% 12%) 100%)`;

  const start = async (mode) => {
    if (!getToken()) { setAuthModal('login'); return; }
    setLaunching(mode);
    try {
      // launchUrl = the game's real clientUrl with token + socket + game + lang
      // already baked in by the aggregator (buildLaunchUrl).
      const { launchUrl } = await launchGame({ gameCode: code, mode });
      if (!launchUrl) throw new Error('Launch did not return a launchUrl');
      setIframeSrc(launchUrl);
    } catch (e) {
      toast.error(e.message || 'Launch failed', { containerId: 'main-toast' });
    } finally {
      setLaunching(null);
    }
  };

  // ── the game, running in an iframe ──────────────────────────────
  if (iframeSrc) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="h-12 shrink-0 flex items-center justify-between px-4 bg-stake-900 border-b border-stake-600">
          <span className="text-white font-semibold text-sm truncate">🎰 {title}</span>
          <button onClick={() => setIframeSrc('')}
            className="flex items-center gap-1.5 h-8 px-3 rounded bg-stake-700 hover:bg-stake-600 text-white text-sm">
            <X className="w-4 h-4" /> Close
          </button>
        </div>
        <div className="flex-1 bg-black overflow-hidden">
          <iframe
            title={title}
            src={iframeSrc}
            className="w-full h-full border-0 block"
            allow="autoplay; fullscreen"
          />
        </div>
      </div>
    );
  }

  // ── detail page ─────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 max-w-[1100px] mx-auto">
      <button onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-stake-text hover:text-white text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to lobby
      </button>

      {status === 'loading' && (
        <div className="flex items-center gap-2 text-stake-text py-20 justify-center">
          <Loader2 className="w-6 h-6 animate-spin" /> Loading game…
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center py-16 text-center">
          <p className="text-white font-semibold mb-3">Couldn't load games</p>
          <button onClick={load} className="flex items-center gap-2 h-10 px-4 rounded bg-stake-700 hover:bg-stake-600 text-white text-sm">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {status === 'ok' && !game && (
        <div className="py-16 text-center text-stake-text">
          Game <span className="text-white font-mono">{code}</span> isn't in this operator's catalog.
        </div>
      )}

      {status === 'ok' && game && (
        <div className="grid md:grid-cols-[320px_1fr] gap-6">
          {/* poster */}
          <div className="rounded-xl overflow-hidden aspect-[3/4] ring-1 ring-white/10" style={{ background: bg }}>
            {poster
              ? <img src={poster} alt={title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-5xl font-black text-white/90">
                  {title.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>}
          </div>

          {/* info + actions */}
          <div>
            <h1 className="text-white font-extrabold text-2xl sm:text-3xl mb-1">{title}</h1>
            <div className="text-stake-text text-sm mb-4 font-mono">{game.game_code}</div>

            <div className="flex flex-wrap gap-2 mb-6">
              {game.provider && <Tag>{game.provider}</Tag>}
              {game.rtp != null && <Tag>RTP {game.rtp}%</Tag>}
              {game.volatility && <Tag>{game.volatility} volatility</Tag>}
              {game.minBet != null && <Tag>min {game.minBet}</Tag>}
              {game.maxBet != null && <Tag>max {game.maxBet}</Tag>}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md">
              <button onClick={() => start('real')} disabled={!!launching}
                className="flex-1 h-12 rounded-lg font-bold bg-stake-green hover:bg-stake-greenh text-stake-900 flex items-center justify-center gap-2 disabled:opacity-60">
                {launching === 'real' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-stake-900" />}
                Launch
              </button>
              <button onClick={() => start('demo')} disabled={!!launching}
                className="flex-1 h-12 rounded-lg font-bold border border-stake-600 text-white hover:bg-stake-700 flex items-center justify-center gap-2 disabled:opacity-60">
                {launching === 'demo' ? <Loader2 className="w-5 h-5 animate-spin" /> : <FlaskConical className="w-5 h-5" />}
                Demo
              </button>
            </div>

            <p className="text-stake-500 text-xs mt-3 max-w-md">
              Launch = real money via your wallet. Demo = fake-money sandbox. The game opens in an
              iframe at the game's hosted client with the session token.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const Tag = ({ children }) => (
  <span className="text-xs font-semibold text-white/80 bg-stake-800 border border-stake-600 rounded px-2 py-1">
    {children}
  </span>
);
