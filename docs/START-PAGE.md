# 🏠 Startseite (Start Page)

**Version:** 1.0  
**Letzte Aktualisierung:** März 2026

Die neue Startseite ersetzt das alte Dashboard und bietet eine **vollständig personalisierbare Card-basierte Oberfläche**. Jeder Benutzer kann seine Startseite individuell gestalten — Karten hinzufügen, entfernen, umsortieren und in der Breite anpassen.

---

## 📁 Dateien

| Datei | Beschreibung |
|-------|--------------|
| `app/Http/Controllers/StartPageController.php` | API-Controller für Konfiguration, Quicklinks und KPIs |
| `app/Models/StartPageConfig.php` | Eloquent Model mit Default-Konfiguration pro Rolle |
| `database/migrations/2026_03_04_100000_create_start_page_configs_table.php` | Hauptmigration (cards, quicklinks JSON) |
| `database/migrations/2026_03_04_113244_add_selected_kpis_to_*.php` | Erweiterung um selected_kpis JSON |
| `resources/views/hub/start.blade.php` | Haupt-Template mit Greeting, Edit-Bar, Card-Grid |
| `resources/views/hub/start/_card-news.blade.php` | News-Karte |
| `resources/views/hub/start/_card-quicklinks.blade.php` | Quicklinks-Karte |
| `resources/views/hub/start/_card-mitteilungen.blade.php` | Mitteilungen-Karte |
| `resources/views/hub/start/_card-kpis.blade.php` | KPI-Karte (stats-card-glattt) |
| `resources/views/hub/start/_card-charts.blade.php` | Charts-Karte (Chart.js) |
| `resources/views/hub/start/_modal-add-card.blade.php` | Modal: Karte hinzufügen |
| `resources/views/hub/start/_modal-quicklink-config.blade.php` | Modal: Quicklinks konfigurieren |
| `resources/views/hub/start/_modal-kpi-config.blade.php` | Modal: KPIs auswählen |
| `public/js/start.js` | Alpine.js Component mit D&D, Datenladung, Modals |
| `public/css/theme_glattt.css` | Styles (start-page-*, start-card-*, KPI Config) |

---

## 🏗️ Architektur

### Übersicht

```
Browser (Alpine.js)                    Server (Laravel)
┌────────────────────────┐     ┌──────────────────────────────┐
│ start.blade.php         │     │ StartPageController           │
│ + start.js (Alpine)     │     │   ├─ getConfig()             │
│                         │────▶│   ├─ saveConfig()            │
│ x-data="startPage()"   │◀────│   ├─ resetConfig()           │
│                         │     │   ├─ addCard() / removeCard() │
│ Cards: News, KPIs,      │     │   ├─ getKpis()              │
│   Quicklinks, Charts,   │     │   ├─ getKpiPortfolio()      │
│   Mitteilungen          │     │   └─ saveSelectedKpis()     │
│                         │     │                              │
│ Drag & Drop             │     │ StartPageConfig (Model)      │
│ Edit Mode               │     │   ├─ cards (JSON)            │
│ Branch-Aware            │     │   ├─ quicklinks (JSON)       │
└────────────────────────┘     │   └─ selected_kpis (JSON)    │
                                └──────────────────────────────┘
```

### Datenfluss

1. **Blade-Template** wird geladen (`@extends('layouts.hub')`, Livewire SPA-kompatibel)
2. **Alpine.js** `startPage()` initialisiert: `loadConfig()` + `loadBranches()` parallel
3. **Konfiguration** wird von `/hub/start-config` geladen (Karten, Quicklinks, verfügbare Typen)
4. **Kartendaten** werden für jede sichtbare Karte einzeln geladen (`loadCardData()`)
5. **Edit Mode** erlaubt Drag & Drop, Breitenanpassung, Hinzufügen/Entfernen
6. **Speichern** erfolgt automatisch über `/hub/start-config` POST bei jeder Änderung

---

## 📡 API-Endpoints

### Konfiguration

