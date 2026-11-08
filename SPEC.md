# Hallskärm – specifikation

## 1. Syfte
En gammal iPad (Air 3, 1112×834 i liggande läge) sitter på väggen i hallen och visar det man behöver på väg ut:
klocka, väder, nästa tunnelbana/buss och vilket plan som flyger över huset. Samma app ska kunna användas
av andra (t.ex. Dennis son på Gärdet) med egna hållplatser och egen plats – utan att något personligt hamnar i koden.

## 2. Stack
- Ren HTML/CSS/JS utan byggsteg. Moduler som IIFE på `window`.
- Leaflet 1.9.4 (cdnjs) för kartorna, typsnitten Archivo och JetBrains Mono (Google Fonts).
- GitHub Pages via Actions. Ingen backend, inga nycklar, ingen Supabase.

## 3. Design
- Två utseenden med samma layout, valda med `data-theme` på `<html>`:
  - **Dag – Papper:** `#F2EFE8` bakgrund, svart bläck `#16150F`, accent `#C2410C`, kraftiga linjer.
  - **Natt – Avgångstavla:** `#0E0F0C` bakgrund, bärnsten `#FFB000`, siffror i JetBrains Mono.
- Tema **Auto** byter efter dagens sol upp/ned (från vädret), annars Dag eller Natt fast.
- Layout: övre rad (klocka, datum, namnsdag, sol, vecka, kugghjul) · mitten (väder | SL) · nedre rad (flyg | dagsljus).
- Storlekar i `rem` som skalar med skärmen. Stående läge staplar väder ovanför SL.
- Inga emojis, inga gradienter, tryckytor ≥ 44 px.

## 4. Funktioner
| Del | Källa | Uppdatering |
|---|---|---|
| Klocka, datum, ISO-vecka | Enheten | varje sekund |
| Namnsdag, helgdag | Svenska Dagar (`sholiday.faboul.se`) | varje timme, cache per dag |
| Väder nu + 5 dagar, sol, dagslängd | Open-Meteo | var 15:e minut |
| SL-avgångar | SL Transport-API (Trafiklab, ingen nyckel) | var 30:e sekund, nedräkning var 15:e |
| Flyg | adsb.lol → adsb.fi → airplanes.live (reserv i tur och ordning) | var 10:e sekund |
| Rutt för valt plan | adsbdb | en gång per anropssignal |
| Dagsljuskurva | Beräknas ur latitud | vid väderuppdatering |

### 4.1 Inställningar (kugghjulet)
- **Hemmets läge:** sök ort/område (Open-Meteo geokodning), min position (avrundad till ~100 m) eller första valda hållplatsen.
- **Hållplatser:** upp till tre. Sök i SL:s hållplatslista (hämtas en gång, sparas en vecka). Sökningen tål att å/ä/ö saknas.
  Per hållplats väljs trafikslag: Tunnelbana, Buss, Pendeltåg, Spårväg, Båt.
- **Tema:** Auto / Dag / Natt. **Flyg:** radie 10/25/50 km.
- Allt sparas i `localStorage` (`hall-installningar`) på enheten. Första start öppnar inställningarna.

### 4.2 Flyg
- Plan på marken och utanför radien filtreras bort.
- Valt plan: det som passerar närmast (< 2,5 km) inom 5 min räknat på kurs och fart, annars det närmaste.
- Nedre raden: minikarta (Leaflet, Carto utan etiketter) + valt plan med rutt, typ, höjd, avstånd.
- Tryck på minikartan → helskärm med **Karta** (etiketter, spår) eller **Radar** (ringar, svep, fartvektor 1 min, historikprickar).
  Räckvidd 5/10/25/50 km. Vald vy sparas. Stängs efter 3 min utan tryck.
- I nattläge färgas planen efter höjd: < 2 km orange, 2–7 km ljus, > 7 km blå.

### 4.3 Robusthet
- Statusrad under väder och SL: "Uppdaterad hh:mm" eller "Kunde inte uppdatera – visar data från hh:mm".
- Gammal data tonas ned (väder > 1 h, SL > 3 min, flyg > 1 min).
- Hämtning pausas när sidan inte syns. Skärmlås (Wake Lock) när det stöds.
- Sidan laddas om 03:30 varje natt.

## 5. Lagring
| Nyckel | Innehåll |
|---|---|
| `hall-installningar` | plats, hållplatser, tema, flygradie |
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

## 9. Kvar att göra
- Verifiera i riktig Safari att SL, flygnätverken och adsbdb tillåter anrop från webbläsaren (CORS). Om SL inte gör det: proxy.
- Störningsinformation från SL (`deviations`).
- Egen sensor (utetemperatur/HAN) via ESP32 → Supabase.
