import { useEffect, useState } from 'react';
import { Eraser, Gamepad2, Lightbulb, RotateCcw } from 'lucide-react';

type Cell = { value: number; fixed: boolean };

type Puzzle = { puzzle: number[]; solution: number[] };

const PUZZLES: Puzzle[] = [
  {
    puzzle: [
      5, 3, 0, 0, 7, 0, 0, 0, 0,
      6, 0, 0, 1, 9, 5, 0, 0, 0,
      0, 9, 8, 0, 0, 0, 0, 6, 0,
      8, 0, 0, 0, 6, 0, 0, 0, 3,
      4, 0, 0, 8, 0, 3, 0, 0, 1,
      7, 0, 0, 0, 2, 0, 0, 0, 6,
      0, 6, 0, 0, 0, 0, 2, 8, 0,
      0, 0, 0, 4, 1, 9, 0, 0, 5,
      0, 0, 0, 0, 8, 0, 0, 7, 9,
    ],
    solution: [
      5, 3, 4, 6, 7, 8, 9, 1, 2,
      6, 7, 2, 1, 9, 5, 3, 4, 8,
      1, 9, 8, 3, 4, 2, 5, 6, 7,
      8, 5, 9, 7, 6, 1, 4, 2, 3,
      4, 2, 6, 8, 5, 3, 7, 9, 1,
      7, 1, 3, 9, 2, 4, 8, 5, 6,
      9, 6, 1, 5, 3, 7, 2, 8, 4,
      2, 8, 7, 4, 1, 9, 6, 3, 5,
      3, 4, 5, 2, 8, 6, 1, 7, 9,
    ],
  },
  {
    puzzle: [
      0, 2, 8, 0, 5, 6, 0, 0, 0,
      4, 3, 0, 7, 0, 0, 5, 0, 1,
      1, 5, 6, 4, 0, 9, 2, 8, 7,
      0, 4, 0, 9, 7, 3, 0, 2, 8,
      0, 0, 0, 0, 0, 0, 0, 5, 0,
      0, 1, 0, 6, 0, 0, 7, 3, 0,
      0, 0, 0, 0, 9, 0, 8, 0, 3,
      0, 9, 4, 0, 8, 7, 0, 1, 2,
      0, 8, 0, 0, 0, 1, 9, 0, 5,
    ],
    solution: [
      7, 2, 8, 1, 5, 6, 3, 9, 4,
      4, 3, 9, 7, 2, 8, 5, 6, 1,
      1, 5, 6, 4, 3, 9, 2, 8, 7,
      6, 4, 5, 9, 7, 3, 1, 2, 8,
      9, 7, 3, 8, 1, 2, 4, 5, 6,
      8, 1, 2, 6, 4, 5, 7, 3, 9,
      2, 6, 1, 5, 9, 4, 8, 7, 3,
      5, 9, 4, 3, 8, 7, 6, 1, 2,
      3, 8, 7, 2, 6, 1, 9, 4, 5,
    ],
  },
];

function buildBoard(puzzle: number[]): Cell[] {
  return puzzle.map((value) => ({ value, fixed: value !== 0 }));
}

export default function SudokuGame() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [board, setBoard] = useState<Cell[]>(() => buildBoard(PUZZLES[0].puzzle));
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState('Elige una celda y toca un número.');
  const [solved, setSolved] = useState(false);

  const solution = PUZZLES[puzzleIndex].solution;

  useEffect(() => {
    const complete = board.every(
      (cell, index) => cell.value === solution[index],
    );
    if (complete) {
      setSolved(true);
      setMessage('¡Sudoku resuelto! 🎉');
    }
  }, [board, solution]);

  function reset(nextIndex = puzzleIndex) {
    setPuzzleIndex(nextIndex);
    setBoard(buildBoard(PUZZLES[nextIndex].puzzle));
    setSelected(null);
    setSolved(false);
    setMessage('Elige una celda y toca un número.');
  }

  function place(value: number) {
    if (selected === null || solved) return;
    if (board[selected].fixed) {
      setMessage('Esa celda es fija.');
      return;
    }
    setBoard((current) =>
      current.map((cell, index) =>
        index === selected ? { ...cell, value } : cell,
      ),
    );
  }

  function clearCell() {
    if (selected === null || solved) return;
    if (board[selected].fixed) {
      setMessage('Esa celda es fija.');
      return;
    }
    setBoard((current) =>
      current.map((cell, index) =>
        index === selected ? { ...cell, value: 0 } : cell,
      ),
    );
  }

  function hint() {
    const empty = board
      .map((cell, index) => ({ cell, index }))
      .filter(({ cell, index }) => cell.value !== solution[index]);
    if (empty.length === 0) return;
    const pick = empty[Math.floor(Math.random() * empty.length)];
    setBoard((current) =>
      current.map((cell, index) =>
        index === pick.index ? { ...cell, value: solution[index] } : cell,
      ),
    );
    setMessage('Pista aplicada 💡');
  }

  function isConflict(index: number): boolean {
    const value = board[index].value;
    if (value === 0) return false;
    const row = Math.floor(index / 9);
    const col = index % 9;
    for (let i = 0; i < 9; i += 1) {
      if (i !== index && board[row * 9 + i].value === value) return true;
      if (i !== index && board[i * 9 + col].value === value) return true;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r += 1) {
      for (let c = boxCol; c < boxCol + 3; c += 1) {
        const i = r * 9 + c;
        if (i !== index && board[i].value === value) return true;
      }
    }
    return false;
  }

  return (
    <div className="sudoku">
      <div className="sudoku__board">
        {board.map((cell, index) => (
          <button
            key={index}
            className={
              'sudoku__cell' +
              (cell.fixed ? ' sudoku__cell--fixed' : '') +
              (selected === index ? ' sudoku__cell--selected' : '') +
              (isConflict(index) ? ' sudoku__cell--conflict' : '')
            }
            onClick={() => setSelected(index)}
            aria-label={`Fila ${Math.floor(index / 9) + 1}, columna ${(index % 9) + 1}`}
          >
            {cell.value !== 0 ? cell.value : ''}
          </button>
        ))}
      </div>

      <div className="sudoku__numbers">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
          <button
            key={number}
            className="sudoku__num"
            onClick={() => place(number)}
          >
            {number}
          </button>
        ))}
      </div>

      <div className="sudoku__controls">
        <button className="button-outline" onClick={clearCell}>
          <Eraser size={15} /> Borrar
        </button>
        <button className="button-outline" onClick={hint}>
          <Lightbulb size={15} /> Pista
        </button>
        <button className="button-outline" onClick={() => reset()}>
          <RotateCcw size={15} /> Reiniciar
        </button>
        <button
          className="button-outline"
          onClick={() => reset((puzzleIndex + 1) % PUZZLES.length)}
        >
          <Gamepad2 size={15} /> Otro tablero
        </button>
      </div>

      <p className="sudoku__message">{message}</p>
    </div>
  );
}
