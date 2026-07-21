import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CasinoGameCard from './CasinoGameCard';

/** Horizontal, scrollable row of game tiles with a title + arrow controls. */
const GameRow = ({ icon: Icon, title, games, onPlay, launching }) => {
  const scroller = useRef(null);

  const scroll = (dir) => {
    scroller.current?.scrollBy({ left: dir * 400, behavior: 'smooth' });
  };

  if (!games?.length) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 text-white font-bold text-lg">
          {Icon && <Icon className="w-5 h-5 text-stake-text" />}
          {title}
          <span className="text-stake-text font-normal text-sm">({games.length})</span>
        </h2>
        <div className="flex gap-2">
          <button onClick={() => scroll(-1)}
            className="w-8 h-8 rounded bg-stake-700 hover:bg-stake-600 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-stake-text" />
          </button>
          <button onClick={() => scroll(1)}
            className="w-8 h-8 rounded bg-stake-700 hover:bg-stake-600 flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-stake-text" />
          </button>
        </div>
      </div>

      <div ref={scroller}
        className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-1">
        {games.map((g) => (
          <div key={g.game_code} className="shrink-0 w-[150px] sm:w-[160px]">
            <CasinoGameCard game={g} onPlay={onPlay} launching={launching} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default GameRow;
