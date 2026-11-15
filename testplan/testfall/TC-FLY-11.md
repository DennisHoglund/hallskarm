[← Testplan](../index.md)

# TC-FLY-11 · Dagens flygstatistik

| | |
|---|---|
| **Område** | Flyg |
| **Prioritet** | Låg |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/flyg.spec.js`](../../tests/flyg.spec.js#L129) – *dagens flygstatistik räknas, sparas och nollställs vid midnatt* |

## Förutsättningar

- Flygdata fungerar (proxy inställd)

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta på luftrummets rubrikrad | "4 plan inom 25 km · 4 i dag" – unika plan inom radien sedan midnatt |
| 2 | Öppna flygvyn | Rutan I DAG visar antal plan, närmaste passagen (km + anrop) och högsta planet (höjd + anrop och typ) |
| 3 | Vänta tills inga plan är inom radien | Dagens siffror ligger kvar |
| 4 | Ladda om sidan | Dagens siffror ligger kvar (sparas på enheten) |
| 5 | Dagen efter | Räkningen börjar om från noll |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
