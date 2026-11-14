[← Testplan](../index.md)

# TC-EL-02 · Elprisvyn visar dygnets priser

| | |
|---|---|
| **Område** | Elpris |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/elpris.spec.js`](../../tests/elpris.spec.js#L18) – *tryck visar dygnets priser, i morgon och billigaste perioden* |

## Förutsättningar

- Efter ca 13:00 när morgondagens priser publicerats

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck på elpriset | Vyn öppnas med pris just nu, omdöme och billigaste perioden ("i natt 03–06") |
| 2 | Titta på siffrorna | Snitt, lägst och högst för dagen med klockslag |
| 3 | Titta på staplarna | 24 staplar för i dag (passerade dämpade, nu i accent) och 24 konturstaplar för i morgon; billigaste perioden markerad i grönt |
| 4 | Tryck på krysset | Vyn stängs |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
