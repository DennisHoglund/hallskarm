[← Testplan](../index.md)

# TC-EL-03 · Elområdet följer platsen och kan väljas

| | |
|---|---|
| **Område** | Elpris |
| **Prioritet** | Låg |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/elpris.spec.js`](../../tests/elpris.spec.js#L44) – *elområdet följer platsen och kan väljas själv* |

## Förutsättningar

- Plats vald

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Välj plats i Stockholm respektive Malmö | SE3 respektive SE4 används automatiskt |
| 2 | Välj elområde SE4 i inställningarna | Priserna hämtas för SE4 |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
