# Testplan · Hallskärm

Testfall för Hallskärmen som docs-as-code. Varje testfall har steg som går att köra manuellt på iPaden.
Automatiserade testfall körs av Playwright vid varje commit och är kopplade via sitt ID.

| | |
|---|---|
| **Testfall** | 43 |
| **Automatiserade** | 39 (körs på iPad/WebKit och Chromium i iPad Airs skärmstorlek) |
| **Manuella** | 4 (kräver riktig iPad och riktig data) |
| **Senaste testrapport** | [dennishoglund.github.io/hallskarm/rapport/](https://dennishoglund.github.io/hallskarm/rapport/) |
| **Krav** | [SPEC.md](../SPEC.md) |

**Typ:** 🤖 automatiserad · 🖐️ manuell  **Prioritet:** Hög = måste fungera varje dag, Medel = viktig, Låg = bekvämlighet

## Klocka och datum

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-TID-01](testfall/TC-TID-01.md) | [Klocka, datum, vecka och namnsdag visas](testfall/TC-TID-01.md) | Hög | 🤖 |
| [TC-TID-02](testfall/TC-TID-02.md) | [Dagsljuset visar längd, ändring och dagar till vändningen](testfall/TC-TID-02.md) | Medel | 🤖 |
| [TC-TID-03](testfall/TC-TID-03.md) | [Namnsdagen visar streck om tjänsten inte svarar](testfall/TC-TID-03.md) | Låg | 🤖 |

## Väder

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-VAD-01](testfall/TC-VAD-01.md) | [Visar vädret nu och fem dagar framåt](testfall/TC-VAD-01.md) | Hög | 🤖 |
| [TC-VAD-02](testfall/TC-VAD-02.md) | [Visar tydligt när vädret inte kan hämtas](testfall/TC-VAD-02.md) | Medel | 🤖 |
| [TC-VAD-03](testfall/TC-VAD-03.md) | [Vädervyn visar klädtips, 24 timmar och regnradar](testfall/TC-VAD-03.md) | Medel | 🤖 |
| [TC-VAD-04](testfall/TC-VAD-04.md) | [På kvällen föreslås reflex när det är mörkt](testfall/TC-VAD-04.md) | Låg | 🤖 |
| [TC-VAD-05](testfall/TC-VAD-05.md) | [Om regnradarn inte svarar fungerar resten av vyn](testfall/TC-VAD-05.md) | Medel | 🤖 |

## SL-avgångar

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-SL-01](testfall/TC-SL-01.md) | [Avgångar visas i tidsordning och den som går nu markeras](testfall/TC-SL-01.md) | Hög | 🤖 |
| [TC-SL-02](testfall/TC-SL-02.md) | [Lägg till hållplats genom att söka](testfall/TC-SL-02.md) | Hög | 🤖 |
| [TC-SL-03](testfall/TC-SL-03.md) | [Välj bort buss så visas bara tunnelbana](testfall/TC-SL-03.md) | Medel | 🤖 |
| [TC-SL-04](testfall/TC-SL-04.md) | [Flera hållplatser visas var för sig](testfall/TC-SL-04.md) | Medel | 🤖 |
| [TC-SL-05](testfall/TC-SL-05.md) | [När SL inte svarar visas ett felmeddelande](testfall/TC-SL-05.md) | Medel | 🤖 |
| [TC-SL-06](testfall/TC-SL-06.md) | [Utan hållplats finns en knapp för att välja](testfall/TC-SL-06.md) | Medel | 🤖 |
| [TC-SL-07](testfall/TC-SL-07.md) | [Störning på en linje markeras i avgångarna](testfall/TC-SL-07.md) | Medel | 🤖 |
| [TC-SL-08](testfall/TC-SL-08.md) | [Flera störningar visas en i taget](testfall/TC-SL-08.md) | Låg | 🤖 |
| [TC-SL-09](testfall/TC-SL-09.md) | [Avgångarna visas om störningstjänsten inte svarar](testfall/TC-SL-09.md) | Medel | 🤖 |

## Norrsken

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-NOR-01](testfall/TC-NOR-01.md) | [Hög Kp, mörkt och klart visar "Troligt nu"](testfall/TC-NOR-01.md) | Medel | 🤖 |
| [TC-NOR-02](testfall/TC-NOR-02.md) | [På dagen visas "Möjligt i kväll"](testfall/TC-NOR-02.md) | Låg | 🤖 |
| [TC-NOR-03](testfall/TC-NOR-03.md) | [Ingen händelserad när det inte går att se norrsken](testfall/TC-NOR-03.md) | Medel | 🤖 |

