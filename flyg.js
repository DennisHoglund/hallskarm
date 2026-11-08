// Flyg ovanför: öppna ADS-B-nätverk (adsb.lol, adsb.fi, airplanes.live) och rutter från adsbdb.
// Ritar minikartan i nedre raden och helskärmsvyn med karta eller radar.
window.HallFlyg = (function () {
  const $ = (id) => document.getElementById(id);
  const C = () => window.HALL_CONFIG;

  const TYPER = {
    A20N: 'Airbus A320neo', A21N: 'Airbus A321neo', A319: 'Airbus A319', A320: 'Airbus A320', A321: 'Airbus A321',
    A332: 'Airbus A330-200', A333: 'Airbus A330-300', A339: 'Airbus A330-900', A359: 'Airbus A350-900', A35K: 'Airbus A350-1000', A388: 'Airbus A380',
    BCS1: 'Airbus A220-100', BCS3: 'Airbus A220-300',
    B737: 'Boeing 737-700', B738: 'Boeing 737-800', B739: 'Boeing 737-900', B38M: 'Boeing 737 MAX 8', B39M: 'Boeing 737 MAX 9',
    B744: 'Boeing 747-400', B748: 'Boeing 747-8', B752: 'Boeing 757-200', B763: 'Boeing 767-300', B772: 'Boeing 777-200', B77W: 'Boeing 777-300ER',
    B788: 'Boeing 787-8', B789: 'Boeing 787-9', B78X: 'Boeing 787-10',
    AT45: 'ATR 42', AT75: 'ATR 72-500', AT76: 'ATR 72-600', DH8D: 'Dash 8-400', CRJ9: 'Bombardier CRJ900', CRJ7: 'Bombardier CRJ700',
    E170: 'Embraer 170', E75L: 'Embraer 175', E190: 'Embraer 190', E195: 'Embraer 195', E290: 'Embraer E190-E2', E295: 'Embraer E195-E2',
    SF34: 'Saab 340', SB20: 'Saab 2000', C172: 'Cessna 172', C152: 'Cessna 152', P28A: 'Piper PA-28', DA40: 'Diamond DA40', DA42: 'Diamond DA42',
    PC12: 'Pilatus PC-12', C56X: 'Cessna Citation Excel', C68A: 'Cessna Citation Latitude', GLF6: 'Gulfstream G650', GLEX: 'Bombardier Global Express',
    EC35: 'Airbus H135 (helikopter)', EC45: 'Airbus H145 (helikopter)', A139: 'AW139 (helikopter)', S76: 'Sikorsky S-76 (helikopter)', R44: 'Robinson R44 (helikopter)'
  };
  const BOLAG = {
    SAS: 'Scandinavian', NAX: 'Norwegian', NSZ: 'Norwegian', NOZ: 'Norwegian', FIN: 'Finnair', DLH: 'Lufthansa', CLH: 'Lufthansa CityLine',
    KLM: 'KLM', AFR: 'Air France', BAW: 'British Airways', CFE: 'BA CityFlyer', UAE: 'Emirates', QTR: 'Qatar Airways', ETD: 'Etihad',
    THY: 'Turkish Airlines', PGT: 'Pegasus', SXS: 'SunExpress', EZY: 'easyJet', EJU: 'easyJet', RYR: 'Ryanair', RUK: 'Ryanair', WZZ: 'Wizz Air',
    SWR: 'Swiss', AUA: 'Austrian', LOT: 'LOT', BTI: 'airBaltic', TAP: 'TAP', IBE: 'Iberia', VLG: 'Vueling', ICE: 'Icelandair', EWG: 'Eurowings',
    UAL: 'United', DAL: 'Delta', AAL: 'American', ACA: 'Air Canada', AEE: 'Aegean', ELY: 'El Al', CCA: 'Air China', CPA: 'Cathay Pacific',
    BRX: 'Braathens', BLX: 'TUI fly', VKG: 'Sunclass', NVR: 'Novair', ENT: 'Enter Air', TVS: 'Smartwings', SWN: 'West Atlantic',
    DHK: 'DHL', BCS: 'DHL', FDX: 'FedEx', UPS: 'UPS'
  };
  const PLAN = 'M0,-9 L1.8,-2.2 L9,1.9 L9,3.8 L1.8,2 L1.4,6.8 L3.8,8.6 L3.8,9.8 L0,9 L-3.8,9.8 L-3.8,8.6 L-1.4,6.8 L-1.8,2 L-9,3.8 L-9,1.9 L-1.8,-2.2 Z';

  let plats = null, radieKm = 25, tema = 'dag';
  let plan = [], vald = null, senastSedd = null, senastOk = 0, kalla = 0;
  const spar = new Map();
  const rutter = new Map();

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---------- Geometri (lokal plan projektion i km) ----------
  function xy(lat, lon) {
    return { x: (lon - plats.lon) * Math.cos(plats.lat * Math.PI / 180) * 111.32, y: (lat - plats.lat) * 110.57 };
  }
  function avstand(lat, lon) { const p = xy(lat, lon); return Math.hypot(p.x, p.y); }
  function baring(lat, lon) { const p = xy(lat, lon); return (Math.atan2(p.x, p.y) * 180 / Math.PI + 360) % 360; }

  // Närmaste passage: när och hur nära planet kommer hemmet om det håller kurs och fart
  function passage(a) {
    if (!a.fart || a.kurs == null) return null;
    const p = xy(a.lat, a.lon);
    const v = a.fart / 3600; // km/s
    const vx = Math.sin(a.kurs * Math.PI / 180) * v, vy = Math.cos(a.kurs * Math.PI / 180) * v;
    const t = -(p.x * vx + p.y * vy) / (vx * vx + vy * vy);
    if (t <= 0) return { t: 0, d: Math.hypot(p.x, p.y) };
    return { t, d: Math.hypot(p.x + vx * t, p.y + vy * t) };
  }

  // ---------- Data ----------
  function tolka(lista) {
    return (lista || []).map((a) => {
      const alt = typeof a.alt_baro === 'number' ? a.alt_baro : (typeof a.alt_geom === 'number' ? a.alt_geom : null);
      const anrop = String(a.flight || '').trim();
      return {
        hex: a.hex,
        anrop: anrop || a.r || String(a.hex || '').toUpperCase(),
        harAnrop: !!anrop,
        reg: a.r || '',
        typ: a.t || '',
        lat: a.lat, lon: a.lon,
        hojd: alt == null ? null : alt * 0.3048,
        mark: a.alt_baro === 'ground',
        fart: typeof a.gs === 'number' ? a.gs * 1.852 : null,
        kurs: typeof a.track === 'number' ? a.track : (typeof a.true_heading === 'number' ? a.true_heading : null),
        vertikal: typeof a.baro_rate === 'number' ? a.baro_rate : (typeof a.geom_rate === 'number' ? a.geom_rate : 0)
      };
    }).filter((a) => typeof a.lat === 'number' && typeof a.lon === 'number' && !a.mark);
  }

  // Flygnätverken skickar inga CORS-huvuden – därför går anropen via en proxy om en finns
  function proxy() {
    const p = (window.HallInst.hamta().flygProxy || C().api.flygProxy || '').trim();
    return p.replace(/\/+$/, '');
  }
  function viaProxy(url) {
    const p = proxy();
    return p ? p + '/?url=' + encodeURIComponent(url) : url;
  }
  async function hamtaUrl(url) {
    try {
      return await fetch(viaProxy(url));
    } catch (e) {
      // TypeError = nätverk eller CORS. Utan proxy är det nästan alltid CORS.
      const fel = new Error(proxy() ? 'Proxyn svarar inte' : 'Saknar proxy');
      fel.utanProxy = !proxy();
      throw fel;
    }
  }

  async function hamtaFranKalla(i) {
    const k = C().api.flyg[i];
    const nm = Math.ceil(radieKm / 1.852 * 1.15);
    const url = k.url.replace('{lat}', plats.lat.toFixed(4)).replace('{lon}', plats.lon.toFixed(4)).replace('{nm}', nm);
    const res = await hamtaUrl(url);
    if (!res.ok) throw new Error(k.namn + ' svarade ' + res.status);
    const j = await res.json();
    return tolka(j.ac || j.aircraft || []);
  }

  async function hamta() {
    const n = C().api.flyg.length;
    let senasteFel;
    for (let f = 0; f < n; f++) {
      const i = (kalla + f) % n;
      try {
        const lista = await hamtaFranKalla(i);
        kalla = i;
        uppdatera(lista);
        senastOk = Date.now();
        return true;
      } catch (e) {
        senasteFel = e;
        if (e.utanProxy) break; // ingen idé att prova fler källor – alla saknar CORS
      }
    }
    throw senasteFel || new Error('Ingen flygkälla svarade');
  }

  function uppdatera(lista) {
    const nu = Date.now();
    plan = lista.map((a) => ({ ...a, km: avstand(a.lat, a.lon), bar: baring(a.lat, a.lon) }))
      .filter((a) => a.km <= radieKm)
      .sort((a, b) => a.km - b.km);
    const finns = new Set(plan.map((a) => a.hex));
    for (const a of plan) {
      const s = spar.get(a.hex) || [];
      const sist = s[s.length - 1];
      if (!sist || sist[0] !== a.lat || sist[1] !== a.lon) s.push([a.lat, a.lon]);
      while (s.length > 8) s.shift();
      spar.set(a.hex, s);
    }
    for (const h of [...spar.keys()]) if (!finns.has(h)) spar.delete(h);

    // Välj planet att visa: först det som passerar rakt ovanför snarast, annars det närmaste
    const ovan = plan.map((a) => ({ a, p: passage(a) }))
      .filter((x) => x.p && x.p.d <= C().flyg.ovanforKm && x.p.t <= C().flyg.maxSekunder)
      .sort((x, y) => x.p.t - y.p.t);
    if (ovan.length) vald = { ...ovan[0].a, ovanforOm: ovan[0].p.t };
    else vald = plan[0] ? { ...plan[0], ovanforOm: null } : null;
    if (vald) senastSedd = { anrop: vald.anrop, tid: nu };
    if (vald && vald.harAnrop) hamtaRutt(vald.anrop);
  }

  async function hamtaRutt(anrop) {
    if (rutter.has(anrop)) return;
    rutter.set(anrop, null);
    try {
      const res = await hamtaUrl(C().api.rutt + encodeURIComponent(anrop));
      if (!res.ok) return;
      const j = await res.json();
      const r = j && j.response && j.response.flightroute;
      if (r && r.origin && r.destination) {
        rutter.set(anrop, {
          franKod: r.origin.iata_code || r.origin.icao_code || '', fran: r.origin.municipality || r.origin.name || '',
          tillKod: r.destination.iata_code || r.destination.icao_code || '', till: r.destination.municipality || r.destination.name || '',
          bolag: r.airline && r.airline.name ? r.airline.name : ''
        });
        rita();
      }
    } catch (e) { /* rutt är en bonus */ }
  }

  // ---------- Text ----------
  function hojdText(a) { return a.hojd == null ? '' : (Math.round(a.hojd / 100) * 100).toLocaleString('sv-SE') + ' m'; }
  function pil(a) { return a.vertikal > 256 ? '↑' : a.vertikal < -256 ? '↓' : ''; }
  function typText(a) { return TYPER[a.typ] || a.typ || ''; }
  function bolagText(a) { const r = rutter.get(a.anrop); return (r && r.bolag) || BOLAG[a.anrop.slice(0, 3)] || ''; }
  function kmText(km) { return (km < 10 ? km.toFixed(1).replace('.', ',') : Math.round(km)) + ' km'; }
  function omText(s) { return s < 60 ? 'om ' + Math.max(5, Math.round(s / 5) * 5) + ' s' : 'om ' + Math.round(s / 60) + ' min'; }
  function ruttText(a) { const r = rutter.get(a.anrop); return r ? (r.fran || r.franKod) + ' → ' + (r.till || r.tillKod) : ''; }
  function rubrikText(a) { return a.ovanforOm == null ? 'Närmast just nu' : a.ovanforOm < 20 ? 'Rakt ovanför nu' : 'Rakt ovanför ' + omText(a.ovanforOm); }
  function farg(a) { return a.hojd == null ? '#EDE6D6' : a.hojd < 2000 ? '#FF8A3D' : a.hojd < 7000 ? '#EDE6D6' : '#79B4FF'; }

  // ---------- Kartor (Leaflet) ----------
  let mini = null, stor = null, miniKm = 0;

  // Minikartan zoomar så att det valda planet alltid syns, men inte närmare än 5 km
  function zoomaMini() {
    if (!mini) return;
    const km = vald ? Math.max(5, Math.min(radieKm, vald.km * 1.25)) : Math.max(5, Math.min(radieKm, 15) * 0.6);
    if (!miniKm || Math.abs(km - miniKm) / miniKm > 0.15) { miniKm = km; centrera(mini, km); }
  }
  const lager = { mini: null, stor: null };

  function kakel(karta, vilken) {
    if (lager[vilken]) karta.removeLayer(lager[vilken]);
    lager[vilken] = L.tileLayer(tema === 'natt' ? C().kartrutor.natt : C().kartrutor.dag, {
      maxZoom: C().kartrutor.maxZoom || 18, maxNativeZoom: C().kartrutor.maxZoom || 18, attribution: C().kartrutor.attribution
    }).addTo(karta);
  }

  function ikon(a, arVald) {
    return L.divIcon({
      className: 'plan-ikon' + (arVald ? ' vald' : ''),
      iconSize: [30, 30], iconAnchor: [15, 15],
      html: `<svg width="30" height="30" viewBox="-15 -15 30 30" style="--plan-farg:${farg(a)}"><g transform="rotate(${Math.round(a.kurs || 0)})">${arVald ? '<circle class="ring" r="13"/>' : ''}<path d="${PLAN}" transform="scale(${a.hojd != null && a.hojd < 2000 ? 0.8 : 1})"/></g></svg>`
    });
  }

  function hemIkon() { return L.divIcon({ className: 'hem-ikon', iconSize: [10, 10], iconAnchor: [5, 5], html: '<i></i>' }); }

  function skapaKarta(el, interaktiv) {
    const k = L.map(el, {
      zoomControl: interaktiv, attributionControl: true, dragging: interaktiv, scrollWheelZoom: interaktiv,
      doubleClickZoom: interaktiv, touchZoom: interaktiv, boxZoom: false, keyboard: interaktiv, tap: false, zoomSnap: 0.25
    });
    k.attributionControl.setPrefix(false);
    if (interaktiv) k.zoomControl.setPosition('topright');
    k._grupp = L.layerGroup().addTo(k);
    return k;
  }

  function panelBredd() {
    const p = $('flygvy-panel');
    return p && !$('flygvy').hidden ? p.getBoundingClientRect().right : 0;
  }

  function centrera(k, km) {
    const c = L.latLng(plats.lat, plats.lon);
    const vanster = k === stor ? panelBredd() : 0;
    k.fitBounds(c.toBounds(km * 2000), { animate: false, paddingTopLeft: [vanster, 0] });
  }

  function ritaKarta(k, medEtiketter) {
    if (!k) return;
    const g = k._grupp;
    g.clearLayers();
    L.marker([plats.lat, plats.lon], { icon: hemIkon(), interactive: false, keyboard: false }).addTo(g);
    for (const a of plan) {
      const arVald = vald && a.hex === vald.hex;
      const s = spar.get(a.hex) || [];
      if (s.length > 1) {
        L.polyline(s, {
          color: farg(a), weight: arVald ? 2.5 : 1.5, opacity: arVald ? 0.6 : 0.35, interactive: false,
          className: tema === 'natt' ? 'spar' : 'spar spar-dag' + (arVald ? ' spar-vald' : '')
        }).addTo(g);
      }
      const m = L.marker([a.lat, a.lon], { icon: ikon(a, arVald), interactive: false, keyboard: false, zIndexOffset: arVald ? 1000 : 0 }).addTo(g);
      if (medEtiketter) {
        m.bindTooltip(`<b>${esc(a.anrop)}</b><span>${esc(hojdText(a))} ${pil(a)}</span>`, {
          permanent: true, direction: 'right', offset: [14, 0], className: 'plan-etikett'
        });
      }
    }
  }

  // ---------- Radar (SVG) ----------
  function ritaRadar() {
    const svg = $('radar');
    if (svg.hasAttribute('hidden')) return;
    const w = svg.clientWidth || window.innerWidth, h = svg.clientHeight || window.innerHeight;
    // Radarn placeras i ytan till höger om panelen
    const vanster = w > 900 ? panelBredd() : 0;
    const cx = vanster + (w - vanster) / 2, cy = h * 0.53;
    const R = Math.max(120, Math.min((w - vanster) / 2 - 50, h * 0.40));
    const skala = R / radieKm;
    const steg = { 5: 1, 10: 2.5, 25: 5, 50: 10 }[radieKm] || radieKm / 4;
    const antal = Math.round(radieKm / steg);
    const kmTal = (x) => String(Math.round(x * 10) / 10).replace('.', ',');
    const P = (lat, lon) => { const p = xy(lat, lon); return [cx + p.x * skala, cy - p.y * skala]; };
    let s = `<g>`;
    for (let i = 1; i <= antal; i++) s += `<circle class="ring${i === antal ? ' yttre' : ''}" cx="${cx}" cy="${cy}" r="${(R * i / antal).toFixed(1)}"/>`;
    s += `<line class="kors" x1="${cx}" y1="${cy - R}" x2="${cx}" y2="${cy + R}"/><line class="kors" x1="${cx - R}" y1="${cy}" x2="${cx + R}" y2="${cy}"/>`;
    for (let g = 0; g < 360; g += 10) {
      const r1 = R, r2 = R + (g % 30 === 0 ? 12 : 7), a = g * Math.PI / 180;
      s += `<line class="grad" x1="${(cx + Math.sin(a) * r1).toFixed(1)}" y1="${(cy - Math.cos(a) * r1).toFixed(1)}" x2="${(cx + Math.sin(a) * r2).toFixed(1)}" y2="${(cy - Math.cos(a) * r2).toFixed(1)}"/>`;
    }
    for (let i = 1; i <= antal; i++) s += `<text x="${cx + 6}" y="${(cy - R * i / antal + 14).toFixed(1)}">${kmTal(steg * i)}${i === antal ? ' km' : ''}</text>`;
    s += `<text class="vaderstreck" text-anchor="middle" x="${cx}" y="${cy - R - 20}">N</text><text class="vaderstreck" text-anchor="middle" x="${cx + R + 28}" y="${cy + 5}">Ö</text>` +
      `<text class="vaderstreck" text-anchor="middle" x="${cx}" y="${cy + R + 32}">S</text><text class="vaderstreck" text-anchor="middle" x="${cx - R - 28}" y="${cy + 5}">V</text>`;
    s += `<circle class="hem" cx="${cx}" cy="${cy}" r="4"/></g>`;
    for (const a of plan) {
      const [x, y] = P(a.lat, a.lon);
      const arVald = vald && a.hex === vald.hex;
      let g = `<g class="mal${arVald ? ' vald' : ''}" data-hex="${esc(a.hex)}">`;
      const hist = (spar.get(a.hex) || []).slice(0, -1);
      hist.forEach((p, i) => { const [hx, hy] = P(p[0], p[1]); g += `<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${(1.4 + i * 0.15).toFixed(2)}" fill-opacity="${(0.2 + i / hist.length * 0.55).toFixed(2)}"/>`; });
      if (a.fart && a.kurs != null) {
        const km = a.fart / 60, rad = a.kurs * Math.PI / 180;
        g += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + Math.sin(rad) * km * skala).toFixed(1)}" y2="${(y - Math.cos(rad) * km * skala).toFixed(1)}"/>`;
      }
      if (arVald) g += `<rect x="${(x - 12).toFixed(1)}" y="${(y - 12).toFixed(1)}" width="24" height="24"/>`;
      g += `<path d="M0,-7 L5,5 L0,2 L-5,5 Z" transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${Math.round(a.kurs || 0)})"/>`;
      g += `<text x="${(x + 16).toFixed(1)}" y="${(y - 4).toFixed(1)}">${esc(a.anrop)}</text>`;
      g += `<text class="sek" x="${(x + 16).toFixed(1)}" y="${(y + 11).toFixed(1)}">${esc(a.typ)} ${esc(hojdText(a).replace(' m', ''))}${pil(a)}</text></g>`;
      s += g;
    }
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.innerHTML = s;
    const svep = $('radar-svep');
    Object.assign(svep.style, { left: (cx - R) + 'px', top: (cy - R) + 'px', width: (2 * R) + 'px', height: (2 * R) + 'px' });
  }

  // ---------- Text i nedre raden och i helskärm ----------
  function ritaInfo() {
    $('flyg-antal').textContent = plan.length + ' plan inom ' + radieKm + ' km';
    const el = $('flyg-info');
    if (!vald) {
      const sist = senastSedd ? 'Senast: ' + esc(senastSedd.anrop) + ' för ' + Math.max(1, Math.round((Date.now() - senastSedd.tid) / 60000)) + ' min sedan' : '';
      el.innerHTML = `<div class="flyg-etikett">Lugnt i luften</div><div class="ingen-flyg">Inga plan inom ${radieKm} km just nu.</div><div class="flyg-fakta">${sist}</div>`;
      return;
    }
    const a = vald;
    const rutt = ruttText(a) || bolagText(a) || typText(a);
    el.innerHTML = `<div class="flyg-etikett">${esc(rubrikText(a))}</div>` +
      `<div class="flyg-anrop">${esc(a.anrop)}</div>` +
      `<div class="flyg-rutt">${esc(rutt)}</div>` +
      `<div class="flyg-fakta">${esc([a.typ, hojdText(a), kmText(a.km)].filter(Boolean).join(' · '))}</div>`;
  }

  function ritaPanel() {
    const el = $('flygvy-panel');
    $('flygvy-rubrik').textContent = plan.length + ' plan inom ' + radieKm + ' km';
    if (!vald) { el.innerHTML = '<div class="ingen-flyg">Inga plan i närheten just nu.</div>'; return; }
    const a = vald, r = rutter.get(a.anrop);
    el.innerHTML = `<small style="color:var(--accent)">${esc(rubrikText(a))}</small>` +
      `<div class="flyg-anrop">${esc(a.anrop)}</div>` +
      `<div class="flyg-fakta">${esc([bolagText(a), typText(a)].filter(Boolean).join(' · ') || a.reg)}</div>` +
      (r ? `<div class="rutt"><span>${esc(r.franKod)}<small>${esc(r.fran)}</small></span><i></i><span style="text-align:right">${esc(r.tillKod)}<small>${esc(r.till)}</small></span></div>` : '') +
      `<div class="nyckeltal"><div><small>Höjd</small><b>${esc(hojdText(a) || '–')}</b></div><div><small>Fart</small><b>${a.fart ? Math.round(a.fart) + ' km/h' : '–'}</b></div>` +
      `<div><small>Avstånd</small><b>${esc(kmText(a.km))}</b></div><div><small>Bäring</small><b>${Math.round(a.bar)}°</b></div></div>` +
      `<ol class="planlista">${plan.slice(0, 6).map((p) => `<li class="${p.hex === a.hex ? 'vald' : ''}"><span>${esc(p.anrop)}</span><span>${esc(kmText(p.km))}</span></li>`).join('')}</ol>`;
  }

  function rita() {
    if (!plats) return;
    ritaInfo();
    zoomaMini();
    ritaKarta(mini, false);
    if (!$('flygvy').hidden) {
      ritaPanel();
      if (!$('flygkarta').hidden) ritaKarta(stor, true); else ritaRadar();
    }
  }

  // ---------- Helskärm ----------
  let vy = 'karta', stangTimer = null;
  function vilaTimer() {
    clearTimeout(stangTimer);
    stangTimer = setTimeout(stangVy, 3 * 60 * 1000);
  }
  function oppnaVy() {
    $('flygvy').hidden = false;
    visaFlik(vy);
    vilaTimer();
  }
  function stangVy() { $('flygvy').hidden = true; clearTimeout(stangTimer); }
  function visaFlik(v) {
    vy = v;
    try { localStorage.setItem('hall-flygvy', v); } catch (e) { /* ignorera */ }
    $('flik-karta').setAttribute('aria-selected', String(v === 'karta'));
    $('flik-radar').setAttribute('aria-selected', String(v === 'radar'));
    $('flygkarta').hidden = v !== 'karta';
    $('radar').toggleAttribute('hidden', v !== 'radar'); // SVG saknar egenskapen hidden
    $('radar-svep').hidden = v !== 'radar';
    if (v === 'karta') {
      if (!stor) { stor = skapaKarta($('flygkarta'), true); kakel(stor, 'stor'); }
      stor.invalidateSize();
      centrera(stor, radieKm * 0.75);
    }
    document.querySelectorAll('.radie button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.radie) === radieKm)));
    rita();
  }

  function koppla() {
    try { vy = localStorage.getItem('hall-flygvy') === 'radar' ? 'radar' : 'karta'; } catch (e) { /* ignorera */ }
    $('flyg-oppna').addEventListener('click', oppnaVy);
    $('flygvy-stang').addEventListener('click', stangVy);
    $('flik-karta').addEventListener('click', () => visaFlik('karta'));
    $('flik-radar').addEventListener('click', () => visaFlik('radar'));
    $('flygvy').addEventListener('pointerdown', vilaTimer);
    document.querySelectorAll('.radie button').forEach((b) => b.addEventListener('click', () => {
      sattRadie(Number(b.dataset.radie));
      window.HallInst.andra((s) => { s.flygRadie = radieKm; });
    }));
    window.addEventListener('resize', () => { if (!$('flygvy').hidden && vy === 'radar') ritaRadar(); });
  }

  function sattRadie(km) {
    if (km === radieKm) return;
    radieKm = km;
    miniKm = 0;
    zoomaMini();
    if (stor && !$('flygvy').hidden) centrera(stor, radieKm * 0.75);
    document.querySelectorAll('.radie button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.radie) === radieKm)));
  }

  function starta(p, km, t) {
    plats = p; radieKm = km; tema = t;
    if (!mini && window.L) { mini = skapaKarta($('minikarta'), false); kakel(mini, 'mini'); }
    if (mini) { mini.invalidateSize(); miniKm = 0; }
    if (stor) centrera(stor, radieKm * 0.75);
    plan = []; spar.clear(); vald = null;
    zoomaMini();
    rita();
  }

  function sattTema(t) {
    if (t === tema) return;
    tema = t;
    if (mini) kakel(mini, 'mini');
    if (stor) kakel(stor, 'stor');
    rita();
  }

  return {
    koppla, starta, hamta, rita, sattTema, sattRadie, oppnaVy, stangVy,
    senastOk: () => senastOk,
    _test: { passage: (a) => passage(a), tolka }
  };
})();
