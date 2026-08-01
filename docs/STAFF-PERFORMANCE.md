# Mitarbeiterperformance

Die Mitarbeiterperformance zeigt, welche Berater wie viele Beratungsgespräche hatten und wie oft daraus am selben Tag ein Vertrag abgeschlossen wurde — Tagesmessung, Beratungs-Ranking nach Conversion-Rate und Behandlungs-Ranking (Behandlungszeit & Auslastung je Mitarbeiter).

**Zugang:** Hub → Berichte → Mitarbeiterperformance  
**URL:** `/hub/reports/staff-performance`  
**Berechtigung:** `view_report_sales_statistics`

---

## Für Endanwender

### Was zeigt diese Seite?

Die Mitarbeiterperformance beantwortet Fragen wie:

- Wie viele Beratungsgespräche hatte ein Mitarbeiter?
- In wie vielen davon wurde am selben Tag ein Vertrag abgeschlossen? (Conversion-Rate)
- Wie viele Körperzonen wurden pro Abschluss verkauft?
- Welcher Mitarbeiter hat die beste Conversion-Rate?
- Wie stehen die Institute im gewählten Zeitraum zueinander? (Tagesmessung, Diagramm)
- Wie viele Behandlungen hat ein Mitarbeiter durchgeführt?

### Verknüpfungslogik

Eine Beratung zählt als **Abschluss**, wenn:

1. Am **exakt gleichen Kalendertag** ein Vertrag unterzeichnet wurde
2. Der Vertrag für den **gleichen Kunden** ist
3. Der Vertrag im **gleichen Standort** abgeschlossen wurde
4. Der Vertrag den Status **aktiv** oder **abgeschlossen** hat

Bei **mehreren Beratungen desselben Kunden am selben Tag** bekommt die **letzte Beratung** (späteste Uhrzeit) die Zuordnung zum Vertrag.

### Aufbau der Seite (Statistik-Bauplan, seit 07/2026)

Die Seite folgt dem verbindlichen Statistikseiten-Bauplan: Jede Analyse-Karte ist
**zweiseitig** — Diagramm als Standard-Ansicht, die Tabelle dahinter über das
**Register am rechten Kartenrand** (mobil als Segmented Control). Beim Laden
zeigen die Karten **Skeletons in Endhöhe** (nichts springt), Filterwechsel dimmen
die alte Ansicht, bis die neue Antwort da ist. Fällt ein Endpoint aus, zeigt
**nur diese Karte** einen Fehlerhinweis mit „Erneut laden" — die übrigen Analysen
laden unabhängig weiter. Jede Karte hat ein Info-Panel (ℹ️) mit Erklärung,
Spalten, Anomalien und Datenquelle.

Die **Reihenfolge** ist die des Bauplans: Header-Card → KPI-Zeile
(`components/kpi-dashboard`, personalisierbar) → Auswertungs-Karten, beginnend mit
der Tagesmessung.

Die **Tagesmessung** ist die einzige Karte, bei der das Register **umgekehrt**
vorbelegt ist: **Tabelle als Standard-Ansicht, Diagramm dahinter**. Begründung:
Diese Karte wird abgelesen, nicht überflogen — sie ist das tägliche Arbeitsmittel
und ersetzt das frühere Google-Sheet. Alle anderen Karten starten wie üblich mit
dem Diagramm.

### Sektionen

#### KPI-Dashboard

Steht direkt unter der Header-Card (seit 07/2026 — vorher lag die Zeile hinter der
Tagesmessung und damit unterhalb des Bildschirms). 12 Kennzahlen stehen zur
Auswahl, sichtbar sind standardmäßig 4; Auswahl und Reihenfolge sind per Drag &
Drop personalisierbar und liegen im localStorage (`staff-performance-kpis`).

