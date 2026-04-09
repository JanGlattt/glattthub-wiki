# Google Sheets Vertragsimport

> **Status:** ✅ Implementiert  
> **Datum:** 09.04.2026  
> **API-Endpoint:** `POST /api/v1/contracts/import`  
> **Google Apps Script:** `ContractPreprocess.gs` + `ContractImport.gs`

## Übersicht

Automatischer Import neuer Verträge aus einem Google Sheet in die GlattHub-Datenbank. Ein zweistufiger Prozess bereitet die Daten zunächst auf (Preprocessing) und importiert sie dann per REST-API. Der Import erzeugt je nach Zahlungsart einen `Contract` und optional ein `ClientMandate` (SEPA).

```
Quell-Sheet (51 Spalten, chaotisch)
    │  ContractPreprocess.gs (5-Min-Timer)
    ▼
Staging-Sheet (31 Spalten, sauber)
    │  ContractImport.gs (5-Min-Timer)
    ▼
GlattHub API → ContractImportService.php → Datenbank
```

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
| 🔄 Aktualisiert [Datum] | Bestehender Vertrag aktualisiert (gleiche Vertragsnummer) |
| ⏳ Unvollständig: ... | Pflichtfelder fehlen (wird beim nächsten Durchlauf erneut geprüft) |
| ❌ Fehler: ... | Import fehlgeschlagen — siehe Fehlermeldung |
| *(leer)* | Noch nicht verarbeitet |
### Hinweis-Spalte (Staging-Sheet)

Das Staging-Sheet hat eine **Hinweis-Spalte (AE)**, die Warnungen zu Datenauffälligkeiten enthält (z.B. Preis-Mismatches). Diese Zeilen werden trotzdem importiert, der Hinweis wird im Vertrag als Notiz hinterlegt.
### Fehlgeschlagene Imports

Wenn ein Import fehlschlägt, erscheint auf der **Verträge-Seite im Hub** eine gelbe Warnleiste:

1. Klicke auf **"Imports anzeigen"** um die Liste der fehlgeschlagenen Imports zu öffnen
2. Das System erkennt automatisch, ob ein fehlgeschlagener Import ein **Widerruf** ist
3. Je nach Typ gibt es unterschiedliche Aktionen:

#### Normaler fehlgeschlagener Import

- **„Daten ergänzen & importieren“** — Modal mit Formular (vorausgefüllt mit Rohdaten), fehlende Daten manuell eintragen und erneut importieren
- **„Verwerfen“** — den Import als nicht nötig markieren (z.B. Testdaten)

#### Widerruf ohne zugehörigen Vertrag

Wenn der automatische Widerruf-Import keinen passenden aktiven Vertrag findet (häufigster Fehlerfall):

- **„Vertrag zuordnen & widerrufen“** — öffnet ein Such-Modal:
    1. Automatische Suche nach der Kundennummer beim Öffnen
    2. Suchfeld für Kunden-Nr., Name oder Vertragsnummer
    3. Nur aktive Verträge werden angezeigt (mit Vertragsdetails, Preis, Abschlussdatum)
    4. Vertrag anklicken zum Auswählen
    5. Gelber Bestätigungsbereich zeigt den ausgewählten Vertrag
    6. **„Widerruf bestätigen“** führt den Widerruf durch

Bei Bestätigung wird:

- Der Vertrag auf „storniert“ gesetzt
- Ein `ContractCancellation`-Eintrag erstellt (inkl. Widerrufsdatum und Kommentar)
- Der Bearbeitungsverlauf (`ContractChange`) mit Verweis auf die Stornierung geführt
- Der fehlgeschlagene Import als „gelöst“ markiert

