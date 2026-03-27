# Chart.js + Alpine.js Integration

## Ziel

- Chart.js-Charts zuverlässig in Alpine.js-Komponenten nutzen
- Den **Alpine Proxy-Bug** vermeiden, der Charts zum Verschwinden bringt
- Einheitliches Pattern für alle bestehenden und neuen Chart-Komponenten

## Einbindung

Chart.js 4.4.1 wird global im Hub-Layout geladen:

```html
<!-- resources/views/layouts/hub.blade.php -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
```

Chart-spezifisches JavaScript liegt in einzelnen Dateien unter `public/js/`:

| Datei | Charts |
|-------|--------|
| `client-statistics.js` | Alter, Geschlecht, Entfernung, Funnel |
| `cancelled-appointments-analysis.js` | Stornierungen (2 Charts) |
| `appointments-body-zones.js` | 6 Chart-Instanzen |
| `start.js` | Dashboard-KPI-Charts |
| `past-consultation-stats.js` | Trend-Chart 1 |
| `past-consultation-stats-chart2.js` | Trend-Chart 2 (Extension) |

## Das Problem: Alpine.js Proxy-Bug

### Ursache

Alpine.js 3 wrapped **alle Properties** eines `x-data`-Objekts automatisch in **reaktive JavaScript-Proxies**. Das ist bei normalen Daten (Strings, Numbers, Arrays, Objects) erwünscht — dadurch aktualisiert sich die UI automatisch.

Chart.js-Instanzen sind jedoch **extrem komplexe Objekte** mit:

- Zirkulären Referenzen
- `ResizeObserver`-Registrierungen
- Animation Frames
- Canvas-Kontexten
- Internen Registries

Wenn Alpine diese Objekte proxied, **brechen die internen Mechanismen**. Das Ergebnis:

!!! danger "Symptom"
    Charts erscheinen kurz beim Laden und **verschwinden dann sofort wieder**, oder die Seite wird extrem langsam und friert ein.

### Betroffene Bibliotheken

- **Chart.js** — alle Instanzen (`new Chart(...)`)
- **Leaflet** — Map-Instanzen (`L.map(...)`) und LayerGroups (`L.layerGroup()`)
- Grundsätzlich **jedes komplexe Bibliotheks-Objekt** mit internem State

## Die Lösung: Closure-Variable-Pattern

Chart-Instanzen werden **als Closure-Variablen** deklariert — also **vor** dem `return {}`-Block der Alpine-Komponente. So sind sie für die Methoden erreichbar, aber **außerhalb von Alpines Proxy-Scope**.

### Einfaches Beispiel

```javascript
// ✅ RICHTIG: Chart-Instanz als Closure-Variable
function myChartComponent() {
    let chartInstance = null;  // ← Außerhalb von Alpine's Proxy-Scope

    return {
        loading: false,       // ← Normale Daten als Property = OK
        data: null,           // ← Alpine-Proxy ist hier erwünscht

        initChart() {
            if (chartInstance) {
                chartInstance.destroy();
                chartInstance = null;
            }
            const ctx = this.$refs.myCanvas.getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: { /* ... */ },
                options: {
                    animation: false,  // Verhindert Crashes bei Canvas-Entfernung
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        },

        destroyChart() {
            if (chartInstance) {
                try { chartInstance.destroy(); } catch (e) {}
                chartInstance = null;
            }
            // Fallback: Chart.js Registry aufräumen
            const canvas = this.$refs.myCanvas;
            if (canvas && typeof Chart !== 'undefined') {
                const existing = Chart.getChart(canvas);
                if (existing) try { existing.destroy(); } catch (e) {}
            }
        },

        downloadChart() {
            if (!chartInstance) return;
            // ... Export-Logik mit chartInstance
        }
    };
}
```

