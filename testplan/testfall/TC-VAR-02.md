[← Testplan](../index.md)

# TC-VAR-02 · Röd varning går före norrsken och blinkar

| | |
|---|---|
| **Område** | SMHI-varningar |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/varningar.spec.js`](../../tests/varningar.spec.js#L43) – *röd varning går före norrsken, blinkar och turas om* |

## Förutsättningar

- Röd varning för hemmet och samtidigt norrsken

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta under klockan | RÖD VARNING visas först med 1/2 och raden blinkar kort |
| 2 | Vänta 8 sekunder | Norrsken visas med 2/2, sedan turas de om |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
