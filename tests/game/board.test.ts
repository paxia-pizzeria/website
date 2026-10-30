import { describe, expect, test } from 'vitest';
import { applyMove, createBoard } from '@/game/board';

describe('createBoard', () => {
  test('crea nove celle vuote', () => {
    expect(createBoard()).toEqual([null, null, null, null, null, null, null, null, null]);
  });
});

describe('applyMove', () => {
  test('mette il segno del giocatore nella cella indicata', () => {
    expect(applyMove(createBoard(), 4, 'X')[4]).toBe('X');
  });

  test('non modifica la tavola ricevuta', () => {
    const board = createBoard();
    applyMove(board, 0, 'X');
    expect(board[0]).toBeNull();
  });

  test('rifiuta una cella già occupata', () => {
    const board = applyMove(createBoard(), 0, 'X');
    expect(() => applyMove(board, 0, 'O')).toThrow(/occupata/i);
  });

  test('rifiuta un indice fuori dalla tavola', () => {
    expect(() => applyMove(createBoard(), 9, 'X')).toThrow(/indice/i);
  });
});
