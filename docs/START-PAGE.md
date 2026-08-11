# 🏠 Startseite (Start Page)

**Version:** 2.0
**Letzte Aktualisierung:** August 2026

Die Startseite ist der erste Bildschirm nach dem Login: oben Begrüßung und
Tagesüberblick, darunter frei zusammenstellbare Kacheln.

Seit **08/2026** wird sie **serverseitig gerendert**: Das vollständige
Kachelraster steht schon im ersten HTML, jede Kachel holt ihre Daten danach
einzeln nach. Vorher baute der Browser das Raster erst, nachdem die
Konfiguration per fetch eingetroffen war — bis dahin lag ein Ganzseiten-Spinner
über der Seite, und ein Reload war oft nötig.

---

## Für Endanwender

### Was zeigt die Startseite?

| Bereich | Inhalt |
|---|---|
| **Begrüßung** | Tageszeit-abhängiger Gruß, Datum, aktuelles Institut |
| **Heute** (Tagesüberblick) | Beratungsgespräche heute (stattgefunden / laufend / offen / No-Show), verkaufte KPZ heute, Prognose KPZ bis Monatsende |
| **Kacheln** | News, Quicklinks, Mitteilungen, Kennzahlen und beliebig viele **Statistiken** |

Der Tagesüberblick ist fest und lässt sich nicht entfernen — er ist das, was
nach dem Login sofort arbeitsfähig macht. Termine und Mitteilungen sind
anklickbar und führen in den jeweiligen Bereich.

### Aktualisieren sich die Zahlen von selbst?

Ja. Ein manueller Reload ist nicht mehr nötig:

- beim **Zurückkehren auf den Tab** (wenn die Zahlen älter als eine Minute sind)
- zusätzlich **alle 5 Minuten**, solange der Tab sichtbar ist

Beim Auffrischen bleiben die alten Werte stehen und werden nur kurz gedimmt —
die Seite springt nicht und Kacheln kollabieren nicht.

> **Stand der Zahlen:** Termine und Beratungen kommen aus der lokalen
> Auswertungstabelle, die alle 15 Minuten mit Phorest abgeglichen wird. Der
> tatsächliche Stand steht rechts oben in der „Heute"-Karte. „Durchgeführt"
> wird in Phorest oft erst beim Abrechnen gesetzt, teils am Folgetag — die Zahl
> ist tagsüber daher eher zu niedrig.

### Startseite anpassen

Mit dem Recht **„KPIs und Charts konfigurieren"** (`configure_dashboard`)
erscheint oben rechts der Knopf **Anpassen**:

Alle Aktionen einer Kachel sitzen im Bearbeitungsmodus in **einer** Leiste oben
rechts an der Kachel:

| Aktion | Wie |
|---|---|
| Reihenfolge ändern | Kachel greifen und verschieben |
| Breite umschalten | Pfeil-Symbol an der Kachel (100 % ⇄ 50 %) |
| Kachel entfernen | X-Symbol an der Kachel |
| Inhalt wählen | Zahnrad an der Kachel — dasselbe Symbol für Statistik, Kennzahlen und Quicklinks |
| Kachel hinzufügen | Feld „Karte hinzufügen" am Ende des Rasters |
| Zurücksetzen | „Zurücksetzen" in der Bearbeitungsleiste |

**Kachel hinzufügen läuft in zwei Schritten:** erst der Kartentyp, dann sein
Inhalt (welche Statistik, welche Kennzahlen). News, Quicklinks und Mitteilungen
haben keinen zweiten Schritt und werden direkt angelegt.

Änderungen werden sofort gespeichert; **die Seite lädt dabei nicht neu** — auch
nicht beim Hinzufügen einer Kachel oder beim Wechsel einer Statistik. Nur
„Zurücksetzen" lädt neu, weil es das ganze Raster austauscht.

**Zurücksetzen** löscht die eigene Fassung. Danach gilt wieder die
Voreinstellung der Rolle (siehe unten) bzw. die Standard-Belegung.

