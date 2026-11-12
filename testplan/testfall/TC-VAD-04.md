[← Testplan](../index.md)

# TC-VAD-04 · På kvällen föreslås reflex när det är mörkt

| | |
|---|---|
| **Område** | Väder |
| **Prioritet** | Låg |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/vadervy.spec.js`](../../tests/vadervy.spec.js#L46) – *på kvällen föreslås reflex när det är mörkt* |

## Förutsättningar

- Plats vald i Inställningar
- Efter solnedgången

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Öppna vädervyn efter solnedgången | Klädtipset innehåller Reflex, markerad i accentfärg |
| 2 | Läs raden under tipset | Den säger när det blev mörkt, t.ex. mörkt sedan 15:41 |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
