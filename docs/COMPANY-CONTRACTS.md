# Unternehmensverträge

Zentrales Modul zur Verwaltung aller Unternehmensverträge der Firma (Mietverträge,
SaaS-Abonnements, Dienstleistungsverträge etc.) — mit Kostenübersicht, Kündigungsfristen,
Dokumentenablage, Änderungshistorie und einer KI-Analyse, die ein hochgeladenes Vertrags-PDF
vorauswertet. Nicht zu verwechseln mit den Kundenverträgen (`Contract`, siehe
[CONTRACTS-SEPA-MODULE.md](CONTRACTS-SEPA-MODULE.md)). Diese Seite beschreibt **Fachregeln,
Datenmodell, Routen, Services und Fallstricke**; die Bedienung Schritt für Schritt steht im
Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Finanzen 2 – Unternehmensverträge"
    [hilfe.hub.glattt.com/finanzen/2/](https://hilfe.hub.glattt.com/finanzen/2/) — Die Übersicht,
    einen Vertrag erfassen (Wizard inkl. KI-Vorschlägen), Fristen im Blick behalten.

---

## Für Anwender — Überblick

**Was das Modul leistet.** Alle Verträge, die die Firma selbst eingeht, liegen an einer Stelle:
laufende, gekündigte und ausgelaufene. Ziel ist, **keine Kündigungsfrist zu verpassen**, die
monatlichen Kosten je Vertragstyp und Standort zu kennen und jedes Vertragsdokument griffbereit
zu haben. Erfasst wird ein Vertrag über einen sechsstufigen Assistenten; lädt man dabei das PDF
hoch, liest eine KI Bezeichnung, Partner, Laufzeit und Betrag vor — was sie nur **erschlossen**
hat, ist als „KI-Vorschlag — bitte überprüfen" markiert und muss geprüft werden.

**Grundsätze, die überall gelten:**

- **Die Frist zählt, nicht das Vertragsende.** Angezeigt und überwacht wird das
  Kündigungsdatum (manuell gesetzt oder aus Enddatum minus Kündigungsfrist berechnet).
- **Der Hub erinnert von selbst** — standardmäßig 30 Tage vor dem Kündigungsdatum per E-Mail,
  je Vertrag einstellbar.
- **Jede Änderung wird protokolliert** (Feld, alter Wert, neuer Wert, Zeitpunkt) und ist auf der
  Detailseite einsehbar.
- **Standort oder firmenweit:** Ein Vertrag gehört entweder einem Institut oder der ganzen Firma;
  wer nicht Admin ist, sieht firmenweite Verträge plus die des eigenen Standorts.
- **Die Übersicht zeigt zuerst nur aktive Verträge** — gekündigte und ausgelaufene erst nach
  Anpassen des Status-Filters.

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Übersicht, Kostenkacheln, Filter und Suche | Finanzen 2 |
| Vertrag anlegen (Assistent, KI-Analyse, Dokument) | Finanzen 2 |
| Vertrag bearbeiten, Dokumente und Historie lesen | Finanzen 2 |
| Erinnerungen und Kündigungsfristen im Blick behalten | Finanzen 2 |

---

## Für Entwickler

### Fachregeln (Fristen, Status, Erinnerungen)

**Kündigungsdatum:** `effective_cancellation_deadline` ist das manuell gesetzte Datum, sonst
`end_date − notice_period_days`. Die Übersicht und die Detailseite färben es:

| Farbe | Bedeutung |
|-------|-----------|
| Rot + "abgelaufen" | Kündigungsfrist bereits verstrichen |
| Gelb + "in X Tagen" | Weniger als 30 Tage bis Fristende |
| Blau + "in X Tagen" | Weniger als 90 Tage bis Fristende |
| (kein Badge) | Mehr als 90 Tage oder kein Datum gesetzt |

**Erinnerung:** Erreicht `Kündigungsdatum − reminder_days_before` (Standard 30) den heutigen Tag,
verschickt das System eine Erinnerungsmail (`->upcomingReminders()`); der Versand wird in
`reminder_sent_at` festgehalten und in der Laufzeit-Sektion angezeigt.

**Filter:** Die Übersicht liefert alle sichtbaren Verträge aus und filtert client-seitig
(Alpine `companyContractsFilter()`) an den Spaltenköpfen — Typ (Multi-Select), Standort,
Betrag nach Zahlungsintervall, Status (Multi-Select) plus Freitextsuche über Bezeichnung und
Vertragspartner. **Vorbelegt ist der Status-Filter auf „Aktiv".**

**KI-Vorschläge:** `extracted` (direkt aus dem Dokument gelesen) wird normal übernommen,
`suggested` (aus Kontext/Branche erschlossen) bekommt im Wizard das bernsteinfarbene Badge
„★ KI-Vorschlag — bitte überprüfen", das beim manuellen Bearbeiten des Feldes verschwindet.
Schritt 1 (Upload) ist überspringbar, alle Felder sind manuell befüllbar; beim Bearbeiten eines
bestehenden Vertrags entfällt Schritt 1.

**Sichtbarkeit:** `admin`/`super_admin` sehen alle Verträge, alle anderen firmenweite
(`branch_id IS NULL`) plus den eigenen Standort (`->forBranch($branchId)`).

### Architektur

```
app/
├── Http/Controllers/CompanyContractController.php   # Hub-Controller
├── Models/
│   ├── CompanyContract.php                          # Hauptmodell
│   ├── CompanyContractDocument.php                  # Dokument-Anhänge
│   ├── CompanyContractChange.php                    # Änderungshistorie
│   └── CompanyContractCustomType.php                # Benutzerdefinierte Typen
├── Services/
│   ├── CompanyContractService.php                   # Business-Logik
│   └── ContractAnalysisService.php                  # Claude KI-Analyse
└── Filament/Resources/CompanyContracts/             # Admin-Panel Resource

resources/views/hub/company-contracts/
├── index.blade.php                                  # Übersicht
├── show.blade.php                                   # Detailseite
└── partials/
    ├── create-modal.blade.php                       # Wizard-Modal (Anlegen + Bearbeiten)
    ├── cost-summary.blade.php                       # Kosten-Kacheln
    └── detail-row.blade.php                         # Label/Value Zeile

public/js/company-contract-wizard.js                # Alpine.js Wizard-Logik

database/migrations/
├── 2026_05_06_100000_create_company_contracts_table.php
├── 2026_05_06_100001_create_company_contract_documents_table.php
├── 2026_05_06_100002_create_company_contract_changes_table.php
├── 2026_05_06_110000_update_company_contracts_contract_types.php
├── 2026_05_06_150000_add_vendor_details_to_company_contracts.php
└── 2026_05_06_160000_add_price_increase_to_company_contracts.php
```

### Datenbankstruktur

#### `company_contracts`

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | bigint | PK |
| `name` | varchar(255) | Vertragsbezeichnung |
| `contract_types` | json | Array von Typ-Schlüsseln (z.B. `["rental","other"]`) |
| `vendor_name` | varchar(255) | Vertragspartner |
| `vendor_address` | varchar(500) | Adresse |
| `vendor_phone` | varchar(100) | Telefon |
| `vendor_email` | varchar(255) | E-Mail |
| `vendor_website` | varchar(255) | Website |
| `vendor_contacts` | json | Ansprechpartner `[{name, phone, email}]` |
| `contract_number` | varchar(255) | Vertragsnummer |
| `branch_id` | varchar(255) | Phorest Branch-ID (`null` = firmenweit) |
| `responsible_user_id` | bigint FK | Verantwortlicher User |
| `start_date` | date | Vertragsbeginn |
| `end_date` | date | Vertragsende (`null` = unbefristet) |
| `notice_period_days` | int | Kündigungsfrist in Tagen |
| `cancellation_deadline` | date | Kündigungsdatum (manuell oder berechnet) |
| `cancellation_deadline_is_manual` | boolean | `true` = manuell gesetzt |
| `auto_renewal` | boolean | Automatische Verlängerung |
| `renewal_period_months` | int | Verlängerungszeitraum in Monaten |
| `max_renewals` | smallint | Max. Verlängerungen (`null` = unbegrenzt) |
| `amount_cents` | int | Betrag in Cent |
| `payment_interval` | varchar | `monthly`, `quarterly`, `yearly`, `one_time` |
| `price_increase_enabled` | boolean | Preisanpassung aktiviert |
| `price_increase_type` | varchar(10) | `percent` oder `amount` |
| `price_increase_percent` | decimal(5,2) | Prozentsatz |
| `price_increase_amount_cents` | int | Fester Betrag in Cent |
| `price_increase_date` | date | Nächstes Anpassungsdatum |
| `price_increase_recurring` | boolean | Jährlich wiederholen |
| `reminder_days_before` | int | Erinnerung X Tage vor Fristende |
| `reminder_sent_at` | timestamp | Zeitpunkt der letzten Erinnerung |
| `status` | varchar | `active`, `cancelled`, `expired` |
| `notes` | text | Freie Notizen |
| `deleted_at` | timestamp | SoftDeletes |

#### `company_contract_documents`

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | bigint | PK |
| `company_contract_id` | bigint FK | → `company_contracts` (cascade delete) |
| `file_name` | varchar | Originaldateiname |
| `file_path` | varchar | Storage-Pfad |
| `disk` | varchar | `public` oder `gcs-private` |
| `file_size` | bigint | Bytes |

#### `company_contract_changes`

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | bigint | PK |
| `company_contract_id` | bigint FK | → `company_contracts` (cascade delete) |
| `user_id` | bigint FK | Handelnder User (`null` = System) |
| `change_type` | varchar | `created`, `field_updated`, `status_changed`, `renewed`, `document_added`, `document_removed` |
| `field_name` | varchar | Betroffenes Feld |
| `old_value` | text | Alter Wert |
| `new_value` | text | Neuer Wert |
| `note` | text | Freitext-Notiz |
| `created_at` | timestamp | Zeitstempel (kein `updated_at`) |

#### `company_contract_custom_types`

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | bigint | PK |
| `name` | varchar(100) | Anzeigename |
| `key` | varchar(100) | Eindeutiger Schlüssel (z.B. `custom_abc123`), UNIQUE |
| `created_by_user_id` | bigint FK | Ersteller |

### Modell: `CompanyContract`

```php
// Konstanten
CompanyContract::CONTRACT_TYPES  // ['rental' => 'Mietvertrag', 'software' => 'Software- / SaaS-Abonnement', ...]
CompanyContract::PAYMENT_INTERVALS  // ['monthly' => 'Monatlich', ...]
CompanyContract::STATUSES  // ['active' => 'Aktiv', ...]

// Statische Hilfsmethoden
CompanyContract::getCustomTypesMap()  // ['custom_abc1' => 'Mein Typ', ...] — Custom Types aus DB (gecacht pro Request)

// Scopes
->forBranch($branchId)   // Firmenweit (null) + eigener Standort
->active()               // Nur aktive Verträge
->upcomingReminders()    // Fällige Erinnerungen heute

// Accessors
$contract->contract_type_label      // Erster Typ als lesbarer Text (inkl. Custom Types)
$contract->contract_type_labels     // Alle ausgewählten Typen als Label-Array (inkl. Custom Types)
$contract->payment_interval_label   // "Monatlich"
$contract->status_label             // "Aktiv"
$contract->amount_formatted         // "120,00 € / Monatlich"
$contract->monthly_cents            // Normalisiert auf Monat
$contract->effective_cancellation_deadline  // Manuell oder berechnet
```

### Routes

Alle Routen unter `/hub/` mit Middleware `can:view_company_contracts`:

| Method | URL | Name | Permission |
|--------|-----|------|------------|
| GET | `/hub/company-contracts` | `hub.company-contracts.index` | `view_company_contracts` |
| GET | `/hub/company-contracts/{id}` | `hub.company-contracts.show` | `view_company_contracts` |
| GET | `/hub/company-contracts/{contractId}/documents/{documentId}` | `hub.company-contracts.documents.serve` | `view_company_contracts` |
| GET | `/hub/company-contracts/types` | `hub.company-contracts.types` | `view_company_contracts` |
| POST | `/hub/company-contracts` | `hub.company-contracts.store` | `manage_company_contracts` |
| PUT | `/hub/company-contracts/{id}` | `hub.company-contracts.update` | `manage_company_contracts` |
| POST | `/hub/company-contracts/types` | `hub.company-contracts.types.store` | `manage_company_contracts` |
| POST | `/hub/company-contracts/analyze` | `hub.company-contracts.analyze` | `manage_company_contracts` |

**Dokument-Streaming**: `?download=1` erzwingt `Content-Disposition: attachment` (Download statt inline).

### Controller: `CompanyContractController`

| Methode | Zweck |
|---------|-------|
| `index()` | Übersicht — alle Verträge ohne Server-Filterung; Filterung erfolgt client-seitig via Alpine.js `companyContractsFilter()` |
| `show($id)` | Detailseite mit Dokumenten, Änderungshistorie, Wizard-Daten |
| `store(Request)` | Neuen Vertrag speichern (AJAX, multipart) |
| `update(Request, $id)` | Vertrag aktualisieren + Änderungshistorie schreiben |
| `serveDocument(Request, $contractId, $documentId)` | Datei aus Storage streamen (inline oder download) |
| `analyzeDocument(Request)` | Claude KI-Analyse, gibt JSON zurück |
| `getTypes()` | Alle verfügbaren Typen (Standard + Custom) |
| `storeType(Request)` | Neuen Custom-Typ anlegen |

**Zugriffssteuerung**:
- `admin` und `super_admin` sehen alle Verträge
- Alle anderen: nur firmenweite (`branch_id IS NULL`) + eigener Standort

### KI-Analyse: `ContractAnalysisService`

Nutzt **Claude claude-sonnet-4-5** via Anthropic API (`config/anthropic.php`).

```php
$service = new ContractAnalysisService();
$result = $service->analyzeDocument($filePath, $mimeType);
// $result['success'] = true/false
// $result['extracted'] = [...]   // direkt aus dem Dokument ausgelesen
// $result['suggested'] = [...]   // erschlossen (Branche/Kontext, kein direkter Beleg im Dokument)
// Beide Arrays können enthalten: 'name', 'contract_types', 'vendor_name', 'vendor_address',
//   'start_date', 'end_date', 'notice_period_days', 'amount' (Nettobetrag als Dezimalzahl),
//   'payment_interval', 'auto_renewal', 'renewal_period_months', 'notes'
```

**Response-Format**: Die KI trennt `extracted` (direkt gelesen) von `suggested` (erschlossen). Der Wizard markiert alle Felder aus `suggested` mit einem KI-Vorschlag-Badge (`ai-suggestion-badge`).

Unterstützte Dateitypen: PDF, JPG, JPEG, PNG, GIF, WebP. Max. 20 MB.
Timeout: `set_time_limit(120)` — Claude kann bei großen PDFs länger brauchen.

`.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

### Wizard-Modal: `company-contract-wizard.js`

Alpine.js-Komponente `contractWizard(config)` — wird per `x-data` auf der Index- und Detailseite eingebunden.

**Die sechs Schritte**:

| Schritt | Inhalt |
|---------|--------|
| 1 – Dokument | PDF/Bild hochladen → KI analysiert das Dokument automatisch (überspringbar, im Edit-Mode ausgelassen) |
| 2 – Vertragsdetails | Name, Vertragstyp(en), Vertragspartner, Kontakte, Vertragsnummer |
| 3 – Zuordnung | Standort (oder firmenweit) + verantwortlicher Mitarbeiter |
| 4 – Laufzeit & Kündigung | Start-/Enddatum, Kündigungsfrist, automatische Verlängerung |
| 5 – Kosten | Betrag, Zahlungsintervall, Preisanpassung |
| 6 – Erinnerung & Notizen | Erinnerungstage vor Kündigungsfrist, freie Notizen |

**Konfigurationsparameter** (aus Blade übergeben):
```js
contractWizard({
    branches:     [...],    // [{id, name}]
    users:        [...],    // [{id, name}]
    customTypes:  [...],    // [{key, name, custom}]
    storeUrl:     '...',    // POST /hub/company-contracts
    updateUrl:    '...',    // PUT /hub/company-contracts/__ID__ (wird mit echtem Wert ersetzt)
    storeTypeUrl: '...',
    analyzeUrl:   '...',
    csrfToken:    '...',
})
```

**Wichtige Methoden**:

| Methode | Beschreibung |
|---------|-------------|
| `openModal()` | Neuen Vertrag anlegen (Start bei Schritt 1) |
| `openEditModal(contractData)` | Bearbeiten (Start bei Schritt 2, Felder vorausgefüllt) |
| `closeModal()` | Modal schließen (verhindert Schließen während `saving`) |
| `analyzeDocument()` | AJAX-Aufruf der KI-Analyse |
| `applyAnalysisData(extracted, suggested)` | KI-Ergebnis in Felder übertragen; Felder aus `suggested` werden mit `aiSuggestedFields[key] = true` markiert |
| `clearAiSuggestion(fieldName)` | KI-Vorschlag-Badge für ein Feld ausblenden (nach manuellem Bearbeiten) |
| `validateCurrentStep()` | Pflichtfelder des aktuellen Schritts prüfen |
| `submit()` | Formular absenden (POST oder PUT je nach `editMode`) |
| `nextStep()` | Validiert und wechselt zum nächsten Schritt |

**KI-Vorschlag-State**: `aiSuggestedFields` ist ein Alpine-Objekt `{ fieldName: true|false }`. **Direkte Property-Mutation** (`this.aiSuggestedFields[fieldName] = true`) ist Pflicht — Object-Spread-Ersatz (`this.obj = { ...this.obj }`) verliert das Alpine-Proxy-Tracking und macht `x-show` reaktionslos.

**Edit-Mode**:
```js
// Wird durch openEditModal() gesetzt:
editMode: true
editContractId: 3   // Wird in updateUrl ersetzt (__ID__ → 3)
```

### Flatpickr-Integration

Alle 4 Datums-Felder im Modal nutzen Flatpickr mit deutschem Format:
```js
flatpickr($el, {
    dateFormat: 'Y-m-d',  // interner Wert
    altInput: true,
    altFormat: 'd.m.Y',   // Anzeige
    locale: 'de',
    onChange: (d, s) => { form.start_date = s; },
    onReady: (d, s, i) => { i.altInput.className = $el.className; }
});
```

Der `$watch('form.start_date', ...)` Callback stellt sicher, dass Flatpickr auch bei programmatischem Setzen (z.B. durch KI-Analyse) aktualisiert wird.

### Dokument-Viewer (Detailseite)

PDFs werden sofort inline angezeigt (`<iframe>`). Bei mehreren PDFs ist das erste automatisch aktiv; Klick auf einen anderen Eintrag wechselt den iframe.

```html
<!-- Alpine x-data auf der Dokumente-Card: -->
x-data="{
    activeDocId: {{ $firstPdf->id }},
    activeUrl:   '{{ serveUrl }}',
    activeName:  '{{ fileName }}',
    switchDoc(id, url, name) { ... }
}"
```

Download: `activeUrl + '?download=1'` → Controller setzt `Content-Disposition: attachment`.

### Berechtigungen

| Permission | Bedeutung |
|------------|-----------|
| `view_company_contracts` | Verträge sehen (alle Hub-Nutzer die Zugriff haben) |
| `manage_company_contracts` | Anlegen, Bearbeiten, Dokument-Upload, KI-Analyse |

Rollen `admin` und `super_admin` sehen **alle** Verträge unabhängig von `branch_id`. Andere Rollen sehen nur firmenweite + Verträge des eigenen Standorts.

### Filament Admin-Panel

Unter `Admin → Unternehmensverträge`:

```
app/Filament/Resources/CompanyContracts/
├── CompanyContractResource.php
├── Pages/
│   ├── ListCompanyContracts.php
│   ├── CreateCompanyContract.php
│   ├── EditCompanyContract.php
│   └── ViewCompanyContract.php
├── Schemas/
│   ├── CompanyContractForm.php
│   └── CompanyContractInfolist.php
└── Tables/
    └── CompanyContractsTable.php
```

### Bekannte Einschränkungen

- KI-Analyse funktioniert nur mit lesbaren PDFs (nicht mit eingescannten Dokumenten ohne OCR)
- Max. Dateigröße: 20 MB pro Dokument
- Claude API kann 20–60 Sekunden benötigen — `set_time_limit(120)` ist gesetzt
- In Cloud-Umgebung (`isCloudEnvironment() === true`) werden Dokumente auf `gcs-private` gespeichert, lokal auf `public`

### Tests

```bash
php artisan test --filter=CompanyContract
# 12 Tests, alle Unit-Tests des Services und Modells
```

Test-Dateien:
- `tests/Feature/CompanyContractControllerTest.php`
- `tests/Unit/CompanyContractServiceTest.php`
