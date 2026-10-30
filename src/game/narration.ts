import type { Theme } from '@/themes/schema';
import type { Cell, Player } from './types';

type Marks = Theme['marks'];

/** L'esito di una partita dal punto di vista di chi gioca. */
export type Phase = 'playing' | 'won' | 'lost' | 'draw';

function markLabel(player: Player, marks: Marks): string {
  return player === 'X' ? marks.player.label : marks.ai.label;
}

function position(index: number): string {
  return `riga ${Math.floor(index / 3) + 1}, colonna ${(index % 3) + 1}`;
}

/**
 * L'etichetta accessibile di una casella.
 *
 * I simboli SVG sono decorativi e nascosti agli screen reader: questa stringa è
 * l'unico modo in cui chi non vede la tavola sa cosa c'è sopra, quindi nomina il
 * segno con l'etichetta del tema e non con `X` o `O` interni al codice.
 */
export function cellLabel(index: number, cell: Cell, marks: Marks): string {
  const dove = position(index);
  const capitalizzato = dove.charAt(0).toUpperCase() + dove.slice(1);
  return `${capitalizzato}, ${cell === null ? 'vuota' : markLabel(cell, marks)}`;
}

/**
 * I messaggi di stato non nominano i segni di proposito.
 *
 * Le etichette del tema sono sostantivi scelti dal design — «spicchio», domani
 * qualcos'altro — e incastrarli in una frase costringerebbe a indovinarne genere e
 * articolo per ogni tema. I segni si nominano dove servono davvero: sulle caselle.
 */
export function turnMessage(): string {
  return 'Tocca a te.';
}

export function thinkingMessage(): string {
  return 'Sta rispondendo…';
}

export function moveAnnouncement(index: number, player: Player, marks: Marks): string {
  return `${markLabel(player, marks)} su ${position(index)}`;
}

export function outcomeMessage(phase: Exclude<Phase, 'playing'>): string {
  if (phase === 'won') return 'Hai vinto!';
  if (phase === 'lost') return 'Hai perso.';
  return 'Pareggio.';
}
