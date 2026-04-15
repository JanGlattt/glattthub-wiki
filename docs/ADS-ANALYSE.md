# Ads-Analyse

Analyse der Werbekampagnen-Performance: Google Ads & Meta Ads Buchungen, Conversions und Vergleich mit organischen Kunden.

**Zugang:** Hub → Berichte → Ads-Analyse  
**URL:** `/hub/reports/ads-analysis`  
**Berechtigung:** `view_report_ads_analysis`

---

## Für Endanwender

### Was zeigt diese Seite?

Die Ads-Analyse wertet aus, welche Werbekampagnen (Google Ads, Meta/Facebook Ads) tatsächlich zu Buchungen und Vertragsabschlüssen führen. Sie beantwortet Fragen wie:

- Wie viele Buchungen kommen über Werbeanzeigen?
- Welche Kampagnen generieren die meisten Verträge?
- Sind Ads-Kunden genauso wertvoll wie organische Kunden (KPZ, Vertragswert)?
- Über welche Quellen (Google, Meta, Direkt, Referral) kommen die Buchungen?
- Wie entwickelt sich der Ads-Anteil monatlich?

### Sektionen

#### KPI-Dashboard

Oben auf der Seite werden 9 Kennzahlen angezeigt:

| KPI | Beschreibung |
|-----|-------------|
| **Ads-Buchungen** | Gesamtanzahl der Buchungen über Werbeanzeigen |
| **Stattgefunden** | Ads-Termine, die tatsächlich stattgefunden haben (Status COMPLETED/PAID) |
| **No-Show-Rate (Ads)** | Anteil der nicht wahrgenommenen Ads-Termine (invertiert: niedrig = gut) |
| **Conversion Rate** | Verträge ÷ stattgefundene Termine (nur abgeschlossene Termine als Basis!) |
| **Ads-Verträge** | Vertragsabschlüsse von Ads-Kunden |
| **Ø KPZ pro Vertrag** | Durchschnittliche Körperzonenzahl pro Ads-Vertrag |
| **Ø Vertragswert** | Durchschnittlicher monatlicher Vertragswert bei Ads-Kunden |
| **Ads-Anteil** | Anteil der Ads-Buchungen an allen Buchungen |
| **Zukünftige Termine** | Ads-Termine, die noch in der Zukunft liegen und nicht auswertbar sind |
| **Meta Gesamtausgaben** | Gesamte Werbeausgaben über Meta Ads API (€) |
| **Kosten pro Buchung** | Meta-Ausgaben ÷ Meta-Buchungen |
| **Kosten pro Vertrag** | Meta-Ausgaben ÷ Verträge von Meta-Kunden |
| **ROAS** | Return on Ad Spend: Vertragswert ÷ Meta-Ausgaben |

Jede Kennzahl zeigt Vergleichswerte zum Vormonat und Vorjahr.

!!! info "Conversion-Rate Berechnung"
    Die Conversion-Rate basiert ausschließlich auf **stattgefundenen Terminen** (COMPLETED/PAID). Termine, die in der Zukunft liegen oder bei denen der Kunde nicht erschienen ist (No-Show), werden **nicht** als Basis herangezogen. So ergibt sich ein realistisches Bild der tatsächlichen Abschlussquote.

#### Kampagnen-Übersicht

Sortierbare Tabelle aller erkannten Werbekampagnen:

| Spalte | Beschreibung |
|--------|-------------|
| **Kampagne** | UTM-Campaign-Name (oder gclid/fbclid-Zuordnung) |
| **Plattform** | Google Ads, Meta Ads oder Sonstige |
| **Buchungen** | Anzahl Buchungen über diese Kampagne |
| **Stattgef.** | Termine, die tatsächlich stattgefunden haben (grünes Badge) |
| **No-Show** | Vergangene Termine ohne Erscheinen (rotes Badge, nur wenn > 0) |
| **Zukünftig** | Termine in der Zukunft, noch nicht bewertbar (gelbes Badge, nur wenn > 0) |
| **Verträge** | Abgeschlossene Verträge von Kunden dieser Kampagne |
| **KPZ** | Gesamte Körperzonen aus den Verträgen |
| **Conversion** | Verträge ÷ stattgefundene Termine — basiert nur auf abgeschlossenen Terminen |
| **Impressions** | Anzeigen-Einblendungen (Meta Ads API) |
| **Clicks** | Klicks auf die Anzeige (Meta Ads API) |
| **Kosten** | Gesamte Werbeausgaben für diese Kampagne in € (Meta Ads API) |
| **CPC** | Cost per Click — Durchschnittliche Kosten pro Klick |
| **CTR** | Click-Through-Rate — Clicks ÷ Impressions × 100 |
| **CPB** | Cost per Booking — Werbekosten ÷ Buchungen |
| **CPV** | Cost per Vertrag — Werbekosten ÷ abgeschlossene Verträge |
| **Aktionen** | Notizen anzeigen/erstellen, Detail-Ansicht |

