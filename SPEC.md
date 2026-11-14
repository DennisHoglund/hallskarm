# Hallskärm – specifikation

## 1. Syfte
En gammal iPad (Air 3, 1112×834 i liggande läge) sitter på väggen i hallen och visar det man behöver på väg ut:
klocka, väder, nästa tunnelbana/buss och vilket plan som flyger över huset. Samma app ska kunna användas
av andra (t.ex. Dennis son på Gärdet) med egna hållplatser och egen plats – utan att något personligt hamnar i koden.

## 2. Stack
- Ren HTML/CSS/JS utan byggsteg. Moduler som IIFE på `window`.
- Leaflet 1.9.4 (cdnjs) för kartorna, typsnitten Archivo och JetBrains Mono (Google Fonts).
- GitHub Pages via Actions. Inga nycklar, ingen Supabase.
- En liten Cloudflare Worker (`proxy/worker.js`) som proxy för flygdata, eftersom flygnätverken saknar CORS.

## 3. Design
- Två utseenden med samma layout, valda med `data-theme` på `<html>`:
  - **Dag – Papper:** `#F2EFE8` bakgrund, svart bläck `#16150F`, accent `#C2410C`, kraftiga linjer.
  - **Natt – Avgångstavla:** `#0E0F0C` bakgrund, bärnsten `#FFB000`, siffror i JetBrains Mono.
- Tema **Auto** byter efter dagens sol upp/ned (från vädret), annars Dag eller Natt fast.
- Layout: övre rad (klocka, datum, namnsdag, sol, vecka, kugghjul) · mitten (väder | SL) · nedre rad (flyg | dagsljus).
- Storlekar i `rem` som skalar med skärmen. Stående läge staplar väder ovanför SL.
- Sol upp/ned, namnsdag och datum bryts aldrig på två rader (flera namn ger mindre text). Namnsdag och sol står i nivå (toppjusterade).
  SL visar bara så många hela rader som får plats – viktigt på iPad Air 2 i Safari med adressfält (1024×690).
- Målenhet: iPad Air 2 med iPadOS 15 (Safari 15). Ingen syntax eller CSS som kräver nyare Safari.
- Inga emojis, inga gradienter, tryckytor ≥ 44 px.

## 4. Funktioner
| Del | Källa | Uppdatering |
|---|---|---|
| Klocka, datum, ISO-vecka | Enheten | varje sekund |
| Namnsdag, helgdag | Svenska Dagar (`sholiday.faboul.se`) | varje timme, cache per dag |
| Väder nu + 5 dagar + 24 timmar, sol, dagslängd | Open-Meteo | var 15:e minut |
| Regnradar (senaste 2 h) | RainViewer `weather-maps.json` + rutor | när vädervyn öppnas, högst var 10:e minut |
| SL-avgångar | SL Transport-API (Trafiklab, ingen nyckel) | var 30:e sekund, nedräkning var 15:e |
| SL-störningar | SL Deviations (`deviations.integration.sl.se`, ingen nyckel) | var 2:a minut |
| SMHI-varningar | SMHI öppna data, konsekvensbaserade vädervarningar (`warning.json`) | var 10:e minut |
| Norrsken | NOAA SWPC Kp-prognos (3-timmarsblock) + molnighet från Open-Meteo | Kp var 30:e minut, bedömning varje minut |
| Flyg | adsb.lol → adsb.fi → airplanes.live via proxyn (reserv i tur och ordning) | var 10:e sekund |
| Rutt för valt plan | adsbdb via proxyn | en gång per anropssignal |
| Dagsljuskurva | Beräknas ur latitud | vid väderuppdatering |

### 4.1 Inställningar (kugghjulet)
- **Hemmets läge:** sök ort/område (Open-Meteo geokodning), min position (avrundad till ~100 m) eller första valda hållplatsen.
- **Hållplatser:** upp till tre. Sök i SL:s hållplatslista (hämtas en gång, sparas en vecka). Sökningen tål att å/ä/ö saknas.
  Per hållplats väljs trafikslag: Tunnelbana, Buss, Pendeltåg, Spårväg, Båt.
