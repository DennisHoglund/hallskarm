// Mockar allt externt så att testerna är snabba, stabila och oberoende av riktig trafik:
// Leaflet från CDN, typsnitt, kartrutor, Open-Meteo, SL, flygnätverken, adsbdb och Svenska Dagar.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TILE = fs.readFileSync(path.join(__dirname, 'data', 'tile.png'));

// Fast tid i alla tester: söndag 8 november 2026 kl 08:42 (svensk tid)
const NU = '2026-11-08T08:42:00+01:00';
let NU_LOKAL = lokalDel(NU);

function lokalDel(iso) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  return { ar: +m[1], man: +m[2], dag: +m[3], tim: +m[4], min: +m[5] };
}

const GARDET = { id: 9220, name: 'Gärdet', lat: 59.3467, lon: 18.0989 };
const KARLAPLAN = { id: 9221, name: 'Karlaplan', lat: 59.3389, lon: 18.0904 };
const SITES = [
  GARDET, KARLAPLAN,
  { id: 1002, name: 'Centralen', lat: 59.3313, lon: 18.0597 },
  { id: 9192, name: 'Slussen', lat: 59.3195, lon: 18.0721 },
  { id: 1450, name: 'Gärdesgatan', lat: 59.35, lon: 18.1 },
  { id: 9001, name: 'T-Centralen', lat: 59.3313, lon: 18.0597 }
];

// Lokal tid som SL skickar den: "2026-11-08T08:45:00" (minuter från NU)
function slTid(minuter) {
  const d = new Date(Date.UTC(NU_LOKAL.ar, NU_LOKAL.man - 1, NU_LOKAL.dag, NU_LOKAL.tim, NU_LOKAL.min + minuter));
  const p = (n) => String(n).padStart(2, '0');
  return d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate()) + 'T' + p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':00';
}

function avgang(min, linje, mode, mal, grupp, lage) {
  return {
    destination: mal, direction_code: 1, state: 'EXPECTED', display: min < 1 ? 'Nu' : min + ' min',
    scheduled: slTid(min), expected: slTid(min),
    journey: { id: Math.round(min * 1000) + Number(linje), state: 'EXPECTED' },
    stop_area: { id: 1, name: 'Gärdet', type: mode === 'METRO' ? 'METROSTN' : 'BUSTERM' },
    stop_point: { id: 2, name: 'Gärdet', designation: lage },
    line: { id: Number(linje), designation: linje, transport_mode: mode, group_of_lines: grupp },
    deviations: []
  };
}

function avgangar() {
  return {
  [GARDET.id]: [
    avgang(6, '13', 'METRO', 'Norsborg', 'Tunnelbanans röda linje', '2'),
    avgang(0.5, '13', 'METRO', 'Ropsten', 'Tunnelbanans röda linje', '1'),
    avgang(3, '72', 'BUS', 'Ropsten', '', 'A'),
    avgang(9, '1', 'BUS', 'Stora Essingen', 'Blåbuss', 'B'),
    avgang(12, '13', 'METRO', 'Ropsten', 'Tunnelbanans röda linje', '1'),
    avgang(15, '72', 'BUS', 'Gullmarsplan', '', 'A'),
    avgang(18, '13', 'METRO', 'Norsborg', 'Tunnelbanans röda linje', '2'),
    avgang(75, '13', 'METRO', 'Norsborg', 'Tunnelbanans röda linje', '2')
  ],
  [KARLAPLAN.id]: [
    avgang(2, '14', 'METRO', 'Fruängen', 'Tunnelbanans röda linje', '1'),
    avgang(4, '4', 'BUS', 'Radiohuset', 'Blåbuss', 'C'),
    avgang(7, '14', 'METRO', 'Mörby centrum', 'Tunnelbanans röda linje', '2')
  ]
  };
}

