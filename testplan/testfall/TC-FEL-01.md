[← Testplan](../index.md)

# TC-FEL-01 · Felsökningsläge stänger av delar

| | |
|---|---|
| **Område** | Felsökning |
| **Prioritet** | Låg |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/felsokning.spec.js`](../../tests/felsokning.spec.js#L5) – *?utan= stänger av delar vid start* |

## Förutsättningar

- En iPad som kraschar eller beter sig konstigt med appen

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Öppna adressen med `?utan=elpris,flyg,varningar` | Skärmen startar utan elpris, flyg och SMHI-varningar; inga anrop görs till dem |
| 2 | Öppna inställningarna | Versionsraden säger vilka delar som är avstängda |
| 3 | Öppna adressen utan `?utan=` | Allt är påslaget igen |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