| Method | Route | Controller | Beschreibung |
|--------|-------|------------|--------------|
| GET | `/hub/start-config` | `getConfig()` | Aktuelle Konfiguration laden |
| POST | `/hub/start-config` | `saveConfig()` | Konfiguration speichern |
| DELETE | `/hub/start-config` | `resetConfig()` | Auf Werkseinstellung zurücksetzen |
| POST | `/hub/start-config/add-card` | `addCard()` | Karte hinzufügen |
| POST | `/hub/start-config/remove-card` | `removeCard()` | Karte entfernen |

### KPIs

| Method | Route | Controller | Beschreibung |
|--------|-------|------------|--------------|
| GET | `/hub/start-kpis` | `getKpis()` | KPI-Daten für ausgewählte KPIs |
| GET | `/hub/start-kpis/portfolio` | `getKpiPortfolio()` | Vollständiges KPI-Portfolio |
| POST | `/hub/start-kpis/save` | `saveSelectedKpis()` | KPI-Auswahl speichern |

→ Details zum KPI-System: [Start-Page KPI-System](START-PAGE-KPIS.md)

---

## 🗃️ Datenbank

### Tabelle: `start_page_configs`

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | bigint | Primary Key |
| `user_id` | foreignId | Benutzer (unique, cascade delete) |
| `cards` | JSON | Array von Karten-Objekten |
| `quicklinks` | JSON | Array von Quicklink-Slugs |
| `selected_kpis` | JSON | Array von ausgewählten KPI-IDs |
| `created_at` / `updated_at` | timestamp | Zeitstempel |

### Card-Objekt Struktur

```json
{
    "id": "kpis-1",
    "type": "kpis",
    "width": "full",
    "position": 3
}
```

| Feld | Typ | Werte |
|------|-----|-------|
| `id` | string | Eindeutige ID (z.B. `news-a3f2b1`) |
| `type` | string | `news`, `quicklinks`, `mitteilungen`, `kpis`, `charts` |
| `width` | string | `full` (100%) oder `half` (50%) |
| `position` | integer | Sortier-Position (0-basiert) |

---

## 🃏 Kartentypen

### 1. News

| Eigenschaft | Wert |
|-------------|------|
| **Rollen** | Alle |
| **Datenquelle** | `/phorest/news/latest` |
| **Features** | Bild + Titel + Datum, Link zu Detail, Branch-gefiltert |

### 2. Quicklinks

| Eigenschaft | Wert |
|-------------|------|
| **Rollen** | Alle |
| **Datenquelle** | Statisch (12 verfügbare Seiten) |
| **Features** | 2-Spalten-Grid, Zahnrad-Button zum Konfigurieren, frei wählbar |

**Verfügbare Quicklinks:**

| Slug | Label | Icon |
|------|-------|------|
| `appointments` | Termine | calendar |
| `clients` | Kunden | users |
| `staff` | Personal | user-group |
| `services` | Dienstleistungen | sparkles |
| `reports` | Reports | chart-bar |
| `vouchers` | Gutscheine | ticket |
| `contracts` | Verträge & SEPA | document-text |
| `branches` | Standorte | building-office |
| `lasers` | Lasergeräte | bolt |
| `forms` | Formulare | clipboard-document |
| `settings` | Einstellungen | cog-6-tooth |
| `news-archiv` | News-Archiv | newspaper |

### 3. Mitteilungen

| Eigenschaft | Wert |
|-------------|------|
| **Rollen** | Alle |
| **Datenquelle** | `/phorest/notifications` |
| **Features** | Typ-Icon mit Farbe, max. 5 Einträge, „Alle anzeigen"-Link |

### 4. KPIs

| Eigenschaft | Wert |
|-------------|------|
| **Rollen** | admin, super_admin |
| **Datenquelle** | `/hub/start-kpis` (aggregiert aus 4 Report-Endpoints) |
| **Styling** | `stats-card-glattt` (einheitlich mit Report-Seiten) |
| **Features** | Trend-Vergleich, konfigurierbares Portfolio (1–8 KPIs) |