### Kennzahlen-Kachel

Zur Wahl stehen **alle Kennzahlen des Hubs**, die man sehen darf — aktuell 129
aus 13 Quellen (Verkauf, Ads, Kunden, Personal, glattt-KPIs, HR, Widerrufe,
Besucher, Termine, Pakete, Schulden …). Bis 08/2026 waren es nur vier Quellen
rund um Termine und Pakete.

Wegen der Menge hat der Dialog ein **Suchfeld**. Bereits Gewähltes bleibt beim
Filtern sichtbar, damit die Auswahl nicht aus dem Blick gerät und der Zähler
„x / 8" zur Liste passt. Pro Kachel sind 8 Kennzahlen möglich, bei halber
Breite 4.

Beträge, Prozentwerte und Nachkommastellen werden korrekt dargestellt
(„1.234,50 €" statt „1234.5").

### Statistik-Kacheln

Jede Statistik des Hubs kann als Kachel auf der Startseite stehen — dieselbe
Karte wie auf der Berichtsseite, inklusive Diagramm, Tabellen-Register und
Info-Panel. Es gibt keine gesonderten „Startseiten-Diagramme" mehr.

Angeboten wird nur, was man auch sehen darf. Eine Statistik, für die die
Berechtigung fehlt (oder später entzogen wird), verschwindet still aus dem
Raster statt als leerer Rahmen stehen zu bleiben.

Statistiken folgen dem **Standortfilter der Seitenleiste**. Einen Zeitraum-
Filter hat die Startseite bewusst nicht — jede Statistik zeigt ihren
Standardzeitraum; Statistiken mit festem Zeitraum weisen ihn als Hinweis aus.

---

## Für Entwickler

### Dateien

| Datei | Zweck |
|---|---|
| `app/Http/Controllers/StartPageController.php` | Seite (`show`), Tagesüberblick, Konfiguration, KPI- und Statistik-Auswahl |
| `app/Services/StartPageOverviewService.php` | Die drei Zahlen des Tagesüberblicks |
| `app/Models/StartPageConfig.php` | Eigene Belegung, Auflösungs-Reihenfolge, Kartentypen, Quicklink-Katalog |
| `app/Models/StartPageRoleDefault.php` | Voreinstellung je Rolle |
| `app/Filament/Resources/StartPageRoleDefaults/` | Admin-Backend für die Rollen-Voreinstellung |
| `resources/views/hub/start.blade.php` | Seiten-Skelett, serverseitig gerendertes Kachelraster |
| `resources/views/hub/start/_overview.blade.php` | Begrüßung + Tagesüberblick |
| `resources/views/hub/start/_card-{news,quicklinks,mitteilungen,kpis}.blade.php` | Kachel-Partials |
| `resources/views/hub/start/_quicklink-icon.blade.php` | Symbol eines Quicklinks (Heroicons) |
| `resources/views/hub/start/_modal-*.blade.php` | Karte hinzufügen, Quicklinks, Kennzahlen, Statistik |
| `public/js/start.js` | `startPage()`, `startCard()`, `startOverview()` |
| `public/css/theme_glattt.css` | Abschnitte `START PAGE – *` |

### Aufbau

```
Erster Request                          Danach, je Kachel
┌──────────────────────────────┐        ┌────────────────────────────┐
│ StartPageController@show      │        │ GET /hub/start-overview     │
│  └─ StartPageConfig           │        │ GET /phorest/news/latest    │
│      ::resolveForUser()       │        │ GET /phorest/notifications  │
│         ↓                     │        │ GET /hub/start-kpis         │
│  hub/start.blade.php          │        │ (Statistik-Kacheln: eigener │
│   ├─ Begrüßung + Überblick    │        │  Endpoint aus der Registry) │
│   ├─ Kachelraster (@foreach)  │        └────────────────────────────┘
│   │   └─ <x-statistic> je                     ↑
│   │      Statistik-Kachel                     │
│   └─ Platzhalter je Kachel  ──────────────────┘
└──────────────────────────────┘
```

