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

---

# Für Nutzer

## Übersicht

Das Vertragsmodul ermöglicht die vollständige Verwaltung von Kundenverträgen für GLATTT-Pakete:

- **Vertragserstellung** aus ausgefüllten Formularen
- **SEPA-Lastschriften** mit automatischer GoCardless-Synchronisierung
- **Ratenzahlung** mit flexiblen Laufzeiten (3-24 Monate)
- **Zahlungsübersicht** mit Status-Tracking

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

### Ablauf für den Kunden

1. **Vertragsformular** ausfüllen und unterschreiben
2. **SEPA-Formular** ausfüllen:
   - IBAN eingeben
   - BIC (optional, wird automatisch ermittelt)
   - Bei abweichendem Kontoinhaber: Name, Adresse, E-Mail
   - Startdatum für erste Abbuchung wählen
3. Fertig! Die Lastschriften werden automatisch eingezogen

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
- **Ratenzahlungsplan**: GoCardless Schedule-ID
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

- 🟡 **Ausstehend** (pending_submission, pending) - Noch nicht eingezogen
- 🟢 **Bestätigt** (confirmed) - Abbuchung erfolgreich
- 🔵 **Ausgezahlt** (paid_out) - Auf eurem Konto eingegangen
- 🔴 **Fehlgeschlagen** (failed) - Abbuchung gescheitert

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

### Komponenten-Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Hub)                           │
├─────────────────────────────────────────────────────────────────┤
│  contracts/index.blade.php  │  contracts/show.blade.php         │
│  Alpine.js Components       │  paymentsTab(), etc.              │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                     Controller Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  ContractController      - CRUD, Zahlungen-API                  │
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
│  SyncMandateToGoCardlessJob - Async GoCardless-Synchronisierung │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   GoCardless API    │
                    │   (Sandbox/Live)    │
                    └─────────────────────┘
```

### Datenfluss: Vertragserstellung

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
              Contract              ContractMandate
            (status: draft)        (status: pending)
                               
                               
Kunde → SEPA-Formular → FormSubmission
                               │
                    ContractCreationService
                    ::processSepaFormSubmission()
                               │
                    ┌──────────┴──────────┐
                    │                     │
              Contract              ContractMandate
            (status: active)       (status: active)
                                         │
                            dispatch(SyncMandateToGoCardlessJob)
                                         │
                              GoCardlessMandateService
                              ::syncMandateToGoCardless()
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
               Customer          CustomerBankAccount       Mandate
                    │                                         │
                    └──────────────────┬──────────────────────┘
                                       │
                              InstalmentSchedule
                              (18 Payments erstellt)
```

## Datenmodell

### contracts

```sql
CREATE TABLE contracts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contract_number VARCHAR(255) UNIQUE,    -- z.B. 2026.02.10-BI005945
    branch_id BIGINT,                        -- Standort
    client_id VARCHAR(255),                  -- Phorest Client ID
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    
    -- Paket-Details
    package_name VARCHAR(255),
    body_zones JSON,                         -- ["achseln", "bikini", ...]
    kpz_count INT,                           -- Körperpunktzonen
    duration_months INT,                     -- Laufzeit
    
    -- Preise
    monthly_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    
    -- Zahlungsdetails
    payment_method ENUM('sepa', 'cash', 'card'),
    
    -- Status
    status ENUM('draft', 'active', 'completed', 'cancelled'),
    
    -- Formular-Referenzen
    form_submission_id BIGINT,               -- Vertragsformular
    sepa_form_submission_id BIGINT,          -- SEPA-Formular
    
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### contract_mandates

```sql
CREATE TABLE contract_mandates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contract_id BIGINT FOREIGN KEY,
    
    -- Mandat-Referenz
    mandate_reference VARCHAR(255) UNIQUE,   -- z.B. 2026.02.10-BI005945
    
    -- Zahler-Informationen
    has_different_payer BOOLEAN DEFAULT FALSE,
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
    
    -- Ratenzahlung
    first_payment_date DATE,
    monthly_amount_cents INT,
    total_amount_cents INT,
    installment_count INT,
    
    -- Unterschrift
    mandate_signed_at DATETIME,
    form_submission_id BIGINT,
    
    -- Status
    status ENUM('pending', 'active', 'submitted', 'failed', 'cancelled', 'expired'),
    
    -- GoCardless IDs
    gocardless_customer_id VARCHAR(255),
    gocardless_customer_bank_account_id VARCHAR(255),
    gocardless_mandate_id VARCHAR(255) UNIQUE,
    gocardless_instalment_schedule_id VARCHAR(255),
    gocardless_synced_at TIMESTAMP,
    gocardless_error TEXT,
    
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### contract_payments

