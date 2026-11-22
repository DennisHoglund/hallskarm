[← Testplan](../index.md)

# TC-FEL-03 · Kartan fungerar utan cdnjs

| | |
|---|---|
| **Område** | Felsökning |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/felsokning.spec.js`](../../tests/felsokning.spec.js#L32) – *kartan fungerar utan cdnjs* |

## Förutsättningar

- iPad med iPadOS 15 som inte når cdnjs.cloudflare.com

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Öppna skärmen | Kartan i Luftrummet ovanför syns och ingen röd felruta om leaflet visas |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
