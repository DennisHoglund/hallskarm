[← Testplan](../index.md)

# TC-SL-02 · Lägg till hållplats genom att söka

| | |
|---|---|
| **Område** | SL-avgångar |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/sl.spec.js`](../../tests/sl.spec.js#L19) – *lägg till hållplats genom att söka* |

## Förutsättningar

- Ingen hållplats vald

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck på kugghjulet | Inställningar öppnas |
| 2 | Skriv gardet i Lägg till hållplats | Gärdet visas bland träffarna (å/ä/ö behövs inte) |
| 3 | Tryck på Gärdet och sedan Klar | Avgångar från Gärdet visas |
| 4 | Stäng och öppna appen | Hållplatsen finns kvar |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
