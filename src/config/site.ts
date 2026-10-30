/**
 * Configurazione della landing.
 *
 * Sta accanto a quella del gioco e ha la stessa forma: valori nudi, nessuna
 * logica, pronti a essere letti da Sanity il giorno che il CMS arriva.
 */
export interface SiteConfig {
  /** La data dell'evento come va stampata in pagina. */
  readonly eventDate: string;
  /**
   * La stessa data in ISO 8601, per l'attributo `datetime` di `<time>`: è la
   * forma che macchine e tecnologie assistive sanno leggere.
   */
  readonly eventDateISO: string;
  /** L'invito a giocare, accanto alla tavola. */
  readonly cue: string;
}

export const SITE_CONFIG: SiteConfig = {
  eventDate: '07.12.2026',
  eventDateISO: '2026-12-07',
  cue: "Nell'attesa gioca",
};
