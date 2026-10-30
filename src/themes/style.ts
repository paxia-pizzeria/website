import type { Theme, ThemeTokens } from './schema';

/** Il nome della variabile CSS che porta un token, `playerMark` → `--tris-player-mark`. */
function nomeVariabile(token: string): string {
  return `--tris-${token.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
}

/** Lo stesso nome, pronto da mettere in una proprietà CSS. */
export function variabileToken(token: keyof ThemeTokens): string {
  return `var(${nomeVariabile(token)})`;
}

/**
 * Traduce i token di un tema in variabili CSS.
 *
 * È l'unico punto in cui i colori del manifest entrano nel DOM: componenti e fogli di
 * stile leggono soltanto `var(--tris-*)`, mai un colore. Vedi la guardia sui temi in
 * `tests/themes/theme.test.ts`.
 */
export function themeStyle(theme: Theme): Record<string, string> {
  return Object.fromEntries(
    Object.entries(theme.tokens).map(([token, value]) => [nomeVariabile(token), value]),
  );
}

/** Chi ha chiuso la terna. */
export type Vincitore = 'player' | 'ai';

const SEGNO: Record<Vincitore, keyof ThemeTokens> = {
  player: 'playerMark',
  ai: 'aiMark',
};

/**
 * Con che token si traccia la linea sulla terna vincente.
 *
 * Di norma è `winLine`, ed è il tema a sceglierlo. Ma la linea passa sopra i tre
 * segni che marca: se ha il loro stesso colore ci sparisce dentro — nel tema PAXIA
 * succede quando vince lo spicchio, bianco come la linea. In quel caso ripiega sul
 * colore del segno perdente, che per forza si distingue da quello vincente,
 * altrimenti sulla tavola non si capirebbe chi ha giocato cosa.
 *
 * Il confronto è fra valori di token, non fra colori scritti qui: la regola vale
 * per qualunque tema, anche per quelli che non esistono ancora.
 */
export function tokenLineaVincente(
  tokens: ThemeTokens,
  vincitore: Vincitore,
): keyof ThemeTokens {
  const vincente = SEGNO[vincitore];
  if (tokens.winLine !== tokens[vincente]) return 'winLine';
  return SEGNO[vincitore === 'player' ? 'ai' : 'player'];
}
