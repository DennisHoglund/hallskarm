[← Testplan](../index.md)

# TC-SPO-06 · Inloggningen med Spotify slutförs

| | |
|---|---|
| **Område** | Spotify |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/spotify.spec.js`](../../tests/spotify.spec.js#L90) – *inloggningen tar emot koden från Spotify och städar adressen* |

## Förutsättningar

- Client ID från Spotify Developer inklistrat
- Redirect URI i Spotify-appen är exakt adressen som visas i inställningarna

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck Logga in med Spotify och godkänn | Tillbaka i Hallskärm, adressen utan ?code= |
| 2 | Spela musik | Raden Spelas nu dyker upp |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
