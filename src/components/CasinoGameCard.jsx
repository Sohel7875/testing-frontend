import { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';

// Stable hue from a game code so the gradient fallback is consistent per game.
const hueOf = (s = '') => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
};

/**
 * Stake-style portrait tile driven entirely by aggregator data.
 * Uses `thumbnail` when present; otherwise a derived gradient + initials.
 * Click -> onPlay(game_code).
 */
const CasinoGameCard = ({ game, onPlay, launching }) => {
  const code = game.game_code;
  const title = game.name || code;
  const poster = game.gamePoster || game.thumbnail;
  const [imgOk, setImgOk] = useState(!!poster);
  const isLaunching = launching === code;
  const hue = hueOf(code);
  const bg = `linear-gradient(150deg, hsl(${hue} 70% 22%) 0%, hsl(${(hue + 40) % 360} 65% 12%) 100%)`;
  const initials = title.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <button
      onClick={() => onPlay(code)}
      disabled={isLaunching}
      className="group relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-card
                 ring-1 ring-white/5 transition-transform duration-150 hover:-translate-y-1
                 focus:outline-none focus:ring-2 focus:ring-stake-blue text-left"
      style={{ background: bg }}
    >
      {imgOk && poster ? (
        <img
          src={poster}
          alt={title}
          onError={() => setImgOk(false)}
          className="absolute inset-0 w-full h-full object-contain"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3">
          <span className="text-4xl font-black text-white/90 drop-shadow">{initials}</span>
          <span className="text-white font-bold text-center leading-tight text-sm">{title}</span>
        </div>
      )}

      {/* badges */}
      {game.rtp != null && (
        <span className="absolute top-2 right-2 text-[10px] font-semibold text-white/80
                         bg-black/40 px-1.5 py-0.5 rounded">RTP {game.rtp}%</span>
      )}
      {game.provider && (
        <span className="absolute bottom-2 left-0 right-0 text-center text-[11px] text-white/70 px-2 truncate">
          {game.provider}
        </span>
      )}

      {/* hover overlay */}
      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100
                      transition-opacity flex items-center justify-center">
        {isLaunching ? (
          <Loader2 className="w-9 h-9 text-stake-green animate-spin" />
        ) : (
          <span className="flex flex-col items-center gap-1">
            <span className="w-12 h-12 rounded-full bg-stake-green flex items-center justify-center shadow-pop">
              <Play className="w-6 h-6 text-stake-900 fill-stake-900 ml-0.5" />
            </span>
            <span className="text-white font-semibold text-xs">Play now</span>
          </span>
        )}
      </div>
    </button>
  );
};

export default CasinoGameCard;
