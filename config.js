// Grundinställningar för Hallskärmen. Inga hemligheter – alla API:er är öppna.
// Personliga val (plats, hållplatser, tema) sparas bara i webbläsaren via HallInst.
window.HALL_CONFIG = {
  // Används tills man har valt en egen plats i Inställningar
  standardPlats: { namn: 'Stockholm', lat: 59.3326, lon: 18.0649 },

  // Uppdateringsintervall i sekunder
  intervall: { vader: 900, sl: 30, flyg: 10, namnsdag: 3600 },

  // Data äldre än så här markeras som gammal (sekunder)
  gammal: { vader: 3600, sl: 180, flyg: 60 },

  // Ladda om sidan varje natt så att nya versioner och minne rensas
  nattligOmladdning: '03:30',

  // Flyg: sökradie i km och vilka plan som räknas som "ovanför"
  flyg: { radieKm: 25, ovanforKm: 2.5, maxSekunder: 300 },

  api: {
    vader: 'https://api.open-meteo.com/v1/forecast',
    geokod: 'https://geocoding-api.open-meteo.com/v1/search',
    slSites: 'https://transport.integration.sl.se/v1/sites?expand=false',
    slAvgangar: 'https://transport.integration.sl.se/v1/sites/{id}/departures?forecast=60',
    dagar: 'https://sholiday.faboul.se/dagar/v2.1/',
    rutt: 'https://api.adsbdb.com/v0/callsign/',
    // Flygdata provas i tur och ordning tills någon svarar
    flyg: [
      { namn: 'adsb.lol', url: 'https://api.adsb.lol/v2/lat/{lat}/lon/{lon}/dist/{nm}' },
      { namn: 'adsb.fi', url: 'https://opendata.adsb.fi/api/v3/lat/{lat}/lon/{lon}/dist/{nm}' },
      { namn: 'airplanes.live', url: 'https://api.airplanes.live/v2/point/{lat}/{lon}/{nm}' }
    ]
  },

  kartrutor: {
    dag: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
    natt: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>'
  }
};
