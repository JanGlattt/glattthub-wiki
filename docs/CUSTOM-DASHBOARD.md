# Eigenes Dashboard (Custom Dashboard)

Das Custom Dashboard ermöglicht es jedem Nutzer, sein persönliches Statistik-Dashboard aus einer Bibliothek von 29 vorkonfigurierten Widgets zusammenzustellen, frei zu ordnen und optional mit anderen Nutzern zu teilen.

---

## Für Endanwender

### Was ist das Eigene Dashboard?

Statt einer fixen Berichtsseite kannst du dir dein eigenes Statistik-Dashboard aufbauen. Du wählst selbst:

- **Welche Widgets** angezeigt werden (aus 29 verschiedenen)
- **In welcher Reihenfolge** sie erscheinen (per Drag & Drop)
- **In welcher Breite** (halb oder ganz)

Das Dashboard merkt sich deine Konfiguration dauerhaft — sie bleibt beim nächsten Login erhalten.

---

### Dashboard aufrufen

Im Hub-Menü unter **Berichte → Eigenes Dashboard** — oder direkt über die URL `/hub/reports/custom-dashboard`.

---

### Widgets hinzufügen

1. Klicke oben auf **„+ Widget hinzufügen"**
2. Es öffnet sich ein Auswahl-Fenster mit allen verfügbaren Widgets
3. Filtere per Kategorie: Verkauf · Mitarbeiter · Kunden · Termine · Pakete · Ads-Analyse
4. Klicke auf ein Widget-Kachel um es hinzuzufügen — es erscheint sofort im Dashboard
5. Klicke **„Speichern"**, um die Konfiguration zu sichern

!!! tip "Tipp"
    Der **„Nicht gespeichert"**-Badge erscheint sobald du Änderungen vorgenommen hast — so weißt du immer, ob du noch speichern musst.

---

### Widgets anordnen & skalieren

- **Verschieben**: Halte eine Widget-Kachel an der Kopfzeile gedrückt und ziehe sie an die gewünschte Position (Drag & Drop)
- **Breite ändern**: Klicke im Widget-Header auf das **↔ Symbol** um zwischen halber und voller Breite umzuschalten
- **Entfernen**: Klicke im Widget-Header auf das **✕ Symbol**

---

### Globale Filter

Oben im Dashboard befinden sich zwei Filter:

| Filter | Optionen |
|--------|----------|
| **Zeitraum** | Letzter Monat · 3 Monate · 6 Monate · 1 Jahr · 2 Jahre |
| **Standort** | Alle Standorte · Einzelner Standort |

Die Filter werden an alle Widgets im Dashboard weitergegeben — jedes Widget das diesen Filter unterstützt, aktualisiert sich automatisch.

---

### Dashboard teilen

Es gibt zwei Wege, ein Dashboard zu teilen:

#### 1. Link-Sharing (für jeden zugänglich)

- Klicke auf **„Teilen"** (nur sichtbar wenn du die Berechtigung `custom-dashboard.share` hast)
- Klicke auf **„Link generieren"**
- Kopiere den generierten Link — jeder mit dem Link kann das Dashboard schreibgeschützt ansehen
- Der Link kann jederzeit mit **„Link widerrufen"** ungültig gemacht werden

#### 2. Direkt mit Nutzer teilen

- Im Teilen-Dialog: Suche nach einem Nutzernamen oder E-Mail-Adresse
- Klicke auf den gefundenen Nutzer um ihn hinzuzufügen
- Der Nutzer sieht dein Dashboard unter **„Geteilt mit mir"**

#### Geteilte Dashboards ansehen

Klicke oben auf **„Geteilt mit mir"** um alle Dashboards zu sehen, die andere Nutzer mit dir geteilt haben. Ein geteiltes Dashboard kann mit **„Als eigenes übernehmen"** als Kopie in dein eigenes Dashboard übernommen werden.

---

### Verfügbare Widgets

#### Verkauf (5 Widgets)

| Widget | Beschreibung | Standard-Breite |
|--------|-------------|-----------------|
| **Monatsübersicht Verkäufe** | Monatliche Vertragsverkäufe als Tabelle oder Chart mit Hochrechnung | Voll |
| **KPZ-Chart (monatlich)** | Verkaufte Körperzonen pro Monat nach Filiale | Voll |
| **KPZ-Chart (täglich)** | Verkaufte Körperzonen pro Tag — tagesgenauer Verlauf | Voll |
| **Filial-Ranking Verkäufe** | Filialen sortiert nach Körperzonen-Verkäufen | Halb |
| **Verkäufer-Ranking** | Mitarbeiter sortiert nach Verkaufsleistung | Halb |

