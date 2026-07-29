# Verkaufsstatistik

Die Verkaufsstatistik zeigt eine umfassende Analyse der Vertragsverkäufe — pro Institut und pro Mitarbeiter, inklusive Hochrechnung bis zum Monatsende.

**Zugang:** Hub → Berichte → Verkaufsstatistik  
**URL:** `/hub/reports/sales-statistics`  
**Berechtigung:** `view_report_sales_statistics`

---

## Für Endanwender

### Was zeigt diese Seite?

Die Verkaufsstatistik gibt einen Überblick über alle abgeschlossenen Verträge (aktiv + abgeschlossen). Sie beantwortet Fragen wie:

- Wie viele Verträge wurden diesen Monat abgeschlossen?
- Wie hoch ist der Gesamtumsatz?
- Welches Institut verkauft am meisten?
- Welche/r Mitarbeiter/in hat die beste Verkaufsleistung?
- Wie wird der Monat voraussichtlich enden? (Hochrechnung)

### Sektionen

#### KPI-Dashboard

Oben auf der Seite werden 8 Kennzahlen angezeigt:

| KPI | Beschreibung |
|-----|-------------|
| **Verträge** | Gesamtanzahl der Verträge im Zeitraum |
| **Gesamtumsatz** | Summe aller Vertragswerte (€) |
| **Ø Vertragswert** | Durchschnittlicher Vertragswert |
| **Monatl. Raten** | Summe der monatlichen SEPA-Raten |
| **Ø Körperzonen** | Durchschnittliche Anzahl Körperzonen pro Vertrag |
| **Ganzkörper-Anteil** | Prozentsatz der Ganzkörper-Verträge |
| **SEPA / Direkt** | Verhältnis der Zahlungsmethoden |
| **Stornoquote** | Anteil stornierter Verträge |

Jede Kennzahl zeigt Vergleichswerte:
- **vs. Vormonat**: Veränderung zum letzten Monat
- **vs. Vorjahr**: Veränderung zum gleichen Monat im Vorjahr

#### Monatliche Übersicht

Zeigt die Verkaufsentwicklung über die letzten 12 Monate — standardmäßig als **Diagramm**, über das Register am rechten Kartenrand als Tabelle mit Δ-Spalten und Hochrechnung.

- **Aktueller Monat** ist farblich hervorgehoben und enthält die Hochrechnung (Prognose)
- **Δ VM**: Veränderung zum Vormonat in Prozent
- **Δ VJ**: Veränderung zum gleichen Monat letztes Jahr

#### Bestandskunden & Flex

Kompakter Kennzahlen-Ausweis (Stat-Strip) für den **aktuellen Monat** mit fairem Vormonatsvergleich zum gleichen Zeitpunkt (Same Point in Time):

- **Verträge an Bestandskunden** — Folgeverträge: derselbe Kunde (`client_id`) hatte zum Abschlusszeitpunkt bereits einen früheren Vertrag (beliebiger Status außer Entwurf); dazu der Anteil an allen Abschlüssen
- **KPZ an Bestandskunden** — Körperzonen aus diesen Folgeverträgen
- **Flex-Behandlungen** — durchgeführte Phorest-Termine (COMPLETED/PAID) mit „Flex" im Service-Namen (gleiche Logik wie die Startseiten-KPI „Flex-Services"); Flex läuft ohne Vertrag und taucht daher in den Vertragszahlen nicht auf

Der Standort-Filter der Seite wirkt auf beide Quellen. Endpoint: `existing-customer-flex` (`getExistingCustomerFlexStats()`).

#### Vertragslaufzeiten

Balkendiagramm: **Wie viele Verträge zahlen in wie vielen Raten?** Jeder Balken steht für eine Laufzeit (Anzahl der Raten ≙ Monate), die Höhe ist die Anzahl der Verträge. 1 Rate = Einmalzahlung (Direktzahler).

Die Checkbox **„Nur aktive Verträge"** (standardmäßig aktiviert) beschränkt die Auswertung auf aktuell laufende Verträge; abgewählt zählen auch bereits abgeschlossene mit.

Der **Laufzeit-Modus-Schalter** wechselt zwischen drei Sichten:

- **Festgesetzt** (Standard) — die im Vertrag vereinbarte Ratenanzahl (`installment_count`); enthält alle Verträge inkl. Altbestand
- **Reale Raten** — die tatsächliche Anzahl nicht stornierter Raten im Zahlungsplan (weicht z.B. nach Gutschein-Verrechnung ab)
- **Monate** — Kalendermonate von der ersten bis zur letzten Rate (inkl. Pausen/Verschiebungen)

„Reale Raten" und „Monate" basieren auf dem Hub-Zahlungsplan: Verträge **ohne** Zahlungsplan (v.a. Legacy-Altbestand) werden dort ausgeblendet — die Anzahl steht als Hinweis unter dem Diagramm. Bei migrierten Altverträgen kann der Plan zudem erst ab der Migration beginnen (zeigt dann nur die Rest-Laufzeit). Generell gilt: Detaildaten auf Raten-Ebene gibt es erst seit Einführung von **GoCardless** — davor ist nur die festgesetzte Ratenanzahl bekannt.

**Ausreißer-Laufzeiten:** Angeboten werden nur 18/19/24 Monate; andere Werte im „Festgesetzt"-Modus stammen ausnahmslos aus dem Legacy-Altbestand (Analyse Juli 2026, 66 aktive GK-Fälle): (1) individuell verlängerte Ratenzahlung (Alt-System „länger", häufigster Fall), (2) beim Import übernommene *Rest*-Laufzeit teilbezahlter Verträge, (3) Import-Artefakt „25 statt 24" (v1-Formel `sepa_months + 1`), (4) alte Angebote (12-Monats-Pakete, 9er-Karten). Dokumentiert auch im Info-Panel der Card.

Über den **Körperzonen-Filter** im Card-Header lässt sich die Auswertung einschränken:

- **Alle Verträge** (Standard)
- **Nur Ganzkörper** — nutzt das Ganzkörper-Kennzeichen des Vertrags (`is_full_body`). Das ist genauer als eine feste KPZ-Zahl, weil Ganzkörper je nach Preisliste als 6 *oder* 7 Körperzonen definiert war
- **1–7 KPZ** — exakte Anzahl Körperzonen im Vertrag

Damit lässt sich z.B. direkt ablesen, wie viele Ganzkörper-Kunden in 24 bzw. 19 Monatsraten zahlen. Ungewöhnliche Laufzeiten (13, 17, 23 Raten …) stammen meist aus Vertragsänderungen oder Legacy-Importen.

#### Zahlungsausfälle nach Ratenfortschritt

Beantwortet die Frage: **Platzen Lastschriften häufiger, je weiter der Vertrag fortgeschritten ist** (z.B. wenn die Behandlung bereits abgeschlossen ist)?

