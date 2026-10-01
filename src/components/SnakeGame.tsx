import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Trophy } from 'lucide-react';

const COLS = 20;
const ROWS = 16;
const TICK_MS = 120;
const BEST_SCORE_KEY = 'portafolio-snake-best';

type Point = { x: number; y: number };
type Dir = 'up' | 'down' | 'left' | 'right';

const DIRS: Record<Dir, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE: Record<Dir, Dir> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

function randomFood(snake: Point[]): Point {
  for (;;) {
    const candidate = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
    if (!snake.some((part) => part.x === candidate.x && part.y === candidate.y)) {
      return candidate;
    }
  }
}

const INITIAL_SNAKE: Point[] = [
  { x: 8, y: 8 },
  { x: 7, y: 8 },
  { x: 6, y: 8 },
];

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>(() => randomFood(INITIAL_SNAKE));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // The loop reads the snake from a ref so the interval is not recreated on
  // every tick and no side effects run inside a state updater.
  const snakeRef = useRef<Point[]>(INITIAL_SNAKE);
  const dirRef = useRef<Dir>('right');
  const queuedDirRef = useRef<Dir | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(BEST_SCORE_KEY);
    if (stored) setBest(Number(stored));
  }, []);

  useEffect(() => {
    if (score > best) {
      setBest(score);
      window.localStorage.setItem(BEST_SCORE_KEY, String(score));
    }
  }, [score, best]);

  const reset = useCallback(() => {
    snakeRef.current = INITIAL_SNAKE;
    setSnake(INITIAL_SNAKE);
    setFood(randomFood(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
    setRunning(false);
    dirRef.current = 'right';
    queuedDirRef.current = null;
  }, []);

  const turn = useCallback((dir: Dir) => {
    // Queue the turn so a fast double-press cannot reverse into itself.
    if (dir !== OPPOSITE[dirRef.current]) {
      queuedDirRef.current = dir;
    }
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const map: Record<string, Dir> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      };
      const dir = map[event.key];
      if (dir) {
        event.preventDefault();
        turn(dir);
        setRunning(true);
      }
      if (event.key === ' ') {
        event.preventDefault();
        setRunning((current) => !current);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [turn]);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      if (queuedDirRef.current) {
        dirRef.current = queuedDirRef.current;
        queuedDirRef.current = null;
      }

      const current = snakeRef.current;
      const delta = DIRS[dirRef.current];
      const head = { x: current[0].x + delta.x, y: current[0].y + delta.y };

      const hitWall =
        head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS;
      const hitSelf = current.some(
        (part) => part.x === head.x && part.y === head.y,
      );

      if (hitWall || hitSelf) {
        setRunning(false);
        setGameOver(true);
        return;
      }

      const ate = head.x === food.x && head.y === food.y;
      const next = ate
        ? [head, ...current]
        : [head, ...current.slice(0, current.length - 1)];

      snakeRef.current = next;
      setSnake(next);

      if (ate) {
        setFood(randomFood(next));
        setScore((value) => value + 10);
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [running, food]);

  function start() {
    if (gameOver) reset();
    setRunning(true);
  }

  const cells = [];
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const isHead = snake[0].x === x && snake[0].y === y;
      const isBody =
        !isHead && snake.some((part) => part.x === x && part.y === y);
      const isFood = food.x === x && food.y === y;
      cells.push(
        <div
          key={`${x}-${y}`}
          className={
            'snake-cell' +
            (isHead ? ' snake-cell--head' : '') +
            (isBody ? ' snake-cell--body' : '') +
            (isFood ? ' snake-cell--food' : '')
          }
        />,
      );
    }
  }

  return (
    <div className="snake">
      <div className="snake__hud">
        <span>
          Puntaje: <strong>{score}</strong>
        </span>
        <span className="snake__best">
          <Trophy size={14} /> Récord: <strong>{best}</strong>
        </span>
      </div>

      <div
        className="snake__board"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {cells}
        {(gameOver || !running) && (
          <div className="snake__overlay">
            {gameOver ? (
              <>
                <p className="snake__overlay-title">¡Juego terminado!</p>
                <p className="snake__overlay-text">Puntaje: {score}</p>
              </>
            ) : (
              <p className="snake__overlay-title">Culebra 🐍</p>
            )}
            <button className="button-primary" onClick={start}>
              <Play size={15} /> {gameOver ? 'Jugar de nuevo' : 'Empezar'}
            </button>
          </div>
        )}
      </div>

      <div className="snake__controls">
        <button
          className="button-outline"
          onClick={() => setRunning((current) => !current)}
          aria-label={running ? 'Pausar' : 'Reanudar'}
        >
          {running ? <Pause size={15} /> : <Play size={15} />}
          {running ? 'Pausar' : 'Seguir'}
        </button>
        <button className="button-outline" onClick={reset} aria-label="Reiniciar">
          <RotateCcw size={15} /> Reiniciar
        </button>
      </div>

      <div className="snake__dpad" aria-label="Controles táctiles">
        <button
          className="snake__dpad-btn snake__dpad-btn--up"
          onClick={() => {
            turn('up');
            setRunning(true);
          }}
          aria-label="Arriba"
        >
          ↑
        </button>
        <button
          className="snake__dpad-btn snake__dpad-btn--left"
          onClick={() => {
            turn('left');
            setRunning(true);
          }}
          aria-label="Izquierda"
        >
          ←
        </button>
        <button
          className="snake__dpad-btn snake__dpad-btn--right"
          onClick={() => {
            turn('right');
            setRunning(true);
          }}
          aria-label="Derecha"
        >
          →
        </button>
        <button
          className="snake__dpad-btn snake__dpad-btn--down"
          onClick={() => {
            turn('down');
            setRunning(true);
          }}
          aria-label="Abajo"
        >
          ↓
        </button>
      </div>

      <p className="snake__hint">
        Usa las flechas o WASD en el teclado, o los botones en móvil. Espacio
        pausa el juego.
      </p>
    </div>
  );
}
