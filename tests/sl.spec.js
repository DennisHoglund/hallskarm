const { test, expect, bild } = require('./hjalp');
const { installningar, STANDARD_INST, KARLAPLAN } = require('./mock');

test.describe('SL-avgångar', () => {
  test('avgångar visas i tidsordning och den som går nu markeras', { annotation: { type: 'testfall', description: 'TC-SL-01' } }, async ({ skarm: page }) => {
    const rader = page.locator('.avg');
    await expect(rader).toHaveCount(7);
    await expect(rader.nth(0).locator('.linje')).toHaveText('13');
    await expect(rader.nth(0).locator('.mal b')).toHaveText('Ropsten');
    await expect(rader.nth(0).locator('.mal span')).toHaveText('Tunnelbana · spår 1');
    await expect(rader.nth(0).locator('.min')).toHaveText('Nu');
    await expect(rader.nth(0).locator('.min')).toHaveClass(/nu/);
    await expect(rader.nth(1).locator('.min')).toHaveText('3 min');
    await expect(rader.nth(1).locator('.mal span')).toHaveText('Buss · läge A');
    await expect(rader.nth(0).locator('.linje')).toHaveClass(/metro rod/);
    await expect(page.locator('.hp-namn')).toHaveText('Avgångar · Gärdet');
  });

  test('lägg till hållplats genom att söka', { annotation: { type: 'testfall', description: 'TC-SL-02' } }, async ({ page, api }) => {
    await page.goto('./');
    // Första gången öppnas inställningarna av sig själva
    await expect(page.locator('#inst')).toBeVisible();
    await page.locator('#hp-sok').fill('gardet');
    await expect(page.locator('#hp-traffar button').first()).toContainText('Gärdet');
    await bild(page, 'Sök hållplats');
    await page.locator('#hp-traffar button').first().click();
    await expect(page.locator('#hallplatser li b')).toHaveText('Gärdet');
    // Första hållplatsen blir hemmets läge
    await expect(page.locator('#plats-namn')).toHaveText('Gärdet');
    await page.locator('#inst-klar').click();
    await expect(page.locator('#inst')).toBeHidden();
    await expect(page.locator('.avg').first()).toBeVisible();
    // Valet finns kvar efter omstart
    await page.reload();
    await expect(page.locator('.hp-namn')).toHaveText('Avgångar · Gärdet');
    expect(api.anrop.filter((a) => a.typ === 'slSites').length).toBe(1);
  });

  test('välj bort buss så visas bara tunnelbana', { annotation: { type: 'testfall', description: 'TC-SL-03' } }, async ({ skarm: page }) => {
    await page.locator('#knapp-inst').click();
    await page.locator('#hallplatser label', { hasText: 'Buss' }).click();
    await page.locator('#inst-klar').click();
    await expect(page.locator('.avg[data-lage="BUS"]')).toHaveCount(0);
    await expect(page.locator('.avg[data-lage="METRO"]').first()).toBeVisible();
    await expect(page.locator('.avg')).toHaveCount(5);
  });

  test('flera hållplatser visas var för sig', { annotation: { type: 'testfall', description: 'TC-SL-04' } }, async ({ page, api }) => {
    await installningar(page, { ...STANDARD_INST, hallplatser: [...STANDARD_INST.hallplatser, { id: KARLAPLAN.id, namn: 'Karlaplan', lagen: ['METRO', 'BUS'] }] });
    await page.goto('./');
    await expect(page.locator('.hp')).toHaveCount(2);
    await expect(page.locator('.hp').nth(1).locator('.hp-namn')).toHaveText('Avgångar · Karlaplan');
    await expect(page.locator('.hp').nth(0).locator('.avg')).toHaveCount(4);
    await expect(page.locator('.hp').nth(1).locator('.avg').first().locator('.mal b')).toHaveText('Fruängen');
    await bild(page, 'Två hållplatser');
  });

  test('när SL inte svarar visas ett felmeddelande', { annotation: { type: 'testfall', description: 'TC-SL-05' } }, async ({ page, api }) => {
    api.nere.sl = true;
    await installningar(page, STANDARD_INST);
    await page.goto('./');
    await expect(page.locator('#sl-status')).toHaveText('Kunde inte hämta just nu. Försöker igen strax.');
    await expect(page.locator('.hp .tom')).toHaveText('Kunde inte hämta avgångar.');
  });

  test('utan hållplats finns en knapp för att välja', { annotation: { type: 'testfall', description: 'TC-SL-06' } }, async ({ page, api }) => {
    await installningar(page, { plats: STANDARD_INST.plats, hallplatser: [] });
    await page.goto('./');
    await expect(page.locator('#inst')).toBeHidden();
    await page.locator('#sl-valj').click();
    await expect(page.locator('#inst')).toBeVisible();
  });
});