Klick auf eine Kampagne öffnet die Detail-Ansicht mit Anzeigengruppen und Suchbegriffen.

#### Monatliche Entwicklung

Zeigt die Ads-Performance über die Zeit als Tabelle oder Balkendiagramm (umschaltbar):

- **Ads-Buchungen** pro Monat
- **Stattgefunden** — Tatsächlich durchgeführte Termine
- **No-Show** — Vergangene Termine ohne Erscheinen
- **Zukünftig** — Termine, die noch in der Zukunft liegen
- **Gesamt-Buchungen** pro Monat
- **Ads-Anteil** in Prozent
- **Verträge** von Ads-Kunden
- **KPZ** aus Ads-Verträgen
- **Kosten** — Meta Ads Ausgaben pro Monat (via Meta API)
- **Impressions** — Anzeigen-Einblendungen pro Monat (Meta API)
- **Clicks** — Klicks auf Anzeigen pro Monat (Meta API)

Im Diagramm wird zusätzlich eine **Meta-Ausgaben-Linie** (€) auf einer zweiten Y-Achse angezeigt, sofern Kostendaten vorhanden sind.

#### Quellen-Analyse

Donut-Diagramm + Tabelle mit der Verteilung der Buchungen nach Quelle (utm_source):

- **google** — Traffic über Google (Ads + organisch)
- **meta / facebook** — Traffic über Meta/Facebook/Instagram
- **direct** — Direkte Aufrufe ohne Referrer
- **referral** — Verweise von anderen Websites

#### Ads vs. Organisch

Side-by-Side Vergleich von Ads-Kunden und organischen Kunden:

| Metrik | Ads | Organisch |
|--------|-----|-----------|
| Buchungen | X | Y |
| Stattgefunden | X | Y |
| No-Shows | X | Y |
| No-Show-Rate | X % | Y % |
| Zukünftig | X | Y |
| Verträge | X | Y |
| Conversion | X % | Y % |
| Ø KPZ | X | Y |
| Ø Vertragswert | €X | €Y |
| Geräte-Split | Desktop/Mobile/Tablet | Desktop/Mobile/Tablet |

Bei vorhandenen Meta Ads Daten wird in der Ads-Karte zusätzlich ein **"Meta Ads Performance"**-Block angezeigt:

- **Kosten** — Gesamte Meta-Ausgaben
- **Impressions** — Anzeigen-Einblendungen
- **Clicks** — Klicks auf Anzeigen
- **Kosten / Buchung** — Meta-Ausgaben ÷ Meta-Buchungen
- **Kosten / Vertrag** — Meta-Ausgaben ÷ Verträge von Meta-Kunden

Zusätzlich wird die **Differenz** berechnet (Conversion-Diff., No-Show-Rate-Diff., KPZ-Diff., Vertragswert-Diff., Ads-Anteil).

Die Conversion-Rate basiert auf **stattgefundenen Terminen** (nicht allen Buchungen), der Hinweis "Basis: stattgefundene Termine" wird unter dem Conversion-Wert angezeigt.

#### Kampagnen-Notizen

Zu jeder Kampagne können strukturierte Notizen hinterlegt werden:

- **Plattform** (Google/Meta/Sonstige)
- **Kampagnen-ID** und **Kampagnenname**
- **Zielgruppe** und **Verantwortlicher**
- **Landing-Page URL**
- **Start-/Enddatum** und **Monatsbudget** (€)
- **Freitext-Notizen**

