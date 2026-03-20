# Reisekosten-Modul

## Nutzerdokumentation

### Übersicht

Das Reisekosten-Modul ermöglicht die digitale Erfassung, Berechnung und Einreichung von Reisekostenabrechnungen. Die Anspruchstage werden automatisch aus dem Dienstplan (askDANTE) ermittelt – nur Tage mit einem reisekostenrelevanten Abwesenheitstyp können abgerechnet werden.

**URL:** `/hub/staff/reisekosten`

> Siehe auch: [Reisekosten – Freigabe](REISEKOSTEN-FREIGABE.md) für die Prüfung und Genehmigung eingereichte Abrechnungen.

---

### Workflow

```
Mitarbeiter auswählen → Anspruchstage laden → Reisekostenabrechnung erstellen → Belege hochladen → Einreichen → (Genehmigung)
```

| Status | Bedeutung |
|--------|-----------|
| **Entwurf** | Abrechnung angelegt, kann weiter bearbeitet werden |
| **Eingereicht** | Abrechnung eingereicht, wartet auf Genehmigung |
| **Genehmigt** | Abrechnung genehmigt, keine Änderungen mehr möglich |
| **Abgelehnt** | Abrechnung abgelehnt, kann angepasst und erneut eingereicht werden |

---

### Reisekostenabrechnung anlegen

#### 1. Mitarbeiter auswählen

Oben auf der Seite einen Mitarbeiter aus der Dropdown-Liste auswählen. Es werden alle Mitarbeiter aus askDANTE angezeigt (sortiert nach Nachname). Ein Jahr kann über die Jahr-Auswahl gewechselt werden.

#### 2. Anspruchstage

Nach Auswahl eines Mitarbeiters werden dessen Anspruchstage angezeigt – das sind Arbeitstage mit einem reisekostenrelevanten Abwesenheitstyp (z.B. Dienstreise). Die Tage werden als Tabelle dargestellt:

| Spalte | Beschreibung |
|--------|-------------|
| **Datum** | Einzeldatum oder Zeitraum (bei mehrtägigen Reisen) |
| **Typ** | Abwesenheitstyp lt. askDANTE |
| **Status** | Noch offen / Entwurf / Eingereicht / Genehmigt / Abgelehnt |
| **Betrag** | Berechneter Gesamtbetrag (wenn Abrechnung vorhanden) |
| **Aktion** | Button zum Anlegen oder Bearbeiten |

Klick auf einen Anspruchstag öffnet das Formular.

---

### Formular: Reise erfassen

Das Formular ist in folgende Abschnitte unterteilt:

#### Reisedatum

- **Reise-Beginn** und **Reise-Ende**: Werden über einen Kalender (Flatpickr) gewählt. Nur die zum Anspruchstag passenden Daten sind auswählbar.

#### Arbeitszeit (pro Reisetag)

Für jeden Tag der Reise wird eine Zeile mit Arbeitszeitfeldern angezeigt:

| Feld | Beschreibung |
|------|-------------|
| **Abreise um** / **Arbeitsbeginn** | Uhrzeit-Eingabe. Am ersten Reisetag steht „Abreise um", an allen weiteren Tagen „Arbeitsbeginn". |
| **Arbeitsende** / **Ankunft zu Hause um** | Uhrzeit-Eingabe. An allen Tagen außer dem letzten steht „Arbeitsende", am letzten Tag „Ankunft zu Hause um". |
| **Pause (Min.)** | Automatisch berechnet, nicht editierbar. |

!!! info "Automatische Pausenberechnung"
    Die Pause wird pro Tag nach dem Arbeitszeitgesetz berechnet:
    
    | Arbeitszeit | Pause |
    |------------|-------|
    | Bis 6 Stunden | 0 Minuten |
    | 6:00 – 6:30 | Gleitend von 0 bis 30 Minuten |
    | 6:30 – 9:00 | 30 Minuten |
    | 9:00 – 9:15 | Gleitend von 30 bis 45 Minuten |
    | Ab 9:15 | 45 Minuten |
    
    Beispiel: Bei 6 Stunden und 22 Minuten → 22 Minuten Pause.

Unter den Tageszeilen wird die **Gesamtzeit** aller Tage angezeigt.

#### Übernachtung & Verpflegung

!!! note "Nur sichtbar"
    Dieser Abschnitt erscheint nur, wenn der Abwesenheitstyp eine Verpflegungspauschale erlaubt.

**Übernachtung:**