```javascript
// ❌ FALSCH: Chart-Instanz als Alpine-Property
function myChartComponent() {
    return {
        chartInstance: null,  // ← WIRD VON ALPINE GEPROXIED → CHART BRICHT!

        initChart() {
            this.chartInstance = new Chart(ctx, { /* config */ });
            // Alpine wrapped die Chart-Instanz sofort in einen Proxy
            // → ResizeObserver, Animation Frames etc. brechen
        }
    };
}
```

### Mehrere Charts in einer Komponente

```javascript
function multiChartComponent() {
    let chart1 = null;
    let chart2 = null;
    let chart3 = null;

    return {
        initChart1() { chart1 = new Chart(/* ... */); },
        initChart2() { chart2 = new Chart(/* ... */); },
        initChart3() { chart3 = new Chart(/* ... */); },

        destroyAll() {
            [chart1, chart2, chart3].forEach(c => {
                if (c) try { c.destroy(); } catch (e) {}
            });
            chart1 = chart2 = chart3 = null;
        }
    };
}
```

### Cross-File Extensions (Object.assign)

Wenn Charts über separate Dateien via `Object.assign` zusammengeführt werden (wie bei `past-consultation-stats-chart2.js`):

```javascript
// chart2-extensions.js — Eigene Datei
let trendChartInstance2 = null;  // ← File-Level Closure-Variable

window.chart2Extensions = {
    // KEIN trendChartInstance2: null hier!
    chartInitialized2: false,    // ← Einfache Flags als Property = OK

    initChart2() {
        trendChartInstance2 = new Chart(ctx, { /* ... */ });
    },

    destroyChart2() {
        if (trendChartInstance2) {
            try { trendChartInstance2.destroy(); } catch (e) {}
            trendChartInstance2 = null;
        }
    }
};
```

```javascript
// main-file.js — Zugriff über Methoden, NICHT direkt auf die Variable
const app = { /* ... */ };

if (window.chart2Extensions) {
    Object.assign(app, window.chart2Extensions);
}

// Im Code: Immer die Methode nutzen
if (typeof this.destroyChart2 === 'function') {
    this.destroyChart2();  // ✅ Methode greift auf eigene Closure-Variable zu
}
// NICHT: this.trendChartInstance2.destroy()  ❌
```

### Leaflet-Maps

Gleiches Pattern für Leaflet:

```javascript
function mapComponent() {
    let map = null;
    let markerGroup = null;

    return {
        mapData: null,  // ← JSON-Daten als Property = OK

        renderMap() {
            if (map) { map.remove(); map = null; }
            map = L.map(container, { /* ... */ });
            markerGroup = L.layerGroup().addTo(map);
        }
    };
}
```

## Checkliste: Was darf als Alpine-Property?

| Typ | Als `this.property`? | Warum? |
|-----|---------------------|--------|
| Strings, Numbers, Booleans | ✅ Ja | Werden sauber geproxied, UI-Reaktivität erwünscht |
| Arrays/Objects mit JSON-Daten | ✅ Ja | Alpine-Proxy funktioniert einwandfrei |
| Flags (`chartInitialized`) | ✅ Ja | Einfache Booleans |
| Chart.js-Instanzen | ❌ **Closure** | Komplexe Objekte mit zirkulären Refs |
| Leaflet-Map-Instanzen | ❌ **Closure** | `ResizeObserver`, DOM-Bindings |
| Leaflet-LayerGroups | ❌ **Closure** | Interne Referenzen |
| `ResizeObserver` | ❌ **Closure** | Browser-API-Objekt |
| `IntersectionObserver` | ❌ **Closure** | Browser-API-Objekt |

## Weitere Best Practices

### Schriftart: Dosis

Alle Charts müssen die Projekt-Schriftart **Dosis** verwenden. Chart.js nutzt sonst Helvetica/Arial als Fallback.

In jeder Datei, die Charts erstellt, **vor der ersten Chart-Erstellung** den globalen Font setzen:

```javascript
Chart.defaults.font.family = "'Dosis', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
```

Am besten in der `init()`-Methode oder am Anfang von `renderChart()` / `initTrendChart()`.

