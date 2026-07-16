# Matomo Besucher- & Buchungs-Funnel-Tracking

Zieht Besuchsdaten aus der selbst-gehosteten **Matomo**-Instanz in den Hub und
wertet sie als **Besucher- und Buchungs-Funnel** aus: Herkunft, Verweildauer,
Top-Seiten und der Trichter *Buchung gestartet → Schritt 2 → Abschluss* inkl.
Abbruchpunkten – segmentierbar nach Standort und Quelle.

## Für Endanwender

**Wo:** Berichte → *Besucher & Buchungs-Funnel* (`/hub/reports/visitor-funnel`).

**Was die Seite zeigt:**

- **KPIs:** eindeutige Besucher, Ø Verweildauer, Funnel-Abschlussquote und die
  **absolute Buchungszahl** (server-seitig, 100 % erfasst).
- **Buchungs-Funnel:** die drei Stufen als Trichter mit Abbruch-Quoten
  (Schritt 1 = Terminauswahl, Schritt 2 = Dateneingabe).
- **Funnel-Vergleich:** dieselben Stufen je **Standort** oder je **Quelle**.
- **Herkunft:** Besuche/Starts/Abschlüsse je Referrer-Typ (direkt, Suche,
  Kampagne, Verweis, Social).
- **Top-Unterseiten:** meistbesuchte Seiten und Ø Verweildauer je Seite.

!!! warning "Warum weichen die Zahlen von den echten Buchungen ab?"
    Matomo erfasst nur Besucher **mit Cookie-Zustimmung und ohne Adblocker**
    (client-seitig, ca. 60–70 %). Die **absolute Buchungszahl** in den KPIs
    stammt deshalb server-seitig aus `booking_trackings` (100 %). Der Funnel
    zeigt den **Verlauf/Drop-off**, nicht die absolute Abschlusszahl.

## Für Entwickler

### Datenfluss

```
WPglatttBooking (Website)                Hub (Laravel)
  └─ Matomo-Events "Buchung"             ┌────────────────────────────┐
     Start / Schritt 2 erreicht /        │ matomo:sync-visits (10 Min)│
     Buchung abgeschlossen        ──────▶│ Live.getLastVisitsDetails  │
  └─ visitorId + Buchung ─(API)─▶ booking_trackings.matomo_visitor_id │
                                         │  → matomo_visits            │
Matomo (selbst-gehostet) ◀── Reporting ──│  → matomo_visit_actions     │
                                         │  → Funnel abgeleitet        │
                                         │  → Stitch via visitorId     │
                                         └────────────────────────────┘
                                            → Bericht visitor-funnel
```

### Komponenten

| Datei | Zweck |
|---|---|
| `config/matomo.php` | URL, Site-ID, Token, Sync-/Funnel-Konfiguration |
| `app/Services/MatomoApiService.php` | Wrapper um die Reporting API (`Live.getLastVisitsDetails`), Token im POST-Body |
| `app/Services/MatomoVisitSyncService.php` | Mapping Besuch→DB, Funnel-Ableitung, Stitching |
| `app/Services/MatomoAnalysisService.php` | Aggregationen für den Bericht |
| `app/Models/MatomoVisit.php`, `MatomoVisitAction.php` | Eloquent-Models |
| `app/Console/Commands/SyncMatomoVisits.php` | `matomo:sync-visits` (alle 10 Min) |
| `app/Console/Commands/PruneMatomoActions.php` | `matomo:prune-actions` (täglich) |
| `app/Http/Controllers/MatomoFunnelController.php` | Bericht + JSON-Endpoints |
| `resources/views/hub/reports/visitor-funnel.blade.php` | Report-Seite |
| `public/js/visitor-funnel.js` | Alpine-Komponente + Chart.js |

### Tabellen

- **`matomo_visits`** – ein Datensatz je Matomo-`idVisit` (Quelle, Keyword,
  Dauer, Gerät/Geo, Funnel-Flags `reached_start/step2/completed`,
  `funnel_furthest_step`, `standort`, `visitor_id`, gestitchte `appointment_id`).
- **`matomo_visit_actions`** – Pageviews/Events je Besuch (Roh-Daten für
  Top-Seiten & Verweildauer; nach `raw_action_retention_days` gelöscht).
- **`booking_trackings.matomo_visitor_id`** – Verknüpfungsschlüssel.

### Instrumentierung (WPglatttBooking)

Die Buchungsstrecke feuert Matomo-Events der Kategorie **`Buchung`**:

| Event-Action | Stufe | Feuert bei |
|---|---|---|
| `Start` | Buchung gestartet | Widget geöffnet |
| `Schritt 2 erreicht` | Dateneingabe | Übergang zu Schritt 2 |
| `Buchung abgeschlossen` | Abschluss | **AJAX-Erfolg** (ab Plugin 0.10.0) |
| `Dauer bis Abschluss` | (Abschluss, Legacy) | AJAX-Erfolg (auch vor 0.10.0) |
| `Klick auf Jetzt buchen` | – | Button-Klick (VOR Erfolg – **nicht** als Abschluss werten) |

Der Standort steckt im **Event-Namen** (`/standorte/hannover/` …).

!!! note "Hinweis: Kategorie „Terminbuchung“"
    Parallel existiert eine **Doppel-Instrumentierung** aus GTM (Kategorie
    `Terminbuchung`, Name immer „unbekannt“), die synchron mitfeuert. Der Sync
    filtert strikt auf `eventCategory = Buchung` und ignoriert sie. Die
    GTM-Quelle sollte perspektivisch entfernt werden.

### Verknüpfung Besuch ↔ Buchung (Stitching)

Ab Plugin 0.10.0 liest das Frontend `Matomo.getAsyncTracker().getVisitorId()`
und sendet die `matomo_visitor_id` mit der Buchung an den Hub. Der Sync
verknüpft `matomo_visits.visitor_id` ↔ `booking_trackings.matomo_visitor_id`
→ `appointment_id`. So hängt die Journey an Buchung und (später) Vertrag.

### Matomo-Goals

Die Goals in Matomo sind für das Matomo-Dashboard, **nicht** für den Hub-Funnel
(der liest Roh-Events). Korrekturen 2026-07:

- Goal 1 „Buchung gestartet“ → `event_action = Start` (war fehlkonfiguriert).
- Nach Plugin-Deploy: Goal 2 auf `event_action = Buchung abgeschlossen`
  umstellen, Goal 3 (Timing) stilllegen.

### Konfiguration (.env)

```
MATOMO_URL=https://matomo.glattt.com/
MATOMO_SITE_ID=1
MATOMO_TOKEN_AUTH=...            # Reporting-API-Token (View-Rechte genügen)
```

### Betrieb

- **Sync:** `php artisan matomo:sync-visits` – inkrementell über einen
  überlappenden `minTimestamp` (Erstlauf: 7 Tage Backfill). Idempotent.
- **Cloud Scheduler (Prod):** `POST /api/cron/sync-matomo-visits` alle 10 Min,
  `POST /api/cron/prune-matomo-actions` täglich (Header `X-Cron-Token`).
- **Pruning:** `matomo:prune-actions` löscht Roh-Aktionen älter als
  `raw_action_retention_days` (Default 90).

### Tests

- `tests/Feature/MatomoVisitSyncTest.php` – Funnel-Ableitung, Standort,
  Terminbuchung-Filter, Stitching, Idempotenz.
- `tests/Feature/MatomoAnalysisServiceTest.php` – KPIs, Funnel, Drop-off,
  Quellen, Zeitraum-Filter.
