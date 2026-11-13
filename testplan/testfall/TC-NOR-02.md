[← Testplan](../index.md)

# TC-NOR-02 · På dagen visas "Möjligt i kväll"

| | |
|---|---|
| **Område** | Norrsken |
| **Prioritet** | Låg |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/norrsken.spec.js`](../../tests/norrsken.spec.js#L38) – *på dagen med klart väder i kväll visas "Möjligt i kväll"* |

## Förutsättningar

- Dagtid
- Kp 5 och klar himmel från kl 21

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta under klockan | "Möjligt i kväll · klart från ca 21 · titta mot norr" utan blinkning |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
