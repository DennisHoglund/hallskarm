[← Testplan](../index.md)

# TC-SPO-02 · E-bläckssidan visar låten och artisten

| | |
|---|---|
| **Område** | Spotify |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/spotify.spec.js`](../../tests/spotify.spec.js#L34) – *tryck på raden öppnar e-bläckssidan med låt, artist och nästa låt* |

## Förutsättningar

- Inloggad med Spotify
- Musik spelar

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck på raden Spelas nu | Helsidan öppnas i svartvitt med rastrerat omslag |
| 2 | Läs höger sida | Titel, artist, album · år · spår X av Y, Om artisten från Wikipedia, genrer, följare och nästa låt |
| 3 | Tryck Föregående, Paus, Nästa | Musiken styrs |
| 4 | Tryck på krysset eller vänta 5 minuter | Sidan stängs |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
