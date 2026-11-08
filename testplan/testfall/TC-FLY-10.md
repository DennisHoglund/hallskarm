[← Testplan](../index.md)

# TC-FLY-10 · Ingen avisering när den är avstängd eller planet är för långt bort

| | |
|---|---|
| **Område** | Flyg |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/flyg.spec.js`](../../tests/flyg.spec.js#L88) – *ingen avisering när den är avstängd eller planet är för långt bort* |

## Förutsättningar

- Avisering inom 1 km eller Av

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Ett plan passerar 3 km bort | Ingen blinkning |
| 2 | Välj Av i inställningarna | Ingen blinkning eller pip alls |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