function vader() {
  const dagar = ['2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14'];
  return {
    current: {
      temperature_2m: 4.2, apparent_temperature: 1.1, weather_code: 51, wind_speed_10m: 5.2, wind_gusts_10m: 9.1,
      wind_direction_10m: 225, precipitation: 0.4, relative_humidity_2m: 88
    },
    daily: {
      time: dagar,
      weather_code: [3, 51, 53, 0, 2, 61, 3, 3],
      temperature_2m_max: [6, 5, 5, 3, 2, 4, 6, 5],
      temperature_2m_min: [2, 1, 1, -1, -2, 1, 3, 2],
      sunrise: dagar.map((d) => d + 'T07:39'),
      sunset: dagar.map((d) => d + 'T15:41'),
      daylight_duration: [29160, 28920, 28680, 28440, 28200, 27960, 27720, 27480]
    }
  };
}

// Flygplan runt Gärdet (km öster, km norr) → lat/lon
function runt(plats, ostKm, norrKm) {
  return { lat: plats.lat + norrKm / 110.57, lon: plats.lon + ostKm / (111.32 * Math.cos(plats.lat * Math.PI / 180)) };
}
function flygplan(plats) {
  return [
    { hex: '4ac9e1', flight: 'SAS1423 ', r: 'SE-ROM', t: 'A20N', alt_baro: 32150, gs: 453, track: 222, baro_rate: -640, ...runt(plats, 2.0, 2.2) },
    { hex: '47c2a8', flight: 'NAX4CU  ', r: 'LN-FGB', t: 'B38M', alt_baro: 13800, gs: 290, track: 330, baro_rate: 1800, ...runt(plats, -6, 10) },
    { hex: '461f4c', flight: 'FIN6TL  ', r: 'OH-ATK', t: 'AT76', alt_baro: 6900, gs: 220, track: 300, baro_rate: -900, ...runt(plats, 12, -5) },
    { hex: '4ab0c1', flight: '', r: 'SE-MKP', t: 'C172', alt_baro: 2000, gs: 95, track: 92, baro_rate: 0, ...runt(plats, -2.5, -2) },
    { hex: '4a0001', flight: 'SAS100  ', r: 'SE-RES', t: 'A20N', alt_baro: 'ground', gs: 0, track: 10, ...runt(plats, 1, 1) },
    { hex: '4b0002', flight: 'DLH2VA  ', r: 'D-AISZ', t: 'A321', alt_baro: 20000, gs: 400, track: 18, baro_rate: -1000, ...runt(plats, -40, -40) }
  ];
}

const CDN = [
  [/cdnjs\.cloudflare\.com\/ajax\/libs\/leaflet\/[\d.]+\/leaflet(\.min)?\.js/, 'node_modules/leaflet/dist/leaflet.js', 'application/javascript'],
  [/cdnjs\.cloudflare\.com\/ajax\/libs\/leaflet\/[\d.]+\/leaflet(\.min)?\.css/, 'node_modules/leaflet/dist/leaflet.css', 'text/css']
];

function cors() { return { 'access-control-allow-origin': '*' }; }
function json(route, body, status = 200) {
  return route.fulfill({ status, headers: cors(), contentType: 'application/json', body: JSON.stringify(body) });
}

