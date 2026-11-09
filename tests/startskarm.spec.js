const { test, expect, bild } = require('./hjalp');

test.describe('Startskärmen', () => {
  test('klocka, datum, vecka och namnsdag visas', { annotation: { type: 'testfall', description: 'TC-TID-01' } }, async ({ skarm: page }) => {
    await expect(page.locator('#klocka')).toHaveText('08:42');
    await expect(page.locator('#veckodag')).toHaveText('söndag');
    await expect(page.locator('#datum')).toHaveText('8 november 2026');
    await expect(page.locator('#vecka')).toHaveText('vecka 45');
    await expect(page.locator('#namnsdag')).toHaveText('Eskil');
    await expect(page.locator('#sol')).toHaveText('07:39\u2009–\u200915:41');
    await bild(page, 'Startskärmen (dag)');
  });

  test('dagsljuset visar längd, ändring och dagar till vändningen', { annotation: { type: 'testfall', description: 'TC-TID-02' } }, async ({ skarm: page }) => {
    await expect(page.locator('#dagsljus-langd')).toHaveText('8 h 02');
    await expect(page.locator('#dagsljus-andring')).toHaveText('−4 min/dag');
    await expect(page.locator('#dagsljus-vander')).toHaveText('Vänder om 43 dagar');
    const pts = await page.locator('#dagsljus-linje').getAttribute('points');
    expect(pts.split(' ').length).toBeGreaterThan(50);
  });

  test('namnsdagen visar streck om tjänsten inte svarar', { annotation: { type: 'testfall', description: 'TC-TID-03' } }, async ({ page, api }) => {
    api.nere.dagar = true;
    await page.goto('./');
    await expect(page.locator('#klocka')).toHaveText('08:42');
    await expect(page.locator('#namnsdag')).toHaveText('–');
  });
});
