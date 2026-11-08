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