// Installerar mockar och fast tid. Returnerar ett "api" för att styra fel och se anrop.
async function mocka(page, { tid = NU, flyg = null } = {}) {
  NU_LOKAL = lokalDel(tid);
  const api = {
    anrop: [],
    nere: { vader: false, sl: false, slSites: false, flyg: [], rutt: false, dagar: false },
    flygplan: flyg,
    vaderData: vader(),
    avgangar: avgangar()
  };
  const logga = (typ, url) => api.anrop.push({ typ, url });

  await page.clock.setFixedTime(new Date(tid));

  await page.route(/cdnjs\.cloudflare\.com/, (route) => {
    const url = route.request().url();
    const hit = CDN.find(([re]) => re.test(url));
    if (!hit) return route.abort();
    return route.fulfill({ path: path.join(ROOT, hit[1]), contentType: hit[2] });
  });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.fulfill({ body: '', contentType: 'text/css' }));
  await page.route(/basemaps\.cartocdn\.com/, (route) => route.fulfill({ body: TILE, contentType: 'image/png' }));

  await page.route(/api\.open-meteo\.com/, (route) => {
    logga('vader', route.request().url());
    if (api.nere.vader) return route.fulfill({ status: 503, headers: cors(), body: 'nere' });
    return json(route, api.vaderData);
  });
  await page.route(/geocoding-api\.open-meteo\.com/, (route) => {
    logga('geokod', route.request().url());
    return json(route, { results: [
      { name: 'Hjorthagen', latitude: 59.3529, longitude: 18.0986, admin1: 'Stockholm', admin2: 'Stockholms kommun' },
      { name: 'Hjortkvarn', latitude: 58.9, longitude: 15.43, admin1: 'Örebro', admin2: 'Hallsbergs kommun' }
    ] });
  });

  await page.route(/transport\.integration\.sl\.se\/v1\/sites\?/, (route) => {
    logga('slSites', route.request().url());
    if (api.nere.slSites) return route.fulfill({ status: 503, headers: cors(), body: 'nere' });
    return json(route, SITES);
  });
  await page.route(/transport\.integration\.sl\.se\/v1\/sites\/\d+\/departures/, (route) => {
    const url = route.request().url();
    logga('sl', url);
    if (api.nere.sl) return route.fulfill({ status: 503, headers: cors(), body: 'nere' });
    const id = Number(url.match(/sites\/(\d+)\//)[1]);
    return json(route, { departures: api.avgangar[id] || [], stop_deviations: [] });
  });

  const flygRoute = (namn) => (route) => {
    logga('flyg:' + namn, route.request().url());
    if (api.nere.flyg.includes(namn)) return route.fulfill({ status: 503, headers: cors(), body: 'nere' });
    const m = route.request().url().match(/(?:lat\/|point\/)([\d.]+)(?:\/lon)?\/([\d.]+)/);
    const plats = m ? { lat: Number(m[1]), lon: Number(m[2]) } : GARDET;
    const lista = api.flygplan || flygplan(plats);
    return json(route, namn === 'adsb.fi' ? { aircraft: lista } : { ac: lista, now: Date.now() });
  };
  await page.route(/api\.adsb\.lol/, flygRoute('adsb.lol'));
  await page.route(/opendata\.adsb\.fi/, flygRoute('adsb.fi'));
  await page.route(/api\.airplanes\.live/, flygRoute('airplanes.live'));

  await page.route(/api\.adsbdb\.com/, (route) => {
    logga('rutt', route.request().url());
    if (api.nere.rutt) return route.fulfill({ status: 503, headers: cors(), body: 'nere' });
    if (route.request().url().includes('SAS1423')) {
      return json(route, { response: { flightroute: {
        callsign: 'SAS1423', airline: { name: 'Scandinavian Airlines' },
        origin: { iata_code: 'ARN', icao_code: 'ESSA', municipality: 'Stockholm', name: 'Stockholm-Arlanda Airport' },
        destination: { iata_code: 'NCE', icao_code: 'LFMN', municipality: 'Nice', name: "Nice-Côte d'Azur Airport" }
      } } });
    }
    return json(route, { response: 'unknown callsign' }, 404);
  });

  await page.route(/sholiday\.faboul\.se/, (route) => {
    logga('dagar', route.request().url());
    if (api.nere.dagar) return route.fulfill({ status: 503, headers: cors(), body: 'nere' });
    return json(route, { dagar: [{ datum: '2026-11-08', veckodag: 'Söndag', vecka: '45', namnsdag: ['Eskil'], flaggdag: '', 'röd dag': 'Ja' }] });
  });

  return api;
}

// Sparar inställningar innan sidan laddas (som om man redan valt i panelen)
async function installningar(page, inst) {
  // Bara vid första laddningen, så att ändringar som görs i testet finns kvar efter omladdning
  await page.addInitScript((v) => {
    try {
      if (!sessionStorage.getItem('hall-test-inst')) { localStorage.setItem('hall-installningar', v); sessionStorage.setItem('hall-test-inst', '1'); }
    } catch (e) { /* */ }
  },
    JSON.stringify({ version: 1, tema: 'auto', flygRadie: 25, plats: null, hallplatser: [], ...inst }));
}

const STANDARD_INST = {
  plats: { namn: 'Gärdet', lat: GARDET.lat, lon: GARDET.lon },
  hallplatser: [{ id: GARDET.id, namn: 'Gärdet', lagen: ['METRO', 'BUS', 'TRAIN', 'TRAM', 'SHIP'] }]
};

module.exports = { mocka, installningar, STANDARD_INST, GARDET, KARLAPLAN, NU };
