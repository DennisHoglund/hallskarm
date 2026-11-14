[← Testplan](../index.md)

# TC-EL-04 · Utan elpris fungerar resten

| | |
|---|---|
| **Område** | Elpris |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/elpris.spec.js`](../../tests/elpris.spec.js#L53) – *om elpriset inte kan hämtas syns ingen rad men resten fungerar* |

## Förutsättningar

- Elpriset just nu svarar inte

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Starta skärmen | Ingen elprisrad, dagsljus och resten visas som vanligt |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
