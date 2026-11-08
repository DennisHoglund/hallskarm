[← Testplan](../index.md)

# TC-SL-03 · Välj bort buss så visas bara tunnelbana

| | |
|---|---|
| **Område** | SL-avgångar |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/sl.spec.js`](../../tests/sl.spec.js#L39) – *välj bort buss så visas bara tunnelbana* |

## Förutsättningar

- Hållplats med både buss och tunnelbana

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Öppna Inställningar och avmarkera Buss | Rutan för Buss blir tom |
| 2 | Tryck Klar | Bara tunnelbanan visas |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
