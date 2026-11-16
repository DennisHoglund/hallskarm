[← Testplan](../index.md)

# TC-SPO-01 · Spelas nu visas under klockan och styr musiken

| | |
|---|---|
| **Område** | Spotify |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/spotify.spec.js`](../../tests/spotify.spec.js#L15) – *raden Spelas nu visar låt, artist och enhet och styr uppspelningen* |

## Förutsättningar

- Inloggad med Spotify i inställningarna
- Musik spelar på kontot

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta under klockan | Raden SPELAS NU med omslag, titel · artist och enhetens namn |
| 2 | Titta på linjen under raden | Förloppet växer medan låten spelar |
| 3 | Tryck på Nästa | Nästa låt börjar och raden byter titel |
| 4 | Tryck på Paus | Musiken pausar och raden försvinner |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
