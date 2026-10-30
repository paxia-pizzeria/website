import type { Page } from '@playwright/test';

export const CELLE = 9;

/** Legge lo stato della tavola dalle etichette accessibili delle caselle. */
export async function leggiTavola(page: Page): Promise<('vuota' | 'giocatore' | 'ai')[]> {
  const etichette = await Promise.all(
    Array.from({ length: CELLE }, (_, i) =>
      page.getByTestId(`cell-${i}`).getAttribute('aria-label'),
    ),
  );
  return etichette.map((label) => {
    // L'etichetta è «Riga 2, colonna 3, <segno>»: conta solo la coda.
    const segno = (label ?? '').toLowerCase().split(',').pop()!.trim();
    if (segno === 'vuota') return 'vuota';
    if (segno === 'x') return 'giocatore';
    return 'ai';
  });
}

const LINEE = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
] as const;

/**
 * Una strategia da giocatore discreto: chiude se può, altrimenti blocca, altrimenti
 * prende il centro e poi gli angoli. Serve a far vincere il test senza numeri magici
 * e senza codice di test dentro il gioco.
 */
export function prossimaMossa(tavola: readonly string[]): number {
  const cerca = (chi: string) => {
    for (const linea of LINEE) {
      const occupate = linea.filter((i) => tavola[i] === chi).length;
      const vuote = linea.filter((i) => tavola[i] === 'vuota');
      if (occupate === 2 && vuote.length === 1) return vuote[0]!;
    }
    return null;
  };
  const libere = tavola.map((c, i) => (c === 'vuota' ? i : -1)).filter((i) => i >= 0);
  return cerca('giocatore') ?? cerca('ai') ?? [4, 0, 2, 6, 8, 1, 3, 5, 7].find((i) => libere.includes(i))!;
}

export function urlPartita(params: Record<string, string | number>): string {
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  );
  return `/?${query.toString()}`;
}

/** Attende che l'isola sia idratata: fino a quel momento la tavola è bloccata. */
export async function attendiPronta(page: Page): Promise<void> {
  await page
    .locator('[data-testid^="cell-"][aria-disabled="false"]')
    .first()
    .waitFor({ state: 'attached' });
}

/**
 * Gioca con la strategia da giocatore discreto fino alla fine della partita.
 *
 * Aspetta sempre che il turno sia tornato al giocatore invece di contare i
 * millisecondi: altrimenti si leggerebbe una tavola vecchia e si cliccherebbe una
 * casella che l'AI ha appena occupato.
 */
export async function giocaFinoAllaFine(page: Page): Promise<void> {
  const mioTurno = () =>
    page.waitForFunction(
      () =>
        !!document.querySelector('[data-testid="outcome"]') ||
        !!document.querySelector('[data-testid^="cell-"][aria-disabled="false"]'),
    );

  for (let mossa = 0; mossa < 5; mossa += 1) {
    await mioTurno();
    if ((await page.getByTestId('outcome').count()) > 0) return;
    await page.getByTestId(`cell-${prossimaMossa(await leggiTavola(page))}`).click();
  }

  await page.waitForFunction(() => !!document.querySelector('[data-testid="outcome"]'));
}

/**
 * Gioca male: prende sempre la prima casella libera, senza chiudere né bloccare.
 *
 * Serve quando il test ha bisogno che a vincere sia l'AI. Il giocatore discreto di
 * `giocaFinoAllaFine` contro un'AI ottimale pareggia sempre, e un pareggio non
 * traccia nessuna linea sulla terna.
 */
export async function perdiLaPartita(page: Page): Promise<void> {
  for (let mossa = 0; mossa < CELLE; mossa += 1) {
    await page.waitForFunction(
      () =>
        !!document.querySelector('[data-testid="outcome"]') ||
        !!document.querySelector('[data-testid^="cell-"][aria-disabled="false"]'),
    );
    if ((await page.getByTestId('outcome').count()) > 0) return;
    await page.locator('[data-testid^="cell-"][aria-disabled="false"]').first().click();
  }

  await page.waitForFunction(() => !!document.querySelector('[data-testid="outcome"]'));
}
