// Spotify: "Spelas nu" under klockan och en e-bläckssida med mer om låten och artisten.
// Inloggning med PKCE (ingen hemlighet). Client ID och nycklar sparas bara på enheten (hall-spotify).
window.HallSpotify = (function () {
  const $ = (id) => document.getElementById(id);
  const C = () => window.HALL_CONFIG.api;
  const NYCKEL = 'hall-spotify';
  const OMFANG = 'user-read-playback-state user-read-currently-playing user-modify-playback-state';

  // ---------- Lagring ----------
  function las() { try { return JSON.parse(localStorage.getItem(NYCKEL)) || {}; } catch (e) { return {}; } }
  function spara(d) { try { localStorage.setItem(NYCKEL, JSON.stringify(d)); } catch (e) { /* fullt eller avstängt */ } }
  function uppdatera(f) { const d = las(); f(d); spara(d); return d; }
  const inloggad = () => !!las().refresh;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function mmss(ms) { const s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function omdirigering() { return location.origin + location.pathname; }

  // ---------- Inloggning (PKCE) ----------
  function slump(n) {
    const a = new Uint8Array(n); crypto.getRandomValues(a);
    return Array.from(a, (b) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'[b % 66]).join('');
  }
  async function utmaning(verifierare) {
    const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifierare));
    return btoa(String.fromCharCode.apply(null, new Uint8Array(h))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  async function loggaIn() {
    const klient = ($('spotify-klient').value || '').trim();
    if (!/^[0-9a-f]{32}$/i.test(klient)) { status('Klistra in ett giltigt Client ID (32 tecken) först.'); return; }
    const verifierare = slump(64), state = slump(16);
    uppdatera((d) => { d.klient = klient; d.verifierare = verifierare; d.state = state; });
    const q = new URLSearchParams({
      client_id: klient, response_type: 'code', redirect_uri: omdirigering(), scope: OMFANG,
      code_challenge_method: 'S256', code_challenge: await utmaning(verifierare), state
    });
    location.assign(C().spotifyKonto + '/authorize?' + q.toString());
  }
  function loggaUt() {
    spara({ klient: las().klient });
    senaste = null; rita();
    status('Utloggad.');
  }

  async function token(form) {
    const res = await fetch(C().spotifyKonto + '/api/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(form).toString()
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error('Spotify-inloggningen misslyckades: ' + (j.error_description || j.error || res.status)); e.kod = j.error; throw e; }
    uppdatera((d) => {
      d.access = j.access_token;
      d.utgar = Date.now() + (j.expires_in || 3600) * 1000 - 60000;
      if (j.refresh_token) d.refresh = j.refresh_token;
      delete d.verifierare; delete d.state;
    });
  }

  // Tar emot ?code= efter inloggningen och städar adressen
  async function hanteraRetur() {
    const p = new URLSearchParams(location.search);
    if (!p.has('code') && !p.has('error')) return false;
    const d = las();
    const rensa = () => { p.delete('code'); p.delete('state'); p.delete('error'); history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : '') + location.hash); };
    if (p.get('error') || p.get('state') !== d.state || !d.verifierare) { rensa(); status('Inloggningen avbröts. Försök igen.'); return false; }
    try {
      await token({ grant_type: 'authorization_code', code: p.get('code'), redirect_uri: omdirigering(), client_id: d.klient, code_verifier: d.verifierare });
      status('Inloggad med Spotify.');
    } catch (e) { status(e.message); }
    rensa();
    return true;
  }

  async function giltigNyckel() {
    const d = las();
    if (!d.refresh) return null;
    if (d.access && Date.now() < d.utgar) return d.access;
    try {
      await token({ grant_type: 'refresh_token', refresh_token: d.refresh, client_id: d.klient });
    } catch (e) {
      if (e.kod === 'invalid_grant') { loggaUt(); status('Spotify-inloggningen har gått ut. Logga in igen.'); }
      throw e;
    }
    return las().access;
  }

  async function api(sokvag, metod) {
    const nyckel = await giltigNyckel();
    if (!nyckel) return null;
    const res = await fetch(C().spotify + sokvag, { method: metod || 'GET', headers: { Authorization: 'Bearer ' + nyckel } });
    if (res.status === 204) return null;
    if (res.status === 401) { uppdatera((d) => { d.utgar = 0; }); throw new Error('Spotify: nyckeln gick ut, försöker igen'); }
    if (res.status === 403 && metod) { const e = new Error('Styrning kräver Spotify Premium'); e.premium = true; throw e; }
    if (!res.ok) throw new Error('Spotify svarade ' + res.status);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  // ---------- Vad spelas ----------
  let senaste = null, hamtadVid = 0, lyssnare = () => {};
  function tolka(p) {
    if (!p || !p.item) return null;
    const t = p.item, alb = t.album || {};
    const bilder = (alb.images || []).slice().sort((a, b) => (b.width || 0) - (a.width || 0));
    return {
      id: t.id, spelar: !!p.is_playing, titel: t.name || '',
      artist: (t.artists || []).map((a) => a.name).join(', '), artistId: t.artists && t.artists[0] && t.artists[0].id,
      artistNamn: t.artists && t.artists[0] && t.artists[0].name,
      album: alb.name || '', ar: (alb.release_date || '').slice(0, 4), spar: t.track_number, antalSpar: alb.total_tracks,
      bildStor: bilder[0] && bilder[0].url, bildLiten: (bilder[bilder.length - 1] || bilder[0] || {}).url,
      langd: t.duration_ms || 0, position: p.progress_ms || 0, enhet: (p.device && p.device.name) || ''
    };
  }

  async function hamta() {
    if (!inloggad()) { senaste = null; rita(); return; }
    const forra = senaste && senaste.id;
    senaste = tolka(await api('/me/player'));
    hamtadVid = Date.now();
    rita();
    if (senaste && senaste.id !== forra && !$('spotifyvy').hidden) fyllVy(true);
  }

  // ---------- Raden under klockan ----------
  function aktuellPosition() {
    if (!senaste) return 0;
    return Math.min(senaste.langd, senaste.position + (senaste.spelar ? Date.now() - hamtadVid : 0));
  }
  function rita() {
    const el = $('spelar');
    const visa = !!(senaste && senaste.spelar);
    const andrad = el.hidden === visa;
    el.hidden = !visa;
    if (visa) {
      $('spelar-bild').src = senaste.bildLiten || '';
      $('spelar-bild').hidden = !senaste.bildLiten;
      $('spelar-titel').textContent = senaste.titel;
      $('spelar-artist').textContent = senaste.artist;
      $('spelar-enhet').textContent = senaste.enhet;
      ritaPosition();
    }
    if (!$('spotifyvy').hidden) ritaVyLaget();
    if (andrad) lyssnare();
  }
  function ritaPosition() {
    if (!senaste) return;
    const pos = aktuellPosition();
    $('spelar-forlopp').style.width = (senaste.langd ? pos / senaste.langd * 100 : 0).toFixed(1) + '%';
    if (!$('spotifyvy').hidden) {
      $('sv-forlopp').style.width = (senaste.langd ? pos / senaste.langd * 100 : 0).toFixed(1) + '%';
      $('sv-pos').textContent = mmss(pos);
      $('sv-langd').textContent = mmss(senaste.langd);
    }
  }

  // ---------- Styrning ----------
  async function styr(vad) {
    try {
      if (vad === 'paus') await api(senaste && senaste.spelar ? '/me/player/pause' : '/me/player/play', 'PUT');
      if (vad === 'nasta') await api('/me/player/next', 'POST');
      if (vad === 'forra') await api('/me/player/previous', 'POST');
      if (vad === 'paus' && senaste) { senaste.spelar = !senaste.spelar; senaste.position = aktuellPosition(); hamtadVid = Date.now(); rita(); }
      setTimeout(() => hamta().catch(() => {}), 700);
    } catch (e) {
      visaFel(e.premium ? 'Styrning kräver Spotify Premium.' : 'Spotify svarade inte. Försök igen.');
    }
  }
  function visaFel(text) {
    const f = $('sv-fel');
    f.textContent = text; f.hidden = false;
    clearTimeout(visaFel.t); visaFel.t = setTimeout(() => { f.hidden = true; }, 5000);
  }

  // ---------- E-bläckssidan ----------
  const artistCache = {};
  async function artistInfo(t) {
    if (!t.artistId) return {};
    if (artistCache[t.artistId]) return artistCache[t.artistId];
    const info = {};
    try {
      const a = await api('/artists/' + encodeURIComponent(t.artistId));
      if (a) { info.genrer = a.genres || []; info.foljare = a.followers && a.followers.total; }
    } catch (e) { /* begränsat i utvecklingsläge – visas utan */ }
    try { Object.assign(info, await wikipedia(t.artistNamn)); } catch (e) { /* ingen text */ }
    artistCache[t.artistId] = info;
    return info;
  }

  // Kort text om artisten från Wikipedia: svenska först, sedan engelska
  const MUSIK = /musik|band|grupp|sångar|sångerska|artist|rappare|låtskriv|kompositör|dj|producent|album|musician|singer|rapper|songwriter|composer|producer|duo|orchestra|orkester/i;
  async function wikipedia(namn) {
    if (!namn) return {};
    const forsok = [
      ['sv', namn + ' (musikgrupp)'], ['sv', namn + ' (musiker)'], ['sv', namn + ' (artist)'], ['sv', namn + ' (sångare)'], ['sv', namn],
      ['en', namn + ' (band)'], ['en', namn + ' (musician)'], ['en', namn + ' (singer)'], ['en', namn + ' (rapper)'], ['en', namn]
    ];
    for (const [sprak, titel] of forsok) {
      const res = await fetch(C().wiki.replace('{sprak}', sprak) + encodeURIComponent(titel.replace(/ /g, '_')));
      if (!res.ok) continue;
      const j = await res.json();
      if (j.type === 'standard' && j.extract && MUSIK.test(j.extract + ' ' + (j.description || ''))) {
        return { om: j.extract, omKalla: sprak === 'sv' ? 'Från svenska Wikipedia' : 'Från engelska Wikipedia' };
      }
    }
    return {};
  }

  // Svartvitt rastrerat omslag (Floyd–Steinberg). Faller tillbaka på gråskala om bilden inte får läsas.
  function rastrera(url) {
    const img = $('sv-omslag');
    img.classList.remove('rastrerad');
    if (!url) { img.removeAttribute('src'); return; }
    const kalla = new Image();
    kalla.crossOrigin = 'anonymous';
    kalla.onload = () => {
      try {
        const N = 240, c = document.createElement('canvas'); c.width = c.height = N;
        const g = c.getContext('2d'); g.drawImage(kalla, 0, 0, N, N);
        const d = g.getImageData(0, 0, N, N), p = d.data, l = new Float32Array(N * N);
        for (let i = 0; i < N * N; i++) l[i] = 0.3 * p[i * 4] + 0.59 * p[i * 4 + 1] + 0.11 * p[i * 4 + 2];
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          const i = y * N + x, o = l[i], n = o < 128 ? 0 : 255, e = o - n; l[i] = n;
          if (x + 1 < N) l[i + 1] += e * 7 / 16;
          if (y + 1 < N) { if (x) l[i + N - 1] += e * 3 / 16; l[i + N] += e * 5 / 16; if (x + 1 < N) l[i + N + 1] += e / 16; }
        }
        for (let i = 0; i < N * N; i++) { const v = l[i] ? 236 : 20; p[i * 4] = p[i * 4 + 1] = p[i * 4 + 2] = v; p[i * 4 + 3] = 255; }
        g.putImageData(d, 0, 0);
        img.src = c.toDataURL();
        img.classList.add('rastrerad');
      } catch (e) {
        img.src = url; // gråskala via CSS
      }
    };
    kalla.onerror = () => { img.src = url; };
    kalla.src = url;
  }

  function ritaVyLaget() {
    const t = senaste;
    $('sv-spela').textContent = t && t.spelar ? 'Paus' : 'Spela';
    $('sv-enhet').textContent = t && t.enhet ? 'Spelas på ' + t.enhet : '';
    ritaPosition();
  }

  async function fyllVy(nyLat) {
    const t = senaste;
    if (!t) {
      $('sv-titel').textContent = 'Inget spelas just nu';
      ['sv-artist', 'sv-album', 'sv-om', 'sv-kalla', 'sv-nasta', 'sv-foljare'].forEach((id) => { $(id).textContent = ''; });
      $('sv-genrer').innerHTML = '';
      return;
    }
    $('sv-titel').textContent = t.titel;
    $('sv-artist').textContent = t.artist;
    $('sv-album').textContent = [t.album, t.ar, t.spar && t.antalSpar ? 'spår ' + t.spar + ' av ' + t.antalSpar : ''].filter(Boolean).join(' · ');
    ritaVyLaget();
    if (nyLat !== false) rastrera(t.bildStor);
    $('sv-om').textContent = 'Hämtar …';
    $('sv-kalla').textContent = '';
    const [info, ko] = await Promise.all([artistInfo(t), api('/me/player/queue').catch(() => null)]);
    if (senaste !== t && senaste && senaste.id !== t.id) return; // låten bytte under tiden
    $('sv-om').textContent = info.om || 'Ingen text om artisten hittades.';
    $('sv-kalla').textContent = info.omKalla || '';
    $('sv-genrer').innerHTML = (info.genrer || []).slice(0, 4).map((g) => `<span class="sv-genre">${esc(g)}</span>`).join('');
    $('sv-genrer-rad').hidden = !(info.genrer && info.genrer.length);
    $('sv-foljare').textContent = info.foljare != null ? info.foljare.toLocaleString('sv-SE') : '–';
    const nasta = ko && ko.queue && ko.queue[0];
    $('sv-nasta').textContent = nasta ? nasta.name + (nasta.artists && nasta.artists[0] ? ' – ' + nasta.artists[0].name : '') : '–';
  }

  let stangTimer = null;
  function vila() { clearTimeout(stangTimer); stangTimer = setTimeout(stang, 5 * 60 * 1000); }
  function oppna() { $('spotifyvy').hidden = false; fyllVy(); vila(); }
  function stang() { $('spotifyvy').hidden = true; clearTimeout(stangTimer); }

  // ---------- Inställningar ----------
  function status(text) { const s = $('spotify-status'); if (s) s.textContent = text; }
  function ritaInst() {
    const d = las();
    $('spotify-klient').value = d.klient || '';
    $('spotify-logga-in').hidden = !!d.refresh;
    $('spotify-logga-ut').hidden = !d.refresh;
    if (!$('spotify-status').textContent) status(d.refresh ? 'Inloggad med Spotify.' : 'Inte inloggad.');
    $('spotify-adress').textContent = omdirigering();
  }

  let tick = null;
  function koppla(andrad) {
    lyssnare = andrad || lyssnare;
    $('spelar-info').addEventListener('click', oppna);
    $('spelar-paus').addEventListener('click', () => styr('paus'));
    $('spelar-nasta').addEventListener('click', () => styr('nasta'));
    $('sv-stang').addEventListener('click', stang);
    $('sv-spela').addEventListener('click', () => styr('paus'));
    $('sv-nasta-knapp').addEventListener('click', () => styr('nasta'));
    $('sv-forra').addEventListener('click', () => styr('forra'));
    $('spotifyvy').addEventListener('pointerdown', vila);
    $('spotify-logga-in').addEventListener('click', loggaIn);
    $('spotify-logga-ut').addEventListener('click', () => { loggaUt(); ritaInst(); });
    $('spotify-klient').addEventListener('change', (e) => uppdatera((d) => { d.klient = e.target.value.trim(); }));
    ritaInst();
    clearInterval(tick);
    tick = setInterval(() => { if (senaste && senaste.spelar) ritaPosition(); }, 1000);
  }

  return { koppla, hanteraRetur, hamta, inloggad, ritaInst, tolka, oppna, stang };
})();
