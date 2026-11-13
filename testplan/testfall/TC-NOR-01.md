[← Testplan](../index.md)

# TC-NOR-01 · Hög Kp, mörkt och klart visar "Troligt nu"

| | |
|---|---|
| **Område** | Norrsken |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/norrsken.spec.js`](../../tests/norrsken.spec.js#L17) – *hög Kp, mörkt och klart visar "Troligt nu" och blinkar* |

## Förutsättningar

- Mörkt, klar himmel enligt prognosen
- Kp minst ett steg över vad breddgraden kräver (Stockholm: 6)

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta under klockan | Händelseraden NORRSKEN visar "Troligt nu", hur länge det är klart och att titta mot norr |
| 2 | Titta på Kp-mätaren | Rätt antal av nio staplar är ifyllda |
| 3 | Titta på raden direkt | Den blinkar kort i accentfärgen |
| 4 | Titta på SL-listan | Inga avgångar klipps av, även i 1024×690 |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
