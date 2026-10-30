import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  /*
    Su una GitHub Pages di progetto il sito non vive alla radice del dominio ma
    sotto il nome del repo. Astro ha bisogno di saperlo per scrivere i percorsi
    dei propri script: senza, l'isola Preact non si carica e la tavola resta
    bloccata.

    Il valore non è scritto qui: lo passa il workflow di pubblicazione, che lo
    chiede a GitHub. In locale, e su un dominio proprio, resta `/`.
  */
  base: process.env.BASE_PATH || '/',
  integrations: [preact()],
  vite: { plugins: [tailwindcss()] },
});
