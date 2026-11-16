[← Testplan](../index.md)

# TC-SPO-03 · Styrning utan Premium ger ett tydligt fel

| | |
|---|---|
| **Område** | Spotify |
| **Prioritet** | Låg |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/spotify.spec.js`](../../tests/spotify.spec.js#L58) – *utan Premium visas ett fel och sidan fortsätter fungera* |

## Förutsättningar

- Inloggad med ett konto utan Premium

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Öppna e-bläckssidan och tryck Nästa | Texten "Styrning kräver Spotify Premium." visas en stund, resten fungerar |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