Zwei Ansichten (Segmented-Control „Viertel / Ratenmonat"):

- **Viertel** — die Laufzeit jedes Ratenvertrags wird in vier gleiche Viertel geteilt; jede verarbeitete Rate wird ihrem Viertel zugeordnet (bei 24 Raten: Rate 1–6 → 1. Viertel, Rate 19–24 → 4. Viertel). Balkendiagramm; die Zahlen dahinter stehen im Register **Tabelle**
- **Ratenmonat** — Liniendiagramm mit der Ausfallquote **je einzelner Ratennummer** (Rate 1, 2, 3 …) zur **Kipppunkt-Suche**: gibt es einen Monat, ab dem die Quote sprunghaft steigt? Am besten mit dem Laufzeit-Filter kombinieren, damit „Rate N" überall denselben Fortschritt bedeutet

Je Ansicht zwei Quoten:

- **Geplatzt (offen)** — Raten, die aktuell auf `failed`/`chargedback` stehen
- **Jemals geplatzt** — zusätzlich Raten, die nach einer Rücklastschrift im Wiederholungsversuch doch noch bezahlt wurden (`retry_count > 0`)

**Filter:** Körperzonen (z.B. „Nur Ganzkörper") **und Laufzeit** (18 / 19 / 18,19 / 24 festgesetzte Raten) — damit lässt sich z.B. gezielt „Ganzkörper · 24 Raten" auswerten. Der Schalter **„% / Anzahl"** wechselt das Diagramm zwischen Ausfallquote und absoluter Anzahl geplatzter Raten (reine Anzeige-Umschaltung, kein Server-Request).

**Vergleichsmodus:** Die Checkbox „Vergleichen" blendet eine zweite Filter-Kombination als Serie B ein (eigene KPZ-/Laufzeit-Dropdowns, Farben blau/gold). Typische Vergleiche: „3 KPZ" vs. „Ganzkörper · 18/19 Raten", oder „Ganzkörper · 24 Raten" vs. Gesamtmenge (Serie B auf „Alle" lassen). In der Viertel-Ansicht erscheint eine Vergleichstabelle mit beiden Serien.

**Zu beachten:** Späte Viertel bzw. hohe Ratennummern haben weniger Raten (viele Verträge sind noch nicht so weit) — kleine Grundmengen machen die Quote empfindlicher für Ausreißer.

### Sales Mix — Paket-Umfang

Monatsweise Verteilung nach verkauftem Umfang: **1, 2, 3, 4, 5+ Körperzonen** sowie **Ganzkörper (GK)** — als gestapeltes Balkendiagramm über die **vollständige Historie** (Zeitraum per Schieberegler unten eingrenzbar, Start: letzte 13 Monate). Umschalter (rein clientseitig, kein Neuladen): **Stückzahl / Umsatz** und **Absolut / Anteil %**.

Ein **Perspektiven-Umschalter** wählt zwischen zwei Sichten:

- **Verkauft** (Standard): die **in dem Monat abgeschlossenen** Pakete abzüglich Widerrufe (Status widerrufen oder akzeptierter Widerruf). Verträge mit geplatzten Raten (Rücklastschrift/Chargeback) zählen bewusst weiter mit — das Paket wurde in dem Umfang verkauft, unabhängig vom Zahlungsverlauf.
- **Laufend** (Portfolio): die **in dem Monat laufenden** Verträge nach der **bei Abschluss geplanten Laufzeit** (Monate = `installment_count`, Fallback `legacy_kredit_monate`), unabhängig von tatsächlichen oder geplatzten Einzügen. Ein Vertrag läuft von seinem Start-Monat (`first_payment_date`, Fallback `signed_at`) über die geplante Monatszahl. Widerrufene Verträge zählen nicht; **Direktzahler ohne geplante Laufzeit sind nicht enthalten**. So sieht man, wie sich das aktive Vertrags-Portfolio nach Paketgröße über die Zeit zusammensetzt.

Die GK-Klassifizierung ist **zeitpunktgenau**: Ein Vertrag zählt als Ganzkörper, wenn seine Körperzonen-Anzahl die GK-Grenze der Preisliste erreicht, die **zum Verkaufszeitpunkt** galt (heute ab 6, früher ab 7 — keine rückwirkende Umklassifizierung). Hub-Verträge nutzen die am Vertrag hinterlegte Preisliste; Altverträge ohne Preislisten-Referenz werden über das Unterschriftsdatum aus der Preislisten-Historie zugeordnet. Die Kategorie „5+ KPZ (unter GK)" fängt Verträge mit fünf oder mehr Zonen unterhalb der damaligen GK-Grenze (z.B. 6 Zonen, als GK noch ab 7 begann).

### Neukunden pro Monat

Anzahl neuer Kunden pro Monat, gestapelt je Institut (Institutsfarben), über die **vollständige Historie** (Schieberegler unten, Start: letzte 13 Monate). **Neukunde = ab dem ersten Beratungsgespräch** — gezählt im Monat und Institut des ersten BGs; Rückkehrer bleiben dauerhaft Bestandskunden. Datenquelle ist die vollständige Phorest-Terminhistorie (ohne den `client_statistics`-Stichtag).

Beide neuen Charts (und die Körperzonen-Charts) haben ein **Serien-Hover-Highlight**: beim Überfahren einer Serie wird diese über alle Monate hervorgehoben, der Rest gedimmt (`emphasis: { focus: 'series' }`, verbindliche Konvention für Balken-Charts — siehe `charts.instructions.md`).

### Lastschriften-Bestand & Einzugsvolumen (MRR)

Das monatliche Lastschrift-Einzugsvolumen als **gestapeltes Flächenchart** über die **volle Historie** — die Gesamthöhe je Monat ist das fällige Volumen, zerlegt in vier Bänder (Standard-Zoom: alles, Regler unten grenzt ein). Zusätzlich die Anzahl aktiver Mandate auf der rechten Achse (über die Legende ausblendbar). Ersetzt die frühere Alt-Auswertung „Wert der Lasts. gesamt" aus dem Legacy-System.

- **Eingezogen** (grün) — Raten mit Status bezahlt/bestätigt (per Lastschrift).
- **RLS nachgezahlt** (gold) — ursprünglich geplatzte Raten, die nachträglich beglichen wurden (Überweisung/bar/Karte) — wirtschaftlich also doch eingegangen. Zugeordnet zum Fälligkeitsmonat der Rate, nicht zum Zahlungseingang.
- **Noch offen** (grau) — in dem Monat fällig, aber noch nicht eingezogen (scheduled/pending) — im laufenden Monat naturgemäß hoch, in abgeschlossenen Monaten nahe null.
- **Rücklastschriften** (rot) — endgültig geplatzte Raten (failed/chargedback), die zu den in dem Monat fälligen Zahlungen gehören; ihr Anteil am Volumen entspricht der Quote aus „Rücklastschriften pro Monat" (~2–3 %).

**Datenquelle & nahtloser Übergang:** Bis **05/2026** stammen die Monatswerte aus der manuellen Alt-Auswertung (Legacy-CSV, in `legacy_lastschrift_stats` geseedet: Volumen = „Wert der Lasts. gesamt", RLS = „Original Wert der RLS"; „Noch offen" und „RLS nachgezahlt" gibt es dort nicht, Einzug = Volumen − RLS). **Ab 06/2026** aus dem echten Zahlungsplan (`contract_payments`) — seit 06/2026 läuft jeder Lastschrift-Einzug ausschließlich über GoCardless (Prod), das Hub-Zahlungsbuch ist ab da die maßgebliche Quelle (fester Schnitt: `SalesStatisticsService::HUB_LEDGER_START_MONTH`). Die Übergangsmonate liegen im Hub-Buch leicht unter der Alt-Auswertung (06/2026: −8.460 € = −2,3 %, 07/2026: −5.049 € = −1,3 % — im Alt-Report zählten noch Einzüge des Altsystems mit). Die Hub-Anlaufmonate 03–05/2026 haben nur wenige Raten und kommen deshalb weiterhin aus der Alt-Auswertung.

Die Alt-Historie ist ein **Gesamt-Aggregat ohne Standort-/Verkäufer-/KPZ-Split** und wird deshalb nur **ohne** solche Filter gezeigt; mit aktivem Standort-Filter greifen nur die (branchenscharfen) Hub-Zahlungen ab Hub-Start.

**Instituts-Ansicht:** Der Umschalter „Gesamt / Institute" im Card-Header wechselt von den vier Bändern zum **Einzugsvolumen je Institut** (gestapelte Flächen in den Instituts-Farben; Summe = Monats-Total der Gesamt-Ansicht). Historie 06/2020–04/2026 aus der Alt-Auswertung je Institut (CSV „Neues SEPAs Kontrolle", Spalten „Total BI/H/OS/HB/BS", geseedet in `legacy_lastschrift_branch_stats` mit Phorest-Branch-IDs), ab 06/2026 aus dem Zahlungsplan je Standort. **05/2026** ist per Nachtrags-Migration gefüllt (Übergangsmonat ohne direkten Messwert — der GC-Plan war je Standort noch unvollständig): Werte **modelliert** als lineare Interpolation je Institut zwischen April (Alt) und Juni (GC), gemeinsam auf das Alt-Gesamttotal 346.760 € skaliert (×1,01456, Rundungsrest auf Bielefeld) — jeder Wert liegt zwischen seinem April- und Juni-Wert, Summe = Alt-Total exakt (Migration `2026_07_28_110000`). Nur 01–05/2020 bleiben ohne Aufteilung (Instituts-Spalten der Alt-CSV beginnen 06/2020; Tooltip erklärt). Bei aktivierter Prognose läuft jedes Institut schraffiert weiter (eigener Stack, Nahtstelle auf dem Ist-Wert).

**Prognose (24 Monate):** Der Umschalter „Prognose (24 Monate)" im Card-Header verlängert den Chart in die Zukunft. Das grün schraffierte Band zeigt je Monat die Summe der **bereits vertraglich vereinbarten Raten** (geplante Lastschriften `scheduled`/`pending`/`submitted` plus vereinzelt vorab beglichene Zukunftsraten) — also die feststehenden Einnahmen aus dem Bestand, ohne künftige Neuabschlüsse, Storni und Rücklastschriften (Untergrenze). Quelle ist derselbe Zahlungsplan (`contract_payments`), aus dem auch die GoCardless-Einzelzahlungen erzeugt werden — Plan und GoCardless sind damit per Konstruktion deckungsgleich; GoCardless selbst hält seit der Subscription-Ablösung kaum Zukunftsdaten. Eine goldene gestrichelte Linie markiert den Übergang Ist → Prognose (Label wie die Jahreszahlen), die Mandate-Linie läuft gestrichelt weiter (Verträge mit vereinbarten Raten im jeweiligen Monat). Horizont: bis zur letzten geplanten Rate, max. **+24 Monate**. Stand 07/2026 stecken rund **4 Mio. € vereinbarte Raten** in den nächsten 24 Monaten; der Verlauf fällt mit auslaufenden Verträgen treppab (Knick um 05–06/2027, wenn die großen 2025er-Kohorten auslaufen).

### Rücklastschriften pro Monat

Die Rücklastschriften (RLS/Chargebacks) je **Fälligkeitsmonat** über die **volle Historie** — als **Quote** (Anteil geplatzter Raten nach Anzahl und nach Wert) oder als absolute **Anzahl** (Umschalter, rein clientseitig). Ordnungsgröße für die Gesundheit des Lastschrifteinzugs; ergänzt die Sektion „Zahlungsausfälle nach Ratenfortschritt", die dieselben Daten nach Vertragsphase statt Kalendermonat auswertet.

**Gleiche Datenbasis wie der MRR-Chart:** Bis 05/2026 die Alt-Auswertung — Anzahl („Anzahl der RLS" ÷ „Anzahl der Lasts. gesamt") und Wert („Original Wert der RLS" ÷ „Wert der Lasts. gesamt") kommen als Monats-Aggregate aus der CSV; Nachzahlungen sind dort unbekannt. Ab 06/2026 das Hub-Zahlungsbuch: Basis sind **verarbeitete Raten** (Einzugsversuch erfolgt: `paid`/`confirmed`/`failed`/`chargedback`); noch geplante/offene Raten (`scheduled`/`pending`) zählen nicht mit, damit die Quote nicht künstlich sinkt. Standard-Zoom: volle Historie.

Raten, die nach einer Rücklastschrift doch noch bezahlt wurden (Wiederholungseinzug oder manuelle Begleichung), zählen nicht mehr als RLS — die Quote zeigt den **endgültigen Ausfall**. Manuell nachgezahlte RLS werden im Tooltip separat als **„Nachgezahlt"** ausgewiesen (Anzahl + Wert).

### Direktzahler-Segment

Die direkt (ohne Ratenzahlung) bezahlten Abschlüsse je Abschlussmonat: **Kunden, Körperzonen oder Umsatz** als Balken (Metrik-Umschalter), der **%-Anteil an allen Abschlüssen** des Monats als Linie auf der rechten Achse. Der Tooltip zeigt zusätzlich den Ø-Umsatz pro Kunde. Volle Historie, Zoom-Regler wie bei den übrigen Monats-Charts.

### Tabellen-Ansicht (Diagramm ↔ Tabelle)

Jede Diagramm-Karte hat am **rechten Rand ein Register** mit den beiden Reitern **Diagramm** und **Tabelle** — wie die Register in einem Ordner: Der gewählte Reiter ragt weiter heraus und liegt vorn, der andere schaut kürzer und dunkler dahinter hervor. Die Tabelle zeigt exakt dieselben Daten wie das Diagramm — nur eben zum Ablesen und Abtippen statt zum Überfliegen.

> **Projektweite Konvention:** So ist **jede** Statistik-Karte im Hub aufgebaut — Zahlen werden grafisch dargestellt, wo immer das sinnvoll möglich ist, und bleiben zugleich als Tabelle abrufbar. Das Diagramm ist dabei immer die Standard-Ansicht, die Tabelle liegt dahinter. Verbindliche Fassung: `.github/instructions/statistics-pages.instructions.md`, Abschnitt 3.

- **Zusammengefasst und aufklappbar:** Lange Zeitreihen erscheinen als **Jahr → Quartal → Monat** (beim Chart „Körperzonen pro Tag" zusätzlich → **Tag**). Beim Öffnen ist das aktuelle Jahr samt aktuellem Quartal bereits aufgeklappt, ältere Zeiträume sind eingeklappt und zeigen nur ihre Summen. Ein Klick auf eine Gruppenzeile klappt sie auf oder zu.
- **Immer die volle Historie:** Anders als das Diagramm hängt die Tabelle nicht am Zoom-Regler — auch weit zurückliegende Jahre sind ohne Umweg erreichbar.
- **„Mehr laden":** Sind mehr Zeilen aufgeklappt als angezeigt werden, erscheint am Fuß der Tabelle ein Knopf „Mehr laden" samt Hinweis „Zeigt X von Y Zeilen" (Schritte à 50 Zeilen).
- **Gesamtzeile** am Fuß über alle Daten der Karte.
- Der Umschalter wirkt nur auf die Darstellung: Filter, Metrik-Umschalter und der Brutto/Netto-Schalter gelten für Diagramm und Tabelle gleichermaßen. Beispiel Sales Mix: „Stückzahl/Umsatz" und „Absolut/Anteil %" schlagen auch in der Tabelle durch — in der %-Ansicht zeigen die Kategorie-Spalten ihren Anteil am jeweiligen Zeitraum, die Spalte „Gesamt" bleibt der absolute Bezugswert.

Eine Karte hat bewusst **kein** Register, weil sie ihre Zahlen ohnehin schon tabellarisch zeigt: die **Monatliche Übersicht** (eigene Tabelle mit Δ-Spalten und Hochrechnung).

Bei den **Zahlungsausfällen nach Ratenfortschritt** lag die Detailtabelle früher fest unter dem Diagramm; seit 07/2026 sitzt sie wie überall im Register. Sie zeigt je Laufzeit-Abschnitt bzw. Ratenmonat die verarbeiteten Raten, „Geplatzt (offen)" und „Jemals geplatzt" samt Quoten — im Vergleichsmodus beide Serien nebeneinander. Die Quoten der Gesamtzeile werden aus den Summen gerechnet, nicht über die Abschnitte gemittelt.

Worauf beim Lesen der zusammengefassten Zeilen zu achten ist:

- **Aktive Mandate** (Lastschriften-Bestand) sind eine Bestandsgröße und werden **nicht summiert** — für ein Quartal oder Jahr gilt der Wert des jüngsten enthaltenen Monats.
- **Quoten** (RLS-Quote, Direktzahler-Anteil) werden für Gruppen aus den Summen des Zeitraums berechnet, nicht als Mittelwert der Monatsquoten.
- Beim **Standort-Vergleich seit Eröffnung** zeigt die Tabelle Summen je Zeitraum, während das Diagramm gleitende Durchschnitte bzw. kumulierte Werte darstellt. Leere Zellen bedeuten: Der Standort war zu diesem Zeitpunkt noch nicht eröffnet.

### Brutto/Netto-Umschalter

Ein **globaler Umschalter im Seitenkopf** rechnet **alle Euro-Werte der gesamten Seite** zwischen brutto und netto um (netto = brutto ÷ 1,19) — KPI-Kacheln, Tabellen (Monatsübersicht, Chart-Tabellen) und alle €-Charts (MRR, Direktzahler, Sales-Mix-Umsatz, Monatschart, Standort-Vergleich). Prozentwerte und Stückzahlen bleiben unverändert. Die Wahl wird pro Nutzer in `localStorage` gemerkt.

### Standort-Filter

Der Standort-Filter in der Seitenleiste filtert alle Daten auf ein bestimmtes Institut. Bei Wechsel des Standorts werden alle Sektionen automatisch neu geladen.

### Ladeverhalten

Beim Öffnen steht das Kartenraster **sofort in seiner Endhöhe**: Jede Karte zeigt Titel und Umschalter, im Kartenkörper bis zum Eintreffen der Daten einen layoutgetreuen Platzhalter (Diagramm, Kennzahlen-Zeile, Tabelle). Die Sektionen laden weiterhin parallel und unabhängig — es springt dabei aber nichts mehr, auch nicht mobil und nicht beim Filtern. Fällt eine einzelne Auswertung aus, meldet nur diese Karte den Fehler (mit „Erneut laden") in derselben Höhe; die übrigen Analysen bleiben nutzbar.

Details und die verbindliche Bauform: [Ladeverhalten der Statistikseiten](LADEVERHALTEN-STATISTIKSEITEN.md).

### Hochrechnung

Die Hochrechnung (Prognose) schätzt die erwartete Vertragsanzahl und den Umsatz bis zum Monatsende. Sie wird mit einem blauen Badge gekennzeichnet.

Die Prognose basiert auf **Verkaufstagen** (Mo–Sa, ohne Sonn- und Feiertage) statt auf Kalendertagen. Dadurch werden Monate mit vielen Feiertagen (z.B. Ostern, Weihnachten) fair mit normalen Monaten verglichen.

Bei einem Standort-Filter werden die **regionalen Feiertage** des jeweiligen Bundeslandes berücksichtigt. Ohne Standort-Filter zählen nur **bundesweite Feiertage**.

Die Rechnung ist überall dieselbe:

```
Prognose = (Ist-Wert / Verkaufstage bisher) × Verkaufstage gesamt
```

Hochgerechnet werden **Körperzonen, Verträge und Gesamtumsatz** sowie die **Δ-Werte** des laufenden Monats
(Δ Vormonat / Δ Vorjahr auf Basis der Prognose — der Ist-Vergleich eines angefangenen Monats gegen einen vollen
Monat fällt sonst zwangsläufig zu niedrig aus). Ø-Vertragswert, Ø KPZ und GK-Anteil bekommen bewusst **keine**
Prognose: Als Verhältniszahlen ändern sie sich durch die Hochrechnung nicht.

In der Monatlichen Übersicht steht die Prognose in der Tabelle blau unter dem Ist-Wert (mit Fortschrittsbalken
„N von M Verkaufstagen"). Im Diagramm liegt der Prognosepunkt als hohler Kreis **senkrecht über dem Ist-Wert
des laufenden Monats**, verbunden durch eine gestrichelte Linie ab dem Vormonat; der Keil zwischen Ist- und
Prognoselinie ist in der Serienfarbe schraffiert. Umgesetzt ist das über zwei gestapelte Hilfsserien je Metrik
(`monthly-fc-<key>-base` mit den Ist-Werten, unsichtbar, plus `monthly-fc-<key>` mit der Differenz bis zur
Prognose) — durch das Stapeln füllt die Fläche der oberen Serie exakt den Keil. Die Schraffur ist ein
Canvas-Muster (`hatchPattern()`), das ECharts als `areaStyle.color` akzeptiert. Beide Hilfsserien tragen den
Namen der Hauptserie, damit die Legende sie mitschaltet, und werden im Tooltip herausgefiltert; die
Prognosewerte stehen dort als eigener Block „Hochrechnung bis Monatsende". Die Serie **Verträge** liegt auf
der zweiten Achse und bekommt bewusst **keine** Schraffur — überlagerte Flächen sind unlesbar.

Das ist kein Einzelfall-Design, sondern die **projektweite Konvention für Prognosen in Charts**:
`.github/instructions/charts.instructions.md`, Abschnitt „Prognosen im Chart".

Umsatz und monatliche Raten werden aus den hochgerechneten Verträgen × dem aktuellen Ø-Vertragswert abgeleitet.
**Monatliche Übersicht, Institut-Ranking, Verkäufer-Ranking und Körperzonen-Diagramm nutzen exakt dieses
Verfahren** — die Prognosen der Karten passen deshalb zueinander (die Summe der Instituts-Prognosen ergibt die
Gesamt-Prognose).

Zwei Eigenschaften der Hochrechnung:

- Sie liegt **nie unter dem bereits erreichten Ist-Stand** — bis Monatsende können nur Verkäufe dazukommen.
- Schneidet ein **Datumsfilter den laufenden Monat an**, entfällt die Hochrechnung, weil der Ist-Wert dann
  unvollständig wäre.

---

## Für Entwickler

### Architektur

Die Seite folgt dem bewährten Statistik-Muster: **Controller → Service → JSON-API → Alpine.js**.

```
SalesStatisticsController (app/Http/Controllers/)
├── index()            → Blade-View rendern
├── kpis()             → JSON: 8 KPI-Metriken
├── monthly()          → JSON: Monatliche Übersicht + Hochrechnung
├── branches()         → JSON: Institut-Ranking (nur noch für das Dashboard-Widget)
├── sellers()          → JSON: Mitarbeiter-Ranking (nur noch für das Dashboard-Widget)
├── projection()       → JSON: Detail-Hochrechnung
├── contractTerms()    → JSON: Vertragslaufzeiten (Verteilung nach Raten)
├── paymentFailures()  → JSON: Ausfallquote nach Ratenfortschritt
├── mrr()              → JSON: Lastschriften-Bestand & Einzugsvolumen (Soll/Ist)
├── chargebacks()      → JSON: Rücklastschriften je Fälligkeitsmonat
└── directPay()        → JSON: Direktzahler-Segment über die Zeit

SalesStatisticsService (app/Services/)
├── getKpis()                      → KPI-Berechnung mit Vergleichswerten
├── getMonthlyOverview()           → Monatsdaten mit Δ-Werten
├── getBranchRanking()             → Institut-Ranking + Projektionen
├── getSellerRanking()             → Mitarbeiter-Ranking + Projektionen
├── getProjection()                → Gesamt-Hochrechnung (Detail)
├── getContractTermsChart()        → Verteilung nach installment_count
├── getPaymentFailuresByProgress() → Raten-Ausfälle in Laufzeit-Vierteln
├── getMrrTrend()                  → Einzugsvolumen gestapelt (Legacy-CSV + contract_payments)
├── getChargebackTrend()           → RLS-Quote/Anzahl je Fälligkeitsmonat
└── getDirectPayTrend()            → Direktzahler je Abschlussmonat (payment_method = direct)
```

**Filter:** Alle Endpoints akzeptieren `branch_id`, `date_from`, `date_to`, `seller_id` sowie `body_zones` (`full` = Ganzkörper via `is_full_body`, numerisch = exakte KPZ-Anzahl). Der KPZ-Filter wird von den Sektionen „Vertragslaufzeiten" und „Zahlungsausfälle" genutzt. `contract-terms` kennt zusätzlich `only_active=1` (nur Status `active`) und `term_mode` (`actual` = reale Raten aus `contract_payments`, `months` = Kalendermonate erste↔letzte Rate + 1, berechnet in PHP via Carbon — portabel für SQLite-Tests; ohne Parameter: festgesetzte Ratenanzahl). Bei `actual`/`months` liefert die Antwort `excluded_without_plan` (Verträge ohne Zahlungsplan, die ausgeblendet wurden). `payment-failures` kennt zusätzlich `installments` (kommaseparierte Laufzeiten, z.B. `18,19`) und `group=installment` (Buckets je Ratennummer statt Viertel; Antwort-Feld `group`). Der Vergleichsmodus ist rein clientseitig: das Frontend ruft den Endpoint zweimal mit unterschiedlichen Filtern auf.

**Charts:** Seit Juli 2026 laufen **alle** Diagramme der Seite auf **Apache ECharts** (Migration von Chart.js abgeschlossen, siehe `charts.instructions.md`):

- **Körperzonen pro Institut:** gruppierte Balken mit grauem Gesamt-Balken im Hintergrund (versteckte Zweitachsen), Prognose-Split für den aktuellen Monat (halbtransparent), Widerrufe als rot schraffierte Stapelung (ECharts-`decal`), mögl. Widerrufe als orange schraffierter Anteil oben im aktiven Balken. Zeitraum über den **Zoom-Regler** (`dataZoom` über **beide** Kategorie-Achsen — Institute und Gesamt-Balken —, Standard: letzte 12 Monate); die frühere Monats-Mehrfachauswahl im Kartenkopf wurde 07/2026 entfernt. Der feste Max-Wert der versteckten Gesamt-Achse und die Wert-Labels werden im `datazoom`-Event nachgeführt: Labels erscheinen erst ab ≤ 26 sichtbaren Spalten, sonst verschmelzen sie über die volle Historie zum Zahlenteppich. Widerruf-Serien tragen denselben Seriennamen wie ihr Institut — ein Legenden-Klick toggelt beide zusammen. Klick auf einen Balken öffnet den Verkäufer-Drill-Down.
- **Körperzonen pro Tag:** gestapelte Tagesbalken über die **gesamte Historie**; der Zeitraum wird ausschließlich über den **Zoom-Regler** (`dataZoom`, Slider + Mausrad/Pinch) gesteuert — die frühere Monats-Mehrfachauswahl wurde entfernt. Standard-Zoom: letzte 60 Tage. **Achse und Zebra passen sich der sichtbaren Spanne an** (Muster aus `booking-outlook.js`): bis ~190 Tage Tages-Labels (⭐ Feiertage, Sonn-/Feiertage grau) + Wochen-Zebra, bis ~400 Tage KW-Labels an Montagen, darüber Monats-Labels (mittig am 15.) — ab KW-Modus wird das Zebra auf Monats-Bänder umgeschaltet (Umschaltung live im `datazoom`-Event über die Serien-`id: 'zebra'`). **Jahresgrenzen** sind als dunkle vertikale `markLine` mit Jahreszahl markiert. Gesamtzahl je Tag über dem Stapel (unsichtbare Hilfsserie mit `hideOverlap`). Über einen **Ø-Umschalter** (Segmented Control: aus / 7 / 28 Tage) lassen sich gleitende Durchschnitte als Linien einblenden — je Standort in Standortfarbe plus graue Gesamt-Linie (trailing über Kalendertage, `null` bis das Fenster voll ist). Bei aktivem Ø treten die Balken in den Hintergrund (Opacity 0,35, ohne Wert-Labels) und der Tooltip zeigt primär den Ø-Wert, den Tageswert in Klammern; ab dem KW-/Monats-Achsenmodus (> ~190 Tage sichtbar) werden die Tagesbalken komplett ausgeblendet (Serien-Daten per id geleert/zurückgesetzt — kein Re-Render, das Ziehen am Regler bleibt flüssig). Die **y-Achse skaliert nicht auf die sichtbaren Tage** (sonst springt der Chart beim Verschieben der Zoom-Leiste), sondern auf das Maximum eines auf mindestens 12 Monate erweiterten Fensters um die sichtbare Spanne (auf runde Stufen aufgerundet, live im `datazoom`-Event nachgeführt); bei aktivem Ø bestimmt das Ø-Gesamt-Maximum die Skala — einzelne Top-Tage dürfen dann oben abschneiden. Ø-Linien tragen denselben Seriennamen wie die Balken ihres Standorts → ein Legenden-Klick schaltet beide gemeinsam.
- **Standort-Vergleich seit Eröffnung:** Linien-Chart, bei dem jede Standort-Linie auf **Tag 0 = erster Verkaufstag des Standorts** ausgerichtet ist — so sind die Anlaufkurven der Institute direkt vergleichbar. Ansichten: Ø 28 Tage / Ø 3 Monate (91 Tage, trailing) / Kumuliert; Metrik-Switch KPZ ↔ Umsatz (Brutto-Vertragswert). x-Achse adaptiv in Monaten/Jahren seit Eröffnung, Zoom-Regler in Tagen, Tooltip zeigt je Standort das echte Kalenderdatum. Gleiches Standard-Kit wie der Tages-Chart: Zebra-Blöcke (jeder zweite Monat/Quartal/Jahr **seit Eröffnung**, adaptiv zur sichtbaren Spanne), dunkle Jahrestrenner („Jahr 1", „Jahr 2" …) und feste y-Skala (Maximum je Quartals-Block, sichtbare Spanne auf ≥ 12 Monate erweitert, Legenden-Auswahl zählt mit — kein Springen beim Schieben). Eigener Endpoint `branch-opening-comparison` (`getBranchOpeningComparison()`) — bewusst **ohne Filter**, der Vergleich braucht immer alle Standorte. **Tag 0 ist nicht einfach der erste Vertrag:** Der Legacy-Import enthält vereinzelt Verträge mit unplausiblem `signed_at` Monate vor dem echten Verkaufsstart (07/2026 gemessen: Bremen 258 Tage, Osnabrück 148 Tage — beide mit hoher Legacy-Kundennummer, also sicher keine Erstkunden). Ein solcher Einzelvertrag zöge Tag 0 nach vorn: monatelange Nulllinie am Anfang, verschobene Jahresgrenzen, gedrückter gleitender Durchschnitt. Deshalb gilt als Tag 0 der erste Verkaufstag, dem **innerhalb von `OPENING_MAX_GAP_DAYS` (60) Tagen ein weiterer Verkaufstag folgt** — echte Anlaufphasen haben nie mehr als 25 Tage Pause, die Schwelle trennt also mit großem Abstand. Der übersprungene Vorlauf steht je Standort als `pre_opening` in der Antwort und wird **unter dem Diagramm ausgewiesen** (keine stille Bereinigung); in allen anderen Auswertungen bleiben die Verträge unverändert enthalten. Der CSV-Export `sales-opening-comparison` nutzt dieselbe Quelle und erbt die Regel.
- **Monatliche Übersicht (Chart-Ansicht):** Linien-Chart mit zwei y-Achsen (Umsatz/Raten in €, Verträge).
- **Bestands-Charts (MRR, Rücklastschriften, Direktzahler):** volle Historie ab 01/2020 als Standard-Zoom, gemeinsames Deko über die Helper `monthlyYearDecor(months, zoom, edgeAxisIndex)` / `updateMonthlyZebra(chart, months, dz, edgeAxisIndex)` (`echarts-glattt.js`) — unsichtbare Serie (id `year-decor`) auf einer eigenen **Kanten-Achse** (`categoryEdgeAxis()`) mit **adaptivem Zebra**: > 36 sichtbare Monate = Jahres-Streifen, 13–36 = Quartale, ≤ 12 = Monate (Parität an absolute Kalenderwerte gebunden → zoomstabil; Umschaltung live im `datazoom`-Event per Serien-id, kein Re-Render) + dunkle Jahrestrennlinien mit Jahreszahl (immer sichtbar; Label per `offset: [-9, 22]` rechts der Linie — also IM markierten Jahr — und unter die Plot-Oberkante gezogen; gilt projektweit für alle Jahres-markLines). Muster wie „Körperzonen pro Tag". Die Mandate-Linie läuft durchgezogen mit Punkten in `--color-info`, rechte Achse in derselben Farbe. Der MRR-Stapel nutzt leicht transparente Verlaufsflächen (`withAlpha()` + `LinearGradient`, 0,6 → 0,22) mit farbiger Decklinie, das Rücklastschriften-Band ein rot-weißes 45°-Streifenmuster als Canvas-Pattern (`diagonalStripePattern()` — `areaStyle` kann kein ECharts-`decal`; halbtransparente Streifen, damit das Zebra durchscheint). **Klick-Freistellung** über `enableSeriesIsolation(chart)` aus dem gemeinsamen Helper `public/js/echarts-glattt.js` (projektweite Pflicht-Konvention, siehe `charts.instructions.md`): Klick auf Balken/Fläche/Linie blendet alle anderen Serien aus (per Legenden-Auswahl), erneuter Klick zeigt wieder alle; Linien-Serien brauchen dafür `triggerLineEvent: true`. Ausnahme: der Körperzonen-pro-Institut-Chart (Klick = Verkäufer-Drill-Down). Die Fußnoten unter den drei Charts sind bewusst einzeilig — alle Details stehen in den Info-Panels (eigene Sektion „Bedienung").
- **Animierte Übergänge (seit 07/2026, projektweite Pflicht-Konvention):** Alle elf Charts der Seite blenden beim Neuzeichnen sichtbar von den alten auf die neuen Werte über, statt hart umzuspringen — bei Filter-, Metrik- und Ansichtswechseln ebenso wie beim Brutto/Netto-Umschalter. Technisch: Die ECharts-Instanz wird über `acquireChart(el, instance)` (`public/js/echarts-glattt.js`) **wiederverwendet** statt bei jedem Render `dispose()` + `init()` zu fahren (das verschluckte jeden Übergang); die Animationsparameter kommen einheitlich aus `chartAnimation(isUpdate)` (~0,45 s, `cubicOut`, leichter Versatz über die Kategorien). Jede Serie trägt dafür eine **stabile `id`**, die an ihrer Rolle bzw. am Datenfeld hängt (`mrr-collected_cents`, `branch-<id>`) und nicht am Anzeigenamen — sonst ordnet ECharts alt und neu nicht zu. `setOption` läuft mit `{ notMerge: true }`, Event-Handler werden über `bindChartEvent()` gebunden (sonst stapeln sie sich auf der überlebenden Instanz), und `forceRepaint(chart, isUpdate)` macht beim Update bewusst nichts — ein `resize()` würde die laufende Animation auf den Endzustand schnappen lassen. Der **Erstrender bleibt ohne Animation** (Enter-Animationen bleiben in `x-show`-Containern im Startzustand hängen). Zusätzlich hebt `chartAnimation()` die `animationThreshold` von 2000 auf 20.000 Datenpunkte je Serie an — sonst schaltet ECharts die Animation bei langen Historien selbst ab, was den **Standort-Vergleich seit Eröffnung** (~3500 Tage je Serie) als einzigen Chart hart umspringen ließ. Details: `charts.instructions.md`, Abschnitt „Animationen".
- **Zebra-Bänder & Jahreslinien sitzen exakt auf den Kategoriegrenzen (Korrektur 07/2026):** Vorher lagen sie in allen Charts eine **halbe Kategorie zu weit rechts** — die Jahreslinie schnitt den Januar-Punkt, statt vor ihm zu stehen. Ursache: `OrdinalScale.parse()` von ECharts rundet Achswerte (`Math.round`), auf einer Kategorie-Achse landet damit jeder `markArea`/`markLine`-Wert auf einer Kategorie-**Mitte**; das naheliegende `index ± 0,5` ist dort wirkungslos. Die Balken saßen immer korrekt. Deko läuft deshalb jetzt auf einer unsichtbaren value-Achse über denselben Bändern (`categoryEdgeAxis()` / `syncCategoryEdgeAxis()`), die bei `dataZoom` bewusst **nicht** mitgezoomt, sondern nachgeführt wird. Verbindliche Fassung: `charts.instructions.md`.
- **Tabellen-Ansicht (seit 07/2026, projektweite Pflicht-Konvention):** Neun Chart-Karten haben einen Umschalter Diagramm ↔ Tabelle (`<x-chart-view-toggle key="…">` als **direktes Kind der `.card-glattt`** — es ist absolut an der Karte positioniert und würde sich sonst an einem zwischenliegenden `position: relative`-Wrapper ausrichten, `<x-chart-table key="…">` im Karten-Körper). Die Tabellen brauchen **keine eigenen Endpoints** — sie werden clientseitig aus dem bereits geladenen Zustand gebaut. Generische Logik in `public/js/chart-table.js` (`buildChartTable()` erzeugt aus flachen Zeilen einen Perioden-Baum mit Aggregation, `flattenChartTable()` liefert die sichtbaren Zeilen), die chartspezifischen Spalten- und Zeilendefinitionen in `sales-statistics.js` unter `buildChartTableModel(key)`. Styling ausschließlich `.table-glattt` + `.table-glattt-striped` + die `.chart-table-glattt*`-Klassen aus `theme_glattt.css`. Beim Umschalten wird der Chart-Container per **`x-show`** ausgeblendet (nie `x-if` — ECharts verlöre seinen Container) und beim Zurückschalten über `setChartView()` neu gezeichnet, weil er im ausgeblendeten Zustand keine gültige Breite hatte. Fachlich wichtig: Bestandsgrößen wie „Aktive Mandate" nutzen `agg: 'last'` statt Summe, Quoten werden per `derive` aus den aggregierten Summen gerechnet (beim Direktzahler-Anteil wird der Nenner dafür aus `customers/share` zurückgerechnet). Das Modell liegt bewusst **außerhalb** des Alpine-State (Modul-Variable `tableCache`, Invalidierung über eine Signatur der Abhängigkeiten) — als reaktiver Proxy würde jeder Zellzugriff bei tausenden Zeilen durch Alpines Reactivity laufen. Details: `charts.instructions.md`, Abschnitt „Tabellen-Ansicht".
- Legenden-Auswahl und Zoom-Bereich überleben Re-Renders (Toggles, Theme-Wechsel), da sie im Alpine-State gemerkt und beim Neuaufbau der Option wieder angewendet werden.
- Auch die **Verkaufsstatistik-Karte** auf der Berichte-Übersicht (`public/js/sales-preview-charts.js`) nutzt ECharts. Ihr Tages-Chart zeigt die **letzten 60 Tage** in zwei Grids: Tage 60–15 sehr schmal links (~1/4 der Breite), die letzten 14 Tage breiter rechts — mit gemeinsamer y-Skala.

### Relevante Dateien

| Datei | Zweck |
|-------|-------|
| `app/Http/Controllers/SalesStatisticsController.php` | Controller mit Filter-Extraktion |
| `app/Services/SalesStatisticsService.php` | Alle Queries, Caching, Hochrechnungs-Logik |
| `database/migrations/2026_07_27_100000_create_legacy_lastschrift_stats_table.php` | Legacy-Tabelle `legacy_lastschrift_stats` + Seed der Alt-CSV (Historie MRR/RLS) |
| `database/migrations/2026_07_27_120000_add_rls_count_to_legacy_lastschrift_stats_table.php` | Spalte `rls_count` („Anzahl der RLS" aus der Alt-CSV) + Seed |
| `resources/views/hub/reports/sales-statistics.blade.php` | Haupt-View |
| `resources/views/hub/reports/sales-statistics/partials/header.blade.php` | Seitenkopf |
| `resources/views/hub/reports/sales-statistics/partials/monthly-overview.blade.php` | Monatstabelle + Chart |
| `resources/views/hub/reports/sales-statistics/partials/branch-opening-comparison.blade.php` | Standort-Vergleich seit Eröffnung (ECharts + Ansicht-/Metrik-Switch) |
| `resources/views/hub/reports/sales-statistics/partials/existing-customer-flex.blade.php` | Ausweis Bestandskunden & Flex (Stat-Strip) |
| `resources/views/hub/reports/sales-statistics/partials/branch-ranking.blade.php` | Institut-Ranking — **nur noch** als Dashboard-Widget (`sales-branch-ranking`), nicht mehr auf der Seite |
| `resources/views/hub/reports/sales-statistics/partials/seller-ranking.blade.php` | Mitarbeiter-Ranking — **nur noch** als Dashboard-Widget (`sales-seller-ranking`), nicht mehr auf der Seite |
| `resources/views/hub/reports/sales-statistics/partials/contract-terms.blade.php` | Vertragslaufzeiten (ECharts + KPZ-Filter) |
| `resources/views/hub/reports/sales-statistics/partials/payment-failures.blade.php` | Zahlungsausfälle nach Ratenfortschritt |
| `resources/views/hub/reports/sales-statistics/partials/sales-mix.blade.php` | Sales Mix — Paket-Umfang (ECharts, Umschalter Stück/Umsatz, Netto/Brutto, %) |
| `resources/views/hub/reports/sales-statistics/partials/new-customers.blade.php` | Neukunden pro Monat je Institut (ECharts) |
| `resources/views/hub/reports/sales-statistics/partials/mrr.blade.php` | Lastschriften-Bestand & Einzugsvolumen (Soll/Ist + aktive Mandate) |
| `resources/views/hub/reports/sales-statistics/partials/chargebacks.blade.php` | Rücklastschriften pro Monat (Quote/Anzahl) |
| `resources/views/hub/reports/sales-statistics/partials/direct-pay.blade.php` | Direktzahler-Segment (Kunden/Umsatz/KPZ + Anteil) |
| `public/js/sales-statistics.js` | Alpine.js App + ECharts-Integration + Tabellen-Modelle je Chart |
| `public/js/chart-table.js` | Generischer Aufbau der Tabellen-Ansicht (Perioden-Baum, Aggregation, Formatierer) |
| `resources/views/components/chart-table.blade.php` | Tabellen-Komponente (aufklappbare Zeilen, „Mehr laden", Gesamtzeile) |
| `resources/views/components/chart-view-toggle.blade.php` | Register Diagramm ↔ Tabelle am rechten Kartenrand (direktes Kind der Karte) |
| `resources/views/components/stat-skeleton.blade.php` | Ladeplatzhalter je Kartentyp (Chart, Tabelle, Stat-Strip, KPI, Heatmap) |
| `resources/views/components/card-state.blade.php` | „Keine Daten"/Fehler-Hinweis in der reservierten Kartenhöhe (mit „Erneut laden") |
| `tests/Feature/SalesStatisticsChartTableTest.php` | Sichert die Verdrahtung von Umschalter & Tabelle je Karte |
| `tests/Feature/SalesStatisticsLoadingStateTest.php` | Sichert reservierte Höhen, Platzhalter und Fehlerzustand je Karte |
| `tests/Feature/StatSkeletonComponentTest.php` | Verhalten von `<x-stat-skeleton>` und `<x-card-state>` |
| `public/js/sales-preview-charts.js` | ECharts-Mini-Charts der Verkaufsstatistik-Karte (Berichte-Übersicht) |
| `resources/views/hub/reports.blade.php` | Berichte-Übersicht (Report-Card) |

### Datengrundlage

- **Tabelle:** `contracts`
- **Relevante Status:** `active`, `completed` (über `SALE_STATUSES` Konstante)
- **Verkaufsdatum:** `signed_at` (Unterschriftsdatum)
- **Umsatz-Metriken:** `total_value_cents` (Gesamtwert) + `monthly_amount_cents` (SEPA-Rate)
- **Geldbeträge:** In Cents gespeichert, Frontend rechnet `/100` für Anzeige
- **Vertragslaufzeiten:** `contracts.installment_count` (1 = Einmalzahlung); Verträge ohne Wert fließen nicht ein
- **Zahlungsausfälle:** `contract_payments` (nur Verträge mit >1 Rate); verarbeitete Raten = Status `paid`/`confirmed`/`failed`/`chargedback`. Die Viertel-Zuordnung erfolgt per portablem `CASE WHEN` über `(installment_number − 1) × 4` vs. `installment_count` (kein `FLOOR`/`LEAST`, damit die SQLite-Tests identisch rechnen)
- **Sales Mix / GK-Grenze:** `getSalesMix($filters, $mode)` mit `$mode = 'sold' | 'portfolio'` (delegiert an `buildSoldMix()` / `buildPortfolioMix()`). Klassifizierung je Vertrag über `COALESCE(price_lists.max_body_zones, <Fallback>)`; der Fallback ist eine zur Laufzeit aus der Preislisten-Historie (`valid_from` → `max_body_zones`) gebaute `CASE`-Kette auf `signed_at` — **keine hartcodierte Grenze**.
    - **`sold`:** abgeschlossene Pakete (`status IN active/completed`) **abzüglich Widerrufe** (`wc.contract_id IS NULL` = kein akzeptierter Widerruf); geplatzte Raten werden **nicht** abgezogen. Startmonat aus `MIN(signed_at)`.
    - **`portfolio`:** pro Vertrag werden Kategorie, Startmonat (`first_payment_date`, Fallback `signed_at`) und geplante Monate (`installment_count`, Fallback `legacy_kredit_monate`) geladen; die Verteilung auf die Laufmonate (bis heute) passiert in PHP. Verträge ohne geplante Laufzeit (`months > 0`-Filter) und widerrufene Verträge fallen raus.
    - Beide: vollständige Historie, Zoom per dataZoom-Slider, portables SQL (`monthExpr()`), SQLite-testbar. Endpoint `/sales-statistics/sales-mix?mode=…`.
- **Neukunden:** `getNewCustomersTrend()` — Monat des ersten BGs je Kunde direkt aus `stats_historic_appointments` (`MIN(DATE(appointment_date))` je `client_id`, nur Beratungs-Services, `state=PAID`), bewusst ohne den `client_statistics`-Cutoff.
- **MRR / Einzugsvolumen:** `getMrrTrend()` — je Monat die Bänder `collected_cents` (paid/confirmed, ohne Nachzahlungen), `recovered_cents` (nachgezahlte RLS: `paid` + `direct_payment_method` gesetzt + `failure_reason`/`failure_code` erhalten — der Fußabdruck von `ContractPayment::settleBounced()`), `open_cents` (scheduled/pending/submitted) und `rls_cents` (failed/chargedback); `total_cents` = Summe der vier (= fälliges Volumen, Storno/Refund ausgenommen), `mandates` = `COUNT(DISTINCT contract_id)` mit nicht-stornierter Rate, `source` = `legacy|hub`. **Quelle je Monat:** vor `HUB_LEDGER_START_MONTH` (= `2026-06`, Konstante im Service) aus `legacy_lastschrift_stats` (CSV-Seed via `legacyLastschriftMonths()`, SQL-seitig auf `year_month < Konstante` begrenzt — die geseedeten Zeilen 06+07/2026 bleiben in der Tabelle, werden aber ignoriert; `collected = total − rls`, `open = 0`, `recovered = 0`), ab dann aus `contract_payments` (seit 06/2026 läuft jeder Einzug ausschließlich über GoCardless). `hub_start_month` = `HUB_LEDGER_START_MONTH`. Legacy nur ohne `branch_id`/`seller_id`/`body_zones`-Filter (CSV ist Gesamt-Aggregat). Frühere synthetische „Bestand (geplant)"-Linie **entfernt** — verwirrte (Modell-Überhang gegen echten Einzug sah aus wie ein Riesen-Ausfall). Zusätzlich hängt `getMrrTrend()` **Prognose-Monate** an (`is_forecast = true`, `source = forecast`, max. +24 Monate bis zur letzten geplanten Rate): `forecast_cents` = open + collected + recovered des Zukunftsmonats (vereinbarte plus vorab beglichene Raten), übrige Bänder 0, `mandates` = Verträge mit nicht-stornierter Rate im Monat. Das Frontend filtert Prognose-Monate bei ausgeschaltetem Umschalter heraus (`mrrShowForecast`), rendert das Band grün schraffiert mit gestrichelter Deckline, eine goldene markLine am Übergang und die Mandate-Fortsetzung als zweite Serie **mit gleichem Namen** (ein Legendeneintrag, Freistellung wirkt auf beide). CSV-Export: Spalte „Prognose brutto (€)", Quelle „Prognose". Jeder Monat trägt außerdem `branches` (branch_id → Volumen-Cents; Ist inkl. RLS, Prognose ohne; `null` = keine Aufteilung, nur noch 01–05/2020) plus `branch_ids`/`branch_names` — die Instituts-Ansicht (`mrrView`) stapelt daraus Flächen je Institut (Farben via `BranchColorService`); Alt-Monate aus `legacy_lastschrift_branch_stats` (Migration `2026_07_28_090000`, Seed nicht in Testing). Export ergänzt je Institut eine Spalte „… brutto (€)".
- **Legacy-Historie:** Tabelle `legacy_lastschrift_stats` (Migrationen `2026_07_27_100000…` + `2026_07_27_120000…`), Spalten `year_month`, `mandates`, `total_cents` (brutto), `rls_cents` (brutto), `rls_count`. Daten aus der Alt-CSV (01/2020–07/2026) direkt in den Migrationen geseedet — **im `testing`-Environment wird NICHT geseedet** (Tests legen eigene Zeilen an, sonst kollidieren die absoluten Monate mit den `now()`-relativen Test-Monaten).
- **Rücklastschriften:** `getChargebackTrend()` — gleiche Quellen-Logik wie `getMrrTrend()` (Legacy vor `HUB_LEDGER_START_MONTH`, danach `contract_payments`; Legacy nur ohne branch/seller/KPZ-Filter). Hub-Monate: verarbeitete Raten (`paid/confirmed/failed/chargedback`), davon `failed/chargedback` = RLS; Quoten nach Anzahl und Wert; `recovered`/`recovered_cents` = manuell nachgezahlte Ex-RLS (gleiches Erkennungsmuster wie beim MRR; zählen als verarbeitet, aber nicht mehr als RLS — Quote = endgültiger Ausfall). Legacy-Monate: `processed` = `mandates` („Anzahl der Lasts. gesamt"), `rls` = `rls_count` („Anzahl der RLS", Migration `2026_07_27_120000…`), `processed_cents`/`rls_cents`/beide Quoten aus der CSV; `recovered*` ist `null` (Nachzahlungen unbekannt). Jeder Monat trägt `source` (`legacy|hub|none`).
- **Direktzahler:** `getDirectPayTrend()` — aus `contracts` je Abschlussmonat (`signed_at`), `payment_method = direct`: Kunden, KPZ, Umsatz, Ø/Kunde, %-Anteil an allen Abschlüssen.
- **Brutto/Netto:** Alle drei Endpoints liefern **brutto** (Cents). Die Netto-Umrechnung (÷ 1,19) passiert **clientseitig** über den globalen `valueMode` (reaktive `formatCurrency` + skalierte €-Chartserien; KPI-Currency-Kacheln werden aus den Rohdaten `dashboardKpisRaw` neu berechnet). Im CSV-Export werden € stattdessen als **feste Brutto- UND Netto-Spalten** ausgegeben (`ReportExportService::euroNet()`), da die CSV ein fixes Artefakt ist.

### Caching

- **TTL:** 3600 Sekunden (1 Stunde)
- **Versionierung:** Versionierter Cache-Key (`sales-stats:v{N}:{method}:{filter_hash}`)
- **Invalidierung:** Automatisch durch TTL; manuell über Cache-Version-Bump

### Hochrechnungs-Algorithmus

Es gibt **genau ein** Verfahren (`PROJECTION_METHOD = 'linear'`), das auf Vertragsanzahl, Gesamtumsatz,
monatliche Rate und Körperzonen angewendet wird — lineare Hochrechnung über Verkaufstage:

```
projection = (ist_wert / verkaufstage_bisher) × verkaufstage_gesamt
```

**Grundlage: Verkaufstage** statt Kalendertage. Verkaufstage = Mo–Sa ohne Feiertage.
Feiertage werden über den `HolidayService` (spatie/holidays, regional pro Bundesland) ermittelt.
Bei Standort-Filter: regionale Feiertage. Ohne Filter: nur bundesweite Feiertage.

Helper-Methoden:

- `countSellingDays(start, end, holidays)` — Zählt Verkaufstage in einem Datumsbereich
- `currentMonthSellingDays(filters)` — Verkaufstage des laufenden Monats (`passed` / `total`), eine Quelle für alle Karten
- `projectLinear(current, passed, total)` — die Hochrechnung selbst, mit `max(projected, current)` als Untergrenze
- `projectionApplies(filters)` — `false`, sobald ein Datumsfilter den laufenden Monat anschneidet

Angewendet in:

- Gesamt (alle Branches) — `calculateMonthProjection()`
- Pro Branch — `calculateBranchProjections()`
- Pro Seller — `calculateSellerProjections()`
- Körperzonen pro Institut — `getBodyZonesChart()`

Die Rückgabe enthält zusätzlich `selling_days_passed`, `total_selling_days` und `projection_method`.
Der laufende Monat der Monatlichen Übersicht führt darüber hinaus `projected_body_zones` sowie
`projected_delta_prev_month` / `projected_delta_prev_year` (gleiche Struktur wie `delta_prev_month`).

Frontend: Die Tabelle der Monatlichen Übersicht ist die Alpine-Komponente `monthlyOverviewTable()`
(`public/js/sales-statistics.js`, Markup in `partials/monthly-overview.blade.php`). Sie nutzt bewusst
**nicht** `<x-chart-table>`, weil sie Δ-Spalten und die Hochrechnung zeigt, aber dieselben Theme-Klassen
(`.chart-table-glattt-*` auf `.table-glattt`). Jahr-, Quartals- und Monatszeilen haben denselben
Spaltenaufbau, damit Aggregate unter den Werten stehen, zu denen sie gehören. Die Zwei-Werte-Darstellung
(Ist oben, Prognose darunter) ist `.projection-glattt-*` in `theme_glattt.css`.

Alle Hochrechnungen ziehen ihren Ist-Wert aus `buildBaseQuery($filters)` — also aus **derselben** gefilterten
Query wie die Tabelle daneben. Weicht die Query der Hochrechnung von der Query der Anzeige ab, entstehen
Prognosen unter dem Ist-Wert.

!!! warning "Historie: Warum keine Ratio-/Saison-Stufen mehr"

    Bis 07/2026 war der Algorithmus 3-stufig (gewichtete historische Ratio + YoY-„Saisonalitäts-Korrektur").
    Die zweite Stufe multiplizierte die Prognose mit dem Niveau-Trend zwischen dem gleichen Monat im Vorjahr
    und im Vor-Vorjahr. Weil die Vor-Vorjahres-Monate aus der Legacy-Ära mit ganz anderer Datenbasis stammen
    (Juli 2024: 237 Verträge vs. Juli 2025: 115), ergab das einen Faktor von 0,85 — die Hochrechnung fiel damit
    **unter den bereits erreichten Ist-Stand** (110 Verträge → Prognose 96). Zusätzlich rechnete das
    Körperzonen-Diagramm schon immer rein linear, sodass dieselbe Seite denselben Monat mit zwei Verfahren
    hochrechnete (−13 % vs. +8 %). Seit 07/2026 gilt überall die lineare Methode.

    Zur Einordnung: Die lineare Methode ist bewusst optimistisch. Historisch waren am 25. von 27 Verkaufstagen
    bereits ~97,5 % eines Monats abgeschlossen, linear unterstellt werden aber 92,6 % — die Prognose liegt am
    Monatsende also typischerweise ~5 % über dem Ist.

### Permission

- **Permission-Name:** `view_report_sales_statistics`
- **Beschreibung:** `Bericht: Verkaufsstatistik`
- **Standard-Zuweisung:** Admin-Rolle

### Tests

```bash
# Alle Sales-Statistics-Tests
php artisan test --filter=SalesStatistics

# Nur Feature-Tests
php artisan test --filter=SalesStatisticsTest

# Nur Unit-Tests
php artisan test --filter=SalesStatisticsServiceTest
```

**Hinweis:** 8 Feature-Tests benötigen MySQL (wegen `DATE_FORMAT`) und werden auf SQLite automatisch übersprungen.
Zum Ausführen eine separate Test-DB nutzen, **nie** die Entwicklungs-DB (`RefreshDatabase` leert sie):

```bash
DB_CONNECTION=mysql DB_DATABASE=glattthub_test php -d memory_limit=1G vendor/bin/phpunit tests/Feature/SalesStatisticsTest.php
```

Die Hochrechnung ist durch drei Tests abgesichert: Prognose nie unter Ist-Stand, gleiche Verkaufstage-Basis
in allen Karten (Summe Institut-Prognosen = Gesamt-Prognose) und keine Prognose bei angeschnittenem Monat.