### Filter

| Filter | Beschreibung |
|--------|-------------|
| **Plattform** | Alle / Google Ads / Meta Ads |
| **Zeitraum** | Frei wählbar (Von/Bis) |
| **Schnellfilter** | Dieser Monat, Letzte 3 Monate, Dieses Jahr |
| **Standort** | Über den globalen Standort-Filter in der Seitenleiste |

Alle Filter wirken auf alle Sektionen gleichzeitig.

### Wie wird erkannt, ob jemand über Ads kam?

Eine Buchung gilt als **Ads-Buchung** wenn mindestens eines zutrifft:

- `gclid` vorhanden → **Google Ads**
- `fbclid` vorhanden → **Meta Ads**
- `utm_medium` = `cpc`, `paid` oder `ppc`

Alles andere gilt als **organisch**.

Die Verknüpfung zu Verträgen erfolgt über die **Client-ID**: Wenn ein Kunde, der über eine Werbeanzeige gebucht hat, später einen Vertrag abschließt, wird dieser Vertrag der Kampagne zugeordnet.

---

## Für Entwickler

### Architektur

Die Seite folgt dem bewährten Statistik-Muster: **Controller → Service → JSON-API → Alpine.js**.

```
AdsAnalysisController (app/Http/Controllers/)
├── index()              → Blade-View rendern
├── kpis()               → JSON: 8 KPI-Metriken
├── campaigns()          → JSON: Kampagnen-Übersicht
├── monthly()            → JSON: Monatliche Entwicklung
├── sources()            → JSON: Quellen-Aufschlüsselung
├── adsVsOrganic()       → JSON: Ads vs. Organisch Vergleich
├── campaignDetail()     → JSON: Kampagnen-Detail (Drill-down)
├── saveCampaignNote()   → POST: Notiz speichern
├── getCampaignNotes()   → JSON: Notizen laden
└── refresh()            → POST: Cache invalidieren

AdsAnalysisService (app/Services/)
├── getKpis()                    → KPI-Berechnung + Vergleichswerte
├── getCampaignOverview()        → Kampagnen-Tabelle
├── getMonthlyTrend()            → Monatsdaten
├── getSourceBreakdown()         → Quellen-Donut-Daten
├── getAdsVsOrganic()            → Vergleichsanalyse
├── getCampaignDetail()          → Drill-down einer Kampagne
├── getCampaignNotes()           → Notizen laden
└── flushCache()                 → Cache-Version erhöhen
```

### Relevante Dateien

| Datei | Zweck |
|-------|-------|
| `app/Http/Controllers/AdsAnalysisController.php` | Controller mit Filter-Extraktion |
| `app/Services/AdsAnalysisService.php` | Queries, Caching, Vergleichslogik |
| `app/Services/MetaAdsService.php` | Meta Ads Graph API Integration (SDK) |
| `config/meta-ads.php` | Meta Ads API Konfiguration |
| `app/Models/AdCampaignNote.php` | Model für Kampagnen-Notizen |
| `app/Models/BookingTracking.php` | Basis-Model (erweitert um Ads-Scopes) |
| `resources/views/hub/reports/ads-analysis.blade.php` | Haupt-View |
| `resources/views/hub/reports/ads-analysis/partials/header.blade.php` | Seitenkopf + Refresh |
| `resources/views/hub/reports/ads-analysis/partials/filter-bar.blade.php` | Filter (Plattform, Zeitraum, Presets) |
| `resources/views/hub/reports/ads-analysis/partials/campaign-overview.blade.php` | Kampagnen-Tabelle |
| `resources/views/hub/reports/ads-analysis/partials/monthly-trend.blade.php` | Monatschart + Tabelle |
| `resources/views/hub/reports/ads-analysis/partials/source-breakdown.blade.php` | Quellen-Donut + Tabelle |
| `resources/views/hub/reports/ads-analysis/partials/ads-vs-organic.blade.php` | Ads vs. Organisch Vergleich |
| `resources/views/hub/reports/ads-analysis/partials/campaign-notes-modal.blade.php` | Notizen-Modal (Formular + Liste) |
| `public/js/ads-analysis.js` | Alpine.js App + Chart.js Integration |
| `tests/Unit/MetaAdsServiceTest.php` | Unit-Tests für MetaAdsService |
| `tests/Feature/AdsAnalysisMetaTest.php` | Feature-Tests für Meta-Integration |
| `resources/views/hub/reports.blade.php` | Berichte-Übersicht (Report-Card) |
| `database/migrations/2026_06_26_100000_create_ad_campaign_notes_table.php` | Migration |
| `database/sql/ads-analysis-production.sql` | Produktiv-SQL |

