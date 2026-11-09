[← Testplan](../index.md)

# TC-LAY-01 · Liten skärm (dag): sol och namnsdag på en rad och i nivå, inga överlappande avgångar

| | |
|---|---|
| **Område** | Layout |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/layout.spec.js`](../../tests/layout.spec.js#L14) – *liten skärm (dag): sol och namnsdag på en rad och i nivå, inga överlappande avgångar* |

## Förutsättningar

- iPad Air 2 (1024×768) i Safari med adressfältet synligt, dagtema, två namn på namnsdagen

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta på övre raden | Sol upp – ned, namnsdagen och datumet står på en rad var, och namnsdagen står i nivå med sol upp – ned |
| 2 | Titta på avgångarna | Bara hela rader visas, statusraden "Uppdaterad" ligger under den sista |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
