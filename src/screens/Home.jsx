import { useContext, useEffect, useState, useMemo } from 'react';
import { Sparkles, TrendingUp, Search, Gift, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { GameContext } from '../context/GameContext';
import { getToken, getGames } from '../aggregator/api.js';
import GameRow from '../components/GameRow';
import CasinoGameCard from '../components/CasinoGameCard';
import useLaunch from '../hooks/useLaunch';
import { useSearchParams } from 'react-router-dom';

const Home = () => {
  const { setAuthModal } = useContext(GameContext);
  const { launch, launching } = useLaunch();
  const [games, setGames] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ok | error
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [provider, setProvider] = useState('All');
  const loggedIn = !!getToken();


  

  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const socket = searchParams.get("socket");

  console.log('token-------------------', token)
  console.log('socket-----------------', socket)



  const load = async () => {
    setStatus('loading');
    try {
      const list = await getGames();
      setGames(Array.isArray(list) ? list : []);
      setStatus('ok');
    } catch (e) {
      setErr(e.message || 'Failed to load games');
      setStatus('error');
    }
  };

  useEffect(() => { load(); }, []);

  // Category chips are DATA-DRIVEN: All + distinct providers from the aggregator.
  const providers = useMemo(
    () => ['All', ...Array.from(new Set(games.map((g) => g.provider).filter(Boolean)))],
    [games]
  );

  const filtered = useMemo(() => {
    let list = games;
    if (provider !== 'All') list = list.filter((g) => g.provider === provider);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((g) => (g.name || g.game_code || '').toLowerCase().includes(s));
    }
    return list;
  }, [games, provider, q]);

  const featured = useMemo(() => games.slice(0, 12), [games]);

  const play = (code) => {
    if (!getToken()) { setAuthModal('login'); return; }
    launch(code);
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      {/* hero */}
      <div className="relative overflow-hidden rounded-2xl mb-6 p-6 sm:p-10
        bg-gradient-to-br from-stake-blue/30 via-stake-800 to-stake-850 border border-stake-600">
        <div className="relative z-10 max-w-lg">
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide
            bg-stake-green/15 text-stake-green px-2 py-1 rounded mb-3">
            <Gift className="w-3.5 h-3.5" /> Welcome offer
          </span>
          <h1 className="text-white font-extrabold text-2xl sm:text-4xl leading-tight mb-2">
            Play the best <span className="text-stake-green">slots</span> — instant, provably fair.
          </h1>
          <p className="text-stake-text text-sm sm:text-base mb-5">
            Deposit, spin, and cash out in seconds. Your balance stays in your wallet on every bet.
          </p>
          {loggedIn ? (
            featured[0] && (
              <button onClick={() => play(featured[0].game_code)}
                className="h-11 px-6 rounded font-bold bg-stake-green hover:bg-stake-greenh text-stake-900">
                Play now
              </button>
            )
          ) : (
            <div className="flex gap-3">
              <button onClick={() => setAuthModal('register')}
                className="h-11 px-6 rounded font-bold bg-stake-green hover:bg-stake-greenh text-stake-900">
                Register &amp; Play
              </button>
              <button onClick={() => setAuthModal('login')}
                className="h-11 px-6 rounded font-bold border border-stake-600 text-white hover:bg-stake-700">
                Sign In
              </button>
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute -right-6 -bottom-8 text-[10rem] opacity-20 select-none">🎰</div>
      </div>

      {/* search */}
      <div className="flex items-center gap-2 bg-stake-800 border border-stake-600 rounded-full px-4 h-11 mb-4">
        <Search className="w-4 h-4 text-stake-text" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search games"
          className="bg-transparent outline-none text-sm text-white placeholder:text-stake-500 w-full" />
      </div>

      {/* loading / error / empty states */}
      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center py-20 text-stake-text">
          <Loader2 className="w-8 h-8 animate-spin mb-3" /> Loading games…
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="w-8 h-8 text-amber-400 mb-3" />
          <p className="text-white font-semibold">Couldn't load games</p>
          <p className="text-stake-text text-sm mb-4 max-w-md">{err}</p>
          <button onClick={load}
            className="flex items-center gap-2 h-10 px-4 rounded bg-stake-700 hover:bg-stake-600 text-white text-sm">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {status === 'ok' && games.length === 0 && (
        <div className="py-16 text-center text-stake-text">
          No games approved for this operator yet.
        </div>
      )}

      {status === 'ok' && games.length > 0 && (
        <>
          {/* provider chips (data-driven) */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
            {providers.map((p) => (
              <button key={p} onClick={() => setProvider(p)}
                className={`shrink-0 h-9 px-4 rounded-full text-sm font-semibold transition-colors ${
                  provider === p ? 'bg-stake-600 text-white' : 'bg-stake-800 text-stake-text hover:text-white'}`}>
                {p}
              </button>
            ))}
          </div>

          {/* featured carousel (only when no active filter/search) */}
          {provider === 'All' && !q.trim() && (
            <>
              <GameRow icon={Sparkles} title="Featured" games={featured} onPlay={play} launching={launching} />
              <h2 className="flex items-center gap-2 text-white font-bold text-lg mb-3">
                <TrendingUp className="w-5 h-5 text-stake-text" /> All Games
                <span className="text-stake-text font-normal text-sm">({games.length})</span>
              </h2>
            </>
          )}

          {/* full grid */}
          {filtered.length === 0 ? (
            <p className="text-stake-text py-8 text-center">No games match “{q}”.</p>
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filtered.map((g) => (
                <CasinoGameCard key={g.game_code} game={g} onPlay={play} launching={launching} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
