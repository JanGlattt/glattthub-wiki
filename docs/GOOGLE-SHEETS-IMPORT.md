# Google Sheets Vertragsimport

> **Status:** ✅ Implementiert  
> **Datum:** 30.03.2026  
> **API-Endpoint:** `POST /api/v1/contracts/import`  
> **Google Apps Script:** `ContractImport.gs`

## Übersicht

Automatischer Import neuer Verträge aus einem Google Sheet in die GlattHub-Datenbank. Ein Google Apps Script überwacht das Sheet alle 5 Minuten, erkennt neue Zeilen und sendet sie per REST-API an GlattHub. Der Import erzeugt je nach Zahlungsart einen `Contract` und optional ein `ClientMandate` (SEPA).

## Für Endanwender

### Was macht das Feature?

- Neue Verträge, die im Google Sheet eingetragen werden, erscheinen automatisch in der Verträge-Übersicht im Hub
- SEPA-Verträge erhalten automatisch ein Lastschrift-Mandat
- Widerrufe (Spalte "Laufzeit" = "Widerruf") stornieren automatisch den ursprünglichen Vertrag
- Die Phorest-Kunden-ID wird automatisch per API nachgeschlagen
- Körperzonen werden automatisch zugeordnet

### Status-Anzeige im Sheet

| Symbol | Bedeutung |
|--------|-----------|
| ✅ Importiert [Datum] | Erfolgreich in GlattHub importiert |
| ⚠️ Duplikat [Datum] | Vertrag existiert bereits (wird übersprungen) |
| ⏳ Unvollständig: ... | Pflichtfelder fehlen (wird beim nächsten Durchlauf erneut geprüft) |
| ❌ Fehler: ... | Import fehlgeschlagen — siehe Fehlermeldung |
| *(leer)* | Noch nicht verarbeitet |

### Fehlgeschlagene Imports

Wenn ein Import fehlschlägt, erscheint auf der **Verträge-Seite im Hub** eine gelbe Warnleiste:

1. Klicke auf **"Imports anzeigen"** um die Liste der fehlgeschlagenen Imports zu öffnen
2. Für jeden Eintrag kannst du:
   - **"Daten ergänzen & importieren"** — fehlende Daten manuell eintragen und erneut importieren
   - **"Verwerfen"** — den Import als nicht nötig markieren (z.B. Testdaten)
3. Die Rohdaten aus dem Sheet können zur Kontrolle aufgeklappt werden

### Pflichtfelder

**Immer erforderlich:**

- Vertragsnummer (Spalte E)
- Branch-Kürzel (Spalte C) — z.B. `01.BI`, `02.H`
- Kunden-Nr. / externalID (Spalte D)
- Vorname (Spalte J) + Nachname (Spalte K)
- Erstellungsdatum (Spalte B)

**Zusätzlich bei SEPA-Verträgen:**

- IBAN (Spalte AE)
- Monatlicher Betrag (Spalte AC)
- Mandatsdatum (Spalte AK)

---

## Für Entwickler

### Architektur

```
Google Sheet (Verträge)
    │                              ┌─────────────────────────┐
    │  5-Min-Timer                 │   GlattHub              │
    ▼                              │                         │
┌──────────────────┐  POST        │  ┌─────────────────────┐ │
│ ContractImport.gs│──────────────┤  │ContractImportCtrl   │ │
│ (Apps Script)    │  /api/v1/    │  │  (Validierung)      │ │
│                  │  contracts/  │  └──────────┬──────────┘ │
│ - Zeilen lesen   │  import      │             │            │
│ - Validierung    │              │  ┌──────────▼──────────┐ │
│ - Payload bauen  │  Bearer Auth │  │ContractImportService│ │
│ - Status setzen  │              │  │  - Branch mapping   │ │
└──────────────────┘              │  │  - Phorest lookup   │ │
                                  │  │  - Body zone map    │ │
                                  │  │  - Widerruf         │ │
                                  │  └──────────┬──────────┘ │
                                  │             │            │
                                  │  ┌──────────▼──────────┐ │
                                  │  │   Contract          │ │
                                  │  │ + ClientMandate     │ │
                                  │  │ + BodyZones (Pivot) │ │
                                  │  └─────────────────────┘ │
                                  │                         │
                                  │  ┌─────────────────────┐ │
                                  │  │FailedContractImport │ │
                                  │  │  (bei Fehlern)      │ │
                                  │  └─────────────────────┘ │
                                  └─────────────────────────┘
```

