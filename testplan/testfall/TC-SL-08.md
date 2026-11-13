[← Testplan](../index.md)

# TC-SL-08 · Flera störningar visas en i taget

| | |
|---|---|
| **Område** | SL-avgångar |
| **Prioritet** | Låg |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/storning.spec.js`](../../tests/storning.spec.js#L53) – *flera störningar visas en i taget, ingen störning ger ingen rad* |

## Förutsättningar

- Två störningar på linjer från hållplatsen

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta på störningsraden | Den viktigaste visas först med 1/2 |
| 2 | Vänta 8 sekunder | Nästa störning visas med 2/2 |
| 3 | När störningarna är över | Raden och markeringarna försvinner |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