**Warum serverseitig?** Zwei Gründe, beide zwingend:

1. **Gerüst sofort.** Das Raster steht in ihrer Endhöhe im ersten HTML.
2. **`<x-statistic>` ist eine Blade-Komponente.** Sie lässt sich nur
   serverseitig rendern — ohne diesen Umbau könnte die Startseite die
   StatisticRegistry gar nicht nutzen.

### Alpine-Komponenten

| Komponente | Ort | Aufgabe |
|---|---|---|
| `startPage(cfg)` | Seiten-Wurzel | Standortfilter, Auto-Aktualisierung, Bearbeitungsmodus, Dialoge |
| `startCard(card)` | je Kachel | Lädt die Daten einer Kachel |
| `startOverview()` | Tagesüberblick | Lädt die drei Tageszahlen |

Der Rahmen stellt **`statFilters`** (`{date_from, date_to, branch_id}`) und
**`refreshTick`** reaktiv bereit. Kacheln lesen beides über `x-effect`:

```blade
x-data="startCard({...})"
x-effect="syncContext(JSON.stringify(statFilters), refreshTick)"
```

Dieselbe Mechanik nutzt `<x-statistic>` (siehe `glattt-stats.js`) — keine
Events, keine Listener, gilt auch für nachträglich eingefügte Kacheln.

> **Kein `x-init="init()"`.** Alpine ruft `init()` bei einem Datenobjekt mit
> `init()`-Methode selbst auf. Beides zusammen liesse jede Kachel doppelt laden
> — genau der bekannte Doppel-Ladefehler anderer Seiten.

> **Zähler immer deklarieren.** `_seq` und `_context` stehen im Datenobjekt.
> Undeklarierte Properties teilen sich verschachtelte `x-data`-Komponenten über
> die Scope-Kette und verwerfen sich gegenseitig die Race-Guards.

### Auto-Aktualisierung

`startPage()` erhöht `refreshTick` und ruft zusätzlich `load()` auf jeder
`.statistic-glattt`-Instanz:

```js
refreshAll() {
    this.refreshTick++;
    document.querySelectorAll('.statistic-glattt')
        .forEach(el => window.Alpine?.$data(el)?.load?.());
}
```

Der Umweg über die Instanz ist nötig, weil `GlatttStats.syncFilters()` nur die
**Filter** vergleicht — bei unverändertem Standort würde ein Takt-Signal dort
nichts auslösen.

Auslöser: `visibilitychange` (mindestens 60 s Abstand) und ein 5-Minuten-Takt,
der nur bei sichtbarem Tab feuert.

### Ladeverhalten

Die Seite folgt `statistics-pages.instructions.md`, Abschnitt 8:

| Regel | Umsetzung |
|---|---|
| Endhöhe ab dem ersten Rendern | Raster kommt fertig vom Server, jede Kachel mit Platzhalter |
| Keine Spinner | `<x-stat-skeleton>`; die Klassen `.start-card-loading*` sind entfallen |
| Höhen genau einmal | CSS in `theme_glattt.css` — kein `style="height: …"` im Partial |
| Fehler je Kachel | `<x-card-state type="error" retry="load()">`, kein seitenweiter Fehlerblock |
| Sanftes Neuladen | `refreshable-glattt` + `:class="loading && data ? 'is-refreshing' : ''"` |

Für die Startseite kamen zwei Skeleton-Typen dazu: **`news`** (Aufmacher mit
Bild, zwei Einträge, Fußzeile) und **`list`** (Symbol + zwei Textzeilen, für
Mitteilungen). Beide in `components/stat-skeleton.blade.php`.

### Kartentypen

`StartPageConfig::CARD_TYPES` — `news`, `quicklinks`, `mitteilungen`, `kpis`,
`statistic`.

