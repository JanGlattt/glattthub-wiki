# Matomo Besucher- & Buchungs-Funnel-Tracking

Zieht Besuchsdaten aus der selbst-gehosteten **Matomo**-Instanz in den Hub und
wertet sie als **Besucher- und Buchungs-Funnel** aus: Herkunft, Verweildauer,
Top-Seiten und der Trichter *Buchung gestartet → Schritt 2 → Abschluss* inkl.
Abbruchpunkten – segmentierbar nach Standort und Quelle.

## Für Endanwender

**Wo:** Berichte → *Besucher & Buchungs-Funnel* (`/hub/reports/visitor-funnel`).

**Was die Seite zeigt:**

- **KPI-Dashboard (selbst zusammenstellbar):** Nutzt die wiederverwendbare
  KPI-Dashboard-Komponente (wie die Verkaufsstatistik): Über **„Anpassen"**
  lassen sich die 4 sichtbaren Karten per **Drag & Drop** anordnen, entfernen
  oder aus **12 Kennzahlen** ergänzen (Besucher, Ø Verweildauer, Mobil-Anteil,
  Funnel-Stufen, Quoten, server-seitige Buchungszahl …); die Auswahl wird im
  Browser gespeichert. Trend-Pfeile zeigen die Veränderung zur **Vorperiode
  gleicher Länge** (Zähler in %, Quoten in Prozentpunkten).
- **„Was die Daten zeigen" (automatische Erkenntnisse):** Die Seite leitet
  selbstständig Befunde ab — größter Abbruchpunkt, dominante Folgeseite der
  Abbrecher (z.B. `/preise/` → Preistransparenz), Geräte-Lücke (Mobil vs.
  Desktop), stärkste/schwächste Quelle, Standort-Gefälle, Trend zur Vorperiode
  und die Matomo-Erfassungsquote. Erkenntnisse erscheinen nur bei ausreichender
  Stichprobe (Mindest-Fallzahlen je Befund).