> **Bezugszeitraum ist immer der laufende Monat** — im Titel der Zeile
> ausgeschrieben („Laufender Monat — August 2026"). Die Zeile folgt dem
> seitenweiten Zeitraum-Picker bewusst **nicht** (zweite Ausnahme neben dem
> Tagesmessungs-Diagramm): Die Vergleichszeilen „vs. Vormonat"/„vs. Vorjahr"
> bleiben so stabil lesbar, und Wert und Delta beschreiben denselben Zeitraum
> (bis 07/2026 stand daneben eine Lebenszeit-Summe — „9.546 Beratungen,
> +43,7 % vs. Vorjahr" las sich wie ein Wachstum der 9.546).
>
> Der **Endpoint** `getKpis()` kann seit 08/2026 trotzdem einen Zeitraum
> (`date_from`/`date_to`, Monatsraster): Er aggregiert dann die Monate des
> Fensters und vergleicht gegen die **gleich lange Vorperiode**
> („vs. Vorperiode", bei einem Monat „vs. Vormonat") und dieselben Monate im
> Vorjahr — Quoten aus Rohsummen, nie gemittelt
> (`test_kpis_follow_the_page_date_range`). Die Seite selbst schickt keine
> Datumsparameter mit; ohne sie ist der Standard der laufende Monat.

| KPI | Beschreibung |
|-----|-------------|
| **Beratungen** ⭐ | Beratungsgespräche im laufenden Monat |
| **Abschlüsse** | Beratungen mit Vertragsabschluss am selben Tag |
| **Conversion-Rate** ⭐ | Anteil Beratung → Vertrag |
| **Ø KPZ je Beratung** | Körperzonen ÷ **alle** Beratungen (auch die ohne Abschluss) — dieselbe Definition wie die KpZ-Spalte der Tagesmessung |
| **Ø KPZ je Abschluss** | Körperzonen ÷ Verträge — die Zahl, die im Verkauf üblicherweise mit „Ø KPZ" gemeint ist |
| **Aktive Berater** | Mitarbeiter mit mindestens einem Beratungsgespräch; mehrere Phorest-Profile derselben Person zählen einmal |
| **BG je Berater** | Beratungen ÷ aktive Berater |
| **Berater über Ziel-CR** | Anteil der Berater, die die Ziel-Conversion-Rate erreichen — nur Berater mit ≥ 5 Beratungen zählen (sonst stünde ein einziges abgeschlossenes Gespräch mit 100 % drin). Schwelle ist der Zielwert des gefilterten Standorts, sonst der globale Standard |
| **Körperzonen** | Summe der bei Abschlüssen verkauften Körperzonen |
| **Ganzkörper-Anteil** | Anteil der Ganzkörper-Verträge an den Abschlüssen |
| **Ø Vertragswert** | Durchschnittlicher Vertragswert bei Abschlüssen |
| **Umsatz** | Summe der Vertragswerte bei Abschlüssen |

⭐ = hervorgehobene Karte (Bauplan: höchstens zwei).

Jede Kennzahl zeigt Vergleichswerte:
- **vs. Vormonat**: Veränderung zum Vormonat
- **vs. Vorjahr**: Veränderung zum gleichen Monat im Vorjahr

Quoten-KPIs (Conversion-Rate, Ganzkörper-Anteil, Berater über Ziel-CR) vergleichen
in **Prozentpunkten (PP)** statt als Prozent-Veränderung der Quote.

> **Behobener Fehler (07/2026):** `subMonth()` auf einem Datum vom 29.–31. läuft über
> (31.07. − 1 Monat = 01.07.). „Vormonat" war dadurch an diesen Tagen der laufende
> Monat und **jeder** Vormonatsvergleich zeigte exakt „+0,0 %" — ohne jeden Hinweis
> darauf, dass da nichts gerechnet wurde. Der Anker ist jetzt `startOfMonth()` vor
> `subMonth()` (derselbe Fallstrick wie in `getStaffOverview()`); abgesichert durch
> `test_kpi_comparison_does_not_collapse_at_month_end`.

#### Beratungs-Ranking (bis 08/2026 „Mitarbeiter-Ranking")

**Diagramm (Standard, seit 08/2026 Zeitverlauf):** je gewähltem Verkäufer zwei
Linien in **einer Farbe** über die Kalendermonate — die **Conversion-Rate
durchgezogen** (linke Achse, 0–100 %) und die **Ø Körperzonen gepunktet**
(rechte Achse). Beide Serien tragen denselben Namen und teilen sich dadurch
einen Legenden-Eintrag: Legende und Klick-Freistellung schalten immer das
Linienpaar. Das Diagramm lädt — wie das Tagesmessungs-Diagramm — **immer die
gesamte Historie** (gemeinsamer Historien-Datensatz `overviewChartData`, wird
deshalb eager geladen); der Zeitausschnitt wird ausschließlich über die
**Zoom-Leiste** darunter gewählt (`rankingZoom` überlebt Re-Renders), der
Seiten-Zeitraum gilt hier bewusst nicht. Der Filter wählt nur Zeilen aus, es
wird nichts nachgeladen. Vorher stand hier ein Lollipop-Ranking auf der
CR-Skala; der Zeitverlauf zeigt zusätzlich, **wie sich** die Quoten entwickeln.

**Verkäufer-Filter (max. 5):** Dropdown „Verkäufer" oben rechts in der Karte
(`.picker-tree-glattt`, Baum im Dropdown-Look mit Theme-Checkboxen). Oberste
Ebene = Standorte: Ein Haken wählt deren Mitarbeiter einzeln aus (nach
Beratungsvolumen, bis das Limit `RANKING_MAX_LINES = 5` voll ist; erneuter
Haken entfernt sie wieder), Teil-Auswahl zeigt die Checkbox als Strich.
Aufklappen (▸) listet die einzelnen Mitarbeiter mit BG-Zahl — so lassen sich
auch Mitarbeiter **verschiedener Standorte** direkt vergleichen. Bei vollem
Limit sind weitere Checkboxen deaktiviert (Hinweis im Panel). Vorausgewählt
sind die **ersten 5 der Bestenliste** (`staffData`, server-sortiert nach
belastbarer Quote und CR) — je Person die Standort-Zeile mit den meisten
Beratungen; fällt der Ranking-Endpoint aus, greift ein Volumen-Fallback. Nach
einem Daten-Reload (Standortwechsel) wird die Auswahl abgeglichen
(verschwundene Schlüssel raus, leere Auswahl → wieder Vorauswahl). Auswahl-Schlüssel ist die `staff_id` der
Tagesmessung (`mergeKey|branchId`) — dieselbe Person an zwei Standorten ist
bewusst zweimal wählbar (Label trägt dann den Standort).

**Regeln der Bestenlisten-Tabelle (seit 07/2026):**

- **Standorte werden zusammengeführt.** Eine Person hat in Phorest pro Institut
  eine eigene StaffId. In der Tabelle bilden diese Profile **immer eine Zeile**:
  Beratungen, Abschlüsse, Körperzonen und Umsatz sind die Summe über alle
  Standorte, die Quoten werden aus diesen Summen gerechnet. In der Spalte
  „Standort" stehen dann alle beteiligten Institute (`branch_count` sagt, wie
  viele). Die standortweise Aufteilung zeigen Diagramm-Filter und Tagesmessung.
- **Mindestens 20 Beratungsgespräche** (`StaffPerformanceService::RANKING_MIN_SAMPLE`)
  im gewählten Seiten-Zeitraum, sonst gilt die Quote als nicht belastbar
  (`is_reliable = false`). Solche Zeilen bleiben in der Tabelle, werden dort aber
  blass/kursiv dargestellt (`.table-glattt-row-thin`) und ans Ende sortiert.
  Vorher führten 100-%-Quoten aus ein bis zwei Gesprächen die Bestenliste an —
  darunter auch Phorest-Platzhalter wie Kabinen- oder Absage-Profile.

**Tabellen-Lasche:** sortierbare Tabelle aller Mitarbeiter mit:

| Spalte | Beschreibung |
|--------|-------------|
| **#** | Rang |
| **Mitarbeiter** | Name des Beraters |
| **Standort** | Zugeordnete(r) Standort(e) |
| **Beratungen** | Anzahl Beratungsgespräche |
| **Abschlüsse** | Davon mit Vertrag am selben Tag |
| **Quote** | Conversion-Rate in % (farbcodiert) |
| **Ø KPZ** | Durchschnittliche Körperzonen pro Abschluss |
| **Σ KPZ** | Summe aller Körperzonen |
| **Ganzkörper** | Anzahl Ganzkörper-Verträge |
| **Σ Umsatz** | Gesamtumsatz aus Abschlüssen |

Die Quote ist farbcodiert:
- 🟢 **≥ 30%** — Grün (gut)
- 🟡 **≥ 15%** — Gelb (mittel)
- 🔴 **< 15%** — Rot (niedrig)

Per Klick auf das Detail-Icon öffnet sich ein Modal mit allen Beratungen des Mitarbeiters.

#### Gestrichene Karten (07/2026)

**Standort-Vergleich**, **Monatlicher Zeitverlauf** und
**Körperzonen-Verteilung** wurden ersatzlos aus dem Report entfernt — sie
beantworteten Fragen, die die Tagesmessung (Institutsvergleich über die Legende,
Monatsverlauf über die Zeitachse) bereits abdeckt, und machten die Seite lang.

Was das für den Rest bedeutet:

- Die **JSON-Endpoints bleiben bestehen** (`/branches`, `/monthly`,
  `/body-zones`). An ihnen hängen drei Widgets des Custom-Dashboards
  („Filial-Vergleich Performance", „Performance-Monatstrend",
  „Körperzonen-Spezialisierung"); `/branches` liefert außerdem die Instituts-Tabs
  des Zielwerte-Modals. Wer die Auswertungen weiter braucht, legt sich das
  passende Widget aufs eigene Dashboard.
- Die zugehörigen **CSV-Export-Quellen sind entfallen**
  (`staff-branch-comparison`, `staff-monthly-trend`, `staff-body-zones`) — der
  Export einer Seite spiegelt, was die Seite zeigt.

#### Mitarbeiter-Detailansicht (Modal)

Öffnet sich per Klick auf einen Mitarbeiter. Zeigt:

- **Übersicht**: Beratungen, Abschlüsse, Quote, Ø KPZ
- **Beratungsliste**: Alle Beratungen mit Datum, Uhrzeit, Standort, Typ, Ergebnis (Abschluss/Ganzkörper/Kein Abschluss), Körperzonen, Vertragswert

#### Tagesmessung (Ampel-Matrix)

Dichte Matrix ganz oben auf der Seite — der Nachbau der bisher extern gepflegten
„Tagesmessung" (Google-Sheet). Eine Zeile pro Mitarbeiter, Zeilenhöhe ~26 px,
damit mehrere Institute gleichzeitig ins Bild passen.

**Spaltenaufbau:**

| Block | Inhalt |
|---|---|
| **Heute** (fixiert) | BG und CR des laufenden Tages |
| **Diese Woche** (fixiert) | BG und CR seit Montag |
| **Monatsblöcke** | je ein Block pro Kalendermonat im gewählten Zeitraum — je BG, CR, KpZ |

**Zeitraum auf Monatsebene (seit 08/2026).** Die Monatsspalten folgen dem
**seitenweiten Monatsbereich-Picker im Seitenkopf** `<x-month-range-picker>`
(`resources/views/components/month-range-picker.blade.php`, Styles
`.month-picker-glattt-*` in `theme_glattt.css`, kompakte `size="sm"`-Variante):
eine Monatsübersicht je Jahr im Look des Custom-Dropdowns — **kein
Tageskalender, kein flatpickr**. Zwei Klicks wählen Start- und Endmonat
(Reihenfolge egal, ein Hover zeigt die Vorschau); das Enddatum ist der
Monatsletzte, im laufenden Monat der heutige Tag. Vorausgewählt sind die
**letzten vier Kalendermonate**; nach hinten reicht die Auswahl bis zum
**ältesten Beratungstermin aus Phorest** (geliefert von
`getEarliestConsultationDate()`), nach vorn bis zum laufenden Monat — spätere
Monate und Jahre sind deaktiviert. „Heute" und „Diese Woche" stehen unabhängig
vom Zeitraum immer links. Der gewählte Bereich kommt als `range` in der Antwort
zurück und steuert auch den CSV-Export.

**Leserichtung: neu → alt.** Der laufende Monat steht direkt neben den Tagesspalten,
nach rechts geht es in die Vergangenheit. Innerhalb eines aufgeklappten Monats gilt
dasselbe: zuerst die Monatssumme („Σ 26.07"), dann die Kalenderwochen absteigend
(KW31, KW30, …). Der CSV-Export bleibt davon unberührt und sortiert chronologisch.

Die beiden Tagesblöcke und die Mitarbeiterspalte bleiben beim seitlichen Scrollen
stehen (`position: sticky`), damit die Zuordnung beim Blick nach rechts erhalten bleibt.

**Monat aufklappen:** Ein Klick auf den Monatskopf („26.07 ▸") fächert den Monat in
seine **Kalenderwochen** auf, gefolgt von der Monatssumme („Σ 26.07"). Mehrere
Monate lassen sich gleichzeitig öffnen.

> **Wochen sind auf die Monatsgrenzen beschnitten.** Eine Kalenderwoche, die über
> den Monatswechsel läuft, erscheint in **beiden** Monaten mit ihrem jeweiligen
> Anteil (dieselbe KW-Nummer taucht dann zweimal auf). Nur so ergibt die Summe der
> Wochen exakt den Monatswert — im Test abgesichert.

Metriken je Block:

- **BG** — Beratungsgespräche (neutral, keine Farbkodierung)
- **CR** — Conversion-Rate in % (flächig farbcodiert)
- **KpZ** — Ø Körperzonen **pro Beratungsgespräch** (flächig farbcodiert; Nenner
  sind alle BG des Zeitraums, nicht nur die Abschlüsse)

**Farbkodierung** basiert auf konfigurierbaren Schwellenwerten (global oder pro Standort):

| Farbe | CR Standard | KpZ Standard |
|-------|------------|-------------|
| 🟢 Grün | ≥ 60% | ≥ 3,0 |
| 🟡 Gelb | ≥ 40% | ≥ 2,0 |
| 🔴 Rot | < 40% | < 2,0 |

**Gruppierung** (Segmented Control „Nach Institut ⇄ Gesamt", Standard: nach
Institut — seit 07/2026 als Umschalter statt als Toggle, damit alle Bedienelemente
der Karte dieselbe Bauform haben): Kopfzeile je Standort, darunter dessen
Mitarbeiter, abgeschlossen mit einer Zwischensumme; die Summe der Institute ergibt
die Gesamtzeile im Fuß.

> **Wichtig:** In der gruppierten Ansicht erscheint ein Mitarbeiter mit Einsätzen an
> zwei Standorten **in beiden Gruppen** mit seinen dortigen Zahlen — sonst würden die
> Instituts-Zwischensummen nicht aufgehen. Schaltet man die Gruppierung aus, wird er zu
> einer Zeile zusammengeführt und seine BG-Zahl ist die Summe beider Standorte. Beide
> Sichten sind korrekt, sie beantworten nur unterschiedliche Fragen.

**Weitere Features:**
- Quoten aus **weniger als 5 Beratungen** sind **nur in den Monatsspalten** blass
  und kursiv (eingeschränkte Aussagekraft); der Grund steht im Tooltip der Zelle.
  In den Tages- und Wochenspalten nicht — dort sind einstellige Fallzahlen der
  Regelfall, die Dämpfung träfe fast jede Zelle und wäre damit wertlos. Gesteuert
  über `periodType` der Spalte (`day` | `week` | `month`)
- Zeilen ohne eine einzige Beratung im gesamten Zeitfenster werden ausgeblendet
- **Alle Nutzer werden gezeigt** (seit 07/2026). Den früheren Toggle „Nur
  Hub-Nutzer" gibt es nicht mehr — die Trennung Hub-Konto / kein Hub-Konto ist für
  die Tagesmessung ohne Bedeutung. In der Liste stehen dadurch auch
  Phorest-Platzhalter (Kabinen-, Absage-Spalten) und Profile, die im
  Stammdaten-Abgleich fehlen und als „Unbekannt" erscheinen
- Sortierung innerhalb der Gruppe nach Beratungsvolumen der Monatsblöcke
- Mobil bricht der Kartenkopf um, die fixierten Spalten schrumpfen mit

##### Diagramm-Ansicht (überarbeitet 07/2026)

Hinter der Tabelle liegt über das Register **ein einziges Diagramm**, das alle drei
Kennzahlen zusammen zeigt. Es hat einen **eigenen Datensatz über die gesamte
Historie** (ältester Beratungstermin bis heute, selber `overview`-Endpoint mit
explizitem `date_from`/`date_to`) — unabhängig vom Zeitraum-Feld der Tabelle.
Geladen wird er lazy beim ersten Wechsel auf die Diagramm-Lasche; Zoomen und
Legende lösen danach **kein** Neuladen aus:

| Element | Inhalt | Achse |
|---|---|---|
| **Balken, gestapelt** | Beratungsgespräche je Monat, ein Stapelsegment pro Institut in seiner Standortfarbe | links (BG) |
| **Goldene Linie** | Conversion-Rate der **eingeblendeten** Institute | rechts (0–100 %) |
| **Gestrichelte Linie** | Ø Körperzonen der **eingeblendeten** Institute | zweite rechte Achse |

Die frühere Aufteilung in drei Sichten (**Heatmap**, **Verlauf**, **Institute**) mit
zusätzlichem Kennzahl-Umschalter (BG / CR / KpZ) ist entfallen: Die Heatmap
verdoppelte nur die Tabelle, und die Umschalterei zwang dazu, drei Bilder
nacheinander zu lesen, um eine Aussage zu bekommen.

Bedienung:

- **Klick auf einen Balken stellt das Institut frei** (Projekt-Konvention
  `enableSeriesIsolation`) — alle anderen Institute werden ausgeblendet, ein
  erneuter Klick zeigt wieder alle. Über die **Legende** lassen sich Institute
  auch einzeln aus- und einblenden.
- Die beiden **Quotenlinien folgen der sichtbaren Instituts-Menge**: Sie werden
  clientseitig aus den Rohsummen (Beratungen, Abschlüsse, Körperzonen) der
  eingeblendeten Instituts-Gruppen gerechnet — Quoten aus Summen, nie gemittelt.
  Wer einen Standort freistellt, sieht CR und Ø KpZ exakt dieses Standorts.
  Die Linien selbst sind von der Klick-Freistellung ausgenommen
  (`exclude: OVERVIEW_LINE_NAMES`) — sie sind Kontext, keine wählbare Serie.
- **Zoom-Leiste unten** (`dataZoom`, Slider + Mausrad) ist in der
  Diagramm-Ansicht die **einzige Zeitauswahl** — das Zeitraum-Feld im
  Kartenkopf ist dort ausgeblendet und wirkt nur auf die Tabelle; das Diagramm
  hat immer die volle Historie im Zugriff. Der Ausschnitt überlebt Re-Renders
  (`overviewZoom`).
- Die **Legenden-Auswahl übersteht Re-Renders** über das `legendFor()`-Muster
  (Auswahl aus der überlebenden Instanz lesen, nicht über
  `legendselectchanged` — das Event feuert bei der Klick-Freistellung nicht).
  Weil die Quotenlinien auf die Auswahl reagieren, zeichnet die Karte bei jedem
  Legenden-Event neu (alle drei Events gebunden, per `requestAnimationFrame`
  zu einem Render zusammengefasst).

**Leserichtung: alt → neu.** Anders als die Tabelle (neueste Periode links, weil man
nach rechts in die Vergangenheit scrollt) läuft das Diagramm chronologisch von
links nach rechts. „Heute" und „Diese Woche" bleiben weg, weil sich Monate und
einzelne Tage nicht auf einer Zeitachse vergleichen lassen.

Weitere Festlegungen:

- Drei y-Achsen (BG links, CR und Ø KpZ je rechts). CR (0–100 %) und Ø KpZ (0–6)
  auf eine gemeinsame Skala zu zwingen würde eine der beiden Linien flach drücken.
- Die **Kanten-Achse** für die Jahreslinien (`categoryEdgeAxis`) gehört **nicht** in
  `dataZoom.xAxisIndex` — sie wird im `datazoom`-Handler per
  `syncCategoryEdgeAxis(chart, 1)` nachgeführt (siehe `echarts-glattt.js`).
- Die Kategorie-Achse läuft mit `axisLabel.interval = 0`, solange die Breite reicht —
  sonst beschriftet ECharts nur jede zweite Spalte, und ausgerechnet die jüngste
  Periode bleibt namenlos.
- Beim **Zurückschalten auf die Tabelle** werden die `position: sticky`-Offsets neu
  gemessen (`_syncMatrixOffsets()` im nächsten Frame, nicht nur in `$nextTick`):
  Die Matrix lag ausgeblendet, alle gemessenen Spaltenbreiten wären sonst 0.

##### Ehemalige Mitarbeiter („Unbekannt")

Der nächtliche `phorest:sync-staff` holt **nur aktive** Mitarbeiter (kein
`fetch_archived`) — 193 Datensätze, während die Phorest-API insgesamt 476 kennt,
davon 291 archivierte. Ausgeschiedene Mitarbeiter fehlen deshalb in
`phorest_staff`; genau dafür gibt es Stufe 3 des Lookups, den API-Fallback mit
`fetch_archived=true`.

> **Bug bis 31.07.2026:** Dieser Fallback las `_embedded.staff`, Phorest liefert
> die Liste aber unter **`_embedded.staffs`** (Plural). Die Abfrage war
> erfolgreich und lieferte schlicht eine leere Liste — dadurch blieb jeder
> ausgeschiedene Mitarbeiter dauerhaft „Unbekannt", ohne Fehlermeldung.
> Derselbe Pfad war auch in `PhorestApiService::getCachedStaff()`,
> `PhorestController` und `TestPhorestApi` falsch; der Sync-Command hatte ihn
> als einziger bereits korrigiert. Ein Test mit gefaketer Phorest-Antwort
> sichert die Auflösung jetzt ab.

**Multi-StaffId-Zusammenführung:** Ein Hub-Nutzer kann mehrere Phorest-StaffIds haben (eine pro Standort). Diese werden automatisch zusammengeführt:

1. Über `user_id` aus der `users`-Tabelle (Hub-Account)
2. Über identischen Namen aus der `phorest_staff`-Tabelle (Fallback für Staff ohne Hub-Account)

In der Instituts-Gruppierung greift dasselbe Merging, aber **nur innerhalb eines Standorts**.

##### Abgleich mit der bisherigen Tagesmessung (Google-Sheet, 31.07.2026)

Die BG-Zahlen decken sich (Monatssummen April–Juni: 284/315/272 im Hub gegen
285/321/275 im Sheet); auf Mitarbeiterebene waren im Juni sieben Personen in allen
drei Kennzahlen identisch. **CR und KpZ liegen im Hub systematisch 4–8 Punkte
niedriger**, weil der Hub einen Abschluss nur zählt, wenn der Vertrag **am selben Tag
im selben Institut** unterschrieben wurde (Definition Jan, 25.07.2026: „nur Verkäufe,
die direkt im BG stattfinden"). Von 520 Verträgen aus April–Juni traf das auf 463 zu;
bei den übrigen 57 lag das letzte BG 1–7 Tage (15), 8–30 Tage (14) oder über 30 Tage
(25) zurück, 8 hatten gar kein BG. Das Sheet zählt diese mit.

##### Umsetzungshinweise

- Die Tabelle nutzt **nicht** `.table-glattt`: dessen `padding: 1rem 1.25rem !important`
  ergibt 60-px-Zeilen. Stattdessen `.matrix-glattt` (eigene Sektion in
  `theme_glattt.css`) mit `table-layout: fixed`.
- **`table-layout: fixed` ist Pflicht**, nicht Kosmetik: Ohne feste Spaltenbreiten
  dehnen breite Blocklabels („Diese Woche") ihre Spalten, während die `left`-Offsets
  der fixierten Spalten aus CSS-Variablen kommen — Kopf und Werte laufen dann
  sichtbar gegeneinander. Breiten stehen in `--mx-name/-bg/-cr/-kpz`, die aus dem
  Spaltenmodell berechnete Summe wird zur **`min-width`**.
- Die Tabelle läuft auf `width: 100%` und nutzt damit die Kartenbreite aus; der
  Browser dehnt die Spalten dabei proportional. Deshalb werden die sticky-Offsets
  **nach dem Rendern gemessen** (`_syncMatrixOffsets()` schreibt `--mx-off-1…4`) —
  feste `calc()`-Werte aus den Variablen säßen bei gedehnten Spalten daneben. Der
  Verifikationslauf prüft das über den Versatz zwischen Kopf- und Datenzellen.
- **Die Institutszeile ist eine `colspan`-Zelle über die volle Tabellenbreite.**
  `position: sticky` auf der Zelle hält nur die Zelle — der Text am Zellenanfang
  scrollt trotzdem aus dem Bild. Sticky gehört auf den Inhalt
  (`.matrix-glattt-group-label`), und sein `left` muss dem horizontalen
  Zellenpolster entsprechen, sonst springt der Name beim ersten Scrollschritt.
- Auch die Kopfzeilen brauchen jede ein eigenes `top` — ohne wirkt `sticky`
  nicht. Bei aufgeklapptem Monat sind es drei Zeilen; die Offsets kommen aus
  `_syncMatrixOffsets()` (gemessene Zeilenhöhen, `--mx-top-2/-3`).
- Wochenspalten haben eigene, schmalere Breiten (`--mx-wbg/-wcr/-wkpz`), damit
  ein aufgeklappter Monat in den freien Bereich neben den fixierten Spalten
  passt und `_centerMonth()` ihn tatsächlich mittig setzen kann.
- `thead`, `tbody`, `tfoot` und `colgroup` werden als HTML-Strings gebaut
  (`x-html`) — bei ~3.000 Zellen wäre ein Alpine-Scope je Zelle spürbar träge.
  Der Klick auf die Monatsköpfe läuft deshalb über Event-Delegation am Container
  (`[data-month]`).
- Leere Perioden werden **nicht** ausgeliefert: Bei 4 Monaten × ~5 Wochen wären
  sonst gut 25 leere Objekte je Mitarbeiter im Payload. Frontend und Export
  behandeln fehlende Keys als „keine Daten" (Antwort aktuell ~110 KB).

#### Zielwerte konfigurieren (Modal)

Über den Button **„Zielwerte"** im Seitenkopf öffnet sich ein Modal zur Konfiguration der Farbschwellenwerte.

**Features:**
- Pill-Buttons zur Standort-Auswahl: „Standard (Alle)" + ein Button pro Standort
- Pro Standort/Standard jeweils 6 Felder:
  - **KpZ**: Zielwert, Grün-Schwelle, Gelb-Schwelle
  - **CR**: Zielwert (%), Grün-Schwelle (%), Gelb-Schwelle (%)
- Standort-Einträge die identisch zum Standard sind, werden beim Speichern automatisch entfernt
- Änderungen werden sofort in der Tabelle wirksam (ohne Seitenreload)
- Zielwerte auch über Filament-Admin änderbar (`/admin/staff-performance-settings`)

### Standort-Filter

Der Standort-Filter in der Seitenleiste filtert alle Daten auf ein bestimmtes
Institut. Bei Wechsel werden alle Sektionen automatisch neu geladen
(`branchChanged`-Event → `reloadAllData()`), jede Karte lädt dabei unabhängig.
Serverseitig hängt er als `branch_id` an jedem Endpunkt und wirkt in
`buildConsultationFilters()` (Beratungstermine) **und**
`buildContractFilters()` (Verträge) — beide Seiten des Joins müssen gefiltert
sein, sonst zählen Verträge fremder Standorte mit.

> **Behobener Fehler (07/2026):** In `getConversionContractIds()` (Datenbasis der
> Körperzonen-Verteilung) stehen die Vertrags-Platzhalter **zuerst** im SQL — im
> INNER JOIN, vor den Service-IDs. Die Bindings wurden aber in der Reihenfolge von
> `executeAggregateQuery()` zusammengesetzt (Beratung zuerst). Ohne Standortfilter
> fiel das nicht auf, weil die Vertrags-Bindings dann leer sind; **mit** Filter
> landete die `branch_id` auf dem falschen Platzhalter und die erste Service-UUID
> in `c.branch_id = ?` — die Karte „Körperzonen-Verteilung" war bei jedem
> ausgewählten Standort leer. Abgesichert durch
> `test_body_zone_distribution_respects_the_branch_filter`.

### Zeitraum: EIN Seiten-Filter (Monatsraster), eine Ausnahme

Seit 08/2026 sitzt im **Seitenkopf** (neben Export/Zielwerte) der
**Monatsbereich-Picker** `<x-month-range-picker>` — er ist der Zeitraum-Filter
der **ganzen Seite** (JS-State `filterFrom`/`filterTo`, `setFilterRange()` lädt
alle zeitraumabhängigen Karten neu). Vorauswahl: die letzten vier
Kalendermonate inkl. des laufenden, zurück wählbar bis zum ältesten
Beratungstermin. Die früheren Karten-eigenen Filter (flatpickr an Tagesmessung
und Behandlungen) sind entfallen.

| Karte | Zeitraum |
|---|---|
| **KPI-Zeile** | **Ausnahme: immer laufender Monat** (steht im Titel der Zeile) |
| **Tagesmessung, Tabelle** | Seiten-Zeitraum |
| **Tagesmessung, Diagramm** | **Ausnahme: immer gesamte Historie** — Ausschnitt über die Zoom-Leiste |
| **Beratungs-Ranking, Diagramm** | **Ausnahme: immer gesamte Historie** — Ausschnitt über die Zoom-Leiste |
| **Beratungs-Ranking, Bestenliste** (+ Detail-Modal) | Seiten-Zeitraum |
| **Behandlungs-Ranking, Diagramm** | **Ausnahme: immer gesamte Historie** — Ausschnitt über die Zoom-Leiste |
| **Behandlungs-Ranking, Tabelle** | Seiten-Zeitraum |

Alle Ausnahmen stehen in Hinweiszeile bzw. Titel der jeweiligen Karte und im
Info-Panel, damit der Bezug nicht stillschweigend passiert.

Die **Endpunkte** akzeptieren durchgehend `date_from`/`date_to` (siehe
`StaffPerformanceController::extractFilters()`); die Tagesmessung zieht daraus ihre
Monatsspalten (`getStaffOverview($filters, $from, $to)`), der CSV-Export nutzt
dieselben Parameter für die Quellen mit `range`-Filter.

### CSV-Export

Über den Export-Button im Seitenkopf stehen alle Auswertungen der Seite als
CSV bereit (Quellen in `ReportExportService::SOURCES`, alle mit Standort-Filter):

| Quelle | Inhalt |
|--------|--------|
| `staff-overview` | Tagesmessung: BG, CR & KpZ je Zeitraum (eine Zeile pro Mitarbeiter × Zeitraum); `date_from`/`date_to` steuern die Monatsspalten wie im UI |
| `staff-overview-branches` | Tagesmessung je Institut: Mitarbeiter-Zeilen standortweise, Instituts-Zwischensummen **und** die Gesamtzeile je Zeitraum (Spalte „Zeilenart“ = Mitarbeiter / Institut gesamt / Gesamt). Die Gesamtzeilen sind zugleich die Datenreihe der Diagramm-Linien |
| `staff-ranking` | Bestenliste des Beratungs-Rankings mit allen Kennzahlen, standortübergreifend zusammengeführt; Spalte „Quote belastbar“ = ja/nein (≥ 20 Beratungen) |
| `staff-treatments` | Behandlungs-Ranking: Termine, Service-Positionen, Behandlungs-/Schichtzeit (Std.), Auslastung (%), mögliche Termine, Termin-Anteil (%) + Behandlungsstunden des Instituts |

Mit den drei gestrichenen Karten sind auch deren Quellen entfallen
(`staff-branch-comparison`, `staff-monthly-trend`, `staff-body-zones`) — der Export
einer Seite spiegelt, was die Seite zeigt.

### Behandlungs-Ranking (bis 08/2026 „Durchgeführte Behandlungen")

Zeigt, wie viele Behandlungen die einzelnen Mitarbeiter wahrnehmen — seit
08/2026 als **Monats-Zeitverlauf** (vorher ein Balken-Ranking der Top 15).

**Zwei Ansichten** (Umschalter oben links neben dem Titel):

- **Mitarbeiter** — bis zu fünf ausgewählte Personen als einzelne Linien
  (Standard, siehe unten).
- **Team** — die Behandlungszeit **aller** Mitarbeiter eines Instituts als
  **gestapelte Flächen**; die Gesamthöhe ist die komplette Behandlungszeit des
  Standorts im jeweiligen Monat. Das Institut wird über den Filter oben rechts
  gewählt; mit **„Alle Institute"** wird stattdessen je Standort gestapelt (in
  den zentralen Instituts-Farben aus `BranchColorService`). Zwei Darstellungen:
  **Stunden** (absolut — zeigt zugleich die Entwicklung des Gesamtvolumens) und
  **Anteil 100 %** (jeder Monat auf volle Höhe normalisiert — zeigt allein die
  Verschiebung der Anteile, etwa wenn jemand Aufgaben übernimmt oder ausfällt).
  Auslastung und Termin-Anteil gibt es hier bewusst nicht: Quoten mehrerer
  Personen ergeben aufeinandergestapelt keinen sinnvollen Wert. Da je Institut
  über die Historie bis zu 40 Personen zusammenkommen, werden die Farben über
  eine Rotation im goldenen Winkel erzeugt (`stackColor()`), die Legende ist
  scrollbar. **Die Legende folgt dem Zoom:** Beim Verkleinern des Ausschnitts
  fallen Mitarbeiter ohne Behandlung im Fenster heraus (bei Bielefeld z.B. von 35
  auf 6 Einträge), beim Aufziehen kommen sie zurück. Die Farbzuordnung wird
  vorher über die vollständige Liste vergeben, damit eine Person beim Zoomen
  nicht die Farbe wechselt; neu gezeichnet wird nur, wenn sich die Menge der
  sichtbaren Flächen tatsächlich ändert (`_treatShownKeys`), sonst löste jedes
  Zucken am Regler einen Re-Render aus. Die Monatssummen für die
  100-%-Normalisierung laufen bewusst weiter über **alle** Serien — sonst
  summierten sich die Anteile nicht mehr auf die tatsächliche Gesamtzeit.
  **Klick-Freistellung** nach Projekt-Konvention (`enableSeriesIsolation()`):
  Ein Klick auf eine Fläche blendet alle übrigen aus, ein erneuter Klick zeigt
  wieder alle. Die Flächen brauchen dafür `triggerLineEvent: true` — mit
  `symbol: 'none'` gäbe es sonst keine klickbaren Punkte und das Event käme nie
  an. Die Dekor-Serien (Jahreslinien, „laufend") tragen bewusst keinen `name`
  und sind damit automatisch von der Freistellung ausgenommen.

> **Der laufende Monat ist immer unvollständig** und wird deshalb in beiden
> Ansichten gekennzeichnet: schraffierte Zone mit der Beschriftung „laufend",
> bei den Mitarbeiter-Linien zusätzlich ein gestricheltes Endsegment (Muster wie
> bei Prognosen). Ohne diese Markierung stürzte die Kurve am Monatsersten auf
> null ab und die Karte sah jeden Monatsanfang nach Einbruch aus.

**Diagramm, Ansicht „Mitarbeiter" (Standard):** je gewähltem Mitarbeiter eine
Linie über die Kalendermonate, umschaltbar über das Segmented Control oben rechts:

- **Stunden** — die Zeit in Behandlungen je Monat (verschmolzene Zeitfenster,
  Überlappungen zählen nur einmal).
- **Auslastung %** — Behandlungszeit ÷ (Schichtzeit − Beratungszeit −
  Desinfektionszeit). Die Schichtzeiten kommen aus dem Phorest-Dienstplan
  (nächtlicher Sync, siehe Entwickler-Teil). Beratungsgespräche sind explizit
  keine Behandlungen und werden komplett herausgehalten (weder Zähler noch
  Nenner); Desinfektion ist Pflichtzeit nach jedem Kunden und wird deshalb
  ebenfalls vom Nenner abgezogen — sonst käme selbst ein voll ausgebuchter Tag
  nie in die Nähe von 100 % (die ~10-min-Blöcke summieren sich auf gut ein
  Viertel der belegten Zeit). Pausen werden bewusst **nicht** abgezogen (in
  Phorest teils zweckentfremdet gepflegt). Überlappende oder parallel gebuchte
  Zeitfenster zählen nur einmal — es kann nur ein Termin gleichzeitig
  wahrgenommen werden. Da Termine nicht parallel laufen, ist die verfügbare
  Schichtzeit zugleich die maximal mögliche Behandlungszeit — der Tooltip
  rechnet sie zusätzlich in **„X von Y möglichen Terminen"** um (verfügbare
  Zeit ÷ tatsächliche Ø-Termindauer des Monats, nichts geschätzt). Monate ohne
  gepflegte Schichtzeiten zeigen eine **Lücke** statt 0 % (Dienstpläne sind ab
  ca. 2024 flächendeckend gepflegt, 2023 lückig). 100 % hieße: die komplette
  verfügbare Schichtzeit war lückenlos mit Behandlungen gefüllt — Leerlauf
  zwischen Terminen ist genau das Signal, das die Ansicht zeigen soll.
- **Termin-Anteil %** — eigene Behandlungszeit ÷ Behandlungszeit **aller
  Mitarbeiter des Instituts im selben Schichtfenster**. Beantwortet die andere
  Frage: nicht „war meine Schicht voll?", sondern „von dem, was da war, habe ich
  wie viel übernommen?". Wer allein in der Schicht ist und alles Gebuchte
  behandelt, steht bei **100 %** — unabhängig davon, wie voll der Kalender war.
  Verglichen wird nur, was zeitgleich mit der eigenen Schicht lief; Termine vor
  Schichtbeginn oder nach Schichtende zählen nicht gegen den Mitarbeiter.

> **Die beiden Quoten gehören zusammen:** Ein Institut mit wenig Terminen, aber
> nur einer Kraft in der Schicht (typisch Braunschweig) → niedrige Auslastung,
> 100 % Termin-Anteil: Die Person hat alles übernommen, was da war — die Lücke
> ist ungenutzte Kapazität des Instituts, kein Versäumnis. Ein großes Team an
> einem vollen Tag → hohe Auslastung, aber je Person ein kleiner Anteil. Deshalb
> stehen im Tooltip **immer alle Werte**, unabhängig von der gewählten Linie.

Das Diagramm lädt — wie das Beratungs-Ranking — **immer die gesamte Historie**
(eigener Endpoint `treatments-timeline`); der Ausschnitt wird über die
**Zoom-Leiste** unten gewählt. Bis zu **5 Mitarbeiter** über den Baum-Filter
„Mitarbeiter" (Standorte → Mitarbeiter, sortiert nach Behandlungszeit);
vorausgewählt sind die 5 mit der meisten Behandlungszeit. Dieselbe Person an
zwei Standorten ist je Standort wählbar.

**Tabelle (Lasche):** alle Mitarbeiter über den Seiten-Zeitraum mit
**Behandlungs-Terminen** (Kunde × Tag × Institut mit mindestens einem
Behandlungs-Service), **Service-Positionen**, **Behandlungszeit (Std.)**,
**Schichtzeit (Std.)**, **Auslastung (%)** (Tooltip: „X von Y möglichen
Terminen"), **Termin-Anteil (%)** (Tooltip: „X von Y Behandlungsstunden im
Institut") und den drei **Top-Behandlungen**. Ohne Schichtdaten steht „–". In
der Gesamtzeile bleibt der Termin-Anteil leer — über alle Mitarbeiter zusammen
wären es definitionsgemäß 100 %.

Beratungsgespräche und Desinfektion zählen nicht; gezählt werden nur
durchgeführte Termine (abgeschlossen/bezahlt). Standort-Filter und die
[Datensichtbarkeit](DATA-VISIBILITY.md) (eigene Daten / Team / alle) greifen
auch hier. Export über die CSV-Quelle „Behandlungs-Ranking".

Hinweis zur Abgrenzung: Behandlungen je **Institut** und je **Behandlungsart** (ohne Mitarbeiter-Bezug) zeigt weiterhin die Terminstatistik („Monatliche Übersicht", „Top Services"). Diese Sektion ergänzt die dort fehlende Mitarbeiter-Achse — und liefert die Datenbasis für die späteren HR-KPIs (KPZ pro Arbeitsstunde).

---

## Für Entwickler

### Architektur

Die Seite folgt dem bewährten Statistik-Muster: **Controller → Service → JSON-API → Alpine.js**.

```
StaffPerformanceController (app/Http/Controllers/)
├── index()            → Blade-View rendern
├── kpis()             → JSON: 8 KPI-Metriken mit Vergleichswerten
├── staffRanking()     → JSON: Bestenliste des Beratungs-Rankings (standortübergreifend zusammengeführt)
├── branchComparison() → JSON: Standort-Vergleich (nur Dashboard-Widget + Zielwerte-Tabs)
├── monthlyTrend()     → JSON: Monatlicher Zeitverlauf (nur Dashboard-Widget)
├── bodyZones()        → JSON: Körperzonen-Verteilung (nur Dashboard-Widget)
├── staffDetail()      → JSON: Einzelansicht pro Mitarbeiter
├── treatments()       → JSON: Behandlungs-Ranking-Tabelle (Termine, Zeiten, Auslastung; Seiten-Zeitraum)
├── treatmentsTimeline() → JSON: Behandlungs-Zeitverlauf je Monat (gesamte Historie, fürs Diagramm)
├── overview()         → JSON: Tagesmessung (date_from/date_to → Monate + Wochen, Instituts-Gruppen)
├── targets()          → JSON: Zielwerte lesen (GET)
├── saveTargets()      → JSON: Zielwerte speichern (POST)
└── preview()          → JSON: 4 Preview-KPIs für Reports-Hauptseite

StaffPerformanceService (app/Services/)
├── getKpis()                  → KPI-Berechnung mit Vormonat/Vorjahr-Vergleich
├── getStaffRanking()          → Ranking nach Conversion-Rate, Standorte je Person zusammengeführt, is_reliable ab RANKING_MIN_SAMPLE
├── getBranchComparison()      → Vergleich aller Standorte (Dashboard-Widget + Zielwerte-Tabs)
├── getMonthlyTrend()          → 12-Monats-Trend (gesamt + pro Branch, Dashboard-Widget)
├── getBodyZoneDistribution()  → Meistverkaufte Körperzonen (Dashboard-Widget)
├── getStaffDetail()           → Einzelne Beratungen eines Mitarbeiters
├── getStaffOverview($f,$from,$to) → Tagesmessung: Tagesspalten + ein Monatsblock je Kalendermonat im Zeitraum, Staff-Merging + Targets
├── getTreatmentsByStaff()      → Behandlungs-Ranking-Tabelle inkl. Behandlungs-/Schicht-/Beratungszeit + Auslastung
├── getTreatmentTimeline()      → Monats-Zeitverlauf je Mitarbeiter × Standort (Diagramm-Datensatz, gesamte Historie)
├── getEarliestConsultationDate()  → ältester Beratungstermin = minDate des Zeitraum-Pickers
├── getPreviewKpis()           → 4 Werte für Reports-Übersicht
└── flushCache()               → Cache-Invalidierung (statisch)

StaffPerformanceTarget (app/Models/)
├── globalDefaults()    → Standard-Schwellenwerte (branch_id = NULL)
├── forBranch(?string)  → Schwellenwerte für bestimmten Standort (Fallback auf Global)
└── allTargetsMap()     → Map: '_default' + branch_id → Schwellenwerte
```

### Relevante Dateien

| Datei | Zweck |
|-------|-------|
| `app/Http/Controllers/StaffPerformanceController.php` | Controller mit Filter-Extraktion |
| `app/Services/StaffPerformanceService.php` | Core-Logik: CTEs, Aggregation, Caching, Staff-Merging |
| `app/Models/StaffPerformanceTarget.php` | Zielwerte-Model (global + pro Standort) |
| `app/Filament/Pages/StaffPerformanceSettings.php` | Filament-Admin: Globale Zielwerte |
| `resources/views/hub/reports/staff-performance.blade.php` | Haupt-View |
| `resources/views/hub/reports/staff-performance/partials/header.blade.php` | Seitenkopf + Zurück-Button + Zielwerte-Button |
| `resources/views/hub/reports/staff-performance/partials/overview-table.blade.php` | Tagesmessung: Register (Tabelle als Standard), Matrix, Diagramm-Container, Zeitraum-Picker, Gruppierungs-Umschalter |
| `resources/views/hub/reports/staff-performance/partials/targets-modal.blade.php` | Zielwerte-Modal (Pill-Buttons, pro Standort) |
| `resources/views/hub/reports/staff-performance/partials/staff-ranking.blade.php` | Beratungs-Ranking (Zeitverlauf CR/KPZ + Verkäufer-Filter + Bestenlisten-Tabelle) |
| `resources/views/hub/reports/staff-performance/partials/staff-detail-modal.blade.php` | Detail-Modal (Stat-Strip + Beratungsliste) |
| `resources/views/hub/reports/staff-performance/partials/treatments.blade.php` | Behandlungs-Ranking (Zeitverlauf Stunden/Auslastung + Mitarbeiter-Filter + Tabelle) |
| `app/Services/StaffShiftSyncService.php` | Schichtzeiten-Sync (Phorest WorkTimeTable → `stats_staff_shifts`) |
| `app/Console/Commands/SyncStaffShifts.php` | `sync:staff-shifts` (nächtlich + Backfill über `--from`/`--to`) |
| `app/Models/StatsStaffShift.php` | Schicht-Slots (eine Zeile je WORKING-Slot) |
| `public/js/staff-performance.js` | Alpine.js App: Loader je Karte (sectionError), ECharts-Renderer (acquireChart-Muster), Matrix-HTML, kombiniertes Tagesmessungs-Diagramm (`_overviewChartOption`), Beratungs-Ranking (Zeitverlauf + Verkäufer-Filter), Targets, Staff-Merging |
| `app/Services/ReportExportService.php` | CSV-Export-Quellen `staff-*` |
| `resources/views/components/statistics/widgets/partials/staff-*.blade.php` | **Eingefrorene Kopien** der alten Partials für die Custom-Dashboard-Widgets (siehe unten) |
| `resources/views/hub/reports/partials/overview-cards/mitarbeiterperformance-card.blade.php` | Preview-Card auf Berichte-Übersicht |
| `tests/Feature/StaffPerformanceTest.php` | Feature-Tests (Kernlogik, benötigt MySQL) |
| `tests/Feature/StaffPerformancePageTest.php` | Seiten-Skelett (Register, Skeletons, Info-Panels) + Export-Quellen |
| `tests/Feature/StaffPerformanceScopeTest.php` / `StaffTreatmentsTest.php` | Datensichtbarkeit / Behandlungs-Zählung + Zeit-/Auslastungsspalten |
| `tests/Feature/StaffTreatmentTimelineTest.php` | Zeitverlauf: Intervall-Verschmelzung, Auslastungs-Rechnung, Scope |
| `tests/Unit/StaffShiftSyncServiceTest.php` | Schichtzeiten-Sync (Slot-Parsing, delete+insert, Fehlerpfad) |

**Custom-Dashboard-Widgets entkoppelt (07/2026):** Die 5 Staff-Widgets des
Custom-Dashboards (`components/statistics/widgets/staff-*.blade.php`) teilten
sich die Partials mit der Berichtsseite. Seit dem Bauplan-Umbau binden sie
eingefrorene Kopien des alten Stands ein (`widgets/partials/staff-*.blade.php`)
— ihre Modernisierung gehört zur separaten Aufgabe „Custom Dashboard
überarbeiten".

### SQL-Kernlogik (CTEs)

Die Datenverknüpfung basiert auf zwei Common Table Expressions (CTEs):

```sql
WITH ranked AS (
    -- Alle Beratungsgespräche mit Rang pro Client/Tag/Branch
    SELECT sha.staff_id, sha.client_id, sha.branch_id,
           sha.appointment_date, sha.start_time,
           ROW_NUMBER() OVER (
               PARTITION BY sha.client_id, sha.appointment_date, sha.branch_id
               ORDER BY sha.start_time DESC
           ) as rn
    FROM stats_historic_appointments sha
    WHERE sha.service_id IN (Beratungs-Service-IDs)
      AND sha.activation_state = 'ACTIVE'
      AND sha.state = 'COMPLETED'
      AND sha.deleted IS NULL OR sha.deleted = 0
),
contract_agg AS (
    -- Verträge voraggregiert pro Client/Branch/Tag
    -- Verhindert Row-Multiplikation bei mehreren Verträgen pro Tag
    SELECT c.client_id, c.branch_id, DATE(c.signed_at) as signed_date,
           COUNT(*) as contract_count,
           SUM(c.body_zone_count) as total_body_zones,
           SUM(CASE WHEN c.is_full_body = 1 THEN 1 ELSE 0 END) as full_body_count,
           SUM(c.total_value_cents) as total_revenue_cents
    FROM contracts c
    WHERE c.status IN ('active', 'completed')
      AND c.signed_at IS NOT NULL AND c.deleted_at IS NULL
    GROUP BY c.client_id, c.branch_id, DATE(c.signed_at)
)
SELECT r.staff_id,
       COUNT(*) as total_consultations,
       SUM(CASE WHEN r.rn = 1 AND ca.contract_count > 0 THEN 1 ELSE 0 END) as conversions,
       SUM(CASE WHEN r.rn = 1 AND ca.contract_count > 0 THEN ca.total_body_zones ELSE 0 END) ...
FROM ranked r
LEFT JOIN contract_agg ca
    ON ca.client_id = r.client_id
    AND ca.signed_date = r.appointment_date
    AND ca.branch_id = r.branch_id
    AND r.rn = 1
GROUP BY r.staff_id
```

**Wichtige Details:**
- `ROW_NUMBER()` partitioniert nach (client_id, appointment_date, branch_id) mit `ORDER BY start_time DESC` → `rn=1` = letzte Beratung des Tages
- `contract_agg` CTE voraggregiert Verträge, damit der LEFT JOIN nie Row-Multiplikation verursacht
- Die `AND r.rn = 1` Bedingung im JOIN stellt sicher, dass nur die letzte Beratung den Abschluss zugeordnet bekommt

### Aktualität der Daten (Termine von heute)

Alle Auswertungen lesen aus `stats_historic_appointments`. Der nächtliche
`sync:appointments` holt jedoch **nur den Vortag** — der laufende Tag fehlte
dadurch komplett: In der Tagesmessung blieb die Spalte **„Heute" leer**, und
„Diese Woche", die laufende Kalenderwoche und der Monat waren um den heutigen
Tag zu niedrig (gemeldet 08/2026).

Gelöst über **`sync:appointments-recent`** (`SyncRecentAppointments`): Der
Command holt die **letzten 3 Tage inklusive heute** nach und leert anschließend
die Report-Caches (`StaffPerformanceService`, `ReportsOverviewCache`,
`SalesStatisticsService`, `GlatttKpiService`) — ohne den Flush zeigten die
Auswertungen die frischen Termine erst nach Ablauf ihrer TTL von bis zu einer
Stunde.

> **Nur diese vier Caches — bewusst.** Jeder Flush kostet den nächsten Besucher
> einen kalten Cache. Die Kundenstatistik etwa liest gar nicht aus der
> Terminhistorie (sie hängt an `client_statistics` mit eigenem Sync); sie
> mitzuleeren entwertete ihre teuren Auswertungen alle 15 Minuten grundlos.
>
> **Der Warmer läuft 2 Minuten versetzt** (`2,17,32,47` statt `*/15`): Vorher
> liefen `reports:warm-cache` und der Sync zur selben Minute, der Sync warf den
> frisch gewärmten Cache also sofort wieder weg und Nutzer trafen trotz Warmer
> auf einen kalten Cache. Der Sync braucht ~20 s, der Warmer ~9 s — zwei
> Minuten Abstand reichen mit Puffer. Gilt für Laravel-Scheduler **und** den
> Cloud-Scheduler-Job.

Weil die Daten in dieselbe Tabelle geschrieben werden, werden **alle** Perioden
automatisch korrekt; an der Auswertungs-Logik musste nichts geändert werden.
Auch andere Berichte auf Basis der Terminhistorie profitieren davon.

- **Zeitfenster 3 Tage, nicht nur heute:** Ein Termin zählt erst als
  durchgeführt, wenn er in Phorest auf `PAID` steht — das passiert oft erst beim
  Abrechnen, teils am Folgetag. Der nächtliche Lauf sieht solche Nachzügler nie,
  das rollierende Fenster fängt sie ein. Laufzeit ~7 Sekunden (3 Tage,
  ~680 Termine).
- **Automatisch alle 15 Minuten:** Laravel-Scheduler `everyFifteenMinutes()`,
  in der Cloud die Jobs `sync-recent-appointments` (Prod) und
  `sync-recent-appointments-staging`.
- **Manuell:** Button **„Aktualisieren"** im Seitenkopf der
  Mitarbeiterperformance (`POST /hub/reports/staff-performance/refresh-recent`,
  Permission `trigger_data_sync` wie die übrigen manuellen Syncs). Ein
  Cache-Lock (`staff-perf:manual-refresh`, 120 s) verhindert parallele
  Phorest-Abfragen bei mehreren Nutzern; ein zweiter Aufruf antwortet sofort mit
  `skipped: true`. Nach Erfolg lädt die Seite alle Karten neu.

> **Was der Button nicht heilt:** Die Zahlen des laufenden Tages sind
> naturgemäß unfertig — Termine laufen noch, und Abschlüsse werden teils erst
> später erfasst. Eine niedrige Conversion-Rate am selben Tag ist deshalb kein
> verlässliches Signal.

### Datengrundlagen

| Tabelle | Rolle |
|---------|-------|
| `stats_historic_appointments` | Beratungstermine (aus Phorest synchronisiert) |
| `contracts` | Verträge (im GlattHub erstellt) |
| `contract_body_zones` | Pivot: Welche Körperzonen pro Vertrag |
| `body_zones` | Körperzonen-Stammdaten |
| `phorest_staff` | Staff-Mapping: Phorest-ID → GlattHub-User |
| `staff_performance_targets` | Konfigurierbare Zielwerte (global + pro Standort) |
| `stats_staff_shifts` | Schichtzeiten aus dem Phorest-Dienstplan (Auslastung im Behandlungs-Ranking) |

### Schichtzeiten-Sync (`stats_staff_shifts`, seit 08/2026)

Die Auslastungs-Rechnung des Behandlungs-Rankings braucht die Dienstplan-Schichten.
Die Phorest-API (`staff/worktimetable`) erlaubt **max. 1 Monat pro Abfrage** —
live abfragen ist für einen Monats-Zeitverlauf unmöglich, deshalb liegt eine
lokale Kopie in `stats_staff_shifts` (eine Zeile je WORKING-Slot; NON_WORKING
wird verworfen, ebenso Slots mit Start = Ende).

- **Sync:** `StaffShiftSyncService` chunked in 28-Tage-Blöcke und ersetzt je
  Branch + Block den kompletten Bestand (**delete + insert**) — so kommen auch
  nachträglich gelöschte/verschobene Schichten sauber an.
- **Nächtlich:** `sync:staff-shifts` ohne Optionen synct ein rollierendes
  Fenster (35 Tage zurück bis heute). Laravel-Scheduler 03:30; in der Cloud über
  zwei Scheduler-Jobs (europe-west3, Zeitzone Europe/Berlin, Deadline 1800s):
  **`sync-staff-shifts`** (Prod) und **`sync-staff-shifts-staging`** (Staging).
  Beide Umgebungen nutzen denselben `CRON_SECRET_TOKEN`.
- **Backfill:** einmalig `php artisan sync:staff-shifts --from=2023-01-01`
  bzw. in der Cloud der Cron-Endpoint mit Parametern
  (`POST /api/cron/sync-staff-shifts?from=2023-01-01`, Header `X-Cron-Token`).
  Ohne Backfill zeigt der %-Modus keine Historie. Am 01.08.2026 einmalig für
  Staging und Prod gefahren: je **24.515 Slots über 5 Institute**, Laufzeit
  rund 70 Sekunden — dieselbe Zahl wie lokal, da alle Umgebungen dieselbe
  Phorest-Quelle lesen.
- **Auslastungs-Rechnung** (`getTreatmentTimeline()` / `getTreatmentsByStaff()`):
  Behandlungs- und Beratungszeit werden je Mitarbeiter × Standort × Tag über
  eine **Islands-Query** (Fensterfunktionen, läuft auf MySQL 8 **und** SQLite)
  zu verschmolzenen Intervallen aggregiert — überlappende/parallel gebuchte
  Service-Positionen zählen nur einmal. Auslastung = Behandlungszeit ÷
  (Schichtzeit − Beratungszeit − Desinfektionszeit); „mögliche Termine" =
  verfügbare Zeit ÷ tatsächliche Ø-Termindauer des Monats. Ohne Schichtdaten
  bleiben die Auslastungs-Felder `null` (Lücke im Chart, „–" in der Tabelle).
- **Phorest-Platzhalter ausgeschlossen** (`getNonPersonStaffIds()`): Kabinen-,
  Sammel-, Absage- und Zugangs-Spalten haben Dienstpläne über die kompletten
  Öffnungszeiten (14 h/Tag) und verfälschten dadurch jede Auslastung — die
  Gesamtzeile stand vor dem Fix bei 23 % statt 39 % (08/2026). Der Filter greift
  in `buildTreatmentFilters()` **und** `getShiftIntervalsByDay()` und nutzt die
  erprobten Muster aus `HrStaffLinkService::isNonPerson()`, damit
  Behandlungs-Ranking und HR-Kennzahlen dieselbe Definition teilen.
- **Termin-Anteil** (`getTakeShareSecondsByDay()`): schneidet die verschmolzenen
  Behandlungs-Intervalle **aller** Mitarbeiter des Instituts mit den eigenen
  Schichtfenstern (`intersectSeconds()`). Zähler = eigene Schnittmenge, Nenner =
  Summe über alle Kollegen. Zähler und Nenner werden über Tage/Monate **getrennt
  summiert** und erst am Ende geteilt — Tagesquoten dürfen nie gemittelt werden.
  Der Nenner ignoriert bewusst `scope_staff_ids` (nur Aggregat der Kollegen,
  keine Einzeldaten); sonst sähe ein „eigene Daten"-Nutzer sich selbst immer bei
  100 %. Branch-Scope und Standort-Filter gelten unverändert.

### Beratungs-Service-IDs (Phorest)

| Service-ID | Name |
|------------|------|
| `rqo_e_VJWl12uqy2YWImSg` | Gratis Online-Beratung |
| `z_mUzNH2LUzr2LqO1I-OTQ` | Beratungstermin |
| `_rlfuXQaRrHoB0r4nklZJw` | Beratung ohne Termin |

### Staff-Mapping

```
stats_historic_appointments.staff_id
    → phorest_staff.phorest_user_id (oder phorest_staff.staff_id)
    → phorest_staff.glatthub_user_id
    → users.id
```

Der Service prüft sowohl `phorest_user_id` als auch `staff_id`, da die Phorest-API unterschiedliche ID-Typen verwendet.

### Staff-Merging (Multi-StaffId-Zusammenführung)

Ein Mitarbeiter kann in Phorest mehrere `staffId`-Einträge haben (einen pro Standort). In der Übersichtstabelle werden diese automatisch zusammengeführt:

**Merge-Key-Strategie (Priorität):**

1. **`user_{userId}`** — Mitarbeiter hat einen GlattHub-Account (`users.phorest_staff_ids` enthält die staffId). Gilt als Hub-User.
2. **`name_{md5(name)}`** — Gleicher Name in `phorest_staff`-Tabelle (Fallback für Mitarbeiter ohne Hub-Account). Gilt NICHT als Hub-User.
3. **Rohe `staffId`** — Kein Mapping gefunden. Nur als Fallback.

**Aggregation bei Zusammenführung:**
- `consultations`, `conversions`, `body_zones` → Summe
- `conversion_rate` → Neuberechnung: `conversions / consultations * 100`
- `avg_zones_per_contract` → Neuberechnung: `body_zones / conversions`
- `branches_list` → Vereinigung aller Standorte (kommasepariert)

### Zielwerte-Tabelle (`staff_performance_targets`)

```sql
CREATE TABLE staff_performance_targets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    branch_id VARCHAR(255) NULL UNIQUE,  -- NULL = globaler Standard
    kpz_target DECIMAL(8,2) DEFAULT 3.00,
    cr_target DECIMAL(8,2) DEFAULT 60.00,
    kpz_green DECIMAL(8,2) DEFAULT 3.00,
    kpz_yellow DECIMAL(8,2) DEFAULT 2.00,
    cr_green DECIMAL(8,2) DEFAULT 60.00,
    cr_yellow DECIMAL(8,2) DEFAULT 40.00,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

- `branch_id = NULL` → Globale Standardwerte
- `branch_id = '{phorest_branch_id}'` → Standort-spezifische Überschreibung
- Nur Standort-Einträge die vom Standard abweichen werden gespeichert

### Caching

- **TTL:** 3600 Sekunden (1 Stunde)
- **Versionierung:** `staff-perf:v{N}:{method}:{filter_hash}`
- **Invalidierung:** Automatisch über `ContractObserver` bei Vertrags-Erstellen/Ändern/Löschen
- **Manuelle Invalidierung:** `StaffPerformanceService::flushCache()` — wird beim Speichern von Zielwerten aufgerufen, damit Farbänderungen sofort wirksam werden

### Datenbank-Indexes

Für optimale Performance existieren dedizierte Composite-Indexes:

| Tabelle | Index | Spalten |
|---------|-------|---------|
| `stats_historic_appointments` | `sha_client_date_branch_idx` | `client_id, appointment_date, branch_id` |
| `contracts` | `contracts_client_branch_signed_idx` | `client_id, branch_id, signed_at` |

Migration: `2026_06_25_100000_add_staff_performance_contract_index.php`

### API-Endpunkte

| Methode | URL | Beschreibung |
|---------|-----|-------------|
| GET | `/hub/reports/staff-performance` | Hauptseite (Blade-View) |
| GET | `/hub/reports/staff-performance/kpis` | 8 KPI-Metriken |
| GET | `/hub/reports/staff-performance/staff-ranking` | Bestenliste des Beratungs-Rankings |
| GET | `/hub/reports/staff-performance/branches` | Standort-Vergleich |
| GET | `/hub/reports/staff-performance/monthly` | Monatlicher Zeitverlauf |
| GET | `/hub/reports/staff-performance/body-zones` | Körperzonen-Verteilung |
| GET | `/hub/reports/staff-performance/staff/{staffId}` | Mitarbeiter-Detail |
| GET | `/hub/reports/staff-performance/treatments` | Behandlungs-Ranking-Tabelle (Seiten-Zeitraum) |
| GET | `/hub/reports/staff-performance/treatments-timeline` | Behandlungs-Zeitverlauf je Monat (Diagramm, gesamte Historie) |
| GET | `/hub/reports/staff-performance/overview` | Tagesmessung (`date_from`/`date_to`, Standard: letzte 4 Kalendermonate) |
| GET | `/hub/reports/staff-performance/targets` | Zielwerte lesen |
| POST | `/hub/reports/staff-performance/targets` | Zielwerte speichern |
| GET | `/hub/reports/staff-performance/preview` | 4 Preview-KPIs |

**Filter-Parameter** (alle optional):
- `branch_id` — Standort-ID
- `date_from` — Datum ab (YYYY-MM-DD)
- `date_to` — Datum bis (YYYY-MM-DD)

### Preview-Card (Reports-Hauptseite)

Die Reports-Übersicht (`/hub/reports`) zeigt eine Vorschau-Karte mit 4 KPIs des aktuellen Monats:

| KPI | Beschreibung |
|-----|-------------|
| **Ø Körperzonen** | Durchschn. KPZ pro Abschluss |
| **Conversion-Rate** | Beratung → Vertrag in % |
| **Top Ø KPZ** | Bester Mitarbeiter nach Ø Körperzonen |
| **Top Conversion** | Bester Mitarbeiter nach Conversion-Rate |

### Permission

- **Permission-Name:** `view_report_sales_statistics`
- **Beschreibung:** Nutzt dieselbe Berechtigung wie die Verkaufsstatistik
- **Standard-Zuweisung:** Admin-Rolle

### Tests

```bash
# Seiten-Skelett, Tagesmessung, Export — laufen auf SQLite
php artisan test --filter='StaffPerformancePageTest|StaffDailyMeasurementTest'

# Kernlogik (StaffPerformanceTest) braucht MySQL — CTEs + ROW_NUMBER + DATE_FORMAT.
# Einmalig eine leere Test-DB anlegen, dann gegen sie fahren:
#   CREATE DATABASE glattthub_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
DB_CONNECTION=mysql DB_DATABASE=glattthub_test \
  php -d memory_limit=1G vendor/bin/phpunit --filter=StaffPerformanceTest
```

**Nie gegen die Entwicklungs-DB laufen lassen** — `RefreshDatabase` migriert frisch
und leert dabei alles.

**Hinweis:** Auf SQLite überspringt `StaffPerformanceTest` sich selbst
(`requiresMysql()`), deshalb blieb er lange unbemerkt kaputt: Fixtures ohne
`end_time`, `state = 'COMPLETED'` statt `'PAID'`, fehlende `consultation_services`
und ein fehlender `Http::fake()` ließen 15 von 19 Tests scheitern, sobald man ihn
doch gegen MySQL fuhr. Seit 07/2026 läuft die Suite wieder grün (22 Tests) — wer
`getKpis()`, `executeAggregateQuery()` oder die Staff-Auflösung anfasst, sollte sie
fahren, die SQLite-Suiten decken diese Pfade nicht ab.

---

## Performance-Optimierungen

Die Staff-Performance-Seite zeigt hunderte Datenzellen, Badges und Charts gleichzeitig. Folgende Optimierungen wurden implementiert, um Ruckeln (Jank) und hohe Render-Kosten zu vermeiden.

### Backend (Query-Konsolidierung)

| Methode | Vorher | Nachher | Maßnahme |
|---------|--------|---------|----------|
| `getStaffOverview()` | 8 Queries (1 pro Zeitraum) | 1 Query | Alle Zeiträume in einer CTE; die Zeilen werden in PHP auf die Perioden verteilt (`buildPeriodMatrix()`). Cache-Key enthält Monatstiefe, `MATRIX_SCHEMA` und das Tagesdatum (Perioden-Grenzen aus `Carbon::today()`) |
| `calculateKpiComparisons()` | 3 Queries | 1 Query | Vorperiode + Vergleich in einer Query (gruppiert nach Monat); übernimmt Branch-Filter **und** Datensichtbarkeits-Scope |
| `getMonthlyTrend()` | 2 Queries | 1 Query | Ein `GROUP BY Monat, branch_id`, Gesamt wird in PHP aufaddiert |
| `getStaffMap()` | Jeder Aufruf neu | Instance-Cache | Einmal laden, danach aus `$this->staffMapCache` |

**Instituts-Reihenfolge:** `getBranchComparison()`, `getMonthlyTrend()` und
`getBodyZoneDistribution()` sortieren ihre Institute serverseitig über den
`SortsBranchIds`-Trait (`InstituteColor.sort_order`) — Charts, Tabellen und
Exporte zeigen dieselbe konfigurierte Reihenfolge.

### Frontend (Alpine.js)

| Optimierung | Beschreibung |
|-------------|-------------|
| **`x-html` statt Template-Loops** | Übersichtstabelle (`_overviewBodyHtml`, `_overviewTfootHtml`) und Ranking-Tabelle (`_rankingBodyHtml`) werden als HTML-Strings vorgebaut und via `x-html` gerendert. Eliminiert tausende Alpine-Bindings und `x-for`-Loops. |
| **`deepFreeze()`** | Alle API-Responses werden mit `Object.freeze()` (rekursiv) eingefroren. Verhindert, dass Alpine.js Proxies um die Datenobjekte wickelt — spart erheblich Memory und Reaktivitäts-Overhead. |
| **Loader je Karte + `sectionError`** | Jede Karte hat einen eigenen Loader mit deklariertem Race-Guard (`_seq…`), Fehler-Flag und Retry — ein ausgefallener Endpoint betrifft nur seine Karte. |
| **ECharts nach Bauplan-Muster** | Alle 5 Renderer nutzen `acquireChart()` (Instanz-Reuse statt dispose/init), stabile Serien-`id`s, `chartAnimation(isUpdate)`, `setOption(…, { notMerge: true })` und `bindChartEvent()` — Filterwechsel blenden animiert über. |
| **CSS-Variable-Cache** | `getCssVars()` cached Chart-Farben aus CSS-Variablen. Ein `MutationObserver` auf `<html>` invalidiert den Cache bei Dark-Mode-Wechsel (`.dark`-Klasse). |
| **`_monthlyReversed`** | Vorberechnetes umgekehrtes Array für die Monatstrend-Tabelle — kein `.slice().reverse()` bei jedem Render. |
| **`x-if` statt `x-show` im Targets-Modal** | Tabs im Zielwerte-Modal nutzen `x-if` statt `x-show`. Nur der aktive Tab existiert im DOM (~350 DOM-Nodes eingespart). |
| **Ranking-Buttons via CustomEvent** | Buttons in `x-html`-gerendertem HTML können keine Alpine-Direktiven nutzen. Stattdessen: `onclick="window.dispatchEvent(new CustomEvent('show-staff-detail', {detail: staffId}))"` mit Listener in `init()`. |

Die früheren `content-visibility: auto`-Wrapper wurden mit dem Bauplan-Umbau
entfernt — sie hielten die Chart-Container beim Erstrender auf 0 px Breite
(ECharts-Breitenmessung), das Skeleton-System reserviert die Höhen jetzt ohnehin.

**Bugfix 07/2026 (Zeitzone):** Die Zeitraum-Berechnung der Behandlungs-Karte
(`treatmentsRange()`) formatierte lokale Daten mit `toISOString()` — in
Europe/Berlin kippte das Datum dadurch auf den Vortag, „Dieser Monat" enthielt
immer den letzten Tag des Vormonats. Jetzt lokale Formatierung.

### CSS (Globaler `backdrop-filter`-Bann)

**Problem:** Die CSS-Eigenschaft `backdrop-filter: blur()` erzeugt pro Element eine GPU-Compositing-Layer. Bei hunderten gleichzeitig sichtbaren Badges (`.badge-glattt`) und der Seiten-Wrapper-Klasse `.dashboard-surface` führte das zu massiven Render-Kosten und spürbarem Ruckeln.

**Lösung:** Alle 67 `backdrop-filter`-Deklarationen wurden global aus `theme_glattt.css` entfernt. Stattdessen werden halbtransparente Hintergründe über CSS-Variablen (`--card-glass-bg`, `--glass-bg`) verwendet — visuell kaum unterscheidbar, aber ohne GPU-Compositing-Overhead.

**Regel:** `backdrop-filter` darf in keiner CSS-Klasse verwendet werden. Diese Regel ist in den Coding-Instructions und im Design-System-Agent verankert.
