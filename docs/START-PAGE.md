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
| **Heute** (Tagesüberblick) | Termine heute (gesamt, durchgeführt, offen), Beratungsgespräche heute, ungelesene Mitteilungen |
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

| Aktion | Wie |
|---|---|
| Reihenfolge ändern | Kachel greifen und verschieben |
| Breite umschalten | Pfeil-Symbol an der Kachel (100 % ⇄ 50 %) |
| Kachel entfernen | X-Symbol an der Kachel |
| Kachel hinzufügen | Feld „Karte hinzufügen" am Ende des Rasters |
| Statistik wechseln | Symbol an der Statistik-Kachel → Auswahl mit Suchfeld |
| Kennzahlen wählen | Zahnrad an der Kennzahlen-Kachel |
| Quicklinks wählen | Zahnrad an der Quicklinks-Kachel |
| Zurücksetzen | „Zurücksetzen" in der Bearbeitungsleiste |

Änderungen werden sofort gespeichert. Nach dem Hinzufügen einer Kachel, dem
Wechsel einer Statistik und dem Ändern der Quicklinks lädt die Seite einmal neu
— diese Inhalte baut der Server.

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
| GET | `/hub/start-kpis/portfolio` | `configure_dashboard` | Kennzahlen zur Auswahl (alle der KpiRegistry, rechtegefiltert) |
| POST | `/hub/start-kpis/save` | `configure_dashboard` | Kennzahlen-Auswahl speichern |
| GET | `/hub/start-statistic/portfolio` | `configure_dashboard` | Statistiken zur Auswahl |
| POST | `/hub/start-statistic/save` | `configure_dashboard` | Statistik einer Kachel speichern |

Die frühere Route `/hub/start-chart` samt Portfolio und Speichern ist entfallen.

### Tagesüberblick — Datenquellen

`StartPageOverviewService::forUser(User $user, ?string $branchId)`:

| Zahl | Quelle | Recht |
|---|---|---|
| Termine heute (gesamt/durchgeführt/offen/im Haus/No-Show) | `stats_historic_appointments`, ein `GROUP BY state` | `view_appointments` |
| Beratungsgespräche heute | dieselbe Tabelle, Service-IDs aus `consultation_services` (`is_consultation`) | `view_appointments` |
| Ungelesene Mitteilungen | `Notification::forUser(...)->unreadForUser(...)` als `COUNT` | — |

**Bewusste Entscheidungen:**

- **Lokale Tabelle statt Phorest live.** `sync:appointments-recent` hält den
  laufenden Tag alle 15 Minuten aktuell; ein Live-Abruf über alle Institute
  dauert 10–15 Sekunden und ist für den ersten Bildschirm untragbar. Der Stand
  steht sichtbar in der Karte.
- **Service-IDs aus `consultation_services`**, nicht aus
  `StatsHistoricAppointment::scopeConsultations()` — der Scope hat drei IDs
  hart verdrahtet und verpasst jeden neu angelegten Beratungs-Service.
- **Datumsvergleich als Bereich** (`>= heute AND < morgen`), nicht
  `whereDate()`: Der Model-Cast schreibt in SQLite „Y-m-d H:i:s", MySQL hält
  „Y-m-d"; der Bereich ist in beiden richtig und kann anders als `DATE(spalte)`
  den Index `[appointment_date, branch_id]` nutzen.
- **Zustands-Gruppierung wie die Terminübersicht** (`appointments.js`):
  `COMPLETED|PAID` = durchgeführt, `BOOKED|CONFIRMED` = offen, `CHECKED_IN` =
  im Haus. Stornierte und gelöschte zählen nicht mit.
- **Mitteilungen direkt als COUNT.** Der Endpoint `/phorest/notifications`
  liefert zwar `unread_count`, lädt dafür aber jede Benachrichtigung und feuert
  je Zeile eine eigene Lese-Abfrage.

Termine und Beratungen sind je Institut und Tag **60 Sekunden gecacht**.

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
