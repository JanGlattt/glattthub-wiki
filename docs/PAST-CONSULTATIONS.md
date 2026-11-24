# Vergangene Beratungsgespräche

Historische Analyse aller Beratungstermine aus der Phorest-Terminhistorie: Beratungsgespräche-Analyse
(monatliche Entwicklung, No-Shows, Ampel-Tabelle), Wochentag/Uhrzeit-Muster, No-show-Matrix
(„Analyse Gigi"), Vorlauf & Termin-Erfolg und Nachfass-Ergebnis. Der Buchungseingangs-Kalender ist
am 03.11.2026 auf [Zukünftige Beratungsgespräche](UPCOMING-CONSULTATIONS.md) umgezogen. Diese Seite beschreibt
**Kennzahl-Definitionen, Datenbasis, Endpunkte, Dateien und Fallstricke**; die Bedienung Schritt für
Schritt steht im Nutzerhandbuch.

**Zugang:** Hub → Berichte → Vergangene Beratungsgespräche ·
**URL:** `/hub/reports/past-consultations` ·
**Berechtigung:** `view_report_past_consultations`

!!! nutzerhandbuch "Bedienung: Berichte 3 – Vergangene Beratungsgespräche"
    [hilfe.hub.glattt.com/berichte/3/](https://hilfe.hub.glattt.com/berichte/3/) — Bericht öffnen,
    Beratungen im Verlauf, was daraus wurde, Datenlage und Export.

    Rahmen aller Berichtsseiten (Zeitraum und Standort, Kennzahlen-Zeile, Diagramm oder Tabelle,
    Export): [Berichte 0 – So funktionieren die Berichte](https://hilfe.hub.glattt.com/berichte/0/).
    Angrenzend: [Berichte 2 – Zukünftige Beratungsgespräche](https://hilfe.hub.glattt.com/berichte/2/),
    [Berichte 4 – Stornierte und gelöschte Termine](https://hilfe.hub.glattt.com/berichte/4/),
    [Berichte 6 – Terminstatistik](https://hilfe.hub.glattt.com/berichte/6/).

---

## Für Anwender — Überblick

**Was der Bericht beantwortet.** Wie viele Beratungsgespräche haben wirklich stattgefunden, wie viele
sind ausgefallen, wie entwickelt sich das je Institut und Monat, zu welchen Wochentagen und Uhrzeiten
läuft es gut, und — seit 08/2026 — wie hängt der **Buchungsvorlauf** mit Erscheinen und Abschluss
zusammen. Der Standort-Filter der Seitenleiste wirkt seit 07/2026 lückenlos auf alle Karten.

**Rückblick ganz oben (seit 15.11.2026).** Ein Kalender der letzten vier Wochen bis gestern zeigt je
Tag Beratungen, No-Show-Quote, die am Beratungstag verkauften KPZ (klein darunter widerrufen bzw.
Widerruf offen), Conversion Rate und KPZ pro BG — wahlweise alle Werte oder eine Kennzahl als Heatmap,
gesamt oder je Institut. Ein Klick auf einen Tag zeigt alle Beratungen des Tages mit Ergebnis, Vertrag,
Beraterin und Herkunft. Darunter der Verlauf von KPZ pro BG, Conversion und No-Show mit gleitendem
Durchschnitt. Die Ampel vergleicht mit dem Durchschnitt der letzten sechs Monate.

**Was mit den gebuchten Beratungen passiert ist (seit 24.11.2026).** Die Kennzahl **„Vorher weg“** zeigt
je Tag, welcher Anteil der *jemals für diesen Tag gebuchten* Beratungen vorher **storniert**, **verlegt**
oder **gelöscht** wurde — diese Termine standen am Tag nicht mehr im Kalender und fehlten bisher in jeder
Zahl der Karte (rund ein Fünftel aller Buchungen). Die Tagesliste führt sie mit Terminnotiz, neuem
Termin und **Auslöser** auf: Kundin selbst (Link, App, Schnellantwort), Institut (Hub oder Phorest) oder
Automatik (nicht bestätigt). Im Verlauf darunter gibt es dafür die Linien-Sätze „Verbleib“ und
„Auslöser“. No-Show, Conversion und KPZ pro BG rechnen unverändert auf den Beratungen am Tag.

**Was „nicht erschienen" heißt.** Als No-Show zählt ein vergangener Termin mit Status *NO_SHOW*,
*BOOKED*, *CONFIRMED* oder *CHECKED_IN* — also auch der nie final gepflegte Termin; stornierte und
gelöschte Termine zählen gar nicht. **Termine von heute, die noch anstehen, bleiben komplett außen
vor** — sonst stünde die No-Show-Quote jeden Morgen bei fast 100 %.

**Eine Karte rechnet bewusst strenger.** „Vorlauf & Termin-Erfolg" weist eine **Ausfallquote** aus:
No-Shows **plus** Stornierungen unter 24 Stunden vor Terminbeginn, weil ein Kurzfrist-Storno für das
Institut nicht mehr besetzbar ist. Diese Quote liegt deshalb systematisch über der No-Show-Quote der
übrigen Karten (~29 % gegenüber ~25 % über zwölf Monate) — kein Widerspruch, sondern zwei Fragen.
Alle Definitionen dieser Karte stehen unter
[Vorlauf & Termin-Erfolg — Definitionen](#vorlauf-termin-erfolg-definitionen).

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Bericht öffnen, Beratungen im Verlauf, was daraus wurde, Datenlage und Export | Berichte 3 |
| Zeitraum und Standort, Kennzahlen-Zeile, Diagramm/Tabelle, Export | Berichte 0 |
| Kommende Beratungen und freie Slots | Berichte 2 |
| Abgesagte und gelöschte Termine im Detail | Berichte 4 |
| Alle Terminarten, Dauer und Körperzonen | Berichte 6 |

---

## Für Entwickler

### Aufbau der Seite (Statistik-Bauplan, seit 07/2026)

Die Seite folgt dem verbindlichen Statistikseiten-Bauplan: Analyse-Karten sind
**zweiseitig** — Diagramm als Standard-Ansicht, die Tabelle dahinter über das
**Register am rechten Kartenrand** (mobil als Segmented Control). Beim Laden
zeigen die Karten **Skeletons in Endhöhe**, Filterwechsel dimmen die alte
Ansicht, bis die neue Antwort da ist. Fällt ein Endpoint aus, zeigt **nur diese
Karte** einen Fehlerhinweis mit „Erneut laden". Jede Karte hat ein Info-Panel (ℹ️).

**Wichtig seit 07/2026:** Der **Standort-Filter der Sidebar wirkt jetzt
lückenlos serverseitig** auf alle Karten der Seite. Vorher zeigten
Trend-Analyse, No Show-Analyse und No-show-Matrix bei gewähltem Standort
weiterhin konzernweite Zahlen — direkt neben korrekt gefilterten KPIs.

### Sektionen

| Karte | Standard-Ansicht | Tabellen-Lasche |
|---|---|---|
| **KPI-Zeile** | personalisierbare Kennzahlen (kpi-dashboard, Drag & Drop) | — |
| **Rückblick Beratungsgespräche** (seit 15.11.2026) | Kalender der letzten 4 Wochen bis gestern mit KW-Spalte; Werkzeugzeile **Kennzahl** (Alle / Beratungen / No-Show / KPZ / Conversion / KPZ pro BG / Vorher weg — seit 24.11.2026), **Standorte** (Gesamt / Vergleichen, nur bei „Alle Standorte“), **Kanal** (Alle / Online / Offline); Klick auf einen Tag → Tagesliste | — bewusst ohne Lasche: der Kalender ist die Tabelle; „Vergleichen“ hängt eine Vergleichstabelle der Institute an |
| **KPZ pro BG, Conversion & No-Show je Tag** (seit 15.11.2026) | **Kennzahlen** Ergebnis / Verbleib / Auslöser (seit 24.11.2026; Verbleib = erschienen, storniert, verlegt, gelöscht in % der jemals gebuchten, Auslöser = Kundin selbst, Institut, Automatik, unbekannt); **Ein Bild** (Ø-Linien, bei „Ergebnis“ zwei Achsen), **Drei/Vier Bilder** (untereinander), **Je Standort** (eine Kennzahl je Institut); Glättung Ø 7/14/28 Tage; Zeitleiste über 24 Monate (Start: letzte 3 Monate) | Tagestabelle, Monate aufklappbar, Quoten aus Summen |
| **Beratungsgespräche-Analyse** | Diagramm mit Metrik-Umschalter: **Beratungen** (Balken + No-Show-Quote als Linie) oder **No-Shows** (gestapelt Stattgefunden/Nicht stattgefunden + Quote); **Standorte** = gruppierte Balken je Institut (bei „No-Shows" gestapelt: Stattgefunden voll, No-Show-Anteil schraffiert), Quoten als Linien (rechte %-Achse); Zoom-Leiste | die Ampel-Tabelle Monat × Institut (Anzahl oder No-Show %) mit Wochen-Drilldown und Klick auf jede Zelle → Termine-Liste |
| **Wochentag & Uhrzeit** | Heatmap Wochentag × Stunde (Gesamt oder Mini-Heatmaps je Standort), Filter-Drawer (Status, Buchungstyp, Zeitraum) | dieselben Werte als Zahlen-Tabelle mit Summen |
| **No-show-Matrix** („Analyse Gigi") | Verlaufs-Diagramm der gewählten Kennzahl je Institut; seit 18.10.2026 Schalter **Alle / Online / Offline** (Parameter `art`, über `consultation_services.is_online` — online „Nur gratis Beratungsgespräch“, offline „..Beratungsgespräch“, nie über die Phorest-Quelle) | die bekannte Ampel-Matrix (Quote/Gebucht/Erschienen, Färbungs-Vergleichsmodus, „Frühere Zeiträume laden") |
| **Vorlauf & Termin-Erfolg** (seit 08/2026) | Kurven-Stack: drei Panels über derselben Vorlauf-Achse (Show-Rate + Abschlussquote, Ø KPZ, Buchungsvolumen); darüber drei Zonen-Karten (Kurzfristig 0–2 / Mittelfristig 3–9 / Langfristig 10+ Tage) mit Online/Offline-Vergleich; Kanal-Umschalter Alle/Online/Offline (clientseitig), Karten-Zeitraum (Standard: letzte 12 Monate) | Kennzahlen je Vorlauf-Gruppe für den gewählten Kanal, mit Gesamt-Zeile |
| **Nachfass-Ergebnis** (seit 18.10.2026, `termine.follow-up-result`) | je Institut die Stufen der Liste „Überlegt noch“ — auf der Liste, kontaktiert, Link, gebucht, Vertrag —, Umschalter nach Grund (Überlegt noch / Termin verpasst / Reaktivierung); Zeitraum = Tag, an dem die Kundin auf die Liste kam | Stufen, Vertragswert und Quote Vertrag je Institut mit Gesamt-Zeile |

**Zusammenlegung 07/2026:** Die früheren drei Karten „Monatliche
Beratungsgespräche", „Trend-Analyse" und „No Show-Analyse" basierten alle exakt
auf demselben Monats-Datensatz und sind jetzt EINE Karte. Sie teilt sich einen
**Buchungstyp-Umschalter** (Alle/Online/Offline — wirkt auf Diagramm und Tabelle
gemeinsam; die KPI-Zeile zeigt immer alle Buchungen) und eine Zoom-Leiste
(Standard: letzte 12 Monate); Auswahl und Zoom bleiben beim Neuzeichnen erhalten.
Die früheren Quartal/Jahr-Summen-Tabellen entfielen — Aggregate liefert der
CSV-Export (`consultation-noshow-monthly`).

### Datenbasis & Sync

Datenquelle ist die Tabelle `stats_historic_appointments` (aus Phorest
synchronisiert, Termine ab 01.01.2023). Der Sync-Status steht im Seitenkopf;
fehlende Tage lassen sich dort nachladen. Als „nicht erschienen" zählen
vergangene Termine mit Status *NO_SHOW, BOOKED, CONFIRMED, CHECKED_IN* — auch
nie final gepflegte Termine; stornierte/gelöschte Termine zählen nicht.

**Heutige, noch anstehende Termine bleiben komplett außen vor** (Scope
`StatsHistoricAppointment::settled()`): Seit dem 15-Minuten-Sync (08/2026)
enthält die Tabelle auch den laufenden Tag — Termine von heute mit Status
*BOOKED/CONFIRMED/CHECKED_IN* sind aber weder stattgefunden noch No-Show und
zählen deshalb weder im Zähler noch im Nenner der Quoten. Heutige Termine mit
*PAID/COMPLETED* oder explizitem *NO_SHOW* zählen normal. Ohne diese Regel
stünde die No-Show-Quote jeden Morgen bei fast 100 %, weil alle noch
anstehenden Tagestermine als „nicht erschienen" gewertet würden (Bug 08/2026).

### CSV-Export

Über den Export-Button im Seitenkopf (alle Quellen mit Standort-Filter):

| Quelle | Inhalt |
|--------|--------|
| `consultation-noshow-monthly` | No-show-Statistik pro Monat & Institut (deckt die Beratungsgespräche-Analyse und die Matrix auf Monatsebene, inkl. Quartal/Jahr-Aggregation per Tabellenkalkulation) |
| `consultation-weekday-time` | Termine/Erschienen/No-Shows/Quote je Wochentag & Stunde |
| `consultation-review-daily` | Rückblick je Tag & Institut: Beratungen, erschienen, No-Show (+ Quote), Abschlüsse am Tag, verkaufte KPZ, davon widerrufen (+ KPZ), Widerruf offen, Conversion, KPZ pro BG (seit 15.11.2026; ohne Zeitraum die letzten 3 Monate); seit 24.11.2026 zusätzlich jemals gebucht, vorher storniert / verlegt / gelöscht, „Vorher weg %“, „Erschienen von allen gebuchten %“ und der Auslöser (Kundin selbst, Institut, Automatik, unbekannt) |
| `consultation-lead-success` | Vorlauf & Termin-Erfolg: Buchungen, Show-Rate, Ausfallquote (inkl. Stornos < 24 h), Abschlussquote & Ø KPZ je Vorlauf-Gruppe und Kanal (Alle/Online/Offline) — exakt die Zahlen der Karte |
| `follow-up-result` | Nachfass-Ergebnis je Institut und Grund: auf der Liste, kontaktiert, Link, gebucht, Vertrag, Vertragswert (seit 18.10.2026) |

### Rückblick Beratungsgespräche — Definitionen und Technik (15.11.2026)

Entscheidungen Jan, 15.11.2026 (Entwürfe: https://claude.ai/artifact/JbsZnBbEuuU97ZL5Kk5tsh — gewählt „Web A + B
kombiniert“ mit Standortvergleich und „App 1 · Wie im Hub“ mit denselben Umschaltern):

- **Beratung** = aktiver, entschiedener Termin eines Beratungs-Services (`active()->settled()`), bis gestern.
  Doppelzeilen derselben Kundin am selben Tag zählen **einmal** (erschienen gewinnt) — sonst blähen
  Raum-Spalten die No-Shows auf. Dadurch kann die Zahl minimal unter der No-show-Matrix liegen, die nicht
  dedupliziert.
- **No-Show** = nur nicht erschienen, Zählweise der No-show-Matrix; Quote = No-Show ÷ Beratungen.
- **Abschluss** = Vertrag derselben Kundin, **am Beratungstag** unterschrieben, nur bei erschienener
  Beratung; zählt auch, wenn er später widerrufen wurde. **KPZ** = verkaufte KPZ (`sold_body_zones`,
  Fallback `body_zone_count`; bei stornierten Verträgen `body_zone_count`, weil die verkauften KPZ dort
  gekürzt sein können). **Widerrufen** = Reaktion „akzeptiert“ oder Vertrag storniert (wie die
  Widerruf-Statistik), **offen** = Reaktion „offen“.
- **Conversion** = Abschlüsse ÷ erschienene, **KPZ pro BG** = KPZ ÷ erschienene.
- **Kanal** über `consultation_services.is_online` (online gebucht / offline gebucht), wie die No-show-Matrix.
- **Ampel** am Ø der letzten 6 Monate (`reference`): ≥ 10 % besser grün, ± 10 % gelb, ≥ 10 % schwächer rot;
  Mengen (Beratungen, KPZ) je geöffnetem Tag. Unter jedem Wochentag der Ø dieses Wochentags.
- **Gleitender Ø** über 7/14/28 Kalendertage, Quoten aus den Fenstersummen; der Verlauf lädt dafür
  28 Tage Vorlauf mit (`lead_from`).
- **Zeitleiste** (seit 17.11.2026): Zoom-Regler unter dem Diagramm wie in den übrigen Statistiken,
  über 24 Monate (`history_from`, `TREND_HISTORY_MONTHS`), Startfenster die letzten 92 Tage. `from`/`to`
  bleiben dieses Startfenster — die App zeichnet weiterhin nur die 92 Tage. Der gewählte Ausschnitt
  überlebt Wechsel von Darstellung, Glättung und Kanal (`trendZoom`, Kategorie-Werte `TT.MM.JJJJ`).

Technik: `App\Services\ConsultationReviewService` (`calendar()`, `trend()`, `reference()`, `day()`,
`days()`), Cache-Gruppe `consultation-review` über `StatisticsCache` (Rezepte für den Worker),
`flushCache()` aus `ContractObserver` und `ContractCancellationObserver`. Endpunkte
`/phorest/reports/consultation-review/{calendar,trend,day}` (`refresh=1` rechnet sofort neu). Registry
`termine.consultation-review` (native H) und `termine.consultation-review-trend` (native D), JS in
`statistics/termine.js` (Ansichten je Person in `localStorage` `consultation-review-view`), neue
Theme-Klasse `.card-glattt-toolbar` (Werkzeugzeile, bricht nur zwischen ganzen Gruppen um) und
`.review-*`. App: `ConsultationReviewCards.swift`; „Ein Bild“ streckt KPZ pro BG auf die
Prozentskala und beschriftet die rechte Achse mit den echten Werten. Tests:
`ConsultationReviewTest`, Snapshots `testRenderConsultationReview`.

### Verbleib und Terminverlauf (24.11.2026)

Anlass (Jan, 24.11.2026): hohe Buchungseingänge, aber wenige Termine im Kalender — die Karte zählte nur,
was am Tag noch im Kalender stand. Prod-Zählung August bis November 2026: von 1.911 jemals gebuchten
Beratungen erschienen 55 %, 26 % No-Show, 17 % vorher storniert, 2 % gelöscht; 80 % der verschwundenen
Termine hatten in den 60 Tagen danach keinen neuen Beratungstermin. Stornos fallen zu 28 % in die letzten
24 Stunden, zu 37 % auf 24–72 Stunden; mit dem Vorlauf steigt der Storno-Anteil (0–2 Tage: 9 %, ab 15 Tage:
27 %), der No-Show-Anteil nicht.

**Definitionen (Entscheidungen Jan, 24.11.2026 — nicht still ändern):**

- **Jemals gebucht** = Beratungen am Tag + storniert + gelöscht + verlegt. Je Kundin und Tag eine Zeile;
  wer am Tag eine Beratung im Kalender hatte, zählt nicht zusätzlich als verschwunden (Storno und
  Ersatztermin am selben Tag).
- **Verlegt** = storniert oder gelöscht, **und** dieselbe Kundin hat innerhalb von 60 Tagen
  (`MOVED_WINDOW_DAYS`) einen anderen Beratungstermin — später, oder früher und *nach* dem verschwundenen
  angelegt (vorgezogen). Was aus dem neuen Termin wurde, zählt an dessen Tag. Dazu Termine, die das
  Institut **direkt in Phorest** auf einen anderen Tag geschoben hat (gleiche ID, nur der Terminverlauf
  kennt den alten Tag).
- **Storniert / gelöscht** = abgesagt bzw. gelöscht und nicht wiedergekommen (wie die Ads-Analyse).
- **Bezugsgröße:** No-Show, Conversion und KPZ pro BG bleiben auf den Beratungen am Tag — die bekannten
  Zahlen und die Ampel ändern sich nicht. Nur „Vorher weg“ und die Linien „Verbleib“/„Auslöser“ rechnen
  auf „jemals gebucht“.
- **Auslöser:** Kundin selbst / Institut / Automatik, aufgezeichnet seit
  `AppointmentLifecycleEvent::RECORDING_SINCE` (25.11.2026). Davor „unbekannt“. Ein Storno oder eine
  Löschung nach diesem Datum **ohne** Hub-Ereignis ist direkt in Phorest passiert und zählt als Institut —
  auch die telefonische Absage, die das Institut einträgt.

**Terminverlauf** (`appointment_lifecycle_events`): Ereignisse `moved`, `cancelled`, `short_notice`
(in die Absage-Spalte verschoben — der Termin bleibt aktiv und zählt weiter als No-Show) mit `actor`
(`client`/`staff`/`auto`), `via` (`link`/`hub`/`phorest`/`automation`), bisheriger und neuer Zeit.

- Einzige Schreibstelle ist `App\Services\Appointments\AppointmentLifecycleRecorder`. Die Hub-Wege
  melden über `BookingService` (`reschedule()`, `cancelOnly()`, `moveToCancellationColumn()`) — damit
  sind Buchungslink, Kunden-App, Terminbestätigung, „Termin absagen“ und die Verlege-Fenster abgedeckt,
  ohne dass ein Aufrufer etwas tun muss.
- Den Auslöser bestimmt `App\Support\AppointmentActor::current()`: angemeldetes Hub-Konto = Institut,
  Befehl/Worker = Automatik, unangemeldeter Aufruf = Kundin selbst. Ein Weg, auf den das nicht passt
  (z. B. ein Worker, der im Auftrag einer Kundin handelt), setzt ihn mit `AppointmentActor::as()`.
- Verschiebungen direkt in Phorest erkennen `sync:upcoming-appointments` und
  `sync:upcoming-consultations`: gleiche ID an einem anderen Tag → `recordPhorestMove()` (je Termin und
  Ausgangszeit ein Ereignis, auch wenn beide Abgleiche es sehen). Reine Uhrzeit-Wechsel am selben Tag
  werden nicht festgehalten.

**Fallstricke:**

- Phorest überschreibt beim Storno `source` mit `TERMINAL` — die Buchungsquelle eines stornierten Termins
  steht danach nur noch in `booking_trackings` bzw. am Beratungs-Service (`is_online`).
- `upcoming_consultations`/`upcoming_appointments` werden nach 7 Tagen geleert und taugen nicht als
  Historie; die Terminhistorie kennt nur den letzten Stand. Rückwirkend gibt es deshalb keine
  Verschiebungen in Phorest (Schätzung über das Beratungs-WhatsApp-Protokoll: rund 5 % der Erstbuchungen).
- Die Linie „Verlegt“ und der Satz „Auslöser“ haben am 25.11.2026 einen Bruch (Beginn der Aufzeichnung).
- Der Änderungsverlauf `stats_historic_appointment_changes` schrieb bis 24.11.2026 bei jedem Abgleich
  eine Zeile je Termin, weil `11:20:00` gegen `11:20:00.000` als Änderung galt (2,2 Mio. Zeilen in einem
  Monat). Der Abgleich speichert Uhrzeiten jetzt ohne Millisekunden, der Observer vergleicht Uhrzeit und
  Datum formatunabhängig. Die Alt-Zeilen (nur `start_time`/`end_time`) sind Rauschen.

Tests: `ConsultationReviewTest` (Verbleib, Auslöser, Phorest-Verschiebung), `AppointmentLifecycleTest`.

### Vorlauf & Termin-Erfolg — Definitionen

Die Karte beantwortet drei Fragen: Ab welchem Buchungsvorlauf steigt die
No-Show-Quote? Wo liegt der Sweet Spot? Unterscheiden sich Online- und
Offline-Buchungen?

- **Vorlauf** = Termindatum minus Buchungsdatum (Phorest `created_at_phorest`)
  in Tagen; negative Werte (Datenartefakte) sind ausgeschlossen. Gruppen:
  0, 1, 2, 3, 4, 5–6, 7–9, 10–13, 14–20, 21+ Tage.
- **Erschienen** = Status COMPLETED/PAID; No-Show wie überall auf der Seite
  (settled-Regel, heutige offene Termine bleiben außen vor).
- **Ausfallquote statt reiner No-show-Quote** (Entscheidung 31.08.2026, weil
  die reine No-show-Quote das Bauchgefühl unterschritt): No-Shows PLUS
  **Stornierungen unter 24 Stunden** vor Terminbeginn (Zähler und Nenner) —
  Kurzfrist-Stornos sind für das Institut nicht mehr besetzbar. Früher
  stornierte Termine fließen gar nicht ein; Storno-Zeitpunkt =
  `updated_at_phorest` (Muster des Storno-Reports), Storno-Erkennung über
  `activation_state = 'CANCELED'` (state bleibt beim Phorest-Sync BOOKED!).
  Damit liegt die Ausfallquote dieser Karte bewusst über der No-show-Quote
  der übrigen Karten (~29 % vs. ~25 % über 12 Monate). Prod-Befund 08/2026:
  Die Storno-Quote steigt massiv mit dem Vorlauf (0–2 Tage: 9 %, 3–9: 18 %,
  10+: 32,5 %) — von 100 Langfrist-Buchungen findet nur knapp die Hälfte statt.
- **Abschluss** = aktiver/abgeschlossener Vertrag derselben Kundin,
  unterschrieben 0–30 Tage nach dem Beratungstermin. Die manuell erfassten
  Gesprächsergebnisse (`consultation_records`) sind bewusst NICHT die Quelle —
  sie werden kaum gepflegt (Stand 08/2026: 19 Einträge). **Abschlussquote
  bezogen auf Erschienene**; Ø KPZ = `contracts.body_zone_count` der
  zugeordneten Verträge. Die Quote der letzten ~30 Tage kann noch steigen
  (Abschlussfenster offen).
- **Online/Offline** = tatsächlicher Buchungskanal: Online, wenn die
  Phorest-Quelle `THIRD_PARTY` ist ODER ein Buchungs-Tracking der
  Online-Strecke existiert; sonst Offline. (Bewusst anders als der
  Buchungstyp-Filter der übrigen Karten, der über den Service
  `consultation_services.is_online` geht — Prod-Abgleich 08/2026:
  Mitarbeiter-Buchungen (`INTERNAL`) haben 0 Trackings, die Kanal-Heuristik
  ist belastbar.)
- **Deduplizierung**: eine Buchung je Kundin und Tag (Raum-Doppelzeilen
  zählen nicht doppelt).


### Architektur

```
ReportController (app/Http/Controllers/) — Ausschnitt dieser Seite
├── pastConsultations()             → Blade-View
├── consultationMonthlyStatsFast()  → JSON: DER Monats-Datensatz der Analyse-Karte (KPIs, Chart, Ampel-Tabelle)
│                                     — gecacht (ReportsOverviewCache, Params: booking_type + branch_id)
├── consultationMonthlyStats()      → JSON: Monatsdaten (+ weeks/days) — von dieser Seite seit der
│                                     Zusammenlegung 07/2026 NICHT mehr genutzt (nur Berichte-KPI-Vorschau)
├── consultationWeeklyForMonth()    → JSON: Wochen-Drilldown eines Monats
├── consultationNoShowMatrix()      → JSON: Matrix (Granularität month/week/day, offset-Paging) — gecacht
├── weekdayTimeAnalysis()           → JSON: Heatmap Wochentag × Stunde
├── consultationAppointments()      → JSON: Termine-Liste (Zellen-Modal)
└── consultationLeadSuccess()       → JSON: Vorlauf & Termin-Erfolg (rechnet im ConsultationLeadSuccessService —
                                      gemeinsame Datenbasis mit der CSV-Quelle consultation-lead-success)
```

**Ein Datensatz für die ganze Analyse-Karte:** Vor der Zusammenlegung hielten
Monatstabelle, Trend- und No-Show-Chart **drei getrennte Buchungstyp-Zustände**
und luden denselben Monats-Datensatz bis zu **dreimal**. Jetzt gibt es einen
gemeinsamen `bookingTypeFilter` (`setBookingType()`), einen Load über
`/consultation-monthly/fast` und ein Chart (`renderAnalysisChart()`), das je
nach Metrik/Ansicht nur andere Serien aus demselben Datensatz zeichnet. Die
KPI-Zeile hängt bewusst am ungefilterten `monthlyStats` („Alle Buchungen").

**Alle Endpoints wenden `branch_id` an** (seit 07/2026 — vorher ignorierten
`consultation-monthly`, `…/fast`, `consultation-weekly` und `no-show-matrix`
den Filter komplett); bei den beiden gecachten Endpoints steckt `branch_id`
in den Cache-Params (sonst Cross-Branch-Cache-Poisoning). Die Instituts-
Reihenfolge kommt aus dem `SortsBranchIds`-Trait (`InstituteColor.sort_order`).

Die früheren Endpoints `consultation-weeks`/`consultation-days` (Chart.js-Ära)
waren tot (kein Aufrufer) und wurden mitsamt Routen entfernt.

### Relevante Dateien

| Datei | Zweck |
|-------|-------|
| `resources/views/hub/reports/past-consultations.blade.php` | Seiten-Skelett (aus Partials komponiert; vorher 98-KB-Monolith) |
| `resources/views/hub/reports/past-consultations/partials/*.blade.php` | Header/Sync, Beratungsgespräche-Analyse, Wochentag-Heatmap, Matrix, Kalender, 2 Modals |
| `public/js/past-consultation-stats.js` | Haupt-Alpine-App: Loader (sectionError je Karte), KPI-Berechnung, Buchungstyp (`setBookingType`), Sync/Modals |
| `public/js/past-consultation-stats-chart2.js` | ECharts-Renderer der Analyse-Karte (`renderAnalysisChart`, Metrik × Ansicht; acquireChart-Muster, stabile Serien-ids, animierte Übergänge) |
| `public/js/weekday-time-analysis.js` | Heatmap-Karte (eigene App, Register Heatmap ⇄ Tabelle) |
| `public/js/no-show-matrix.js` | Matrix-Karte (eigene App, neu mit Verlaufs-Diagramm + Branch-Filter) |
| `app/Services/ReportExportService.php` | CSV-Quellen `consultation-*` |
| `app/Services/ConsultationReviewService.php` | Rückblick: Tagessummen, Verbleib (`vanished()`), Tagesliste |
| `app/Services/Appointments/AppointmentLifecycleRecorder.php`, `app/Support/AppointmentActor.php`, `app/Models/AppointmentLifecycleEvent.php` | Terminverlauf: wer hat verlegt/storniert, Verschiebungen direkt in Phorest |
| `app/Services/ConsultationLeadSuccessService.php` | Rechenkern „Vorlauf & Termin-Erfolg" (Buckets, Zonen, Kanal-Heuristik, Vertrags-Matching) |
| `resources/views/statistics/termine/lead-success.blade.php` + `public/js/statistics/termine.js` (`termine.lead-success`) | Statistik-Karte nach Registry-Konvention (auch als Dashboard-Kachel) |
| `tests/Feature/PastConsultationsPageTest.php` | Seiten-Skelett, Branch-Filter (inkl. Cache), Export-Quellen |
| `tests/Feature/NoShowMatrixTest.php` | Matrix-Zähllogik |
| `tests/Feature/ConsultationLeadSuccessTest.php` | Vorlauf-Buckets, Kanal-Heuristik, 30-Tage-Fenster, Deduplizierung, Export-Parität |

**Drei Alpine-Apps** unter einer Seiten-Wurzel: `pastConsultationStatsApp`
(Root, gemergt mit `window.chart2Extensions`), `weekdayTimeAnalysis` und
`noShowMatrixCard` (verschachtelt). Race-Guards (`_seq…`) sind in allen Apps
**deklariert** — undeklarierte Properties leaken über die Alpine-Scope-Kette
zwischen verschachtelten Apps (bekanntes Muster, siehe CLAUDE.md).

### Behobene Bugs (07/2026)

- **Branch-Filter-Lücken** in 4 Endpoints + fehlende Cache-Params (s.o.); die
  Matrix hörte zusätzlich gar nicht auf `branchChanged`.
- **`formatDate()`/Custom-Zeitraum kippten via `toISOString()` auf den Vortag**
  (Europe/Berlin) — betraf u.a. die Chunk-Grenzen des Daten-Syncs (`fillGaps`).
- **Alle Karten-Loader scheiterten lautlos** (`console.error` ohne UI-Zustand);
  der globale Fehlerblock hing an einem nie gesetzten `error`-State.
- Termine-Modal nutzte noch das alte `kpi-mini-glattt-grid` → Stat-Strip.

### Caching

`consultation-monthly-fast` und `no-show-matrix` laufen über
`ReportsOverviewCache::remember(endpoint, params, TTL, …, recipe)` — `branch_id` ist
Teil der `params`. Seit 17.10.2026 Stale-while-revalidate über `StatisticsCache`:
`ReportsOverviewCache::flush()` markiert Einträge als veraltet, nachgerechnet wird im
Hintergrund (siehe [Performance & Caching](PERFORMANCE-CACHING.md)).

### Tests

```bash
php artisan test --filter=PastConsultationsPageTest
php artisan test --filter=NoShowMatrixTest
```

Beide Suiten laufen unter SQLite (die Matrix berechnet Perioden in PHP; die
Export-Quellen gruppieren in PHP statt mit MySQL-Datumsfunktionen). Die
Monats-Endpoints selbst nutzen `DATE_FORMAT`/`YEARWEEK` und sind nur gegen
MySQL testbar.