| Feld | Beschreibung |
|------|-------------|
| **Übernachtung** | Toggle ein/aus |
| **Hotel bezahlt von** | „Hotel von glattt bezahlt" oder „Selbst bezahlt" (segmented control) |
| **Hotelname** | Nur bei „Selbst bezahlt" – Name des Hotels |
| **Hotelkosten** | Nur bei „Selbst bezahlt" – Kosteneingabe in EUR |
| **Hotelbeleg** | Upload-Zone für Belege (PDF, JPG, PNG, max. 10 MB) |

**Verpflegung (Mahlzeiten-Matrix):**

Für jeden Reisetag können die **gewährten Mahlzeiten** per Checkbox markiert werden:

| Mahlzeit | Kürzung | Hinweis |
|----------|---------|---------|
| **Frühstück** | 5,60 € (20% von 28 €) | Am Anreisetag nicht auswählbar |
| **Mittagessen** | 11,20 € (40% von 28 €) | — |
| **Abendessen** | 11,20 € (40% von 28 €) | Am Abreisetag nicht auswählbar |

Darunter wird die berechnete **Verpflegungspauschale** angezeigt (Brutto, Abzug, Netto).

!!! info "Verpflegungspauschale nach gesetzlichen Regeln"
    - **Eintägige Reise:** 14 € bei mindestens 8 Stunden Arbeitszeit
    - **Mehrtägige Reise:** An- und Abreisetag je 14 €, volle Zwischentage je 28 €
    - Gewährte Mahlzeiten werden als Kürzung abgezogen

#### An- und Abreise

**Verkehrsmittel wählen:** Auto oder Bahn (segmented control oben rechts).

**Bei Auto:**

| Feld | Beschreibung |
|------|-------------|
| **Abfahrtsort** | Adresse suchen (Nominatim-Geocoding) – Straße, PLZ, Stadt werden automatisch befüllt |
| **Ziel** | Institut (aus Phorest-Filialen) oder Anderes Ziel (Adresssuche) |
| **Entfernung (km)** | Wird automatisch über OSRM-Routing berechnet oder manuell eingegeben |
| **Hin- und Rückfahrt** | Checkbox (standardmäßig aktiviert) – verdoppelt die Strecke |

Am Ende wird die Berechnung angezeigt: `X km × 2 × 0,30 €/km = Y,YY €`

**Bei Bahn:**

| Feld | Beschreibung |
|------|-------------|
| **Ticket bezahlt von** | „Ticket von glattt bezahlt" oder „Selbst bezahlt" |
| **Ticketkosten** | Nur bei „Selbst bezahlt" – Kosteneingabe in EUR |
| **Bahnticket-Beleg** | Upload-Zone für Beleg |

#### Zusätzliche Kosten

Dynamische Liste mit Einzelpositionen:

| Feld | Beschreibung |
|------|-------------|
| **Beschreibung** | Freitext für die Kostenposition |
| **Betrag** | Betrag in EUR |
| **Beleg** | Upload pro Position (Pflicht für die Einreichung) |

Über „+ Kosten hinzufügen" können beliebig viele Positionen angelegt werden.

#### Notizen

Freitext-Feld für zusätzliche Hinweise zur Reise.

#### Gesamtübersicht

Am Ende des Formulars wird eine Zusammenfassung aller Kosten angezeigt:

| Position | Beispiel |
|----------|---------|
| Fahrtkosten / Bahnticket | 120,00 € |
| Hotelkosten | 89,00 € |
| Verpflegungspauschale | 42,00 € |
| Zusätzliche Kosten | 15,50 € |
| **Gesamtbetrag** | **266,50 €** |

---

### Einreichen

Klick auf **„Einreichen"** prüft:

- Alle Pflichtfelder ausgefüllt (Datum, Arbeitszeiten für alle Tage, Reisedaten)
- Belege vorhanden (wo erforderlich: Bahnticket bei Selbstzahlung, Belege bei zusätzlichen Kosten)

Nach dem Einreichen ändert sich der Status auf „Eingereicht" und die Abrechnung kann nicht mehr bearbeitet werden (bis zur Ablehnung).

---

---

## Entwicklerdokumentation

### Dateistruktur

