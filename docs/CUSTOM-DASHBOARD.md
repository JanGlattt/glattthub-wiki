# Eigenes Dashboard (Custom Dashboard)

Das Eigene Dashboard stellt sich jede:r Nutzer:in selbst aus den **78
Statistiken des Hubs** zusammen — frei geordnet, in halber oder voller Breite.
Es sind exakt dieselben Auswertungen wie auf den Report-Seiten: eine Statistik
ist genau einmal definiert und wird an beiden Stellen identisch gerendert.

---

## Für Endanwender

### Was ist das Eigene Dashboard?

Statt einer festen Berichtsseite baust du dir deine eigene zusammen. Du wählst:

- **Welche Statistiken** angezeigt werden (aus 78 in acht Kategorien)
- **In welcher Reihenfolge** (per Drag & Drop)
- **In welcher Breite** (halb oder ganz)

Du kannst **beliebig viele Dashboards** anlegen und benennen — etwa eines für
den Tagesbetrieb und eines für den Monatsabschluss. Die Konfiguration bleibt
dauerhaft erhalten.

---

### Dashboard aufrufen

Im Hub-Menü unter **Berichte → Eigenes Dashboard** — oder direkt über
`/hub/reports/custom-dashboard`. Ohne eigenes Dashboard legt der Hub beim ersten
Aufruf eines an; über die Kopfzeile wechselst du zwischen deinen Dashboards,
legst neue an, benennst sie um oder löschst sie.

---

### Statistiken hinzufügen

1. Oben auf **„+ Statistik hinzufügen"** klicken
2. Das Auswahl-Fenster zeigt alle Statistiken, für die du berechtigt bist
3. Nach Kategorie filtern: Verkauf · Kunden · Pakete · Ads · Besucher · Personal · Termine · Widerrufe
4. Auf eine Statistik klicken — sie erscheint sofort im Dashboard
5. **„Speichern"** sichert die Anordnung

!!! tip "Tipp"
    Der Badge **„Nicht gespeichert"** erscheint, sobald du etwas geändert hast —
    so siehst du immer, ob noch zu speichern ist.

---

### Statistiken anordnen & skalieren

- **Verschieben**: Kachel an der Kopfzeile greifen und an die gewünschte Stelle ziehen
- **Breite ändern**: **↔** in der Kachel-Kopfzeile schaltet zwischen halber und voller Breite
- **Entfernen**: **✕** in der Kachel-Kopfzeile

---

### Globale Filter

Oben im Dashboard stehen zwei Filter:

| Filter | Optionen |
|--------|----------|
| **Zeitraum** | Gesamter Zeitraum · Dieser Monat · 3 Monate · 6 Monate · 1 Jahr · 2 Jahre |
| **Standort** | folgt der Standort-Auswahl der Sidebar |

Beide wirken serverseitig auf alle Kacheln, die sie unterstützen.

!!! note "Kacheln mit eigenem Zeitraum"
    Manche Auswertungen haben einen fest vorgegebenen Bezugszeitraum — etwa die
    Kalenderübersicht (immer ab heute) oder Karten, die bewusst die gesamte
    Historie zeigen und ihren Ausschnitt über den Zoom-Regler wählen. Diese
    Kacheln **folgen dem Dashboard-Zeitraum nicht**; ihr tatsächlicher Zeitraum
    steht sichtbar in der Kachel.

---

### Dashboard teilen

