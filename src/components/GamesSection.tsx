import { useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import SnakeGame from '@/components/SnakeGame';
import SudokuGame from '@/components/SudokuGame';

type GameId = 'snake' | 'sudoku';

const GAMES: { id: GameId; label: string; emoji: string }[] = [
  { id: 'snake', label: 'Culebra', emoji: '🐍' },
  { id: 'sudoku', label: 'Sudoku', emoji: '🔢' },
];

export default function GamesSection() {
  const [active, setActive] = useState<GameId>('snake');

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
    </section>
  );
}