```
resources/views/hub/staff/
└── reisekosten.blade.php              # Komplette Seite (Alpine.js SPA)

app/Http/Controllers/
└── TravelExpenseController.php        # API-Controller

app/Models/
├── TravelExpense.php                  # Hauptmodell
└── TravelExpenseReceipt.php           # Belegmodell

database/migrations/
├── 2026_03_11_135314_create_travel_expenses_table.php
├── 2026_03_11_135315_create_travel_expense_receipts_table.php
├── 2026_03_12_090205_add_destination_address_fields_to_travel_expenses_table.php
├── 2026_03_12_093500_add_departure_address_fields_to_travel_expenses_table.php
├── 2026_03_12_141446_add_travel_mode_fields_to_travel_expenses_table.php
├── 2026_03_12_143229_add_amount_description_to_travel_expense_receipts_table.php
├── 2026_03_13_105158_add_hotel_and_meal_deductions_to_travel_expenses_table.php
├── 2026_03_13_125120_add_work_times_to_travel_expenses_table.php
└── 2026_03_13_130931_add_round_trip_to_travel_expenses_table.php
```

---

### Architektur

```
Browser (Alpine.js)
    │
    ├── GET  /travel-expenses/qualifying/{userId}     → qualifyingDays()
    ├── GET  /travel-expenses/user/{userId}            → index()
    ├── POST /travel-expenses                          → store()
    ├── GET  /travel-expenses/{id}                     → show()
    ├── PUT  /travel-expenses/{id}                     → update()
    ├── POST /travel-expenses/{id}/submit              → submit()
    ├── POST /travel-expenses/{id}/receipts            → uploadReceipt()
    ├── DELETE /travel-expenses/receipts/{id}           → deleteReceipt()
    └── GET  /travel-expenses/institutes               → institutes()
                    │
                    └── TravelExpenseController
                            │
                            ├── TravelExpense Model (recalculate)
                            ├── askDANTE API (Anspruchstage)
                            └── Phorest API (Institute/Filialen)
```

Das Frontend ist ein **Alpine.js**-Component (`reisekostenComponent`), das als Single-Page-App fungiert. Alle Daten werden per `fetch()` von den Laravel-API-Endpunkten geladen.

---

### Routes

| Method | URL | Name | Controller-Methode |
|--------|-----|------|--------------------|
| GET | `/travel-expenses/institutes` | `travel-expenses.institutes` | `institutes()` |
| GET | `/travel-expenses/qualifying/{userId}` | `travel-expenses.qualifying` | `qualifyingDays()` |
| GET | `/travel-expenses/user/{userId}` | `travel-expenses.index` | `index()` |
| POST | `/travel-expenses` | `travel-expenses.store` | `store()` |
| GET | `/travel-expenses/{travelExpense}` | `travel-expenses.show` | `show()` |
| PUT | `/travel-expenses/{travelExpense}` | `travel-expenses.update` | `update()` |
| POST | `/travel-expenses/{travelExpense}/submit` | `travel-expenses.submit` | `submit()` |
| POST | `/travel-expenses/{travelExpense}/receipts` | `travel-expenses.receipts.upload` | `uploadReceipt()` |
| DELETE | `/travel-expenses/receipts/{receipt}` | `travel-expenses.receipts.delete` | `deleteReceipt()` |

---

### Datenbank-Schema

#### `travel_expenses`

