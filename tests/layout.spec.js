const { test, expect, bild } = require('./hjalp');
const { mocka, installningar, STANDARD_INST } = require('./mock');

// iPad Air 2 i liggande läge med Safaris adressfält (1024×768 minus ca 70 px)
const AIR2_SAFARI = { width: 1024, height: 690 };

async function enRad(locator) {
  const box = await locator.boundingBox();
  const radhojd = await locator.evaluate((el) => parseFloat(getComputedStyle(el).fontSize) * 1.6);
  return box.height <= radhojd;
}

const FALL = [
  { namn: 'dag', tid: '2026-11-09T11:30:00+01:00', annotation: { type: 'testfall', description: 'TC-LAY-01' } },
  { namn: 'natt', tid: '2026-11-09T19:30:00+01:00', annotation: { type: 'testfall', description: 'TC-LAY-02' } }
];

for (const { namn, tid, annotation } of FALL) {
  test(`liten skärm (${namn}): sol och namnsdag på en rad och i nivå, inga överlappande avgångar`, { annotation }, async ({ page }) => {
    const api = await mocka(page, { tid });
    await page.route(/sholiday\.faboul\.se/, (route) => route.fulfill({
      headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json',
      body: JSON.stringify({ dagar: [{ datum: '2026-11-09', namnsdag: ['Teodor', 'Teodora'] }] })
    }));
    await page.setViewportSize(AIR2_SAFARI);
    await installningar(page, STANDARD_INST);
    await page.goto('./');
    await expect(page.locator('#namnsdag')).toHaveText('Teodor, Teodora');
    await expect(page.locator('.flyg-anrop')).toBeVisible();
    await expect.poll(() => enRad(page.locator('#sol'))).toBe(true);
    await expect.poll(() => enRad(page.locator('#namnsdag'))).toBe(true);
    await expect.poll(() => enRad(page.locator('#datum'))).toBe(true);
    // Namnsdag och sol står i nivå (rubrikerna på samma höjd), även när bara solen har en extra rad
    const [namnRubrik, solRubrik] = await Promise.all(
      ['#namnsdag', '#sol'].map((s) => page.locator('.fakta').filter({ has: page.locator(s) }).locator('small').boundingBox())
    );
    expect(Math.abs(namnRubrik.y - solRubrik.y)).toBeLessThanOrEqual(1);
    // Sista avgången slutar ovanför statusraden
    const sista = await page.locator('.avg').last().boundingBox();
    const status = await page.locator('#sl-status').boundingBox();
    expect(sista.y + sista.height).toBeLessThanOrEqual(status.y + 1);
    await bild(page, `iPad Air 2 med adressfält (${namn})`);
  });
}
