# Hallskärm

Klocka, väder, SL-avgångar, flyg ovanför och dagsljus – för en gammal iPad på väggen i hallen.

**Öppna:** https://dennishoglund.github.io/hallskarm/ · **Testrapport:** https://dennishoglund.github.io/hallskarm/rapport/

## Vad skärmen visar
- **Övre raden:** klocka, datum, vecka, namnsdag och sol upp/ned.
- **Väder:** nu och fem dagar framåt. Tryck på rutan för **vädervyn** med klädtips, 24 timmar timme för timme och regnradar (senaste två timmarna).
- **SL:** avgångar från upp till tre hållplatser. Störningar på dina linjer markeras och visas längst ner.
- **Luftrummet:** planet närmast ovanför med rutt. Tryck för karta eller radar i helskärm. Kan blinka (och pipa) när ett plan är nära.
- **Dagsljus:** dagslängd, förändring per dag och kurva över året.
- **Norrsken:** en rad under klockan som bara syns när Kp är tillräckligt högt och det är mörkt och klart.
- Dag- och nattema som byts vid solnedgång.

## Kom igång på iPaden
1. Öppna länken i Safari. Första gången öppnas Inställningar.
2. Sök upp hemmets område och en eller flera hållplatser, välj trafikslag och tryck **Klar**.
3. Dela → **Lägg till på hemskärmen** och öppna appen därifrån.
4. Inställningar → Skärm och ljusstyrka → Automatisk låsning: **Aldrig**.
5. Inställningar → Hjälpmedel → **Guidad åtkomst** på. Starta den i appen med tre klick på hemknappen.

Valen sparas bara på den iPaden, så flera personer kan ha var sin skärm med egna hållplatser.

## Proxy för flygdata (en gång)
Flygnätverken tillåter inte anrop direkt från en webbsida, så flygdata hämtas via en liten gratis Cloudflare Worker.
1. Skapa ett gratis konto på https://dash.cloudflare.com.
2. **Workers & Pages** → **Create** → **Create Worker** (Hello World). Döp den till `hallskarm-proxy` och tryck **Deploy**.
3. **Edit code**, ersätt allt med innehållet i [`proxy/worker.js`](proxy/worker.js) och tryck **Deploy**.
4. Kopiera adressen (`https://hallskarm-proxy.<ditt-namn>.workers.dev`) och klistra in den i Hallskärmen under
   **Inställningar → Flyg → Proxy för flygdata** – eller i `flygProxy` i `config.js` så gäller den för alla enheter.

Workern släpper bara igenom adsb.lol, adsb.fi, airplanes.live och adsbdb och cachar svaren i 5 sekunder.

## Filer
| Fil | Innehåll |
|---|---|
| `index.html`, `styles.css` | Layout och de två teman (Dag/Natt) |
| `config.js` | API-adresser, intervall och standardplats |
| `installningar.js` | Inställningar och sök av plats/hållplats |
| `tid.js` | Klocka, vecka, namnsdag, dagsljus |
| `vader.js` | Open-Meteo |
| `vadervy.js` | Vädervyn: klädtips, 24 timmar, regnradar (RainViewer) |
| `sl.js` | SL Transport-API och störningar |
| `norrsken.js` | Norrsken: Kp-prognos från NOAA + mörker och moln |
| `flyg.js` | Flygdata, minikarta, helskärmskarta och radar |
| `app.js` | Start, timers, tema, status |
| `sw.js`, `manifest.webmanifest`, `icons/` | PWA |
| `proxy/worker.js` | Cloudflare Worker som proxy för flygdata |

## Tester
```bash
npm ci
npx playwright install webkit chromium
npx playwright test
npm run rapport
```
Testplanen finns i [`testplan/index.md`](testplan/index.md).

## Datakällor
Open-Meteo (CC BY 4.0), RainViewer, NOAA SWPC, Trafiklab SL Transport och SL Deviations, Svenska Dagar, adsb.lol, adsb.fi, airplanes.live, adsbdb,
kartor © Esri, HERE, Garmin, © OpenStreetMap.
