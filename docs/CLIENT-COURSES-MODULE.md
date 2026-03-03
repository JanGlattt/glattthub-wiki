# Client Courses (glattt-Pakete) Modul

## Übersicht

Dieses Modul stellt Phorest "Client Courses" (glattt-Pakete) auf der Kunden-Detailseite dar. Die Daten werden **direkt von der Phorest API** geladen und nach `client_id` gefiltert.

Zusätzlich existiert ein **nächtlicher Sync** in eine lokale Datenbank-Tabelle (`stats_client_courses`) für Statistiken und Reports.

## Phorest API Endpoint

```
GET /business/{businessId}/clientcourse
```

> **Offizielle Dokumentation:** https://developer.phorest.com/reference/getclientcourses

### Query-Parameter

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `client_id` | string | **Filter nach Client ID** (snake_case!) |
| `branch_id` | string | Filter nach Branch ID (snake_case!) |
| `includeArchived` | boolean | Archivierte Courses einschließen (default: false) |
| `size` | int | Anzahl der Ergebnisse pro Seite (max 100, default 20) |
| `page` | int | Seite, 0-basiert (default 0) |

> **Wichtig:** Die Filter-Parameter `client_id` und `branch_id` verwenden **snake_case**, nicht camelCase!

### Response-Struktur

```json
{
  "_embedded": {
    "clientCourses": [
      {
        "clientCourseId": "abc123",
        "clientId": "client456",
        "purchasingBranchId": "branch789",
        "courseId": "course001",
        "courseName": "10er Karte Laser",
        "purchaseDate": "2024-01-15",
        "expiryDate": "2025-01-15",
        "archived": false,
        "grossPrice": 1080.00,
        "netPrice": 1000.00,
        "clientCourseItems": [
          {
            "clientCourseItemId": "item001",
            "courseItemId": "ci001",
            "serviceId": "service001",
            "initialUnits": 10,
            "remainingUnits": 7,
            "grossPrice": 100,
            "netPrice": 80
          }
        ]
      }
    ]
  },
  "page": {
    "size": 100,
    "totalElements": 3,
    "totalPages": 1,
    "number": 0
  }
}
```

## Kunden-Detailseite (Live-Abfrage)

Auf der Kunden-Detailseite (`/hub/clients/{clientId}`, Tab "glattt Pakete") werden die Courses **direkt per Phorest API** geladen — ohne Umweg über die lokale Datenbank.

### Ablauf

1. User klickt auf Tab "glattt Pakete"
2. Frontend ruft `/phorest/client/{clientId}/courses` auf
3. `PhorestController::getClientCourses()` sendet Request an Phorest API:
   ```
   GET /business/{businessId}/clientcourse?client_id={clientId}&includeArchived=true&size=100
   ```
4. Response wird direkt an das Frontend zurückgegeben
5. Alpine.js rendert die Paket-Karten

### Code-Referenz

```php
// PhorestController.php
public function getClientCourses(Request $request, string $clientId): JsonResponse
{
    $response = $this->phorest->getClientCourses([
        'client_id' => $clientId,       // snake_case!
        'includeArchived' => 'true',
        'size' => 100
    ]);
    
    $courses = $response->json()['_embedded']['clientCourses'] ?? [];
    
    return response()->json([
        'success' => true,
        'data' => ['courses' => $courses, 'count' => count($courses)]
    ]);
}
```

### PhorestApiService

```php
use App\Services\PhorestApiService;

$api = app(PhorestApiService::class);

// Courses für einen bestimmten Kunden laden (empfohlen für Detailseite)
$response = $api->getClientCourses([
    'client_id' => $clientId,
    'includeArchived' => 'true',
    'size' => 100,
]);
```

### Routen

| Route | Controller | Beschreibung |
|-------|-----------|--------------|
| `GET /phorest/client/{clientId}/courses` | `PhorestController::getClientCourses` | Courses eines Kunden |
| `GET /phorest/clientcourse/{clientCourseId}` | `PhorestController::getClientCourse` | Einzelner Course |

### View

```
resources/views/hub/clients/partials/packages.blade.php
```

## Nächtlicher Sync (für Statistiken)

Für Reports und Statistiken werden **alle** Courses nächtlich in die lokale DB synchronisiert.

> Dieser Sync wird **nicht** für die Kunden-Detailseite verwendet.

### Datenbank-Tabellen

**`stats_client_courses`** — Haupttabelle

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | bigint | Primary Key |
| `client_course_id` | varchar | Phorest Client Course ID (unique) |
| `client_id` | varchar | Phorest Client ID |
| `purchasing_branch_id` | varchar | Kaufende Branch |
| `course_id` | varchar | Phorest Course Template ID |
| `course_name` | varchar | Name des Pakets |
| `purchase_date` | date | Kaufdatum |
| `expiry_date` | date | Ablaufdatum (nullable) |
| `archived` | boolean | Archiviert-Status |
| `not_found_in_api` | boolean | True = nicht mehr in API gefunden |
| `gross_price` | decimal | Brutto-Preis |
| `net_price` | decimal | Netto-Preis |
| `total_initial_units` | int | Summe der initialen Einheiten |
| `total_remaining_units` | int | Summe der verbleibenden Einheiten |
| `last_synced_at` | timestamp | Letzter Sync-Zeitpunkt |

**`stats_client_course_items`** — Items pro Course

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | bigint | Primary Key |
| `stats_client_course_id` | bigint | Foreign Key |
| `service_id` | varchar | Phorest Service ID |
| `service_name` | varchar | Service-Name |
| `initial_units` | int | Ursprüngliche Einheiten |
| `remaining_units` | int | Verbleibende Einheiten |

### Sync-Zeitplan

Täglich um 04:00 Uhr via Google Cloud Scheduler:

```
POST /api/cron/sync-client-courses
Header: X-Cron-Token: {TOKEN}
```

### Artisan Command

```bash
php artisan sync:client-courses
php artisan sync:client-courses --include-archived
php artisan sync:client-courses --branch=BRANCH_ID
php artisan sync:client-courses --dry-run
```

## Dateien

| Datei | Beschreibung |
|-------|--------------|
| `app/Services/PhorestApiService.php` | API-Client (`getClientCourses()`, `getClientCourse()`) |
| `app/Http/Controllers/PhorestController.php` | Controller für Live-Abfrage |
| `resources/views/hub/clients/partials/packages.blade.php` | Paket-Karten im Kunden-Detail |
| `app/Models/StatsClientCourse.php` | Eloquent Model (nur für Sync/Reports) |
| `app/Models/StatsClientCourseItem.php` | Eloquent Model (nur für Sync/Reports) |
| `app/Console/Commands/SyncClientCourses.php` | Artisan Sync Command |
| `app/Http/Controllers/CronController.php` | Cron API Endpoint |
