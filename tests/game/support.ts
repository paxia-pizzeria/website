import type { Board, Cell } from '@/game/types';

/** Costruisce una tavola da una stringa di nove caratteri: `X`, `O` o `.` per vuoto. */
export function boardOf(layout: string): Board {
  if (layout.length !== 9) {
    throw new Error(`Una tavola ha nove caselle, ricevute ${layout.length}: "${layout}"`);
  }
  return [...layout].map((c) => (c === '.' ? null : (c as Cell)));
}

import { applyMove, createBoard, isDraw, winner } from '@/game/board';
import { chooseMove } from '@/game/ai';
import type { Rng } from '@/game/rng';
import type { Player } from '@/game/types';

export type GameResult = 'ai' | 'opponent' | 'draw';

/**
 * Jatta una partita completa fra l'AI e un avversario che gioca a caso.
 * `X` muove sempre per primo, come nel gioco vero.
 */
export function playGame(options: {
  difficulty: number;
  rng: Rng;
  aiPlayer?: Player;
}): GameResult {
  const { difficulty, rng, aiPlayer = 'O' } = options;
  const opponent: Player = aiPlayer === 'X' ? 'O' : 'X';
  let board = createBoard();
  let turn: Player = 'X';

  for (;;) {
    const won = winner(board);
    if (won) return won.player === aiPlayer ? 'ai' : 'opponent';
    if (isDraw(board)) return 'draw';

    const move =
      turn === aiPlayer
        ? chooseMove(board, aiPlayer, difficulty, rng)
        : rng.pick(board.map((cell, i) => (cell === null ? i : -1)).filter((i) => i >= 0));

    board = applyMove(board, move, turn);
    turn = turn === aiPlayer ? opponent : aiPlayer;
  }
}