!!! warning "Aktuell nicht verfügbar"
    Das Teilen von Dashboards (Link-Freigabe, Freigabe an einzelne Nutzer,
    „Geteilt mit mir") ist mit dem Neubau 08/2026 **vorübergehend entfallen**
    und wird gesondert wieder angebunden. Die Spalte `share_token` bleibt dafür
    in der Tabelle erhalten.

---

### Verfügbare Statistiken

Jede Statistik des Hubs ist genau einmal definiert und steht damit auf ihrer
Report-Seite **und** als Dashboard-Kachel bereit — beide rendern dieselbe
Definition. Aktuell sind es **78 Statistiken** in acht Kategorien.

Die Spalte **Zeitraum** sagt, ob eine Kachel dem Zeitraum-Filter des Dashboards
folgt oder einen festen eigenen Zeitraum zeigt (dann steht der Hinweis auch in
der Kachel selbst).

#### Verkauf (16)

| Statistik | Beschreibung | Breite | Zeitraum |
|---|---|---|---|
| **Ranking nach Institut** | Institute sortiert nach Umsatz: Verträge, Ø Wert, Ø KPZ, Hochrechnung und Veränderung | Voll | folgt dem Rahmen |
| **Körperzonen pro Institut** | Verkaufte Körperzonen (KPZ) pro Institut und Monat mit Prognose, Widerrufen und Verkäufer-Drill-Down | Voll | Gesamte Historie — Ausschnitt über den Zoom-Regler |
| **Bestandskunden & Flex** | Folgeverträge an Bestandskunden und Flex-Behandlungen im laufenden Monat, fairer Vormonats-Vergleich | Halb | Laufender Monat — Vergleich zum gleichen Zeitpunkt des Vormonats |
| **Sales Mix — Paket-Umfang** | Verteilung der Abschlüsse nach Paket-Umfang (1–5 KPZ / Ganzkörper) je Monat, als Stückzahl oder Umsatz | Voll | Gesamte Historie — Ausschnitt über den Zoom-Regler |
| **Neukunden pro Monat** | Anzahl neuer Kunden je Monat und Institut — Neukunde ab dem ersten Beratungsgespräch | Voll | Gesamte Historie — Ausschnitt über den Zoom-Regler |
| **Körperzonen pro Tag** | Täglich verkaufte Körperzonen je Standort mit Ø-Linien, Widerrufen und Beratungsgesprächen | Voll | folgt dem Rahmen |
| **Standort-Vergleich seit Eröffnung** | Verkaufsentwicklung der Institute ab Tag 0 — Anlaufkurven direkt vergleichbar | Voll | Gesamte Historie ab Tag 0 je Standort — zeigt immer alle Standorte |
| **Vertragslaufzeiten** | Verteilung der Vertragslaufzeiten: festgesetzte Raten, reale Raten oder Kalendermonate | Voll | folgt dem Rahmen |
| **Zahlungsausfälle nach Ratenfortschritt** | Ausfallquote der SEPA-Raten nach Laufzeit-Vierteln oder Ratenmonat, mit Vergleichsserie | Voll | folgt dem Rahmen |
| **Lastschriften-Bestand & Einzugsvolumen** | Monatliches Einzugsvolumen (Soll und Ist) mit aktiven Mandaten und 24-Monats-Prognose | Voll | Gesamte Historie — Ausschnitt über den Zoom-Regler |
| **Rücklastschriften pro Monat** | Rücklastschriftquote je Fälligkeitsmonat nach Anzahl und Wert | Voll | Gesamte Historie — Ausschnitt über den Zoom-Regler |
| **Direktzahler-Segment** | Direkt bezahlte Abschlüsse je Monat: Kunden, Körperzonen, Umsatz und Anteil an allen Abschlüssen | Voll | folgt dem Rahmen |
| **Monatliche Übersicht** | Verkaufszahlen pro Monat mit Δ-Werten und Hochrechnung bis Monatsende | Voll | folgt dem Rahmen |
| **Ranking nach Mitarbeiter** | Verkäufer:innen sortiert nach Umsatz: Verträge, Ø Wert, Ø KPZ, Hochrechnung und Veränderung | Voll | folgt dem Rahmen |
| **glattt-KPIs: Zeitraum-Übersicht** | BGs, Abschlüsse und Abschluss pro BG über feste Auswertungszeiträume, brutto/netto umschaltbar | Halb | Feste Zeiträume: Letzte 7 Tage · Dieser Monat · Letzte 3 Monate · Dieses Jahr (+ Vorjahr) |
| **glattt-KPIs: Institut-Vergleich** | BGs, Abschlüsse, Abschluss pro BG und Bestandsgrößen je Institut, Zeitraum wählbar | Voll | Zeitraum über das Dropdown der Karte (Standard: dieser Monat) — zeigt immer alle Institute |

#### Kunden (10)

| Statistik | Beschreibung | Breite | Zeitraum |
|---|---|---|---|
| **Altersverteilung** | Kunden nach Altersgruppen — gesamt und mit Vertrag, inkl. Anteil je Gruppe | Halb | folgt dem Rahmen |
| **Geschlechterverteilung** | Kunden nach Geschlecht als Donut — mit Vertragsanteil je Gruppe | Halb | folgt dem Rahmen |
| **Herkunftsverteilung** | Ethnische/kulturelle Herkunft der Kunden anhand der Namen — mit Conversion und Widerrufsquote je Gruppe | Halb | folgt dem Rahmen |
| **Conversion Funnel** | Der Weg vom Kunden zum Vertrag: Kunden, Beratungen, Verträge und aktive Verträge mit Absprungraten | Halb | folgt dem Rahmen |
| **Entfernungsverteilung** | Wie weit Kunden vom Institut entfernt wohnen — Entfernungsbänder mit Conversion je Band | Halb | folgt dem Rahmen |
| **Körperzonen-Verteilung** | Gebuchte Körperzonen der Vertragskunden — gesamt oder aufgeschlüsselt nach Altersgruppe und Entfernung | Halb | folgt dem Rahmen |
| **Widerrufs-Analyse Kunden** | Widerrufsquote der Vertragskunden nach Geschlecht, Altersgruppe und Entfernung | Halb | folgt dem Rahmen |
| **Persona-Segmente** | Kundentypen aus Geschlecht × Altersgruppe mit Conversion, Ø Alter und Ø Entfernung | Voll | folgt dem Rahmen |
| **Top Postleitzahlen** | Die zehn wichtigsten Einzugsgebiete nach Kundenzahl — mit Verträgen, Conversion und Ø Entfernung | Halb | folgt dem Rahmen |
| **Einzugsgebiet (PLZ-Karte)** | Geographische Kundenverteilung nach PLZ als Choropleth-Karte — Anzahl oder Conversion je Gebiet | Voll | folgt dem Rahmen |

#### Pakete (1)

| Statistik | Beschreibung | Breite | Zeitraum |
|---|---|---|---|
| **glattt-Pakete pro Monat** | Verkaufte Pakete je Monat mit Einheiten und Körperzonen | Voll | folgt dem Rahmen |

#### Ads (9)

| Statistik | Beschreibung | Breite | Zeitraum |
|---|---|---|---|
| **Kampagnen-Übersicht** | Alle Werbekampagnen mit Buchungen, Verträgen, KPZ und Plattform-Kennzahlen — inkl. Kampagnen-Notizen | Voll | folgt dem Rahmen |
| **Coupon-Code-Auswertung** | Buchungen und Verträge je Aktions-Code — Erfolg von Flyern, Influencer-Codes und Messen | Halb | folgt dem Rahmen |
| **Monatliche Ads-Entwicklung** | Ads-Buchungen und Verträge pro Monat mit Meta- und Google-Ausgaben als €-Linien | Voll | folgt dem Rahmen |
| **Kostenverlauf & Kosten pro Lead** | Werbeausgaben pro Monat (Meta + Google gestapelt) und Kosten je Ads-Buchung | Voll | folgt dem Rahmen |
| **Buchungen pro Quelle & Monat** | Gestapelte Monats-Buchungen je Herkunftsquelle — Anzeige vs. organisch umschaltbar | Voll | folgt dem Rahmen |
| **Buchungen pro Tag** | Tägliche Online-Buchungen mit gleitendem 7-Tage-Durchschnitt und Zoom-Regler | Voll | folgt dem Rahmen |
| **Herkunfts-Analyse** | Letzte Seite vor der Buchung im Vergleich zur echten Herkunft (Einstieg) je Quelle | Voll | folgt dem Rahmen |
| **Suchbegriffe** | Wortwolke der Suchbegriffe (utm_term) aus bezahlten Suchkampagnen mit exakter Tabelle | Halb | folgt dem Rahmen |
| **Ads vs. Organisch** | Vergleich bezahlter und organischer Kunden: Conversion, No-Show-Quote, KPZ und Vertragswert | Halb | folgt dem Rahmen |

#### Besucher (7)

| Statistik | Beschreibung | Breite | Zeitraum |
|---|---|---|---|
| **Was die Daten zeigen** | Automatisch abgeleitete Erkenntnisse aus den Funnel-Daten: Abbruchpunkte, Geräte-Lücke, Quellen, Trend | Halb | folgt dem Rahmen |
| **Buchungs-Funnel** | Fluss-Trichter der Buchungsstrecke mit Abbruch-Karten und optionaler Hochrechnung auf echte Buchungen | Voll | folgt dem Rahmen |
| **Besucher-Verlauf** | Besuche und Funnel-Schritte pro Tag, mit Glättung und %-Ansicht — Zeitraum je Karte wählbar | Voll | folgt dem Rahmen |
| **Funnel-Vergleich** | Funnel-Stufen und Verläufe je Standort oder Quelle, absolut oder auf 100 % normalisiert | Voll | folgt dem Rahmen |
| **Herkunft der Besucher** | Besuche, Funnel-Starts und Abschlüsse je Quelle plus echte Server-Buchungen | Halb | folgt dem Rahmen |
| **Geräte-Vergleich** | Start- und Abschlussquote der Buchungsstrecke je Geräteklasse | Halb | folgt dem Rahmen |
| **Top-Unterseiten** | Die 15 meistaufgerufenen Unterseiten von glattt.com mit Ø Verweildauer | Voll | folgt dem Rahmen |

#### Personal (13)

| Statistik | Beschreibung | Breite | Zeitraum |
|---|---|---|---|
| **Kapazität: Soll gegen Ist** | Vertragsstunden gegen tatsächlich geleistete Stunden je Monat, mit Stundensaldo | Voll | folgt dem Rahmen |
| **Produktivität je Stunde** | Umsatz, Körperzonen und Behandlungen je gearbeiteter Stunde im Monatsverlauf | Voll | folgt dem Rahmen |
| **Personalkosten und Kostenquote** | Monatsbrutto, Arbeitgeber-Gesamtkosten und Personalkostenquote (vertraulich) | Voll | folgt dem Rahmen |
| **Abwesenheiten und Krankenquote** | Kranktage nach Kurz- und Langzeit sowie alle Abwesenheitsgründe je Monat | Voll | folgt dem Rahmen |
| **Eintritte, Austritte und Fluktuation** | Personalbewegungen und Fluktuationsquote im Monatsverlauf | Voll | folgt dem Rahmen |
| **Befristungs- und Probezeit-Radar** | Auslaufende Befristungen und endende Probezeiten der nächsten 90 Tage | Halb | Kommende 90 Tage ab heute |
| **Personalstruktur** | Belegschaft nach Betriebszugehörigkeit, Beschäftigungsgrad, Alter und Geschlecht | Halb | folgt dem Rahmen |
| **Institutsvergleich Personal** | Personalkennzahlen je Standort: KPZ und Umsatz je Stunde, Krankenquote, VZÄ | Voll | folgt dem Rahmen |
| **Mitarbeiter im Detail** | Sortierbare Detailtabelle je Mitarbeiter: Stunden, Abwesenheit und Leistung | Voll | folgt dem Rahmen |
| **Datenqualität Personal** | Offene Pflegepunkte: Terminspalten ohne Zuordnung, fehlende Stammdaten | Halb | folgt dem Rahmen |
| **Tagesmessung** | Ampel-Matrix je Mitarbeiter: Beratungsgespräche, Conversion-Rate und Ø Körperzonen pro Tag, Woche und Monat | Voll | folgt dem Rahmen |
| **Beratungs-Ranking** | Conversion-Rate und Ø Körperzonen je Verkäufer im Zeitverlauf, dazu die Bestenliste des Zeitraums | Voll | folgt dem Rahmen |
| **Behandlungs-Ranking** | Behandlungszeit und Auslastung je Mitarbeiter — als Zeitverlauf, Team-Stapel und Tabelle | Voll | folgt dem Rahmen |

#### Termine (18)

| Statistik | Beschreibung | Breite | Zeitraum |
|---|---|---|---|
| **Termine: Monatliche Übersicht** | Termine pro Monat nach Termin-Art (Beratung, Behandlung, kombiniert) mit Status-Filter und Wochen-Drilldown | Voll | folgt dem Rahmen |
| **Termindauer pro Monat** | Gebuchte Termindauer je Monat nach Termin-Art — Total in Stunden oder Ø pro Termin in Minuten | Voll | folgt dem Rahmen |
| **Behandelte Körperzonen pro Monat** | Summe und Ø der behandelten Körperzonen je Behandlungstermin pro Monat mit Wochen-Drilldown | Voll | folgt dem Rahmen |
| **Top Services pro Monat** | Die meistgebuchten Services — globale Top 10 und Monats-Rankings mit Typ-, Mindest- und Namensfilter | Voll | folgt dem Rahmen |
| **Service-Kombinationen pro Monat** | Häufigste Service-Kombinationen innerhalb eines Termins — Top-Ranking je Monat mit Filtern | Voll | folgt dem Rahmen |
| **Aktueller Buchungsstand** | Gebuchte Beratungstermine für heute, die nächsten 7/14/28 Tage und bis Monatsende — je Institut | Voll | Kommende 28 Tage ab heute |
| **Entwicklung geplanter Beratungsgespräche** | Wie viele BGs an jedem Stichtag für die nächsten 1/3/7/28 Tage geplant waren — mit gleitendem Durchschnitt | Voll | Gesamte Historie seit Juni 2023 — Ausschnitt über den Zoom-Regler |
| **Historischer Buchungsvergleich** | Buchungsstand eines früheren Stichtags gegen heute — je Zeitfenster und Institut | Voll | Stichtag über die Karte wählbar (Standard: vor einem Monat) gegen heute |
| **Freie Slots Analyse** | Unbesetzte Beratungsslots je Wochentag und Uhrzeit — als Heatmap, Diagramm und Tabelle | Voll | folgt dem Rahmen |
| **Buchungsvorlauf-Analyse** | Wie viele Tage vor dem Termin Beratungsgespräche gebucht werden — Verteilung, Trend und Institutsvergleich | Voll | Zeitraum über die Karte (Standard: letzte 6 Monate) |
| **Kalenderübersicht Beratungen** | Gebuchte Beratungsgespräche, freie Slots und Auslastung je Tag — als Kalender, wahlweise je Institut | Voll | Kommende 28 Tage ab heute — in der Karte um je 2 Wochen erweiterbar |
| **Buchungsstand-Verlauf** | Wie viele Beratungen je Monat für die nächsten 7/14/28 Tage gebucht waren — aufklappbar bis auf den Tag | Voll | Gesamte Historie — Monate über die Tabelle in Wochen und Tage aufklappbar |
| **Buchungseingänge** | An welchem Kalendertag Beratungsgespräche gebucht wurden (Buchungszeitpunkt, nicht Termindatum) | Voll | Rollendes 4-Wochen-Fenster bis heute — in der Karte erweiterbar |
| **Beratungsgespräche-Analyse** | Beratungsgespräche und No-Shows pro Monat mit Ampel-Tabelle und Wochen-Drilldown | Voll | Gesamte synchronisierte Termin-Historie pro Monat |
| **Wochentag & Uhrzeit** | Beratungsgespräche je Wochentag und Uhrzeit als Heatmap — gesamt, erschienen, No-Shows oder Quote | Voll | Zeitraum über die Karte (Standard: letzte 6 Monate) |
| **No-show-Matrix** | Buchungen, Erschienen und No-show-Quote je Institut und Periode — Monat, Woche oder Tag | Voll | Letzte 12 Monate / 12 Wochen / 14 Tage — blätterbar über die Karte |
| **Stornierte Termine pro Monat** | Stornierte Termine je Monat mit Ersatztermin-Erkennung und Storno-Quote | Voll | Gesamte synchronisierte Termin-Historie pro Monat |
| **Gelöschte Termine pro Monat** | Aus dem Kalender gelöschte Termine je Monat mit Lösch-Quote | Voll | Gesamte synchronisierte Termin-Historie pro Monat |

#### Widerrufe (4)

| Statistik | Beschreibung | Breite | Zeitraum |
|---|---|---|---|
| **Widerrufe: Entwicklung über Zeit** | Echte Widerrufe, weitere Eingänge und Widerrufsquote pro Monat — umschaltbar auf Körperzonen | Voll | folgt dem Rahmen |
| **Struktur der Widerrufe** | Widerrufe nach Grund, Ergebnis und Erste-Sitzung-Effekt — drei Aufschlüsselungen derselben Fälle | Halb | folgt dem Rahmen |
| **Zeitraum bis Widerruf** | Tage zwischen Vertragsabschluss und Widerruf als Histogramm, mit Ø und Median | Halb | folgt dem Rahmen |
| **Widerrufsquote im Vergleich** | Widerrufsquote nach Standort, Verkäufer:in, Vertragswert-Klasse und Paket-Umfang | Voll | folgt dem Rahmen |

---

### Berechtigungen

Welche Statistiken sichtbar sind, hängt an den Rechten des Nutzers: Die
Permission steht in der Definition der Statistik, und ohne sie erscheint sie
weder im Auswahl-Fenster noch als Kachel. Es gibt keine Dashboard-eigenen
Rechte — wer eine Auswertung auf ihrer Report-Seite sehen darf, darf sie auch
als Kachel sehen, und sonst niemand.

---

## Für Entwickler

### Karten-Register (Diagramm/Tabelle) in Kacheln

Statistiken bringen ihr Register (`<x-chart-view-toggle>`/`<x-chart-table>`)
selbst mit; im Dashboard gilt dasselbe wie auf der Report-Seite:

- Ladereihenfolge: echarts (CDN) → `echarts-glattt.js` → `chart-table.js` →
  `glattt-stats.js` → Bereichs-Bundles. Die Bundles zieht die Dashboard-View
  dynamisch aus der Registry, es ist also nichts je Kachel zu pflegen.
- Den Platz für die Laschen reserviert das Theme automatisch, sobald eine
  Kachel ein Register trägt.
- Das Register muss **direktes Kind** der Karte sein — sonst bezieht es sich
  auf einen zwischenliegenden `position: relative`-Vorfahren und rutscht in
  die Karte hinein.

### Architektur-Überblick

Seit dem Neubau (08/2026) gibt es **keine eigene Widget-Schicht mehr**: Das
Dashboard rendert dieselben Statistik-Partials wie die Report-Seiten.

```
CustomDashboard (Model + DB)          ← beliebig viele benannte Dashboards je Nutzer
    │
    ├── StatisticRegistry (Service)   ← die EINE Bibliothek aller Statistiken
    │       └── forUser($user)        ← filtert nach Permission
    │
    ├── CustomDashboardController     ← HTTP-Schicht (index, show, store, saveLayout, …)
    │
    └── Blade + Alpine.js
            ├── custom-dashboard/index.blade.php        (Haupt-View, x-data)
            ├── custom-dashboard/partials/tile          (Kachel-Rahmen)
            ├── custom-dashboard/partials/statistic-selector-modal
            ├── custom-dashboard/partials/dashboard-name-modal
            ├── custom-dashboard/partials/dashboard-delete-modal
            └── <x-statistic statistic="…" />           (dieselbe Definition wie auf der Report-Seite)
```

Die Konvention für Statistiken (Registry-Eintrag + Partial + JS-Komponente)
steht vollständig in `.github/instructions/statistic-components.instructions.md`.

---

### Datenbank-Schema

```sql
CREATE TABLE custom_dashboards (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED NOT NULL,      -- 1:n — beliebig viele Dashboards je Nutzer
    name        VARCHAR(100) NOT NULL,
    sort_order  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    widgets     JSON NULL,                     -- geordnete Statistik-Liste
    share_token VARCHAR(64) NULL UNIQUE,       -- Link-Freigabe (wird in AP4 wieder angebunden)
    created_at  TIMESTAMP NULL,
    updated_at  TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX (user_id, sort_order)
);
```

**`widgets`-Spalte Format** — Registry-Key plus Breite:

```json
[
  { "key": "sales.branch-ranking",  "width": "full" },
  { "key": "personal.treatments",   "width": "half" },
  { "key": "termine.booking-calendar", "width": "half" }
]
```

Beim Speichern verwirft der Controller Kacheln, für die dem Nutzer die
Permission fehlt — ein Layout kann also nie Daten freilegen.

---

### StatisticRegistry

Der zentrale Service unter `app/Services/Statistics/StatisticRegistry.php`
ist die einzige Quelle je Statistik.

**Methoden:**

```php
StatisticRegistry::all(): array              // alle Definitionen, validiert
StatisticRegistry::forUser(User $user): array // nur erlaubte (Permission-Filter)
StatisticRegistry::find(string $key): ?array  // eine Definition
StatisticRegistry::endpointUrl($definition): string
StatisticRegistry::extraEndpointUrls($definition): array
```

**Definition (Beispiel):**

```php
[
    "key"           => "personal.daily-measurement",
    "label"         => "Tagesmessung",
    "description"   => "Ampel-Matrix je Mitarbeiter: Beratungsgespräche, …",
    "category"      => "personal",              // siehe CATEGORIES
    "icon"          => "table-cells",           // Heroicon-Name
    "permission"    => "view_report_sales_statistics",  // PFLICHT
    "route"         => "hub.reports.staff-performance.overview",
    "extra_routes"  => ["history" => "hub.reports.staff-performance.overview"],
    "filters"       => ["range", "branch"],     // globale Filter des Rahmens
    "extra_filters" => [],                      // seitenweite Zusatzfilter
    "fixed_range"   => null,                    // Pflicht ohne "range"
    "view"          => "statistics.personal.daily-measurement",
    "js"            => "personal.daily-measurement",
    "script"        => "js/statistics/personal.js",
    "default_width" => "full",
]
```

**Ohne `permission` wirft `all()`** — eine Statistik ohne Berechtigung wird
grundsätzlich nicht ausgeliefert (`StatisticRegistryTest` prüft das, ebenso
die Existenz von Route, View und Script-Bundle).

#### Neue Statistik hinzufügen

1. Eintrag in `StatisticRegistry::definitions()` ergänzen
2. Selbstständiges Partial unter `resources/views/statistics/<bereich>/<statistik>.blade.php`
3. JS-Komponente via `GlatttStats.register("<key>", factory)` in `public/js/statistics/<bereich>.js`
4. Auf der Report-Seite mit `<x-statistic statistic="<key>" />` einbinden

Danach ist die Statistik ohne weiteren Code im Dashboard wählbar. CSV-Export-
Quelle (`ReportExportService::SOURCES`) und Such-Registry
(`GlobalSearchService::PAGES`) mitpflegen.

---

### Model: CustomDashboard

`app/Models/CustomDashboard.php`

```php
$dashboard->user     // BelongsTo User
$user->customDashboards  // HasMany, nach sort_order
```

**Casts:** `widgets` → `array`

---

### Frontend-Architektur (Alpine.js)

Die Haupt-View `resources/views/hub/reports/custom-dashboard/index.blade.php`
initialisiert `customDashboard()` aus `public/js/custom-dashboard.js` und lädt
die Script-Bundles aller Statistiken dynamisch aus der Registry.

**Filter-Propagation — bewusst OHNE Events:** Der Rahmen stellt ein
`statFilters`-Objekt bereit, `<x-statistic>` reicht es per `x-effect` an die
Komponente durch. Dadurch gilt der Filterzustand auch für nachgeladene Kacheln,
und es entstehen keine Listener-Leaks:

```js
get statFilters() {
    return {
        date_from: this.filters.date_from || null,
        date_to:   this.filters.date_to || null,
        branch_id: this.filters.branch_id || "",
    };
}
```

Statistiken, die den Zeitraum nicht unterstützen, deklarieren `fixed_range` —
der Text steht dann sichtbar in der Kachel, damit niemand den Dashboard-Zeitraum
auf sie bezieht.

---

### Drag & Drop

Das Sortieren läuft über [SortableJS](https://sortablejs.github.io/Sortable/),
initialisiert aus `init()` der Alpine-App:

```js
Sortable.create(this._grid(), {
    handle: ".dashboard-widget-drag-handle",
    animation: 150,
    onEnd: () => { this.hasUnsavedChanges = true; },
});
```

---

### Layout speichern

`saveLayout()` liest die aktuelle DOM-Reihenfolge und schickt sie an das
Dashboard (`POST /hub/reports/custom-dashboard/{dashboard}/layout`):

```js
const widgets = [...this._grid().querySelectorAll(":scope > [data-widget-key]")].map(el => ({
    key:   el.dataset.widgetKey,
    width: el.dataset.widgetWidth === "half" ? "half" : "full",
}));
```

!!! warning "Wichtig"
    `:scope >` ist notwendig — Kachel-interne Knöpfe (Breite umschalten,
    entfernen) tragen dasselbe `data-widget-key`.

---

### Berechtigungen

Jede Statistik trägt ihre Permission in der Registry; sichtbar ist nur, was der
Nutzer ohnehin auf der Report-Seite sehen dürfte. Die wichtigsten:

| Permission | Deckt ab |
|------------|----------|
| `view_report_sales_statistics` | Verkauf, Mitarbeiterperformance |
| `view_report_client_statistics` | Der glattt-Kunde |
| `view_report_hr_kpis` | HR-Kennzahlen |
| `view_report_glattt_kpis` | glattt-KPIs |
| `view_report_ads_analysis` | Ads-Analyse |
| `view_report_visitor_funnel` | Besucher-Funnel |
| `view_report_revocation_statistics` | Widerrufe |
| `view_report_appointments_body_zones` | Terminstatistik |
| `view_report_upcoming_consultations` | Zukünftige Beratungsgespräche |
| `view_report_past_consultations` | Vergangene Beratungsgespräche |
| `view_report_cancelled_appointments` | Stornierte & verschobene Termine |
| `view_report_client_courses` | glattt-Pakete |

---

### Sicherheitshinweise

- Beim Speichern prüft der Controller jede Kachel gegen
  `StatisticRegistry::forUser($user)` — unbekannte oder nicht erlaubte Keys
  werden still verworfen
- `<x-statistic>` rendert nichts, wenn die Permission fehlt — die Kachel kann
  also auch über einen manipulierten Layout-Datensatz keine Daten freilegen
- Die Endpoints selbst liegen zusätzlich hinter `can:`-Gates; das Recht wird
  nicht allein im Frontend geprüft

---

### Relevante Dateien

| Datei | Zweck |
|-------|-------|
| `app/Services/Statistics/StatisticRegistry.php` | Bibliothek aller Statistiken (eine Definition je Statistik) |
| `app/Models/CustomDashboard.php` | Eloquent-Model (1:n je Nutzer) |
| `app/Http/Controllers/CustomDashboardController.php` | HTTP-Controller |
| `resources/views/components/statistic.blade.php` | Rahmen `<x-statistic>` — rendert Report-Karte wie Dashboard-Kachel |
| `resources/views/hub/reports/custom-dashboard/index.blade.php` | Haupt-View + Alpine-Initialisierung |
| `resources/views/hub/reports/custom-dashboard/partials/*.blade.php` | Kachel, Statistik-Auswahl, Namens- und Lösch-Modal |
| `resources/views/statistics/<bereich>/*.blade.php` | Die Statistik-Partials selbst |
| `public/js/statistics/glattt-stats.js` | Laufzeit der Statistik-Komponenten (Laden, Filter, Charts, Formatierung) |
| `public/js/statistics/<bereich>.js` | Die Komponenten je Bereich (`GlatttStats.register`) |
| `public/js/custom-dashboard.js` | Alpine-App des Dashboards |
| `database/migrations/2026_08_03_210000_restructure_custom_dashboards_for_multiple_dashboards.php` | DB-Migration (Neubau) |
| `tests/Unit/StatisticRegistryTest.php` | Konsistenz der Registry (Permission, Route, View, Bundle) |
| `routes/web.php` | Route-Definitionen (`hub.reports.custom-dashboard.*`) |

*Entwickler-Konvention für neue Statistiken: `.github/instructions/statistic-components.instructions.md`.
Bestandsaufnahme und Portierungs-Historie: `STATISTIK-INVENTAR.md`.*
