[← Testplan](../index.md)

# TC-PLA-01 · Sök plats byter läge för väder och flyg

| | |
|---|---|
| **Område** | Plats |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/plats.spec.js`](../../tests/plats.spec.js#L4) – *sök plats byter läge för väder och flyg* |

## Förutsättningar

- Hallskärmen öppen

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Sök ett område i Hemmets läge och välj det | Vald plats ändras |
| 2 | Tryck Klar | Väder och flygkarta uppdateras för den nya platsen |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