### Relevante Dateien

| Datei | Zweck |
|-------|-------|
| `app/Http/Controllers/Api/V1/ContractImportController.php` | API-Endpoint, Request-Validierung |
| `app/Services/ContractImportService.php` | Kernlogik: Mapping, Phorest-Lookup, DB-Erstellung |
| `app/Models/FailedContractImport.php` | Model für fehlgeschlagene Imports |
| `app/Http/Controllers/ContractController.php` | Web-Endpoints für Failed-Import-UI (getFailedImports, resolveFailedImport, dismissFailedImport) |
| `resources/views/hub/contracts/partials/failed-imports-warning.blade.php` | Warning-Banner + Modals für fehlgeschlagene Imports |
| `resources/views/hub/contracts/index.blade.php` | Verträge-Seite (Alpine.js Integration) |
| `google-apps-script/ContractImport.gs` | Google Apps Script für Sheet-Überwachung |
| `database/migrations/2026_03_30_200000_create_failed_contract_imports_table.php` | Migration |
| `tests/Feature/Api/V1/ContractImportTest.php` | Feature-Tests |

### API-Endpoint

```
POST /api/v1/contracts/import
Authorization: Bearer glh_xxxxx
Content-Type: application/json
```

**Scope erforderlich:** `contracts:import`

**Request-Body:**

```json
{
  "contract_number": "V-2025-001",
  "branch_code": "01.BI",
  "external_id": "OS003874",
  "first_name": "Maria",
  "last_name": "Müller",
  "created_date": "15.03.2025",
  "product_name": "glattt Plus",
  "body_zones": "US, Achseln",
  "body_zone_count": "4",
  "duration": "12 Monate",
  "sepa_months": "- 10 - Mon.",
  "monthly_amount": "99,00",
  "iban": "DE89 3704 0044 0532 0130 00",
  "mandate_date": "15.03.2025",
  "annual_price": "1.200,00",
  "upfront_amount": "200,00",
  "first_debit_month": "25.04",
  "debit_day": "3"
}
```

**Responses:**

| Status | Bedeutung |
|--------|-----------|
| 201 | Vertrag erfolgreich erstellt |
| 200 | Widerruf erfolgreich verarbeitet |
| 409 | Vertrag existiert bereits (Duplikat) |
| 422 | Validierungsfehler oder fehlende Daten (gespeichert zur manuellen Nachbearbeitung) |
| 401 | Nicht authentifiziert |
| 403 | Falscher Scope |

### Branch-Mapping

| Sheet-Kürzel | Phorest Branch-ID |
|--------------|-------------------|
| `01.BI` | `urLYs9iAs3RUBrYaDZY9ew` |
| `02.H` | `0QHO0ZNAPJJsu1fVn2EBtA` |
| `03.OS` | `4Awk00OHdGhthWUrNgxakQ` |
| `04.HB` | `xcsxL7OJZie5KvhsWdSc8w` |
| `05.BS` | `GE-3neZf8hpTp94gmhlKTw` |

### Körperzonen-Mapping

| Sheet-Abkürzung | BodyZone Keys |
|-----------------|---------------|
| `US` | `unterschenkel_links`, `unterschenkel_rechts` |
| `OS` | `oberschenkel` |
| `Bikini` | `bikini` |
| `Intim` | `intim` |
| `Achseln` | `achseln` |
| `Brust` | `brust` |
| `Bauch` | `bauch` |
| `Gesicht` | `gesicht` |
| `Hals` / `Nacken` | `hals_nacken` |
| `Schultern` | `schultern` |
| `Rücken` | `oberer_ruecken`, `unterer_ruecken` |
| `Gesäß` | `gesaess` |
| `Hände` | `haende` |
| `Füße` | `fuesse` |
| `Arme` | `linker_arm`, `rechter_arm` |
| `GK` | Alle 18 Zonen (Ganzkörper) |

### Spalten-Mapping (Google Sheet → API)

