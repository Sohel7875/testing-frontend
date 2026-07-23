import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, FlaskConical, Loader2, X, Maximize2, RefreshCw } from 'lucide-react';
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
  const playerRef = useRef(null);

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
  const bg = `linear-gradient(150deg, hsl(${hue} 70% 25%) 0%, hsl(${(hue + 40) % 360} 65% 14%) 100%)`;

  const start = async (mode) => {
    if (!getToken()) { setAuthModal('login'); return; }
    setLaunching(mode);
    try {
      const { launchUrl } = await launchGame({ gameCode: code, mode });
      if (!launchUrl) throw new Error('Launch did not return a launchUrl');
      setIframeSrc(launchUrl);
    } catch (e) {
      toast.error(e.message || 'Launch failed', { containerId: 'main-toast' });
    } finally {
      setLaunching(null);
    }
  };

  const goFullscreen = () => {
    const el = playerRef.current;
    if (el?.requestFullscreen) el.requestFullscreen().catch(() => {});
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-4 sm:py-6">
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
        <>
          {/* ── player ─────────────────────────────────────────── */}
          <div className="rounded-xl overflow-hidden border border-stake-600 bg-black shadow-card">
            <div ref={playerRef} className="relative w-full aspect-video bg-black">
              {iframeSrc ? (
                <iframe
                  title={title}
                  src={iframeSrc}
                  scrolling="no"
                  className="absolute inset-0 w-full h-full border-0"
                  allow="autoplay; fullscreen"
                />
              ) : (
                <div className="absolute inset-0" style={{ background: bg }}>
                  {poster && <img src={poster} alt={title} className="absolute inset-0 w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-4 px-4">
                    <div className="text-white font-extrabold text-xl sm:text-2xl drop-shadow">{title}</div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                      <button onClick={() => start('real')} disabled={!!launching}
                        className="flex-1 h-12 rounded-lg font-bold bg-stake-green hover:bg-stake-greenh text-stake-900 flex items-center justify-center gap-2 disabled:opacity-60">
                        {launching === 'real' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-stake-900" />}
                        Play
                      </button>
                      <button onClick={() => start('demo')} disabled={!!launching}
                        className="flex-1 h-12 rounded-lg font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-center gap-2 disabled:opacity-60">
                        {launching === 'demo' ? <Loader2 className="w-5 h-5 animate-spin" /> : <FlaskConical className="w-5 h-5" />}
                        Demo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* control bar */}
            <div className="h-11 flex items-center justify-between px-3 bg-stake-900 border-t border-stake-600">
              <span className="text-white text-sm font-semibold truncate">🎰 {title}</span>
              <div className="flex items-center gap-1">
                {iframeSrc && (
                  <button onClick={() => setIframeSrc('')} title="Close game"
                    className="h-8 px-3 rounded text-stake-text hover:text-white hover:bg-stake-700 text-sm flex items-center gap-1.5">
                    <X className="w-4 h-4" /> Close
                  </button>
                )}
                <button onClick={goFullscreen} title="Fullscreen"
                  className="h-8 w-8 rounded text-stake-text hover:text-white hover:bg-stake-700 flex items-center justify-center">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ── info below (scrolls with the page) ─────────────── */}
          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_300px]">
            <div>
              <h1 className="text-white font-extrabold text-2xl sm:text-3xl mb-1">{title}</h1>
              <div className="text-stake-text text-sm mb-4 font-mono">{game.game_code}</div>
              <div className="flex flex-wrap gap-2 mb-4">
                {game.provider && <Tag>{game.provider}</Tag>}
                {game.rtp != null && <Tag>RTP {game.rtp}%</Tag>}
                {game.volatility && <Tag>{game.volatility} volatility</Tag>}
              </div>
              <p className="text-stake-text text-sm leading-relaxed max-w-2xl">
                {iframeSrc
                  ? 'Playing now. Use the fullscreen button for an immersive view, or Close to return.'
                  : 'Press Play for real-money or Demo for fake-money. The game loads in the player above; game info stays on this page.'}
              </p>
            </div>

            <aside className="bg-stake-800 border border-stake-600 rounded-xl p-4 h-fit">
              <h3 className="text-white font-bold text-sm mb-3">Game info</h3>
              <dl className="grid gap-2.5 text-sm">
                <Row k="Provider" v={game.provider || '—'} />
                <Row k="RTP" v={game.rtp != null ? `${game.rtp}%` : '—'} />
                <Row k="Volatility" v={game.volatility || '—'} />
                <Row k="Min bet" v={game.minBet != null ? game.minBet : '—'} />
                <Row k="Max bet" v={game.maxBet != null ? game.maxBet : '—'} />
              </dl>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

const Tag = ({ children }) => (
  <span className="text-xs font-semibold text-white/80 bg-stake-800 border border-stake-600 rounded px-2 py-1">
    {children}
  </span>
);

const Row = ({ k, v }) => (
  <div className="flex items-center justify-between">
    <dt className="text-stake-text">{k}</dt>
    <dd className="text-white font-semibold">{v}</dd>
  </div>
);
