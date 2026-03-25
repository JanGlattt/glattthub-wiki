# Preislisten-Modul (Zahlungspläne)

> Vollständige Dokumentation für das Preislistenmanagement im glatttHub

## Inhaltsverzeichnis

1. [Übersicht](#übersicht)
2. [Anwender-Dokumentation](#anwender-dokumentation)
   - [Grundkonzept](#grundkonzept)
   - [Preisliste erstellen](#preisliste-erstellen)
   - [Preisgruppen definieren](#preisgruppen-definieren)
   - [Rabatte einrichten](#rabatte-einrichten)
   - [Branch-Zuordnung](#branch-zuordnung)
   - [Preislisten verwalten](#preislisten-verwalten)
3. [Entwickler-Dokumentation](#entwickler-dokumentation)
   - [Architektur](#architektur)
   - [Datenbankstruktur](#datenbankstruktur)
   - [Models](#models)
   - [Controller & API](#controller--api)
   - [Frontend-Komponenten](#frontend-komponenten)
   - [Erweiterungsmöglichkeiten](#erweiterungsmöglichkeiten)

---

## Übersicht

Das Preislisten-Modul ermöglicht die Verwaltung von Körperzonen-basierten Preisen (KPZ) für GLATTT-Behandlungspakete. Es unterstützt:

- **Flexible Preisgestaltung** nach Anzahl der Körperzonen (KPZ)
- **Zeitliche Gültigkeit** mit automatischer Versionierung
- **Multi-Branch-Support** für standortspezifische Preise
- **Rabattsysteme** (Euro-Beträge oder Prozent)
- **Historische Nachverfolgbarkeit** aller Preisänderungen

---

## Anwender-Dokumentation

### Grundkonzept

Das Preissystem basiert auf **Körperpunktzonen (KPZ)**. Je mehr Körperzonen ein Kunde behandeln lässt, desto höher der monatliche Betrag. Eine Preisliste definiert:

| Begriff | Bedeutung |
|---------|-----------|
| **KPZ** | Körperpunktzone - eine behandelbare Körperzone |
| **Ganzkörper KPZ** | Maximale Anzahl KPZ für eine Ganzkörperbehandlung |
| **Preisgruppe** | Kombination aus KPZ-Anzahl, Laufzeit und monatlichem Preis |
| **Rabatt** | Preisnachlass ab einer bestimmten KPZ-Anzahl |

### Preisliste erstellen

1. Navigiere zu **Verträge → Preise** im Hub
2. Klicke auf **"Neue Preisliste"**
3. Fülle die Grundeinstellungen aus:

| Feld | Beschreibung | Pflicht |
|------|--------------|---------|
| Name | Eindeutiger Name (z.B. "Normalpreis ab 01.03.2026") | ✓ |
| Gültig ab | Startdatum der Preisliste | ✓ |
| Branch | Zuordnung zu einem oder mehreren Standorten | – |
| Ganzkörper KPZ | Max. KPZ für Ganzkörper (Standard: 6) | – |
| Aktiv | Ob die Preisliste verwendet werden soll | – |
| Notizen | Interne Bemerkungen | – |

### Preisgruppen definieren

Preisgruppen legen fest, welchen Monatsbetrag ein Kunde zahlt:

**Beispiel-Konfiguration:**

| KPZ | Bezeichnung | Laufzeit | € / Monat | Gesamt |
|-----|-------------|----------|-----------|--------|
| 1 | Eine Zone | 12 Monate | 49,00 € | 588,00 € |
| 2 | Zwei Zonen | 12 Monate | 79,00 € | 948,00 € |
| 3 | Drei Zonen | 12 Monate | 99,00 € | 1.188,00 € |
| 6 | Ganzkörper | 12 Monate | 149,00 € | 1.788,00 € |

**Tipps:**
- Die Bezeichnung ist optional, wird aber in Verträgen angezeigt
- „Ganzkörper" wird automatisch für die max. KPZ-Anzahl gesetzt
- Verschiedene Laufzeiten (6, 12, 24 Monate) können für dieselbe KPZ-Anzahl angelegt werden

### Rabatte einrichten

Rabatte werden automatisch angewendet, wenn die Mindest-KPZ erreicht wird:

| Name | Ab KPZ | Typ | Wert | Beschreibung |
|------|--------|-----|------|--------------|
| Ganzkörper-Rabatt | 6 | Euro | 20,00 € | Abzug bei Ganzkörper |
| Treue-Rabatt | 3 | Prozent | 5 % | 5% ab 3 Zonen |

**Rabatt-Typen:**
- **Euro (fixed)**: Fester Betrag wird vom Monatspreis abgezogen
- **Prozent (percentage)**: Prozentualer Abzug vom Monatspreis

### Branch-Zuordnung

Preislisten können für **alle Standorte** (global) oder **ausgewählte Branches** gelten:

**Global (Standard):**
- Keine Branches ausgewählt → gilt für alle Standorte
- Wird verwendet, wenn kein branch-spezifischer Preis existiert

**Branch-spezifisch:**
- Eine oder mehrere Branches auswählen
- Diese Preisliste überschreibt die globale für diese Standorte
- Ermöglicht unterschiedliche Preise pro Standort

**Beispiel-Szenario:**
```
Preisliste "Standard 2026"    → Global (alle Branches)
Preisliste "München Premium"  → nur Branch "München"
Preisliste "Berlin Special"   → Branches "Berlin Mitte", "Berlin West"
```

Wenn ein Kunde aus München einen Vertrag abschließt, wird automatisch "München Premium" verwendet.

### Preislisten verwalten

**Aktionen für bestehende Preislisten:**

| Aktion | Beschreibung |
|--------|--------------|
| **Bearbeiten** | Preisgruppen und Rabatte ändern |
| **Duplizieren** | Kopie erstellen (z.B. für neue Preisperiode) |
| **Aktivieren/Deaktivieren** | Preisliste ein-/ausschalten |
| **Löschen** | Preisliste entfernen (Vorsicht!) |

**Status-Anzeige:**
- 🟢 **Aktuell gültig**: Diese Preisliste wird derzeit verwendet
- 🔵 **Geplant**: Gültig ab einem zukünftigen Datum
- ⚫ **Inaktiv**: Deaktiviert, wird nicht verwendet

---

## Entwickler-Dokumentation

### Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  resources/views/hub/contracts/prices.blade.php             │
│  public/js/contract-prices.js (Alpine.js)                   │
│  public/css/theme_glattt.css (Sektion: Contract Prices)     │
└─────────────────────┬───────────────────────────────────────┘
                      │ JSON API
┌─────────────────────▼───────────────────────────────────────┐
│                     Controller                               │
│  app/Http/Controllers/ContractPriceController.php           │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                      Models                                  │
│  app/Models/PriceList.php                                   │
│  app/Models/PriceGroup.php                                  │
│  app/Models/PriceDiscount.php                               │
│  app/Models/PriceListBranch.php                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Database                                  │
│  price_lists                                                │
│  price_groups                                               │
│  price_discounts                                            │
│  price_list_branches (Pivot)                                │
└─────────────────────────────────────────────────────────────┘
```

### Datenbankstruktur

#### Tabelle: `price_lists`

```sql
CREATE TABLE price_lists (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    valid_from DATE NOT NULL,
    max_body_zones INT DEFAULT 6,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT NULL,
    created_by BIGINT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_valid_from (valid_from),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### Tabelle: `price_groups`

```sql
CREATE TABLE price_groups (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    price_list_id BIGINT NOT NULL,
    name VARCHAR(255) NULL,
    body_zone_count INT NOT NULL,
    months INT NOT NULL,
    monthly_amount_cents INT NOT NULL,  -- Speicherung in Cent!
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    INDEX idx_body_zone_count (body_zone_count),
    FOREIGN KEY (price_list_id) REFERENCES price_lists(id) ON DELETE CASCADE
);
```

#### Tabelle: `price_discounts`

```sql
CREATE TABLE price_discounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    price_list_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    min_body_zones INT NOT NULL,
    discount_type ENUM('fixed', 'percentage') NOT NULL,
    discount_value INT NOT NULL,  -- Cent oder Prozent*100
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (price_list_id) REFERENCES price_lists(id) ON DELETE CASCADE
);
```

#### Tabelle: `price_list_branches` (Pivot)

```sql
CREATE TABLE price_list_branches (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    price_list_id BIGINT NOT NULL,
    branch_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    UNIQUE KEY (price_list_id, branch_id),
    INDEX idx_branch_id (branch_id),
    FOREIGN KEY (price_list_id) REFERENCES price_lists(id) ON DELETE CASCADE
);
```

### Models

#### PriceList

```php
// Wichtige Methoden:

// Aktuelle Preisliste für Branch holen (mit Fallback auf global)
$priceList = PriceList::getCurrentPriceList($branchId);

// Preisliste für bestimmtes Datum
$priceList = PriceList::getPriceListForDate($date, $branchId);

// Prüfen ob aktuell gültig
$priceList->isCurrentlyValid(); // bool

// Ist global (alle Branches)?
$priceList->is_global; // bool (Accessor)

// Branch-IDs als Array
$priceList->branch_ids; // ['branch-1', 'branch-2']

// Branches synchronisieren
$priceList->syncBranches(['branch-1', 'branch-2']);
```

#### PriceGroup

```php
// Beträge (automatische Cent-Konvertierung)
$group->monthly_amount;           // 49.00 (Euro als float)
$group->monthly_amount_cents;     // 4900 (Cent als int)
$group->formatted_monthly_amount; // "49,00 €"
$group->total_amount;             // 588.00
$group->formatted_total_amount;   // "588,00 €"

// Label für KPZ
$group->body_zone_label;          // "6 KPZ (Ganzkörper)"
```

#### PriceDiscount

```php
// Rabatt-Wert (automatische Konvertierung)
$discount->value;           // 20.00 (Euro) oder 5.00 (Prozent)
$discount->discount_value;  // 2000 (Cent) oder 500 (Prozent*100)
$discount->formatted_value; // "20,00 €" oder "5 %"
```

### Controller & API

**Routen (routes/web.php):**

```php
Route::middleware(['auth', 'hub.access'])->prefix('hub')->group(function () {
    // Preise
    Route::get('/contracts/prices', 'prices')->name('contracts.prices');
    Route::get('/contracts/prices/list', 'getPriceLists');
    Route::get('/contracts/prices/current', 'getCurrentPriceList');
    Route::get('/contracts/prices/{id}', 'getPriceList');
    Route::post('/contracts/prices', 'storePriceList');
    Route::put('/contracts/prices/{id}', 'updatePriceList');
    Route::delete('/contracts/prices/{id}', 'deletePriceList');
    Route::post('/contracts/prices/{id}/duplicate', 'duplicatePriceList');
    Route::post('/contracts/prices/{id}/toggle-status', 'togglePriceListStatus');
    
    // Branches
    Route::get('/contracts/branches', 'getBranches');
});
```

**API Response Format:**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Standard 2026",
        "branch_ids": ["branch-1", "branch-2"],
        "is_global": false,
        "valid_from": "2026-03-01",
        "max_body_zones": 6,
        "is_active": true,
        "is_currently_valid": true,
        "price_groups": [...],
        "discounts": [...]
    }
}
```

### Frontend-Komponenten

#### Alpine.js Component (contract-prices.js)

```javascript
// Wichtige Methoden:

// Preislisten laden
await this.loadPriceLists();

// Branches laden (Phorest API)
await this.loadBranches();

// Branch-Namen für Anzeige
this.getBranchNames(['branch-1', 'branch-2']); // "München, Berlin"

// Branch-Auswahl togglen
this.toggleBranch('branch-id');

// Dezimalzahlen parsen (Komma-Support)
this.parseDecimal('49,99'); // 49.99

// Währung formatieren
this.formatCurrency(49.99); // "49,99 €"
```

#### CSS-Klassen (in theme_glattt.css)

```css
/* Preislisten-Karten */
.price-list-card              /* Hauptkarte */
.price-list-current           /* Aktuell gültige Karte (grüner Rand) */
.price-list-status-indicator  /* Status-Icon (aktiv/geplant/inaktiv) */
.price-list-badge             /* Status-Badge */

/* Branch-Auswahl */
.branch-select-container      /* Container für Branch-Checkboxen */
.branch-checkbox-item         /* Einzelne Branch-Checkbox */
.branch-indicator             /* Branch-Anzeige in Karte */
```

### Erweiterungsmöglichkeiten

#### Neue Rabatt-Typen hinzufügen

1. Migration für neuen Typ:
```php
Schema::table('price_discounts', function (Blueprint $table) {
    $table->enum('discount_type', ['fixed', 'percentage', 'free_month'])->change();
});
```

2. Model-Accessor erweitern:
```php
public function getFormattedValueAttribute(): string
{
    return match($this->discount_type) {
        'fixed' => number_format($this->value, 2, ',', '.') . ' €',
        'percentage' => number_format($this->value, 0) . ' %',
        'free_month' => $this->value . ' Gratis-Monat(e)',
    };
}
```

#### Preise in Vertragsmodul verwenden

```php
// Im Vertragsmodul:
$branchId = $client->branch_id;
$priceList = PriceList::getCurrentPriceList($branchId);

if ($priceList) {
    $bodyZoneCount = 4;
    $groups = $priceList->getPriceGroupsForBodyZones($bodyZoneCount);
    $discounts = $priceList->getApplicableDiscounts($bodyZoneCount);
    
    // Monatspreis berechnen
    $monthlyPrice = $groups->first()->monthly_amount;
    
    foreach ($discounts as $discount) {
        if ($discount->discount_type === 'fixed') {
            $monthlyPrice -= $discount->value;
        } else {
            $monthlyPrice *= (1 - $discount->value / 100);
        }
    }
}
```

---

## Migrations-Übersicht

| Datei | Beschreibung |
|-------|--------------|
| `2026_02_09_170000_create_price_lists_table.php` | Haupttabelle |
| `2026_02_09_170001_create_price_groups_table.php` | Preisgruppen |
| `2026_02_09_170002_create_price_discounts_table.php` | Rabatte |
| `2026_02_09_180000_add_branch_id_to_price_lists_table.php` | Branch-Feld (deprecated) |
| `2026_02_09_190000_create_price_list_branches_pivot_table.php` | Multi-Branch-Support |

---

## Siehe auch

- [glatttPakete.md](./glatttPakete.md) - Überblick Vertragsmodul
- [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) - UI-Komponenten