#### Mitarbeiter (5 Widgets)

| Widget | Beschreibung | Standard-Breite |
|--------|-------------|-----------------|
| **Mitarbeiter-Übersicht** | Alle Mitarbeiter mit Beratungen, Conversions und KPZ über 8 Zeiträume | Voll |
| **Mitarbeiter-Ranking** | Mitarbeiter sortiert nach KPZ, Conversion-Rate oder Beratungsanzahl | Halb |
| **Filial-Vergleich Performance** | Durchschnittliche KPZ und Conversion-Rate je Filiale | Halb |
| **Performance-Monatstrend** | Monatlicher Verlauf von Beratungen, Conversions und KPZ | Voll |
| **Körperzonen-Spezialisierung** | Welche Körperzonen werden von welchen Mitarbeitern behandelt | Halb |

#### Kunden (7 Widgets)

| Widget | Beschreibung | Standard-Breite |
|--------|-------------|-----------------|
| **Kundendemografie** | Altersverteilung und Geschlechterverhältnis der Kunden | Halb |
| **Kunden-Segmente** | Kunden nach Persona-Typen segmentiert | Halb |
| **Einzugsgebiet** | Anfahrtsentfernung der Kunden zum Institut | Halb |
| **Conversion-Funnel** | Buchung → Beratung → Vertrag — Conversion-Trichter | Halb |
| **Top-Postleitzahlen** | Postleitzahlen mit den meisten Kunden | Halb |
| **Stornierungsmuster** | Wann und warum Kunden Termine stornieren | Voll |
| **Körperzonen-Präferenzen** | Welche Körperzonen am häufigsten von Kunden gewählt werden | Halb |

#### Termine & Beratung (6 Widgets)

| Widget | Beschreibung | Standard-Breite |
|--------|-------------|-----------------|
| **Bevorstehende Beratungs-KPIs** | Geplante Beratungen in den nächsten 7, 14 und 28 Tagen | Voll |
| **Vergangene Beratungsstatistiken** | Historische Beratungsanalyse mit No-Show-Rate und Prognose | Voll |
| **Körperzonen-Verteilung** | Welche Körperzonen in Terminen behandelt werden | Halb |
| **Top-Leistungen** | Meistgebuchte Leistungen und Behandlungen | Halb |
| **Stornierungen/Monat** | Monatlicher Verlauf von stornierten und gelöschten Terminen | Voll |
| **Stornierungen nach Grund** | Aufschlüsselung der Stornierungen nach Stornierungsgrund | Voll |

#### Pakete (2 Widgets)

| Widget | Beschreibung | Standard-Breite |
|--------|-------------|-----------------|
| **Paket-Verlauf (monatlich)** | Monatliche Entwicklung der glattt-Pakete | Voll |
| **Paket-KPIs** | Aktive Pakete, Neuverkäufe, Ø Resteinheiten | Halb |

#### Ads-Analyse (4 Widgets)

| Widget | Beschreibung | Standard-Breite |
|--------|-------------|-----------------|
| **Kampagnen-Übersicht** | Google Ads & Meta Ads — Kampagnen mit KPIs | Voll |
| **Ads-Monatstrend** | Monatlicher Verlauf von Buchungen, Conversions und Kosten | Voll |
| **Quellen-Aufschlüsselung** | Meta vs. Google — Vergleich der Werbekanäle | Halb |
| **Ads vs. Organisch** | Bezahlte vs. organische Buchungen im Vergleich | Halb |

---

### Berechtigungen

Welche Widgets sichtbar sind, hängt von den Berechtigungen des Nutzers ab. Wer kein Recht für z. B. Verkaufsstatistiken hat, sieht die entsprechenden Widgets im Auswahl-Dialog nicht.

Für das **Teilen** von Dashboards per Link und an andere Nutzer wird zusätzlich die Berechtigung `custom-dashboard.share` benötigt. Diese hat standardmäßig nur die Admin-Rolle.

---

## Für Entwickler

### Architektur-Überblick

