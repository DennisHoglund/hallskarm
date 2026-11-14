[← Testplan](../index.md)

# TC-EL-01 · Elpriset visas i dagsljuspanelen

| | |
|---|---|
| **Område** | Elpris |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/elpris.spec.js`](../../tests/elpris.spec.js#L5) – *elpriset visas i dagsljuspanelen med dyrt och billigaste tid* |

## Förutsättningar

- Plats vald
- Förmiddag, priset just nu klart över dagens snitt

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta längst ner i dagsljuspanelen | ELPRIS med öre/kWh just nu (inkl. moms) |
| 2 | Kontrollera omdömet | "Dyrt" i accentfärg när priset är minst 30 % över snittet, "Billigt" i grönt när det är 30 % under, annars inget |
| 3 | Läs tipset | Billigaste tre timmarna i rad framåt, t.ex. "billigast 21–00" |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
