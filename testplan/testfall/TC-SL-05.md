[← Testplan](../index.md)

# TC-SL-05 · När SL inte svarar visas ett felmeddelande

| | |
|---|---|
| **Område** | SL-avgångar |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/sl.spec.js`](../../tests/sl.spec.js#L58) – *när SL inte svarar visas ett felmeddelande* |

## Förutsättningar

- SL:s API svarar inte

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Vänta på uppdatering | Statusraden säger att det inte gick att hämta och tidigare avgångar ligger kvar om de finns |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