- **Buchungs-Funnel:** vier Stufen als **Fluss-Funnel** (abgerundete
  Stufen-Balken mit weichen Übergängen, echte Proportionen, Weiterleitungs-Quote
  „→ N % weiter" im Übergang; ECharts-Custom-Serie) — **Standortseite besucht**
  (Seite mit Buchungstool, `/standorte/…`) → **Buchung gestartet** → **Schritt 2**
  (Dateneingabe) → **Buchung abgeschlossen**. An jedem Übergang hängt – per
  Leak-Pfeil verbunden – eine **Abbruch-Karte**: verlorene Anzahl
  (`−N`, Prozent), **Ø Zeit bis Abbruch** und **wohin es danach ging** (nächste
  Seite / Absprungquote mit Mini-Balken) — abgeleitet aus den Roh-Aktionen. Auf
  schmalen Viewports klappen die Karten als Liste unter den Funnel.
- **Verlauf:** Tages-Zeitreihe des kompletten Funnels — Besuche / Buchung
  gestartet / Schritt 2 (Dateneingabe) / Abschlüsse (Matomo). Eigener
  **Zeitraum-Umschalter** (Seiten-Zeitraum, 30/90 Tage, Gesamt; bei langen
  Zeiträumen mit Zoom-Slider), umschaltbar auf **Ø 7 Tage** (gleitender
  Durchschnitt, glättet den Wochentags-Zyklus) und per Checkbox auf **Quoten in
  % der Besuche** — so fällt z.B. auf, wenn der Traffic steigt, die Buchungen
  aber nicht mitwachsen. In der %-Ansicht entfällt die Besuche-Linie (konstant
  100 %); beim 7-Tage-Durchschnitt in % wird das Verhältnis der 7-Tage-Summen
  gebildet.
- **Funnel-Vergleich:** je **Standort** oder je **Quelle**, mit eigenem
  Zeitraum-Umschalter und zwei Ansichten: **Stufen** (Balken; per Checkbox
  **100 % normalisiert** — jedes Segment startet bei 100 %, sortiert nach
  Abschlussquote → Ranking der Konversionsstärke unabhängig vom Traffic) und
  **Verlauf** (eine Linie je Segment über die Zeit; Metrik wählbar:
  Abschlussquote / Buchung gestartet / Abschlüsse, Täglich oder Ø 7 Tage;
  max. 6 Segmente nach Starts). Vierte Balken-Serie **„Buchungen (Server)"**:
  echte Buchungen je Segment (Standort via `branch_id`-Mapping, Quelle via
  Klick-ID/Referrer-Klassifizierung) — korrigiert die Matomo-Verzerrung direkt
  im Chart; nur server-seitig bekannte Quellen („Herkunft unbekannt") erscheinen
  als eigene Zeile. In der **normalisierten Ansicht** entfällt die Server-Serie
  bewusst (andere Messbasis — „Buchungen ÷ Matomo-Starts" wäre ein
  Erfassungs-Artefakt, keine Quote); dort werden stattdessen die
  Stichprobengrößen (`n=…`) am Label gezeigt, Segmente unter 20 Starts ans
  Ende sortiert (nicht belastbar) und Segmente ohne Starts ausgeblendet.
  Bei aktivem Quellen-Filter entfällt die Server-Serie ebenfalls.
- **Herkunft:** Besuche/Starts/Abschlüsse je Referrer-Typ inkl. **Abschluss-Quote**
  — plus Spalte **„Buchungen (Server)"**: echte Buchungen aus `booking_trackings`,
  nach Klick-IDs (gclid/gbraid/fbclid), UTM und Referrer klassifiziert (100 %
  erfasst). **Wichtig:** Matomo unterschätzt den Ads-Anteil systematisch —
  Werbe-Traffic verweigert Consent überproportional bzw. verliert den
  HTTP-Referrer und landet als „Direkt" (Prod-Vergleich 07/2026: real ~57 %
  Ads-Buchungen, in Matomo roh nur ~21 % der Abschlüsse als Kampagne). Der
  **Sync korrigiert das teilweise selbst**: Besuche mit Klick-IDs/UTM in der
  Lande-URL werden auf `campaign` hochgestuft (hob den Kampagnen-Anteil der
  Abschlüsse auf ~43 %); die Restlücke sind Besuche ganz ohne URL-Parameter.
  Ein automatischer Erkenntnis-Hinweis warnt, wenn die verbleibende
  Verzerrung ≥ 15 Prozentpunkte beträgt.
  „Herkunft unbekannt" = Buchung nach interner Navigation ohne
  Attributions-Merkmal. Für Budget-Entscheidungen gilt die Server-Spalte
  bzw. die Ads-Analyse.
- **Geräte-Vergleich:** Mobil / Desktop / Tablet mit Start- und Abschlussquote —
  deckt Konversions-Lücken der Buchungsstrecke je Geräteklasse auf.
- **Top-Unterseiten:** meistbesuchte Seiten und Ø Verweildauer je Seite.

!!! warning "Warum weichen die Zahlen von den echten Buchungen ab?"
    Matomo erfasst nur Besucher **mit Cookie-Zustimmung und ohne Adblocker**
    (client-seitig, ca. 60–70 %). Die **absolute Buchungszahl** in den KPIs
    stammt deshalb server-seitig aus `booking_trackings` (100 %). Der Funnel
    zeigt den **Verlauf/Drop-off**, nicht die absolute Abschlusszahl.

!!! tip "Hochrechnung auf echte Buchungen"
    Der Funnel hat einen Schalter **„Auf echte Buchungen hochgerechnet"**:
    Consent wirkt pro *Besuch* (ganz oder gar nicht getrackt) — Matomo ist also
    eine Stichprobe. Da die unterste Stufe server-seitig exakt bekannt ist,
    werden alle Stufen mit dem Faktor *Buchungen ÷ Matomo-Abschlüsse* auf
    Realniveau skaliert (unterste Stufe = exakte Buchungszahl). **Quoten bleiben
    unverändert** (Stichproben-Verhältnisse); Annahme: nicht getrackte Besucher
    verhalten sich wie getrackte. Guard: min. 10 Matomo-Abschlüsse, kein
    Quellen-Filter (Buchungen lassen sich nicht nach Matomo-Quelle filtern).
    Zusätzlich gibt es die KPI **„Matomo-Erfassungsquote"** (Abschlüsse ÷
    Buchungen) als Datenqualitäts-Kennzahl.

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
| `app/Services/MatomoVisitSyncService.php` | Mapping Besuch→DB, Funnel-Ableitung, Stitching, **Referrer-Korrekturen** (`resolveReferrer`: „direct" mit Klick-IDs/UTM in der Lande-URL → `campaign`; „direct" mit eigener Domain als Referrer = Self-Referral/Session-Fortsetzung → `unknown`) |
| `app/Console/Commands/ReclassifyMatomoReferrers.php` | `matomo:reclassify-referrers` — einmaliger Backfill beider Referrer-Korrekturen für Bestandsdaten (`--dry-run` möglich) |
| `app/Services/MatomoAnalysisService.php` | Aggregationen für den Bericht |
| `app/Models/MatomoVisit.php`, `MatomoVisitAction.php` | Eloquent-Models |
| `app/Console/Commands/SyncMatomoVisits.php` | `matomo:sync-visits` (alle 10 Min) |
| `app/Console/Commands/PruneMatomoActions.php` | `matomo:prune-actions` (täglich) |
| `app/Http/Controllers/MatomoFunnelController.php` | Bericht + JSON-Endpoints; `KPI_PORTFOLIO` liefert die Daten im Format der `components/kpi-dashboard`-Komponente (`storageKey: visitor-funnel-kpis`) |
| `resources/views/hub/reports/visitor-funnel.blade.php` | Report-Seite |
| `public/js/visitor-funnel.js` | Alpine-Komponente + **Apache ECharts** (nativer `funnel`-Typ + gruppierte Balken) |

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
(der liest Roh-Events). Korrekturen 2026-07 (alle erledigt):

