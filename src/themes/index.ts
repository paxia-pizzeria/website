import paxiaManifest from './paxia/theme.json';
import paxiaSprite from './paxia/sprite.svg?raw';
import { themeSchema, type Theme } from './schema';

export type { Theme, ThemeTokens } from './schema';

export interface LoadedTheme {
  readonly manifest: Theme;
  readonly sprite: string;
}

/**
 * I temi disponibili. Vivono nel repo e si risolvono a build time: aggiungerne uno
 * significa una cartella con `theme.json` e `sprite.svg`, più una riga qui.
 *
 * Il manifest viene validato all'import, non al primo uso: un tema scritto male fa
 * fallire la build invece di rendere una tavola invisibile in produzione.
 */
const registry = {
  paxia: {
    manifest: themeSchema.parse(paxiaManifest),
    sprite: paxiaSprite,
  },
} satisfies Record<string, LoadedTheme>;

export const themes: Record<string, LoadedTheme> = registry;

export type ThemeSlug = keyof typeof registry;

export const DEFAULT_THEME = 'paxia' satisfies ThemeSlug;

export function getTheme(slug: string): LoadedTheme {
  const theme = themes[slug];
  if (!theme) {
    throw new Error(
      `Tema sconosciuto "${slug}". Temi disponibili: ${Object.keys(themes).join(', ')}`,
    );
  }
  return theme;
}
