const { test, expect, bild } = require('./hjalp');
const { mocka, installningar, STANDARD_INST } = require('./mock');

// Klar himmel från en viss timme den 8 nov (index i timprognosen: 24 + timme)
function klartFran(api, timme) {
  api.vaderData.hourly.cloud_cover = api.vaderData.hourly.cloud_cover.map((m, i) => (i >= 24 + timme ? 20 : m));
}

async function starta(page, api) {
  await installningar(page, STANDARD_INST);
  await page.goto('./');
  await expect(page.locator('#prognos li')).toHaveCount(5);
  await expect(page.locator('.avg').first()).toBeVisible();
}

test.describe('Norrsken', () => {
  test('hög Kp, mörkt och klart visar "Troligt nu" och blinkar', { annotation: { type: 'testfall', description: 'TC-NOR-01' } }, async ({ page }) => {
    const api = await mocka(page, { tid: '2026-11-08T21:12:00+01:00' });
    api.kp = 6;
    klartFran(api, 0);
    await starta(page, api);
    const rad = page.locator('#handelse');
    await expect(rad).toBeVisible();
    await expect(page.locator('#handelse-text')).toHaveText('Troligt nu · klar himmel till 07 · titta mot norr, bort från gatuljus');
    await expect(page.locator('#handelse-hoger')).toContainText('Kp 6');
    await expect(page.locator('#handelse-hoger i.pa')).toHaveCount(6);
    await expect(rad).toHaveClass(/larm/);
    expect(api.anrop.some((a) => a.typ === 'kp')).toBe(true);
    // Mittdelen krymper men inga avgångar klipps
    const overflow = await page.locator('#sl-lista').evaluate((el) => el.scrollHeight - el.clientHeight);
    expect(overflow).toBeLessThanOrEqual(1);
    await bild(page, 'Norrsken troligt nu');
    // iPad Air 2 med Safaris adressfält: SL-listan anpassas vid nästa omritning (var 15:e sekund)
    await page.setViewportSize({ width: 1024, height: 690 });
    await expect.poll(() => page.locator('#sl-lista').evaluate((el) => el.scrollHeight - el.clientHeight), { timeout: 20000 }).toBeLessThanOrEqual(1);
  });

  test('på dagen med klart väder i kväll visas "Möjligt i kväll"', { annotation: { type: 'testfall', description: 'TC-NOR-02' } }, async ({ page }) => {
    const api = await mocka(page, { tid: '2026-11-08T14:30:00+01:00' });
    api.kp = (t) => (t >= new Date('2026-11-08T18:00:00Z') ? 5 : 2);
    klartFran(api, 21);
    await starta(page, api);
    await expect(page.locator('#handelse-text')).toHaveText('Möjligt i kväll · klart från ca 21 · titta mot norr');
    await expect(page.locator('#handelse-hoger i.pa')).toHaveCount(5);
    await expect(page.locator('#handelse')).not.toHaveClass(/larm/);
    await bild(page, 'Norrsken möjligt i kväll');
  });

  test('molnigt, låg Kp eller NOAA nere ger ingen händelserad', { annotation: { type: 'testfall', description: 'TC-NOR-03' } }, async ({ page }) => {
    const api = await mocka(page, { tid: '2026-11-08T21:12:00+01:00' });
    api.kp = 7; // men mulet hela natten (standard i mocken)
    await starta(page, api);
    await expect.poll(() => api.anrop.filter((a) => a.typ === 'kp').length).toBeGreaterThan(0);
    await expect(page.locator('#handelse')).toBeHidden();
    await expect(page.locator('.skarm')).not.toHaveClass(/med-handelse/);

    // Klart men låg Kp
    klartFran(api, 0);
    api.kp = 3;
    await page.reload();
    await expect(page.locator('#prognos li')).toHaveCount(5);
    await expect.poll(() => api.anrop.filter((a) => a.typ === 'kp').length).toBeGreaterThan(1);
    await expect(page.locator('#handelse')).toBeHidden();

    // NOAA svarar inte – resten av skärmen fungerar
    api.nere.kp = true;
    api.kp = 7;
    await page.reload();
    await expect(page.locator('#prognos li')).toHaveCount(5);
    await expect(page.locator('.avg').first()).toBeVisible();
    await expect(page.locator('#handelse')).toBeHidden();
  });
});
