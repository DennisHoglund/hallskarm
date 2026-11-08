// Kort pip med Web Audio (ingen ljudfil). Safari kräver att ljudet låses upp av ett tryck.
window.HallLjud = (function () {
  let ctx = null;
  let antal = 0;

  function las() {
    try {
      if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) ctx = new AC(); }
      if (ctx && ctx.state === 'suspended') ctx.resume();
    } catch (e) { ctx = null; }
  }

  function ton(frekvens, start, langd) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frekvens;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + langd);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + langd + 0.05);
  }

  // Två korta toner uppåt, som en mjuk dörrklocka
  function pip() {
    antal++;
    document.documentElement.dataset.pip = String(antal);
    las();
    if (!ctx || ctx.state !== 'running') return false;
    const t = ctx.currentTime + 0.02;
    ton(880, t, 0.16);
    ton(1320, t + 0.18, 0.22);
    return true;
  }

  document.addEventListener('pointerdown', las, { passive: true });
  document.addEventListener('keydown', las);

  return { pip, las };
})();