```json
{
    "id": "statistic-a3f2b1",
    "type": "statistic",
    "width": "full",
    "position": 4,
    "config": { "statisticKey": "termine.monthly" }
}
```

`config` trägt die Feineinstellung: `statisticKey` bei Statistik-Kacheln,
`selectedKpis` bei Kennzahlen-Kacheln.

> **Achtung beim Speichern:** Das Layout wird aus dem DOM abgeleitet
> (Reihenfolge), die Kartenobjekte selbst kommen aus `this.cards`. Würde man
> die Karten aus dem DOM neu aufbauen, ginge `config` verloren und jeder Nutzer
> verlöre beim Verschieben seine gewählte Statistik. Deshalb lädt der
> Bearbeitungsmodus beim Betreten die verbindliche Belegung nach.
> Abgesichert durch `StartPageTest::test_verschieben_erhaelt_die_gewaehlte_statistik`.

### Karten einsetzen statt Seite neu laden

Kacheln werden serverseitig gerendert — das gilt auch für eine **neu
hinzugefügte** Karte. Statt die ganze Seite neu zu laden, liefert der Server
das Markup einer einzelnen Kachel:

- `hub/start/_card.blade.php` ist die **einzige** Quelle des Karten-Markups.
  Dieselbe Datei rendert das Raster beim Seitenaufruf und die Einzelkarte für
  `addCard()` / `renderCard()`.
- Die Antwort enthält neben `html` auch `assets` — die Bibliotheken und
  Bundles, die diese Kachel braucht. `startPage.ensureAssets()` lädt sie in
  Reihenfolge nach und überspringt, was schon im DOM steht (Vergleich über den
  Pfad, ohne `?v=`-Parameter).
- **Warum das nötig ist:** Die Seite lädt nur die Bundles der Statistiken, die
  beim Aufruf schon lagen. Wer im Bearbeitungsmodus eine Statistik aus einem
  anderen Bereich hinzufügt, braucht deren Bundle — sonst kennt `GlatttStats`
  die Komponente nicht und die Kachel bliebe leer.
- Eingefügt wird per `insertBefore` vor die Kachel „Karte hinzufügen"; Alpine
  erkennt den neuen Knoten selbst und startet die Komponente.
- Die Liste in `StartPageController::statisticAssets()` speist **beides**: den
  `@assets`-Block der Seite und die Nachlade-Liste. Liefen beide auseinander,
  funktionierte eine frisch hinzugefügte Statistik erst nach einem
  Seitenwechsel.

Ohne Neuladen laufen: Karte hinzufügen, entfernen, verschieben, Breite
umschalten, Statistik wechseln, Quicklinks ändern, Kennzahlen ändern. Nur
„Zurücksetzen" lädt neu — es tauscht das ganze Raster.

### Raster, halbe Breite und Sortieren

Vier Eigenheiten, die beim Nachbauen leicht wieder hineinrutschen (alle 08/2026
behoben):

- **`grid-template-columns: repeat(2, minmax(0, 1fr))`.** `1fr` bedeutet
  `minmax(auto, 1fr)` — eine Spalte darf also über ihren Anteil hinauswachsen,
  wenn ihr Inhalt breiter ist. Diagramme und breite Tabellen sprengten damit
  ihre Spalte (gemessen: 264 px | 1270 px statt 622 px | 622 px), und eine
  Kachel auf 50 % stand faktisch über die ganze Breite. Dazu gehört
  `min-width: 0` auf `.start-card`: Rasterkinder haben von Haus aus die
  Mindestbreite ihres Inhalts.
- **`border-width: 0` auf `.start-card-statistic`.** `border: none` setzt die
  Breite auf `medium` (3 px) und blendet den Rahmen nur über `style: none` aus.
  Sobald `.start-card.edit-mode` den Stil auf `dashed` drehte, war die Breite
  wieder gültig — im Bearbeitungsmodus lag deshalb ein dicker schwarzer
  Strichrahmen (`currentColor`) um jede Diagramm-Kachel und um sonst keine.
