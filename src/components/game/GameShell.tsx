import { useEffect, useState } from 'preact/hooks';
import { randomSeed } from '@/game/rng';
import { themeStyle } from '@/themes/style';
import type { Theme } from '@/themes/schema';
import { DemoControls, type DemoParams } from '@/components/demo/DemoControls';
import { Game } from './Game';

interface Props {
  themes: Record<string, Theme>;
  defaultTheme: string;
  defaultDifficulty: number;
}

interface Params extends DemoParams {
  demo: boolean;
}

/**
 * Il guscio attorno alla partita: risolve il tema e applica i token come variabili CSS.
 *
 * È anche il punto dove si innesterà un eventuale premio alla vittoria: oggi il
 * cliente non vuole sconti, quindi la vittoria mostra solo l'esito.
 */
export default function GameShell({ themes, defaultTheme, defaultDifficulty }: Props) {
  /**
   * Finché l'isola non è idratata i gestori non sono agganciati: un clic sulla tavola
   * cadrebbe nel vuoto senza che l'utente capisca perché. La tavola resta bloccata
   * fino a qui.
   */
  const [ready, setReady] = useState(false);

  const [params, setParams] = useState<Params>({
    theme: defaultTheme,
    difficulty: defaultDifficulty,
    seed: 1,
    demo: false,
  });

  /**
   * I parametri si leggono dopo il montaggio, non durante il render: la pagina è
   * statica e a build time la query string non esiste ancora.
   */
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const theme = query.get('theme');
    const difficulty = Number(query.get('difficulty'));
    const seed = Number(query.get('seed'));

    setParams({
      theme: theme && themes[theme] ? theme : defaultTheme,
      difficulty:
        query.has('difficulty') && difficulty >= 0 && difficulty <= 1
          ? difficulty
          : defaultDifficulty,
      seed: query.has('seed') && Number.isFinite(seed) ? seed : randomSeed(),
      demo: query.get('demo') === '1',
    });
    setReady(true);
  }, [themes, defaultTheme, defaultDifficulty]);

  const theme = themes[params.theme] ?? themes[defaultTheme]!;

  const aggiorna = (next: DemoParams) => {
    setParams({ ...next, demo: params.demo });
    const query = new URLSearchParams(window.location.search);
    query.set('theme', next.theme);
    query.set('difficulty', String(next.difficulty));
    query.set('seed', String(next.seed));
    history.replaceState(null, '', `?${query.toString()}`);
  };

  return (
    <div class="shell" style={themeStyle(theme)} data-theme={theme.slug}>
      {/* Una partita nuova a ogni cambio di parametri: il seed non va applicato a metà. */}
      <Game
        key={`${params.theme}-${params.difficulty}-${params.seed}`}
        theme={theme}
        difficulty={params.difficulty}
        seed={params.seed}
        ready={ready}
      />

      {params.demo && (
        <DemoControls
          params={{ theme: params.theme, difficulty: params.difficulty, seed: params.seed }}
          themes={themes}
          onChange={aggiorna}
        />
      )}
    </div>
  );
}
