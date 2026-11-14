// SMHI:s konsekvensbaserade vädervarningar. Bara gul, orange och röd varning inom
// meteorologi visas, och bara för områden som täcker hemmet (punkt-i-polygon).
window.HallVarning = (function () {
  const NIVA = { YELLOW: { text: 'Gul varning', klass: 'varn-gul', rang: 1 }, ORANGE: { text: 'Orange varning', klass: 'varn-orange', rang: 2 }, RED: { text: 'Röd varning', klass: 'varn-rod', rang: 3 } };
  const DAG = 24 * 3600 * 1000;

  async function hamta() {
    const res = await fetch(window.HALL_CONFIG.api.varningar);
    if (!res.ok) throw new Error('SMHI svarade ' + res.status);
    const j = await res.json();
    return Array.isArray(j) ? j : [];
  }

  // ---------- Geometri ----------
  function iRing(lon, lat, ring) {
    let inne = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
      if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inne = !inne;
    }
    return inne;
  }
  function iPolygon(lon, lat, poly) {
    if (!poly.length || !iRing(lon, lat, poly[0])) return false;
    for (let h = 1; h < poly.length; h++) if (iRing(lon, lat, poly[h])) return false; // hål
    return true;
  }
  // Letar upp alla polygoner var de än ligger (FeatureCollection, Feature, Geometry …)
  function polygoner(o, ut) {
    if (!o || typeof o !== 'object') return ut;
    if (o.type === 'Polygon' && Array.isArray(o.coordinates)) ut.push(o.coordinates);
    else if (o.type === 'MultiPolygon' && Array.isArray(o.coordinates)) o.coordinates.forEach((p) => ut.push(p));
    else Object.keys(o).forEach((k) => { if (typeof o[k] === 'object') polygoner(o[k], ut); });
    return ut;
  }
  function tacker(omrade, lat, lon) {
    return polygoner({ a: omrade.area, g: omrade.geometry }, []).some((p) => iPolygon(lon, lat, p));
  }

  // ---------- Text ----------
  function hhmm(d) { return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function dag(d, nu) {
    const a = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate());
    const b = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diff = Math.round((b - a) / DAG);
    if (diff === 0) return d.getHours() >= 18 ? 'i kväll' : 'i dag';
    if (diff === 1) return d.getHours() < 6 && nu.getHours() >= 12 ? 'i natt' : 'i morgon';
    return d.toLocaleDateString('sv-SE', { weekday: 'short' }).replace('.', '');
  }
  function nar(start, slut, nu) {
    const s = start && start > nu ? 'från ' + dag(start, nu) + ' ' + hhmm(start) : 'nu';
    const t = slut ? ' till ' + dag(slut, nu) + ' ' + hhmm(slut) : '';
    return s + t;
  }

  // ---------- Urval ----------
  // Returnerar poster till händelseraden, allvarligast först
  function valj(varningar, plats, nu) {
    const n = nu || new Date();
    if (!plats) return [];
    const ut = [];
    (varningar || []).forEach((v) => {
      const met = !v.event || !v.event.mhoClassification || v.event.mhoClassification.code === 'MET';
      if (!met) return;
      (v.warningAreas || []).forEach((o) => {
        const niva = NIVA[o.warningLevel && o.warningLevel.code];
        if (!niva) return; // meddelanden och okända nivåer visas inte
        const start = o.approximateStart ? new Date(o.approximateStart) : null;
        const slut = o.approximateEnd ? new Date(o.approximateEnd) : null;
        if (slut && slut <= n) return;
        if (start && start - n > DAG) return;
        if (!tacker(o, plats.lat, plats.lon)) return;
        const typ = (o.eventDescription && o.eventDescription.sv) || (v.event && v.event.sv) || 'Vädervarning';
        const mer = (o.descriptions || []).map((d) => {
          const titel = d.title && d.title.sv, text = d.text && d.text.sv;
          return titel && text ? titel + ': ' + text : text || '';
        }).filter(Boolean).join(' ');
        ut.push({
          id: 'varning-' + (o.id || v.id) + '-' + (o.warningLevel.code),
          etikett: niva.text, klass: niva.klass, rang: niva.rang,
          rubrik: typ,
          detalj: nar(start, slut, n) + (o.areaName && o.areaName.sv ? ' · ' + o.areaName.sv : ''),
          hoger: '<small class="kalla">SMHI</small>',
          mer: mer || ((v.descriptions || []).map((d) => d.text && d.text.sv).filter(Boolean).join(' ')),
          blinka: niva.rang === 3
        });
      });
    });
    return ut.sort((a, b) => b.rang - a.rang);
  }

  return { hamta, valj, tacker, nar };
})();
