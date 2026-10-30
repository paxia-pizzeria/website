import { describe, expect, test } from 'vitest';
import { bandCenters, bandSizes } from '@/themes/geometry';
import { getTheme } from '@/themes';

describe('bandSizes', () => {
  test('misura le tre bande fra le due linee', () => {
    expect(bandSizes([0.25, 0.75])).toEqual([0.25, 0.5, 0.25]);
  });

  test('le tre bande coprono tutto il lato', () => {
    const somma = bandSizes([0.321, 0.727]).reduce((a, b) => a + b, 0);
    expect(somma).toBeCloseTo(1, 10);
  });

  test('con linee a un terzo le bande sono uguali', () => {
    const [a, b, c] = bandSizes([1 / 3, 2 / 3]);
    expect(a).toBeCloseTo(b, 10);
    expect(b).toBeCloseTo(c, 10);
  });
});

describe('bandCenters', () => {
  test('il centro di ogni banda sta a metà fra i suoi bordi', () => {
    expect(bandCenters([0.25, 0.75])).toEqual([0.125, 0.5, 0.875]);
  });

  test('i centri sono in ordine, qualunque sia la griglia del tema', () => {
    const [sinistra, centro, destra] = bandCenters(getTheme('paxia').manifest.grid.columns);
    expect(sinistra).toBeLessThan(centro);
    expect(centro).toBeLessThan(destra);
  });

  test('con bande disuguali i centri non sono a un sesto, metà e cinque sesti', () => {
    // Le posizioni reali della griglia disegnata dai designer: serve a dimostrare
    // che il meccanismo regge anche quando la griglia tornerà storta.
    const [sinistra, centro, destra] = bandCenters([0.321, 0.727]);
    expect(sinistra).toBeCloseTo(0.1605, 4);
    expect(centro).toBeCloseTo(0.524, 3);
    expect(destra).toBeCloseTo(0.8635, 4);
  });

  test('ogni centro cade dentro la propria banda', () => {
    const linee: [number, number] = [0.321, 0.727];
    const [a, b, c] = bandCenters(linee);
    expect(a).toBeGreaterThan(0);
    expect(a).toBeLessThan(linee[0]);
    expect(b).toBeGreaterThan(linee[0]);
    expect(b).toBeLessThan(linee[1]);
    expect(c).toBeGreaterThan(linee[1]);
    expect(c).toBeLessThan(1);
  });
});