```
CustomDashboard (Model + DB)
    │
    ├── WidgetRegistry (Service)     ← zentrale Widget-Bibliothek
    │       └── forUser($user)       ← filtert nach Berechtigungen
    │
    ├── CustomDashboardController    ← HTTP-Schicht (show, save, share, …)
    │
    └── Blade + Alpine.js            ← UI-Layer
            ├── custom-dashboard.blade.php     (Haupt-View, x-data)
            ├── widget-selector-modal          (Widget hinzufügen)
            ├── share-modal                    (Dashboard teilen)
            ├── shared-with-me-panel           (Geteilte empfangen)
            └── statistics/widgets/*.blade.php (29 Widget-Komponenten)
```

---

### Datenbank-Schema

```sql
CREATE TABLE custom_dashboards (
    id                   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id              BIGINT UNSIGNED NOT NULL UNIQUE,   -- 1:1 pro User
    widgets              JSON NULL,                         -- geordnete Widget-Liste
    share_token          VARCHAR(64) NULL UNIQUE,           -- null = kein Link-Sharing
    shared_with_user_ids JSON NULL,                         -- Array von User-IDs
    created_at           TIMESTAMP NULL,
    updated_at           TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**`widgets`-Spalte Format:**

```json
[
  { "id": "sales-monthly-overview", "width": "full" },
  { "id": "staff-ranking",           "width": "half" },
  { "id": "ads-campaigns",           "width": "half" }
]
```

**`shared_with_user_ids`-Spalte Format:**

```json
[1, 5, 12]
```

---

### Routen

Alle Dashboard-Routen liegen unter dem `hub`-Middleware (Auth + `check.hub`):

| Methode | URL | Route-Name | Beschreibung |
|---------|-----|------------|--------------|
| `GET` | `/hub/reports/custom-dashboard` | `hub.reports.custom-dashboard` | Dashboard anzeigen |
| `POST` | `/hub/reports/custom-dashboard/save` | `hub.reports.custom-dashboard.save` | Widget-Layout speichern |
| `GET` | `/hub/reports/custom-dashboard/widgets` | `hub.reports.custom-dashboard.widgets` | Verfügbare Widgets (JSON) |
| `GET` | `/hub/reports/custom-dashboard/widget/{id}` | `hub.reports.custom-dashboard.render-widget` | Einzelnes Widget als HTML rendern |
| `GET` | `/hub/reports/custom-dashboard/shared-with-me` | `hub.reports.custom-dashboard.shared-with-me` | Mit mir geteilte Dashboards |
| `POST` | `/hub/reports/custom-dashboard/share/token` | `hub.reports.custom-dashboard.share.token` | Share-Token generieren |
| `POST` | `/hub/reports/custom-dashboard/share/revoke` | `hub.reports.custom-dashboard.share.revoke` | Share-Token widerrufen |
| `POST` | `/hub/reports/custom-dashboard/share/users` | `hub.reports.custom-dashboard.share.users` | Mit Nutzer teilen |
| `POST` | `/hub/reports/custom-dashboard/share/users/remove` | `hub.reports.custom-dashboard.share.users.remove` | Sharing entziehen |
| `GET` | `/hub/reports/shared/{token}` | `hub.reports.shared` | Geteiltes Dashboard (Token) |
| `POST` | `/hub/reports/shared/{token}/clone` | `hub.reports.shared.clone` | Geteiltes Dashboard übernehmen |

Share-Routen (Token + Users) sind zusätzlich durch das `can:custom-dashboard.share`-Middleware geschützt.

---

### WidgetRegistry

Der zentrale Service unter `app/Services/Statistics/WidgetRegistry.php` verwaltet alle verfügbaren Widgets.

**Methoden:**

```php
// Alle 29 Widgets (unabhängig von Berechtigungen)
WidgetRegistry::all(): array

// Nur Widgets, die der User sehen darf (filtert nach permission)
WidgetRegistry::forUser(User $user): array

// Ein einzelnes Widget per ID
WidgetRegistry::find(string $id): ?array