| Spalte | Index | API-Key | DB-Feld |
|--------|-------|---------|---------|
| Laufende Nr. | A (1) | `row_number` | `legacy_lastschrift_nummer` |
| Erstellungsdatum | B (2) | `created_date` | `signed_at` |
| Branch-Kürzel | C (3) | `branch_code` | `branch_id` (via Mapping) |
| externalID | D (4) | `external_id` | `legacy_kundennummer` + `client_id` |
| Vertragsnummer | E (5) | `contract_number` | `contract_number` |
| Kürzel MA | G (7) | `seller_code` | `legacy_specialist` |
| Einzugstag | H (8) | `debit_day` | → first_payment_date |
| Abw. Kontoinhaber | I (9) | `different_payer` | ClientMandate payer_name |
| Vorname | J (10) | `first_name` | ClientMandate + Suche |
| Nachname | K (11) | `last_name` | ClientMandate + Suche |
| Kommentar | L (12) | `comment` | `notes` |
| Paketart | N (14) | `product_name` | `legacy_product_name` |
| Anzahl Zonen | O (15) | `body_zone_count` | `body_zone_count` |
| Körperzonen | P (16) | `body_zones` | Pivot + `body_zone_description` |
| Preis 12M | R (18) | `annual_price` | → total_value Berechnung |
| Gutscheinwert | U (21) | `voucher_value` | `legacy_gutschein_betrag` |
| Gutschein-Nr. | V (22) | `voucher_number` | `legacy_gutschein_nummer` |
| Vor-Ort-Betrag | W (23) | `upfront_amount` | → total_value Berechnung |
| Bezahlt Vor Ort | X (24) | `upfront_paid` | `legacy_erste_sitzung_bezahlt` |
| Laufzeit | AA (27) | `duration` | `payment_method`, `status` |
| SEPA-Monate | AB (28) | `sepa_months` | `installment_count` |
| Monatl. Betrag | AC (29) | `monthly_amount` | `monthly_amount_cents` |
| IBAN | AE (31) | `iban` | ClientMandate `payer_iban` |
| Unterschriftsdatum | AK (37) | `mandate_date` | ClientMandate `mandate_signed_at` |
| Ersteinzug YY.MM | AL (38) | `first_debit_month` | `start_date`, `first_payment_date` |
| **Import-Status** | **AN (40)** | *(vom Script)* | — |

### Widerruf-Logik

Wenn `duration` = "Widerruf":

1. Der originale Vertrag wird gesucht (gleiche `external_id` + `branch_id` + Status `active`)
2. Falls gefunden: Status → `cancelled`, `cancelled_at` → Datum des Widerrufs
3. Es wird **kein** neuer Vertrag erstellt

### Failed Import Workflow

```
API-Import schlägt fehl
    │
    ▼
FailedContractImport (status: pending)
    │
    ▼
Warning-Banner auf Verträge-Seite
    │
    ├── "Daten ergänzen"  → Modal mit Formular
    │       │               (vorausgefüllt mit Rohdaten)
    │       ▼
    │   Erneuter Import mit korrigierten Daten
    │       │
    │       ├── Erfolg → status: resolved
    │       └── Fehler → Fehlermeldung anzeigen
    │
    └── "Verwerfen"       → Bestätigungsdialog
            │               (optional: Begründung)
            ▼
        status: dismissed
```

### Google Apps Script Setup

1. Im Google Sheet: **Erweiterungen > Apps Script**
2. Code aus `google-apps-script/ContractImport.gs` einfügen
3. **Script Properties** setzen:
   - `GLATTTHUB_API_URL` → API-URL
   - `GLATTTHUB_API_TOKEN` → Bearer Token (mit `contracts:import` Scope)
   - `SHEET_ID` → Google Sheet ID
   - `SHEET_NAME` → Blattname
4. Funktion `setupTrigger()` einmalig ausführen
5. Funktion `testConnection()` ausführen um die Verbindung zu testen

**Verfügbare Funktionen:**

| Funktion | Zweck |
|----------|-------|
| `setupTrigger()` | 5-Minuten-Timer erstellen (einmalig) |
| `removeTrigger()` | Timer deaktivieren |
| `manualSync()` | Manueller Sync (für Tests) |
| `retryFailed()` | Fehlgeschlagene erneut versuchen |
| `showStatus()` | Statistik im Logger anzeigen |
| `testConnection()` | API-Verbindung testen |

### API-Client erstellen

In der Admin-Oberfläche (Filament):

1. **API-Clients** → Neuen Client erstellen
2. Name: z.B. "Google Sheets Import"
3. Scope: `contracts:import`
4. Token kopieren und in Script Properties eintragen
