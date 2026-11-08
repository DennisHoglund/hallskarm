// Klocka, datum, veckonummer, namnsdag och dagsljus.
window.HallTid = (function () {
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');
  const DAGAR_NYCKEL = 'hall-dagar';
  let senasteMinut = -1;

  function klockslag(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }

  // ISO 8601-vecka (den som används i Sverige)
  function vecka(d) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dag = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - dag);
    const arStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil(((t - arStart) / 86400000 + 1) / 7);
  }

  function datumNyckel(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function ritaKlocka(nu) {
    const n = nu || new Date();
    if (n.getMinutes() === senasteMinut && !nu) return;
    senasteMinut = n.getMinutes();
    $('klocka').textContent = klockslag(n);
    $('veckodag').textContent = n.toLocaleDateString('sv-SE', { weekday: 'long' });
    $('datum').textContent = n.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' });
    $('vecka').textContent = 'vecka ' + vecka(n);
  }

  // ---------- Namnsdag och helgdag (Svenska Dagar-API:t) ----------
  async function hamtaNamnsdag(nu) {
    const n = nu || new Date();
    const nyckel = datumNyckel(n);
    let dag = null;
    try {
      const c = JSON.parse(localStorage.getItem(DAGAR_NYCKEL) || 'null');
      if (c && c.datum === nyckel) dag = c.dag;
    } catch (e) { /* ignorera */ }
    if (!dag) {
      try {
        const url = window.HALL_CONFIG.api.dagar + n.getFullYear() + '/' + pad(n.getMonth() + 1) + '/' + pad(n.getDate());
        const res = await fetch(url);
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        dag = (data.dagar || [])[0] || null;
        if (dag) { try { localStorage.setItem(DAGAR_NYCKEL, JSON.stringify({ datum: nyckel, dag })); } catch (e) { /* ignorera */ } }
      } catch (e) {
        $('namnsdag').textContent = '–';
        return;
      }
    }
    const namn = dag && Array.isArray(dag.namnsdag) ? dag.namnsdag : [];
    $('namnsdag').textContent = namn.length ? namn.join(', ') : '–';
    const helg = dag && (dag.helgdag || dag.flaggdag);
    $('helgdag').textContent = helg ? String(helg).toLowerCase() : '';
  }

  // ---------- Sol och dagsljus ----------
  function rad(g) { return g * Math.PI / 180; }

  // Dagslängd i timmar för en dag på året vid en viss latitud (med ljusbrytning)
  function dagslangd(dagIAret, lat) {
    const dekl = rad(23.44) * Math.sin(2 * Math.PI * (284 + dagIAret) / 365);
    const phi = rad(lat);
    const cos = (Math.sin(rad(-0.833)) - Math.sin(phi) * Math.sin(dekl)) / (Math.cos(phi) * Math.cos(dekl));
    if (cos <= -1) return 24;
    if (cos >= 1) return 0;
    return 2 * Math.acos(cos) * 180 / Math.PI / 15;
  }

  function dagIAret(d) {
    return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 86400000);
  }

  function timMin(timmar) {
    const t = Math.floor(timmar);
    const m = Math.round((timmar - t) * 60);
    return m === 60 ? (t + 1) + ' h 00' : t + ' h ' + pad(m);
  }

  // sol = { upp: Date, ned: Date, langdSek, igarSek } – från vädret. Saknas data räknas det ut.
  function ritaSol(sol, lat, nu) {
    const n = nu || new Date();
    if (sol && sol.upp && sol.ned) $('sol').textContent = klockslag(sol.upp) + ' – ' + klockslag(sol.ned);

    const idag = dagIAret(n);
    const langd = sol && sol.langdSek ? sol.langdSek / 3600 : dagslangd(idag, lat);
    const igar = sol && sol.igarSek ? sol.igarSek / 3600 : dagslangd(idag - 1, lat);
    const andring = Math.round((langd - igar) * 60);
    $('dagsljus-langd').textContent = timMin(langd);
    $('dagsljus-andring').textContent = (andring > 0 ? '+' : andring < 0 ? '−' : '±') + Math.abs(andring) + ' min/dag';

    // Kurva över året
    const max = dagslangd(172, lat), min = dagslangd(355, lat);
    const y = (h) => 56 - (h - min) / Math.max(max - min, 0.1) * 52;
    const pts = [];
    for (let d = 1; d <= 365; d += 5) pts.push((d / 365 * 200).toFixed(1) + ',' + y(dagslangd(d, lat)).toFixed(1));
    $('dagsljus-linje').setAttribute('points', pts.join(' '));
    $('dagsljus-prick').setAttribute('cx', (idag / 365 * 200).toFixed(1));
    $('dagsljus-prick').setAttribute('cy', y(langd).toFixed(1));

    // Dagar till nästa solstånd
    const ar = n.getFullYear();
    const vinter = new Date(ar, 11, 21), sommar = new Date(ar, 5, 21);
    let mal, text;
    if (n < sommar && n >= new Date(ar, 0, 1) && dagIAret(n) < 172) { mal = sommar; text = 'ljusast'; }
    else if (n < vinter) { mal = vinter; text = 'vänder'; }
    else { mal = new Date(ar + 1, 5, 21); text = 'ljusast'; }
    const dagar = Math.round((Date.UTC(mal.getFullYear(), mal.getMonth(), mal.getDate()) - Date.UTC(ar, n.getMonth(), n.getDate())) / 86400000);
    $('dagsljus-vander').textContent = dagar === 0 ? (text === 'vänder' ? 'Vintersolstånd idag' : 'Midsommar – ljusast idag')
      : (text === 'vänder' ? 'Vänder om ' + dagar + ' dagar' : 'Ljusast om ' + dagar + ' dagar');
  }

  return { ritaKlocka, hamtaNamnsdag, ritaSol, vecka, dagslangd, klockslag };
})();
