[← Testplan](../index.md)

# TC-VAR-03 · Ingen rad för gamla, avlägsna eller saknade varningar

| | |
|---|---|
| **Område** | SMHI-varningar |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/varningar.spec.js`](../../tests/varningar.spec.js#L58) – *gamla, avlägsna eller saknade varningar ger ingen händelserad* |

## Förutsättningar

- Varning som redan tagit slut, varning som börjar om mer än 24 h, eller SMHI svarar inte

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta under klockan | Ingen händelserad |
| 2 | När SMHI inte svarar | Resten av skärmen fungerar som vanligt |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
