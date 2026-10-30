import { describe, expect, test } from 'vitest';
import { createRng, randomSeed } from '@/game/rng';

describe('createRng', () => {
  test('lo stesso seed produce la stessa sequenza', () => {
    const a = createRng(1234);
    const b = createRng(1234);
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  test('seed diversi producono sequenze diverse', () => {
    const a = Array.from({ length: 10 }, createRng(1).next);
    const b = Array.from({ length: 10 }, createRng(2).next);
    expect(a).not.toEqual(b);
  });

  test('produce valori nell_intervallo [0, 1)', () => {
    const rng = createRng(99);
    const values = Array.from({ length: 500 }, () => rng.next());
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThan(1);
  });

  test('pick estrae un elemento della lista', () => {
    const rng = createRng(7);
    const options = ['a', 'b', 'c'];
    for (let i = 0; i < 50; i += 1) {
      expect(options).toContain(rng.pick(options));
    }
  });

  test('pick con un solo elemento restituisce quell_elemento', () => {
    expect(createRng(7).pick([42])).toBe(42);
  });

  test('pick su lista vuota solleva un errore', () => {
    expect(() => createRng(7).pick([])).toThrow(/vuota/i);
  });

  test('su molte estrazioni pick copre tutte le opzioni', () => {
    const rng = createRng(2024);
    const seen = new Set(Array.from({ length: 200 }, () => rng.pick([0, 1, 2, 3])));
    expect(seen.size).toBe(4);
  });
});

describe('randomSeed', () => {
  test('restituisce un intero positivo', () => {
    const seed = randomSeed();
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThan(0);
  });

  test('due chiamate consecutive danno seed diversi', () => {
    expect(randomSeed()).not.toBe(randomSeed());
  });
});
