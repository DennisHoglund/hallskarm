[← Testplan](../index.md)

# TC-FLY-13 · Ikoner i listan och teckenförklaring

| | |
|---|---|
| **Område** | Flyg |
| **Prioritet** | Låg |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/flyg.spec.js`](../../tests/flyg.spec.js#L189) – *ikoner i listan och teckenförklaring i flygvyn* |

## Förutsättningar

- Flygdata med minst en helikopter och ett litet plan

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Öppna flygvyn | Anropet i panelen och varje rad i listan har en liten ikon för typen |
| 2 | Tryck på i-knappen uppe till höger | Teckenförklaringen öppnas med alla ikoner, ring, spår och höjdfärger |
| 3 | Tryck i rutan | Den stängs |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