| Spalte | Typ | Default | Beschreibung |
|--------|-----|---------|-------------|
| `id` | bigint (PK) | auto | |
| `askdante_user_id` | string | | askDANTE Mitarbeiter-ID |
| `askdante_user_name` | string | | Anzeigename |
| `departure_name` | string | null | Name des Abfahrtsorts |
| `departure_street` | string | null | Straße + Hausnummer |
| `departure_postal_code` | string(10) | null | PLZ |
| `departure_city` | string | null | Stadt |
| `travel_mode` | string(10) | 'car' | `car` oder `train` |
| `train_paid_by` | string(20) | null | `company` oder `self` |
| `train_cost` | decimal(8,2) | null | Ticketkosten |
| `absence_type_id` | FK → absence_types | | Abwesenheitstyp |
| `travel_date_start` | date | | Reisebeginn |
| `travel_date_end` | date | | Reiseende |
| `work_start` | string(5) | null | Legacy-Feld (HH:MM) |
| `work_end` | string(5) | null | Legacy-Feld (HH:MM) |
| `break_minutes` | unsigned int | 30 | Auto-berechnet (Summe aller Tage) |
| `work_times` | JSON | null | Pro-Tag Arbeitszeiten: `{"2026-03-11": {"start": "08:00", "end": "17:30"}, ...}` |
| `total_work_minutes` | unsigned int | null | Netto-Arbeitszeitminuten gesamt |
| `has_overnight` | boolean | false | Übernachtung ja/nein |
| `has_breakfast` | boolean | false | Legacy-Feld |
| `hotel_paid_by` | string(20) | null | `company` oder `self` |
| `hotel_name` | string | null | Name des Hotels |
| `hotel_cost` | decimal(8,2) | null | Hotelkosten |
| `meal_deductions` | JSON | null | Mahlzeiten-Matrix: `{"2026-03-11": {"breakfast": true, "lunch": false, "dinner": true}, ...}` |
| `meal_allowance_gross` | decimal(8,2) | 0 | Verpflegungspauschale brutto |
| `meal_allowance_deduction` | decimal(8,2) | 0 | Kürzung durch Mahlzeiten |
| `meal_allowance_net` | decimal(8,2) | 0 | Netto-Verpflegungspauschale |
| `destination` | string | null | Zielort (Text) |
| `destination_type` | string(20) | 'institute' | `institute` oder `other` |
| `destination_name` | string | null | Zielname |
| `destination_branch_id` | string | null | Phorest Branch-ID |
| `destination_street` | string | null | Ziel-Straße |
| `destination_postal_code` | string(10) | null | Ziel-PLZ |
| `destination_city` | string | null | Ziel-Stadt |
| `distance_km` | decimal(8,1) | 0 | Einfache Entfernung |
| `round_trip` | boolean | true | Hin- und Rückfahrt |
| `km_rate` | decimal(4,2) | 0.30 | Kilometersatz |
| `travel_cost_amount` | decimal(8,2) | 0 | Berechnete Fahrtkosten |
| `additional_costs` | decimal(8,2) | 0 | Zusätzliche Kosten |
| `additional_costs_description` | text | null | Beschreibung der Kosten |
| `total_amount` | decimal(8,2) | 0 | Gesamtbetrag |
| `status` | string | 'draft' | `draft`, `submitted`, `approved`, `rejected` |
| `submitted_by` | FK → users | null | Eingereicht von |
| `submitted_at` | timestamp | null | Einreichungsdatum |
| `approved_by` | FK → users | null | Genehmigt von |
| `approved_at` | timestamp | null | Genehmigungsdatum |
| `rejection_reason` | text | null | Ablehnungsgrund |
| `notes` | text | null | Notizen |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

**Indizes:** `[askdante_user_id, travel_date_start]`, `status`

#### `travel_expense_receipts`

| Spalte | Typ | Default | Beschreibung |
|--------|-----|---------|-------------|
| `id` | bigint (PK) | auto | |
| `travel_expense_id` | FK → travel_expenses | | Cascade on Delete |
| `file_path` | string | | Storage-Pfad |
| `original_name` | string | | Original-Dateiname |
| `mime_type` | string | | pdf/jpg/jpeg/png |
| `file_size` | unsigned int | | Dateigröße in Bytes |
| `amount` | decimal(8,2) | null | Belegbetrag |
| `description` | string(255) | null | Beschreibung |
| `type` | string(20) | 'additional_cost' | `additional_cost`, `train_ticket` oder `hotel` |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

---

### TravelExpense Model

**Datei:** `app/Models/TravelExpense.php`

#### Beziehungen

| Relation | Typ | Ziel |
|----------|-----|------|
| `absenceType()` | BelongsTo | `AbsenceType` |
| `submitter()` | BelongsTo | `User` (via `submitted_by`) |
| `approver()` | BelongsTo | `User` (via `approved_by`) |
| `receipts()` | HasMany | `TravelExpenseReceipt` |

#### Berechnungsmethoden

##### `autoBreakForRawMinutes(int $raw): int`

Berechnet die gesetzliche Mindestpause basierend auf der Brutto-Arbeitszeit in Minuten:

```php
≤ 360 min (6h)     → 0 min
≤ 390 min (6,5h)   → raw - 360 (gleitend 0-30)
≤ 540 min (9h)     → 30 min
≤ 555 min (9,25h)  → 30 + (raw - 540) (gleitend 30-45)
> 555 min           → 45 min
```

##### `calculateWorkMinutes(): int`

Berechnet die Netto-Arbeitszeit aus `work_times` (pro Tag) mit automatischem Pausenabzug. Fallback auf Legacy-Felder `work_start`/`work_end` wenn `work_times` leer ist.

##### `calculateMealAllowance(): array`

Gibt `['gross', 'deduction', 'net']` zurück:

