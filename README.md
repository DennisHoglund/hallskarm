# Hallskärm

Klocka, väder, SL-avgångar, flyg ovanför och dagsljus – för en gammal iPad på väggen i hallen.

**Öppna:** https://dennishoglund.github.io/hallskarm/ · **Testrapport:** https://dennishoglund.github.io/hallskarm/rapport/

## Kom igång på iPaden
1. Öppna länken i Safari. Första gången öppnas Inställningar.
2. Sök upp hemmets område och en eller flera hållplatser, välj trafikslag och tryck **Klar**.
3. Dela → **Lägg till på hemskärmen** och öppna appen därifrån.
4. Inställningar → Skärm och ljusstyrka → Automatisk låsning: **Aldrig**.
5. Inställningar → Hjälpmedel → **Guidad åtkomst** på. Starta den i appen med tre klick på hemknappen.

Valen sparas bara på den iPaden, så flera personer kan ha var sin skärm med egna hållplatser.

## Filer
| Fil | Innehåll |
|---|---|
| `index.html`, `styles.css` | Layout och de två teman (Dag/Natt) |
| `config.js` | API-adresser, intervall och standardplats |
| `installningar.js` | Inställningar och sök av plats/hållplats |
| `tid.js` | Klocka, vecka, namnsdag, dagsljus |
| `vader.js` | Open-Meteo |
| `sl.js` | SL Transport-API |
| `flyg.js` | Flygdata, minikarta, helskärmskarta och radar |
| `app.js` | Start, timers, tema, status |
| `sw.js`, `manifest.webmanifest`, `icons/` | PWA |

## Tester
```bash
npm ci
npx playwright install webkit chromium
npx playwright test
npm run rapport
```
Testplanen finns i [`testplan/index.md`](testplan/index.md).

## Datakällor
Open-Meteo (CC BY 4.0), Trafiklab SL Transport, Svenska Dagar, adsb.lol, adsb.fi, airplanes.live, adsbdb,
kartor © OpenStreetMap © CARTO.
