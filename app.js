// Startar Hallskärmen: timers, tema efter solen, statusrader, skärmlås och service worker.
(function () {
  const VERSION = 'v10';
  const $ = (id) => document.getElementById(id);
  const C = window.HALL_CONFIG;
  const startad = Date.now();

  let inst = window.HallInst.hamta();
  let sol = null;
  let slResultat = [];
  let vaderData = null;
  let kpBlock = null, kpHamtad = 0;
  const senast = { vader: 0, sl: 0, flyg: 0 };

  // ---------- Status ----------
  function hhmm(t) { return window.HallTid.klockslag(new Date(t)); }
  function status(id, panel, nyckel, fel) {
    const el = $(id);
    const t = senast[nyckel];
    const gammal = t && Date.now() - t > C.gammal[nyckel] * 1000;
    if (fel) {
      el.textContent = t ? 'Kunde inte uppdatera – visar data från ' + hhmm(t) : 'Kunde inte hämta just nu. Försöker igen strax.';
      el.classList.add('fel');
    } else {
      el.textContent = t ? 'Uppdaterad ' + hhmm(t) : '';
      el.classList.remove('fel');
    }
    if (panel) $(panel).classList.toggle('gammal', !!gammal);
  }

  // ---------- Tema ----------
  function valtTema(nu) {
    const n = nu || new Date();
    if (inst.tema === 'dag' || inst.tema === 'natt') return inst.tema;
    if (sol && sol.upp && sol.ned) return n < sol.upp || n > sol.ned ? 'natt' : 'dag';
    return n.getHours() < 7 || n.getHours() >= 17 ? 'natt' : 'dag';
  }
  function sattTema() {
    const t = valtTema();
    if (document.documentElement.dataset.theme !== t) {
      document.documentElement.dataset.theme = t;
      document.querySelector('meta[name="theme-color"]').setAttribute('content', t === 'natt' ? '#0E0F0C' : '#F2EFE8');
    }
    window.HallFlyg.sattTema(t);
  }

  // ---------- Hämtning ----------
  const synlig = () => document.visibilityState !== 'hidden';

  async function vader() {
    try {
      const v = await window.HallVader.hamta(window.HallInst.plats());
      senast.vader = Date.now();
      window.HallVader.rita(v);
      vaderData = v;
      sol = v.sol;
      window.HallTid.ritaSol(sol, window.HallInst.plats().lat);
      sattTema();
      norrskenRita();
      status('vader-status', 'vader', 'vader', false);
    } catch (e) {
      console.warn('Väder:', e);
      if (!sol) window.HallTid.ritaSol(null, window.HallInst.plats().lat);
      status('vader-status', 'vader', 'vader', true);
    }
  }

  async function sl() {
    if (!inst.hallplatser.length) { slResultat = []; window.HallSL.rita([]); status('sl-status', null, 'sl', false); return; }
    const res = await window.HallSL.hamta(inst.hallplatser);
    // Behåll gamla avgångar för en hållplats som inte svarade
    res.forEach((r) => {
      if (r.avgangar === null) {
        const gammal = slResultat.find((g) => g.hp.id === r.hp.id && g.avgangar);
        if (gammal) r.avgangar = gammal.avgangar;
      }
    });
    const fel = res.some((r) => r.fel);
    if (res.some((r) => !r.fel)) senast.sl = Date.now();
    const forstaGangen = !slResultat.length;
    slResultat = res;
    window.HallSL.rita(slResultat);
    if (forstaGangen) storningar(); // linjerna behövs för att välja ut störningar
    status('sl-status', 'sl', 'sl', fel);
  }

  async function storningar() {
    if (!inst.hallplatser.length) { window.HallSL.sattStorningar([]); return; }
    try {
      window.HallSL.sattStorningar(await window.HallSL.hamtaStorningar(inst.hallplatser, slResultat));
      window.HallSL.rita(slResultat);
    } catch (e) {
      // Störningsinfon är ett tillägg – avgångarna visas som vanligt, nytt försök vid nästa intervall
      console.warn('SL-störningar:', e);
    }
  }

  // ---------- Norrsken ----------
  function norrskenRita() {
    // Gammal Kp-prognos (mer än 6 timmar) används inte
    const block = kpBlock && Date.now() - kpHamtad < 6 * 3600 * 1000 ? kpBlock : null;
    const fore = document.querySelector('.skarm').classList.contains('med-handelse');
    window.HallNorrsken.rita(window.HallNorrsken.bedom(block, vaderData, window.HallInst.plats().lat));
    const efter = document.querySelector('.skarm').classList.contains('med-handelse');
    if (fore !== efter) window.HallSL.rita(slResultat); // mittdelen ändrade höjd
  }
  async function norrsken() {
    try {
      kpBlock = await window.HallNorrsken.hamta();
      kpHamtad = Date.now();
    } catch (e) {
      console.warn('Norrsken:', e);
    }
    norrskenRita();
  }

  async function flyg() {
    try {
      await window.HallFlyg.hamta();
      senast.flyg = Date.now();
      window.HallFlyg.rita();
      $('flyg').classList.remove('gammal');
    } catch (e) {
      console.warn('Flyg:', e);
      if (senast.flyg && Date.now() - senast.flyg > C.gammal.flyg * 1000) $('flyg').classList.add('gammal');
      if (!senast.flyg) {
        $('flyg-info').innerHTML = e.utanProxy
          ? '<div class="flyg-etikett">Flygdata behöver en proxy</div><div class="ingen-flyg">Flygnätverken går inte att nå direkt från Safari. Lägg in proxyns adress under Inställningar → Flyg.</div>'
          : '<div class="flyg-etikett">Flygdata saknas</div><div class="ingen-flyg">Kunde inte nå flygnätverken. Försöker igen strax.</div>';
      }
    }
  }

  // ---------- Timers ----------
  function var_(sek, fn) { setInterval(() => { if (synlig()) fn(); }, sek * 1000); }

  function nattlig() {
    const [h, m] = C.nattligOmladdning.split(':').map(Number);
    const n = new Date();
    if (n.getHours() === h && n.getMinutes() === m && Date.now() - startad > 3600 * 1000) location.reload();
  }

  // Håll skärmen tänd när sidan visas (Safari 16.4+)
  let las = null;
  async function vakna() {
    try { if ('wakeLock' in navigator && synlig() && !las) { las = await navigator.wakeLock.request('screen'); las.addEventListener('release', () => { las = null; }); } } catch (e) { las = null; }
  }

  function startaFlyg() {
    window.HallFlyg.starta(window.HallInst.plats(), inst.flygRadie || C.flyg.radieKm, valtTema());
    flyg();
  }

  // ---------- Avisering när ett plan passerar nära ----------
  let larmTimer = null;
  window.HallFlyg.onLarm(() => {
    const el = $('flyg');
    el.classList.remove('larm');
    void el.offsetWidth; // starta om animationen
    el.classList.add('larm');
    clearTimeout(larmTimer);
    larmTimer = setTimeout(() => el.classList.remove('larm'), 8000);
    const tim = new Date().getHours();
    const tyst = inst.tystNatt && (tim >= 22 || tim < 7);
    if (inst.avisering === 'pip' && !tyst && synlig()) window.HallLjud.pip();
  });

  // ---------- Inställningar ändrade ----------
  window.HallInst.on((ny) => {
    const fore = inst;
    inst = ny;
    const platsAndrad = JSON.stringify(fore.plats) !== JSON.stringify(ny.plats);
    if (platsAndrad) { sol = null; vader(); startaFlyg(); }
    if (JSON.stringify(fore.hallplatser) !== JSON.stringify(ny.hallplatser)) sl().then(storningar);
    if (fore.tema !== ny.tema) sattTema();
    if (fore.flygRadie !== ny.flygRadie && !platsAndrad) { window.HallFlyg.sattRadie(ny.flygRadie); flyg(); }
    if (fore.flygProxy !== ny.flygProxy && !platsAndrad) flyg();
  });

  // ---------- Start ----------
  function start() {
    $('version').textContent = 'Version ' + VERSION;
    window.HallInst.koppla();
    window.HallFlyg.koppla();
    window.HallVaderVy.koppla();
    $('sl-lista').addEventListener('click', (e) => { if (e.target.closest('#sl-valj')) window.HallInst.oppna(); });

    window.HallTid.ritaKlocka(new Date());
    sattTema();
    window.HallTid.hamtaNamnsdag();
    vader();
    sl();
    norrsken();
    startaFlyg();

    setInterval(() => window.HallTid.ritaKlocka(), 1000);
    setInterval(() => { window.HallSL.rita(slResultat); }, 15000);
    setInterval(() => { sattTema(); nattlig(); norrskenRita(); }, 60000);
    var_(C.intervall.vader, vader);
    var_(C.intervall.sl, sl);
    var_(C.intervall.flyg, flyg);
    var_(C.intervall.namnsdag, () => window.HallTid.hamtaNamnsdag());
    var_(C.intervall.storningar, storningar);
    var_(C.intervall.norrsken, norrsken);

    document.addEventListener('visibilitychange', () => {
      if (!synlig()) return;
      window.HallTid.ritaKlocka(new Date());
      vakna();
      if (Date.now() - senast.sl > C.intervall.sl * 1000) sl();
      if (Date.now() - senast.flyg > C.intervall.flyg * 1000) flyg();
      if (Date.now() - senast.vader > C.intervall.vader * 1000) vader();
    });
    vakna();
    document.addEventListener('click', vakna, { once: true });

    if (window.HallInst.arForsta()) setTimeout(() => window.HallInst.oppna(), 400);

    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      const hadeKontroll = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.register('sw.js').catch((e) => console.warn('SW:', e));
      navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadeKontroll) location.reload(); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
