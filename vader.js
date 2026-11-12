// Väder från Open-Meteo: nuläge, fem dagar framåt och 24 timmar timme för timme.
// Ger också sol upp/ned och dagslängd. Vädervyn i helskärm ligger i vadervy.js.
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
      hourly: 'temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
      past_days: '1', forecast_days: '7', timezone: 'Europe/Stockholm', wind_speed_unit: 'ms'
    });
    const res = await fetch(window.HALL_CONFIG.api.vader + '?' + p.toString());
    if (!res.ok) throw new Error('Open-Meteo svarade ' + res.status);
    return tolka(await res.json());
  }

  // De kommande 24 timmarna från och med den timme som pågår nu
  function timmar(h, nu) {
    const tider = (h && h.time) || [];
    const n = nu || new Date();
    let start = -1;
    for (let i = 0; i < tider.length; i++) {
      const t = lokal(tider[i]);
      if (t && t <= n && n - t < 3600 * 1000) { start = i; break; }
    }
    if (start < 0) return [];
    const ut = [];
    for (let i = start; i < tider.length && ut.length < 24; i++) {
      ut.push({
        tid: lokal(tider[i]), temp: h.temperature_2m[i], kanns: h.apparent_temperature ? h.apparent_temperature[i] : null,
        mm: h.precipitation ? h.precipitation[i] || 0 : 0, kod: h.weather_code ? h.weather_code[i] : null,
        vind: h.wind_speed_10m ? h.wind_speed_10m[i] : null, byar: h.wind_gusts_10m ? h.wind_gusts_10m[i] : null,
        riktning: h.wind_direction_10m ? h.wind_direction_10m[i] : null
      });
    }
    return ut;
  }

  function tolka(j, nu) {
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
      timmar: timmar(j.hourly, nu),
      sol: tider.length ? {
        upp: lokal(d.sunrise[idag]), ned: lokal(d.sunset[idag]),
        langdSek: d.daylight_duration ? d.daylight_duration[idag] : null,
        igarSek: d.daylight_duration && idag > 0 ? d.daylight_duration[idag - 1] : null
      } : null
    };
  }

  let senaste = null;
  function rita(v) {
    senaste = v;
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
    if (window.HallVaderVy) window.HallVaderVy.uppdatera(v);
  }

  return { hamta, tolka, rita, beskriv, vindriktning, grad, tal, lokal, senast: () => senaste };
})();
