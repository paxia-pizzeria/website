import { useId } from 'preact/hooks';
import type { Theme } from '@/themes/schema';

type MarkSpec = Theme['marks']['player'];

/** Lato del riquadro condiviso dai segni del tema. */
const W = 305;
const H = 265;

/**
 * Un segno sulla tavola.
 *
 * Il disegno arriva dallo sprite del tema, inlineato una volta nella pagina. Il
 * colore non è qui: lo decide la variabile CSS legata al ruolo, così la stessa
 * arte serve tutti i temi. Decorativo per gli screen reader — il contenuto della
 * casella sta nell'etichetta del bottone.
 *
 * Se il tema fornisce una linea mediana, l'arte viene scoperta da una maschera che
 * scorre lungo quel tracciato: è il segno che si disegna. L'arte del brand è fatta
 * di riempimenti e non di tratti, quindi non si può far scorrere direttamente lei.
 * Il rettangolo finale della maschera garantisce che il segno resti comunque
 * tutto visibile, anche dove la mediana non coprisse perfettamente l'inchiostro.
 */
export function Mark({ mark, role }: { mark: MarkSpec; role: 'player' | 'ai' }) {
  const maskId = `tratto-${useId()}`;
  const { draw } = mark;

  return (
    <svg class={`mark mark--${role}`} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
      {draw && (
        <mask class="mark__mask" id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          {draw.paths.map((d, i) => (
            <path
              key={d}
              class="mark__stroke"
              d={d}
              pathLength="100"
              fill="none"
              stroke="currentColor"
              stroke-width={draw.width}
              stroke-linecap="round"
              style={{ animationDelay: `${i * 110}ms` }}
            />
          ))}
          <rect class="mark__settle" x="0" y="0" width={W} height={H} fill="currentColor" />
        </mask>
      )}
      <use
        href={`#${mark.symbol}`}
        x="0"
        y="0"
        width={W}
        height={H}
        mask={draw ? `url(#${maskId})` : undefined}
      />
    </svg>
  );
}
