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
| `app/Http/Controllers/ApiClientController.php` | CRUD-Controller für API-Schlüssel-Verwaltung |
| `app/Http/Resources/Api/V1/ClientStatisticResource.php` | JSON-Resource für Antwort-Struktur |
| `resources/views/hub/settings/api.blade.php` | Verwaltungs-UI für API-Zugänge |
| `routes/api.php` | API-Routen (`/api/v1/`) |
| `database/migrations/2026_03_30_100000_create_api_clients_table.php` | Datenbank-Migration |
| `tests/Unit/Models/ApiClientTest.php` | Unit-Tests für ApiClient-Model |
| `tests/Feature/Api/ApiAuthenticationTest.php` | Feature-Tests für Authentifizierung |
| `tests/Feature/Api/V1/ClientStatisticsApiTest.php` | Feature-Tests für Endpoints |

## 🔐 Authentifizierung

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

## 📡 Endpoints

### Base-URL

```
https://deine-domain.de/api/v1/
```

### Verfügbare Scopes

| Scope | Beschreibung |
|-------|--------------|
| `client-statistics:read` | Kundenstatistiken lesen |
| `client-statistics:write` | Kundenstatistiken bearbeiten (Phase 2) |

### GET /api/v1/client-statistics

Listet Kundenstatistiken mit Pagination und Filtern.

**Scope:** `client-statistics:read`

**Query-Parameter:**

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `per_page` | int (1-100) | Einträge pro Seite (Standard: 25) |
| `page` | int | Seitennummer |
| `sort_by` | string | Sortier-Spalte (Standard: `id`) |
| `sort_direction` | string | `asc` oder `desc` (Standard: `asc`) |
| `branch_id` | string | Filter nach Standort-ID |
| `gender` | string | `male`, `female`, `other` |
| `age_group` | string | z.B. `26-35`, `36-45` |
| `has_contract` | bool | Hat Vertrag (1/0) |
| `has_consultation` | bool | Hat Beratung (1/0) |
| `has_cancellation` | bool | Hat Stornierung (1/0) |
| `only_consultation_no_return` | bool | Nur Beratung ohne Rückkehr (1/0) |
| `min_distance` | float | Minimale Entfernung in km |
| `max_distance` | float | Maximale Entfernung in km |
| `date_from` | string (Y-m-d) | Erster Termin ab Datum |
| `date_to` | string (Y-m-d) | Erster Termin bis Datum |
| `postal_code` | string | Filter nach PLZ |

**Beispiel:**

```bash
curl -H "Authorization: Bearer glh_TOKEN" \
     "https://domain.de/api/v1/client-statistics?branch_id=xyz&has_contract=1&per_page=10"
```

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "branch_id": "urLYs9iAs3RUBrYaDZY9ew",
      "full_name": "Max Mustermann",
      "first_name": "Max",
      "last_name": "Mustermann",
      "gender": "male",
      "name_origin": "german",
      "birth_date": "1990-05-15",
      "age": 35,
      "age_group": "26-35",
      "postal_code": "33619",
      "city": "Bielefeld",
      "distance_to_branch_km": 2.5,
      "distance_group": "0-5 km",
      "first_appointment_date": "2024-01-15",
      "last_appointment_date": "2026-03-01",
      "total_appointments": 12,
      "has_consultation": true,
      "first_consultation_date": "2024-01-15",
      "consultation_branch_id": "urLYs9iAs3RUBrYaDZY9ew",
      "has_followup_after_consultation": true,
      "has_contract": true,
      "contract_count": 2,
      "contract_body_zone_count": 6,
      "is_full_body": false,
      "has_cancellation": false,
      "only_consultation_no_return": false,
      "client_since": "2024-01-10",
      "created_at": "2026-03-27T11:39:03+01:00",
      "updated_at": "2026-03-27T20:08:37+01:00"
    }
  ],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": { "current_page": 1, "last_page": 763, "per_page": 10, "total": 7629 }
}
```

### GET /api/v1/client-statistics/{id}

Einzelnen Kundenstatistik-Datensatz abrufen.

**Scope:** `client-statistics:read`

```bash
curl -H "Authorization: Bearer glh_TOKEN" \
     "https://domain.de/api/v1/client-statistics/42"
```

**Response:** Gleiche Struktur wie einzelnes Objekt in `data` (ohne Pagination).

### GET /api/v1/client-statistics/kpis

Aggregierte KPIs über alle Kundenstatistiken (nutzt `ClientStatisticsService`).

**Scope:** `client-statistics:read`

**Query-Parameter:** Gleiche Filter wie beim Index-Endpoint.

```bash
curl -H "Authorization: Bearer glh_TOKEN" \
     "https://domain.de/api/v1/client-statistics/kpis?branch_id=xyz"
```

**Response:**

```json
{
  "data": [
    { "id": "total_clients", "label": "Kunden gesamt", "value": 7629, "format": "number" },
    { "id": "avg_age", "label": "Ø Alter", "value": 33.2, "format": "number" },
    { "id": "consultation_rate", "label": "Beratungsquote", "value": 68.5, "format": "percent" }
  ]
}
```

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
