import { describe, expect, test } from 'vitest';
import { chooseMove, rankMoves } from '@/game/ai';
import { createBoard } from '@/game/board';
import { createRng } from '@/game/rng';
import { boardOf, playGame } from './support';

/**
 * O può chiudere su 2. Posizione data in pasto a una funzione pura: la parità
 * dei turni non conta, conta che la mossa vincente venga vista.
 */
const O_PUO_VINCERE = boardOf('OO.X...X.');

/**
 * X minaccia su 2 e soltanto lì, e O non ha nulla da chiudere: bloccare è l'unica
 * mossa che non perde immediatamente. Serve che la minaccia di X sia una sola —
 * con due minacce ogni mossa perde e nessuna sarebbe preferibile.
 */
const O_DEVE_BLOCCARE = boardOf('XX.O.XO..');

/** O può chiudere su 2, ma anche X minaccia su 5. Vincere viene prima di difendersi. */
const VINCERE_O_BLOCCARE = boardOf('OO.XX...X');

const seeds = Array.from({ length: 200 }, (_, i) => i + 1);

describe('chooseMove a difficoltà 0', () => {
  test('chiude la partita quando può, con qualunque seed', () => {
    const scelte = new Set(seeds.map((s) => chooseMove(O_PUO_VINCERE, 'O', 0, createRng(s))));
    expect([...scelte]).toEqual([2]);
  });

  test('blocca la minaccia avversaria quando non ha di meglio', () => {
    const scelte = new Set(seeds.map((s) => chooseMove(O_DEVE_BLOCCARE, 'O', 0, createRng(s))));
    expect([...scelte]).toEqual([2]);
  });

  test('preferisce vincere subito invece di bloccare', () => {
    expect(chooseMove(VINCERE_O_BLOCCARE, 'O', 0, createRng(1))).toBe(2);
  });

  test('a parità di seed e di tavola sceglie sempre la stessa mossa', () => {
    const board = createBoard();
    expect(chooseMove(board, 'X', 0, createRng(42))).toBe(chooseMove(board, 'X', 0, createRng(42)));
  });
});

describe('chooseMove a difficoltà 1', () => {
  test('non gioca sempre la mossa ottima', () => {
    const scelte = new Set(seeds.map((s) => chooseMove(O_PUO_VINCERE, 'O', 1, createRng(s))));
    expect(scelte.size).toBeGreaterThan(1);
  });

  test('gioca comunque sempre una casella libera', () => {
    const libere = [2, 4, 5, 6, 8];
    for (const s of seeds) {
      expect(libere).toContain(chooseMove(O_PUO_VINCERE, 'O', 1, createRng(s)));
    }
  });
});

describe('chooseMove, casi limite', () => {
  test('rifiuta una tavola senza caselle libere', () => {
    expect(() => chooseMove(boardOf('XXOOOXXOX'), 'O', 0, createRng(1))).toThrow(/libera/i);
  });

  test('rifiuta una difficoltà fuori dall_intervallo', () => {
    expect(() => chooseMove(createBoard(), 'O', 1.5, createRng(1))).toThrow(/difficolt/i);
  });
});

describe('rankMoves', () => {
  test('ordina le mosse dalla migliore alla peggiore', () => {
    const punteggi = rankMoves(O_PUO_VINCERE, 'O').map((m) => m.score);
    expect(punteggi).toEqual([...punteggi].sort((a, b) => b - a));
  });

  test('mette in testa la mossa che chiude la partita', () => {
    expect(rankMoves(O_PUO_VINCERE, 'O')[0]?.index).toBe(2);
  });

  test('considera soltanto le caselle libere', () => {
    expect(rankMoves(O_PUO_VINCERE, 'O').map((m) => m.index).sort((a, b) => a - b))
      .toEqual([2, 4, 5, 6, 8]);
  });
});

describe('la difficoltà è la manopola del budget promo', () => {
  const partite = 1000;

  function tassoVittoriaAvversario(difficulty: number, aiPlayer: 'X' | 'O'): number {
    const rng = createRng(20260206);
    let vinte = 0;
    for (let i = 0; i < partite; i += 1) {
      if (playGame({ difficulty, rng, aiPlayer }) === 'opponent') vinte += 1;
    }
    return vinte / partite;
  }

  test('a difficoltà 0 un avversario casuale non vince mai, con l_AI seconda', () => {
    expect(tassoVittoriaAvversario(0, 'O')).toBe(0);
  });

  test('a difficoltà 0 un avversario casuale non vince mai, con l_AI prima', () => {
    expect(tassoVittoriaAvversario(0, 'X')).toBe(0);
  });

  test('a difficoltà 1 un avversario casuale vince spesso', () => {
    expect(tassoVittoriaAvversario(1, 'O')).toBeGreaterThan(0.2);
  });

  test('a difficoltà intermedia il tasso sta fra i due estremi', () => {
    const tasso = tassoVittoriaAvversario(0.25, 'O');
    expect(tasso).toBeGreaterThan(0);
    expect(tasso).toBeLessThan(tassoVittoriaAvversario(1, 'O'));
  });
});
