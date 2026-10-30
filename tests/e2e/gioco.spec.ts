import { expect, test } from '@playwright/test';
import {
  attendiPronta,
  giocaFinoAllaFine,
  leggiTavola,
  perdiLaPartita,
  urlPartita,
} from './support';

test.describe('la tavola', () => {
  test('parte con nove caselle vuote e il turno del giocatore', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('board')).toHaveAttribute('role', 'grid');
    expect(await leggiTavola(page)).toEqual(Array(9).fill('vuota'));
    await expect(page.getByTestId('status')).toContainText(/tocca a te/i);
  });

  test('una casella cliccata prende il segno del giocatore e l_AI risponde', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('cell-4').click();
    await expect.poll(async () => (await leggiTavola(page)).filter((c) => c === 'ai').length).toBe(1);
    expect((await leggiTavola(page))[4]).toBe('giocatore');
  });

  test('una casella già occupata non si può rigiocare', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('cell-0').click();
    // `aria-disabled` e non `disabled`: un bottone disabilitato non prende il fuoco,
    // e la navigazione da tastiera si spezzerebbe sulle caselle già giocate.
    await expect(page.getByTestId('cell-0')).toHaveAttribute('aria-disabled', 'true');
  });
});

test.describe('esito della partita', () => {
  test('a difficoltà massima si riesce a vincere', async ({ page }) => {
    let vinta = false;

    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      await page.goto(urlPartita({ difficulty: 1, seed }));
      await giocaFinoAllaFine(page);
      if (await page.getByTestId('outcome').textContent().then((t) => /hai vinto/i.test(t ?? ''))) {
        vinta = true;
        break;
      }
    }

    expect(vinta, 'in dieci partite a difficoltà massima il giocatore deve poter vincere').toBe(true);
    await expect(page.getByTestId('outcome')).toContainText(/hai vinto/i);
  });

  test('la vittoria non promette alcun premio', async ({ page }) => {
    // Il cliente non vuole sconti: la vittoria mostra l'esito e nient'altro.
    await page.goto(urlPartita({ difficulty: 1, seed: 1 }));
    await giocaFinoAllaFine(page);
    await expect(page.getByTestId('outcome')).not.toContainText(/sconto|codice|coupon|premio/i);
  });

  test('a difficoltà 0 non si vince', async ({ page }) => {
    await page.goto(urlPartita({ difficulty: 0, seed: 7 }));
    await giocaFinoAllaFine(page);
    await expect(page.getByTestId('outcome')).toBeVisible();
    await expect(page.getByTestId('outcome')).not.toContainText(/hai vinto/i);
  });

  test('la linea della terna non si confonde con i segni che marca', async ({ page }) => {
    // Nel tema PAXIA lo spicchio è bianco come la linea: quando vince l'AI, la
    // linea ci passa sopra e deve cambiare colore per restare visibile.
    await page.goto(urlPartita({ difficulty: 0, seed: 7 }));
    await perdiLaPartita(page);
    await expect(page.getByTestId('outcome')).toContainText(/hai perso/i);

    const linea = page.locator('.board__win');
    await expect(linea).toBeAttached();

    const [coloreLinea, coloreSegno] = await Promise.all([
      linea.evaluate((el) => getComputedStyle(el).color),
      page.locator('.mark--ai').first().evaluate((el) => getComputedStyle(el).color),
    ]);
    expect(coloreLinea).not.toBe(coloreSegno);
  });

  test('il bottone rigioca riporta la tavola vuota', async ({ page }) => {
    await page.goto(urlPartita({ difficulty: 0, seed: 7 }));
    await giocaFinoAllaFine(page);
    await page.getByTestId('replay').click();
    expect(await leggiTavola(page)).toEqual(Array(9).fill('vuota'));
    await expect(page.getByTestId('outcome')).toBeHidden();
  });
});

test.describe('controlli di anteprima', () => {
  test('non compaiono su una visita normale', async ({ page }) => {
    await page.goto('/');
    await attendiPronta(page);
    await expect(page.getByTestId('demo-controls')).toBeHidden();
  });

  test('compaiono con il parametro demo', async ({ page }) => {
    await page.goto('/?demo=1');
    await expect(page.getByTestId('demo-controls')).toBeVisible();
  });
});
