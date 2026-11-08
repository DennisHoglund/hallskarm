[← Testplan](../index.md)

# TC-SL-01 · Avgångar visas i tidsordning och den som går nu markeras

| | |
|---|---|
| **Område** | SL-avgångar |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/sl.spec.js`](../../tests/sl.spec.js#L5) – *avgångar visas i tidsordning och den som går nu markeras* |

## Förutsättningar

- En hållplats vald

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta på högra delen | Avgångar i tidsordning med linje, destination och minuter kvar |
| 2 | Hitta en avgång som går inom en minut | Den visar Nu i accentfärg |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
