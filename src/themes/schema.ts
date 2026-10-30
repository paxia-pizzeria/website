import { z } from 'zod';

/**
 * Un colore CSS, in esadecimale o come funzione colore.
 * Validato perché un token scritto male non romperebbe la build: renderebbe
 * soltanto un elemento invisibile, che è peggio.
 */
const color = z
  .string()
  .refine(
    (v) =>
      /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v) ||
      /^(?:oklch|oklab|lch|lab|rgb|rgba|hsl|hsla)\([^()]*\)$/i.test(v),
    { message: 'Colore non valido: usa un esadecimale o una funzione colore CSS' },
  );

/** Un segno sulla tavola: quale simbolo dello sprite usare e come si chiama a voce. */
const mark = z.object({
  /** `id` di un `<symbol>` presente nello sprite del tema. */
  symbol: z.string().regex(/^mark-[a-z0-9-]+$/, 'Il simbolo deve avere la forma mark-<nome>'),
  /**
   * Come il segno viene annunciato dagli screen reader e nelle etichette delle caselle.
   * Obbligatoria: un segno senza nome rende la tavola illeggibile a chi non la vede.
   */
  label: z.string().min(1),
  /**
   * La linea mediana del disegno, usata solo per animarne la comparsa.
   *
   * I vettori del brand sono riempimenti, non tracciati: non hanno un percorso da
   * far scorrere con `stroke-dasharray`. Questi tracciati fanno da maschera sopra
   * l'arte vera, e scorrendo la scoprono — il segno si disegna davvero, invece di
   * limitarsi ad apparire. `width` è lo spessore della maschera: va più largo
   * dell'inchiostro, così lo copre tutto.
   *
   * Facoltativa: un tema che non la fornisce mostra i segni in dissolvenza.
   */
  draw: z
    .object({
      paths: z.array(z.string().min(1)).min(1),
      width: z.number().positive(),
    })
    .optional(),
});

/** Una posizione lungo il lato della tavola, da 0 a 1. */
const ratio = z.number().gt(0).lt(1);

/**
 * La griglia, e dove cadono davvero le sue linee.
 *
 * Sta nel tema e non nel componente perché è disegno quanto i segni. `columns` e
 * `rows` dicono a che frazione del lato cadono le due linee divisorie: nel tema
 * PAXIA la griglia è tracciata a mano e le bande **non** sono tre terzi esatti.
 * Senza questi numeri le caselle cliccabili non combacerebbero con le linee viste,
 * e i segni finirebbero a cavallo del tratto.
 */
const grid = z.object({
  symbol: z.string().regex(/^grid-[a-z0-9-]+$/, 'La griglia deve avere la forma grid-<nome>'),
  columns: z.tuple([ratio, ratio]).refine(([a, b]) => a < b, 'Le colonne vanno in ordine'),
  rows: z.tuple([ratio, ratio]).refine(([a, b]) => a < b, 'Le righe vanno in ordine'),
});

export const themeSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  tokens: z.object({
    pageBackground: color,
    boardBackground: color,
    gridLine: color,
    playerMark: color,
    aiMark: color,
    winLine: color,
    text: color,
  }),
  grid,
  marks: z.object({ player: mark, ai: mark }),
});

export type Theme = z.infer<typeof themeSchema>;
export type ThemeTokens = Theme['tokens'];
