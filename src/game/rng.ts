/**
 * Generatore pseudocasuale deterministico (mulberry32).
 *
 * L'AI riceve un `Rng` invece di chiamare `Math.random()`: così, a parità di seed
 * e di mosse del giocatore, una partita si ripete identica. Serve per avere test
 * deterministici, ed è la precondizione per verificare una vittoria lato server.
 */
export interface Rng {
  /** Il prossimo valore nell'intervallo [0, 1). */
  next: () => number;
  /** Un elemento estratto dalla lista. Solleva un errore se la lista è vuota. */
  pick: <T>(options: readonly T[]) => T;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const pick = <T>(options: readonly T[]): T => {
    if (options.length === 0) {
      throw new Error('Impossibile estrarre da una lista vuota');
    }
    return options[Math.floor(next() * options.length)]!;
  };

  return { next, pick };
}

/** Un seed nuovo, per iniziare una partita non riproducibile. */
export function randomSeed(): number {
  const buffer = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buffer);
  return buffer[0]! || 1;
}
