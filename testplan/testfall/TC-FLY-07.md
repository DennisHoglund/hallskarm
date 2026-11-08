[← Testplan](../index.md)

# TC-FLY-07 · Utan proxy förklaras vad som behövs

| | |
|---|---|
| **Område** | Flyg |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/flyg.spec.js`](../../tests/flyg.spec.js#L63) – *utan proxy förklaras vad som behövs* |

## Förutsättningar

- Ingen proxy angiven under Inställningar → Flyg

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta på nedre raden | Flygdata behöver en proxy, med förklaring |
| 2 | Lägg in proxyns adress under Inställningar → Flyg och tryck Klar | Planen visas inom några sekunder |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
