[← Testplan](../index.md)

# TC-FLY-03 · Radarvyn och räckvidden

| | |
|---|---|
| **Område** | Flyg |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/flyg.spec.js`](../../tests/flyg.spec.js#L30) – *radarvyn och räckvidden* |

## Förutsättningar

- Flygvyn öppen

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck på Radar | Radarskop med ringar, svep och plan |
| 2 | Tryck på 10 km | Bara plan inom 10 km visas |
| 3 | Stäng och öppna flygvyn igen | Radar och 10 km är kvar |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
