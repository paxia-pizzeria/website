import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';

/**
 * Nessun colore vive fuori dai token del tema.
 *
 * Con un solo tema a listino il sistema di temi non è dimostrato: nulla farebbe
 * notare un colore cablato finché non si prova ad aggiungere il secondo tema, e a
 * quel punto nascerebbe già rotto. Questa guardia prende il posto del secondo tema.
 *
 * I colori ammessi sono soltanto quelli derivati: `var(--tris-*)` e le miscele
 * `color-mix` che partono da una variabile.
 */
const CARTELLE = [
  'src/styles',
  'src/components/game',
  'src/components/demo',
  'src/themes/paxia',
];

const ESADECIMALE = /#[0-9a-fA-F]{3,8}\b/g;
const FUNZIONE_COLORE = /\b(?:rgba?|hsla?|oklch|oklab|lch|lab|color)\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g;

function fileDaControllare(): string[] {
  return CARTELLE.flatMap((cartella) =>
    readdirSync(cartella)
      .filter((nome) => /\.(css|tsx|ts|svg)$/.test(nome))
      .map((nome) => join(cartella, nome)),
  );
}

/** Il manifest è la sola sede legittima dei colori: lì i token sono definiti. */
const AMMESSI = new Set(['src/themes/paxia/theme.json']);

test.each(fileDaControllare().filter((f) => !AMMESSI.has(f)))(
  '%s non contiene colori cablati',
  (file) => {
    const contenuto = readFileSync(file, 'utf8');

    const esadecimali = contenuto.match(ESADECIMALE) ?? [];

    const funzioni = [...contenuto.matchAll(FUNZIONE_COLORE)]
      .map((m) => m[0])
      .filter((chiamata) => !chiamata.includes('var(--'));

    expect({ file, esadecimali, funzioni }).toEqual({ file, esadecimali: [], funzioni: [] });
  },
);