- **Eintägig:** 14 € wenn ≥ 8h Arbeitszeit
- **Mehrtägig:** An-/Abreisetag je 14 €, volle Zwischentage je 28 €
- **Kürzungen** aus `meal_deductions` JSON: Frühstück 20% (5,60 €), Mittag 40% (11,20 €), Abend 40% (11,20 €) vom 24h-Satz (28 €)
- **Legacy-Fallback:** `has_breakfast` → 20% Kürzung

##### `recalculate(): void`

Orchestriert alle Berechnungen und setzt die Ergebnis-Felder:

1. `total_work_minutes` = `calculateWorkMinutes()`
2. **Fahrtkosten:** Bahn → `train_cost` (wenn selbst bezahlt); Auto → `distance_km × multiplier × km_rate`
3. **Verpflegung:** `calculateMealAllowance()` → `meal_allowance_gross/deduction/net`
4. **Hotel:** `hotel_cost` wenn `hotel_paid_by === 'self'`
5. **Gesamt:** `total_amount = meal_net + travel_cost + hotel + additional_costs`

---

### TravelExpenseController

**Datei:** `app/Http/Controllers/TravelExpenseController.php`

#### `qualifyingDays(Request $request, string $userId)`

Ermittelt die anspruchsberechtigten Tage:

1. Lädt `AbsenceType` mit `travel_expenses = true`
2. Fragt askDANTE-Abwesenheiten ab (per `StaffController::absences`)
3. Mappt bestehende `TravelExpense`-Einträge per Datumsbereich
4. Gibt pro Tag zurück: Datum, Abwesenheitstyp, `allows_meal_allowance`, Claim-Daten (wenn vorhanden)

#### `store(Request $request)` / `update(Request $request, TravelExpense $travelExpense)`

Validierung, Erstellen/Aktualisieren, `recalculate()`, Speichern.

**Wichtige Validierungsregeln:**

```php
'work_times'        => 'nullable|array',
'work_times.*.start' => 'nullable|date_format:H:i',
'work_times.*.end'   => 'nullable|date_format:H:i',
'meal_deductions'   => 'nullable|array',
'round_trip'        => 'nullable|boolean',
```

#### `submit(TravelExpense $travelExpense)`

Einreichung mit Prüfungen:

- Status muss `draft` sein
- Bei `additional_costs > 0` müssen Belege vom Typ `additional_cost` vorhanden sein
- Bei Bahn + Selbstzahlung muss ein Beleg vom Typ `train_ticket` vorhanden sein

#### `uploadReceipt(Request $request, TravelExpense $travelExpense)`

- Max. 10 MB, Formate: PDF, JPG, JPEG, PNG
- Speicherort: `travel-expense-receipts/{expense_id}/` (GCS oder public disk)
- Beleg-Typen: `additional_cost` (default), `train_ticket`, `hotel`

---

### Alpine.js Component

Die komplette UI ist in `reisekosten.blade.php` als einzelnes Alpine.js-Component implementiert.

#### Wichtige State-Eigenschaften

| Property | Typ | Beschreibung |
|----------|-----|-------------|
| `form` | Object | Alle Formularfelder |
| `form.work_times` | Object | `{date: {start, end}}` pro Reisetag |
| `form.meal_deductions` | Object | `{date: {breakfast, lunch, dinner}}` pro Reisetag |
| `form.round_trip` | Boolean | Hin- und Rückfahrt (default: true) |
| `trainReceipts` | Array | Bahnticket-Belege |
| `hotelReceipts` | Array | Hotel-Belege |
| `costItems` | Array | Zusätzliche Kostenpositionen mit Belegen |

#### Wichtige Computed Getters

| Getter | Rückgabe | Logik |
|--------|----------|-------|
| `travelDays` | `string[]` | Array von Datumsstrings (YYYY-MM-DD) von Start bis Ende |
| `autoBreakMinutes` | `number` | Summe der Auto-Pausen über alle Tage |
| `calculatedTravel` | `number` | Bahn: `train_cost`; Auto: `km × multiplier × 0.30` |
| `calculatedHotel` | `number` | `hotel_cost` wenn selbst bezahlt, sonst 0 |
| `calculatedMeal` | `{gross, deduction, net}` | Verpflegungspauschale mit Kürzungen |
| `calculatedTotal` | `number` | Summe aller Kostenarten |
| `canSubmit` | `boolean` | Prüft alle Pflichtfelder und Belege |
| `submitErrors` | `string[]` | Fehlermeldungen für fehlende Felder |

