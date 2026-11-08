[← Testplan](../index.md)

# TC-FLY-09 · Nedre raden blinkar när ett plan kommer nära

| | |
|---|---|
| **Område** | Flyg |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/flyg.spec.js`](../../tests/flyg.spec.js#L79) – *nedre raden blinkar när ett plan kommer nära* |

## Förutsättningar

- Inställningar → Flyg: Blinka och pip, inom 2 km

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Vänta tills ett plan passerar nära | Luftrummet-rutan blinkar i accentfärgen några sekunder och ett kort dubbelpip hörs |
| 2 | Samma plan stannar kvar nära | Ingen ny avisering för samma plan (först efter 30 min) |
| 3 | Efter kl 22 med Inget pip nattetid | Bara blink, inget ljud |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