→ Vollständige Dokumentation: [Start-Page KPI-System](START-PAGE-KPIS.md)

### 5. Charts

| Eigenschaft | Wert |
|-------------|------|
| **Rollen** | admin, super_admin |
| **Datenquelle** | Demo-Daten (Chart.js 4.4.1) |
| **Features** | Woche/Monat-Tabs, Bar-Chart, responsive |

---

## 🎨 Edit Mode

### Funktionen

- **Drag & Drop**: Karten per ID-basiertem Index umsortieren
- **Breite umschalten**: full ↔ half mit Button in der Kartenecke
- **Karte entfernen**: X-Button (mit Positions-Neuindizierung)
- **Karte hinzufügen**: Modal mit verfügbaren Kartentypen
- **Quicklinks konfigurieren**: Zahnrad-Button → Checkbox-Modal
- **KPIs konfigurieren**: Zahnrad-Button → Kategorie-basiertes Portfolio-Modal
- **Zurücksetzen**: Config löschen → Rolle-basierte Defaults
- **Wobble-Animation**: Karten wackeln leicht im Edit-Mode (CSS `@keyframes start-card-wobble`)

### Visuelles Feedback

| Element | Klasse/Verhalten |
|---------|-----------------|
| Edit-Bar | `.start-page-edit-bar` mit Label + 2 Buttons |
| Breitenanzeige | `.start-card-width-indicator` zeigt „100%" / „50%" |
| Wobble | `@keyframes start-card-wobble` mit -0.5° bis +0.5° Rotation |
| Dragging | `.dragging` Klasse (Opacity + Scale) |
| Drop-Target | `.drag-over` Klasse (Border-Highlight) |

---

## 🔀 Rollenbasierte Defaults

### Standard-Karten nach Rolle

| Rolle | Karten |
|-------|--------|
| `user` / `moderator` | News (full), Quicklinks (half), Mitteilungen (half) |
| `admin` / `super_admin` | + KPIs (full), Charts (full) |

### Standard-Quicklinks

- `appointments`, `clients`, `staff`, `reports`

### Standard-KPIs

- `upcoming_today`, `avg_per_day`, `appointments_current`, `treatments`

---

## 🏪 Branch/Standort-Auswahl

Die Standort-Auswahl erfolgt über die Sidebar und wird in `localStorage` als `selectedBranch` gespeichert.

| Verhalten | Beschreibung |
|-----------|--------------|
| **Branch-Badge** | Zeigt aktuell ausgewählten Standort oder „Alle Institute" |
| **Branch-Wechsel** | `branchChanged` Event → alle Karten werden neu geladen |
| **KPI-Filterung** | `branch_id` Parameter wird an `/hub/start-kpis` weitergegeben |
| **News/Mitteilungen** | Werden ebenfalls nach Branch gefiltert |

---

## 🎭 Greeting-Header

Der Greeting-Bereich zeigt eine tageszeit-abhängige Begrüßung:

| Uhrzeit | Gruß |
|---------|------|
| 23:00 – 03:59 | Gute Nacht |
| 04:00 – 08:59 | Guten Morgen |
| 09:00 – 17:59 | Guten Tag |
| 18:00 – 22:59 | Guten Abend |

**Aufbau:**

```
┌──────────────────────────────────────────────────┐
│ Guten Tag, Jan!                 📍 Alle Institute │
│ Montag, 3. März 2026                   [Anpassen] │
└──────────────────────────────────────────────────┘
```

- Der **Vorname** wird serverseitig aus `Auth::user()->name` extrahiert (erster Teil vor Leerzeichen)
- Das **Datum** nutzt `Carbon::isoFormat('dddd, D. MMMM YYYY')` (deutsch)
- Der **Anpassen-Button** ist nur im Nicht-Edit-Mode sichtbar

---

## 🔌 Livewire SPA-Kompatibilität

