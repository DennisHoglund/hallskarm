[← Testplan](../index.md)

# TC-SPO-04 · Ingen rad när inget spelar eller Spotify är nere

| | |
|---|---|
| **Område** | Spotify |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/spotify.spec.js`](../../tests/spotify.spec.js#L65) – *inget visas när inget spelar, när Spotify är nere eller utan inloggning* |

## Förutsättningar

- Inloggad med Spotify

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Stoppa musiken | Raden Spelas nu försvinner inom några sekunder |
| 2 | Spotify svarar inte | Ingen rad, väder och avgångar visas som vanligt |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
