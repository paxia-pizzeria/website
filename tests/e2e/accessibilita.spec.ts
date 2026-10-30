import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { attendiPronta, giocaFinoAllaFine, leggiTavola } from './support';

test('la partita si gioca con la sola tastiera', async ({ page }) => {
  await page.goto('/');
  await attendiPronta(page);

  await page.getByTestId('cell-0').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('cell-1')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByTestId('cell-4')).toBeFocused();
  await page.keyboard.press('Enter');

  expect((await leggiTavola(page))[4]).toBe('giocatore');
  await expect.poll(async () => (await leggiTavola(page)).filter((c) => c === 'ai').length).toBe(1);
});

test('lo stato della partita è annunciato in una live region', async ({ page }) => {
  await page.goto('/');
  await attendiPronta(page);
  await expect(page.getByTestId('status')).toHaveAttribute('aria-live', 'polite');
  await page.getByTestId('cell-0').click();
  await expect(page.getByTestId('status')).toContainText(/su riga 1, colonna 1/i);
});

test('nessuna violazione axe a tavola vuota', async ({ page }) => {
  await page.goto('/');
  await attendiPronta(page);
  const esito = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(esito.violations).toEqual([]);
});

test('nessuna violazione axe a partita finita', async ({ page }) => {
  await page.goto('/?difficulty=0&seed=3');
  await giocaFinoAllaFine(page);
  const esito = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(esito.violations).toEqual([]);
});
