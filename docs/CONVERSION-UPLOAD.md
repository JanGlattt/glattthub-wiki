# Conversion-Upload (Google Ads & Meta)

Serverseitige Übermittlung der Verkaufsstrecke an die Werbeplattformen, damit
deren Algorithmen auf **tatsächliche Vertragsabschlüsse und deren Wert**
optimieren statt auf bloße Buchungsmenge.

## Für Endanwender

### Was wird übermittelt?

Drei Ereignisse entlang der Verkaufsstrecke — ausschließlich für Kunden, die
beim Buchen über das Cookie-Banner in den jeweiligen Dienst eingewilligt haben.
Bei **Google** genügt seit 20.08.2026 die Einwilligung (Klick-ID optional —
Google matcht sonst über die gehashten Kundendaten, „Enhanced Conversions for
Leads"); bei **Meta** muss zusätzlich eine Klick-/Browser-Kennung (fbclid/fbp)
vorhanden sein:

| Ereignis | Wert | Google-Aktion | Meta-Event |
|---|---|---|---|
| BG gebucht | ohne | „BG gebucht" | Schedule |
| BG wahrgenommen (kein No-Show) | ohne | „BG wahrgenommen" | AppointmentAttended |
| Vertrag abgeschlossen | **Bruttovertragswert** | „Vertrag abgeschlossen" | Purchase |

Widerrufe/Stornierungen werden bewusst **nicht** zurückgemeldet. Kontaktdaten
(E-Mail, Telefon, Name, PLZ, Ort) gehen ausschließlich SHA-256-gehasht raus;
Klick-Kennungen (gclid/fbc/fbp) unverändert, wie von den Plattformen verlangt.

### Protokoll-Seite

**Hub → Berichte → Conversion-Upload** (`/hub/reports/conversion-uploads`,
Recht `view_report_ads_analysis`, über die globale Suche auffindbar):
Zusammenfassung (gesendet/wartend/fehlgeschlagen, übermittelter Vertragswert)
plus Protokoll-Tabelle mit Filter-Pills. Fehlgeschlagene Zeilen haben einen
„Erneut versuchen"-Button; automatisch wird ohnehin bis zu 5-mal wiederholt.

### Zeitfenster (wichtig!)

- **Google:** importiert nichts später als **63 Tage nach dem Anzeigenklick**
- **Meta:** akzeptiert nur Ereignisse der letzten **7 Tage**

Deshalb läuft die Pipeline **alle 15 Minuten** — Sammelversand wäre Datenverlust.
Zeilen außerhalb des Fensters werden als fehlgeschlagen markiert (Grund im Protokoll).

### Kontrolle nach dem Start

- **Meta:** Events Manager → Übersicht — Events mit Integration „Conversions API"
  und Event-Match-Quality-Bewertung (Ziel: > 6/10)
- **Google:** Ziele → Conversions → Diagnose der drei Upload-Aktionen

## Für Entwickler

### Ablauf

```
booking_trackings (Consent-Gate)                contracts (signed_at, Wert)
        │                                              │
        ▼                                              ▼
conversions:detect (alle 15 Min) ──► conversion_uploads (pending, 1 Zeile je Plattform+Ereignis)
                                            │
                                            ▼
                        conversions:send (Minute 5/20/35/50)
                            ├─► GoogleConversionSender → Data Manager API events:ingest
                            └─► MetaConversionSender   → Graph API /{pixel}/events
```

- **Consent-Gate im Detector** (`ConversionEventDetector`): Zeilen entstehen nur
  bei `consent_google_ads`/`consent_meta_pixel === true`; Meta zusätzlich nur
  mit Klick-/Browser-ID (fbclid/fbp), Google auch ohne Klick-ID — der Sender
  schickt dann ein Event nur mit gehashten Kundendaten (Googles Empfehlung;
  behebt den Kontohinweis „Importing limited user-provided data"). Fehlen
  Klick-ID UND Kundendaten, schlägt die Zeile im Sender fehl. Alt-Daten ohne
  Consent-Erfassung (vor 15.08.2026) werden nie übermittelt.
- **„BG wahrgenommen"** kommt per Polling aus `stats_historic_appointments`
  (state COMPLETED/PAID) — es gibt kein Event beim Statuswechsel.
- **Vertrag → Klick** wird über die Phorest-Client-ID aufgelöst (jüngstes
  Consent-Tracking des Kunden; bei Google gewinnt ein Tracking **mit**
  Klick-ID gegen ein neueres ohne).
- **Deduplizierung:** Unique (platform, event_id); event_id = `bg-<appointment>`,
  `bgw-<appointment>`, `vertrag-<contract>` — bei Google zugleich transactionId,
  bei Meta event_id (dedupliziert auch gegen Pixel-Events).
- **Retry:** Fehlgeschlagene Chargen bleiben bis 5 Versuche pending;
  danach failed (im UI manuell reaktivierbar).

### Google: Data Manager API (nicht Google Ads API!)

`UploadClickConversion` ist seit 15.06.2026 für Neuanbindungen gesperrt.
Der Upload läuft über `POST datamanager.googleapis.com/v1/events:ingest`:
**reines OAuth** (Scope `https://www.googleapis.com/auth/datamanager`,
KEIN developer-token), MCC-Kontext als `loginAccount` im Body, je
Conversion-Action eine Destination (`productDestinationId`), `encoding: HEX`,
Gmail-Regel bei E-Mail-Hashes (Punkte/+Suffix nur bei gmail.com entfernen —
Meta bekommt die unveränderte Adresse). Conversion-Actions (Konto 867-636-5531,
per API angelegt): BG gebucht 7722111532 · BG wahrgenommen 7722111535 ·
Vertrag abgeschlossen 7722111538 (PURCHASE, primär; BG-Stufen sekundär).

### Testbetrieb

- `php artisan conversions:send --validate` — Google validateOnly, keine
  Statusänderungen, nichts wird geschrieben
- `META_CAPI_TEST_EVENT_CODE=<code>` (Env) — Meta-Events laufen ins
  Test-Events-Werkzeug statt in die Statistiken. Achtung: Der Feed dort zeigt
  Server-/Offline-Events unzuverlässig an — maßgeblich ist die API-Antwort
  (`events_received`) bzw. die Übersicht nach ~30 Min.

### Dateien

| Baustein | Pfad |
|---|---|
| Erkennung | `app/Services/Conversions/ConversionEventDetector.php` |
| Google-Sender | `app/Services/Conversions/GoogleConversionSender.php` |
| Meta-Sender | `app/Services/Conversions/MetaConversionSender.php` |
| Kundendaten/Hashing | `app/Services/Conversions/ConversionUserData.php` |
| Protokoll-Model | `app/Models/ConversionUpload.php` |
| Protokoll-UI | `ConversionUploadController` + `resources/views/hub/conversion-uploads.blade.php` |
| Commands | `conversions:detect`, `conversions:send`, `conversions:google-auth` |
| Cron | `/api/cron/process-conversions` (Cloud Scheduler alle 15 Min) |
| Config | `config/google-ads.php` (datamanager_*, conversion_actions), `config/meta-ads.php` (capi) |

### Env-Variablen

- `GOOGLE_ADS_REFRESH_TOKEN` — muss den datamanager-Scope tragen
  (einmalig via `conversions:google-auth` erneuert, 15.08.2026 erledigt)
- `GOOGLE_DATAMANAGER_ENABLED=true` — Freischalter des Google-Versands
- `META_CAPI_ACCESS_TOKEN` — Zugriffsschlüssel aus dem Events Manager
- `META_CAPI_PIXEL_ID` (Default 664519646083765), `META_CAPI_TEST_EVENT_CODE`

Staging hat bewusst **keine** Sende-Credentials — dort füllt sich nur das
Protokoll, gesendet wird ausschließlich von Prod.

Siehe auch: `BOOKING-TRACKING.md` (Consent-Erfassung), `ADS-ANALYSE.md`,
`DATENSCHUTZ` -Abschnitt „Serverseitiges Conversion-Tracking" auf glattt.com.
