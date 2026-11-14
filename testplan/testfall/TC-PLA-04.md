[← Testplan](../index.md)

# TC-PLA-04 · Tydligt besked när positionen inte går att få

| | |
|---|---|
| **Område** | Plats |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/plats.spec.js`](../../tests/plats.spec.js#L37) – *tydligt besked när positionen inte går att få* |

## Förutsättningar

- iPad utan mobilnät (ingen GPS), eller platsåtkomst nekad för Safari

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck Använd min position när iPaden inte hittar sin position | "Hittade ingen position – sök på ort eller klistra in koordinater" |
| 2 | Tryck när åtkomst är nekad | "Platsåtkomst nekad – slå på för Safari i Inställningar" |
| 3 | Kontrollera vald plats | Den tidigare platsen ligger kvar |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