// Alle Kategorien für den Selektor
WidgetRegistry::categories(): array
```

**Widget-Struktur (Beispiel):**

```php
[
    'id'          => 'sales-monthly-overview',
    'label'       => 'Monatsübersicht Verkäufe',
    'description' => 'Monatliche Vertragsverkäufe als Tabelle oder Chart ...',
    'category'    => 'verkauf',
    'icon'        => 'chart-bar',        // Heroicon-Name
    'js_function' => 'widgetSalesMonthlyOverview',   // Alpine-Funktion in statistics-widgets.js
    'component'   => 'statistics.widgets.sales-monthly-overview',  // Blade-Komponente
    'permission'  => 'view_report_sales_statistics', // null = alle
    'width'       => 'full',             // Standardbreite: 'full' | 'half'
]
```

#### Neues Widget hinzufügen

1. Eintrag in `WidgetRegistry::all()` ergänzen
2. Alpine-Funktion `widgetMeinWidget()` in `public/js/statistics-widgets.js` anlegen
3. Blade-Komponente unter `resources/views/components/statistics/widgets/mein-widget.blade.php` erstellen
4. (Optional) Berechtigung anlegen und in Migration registrieren

---

### Model: CustomDashboard

`app/Models/CustomDashboard.php`

```php
// 1:1-Beziehung zum User
$dashboard->user          // BelongsTo User

// Sharing-Hilfsmethoden
$dashboard->isSharedWith(int $userId): bool
$dashboard->generateShareToken(): string
$dashboard->revokeShareToken(): void
$dashboard->shareWithUser(int $userId): void
$dashboard->unshareWithUser(int $userId): void
```

**Casts:** `widgets` → `array`, `shared_with_user_ids` → `array`

---

### Frontend-Architektur (Alpine.js)

Die Haupt-View `resources/views/hub/reports/custom-dashboard.blade.php` initialisiert das globale Alpine-State-Objekt `customDashboard()` aus `statistics-widgets.js`.

**Wichtige State-Variablen:**

```js
{
    filters: { months: 6, branch_id: '' },  // globale Filter
    saving: false,
    hasUnsavedChanges: false,
    showWidgetSelector: false,
    showShareModal: false,
    showSharedWithMePanel: false,
    shareToken: null,
    sharedWithUsers: [],
    sharedWithMeList: [],
}
```

**Widget-Konfiguration** wird server-seitig gerendert und als `availableWidgets` ins Alpine-Objekt geinlined:

```blade
availableWidgets: @json($widgets),
```

**Filter-Propagation:**

Filter-Änderungen werden als `dashboard-filter-changed`-Event an alle Widget-Komponenten im DOM verteilt:

```js
broadcastFilters() {
    window.dispatchEvent(new CustomEvent('dashboard-filter-changed', {
        detail: this.filters
    }));
}
```

Jede Widget-Komponente hört dieses Event in ihrem `init()`-Block:

```js
window.addEventListener('dashboard-filter-changed', (e) => {
    this.months    = e.detail.months;
    this.branchId  = e.detail.branch_id;
    this.loadData();
});
```

---

### Widget-Komponenten

Jedes Widget liegt als eigenständige Blade-Komponente unter:
```
resources/views/components/statistics/widgets/{widget-id}.blade.php
```

Die Komponente enthält:
- Ein `<div x-data="widgetXxx()" x-init="init()">` als Wurzel-Element
- Die Alpine-Funktion `widgetXxx()` in `public/js/statistics-widgets.js`
- Eigene API-Aufrufe (meist `fetch()` gegen bestehende Phorest/Stats-Endpunkte)
- Eigene Ladezustands-Behandlung (`loading`, `error`)

**Beispiel-Struktur einer Widget-Komponente:**

```blade
<div
    x-data="widgetSalesMonthlyOverview()"
    x-init="init()"
    data-widget-id="sales-monthly-overview"
    class="card-glattt"
>
    {{-- Widget-Header --}}
    <div class="card-glattt-header">
        <h3>Monatsübersicht Verkäufe</h3>
    </div>

    {{-- Lade-Zustand --}}
    <div x-show="loading">...</div>

    {{-- Inhalt --}}
    <div x-show="!loading && !error">...</div>

    {{-- Fehler --}}
    <div x-show="error">...</div>
