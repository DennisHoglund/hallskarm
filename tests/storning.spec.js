const { test, expect, bild } = require('./hjalp');
const { installningar, STANDARD_INST } = require('./mock');

const SIGNALFEL = {
  deviation_case_id: 101, version: 1,
  publish: { from: '2026-11-08T06:00:00', upto: '2026-11-08T09:30:00' },
  priority: { importance_level: 5, influence_level: 4, urgency_level: 3 },
  message_variants: [{ header: 'Röda linjen: begränsad trafik Gärdet–T-Centralen på grund av signalfel', details: 'Räkna med längre restid.', scope_alias: 'Tunnelbanans röda linje 13', language: 'sv' }],
  scope: { lines: [{ id: 13, designation: '13', transport_mode: 'METRO', group_of_lines: 'Tunnelbanans röda linje' }] }
};
const HISS = {
  deviation_case_id: 102, version: 1, publish: { from: '2026-11-01T06:00:00' }, priority: { importance_level: 2 },
  message_variants: [{ header: 'Hiss ur funktion vid Gärdet', language: 'sv' }],
  scope: { stop_areas: [{ id: 1, name: 'Gärdet', type: 'METROSTN' }] }
};
const ANNAN_LINJE = {
  deviation_case_id: 103, version: 1, publish: { from: '2026-11-08T06:00:00' }, priority: { importance_level: 7 },
  message_variants: [{ header: 'Buss 55 omleds vid Tegnérlunden', language: 'sv' }],
  scope: { lines: [{ id: 55, designation: '55', transport_mode: 'BUS' }] }
};
const BUSS72 = {
  deviation_case_id: 104, version: 1, publish: { from: '2026-11-08T07:00:00' }, priority: { importance_level: 3 },
  message_variants: [{ header: 'Buss 72 stannar inte vid Rindögatan', language: 'sv' }],
  scope: { lines: [{ id: 72, designation: '72', transport_mode: 'BUS' }] }
};

test.describe('SL-störningar', () => {
  test('störning på en linje markeras i avgångarna och visas längst ner', { annotation: { type: 'testfall', description: 'TC-SL-07' } }, async ({ page, api }) => {
    api.storningar = [HISS, SIGNALFEL, ANNAN_LINJE];
    await installningar(page, STANDARD_INST);
    await page.goto('./');
    const rad = page.locator('#sl-storning');
    await expect(rad).toBeVisible();
    await expect(page.locator('#sl-storning-text')).toHaveText('Röda linjen: begränsad trafik Gärdet–T-Centralen på grund av signalfel');
    await expect(page.locator('#sl-storning-till')).toHaveText('till ca 09:30');
    await expect(page.locator('#sl-storning-antal')).toHaveText('');
    // Bara linje 13 får markeringen
    const t13 = page.locator('.avg', { has: page.locator('.linje', { hasText: /^13$/ }) });
    await expect(t13.first().locator('.storning-tagg')).toHaveText('Störning');
    await expect(page.locator('.avg', { has: page.locator('.linje', { hasText: /^72$/ }) }).first().locator('.storning-tagg')).toHaveCount(0);
    // Hissar och andra linjer visas inte
    await expect(page.locator('#sl')).not.toContainText('Hiss');
    await expect(page.locator('#sl')).not.toContainText('Tegnérlunden');
    // Valda trafikslag skickas med
    const url = api.anrop.find((a) => a.typ === 'storningar').url;
    expect(url).toContain('transport_mode=METRO');
    expect(url).toContain('transport_mode=BUS');
    const overflow = await page.locator('#sl-lista').evaluate((el) => el.scrollHeight - el.clientHeight);
    expect(overflow).toBeLessThanOrEqual(1);
    await bild(page, 'Störning på röda linjen');
  });

  test('flera störningar visas en i taget, ingen störning ger ingen rad', { annotation: { type: 'testfall', description: 'TC-SL-08' } }, async ({ page, api }) => {
    api.storningar = [BUSS72, SIGNALFEL];
    await installningar(page, STANDARD_INST);
    await page.goto('./');
    await expect(page.locator('#sl-storning-antal')).toHaveText('1/2');
    // Viktigast först
    await expect(page.locator('#sl-storning-text')).toContainText('Röda linjen');
    await expect(page.locator('#sl-storning-text')).toContainText('Buss 72', { timeout: 10000 });
    await expect(page.locator('#sl-storning-antal')).toHaveText('2/2');

    api.storningar = [];
    await page.reload();
    await expect(page.locator('.avg').first()).toBeVisible();
    await expect.poll(() => api.anrop.filter((a) => a.typ === 'storningar').length).toBeGreaterThan(1);
    await expect(page.locator('#sl-storning')).toBeHidden();
    await expect(page.locator('.storning-tagg')).toHaveCount(0);
  });

  test('om störningstjänsten inte svarar visas avgångarna ändå', { annotation: { type: 'testfall', description: 'TC-SL-09' } }, async ({ page, api }) => {
    api.nere.storningar = true;
    await installningar(page, STANDARD_INST);
    await page.goto('./');
    await expect(page.locator('.avg').first()).toBeVisible();
    await expect.poll(() => api.anrop.filter((a) => a.typ === 'storningar').length).toBeGreaterThan(0);
    await expect(page.locator('#sl-storning')).toBeHidden();
    await expect(page.locator('#sl-status')).not.toHaveClass(/fel/);
  });
});
