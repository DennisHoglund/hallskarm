// Norrsken: Kp-prognos från NOAA ihop med mörker och molnighet från väderprognosen.
// Visas i händelseraden under klockan bara när det finns en chans att se norrsken.
window.HallNorrsken = (function () {
  const $ = (id) => document.getElementById(id);
  const TIMME = 3600 * 1000;

  function hh(d) { return String(d.getHours()).padStart(2, '0'); }

  // NOAA har bytt format 2026: från tabell med rubrikrad till vanliga objekt. Klarar båda.
  function tolka(j) {
    if (!Array.isArray(j) || !j.length) return [];
    let rader = j;
    if (Array.isArray(j[0])) {
      const nycklar = j[0];
      rader = j.slice(1).map((r) => {
        const o = {};
        nycklar.forEach((k, i) => { o[k] = r[i]; });
        return o;
      });
    }
    return rader.map((r) => {
      const t = String(r.time_tag || '').replace(' ', 'T');
      const tid = new Date(/Z|[+-]\d\d:?\d\d$/.test(t) ? t : t + 'Z'); // UTC
      return { tid, kp: Number(r.kp) };
    }).filter((r) => !isNaN(r.tid) && !isNaN(r.kp)).sort((a, b) => a.tid - b.tid);
  }

  async function hamta() {
    const res = await fetch(window.HALL_CONFIG.api.kp);
    if (!res.ok) throw new Error('NOAA svarade ' + res.status);
    const block = tolka(await res.json());
    if (!block.length) throw new Error('Kp-prognosen var tom');
    return block;
  }

  // Lägsta Kp som behövs för att norrskenet ska synas på den här breddgraden
  function krav(lat) {
    const l = Math.abs(lat || 59.3);
    return l >= 64 ? 2 : l >= 62 ? 3 : l >= 60 ? 4 : l >= 57 ? 5 : l >= 54 ? 6 : 7;
  }

  function kpVid(block, t) {
    for (let i = block.length - 1; i >= 0; i--) {
      if (block[i].tid <= t && t - block[i].tid < 3 * TIMME) return block[i].kp;
    }
    return null;
  }

  // Mörkt = före soluppgång eller efter solnedgång (klockslag från dagens sol)
  function mork(t, sol) {
    if (!sol || !sol.upp || !sol.ned) return t.getHours() < 7 || t.getHours() >= 17;
    const m = t.getHours() * 60 + t.getMinutes();
    const upp = sol.upp.getHours() * 60 + sol.upp.getMinutes();
    const ned = sol.ned.getHours() * 60 + sol.ned.getMinutes();
    return m < upp - 40 || m > ned + 40; // nautisk skymning ungefär
  }

  // Returnerar null när det inte finns något att visa
  function bedom(block, v, lat, nu) {
    const n = nu || new Date();
    if (!block || !block.length || !v || !v.timmar || !v.timmar.length) return null;
    const minKp = krav(lat);
    const timmar = v.timmar.slice(0, 13).map((h, i) => {
      const t = i === 0 ? n : h.tid; // pågående timme bedöms från nu
      return { tid: h.tid, start: t, kp: kpVid(block, t), klar: h.moln != null && h.moln < 50, mork: mork(new Date(t.getTime() + (i === 0 ? 0 : 30 * 60000)), v.sol) };
    });
    const bra = timmar.map((h) => h.mork && h.klar && h.kp != null && h.kp >= minKp);
    const forsta = bra.indexOf(true);
    if (forsta < 0) return null;

    let slut = forsta;
    while (slut + 1 < bra.length && bra[slut + 1]) slut++;
    const kp = Math.max.apply(null, timmar.filter((h, i) => bra[i]).map((h) => h.kp));
    const nuTid = forsta === 0;
    const troligt = kp >= minKp + 1;
    const nar = nuTid ? 'nu' : timmar[forsta].tid.getHours() < 7 && n.getHours() >= 12 ? 'i natt' : 'i kväll';
    const tillTid = slut + 1 < timmar.length ? hh(timmar[slut + 1].tid) : null;
    const detalj = nuTid
      ? (tillTid ? 'klar himmel till ' + tillTid : 'klar himmel i natt') + ' · titta mot norr, bort från gatuljus'
      : 'klart från ca ' + hh(timmar[forsta].tid) + ' · titta mot norr';
    return { niva: troligt ? 'troligt' : 'mojligt', nu: nuTid, rubrik: (troligt ? 'Troligt ' : 'Möjligt ') + nar, detalj, kp: Math.round(kp) };
  }

  // Post till händelseraden (HallHandelser)
  function post(h) {
    if (!h) return [];
    const staplar = Array.from({ length: 9 }, (_, i) => '<i' + (i < h.kp ? ' class="pa"' : '') + '></i>').join('');
    return [{
      id: 'norrsken-' + h.niva + (h.nu ? '-nu' : ''),
      etikett: 'Norrsken', klass: '',
      rubrik: h.rubrik, detalj: h.detalj,
      hoger: '<span class="kp" aria-label="Kp-index ' + h.kp + ' av 9">Kp ' + h.kp + ' <span class="kp-staplar" aria-hidden="true">' + staplar + '</span></span>',
      blinka: h.niva === 'troligt' && h.nu
    }];
  }

  return { hamta, tolka, bedom, krav, post };
})();