- **Sortable im Zeiger-Modus** (`forceFallback: true`). Ohne den Schalter nutzt
  Sortable die HTML5-Drag-API: Der Browser erzeugt erst ein Drag-Bild, die
  Karte blieb spürbar liegen und sprang dann an den Zeiger. Dazu:
  `transition` auf `.start-card` einzeln aufzählen statt `all` (ein
  `transition: all` fasst `transform` mit, an dem Sortable zerrt), und
  `is-sorting` am Raster stellt das Wackeln der übrigen Karten still — deren
  Keyframes schreiben `transform`, dieselbe Eigenschaft, mit der Sortable die
  Karten beiseiteschiebt.
- **`x-ignore` auf der gezogenen Karte** (`onChoose`, zurück in `onEnd`). Im
  Zeiger-Modus klont Sortable die Karte samt Alpine-Attributen an den Body.
  Ohne `x-ignore` versucht Alpine, den Klon zu initialisieren: Der findet
  seinen Scope nicht mehr (`editMode is not defined`), und eine
  Statistik-Kachel baute beim Anfassen ein zweites Diagramm auf und fragte
  ihren Endpoint erneut ab. Das Attribut vererbt sich beim Klonen mit; das
  Original ist längst initialisiert und bleibt unberührt.
  `persistOrderFromDom()` nimmt den Klon zusätzlich per
  `:not(.start-card-dragging)` aus, damit keine Karten-ID doppelt in der
  Reihenfolge steht.

**Gleiche Höhe je Zeile.** Das Raster zieht jede Kachel auf Zeilenhöhe
(`align-items: stretch`). Bei Statistik-Kacheln ist die sichtbare Karte aber
nicht die Kachel selbst, sondern die `.card-glattt` der Statistik — und die
blieb auf Inhaltshöhe stehen. Neben einem höheren Nachbarn endete eine
Diagramm-Karte deshalb sichtbar zu früh (gemessen: 555 px in einer 900 px hohen
Zeile). Eine Flex-Kette `.start-card-statistic` → `.statistic-glattt` →
`.card-glattt` reicht die Zeilenhöhe durch.