!!! warning "Kein Font gesetzt?"
    Wenn ein Chart andere Schriftarten zeigt als der Rest der App, fehlt wahrscheinlich diese Zeile.

### Standort-Farben: BranchColorService

Bei **standortspezifischen Daten** (Charts mit Branch-Aufschlüsselung, Karten-Marker etc.) immer den `BranchColorService` verwenden — **keine hardcodierten Farbpaletten**.

**Initialisierung:**
```javascript
async init() {
    await BranchColorService.init();  // Lädt Farben vom Server (mit localStorage-Cache)
}
```

**Verfügbare Methoden:**

| Methode | Rückgabe | Verwendung |
|---------|----------|------------|
| `getColor(branchId, fallbackIndex)` | `#hex` | Einzelne Farbe |
| `getChartColors(branchId, fallbackIndex)` | `{ bg, border, bgLight }` | Chart.js Datasets |
| `getRgba(branchId, opacity, fallbackIndex)` | `rgba(...)` | Transparenz-Varianten |
| `getHeatmapColor(branchId, intensity, max, idx)` | `rgba(...)` | Intensitäts-Abstufungen |

**Beispiel: Branch-Aufschlüsselung in Charts**
```javascript
branches.forEach((branch, index) => {
    const color = BranchColorService.getChartColors(branch.branch_id, index);
    datasets.push({
        label: branch.name,
        data: branch.values,
        backgroundColor: color.bg,
        borderColor: color.border,
        borderWidth: 1,
    });
});
```

**Beispiel: Karten-Marker mit Standortfarbe**
```javascript
const branchColor = this.selectedBranch
    ? BranchColorService.getColor(this.selectedBranch, 0)
    : (style.getPropertyValue('--color-primary').trim() || '#c8a96e');
```

!!! info "Wo kommt BranchColorService her?"
    Der Service ist in `public/js/branch-color-service.js` definiert und wird in `hub.blade.php` global geladen. Die Farben werden in der Datenbanktabelle `institute_colors` pro Standort konfiguriert.

### Animation deaktivieren

```javascript
options: {
    animation: false,  // Verhindert Crashes wenn Canvas per x-if entfernt wird
}
```

### Canvas-Existenz prüfen

```javascript
const canvas = this.$refs.myCanvas;
if (!canvas || !canvas.getContext || !document.body.contains(canvas)) {
    return;  // Canvas wurde aus dem DOM entfernt
}
```

### Chart.js Registry aufräumen

```javascript
// Fallback: Chart über Canvas-Element finden und zerstören
const existingChart = Chart.getChart(canvas);
if (existingChart) {
    try { existingChart.destroy(); } catch (e) {}
}
```

### `$nextTick` für DOM-Timing

```javascript
// Chart nach DOM-Update initialisieren
this.$nextTick(() => {
    this.initChart();
});

// Nach Destroy + Re-Init: setTimeout für sauberen Re-Render
this.destroyChart();
this.$nextTick(() => {
    setTimeout(() => {
        this.initChart();
    }, 100);
});
```

### `<template x-if>` vs. `<div x-show>`

Charts funktionieren mit **beiden** Ansätzen, solange das Closure-Pattern verwendet wird:

- `<template x-if>` — Canvas wird aus dem DOM entfernt/hinzugefügt. Chart muss nach erneutem Einfügen neu initialisiert werden ($nextTick).
- `<div x-show>` — Canvas bleibt im DOM (hidden). Chart bleibt intakt, aber nimmt Speicher ein.

**Empfehlung:** `<template x-if>` verwenden (spart Speicher bei vielen Charts), Closure-Pattern sorgt für saubere Re-Initialisierung.

## Technische Dateien

| Datei | Beschreibung |
|-------|-------------|
| `public/js/*.js` | Chart-Komponenten (Closure-Pattern) |
| `.github/instructions/javascript-charts.instructions.md` | Automatische Copilot-Anweisung für JS-Dateien |
| `resources/views/layouts/hub.blade.php` | Chart.js CDN-Einbindung |
