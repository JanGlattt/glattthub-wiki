# Performance-Optimierung

Diese Dokumentation beschreibt die PWA-Performance-Optimierungen in glatttHub.

## Übersicht

glatttHub verwendet mehrere Strategien zur Performance-Optimierung:

1. **Service Worker Asset Caching** - Kritische Assets werden gecached
2. **Preload & Prefetch** - Ressourcen werden vorab geladen
3. **SPA-Navigation** - Livewire `wire:navigate` für schnelle Seitenwechsel
4. **Aggregierte API-Endpoints** - Weniger Requests, schnellere Ladezeiten
5. **Lazy Loading** - KPIs werden bei jedem Seitenbesuch neu geladen
6. **Report Lazy Loading** - Tabellen laden Daten on-demand → [LAZY-LOADING-PERFORMANCE.md](LAZY-LOADING-PERFORMANCE.md)

---

## 1. Service Worker Asset Caching

**Datei:** `/public/sw.js`

Der Service Worker implementiert verschiedene Cache-Strategien:

### Cache-Buckets

| Cache Name | Verwendung |
|------------|------------|
| `glattthub-static-v3` | Statische Assets (CSS, JS, Fonts, Bilder) |
| `glattthub-dynamic-v1` | Dynamisch gecachte Ressourcen |
| `glattthub-api-v1` | API-Responses |

### Pre-cached Assets

Folgende kritische Assets werden beim Service Worker Install gecached:

```javascript
const PRECACHE_ASSETS = [
    '/',
    '/css/theme.css',
    '/css/theme_glattt.css',
    '/css/nav.css',
    '/css/hub.css',
    '/css/profile.css',
    '/css/auto-logout.css',
    '/css/institutes.css',
    '/css/components/kpi-dashboard.css',
    '/js/dashboard.js',
    '/js/consultations.js',
    '/images/glattt-icon.png',
    '/images/glattt_Alle.svg',
    '/images/glattt-logo.png',
    '/fonts/Dosis-VariableFont_wght.ttf',
];
```

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

<!-- Kritische CSS -->
<link rel="preload" href="/css/theme.css" as="style">
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