- **Tema:** Auto / Dag / Natt. **Flyg:** radie 10/25/50 km och adress till proxyn (om den inte står i `config.js`).
- Allt sparas i `localStorage` (`hall-installningar`) på enheten. Första start öppnar inställningarna.

### 4.2 Flyg
- Plan på marken och utanför radien filtreras bort.
- Valt plan: det som passerar närmast (< 2,5 km) inom 5 min räknat på kurs och fart, annars det närmaste.
- Nedre raden: minikarta (Leaflet, Esris gråa baskartor utan etiketter) + valt plan med rutt, typ, höjd, avstånd.
  Minikartan zoomar så att det valda planet alltid syns (minst 5 km, högst vald radie).
- Tryck på minikartan → helskärm med **Karta** (etiketter, spår) eller **Radar** (ringar, svep, fartvektor 1 min, historikprickar).
  Räckvidd 5/10/25/50 km. Vald vy sparas. Stängs efter 3 min utan tryck.
- **Avisering** när ett plan kommer inom 1/2/3/5 km (standard 2 km): Av, Blinka eller Blinka och pip. Luftrummet-rutan
  blinkar i accentfärgen ca 7 s. Pipet är två korta toner via Web Audio (ingen fil). Samma plan aviseras högst var 30:e minut.
  "Inget pip mellan 22 och 07" är på som standard. Safari spelar bara ljud efter ett tryck på skärmen (efter varje omstart).
- I nattläge färgas planen efter höjd: < 2 km orange, 2–7 km ljus, > 7 km blå.

### 4.3 Vädervyn
- Tryck på väderpanelen → helskärm. Stängs med krysset eller efter 3 min utan tryck.
- **Klädtips:** utgår från lägsta "känns som" de närmaste 4 timmarna: < −10° varm jacka, mössa, vantar, halsduk ·
  < 0° mössa, vantar · < 6° jacka, mössa · < 12° jacka · < 18° tunn jacka · annars t-shirt.
  Paraply (eller kängor vid snö) om det regnar nu eller väntas ≥ 0,2 mm/h inom 12 h. Reflex om det är mörkt
  eller blir mörkt inom 3 h. Raden under förklarar varför.
- **Kommande 24 timmar:** temperaturkurva från den pågående timmen, staplar för nederbörd (mm/h) och vindpilar med m/s var 3:e timme.
- **Regnradar:** Leaflet-karta (zoom 8) med hemmet i mitten. Var 20:e minut av RainViewers senaste 2 timmar spelas upp i loop.
  Sammanfattningen till höger (nästa regn, mest per timme, intensitet) kommer från Open-Meteos timprognos.
  Om RainViewer inte svarar visas ett meddelande på kartan – resten av vyn fungerar.

### 4.4 Händelseraden och SMHI-varningar
- Händelserad under övre raden som bara syns när något är aktuellt. Mittdelen krymper då och SL-listan tar bort rader som inte får plats.
- Flera händelser visas en i taget, varningar (allvarligast först) före norrsken, byter var 8:e sekund med 1/2.
- **SMHI-varningar:** bara gul, orange och röd varning inom meteorologi (inte meddelanden som vattenbrist). Bara om varningens
  område (polygon) täcker hemmets koordinater, om den inte är slut och börjar inom 24 h. Etikett i nivåns färg, typ,
  "nu till i morgon 10:00"/"från i natt 00:00 …" och område. Tryck fäller ut SMHI:s beskrivning (stängs efter 30 s).
  Röd varning blinkar kort. Data äldre än 2 h visas inte. SMHI nere → ingen rad.

### 4.5 Norrsken
- Visas när någon timme de närmaste 12 är mörk (mer än ca 40 min efter solnedgång/före soluppgång), har under 50 % moln
  och Kp minst kravet för breddgraden (Stockholm 5, norrut lägre, söderut högre).
- "Möjligt" vid Kp = kravet, "Troligt" vid minst ett steg över. "nu" om det gäller pågående timme, annars "i kväll"/"i natt".
  Texten säger hur länge det är klart eller när det klarnar. Kp-mätare med nio staplar.
