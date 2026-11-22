const { test, expect } = require('./hjalp');
const { installningar, STANDARD_INST } = require('./mock');

test.describe('Felsökningsläge', () => {
  test('?utan= stänger av delar vid start', { annotation: { type: 'testfall', description: 'TC-FEL-01' } }, async ({ page, api }) => {
    await installningar(page, STANDARD_INST);
    await page.goto('./?utan=elpris,flyg,varningar');
    await expect(page.locator('#prognos li')).toHaveCount(5);
    await expect(page.locator('.avg').first()).toBeVisible();
    await page.waitForTimeout(1500);
    const typer = new Set(api.anrop.map((a) => a.typ));
    expect(typer.has('elpris')).toBe(false);
    expect(typer.has('varningar')).toBe(false);
    expect(api.anrop.some((a) => /adsb|airplanes|proxy/.test(a.url))).toBe(false);
    expect(typer.has('vader')).toBe(true);
    await expect(page.locator('#el-rad')).toBeHidden();
    await expect(page.locator('#version')).toHaveText(/^Version v\d+ · felsökning utan elpris, flyg, varningar$/);
  });

  test('?diagnos visar svaret från varje tjänst', { annotation: { type: 'testfall', description: 'TC-FEL-02' } }, async ({ page, api }) => {
    await installningar(page, STANDARD_INST);
    // Namnsdags-API:t ligger nere – raden ska visa felet i stället för att stoppa resten
    await page.route('https://sholiday.faboul.se/**', (r) => r.abort('failed'));
    await page.goto('./?diagnos');
    const ruta = page.locator('#diagnos');
    await expect(ruta).toContainText('Väder (Open-Meteo): OK 200');
    await expect(ruta).toContainText(/Namnsdag: FEL /);
    await expect(ruta).toContainText('Fota och skicka');
    await expect(page.locator('#prognos li')).toHaveCount(5);
  });

  test('kartan fungerar utan cdnjs', { annotation: { type: 'testfall', description: 'TC-FEL-03' } }, async ({ page, api }) => {
    // iPadOS 15 når inte cdnjs – Leaflet ska komma från appens egen kopia
    await page.route(/cdnjs\.cloudflare\.com/, (r) => r.abort('failed'));
    await installningar(page, STANDARD_INST);
    await page.goto('./');
    await expect(page.locator('.leaflet-container').first()).toBeVisible();
    expect(await page.evaluate(() => typeof window.L)).toBe('object');
    await expect(page.locator('#felruta')).toHaveCount(0);
  });
});
