// Nätverksdiagnos: ?diagnos provar varje extern tjänst och visar svaret på skärmen.
// För äldre iPad utan Web Inspector – fota rutan och skicka.
window.HallDiagnos = (function () {
  function tjanster() {
    var a = window.HALL_CONFIG.api;
    var proxy = (a.flygProxy || '').replace(/\/+$/, '');
    return [
      { namn: 'Väder (Open-Meteo)', url: a.vader + '?latitude=59.33&longitude=18.06&current=temperature_2m' },
      { namn: 'SL avgångar', url: a.slAvgangar.replace('{id}', '9001') },
      { namn: 'SL störningar', url: a.slStorningar },
      { namn: 'Namnsdag', url: a.dagar + '2026/01/01' },
      { namn: 'SMHI varningar', url: a.varningar },
      { namn: 'Elpris', url: a.elpris.replace('{ar}', '2026').replace('{md}', '01-01').replace('{omrade}', 'SE3') },
      { namn: 'Norrsken (NOAA)', url: a.kp },
      { namn: 'Regnradar', url: a.regnradar },
      { namn: 'Flygproxy', url: proxy ? proxy + '/?url=' + encodeURIComponent('https://api.adsbdb.com/v0/callsign/SAS1') : '' },
      { namn: 'Kartrutor (Esri)', url: window.HALL_CONFIG.kartrutor.natt.replace('{z}', '1').replace('{y}', '0').replace('{x}', '0') }
    ];
  }

  function prova(t) {
    if (!t.url) return Promise.resolve(t.namn + ': ingen adress');
    var start = Date.now();
    var host = t.url.split('/')[2];
    return fetch(t.url, { cache: 'no-store' }).then(function (res) {
      return t.namn + ': ' + (res.ok ? 'OK ' : 'SVAR ') + res.status + ' (' + (Date.now() - start) + ' ms) ' + host;
    }, function (e) {
      return t.namn + ': FEL ' + (e && e.name) + ' – ' + (e && e.message) + ' (' + (Date.now() - start) + ' ms) ' + host;
    });
  }

  function kor() {
    var el = document.createElement('pre');
    el.id = 'diagnos';
    el.style.cssText = 'position:fixed;left:8px;top:8px;right:8px;z-index:99998;margin:0;padding:12px;background:var(--bg);color:var(--ink);border:var(--kant-tjock);font:14px/1.5 Menlo,monospace;white-space:pre-wrap;max-height:90vh;overflow:auto';
    var huvud = 'Nätverksdiagnos ' + new Date().toString() + '\nonLine: ' + navigator.onLine + '\n' + navigator.userAgent + '\n\n';
    el.textContent = huvud + 'Provar …';
    document.body.appendChild(el);
    return Promise.all(tjanster().map(prova)).then(function (rader) {
      el.textContent = huvud + rader.join('\n') + '\n\nFota och skicka. Ta bort ?diagnos för vanlig skärm.';
      return rader;
    });
  }

  return { kor: kor, tjanster: tjanster };
})();
