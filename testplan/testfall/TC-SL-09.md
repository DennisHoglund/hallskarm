[← Testplan](../index.md)

# TC-SL-09 · Avgångarna visas om störningstjänsten inte svarar

| | |
|---|---|
| **Område** | SL-avgångar |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/storning.spec.js`](../../tests/storning.spec.js#L71) – *om störningstjänsten inte svarar visas avgångarna ändå* |

## Förutsättningar

- SL:s störningstjänst svarar inte

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Starta skärmen | Avgångarna visas som vanligt, utan felmeddelande och utan störningsrad |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
