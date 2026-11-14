const { test, expect, bild } = require('./hjalp');

test.describe('Plats och PWA', () => {
  test('sök plats byter läge för väder och flyg', { annotation: { type: 'testfall', description: 'TC-PLA-01' } }, async ({ skarm: page, api }) => {
    await page.locator('#knapp-inst').click();
    await page.locator('#plats-sok').fill('Hjorthagen');
    await expect(page.locator('#plats-traffar button').first()).toContainText('Hjorthagen');
    await page.locator('#plats-traffar button').first().click();
    await expect(page.locator('#plats-namn')).toHaveText('Hjorthagen');
    await page.locator('#inst-klar').click();
    await expect.poll(() => api.anrop.filter((a) => a.typ === 'vader').some((a) => a.url.includes('latitude=59.353'))).toBe(true);
    await expect.poll(() => api.anrop.filter((a) => a.typ.startsWith('flyg:')).some((a) => a.url.includes('59.353'))).toBe(true);
  });

  test('använd min position', { annotation: { type: 'testfall', description: 'TC-PLA-02' } }, async ({ skarm: page }) => {
    await page.locator('#knapp-inst').click();
    await page.locator('#plats-gps').click();
    await expect(page.locator('#plats-namn')).toHaveText('Min position');
  });

  test('koordinater från Kartor kan klistras in som plats', { annotation: { type: 'testfall', description: 'TC-PLA-03' } }, async ({ skarm: page, api }) => {
    await page.locator('#knapp-inst').click();
    for (const text of ['59,75526° N, 18,59035° Ö', '59.75526, 18.59035', '59°45\'19"N 18°35\'25"E']) {
      await page.locator('#plats-sok').fill(text);
      await expect(page.locator('#plats-traffar button')).toHaveCount(1);
      await expect(page.locator('#plats-traffar button')).toContainText('59,755° N, 18,590° Ö');
      await expect(page.locator('#plats-traffar button')).toContainText('Koordinater');
    }
    await page.locator('#plats-traffar button').click();
    await expect(page.locator('#plats-namn')).toHaveText('59,755° N, 18,590° Ö');
    // Koordinater söks inte i platssöket
    expect(api.anrop.filter((a) => a.typ === 'geokod').length).toBe(0);
    await page.locator('#inst-klar').click();
    await expect.poll(() => api.anrop.filter((a) => a.typ === 'vader').some((a) => a.url.includes('latitude=59.755') && a.url.includes('longitude=18.59'))).toBe(true);
  });

  test('tydligt besked när positionen inte går att få', { annotation: { type: 'testfall', description: 'TC-PLA-04' } }, async ({ page, api }) => {
    // Som en Wi-Fi-iPad på landet: först hittas ingen position, sedan nekas åtkomst
    await page.addInitScript(() => {
      let kod = 2;
      navigator.geolocation.getCurrentPosition = (ok, fel) => setTimeout(() => fel({ code: kod++, message: '' }), 50);
    });
    await require('./mock').installningar(page, require('./mock').STANDARD_INST);
    await page.goto('./');
    await page.locator('#knapp-inst').click();
    await page.locator('#plats-gps').click();
    await expect(page.locator('#plats-gps')).toHaveText('Hittade ingen position – sök på ort eller klistra in koordinater');
    await page.locator('#plats-gps').click();
    await expect(page.locator('#plats-gps')).toHaveText('Hittade ingen position – sök på ort eller klistra in koordinater');
    await page.evaluate(() => { navigator.geolocation.getCurrentPosition = (ok, fel) => setTimeout(() => fel({ code: 1, message: '' }), 50); });
    await page.locator('#plats-gps').click();
    await expect(page.locator('#plats-gps')).toHaveText('Platsåtkomst nekad – slå på för Safari i Inställningar');
    await expect(page.locator('#plats-namn')).toHaveText('Gärdet');
  });

  test('första start öppnar inställningarna', { annotation: { type: 'testfall', description: 'TC-PWA-01' } }, async ({ page, api }) => {
    await page.goto('./');
    await expect(page.locator('#inst')).toBeVisible();
    await expect(page.locator('#plats-namn')).toHaveText('Stockholm (standard)');
    await bild(page, 'Inställningar första gången');
  });

  test('manifest och ikoner finns för hemskärmen', { annotation: { type: 'testfall', description: 'TC-PWA-02' } }, async ({ page, request }) => {
    const m = await (await request.get('manifest.webmanifest')).json();
    expect(m.name).toBe('Hallskärm');
    expect(m.display).toBe('fullscreen');
    for (const i of m.icons) expect((await request.get(i.src)).ok()).toBe(true);
    expect((await request.get('icons/apple-touch-icon.png')).ok()).toBe(true);
    expect((await request.get('sw.js')).ok()).toBe(true);
  });
});