**Kein `fixed_range`-Schild auf der Startseite.** Die Startseite hat keinen
Zeitraum-Filter, gegen den sich eine feste Zeitspanne abgrenzen müsste — das
Schild („Gesamte Historie — Ausschnitt über den Zoom-Regler") erklärte hier
nichts und schwebte nur über dem Kartenrand. Den Zeitraum nennt weiterhin der
Auswahl-Dialog; auf den **eigenen Dashboards** (mit Zeitraum-Filter) steht das
Schild unverändert an der Kachel.

Nach dem Breitenwechsel löst `toggleCardWidth()` ein `resize`-Event aus:
Diagramme messen ihren Container nur beim Zeichnen und hängen sonst am
`window`-Resize (`glattt-stats.js`) — sonst behielte ECharts die alte Breite.

### Kennzahlen: volle Registry-IDs

Die Kachel speichert seit 08/2026 die **volle Registry-ID** (`sales.total_revenue`)
statt der Kurzform (`total_revenue`). Die Kurzform ist nur **innerhalb einer
Quelle** eindeutig — sie funktionierte, solange nur vier Quellen angeboten
wurden, und wäre quellenübergreifend mehrdeutig geworden.

- `getKpis()` reicht die IDs direkt an `KpiValueService::values()` durch
  (kein `shortIds: true` mehr) und liefert `format`, `unit` und `decimals` mit;
  formatiert wird clientseitig in `startCard.formatKpi()` nach denselben Regeln
  wie die KPI-Zeile der Statistikseiten.
- `getKpiPortfolio()` listet `KpiRegistry::forUser($user)`, gruppiert nach
  `KpiRegistry::sourceLabel()`.
- `saveSelectedKpis()` prüft gegen `KpiRegistry::forUser()` — eine Kennzahl
  ohne Berechtigung lässt sich nicht ins eigene Layout schreiben (422).
- Migration `2026_08_11_100000_migrate_start_page_kpi_ids_to_registry` überführt
  gespeicherte Auswahlen (Kachel-Config **und** die alte globale
  `selected_kpis`); sie ist idempotent (volle IDs bleiben stehen).

> **Aufwand im Blick behalten:** Vorher lagen alle vier Quellen im
> `ReportController` und waren gecacht. Jetzt kann eine Kachel Kennzahlen aus
> bis zu acht verschiedenen Quellen ziehen — `KpiValueService` macht zwar
> höchstens einen Service-Aufruf je Quelle, aber acht Quellen sind acht
> Aufrufe. Die Services cachen ihre Aggregate; wenn die Kachel spürbar träge
> wird, ist das der Ansatzpunkt.

### Statistik-Kacheln

Der frühere Kartentyp `charts` mit sechs fest verdrahteten Diagrammen
(`CHART_PORTFOLIO` im Controller, fünf Builder-Methoden, eigenes ECharts-Setup
in `start.js`) ist **ersatzlos entfallen** — alle sechs existierten längst als
Statistik in der Registry:

| Altes Diagramm | Registry-Schlüssel |
|---|---|
| `appointments_monthly` | `termine.monthly` |
| `consultation_trend` / `completed_vs_noshow` | `termine.consultation-monthly` |
| `cancelled_monthly` | `termine.cancelled-monthly` |
| `body_zones_monthly` | `termine.body-zones` |
| `top_services` | `termine.top-services` |

Die Migration `2026_08_10_210200_migrate_start_page_chart_cards_to_statistics`
überführt gespeicherte Auswahlen (inklusive Rückweg im `down()`).

**Assets:** Geladen werden nur die Bundles der tatsächlich platzierten
Statistiken (`$statistikSkripte` aus dem Controller), nicht alle 84 wie beim
Eigenen Dashboard. Leaflet und wordcloud2 kommen nur mit, wenn `kunden.map`
bzw. `ads.search-terms` auf der Seite liegt.

### Rollen-Voreinstellung

Reihenfolge in `StartPageConfig::resolveForUser()`:

```
eigene Konfiguration  →  Voreinstellung der Rolle  →  Code-Voreinstellung
```

Sobald ein Nutzer seine Startseite selbst gespeichert hat, gilt nur noch seine
Fassung — eine spätere Änderung der Rollen-Voreinstellung fasst sie nicht mehr
an. Hat jemand mehrere Rollen, gewinnt die Rolle mit den **meisten Kacheln**
(die umfassendste Voreinstellung ist die hilfreichste; eine willkürliche
Reihenfolge wäre für den Nutzer nicht nachvollziehbar).

Gepflegt wird sie im Admin-Backend unter **Einstellungen → Startseite je
Rolle**; Recht: `manage_start_page_defaults` (vergeben abgeleitet aus
`create_roles`).

Tabelle `start_page_role_defaults`: `role_id` (unique, FK auf `roles`), `cards`
(JSON), `quicklinks` (JSON).

### Berechtigungen

| Recht | Wirkung |
|---|---|
| `view_dashboard` | Startseite und ihre Kacheln sehen |
| `configure_dashboard` | Bearbeitungsmodus: Kacheln hinzufügen, entfernen, verschieben, konfigurieren |
| `manage_start_page_defaults` | Rollen-Voreinstellung im Admin-Backend pflegen |

**Geändert 08/2026 — behobener Fehler:** `GET /hub/start-config` lag hinter
`configure_dashboard`, während `start.js` die Route für **jeden** Nutzer
aufrief. Wer das Recht nicht hatte, bekam 403 und damit eine **leere
Startseite**. Die Leseroute liegt jetzt unter `view_dashboard`; schreibende
Routen bleiben hinter `configure_dashboard`.

Damit einher ging eine saubere Trennung: `configure_dashboard` regelt das
**Einrichten**, nicht das **Sehen**. Ob eine Kennzahlen- oder Statistik-Kachel
Inhalt zeigt, entscheidet allein die Berechtigung der jeweiligen Kennzahl
(`KpiValueService`) bzw. Statistik (`StatisticRegistry` + `<x-statistic>`).

### Endpoints

| Methode | Route | Recht | Zweck |
|---|---|---|---|
| GET | `/hub` | `view_dashboard` | Die Seite |
| GET | `/hub/start-overview` | `view_dashboard` | Tagesüberblick |
| GET | `/hub/start-kpis` | `view_dashboard` | Werte einer Kennzahlen-Kachel |
| GET | `/hub/start-config` | `view_dashboard` | Eigene Belegung lesen |
| POST | `/hub/start-config` | `configure_dashboard` | Belegung speichern |
| DELETE | `/hub/start-config` | `configure_dashboard` | Auf Voreinstellung zurücksetzen |
| POST | `/hub/start-config/add-card` | `configure_dashboard` | Kachel anlegen |
| POST | `/hub/start-config/remove-card` | `configure_dashboard` | Kachel entfernen |
| POST | `/hub/start-config/render-card` | `configure_dashboard` | Eine Kachel als HTML + benötigte Skripte |
| GET | `/hub/start-kpis/portfolio` | `configure_dashboard` | Kennzahlen zur Auswahl (alle der KpiRegistry, rechtegefiltert) |
| POST | `/hub/start-kpis/save` | `configure_dashboard` | Kennzahlen-Auswahl speichern |
| GET | `/hub/start-statistic/portfolio` | `configure_dashboard` | Statistiken zur Auswahl |
| POST | `/hub/start-statistic/save` | `configure_dashboard` | Statistik einer Kachel speichern |

Die frühere Route `/hub/start-chart` samt Portfolio und Speichern ist entfallen.

### Tagesüberblick — Datenquellen

`StartPageOverviewService::forUser(User $user, ?string $branchId)` — drei feste
Kennzahlen (Festlegung Jan, 11.08.2026):

| Zahl | Quelle | Recht |
|---|---|---|
| Beratungsgespräche heute (stattgefunden / laufend / offen / No-Show) | **Phorest live**, gefiltert auf Beratungs-Services aus `consultation_services` | `view_appointments` |
| Verkaufte KPZ heute | `SUM(contracts.body_zone_count)` nach `signed_at`, Status aktiv/abgeschlossen | `view_report_sales_statistics` |
| Prognose KPZ bis Monatsende | `SalesStatisticsService::getProjection()['overall']['projected_body_zones']` | `view_report_sales_statistics` |

> **Es geht ausschliesslich um Beratungstermine, nicht um alle Termine des
> Tages.** Ein Termin zählt nur, wenn eine seiner Dienstleistungen in
> `consultation_services` mit `is_consultation` steht — bei mehreren Leistungen
> reicht eine (`allServiceIds`).

**Bewusste Entscheidungen:**

- **Beratungen LIVE aus Phorest, nicht aus `stats_historic_appointments`.**
  Der laufende Tag steht in der Auswertungstabelle in der Praxis nicht
  zuverlässig zur Verfügung — gemessen: dort 0 Termine, während Phorest 87
  führte. Eine Startseite mit anderen Zahlen als die Terminübersicht ist
  wertlos. Kosten: **~520 ms** für einen parallelen Abruf über alle Institute
  für EINEN Tag; die oft zitierten 10–15 Sekunden gelten für Zeiträume über
  mehrere Wochen.
- **Zustandslogik 1:1 wie `getState()` in `public/js/appointments.js`** —
  `COMPLETED|PAID` = stattgefunden, `CHECKED_IN` = laufend, `BOOKED|CONFIRMED`
  = offen, `NO_SHOW` separat, Stornierte raus. Dazu die beiden Regeln der
  Terminübersicht, die über den Phorest-Zustand hinausgehen:
  1. Termine auf **„Absage"-Pseudo-Mitarbeitern** gelten als No-Show
     (Mitarbeiternamen über `getCachedStaff()`, 30 Min. Cache).
  2. Ein offener Termin, dessen **Ende mehr als 30 Minuten zurückliegt**, gilt
     als No-Show — sonst stünde er den ganzen Tag als „offen".

  Das ist bewusst eine zweite Umsetzung derselben Regel (PHP und JS). Wer eine
  Seite ändert, muss die andere mitziehen; abgesichert durch eigene Tests.
- **KPZ und Prognose aus der Datenbank.** Verträge stehen dort ohnehin, und die
  Terminübersicht rechnet sie über denselben Weg
  (`/phorest/daily-contract-stats`: `signed_at`, Status aktiv/abgeschlossen).
- **Prognose nicht selbst gerechnet**, sondern aus der Verkaufsstatistik geholt
  (linear über Verkaufstage, Mo–Sa ohne Feiertage). Eine eigene Formel würde
  zwangsläufig von der Verkaufsstatistik abweichen. Der Standortfilter wird
  durchgereicht — Feiertage sind standortabhängig. Der Aufruf ist in einen
  `try/catch` gefasst: Die Hochrechnung nutzt MySQL-Funktionen (`DATE_FORMAT`)
  und darf den Tagesüberblick nicht mitreissen. Auch der Phorest-Abruf ist
  abgesichert: Fällt er aus, bleibt die Kennzahl leer, die übrigen laufen weiter.

**Bekannte Abweichungen — kein Fehler:**

- **KPZ sind bei Ganzkörper-Verträgen untererfasst.** `body_zone_count` ist auf
  `price_lists.max_body_zones` gedeckelt (6 bzw. 7 je Fassung); die tatsächlich
  gewählten Zonen stehen nur in `contract_body_zones`. Bewusst nicht
  korrigiert, damit die Kachel dieselbe Zahl zeigt wie die Verkaufsstatistik
  und die Terminübersicht.
- **„Stattgefunden" ist tagsüber zu niedrig.** `COMPLETED`/`PAID` wird in
  Phorest oft erst beim Abrechnen gesetzt, teils am Folgetag.

KPZ sind je Institut und Tag **60 Sekunden gecacht**, die Beratungen ebenfalls
(ein Phorest-Abruf je Minute und Institut), die Prognose folgt dem
1-Stunden-Cache der Verkaufsstatistik.

### Tests

| Datei | Prüft |
|---|---|
| `tests/Feature/StartPageTest.php` | Raster im ersten HTML, Platzhalter statt Spinner, sanftes Neuladen, Statistik-Kacheln über die Registry, Rechte-Filterung, Rollen-Voreinstellung, Layout-Speichern ohne Verlust der Feineinstellung |
| `tests/Feature/StartPageOverviewServiceTest.php` | Zustands-Gruppierung, Stornos/gelöschte, Tagesgrenze, Standortfilter, Beratungs-Erkennung, Rechte, Mitteilungs-Zähler |

> **Nicht auf `@assets`-Ausgabe testen.** Livewire spielt jeden `@assets`-Block
> pro Prozess nur **einmal** aus — im Gesamtlauf fehlen die Script-Tags ab dem
> zweiten Seitenaufruf, obwohl die Seite korrekt ist. Stattdessen die
> View-Daten prüfen (`$response->viewData('statistikSkripte')`).

---

## Verwandte Dokumentation

- [Start-Page KPI-System](START-PAGE-KPIS.md) — Kennzahlen-Portfolio und Auswahl
- [Eigenes Dashboard](CUSTOM-DASHBOARD.md) — der zweite Rahmen für Registry-Statistiken
- [Ladeverhalten Statistikseiten](LADEVERHALTEN-STATISTIKSEITEN.md) — Skeletons, Fehler je Karte, sanftes Neuladen
- [Berechtigungssystem](BERECHTIGUNGSSYSTEM.md)
- [Design System](DESIGN-SYSTEM.md)
