// Elpriset: spotpris från Elpriset just nu (Nord Pool, kvartspriser) för hemmets elområde.
// En rad i dagsljuspanelen och en vy med dygnets staplar när man trycker på raden.
window.HallElpris = (function () {
  const $ = (id) => document.getElementById(id);
  const MOMS = 1.25;
  const TIMME = 3600 * 1000;

  // Ungefärliga gränser för elområdena. Kan väljas själv i inställningarna.
  function omradeFor(lat) {
    if (lat >= 65.3) return 'SE1';
    if (lat >= 61.0) return 'SE2';
    if (lat >= 56.95) return 'SE3';
    return 'SE4';
  }
  function omrade() {
    const inst = window.HallInst.hamta();
    if (inst.elomrade && inst.elomrade !== 'auto') return inst.elomrade;
    return omradeFor(window.HallInst.plats().lat);
  }

  const tva = (n) => String(n).padStart(2, '0');
  const hh = (d) => tva(d.getHours());
  function dagnyckel(d) { return d.getFullYear() + '-' + tva(d.getMonth() + 1) + '-' + tva(d.getDate()); }

  // ---------- Hämtning ----------
  const cache = {}; // "SE3:2026-11-08" -> [{ tid, slut, ore }]
  async function hamtaDag(omr, dag) {
    const nyckel = omr + ':' + dagnyckel(dag);
    if (cache[nyckel]) return cache[nyckel];
    const url = window.HALL_CONFIG.api.elpris
      .replace('{ar}', dag.getFullYear()).replace('{md}', tva(dag.getMonth() + 1) + '-' + tva(dag.getDate())).replace('{omrade}', omr);
    const res = await fetch(url);
    if (res.status === 404) return null; // morgondagens priser är inte publicerade än
    if (!res.ok) throw new Error('Elpriset svarade ' + res.status);
    const rader = (await res.json() || []).map((r) => ({
      tid: new Date(r.time_start), slut: new Date(r.time_end), ore: r.SEK_per_kWh * 100 * MOMS
    })).filter((r) => !isNaN(r.tid) && isFinite(r.ore)).sort((a, b) => a.tid - b.tid);
    if (rader.length) cache[nyckel] = rader;
    return rader;
  }

  // Hämtar i dag och, från ca 13:00, i morgon
  async function hamta(nu) {
    const n = nu || new Date();
    const omr = omrade();
    const idag = await hamtaDag(omr, n);
    let imorgon = null;
    if (n.getHours() >= 13) {
      try { imorgon = await hamtaDag(omr, new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1)); } catch (e) { imorgon = null; }
    }
    return { omrade: omr, idag: idag || [], imorgon: imorgon || [] };
  }

  // ---------- Beräkning ----------
  // Medel per timme (kvartspriser slås ihop; äldre timpriser fungerar också)
  function perTimme(rader) {
    const timmar = {};
    rader.forEach((r) => {
      const t = new Date(r.tid); t.setMinutes(0, 0, 0);
      const k = t.getTime();
      (timmar[k] = timmar[k] || { tid: t, sum: 0, n: 0 }).sum += r.ore;
      timmar[k].n++;
    });
    return Object.keys(timmar).sort().map((k) => ({ tid: timmar[k].tid, ore: timmar[k].sum / timmar[k].n }));
  }

  function berakna(d, nu) {
    const n = nu || new Date();
    if (!d || !d.idag.length) return null;
    const alla = d.idag.concat(d.imorgon);
    const aktuell = alla.find((r) => r.tid <= n && n < r.slut);
    if (!aktuell) return null;
    const idagT = perTimme(d.idag);
    const imorgonT = perTimme(d.imorgon);
    const snitt = d.idag.reduce((s, r) => s + r.ore, 0) / d.idag.length;
    const lagst = idagT.reduce((a, t) => (t.ore < a.ore ? t : a), idagT[0]);
    const hogst = idagT.reduce((a, t) => (t.ore > a.ore ? t : a), idagT[0]);

    // Billigaste tre timmarna i rad från den pågående timmen och 24 timmar framåt
    const framat = idagT.concat(imorgonT).filter((t) => t.tid.getTime() + TIMME > n && t.tid - n < 24 * TIMME);
    let billigast = null;
    for (let i = 0; i + 3 <= framat.length; i++) {
      const fonster = framat.slice(i, i + 3);
      const sammanhangande = fonster[2].tid - fonster[0].tid === 2 * TIMME;
      const medel = (fonster[0].ore + fonster[1].ore + fonster[2].ore) / 3;
      if (sammanhangande && (!billigast || medel < billigast.ore)) billigast = { fran: fonster[0].tid, till: new Date(fonster[2].tid.getTime() + TIMME), ore: medel };
    }

    const kvot = aktuell.ore / snitt;
    const niva = kvot >= 1.3 && aktuell.ore - snitt >= 15 ? 'dyrt' : kvot <= 0.7 && snitt - aktuell.ore >= 15 ? 'billigt' : 'normalt';
    return { omrade: d.omrade, nu: aktuell.ore, niva, snitt, lagst, hogst, billigast, idag: idagT, imorgon: imorgonT, kvot };
  }

  function fonsterText(b, nu) {
    if (!b) return '';
    if (b.fran <= nu) return 'billigast nu till ' + hh(b.till);
    return 'billigast ' + hh(b.fran) + '–' + hh(b.till);
  }
  const ore = (x) => String(Math.round(x));

  // ---------- Raden i dagsljuspanelen ----------
  let senaste = null;
  function rita(e, nu) {
    senaste = e;
    const n = nu || new Date();
    const knapp = $('el-rad');
    knapp.hidden = !e;
    $('dagsljus').classList.toggle('med-el', !!e);
    if (!e) return;
    $('el-nu').textContent = ore(e.nu);
    const niva = $('el-niva');
    niva.textContent = e.niva === 'dyrt' ? 'Dyrt' : e.niva === 'billigt' ? 'Billigt' : '';
    niva.className = 'el-niva ' + e.niva;
    $('el-tips').textContent = fonsterText(e.billigast, n);
    knapp.setAttribute('aria-label', 'Elpriset ' + ore(e.nu) + ' öre per kilowattimme. Tryck för dygnets priser.');
    if (!$('elvy').hidden) ritaVy(n);
  }

  // ---------- Vyn ----------
  function omdome(e) {
    if (e.niva === 'dyrt') return e.kvot >= 1.9 ? 'dubbelt så dyrt som dagens snitt.' : Math.round((e.kvot - 1) * 100) + ' % över dagens snitt.';
    if (e.niva === 'billigt') return Math.round((1 - e.kvot) * 100) + ' % under dagens snitt.';
    return 'nära dagens snitt.';
  }
  function diagram(e, n) {
    const W = 1032, H = 360, BAS = 320;
    const alla = e.idag.concat(e.imorgon);
    const antal = Math.max(alla.length, 24);
    const max = Math.max(50, Math.max.apply(null, alla.map((t) => t.ore))) * 1.08;
    const min0 = Math.min(0, Math.min.apply(null, alla.map((t) => t.ore)));
    const y = (v) => BAS - (v - min0) / (max - min0) * 270;
    const bw = W / antal;
    let s = '';
    if (e.billigast) {
      const i = alla.findIndex((t) => t.tid.getTime() === e.billigast.fran.getTime());
      if (i >= 0) s += `<rect class="el-billig" x="${(i * bw).toFixed(1)}" y="20" width="${(3 * bw).toFixed(1)}" height="${BAS - 20}"/>` +
        `<text class="el-billig-t" x="${((i + 1.5) * bw).toFixed(1)}" y="36">billigast ${hh(e.billigast.fran)}–${hh(e.billigast.till)}</text>`;
    }
    s += `<line class="el-snitt" x1="0" x2="${W}" y1="${y(e.snitt).toFixed(1)}" y2="${y(e.snitt).toFixed(1)}"/>` +
      `<text class="el-snitt-t" x="4" y="${(y(e.snitt) - 6).toFixed(1)}">snitt ${ore(e.snitt)}</text>`;
    alla.forEach((t, i) => {
      const imorgon = i >= e.idag.length;
      const pagar = t.tid <= n && n - t.tid < TIMME;
      const klass = pagar ? 'nu' : imorgon ? 'imorgon' : t.tid < n ? 'forbi' : '';
      const top = Math.min(y(t.ore), y(0)), h = Math.max(1, Math.abs(y(t.ore) - y(0)));
      s += `<rect class="el-stapel ${klass}" x="${(i * bw + bw * 0.12).toFixed(1)}" y="${top.toFixed(1)}" width="${(bw * 0.76).toFixed(1)}" height="${h.toFixed(1)}"/>`;
      if (t.tid.getHours() % 3 === 0) s += `<text class="el-timme" x="${(i * bw + bw / 2).toFixed(1)}" y="${BAS + 20}">${hh(t.tid)}</text>`;
    });
    s += `<line class="el-bas" x1="0" x2="${W}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}"/>`;
    if (e.imorgon.length) {
      const x = (e.idag.length * bw).toFixed(1);
      s += `<line class="el-bas" x1="${x}" x2="${x}" y1="44" y2="${BAS}"/><text class="el-dag-t" x="${(+x + 8).toFixed(1)}" y="58">i morgon</text>`;
    }
    return s;
  }

  function ritaVy(nu) {
    const n = nu || new Date();
    const e = senaste;
    $('elvy-omrade').textContent = (e ? e.omrade : omrade()) + ' · ' + n.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!e) {
      $('elvy-nu').textContent = '–';
      $('elvy-omdome').textContent = 'Elpriset kunde inte hämtas just nu. Försöker igen om en stund.';
      $('elvy-diagram').innerHTML = '';
      return;
    }
    $('elvy-nu').textContent = ore(e.nu);
    const b = $('elvy-omdome');
    b.textContent = '';
    const fet = document.createElement('b');
    fet.className = e.niva;
    fet.textContent = e.niva === 'dyrt' ? 'Dyrt just nu' : e.niva === 'billigt' ? 'Billigt just nu' : 'Normalt just nu';
    b.append(fet, ' – ' + omdome(e));
    if (e.billigast) {
      b.append(document.createElement('br'));
      const f = e.billigast.fran;
      const sammaDag = f.getDate() === n.getDate();
      const nar = f <= n ? 'Billigast nu till ' + hh(e.billigast.till)
        : 'Billigast ' + (sammaDag ? (f.getHours() >= 17 ? 'i kväll ' : '') : f.getHours() < 6 ? 'i natt ' : 'i morgon ') + hh(f) + '–' + hh(e.billigast.till);
      b.append(nar + ', snitt ' + ore(e.billigast.ore) + ' öre. Bra tid för disk och tvätt.');
    }
    $('elvy-snitt').textContent = ore(e.snitt);
    $('elvy-lagst').textContent = ore(e.lagst.ore) + ' kl ' + hh(e.lagst.tid);
    $('elvy-hogst').textContent = ore(e.hogst.ore) + ' kl ' + hh(e.hogst.tid);
    $('elvy-diagram').innerHTML = diagram(e, n);
    $('elvy-imorgon').textContent = e.imorgon.length ? 'i morgon' : 'i morgon (kommer ca 13:00)';
  }

  let stangTimer = null;
  function vila() { clearTimeout(stangTimer); stangTimer = setTimeout(stang, 3 * 60 * 1000); }
  function oppna() { $('elvy').hidden = false; ritaVy(); vila(); }
  function stang() { $('elvy').hidden = true; clearTimeout(stangTimer); }
  function koppla() {
    $('el-rad').addEventListener('click', oppna);
    $('elvy-stang').addEventListener('click', stang);
    $('elvy').addEventListener('pointerdown', vila);
  }

  return { omradeFor, omrade, hamta, berakna, perTimme, rita, koppla, oppna, stang };
})();
