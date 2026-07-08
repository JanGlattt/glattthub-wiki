# Performance & Caching (Reports + Kundensuche)

Stand: Juli 2026 — Performance-Offensive für Reports-Übersicht und Kundenseite.

## Für Endanwender

### Was ist neu?

- **Reports-Übersicht lädt in unter einer Sekunde.** Die KPI-Kacheln (Behandlungen, Termindauer, Stornos, Beratungen, Pakete) werden alle 15 Minuten im Hintergrund vorberechnet. Beim Öffnen der Seite kommen die Zahlen aus dem Cache statt live aus der Datenbank.
- **Die Kundensuche ist praktisch sofort.** Die Suche auf der Kundenseite läuft jetzt gegen eine lokale Kopie der Phorest-Kundendaten (statt bis zu 10 gleichzeitige Anfragen an die Phorest-API pro Suchvorgang). Tippen → Treffer in Millisekunden.

### Wie aktuell sind die Daten?

| Bereich | Aktualität |
|---|---|
| Reports-KPI-Kacheln | max. 1 Stunde alt, durch 15-Minuten-Warming meist frischer; nach dem nächtlichen Termin-Sync wird der Cache komplett erneuert |
| Kommende Beratungen (Live-Phorest-Kachel) | max. 15 Minuten alt |
| Kundensuche | max. 10 Minuten alt (Delta-Sync); brandneue Kunden werden über einen automatischen Live-Fallback trotzdem gefunden |

### Kundensuche: Besonderheiten

- Liefert die lokale Suche keinen Treffer, sucht das System automatisch **einmal live in Phorest** nach — der Hinweis „(Live-Suche in Phorest)" erscheint dann neben der Trefferzahl. So sind auch Kunden auffindbar, die vor wenigen Minuten angelegt wurden.
- Der Schalter **„Archivierte Kunden einbeziehen"** nutzt weiterhin die Live-Phorest-Suche, da archivierte Kunden nicht im lokalen Spiegel liegen. Diese Suche ist entsprechend langsamer.
- Die Kunden-Detailseite lädt unverändert live aus Phorest — dort sind die Daten immer aktuell.

## Für Entwickler

### Reports-Overview-Caching

Die fünf schweren Overview-Endpunkte im `ReportController` sind über die Support-Klasse `App\Support\ReportsOverviewCache` gecacht (versioniertes Key-Schema wie in `SalesStatisticsService` & Co.):

| Endpoint | Cache-Key-Endpoint | TTL |
|---|---|---|
| `reportsOverviewKpis` | `overview-kpis` | 3600s |
| `cancelledAppointmentsMonthlyFast` | `cancelled-monthly-fast` | 3600s |
| `consultationMonthlyStatsFast` | `consultation-monthly-fast` | 3600s |
| `clientCoursesKpis` | `client-courses-kpis` | 3600s |
| `upcomingConsultationsKpi` (Live-Phorest) | `upcoming-consultations-kpi` | 900s |

- **Invalidierung:** `ReportsOverviewCache::flush()` (Version-Bump) am Ende von `sync:appointments` und `sync:client-courses` — den Quellen der Overview-Daten. Der 10-Minuten-Delta-Sync der Kundenstatistik bumpt **bewusst nicht** (würde den warmen Cache ständig verwerfen; die Overview-Endpunkte lesen diese Tabelle nicht).
- **Warming:** `php artisan reports:warm-cache` (`app/Console/Commands/WarmReportsCache.php`) wärmt alle Varianten (alle Standorte + je Standort). Prod: Cloud Scheduler → `POST /api/cron/warm-reports-cache` alle 15 Minuten. Lokal: Scheduler-Eintrag in `routes/console.php`.
- **Muster für neue Endpunkte:** Controller-Methode in schlanken HTTP-Teil + private `build…()`-Methode splitten, `ReportsOverviewCache::remember('endpoint', [$params…], TTL, fn () => $this->build…())`.

### Kundensuche über lokalen Spiegel

