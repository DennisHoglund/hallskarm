[← Testplan](../index.md)

# TC-FEL-02 · Nätverksdiagnos visar varje tjänst

| | |
|---|---|
| **Område** | Felsökning |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/felsokning.spec.js`](../../tests/felsokning.spec.js#L20) – *?diagnos visar svaret från varje tjänst* |

## Förutsättningar

- En iPad där data inte laddas

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Öppna adressen med `?diagnos` | En ruta listar varje tjänst med OK, statuskod eller felet från webbläsaren |
| 2 | Fota rutan | Bilden visar tid, onLine och webbläsarens version |
| 3 | Öppna adressen utan `?diagnos` | Vanlig skärm utan ruta |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