### Datengrundlage

- **Buchungsdaten:** `booking_trackings` — UTM-Parameter, gclid, fbclid, Device-Infos
- **Vertragsdaten:** `contracts` — Verknüpfung über `client_id`
- **Termin-Status:** `stats_historic_appointments` — Verknüpfung über `appointment_id`
- **Notizen:** `ad_campaign_notes` — Strukturierte Kampagnen-Infos
- **KPZ:** `contracts.body_zone_count`
- **Vertragswert:** `contracts.monthly_amount_cents` (in Cents)

### Termin-Status-Logik

Die Zuordnung ob ein gebuchter Termin stattgefunden hat, erfolgt über die Tabelle `stats_historic_appointments`:

```
booking_trackings.appointment_id → stats_historic_appointments.appointment_id
```

| Status | Bedingung | Beschreibung |
|--------|-----------|-------------|
| **Stattgefunden** | `state IN ('COMPLETED', 'PAID')` | Termin wurde durchgeführt |
| **No-Show** | `state IN ('BOOKED', 'CONFIRMED', 'CHECKED_IN', 'NO_SHOW') AND appointment_date < heute` | Vergangener Termin ohne Abschluss |
| **Zukünftig** | `appointment_date >= heute AND state NOT IN ('CANCELLED')` | Noch nicht auswertbar |
| **Abgesagt** | `state = 'CANCELLED'` | Termin wurde storniert |

**Service-Methode:** `AdsAnalysisService::getAppointmentStatusBreakdown($query)` — nimmt einen `BookingTracking`-Query, holt die `appointment_id`s und berechnet den Status-Breakdown per SQL CASE-Aggregation.

**Conversion-Rate-Formel:**
```
Conversion Rate = Verträge ÷ stattgefundene Termine × 100
No-Show-Rate = No-Shows ÷ (stattgefundene + No-Shows) × 100
```

Termine, die in der Zukunft liegen, werden weder für die Conversion noch für die No-Show-Rate herangezogen.

### Ads-Erkennung (Scopes auf BookingTracking)

```php
// Google Ads
scopeWithGoogleAds($q) → $q->whereNotNull('gclid')

// Meta Ads  
scopeWithMeta($q) → $q->whereNotNull('fbclid')

// Alle Ads (Composite)
scopeWithAds($q) → gclid OR fbclid OR utm_medium IN ('cpc','paid','ppc')

// Organisch (Inverse)
scopeOrganic($q) → NOT (gclid OR fbclid OR utm_medium IN ('cpc','paid','ppc'))
```

### Caching

- **TTL:** 3600 Sekunden (1 Stunde)
- **Prefix:** `ads-analysis`
- **Versionierung:** `ads-analysis:v{N}:{method}:{filter_hash}`
- **Invalidierung:** Manuell über Refresh-Button → `flushCache()` erhöht Version

### Routes

```
GET  /hub/reports/ads-analysis                        → index
GET  /hub/reports/ads-analysis/kpis                   → kpis
GET  /hub/reports/ads-analysis/campaigns              → campaigns
GET  /hub/reports/ads-analysis/monthly                → monthly
GET  /hub/reports/ads-analysis/sources                → sources
GET  /hub/reports/ads-analysis/ads-vs-organic         → adsVsOrganic
GET  /hub/reports/ads-analysis/campaign/{campaign}    → campaignDetail
POST /hub/reports/ads-analysis/campaign-notes          → saveCampaignNote
GET  /hub/reports/ads-analysis/campaign-notes          → getCampaignNotes
POST /hub/reports/ads-analysis/refresh                 → refresh
```

Alle Routes sind in einer Middleware-Gruppe: `can:view_report_ads_analysis`.

### Permission