- Raden blinkar kort första gången det blir "Troligt nu". Kp-prognos äldre än 6 h används inte. NOAA nere → ingen rad.
- NOAA bytte JSON-format 2026 (från rubrikrad + tabell till objekt) – appen läser båda.

### 4.6 SL-störningar
- Hämtas för valda trafikslag och filtreras på linjerna i avgångarna och hållplatsernas namn. Hissar och rulltrappor visas inte.
- Avgångar på en störd linje får markeringen STÖRNING. Längst ner i SL-panelen står rubriken och "till ca hh:mm" om slutet är inom 24 h.
- Flera störningar visas en i taget (viktigast först), byter var 8:e sekund, med 1/2.
- Om störningstjänsten inte svarar visas avgångarna som vanligt.

### 4.7 Robusthet
- Statusrad under väder och SL: "Uppdaterad hh:mm" eller "Kunde inte uppdatera – visar data från hh:mm".
- Gammal data tonas ned (väder > 1 h, SL > 3 min, flyg > 1 min).
- Hämtning pausas när sidan inte syns. Skärmlås (Wake Lock) när det stöds.
- Sidan laddas om 03:30 varje natt.

## 5. Lagring
| Nyckel | Innehåll |
|---|---|
| `hall-installningar` | plats, hållplatser, tema, flygradie, proxy, avisering |
| `hall-sl-sites` | SL:s hållplatslista (id, namn, lat, lon), max en vecka |
| `hall-dagar` | dagens namnsdag |
| `hall-flygvy` | karta eller radar |

## 6. Offline och uppdatering
Service worker `sw.js`: egna filer nätet först, CDN och typsnitt cache först, kartrutor i egen cache (max 800).
Data-API:er cachas inte. Höj `CACHE` vid ändring; sidan laddas om när ny version tar över.

## 7. Tester
- Playwright på **iPad (WebKit)** och **Platta (Chromium)** i 1112×834, sv-SE, Europe/Stockholm, fast tid sön 8 nov 2026 08:42.
- All extern trafik mockas i `tests/mock.js`. Testfall i `testplan/` kopplas med annotation `testfall`.
- Rapport: https://dennishoglund.github.io/hallskarm/rapport/

## 8. Beslut
- **Ingen ESP32 behövs** för nuvarande funktioner – iPaden hämtar allt själv. Egna sensorer läggs senare via Supabase
  (en HTTPS-sida får inte läsa `http://esp32.local`).
- Elpris och CO₂ togs bort ur designen; flyg och dagsljus tog platsen.
- Plats och hållplatser i webbläsaren, inte i koden, eftersom repot är publikt.
- adsb.lol och airplanes.live skickar inga CORS-huvuden, så Safari stoppar direkta anrop. Lösning: Cloudflare Worker
  (gratis) som bara släpper igenom flygkällorna och adsbdb. Utan proxy visar appen vad som behövs i stället för ett fel.
- Carto kräver numera API-nyckel för sina baskartor – bytt till Esris Canvas-kartor.
- RainViewers gratis-API har sedan 2026 ingen prognos (nowcast), bara de senaste 2 timmarna, max zoom 7, ett färgschema
  (Universal Blue) och 100 anrop/min per IP. Därför visar radarn bakåt i tiden och prognosen kommer från Open-Meteo.

## 9. Kvar att göra
- SL och Open-Meteo fungerar direkt från Safari (verifierat på iPhone 2026-11-08).
- Egen sensor (utetemperatur/HAN) via ESP32 → Supabase.

### Önskelista
- **Kalender (pausad):** händelserad "I dag"/"I morgon" och kalendervy med vecka, lista och detaljer. Endast läsning via
  hemlig/offentlig prenumerationslänk (iCloud eller Google) som sparas på enheten och hämtas via proxyn. Inget Apple-ID
  på iPaden. Lägga till/ändra görs på mobilen; "+" kan visa en QR-kod. Skisser finns.
- Månfas bredvid sol upp/ned.
- ISS-passager som syns i kväll.
- Dagens flygstatistik i flygpanelen.
- Pip vid flyg ovanför och möjlighet att stänga av radarsvepet (pausat).
