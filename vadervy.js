// Vädervyn i helskärm: klädtips, 24 timmar timme för timme och regnradar.
// Öppnas genom att trycka på väderpanelen. Stängs med krysset eller efter tre minuter.
window.HallVaderVy = (function () {
  const $ = (id) => document.getElementById(id);
  const C = () => window.HALL_CONFIG;
  const V = () => window.HallVader;

  function hh(d) { return String(d.getHours()).padStart(2, '0'); }
  function hhmm(d) { return hh(d) + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function forstStor(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function lista(ord) {
    if (ord.length < 2) return ord.join('');
    return ord.slice(0, -1).join(', ') + ' och ' + ord[ord.length - 1];
  }
  const SNO = [71, 73, 75, 77, 85, 86];
  const arSno = (kod) => SNO.indexOf(kod) >= 0;

  // ---------- Klädtips ----------
  // Bygger på hur kallt det känns de närmaste timmarna, nederbörd och om det är mörkt.
  function kladtips(v, nu) {
    const n = nu || new Date();
    const t = v.timmar || [];
    const narmast = t.slice(0, 4);
    const kanns = narmast.length
      ? Math.min.apply(null, narmast.map((x) => (x.kanns != null ? x.kanns : x.temp)))
      : (v.nu.kanns != null ? v.nu.kanns : v.nu.temp);

    const plagg = [];
    if (kanns < -10) plagg.push('Varm jacka', 'Mössa', 'Vantar', 'Halsduk');
    else if (kanns < 0) plagg.push('Mössa', 'Vantar');
    else if (kanns < 6) plagg.push('Jacka', 'Mössa');
    else if (kanns < 12) plagg.push('Jacka');
    else if (kanns < 18) plagg.push('Tunn jacka');
    else plagg.push('T-shirt');

    const skal = ['Känns som ' + V().grad(kanns)];

    // Nederbörd de kommande tolv timmarna
    const tolv = t.slice(0, 12);
    const regnNu = v.nu.nederbord > 0 || (tolv[0] && tolv[0].mm >= 0.2);
    const forsta = tolv.find((x) => x.mm >= 0.2);
    const sno = forsta ? arSno(forsta.kod) : arSno(v.nu.kod);
    if (regnNu || forsta) {
      plagg.push(sno ? 'Kängor' : 'Paraply');
      const vad = sno ? 'snö' : 'regn';
      skal.push(regnNu ? (sno ? 'snöar nu' : 'regnar nu') : vad + ' från ca ' + hh(forsta.tid));
    }

    // Reflex när det är mörkt eller blir mörkt inom tre timmar
    let reflex = false;
    const sol = v.sol;
    if (sol && sol.upp && sol.ned) {
      if (n > sol.ned) { reflex = true; skal.push('mörkt sedan ' + hhmm(sol.ned)); }
      else if (n < sol.upp) { reflex = true; skal.push('ljust från ' + hhmm(sol.upp)); }
      else if (sol.ned - n < 3 * 3600 * 1000) { reflex = true; skal.push('mörkt från ' + hhmm(sol.ned)); }
    }

    const taggar = plagg.map((p) => ({ text: p, accent: false }));
    if (reflex) taggar.push({ text: 'Reflex', accent: true });
    const rubrik = forstStor(lista(taggar.map((x, i) => (i === 0 ? x.text : x.text.toLowerCase()))));
    return { rubrik, skal: forstStor(skal.join(' · ')), taggar };
  }

  // ---------- 24 timmar ----------
  const B = 1032, H = 232, BAS = 150;
  function sammanfatta(t) {
    if (!t.length) return '';
    let lo = t[0], hi = t[0], mm = 0;
    t.forEach((x) => { if (x.temp < lo.temp) lo = x; if (x.temp > hi.temp) hi = x; mm += x.mm; });
    const regn = mm >= 0.1 ? V().tal(mm) + ' mm totalt' : 'uppehåll hela dygnet';
    return 'Lägst ' + V().grad(lo.temp) + ' kl ' + hh(lo.tid) + ' · högst ' + V().grad(hi.temp) + ' kl ' + hh(hi.tid) + ' · ' + regn;
  }

  function diagram(t) {
    if (!t.length) return '<text x="0" y="40" class="tom">Timprognosen saknas just nu.</text>';
    const steg = (B - 42) / Math.max(t.length - 1, 1);
    const X = (i) => 21 + i * steg;
    const temps = t.map((x) => x.temp);
    const lo = Math.min.apply(null, temps), hi = Math.max.apply(null, temps);
    const span = Math.max(hi - lo, 4);
    const mitt = (hi + lo) / 2;
    const Y = (v) => 84 - (v - mitt) / span * 80; // ryms mellan ca 40 och 128
    const maxMm = Math.max(2, Math.max.apply(null, t.map((x) => x.mm)));
    const RH = 70; // högsta stapeln
    let s = `<line x1="0" y1="${BAS}" x2="${B}" y2="${BAS}" class="bas"/>`;
    t.forEach((x, i) => {
      if (x.mm <= 0) return;
      const h = Math.max(2, x.mm / maxMm * RH);
      s += `<rect class="regnstapel" x="${(X(i) - steg * 0.3).toFixed(1)}" y="${(BAS - h).toFixed(1)}" width="${(steg * 0.6).toFixed(1)}" height="${h.toFixed(1)}"/>`;
    });
    s += `<polyline class="templinje" points="${t.map((x, i) => X(i).toFixed(1) + ',' + Y(x.temp).toFixed(1)).join(' ')}"/>`;
    const visa = [];
    for (let i = 0; i < t.length; i += 3) visa.push(i);
    if (visa[visa.length - 1] !== t.length - 1) visa.push(t.length - 1);
    visa.forEach((i) => {
      const x = t[i];
      if (i > 0) s += `<circle class="punkt" cx="${X(i).toFixed(1)}" cy="${Y(x.temp).toFixed(1)}" r="4"/>`;
      s += `<text class="tempetikett" x="${X(i).toFixed(1)}" y="${(Y(x.temp) - 12).toFixed(1)}">${V().grad(x.temp)}</text>`;
      s += `<text class="timme${i === 0 ? ' nu' : ''}" x="${X(i).toFixed(1)}" y="174">${i === 0 ? 'Nu' : hh(x.tid)}</text>`;
      if (x.riktning != null) s += `<g transform="translate(${X(i).toFixed(1)},198) rotate(${Math.round((x.riktning + 180) % 360)})"><path class="vindpil" d="M0,-8 L5,4 L0,1 L-5,4 Z"/></g>`;
      if (x.vind != null) s += `<text class="vindtal" x="${X(i).toFixed(1)}" y="226">${Math.round(x.vind)}</text>`;
    });
    s += `<circle class="nu-prick" cx="${X(0).toFixed(1)}" cy="${Y(t[0].temp).toFixed(1)}" r="6"/>`;
    s += `<text class="enhet" x="${B}" y="${BAS - 8}">mm/h</text>`;
    return s;
  }

  // ---------- Nederbörd de närmaste timmarna (från Open-Meteo) ----------
  function intensitet(mm) { return mm <= 0 ? 'Ingen' : mm < 1 ? 'Lätt' : mm < 4 ? 'Måttlig' : 'Kraftig'; }
  function regnlage(v, platsNamn) {
    const t = (v.timmar || []).slice(0, 12);
    const forsta = t.findIndex((x) => x.mm >= 0.2);
    const topp = t.reduce((a, x) => (x.mm > (a ? a.mm : 0) ? x : a), null);
    let rubrik, text;
    if (forsta < 0) {
      rubrik = 'Uppehåll de närmaste timmarna';
      text = 'Ingen nederbörd väntas i ' + platsNamn + ' de kommande tolv timmarna.';
    } else if (forsta === 0) {
      const slut = t.findIndex((x, i) => i > 0 && x.mm < 0.2);
      rubrik = arSno(t[0].kod) ? 'Det snöar nu' : 'Det regnar nu';
      text = slut > 0 ? 'Uppehåll väntas från ca ' + hh(t[slut].tid) + '.' : 'Nederbörden väntas hålla i sig de närmaste timmarna.';
    } else {
      rubrik = (arSno(t[forsta].kod) ? 'Snö' : 'Regn') + ' från ca ' + hh(t[forsta].tid);
      text = 'Uppehåll fram till dess. Mest nederbörd runt ' + hh(topp.tid) + '.';
    }
    return {
      rubrik, text,
      nasta: forsta < 0 ? '–' : forsta === 0 ? 'Nu' : 'kl ' + hh(t[forsta].tid),
      mest: topp && topp.mm > 0 ? V().tal(topp.mm) + ' mm/h' : '–',
      intensitet: intensitet(topp ? topp.mm : 0)
    };
  }

  // ---------- Regnradar (RainViewer, senaste två timmarna) ----------
  let karta = null, bas = null, basTema = null, ramar = [], ramIndex = 0, spelar = false, spelTimer = null, hamtadVid = 0;

  function skapaKarta() {
    const plats = window.HallInst.plats();
    karta = L.map($('regnkarta'), {
      zoomControl: false, attributionControl: true, dragging: false, scrollWheelZoom: false,
      doubleClickZoom: false, touchZoom: false, boxZoom: false, keyboard: false, tap: false
    });
    karta.attributionControl.setPrefix(false);
    karta.setView([plats.lat, plats.lon], 8);
    L.marker([plats.lat, plats.lon], {
      icon: L.divIcon({ className: 'hem-ikon', iconSize: [12, 12], iconAnchor: [6, 6], html: '<i></i>' }),
      interactive: false, keyboard: false, zIndexOffset: 1000
    }).addTo(karta);
  }

  function sattBas() {
    const tema = document.documentElement.dataset.theme;
    if (bas && basTema === tema) return;
    if (bas) karta.removeLayer(bas);
    const k = C().kartrutor;
    bas = L.tileLayer(tema === 'natt' ? k.natt : k.dag, { maxZoom: k.maxZoom, maxNativeZoom: k.maxZoom, attribution: k.attribution }).addTo(karta);
    bas.setZIndex(1);
    basTema = tema;
  }

  function visaRam(i) {
    if (!ramar.length) return;
    ramIndex = i;
    ramar.forEach((r, j) => r.lager.setOpacity(j === i ? 0.75 : 0));
    const sista = ramar.length - 1;
    $('regn-markor').style.left = (sista ? i / sista * 100 : 100) + '%';
    const r = ramar[i];
    const min = Math.round((ramar[sista].tid - r.tid) / 60000);
    $('regn-tid').textContent = i === sista ? 'Senaste bilden kl ' + hhmm(r.tid) : 'kl ' + hhmm(r.tid) + ' (−' + min + ' min)';
  }

  function spela(pa) {
    spelar = pa && ramar.length > 1;
    clearTimeout(spelTimer);
    $('regn-spela').setAttribute('aria-pressed', String(spelar));
    $('regn-spela').setAttribute('aria-label', spelar ? 'Pausa regnradarn' : 'Spela regnradarn');
    if (!spelar) return;
    const nasta = () => {
      const sista = ramIndex === ramar.length - 1;
      visaRam(sista ? 0 : ramIndex + 1);
      spelTimer = setTimeout(nasta, ramIndex === ramar.length - 1 ? 1800 : 700);
    };
    spelTimer = setTimeout(nasta, 700);
  }

  async function hamtaRadar() {
    // Ny lista högst var tionde minut – RainViewer gör en ny bild var tionde minut
    if (ramar.length && Date.now() - hamtadVid < 10 * 60 * 1000) return;
    const res = await fetch(C().api.regnradar);
    if (!res.ok) throw new Error('RainViewer svarade ' + res.status);
    const j = await res.json();
    const past = (j.radar && j.radar.past) || [];
    if (!j.host || !past.length) throw new Error('RainViewer saknar radarbilder');
    // Var tjugonde minut räcker och håller nere antalet anrop
    const valda = past.filter((f, i) => (past.length - 1 - i) % 2 === 0).slice(-7);
    ramar.forEach((r) => karta.removeLayer(r.lager));
    ramar = valda.map((f) => ({
      tid: new Date(f.time * 1000),
      lager: L.tileLayer(j.host + f.path + '/256/{z}/{x}/{y}/2/1_1.png', {
        opacity: 0, maxNativeZoom: 7, maxZoom: 12, zIndex: 5, attribution: 'Regndata <a href="https://www.rainviewer.com/">RainViewer</a>'
      }).addTo(karta)
    }));
    hamtadVid = Date.now();
  }

  async function startaRadar() {
    if (!karta) skapaKarta();
    sattBas();
    karta.invalidateSize();
    const plats = window.HallInst.plats();
    karta.setView([plats.lat, plats.lon], 8, { animate: false });
    $('regn-fel').hidden = true;
    try {
      await hamtaRadar();
      visaRam(ramar.length - 1);
      spela(true);
    } catch (e) {
      console.warn('Regnradar:', e);
      if (!ramar.length) {
        $('regn-fel').hidden = false;
        $('regn-tid').textContent = '';
        spela(false);
      }
    }
  }

  // ---------- Rita och öppna ----------
  function uppdatera(v) {
    if ($('vadervy').hidden) return;
    rita(v || V().senast());
  }

  function rita(v) {
    const plats = window.HallInst.plats();
    const nu = new Date();
    $('vadervy-plats').textContent = plats.namn + ' · ' + nu.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'short' }).replace('.', '') + ' · ' + hhmm(nu);
    if (!v) {
      $('klad-rubrik').textContent = 'Hämtar väder…';
      $('klad-skal').textContent = '';
      $('klad-taggar').innerHTML = '';
      $('timmar-diagram').innerHTML = '';
      $('timmar-sammanfattning').textContent = '';
      return;
    }
    const k = kladtips(v, nu);
    $('klad-rubrik').textContent = k.rubrik;
    $('klad-skal').textContent = k.skal;
    $('klad-taggar').innerHTML = k.taggar.map((x) => `<span class="tagg${x.accent ? ' accent' : ''}">${esc(x.text)}</span>`).join('');
    $('timmar-diagram').innerHTML = diagram(v.timmar || []);
    $('timmar-sammanfattning').textContent = sammanfatta(v.timmar || []);
    const r = regnlage(v, plats.namn);
    $('regn-rubrik').textContent = r.rubrik;
    $('regn-text').textContent = r.text;
    $('regn-nasta').textContent = r.nasta;
    $('regn-mest').textContent = r.mest;
    $('regn-intensitet').textContent = r.intensitet;
  }

  function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  let stangTimer = null;
  function vilaTimer() {
    clearTimeout(stangTimer);
    stangTimer = setTimeout(stang, 3 * 60 * 1000);
  }
  function oppna() {
    $('vadervy').hidden = false;
    rita(V().senast());
    vilaTimer();
    startaRadar();
  }
  function stang() {
    $('vadervy').hidden = true;
    clearTimeout(stangTimer);
    spela(false);
  }

  function koppla() {
    $('vader-oppna').addEventListener('click', oppna);
    $('vadervy-stang').addEventListener('click', stang);
    $('vadervy').addEventListener('pointerdown', vilaTimer);
    $('regn-spela').addEventListener('click', () => spela(!spelar));
  }

  return { koppla, oppna, stang, uppdatera, kladtips, regnlage, sammanfatta };
})();
