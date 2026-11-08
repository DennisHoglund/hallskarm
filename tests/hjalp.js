// Gemensamma fixturer och hjälpfunktioner för testerna.
const base = require('@playwright/test');
const { mocka, installningar, STANDARD_INST } = require('./mock');

const test = base.test.extend({
  // Mockar allt externt och sätter fast tid (sön 8 nov 2026 08:42)
  api: async ({ page }, use) => {
    await use(await mocka(page));
  },

  // Startskärmen med Gärdet som plats och hållplats, all data laddad
  skarm: async ({ page, api }, use) => {
    await installningar(page, STANDARD_INST);
    await page.goto('./');
    await base.expect(page.locator('#klocka')).toHaveText('08:42');
    await base.expect(page.locator('#prognos li')).toHaveCount(5);
    await base.expect(page.locator('.avg').first()).toBeVisible();
    await base.expect(page.locator('.flyg-anrop')).toBeVisible();
    await use(page);
  }
});

// Bifogar en skärmdump till rapporten
async function bild(page, namn) {
  await page.waitForTimeout(400); // låt kartrutor och animationer landa
  await test.info().attach(namn, { body: await page.screenshot(), contentType: 'image/png' });
}

module.exports = { test, expect: base.expect, bild };
