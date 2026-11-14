// Händelseraden under klockan. Visas bara när någon källa har något aktuellt
// (SMHI-varningar, norrsken). Flera händelser visas en i taget, varningar först.
window.HallHandelser = (function () {
  const $ = (id) => document.getElementById(id);
  const ORDNING = ['varning', 'norrsken'];
  const kallor = {};
  let lista = [], index = 0, bytTimer = null, utfallTimer = null;
  const blinkat = new Set();
  let onAndrad = () => {};

  // poster: [{ id, etikett, klass, rubrik, detalj, hoger (säker HTML), mer, blinka }]
  function satt(kalla, poster) {
    kallor[kalla] = poster || [];
    const fore = lista.length > 0;
    const forraId = lista[index] && lista[index].id;
    lista = [];
    ORDNING.forEach((k) => (kallor[k] || []).forEach((p) => lista.push(p)));
    const ny = lista.findIndex((p) => p.id === forraId);
    index = ny >= 0 ? ny : 0;
    clearInterval(bytTimer);
    if (lista.length > 1) bytTimer = setInterval(() => { if (!$('handelse').classList.contains('utfalld')) { index = (index + 1) % lista.length; rita(); } }, 8000);
    const synligAndrad = rita();
    if (synligAndrad || fore !== lista.length > 0) onAndrad();
  }

  function rita() {
    const el = $('handelse');
    const p = lista[index];
    const skarm = document.querySelector('.skarm');
    const forraHojd = el.hidden ? 0 : el.offsetHeight;
    skarm.classList.toggle('med-handelse', !!p);
    el.hidden = !p;
    if (!p) { stangMer(false); return forraHojd !== 0; }
    const etikett = $('handelse-etikett');
    etikett.textContent = p.etikett;
    etikett.className = 'etikett' + (p.klass ? ' ' + p.klass : '');
    const t = $('handelse-text');
    t.textContent = '';
    const b = document.createElement('b'); b.textContent = p.rubrik;
    t.appendChild(b);
    if (p.detalj) { const s = document.createElement('span'); s.textContent = ' · ' + p.detalj; t.appendChild(s); }
    $('handelse-hoger').innerHTML = (p.hoger || '') + (lista.length > 1 ? '<small class="antal">' + (index + 1) + '/' + lista.length + '</small>' : '');
    $('handelse-mer').textContent = p.mer || '';
    el.classList.toggle('kan-fallas-ut', !!p.mer);
    if (!p.mer) stangMer(false);
    if (p.blinka && !blinkat.has(p.id)) {
      blinkat.add(p.id);
      el.classList.remove('larm');
      void el.offsetWidth;
      el.classList.add('larm');
      setTimeout(() => el.classList.remove('larm'), 8000);
    }
    return forraHojd !== el.offsetHeight;
  }

  function stangMer(meddela) {
    clearTimeout(utfallTimer);
    const el = $('handelse');
    if (!el.classList.contains('utfalld')) return;
    el.classList.remove('utfalld');
    el.setAttribute('aria-expanded', 'false');
    if (meddela !== false) onAndrad();
  }

  function vaxla() {
    const el = $('handelse');
    const p = lista[index];
    if (!p || !p.mer) return;
    if (el.classList.contains('utfalld')) { stangMer(); return; }
    el.classList.add('utfalld');
    el.setAttribute('aria-expanded', 'true');
    onAndrad();
    utfallTimer = setTimeout(stangMer, 30000);
  }

  function koppla(andrad) {
    onAndrad = andrad || onAndrad;
    $('handelse').addEventListener('click', vaxla);
  }

  return { satt, koppla, aktuella: () => lista.slice() };
})();
