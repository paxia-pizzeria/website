import type { Theme } from '@/themes/schema';

export interface DemoParams {
  theme: string;
  difficulty: number;
  seed: number;
}

interface Props {
  params: DemoParams;
  themes: Record<string, Theme>;
  onChange: (params: DemoParams) => void;
}

/**
 * Pannello di anteprima, visibile solo con `?demo=1`.
 *
 * Serve a mostrare il gioco al cliente e a far comparire sconfitte e pareggi senza
 * dover giocare male di proposito. Non fa parte della pagina pubblica.
 */
export function DemoControls({ params, themes, onChange }: Props) {
  const slugs = Object.keys(themes);

  return (
    <aside class="demo" data-testid="demo-controls" aria-label="Controlli di anteprima">
      <p class="demo__title">Anteprima</p>

      <div class="demo__field">
        <label for="demo-difficulty">
          Difficoltà <output class="demo__value">{params.difficulty.toFixed(2)}</output>
        </label>
        <input
          id="demo-difficulty"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={params.difficulty}
          onInput={(event) =>
            onChange({ ...params, difficulty: Number(event.currentTarget.value) })
          }
        />
        <p class="demo__hint">
          Quanto spesso l'avversario sbaglia. A 0 non perde mai, e con un buon giocatore
          finisce sempre in pareggio.
        </p>
      </div>

      {slugs.length > 1 && (
        <div class="demo__field">
          <label for="demo-theme">Tema</label>
          <select
            id="demo-theme"
            value={params.theme}
            onChange={(event) => onChange({ ...params, theme: event.currentTarget.value })}
          >
            {slugs.map((slug) => (
              <option value={slug} key={slug}>
                {themes[slug]!.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div class="demo__field">
        <label for="demo-seed">Seed</label>
        <input
          id="demo-seed"
          type="number"
          value={params.seed}
          onChange={(event) => onChange({ ...params, seed: Number(event.currentTarget.value) })}
        />
        <p class="demo__hint">
          A parità di seed la sequenza di partite si ripete identica: serve a riprodurre un
          caso che si vuole rivedere.
        </p>
      </div>
    </aside>
  );
}
