import { describe, expect, test } from 'vitest';
import { DEFAULT_THEME, getTheme, themes } from '@/themes';
import { themeSchema } from '@/themes/schema';

const slugs = Object.keys(themes);

describe('schema del manifest', () => {
  const valido = {
    slug: 'esempio',
    name: 'Esempio',
    tokens: {
      pageBackground: '#fff8ec',
      boardBackground: '#ffffff',
      gridLine: '#e4d5bd',
      playerMark: '#c8102e',
      aiMark: '#1b7f4f',
      winLine: '#f2a900',
      text: '#2b1d12',
    },
    grid: { symbol: 'grid-esempio', columns: [0.33, 0.66], rows: [0.33, 0.66] },
    marks: {
      player: { symbol: 'mark-uno', label: 'primo segno' },
      ai: { symbol: 'mark-due', label: 'secondo segno' },
    },
  };

  test('accetta un manifest completo', () => {
    expect(themeSchema.parse(valido).slug).toBe('esempio');
  });

  test('rifiuta un token colore non valido', () => {
    const rotto = { ...valido, tokens: { ...valido.tokens, gridLine: 'rosso acceso' } };
    expect(() => themeSchema.parse(rotto)).toThrow();
  });

  test('rifiuta un manifest a cui manca un token', () => {
    const { winLine, ...parziali } = valido.tokens;
    expect(() => themeSchema.parse({ ...valido, tokens: parziali })).toThrow();
  });

  test('rifiuta linee della griglia fuori dalla tavola', () => {
    const rotto = { ...valido, grid: { ...valido.grid, columns: [0.33, 1.2] } };
    expect(() => themeSchema.parse(rotto)).toThrow();
  });

  test('rifiuta linee della griglia in ordine inverso', () => {
    const rotto = { ...valido, grid: { ...valido.grid, rows: [0.7, 0.2] } };
    expect(() => themeSchema.parse(rotto)).toThrow();
  });

  test('rifiuta un segno senza etichetta accessibile', () => {
    const rotto = { ...valido, marks: { ...valido.marks, ai: { symbol: 'mark-due' } } };
    expect(() => themeSchema.parse(rotto)).toThrow();
  });

  test('accetta i colori anche in forma oklch', () => {
    const oklch = { ...valido, tokens: { ...valido.tokens, text: 'oklch(0.3 0.04 60)' } };
    expect(() => themeSchema.parse(oklch)).not.toThrow();
  });
});

describe('temi disponibili', () => {
  test('esiste almeno un tema', () => {
    expect(slugs.length).toBeGreaterThan(0);
  });

  test('il tema predefinito esiste', () => {
    expect(slugs).toContain(DEFAULT_THEME);
  });

  test('getTheme su uno slug ignoto solleva un errore che elenca i temi noti', () => {
    expect(() => getTheme('non-esiste')).toThrow(/paxia/);
  });

  test.each(slugs)('il manifest del tema %s è valido', (slug) => {
    expect(() => themeSchema.parse(getTheme(slug).manifest)).not.toThrow();
  });

  test.each(slugs)('lo slug del tema %s combacia con la cartella', (slug) => {
    expect(getTheme(slug).manifest.slug).toBe(slug);
  });
});

describe('coerenza fra manifest e sprite', () => {
  test.each(slugs)('nel tema %s ogni simbolo dichiarato esiste nello sprite', (slug) => {
    const { manifest, sprite } = getTheme(slug);
    const presenti = [...sprite.matchAll(/<symbol[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);
    expect(presenti).toContain(manifest.marks.player.symbol);
    expect(presenti).toContain(manifest.marks.ai.symbol);
    expect(presenti).toContain(manifest.grid.symbol);
  });
});

/**
 * Guardia sui temi. Con un solo tema a listino il sistema di temi non è dimostrato:
 * questo test prende il suo posto, verificando che nessun colore sia cablato negli SVG.
 * Se un colore finisce qui dentro, il secondo tema nascerà già rotto.
 */
describe('guardia sui temi', () => {
  const CONSENTITI = new Set(['none', 'currentcolor', 'inherit', 'transparent']);

  test.each(slugs)('lo sprite del tema %s non contiene colori letterali', (slug) => {
    const { sprite } = getTheme(slug);
    const colorati = [...sprite.matchAll(/\b(fill|stroke|stop-color|color)="([^"]*)"/g)]
      .map((m) => ({ attributo: m[1]!, valore: m[2]!.trim() }))
      .filter(
        ({ valore }) =>
          !CONSENTITI.has(valore.toLowerCase()) && !valore.startsWith('var(--'),
      );
    expect(colorati).toEqual([]);
  });

  test.each(slugs)('lo sprite del tema %s non usa attributi style inline', (slug) => {
    expect(getTheme(slug).sprite).not.toMatch(/\sstyle="/);
  });
});
