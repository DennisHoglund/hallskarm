[← Testplan](../index.md)

# TC-TID-01 · Klocka, datum, vecka och namnsdag visas

| | |
|---|---|
| **Område** | Klocka och datum |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/startskarm.spec.js`](../../tests/startskarm.spec.js#L4) – *klocka, datum, vecka och namnsdag visas* |

## Förutsättningar

- Hallskärmen öppen på iPaden

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Titta på övre raden | Klockan visar rätt tid, veckodag och datum står bredvid |
| 2 | Titta till höger | Dagens namnsdag och sol upp/ned visas, under står veckonumret |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
