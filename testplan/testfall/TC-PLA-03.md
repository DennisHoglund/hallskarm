[← Testplan](../index.md)

# TC-PLA-03 · Koordinater kan klistras in som plats

| | |
|---|---|
| **Område** | Plats |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md](../../SPEC.md) |
| **Playwright** | [`tests/plats.spec.js`](../../tests/plats.spec.js#L21) – *koordinater från Kartor kan klistras in som plats* |

## Förutsättningar

- Koordinater kopierade från Kartor på mobilen (t.ex. 59,75526° N, 18,59035° Ö)

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Öppna inställningarna och klistra in koordinaterna i platssöket | Ett förslag "59,755° N, 18,590° Ö · Koordinater" visas |
| 2 | Prova även 59.75526, 18.59035 och 59°45'19"N 18°35'25"E | Samma förslag |
| 3 | Tryck på förslaget och Klar | Vald plats byts och vädret hämtas för koordinaterna |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
