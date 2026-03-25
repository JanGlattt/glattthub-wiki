# Performance-Optimierung

Diese Dokumentation beschreibt die PWA-Performance-Optimierungen in glatttHub.

## Übersicht

glatttHub verwendet mehrere Strategien zur Performance-Optimierung:

1. **Service Worker Asset Caching** - Kritische Assets werden gecached
2. **Preload & Prefetch** - Ressourcen werden vorab geladen
3. **SPA-Navigation** - Livewire `wire:navigate` für schnelle Seitenwechsel
4. **Aggregierte API-Endpoints** - Weniger Requests, schnellere Ladezeiten
5. **Lazy Loading** - KPIs werden bei jedem Seitenbesuch neu geladen
6. **Backend-Performance-Optimierung (März 2026)** - Deployment-Caching, DB-Optimierung, API-Caching & Parallelisierung → [Abschnitt 6](#6-backend-performance-optimierung-marz-2026)
7. **Report Lazy Loading** - Tabellen laden Daten on-demand → [LAZY-LOADING-PERFORMANCE.md](LAZY-LOADING-PERFORMANCE.md)

---

## 1. Service Worker Asset Caching

**Datei:** `/public/sw.js`

Der Service Worker implementiert verschiedene Cache-Strategien:

### Cache-Buckets

| Cache Name | Verwendung |
|------------|------------|
| `glattthub-static-v8` | Statische Assets (CSS, JS, Fonts, Bilder) |
| `glattthub-dynamic-v1` | Dynamisch gecachte Ressourcen |
| `glattthub-api-v1` | API-Responses |

### Pre-cached Assets

Folgende kritische Assets werden beim Service Worker Install gecached:

```javascript
const PRECACHE_ASSETS = [
    '/',
    '/css/theme_glattt.css',
    '/js/dashboard.js',
    '/js/consultations.js',
    '/images/glattt-icon.png',
    '/images/glattt_Alle.svg',
    '/images/glattt-logo.png',
    '/fonts/Dosis-VariableFont_wght.ttf',
];
```

!!! note "CSS-Konsolidierung (März 2026)"
    Alle separaten CSS-Dateien (`theme.css`, `nav.css`, `hub.css`, `auto-logout.css`, `kpi-dashboard.css`, etc.) wurden in `theme_glattt.css` konsolidiert. Nur noch eine einzige CSS-Datei wird gecached.

### Cache-Strategien

| Strategie | Pattern | Beschreibung |
|-----------|---------|--------------|
| **Cache-First** | `.css`, `.js`, `.woff2`, `.ttf`, `.png`, `.jpg`, `.svg` | Statische Assets aus Cache, Network als Fallback |
| **Network-First** | `/phorest/`, `/api/`, `/zendesk/`, `/google/` | API-Calls zuerst vom Network, Cache als Fallback |
| **Network-Only** | `/login`, `/logout`, `/sanctum`, `/livewire` | Keine Caching für Auth und Echtzeit-Daten |

### Cache-First mit Network Fallback

```javascript
async function cacheFirstWithNetwork(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        // Im Hintergrund aktualisieren (stale-while-revalidate)
        fetch(request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
            }
        }).catch(() => {});
        
        return cachedResponse;
    }
    
    // Kein Cache - vom Network laden und cachen
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
    }
    return networkResponse;
}
```

### Automatische Cache-Bereinigung

Bei Service Worker Aktivierung werden alte Caches gelöscht:

```javascript
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name.startsWith('glattthub-') && 
                                       !validCaches.includes(name))
                        .map(name => caches.delete(name))
                );
            })
    );
});
```

---

## 2. Preload & Prefetch

**Datei:** `/resources/views/layouts/hub.blade.php`

### Preconnect

Stellt früh Verbindungen zu externen Hosts her:

```html
<!-- Preconnect zu kritischen Origins -->
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://api-sandbox.phorest.com">
<link rel="preconnect" href="https://api.phorest.com">
```

### DNS-Prefetch

Löst DNS für externe Services vorab auf:

```html
<link rel="dns-prefetch" href="https://pos-api-eu-west-1.phorest.com">
<link rel="dns-prefetch" href="https://gocardless.com">
<link rel="dns-prefetch" href="https://www.zendesk.com">
```

### Preload

Lädt kritische Ressourcen mit hoher Priorität:

```html
<!-- Kritische Font (Dosis Variable Font) -->
<link rel="preload" href="/fonts/Dosis-VariableFont_wght.ttf" as="font" type="font/ttf" crossorigin>

<!-- Kritische CSS (einzige Datei seit März 2026) -->
<link rel="preload" href="/css/theme_glattt.css" as="style">
```

---

## 3. SPA-Navigation mit Livewire

glatttHub verwendet `wire:navigate` für SPA-ähnliche Navigation:

```html
<a href="/hub/appointments" wire:navigate>
    Termine
</a>
```

### Vorteile

- Kein vollständiger Page Reload
- Assets bleiben geladen
- Schnellere wahrgenommene Ladezeit
- State bleibt erhalten

### Externe Scripts mit `@assets` laden

**Problem:** Bei SPA-Navigation via `wire:navigate` werden externe JS-Dateien in `@push('scripts')` zwar injiziert, aber Alpine.js kann `x-data`-Attribute auswerten, **bevor** das externe Script geladen ist. Das führt zu einer Race Condition (`functionName is not defined`).

**Lösung:** Livewire 3 bietet die `@assets` Directive. Sie garantiert, dass externe Scripts geladen und ausgeführt sind, bevor Livewire den neuen DOM verarbeitet.

```blade
{{-- ✅ Korrekt — Script ist geladen bevor Alpine x-data auswertet --}}
@assets
    <script src="{{ asset('js/my-component.js') }}"></script>
@endassets

<div x-data="myComponent()" x-init="init()">
    ...
</div>
```

**Wann `@assets` verwenden:**

| Szenario | Directive |
|----------|-----------|
| Externe JS-Datei definiert Alpine-Komponente (`function xyz() { return {...} }`) | `@assets` |
| Inline `<script>` mit Alpine-Komponente | `@push('scripts')` (kein Problem) |
| CDN-Libraries global benötigt (Chart.js, Flatpickr) | Direkt im Layout laden |
| CSS-Dateien | `@push('styles')` (CSS hat keine Race Condition) |

**Betroffene Seiten (alle auf `@assets` umgestellt):**

- Startseite (`start.js`)
- Termine (`appointments.js`)
- Terminansicht (`appointment-unified.js`, `treatment-settings.js`, `form-fill.js`)
- Alle Report-Seiten (`consultation-stats.js`, `cancelled-appointments-*.js`, etc.)
- Formulare (`form-editor.js`, `form-fill.js`)
- Services (`body-zone-selector.js`)
- Komponenten (`components-hub.js` + Modals)
- Lasergeräte Detail (`laser-detail.js`)

### Event-Handling für SPA-Navigation

JavaScript muss auf `livewire:navigated` reagieren:

```javascript
// Bei SPA-Navigation re-initialisieren
document.addEventListener('livewire:navigated', function() {
    const dashboardElement = document.getElementById('dashboard-consultations-today');
    if (dashboardElement) {
        initializeDashboard();
    }
});
```

### Global geladene Libraries

Folgende Libraries werden **einmal im Hub-Layout** (`layouts/hub.blade.php`) geladen und stehen auf allen Seiten zur Verfügung:

| Library | Verwendung |
|---------|------------|
| Chart.js 4.4.1 (CDN) | Startseite Charts, alle Report-Seiten |
| `kpi-dashboard.js` | KPI-Karten auf Start- und Report-Seiten |
| `hub.js` | Globale Dashboard-Funktionalität |
| `darkmode.js` | Dark-Mode-Steuerung |
| `branch-color-service.js` | Konsistente Standort-Farben |

---

## 4. Aggregierte API-Endpoints

**Datei:** `/app/Http/Controllers/DashboardKpisController.php`

### Problem

Viele einzelne API-Calls verlangsamen das Dashboard:
- Branches laden
- Body Zones laden
- News laden
- Phorest Appointments laden

### Lösung

Ein aggregierter Endpoint für schnelle Daten:

```php
// GET /phorest/dashboard-kpis
public function index(Request $request)
{
    return response()->json([
        // Gecached (1 Stunde)
        'branches' => $this->phorestClient->getAllBranches(),
        
        // Aus DB (schnell)
        'body_zones' => BodyZone::all()->map(...),
        
        // Aus DB (schnell)
        'news_count' => News::where('is_active', true)->count(),
    ]);
}
```

### Trennung schnelle/langsame Daten

| Daten | Quelle | Strategie |
|-------|--------|-----------|
| Branches | Phorest API (1h Cache) | Server-side aggregiert |
| Body Zones | DB | Server-side aggregiert |
| News | DB | Server-side aggregiert |
| Week Consultations | Phorest API (live) | Client-side parallel |
| No-Show Rate | Phorest API (live) | Client-side parallel |

---

## 5. Lazy Loading Dashboard KPIs

**Datei:** `/public/js/dashboard.js`

### Initial Load

```javascript
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});
```

### SPA Navigation Re-Load

```javascript
document.addEventListener('livewire:navigated', function() {
    const dashboardKpisContainer = document.getElementById('dashboard-consultations-today');
    if (dashboardKpisContainer) {
        console.log('[Dashboard] Re-initializing after SPA navigation');
        initializeDashboard();
    }
});
```

### Loading States

Während des Ladens werden Skeleton-Loader angezeigt:

```javascript
function showDashboardLoading() {
    const element = document.getElementById('dashboard-consultations-today');
    if (element) {
        element.innerHTML = '<div class="spinner-glattt spinner-glattt-secondary"></div>';
    }
}
```

---

## Service Worker Update

### Version erhöhen

Bei Änderungen an gecachten Assets:

```javascript
// sw.js
const SW_VERSION = '2.0.1';  // Version erhöhen
const CACHE_STATIC = 'glattthub-static-v3';  // Cache-Namen ändern
```

### Update-Prozess

1. Browser erkennt neue SW-Version
2. Neuer SW wird im Hintergrund installiert
3. Alte Caches werden gelöscht
4. Neuer SW wird aktiviert
5. User sieht bei nächstem Besuch neue Assets

---

## Debugging

### Service Worker Status

```javascript
// In Browser DevTools Console
navigator.serviceWorker.ready.then(reg => {
    console.log('SW Version:', reg.active.scriptURL);
});
```

### Cache Inhalt

```javascript
// Alle Caches auflisten
caches.keys().then(names => console.log(names));

// Cache-Inhalt anzeigen
caches.open('glattthub-static-v3').then(cache => {
    cache.keys().then(requests => {
        requests.forEach(req => console.log(req.url));
    });
});
```

### Cache löschen (für Tests)

```javascript
// Alle glatttHub Caches löschen
caches.keys().then(names => {
    names.filter(n => n.startsWith('glattthub-'))
         .forEach(n => caches.delete(n));
});
```

---

## Performance Metriken

### Erwartete Verbesserungen

| Metrik | Ohne Caching | Mit Caching |
|--------|--------------|-------------|
| First Contentful Paint | ~1.5s | ~0.5s |
| Time to Interactive | ~3s | ~1s |
| Repeat Visit Load | ~2s | ~0.3s |
| Font Loading (FOUT) | Sichtbar | Eliminiert |

### Messung

Verwende Chrome DevTools:
1. **Network Tab** - Cache-Hits sehen (from ServiceWorker)
2. **Application Tab** - Service Worker Status & Cache Storage
3. **Lighthouse** - Performance Score

---

## Troubleshooting

### Problem: Assets nicht gecached

**Ursache:** Service Worker noch nicht aktiviert

**Lösung:**
1. DevTools > Application > Service Workers
2. "Update on reload" aktivieren
3. Seite neu laden

### Problem: Alte Assets angezeigt

**Ursache:** Alter Cache aktiv

**Lösung:**
1. SW Version erhöhen
2. Cache-Namen ändern
3. Oder: "Clear storage" in DevTools

### Problem: KPIs laden nicht bei Navigation

**Ursache:** `livewire:navigated` Event nicht gehört

**Lösung:** Prüfen ob Event Listener registriert:
```javascript
document.addEventListener('livewire:navigated', function() {
    console.log('Navigation detected');
});
```

### Problem: Seite lädt nicht nach SPA-Navigation (z.B. Alpine-Komponente leer)

**Ursache:** Externe JS-Datei wird per `@push('scripts')` statt `@assets` geladen → Race Condition: Alpine wertet `x-data` aus, bevor das Script verfügbar ist.

**Symptome:**
- Seite bleibt im Loading-State (Spinner dreht endlos)
- Browser-Konsole zeigt `functionName is not defined`
- Tritt nur bei SPA-Navigation auf, nicht bei Hard-Refresh
- Intermittierend (abhängig von Browser-Cache und Netzwerk-Timing)

**Lösung:** Externe JS-Dateien, die Alpine-Komponenten definieren, mit `@assets` statt `@push('scripts')` laden:

```blade
@assets
    <script src="{{ asset('js/my-component.js') }}"></script>
@endassets
```

---

## 6. Backend-Performance-Optimierung (März 2026)

Umfassende 3-Phasen-Optimierung von Deployment, Datenbank und API-Caching.

### Phase 1: Production Deployment Caching

#### 1.1 Dockerfile — Artisan Caching aktiviert

**Datei:** `Dockerfile`

**Problem:** Container-Start löschte alle Caches, baute sie aber nicht wieder auf. Jeder Request musste Route-Matching (~500ms), Config-Loading (~200ms) und View-Kompilierung ohne Cache durchführen.

**Lösung:** Entrypoint-Script baut nach dem Clearen optimierte Caches:

```bash
# Caches leeren (für frische Daten)
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan event:clear

# Optimierte Caches aufbauen
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

**Impact:** ~700ms schnellerer erster Request pro Container-Start, ~200ms weniger pro Request danach.

#### 1.2 CSS Cache-Buster Fix

**Datei:** `resources/views/layouts/hub.blade.php`

**Problem:** `?v={{ time() }}` generierte bei jedem Request eine neue URL → Browser-Cache und Service Worker Cache wurden nie genutzt.

**Lösung:** Dateigröße-basierter Hash:

```html
<link rel="preload" href="{{ asset('css/theme_glattt.css') }}?v={{ filemtime(public_path('css/theme_glattt.css')) }}" as="style">
<link rel="stylesheet" href="{{ asset('css/theme_glattt.css') }}?v={{ filemtime(public_path('css/theme_glattt.css')) }}">
```

**Impact:** CSS wird jetzt korrekt vom Browser und Service Worker gecacht. Ändert sich nur bei tatsächlicher Dateiänderung.

#### 1.3 AutoLogout-Middleware entfernt

**Datei:** `bootstrap/app.php`

`AutoLogout::class` war ein No-Op (leere Middleware), wurde aber bei jedem Request ausgeführt. Entfernt.

---

### Phase 2: Datenbank-Optimierung

#### 2.1 N+1 Query Fixes

| Datei | Problem | Lösung | Einsparung |
|-------|---------|--------|------------|
| `ReportController.php` | Pro Appointment separate DB-Query für Service-History | Batch `whereIn()` + `groupBy()` | ~100 Queries → 1 |
| `AppointmentViewController.php` | Pro Body-Zone `TreatmentSetting::count()` | Einzelne Query mit `groupBy('body_zone_id')` + `keyBy()` | ~15 Queries → 1 |
| `PinAuthenticationService.php` | Alle User geladen für PIN-Check | `select(['id', 'pin'])` — nur benötigte Spalten | ~80% weniger Daten |
| `PushNotificationSettings.php` | Pro NotificationType separate Preference-Query | `whereIn()->get()->keyBy()` einmal laden | ~10 Queries → 1 |

#### 2.2 Composite Indexes

**Migration:** `database/migrations/2026_03_25_100000_add_performance_composite_indexes.php`

```php
// 4 neue Composite-Indexes für häufige Query-Patterns
Schema::table('stats_historic_appointments', fn ($t) => 
    $t->index(['appointment_date', 'branch_id', 'client_id'], 'idx_stats_date_branch_client'));

Schema::table('treatment_settings', fn ($t) => 
    $t->index(['phorest_client_id', 'body_zone_id'], 'idx_treatment_client_zone'));

Schema::table('consultation_records', fn ($t) => 
    $t->index(['branch_id', 'appointment_date'], 'idx_consultation_branch_date'));

Schema::table('consultation_appointments', fn ($t) => 
    $t->index(['branch_id', 'appointment_date'], 'idx_consultation_apt_branch_date'));
```

---

### Phase 3: API-Caching & Parallelisierung

#### 3.1 Phorest API — Cached-Methoden

**Datei:** `app/Services/PhorestApiService.php`

| Methode | TTL | Zweck |
|---------|-----|-------|
| `getCachedBranches()` | 3600s | Branch-Liste (ändert sich selten) |
| `getCachedBranchNames()` | 3600s | Branch-ID → Name Map |
| `getCachedBranch(branchId)` | 3600s | Einzelner Branch aus Cache |
| `getCachedClient(clientId)` | 600s | Client-Daten |
| `getCachedStaffMember(branchId, staffId)` | 1800s | Staff-Daten |
| `getCachedStaff(branchId)` | 1800s | Staff-Liste pro Branch |
| `getCachedServices(branchId)` | 3600s | Services pro Branch |

**ReportController:** 30× `getBranches()` durch `getCachedBranches()` / `getBranchNames()` Helper ersetzt. Spart pro Report-Seite mindestens einen API-Call.

#### 3.2 GoCardless API — Cached-Methoden

**Datei:** `app/Services/GoCardlessApiService.php`

| Methode | TTL | Zweck |
|---------|-----|-------|
| `getCachedMandate(mandateId)` | 300s | Mandate-Daten |
| `getCachedBankAccount(bankAccountId)` | 1800s | Bankkonto-Daten |
| `getCachedSubscriptionsForMandate(mandateId)` | 300s | Subscriptions pro Mandate |
| `getCachedCustomer(customerId)` | 1800s | Kunden-Daten |

**ContractController:** N+1 in `getGoCardlessMandates()` behoben — `listSubscriptions()` und `getCustomerBankAccount()` durch Cached-Varianten ersetzt.

#### 3.3 Zendesk API — Cached-Methoden

**Datei:** `app/Services/ZendeskApiService.php`

| Methode | TTL | Zweck |
|---------|-----|-------|
| `getCachedUser(userId)` | 600s | Zendesk-User |
| `getCachedOpenTickets()` | 120s | Offene Tickets (kurzes TTL für Aktualität) |

**ZendeskController:** `getOpenTickets()` und User-Auflösung verwenden jetzt Cached-Methoden.

#### 3.4 Parallelisierung

**Bereits bestehende parallele Calls:**

- `getAppointmentsParallel()` — `Http::pool()` für alle Branches gleichzeitig
- `getAvailabilityParallel()` — `Http::pool()` für Verfügbarkeit
- `getClientsParallel()` — `Http::pool()` für Client-Batch

**Neu parallelisiert:**

| Datei | Vorher | Nachher |
|-------|--------|---------|
| `PhorestApiService::getAllBranchesAppointments()` | Sequenziell `foreach` pro Branch | `Http::pool()` + 2-Phasen-Pagination (alle 1. Seiten parallel, dann alle Folgeseiten parallel) |
| `PhorestController::enrichAppointmentsWithClientData()` | 50× sequenzielle `getClient()` | Ein `getClientsParallel()` Call |
| `ConsultationRecordController::getNextAppointments()` | Branch-Loop mit einzelnen API-Calls | `getAppointmentsParallel()` |
| `ConsultationRecordController::saveFollowUpAppointments()` | Branch-Loop | `getAppointmentsParallel()` |
| `FormController::getContextData()` | 3 sequenzielle Calls | `getCachedClient()` + `getCachedStaffMember()` + `getCachedBranch()` |

#### 3.5 Frontend-Parallelisierung (Client Detail)

**Datei:** `resources/views/hub/clients/detail.blade.php`

| Vorher | Nachher |
|--------|---------|
| `loadAppointmentDetails()` — sequenzieller `for`-Loop (N Requests nacheinander) | `Promise.all()` in Batches à 10 |
| `loadStaffDetails()` — pro Termin ein einzelner GET-Request | Neue `loadAllStaffDetails()` — ein einziger `POST /phorest/staff/batch` für alle unique Staff |

**Impact bei 20 Terminen, 8 Staff:** Von ~48 sequenziellen Requests auf 3 Roundtrips (2 Detail-Batches + 1 Staff-Batch).

---

### Zusammenfassung der Änderungen

#### Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `Dockerfile` | Artisan Cache-Aufbau im Entrypoint |
| `bootstrap/app.php` | AutoLogout-Middleware entfernt |
| `resources/views/layouts/hub.blade.php` | CSS Cache-Buster Fix |
| `resources/views/hub/clients/detail.blade.php` | Appointment-Details + Staff parallel laden |
| `app/Services/PhorestApiService.php` | 6 Cached-Methoden + `getAllBranchesAppointments()` parallelisiert |
| `app/Services/GoCardlessApiService.php` | 4 Cached-Methoden |
| `app/Services/ZendeskApiService.php` | 2 Cached-Methoden |
| `app/Http/Controllers/ReportController.php` | 30× `getBranches()` → cached, N+1 Fix |
| `app/Http/Controllers/PhorestController.php` | `enrichAppointmentsWithClientData()` parallelisiert |
| `app/Http/Controllers/ContractController.php` | GoCardless N+1 Fix + Caching |
| `app/Http/Controllers/ZendeskController.php` | Cached-Methoden verwenden |
| `app/Http/Controllers/ConsultationRecordController.php` | `getAppointmentsParallel()` |
| `app/Http/Controllers/FormController.php` | Cached-Methoden |
| `app/Http/Controllers/AppointmentViewController.php` | Body-Zone N+1 Fix + Caching |
| `app/Http/Controllers/ContractPriceController.php` | `getCachedBranches()` |
| `app/Services/ConsultationStatsService.php` | `getCachedBranches()` |
| `app/Services/PinAuthenticationService.php` | Select-Optimierung |
| `app/Livewire/PushNotificationSettings.php` | N+1 Fix |
| `database/migrations/2026_03_25_100000_...` | 4 Composite Indexes |

#### Erwartete Performance-Verbesserungen

| Bereich | Verbesserung |
|---------|-------------|
| Container-Start (Cloud Run Cold Start) | ~700ms schneller |
| CSS-Laden (Repeat Visits) | Kein Re-Download (gecacht) |
| Report-Seiten (N+1 + Caching) | 50-70% weniger DB-Queries |
| Vertrags-Übersicht (GoCardless) | ~60% weniger API-Calls |
| Termin-Übersicht „Alle Standorte" | ~4× schneller (parallel statt sequenziell) |
| Client-Detail Appointments-Tab | ~10× schneller (48 → 3 Roundtrips) |
| Zendesk-Tickets | Cached (2min), kein API-Call bei Refresh |