```sql
CREATE TABLE contract_payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contract_id BIGINT FOREIGN KEY,
    mandate_id BIGINT FOREIGN KEY,
    
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

**.env (Sandbox):**

```env
GOCARDLESS_ENVIRONMENT=sandbox
GOCARDLESS_SANDBOX_ACCESS_TOKEN=sandbox_xxx
GOCARDLESS_SANDBOX_WEBHOOK_SECRET=xxx
```

**.env (Live):**

```env
GOCARDLESS_ENVIRONMENT=live
GOCARDLESS_LIVE_ACCESS_TOKEN=live_xxx
GOCARDLESS_LIVE_WEBHOOK_SECRET=xxx
```

### Sync-Prozess im Detail

Der `SyncMandateToGoCardlessJob` führt folgende Schritte aus:

#### 1. Phorest-Kundendaten abrufen

```php
// Hole E-Mail und External ID aus Phorest
$phorestClient = $this->phorest->getClient($clientId, $branchId);
$email = $phorestClient['email'] ?? null;
$externalId = $phorestClient['externalId'] ?? null;
```

#### 2. GoCardless Customer erstellen/finden

```php
// Prüfe ob Customer mit E-Mail existiert
$existingCustomer = $this->findExistingCustomer($email);

if ($existingCustomer) {
    return $existingCustomer['id'];
}

// Neuen Customer erstellen
$response = $this->api->createCustomer(
    email: $email ?? $mandate->payer_email,
    givenName: $mandate->payer_first_name,
    familyName: $mandate->payer_last_name,
    metadata: [
        'phorest_client_id' => $clientId,
        'kundennummer' => $externalId,
        'vertragsnehmer' => $hasDifferentPayer ? $contractHolderName : null,
    ]
);
```

#### 3. Bank Account erstellen

```php
// IBAN entschlüsseln und Bank Account anlegen
$iban = decrypt($mandate->payer_iban);

$response = $this->api->createCustomerBankAccount(
    customerId: $customerId,
    accountHolderName: $accountHolder,
    iban: $iban,
    metadata: ['phorest_client_id' => $clientId]
);
```

#### 4. SEPA-Mandat erstellen

```php
// Mandatsreferenz nur in Live (Sandbox unterstützt das nicht)
$isLive = config('gocardless.environment') === 'live';

$response = $this->api->createMandate(
    customerBankAccountId: $bankAccountId,
    scheme: 'sepa_core',
    metadata: [
        'phorest_client_id' => $clientId,
        'mandate_ref' => $mandate->mandate_reference,
        'contract_id' => (string) $mandate->contract_id,
    ],
    reference: $isLive ? $mandate->mandate_reference : null
);
```

#### 5. Ratenzahlungsplan erstellen

```php
// 19 Raten insgesamt = 1 vor Ort + 18 SEPA
$goCardlessCount = $mandate->installment_count - 1;

$instalments = [];
for ($i = 0; $i < $goCardlessCount; $i++) {
    $chargeDate = $this->calculateChargeDate(
        $startDate->copy()->addMonths($i)
    );
    
    $instalments[] = [
        'charge_date' => $chargeDate->format('Y-m-d'),
        'amount' => $monthlyAmount,
    ];
}

$response = $this->api->createInstalmentScheduleWithDates(
    mandateId: $gcMandateId,
    currency: 'EUR',
    name: $mandate->mandate_reference,
    instalments: $instalments,
    metadata: [
        'contract_id' => (string) $mandate->contract_id,
        'phorest_client_id' => $clientId,
    ]
);
```

### Metadata-Übersicht

GoCardless erlaubt max. 3 Metadata-Felder pro Ressource:

| Ressource | Metadata-Felder |
|-----------|-----------------|
| **Customer** | `phorest_client_id`, `kundennummer`, `vertragsnehmer` |
| **BankAccount** | `phorest_client_id` |
| **Mandate** | `phorest_client_id`, `mandate_ref`, `contract_id` |
| **InstalmentSchedule** | `contract_id`, `phorest_client_id` |

## Services & Jobs

### ContractCreationService

Erstellt Verträge aus Formular-Einreichungen:

```php
use App\Services\ContractCreationService;

// Aus Vertragsformular
$service = app(ContractCreationService::class);
$contract = $service->createFromSubmission($formSubmission);

// SEPA-Formular verarbeiten
$service->processSepaFormSubmission($sepaSubmission);
```

**Wichtige Methoden:**

| Methode | Beschreibung |
|---|---|
| `createFromSubmission()` | Erstellt Contract + ggf. Mandate aus FormSubmission |
| `isOneTimePayment()` | Prüft `display_mode` des contract_price-Feldes (`total_only` = Direkt) |
| `generateContractNumber()` | Erzeugt unique Nummer mit auto-Suffix bei Duplikaten |
| `processSepaFormSubmission()` | Vervollständigt Mandat mit Bankdaten |
| `extractContractPriceData()` | Liest Preisdaten aus Submission-Values |

### GoCardlessMandateService

High-Level Service für GoCardless-Sync:

```php
use App\Services\GoCardlessMandateService;

$service = app(GoCardlessMandateService::class);

// Mandat synchronisieren
$service->syncMandateToGoCardless($mandate);

