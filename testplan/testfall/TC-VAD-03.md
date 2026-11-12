[← Testplan](../index.md)

# TC-VAD-03 · Vädervyn visar klädtips, 24 timmar och regnradar

| | |
|---|---|
| **Område** | Väder |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/vadervy.spec.js`](../../tests/vadervy.spec.js#L5) – *tryck på vädret visar klädtips, 24 timmar och regnradar* |

## Förutsättningar

- Plats vald i Inställningar

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck på väderpanelen | Vädervyn öppnas i helskärm med plats, datum och tid |
| 2 | Titta på Klädtips | Ett tips som passar hur kallt det känns, med taggar som Mössa, Vantar eller Paraply |
| 3 | Titta på Kommande 24 timmar | Temperaturkurva från Nu, blå staplar för nederbörd och vindpilar med m/s |
| 4 | Titta på regnradarn | Kartan med hemmet i mitten spelar de senaste två timmarnas radarbilder; sammanfattning om nästa regn till höger |
| 5 | Tryck på paus och sedan krysset | Uppspelningen stannar, vyn stängs och startskärmen syns |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
