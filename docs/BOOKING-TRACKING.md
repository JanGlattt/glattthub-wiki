# 📊 Booking-Tracking

Erfassung von Browser-, Kampagnen- und Verhaltensdaten zu jeder Terminbuchung über das WordPress-Booking-Widget.

→ [API-Endpoints](REST-API-ENDPOINTS.md#post-apiv1booking-tracking) | [REST-API Übersicht](REST-API.md)

---

## Für Endanwender

### Was wird erfasst?

Bei jeder Buchung eines Beratungsgesprächs über das Booking-Widget auf glattt.com werden automatisch folgende Daten erfasst:

| Kategorie | Daten |
|-----------|-------|
| **Buchung** | Termin-ID, Standort, Service, Kunde, Buchungszeitpunkt |
| **Gerät** | Browser, Betriebssystem, Gerätetyp (Desktop/Mobil/Tablet), Bildschirmgröße |
| **Herkunft** | Referrer, Landingpage, UTM-Parameter (Source, Medium, Campaign) |
| **Werbung** | Google Click ID (gclid), Facebook Click ID (fbclid) |
| **Verhalten** | Verweildauer im Buchungsprozess, Seitenaufrufe, Cookie-Consent-Status |

### Wozu dienen die Daten?

- **Kampagnen-Auswertung**: Welche Google Ads / Meta-Kampagnen generieren die meisten Buchungen?
- **Geräte-Analyse**: Buchen Kunden eher am Desktop oder Smartphone?
- **Conversion-Optimierung**: Wie lange dauert der Buchungsprozess? Wo brechen Nutzer ab?
- **Channel-Attribution**: Über welche Kanäle (organisch, bezahlt, direkt) kommen die Buchungen?

### Datenschutz

- IP-Adressen werden nur serverseitig erfasst (nicht vom Browser gesendet)
- Cookie-Consent-Status wird dokumentiert
- Daten werden nur für interne Analysen verwendet
- Keine Weitergabe an Dritte

---

## Für Entwickler

### Architektur

```
┌──────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│  Browser (JS)    │────▶│  WordPress (PHP)  │────▶│  glatttHub API   │
│                  │     │                    │     │                  │
│ collectTracking- │     │ glattt_send_       │     │ POST /api/v1/    │
│ Data()           │     │ booking_tracking() │     │ booking-tracking │
└──────────────────┘     └───────────────────┘     └──────────────────┘
       Client                   Server                    Server
```

**Datenfluss:**

1. **Browser**: `collectTrackingData()` in `booking-frontend.js` sammelt Browser-Info, UTM-Parameter, Verweildauer
2. **WP AJAX**: Tracking-Daten werden mit dem Buchungs-Request an WordPress gesendet (`tracking_*` Prefix)
3. **WP PHP**: Nach erfolgreicher Phorest-Buchung ruft `glattt_send_booking_tracking()` die glatttHub-API auf (Server-zu-Server)
4. **glatttHub API**: `BookingTrackingController::store()` validiert und speichert die Daten

!!! info "Sicherheit"
    Der API-Token bleibt auf dem WordPress-Server — der Browser hat keinen Zugang zum Token. Die IP-Adresse wird serverseitig aus dem Request ermittelt.

### Dateien

**glatttHub (Laravel)**

| Datei | Beschreibung |
|-------|--------------|
| `database/migrations/2026_03_30_120000_create_booking_trackings_table.php` | Migration mit ~25 Spalten |
| `app/Models/BookingTracking.php` | Eloquent-Model mit Scopes und Casts |
| `app/Http/Controllers/Api/V1/BookingTrackingController.php` | `store()` und `show()` Endpoints |
| `app/Http/Resources/Api/V1/BookingTrackingResource.php` | JSON-Resource |
| `routes/api.php` | POST + GET Routen |
| `tests/Unit/Models/BookingTrackingTest.php` | Unit-Tests für Model |
| `tests/Feature/Api/V1/BookingTrackingApiTest.php` | Feature-Tests für API |

**WPglatttBooking (WordPress)**

| Datei | Beschreibung |
|-------|--------------|
| `assets/js/booking-frontend.js` | `collectTrackingData()` — Browser-Daten sammeln |
| `includes/frontend-booking.php` | `glattt_send_booking_tracking()` — Server-zu-Server API-Call |
| `includes/admin-settings.php` | WP-Admin Einstellungen für API-URL und Token |

### Datenbank-Schema

```sql
CREATE TABLE booking_trackings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    appointment_id VARCHAR(255) NOT NULL,
    branch_id VARCHAR(255) NULL,
    service_id VARCHAR(255) NULL,
    client_id VARCHAR(255) NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    browser_name VARCHAR(100) NULL,
    browser_version VARCHAR(50) NULL,
    os_name VARCHAR(100) NULL,
    os_version VARCHAR(50) NULL,
    device_type VARCHAR(20) NULL,
    screen_width INT UNSIGNED NULL,
    screen_height INT UNSIGNED NULL,
    viewport_width INT UNSIGNED NULL,
    viewport_height INT UNSIGNED NULL,
    language VARCHAR(20) NULL,
    referrer TEXT NULL,
    landing_page TEXT NULL,
    utm_source VARCHAR(255) NULL,
    utm_medium VARCHAR(255) NULL,
    utm_campaign VARCHAR(255) NULL,
    utm_content VARCHAR(255) NULL,
    utm_term VARCHAR(255) NULL,
    gclid VARCHAR(255) NULL,
    fbclid VARCHAR(255) NULL,
    booking_duration_seconds INT UNSIGNED NULL,
    page_view_count INT UNSIGNED NULL,
    cookie_consent VARCHAR(50) NULL,
    booked_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_appointment_id (appointment_id),
    INDEX idx_branch_id (branch_id),
    INDEX idx_utm_source (utm_source),
    INDEX idx_booked_at (booked_at)
);
```

### Model-Scopes

| Scope | Beschreibung |
|-------|--------------|
| `forBranch($id)` | Filter nach Standort |
| `forAppointment($appointmentId)` | Filter nach Termin-ID |
| `bySource($source)` | Filter nach UTM Source |
| `byMedium($medium)` | Filter nach UTM Medium |
| `byCampaign($campaign)` | Filter nach Kampagne |
| `withGoogleAds()` | Nur Einträge mit gclid |
| `withMeta()` | Nur Einträge mit fbclid |
| `onDevice($type)` | Filter nach Gerätetyp |
| `between($from, $to)` | Zeitraum-Filter auf `booked_at` |

### API-Scopes

| Scope | Beschreibung |
|-------|--------------|
| `booking-tracking:write` | Tracking-Daten speichern (POST) |
| `booking-tracking:read` | Tracking-Daten lesen (GET) |

### WordPress-Einstellungen

Im WordPress-Admin unter *Einstellungen → glattt Booking*:

- **glatttHub API-URL**: Base-URL der glatttHub-Instanz (z.B. `https://hub.glattt.com`)
- **glatttHub API-Token**: API-Token mit `booking-tracking:write` Scope

### Erfasste Tracking-Daten im Detail

**Browser-Info** (clientseitig via `navigator`):

- `user_agent` — vollständiger UA-String
- `language` — Browsersprache
- `screen_width/height` — physische Bildschirmauflösung
- `viewport_width/height` — sichtbarer Bereich

**UTM-Parameter** (aus URL-Query-String):

- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- `gclid` (Google Ads), `fbclid` (Meta/Facebook)

**Verhalten**:

- `booking_duration_seconds` — Verweildauer berechnet via `sessionStorage` Timestamp
- `page_view_count` — (noch nicht implementiert, Platzhalter)

**Cookie-Consent** (erkannt über):

- Borlabs Cookie (`BorlabsCookie`)
- CookieYes (`cookieyes-consent`)
- Generischer Consent-Cookie (`cookie_consent`)
