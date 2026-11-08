const { test, expect, bild } = require('./hjalp');
const { mocka, installningar, STANDARD_INST } = require('./mock');

test.describe('Tema', () => {
  test('dagtema när solen är uppe', { annotation: { type: 'testfall', description: 'TC-TEM-01' } }, async ({ skarm: page }) => {
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dag');
  });

  test('natttema efter solnedgången', { annotation: { type: 'testfall', description: 'TC-TEM-02' } }, async ({ page }) => {
    await mocka(page, { tid: '2026-11-08T19:05:00+01:00' });
    await installningar(page, STANDARD_INST);
    await page.goto('./');
    await expect(page.locator('#klocka')).toHaveText('19:05');
    await expect(page.locator('.avg').first()).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'natt');
    await expect(page.locator('.flyg-anrop')).toBeVisible();
    await bild(page, 'Startskärmen (natt)');
  });

  test('valt tema sparas', { annotation: { type: 'testfall', description: 'TC-TEM-03' } }, async ({ skarm: page }) => {
    await page.locator('#knapp-inst').click();
    await page.locator('#form-inst label', { hasText: 'Natt' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'natt');
    await page.locator('#inst-klar').click();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'natt');
  });
});
