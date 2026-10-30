import { describe, expect, test } from 'vitest';
import { getTheme, themes } from '@/themes';
import { themeStyle, tokenLineaVincente, variabileToken } from '@/themes/style';

describe('themeStyle', () => {
  const style = themeStyle(getTheme('paxia').manifest);

  test('espone ogni token come variabile CSS con prefisso tris', () => {
    const { tokens } = getTheme('paxia').manifest;
    expect(style['--tris-page-background']).toBe(tokens.pageBackground);
    expect(style['--tris-player-mark']).toBe(tokens.playerMark);
  });

  test('converte i nomi da camelCase a kebab-case', () => {
    expect(Object.keys(style).every((k) => /^--tris-[a-z0-9-]+$/.test(k))).toBe(true);
  });

  test('non perde nessun token lungo la strada', () => {
    const tokens = getTheme('paxia').manifest.tokens;
    expect(Object.keys(style)).toHaveLength(Object.keys(tokens).length);
  });

  test.each(Object.keys(themes))('il tema %s produce variabili per tutti i suoi token', (slug) => {
    const { manifest } = getTheme(slug);
    const prodotte = themeStyle(manifest);
    expect(Object.values(prodotte)).toEqual(Object.values(manifest.tokens));
  });
});

describe('tokenLineaVincente', () => {
  const { tokens } = getTheme('paxia').manifest;

  test('usa il token della linea quando si distingue dal segno vincente', () => {
    expect(tokenLineaVincente(tokens, 'player')).toBe('winLine');
  });

  test('ripiega sul segno perdente quando la linea ha il colore del vincitore', () => {
    // Nel tema PAXIA lo spicchio e la linea sono entrambi bianchi: tracciata del
    // suo colore, la linea sparirebbe dentro i segni che deve marcare.
    expect(tokens.winLine).toBe(tokens.aiMark);
    expect(tokenLineaVincente(tokens, 'ai')).toBe('playerMark');
  });

  test('vale in entrambi i versi', () => {
    const inventato = { ...tokens, winLine: tokens.playerMark };
    expect(tokenLineaVincente(inventato, 'player')).toBe('aiMark');
    expect(tokenLineaVincente(inventato, 'ai')).toBe('winLine');
  });
});

describe('variabileToken', () => {
  test('rende il nome della variabile CSS di un token', () => {
    expect(variabileToken('playerMark')).toBe('var(--tris-player-mark)');
  });
});
