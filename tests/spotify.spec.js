const { test, expect, bild } = require('./hjalp');
const { mocka, installningar, spotifyInloggad, STANDARD_INST } = require('./mock');

async function starta(page, stall) {
  const api = await mocka(page);
  if (stall) stall(api);
  await installningar(page, STANDARD_INST);
  await spotifyInloggad(page);
  await page.goto('./');
  await expect(page.locator('#klocka')).toHaveText('08:42');
  return api;
}

test.describe('Spotify', () => {
  test('raden Spelas nu visar låt, artist och enhet och styr uppspelningen', { annotation: { type: 'testfall', description: 'TC-SPO-01' } }, async ({ page }) => {
    const api = await starta(page);
    const rad = page.locator('#spelar');
    await expect(rad).toBeVisible();
    await expect(page.locator('#spelar-titel')).toHaveText('Mannen i den vita hatten (16 år senare)');
    await expect(page.locator('#spelar-artist')).toHaveText('Kent');
    await expect(page.locator('#spelar-enhet')).toHaveText('Köket');
    await expect(page.locator('#spelar-bild')).toHaveAttribute('src', 'https://i.scdn.co/image/liten');
    await expect(page.locator('.avg').first()).toBeVisible();
    await bild(page, 'Spelas nu under klockan');

    await page.locator('#spelar-nasta').click();
    await expect.poll(() => api.anrop.some((a) => a.url === 'POST /me/player/next')).toBe(true);
    await page.locator('#spelar-paus').click();
    await expect.poll(() => api.anrop.some((a) => a.url === 'PUT /me/player/pause')).toBe(true);
    // Pausat: raden försvinner
    await expect(rad).toBeHidden();
  });

  test('tryck på raden öppnar e-bläckssidan med låt, artist och nästa låt', { annotation: { type: 'testfall', description: 'TC-SPO-02' } }, async ({ page }) => {
    const api = await starta(page);
    await page.locator('#spelar-info').click();
    const vy = page.locator('#spotifyvy');
    await expect(vy).toBeVisible();
    await expect(page.locator('#sv-titel')).toHaveText('Mannen i den vita hatten (16 år senare)');
    await expect(page.locator('#sv-artist')).toHaveText('Kent');
    await expect(page.locator('#sv-album')).toHaveText('Vapen & ammunition · 2002 · spår 3 av 10');
    await expect(page.locator('#sv-om')).toHaveText('Kent var en svensk rockgrupp från Eskilstuna, bildad 1990 och upplöst 2016.');
    await expect(page.locator('#sv-kalla')).toHaveText('Från svenska Wikipedia');
    await expect(page.locator('#sv-genrer .sv-genre')).toHaveText(['svensk rock', 'indierock']);
    await expect(page.locator('#sv-foljare')).toHaveText(/412\s345/);
    await expect(page.locator('#sv-nasta')).toHaveText('Ingenting – Kent');
    await expect(page.locator('#sv-enhet')).toHaveText('Spelas på Köket');
    await expect(page.locator('#sv-spela')).toHaveText('Paus');
    await expect(page.locator('#sv-omslag')).toHaveClass(/rastrerad/);
    await bild(page, 'E-bläckssidan');

    await page.locator('#sv-forra').click();
    await expect.poll(() => api.anrop.some((a) => a.url === 'POST /me/player/previous')).toBe(true);
    await page.locator('#sv-stang').click();
    await expect(vy).toBeHidden();
  });

  test('utan Premium visas ett fel och sidan fortsätter fungera', { annotation: { type: 'testfall', description: 'TC-SPO-03' } }, async ({ page }) => {
    await starta(page, (api) => { api.spotifyPremium = false; });
    await page.locator('#spelar-info').click();
    await page.locator('#sv-nasta-knapp').click();
    await expect(page.locator('#sv-fel')).toHaveText('Styrning kräver Spotify Premium.');
  });

  test('inget visas när inget spelar, när Spotify är nere eller utan inloggning', { annotation: { type: 'testfall', description: 'TC-SPO-04' } }, async ({ page }) => {
    const api = await starta(page, (a) => { a.spotify = null; });
    await expect(page.locator('.avg').first()).toBeVisible();
    await expect.poll(() => api.anrop.some((a) => a.typ === 'spotify')).toBe(true);
    await expect(page.locator('#spelar')).toBeHidden();

    api.nere.spotify = true;
    await page.reload();
    await expect(page.locator('.avg').first()).toBeVisible();
    await expect(page.locator('#spelar')).toBeHidden();
  });

  test('utan inloggning anropas inte Spotify och inställningarna visar inloggningen', { annotation: { type: 'testfall', description: 'TC-SPO-05' } }, async ({ skarm: page, api }) => {
    await expect(page.locator('#spelar')).toBeHidden();
    expect(api.anrop.filter((a) => a.typ.startsWith('spotify'))).toEqual([]);
    await page.locator('#knapp-inst').click();
    await expect(page.locator('#spotify-logga-in')).toBeVisible();
    await expect(page.locator('#spotify-logga-ut')).toBeHidden();
    await expect(page.locator('#spotify-status')).toHaveText('Inte inloggad.');
    await expect(page.locator('#spotify-adress')).toHaveText(/\/$/);
    await page.locator('#spotify-klient').fill('fel');
    await page.locator('#spotify-logga-in').click();
    await expect(page.locator('#spotify-status')).toHaveText('Klistra in ett giltigt Client ID (32 tecken) först.');
  });

  test('inloggningen tar emot koden från Spotify och städar adressen', { annotation: { type: 'testfall', description: 'TC-SPO-06' } }, async ({ page }) => {
    const api = await mocka(page);
    await installningar(page, STANDARD_INST);
    await page.addInitScript(() => {
      try {
        if (!sessionStorage.getItem('hall-test-spo')) {
          localStorage.setItem('hall-spotify', JSON.stringify({ klient: '0123456789abcdef0123456789abcdef', verifierare: 'v'.repeat(64), state: 'abc123' }));
          sessionStorage.setItem('hall-test-spo', '1');
        }
      } catch (e) { /* */ }
    });
    await page.goto('./?code=kod42&state=abc123');
    await expect(page.locator('#spelar')).toBeVisible();
    expect(page.url()).not.toContain('code=');
    const token = api.anrop.find((a) => a.typ === 'spotify-token');
    expect(token.url).toContain('code=kod42');
    expect(token.url).toContain('code_verifier=' + 'v'.repeat(64));
    const sparat = await page.evaluate(() => JSON.parse(localStorage.getItem('hall-spotify')));
    expect(sparat.refresh).toBe('testfornyelse');
    expect(sparat.verifierare).toBeUndefined();
  });
});
