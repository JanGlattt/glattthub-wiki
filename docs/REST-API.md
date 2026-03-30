# 🔌 REST-API

Dokumentation der glatttHub REST-API für externen und internen Datenzugriff.

## 📋 Übersicht

Die REST-API ermöglicht authentifizierten Zugriff auf glatttHub-Daten über HTTP-Endpoints. Die API basiert auf **Service-Account-Tokens** (kein OAuth, kein Sanctum) und ist für maschinelle Kommunikation optimiert.

### Für Endanwender

- **API-Zugänge verwalten**: Unter *Einstellungen → API-Zugänge* können berechtigte Benutzer API-Schlüssel erstellen und verwalten
- **Sicherheit**: Jeder API-Schlüssel wird nur **einmal** angezeigt — beim Erstellen. Danach ist er nicht mehr einsehbar
- **Scopes**: Jeder Schlüssel hat definierte Berechtigungen (z.B. nur Kundenstatistiken lesen)
- **Überwachung**: Letzte Nutzung, IP-Adresse und Anzahl der Anfragen werden pro Schlüssel protokolliert
- **Deaktivieren**: Schlüssel können jederzeit deaktiviert oder widerrufen werden

### Für Entwickler

**Technologie-Stack:**

- Eigenes Token-Auth-System (SHA-256 gehashte Tokens mit `glh_`-Prefix)
- Rate Limiting: 60 Requests/Minute pro API-Client
- JSON-only Responses
- Versioniertes API-Design (`/api/v1/`)
- Cloud Run kompatibel (Database-Cache für Rate Limiting)

## 🔧 Konfiguration

### Keine zusätzliche Konfiguration nötig

Die API nutzt die bestehende Datenbankverbindung und benötigt keine externen Services oder `.env`-Variablen. Rate Limiting wird über den `database`-Cache-Driver gesteuert (Cloud Run kompatibel).

## 📁 Dateien

| Datei | Beschreibung |
|-------|--------------|
| `app/Models/ApiClient.php` | Eloquent-Model für API-Clients mit Token-Management |
| `app/Http/Middleware/AuthenticateApiClient.php` | Bearer-Token-Authentifizierung |
| `app/Http/Middleware/CheckApiScope.php` | Scope-basierte Autorisierung |
| `app/Http/Middleware/ForceJsonResponse.php` | Erzwingt JSON-Responses und Cache-Header |
| `app/Http/Controllers/Api/V1/ClientStatisticsController.php` | API-Endpoints für Kundenstatistiken |
| `app/Http/Controllers/Api/V1/BookingTrackingController.php` | API-Endpoints für Booking-Tracking |
| `app/Http/Controllers/ApiClientController.php` | CRUD-Controller für API-Schlüssel-Verwaltung |
| `app/Http/Resources/Api/V1/ClientStatisticResource.php` | JSON-Resource für Kundenstatistiken |
| `app/Http/Resources/Api/V1/BookingTrackingResource.php` | JSON-Resource für Booking-Tracking |
| `app/Models/BookingTracking.php` | Eloquent-Model für Booking-Tracking-Daten |
| `resources/views/hub/settings/api.blade.php` | Verwaltungs-UI für API-Zugänge |
| `routes/api.php` | API-Routen (`/api/v1/`) |
| `database/migrations/2026_03_30_100000_create_api_clients_table.php` | Datenbank-Migration |
| `tests/Unit/Models/ApiClientTest.php` | Unit-Tests für ApiClient-Model |
| `tests/Feature/Api/ApiAuthenticationTest.php` | Feature-Tests für Authentifizierung |
| `tests/Feature/Api/V1/ClientStatisticsApiTest.php` | Feature-Tests für Endpoints |

## 🔐 Authentifizierung

### Cloud-Infrastruktur (IAP-Bypass)

In Staging und Produktion schützt Google **Identity-Aware Proxy (IAP)** die Web-App mit einer Google-Anmeldung. Für die REST-API ist IAP **deaktiviert** — API-Requests unter `/api/*` werden über separate Backend-Services ohne IAP geroutet.

