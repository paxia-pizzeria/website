import { describe, expect, test } from 'vitest';
import { cellLabel, moveAnnouncement, outcomeMessage, turnMessage } from '@/game/narration';
import { getTheme } from '@/themes';

const marks = getTheme('paxia').manifest.marks;

describe('cellLabel', () => {
  test('dice riga, colonna e che la casella è vuota', () => {
    expect(cellLabel(0, null, marks)).toBe('Riga 1, colonna 1, vuota');
  });

  test('conta righe e colonne da uno, non da zero', () => {
    expect(cellLabel(8, null, marks)).toBe('Riga 3, colonna 3, vuota');
    expect(cellLabel(5, null, marks)).toBe('Riga 2, colonna 3, vuota');
  });

  test('nomina il segno del giocatore con l_etichetta del tema', () => {
    expect(cellLabel(4, 'X', marks)).toBe('Riga 2, colonna 2, X');
  });

  test('nomina il segno dell_AI con l_etichetta del tema', () => {
    expect(cellLabel(4, 'O', marks)).toBe('Riga 2, colonna 2, spicchio');
  });
});

describe('messaggi di stato', () => {
  test('a inizio turno invita a giocare', () => {
    expect(turnMessage()).toMatch(/tocca a te/i);
  });

  test('annuncia la mossa nominando il segno e la posizione', () => {
    expect(moveAnnouncement(2, 'X', marks)).toBe('X su riga 1, colonna 3');
  });

  test('la vittoria parla alla seconda persona', () => {
    expect(outcomeMessage('won')).toMatch(/hai vinto/i);
  });

  test('la sconfitta parla alla seconda persona come la vittoria', () => {
    expect(outcomeMessage('lost')).toMatch(/hai perso/i);
  });

  test('il pareggio è detto pareggio', () => {
    expect(outcomeMessage('draw')).toMatch(/pareggio/i);
  });
});
