[← Testplan](../index.md)

# TC-VAD-02 · Visar tydligt när vädret inte kan hämtas

| | |
|---|---|
| **Område** | Väder |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/vader.spec.js`](../../tests/vader.spec.js#L19) – *visar tydligt när vädret inte kan hämtas* |

## Förutsättningar

- Inget internet eller Open-Meteo nere

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Vänta på uppdatering | Statusraden under vädret säger att det inte gick att hämta, övriga delar fungerar |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
