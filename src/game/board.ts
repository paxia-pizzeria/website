import type { Board, Cell, Player } from './types';

export const BOARD_SIZE = 9;

export function createBoard(): Board {
  return Array<Cell>(BOARD_SIZE).fill(null);
}

export function applyMove(board: Board, index: number, player: Player): Board {
  if (!Number.isInteger(index) || index < 0 || index >= BOARD_SIZE) {
    throw new Error(`Indice fuori dalla tavola: ${index}`);
  }
  if (board[index] !== null) {
    throw new Error(`Cella ${index} già occupata`);
  }
  const next = [...board];
  next[index] = player;
  return next;
}

/** Le otto terne allineate: tre righe, tre colonne, due diagonali. */
export const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const satisfies readonly Line[];

export type Line = readonly [number, number, number];

export type Win = { readonly player: Player; readonly line: Line };

export function winner(board: Board): Win | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    const player = board[a];
    if (player !== null && player === board[b] && player === board[c]) {
      return { player, line };
    }
  }
  return null;
}

export function availableMoves(board: Board): number[] {
  const free: number[] = [];
  board.forEach((cell, index) => {
    if (cell === null) free.push(index);
  });
  return free;
}

export function isDraw(board: Board): boolean {
  return availableMoves(board).length === 0 && winner(board) === null;
}