#### Reaktivitäts-Helfer

```javascript
// Setzt work_times reaktiv (Alpine.js Object-Mutation)
setWorkTime(day, field, value) {
    const current = this.form.work_times[day] || { start: '', end: '' };
    current[field] = value;
    this.form.work_times = { ...this.form.work_times, [day]: { ...current } };
}
```

---

### Externe Dienste

| Dienst | Verwendung | Endpoint |
|--------|-----------|----------|
| **askDANTE API** | Mitarbeiterliste, Abwesenheiten | `my.askdante.com` |
| **Phorest API** | Institut-/Filialliste für Zielauswahl | Branches-Endpoint |
| **Nominatim** | Geocoding für Abfahrtsort und freie Zieladresse | `nominatim.openstreetmap.org` |
| **OSRM** | Routenberechnung (Entfernung in km) | `router.project-osrm.org` |

---

### SQL für PROD-Migration

Alle Spalten, die nachträglich hinzugefügt wurden (falls die Laravel-Migrationen nicht direkt auf PROD ausgeführt werden können):

```sql
-- Migration 3: Destination-Adressfelder
ALTER TABLE travel_expenses
  ADD COLUMN destination_type VARCHAR(20) NOT NULL DEFAULT 'institute' AFTER destination,
  ADD COLUMN destination_name VARCHAR(255) NULL AFTER destination_type,
  ADD COLUMN destination_street VARCHAR(255) NULL AFTER destination_name,
  ADD COLUMN destination_postal_code VARCHAR(10) NULL AFTER destination_street,
  ADD COLUMN destination_city VARCHAR(255) NULL AFTER destination_postal_code;

-- Migration 4: Departure-Adressfelder
ALTER TABLE travel_expenses
  ADD COLUMN departure_name VARCHAR(255) NULL AFTER askdante_user_name,
  ADD COLUMN departure_street VARCHAR(255) NULL AFTER departure_name,
  ADD COLUMN departure_postal_code VARCHAR(10) NULL AFTER departure_street,
  ADD COLUMN departure_city VARCHAR(255) NULL AFTER departure_postal_code;

-- Migration 5: Travel Mode
ALTER TABLE travel_expenses
  ADD COLUMN travel_mode VARCHAR(10) NOT NULL DEFAULT 'car' AFTER departure_city,
  ADD COLUMN train_paid_by VARCHAR(20) NULL AFTER travel_mode,
  ADD COLUMN train_cost DECIMAL(8,2) NULL AFTER train_paid_by;

-- Migration 6: Receipts erweitern
ALTER TABLE travel_expense_receipts
  ADD COLUMN amount DECIMAL(8,2) NULL AFTER file_size,
  ADD COLUMN description VARCHAR(255) NULL AFTER amount,
  ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'additional_cost' AFTER description;

-- Migration 7: Hotel & Mahlzeiten-Abzüge
ALTER TABLE travel_expenses
  ADD COLUMN hotel_paid_by VARCHAR(20) NULL AFTER has_breakfast,
  ADD COLUMN hotel_name VARCHAR(255) NULL AFTER hotel_paid_by,
  ADD COLUMN hotel_cost DECIMAL(8,2) NULL AFTER hotel_name,
  ADD COLUMN meal_deductions JSON NULL AFTER hotel_cost;

-- Migration 8: Work Times (pro Tag)
ALTER TABLE travel_expenses
  ADD COLUMN work_times JSON NULL AFTER break_minutes;

-- Datenmigration: bestehende work_start/work_end in work_times überführen
UPDATE travel_expenses
SET work_times = JSON_OBJECT(
  DATE_FORMAT(travel_date_start, '%Y-%m-%d'),
  JSON_OBJECT('start', work_start, 'end', work_end)
)
WHERE work_start IS NOT NULL AND work_end IS NOT NULL;

-- Migration 9: Hin- und Rückfahrt
ALTER TABLE travel_expenses
  ADD COLUMN round_trip TINYINT(1) NOT NULL DEFAULT 1 AFTER distance_km;
```

!!! warning "Hinweis zur Datenmigration"
    Das SQL für Migration 8 setzt bei mehrtägigen Reisen nur den Starttag mit den alten Arbeitszeiten. Die Laravel-Migration (`php artisan migrate`) übernimmt automatisch alle Tage. Wenn möglich, Laravel-Migrationen direkt auf PROD verwenden.