- **Endpoint:** `GET /hub/clients/search?q=…&page=…&size=…` → `App\Http\Controllers\ClientSearchController` (Permission `view_clients`).
- **Datenquelle:** `client_statistics` (lokaler Phorest-Spiegel, ~Analytics-Mirror der Reports). Neu dafür: Spalte `email` (Migration `2026_07_08_110000`), Mapping in `ClientStatisticsSyncService::buildStatisticRecord()`.
- **Such-Klassifizierung** (analog zur alten Frontend-Logik): Telefon (nur Ziffern, +49/0-tolerant) → `mobile`-LIKE; enthält `@` → E-Mail-Prefix; `AB1234`/numerisch → `external_id` exakt; sonst Namens-Prefix auf `first_name`/`last_name` (nutzt `cs_first_name_idx`/`cs_last_name_idx`), bei zwei Wörtern auch in umgekehrter Reihenfolge.
- **Live-Fallback:** 0 lokale Treffer → genau 1 `PhorestApiService::getClients()`-Call, Response-Flag `live_fallback: true`.
- **Frontend:** `resources/views/hub/clients.blade.php` — `searchLocal()` ist der Standardpfad; der alte Live-Pfad (`searchByName`/`loadClientsWithParams`) läuft nur noch bei „Archivierte einbeziehen".
- **Delta-Sync:** `stats:sync-client-statistics --delta` ruft `ClientStatisticsSyncService::syncUpdated()` (Phorest-Filter `updatedAfter`) ohne die 20h-Sperre. Prod: der bestehende Cloud-Scheduler-Job auf `POST /api/cron/sync-client-statistics` muss auf **alle 10 Minuten** gestellt werden (war: täglich 03:30).

### Query-Optimierungen (identische Ergebnisse, verifiziert)

- `SalesStatisticsService`: `getKpis`/`getAggregates` nutzen `aggregateContractStats()` — **eine** Query mit bedingter Aggregation (`SUM(CASE WHEN …)`) statt ~10 Einzel-Queries pro Zeitraum; inkl. Vergleichszeiträume sank die Query-Zahl von ~33 auf 4.
- `ClientStatisticsService`: `getDistanceDistribution`, `getBodyZoneDistribution`, `getCancellationAnalysis` bucketen jetzt in SQL (`CASE`-Bucket + `GROUP BY`) statt N Range-Count-Queries in PHP-Schleifen (~55 → 4 Queries bei der Körperzonen-Analyse).
- `ReportController::buildCancelledAppointmentsMonthlyFast`: korrelierte `NOT EXISTS`-Subquery durch LEFT-JOIN-Anti-Join ersetzt (Cold-Hit ~2s → ~1s lokal). Die übrigen `whereNotExists`-Stellen (Lazy-Load-Detailendpunkte) sind bewusst unverändert.
- Neue Indizes (Migration `2026_07_08_100000`): `stats_historic_appointments (deleted, activation_state, appointment_date)`, `client_statistics (distance_to_branch_km)`.

### Cache-Tabellen-Pruning

Der `database`-Cache-Driver räumt abgelaufene Rows nicht selbst auf. `php artisan cache:prune-expired` löscht sie (Tabellen `cache` + `cache_locks`). Prod: Cloud Scheduler → `POST /api/cron/prune-expired-cache` täglich.

### Neue Cloud-Scheduler-Jobs (einmalig in GCP anlegen)

Auth wie bei allen Cron-Routen über Header `X-Cron-Token` (Secret `services.cron.token`), Details siehe [Cloud Scheduler](CLOUD-SCHEDULER-SETUP.md):

| Job | URL | Takt |
|---|---|---|
| Reports-Cache wärmen | `POST /api/cron/warm-reports-cache` | alle 15 Min (`*/15 * * * *`) |
| Kundenstatistik-Delta-Sync | `POST /api/cron/sync-client-statistics` | **umstellen auf** alle 10 Min (`*/10 * * * *`) |
| Cache-Pruning | `POST /api/cron/prune-expired-cache` | täglich (`30 1 * * *`) |

### Rollout-Hinweise

1. Nach dem ersten Deploy einmalig **vollen Kundenstatistik-Re-Sync** fahren, damit Bestandsdaten die neue `email`-Spalte haben: `php artisan stats:sync-client-statistics --force` (bzw. Cron-Route mit `?force=1`, falls vorhanden — sonst per Cloud-Run-Job/Konsole).
2. Der Index-Aufbau auf `stats_historic_appointments` läuft beim Deploy automatisch mit (`migrate --isolated` im Entrypoint) — Deploy dafür in eine ruhige Zeit legen.
3. Cloud-Scheduler-Jobs (Tabelle oben) anlegen/umstellen.

### Relevante Dateien

- `app/Support/ReportsOverviewCache.php` — versionierter Cache-Helper
- `app/Http/Controllers/ReportController.php` — gecachte Overview-Endpunkte
- `app/Http/Controllers/ClientSearchController.php` — lokale Kundensuche
- `app/Console/Commands/WarmReportsCache.php` — Cache-Warming
- `app/Console/Commands/PruneExpiredCacheCommand.php` — Cache-Pruning
- `app/Services/ClientStatisticsSyncService.php` — Spiegel-Sync (inkl. `email`)
- `resources/views/hub/clients.blade.php` — Kundenseite
- Tests: `tests/Feature/ClientSearchTest.php`, `tests/Unit/ReportsOverviewCacheTest.php`, `tests/Feature/SyncClientStatisticsDeltaTest.php`
