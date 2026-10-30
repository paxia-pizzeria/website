import { useRef } from 'preact/hooks';
import { cellLabel } from '@/game/narration';
import type { Line } from '@/game/board';
import type { Board as BoardState } from '@/game/types';
import { bandCenters, bandSizes } from '@/themes/geometry';
import type { Theme } from '@/themes/schema';
import { tokenLineaVincente, variabileToken } from '@/themes/style';
import { Mark } from './Mark';

/** Spostamento del fuoco per ciascun tasto freccia, in indici di casella. */
const PASSI: Record<string, number> = {
  ArrowRight: 1,
  ArrowLeft: -1,
  ArrowDown: 3,
  ArrowUp: -3,
};

/** Lato del sistema di coordinate dei livelli sovrapposti alla tavola. */
const VIEWBOX = 300;

interface Props {
  board: BoardState;
  theme: Theme;
  winLine: Line | null;
  locked: boolean;
  onPlay: (index: number) => void;
}

export function Board({ board, theme, winLine, locked, onPlay }: Props) {
  const { marks, grid } = theme;
  const cells = useRef<(HTMLButtonElement | null)[]>([]);

  /**
   * Le caselle seguono la geometria della griglia disegnata, non tre terzi esatti:
   * con le linee del tema PAXIA a 0,32 e 0,73 le aree cliccabili combaciano con
   * quello che si vede, e i segni non finiscono a cavallo del tratto.
   */
  const colonne = bandSizes(grid.columns).map((f) => `${f}fr`).join(' ');
  const righe = bandSizes(grid.rows).map((f) => `${f}fr`).join(' ');
  const centriX = bandCenters(grid.columns);
  const centriY = bandCenters(grid.rows);
  const centro = (index: number) => ({
    x: centriX[index % 3]! * VIEWBOX,
    y: centriY[Math.floor(index / 3)]! * VIEWBOX,
  });

  /**
   * Fuoco mobile: una sola casella entra nell'ordine di tabulazione e le frecce
   * spostano il fuoco dentro la griglia, com'è previsto per `role="grid"`.
   * Le caselle occupate restano raggiungibili — un bottone `disabled` non prende
   * il fuoco e spezzerebbe la navigazione a metà tavola.
   */
  const muoviFuoco = (event: KeyboardEvent, from: number) => {
    const passo = PASSI[event.key];
    if (passo === undefined) return;

    const to = from + passo;
    if (to < 0 || to > 8) return;
    const cambioRiga = Math.floor(from / 3) !== Math.floor(to / 3);
    if (Math.abs(passo) === 1 && cambioRiga) return;

    event.preventDefault();
    cells.current[to]?.focus();
  };

  const fuoco = board.findIndex((cell) => cell === null);

  return (
    <div class="board">
      <svg
        class="board__grid"
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        aria-hidden="true"
        focusable="false"
      >
        <use href={`#${grid.symbol}`} x="0" y="0" width={VIEWBOX} height={VIEWBOX} />
      </svg>

      <div
        class="board__cells"
        style={{ gridTemplateRows: righe }}
        role="grid"
        aria-label="Tavola del tris"
        data-testid="board"
      >
        {[0, 1, 2].map((row) => (
          <div class="board__row" style={{ gridTemplateColumns: colonne }} role="row" key={row}>
            {[0, 1, 2].map((col) => {
              const index = row * 3 + col;
              const cell = board[index]!;
              const spenta = winLine !== null && !winLine.includes(index);

              return (
                <div class="board__gridcell" role="gridcell" key={col}>
                  <button
                    type="button"
                    ref={(el) => {
                      cells.current[index] = el;
                    }}
                    class={`cell${spenta ? ' cell--dimmed' : ''}`}
                    data-testid={`cell-${index}`}
                    aria-label={cellLabel(index, cell, marks)}
                    aria-disabled={cell !== null || locked}
                    tabIndex={index === (fuoco === -1 ? 0 : fuoco) ? 0 : -1}
                    onClick={() => onPlay(index)}
                    onKeyDown={(event) => muoviFuoco(event, index)}
                  >
                    {cell === 'X' && <Mark mark={marks.player} role="player" />}
                    {cell === 'O' && <Mark mark={marks.ai} role="ai" />}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/*
        Dopo le caselle, così la linea passa sopra le X e gli spicchi — e proprio
        perché ci passa sopra il colore non è sempre quello del token `winLine`:
        vedi `tokenLineaVincente`.
      */}
      {winLine && (
        <svg
          class="board__win"
          style={{
            color: variabileToken(
              tokenLineaVincente(theme.tokens, board[winLine[0]] === 'X' ? 'player' : 'ai'),
            ),
          }}
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          aria-hidden="true"
          focusable="false"
        >
          <line
            x1={centro(winLine[0]).x}
            y1={centro(winLine[0]).y}
            x2={centro(winLine[2]).x}
            y2={centro(winLine[2]).y}
            pathLength="100"
            stroke="currentColor"
            stroke-width="7"
            stroke-linecap="round"
          />
        </svg>
      )}
    </div>
  );
}
