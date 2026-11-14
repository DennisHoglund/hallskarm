const { test, expect, bild } = require('./hjalp');
const { mocka, installningar, STANDARD_INST } = require('./mock');

test.describe('Elpris', () => {
  test('elpriset visas i dagsljuspanelen med dyrt och billigaste tid', { annotation: { type: 'testfall', description: 'TC-EL-01' } }, async ({ skarm: page, api }) => {
    const rad = page.locator('#el-rad');
    await expect(rad).toBeVisible();
    await expect(page.locator('#el-nu')).toHaveText('169');
    await expect(page.locator('#el-niva')).toHaveText('Dyrt');
    await expect(page.locator('#el-niva')).toHaveClass(/dyrt/);
    await expect(page.locator('#el-tips')).toHaveText('billigast 21–00');
    // Före 13:00 hämtas inte morgondagen
    const url = api.anrop.filter((a) => a.typ === 'elpris').map((a) => a.url);
    expect(url).toEqual(['https://www.elprisetjustnu.se/api/v1/prices/2026/11-08_SE3.json']);
    await bild(page, 'Elpris i dagsljuspanelen');
  });

  test('tryck visar dygnets priser, i morgon och billigaste perioden', { annotation: { type: 'testfall', description: 'TC-EL-02' } }, async ({ page }) => {
    const api = await mocka(page, { tid: '2026-11-08T17:20:00+01:00' });
    await installningar(page, STANDARD_INST);
    await page.goto('./');
    await expect(page.locator('#el-nu')).toHaveText('213');
    await expect(page.locator('#el-tips')).toHaveText('billigast 03–06');
    expect(api.anrop.filter((a) => a.typ === 'elpris').some((a) => a.url.includes('11-09_SE3'))).toBe(true);

    await page.locator('#el-rad').click();
    const vy = page.locator('#elvy');
    await expect(vy).toBeVisible();
    await expect(page.locator('#elvy-omrade')).toContainText('SE3');
    await expect(page.locator('#elvy-nu')).toHaveText('213');
    await expect(page.locator('#elvy-omdome')).toHaveText('Dyrt just nu – dubbelt så dyrt som dagens snitt.Billigast i natt 03–06, snitt 50 öre. Bra tid för disk och tvätt.');
    await expect(page.locator('#elvy-snitt')).toHaveText('108');
    await expect(page.locator('#elvy-lagst')).toHaveText('51 kl 04');
    await expect(page.locator('#elvy-hogst')).toHaveText('214 kl 17');
    await expect(page.locator('#elvy-diagram .el-stapel')).toHaveCount(48);
    await expect(page.locator('#elvy-diagram .el-stapel.nu')).toHaveCount(1);
    await expect(page.locator('#elvy-diagram .el-stapel.imorgon')).toHaveCount(24);
    await expect(page.locator('#elvy-diagram .el-billig-t')).toHaveText('billigast 03–06');
    await bild(page, 'Elprisvyn');
    await page.locator('#elvy-stang').click();
    await expect(vy).toBeHidden();
  });

  test('elområdet följer platsen och kan väljas själv', { annotation: { type: 'testfall', description: 'TC-EL-03' } }, async ({ skarm: page, api }) => {
    const omr = await page.evaluate(() => [55.6, 57.8, 59.35, 59.755, 62.4, 65.6].map((lat) => window.HallElpris.omradeFor(lat)));
    expect(omr).toEqual(['SE4', 'SE3', 'SE3', 'SE3', 'SE2', 'SE1']);
    await page.locator('#knapp-inst').click();
    await page.locator('#elomrade').selectOption('SE4');
    await page.locator('#inst-klar').click();
    await expect.poll(() => api.anrop.filter((a) => a.typ === 'elpris').some((a) => a.url.includes('_SE4.json'))).toBe(true);
  });

  test('om elpriset inte kan hämtas syns ingen rad men resten fungerar', { annotation: { type: 'testfall', description: 'TC-EL-04' } }, async ({ page, api }) => {
    api.nere.elpris = true;
    await installningar(page, STANDARD_INST);
    await page.goto('./');
    await expect(page.locator('#prognos li')).toHaveCount(5);
    await expect.poll(() => api.anrop.filter((a) => a.typ === 'elpris').length).toBeGreaterThan(0);
    await expect(page.locator('#el-rad')).toBeHidden();
    await expect(page.locator('#dagsljus-langd')).not.toHaveText('–');
  });
});
