[← Testplan](../index.md)

# TC-VAD-01 · Visar vädret nu och fem dagar framåt

| | |
|---|---|
| **Område** | Väder |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/vader.spec.js`](../../tests/vader.spec.js#L5) – *visar vädret nu och fem dagar framåt* |

## Förutsättningar

- Plats vald i Inställningar

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta på vänstra delen | Temperatur, väderbeskrivning, vind och nederbörd just nu |
| 2 | Titta på listan under | Fem dagar framåt med lägsta och högsta temperatur och ett spann |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
