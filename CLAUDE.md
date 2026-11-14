# Hallskärm – instruktioner för AI-assistenter

Läs `SPEC.md` för hela specifikationen. Det här är reglerna som gäller vid varje ändring.

## Projektet
- PWA för en gammal iPad i hallen: klocka, väder, SL-avgångar, flyg ovanför och dagsljus.
- Ren HTML/CSS/JS **utan byggsteg**. Inga ramverk. Leaflet via CDN med låst version (1.9.4).
- Ingen backend och inga API-nycklar. GitHub Pages via Actions.

## Språk och ton
- All UI-text, felmeddelanden, kommentarer, commit-meddelanden och testnamn på **svenska**.
- Felmeddelanden säger vad som hände och att appen försöker igen.

## Får aldrig brytas
- **Inga personuppgifter i repot.** Repot är publikt. Plats och hållplatser väljs i appen och sparas i `localStorage`.
- Inga hemligheter eller nycklar i koden.
- Ett API som inte svarar får aldrig stoppa resten av skärmen. Visa senaste data och en statusrad.
- `localStorage` alltid i try/catch. Nycklar börjar med `hall-`.
- Escapa all text från API:er som hamnar i HTML (`esc()`).

## Vid varje ändring
1. Höj `CACHE` i `sw.js` (`hallskarm-vN`) och `VERSION` i `app.js` när appfiler ändras. Nya filer läggs i `SHELL`.
2. Nya JS-filer: `<script>` i `index.html` och i `SHELL`.
3. Kör testerna: `npx playwright test` (lokalt räcker `--project="Platta (Chromium)"`).
4. Lägg till eller uppdatera tester i `tests/`. All extern trafik mockas i `tests/mock.js`. `bild(page, 'Namn')` för skärmdumpar.
5. Lägg till testfall i `testplan/` (fil + rad i `index.md`), koppla med `{ annotation: { type: 'testfall', description: 'TC-…' } }`, kör `npm run testplan`.
6. Uppdatera `SPEC.md` och vid behov `README.md`.
7. Committa med beskrivande svenskt meddelande och pusha till `main`. CI testar och publicerar.

## Design
- Två teman via `data-theme` på `<html>`: `dag` (Papper) och `natt` (Avgångstavla). Använd CSS-variablerna, aldrig hårdkodade färger.
- Storlekar i `rem` (rotens storlek skalar med skärmen). Testa i 1112×834.
- Inga emojis, inga gradienter i UI, inga kort med vänsterkant. Tryckytor ≥ 44 px.
- SVG-element saknar egenskapen `hidden` – använd `toggleAttribute('hidden', …)`.

## Kod
- Moduler som IIFE på `window`: `HallInst`, `HallTid`, `HallVader`, `HallVaderVy`, `HallSL`, `HallHandelser`, `HallVarning`, `HallNorrsken`, `HallFlyg`. `app.js` startar allt.
- Lokala tider från Open-Meteo och SL saknar tidszon och tolkas som lokal tid.

## Tester och rapport
- Playwright på iPad (WebKit) och Platta (Chromium), fast tid 2026-11-08 08:42.
- Rapport: https://dennishoglund.github.io/hallskarm/rapport/
- Rött i WebKit men grönt i Chromium betyder oftast ett riktigt Safari-problem – fixa appen, inte testet.
