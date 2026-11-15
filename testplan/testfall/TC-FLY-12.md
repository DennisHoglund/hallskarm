[← Testplan](../index.md)

# TC-FLY-12 · Egna ikoner för helikoptrar och andra kategorier

| | |
|---|---|
| **Område** | Flyg |
| **Prioritet** | Låg |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/flyg.spec.js`](../../tests/flyg.spec.js#L159) – *helikoptrar och andra kategorier får egna ikoner* |

## Förutsättningar

- Flygdata med en helikopter i närheten och gärna ett tungt plan, ett litet plan eller en drönare

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta på minikartan | Helikoptern har egen ikon (rotorblad, kropp, stjärtbom); tunga plan är större, små propellerplan har raka vingar |
| 2 | Titta på panelen när helikoptern är närmast | Faktaraden säger t.ex. "EC35 · Helikopter"; den valda har ring och accentfärg |
| 3 | Öppna radarn | Samma ikoner; helikopter, ballong och drönare står upprätt, plan vrids efter kursen |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
