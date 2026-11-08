// Väder från Open-Meteo: nuläge och fem dagar framåt. Ger också sol upp/ned och dagslängd.
window.HallVader = (function () {
  const $ = (id) => document.getElementById(id);

  const KODER = {
    0: 'Klart', 1: 'Mestadels klart', 2: 'Halvklart', 3: 'Mulet',
    45: 'Dimma', 48: 'Rimfrost och dimma',
    51: 'Lätt duggregn', 53: 'Duggregn', 55: 'Tätt duggregn', 56: 'Underkylt duggregn', 57: 'Underkylt duggregn',
    61: 'Lätt regn', 63: 'Regn', 65: 'Kraftigt regn', 66: 'Underkylt regn', 67: 'Underkylt regn',
    71: 'Lätt snöfall', 73: 'Snöfall', 75: 'Kraftigt snöfall', 77: 'Snökorn',
    80: 'Regnskurar', 81: 'Regnskurar', 82: 'Kraftiga skurar', 85: 'Snöbyar', 86: 'Kraftiga snöbyar',
    95: 'Åska', 96: 'Åska med hagel', 99: 'Åska med hagel'
  };
  const STRECK = ['N', 'NÖ', 'Ö', 'SÖ', 'S', 'SV', 'V', 'NV'];

  function beskriv(kod) { return KODER[kod] || 'Okänt väder'; }
  function vindriktning(grader) { return STRECK[Math.round(((grader % 360) + 360) % 360 / 45) % 8]; }
  function grad(t) { return String(Math.round(t)).replace('-', '−') + '°'; }
  function tal(x) { return String(Math.round(x * 10) / 10).replace('.', ','); }

  // Open-Meteo ger lokal tid utan zon ("2026-11-08T07:39") – tolkas som lokal tid
  function lokal(s) {
    const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0));
  }

  async function hamta(plats) {
    const p = new URLSearchParams({
      latitude: plats.lat, longitude: plats.lon,
      current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,precipitation,relative_humidity_2m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration',
      past_days: '1', forecast_days: '7', timezone: 'Europe/Stockholm', wind_speed_unit: 'ms'
    });
    const res = await fetch(window.HALL_CONFIG.api.vader + '?' + p.toString());
    if (!res.ok) throw new Error('Open-Meteo svarade ' + res.status);
    return tolka(await res.json());
  }

  function tolka(j) {
    const c = j.current || {};
    const d = j.daily || {};
    const tider = d.time || [];
    // past_days=1 → index 0 är igår, 1 är idag
    const idag = Math.min(1, tider.length - 1);
    const dagar = [];
    for (let i = idag + 1; i < tider.length && dagar.length < 5; i++) {
      dagar.push({ datum: lokal(tider[i]), kod: d.weather_code[i], lag: d.temperature_2m_min[i], hog: d.temperature_2m_max[i] });
    }
    return {
      nu: {
        temp: c.temperature_2m, kanns: c.apparent_temperature, kod: c.weather_code,
        vind: c.wind_speed_10m, byar: c.wind_gusts_10m, riktning: c.wind_direction_10m,
        nederbord: c.precipitation, fukt: c.relative_humidity_2m
      },
      dagar,
      sol: tider.length ? {
        upp: lokal(d.sunrise[idag]), ned: lokal(d.sunset[idag]),
        langdSek: d.daylight_duration ? d.daylight_duration[idag] : null,
        igarSek: d.daylight_duration && idag > 0 ? d.daylight_duration[idag - 1] : null
      } : null
    };
  }

  function rita(v) {
    const n = v.nu;
    $('vader-temp').textContent = n.temp == null ? '–' : grad(n.temp);
    $('vader-text').textContent = beskriv(n.kod);
    const vind = n.vind == null ? '' : vindriktning(n.riktning) + ' ' + Math.round(n.vind) + ' m/s' + (n.byar ? ', byar ' + Math.round(n.byar) : '');
    $('vader-detalj').textContent = ['Känns som ' + grad(n.kanns), vind].filter(Boolean).join(' · ');
    $('vader-detalj2').textContent = n.nederbord > 0 ? 'Nederbörd ' + tal(n.nederbord) + ' mm just nu' : 'Uppehåll just nu';

    const alla = v.dagar.flatMap((d) => [d.lag, d.hog]);
    const lo = Math.min(...alla) - 1, hi = Math.max(...alla) + 1, span = Math.max(hi - lo, 1);
    $('prognos').innerHTML = v.dagar.map((d) => {
      const vd = d.datum.toLocaleDateString('sv-SE', { weekday: 'short' }).replace('.', '');
      const left = (d.lag - lo) / span * 100, w = Math.max((d.hog - d.lag) / span * 100, 2);
      return `<li><span class="dag">${vd}</span><span class="besk">${beskriv(d.kod)}</span>` +
        `<span class="lag">${grad(d.lag)}</span><span class="spann"><i style="left:${left.toFixed(1)}%;width:${w.toFixed(1)}%"></i></span>` +
        `<span class="hog">${grad(d.hog)}</span></li>`;
    }).join('');
  }

  return { hamta, tolka, rita, beskriv, vindriktning };
})();