Die Rohdaten aus dem Sheet können bei allen Varianten zur Kontrolle aufgeklappt werden.

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
| `google-apps-script/ContractPreprocess.gs` | Preprocessing: Quell-Sheet → sauberes Staging-Sheet |
| `google-apps-script/ContractImport.gs` | Import: Staging-Sheet → GlattHub API |
| `app/Http/Controllers/Api/V1/ContractImportController.php` | API-Endpoint, Request-Validierung |
| `app/Services/ContractImportService.php` | Kernlogik: Mapping, Phorest-Lookup, Preisliste, Widerruf, DB-Erstellung |
| `app/Models/FailedContractImport.php` | Model für fehlgeschlagene Imports |
| `app/Http/Controllers/ContractController.php` | Web-Endpoints: Failed-Import-UI, Widerruf-Zuordnung, Vertragssuche |
| `resources/views/hub/contracts/partials/failed-imports-warning.blade.php` | Warning-Banner + Modals (Normal + Widerruf) |
| `resources/views/hub/contracts/index.blade.php` | Verträge-Seite (Alpine.js Integration) |
| `database/migrations/2026_03_30_200000_create_failed_contract_imports_table.php` | Migration |
| `tests/Feature/Api/V1/ContractImportTest.php` | API-Import Tests (21 Tests) |
| `tests/Feature/FailedContractImportTest.php` | Failed-Import + Widerruf-Zuordnung Tests (6 Tests) |

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
  "monthly_price": "99,00",
  "upfront_amount": "200,00",
  "first_debit_month": "25.04",
  "debit_day": "3"
}
```

**Responses:**

| Status | Bedeutung |
|--------|-----------|
| 201 | Vertrag erfolgreich erstellt |
| 200 | Vertrag aktualisiert (gleiche `contract_number`) oder Widerruf verarbeitet |
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
| Preis 12M | R (18) | `monthly_price` | → total_value (× 12)  |
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
| **Import-Status** | **AY (51)** | *(vom Script)* | — |

### Staging-Sheet Spalten (A–AE, 31 Spalten)

Das Preprocessing (`ContractPreprocess.gs`) konvertiert die 51 Quell-Spalten in ein sauberes 31-Spalten-Format:

| Spalte | Index | Inhalt |
|--------|-------|--------|
| A | 0 | Zeile (Quell-Referenz) |
| B | 1 | Erstellungsdatum |
| C | 2 | Branch (Phorest-UUID) |
| D | 3 | Kunden-Nr. (externalID) |
| E | 4 | Vertragsnummer |
| F | 5 | Verkäufer (Kürzel) |
| G | 6 | Einzugstag |
| H | 7 | Abw. KI Vorname |
| I | 8 | Abw. KI Nachname |
| J | 9 | Vorname |
| K | 10 | Nachname |
| L | 11 | Kommentar |
| M | 12 | Produktname |
| N | 13 | Anzahl Zonen |
| O | 14 | Körperzonen |
| P | 15 | Ganzkörper (0/1) |
| Q | 16 | Monatspreis 12M (Cent) |
| R | 17 | Gutscheinwert (Cent) |
| S | 18 | Gutscheinnummer |
| T | 19 | Vor-Ort-Betrag (Cent) |
| U | 20 | Bezahlt Vor Ort (Cent) |
| V | 21 | Laufzeit |
| W | 22 | SEPA-Monate |
| X | 23 | Monatl. Betrag (Cent) |
| Y | 24 | Raten-Anzahl |
| Z | 25 | Zahlungsart |
| AA | 26 | IBAN |
| AB | 27 | Mandatsdatum |
| AC | 28 | Ersteinzug (YY.MM) |
| **AD** | **29** | **Status** (Import-Status, vom Import-Script gesetzt) |
| **AE** | **30** | **Hinweis** (Warnungen/Mismatches, vom Preprocess oder Import) |

### Preisberechnung

Der Import ermittelt Preise bevorzugt aus der **Preisliste** (`price_lists` + `price_groups`):

1. **Preisliste nachschlagen**: Anhand des Erstellungsdatums (`created_date`) und des Branch wird die gültige Preisliste ermittelt (`PriceList::getPriceListForDate`)
2. **PriceGroup finden**: Mit `body_zone_count` und `duration` (Laufzeit, z.B. 19 oder 24 Monate) wird die passende Preisgruppe gesucht
3. **Werte übernehmen**: `monthly_amount_cents` und `total_amount_cents` (= `monthly × months`) aus der PriceGroup

**Ganzkörper-Zonenzahl:**

Bei Ganzkörper-Verträgen (`is_full_body = true`) wird die Zonenzahl dynamisch aus der Preisliste ermittelt:

- Die **`max_body_zones`** der passenden Preisliste wird als `body_zone_count` verwendet
- Fallback auf 6 Zonen wenn keine Preisliste gefunden wird
- Dadurch werden unterschiedliche Definitionen je Zeitraum korrekt abgebildet (z.B. 6 KPZ vs. 7 KPZ als Ganzkörper)

**Preis-Mismatch Handling:**

Wenn die Beträge aus dem Sheet von der Preisliste abweichen:

- Der Import wird **trotzdem durchgeführt** (Preislisten-Beträge werden verwendet)
- Der Mismatch wird als **Warnung** im `notes`-Feld des Vertrags gespeichert
- Die API-Response enthält ein `warning`-Feld mit der Mismatch-Beschreibung
- Im Staging-Sheet wird die Warnung in der **Hinweis-Spalte (AE)** eingetragen

!!! info "Preis-Mismatch ≠ Fehler"
    Preis-Mismatches führen nicht mehr zu fehlgeschlagenen Imports. Der Vertrag wird mit den Preislisten-Werten importiert, die Abweichung wird als Hinweis dokumentiert.

**Fallback** (wenn keine passende Preisliste gefunden):

- `monthly_price` vorhanden → `total_value = monthly_price × 12`
- Direktzahler → `total_value = upfront_amount`
- Sonst → `total_value = upfront_amount + (monthly_amount × sepa_months)`

> **Wichtig:** `duration` (Spalte AA) wird für den Preislisten-Lookup verwendet, nicht `sepa_months` (Spalte AB). Die PriceGroup.months entspricht der Laufzeit.

### Update-Logik (gleiche Vertragsnummer)

Wenn ein Kunde im Sheet mehrfach vorkommt, definiert die **`contract_number`** (Spalte E) ob es sich um denselben oder einen neuen Vertrag handelt:

- **Gleiche `contract_number`** → Die zweite (spätere) Zeile **aktualisiert** den bestehenden Vertrag. Alle Vertragsfelder, Körperzonen und das SEPA-Mandat werden überschrieben.
- **Andere `contract_number`** → Es wird ein **neuer Vertrag** erstellt, auch wenn der Kunde derselbe ist.

Da das Script Zeilen von oben nach unten verarbeitet (kleine `row_number` zuerst), werden Updates automatisch in der richtigen Reihenfolge angewendet.

### Widerruf-Logik

Wenn `duration` = "Widerruf":

1. Der originale Vertrag wird gesucht per exakter **`contract_number`** + Status `active`
2. Falls gefunden:
    - Status → `cancelled`, `cancelled_at` → Datum des Widerrufs
    - `ContractCancellation` wird erstellt (Grund: `keine_angabe`, Reaktion: `widerruf_akzeptiert`, Status: `abgeschlossen`)
    - `ContractChange` Audit-Eintrag mit `related_type` → `ContractCancellation` (Verweis auf die Stornierung)
3. Falls **nicht** gefunden: Wird als `FailedContractImport` gespeichert → manuell im Hub lösbar (siehe [Widerruf ohne zugehörigen Vertrag](#widerruf-ohne-zugehorigen-vertrag))
4. Es wird **kein** neuer Vertrag erstellt

!!! note "Zwei-Pass-Verarbeitung"
    Das Import-Script verarbeitet erst alle normalen Verträge, dann alle Widerrufe. So ist sichergestellt, dass der Originalvertrag bereits existiert.

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
    ├── Widerruf?  → "Vertrag zuordnen & widerrufen"
    │       │        → Such-Modal (öffnet mit Kd-Nr.)
    │       │        → Aktiven Vertrag auswählen
    │       │        → Bestätigung
    │       ▼
    │   Contract → cancelled
    │   + ContractCancellation
    │   + ContractChange (Audit)
    │   + FailedImport → resolved
    │
    ├── Sonstiger Fehler → "Daten ergänzen"
    │       │              → Modal mit Formular
    │       │                (vorausgefüllt mit Rohdaten)
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

### Web-Endpoints (Failed Imports)

| Route | Methode | Controller-Methode | Zweck |
|-------|---------|-------------------|---------|
| `hub/contracts/failed-imports` | GET | `getFailedImports` | Alle offenen fehlgeschlagenen Imports laden (JSON) |
| `hub/contracts/failed-imports/{id}/resolve` | POST | `resolveFailedImport` | Fehlgeschlagenen Import mit korrigierten Daten erneut importieren |
| `hub/contracts/failed-imports/{id}/resolve-widerruf` | POST | `resolveWiderrufImport` | Widerruf manuell einem aktiven Vertrag zuordnen |
| `hub/contracts/failed-imports/{id}/dismiss` | POST | `dismissFailedImport` | Import verwerfen |
| `hub/contracts/search` | GET | `searchContracts` | Vertragssuche (für Widerruf-Zuordnung, q=Suchbegriff) |

### Google Apps Script Setup

Der Import besteht aus **zwei Scripts**, die in separaten Google Sheet-Projekten laufen:

#### 1. ContractPreprocess.gs (Preprocessing)

Bereinigt und konvertiert Rohdaten aus dem Quell-Sheet (51 Spalten) in ein sauberes Staging-Sheet (31 Spalten).

1. Im **Quell-Sheet**: Erweiterungen > Apps Script
2. Code aus `google-apps-script/ContractPreprocess.gs` einfügen
3. Konfiguration im Script anpassen:
    - `SOURCE_SHEET_ID` / `SOURCE_SHEET_NAME` → Quell-Sheet
    - `TARGET_SHEET_ID` / `TARGET_SHEET_NAME` → Staging-Sheet
4. `initTargetSheet()` einmalig ausführen (erstellt Header-Zeile mit 31 Spalten)
5. `setupPreprocessTrigger()` einmalig ausführen (5-Min-Timer)

**Verhalten:**

| Quell-Status | Aktion |
|-------------|--------|
| Vollständig (ohne Warnungen) | Kopiert ins Staging, Quelle → 📋 Kopiert |
| Vollständig (mit Warnungen) | Kopiert mit Hinweis in Spalte AE, Quelle → 📋 Kopiert (⚠️ Hinweis) |
| Unvollständig | Nicht kopiert, Quelle → ⏳ (wird beim nächsten Trigger erneut geprüft) |
| Bereits kopiert | Übersprungen |

**Hinweis-Spalte (AE):** Enthält Warnungen wie Preis-Abweichungen. Zeilen mit Hinweis werden trotzdem kopiert und importiert.

**Verfügbare Funktionen:**

| Funktion | Zweck |
|----------|-------|
| `initTargetSheet()` | Header-Zeile im Staging-Sheet erstellen (einmalig) |
| `setupPreprocessTrigger()` | 5-Min-Timer erstellen (einmalig) |
| `removePreprocessTrigger()` | Timer deaktivieren |
| `retryIncomplete()` | Alle ⏳ Zeilen zurücksetzen |
| `showStatus()` | Status-Übersicht (Quell- + Staging-Sheet) |
| `resetAllSourceStatuses()` | Alle Quell-Status zurücksetzen (Vorsicht!) |

#### 2. ContractImport.gs (API-Import)

Liest das Staging-Sheet und sendet Zeilen per API an GlattHub.

1. Im **Staging-Sheet**: Erweiterungen > Apps Script
2. Code aus `google-apps-script/ContractImport.gs` einfügen
3. Die Konfiguration ist im `CONFIG`-Objekt am Anfang des Scripts hardcodiert:
   - `API_URL` → API-URL
   - `API_TOKEN` → Bearer Token (mit `contracts:import` Scope)
   - `SHEET_ID` → Google Sheet ID
   - `SHEET_NAME` → Blattname
4. Funktion `setupTrigger()` einmalig ausführen
5. Funktion `testConnection()` ausführen um die Verbindung zu testen

**Import-Filter:** Zeilen mit nicht-leerer Hinweis-Spalte (AE) werden übersprungen — nur saubere Daten werden importiert. API-Warnungen (z.B. Preis-Mismatch) werden nach dem Import in die Hinweis-Spalte zurückgeschrieben.

**Zwei-Pass-Verarbeitung:** Das Script verarbeitet erst alle normalen Verträge, dann alle Widerrufe.

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
