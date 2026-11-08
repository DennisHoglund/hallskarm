const { test, expect, bild } = require('./hjalp');
const { installningar, STANDARD_INST } = require('./mock');

test.describe('Väder', () => {
  test('visar vädret nu och fem dagar framåt', { annotation: { type: 'testfall', description: 'TC-VAD-01' } }, async ({ skarm: page, api }) => {
    await expect(page.locator('#vader-temp')).toHaveText('4°');
    await expect(page.locator('#vader-text')).toHaveText('Lätt duggregn');
    await expect(page.locator('#vader-detalj')).toHaveText('Känns som 1° · SV 5 m/s, byar 9');
    await expect(page.locator('#vader-detalj2')).toHaveText('Nederbörd 0,4 mm just nu');
    const dagar = page.locator('#prognos li');
    await expect(dagar.nth(0).locator('.dag')).toHaveText('mån');
    await expect(dagar.nth(0).locator('.besk')).toHaveText('Duggregn');
    await expect(dagar.nth(2).locator('.lag')).toHaveText('−2°');
    const url = api.anrop.find((a) => a.typ === 'vader').url;
    expect(url).toContain('latitude=59.3467');
    expect(url).toContain('timezone=Europe%2FStockholm');
  });

  test('visar tydligt när vädret inte kan hämtas', { annotation: { type: 'testfall', description: 'TC-VAD-02' } }, async ({ page, api }) => {
    api.nere.vader = true;
    await installningar(page, STANDARD_INST);
    await page.goto('./');
    await expect(page.locator('#vader-status')).toHaveText('Kunde inte hämta just nu. Försöker igen strax.');
    await expect(page.locator('#vader-status')).toHaveClass(/fel/);
    // Resten av skärmen fungerar ändå
    await expect(page.locator('.avg').first()).toBeVisible();
    await expect(page.locator('#dagsljus-langd')).not.toHaveText('–');
    await bild(page, 'Vädret kan inte hämtas');
  });
});
