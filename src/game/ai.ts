import { applyMove, availableMoves, winner } from './board';
import type { Rng } from './rng';
import type { Board, Player } from './types';

/**
 * Valore di una vittoria. I punteggi decadono di uno per ogni mossa di distanza,
 * così l'AI preferisce chiudere subito invece di prendere la via lunga, e rimandare
 * il più possibile una sconfitta inevitabile.
 */
const WIN_SCORE = 10;

function opponentOf(player: Player): Player {
  return player === 'X' ? 'O' : 'X';
}

/** Avvicina il punteggio a zero di una mossa: una vittoria lontana vale meno di una vicina. */
function decay(score: number): number {
  if (score > 0) return score - 1;
  if (score < 0) return score + 1;
  return 0;
}

/**
 * Cache di trasposizione. Il punteggio è relativo al nodo, non alla profondità assoluta,
 * quindi la stessa posizione vale sempre lo stesso e si può memorizzare. Il tris ha poche
 * migliaia di posizioni raggiungibili: la cache resta minuscola e rende istantanei i
 * property test da mille partite.
 */
const cache = new Map<string, number>();

/** Punteggio della posizione dal punto di vista di `player`, con `toMove` di turno. */
function value(board: Board, toMove: Player, player: Player): number {
  const won = winner(board);
  if (won) return won.player === player ? WIN_SCORE : -WIN_SCORE;

  const moves = availableMoves(board);
  if (moves.length === 0) return 0;

  // `join` trasformerebbe le celle vuote in stringa vuota, dando la stessa chiave a
  // posizioni diverse: le celle libere vanno rese con un carattere esplicito.
  const key = `${board.map((cell) => cell ?? '.').join('')}|${toMove}|${player}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const scores = moves.map((index) =>
    decay(value(applyMove(board, index, toMove), opponentOf(toMove), player)),
  );
  const score = toMove === player ? Math.max(...scores) : Math.min(...scores);

  cache.set(key, score);
  return score;
}

export interface RankedMove {
  readonly index: number;
  readonly score: number;
}

/** Le caselle libere, dalla mossa migliore alla peggiore per `player`. */
export function rankMoves(board: Board, player: Player): RankedMove[] {
  return availableMoves(board)
    .map((index) => ({
      index,
      score: decay(value(applyMove(board, index, player), opponentOf(player), player)),
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * La mossa dell'AI.
 *
 * `difficulty` è la probabilità che, invece della mossa ottima, giochi una casella
 * scelta a caso fra quelle libere: 0 è imbattibile, 1 gioca completamente a caso.
 * È la manopola del budget promozionale — quanti sconti si regalano — e per questo
 * vive nella configurazione e non qui.
 *
 * Il caso vale un po' meno di quanto dice `difficulty`, perché una casella estratta
 * a caso può capitare proprio sulla mossa ottima.
 */
export function chooseMove(
  board: Board,
  player: Player,
  difficulty: number,
  rng: Rng,
): number {
  if (!(difficulty >= 0 && difficulty <= 1)) {
    throw new Error(`Difficoltà fuori dall'intervallo [0, 1]: ${difficulty}`);
  }

  const free = availableMoves(board);
  if (free.length === 0) {
    throw new Error('Nessuna casella libera: la partita è già finita');
  }

  if (rng.next() < difficulty) return rng.pick(free);

  const ranked = rankMoves(board, player);
  const best = ranked[0]!.score;
  return rng.pick(ranked.filter((move) => move.score === best).map((move) => move.index));
}
