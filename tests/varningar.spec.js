const { test, expect, bild } = require('./hjalp');
const { mocka, installningar, STANDARD_INST, smhiVarning, GOTEBORG_YTA } = require('./mock');

async function starta(page) {
  await installningar(page, STANDARD_INST);
  await page.goto('./');
  await expect(page.locator('#prognos li')).toHaveCount(5);
  await expect(page.locator('.avg').first()).toBeVisible();
}

test.describe('SMHI-varningar', () => {
  test('gul varning för hemmet visas i händelseraden och kan fällas ut', { annotation: { type: 'testfall', description: 'TC-VAR-01' } }, async ({ page, api }) => {
    api.varningar = [
      smhiVarning({ niva: 'YELLOW', typ: 'Vind', start: '2026-11-08T05:00:00Z', slut: '2026-11-09T09:00:00Z' }),
      smhiVarning({ niva: 'ORANGE', typ: 'Snöfall', start: '2026-11-08T05:00:00Z', slut: '2026-11-09T09:00:00Z', yta: GOTEBORG_YTA, omrade: 'Västra Götalands län' }),
      smhiVarning({ niva: 'MESSAGE', typ: 'Risk för vattenbrist', start: '2026-04-20T22:00:00Z', mho: 'HYD' })
    ];
    await starta(page);
    const rad = page.locator('#handelse');
    await expect(rad).toBeVisible();
    await expect(page.locator('#handelse-etikett')).toHaveText('Gul varning');
    await expect(page.locator('#handelse-etikett')).toHaveClass(/varn-gul/);
    await expect(page.locator('#handelse-text')).toHaveText('Vind · nu till i morgon 10:00 · Stockholms län');
    await expect(page.locator('#handelse-hoger')).toHaveText('SMHI');
    // Varningar för andra områden och hydrologiska meddelanden visas inte
    await expect(page.locator('#handelse')).not.toContainText('Snöfall');
    await expect(page.locator('#handelse')).not.toContainText('vattenbrist');
    await expect(rad).not.toHaveClass(/larm/);
    expect(api.anrop.some((a) => a.typ === 'varningar')).toBe(true);

    // Tryck visar SMHI:s beskrivning
    await expect(page.locator('#handelse-mer')).toBeHidden();
    await rad.click();
    await expect(page.locator('#handelse-mer')).toBeVisible();
    await expect(page.locator('#handelse-mer')).toHaveText('Vad händer: Hårda vindbyar kan fälla träd och ge strömavbrott.');
    const overflow = await page.locator('#sl-lista').evaluate((el) => el.scrollHeight - el.clientHeight);
    expect(overflow).toBeLessThanOrEqual(1);
    await bild(page, 'Gul varning utfälld');
    await rad.click();
    await expect(page.locator('#handelse-mer')).toBeHidden();
  });

  test('röd varning går före norrsken, blinkar och turas om', { annotation: { type: 'testfall', description: 'TC-VAR-02' } }, async ({ page }) => {
    const api = await mocka(page, { tid: '2026-11-08T21:12:00+01:00' });
    api.kp = 6;
    api.vaderData.hourly.cloud_cover = api.vaderData.hourly.cloud_cover.map(() => 20);
    api.varningar = [smhiVarning({ niva: 'RED', typ: 'Vind', start: '2026-11-08T23:00:00Z', slut: '2026-11-09T11:00:00Z' })];
    await starta(page);
    await expect(page.locator('#handelse-etikett')).toHaveText('Röd varning');
    await expect(page.locator('#handelse-text')).toHaveText('Vind · från i natt 00:00 till i morgon 12:00 · Stockholms län');
    await expect(page.locator('#handelse')).toHaveClass(/larm/);
    await expect(page.locator('#handelse-hoger .antal')).toHaveText('1/2');
    await bild(page, 'Röd varning och norrsken');
    await expect(page.locator('#handelse-etikett')).toHaveText('Norrsken', { timeout: 10000 });
    await expect(page.locator('#handelse-hoger .antal')).toHaveText('2/2');
  });

  test('gamla, avlägsna eller saknade varningar ger ingen händelserad', { annotation: { type: 'testfall', description: 'TC-VAR-03' } }, async ({ page, api }) => {
    api.varningar = [
      smhiVarning({ niva: 'ORANGE', typ: 'Halka', start: '2026-11-07T05:00:00Z', slut: '2026-11-08T06:00:00Z' }), // slut 07:00 i dag
      smhiVarning({ niva: 'YELLOW', typ: 'Snöfall', start: '2026-11-10T05:00:00Z', slut: '2026-11-10T18:00:00Z' }) // om två dagar
    ];
    await starta(page);
    await expect.poll(() => api.anrop.filter((a) => a.typ === 'varningar').length).toBeGreaterThan(0);
    await expect(page.locator('#handelse')).toBeHidden();

    // SMHI svarar inte – resten av skärmen fungerar
    api.nere.varningar = true;
    await page.reload();
    await expect(page.locator('#prognos li')).toHaveCount(5);
    await expect(page.locator('.avg').first()).toBeVisible();
    await expect(page.locator('#handelse')).toBeHidden();
  });
});