- **Permission-Name:** `view_report_ads_analysis`
- **Beschreibung:** `Bericht: Ads-Analyse`
- **Standard-Zuweisung:** `super_admin`, `admin`

### Datenbank-Schema: `ad_campaign_notes`

```sql
CREATE TABLE ad_campaign_notes (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    platform        VARCHAR(20) NOT NULL,          -- google, meta, other
    campaign_identifier VARCHAR(255) NOT NULL,      -- utm_campaign oder API-ID
    campaign_name   VARCHAR(255) NOT NULL,
    target_audience VARCHAR(255) NULL,
    responsible     VARCHAR(255) NULL,
    landing_page_url VARCHAR(255) NULL,
    start_date      DATE NULL,
    end_date        DATE NULL,
    budget_monthly_cents INT UNSIGNED NULL,
    notes           TEXT NULL,
    user_id         BIGINT UNSIGNED NULL,           -- FK → users
    created_at      TIMESTAMP NULL,
    updated_at      TIMESTAMP NULL,
    INDEX (platform, campaign_identifier)
);
```

---

## Phase 2: Meta Ads API-Anbindung (✅ implementiert)

Die Meta Ads API ist vollständig integriert. Kampagnen-Performance-Daten (Impressions, Clicks, Kosten, CTR, CPC) werden live über die Meta Graph API abgerufen und mit den internen Buchungs- und Vertragsdaten kombiniert.

### Architektur

| Komponente | Status |
|-----------|--------|
| `config/meta-ads.php` | ✅ Konfiguration mit App ID, Secret, Token, Account ID |
| `app/Services/MetaAdsService.php` | ✅ SDK-Integration (facebook/php-business-sdk v25) |
| AdsAnalysisService-Integration | ✅ Kampagnen-Matching über campaign_id ↔ utm_campaign |
| Frontend (Blade + JS) | ✅ Alle Views um Meta-Spalten erweitert |
| Tests | ✅ 17 Unit-Tests + 7 Feature-Tests |

### .env Einträge (Meta Ads)

```env
META_ADS_APP_ID=         # Facebook App ID (developers.facebook.com)
META_ADS_APP_SECRET=     # App-Geheimnis (Hex-String)
META_ADS_ACCESS_TOKEN=   # Long-lived Access Token (beginnt mit EAA...)
META_ADS_ACCOUNT_ID=     # Ad Account ID (nur Ziffern, ohne act_ Prefix)
```

### MetaAdsService

**Datei:** `app/Services/MetaAdsService.php`

| Methode | Beschreibung |
|---------|-------------|
| `isConfigured()` | Prüft ob alle 4 Credentials gesetzt sind |
| `getCampaignInsights(from, to)` | Campaign-Level Insights (gecacht, 1h TTL) |
| `getAdSetInsights(campaignId, from, to)` | Ad-Set-Level für Drill-Down |
| `getDailyInsights(from, to)` | Tagesgranulare Daten für Monatsaggregation |
| `getTotalSpend(from, to)` | Gesamtausgaben in Cents |
| `flushCache()` | Cache invalidieren (Versions-basiert) |

**Caching:** Versionierte Keys `meta-ads:v{N}:{method}:{dateRange}`, 1h TTL. Refresh-Button erhöht Version.

**Matching-Logik:** Meta API `campaign_id` ↔ `booking_trackings.utm_campaign` (Meta setzt die Campaign-ID als UTM-Parameter, nicht den Namen).

**Kampagnennamen:** In der Tabelle wird der Meta-Kampagnenname angezeigt (statt der numerischen ID), mit Fallback auf den utm_campaign-Wert.

**Geldbeträge:** Meta API liefert Euro als String ("12.34") → `euroToCents()` konvertiert zu Integer (1234).

### Berechnete Kennzahlen

| Kennzahl | Formel | Ort |
|----------|--------|-----|
| **CPB** (Cost per Booking) | Meta-Spend ÷ Buchungen der Kampagne | Kampagnen-Tabelle |
| **CPV** (Cost per Vertrag) | Meta-Spend ÷ Verträge der Kampagne | Kampagnen-Tabelle |
| **Kosten / Buchung** | Meta-Gesamt-Spend ÷ alle Meta-Buchungen | Ads vs. Organisch |
| **Kosten / Vertrag** | Meta-Gesamt-Spend ÷ alle Meta-Verträge | Ads vs. Organisch |
| **ROAS** | (Verträge × Ø Vertragswert) ÷ Meta-Spend | KPI-Dashboard |

