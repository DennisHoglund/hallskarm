[← Testplan](../index.md)

# TC-NOR-03 · Ingen händelserad när det inte går att se norrsken

| | |
|---|---|
| **Område** | Norrsken |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/norrsken.spec.js`](../../tests/norrsken.spec.js#L49) – *molnigt, låg Kp eller NOAA nere ger ingen händelserad* |

## Förutsättningar

- Hög Kp men mulet, eller klart men låg Kp, eller NOAA svarar inte

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta under klockan | Ingen händelserad, skärmen ser ut som vanligt |
| 2 | När NOAA inte svarar | Resten av skärmen fungerar |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