Die Startseite ist vollständig Livewire SPA-kompatibel:

- **Chart.js** wird global im Hub-Layout geladen (`layouts/hub.blade.php`)
- **start.js** wird mit `@assets` Directive geladen — Livewire garantiert, dass das Script **vor** der Alpine.js-Initialisierung verfügbar ist
- **Alpine.js** `startPage()` hat ein explizites `x-init="init()"` für zuverlässige Initialisierung bei SPA-Navigation
- **`destroy()`** bereinigt Event-Listener und Chart-Instanzen
- **`branchChanged`** Event-Listener werden korrekt auf-/abgebaut

### Warum `@assets` statt `@push('scripts')`?

Bei SPA-Navigation via `wire:navigate` ersetzt Livewire den Seiteninhalt und injiziert neue Scripts. Mit `@push('scripts')` + externen JS-Dateien kann eine **Race Condition** entstehen:

1. Livewire injiziert neues HTML mit `x-data="startPage()"`
2. Alpine.js versucht `startPage()` auszuwerten
3. Die externe `start.js` ist aber noch nicht geladen → `startPage is not defined`

Die `@assets` Directive löst dieses Problem: Livewire wartet mit der DOM-Verarbeitung, bis alle Assets geladen sind.

```blade
{{-- ✅ Korrekt: @assets garantiert Ladereihenfolge --}}
@assets
    <script src="{{ asset('js/start.js') }}?v={{ filemtime(public_path('js/start.js')) }}"></script>
@endassets

{{-- ❌ Veraltet: @push hat Race Condition bei SPA-Navigation --}}
@push('scripts')
    <script src="{{ asset('js/start.js') }}"></script>
@endpush
```

> **Regel:** Alle externen JS-Dateien, die Alpine.js-Komponenten definieren (z.B. `function startPage() { return {...} }`), müssen mit `@assets` statt `@push('scripts')` geladen werden. Inline-Scripts in `<script>`-Tags sind davon nicht betroffen.

---

## 📐 CSS-Struktur

### Start-Page Grid

| Klasse | Beschreibung |
|--------|--------------|
| `.start-page-grid` | CSS Grid Container (auto-fit, 20rem min) |
| `.start-card` | Basis-Karte (card-glass-bg, Backdrop-Blur) |
| `.start-card-full` | 100% Breite (grid-column: 1 / -1) |
| `.start-card-half` | 50% Breite |
| `.start-card-header` | Flex-Header mit Icon + Titel |
| `.start-card-body` | Karten-Inhalt |
| `.start-card-loading` | Lade-Spinner |
| `.start-card-empty` | Leerzustand |

### Edit-Mode

| Klasse | Beschreibung |
|--------|--------------|
| `.start-page-edit-bar` | Bearbeitungsleiste oben |
| `.start-card-controls` | Breit/Löschen-Buttons (absolut positioniert) |
| `.start-card-width-indicator` | Breitenangabe-Badge |
| `.start-card-add` | „Karte hinzufügen"-Platzhalter |
| `.edit-mode` | Wobble-Animation auf Karten |

### Modals

| Klasse | Beschreibung |
|--------|--------------|
| `.start-add-modal-overlay` | Semi-transparenter Overlay |
| `.start-add-modal` | Modal-Container (max-width 28rem) |
| `.start-add-modal-wide` | Breiterer Modal (max-width 36rem, für KPI-Config) |
| `.start-quicklink-config-item` | Checkbox-Item in Konfig-Modals |

---

## 🔗 Verwandte Dokumentation

- [Start-Page KPI-System](START-PAGE-KPIS.md) — KPI-Portfolio, Datenquellen, Konfigurationsmodal
- [Dashboard KPIs](DASHBOARD-KPIS.md) — Altes Dashboard (wird durch Start-Page ersetzt)
- [Design System](DESIGN-SYSTEM.md) — CSS-Klassen und Komponenten
- [Reports-Modul](REPORTS-MODULE.md) — Report-Endpunkte (Datenquelle für KPIs)