### Tests

| Datei | Tests | Beschreibung |
|-------|-------|--------------|
| `tests/Unit/MetaAdsServiceTest.php` | 17 | Konstanten, euroToCents, extractConversions, normalizeCampaignRow, normalizeAdSetRow, unconfigured fallbacks |
| `tests/Feature/AdsAnalysisMetaTest.php` | 7+1 | API-Endpoints mit gemocktem MetaAdsService, Kampagnen-Matching, CPB-Berechnung, Permission-Check |

---

## Phase 3: Google Ads API-Anbindung (ausstehend)

Folgt dem gleichen Pattern wie Meta Ads. Noch **nicht implementiert**.

### Benötigt

| Komponente | Was wird benötigt? |
|-----------|-------------------|
| Composer-Paket | `googleads/google-ads-php` |
| Config-Datei | `config/google-ads.php` |
| Service | `app/Services/GoogleAdsService.php` |
| .env | 5 neue Einträge (Developer Token, Client ID/Secret, Refresh Token, Customer ID) |

### Schritt 1: API-Credentials einrichten

1. **Google Cloud Console** (console.cloud.google.com):
   - Neues Projekt erstellen (oder bestehendes verwenden)
   - **"Google Ads API"** aktivieren
   - OAuth 2.0 Client-ID erstellen (Typ: Web Application)
   - → `GOOGLE_ADS_CLIENT_ID` + `GOOGLE_ADS_CLIENT_SECRET`

2. **Google Ads API Center** (ads.google.com → Tools → API Center):
   - Developer Token beantragen (Basic Access reicht)
   - → `GOOGLE_ADS_DEVELOPER_TOKEN`

3. **Customer-ID** (oben rechts in Google Ads, Format: XXX-XXX-XXXX):
   - Ohne Bindestriche in `.env` speichern
   - → `GOOGLE_ADS_CUSTOMER_ID`

4. **Refresh Token** via OAuth2-Flow generieren:
   - Das PHP-Paket `googleads/google-ads-php` hat ein CLI-Tool: `GenerateUserCredentials`
   - → `GOOGLE_ADS_REFRESH_TOKEN`

### .env Einträge

```env
# Google Ads
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_REFRESH_TOKEN=
GOOGLE_ADS_CUSTOMER_ID=
```

### Implementierungs-Schritte

- [ ] `composer require googleads/google-ads-php`
- [ ] `config/google-ads.php` erstellen
- [ ] `GoogleAdsService.php` erstellen (GAQL-Queries für Campaign + AdGroup Level)
- [ ] In `AdsAnalysisService` integrieren (gleiche Matching-Logik wie Meta)
- [ ] Frontend: Google-Kampagnen ebenfalls mit Kosten-Spalten versehen
- [ ] Tests schreiben

---

## Produktiv-Deployment

### Phase 1 (aktuell)

SQL-Datei: `database/sql/ads-analysis-production.sql`

```sql
-- 1. Tabelle erstellen
CREATE TABLE ad_campaign_notes (...);

-- 2. Permission erstellen
INSERT INTO permissions (name, guard_name, ...) VALUES ('view_report_ads_analysis', 'web', ...);

-- 3. Permission den Rollen zuweisen
INSERT IGNORE INTO role_has_permissions (permission_id, role_id) SELECT ...;
```

### Phase 2 (Meta Ads API)

Keine DB-Migration nötig (Live-Fetch + Cache, keine eigene Tabelle).

```bash
# Bereits installiert:
composer require facebook/php-business-sdk

# .env-Werte auf dem Server eintragen:
META_ADS_APP_ID=...
META_ADS_APP_SECRET=...
META_ADS_ACCESS_TOKEN=...
META_ADS_ACCOUNT_ID=...

# Config-Cache aktualisieren:
php artisan config:cache
```

### Phase 3 (Google Ads API)

```bash
composer require googleads/google-ads-php
# .env-Werte + Config + Service erstellen (siehe oben)
```
