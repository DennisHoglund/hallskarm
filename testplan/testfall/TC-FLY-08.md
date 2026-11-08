[← Testplan](../index.md)

# TC-FLY-08 · Valt plan syns alltid på minikartan

| | |
|---|---|
| **Område** | Flyg |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/flyg.spec.js`](../../tests/flyg.spec.js#L63) – *valt plan syns alltid på minikartan* |

## Förutsättningar

- Närmaste planet är långt bort (t.ex. 15–20 km)

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta på minikartan i nedre raden | Planet som beskrivs till höger syns på kartan, inte utanför |
| 2 | Vänta tills ett plan kommer närmare | Kartan zoomar in, men aldrig närmare än 5 km |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
