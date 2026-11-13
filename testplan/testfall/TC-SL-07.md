[← Testplan](../index.md)

# TC-SL-07 · Störning på en linje markeras i avgångarna

| | |
|---|---|
| **Område** | SL-avgångar |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/storning.spec.js`](../../tests/storning.spec.js#L28) – *störning på en linje markeras i avgångarna och visas längst ner* |

## Förutsättningar

- Hållplats vald
- SL har en störning på en linje som går från hållplatsen

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta på avgångarna | Avgångar på den störda linjen har markeringen STÖRNING |
| 2 | Titta längst ner i SL-panelen | Störningens rubrik visas, med "till ca" och klockslag om SL angett ett slut |
| 3 | Kontrollera vad som inte visas | Hissar, rulltrappor och störningar på andra linjer syns inte |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
