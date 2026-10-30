import { describe, expect, test } from 'vitest';
import { availableMoves, createBoard, isDraw, winner } from '@/game/board';
import { boardOf } from './support';

const WINNING_LINES = [
  ['riga alta', 'XXX......', [0, 1, 2]],
  ['riga centrale', '...XXX...', [3, 4, 5]],
  ['riga bassa', '......XXX', [6, 7, 8]],
  ['colonna sinistra', 'X..X..X..', [0, 3, 6]],
  ['colonna centrale', '.X..X..X.', [1, 4, 7]],
  ['colonna destra', '..X..X..X', [2, 5, 8]],
  ['diagonale discendente', 'X...X...X', [0, 4, 8]],
  ['diagonale ascendente', '..X.X.X..', [2, 4, 6]],
] as const;

describe('winner', () => {
  test('nessun vincitore su tavola vuota', () => {
    expect(winner(createBoard())).toBeNull();
  });

  test('nessun vincitore su tavola iniziata ma indecisa', () => {
    expect(winner(boardOf('XO.......'))).toBeNull();
  });

  test.each(WINNING_LINES)('riconosce la %s', (_nome, layout, line) => {
    expect(winner(boardOf(layout))).toEqual({ player: 'X', line });
  });

  test('riconosce la vittoria di O, non solo di X', () => {
    expect(winner(boardOf('OOOXX.X..'))).toEqual({ player: 'O', line: [0, 1, 2] });
  });

  test('riconosce una vittoria ottenuta con l_ultima casella a tavola piena', () => {
    expect(winner(boardOf('OOXXOXOXX'))).toEqual({ player: 'X', line: [2, 5, 8] });
  });
});

describe('isDraw', () => {
  test('tavola piena senza vincitore è pareggio', () => {
    expect(isDraw(boardOf('XXOOOXXOX'))).toBe(true);
  });

  test('tavola piena con un vincitore non è pareggio', () => {
    expect(isDraw(boardOf('XXXOOXOXO'))).toBe(false);
  });

  test('tavola incompleta non è pareggio', () => {
    expect(isDraw(boardOf('XO.......'))).toBe(false);
  });
});

describe('availableMoves', () => {
  test('su tavola vuota tutte le nove caselle sono giocabili', () => {
    expect(availableMoves(createBoard())).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  test('esclude le caselle occupate', () => {
    expect(availableMoves(boardOf('X.O.X...O'))).toEqual([1, 3, 5, 6, 7]);
  });

  test('su tavola piena nessuna casella è giocabile', () => {
    expect(availableMoves(boardOf('XXOOOXXOX'))).toEqual([]);
  });
});
