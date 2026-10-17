# Performance & Caching (Statistiken + Kundensuche)

Stand: 17.10.2026 — Statistik-Cache mit Stale-while-revalidate (davor Juli 2026: Performance-Offensive
für Reports-Übersicht und Kundenseite).

## Für Endanwender

### Was ist neu?

- **Statistiken sind sofort da.** Jede Karte auf den Berichtsseiten und jede Kachel der
  Berichte-Übersicht kommt aus einem Zwischenspeicher auf dem Server. Ist ein Wert nicht mehr
  ganz frisch, wird er trotzdem sofort gezeigt und im Hintergrund neu gerechnet — beim nächsten
  Öffnen steht der neue Stand da. Niemand wartet mehr auf eine Berechnung (Entscheidung Jan,
  17.10.2026).
- **Nach jedem Vertrag stimmen die Verkaufszahlen.** Körperzonen pro Institut, Körperzonen pro
  Tag und die Tagesmessung werden nach jedem Abschluss sofort neu gerechnet.
- **Buchungsstand und Kalenderübersicht** (Zukünftige Beratungsgespräche) zeigen ihren Datenstand
  („Stand 14:32") und haben einen Aktualisieren-Knopf, der direkt in Phorest nachsieht.
- **Die Kundensuche ist praktisch sofort.** Die Suche auf der Kundenseite läuft gegen eine lokale
  Kopie der Phorest-Kundendaten. Tippen → Treffer in Millisekunden.

!!! nutzerhandbuch "Bedienung: Berichte 2 – Zukünftige Beratungsgespräche"
    [https://hilfe.hub.glattt.com/berichte/2/](https://hilfe.hub.glattt.com/berichte/2/)

### Wie aktuell sind die Daten?

| Bereich | Aktualität |
|---|---|
| Körperzonen pro Institut, Körperzonen pro Tag, Tagesmessung | Sekunden nach jedem Vertrag (Neuberechnung auf dem Worker) |
| Aktueller Buchungsstand, Kalenderübersicht (Phorest) | alle 5 Minuten; „Aktualisieren" holt den Stand sofort |
| Berichte-Übersicht, übrige Statistik-Karten | meist unter 15 Minuten alt; nach Termin-Syncs wird im Hintergrund nachgerechnet |
| Kundensuche | max. 10 Minuten alt (Delta-Sync); brandneue Kunden werden über einen automatischen Live-Fallback trotzdem gefunden |

### Kundensuche: Besonderheiten

- Liefert die lokale Suche keinen Treffer, sucht das System automatisch **einmal live in Phorest** nach — der Hinweis „(Live-Suche in Phorest)" erscheint dann neben der Trefferzahl. So sind auch Kunden auffindbar, die vor wenigen Minuten angelegt wurden.
- Der Schalter **„Archivierte Kunden einbeziehen"** nutzt weiterhin die Live-Phorest-Suche, da archivierte Kunden nicht im lokalen Spiegel liegen. Diese Suche ist entsprechend langsamer.
- Die Kunden-Detailseite lädt unverändert live aus Phorest — dort sind die Daten immer aktuell.

## Für Entwickler

### Statistik-Cache: Stale-while-revalidate (seit 17.10.2026)

**Ausgangslage (Prod-Logs 14.–17.10.2026):** Die Berichte-Übersicht brauchte je Karte im Median
2 s, HR-Kennzahlen 41 s, Schulden 18 s, Office 12 s; auf den Statistikseiten lagen die p90-Zeiten
bei 5–13 s. Vier Ursachen: (1) 8 PHP-FPM-Worker je Instanz bei 5–17 gleichzeitigen Karten-Anfragen
je Seite — Anfrage 9 wartete; (2) der Übersichts-Cache hing an der Nutzer-ID; (3) der Wärmer kannte
nur die alten Übersichts-Endpunkte, dazu leerte jeder Vertrag und jeder Termin-Sync die Caches
komplett (`HrKpiService::flushCache()` leerte sogar den gesamten Cache); (4) Cache-Treiber ist die
Datenbank.

**Lösung — ein Helfer für alle Statistik-Services:** `App\Support\StatisticsCache`.

```php
return StatisticsCache::remember(
    self::CACHE_GROUP,                       // Gruppe für touch(): 'sales', 'personal', 'hr', …
    $key,                                    // Methode + Filter (+ BranchVisibility::cacheKeyPart())
    $callback,                               // Berechnung
    StatisticsCache::callerRecipe($this),    // Rezept: aufrufende öffentliche Methode + Argumente
    self::CACHE_TTL                          // Frische in Sekunden
);
```

- **Antwort immer aus dem Cache.** Ein Eintrag ist *veraltet*, wenn er älter als `fresh` ist oder
  seine Gruppe nach seiner Berechnung mit `StatisticsCache::touch($group)` markiert wurde. Veraltet
  heißt: alter Wert zurück, `RefreshStatisticsCacheJob` auf die Queue `stats`. Der Job führt das
  **Rezept** (Klasse, öffentliche Methode, Argumente; Requests als Query-Array, Models als ID)
  erneut aus und überschreibt genau diesen Eintrag. Erst jenseits `MAX_AGE` (2 Tage) wird
  synchron gerechnet. Höchstens ein Job je Eintrag (Lock `…:refreshing`).
- **Kein Versions-Zähler mehr.** `flushCache()` der Services ruft `touch()`; alte Einträge bleiben
  lesbar. Die Keys tragen `BranchVisibility::cacheKeyPart()`, damit ausgeblendete Institute
  eigene Einträge bekommen.
- **Nutzerunabhängig.** `WidgetKpiService::values()` schlüsselt nach Kennzahl-IDs (vorab nach
  Berechtigung gefiltert) und Standort-Scopes statt nach Nutzer-ID. Wärmer und Refresh-Job rechnen
  im Vertrauensmodus `KpiValueService::trusted()` ohne Nutzer; die Auslieferung prüft die Rechte
  weiterhin selbst (`AppReportsService::allowedKpis`).
- **Modi je Prozess:** `inline()` rechnet veraltete Einträge sofort (Wärmer), `force()` übergeht
  alles (Aktualisieren-Knopf, `?refresh=1`), `forcing($group, $key)` nur einen Eintrag (Refresh-Job).
  Jeder Job ruft `resetRequestState()` am Anfang und Ende — der Worker-Prozess lebt lange.
- **Synchrone Queue** (Tests, Konsole ohne Worker): veraltete Einträge werden an Ort und Stelle
  gerechnet, Wärm-Jobs aus dem Observer entfallen (`queueIsAsync()`).
- `generatedAt()` liefert den Zeitstempel des gelieferten Eintrags — der Buchungsstand-Endpunkt
  gibt ihn als `generated_at` aus, `glattt-stats.js` zeigt daraus „Stand HH:MM" (`standLabel()`)
  und `reload()` setzt `refresh=1`.

**Drei Mechanismen je Datenquelle (Entscheidung Jan, 17.10.2026):**

| Daten | Mechanismus | Umsetzung |
|---|---|---|
| Verkauf, Tagesmessung (Verträge entstehen im Hub) | **Frisch bei Änderung** | `ContractObserver` → `touch('sales'/'personal'/'widerrufe')` + `WarmStatisticsJob('sales')`: Körperzonen pro Institut, Körperzonen pro Tag, Tagesmessung für „Alle" und je Standort |
| Buchungsstand, Kalenderübersicht (Phorest live) | **Fester Takt** | `upcomingConsultationsData` liest aus dem Cache (5 Min frisch), `WarmStatisticsJob('booking-status')` alle 5 Minuten (Cloud Scheduler → `/api/cron/warm-booking-status`), Karte zeigt Datenstand + Aktualisieren |
| Alles andere | **Stale-while-revalidate** | Services über `StatisticsCache`, `WarmStatisticsJob('reports')` alle 15 Minuten für Übersicht (`WidgetKpiService::values` je Bericht × Standort, Monat) + Leit-Karten + Buchungsstand + alte Übersichts-Endpunkte |

**Wärm-Pläne** stehen in `App\Services\Statistics\StatisticsWarmPlan` (`reports`, `sales`,
`booking-status`): Rezepte, die **dieselben Controller-/Service-Methoden wie das Web** aufrufen —
so entstehen exakt die Schlüssel, die die Seiten anfragen. `WarmStatisticsJob` (ShouldBeUnique je
Plan) arbeitet sie im `inline`-Modus ab: Frisches wird übersprungen. Konsole:
`php artisan reports:warm-cache {reports|sales|booking-status} [--queue]`.

**Infrastruktur:** PHP-FPM 12 statische Worker (vorher 8) und Cloud Run `--concurrency 12` für
den Web-Service, damit Cloud Run skaliert statt zu stapeln; der Worker hat einen eigenen Prozess
`queue-stats` (`docker/supervisord-worker.conf`), damit minutenlange HR-Läufe die Standard-Queue
nicht blockieren. Die Cron-Endpunkte legen nur noch den Job auf die Queue — vorher lief der Wärmer
17 s lang in einem PHP-Worker des Web-Containers.

**Gruppen und Frische:** `sales`/`kunden`/`glattt`/`ads`/`personal`/`widerrufe` 1 h,
`hr`/`gutscheinaktion`/`widgets`/`booking-intake` 15 Min, `schulden`/`office` 5 Min,
`reports-overview` 15 Min (Phorest-Endpunkte 5 Min), `booking-outlook` 1 h.

**Muster für neue Statistik-Methoden:** öffentliche Methode mit `array $filters` (und weiteren
skalaren Argumenten), darin `$this->remember($key, fn () => …)` über den Service-Wrapper. Private
Methoden bekommen kein Rezept und werden bei Veralterung an Ort und Stelle gerechnet — lieber eine
öffentliche Methode cachen. Controller-Endpunkte: `ReportsOverviewCache::remember('endpoint',
$params, TTL, fn () => …, StatisticsCache::recipe($this, __FUNCTION__, [$request]))`.

**Fallstricke:**

- Rezept-Argumente müssen serialisierbar sein (Arrays, Skalare, Models, Requests) — keine Closures,
  keine Carbon-Objekte.
- `callerRecipe()` liest den Aufrufer per `debug_backtrace`; der Wrapper muss direkt aus der
  öffentlichen Methode aufgerufen werden (eine Zwischenstufe → `depth` anpassen).
- Zeitstempel sind `microtime(true)`: `touch()` und Berechnung in derselben Sekunde verdecken sich
  sonst (Test `flush_invalidates_all_entries`).
- Lokal ohne laufenden `queue:work --queue=stats` bleiben veraltete Einträge bis `MAX_AGE` stehen —
  `php artisan reports:warm-cache` oder einen Worker starten.

### Kundensuche über lokalen Spiegel

- **Endpoint:** `GET /hub/clients/search?q=…&page=…&size=…` → `App\Http\Controllers\ClientSearchController` (Permission `view_clients`).
- **Datenquelle:** `client_statistics` (lokaler Phorest-Spiegel, ~Analytics-Mirror der Reports). Neu dafür: Spalte `email` (Migration `2026_07_08_110000`), Mapping in `ClientStatisticsSyncService::buildStatisticRecord()`.
- **Such-Klassifizierung** (analog zur alten Frontend-Logik): Telefon (nur Ziffern, +49/0-tolerant) → `mobile`-LIKE; enthält `@` → E-Mail-Prefix; `AB1234`/numerisch → `external_id` exakt; sonst Namens-Prefix auf `first_name`/`last_name` (nutzt `cs_first_name_idx`/`cs_last_name_idx`), bei zwei Wörtern auch in umgekehrter Reihenfolge.
- **Live-Fallback:** 0 lokale Treffer → genau 1 `PhorestApiService::getClients()`-Call, Response-Flag `live_fallback: true`.
- **Frontend:** `resources/views/hub/clients.blade.php` — `searchLocal()` ist der Standardpfad; der alte Live-Pfad (`searchByName`/`loadClientsWithParams`) läuft nur noch bei „Archivierte einbeziehen". Die Liste lädt per **Infinite Scroll** nach (Sentinel + IntersectionObserver, Fallback-Button „Weitere laden", Ladegröße 20/50/100 wählbar) — alle drei Datenpfade hängen seitenweise an (`loadClients(reset)`, Dedupe über `appendClients()`).
- **Stabile Sortierung:** `ClientSearchController` sortiert `last_name, first_name, id` — der `id`-Tiebreaker ist Pflicht, weil MySQL-Seitengrenzen bei gleichen Namen sonst nicht deterministisch sind (Duplikate/Lücken beim Nachladen).
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
| Statistik-Cache wärmen (Plan `reports`) | `POST /api/cron/warm-reports-cache` | alle 15 Min, versetzt (`2,17,32,47 * * * *`) |
| Buchungsstand frisch rechnen (Plan `booking-status`, seit 17.10.2026) | `POST /api/cron/warm-booking-status` | alle 5 Min (`*/5 * * * *`) |
| Kundenstatistik-Delta-Sync | `POST /api/cron/sync-client-statistics` | **umstellen auf** alle 10 Min (`*/10 * * * *`) |
| Cache-Pruning | `POST /api/cron/prune-expired-cache` | täglich (`30 1 * * *`) |

### Rollout-Hinweise

1. Nach dem ersten Deploy einmalig **vollen Kundenstatistik-Re-Sync** fahren, damit Bestandsdaten die neue `email`-Spalte haben: `php artisan stats:sync-client-statistics --force` (bzw. Cron-Route mit `?force=1`, falls vorhanden — sonst per Cloud-Run-Job/Konsole).
2. Der Index-Aufbau auf `stats_historic_appointments` läuft beim Deploy automatisch mit (`migrate --isolated` im Entrypoint) — Deploy dafür in eine ruhige Zeit legen.
3. Cloud-Scheduler-Jobs (Tabelle oben) anlegen/umstellen.

### Relevante Dateien

- `app/Support/StatisticsCache.php` — gemeinsamer Statistik-Cache (Stale-while-revalidate, Rezepte, Modi)
- `app/Support/ReportsOverviewCache.php` — Hülle für die Controller-Endpunkte (Gruppe `reports-overview`)
- `app/Jobs/RefreshStatisticsCacheJob.php`, `app/Jobs/WarmStatisticsJob.php` — Hintergrund-Berechnung und Wärmer (Queue `stats`)
- `app/Services/Statistics/StatisticsWarmPlan.php` — Wärm-Pläne `reports`, `sales`, `booking-status`
- `app/Observers/ContractObserver.php` — „frisch bei Änderung" für Verkauf und Tagesmessung
- `app/Http/Controllers/ReportController.php` — gecachte Endpunkte, Buchungsstand mit `generated_at`/`refresh`
- `app/Http/Controllers/ClientSearchController.php` — lokale Kundensuche
- `app/Console/Commands/WarmReportsCache.php` — `reports:warm-cache {plan} [--queue]`
- `docker/php-fpm-pool.conf`, `docker/supervisord-worker.conf`, `cloudbuild*.yaml` — Worker-Zahl, Stats-Queue, Concurrency
- `app/Console/Commands/PruneExpiredCacheCommand.php` — Cache-Pruning
- `app/Services/ClientStatisticsSyncService.php` — Spiegel-Sync (inkl. `email`)
- `resources/views/hub/clients.blade.php` — Kundenseite
- Tests: `tests/Unit/StatisticsCacheTest.php`, `tests/Unit/StatisticsWarmPlanTest.php`, `tests/Feature/ContractObserverStatisticsTest.php`, `tests/Feature/UpcomingConsultationsDataCacheTest.php`, `tests/Unit/ReportsOverviewCacheTest.php`, `tests/Feature/ClientSearchTest.php`, `tests/Feature/SyncClientStatisticsDeltaTest.php`
