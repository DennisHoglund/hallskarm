// SL-avgångar från Trafiklabs SL Transport-API (ingen nyckel behövs).
// Varje vald hållplats hämtas för sig och filtreras på valda trafikslag.
window.HallSL = (function () {
  const $ = (id) => document.getElementById(id);
  const LAGE = { METRO: 'Tunnelbana', BUS: 'Buss', TRAIN: 'Pendeltåg', TRAM: 'Spårväg', SHIP: 'Båt', FERRY: 'Båt', TAXI: 'Anropsstyrd' };
  const RADER = { 1: 7, 2: 4, 3: 3 };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // SL ger lokal tid utan zon
  function lokal(s) {
    const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
    return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0)) : null;
  }

  async function hamtaEn(hp) {
    const url = window.HALL_CONFIG.api.slAvgangar.replace('{id}', encodeURIComponent(hp.id));
    const res = await fetch(url);
    if (!res.ok) throw new Error('SL svarade ' + res.status);
    const data = await res.json();
    const lagen = new Set(hp.lagen && hp.lagen.length ? hp.lagen : Object.keys(LAGE));
    if (lagen.has('SHIP')) lagen.add('FERRY');
    return (data.departures || [])
      .filter((d) => d.line && lagen.has(d.line.transport_mode))
      .map((d) => ({
        linje: d.line.designation || String(d.line.id || ''),
        linjeId: d.line.id,
        lage: d.line.transport_mode,
        grupp: d.line.group_of_lines || '',
        mal: d.destination || '',
        lageplats: d.stop_point && d.stop_point.designation ? d.stop_point.designation : '',
        tid: lokal(d.expected || d.scheduled),
        planerad: lokal(d.scheduled),
        visning: d.display || '',
        installd: d.state === 'CANCELLED' || (d.journey && d.journey.state === 'CANCELLED')
      }))
      .filter((d) => d.tid)
      .sort((a, b) => a.tid - b.tid);
  }

  async function hamta(hallplatser) {
    return Promise.all(hallplatser.map(async (hp) => {
      try { return { hp, avgangar: await hamtaEn(hp), fel: null }; } catch (e) { return { hp, avgangar: null, fel: e.message || String(e) }; }
    }));
  }

  // ---------- Störningar ----------
  // Hämtar störningar för valda trafikslag och behåller dem som rör linjerna i avgångarna
  // eller hållplatserna. Hissar och rulltrappor tas bort – de är för många och sällan viktiga här.
  const BORT = /hiss|rulltrapp|ramp ur funktion/i;

  async function hamtaStorningar(hallplatser, resultat) {
    const lagen = new Set();
    hallplatser.forEach((hp) => (hp.lagen && hp.lagen.length ? hp.lagen : Object.keys(LAGE)).forEach((l) => lagen.add(l)));
    if (lagen.has('SHIP')) lagen.add('FERRY');
    const q = Array.from(lagen).map((l) => 'transport_mode=' + encodeURIComponent(l)).join('&');
    const res = await fetch(window.HALL_CONFIG.api.slStorningar + '?future=false' + (q ? '&' + q : ''));
    if (!res.ok) throw new Error('SL-störningar svarade ' + res.status);
    const data = await res.json();
    const linjer = new Set();
    (resultat || []).forEach((r) => (r.avgangar || []).forEach((d) => { if (d.linjeId != null) linjer.add(String(d.linjeId)); }));
    const namn = hallplatser.map((hp) => String(hp.namn || '').toLowerCase());
    const nu = Date.now();
    return (Array.isArray(data) ? data : [])
      .map((m) => {
        const v = (m.message_variants || []).find((x) => x.language === 'sv') || (m.message_variants || [])[0] || {};
        const scope = m.scope || {};
        const pub = m.publish || {};
        return {
          id: m.deviation_case_id || m.id || v.header,
          rubrik: String(v.header || '').trim(),
          linjer: (scope.lines || []).map((l) => ({ id: String(l.id), linje: l.designation || String(l.id), lage: l.transport_mode })),
          hallplatser: (scope.stop_areas || []).map((a) => String(a.name || '').toLowerCase()),
          fran: lokal(pub.from), till: lokal(pub.upto),
          viktig: (m.priority && m.priority.importance_level) || 0
        };
      })
      .filter((m) => m.rubrik && !BORT.test(m.rubrik))
      .filter((m) => !m.fran || m.fran <= nu)
      .filter((m) => m.linjer.some((l) => linjer.has(l.id)) || m.hallplatser.some((h) => namn.indexOf(h) >= 0))
      .sort((a, b) => b.viktig - a.viktig);
  }

  let storningar = [], storningsIndex = 0, storningsTimer = null;
  function sattStorningar(lista) {
    storningar = lista || [];
    if (storningsIndex >= storningar.length) storningsIndex = 0;
    clearInterval(storningsTimer);
    if (storningar.length > 1) storningsTimer = setInterval(() => { storningsIndex = (storningsIndex + 1) % storningar.length; ritaStorning(); }, 8000);
  }

  function ritaStorning() {
    const el = $('sl-storning');
    const m = storningar[storningsIndex];
    el.hidden = !m;
    if (!m) return;
    $('sl-storning-text').textContent = m.rubrik;
    $('sl-storning-text').title = m.rubrik;
    const n = new Date();
    const till = m.till && m.till > n && m.till - n < 24 * 3600 * 1000 ? 'till ca ' + String(m.till.getHours()).padStart(2, '0') + ':' + String(m.till.getMinutes()).padStart(2, '0') : '';
    $('sl-storning-till').textContent = till;
    $('sl-storning-antal').textContent = storningar.length > 1 ? (storningsIndex + 1) + '/' + storningar.length : '';
  }

  function stord(d) {
    return storningar.some((m) => m.linjer.some((l) => l.id === String(d.linjeId)));
  }

  function minuter(tid, nu) {
    const diff = (tid - nu) / 60000;
    if (diff < 1) return { text: 'Nu', nu: true };
    if (diff < 60) return { text: Math.floor(diff) + ' min', nu: false };
    return { text: String(tid.getHours()).padStart(2, '0') + ':' + String(tid.getMinutes()).padStart(2, '0'), nu: false };
  }

  function metroKlass(grupp) {
    const g = grupp.toLowerCase();
    if (g.includes('grön')) return ' gron';
    if (g.includes('röd')) return ' rod';
    if (g.includes('blå')) return ' bla';
    return '';
  }

  function underrad(d) {
    const lage = LAGE[d.lage] || d.lage;
    if (!d.lageplats) return lage;
    return lage + (d.lage === 'METRO' || d.lage === 'TRAIN' ? ' · spår ' : ' · läge ') + d.lageplats;
  }

  function rita(resultat, nu) {
    const n = nu || new Date();
    const lista = $('sl-lista');
    if (!resultat.length) {
      lista.innerHTML = '<div class="tom"><span>Välj vilka hållplatser som ska visas.</span>' +
        '<button type="button" class="knapp" id="sl-valj">Välj hållplats</button></div>';
      $('sl-storning').hidden = true;
      return;
    }
    ritaStorning();
    const max = RADER[resultat.length] || 3;
    lista.innerHTML = resultat.map((r) => {
      let rader;
      if (r.avgangar === null) rader = '<div class="tom">Kunde inte hämta avgångar.</div>';
      else {
        const kommande = r.avgangar.filter((d) => d.tid - n > -60000).slice(0, max);
        rader = kommande.length ? kommande.map((d) => {
          const m = minuter(d.tid, n);
          const klass = d.lage === 'METRO' ? 'linje metro' + metroKlass(d.grupp) : 'linje';
          return `<div class="avg" data-lage="${esc(d.lage)}"><div class="${klass}">${esc(d.linje)}</div>` +
            `<div class="mal"><b>${esc(d.mal)}${stord(d) ? '<span class="storning-tagg">Störning</span>' : ''}</b><span>${esc(underrad(d))}</span></div>` +
            `<div class="min${d.installd ? ' inst' : m.nu ? ' nu' : ''}">${d.installd ? 'Inställd' : m.text}</div></div>`;
        }).join('') : '<div class="tom">Inga avgångar den närmaste timmen.</div>';
      }
      return `<div class="hp" data-hp="${esc(r.hp.id)}"><div class="hp-huvud"><span class="hp-namn">Avgångar · ${esc(r.hp.namn)}</span></div>${rader}</div>`;
    }).join('');
    anpassa(lista);
  }

  // Ta bort rader som inte får plats (mindre skärmar, Safari med adressfält) – aldrig halva rader
  function anpassa(lista) {
    let varv = 0;
    while (lista.scrollHeight > lista.clientHeight + 1 && varv++ < 30) {
      const grupper = Array.from(lista.querySelectorAll('.hp')).filter((g) => g.querySelectorAll('.avg').length > 1);
      if (!grupper.length) break;
      // Ta från den hållplats som har flest rader kvar
      grupper.sort((a, b) => b.querySelectorAll('.avg').length - a.querySelectorAll('.avg').length);
      const rader = grupper[0].querySelectorAll('.avg');
      rader[rader.length - 1].remove();
    }
  }

  return { hamta, rita, minuter, LAGE, hamtaStorningar, sattStorningar };
})();
