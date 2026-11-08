// Inställningar som bara sparas på den här enheten (localStorage):
// hemmets läge, hållplatser med trafikslag, tema och flygradie.
// Innehåller också inställningspanelen med sök av plats och hållplats.
window.HallInst = (function () {
  const NYCKEL = 'hall-installningar';
  const SITES_NYCKEL = 'hall-sl-sites';
  const SITES_MAXALDER = 7 * 24 * 3600 * 1000;
  const MAX_HALLPLATSER = 3;

  const LAGEN = [
    { kod: 'METRO', namn: 'Tunnelbana' },
    { kod: 'BUS', namn: 'Buss' },
    { kod: 'TRAIN', namn: 'Pendeltåg' },
    { kod: 'TRAM', namn: 'Spårväg' },
    { kod: 'SHIP', namn: 'Båt' }
  ];

  const STANDARD = { version: 1, plats: null, hallplatser: [], tema: 'auto', flygRadie: 25 };
  const lyssnare = [];
  let inst = las();

  function las() {
    try {
      const s = JSON.parse(localStorage.getItem(NYCKEL) || 'null');
      if (s && typeof s === 'object') return { ...STANDARD, ...s, hallplatser: Array.isArray(s.hallplatser) ? s.hallplatser : [] };
    } catch (e) { /* trasig eller blockerad lagring */ }
    return { ...STANDARD };
  }

  function spara() {
    try { localStorage.setItem(NYCKEL, JSON.stringify(inst)); } catch (e) { /* t.ex. privat läge */ }
    lyssnare.forEach((fn) => { try { fn(hamta()); } catch (e) { console.error(e); } });
  }

  function hamta() { return JSON.parse(JSON.stringify(inst)); }
  function andra(fn) { fn(inst); spara(); }
  function plats() { return inst.plats || window.HALL_CONFIG.standardPlats; }
  function arForsta() { return !inst.plats && inst.hallplatser.length === 0; }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  // ---------- SL-hållplatser (hela listan hämtas en gång och sparas en vecka) ----------
  let sites = null;
  async function hamtaSites() {
    if (sites) return sites;
    try {
      const c = JSON.parse(localStorage.getItem(SITES_NYCKEL) || 'null');
      if (c && Date.now() - c.t < SITES_MAXALDER && Array.isArray(c.lista) && c.lista.length) { sites = c.lista; return sites; }
    } catch (e) { /* ignorera */ }
    const res = await fetch(window.HALL_CONFIG.api.slSites);
    if (!res.ok) throw new Error('SL svarade ' + res.status);
    const data = await res.json();
    sites = (Array.isArray(data) ? data : []).filter((s) => s && s.id && s.name)
      .map((s) => [s.id, s.name, s.lat || null, s.lon || null]);
    try { localStorage.setItem(SITES_NYCKEL, JSON.stringify({ t: Date.now(), lista: sites })); } catch (e) { /* för stort eller blockerat */ }
    return sites;
  }

  async function sokHallplats(text) {
    const q = norm(text).trim();
    if (q.length < 2) return [];
    const lista = await hamtaSites();
    const borjar = [], innehaller = [];
    for (const s of lista) {
      const n = norm(s[1]);
      if (n.startsWith(q)) borjar.push(s); else if (n.includes(q)) innehaller.push(s);
    }
    const sort = (a, b) => a[1].length - b[1].length || a[1].localeCompare(b[1], 'sv');
    return borjar.sort(sort).concat(innehaller.sort(sort)).slice(0, 8)
      .map((s) => ({ id: s[0], namn: s[1], lat: s[2], lon: s[3] }));
  }

  async function sokPlats(text) {
    const q = text.trim();
    if (q.length < 2) return [];
    const url = window.HALL_CONFIG.api.geokod + '?name=' + encodeURIComponent(q) + '&count=6&language=sv&format=json&countryCode=SE';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Platssökningen svarade ' + res.status);
    const data = await res.json();
    return (data.results || []).map((r) => ({
      namn: r.name,
      omrade: [r.admin2, r.admin1].filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).join(', '),
      lat: Math.round(r.latitude * 1000) / 1000,
      lon: Math.round(r.longitude * 1000) / 1000
    }));
  }

  // ---------- Panelen ----------
  const $ = (id) => document.getElementById(id);
  let dialog;

  function oppna() {
    rita();
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  }
  function stang() {
    if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
  }

  function rita() {
    $('plats-namn').textContent = inst.plats ? inst.plats.namn : window.HALL_CONFIG.standardPlats.namn + ' (standard)';
    const lista = $('hallplatser');
    if (!inst.hallplatser.length) {
      lista.innerHTML = '<li class="hjalp">Ingen hållplats vald än.</li>';
    } else {
      lista.innerHTML = inst.hallplatser.map((h, i) => `
        <li data-index="${i}">
          <div class="hp-rad"><b>${esc(h.namn)}</b>
            <button type="button" class="knapp sekundar liten-knapp" data-ta-bort="${i}" aria-label="Ta bort ${esc(h.namn)}">Ta bort</button></div>
          <div class="lagen">${LAGEN.map((l) => `<label><input type="checkbox" data-hp="${i}" value="${l.kod}"${h.lagen.includes(l.kod) ? ' checked' : ''}> ${l.namn}</label>`).join('')}</div>
        </li>`).join('');
    }
    $('hp-sok').disabled = inst.hallplatser.length >= MAX_HALLPLATSER;
    $('hp-sok').placeholder = inst.hallplatser.length >= MAX_HALLPLATSER ? 'Max tre hållplatser' : 't.ex. Karlaplan';
    document.querySelectorAll('#form-inst input[name="tema"]').forEach((r) => { r.checked = r.value === inst.tema; });
    $('flyg-radie').value = String(inst.flygRadie);
  }

  function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

  function koppla() {
    dialog = $('inst');
    $('knapp-inst').addEventListener('click', oppna);

    // Sök plats
    const platsSok = debounce(async () => {
      const ul = $('plats-traffar');
      try {
        const traffar = await sokPlats($('plats-sok').value);
        ul.innerHTML = traffar.map((t, i) => `<li><button type="button" data-plats="${i}">${esc(t.namn)} <span>${esc(t.omrade)}</span></button></li>`).join('');
        ul._traffar = traffar;
      } catch (e) {
        ul.innerHTML = '<li class="hjalp">Kunde inte söka just nu. Försök igen om en stund.</li>';
      }
    }, 300);
    $('plats-sok').addEventListener('input', platsSok);
    $('plats-traffar').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-plats]');
      if (!b) return;
      const t = $('plats-traffar')._traffar[Number(b.dataset.plats)];
      andra((s) => { s.plats = { namn: t.namn, lat: t.lat, lon: t.lon }; });
      $('plats-sok').value = '';
      $('plats-traffar').innerHTML = '';
      rita();
    });
    $('plats-gps').addEventListener('click', () => {
      if (!navigator.geolocation) return;
      $('plats-gps').textContent = 'Hämtar position…';
      navigator.geolocation.getCurrentPosition((p) => {
        andra((s) => {
          s.plats = { namn: 'Min position', lat: Math.round(p.coords.latitude * 1000) / 1000, lon: Math.round(p.coords.longitude * 1000) / 1000 };
        });
        $('plats-gps').textContent = 'Använd min position';
        rita();
      }, () => {
        $('plats-gps').textContent = 'Positionen nekades – sök i stället';
      }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 });
    });

    // Sök hållplats
    const hpSok = debounce(async () => {
      const ul = $('hp-traffar');
      const status = $('hp-status');
      status.textContent = '';
      status.classList.remove('fel');
      if ($('hp-sok').value.trim().length < 2) { ul.innerHTML = ''; return; }
      if (!sites) status.textContent = 'Hämtar SL:s hållplatser…';
      try {
        const traffar = await sokHallplats($('hp-sok').value);
        status.textContent = traffar.length ? '' : 'Ingen hållplats hittades.';
        ul.innerHTML = traffar.map((t, i) => `<li><button type="button" data-hp-traff="${i}">${esc(t.namn)} <span>Lägg till</span></button></li>`).join('');
        ul._traffar = traffar;
      } catch (e) {
        status.textContent = 'Kunde inte hämta hållplatser från SL. Försök igen om en stund.';
        status.classList.add('fel');
        ul.innerHTML = '';
      }
    }, 250);
    $('hp-sok').addEventListener('input', hpSok);
    $('hp-traffar').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-hp-traff]');
      if (!b) return;
      const t = $('hp-traffar')._traffar[Number(b.dataset.hpTraff)];
      andra((s) => {
        if (s.hallplatser.some((h) => h.id === t.id) || s.hallplatser.length >= MAX_HALLPLATSER) return;
        s.hallplatser.push({ id: t.id, namn: t.namn, lagen: LAGEN.map((l) => l.kod) });
        // Första hållplatsen blir hemmets läge om man inte valt något
        if (!s.plats && t.lat && t.lon) s.plats = { namn: t.namn, lat: Math.round(t.lat * 1000) / 1000, lon: Math.round(t.lon * 1000) / 1000 };
      });
      $('hp-sok').value = '';
      $('hp-traffar').innerHTML = '';
      rita();
    });
    $('hallplatser').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-ta-bort]');
      if (!b) return;
      andra((s) => { s.hallplatser.splice(Number(b.dataset.taBort), 1); });
      rita();
    });
    $('hallplatser').addEventListener('change', (e) => {
      const cb = e.target.closest('input[data-hp]');
      if (!cb) return;
      const i = Number(cb.dataset.hp);
      andra((s) => {
        const l = new Set(s.hallplatser[i].lagen);
        if (cb.checked) l.add(cb.value); else l.delete(cb.value);
        s.hallplatser[i].lagen = LAGEN.map((x) => x.kod).filter((k) => l.has(k));
      });
    });

    // Tema och flyg
    $('form-inst').addEventListener('change', (e) => {
      if (e.target.name === 'tema') andra((s) => { s.tema = e.target.value; });
      if (e.target.id === 'flyg-radie') andra((s) => { s.flygRadie = Number(e.target.value); });
    });
    $('form-inst').addEventListener('submit', (e) => { e.preventDefault(); stang(); });
  }

  return {
    LAGEN,
    hamta,
    plats,
    andra,
    arForsta,
    oppna,
    stang,
    koppla,
    sokHallplats,
    sokPlats,
    on: (fn) => lyssnare.push(fn)
  };
})();