- Goal 1 „Buchung gestartet“ → `event_action = Start` (2026-07-15).
- Goal 2 „Buchung abgeschlossen“ → `event_action = Buchung abgeschlossen`
  (2026-07-18; zählte vorher den Button-Klick vor Erfolgsprüfung).
- Goal 3 (Timing-Pseudo-Goal) gelöscht (2026-07-18).
- Site 1: **Excluded Referrers = `glattt.com`** gesetzt (2026-07-18) — verhindert
  Self-Referral-Klassifizierung server-seitig.

### Website-Tracker: Befund & Korrektur (behoben 2026-07-18)

Auf glattt.com existiert nur **ein** `_paq`-Tracker, der zwei Konfigurationen
durchläuft — Ursache mehrerer Datenprobleme:

1. **Vor Consent** lädt ein Inline-Snippet (im WP eingebettet, nicht Borlabs)
   einen **cookielosen** Tracker auf die Legacy-Instanz
   `matomolog.glattt.com`, **Site-ID 2**, inkl. Doppel-Events Kategorie
   „Terminbuchung“ und `trackGoal 1`.
2. **Beim Consent** injiziert Borlabs das Standard-Snippet für
   `matomo.glattt.com` Site 1 — die Befehle werden aber vom **bereits
   laufenden** matomolog-Tracker ausgeführt: derselbe Tracker wird auf Site 1
   **umgebogen** und bleibt cookielos (`disableCookies`).

Folgen: `getVisitorId()` liefert immer `''` (→ Stitching unmöglich, Plugin
0.10.0 sendete daher nie eine `matomo_visitor_id`), `visitor_type` fast immer
„new“, Session-Splits mit Self-Referrals, Site 1 sieht nur Post-Consent-Traffic.

**Korrektur (beides am 2026-07-18 umgesetzt):** (a) Das Inline-matomolog-Snippet
saß in der `header.php` des Salient-**Child-Themes** und wurde komplett entfernt
(beide `<script>`-Blöcke: Tracker + „Event-Tracking für Terminbuchung“). Das
Borlabs-Matomo-Snippet (Site 1, mit Cookies nach Consent) blieb unverändert.
(b) Plugin **0.10.1** wählt die Visitor-ID gezielt vom
`matomo.glattt.com`-Tracker und wertet `''` als „keine ID“.

**Verifiziert per Headless-Browser:** vor Consent kein Tracker mehr; nach
Consent genau ein Tracker (Site 1) mit echter Visitor-ID → Stitching
funktioniert für alle Consent-Besucher. Erwartbare Daten-Effekte ab jetzt:
`booking_trackings.matomo_visitor_id` gefüllt (Consent-Besucher),
`visitor_type` „returning“ wird aussagekräftig, deutlich weniger
Session-Splits/„Unbekannt (interner Einstieg)“, Kategorie „Terminbuchung“
läuft nicht mehr ein, matomolog (Site 2) erhält keine neuen Daten.

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
  Quellen, Zeitraum-Filter, Zeitreihe, Geräte-Vergleich, Erkenntnisse,
  Vorperioden-Fenster.
- `tests/Feature/MatomoFunnelKpiConfigTest.php` – KPI-Endpoint im
  kpi-dashboard-Format, Vorperioden-Vergleich, Permissions, neue Endpoints.

### JSON-Endpoints des Berichts

Alle unter `/hub/reports/visitor-funnel/…`, Filter `date_from`/`date_to`/
`referrer_type` wirken überall: `kpis` (alle 12 KPIs im
kpi-dashboard-Format inkl. Vorperioden-Vergleich), `funnel` (inkl.
Abandonment), `segments` + `segment-timeseries` (Funnel-Vergleich je
Standort/Quelle, Parameter `segment=standort|source`), `timeseries`
(Tageswerte aller vier Funnel-Stufen),
`devices` (Mobil/Desktop/Tablet mit Quoten), `insights`
(automatische Erkenntnisse), `sources`, `top-pages`.
