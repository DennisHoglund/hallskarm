[← Testplan](../index.md)

# TC-TID-02 · Dagsljuset visar längd, ändring och dagar till vändningen

| | |
|---|---|
| **Område** | Klocka och datum |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/startskarm.spec.js`](../../tests/startskarm.spec.js#L14) – *dagsljuset visar längd, ändring och dagar till vändningen* |

## Förutsättningar

- Hallskärmen öppen

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta på rutan Dagsljus nere till höger | Dagens längd, ändring per dag och en årskurva med en prick för idag |
| 2 | Läs raden under kurvan | Antal dagar till vintersolståndet (eller midsommar) |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
