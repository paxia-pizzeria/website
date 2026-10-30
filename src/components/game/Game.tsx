import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { chooseMove } from '@/game/ai';
import { applyMove, createBoard, isDraw, winner, type Win } from '@/game/board';
import {
  moveAnnouncement,
  outcomeMessage,
  thinkingMessage,
  turnMessage,
  type Phase,
} from '@/game/narration';
import { createRng } from '@/game/rng';
import type { Board as BoardState } from '@/game/types';
import type { Theme } from '@/themes/schema';
import { Board } from './Board';
import { Outcome } from './Outcome';

/** Pausa prima della mossa dell'AI: senza, la risposta è istantanea e sembra un bug. */
const PAUSA_AI_MS = 420;

interface Props {
  theme: Theme;
  difficulty: number;
  seed: number;
  /** `false` finché l'isola non è idratata: la tavola non accetta mosse. */
  ready: boolean;
}

export function Game({ theme, difficulty, seed, ready }: Props) {
  const { marks } = theme;

  /**
   * Il generatore vive per tutta la sessione di gioco e non viene ricreato a ogni
   * partita: così l'intera sequenza di partite è riproducibile da un solo seed.
   */
  const rng = useMemo(() => createRng(seed), [seed]);

  const [board, setBoard] = useState<BoardState>(createBoard);
  const [phase, setPhase] = useState<Phase>('playing');
  const [win, setWin] = useState<Win | null>(null);
  const [status, setStatus] = useState(turnMessage);
  const [thinking, setThinking] = useState(false);

  /** Legge l'esito di una tavola e aggiorna la fase. Restituisce `true` se la partita è finita. */
  const chiudiSeFinita = useCallback(
    (next: BoardState, prefisso: string): boolean => {
      const vinta = winner(next);
      if (vinta) {
        const esito: Phase = vinta.player === 'X' ? 'won' : 'lost';
        setWin(vinta);
        setPhase(esito);
        setStatus(`${prefisso} ${outcomeMessage(esito)}`);
        return true;
      }
      if (isDraw(next)) {
        setPhase('draw');
        setStatus(`${prefisso} ${outcomeMessage('draw')}`);
        return true;
      }
      return false;
    },
    [],
  );

  const play = (index: number) => {
    if (!ready || phase !== 'playing' || thinking || board[index] !== null) return;

    const next = applyMove(board, index, 'X');
    setBoard(next);

    const annuncio = `${moveAnnouncement(index, 'X', marks)}.`;
    if (chiudiSeFinita(next, annuncio)) return;

    setStatus(`${annuncio} ${thinkingMessage()}`);
    setThinking(true);
  };

  useEffect(() => {
    if (!thinking) return;

    const timer = setTimeout(() => {
      const index = chooseMove(board, 'O', difficulty, rng);
      const next = applyMove(board, index, 'O');
      setBoard(next);
      setThinking(false);

      const annuncio = `${moveAnnouncement(index, 'O', marks)}.`;
      if (!chiudiSeFinita(next, annuncio)) {
        setStatus(`${annuncio} ${turnMessage()}`);
      }
    }, PAUSA_AI_MS);

    return () => clearTimeout(timer);
  }, [thinking, board, difficulty, rng, marks, chiudiSeFinita]);

  const replay = () => {
    setBoard(createBoard());
    setPhase('playing');
    setWin(null);
    setThinking(false);
    setStatus(turnMessage());
  };

  return (
    <div class="game">
      <Board
        board={board}
        theme={theme}
        winLine={win?.line ?? null}
        locked={!ready || phase !== 'playing' || thinking}
        onPlay={play}
      />

      {/*
        Stato ed esito stanno insieme in un piede: sulla landing quel piede esce
        dal flusso, così è la tavola — e non l'altezza del testo, che cambia a
        partita finita — a decidere il centro verticale della pagina.
      */}
      <div class="game__foot">
        <p class="status" data-testid="status" role="status" aria-live="polite">
          {status}
        </p>

        {phase !== 'playing' && (
          <Outcome phase={phase} onReplay={replay} />
        )}
      </div>
    </div>
  );
}
