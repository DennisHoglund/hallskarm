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
});
