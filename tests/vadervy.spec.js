const { test, expect, bild } = require('./hjalp');
const { mocka, installningar, STANDARD_INST } = require('./mock');

test.describe('Vädervyn', () => {
  test('tryck på vädret visar klädtips, 24 timmar och regnradar', { annotation: { type: 'testfall', description: 'TC-VAD-03' } }, async ({ skarm: page, api }) => {
    await page.locator('#vader-oppna').click();
    const vy = page.locator('#vadervy');
    await expect(vy).toBeVisible();
    await expect(page.locator('#vadervy-plats')).toContainText('Gärdet');

    // Klädtips: känns som 0° och regn just nu
    await expect(page.locator('#klad-rubrik')).toHaveText('Mössa, vantar och paraply');
    await expect(page.locator('#klad-skal')).toHaveText('Känns som 0° · regnar nu');
    await expect(page.locator('#klad-taggar .tagg')).toHaveText(['Mössa', 'Vantar', 'Paraply']);

    // 24 timmar: börjar nu, visar temperatur, regnstaplar och vind
    await expect(page.locator('#timmar-sammanfattning')).toHaveText('Lägst 1° kl 03 · högst 5° kl 15 · 2,9 mm totalt');
    await expect(page.locator('#timmar-diagram .timme').first()).toHaveText('Nu');
    await expect(page.locator('#timmar-diagram .timme').nth(1)).toHaveText('11');
    await expect(page.locator('#timmar-diagram .regnstapel')).toHaveCount(5);
    await expect(page.locator('#timmar-diagram .vindpil')).toHaveCount(9);

    // Nederbörden de närmaste timmarna
    await expect(page.locator('#regn-rubrik')).toHaveText('Det regnar nu');
    await expect(page.locator('#regn-text')).toHaveText('Uppehåll väntas från ca 09.');
    await expect(page.locator('#regn-nasta')).toHaveText('Nu');
    await expect(page.locator('#regn-mest')).toHaveText('1,2 mm/h');
    await expect(page.locator('#regn-intensitet')).toHaveText('Måttlig');

    // Regnradarn hämtar bilder och spelar upp dem
    await expect(page.locator('#regn-tid')).toHaveText(/kl \d\d:\d\d/);
    await expect(page.locator('#regn-spela')).toHaveAttribute('aria-pressed', 'true');
    expect(api.anrop.some((a) => a.typ === 'radar')).toBe(true);
    await expect.poll(() => api.anrop.filter((a) => a.typ === 'radarruta').length).toBeGreaterThan(0);
    // Gratis-API:t ger bara zoom 7 – högre nivåer får inte begäras
    expect(api.anrop.filter((a) => a.typ === 'radarruta').every((a) => /\/256\/[0-7]\//.test(a.url))).toBe(true);
    await page.locator('#regn-spela').click();
    await expect(page.locator('#regn-spela')).toHaveAttribute('aria-pressed', 'false');
    await bild(page, 'Vädervyn på morgonen');

    await page.locator('#vadervy-stang').click();
    await expect(vy).toBeHidden();
    await expect(page.locator('#vader-temp')).toBeVisible();
  });

  test('på kvällen föreslås reflex när det är mörkt', { annotation: { type: 'testfall', description: 'TC-VAD-04' } }, async ({ page }) => {
    const api = await mocka(page, { tid: '2026-11-08T19:54:00+01:00' });
    api.vaderData.current.precipitation = 0; // uppehåll på kvällen
    await installningar(page, STANDARD_INST);
    await page.goto('./');
    await expect(page.locator('#prognos li')).toHaveCount(5);
    await page.locator('#vader-oppna').click();
    await expect(page.locator('#klad-rubrik')).toHaveText('Mössa, vantar och reflex');
    await expect(page.locator('#klad-skal')).toHaveText('Känns som 0° · mörkt sedan 15:41');
    await expect(page.locator('#klad-taggar .tagg.accent')).toHaveText('Reflex');
    await expect(page.locator('#regn-rubrik')).toHaveText('Uppehåll de närmaste timmarna');
    await expect(page.locator('#regn-nasta')).toHaveText('–');
    await bild(page, 'Vädervyn på kvällen');
  });

  test('om regnradarn inte svarar fungerar resten av vyn', { annotation: { type: 'testfall', description: 'TC-VAD-05' } }, async ({ page, api }) => {
    api.nere.radar = true;
    await installningar(page, STANDARD_INST);
    await page.goto('./');
    await expect(page.locator('#prognos li')).toHaveCount(5);
    await page.locator('#vader-oppna').click();
    await expect(page.locator('#regn-fel')).toBeVisible();
    await expect(page.locator('#regn-fel')).toContainText('Försöker igen');
    await expect(page.locator('#klad-rubrik')).toHaveText('Mössa, vantar och paraply');
    await expect(page.locator('#timmar-diagram .templinje')).toHaveCount(1);
    await expect(page.locator('#regn-rubrik')).toHaveText('Det regnar nu');
    await bild(page, 'Regnradarn kan inte hämtas');
  });
});
