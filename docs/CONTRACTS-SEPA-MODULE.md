# Verträge & SEPA-Lastschriften

> Vollständige Dokumentation für das Vertragsmodul mit GoCardless-Integration

## Inhaltsverzeichnis

- [Für Nutzer](#für-nutzer)
  - [Übersicht](#übersicht)
  - [Verträge erstellen](#verträge-erstellen)
  - [SEPA-Mandate](#sepa-mandate)
  - [Zahlungsübersicht](#zahlungsübersicht)
  - [Status verstehen](#status-verstehen)
- [Für Entwickler](#für-entwickler)
  - [Architektur](#architektur)
  - [Datenmodell](#datenmodell)
  - [GoCardless Integration](#gocardless-integration)
  - [Services & Jobs](#services--jobs)
  - [Webhooks](#webhooks)
  - [Cloud Deployment](#cloud-deployment)
  - [API-Referenz](#api-referenz)
  - [Migration von ContractMandate → ClientMandate](#migration-von-contractmandate--clientmandate)

---

# Für Nutzer

## Übersicht

Das Vertragsmodul ermöglicht die vollständige Verwaltung von Kundenverträgen für GLATTT-Pakete:

- **Vertragserstellung** aus ausgefüllten Formularen
- **SEPA-Lastschriften** mit automatischer GoCardless-Synchronisierung
- **Ratenzahlung** mit flexiblen Laufzeiten (3-24 Monate)
- **Zahlungsübersicht** mit Status-Tracking
- **Mandats-Wiederverwendung** — ein Kunde, ein Mandat, beliebig viele Verträge

### Zugang

1. glatttHub öffnen
2. Im Menü **Verträge** auswählen
3. Vertragsübersicht wird angezeigt

## Verträge erstellen

### Automatische Erstellung

Verträge werden automatisch erstellt, wenn ein Kunde das **Vertragsformular** ausfüllt:

1. Kunde wählt Behandlungszonen (KPZ) aus
2. Kunde wählt Zahlungsart (Ratenzahlung oder Gesamtpreis)
3. Preis wird automatisch berechnet
4. Kunde unterschreibt digital
5. Vertrag wird erstellt:
   - **Gesamtzahlung** → Status **Aktiv**, Zahlungsart **Einmalzahlung**
   - **Ratenzahlung** → Status **Entwurf**, Zahlungsart **SEPA-Lastschrift**

#### Zahlungsart-Erkennung

Die Zahlungsart wird anhand des `display_mode` des sichtbaren `contract_price`-Feldes bestimmt:

| display_mode | Zahlungsart | Vertragsstatus |
|---|---|---|
| `total_only` | Einmalzahlung (Direkt) | Aktiv |
| `rates_only` | SEPA-Lastschrift | Entwurf |
| `both` (Fallback) | Anhand der Monate (≤1 = Direkt) | Je nach Typ |

> **Wichtig:** Bei Formularen mit mehreren `contract_price`-Feldern (z.B. eins für Raten, eins für Gesamtpreis mit unterschiedlichen `show_condition`) wird der Preis automatisch in **alle** `contract_price`-Felder geschrieben, damit das jeweils sichtbare Feld den korrekten Wert enthält.

#### Vertragsnummer

Format: `YYYY.MM.DD-ExternalID` (z.B. `2026.02.12-OS003354`)

Bei mehreren Verträgen desselben Kunden am selben Tag wird automatisch ein Suffix angehängt: `-2`, `-3`, etc.

### Vertragsdetails

Nach Erstellung eines Vertrags siehst du:

| Feld | Beschreibung |
|------|--------------|
| **Vertragsnummer** | Eindeutige ID (z.B. 2026.02.10-BI005945) |
| **Kunde** | Name und Phorest-ID |
| **Paket** | Behandlungszonen und Laufzeit |
| **Preis** | Monatliche Rate und Gesamtbetrag |
| **Status** | Entwurf, Aktiv, Abgeschlossen, Storniert |

## SEPA-Mandate

Bei Verträgen mit Ratenzahlung ist ein SEPA-Lastschriftmandat erforderlich.

### Mandat pro Kunde (nicht pro Vertrag)

**Wichtig:** Ein SEPA-Mandat gehört immer zum **Kunden**, nicht zum einzelnen Vertrag. Das bedeutet:

- Hat ein Kunde bereits ein aktives Mandat, wird ein neuer Vertrag automatisch mit dem bestehenden Mandat verknüpft
- Die Bankdaten (IBAN, BIC, Kontoinhaber) werden nur einmal pro Kunde erfasst
- Jeder Vertrag hat seinen **eigenen Dauerauftrag** (Subscription) — aber alle nutzen dasselbe SEPA-Mandat

### Ablauf für den Kunden

1. **Vertragsformular** ausfüllen und unterschreiben
2. **SEPA-Formular** ausfüllen (nur bei neuem Kunden oder fehlendem Mandat):
   - IBAN eingeben
   - BIC (optional, wird automatisch ermittelt)
   - Bei abweichendem Kontoinhaber: Name, Adresse, E-Mail
   - Startdatum für erste Abbuchung wählen
3. Fertig! Die Lastschriften werden automatisch eingezogen

### Bestehendes Mandat verknüpfen

Wenn ein Kunde bereits ein aktives GoCardless-Mandat hat (z.B. aus einem früheren Vertrag):

1. Der Vertrag wird im Status **Entwurf** angezeigt
2. Im SEPA-Tab erscheint der Button **"Bestehendes Mandat verknüpfen"**
3. Das System sucht automatisch:
   - Zuerst in der lokalen Datenbank nach einem aktiven `ClientMandate` für diesen Kunden
   - Dann in der GoCardless API per `phorest_client_id` Metadata
4. Bei Fund wird das Mandat verknüpft und der Zahlungsplan automatisch erstellt

### SEPA-Mandat Ansicht

Im Hub unter **Verträge → [Vertrag] → SEPA-Mandat** siehst du:

- **Mandatsreferenz**: Eindeutige SEPA-Referenz
- **Monatliche Rate**: Abbuchungsbetrag
- **Anzahl Raten**: z.B. "18+1 Raten" (18 SEPA + 1 vor Ort)
- **Erste Abbuchung**: Datum der ersten SEPA-Lastschrift
- **Bankverbindung**: Kontoinhaber, Bank, IBAN (maskiert), BIC

### GoCardless Status

Wenn das Mandat mit GoCardless synchronisiert wurde, erscheinen zusätzlich:

- **Grüner Badge**: "GoCardless" - Synchronisierung erfolgreich
- **Mandate ID**: GoCardless-Referenz
- **Customer ID**: GoCardless-Kundennummer
- **Ratenzahlungsplan**: GoCardless Schedule-ID (pro Vertrag)
- **Synchronisiert am**: Zeitstempel

### Abweichender Zahler

Falls jemand anderes als der Kunde die Raten zahlt:

1. Im SEPA-Formular "Jemand anders ist Kontoinhaber" wählen
2. Bankdaten des Zahlers eingeben
3. Zusätzlich: E-Mail und Adresse des Zahlers
4. In der Vertragsansicht erscheint ein **gelber Badge** "Abweichender Zahler"

## Zahlungsübersicht

Im Tab **Zahlungen** siehst du alle geplanten und durchgeführten Zahlungen:

### Vor-Ort-Zahlung (Rate 1)

Die erste Rate wird **vor Ort bei Vertragsabschluss** gezahlt:

- Datum: Vertragsabschlussdatum
- Betrag: Eine Monatsrate
- Status: "Vor Ort / Kasse"

### SEPA-Lastschriften (Raten 2-19)

Alle weiteren Raten werden per SEPA eingezogen:

| Spalte | Beschreibung |
|--------|--------------|
| **Rate** | Nummer (2, 3, 4, ...) |
| **Fällig am** | Abbuchungsdatum |
| **Betrag** | Ratenbetrag |
| **Status** | Ausstehend, Bestätigt, Ausgezahlt, Fehlgeschlagen |
| **GoCardless ID** | Payment-Referenz |

### Status-Farben

- 🟡 **Vorgemerkt** (pending_submission, scheduled) - Noch nicht eingezogen / geplant
- 🟢 **Bestätigt** (confirmed) - Abbuchung erfolgreich
- 🔵 **Ausgezahlt** (paid_out) - Auf eurem Konto eingegangen
- 🔴 **Fehlgeschlagen** (failed) - Abbuchung gescheitert

### GoCardless-Symbol

Zahlungen die bei GoCardless als Dauerauftrag vorgemerkt sind (via `upcoming_payments` API) werden mit dem GoCardless-Symbol angezeigt. Zahlungen die nur lokal in der Datenbank stehen (da GoCardless max. 10 upcoming payments liefert) zeigen das gleiche "Vorgemerkt"-Badge aber ohne GC-Symbol.

Das GC-Symbol wechselt automatisch zwischen Light- und Darkmode (Primary/Negative SVG).

## Status verstehen

### Vertrags-Status

| Status | Bedeutung | Nächster Schritt |
|--------|-----------|------------------|
| **Entwurf** | Vertrag erstellt, SEPA fehlt | Kunde füllt SEPA-Formular aus |
| **Aktiv** | Alles bereit, Zahlungen laufen | Automatisch |
| **Abgeschlossen** | Alle Raten bezahlt | - |
| **Storniert** | Vertrag abgebrochen | - |

### Mandat-Status

| Status | Bedeutung |
|--------|-----------|
| **Ausstehend** (pending) | Bankdaten fehlen |
| **Aktiv** (active) | SEPA-Formular ausgefüllt |
| **Submitted** | Mit GoCardless synchronisiert |
| **Fehlgeschlagen** (failed) | GoCardless-Fehler |
| **Storniert** (cancelled) | Mandat widerrufen |

---

# Für Entwickler

## Architektur

### Mandats-Architektur (seit März 2026)

Die SEPA-Mandate sind als **1:n-Beziehung pro Kunde** implementiert:

```
                    ┌──────────────────┐
                    │  ClientMandate   │  ← Ein Mandat pro Kunde
                    │  (client_id)     │
                    │  Bankdaten, GC   │
                    └────────┬─────────┘
                             │ hasMany
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼────┐  ┌─────▼────┐  ┌─────▼────┐
        │ Contract  │  │ Contract  │  │ Contract  │
        │ Zahlplan  │  │ Zahlplan  │  │ Zahlplan  │
        │ Subscr.  │  │ Subscr.  │  │ Subscr.  │
        └──────────┘  └──────────┘  └──────────┘
```

**Kernprinzipien:**
- `ClientMandate` enthält: Bankdaten, Zahler-Infos, GoCardless-Verbindung (Customer, BankAccount, Mandate)
- `Contract` enthält: `monthly_amount_cents`, `installment_count`, `first_payment_date`, `gocardless_subscription_id`
- Eine GoCardless **Subscription (Dauerauftrag)** wird **pro Vertrag** erstellt, alle Verträge eines Kunden teilen sich dasselbe GoCardless Mandate

### Komponenten-Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Hub)                           │
├─────────────────────────────────────────────────────────────────┤
│  contracts/index.blade.php  │  contracts/show.blade.php         │
│  Alpine.js Components       │  sepaTab(), paymentsTab()         │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                     Controller Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  ContractController      - CRUD, Zahlungen-API, Mandat-Link    │
│  FormSubmissionObserver  - Automatische Vertragserstellung      │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                      Service Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  ContractCreationService   - Vertrag/Mandat aus Formular        │
│  GoCardlessMandateService  - High-Level GoCardless Sync         │
│  GoCardlessApiService      - Low-Level API Client               │
│  PhorestApiService         - Kundendaten aus Phorest            │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                        Job Layer                                 │
├─────────────────────────────────────────────────────────────────┤
│  SyncMandateToGoCardlessJob    - Async GoCardless-Sync          │
│  ProcessGoCardlessWebhookJob   - Webhook-Verarbeitung           │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   GoCardless API    │
                    │   (Sandbox/Live)    │
                    └─────────────────────┘
```

### Datenfluss: Vertragserstellung (Neukunde)

```
Kunde → Vertragsformular → FormSubmission
                               │
                    FormSubmissionObserver
                               │
                    ContractCreationService
                    ::createFromSubmission()
                               │
                    ┌──────────┴──────────┐
                    │                     │
              Contract              ClientMandate
         (status: draft)          (status: pending)
         (client_mandate_id)      (client_id)
         (monthly_amount_cents)
         (installment_count)
                               
                               
Kunde → SEPA-Formular → FormSubmission
                               │
                    ContractCreationService
                    ::processSepaFormSubmission()
                               │
                    ┌──────────┴──────────┐
                    │                     │
              Contract              ClientMandate
         (status: active)         (status: active)
         (first_payment_date)     (iban, bic, payer_*)
                                         │
                            dispatch(SyncMandateToGoCardlessJob)
                            (mandate + contract)
                                         │
                              GoCardlessMandateService
                                         │
                    Phase 1: syncMandateToGoCardless()
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
               Customer          CustomerBankAccount       Mandate
                    │                                         │
                    └──────────────────┬──────────────────────┘
                                       │
                    Phase 2: createSubscriptionForContract()
                                       │
                              Subscription (Dauerauftrag)
                              (18 Payments for this contract)
                              (subscription_id → Contract)
```

### Datenfluss: Weiterer Vertrag (Bestandskunde)

```
Kunde → Vertragsformular → FormSubmission
                               │
                    ContractCreationService
                    ::prepareMandateForContract()
                               │
                    Suche: ClientMandate::forClient($clientId)
                    → Aktives Mandat gefunden!
                               │
                    ┌──────────┴──────────┐
                    │                     │
              Contract              ClientMandate (bestehend)
         (status: active)         (bereits synced)
         (client_mandate_id)
         (monthly_amount_cents)
                    │
       dispatch(SyncMandateToGoCardlessJob)  
       (mandate + contract)
                    │
       → Mandate schon sync'd → Skip Phase 1
       → createScheduleForContract() → Neuer Schedule
```

## Datenmodell

### client_mandates (Primäre Mandats-Tabelle)

```sql
CREATE TABLE client_mandates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Kundenreferenz (Phorest Client ID)
    client_id VARCHAR(255) INDEX,            -- z.B. 'bDclStpdbpEVmYSVnoKAlg'
    
    -- Mandat-Referenz
    mandate_reference VARCHAR(255) UNIQUE,   -- z.B. 2026.02.10-BI005945
    
    -- SEPA-Formular
    sepa_form_submission_id BIGINT FOREIGN KEY,
    mandate_signed_at DATETIME,
    
    -- Zahler-Informationen
    has_different_payer BOOLEAN DEFAULT FALSE,
    payer_gender ENUM('male', 'female', 'diverse'),
    payer_first_name VARCHAR(255),
    payer_last_name VARCHAR(255),
    payer_email VARCHAR(255),
    payer_street VARCHAR(255),
    payer_postal_code VARCHAR(20),
    payer_city VARCHAR(255),
    
    -- Bankverbindung
    payer_iban TEXT,                         -- VERSCHLÜSSELT (Laravel encrypt())
    payer_bic VARCHAR(50),
    payer_bank_name VARCHAR(255),
    
    -- Status
    status ENUM('pending', 'active', 'submitted', 'failed', 'cancelled', 'expired'),
    
    -- GoCardless IDs
    gocardless_customer_id VARCHAR(255),
    gocardless_bank_account_id VARCHAR(255),
    gocardless_mandate_id VARCHAR(255) UNIQUE,
    gocardless_synced_at TIMESTAMP,
    gocardless_error TEXT,
    
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Beziehungen:**
- `client_mandates.client_id` → Phorest Client ID (kein FK, externer Service)
- `client_mandates` → `contracts` (hasMany, via `contracts.client_mandate_id`)
- `client_mandates` → `contract_payments` (hasMany, via `contract_payments.client_mandate_id`)

### contracts (aktualisiert)

```sql
CREATE TABLE contracts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contract_number VARCHAR(255) UNIQUE,    -- z.B. 2026.02.10-BI005945
    branch_id BIGINT,                        -- Standort
    client_id VARCHAR(255),                  -- Phorest Client ID
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    
    -- Mandat-Verknüpfung (pro Kunde, nicht pro Vertrag)
    client_mandate_id BIGINT FOREIGN KEY,    -- → client_mandates.id
    
    -- Zahlplan-Daten (auf Contract, nicht auf Mandat)
    first_payment_date DATE,                 -- Erste SEPA-Abbuchung
    monthly_amount_cents INT UNSIGNED,       -- z.B. 19995 = 199,95 €
    installment_count SMALLINT,              -- z.B. 19 (1 vor Ort + 18 SEPA)
    
    -- GoCardless Subscription (Dauerauftrag, pro Vertrag)
    gocardless_subscription_id VARCHAR(255),
    
    -- Paket-Details
    price_list_id BIGINT,
    body_zone_count INT,
    is_full_body BOOLEAN,
    total_value_cents INT,
    
    -- Zahlungsdetails
    payment_method ENUM('sepa', 'direct'),
    
    -- Status
    status ENUM('draft', 'active', 'completed', 'cancelled'),
    
    -- Formular-Referenzen
    form_submission_id BIGINT,
    
    -- Legacy-Felder (Import)
    legacy_product_name VARCHAR(255),
    legacy_monatlicher_betrag DECIMAL(10,2),
    legacy_kredit_monate VARCHAR(50),
    legacy_mref VARCHAR(255),
    legacy_iban TEXT,
    -- ... weitere legacy_* Felder
    
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### contract_payments (aktualisiert)

```sql
CREATE TABLE contract_payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contract_id BIGINT FOREIGN KEY,
    
    -- Direkte Mandatsreferenz
    client_mandate_id BIGINT FOREIGN KEY,    -- → client_mandates.id
    
    -- Legacy (bleibt für alte Daten)
    mandate_id BIGINT FOREIGN KEY,           -- → contract_mandates.id (deprecated)
    
    installment_number INT,                  -- 1 = vor Ort, 2+ = SEPA
    due_date DATE,
    amount_cents INT,
    
    status ENUM('pending', 'pending_submission', 'submitted', 
                'confirmed', 'paid_out', 'failed', 'cancelled', 
                'charged_back', 'customer_approval_denied'),
    
    -- GoCardless
    gocardless_payment_id VARCHAR(255),
    gocardless_payout_id VARCHAR(255),
    
    -- Fehlerbehandlung
    failure_reason VARCHAR(255),
    failure_code VARCHAR(50),
    retry_count INT DEFAULT 0,
    next_retry_date DATE,
    
    -- Vor-Ort-Zahlung
    direct_payment_method VARCHAR(50),       -- 'cash', 'card', etc.
    direct_payment_reference VARCHAR(255),
    
    paid_at DATETIME,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### contract_mandates (LEGACY — bleibt für alte Daten)

```sql
-- Diese Tabelle wird NICHT gelöscht (Datenerhalt).
-- Neue Verträge nutzen client_mandates stattdessen.
-- Import-Skript (ImportLegacyContracts) erstellt noch ContractMandate-Einträge.
CREATE TABLE contract_mandates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contract_id BIGINT FOREIGN KEY,
    -- ... (alte Spalten bleiben erhalten)
);
```

## GoCardless Integration

### Konfiguration

**config/gocardless.php:**

```php
return [
    'environment' => env('GOCARDLESS_ENVIRONMENT', 'sandbox'),
    
    'base_urls' => [
        'sandbox' => 'https://api-sandbox.gocardless.com',
        'live' => 'https://api.gocardless.com',
    ],
    
    'access_tokens' => [
        'sandbox' => env('GOCARDLESS_SANDBOX_ACCESS_TOKEN'),
        'live' => env('GOCARDLESS_LIVE_ACCESS_TOKEN'),
    ],
    
    'webhook_secrets' => [
        'sandbox' => env('GOCARDLESS_SANDBOX_WEBHOOK_SECRET'),
        'live' => env('GOCARDLESS_LIVE_WEBHOOK_SECRET'),
    ],
    
    'default_scheme' => 'sepa_core',
];
```

### Sync-Prozess im Detail (Zwei-Phasen-Ansatz)

Der `SyncMandateToGoCardlessJob` arbeitet in **zwei Phasen**:

#### Phase 1: Mandate Sync (nur wenn nötig)

Wird übersprungen wenn `ClientMandate` bereits `gocardless_mandate_id` hat.

```php
// GoCardlessMandateService::syncMandateToGoCardless($mandate, $branchId)

// 1. Phorest-Kundendaten abrufen
$phorestClient = $this->phorest->getClient($mandate->client_id, $branchId);

// 2. GoCardless Customer erstellen/finden
$customerId = $this->ensureCustomer($mandate, $branchId);

// 3. Bank Account erstellen
$bankAccountId = $this->createCustomerBankAccount($mandate, $customerId);

// 4. SEPA-Mandat erstellen
$gcMandateId = $this->createGoCardlessMandate($mandate, $bankAccountId);

// → Ergebnis: ClientMandate hat jetzt gocardless_customer_id,
//   gocardless_bank_account_id, gocardless_mandate_id
```

#### Phase 2: Schedule pro Vertrag

Wird für **jeden Vertrag einzeln** aufgerufen:

```php
// GoCardlessMandateService::createSubscriptionForContract($mandate, $contract)

// 1. Subscription-Parameter aus Contract-Feldern
// → Liest: $contract->monthly_amount_cents, $contract->installment_count,
//          $contract->first_payment_date

// 2. Subscription (Dauerauftrag) erstellen bei GoCardless
$subscriptionId = $this->createSubscriptionForContractInternal($mandate, $contract);
// → api->createSubscription(mandateId, amount, 'EUR', 'monthly', 1, dayOfMonth, startDate, count, name, metadata)
// → Metadata: contract_id, phorest_client_id, mandate_ref

// 3. Subscription-ID auf Vertrag speichern
$contract->update(['gocardless_subscription_id' => $subscriptionId]);

// 4. Lokale Payments erstellen
$this->createLocalPaymentsForSubscription($mandate, $contract);
// → ContractPayment-Einträge mit client_mandate_id
```

### Metadata-Übersicht

GoCardless erlaubt max. 3 Metadata-Felder pro Ressource:

| Ressource | Metadata-Felder |
|-----------|-----------------|
| **Customer** | `phorest_client_id`, `kundennummer`, `vertragsnehmer` |
| **BankAccount** | `phorest_client_id` |
| **Mandate** | `phorest_client_id`, `mandate_ref` |
| **Subscription** | `contract_id`, `phorest_client_id`, `mandate_ref` |

> **Hinweis:** Das Mandate-Metadata enthält keine `contract_id` mehr, da ein Mandat mehreren Verträgen zugeordnet sein kann. Die `contract_id` ist stattdessen im Subscription-Metadata.

## Services & Jobs

### ContractCreationService

Erstellt Verträge aus Formular-Einreichungen:

```php
use App\Services\ContractCreationService;

$service = app(ContractCreationService::class);

// Aus Vertragsformular
$contract = $service->createFromSubmission($formSubmission);

// SEPA-Formular verarbeiten
$clientMandate = $service->processSepaFormSubmission($sepaSubmission);
```

**Wichtige Methoden:**

| Methode | Beschreibung |
|---|---|
| `createFromSubmission()` | Erstellt Contract + ggf. ClientMandate aus FormSubmission |
| `prepareMandateForContract()` | Sucht bestehendes ClientMandate oder erstellt neues. Speichert Zahlplan-Daten auf Contract |
| `processSepaFormSubmission()` | Findet ClientMandate per client_id, vervollständigt mit Bankdaten |
| `completeMandateFromSepaForm()` | Aktiviert alle Draft-Contracts des Mandats, dispatcht Sync-Job |
| `isOneTimePayment()` | Prüft `display_mode` des contract_price-Feldes |
| `generateContractNumber()` | Erzeugt unique Nummer mit auto-Suffix bei Duplikaten |
| `extractContractPriceData()` | Liest Preisdaten aus Submission-Values |

**Mandats-Suche bei Vertragserstellung (`prepareMandateForContract`):**

```php
// 1. Gibt es ein aktives/ausstehendes ClientMandate für diesen Kunden?
$existingMandate = ClientMandate::forClient($clientId)
    ->whereIn('status', [
        ClientMandate::STATUS_ACTIVE, 
        ClientMandate::STATUS_SUBMITTED, 
        ClientMandate::STATUS_PENDING
    ])
    ->first();

if ($existingMandate) {
    // Vertrag mit bestehendem Mandat verknüpfen
    $contract->update(['client_mandate_id' => $existingMandate->id]);
} else {
    // Neues pending Mandat erstellen
    $mandate = ClientMandate::create([
        'client_id' => $clientId,
        'mandate_reference' => $contractNumber,
        'status' => ClientMandate::STATUS_PENDING,
    ]);
    $contract->update(['client_mandate_id' => $mandate->id]);
}

// Zahlplan-Daten immer auf dem Vertrag speichern
$contract->update([
    'monthly_amount_cents' => $monthlyAmount,
    'installment_count' => $installmentCount,
]);
```

### GoCardlessPaymentPlanService

Neuer Service für den Payment-Plan-Lifecycle (Subscription/Dauerauftrag):

```php
use App\Services\GoCardlessPaymentPlanService;

$service = app(GoCardlessPaymentPlanService::class);

// Zahlungsplan erstellen (vor-Ort-Zahlung + Subscription)
$subscriptionId = $service->createPaymentPlan($contract, $clientMandate);

// Ausstehende Pläne aktivieren (wird vom Webhook aufgerufen wenn Mandat aktiv wird)
$results = $service->activatePendingPlans($clientMandate);
// → ['contract_id' => 'SB01xxx', ...]

// Zahlungsplan stornieren
$service->cancelPaymentPlan($contract);
```

**Ablauf `createPaymentPlan()`:**

1. Prüft ob Vertrag Ratenzahlung ist (`installment_count > 1`)
2. Erstellt erste Rate als "Zahlung vor Ort" (`installment_number = 1`)
3. Prüft ob Mandat bereit ist (`gocardless_mandate_id` + Status `active`/`submitted`)
4. **Mandat bereit:** Erstellt GoCardless Subscription sofort → `api->createSubscription()`
5. **Mandat nicht bereit:** Erstellt nur lokale DB-Einträge (Status `scheduled`) — Subscription wird später via `activatePendingPlans()` erstellt
6. Startdatum: Mindestens 5 Werktage in der Zukunft, keine Wochenenden

**Subscription-Parameter:**

| Parameter | Wert |
|-----------|------|
| `amount` | `$contract->monthly_amount_cents` |
| `currency` | `EUR` |
| `interval_unit` | `monthly` |
| `interval` | `1` |
| `day_of_month` | Tag aus `first_payment_date` |
| `start_date` | `first_payment_date` (min. 5 Werktage) |
| `count` | `installment_count - 1` (ohne vor-Ort-Rate) |
| `name` | `"{mandate_reference}-V{contract_id}"` |

### GoCardlessMandateService

High-Level Service für GoCardless-Sync:

```php
use App\Services\GoCardlessMandateService;

$service = app(GoCardlessMandateService::class);

// Phase 1: Mandat synchronisieren (Customer + BankAccount + Mandate)
$service->syncMandateToGoCardless($clientMandate, $branchId);

// Phase 2: Subscription (Dauerauftrag) für einen Vertrag erstellen
$service->createSubscriptionForContract($clientMandate, $contract);

// Bankverbindung ändern (für alle Verträge des Mandats)
$service->changeBankAccount($clientMandate, $newIban, $accountHolderName);

// Mandat kündigen (kündigt alle Subscriptions aller Verträge)
$service->cancelMandate($clientMandate);

// Status prüfen
$service->checkMandateStatus($clientMandate);

// Bestehendes GC-Mandat per Phorest-ID finden
$result = $service->findActiveMandateByPhorestClientId($phorestClientId);
```

### SyncMandateToGoCardlessJob

Async Job für Background-Verarbeitung, akzeptiert `ClientMandate` und optional `Contract`:

```php
use App\Jobs\SyncMandateToGoCardlessJob;

// Mandat + alle aktiven Verträge synchronisieren
dispatch(new SyncMandateToGoCardlessJob($clientMandate));

// Mandat + spezifischen Vertrag synchronisieren
dispatch(new SyncMandateToGoCardlessJob($clientMandate, $contract));
```

**Ablauf:**

1. Phase 1: `syncMandateToGoCardless()` — nur wenn `gocardless_mandate_id` fehlt
2. Phase 2a: Wenn `$contract` gegeben → `createSubscriptionForContract()` für diesen Vertrag
3. Phase 2b: Wenn kein `$contract` → Subscriptions für **alle** aktiven Verträge erstellen (die noch keine haben)

**Job-Konfiguration:**

- Queue: `default`
- Retries: 3
- Backoff: 30, 60, 120 Sekunden
- Timeout: 120 Sekunden
- Unique Lock: `client_mandate:{id}` — verhindert parallele Sync-Jobs für dasselbe Mandat

### ProcessGoCardlessWebhookJob

Verarbeitet Webhook-Events von GoCardless:

**Mandate-Events:**
```php
// Suche über ClientMandate
$mandate = ClientMandate::where('gocardless_mandate_id', $gcMandateId)->first();
$mandate->update(['status' => $newStatus]);
```

**Subscription-Events (Dauerauftrag):**
```php
// Subscription-ID ist auf dem Contract
$contract = Contract::where('gocardless_subscription_id', $subscriptionId)->first();
```

**Payment-Events:**
```php
// Restbetrag wird nicht dekrementiert — er ist computed
// Contract prüft: total_value_cents - sum(paid payments)
```

### GoCardlessApiService

Low-Level API-Client (unverändert):

```php
use App\Services\GoCardlessApiService;

$api = app(GoCardlessApiService::class);

// Customer
$response = $api->createCustomer($email, $firstName, $lastName, $metadata);
$response = $api->getCustomer($customerId);
$response = $api->searchCustomers(['email' => $email]);

// Bank Account
$response = $api->createCustomerBankAccount($customerId, $name, $iban, $metadata);

// Mandate
$response = $api->createMandate($bankAccountId, 'sepa_core', null, $metadata, $reference);
$response = $api->getMandate($mandateId);

// Payments
$response = $api->listPaymentsForMandate($mandateId);
$response = $api->getPayment($paymentId);

// Subscription (Dauerauftrag)
$response = $api->createSubscription($mandateId, $amount, 'EUR', 'monthly', 1, $dayOfMonth, $startDate, $count, $name, $metadata);

// Legacy: Instalment Schedule (nicht mehr verwendet für neue Verträge)
// $response = $api->createInstalmentScheduleWithDates($mandateId, 'EUR', $name, $instalments, $metadata);
```

## Webhooks

### Endpoint

```
POST /api/webhooks/gocardless
```

### Webhook-Verarbeitung

```php
// GoCardlessWebhookController.php
public function handle(Request $request)
{
    // Signatur verifizieren
    $this->verifySignature($request);
    
    // Events in DB speichern (Idempotenz via event_id)
    foreach ($request->input('events', []) as $event) {
        GoCardlessWebhookEvent::create([...]);
    }
    
    // Async verarbeiten
    dispatch(new ProcessGoCardlessWebhookJob());
    
    return response('OK', 200);
}
```

### Unterstützte Events

#### Mandate Events

| Event | Handler |
|-------|---------|
| `mandates.created` | Log |
| `mandates.active` | `ClientMandate→status = 'active'`, **`GoCardlessPaymentPlanService::activatePendingPlans()`** — erstellt Subscriptions für alle Verträge ohne Subscription |
| `mandates.failed` | `ClientMandate→status = 'failed'`, Error speichern |
| `mandates.cancelled` | `ClientMandate→status = 'cancelled'`, alle ausstehenden Payments stornieren |
| `mandates.expired` | `ClientMandate→status = 'expired'` |

#### Payment Events

| Event | Handler |
|-------|---------|
| `payments.created` | Log |
| `payments.submitted` | `ContractPayment→status = 'submitted'` |
| `payments.confirmed` | `ContractPayment→status = 'confirmed'` |
| `payments.paid_out` | `ContractPayment→status = 'paid_out'`, Payout-ID speichern, Vertrag auf `completed` prüfen |
| `payments.failed` | `ContractPayment→status = 'failed'`, Retry-Logic |
| `payments.cancelled` | `ContractPayment→status = 'cancelled'` |
| `payments.charged_back` | `ContractPayment→status = 'charged_back'` |

#### Subscription Events (Dauerauftrag)

| Event | Handler |
|-------|---------|
| `subscriptions.created` | Log |
| `subscriptions.payment_created` | Neue Abo-Zahlung (Log) |
| `subscriptions.finished` | Subscription regulär beendet (Log) |
| `subscriptions.cancelled` | `Contract→gocardless_subscription_id = null` |

#### Instalment Schedule Events (Legacy)

| Event | Handler |
|-------|---------|
| `instalment_schedules.created` | Log (Legacy) |
| `instalment_schedules.completed` | Log (Legacy) |
| `instalment_schedules.cancelled` | Log (Legacy) |

### Restbetrag-Berechnung

Der Restbetrag wird **computed** über den Contract — kein gespeicherter Zähler mehr:

```php
// In Contract Model:
public function getRemainingAmountCentsAttribute(): int
{
    $paidAmount = $this->payments()
        ->whereIn('status', ['confirmed', 'paid_out'])
        ->sum('amount_cents');
    
    return max(0, $this->total_value_cents - $paidAmount);
}
```

**Vorteil:** Kein Risiko dass Webhook-Verarbeitung den Counter inkonsistent macht (z.B. bei Chargebacks oder Retries).

## Cloud Deployment

```env
# GoCardless (Sandbox für Tests in Produktion)
GOCARDLESS_ENVIRONMENT=sandbox
GOCARDLESS_SANDBOX_ACCESS_TOKEN=sandbox_xxx
GOCARDLESS_SANDBOX_WEBHOOK_SECRET=xxx

# Später für Live:
# GOCARDLESS_ENVIRONMENT=live
# GOCARDLESS_LIVE_ACCESS_TOKEN=live_xxx
# GOCARDLESS_LIVE_WEBHOOK_SECRET=xxx
```

### Queue-Verarbeitung

Die GoCardless-Sync-Jobs werden automatisch über den **Cloud Scheduler** verarbeitet:

| Job | Schedule | Endpoint |
|-----|----------|----------|
| `process-queue` | Jede Minute | `/api/cron/process-queue` |

Der `process-queue` Job verarbeitet bis zu 20 Jobs pro Aufruf mit 25 Sekunden Timeout.

### Webhook-Setup in GoCardless

1. GoCardless Dashboard → Webhooks
2. Endpoint hinzufügen:
   - URL: `https://glattthub-web-xxx.run.app/api/webhooks/gocardless`
   - Secret: In `.env` als `GOCARDLESS_SANDBOX_WEBHOOK_SECRET` speichern
3. Events auswählen: Mandates, Payments, Subscriptions, Payouts

## API-Referenz

### Verträge

| Method | Endpoint | Beschreibung |
|--------|----------|--------------|
| GET | `/hub/contracts` | Vertragsübersicht (View) |
| GET | `/hub/contracts/{id}` | Vertragsdetails (View) |
| GET | `/hub/contracts/{id}/payments` | Zahlungen abrufen (JSON) |
| GET | `/hub/contracts/{id}/gocardless-details` | GoCardless-Details (JSON) |
| POST | `/hub/contracts/{id}/update-bank-account` | Bankverbindung ändern (JSON) |
| GET | `/hub/contracts/{id}/gocardless-mandates` | GC-Mandate für Stornierung (JSON) |
| POST | `/hub/contracts/{id}/gocardless-cancel-mandate` | GC-Mandat/Subscriptions stornieren (JSON) |
| POST | `/hub/contracts/{id}/link-existing-mandate` | Bestehendes Mandat verknüpfen (JSON) |

### Zahlungen-Endpoint

**Request:**
```
GET /hub/contracts/{id}/payments
Accept: application/json
```

**Response (mit GoCardless Subscription):**
```json
{
    "success": true,
    "data": {
        "payments": [
            {
                "id": "PM01xxx",
                "amount": 5999,
                "charge_date": "2026-04-01",
                "status": "pending_submission",
                "links": { "subscription": "SB01xxx" }
            },
            {
                "id": null,
                "amount": 5999,
                "charge_date": "2027-02-01",
                "status": "scheduled",
                "links": []
            }
        ],
        "source": "gocardless_subscription",
        "subscription": {
            "id": "SB01xxx",
            "name": "2026.03.08-XX001234-V123",
            "amount": 5999,
            "interval_unit": "monthly",
            "day_of_month": 1,
            "count": 18,
            "status": "active"
        }
    }
}
```

**Hinweise zur Zahlungsanzeige:**

- **GoCardless `upcoming_payments`** liefert max. 10 zukünftige Zahlungen → haben `links.subscription` und Status `pending_submission`
- **Lokale DB-Einträge** füllen die restlichen Monate → haben leere `links` und Status `scheduled`
- **Deduplizierung** erfolgt monatsbasiert (`YYYY-MM`), echte GC-Zahlungen haben Vorrang
- Zahlungen mit `links.subscription` und ohne `id` zeigen das **GoCardless-Symbol** in der UI
- Alle geplanten Zahlungen zeigen das **"Vorgemerkt"-Badge** (gelb)

### Webhooks

| Method | Endpoint | Beschreibung |
|--------|----------|--------------|
| POST | `/api/webhooks/gocardless` | GoCardless Webhook-Empfang |

---

## Migration von ContractMandate → ClientMandate

### Übersicht

Die Migration `2026_03_08_100000_create_client_mandates_and_refactor_contracts.php` führt folgende Schritte durch:

1. **Erstellt `client_mandates` Tabelle** mit allen Bank/Zahler/GC-Feldern
2. **Erweitert `contracts` Tabelle** um `client_mandate_id`, `first_payment_date`, `monthly_amount_cents`, `installment_count`, `gocardless_instalment_schedule_id`
3. **Erweitert `contract_payments` Tabelle** um `client_mandate_id`
4. **Migriert bestehende Daten**: Gruppiert alte `ContractMandate`-Einträge per `client_id` + `gocardless_mandate_id`, erstellt `ClientMandate`-Einträge, verknüpft Contracts und Payments

### Migration ausführen

```bash
php artisan migrate
```

### Rollback

Die alte `contract_mandates` Tabelle wird **nicht** gelöscht. Das Legacy-Modell `ContractMandate` und die `mandate()` Beziehung auf `Contract` bleiben als Fallback erhalten.

### Was bleibt Legacy?

| Komponente | Status |
|-----------|--------|
| `ContractMandate` Model | Bleibt (für Legacy-Daten und Import-Skript) |
| `Contract→mandate()` Relation | Bleibt (deprecated, für createPaymentSchedule Fallback) |
| `ContractPayment→mandate()` Relation | Bleibt (für alte Payments mit `mandate_id`) |
| `ImportLegacyContracts` Artisan Command | Erstellt weiterhin `ContractMandate` (separater Legacy-Import) |

### Neuer Code verwendet

| Alt | Neu |
|-----|-----|
| `$contract->mandate` | `$contract->clientMandate` |
| `$contract->mandate->monthly_amount_cents` | `$contract->monthly_amount_cents` |
| `$contract->mandate->installment_count` | `$contract->installment_count` |
| `$contract->mandate->first_payment_date` | `$contract->first_payment_date` |
| `$contract->mandate->gocardless_instalment_schedule_id` | `$contract->gocardless_subscription_id` |
| `ContractMandate::STATUS_*` | `ClientMandate::STATUS_*` |
| `SyncMandateToGoCardlessJob($mandate)` | `SyncMandateToGoCardlessJob($clientMandate, $contract)` |

---

## Troubleshooting

### Job schlägt fehl

**Logs prüfen:**
```bash
tail -100 storage/logs/laravel.log | grep -E "(GoCardless|SyncMandate|ERROR)"
```

**Job manuell ausführen:**
```bash
php artisan tinker
>>> $mandate = \App\Models\ClientMandate::find(10);
>>> $contract = $mandate->contracts()->where('status', 'active')->first();
>>> dispatch(new \App\Jobs\SyncMandateToGoCardlessJob($mandate, $contract));
>>> exit
php artisan queue:work --once
```

### Duplikate in GoCardless

Der Service prüft automatisch auf existierende Kunden per E-Mail:

```php
$existingCustomer = $this->findExistingCustomer($email);
```

### Sandbox vs Live

In der Sandbox sind einige Features eingeschränkt:
- Keine benutzerdefinierten Mandatsreferenzen
- Test-IBANs verwenden (z.B. DE89370400440532013000)
- Zahlungen werden nicht wirklich eingezogen

### Legacy-Verträge ohne ClientMandate

Alte Verträge die noch kein `client_mandate_id` haben, werden über die Legacy-Fallbacks bedient:
- `Contract→createPaymentSchedule()` prüft erst `$this->clientMandate`, dann `$this->mandate`
- `ContractPayment→isSepaPayment` prüft sowohl `client_mandate_id` als auch `mandate_id`

---

## Changelog

### v2.1.0 (März 2026) — Subscription (Dauerauftrag) statt InstalmentSchedule

- **🔄 Breaking:** `gocardless_instalment_schedule_id` → `gocardless_subscription_id` auf `contracts`
- ✨ GoCardless **Subscription** (Dauerauftrag) statt InstalmentSchedule pro Vertrag
- ✨ `GoCardlessPaymentPlanService` — neuer Service für Payment-Plan-Lifecycle
- ✨ `activatePendingPlans()` — erstellt Subscriptions automatisch wenn Mandat aktiv wird (Webhook)
- ✨ Zahlungsübersicht mit GoCardless-Symbol (Light/Darkmode) für API-bestätigte Zahlungen
- ✨ Monatsbasierte Deduplizierung (GC upcoming_payments max. 10 + lokale DB für Rest)
- ✨ Status "Vorgemerkt" für alle geplanten Zahlungen (GC + lokal)
- ✨ Subscription-Webhook-Handler (created/finished/cancelled)
- ✨ Legacy InstalmentSchedule-Webhook-Handler beibehalten (Log-only)

### v2.0.0 (März 2026) — ClientMandate Restructure

- **🔄 Breaking:** `ContractMandate` → `ClientMandate` (1:n statt 1:1)
- ✨ Ein Mandat pro Kunde, beliebig viele Verträge pro Mandat
- ✨ Zahlplan-Daten auf Contract statt Mandate
- ✨ GoCardless Subscription-ID auf Contract
- ✨ Zwei-Phasen-Sync (Mandate Sync + Subscription Creation getrennt)
- ✨ Restbetrag computed statt stored (keine Inkonsistenzen mehr)
- ✨ Automatisches Mandate-Linking bei Bestandskunden
- ✨ SyncMandateToGoCardlessJob akzeptiert optional Contract

### v1.0.0 (Februar 2026)

- ✨ GoCardless Integration mit automatischer Synchronisierung
- ✨ Ratenzahlungspläne (InstalmentSchedule → später Subscription)
- ✨ Webhook-Verarbeitung für Payment-Status
- ✨ Vor-Ort-Zahlung (Rate 1) + SEPA (Raten 2-n)
- ✨ Abweichender Zahler Support
- ✨ Phorest-Integration (E-Mail, Kundennummer, Name)
- ✨ Zahlungsübersicht im Hub

---

**Siehe auch:**
- [GOCARDLESS-API.md](./GOCARDLESS-API.md) - Detaillierte API-Dokumentation
- [glatttPakete.md](./glatttPakete.md) - Übersicht Pakete & Preislisten
- [PREISLISTEN-MODUL.md](./PREISLISTEN-MODUL.md) - Preiskonfiguration