</div>
```

---

### Drag & Drop

Das Sortierverhalten wird über [SortableJS](https://sortablejs.github.io/Sortable/) implementiert. Die Initialisierung erfolgt in der `init()`-Funktion des Haupt-Alpine-Objekts nach DOM-Bereit:

```js
Sortable.create(document.getElementById('dashboard-sortable'), {
    handle: '.widget-drag-handle',
    animation: 150,
    onEnd: () => { this.hasUnsavedChanges = true; }
});
```

---

### Layout speichern

Der `saveLayout()`-Aufruf liest die aktuelle DOM-Reihenfolge aus und sendet sie per POST an den Server:

```js
saveLayout() {
    const items = document.querySelectorAll('#dashboard-sortable > [data-widget-id]');
    const widgets = [...items].map(el => ({
        id:    el.dataset.widgetId,
        width: el.dataset.widgetWidth ?? 'full',
    }));
    fetch('/hub/reports/custom-dashboard/save', {
        method: 'POST',
        body: JSON.stringify({ widgets }),
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': '...' }
    });
}
```

!!! warning "Wichtig"
    Der Selector `#dashboard-sortable > [data-widget-id]` (direktes Kind-Element) ist notwendig, da Widget-interne Buttons (z. B. Breite-Toggle, Entfernen) ebenfalls `data-widget-id` tragen können.

---

### Berechtigungen

| Permission | Beschreibung | Standard-Rolle |
|------------|-------------|----------------|
| `custom-dashboard.share` | Darf Dashboards per Link und mit Nutzern teilen | Admin |
| `view_report_sales_statistics` | Zugang zu Verkaufs-Widgets | Manager, Admin |
| `view_report_staff_performance` | Zugang zu Mitarbeiter-Widgets | Manager, Admin |
| `view_report_client_statistics` | Zugang zu Kunden-Widgets | Manager, Admin |
| `view_report_upcoming_consultations` | Zugang zu Beratungs-KPI-Widget | alle Hub-Nutzer |
| `view_report_past_consultations` | Zugang zu vergangenen Beratungsstatistiken | alle Hub-Nutzer |
| `view_report_appointments_body_zones` | Zugang zu Termin-Widgets | alle Hub-Nutzer |
| `view_report_rescheduled_cancelled` | Zugang zu Stornierungswidgets | Manager, Admin |
| `view_report_client_courses` | Zugang zu Paket-Widgets | alle Hub-Nutzer |
| `view_report_ads_analysis` | Zugang zu Ads-Widgets | Manager, Admin |

---

### Sicherheitshinweise

- Beim Speichern (`save()`-Controller) werden alle Widget-IDs gegen `WidgetRegistry::forUser($user)` geprüft — unbekannte oder nicht erlaubte IDs werden still verworfen
- Share-Token-Routen sind durch das `can:custom-dashboard.share`-Middleware geschützt
- Beim Klonen eines geteilten Dashboards werden ebenfalls nur Widget-IDs übernommen, für die der Ziel-Nutzer berechtigt ist
- Geteilte Dashboard-Ansichten (`/hub/reports/shared/{token}`) sind schreibgeschützt — nur lesen, keine Datenänderung möglich

---

### Relevante Dateien

| Datei | Zweck |
|-------|-------|
| `app/Services/Statistics/WidgetRegistry.php` | Zentrale Widget-Bibliothek |
| `app/Models/CustomDashboard.php` | Eloquent-Model mit Sharing-Methoden |
| `app/Http/Controllers/CustomDashboardController.php` | HTTP-Controller |
| `resources/views/hub/reports/custom-dashboard.blade.php` | Haupt-View + Alpine-Initialisierung |
| `resources/views/hub/reports/shared-dashboard.blade.php` | Schreibgeschützte Teilen-Ansicht |
| `resources/views/hub/reports/partials/custom-dashboard/widget-selector-modal.blade.php` | Widget-Auswahl-Modal |
| `resources/views/hub/reports/partials/custom-dashboard/share-modal.blade.php` | Teilen-Modal |
| `resources/views/hub/reports/partials/custom-dashboard/shared-with-me-panel.blade.php` | Geteilt-mit-mir-Panel |
| `resources/views/components/statistics/widgets/*.blade.php` | 29 Widget-Blade-Komponenten |
| `public/js/statistics-widgets.js` | Alpine-Funktionen für alle Widgets |
| `database/migrations/2026_05_11_143506_create_custom_dashboards_table.php` | DB-Migration |
| `database/migrations/2026_05_11_145342_add_custom_dashboard_share_permission.php` | Permission-Migration |
| `routes/web.php` | Route-Definitionen (Zeilen ~217–232) |