Die API nutzt stattdessen eigene Bearer-Token-Authentifizierung (siehe unten). Details zur Infrastruktur: [Cloud-Infrastruktur → API-Pfade vom IAP ausschließen](CLOUD-INFRASTRUKTUR.md#api-pfade-vom-iap-ausschlieen).

### Token-Format

Tokens haben das Format `glh_` + 40 Hex-Zeichen (insgesamt 44 Zeichen):

```
glh_63e97d87c56a47d2ac615e9af9d190864274d0a3
```

- **Prefix**: `glh_` (glatttHub) — dient der Erkennung in Logs und Code-Scannern
- **Speicherung**: Nur der **SHA-256-Hash** wird in der Datenbank gespeichert
- **Anzeige**: Klartext-Token wird nur einmal bei Erstellung angezeigt
- **Prefix-Spalte**: Die ersten 8 Zeichen (`glh_63e9`) werden für die Identifikation in der UI gespeichert

### Verwendung

```bash
curl -H "Authorization: Bearer glh_DEIN_TOKEN_HIER" \
     https://deine-domain.de/api/v1/client-statistics
```

### Authentifizierungs-Ablauf

1. Client sendet Request mit `Authorization: Bearer glh_...` Header
2. Middleware extrahiert Token, prüft `glh_`-Prefix
3. SHA-256-Hash wird berechnet und in `api_clients`-Tabelle gesucht
4. Client muss `is_active = true` und nicht soft-deleted sein
5. Nutzungsdaten werden aktualisiert (Zeitstempel, IP, Zähler)
6. Bei Fehler: `401 Unauthorized` mit deutschem Fehlertext

### Fehler-Responses

```json
// Kein Token
{ "error": "Unauthenticated", "message": "API-Token fehlt. Bitte Authorization: Bearer <token> Header senden." }

// Ungültiger Token
{ "error": "Unauthenticated", "message": "Ungültiger oder deaktivierter API-Token." }

// Fehlender Scope
{ "error": "Forbidden", "message": "Fehlende Berechtigung: client-statistics:read" }

// Rate Limit überschritten → Standard 429 Too Many Requests
```

## 📡 Endpoint-Referenz

→ **[Alle Endpoints mit Parametern, Beispielen und Responses](REST-API-ENDPOINTS.md)**

### Schnellübersicht

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| <span class="method-badge get">GET</span> | `/api/v1/client-statistics` | Kundenstatistiken auflisten (paginiert, filterbar) |
| <span class="method-badge get">GET</span> | `/api/v1/client-statistics/kpis` | Aggregierte KPIs abrufen |
| <span class="method-badge get">GET</span> | `/api/v1/client-statistics/{id}` | Einzelnen Datensatz abrufen |
| <span class="method-badge post">POST</span> | `/api/v1/booking-tracking` | Tracking-Daten zu einer Buchung speichern |
| <span class="method-badge get">GET</span> | `/api/v1/booking-tracking/{appointmentId}` | Tracking-Daten zu einer Buchung abrufen |

### Base-URLs

| Umgebung | URL |
|----------|-----|
| **Produktion** | `https://hub.glattt.com/api/v1/` |
| **Staging** | `https://staging.hub.glattt.com/api/v1/` |
| **Lokal** | `http://glattthub.local:8888/api/v1/` |

## 🧪 Live-Tester

→ **[API direkt im Browser testen (Swagger UI)](REST-API-TESTER.md)**

Interaktive Oberfläche mit Server-Auswahl (Staging / Produktion / Lokal), Authentifizierung und "Try it out"-Funktion.

## 🛠️ API-Verwaltung (UI)

### Zugriff

*Hub → Einstellungen → API-Zugänge*

Berechtigung: `manage_api_clients` (standardmäßig für Admins)

### Funktionen

- **Neuen API-Zugang erstellen**: Name, Beschreibung, Scopes auswählen → Token wird einmalig angezeigt
- **Übersicht**: Alle API-Zugänge mit Status, Ersteller, letzte Nutzung, Anfrage-Anzahl
- **Bearbeiten**: Name, Beschreibung, Scopes ändern, Zugang aktivieren/deaktivieren
- **Widerrufen**: Zugang permanent deaktivieren (Soft-Delete)

## 🏗️ Architektur

### Middleware-Stack

Jeder API-Request durchläuft diese Middleware-Kette:

```
ForceJsonResponse → AuthenticateApiClient → ThrottleRequests → CheckApiScope → Controller
```

1. **ForceJsonResponse**: Setzt `Accept: application/json` und `Cache-Control: no-store`
2. **AuthenticateApiClient**: Validiert Bearer-Token, setzt `api_client` Attribut auf Request
3. **ThrottleRequests**: Rate Limiting (60/min) per API-Client-ID
4. **CheckApiScope**: Prüft ob der Client den erforderlichen Scope besitzt

### Datenbank-Schema

```sql
CREATE TABLE api_clients (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    token_prefix VARCHAR(8) NOT NULL,        -- Erste 8 Zeichen für UI-Anzeige
    token_hash VARCHAR(64) NOT NULL UNIQUE,  -- SHA-256 Hash
    scopes JSON NOT NULL,                    -- ["client-statistics:read"]
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT UNSIGNED NOT NULL,     -- FK → users
    last_used_at TIMESTAMP NULL,
    last_used_ip VARCHAR(45) NULL,
    request_count INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL                -- Soft-Delete
);
```

### Neuen Endpoint hinzufügen

1. **Scope definieren** in `ApiClient::availableScopes()`:
   ```php
   'neue-resource:read' => 'Beschreibung auf Deutsch',
   ```

2. **Controller erstellen** unter `app/Http/Controllers/Api/V1/`:
   ```php
   class NeueResourceController extends Controller
   {
       public function index(Request $request) { ... }
   }
   ```

3. **Resource erstellen** unter `app/Http/Resources/Api/V1/`:
   ```php
   class NeueResourceResource extends JsonResource
   {
       public function toArray(Request $request): array { ... }
   }
   ```

4. **Route registrieren** in `routes/api.php`:
   ```php
   Route::get('neue-resource', [NeueResourceController::class, 'index'])
       ->middleware('check.api.scope:neue-resource:read');
   ```

5. **Tests schreiben** unter `tests/Feature/Api/V1/`

6. **Scope-Validierung** in `ApiClientController::store()` und `update()` aktualisieren (Whitelist in Validation-Rules)

## 🧪 Tests

### Unit-Tests

```bash
php artisan test tests/Unit/Models/ApiClientTest.php
```

10 Tests decken ab:
- Token-Generierung (Format, Eindeutigkeit)
- Token-Hashing (SHA-256)
- Prefix-Extraktion
- Scope-Prüfung (Match, No-Match, Wildcard, Leer, Null)
- Verfügbare Scopes

### Feature-Tests

```bash
php artisan test tests/Feature/Api/
```

!!! warning "Hinweis"
    Feature-Tests benötigen **MySQL** (nicht SQLite) wegen einer bestehenden Migration mit MySQL-spezifischer Syntax.

22 Tests decken ab:
- Authentifizierung (alle Fehler-Szenarien)
- Scope-Prüfung
- Usage-Tracking
- CRUD-Endpoints (Pagination, Filter, Sortierung, 404)
- KPI-Endpoint
- Response-Header (Cache-Control, JSON)

## 🔒 Sicherheitsaspekte

- **Token-Hashing**: Tokens werden mit SHA-256 gehasht — bei DB-Leak sind keine Klartext-Tokens sichtbar
- **Einmalige Anzeige**: Klartext-Token wird nur bei Erstellung gezeigt
- **Rate Limiting**: 60 Requests/Minute pro API-Client
- **Keine sensiblen Daten**: GPS-Koordinaten (Latitude/Longitude) werden nicht in der API exponiert
- **Scope-basiert**: Jeder Endpoint erfordert einen spezifischen Scope
- **Soft-Deletes**: Widerrufene Tokens werden nicht gelöscht (Audit-Trail)
- **Cache-Control**: `no-store` Header verhindert Caching von API-Responses
- **Force JSON**: Alle Responses sind JSON — keine HTML-Redirects bei Fehlern
