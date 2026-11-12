[← Testplan](../index.md)

# TC-VAD-05 · Om regnradarn inte svarar fungerar resten av vyn

| | |
|---|---|
| **Område** | Väder |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/vadervy.spec.js`](../../tests/vadervy.spec.js#L61) – *om regnradarn inte svarar fungerar resten av vyn* |

## Förutsättningar

- RainViewer svarar inte (t.ex. flygplansläge efter att väder hämtats)

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Öppna vädervyn | Ett meddelande på kartan säger att regnradarn inte kunde hämtas och att den försöker igen |
| 2 | Titta på resten av vyn | Klädtips, 24 timmar och sammanfattningen av nederbörd visas ändå |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
