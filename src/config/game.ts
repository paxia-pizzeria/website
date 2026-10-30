/**
 * Configurazione del gioco.
 *
 * Ha la forma che un domani riempirà il CMS: spostare questi valori su Sanity non
 * dovrà toccare né la logica né i componenti.
 */
export interface GameConfig {
  /**
   * Probabilità che l'AI giochi a caso invece che ottimamente, fra 0 e 1.
   * È il budget della promozione. Vedi `docs/taratura-difficolta.md`.
   */
  readonly difficulty: number;
  /** Il tema grafico da usare. */
  readonly theme: string;
}

export const DEFAULT_CONFIG: GameConfig = {
  difficulty: 0.25,
  theme: 'paxia',
};