## Flyg

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-FLY-01](testfall/TC-FLY-01.md) | [Nedre raden visar planet som passerar ovanför med rutt](testfall/TC-FLY-01.md) | Hög | 🤖 |
| [TC-FLY-02](testfall/TC-FLY-02.md) | [Helskärm med karta, etiketter och detaljer](testfall/TC-FLY-02.md) | Hög | 🤖 |
| [TC-FLY-03](testfall/TC-FLY-03.md) | [Radarvyn och räckvidden](testfall/TC-FLY-03.md) | Medel | 🤖 |
| [TC-FLY-04](testfall/TC-FLY-04.md) | [Om första flygkällan är nere används nästa](testfall/TC-FLY-04.md) | Medel | 🤖 |
| [TC-FLY-05](testfall/TC-FLY-05.md) | [När inga plan finns i närheten står det lugnt i luften](testfall/TC-FLY-05.md) | Låg | 🤖 |
| [TC-FLY-06](testfall/TC-FLY-06.md) | [Alla flygkällor nere ger ett tydligt besked](testfall/TC-FLY-06.md) | Låg | 🤖 |
| [TC-FLY-07](testfall/TC-FLY-07.md) | [Utan proxy förklaras vad som behövs](testfall/TC-FLY-07.md) | Hög | 🤖 |
| [TC-FLY-08](testfall/TC-FLY-08.md) | [Valt plan syns alltid på minikartan](testfall/TC-FLY-08.md) | Hög | 🤖 |
| [TC-FLY-09](testfall/TC-FLY-09.md) | [Nedre raden blinkar när ett plan kommer nära](testfall/TC-FLY-09.md) | Hög | 🤖 |
| [TC-FLY-10](testfall/TC-FLY-10.md) | [Ingen avisering när den är avstängd eller planet är för långt bort](testfall/TC-FLY-10.md) | Medel | 🤖 |

## Layout

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-LAY-01](testfall/TC-LAY-01.md) | [Liten skärm (dag): sol och namnsdag på en rad och i nivå, inga överlappande avgångar](testfall/TC-LAY-01.md) | Hög | 🤖 |
| [TC-LAY-02](testfall/TC-LAY-02.md) | [Liten skärm (natt): sol och namnsdag på en rad och i nivå, inga överlappande avgångar](testfall/TC-LAY-02.md) | Hög | 🤖 |

## Tema

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-TEM-01](testfall/TC-TEM-01.md) | [Dagtema när solen är uppe](testfall/TC-TEM-01.md) | Medel | 🤖 |
| [TC-TEM-02](testfall/TC-TEM-02.md) | [Natttema efter solnedgången](testfall/TC-TEM-02.md) | Medel | 🤖 |
| [TC-TEM-03](testfall/TC-TEM-03.md) | [Valt tema sparas](testfall/TC-TEM-03.md) | Låg | 🤖 |

## Plats

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-PLA-01](testfall/TC-PLA-01.md) | [Sök plats byter läge för väder och flyg](testfall/TC-PLA-01.md) | Hög | 🤖 |
| [TC-PLA-02](testfall/TC-PLA-02.md) | [Använd min position](testfall/TC-PLA-02.md) | Medel | 🤖 |

## Hemskärm

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-PWA-01](testfall/TC-PWA-01.md) | [Första start öppnar inställningarna](testfall/TC-PWA-01.md) | Hög | 🤖 |
| [TC-PWA-02](testfall/TC-PWA-02.md) | [Manifest och ikoner finns för hemskärmen](testfall/TC-PWA-02.md) | Medel | 🤖 |

## Manuellt på iPad

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-MAN-01](testfall/TC-MAN-01.md) | [Installera på hemskärmen och lås med Guidad åtkomst](testfall/TC-MAN-01.md) | Hög | 🖐️ |
| [TC-MAN-02](testfall/TC-MAN-02.md) | [SL-avgångarna stämmer med skylten](testfall/TC-MAN-02.md) | Hög | 🖐️ |
| [TC-MAN-03](testfall/TC-MAN-03.md) | [Planet ovanför stämmer med verkligheten](testfall/TC-MAN-03.md) | Låg | 🖐️ |
| [TC-MAN-04](testfall/TC-MAN-04.md) | [Byter till natt vid solnedgången och laddar om på natten](testfall/TC-MAN-04.md) | Medel | 🖐️ |
