[← Testplan](../index.md)

# TC-SPO-05 · Inloggningen syns i inställningarna

| | |
|---|---|
| **Område** | Spotify |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/spotify.spec.js`](../../tests/spotify.spec.js#L77) – *utan inloggning anropas inte Spotify och inställningarna visar inloggningen* |

## Förutsättningar

- Inte inloggad med Spotify

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Öppna Inställningar → Spotify | Redirect URI, fält för Client ID och knappen Logga in med Spotify |
| 2 | Klistra in fel Client ID och tryck Logga in | Meddelande om att ett giltigt Client ID behövs |
| 3 | Titta på startskärmen | Ingen rad Spelas nu och inga anrop till Spotify |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
