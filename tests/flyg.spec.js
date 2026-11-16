const { test, expect, bild } = require('./hjalp');
const { installningar, STANDARD_INST, PROXY } = require('./mock');

test.describe('Flyg', () => {
  test('nedre raden visar planet som passerar ovanför med rutt', { annotation: { type: 'testfall', description: 'TC-FLY-01' } }, async ({ skarm: page }) => {
    await expect(page.locator('#flyg-antal')).toHaveText('4 plan inom 25 km · 4 i dag');
    await expect(page.locator('.flyg-etikett')).toHaveText(/Rakt ovanför (om \d+ s|nu)/);
    await expect(page.locator('.flyg-anrop')).toHaveText('SAS1423');
    await expect(page.locator('.flyg-rutt')).toHaveText('Stockholm → Nice');
    await expect(page.locator('.flyg-fakta')).toHaveText(/^A20N · 9\s800 m · 3,0 km$/);
    await expect(page.locator('#minikarta .plan-ikon')).toHaveCount(4);
    await expect(page.locator('#minikarta .plan-ikon.vald')).toHaveCount(1);
  });

  test('helskärm med karta, etiketter och detaljer', { annotation: { type: 'testfall', description: 'TC-FLY-02' } }, async ({ skarm: page }) => {
    await page.locator('#flyg-oppna').click();
    await expect(page.locator('#flygvy')).toBeVisible();
    await expect(page.locator('#flik-karta')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#flygkarta .plan-ikon')).toHaveCount(4);
    await expect(page.locator('#flygkarta .plan-etikett').first()).toBeVisible();
    await expect(page.locator('#flygvy-panel .flyg-anrop')).toHaveText('SAS1423');
    await expect(page.locator('#flygvy-panel .rutt')).toContainText('ARN');
    await expect(page.locator('#flygvy-panel .rutt')).toContainText('NCE');
    await expect(page.locator('#flygvy-panel .planlista li')).toHaveCount(4);
    await bild(page, 'Flyg: genom taket');
    await page.locator('#flygvy-stang').click();
    await expect(page.locator('#flygvy')).toBeHidden();
  });

  test('radarvyn och räckvidden', { annotation: { type: 'testfall', description: 'TC-FLY-03' } }, async ({ skarm: page }) => {
    await page.locator('#flyg-oppna').click();
    await page.locator('#flik-radar').click();
    await expect(page.locator('#radar')).toBeVisible();
    await expect(page.locator('#radar .mal')).toHaveCount(4);
    await expect(page.locator('#radar .mal.vald text').first()).toHaveText('SAS1423');
    await bild(page, 'Flyg: radar');
    await page.locator('.radie button[data-radie="10"]').click();
    await expect(page.locator('.radie button[data-radie="10"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#flygvy-rubrik')).toHaveText('2 plan inom 10 km');
    await expect(page.locator('#radar .mal')).toHaveCount(2);
    // Valet av vy sparas
    await page.reload();
    await page.locator('#flyg-oppna').click();
    await expect(page.locator('#flik-radar')).toHaveAttribute('aria-selected', 'true');
  });

  test('om första flygkällan är nere används nästa', { annotation: { type: 'testfall', description: 'TC-FLY-04' } }, async ({ page, api }) => {
    api.nere.flyg = ['adsb.lol'];
    await installningar(page, STANDARD_INST);
    await page.goto('./');
    await expect(page.locator('.flyg-anrop')).toHaveText('SAS1423');
    expect(api.anrop.some((a) => a.typ === 'flyg:adsb.fi')).toBe(true);
  });

  test('när inga plan finns i närheten står det lugnt i luften', { annotation: { type: 'testfall', description: 'TC-FLY-05' } }, async ({ page, api }) => {
    api.flygplan = [];
    await installningar(page, STANDARD_INST);
    await page.goto('./');
    await expect(page.locator('.flyg-etikett')).toHaveText('Lugnt i luften');
    await expect(page.locator('.ingen-flyg')).toHaveText('Inga plan inom 25 km just nu.');
  });

  test('valt plan syns alltid på minikartan', { annotation: { type: 'testfall', description: 'TC-FLY-08' } }, async ({ page, api }) => {
    const { GARDET } = require('./mock');
    api.flygplan = [{ hex: '4cafe1', flight: 'RYR5JQ  ', r: 'EI-IFE', t: 'B38M', alt_baro: 38000, gs: 470, track: 200, baro_rate: 0,
      lat: GARDET.lat + 18 / 110.57, lon: GARDET.lon }];
    await installningar(page, STANDARD_INST);
    await page.goto('./');
    await expect(page.locator('.flyg-anrop')).toHaveText('RYR5JQ');
    const karta = await page.locator('#minikarta').boundingBox();
    const ikon = page.locator('#minikarta .plan-ikon');
    await expect.poll(async () => {
      const b = await ikon.boundingBox();
      return b && b.y >= karta.y && b.y + b.height <= karta.y + karta.height && b.x >= karta.x && b.x + b.width <= karta.x + karta.width;
    }).toBe(true);
    await bild(page, 'Plan 18 km bort syns på minikartan');
  });

  test('nedre raden blinkar när ett plan kommer nära', { annotation: { type: 'testfall', description: 'TC-FLY-09' } }, async ({ page, api }) => {
    await installningar(page, { ...STANDARD_INST, avisering: 'pip', aviseringKm: 5, tystNatt: false });
    await page.goto('./');
    await expect(page.locator('#flyg')).toHaveClass(/larm/);
    // Pipet räknas även om webbläsaren inte får spela ljud utan tryck
    await expect(page.locator('html')).toHaveAttribute('data-pip', '1');
    await bild(page, 'Avisering när plan passerar');
  });

  test('ingen avisering när den är avstängd eller planet är för långt bort', { annotation: { type: 'testfall', description: 'TC-FLY-10' } }, async ({ page, api }) => {
    await installningar(page, { ...STANDARD_INST, avisering: 'blinka', aviseringKm: 1 });
    await page.goto('./');
    await expect(page.locator('.flyg-anrop')).toHaveText('SAS1423');
    await page.waitForTimeout(500);
    await expect(page.locator('#flyg')).not.toHaveClass(/larm/);
    // Slå på 5 km i inställningarna → nästa uppdatering aviserar
    await page.locator('#knapp-inst').click();
    await page.locator('#avisering-km').selectOption('5');
    await page.locator('input[name="avisering"][value="av"]').check();
    await page.locator('#inst-klar').click();
    await page.waitForTimeout(500);
    await expect(page.locator('#flyg')).not.toHaveClass(/larm/);
  });

  test('utan proxy förklaras vad som behövs', { annotation: { type: 'testfall', description: 'TC-FLY-07' } }, async ({ page, api }) => {
    await installningar(page, { ...STANDARD_INST, flygProxy: '' });
    // Ta bort proxyn som står i config.js så att appen saknar proxy helt
    await page.route(/\/config\.js$/, async (route) => {
      const svar = await route.fetch();
      const kod = (await svar.text()).replace(/flygProxy: '[^']*'/, "flygProxy: ''");
      await route.fulfill({ response: svar, body: kod });
    });
    await page.goto('./');
    await expect(page.locator('.flyg-etikett')).toHaveText('Flygdata behöver en proxy');
    // Samma källor som via proxyn ska inte provas i onödan
    expect(api.anrop.filter((a) => a.typ === 'direkt').length).toBeLessThanOrEqual(2);
    // Lägg in proxyn i inställningarna så visas planen
    await page.locator('#knapp-inst').click();
    await page.locator('#flyg-proxy').fill(PROXY);
    await page.locator('#inst-klar').click();
    await expect(page.locator('.flyg-anrop')).toHaveText('SAS1423');
  });

  test('alla flygkällor nere ger ett tydligt besked', { annotation: { type: 'testfall', description: 'TC-FLY-06' } }, async ({ page, api }) => {
    api.nere.flyg = ['adsb.lol', 'adsb.fi', 'airplanes.live'];
    await installningar(page, STANDARD_INST);
    await page.goto('./');
    await expect(page.locator('.flyg-etikett')).toHaveText('Flygdata saknas');
  });

  test('dagens flygstatistik räknas, sparas och nollställs vid midnatt', { annotation: { type: 'testfall', description: 'TC-FLY-11' } }, async ({ page, api }) => {
    // Gårdagens statistik ska inte räknas in
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('test-flygdag')) {
        sessionStorage.setItem('test-flygdag', '1');
        localStorage.setItem('hall-flygdag', JSON.stringify({ datum: '2026-11-7', hex: Array.from({ length: 99 }, (_, i) => 'x' + i), narmast: null, hogst: null }));
      }
    });
    await installningar(page, STANDARD_INST);
    await page.goto('./');
    await expect(page.locator('#flyg-antal')).toHaveText('4 plan inom 25 km · 4 i dag');

    await page.locator('#flyg-oppna').click();
    const dag = page.locator('#flygvy-panel .flyg-dag');
    await expect(dag).toBeVisible();
    await expect(dag.locator('.nyckeltal > div').nth(0).locator('b')).toHaveText('4');
    await expect(dag.locator('.nyckeltal > div').nth(1)).toContainText('3,0 km');
    await expect(dag.locator('.nyckeltal > div').nth(1)).toContainText('SAS1423');
    await expect(dag.locator('.nyckeltal > div').nth(2).locator('b')).toHaveText(/^9\s800 m$/);
    await expect(dag.locator('.nyckeltal > div').nth(2)).toContainText('SAS1423 · A20N');
    await bild(page, 'Dagens flygstatistik');

    // Planen försvinner men dagens siffror ligger kvar, även efter omladdning
    api.flygplan = [];
    await expect(page.locator('#flygvy-rubrik')).toHaveText('0 plan inom 25 km', { timeout: 15000 });
    await expect(dag.locator('.nyckeltal > div').nth(0).locator('b')).toHaveText('4');
    await page.reload();
    await expect(page.locator('#flyg-antal')).toHaveText('0 plan inom 25 km · 4 i dag', { timeout: 15000 });
  });

  test('helikoptrar och andra kategorier får egna ikoner', { annotation: { type: 'testfall', description: 'TC-FLY-12' } }, async ({ page, api }) => {
    const { flygplan, runt, GARDET } = require('./mock');
    api.flygplan = flygplan(GARDET).concat([
      // Polishelikopter rakt ovanför, utan kategori men med känd helikoptertyp
      { hex: '4a9001', flight: 'POLIS42 ', r: 'SE-JPZ', t: 'EC35', alt_baro: 1200, gs: 90, track: 45, baro_rate: 0, ...runt(GARDET, 0.3, 0.2) },
      { hex: '4a9002', flight: 'QTR168  ', r: 'A7-ALZ', t: 'A359', category: 'A5', alt_baro: 36000, gs: 480, track: 300, baro_rate: 0, ...runt(GARDET, 8, 6) },
      { hex: '4a9003', flight: '', r: 'SE-DRN', t: '', category: 'B6', alt_baro: 300, gs: 20, track: 0, baro_rate: 0, ...runt(GARDET, -4, 3) }
    ]);
    await installningar(page, STANDARD_INST);
    await page.goto('./');
    await expect(page.locator('#flyg-info')).toContainText('POLIS42');
    await expect(page.locator('#flyg-info .flyg-fakta')).toContainText('EC35 · Helikopter');
    // Minikartan: helikoptern är vald, har ring och egen ikon
    await expect(page.locator('#minikarta .plan-ikon.vald svg.ikon-heli .ring')).toHaveCount(1);
    await expect(page.locator('#minikarta svg.ikon-tung')).toHaveCount(1);
    await expect(page.locator('#minikarta svg.ikon-liten')).toHaveCount(1);
    await expect(page.locator('#minikarta svg.ikon-dronare')).toHaveCount(1);
    await expect(page.locator('#minikarta svg.ikon-jet')).toHaveCount(3);

    // Radarn använder samma ikoner
    await page.locator('#flyg-oppna').click();
    await page.locator('#flik-radar').click();
    await expect(page.locator('#radar .mal.vald .ikon-heli')).toHaveCount(1);
    await expect(page.locator('#radar .ikon-tung')).toHaveCount(1);
    await expect(page.locator('#radar .ikon-dronare')).toHaveCount(1);
    // Helikopter och drönare vrids inte efter kursen
    await expect(page.locator('#radar .mal.vald .ikon-heli > g')).toHaveAttribute('transform', /rotate\(0\)/);
    await bild(page, 'Helikopter och kategorier på radarn');
  });

  test('ikoner i listan och teckenförklaring i flygvyn', { annotation: { type: 'testfall', description: 'TC-FLY-13' } }, async ({ page, api }) => {
    const { flygplan, runt, GARDET } = require('./mock');
    api.flygplan = flygplan(GARDET).concat([
      { hex: '4a9001', flight: 'POLIS42 ', r: 'SE-JPZ', t: 'EC35', category: 'A7', alt_baro: 1200, gs: 90, track: 45, baro_rate: 0, ...runt(GARDET, 0.3, 0.2) }
    ]);
    await installningar(page, STANDARD_INST);
    await page.goto('./');
    await page.locator('#flyg-oppna').click();
    const panel = page.locator('#flygvy-panel');
    await expect(panel.locator('.flyg-anrop .mini-ikon.ikon-heli')).toHaveCount(1);
    await expect(panel.locator('.planlista li.vald .mini-ikon.ikon-heli')).toHaveCount(1);
    await expect(panel.locator('.planlista li .mini-ikon.ikon-liten')).toHaveCount(1);
    await expect(panel.locator('.planlista li .mini-ikon')).toHaveCount(5);

    const knapp = page.locator('#flyg-forklaring-knapp');
    const ruta = page.locator('#flyg-forklaring');
    await expect(ruta).toBeHidden();
    await knapp.click();
    await expect(ruta).toBeVisible();
    await expect(knapp).toHaveAttribute('aria-expanded', 'true');
    await expect(ruta.locator('li')).toHaveCount(10);
    await expect(ruta).toContainText('Helikopter');
    await expect(ruta).toContainText('Ring och accentfärg');
    await bild(page, 'Teckenförklaring för flygikoner');
    await ruta.click();
    await expect(ruta).toBeHidden();
    await expect(knapp).toHaveAttribute('aria-expanded', 'false');
  });
});
