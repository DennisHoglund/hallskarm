[← Testplan](../index.md)

# TC-VAR-01 · Gul varning för hemmet visas och kan fällas ut

| | |
|---|---|
| **Område** | SMHI-varningar |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/varningar.spec.js`](../../tests/varningar.spec.js#L12) – *gul varning för hemmet visas i händelseraden och kan fällas ut* |

## Förutsättningar

- SMHI har en gul varning vars område täcker hemmet
- Samtidigt varningar för andra län och hydrologiska meddelanden

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta under klockan | GUL VARNING i gult, typ, tid ("nu till i morgon 10:00") och område, SMHI till höger |
| 2 | Kontrollera andra varningar | Varningar för andra områden och meddelanden som vattenbrist syns inte |
| 3 | Tryck på raden | SMHI:s beskrivning visas under raden; inga avgångar klipps |
| 4 | Tryck igen | Beskrivningen döljs (annars efter 30 s) |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
