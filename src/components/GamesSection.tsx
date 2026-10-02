import { useEffect, useRef, useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import SnakeGame from '@/components/SnakeGame';
import SudokuGame from '@/components/SudokuGame';
import NewsPanel from '@/components/NewsPanel';

type GameId = 'snake' | 'sudoku';

const GAMES: { id: GameId; label: string; emoji: string }[] = [
  { id: 'snake', label: 'Culebra', emoji: '🐍' },
  { id: 'sudoku', label: 'Sudoku', emoji: '🔢' },
];

/** Below this width the two columns stack, so heights must not be forced. */
const SIDE_BY_SIDE_MIN_WIDTH = 1000;

export default function GamesSection() {
  const [active, setActive] = useState<GameId>('snake');
  const newsRef = useRef<HTMLElement>(null);
  const playRef = useRef<HTMLDivElement>(null);

  // The news panel is the tallest column, so it defines the row height and the
  // game area is stretched to match it. Doing this in JS avoids a circular
  // layout: the game's own height can no longer inflate the row.
  useEffect(() => {
    const news = newsRef.current;
    const play = playRef.current;
    if (!news || !play) return;

    const sync = () => {
      if (window.innerWidth < SIDE_BY_SIDE_MIN_WIDTH) {
        play.style.height = '';
        return;
      }
      play.style.height = `${news.offsetHeight}px`;
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(news);
    window.addEventListener('resize', sync);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, []);

  return (
    <section
      id="juegos"
      className="scroll-mt-24 border-y border-[#dce5ec] bg-white"
    >
      <div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="section-kicker">04 / Pausa</p>
            <h2 className="section-title mt-4">
              ¿Un descanso? Juega un rato.
            </h2>
            <p className="mt-4 max-w-[540px] leading-7 text-[#52677d]">
              Un par de juegos clásicos hechos desde cero, sin librerías
              externas. Siéntete libre de romper el récord de la culebra.
            </p>
          </div>
          <span className="flex items-center gap-2 text-sm text-[#71859a]">
            <Gamepad2 size={16} className="text-[#0a66c2]" /> Hecho a mano en
            React
          </span>
        </div>

        <div className="games-layout">
          <div className="games-layout__play" ref={playRef}>
            <div className="games-tabs" role="tablist" aria-label="Elige un juego">
              {GAMES.map((game) => (
                <button
                  key={game.id}
                  role="tab"
                  aria-selected={active === game.id}
                  className={
                    'games-tab' + (active === game.id ? ' games-tab--active' : '')
                  }
                  onClick={() => setActive(game.id)}
                >
                  <span aria-hidden="true">{game.emoji}</span> {game.label}
                </button>
              ))}
            </div>

            <div className="games-stage">
              {active === 'snake' ? <SnakeGame /> : <SudokuGame />}
            </div>
          </div>

          <aside className="games-layout__news" ref={newsRef}>
            <NewsPanel />
          </aside>
        </div>
      </div>
    </section>
  );
}