// Bereits synchronisiert? Skip.
if ($mandate->gocardless_mandate_id) {
    // ...
}
```

### SyncMandateToGoCardlessJob

Async Job für Background-Verarbeitung:

```php
use App\Jobs\SyncMandateToGoCardlessJob;

// Manuell dispatchen
dispatch(new SyncMandateToGoCardlessJob($mandate));

// Mit Verzögerung
dispatch(new SyncMandateToGoCardlessJob($mandate))
    ->delay(now()->addMinutes(5));
```

**Job-Konfiguration:**

- Queue: `default`
- Retries: 3
- Backoff: 60, 300, 600 Sekunden
- Timeout: 120 Sekunden

### GoCardlessApiService

Low-Level API-Client:

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

// Instalment Schedule
$response = $api->createInstalmentScheduleWithDates($mandateId, 'EUR', $name, $instalments, $metadata);
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
    
    // Events in DB speichern
    foreach ($request->input('events', []) as $event) {
        GoCardlessWebhookEvent::create([
            'event_id' => $event['id'],
            'resource_type' => $event['resource_type'],
            'action' => $event['action'],
            'resource_id' => $event['links'][$event['resource_type']] ?? null,
            'links' => $event['links'],
            'details' => $event['details'] ?? null,
        ]);
    }
    
    // Async verarbeiten
    dispatch(new ProcessGoCardlessWebhooksJob());
}
```

### Unterstützte Events

#### Mandate Events

| Event | Handler |
|-------|---------|
| `mandates.created` | Log |
| `mandates.active` | `updateMandateStatus('active')` |
| `mandates.failed` | `updateMandateStatus('failed')`, Error speichern |
| `mandates.cancelled` | `updateMandateStatus('cancelled')` |
| `mandates.expired` | `updateMandateStatus('expired')` |

#### Payment Events

| Event | Handler |
|-------|---------|
| `payments.created` | Log |
| `payments.submitted` | `updatePaymentStatus('submitted')` |
| `payments.confirmed` | `updatePaymentStatus('confirmed')` |
| `payments.paid_out` | `updatePaymentStatus('paid_out')`, Payout-ID speichern |
| `payments.failed` | `updatePaymentStatus('failed')`, Retry-Logic |
| `payments.cancelled` | `updatePaymentStatus('cancelled')` |
| `payments.charged_back` | `handleChargeback()` |

## Cloud Deployment

### Environment Variables

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

### SQL-Migration (falls nötig)

```sql
-- Spalten prüfen
SHOW COLUMNS FROM contract_mandates LIKE 'gocardless%';

-- Falls Spalten fehlen:
ALTER TABLE contract_mandates 
ADD COLUMN gocardless_customer_bank_account_id VARCHAR(255) NULL,
ADD COLUMN gocardless_instalment_schedule_id VARCHAR(255) NULL,
ADD COLUMN gocardless_synced_at TIMESTAMP NULL,
ADD COLUMN gocardless_error TEXT NULL;

CREATE INDEX idx_gc_instalment_schedule 
ON contract_mandates(gocardless_instalment_schedule_id);
```

### Webhook-Setup in GoCardless

1. GoCardless Dashboard → Webhooks
2. Endpoint hinzufügen:
   - URL: `https://glattthub-web-xxx.run.app/api/webhooks/gocardless`
   - Secret: In `.env` als `GOCARDLESS_SANDBOX_WEBHOOK_SECRET` speichern
3. Events auswählen: Mandates, Payments, Payouts

## API-Referenz

### Verträge

| Method | Endpoint | Beschreibung |
|--------|----------|--------------|
| GET | `/hub/contracts` | Vertragsübersicht (View) |
| GET | `/hub/contracts/{id}` | Vertragsdetails (View) |
| GET | `/hub/contracts/{id}/payments` | Zahlungen abrufen (JSON) |

### Zahlungen-Endpoint

**Request:**
```
GET /hub/contracts/{id}/payments
Accept: application/json
```

**Response:**
```json
{
    "success": true,
    "data": {
        "payments": [
            {
                "id": "PM01xxx",
                "amount": 19995,
                "charge_date": "2026-03-03",
                "status": "pending_submission"
            }
        ],
        "source": "gocardless"
    }
}
```

### Webhooks

| Method | Endpoint | Beschreibung |
|--------|----------|--------------|
| POST | `/api/webhooks/gocardless` | GoCardless Webhook-Empfang |

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
>>> $mandate = \App\Models\ContractMandate::find(10);
>>> dispatch(new \App\Jobs\SyncMandateToGoCardlessJob($mandate));
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

### Spalte fehlt in Cloud DB

```sql
-- Prüfen
SHOW COLUMNS FROM contract_mandates LIKE 'gocardless%';

-- Hinzufügen
ALTER TABLE contract_mandates 
ADD COLUMN [spaltenname] [typ] NULL;
```

---

## Changelog

### v1.0.0 (Februar 2026)

- ✨ GoCardless Integration mit automatischer Synchronisierung
- ✨ Ratenzahlungspläne (InstalmentSchedule)
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
