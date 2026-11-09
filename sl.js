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
      return;
    }
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
            `<div class="mal"><b>${esc(d.mal)}</b><span>${esc(underrad(d))}</span></div>` +
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

  return { hamta, rita, minuter, LAGE };
})();
