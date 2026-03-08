# GoCardless API Integration

## Übersicht

GoCardless ist unser Finanzdienstleister für Lastschriften (Direct Debit / SEPA). Diese Integration ermöglicht das automatische Einziehen von Zahlungen direkt vom Bankkonto der Kunden.

**Dokumentation:** https://developer.gocardless.com/api-reference/

**Verwandte Dokumentationen:**
- [Verträge & SEPA-Lastschriften](CONTRACTS-SEPA-MODULE.md) - Vollständige SEPA-Integration mit ClientMandate-Architektur, Zwei-Phasen-Sync, Subscriptions (Daueraufträge)
- [In-App Benachrichtigungen](IN-APP-NOTIFICATIONS.md) - Automatische Benachrichtigungen bei Webhook-Events
- [Push-Benachrichtigungen](PUSH-NOTIFICATIONS.md) - Web-Push bei wichtigen Events

> **Hinweis:** Diese Seite dokumentiert die allgemeine GoCardless API und den `GoCardlessApiService`. Für die glatttHub-spezifische Integration (ClientMandate, Zwei-Phasen-Sync, Subscriptions pro Vertrag) siehe [Verträge & SEPA-Lastschriften](CONTRACTS-SEPA-MODULE.md#gocardless-integration).

## Inhaltsverzeichnis

1. [Einrichtung](#einrichtung)
2. [Umgebungen (Sandbox/Live)](#umgebungen-sandboxlive)
3. [Authentifizierung](#authentifizierung)
4. [API-Ressourcen](#api-ressourcen)
5. [Webhooks](#webhooks)
6. [Benachrichtigungen](#benachrichtigungen)
7. [Workflow: Neue Lastschrift einrichten](#workflow-neue-lastschrift-einrichten)
8. [Beispiele](#beispiele)
9. [Fehlerbehandlung](#fehlerbehandlung)

---

## Einrichtung

### 1. Environment-Variablen

Füge folgende Variablen zur `.env`-Datei hinzu:

```env
# GoCardless API Configuration
# Umgebung: 'sandbox' oder 'live'
GOCARDLESS_ENVIRONMENT=sandbox

# Sandbox Credentials (https://manage-sandbox.gocardless.com)
GOCARDLESS_SANDBOX_ACCESS_TOKEN=sandbox_xxxxxxxxxxxxxxxxxxxxxxxx
GOCARDLESS_SANDBOX_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Live Credentials (https://manage.gocardless.com)
GOCARDLESS_LIVE_ACCESS_TOKEN=live_xxxxxxxxxxxxxxxxxxxxxxxx
GOCARDLESS_LIVE_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Standard Creditor ID (falls mehrere Creditoren)
GOCARDLESS_CREDITOR_ID=CR123456

# Optional: Standard Scheme (Default: sepa_core)
GOCARDLESS_DEFAULT_SCHEME=sepa_core

# Optional: API Timeouts
GOCARDLESS_API_TIMEOUT=30
GOCARDLESS_CONNECT_TIMEOUT=10
```

### 2. Google Cloud Secrets (Production)

Für die Production-Umgebung auf Google Cloud sollten die sensiblen Daten als Secrets gespeichert werden:

```bash
# Secret erstellen
gcloud secrets create GOCARDLESS_LIVE_ACCESS_TOKEN --replication-policy="automatic"
echo -n "live_xxxxxxxxxxxxxxxxxxxxxxxx" | gcloud secrets versions add GOCARDLESS_LIVE_ACCESS_TOKEN --data-file=-

gcloud secrets create GOCARDLESS_LIVE_WEBHOOK_SECRET --replication-policy="automatic"
echo -n "xxxxxxxxxxxxxxxxxxxxxxxx" | gcloud secrets versions add GOCARDLESS_LIVE_WEBHOOK_SECRET --data-file=-
```

### 3. Access Token generieren

1. **Sandbox:** https://manage-sandbox.gocardless.com/developers/access-tokens
2. **Live:** https://manage.gocardless.com/developers/access-tokens

Klicke auf "Create" → "Read/write access" auswählen → Token kopieren.

### 4. Webhook Endpoint einrichten

1. Im GoCardless Dashboard: Developers → Webhook Endpoints → "Create webhook endpoint"
2. URL: `https://ihre-domain.com/api/webhooks/gocardless`
3. Secret kopieren und in `.env` speichern

---

## Umgebungen (Sandbox/Live)

| Umgebung | Base URL | Dashboard |
|----------|----------|-----------|
| Sandbox | `https://api-sandbox.gocardless.com` | https://manage-sandbox.gocardless.com |
| Live | `https://api.gocardless.com` | https://manage.gocardless.com |

**Wechsel zwischen Umgebungen:**

```env
# In .env ändern:
GOCARDLESS_ENVIRONMENT=sandbox  # für Tests
GOCARDLESS_ENVIRONMENT=live     # für Produktion
```

---

## Authentifizierung

Alle Requests benötigen:

1. **Bearer Token** im Authorization Header
2. **GoCardless-Version** Header (aktuell: `2015-07-06`)

```php
// Der Service handhabt dies automatisch:
$service = new GoCardlessApiService();

// Umgebung prüfen
$service->getEnvironment();  // 'sandbox' oder 'live'
$service->isSandbox();       // true/false
$service->isLive();          // true/false
```

---

## API-Ressourcen

### Was wir ABRUFEN können (GET)

| Ressource | Beschreibung | Methode |
|-----------|--------------|---------|
| **Customers** | Kundendaten | `getCustomer($id)`, `listCustomers()` |
| **Customer Bank Accounts** | Bankkonten der Kunden | `getCustomerBankAccount($id)`, `listCustomerBankAccounts()` |
| **Mandates** | Lastschrift-Mandate | `getMandate($id)`, `listMandates()`, `listMandatesForCustomer($id)` |
| **Payments** | Einzelne Zahlungen | `getPayment($id)`, `listPayments()`, `listPaymentsForMandate($id)` |
| **Payouts** | Auszahlungen an uns | `getPayout($id)`, `listPayouts()` |
| **Payout Items** | Details einer Auszahlung | `listPayoutItems($payoutId)` |
| **Refunds** | Erstattungen | `getRefund($id)`, `listRefunds()` |
| **Subscriptions** | Wiederkehrende Zahlungen | `getSubscription($id)`, `listSubscriptions()` |
| **Instalment Schedules** | Ratenzahlungen (Legacy) | `getInstalmentSchedule($id)`, `listInstalmentSchedules()` |
| **Events** | Ereignisse/Aktivitäten | `getEvent($id)`, `listEvents()` |
| **Creditors** | Zahlungsempfänger (wir) | `getCreditor($id)`, `listCreditors()` |
| **Balances** | Kontostände | `listBalances($creditorId)` |
| **Bank Details Lookups** | Bankdaten validieren | `lookupBankDetails()` |
| **Currency Exchange Rates** | Wechselkurse | `listCurrencyExchangeRates()` |

### Was wir SETZEN können (POST/PUT)

| Aktion | Beschreibung | Methode |
|--------|--------------|---------|
| **Billing Request erstellen** | Neues Mandat + ggf. Zahlung | `createBillingRequest()` |
| **Billing Request Flow** | Hosted Payment Page | `createBillingRequestFlow()` |
| **Customer erstellen** | Neuen Kunden anlegen | `createCustomer()` |
| **Customer aktualisieren** | Kundendaten ändern | `updateCustomer()` |
| **Customer löschen** | GDPR Löschung | `removeCustomer()` |
| **Payment erstellen** | Einzelzahlung | `createPayment()` |
| **Payment stornieren** | Zahlung abbrechen | `cancelPayment()` |
| **Payment wiederholen** | Fehlgeschlagene Zahlung retry | `retryPayment()` |
| **Subscription erstellen** | Abo/wiederkehrende Zahlung | `createSubscription()` |
| **Subscription pausieren** | Abo pausieren | `pauseSubscription()` |
| **Subscription fortsetzen** | Abo fortsetzen | `resumeSubscription()` |
| **Subscription kündigen** | Abo beenden | `cancelSubscription()` |
| **Refund erstellen** | Erstattung | `createRefund()` |
| **Mandate stornieren** | Mandat beenden | `cancelMandate()` |
| **Mandate wiederherstellen** | Mandat reaktivieren | `reinstateMandate()` |
| **Instalment Schedule** | Ratenzahlung erstellen (Legacy) | `createInstalmentScheduleWithDates()` |

---

## Webhooks

### Webhook-Endpoint

Der Webhook-Endpoint ist bereits implementiert:

- **Route:** `POST /api/webhooks/gocardless`
- **Controller:** `App\Http\Controllers\GoCardlessWebhookController`
- **Job:** `App\Jobs\ProcessGoCardlessWebhookJob`
- **Model:** `App\Models\GoCardlessWebhookEvent`
- **CSRF:** Ausgenommen in `bootstrap/app.php`

### Production Setup (Cloud Run)

Cloud Run ist ideal für Webhooks:
- **Cold Start:** ~1-2 Sekunden
- **GoCardless Retry:** Automatische Wiederholung bis zu 7 Tage
- **Timeout:** 30 Sekunden - mehr als ausreichend

**Webhook-URL für Production:**
```
https://glattthub-web-99200336070.europe-west3.run.app/api/webhooks/gocardless
```

**Im GoCardless Dashboard eintragen:**
1. Developers → Webhook Endpoints → "Create webhook endpoint"
2. Name: `Production_glatttHub`
3. URL: `https://glattthub-web-99200336070.europe-west3.run.app/api/webhooks/gocardless`
4. Events: Alle auswählen
5. Secret kopieren und als Google Cloud Secret speichern

**Secret als Google Cloud Secret:**
```bash
# Secret erstellen
gcloud secrets create GOCARDLESS_LIVE_WEBHOOK_SECRET --replication-policy="automatic"
echo -n "DEIN_WEBHOOK_SECRET" | gcloud secrets versions add GOCARDLESS_LIVE_WEBHOOK_SECRET --data-file=-

# Zugriff für Cloud Run geben
gcloud secrets add-iam-policy-binding GOCARDLESS_LIVE_WEBHOOK_SECRET \
  --member="serviceAccount:99200336070-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Lokale Entwicklung mit ngrok

Für lokale Webhook-Tests wird ngrok verwendet:

```bash
# ngrok installieren (falls nicht vorhanden)
brew install ngrok

# Auth-Token konfigurieren (einmalig)
ngrok config add-authtoken DEIN_TOKEN

# Tunnel starten
ngrok http 8888
```

Die ngrok-URL (z.B. `https://xxx.ngrok-free.dev/api/webhooks/gocardless`) im GoCardless Dashboard als Webhook-Endpoint eintragen.

### Webhook-Verarbeitung

Die Webhook-Verarbeitung folgt diesem Ablauf:

1. **Request empfangen** → Signatur verifizieren
2. **Event speichern** → In `gocardless_webhook_events` Tabelle (Idempotenz via `event_id`)
3. **Job dispatchen** → `ProcessGoCardlessWebhookJob` in die Queue
4. **200 OK zurückgeben** → Sofort, bevor Verarbeitung abgeschlossen
5. **Async verarbeiten** → Job führt Business-Logik aus
6. **Benachrichtigung** → Bei wichtigen Events wird In-App-Notification erstellt

### In-App Benachrichtigungen

Bei kritischen Events werden automatisch In-App-Benachrichtigungen erstellt:

| Event | Benachrichtigung |
|-------|------------------|
| `payments.failed` | ❌ Zahlung fehlgeschlagen |
| `payments.charged_back` | ⚠️ Rückbuchung durch Kunden |
| `mandates.failed` | ❌ Mandat fehlgeschlagen |
| `mandates.cancelled` | ⚠️ Mandat storniert |
| `subscriptions.cancelled` | 🔔 Abo gekündigt |
| `refunds.failed` | ❌ Erstattung fehlgeschlagen |

Positive Events (`payments.confirmed`, `mandates.active`, etc.) erstellen ebenfalls Benachrichtigungen zur Übersicht.

**➡️ Detaillierte Dokumentation:** [In-App Benachrichtigungen](IN-APP-NOTIFICATIONS.md#webhook-automatisierung)

---

## Benachrichtigungen

### Automatische Benachrichtigungen

Jedes Webhook-Event kann automatisch **In-App- und Push-Benachrichtigungen** auslösen. Die Regeln werden im Admin-Panel konfiguriert:

**Admin → Kommunikation → Webhook-Regeln**

### Ablauf

```
GoCardless Webhook
        ↓
  Event speichern (DB)
        ↓
  Job in Queue legen
        ↓
  200 OK zurück an GoCardless
        ↓
  Queue Worker verarbeitet:
        ├── Business-Logik ausführen
        ├── In-App-Benachrichtigung erstellen
        └── Push-Benachrichtigung senden (gleiche Zielgruppe)
```

### Konfigurierbare Regeln

Im Admin-Panel können für jede Event-Kombination eigene Regeln definiert werden:

| Einstellung | Beschreibung |
|-------------|--------------|
| **Provider** | GoCardless (erweiterbar) |
| **Ressourcen-Typ** | payments, mandates, subscriptions, refunds, payouts, creditors |
| **Aktion** | created, confirmed, failed, cancelled, etc. |
| **Titel** | Mit Platzhaltern, z.B. `Zahlung {resource_id} fehlgeschlagen` |
| **Nachricht** | Mit Platzhaltern, z.B. `Grund: {failure_reason}` |
| **Zielgruppe** | An alle, bestimmte Rollen, User, oder Standorte |

### Verfügbare Platzhalter

Alle Platzhalter sind dokumentiert unter: [In-App Benachrichtigungen → Verfügbare Platzhalter](IN-APP-NOTIFICATIONS.md#verfügbare-platzhalter)

**Häufig genutzte:**

| Platzhalter | Beispiel |
|-------------|----------|
| `{resource_id}` | PM00123ABC |
| `{action}` | failed |
| `{amount_formatted}` | 49,99 € |
| `{failure_reason}` | insufficient_funds |
| `{mandate_reference}` | 2026.02.10-H001234 |

### Zielgruppen

| Option | Beschreibung |
|--------|--------------|
| **An alle** | Broadcast an alle User (In-App + Push) |
| **Rollen** | User mit bestimmten Rollen (admin, finance, etc.) |
| **User** | Spezifische User-IDs |
| **Standorte** | User mit `home_branch_id` = Standort |

### Push-Integration

Jede In-App-Benachrichtigung wird automatisch auch als **Push-Benachrichtigung** an dieselben Empfänger gesendet. Dafür ist keine zusätzliche Konfiguration nötig.

**➡️ Push-Details:** [Push-Benachrichtigungen](PUSH-NOTIFICATIONS.md)

### Webhook Events in Datenbank

Alle Events werden in `gocardless_webhook_events` gespeichert:

```php
// Event-Status abfragen
$pending = GoCardlessWebhookEvent::pending()->count();
$failed = GoCardlessWebhookEvent::failed()->get();

// Fehlgeschlagene Events erneut verarbeiten
foreach ($failed as $event) {
    ProcessGoCardlessWebhookJob::dispatch($event);
}
```

### Wichtige Webhook Events

#### Payments
| Event | Beschreibung |
|-------|--------------|
| `created` | Zahlung erstellt |
| `submitted` | An Bank übermittelt |
| `confirmed` | ✅ Zahlung erfolgreich |
| `failed` | ❌ Zahlung fehlgeschlagen |
| `paid_out` | An uns ausgezahlt |
| `cancelled` | Storniert |
| `charged_back` | ⚠️ Rückbuchung |

#### Mandates
| Event | Beschreibung |
|-------|--------------|
| `created` | Mandat erstellt |
| `active` | ✅ Mandat aktiv |
| `cancelled` | Mandat storniert |
| `failed` | Mandat-Erstellung fehlgeschlagen |
| `expired` | Mandat abgelaufen |

#### Subscriptions
| Event | Beschreibung |
|-------|--------------|
| `created` | Abo erstellt |
| `payment_created` | Neue Abo-Zahlung |
| `cancelled` | Abo gekündigt |
| `finished` | Abo regulär beendet |
| `paused` | Abo pausiert |
| `resumed` | Abo fortgesetzt |

#### Payouts
| Event | Beschreibung |
|-------|--------------|
| `paid` | ✅ Auszahlung erfolgt |
| `bounced` | ⚠️ Auszahlung zurückgewiesen |

---

## Workflow: Neue Lastschrift einrichten

### glatttHub Integration (Zwei-Phasen-Sync)

Die glatttHub-App nutzt einen eigenen Sync-Workflow über `GoCardlessMandateService` und `SyncMandateToGoCardlessJob`:

1. **Phase 1 — Mandate Sync:** Customer → BankAccount → Mandate erstellen (einmalig pro Kunde)
2. **Phase 2 — Subscription Creation:** Subscription (Dauerauftrag) pro Vertrag erstellen

Das Mandat gehört zum **Kunden** (via `ClientMandate`-Model), nicht zum einzelnen Vertrag. Ein Kunde hat ein Mandat, aber beliebig viele Verträge mit jeweils eigener Subscription.

**Metadata-Zuweisung:**

| Ressource | Metadata |
|-----------|----------|
| **Customer** | `phorest_client_id`, `kundennummer`, `vertragsnehmer` |
| **BankAccount** | `phorest_client_id` |
| **Mandate** | `phorest_client_id`, `mandate_ref` |
| **Subscription** | `contract_id`, `phorest_client_id`, `mandate_ref` |

> **Vollständige Dokumentation:** [Verträge & SEPA → GoCardless Integration](CONTRACTS-SEPA-MODULE.md#gocardless-integration)

### Generische API-Nutzung: Billing Request Flow

```php
use App\Services\GoCardlessApiService;

$service = new GoCardlessApiService();

// 1. Billing Request erstellen
$response = $service->createBillingRequest(
    mandateRequest: [
        'scheme' => 'sepa_core',
        'metadata' => ['customer_id' => '12345'],
    ]
);
$billingRequest = $response->json('billing_requests');

// 2. Hosted Payment Page erstellen
$flowResponse = $service->createBillingRequestFlow(
    billingRequestId: $billingRequest['id'],
    redirectUri: 'https://ihre-domain.com/payment/success',
    exitUri: 'https://ihre-domain.com/payment/cancel',
    language: 'de'
);
$flow = $flowResponse->json('billing_request_flows');

// 3. Kunde zur Payment Page weiterleiten
$redirectUrl = $flow['authorisation_url'];
return redirect($redirectUrl);

// 4. Nach Rückkehr: Billing Request Status prüfen
$statusResponse = $service->getBillingRequest($billingRequest['id']);
$status = $statusResponse->json('billing_requests.status');

if ($status === 'fulfilled') {
    $mandateId = $statusResponse->json('billing_requests.links.mandate_request_mandate');
    // Mandat ist aktiv, Zahlungen können erstellt werden
}
```

### Zahlung einziehen

```php
// Einzelzahlung erstellen
$paymentResponse = $service->createPayment(
    mandateId: 'MD123456',
    amount: 4999,  // 49,99 EUR in Cent
    currency: 'EUR',
    chargeDate: $service->getNextPossibleChargeDate(5),  // +5 Werktage
    description: 'Abo-Zahlung Januar 2025',
    reference: 'INV-2025-001',
    metadata: ['invoice_id' => 'INV-2025-001']
);

$payment = $paymentResponse->json('payments');
// Status: pending_submission → submitted → confirmed → paid_out
```

### Subscription (Dauerauftrag — glatttHub Standard)

> **Wichtig:** Seit März 2026 nutzt glatttHub **Subscriptions** statt InstalmentSchedules für alle Zahlungspläne.

```php
// Dauerauftrag für Vertrag erstellen (18 monatliche Raten)
$subscriptionResponse = $service->createSubscription(
    mandateId: 'MD123456',
    amount: 5999,  // 59,99 EUR in Cent
    currency: 'EUR',
    intervalUnit: 'monthly',
    interval: 1,
    dayOfMonth: 1,  // Am 1. jeden Monats
    startDate: '2026-04-01',
    count: 18,  // Anzahl Raten (endlich)
    name: '2026.03.08-XX001234-V123',
    metadata: [
        'contract_id' => '123',
        'phorest_client_id' => 'bDclStpdbpEVmYSVnoKAlg',
        'mandate_ref' => '2026.03.08-XX001234'
    ]
);

// Abo pausieren
$service->pauseSubscription($subscriptionId);

// Abo fortsetzen
$service->resumeSubscription($subscriptionId);

// Abo kündigen
$service->cancelSubscription($subscriptionId);
```

### Erstattung

```php
// Teilerstattung
$refundResponse = $service->createRefund(
    paymentId: 'PM123456',
    amount: 1000,  // 10,00 EUR
    totalAmountConfirmation: 1000,  // Bestätigung
    reference: 'Kulanz-Erstattung',
    metadata: ['reason' => 'customer_request']
);
```

---

## Beispiele

### Kunden mit allen Mandaten abrufen

```php
$service = new GoCardlessApiService();

// Alle Mandate eines Kunden
$mandates = $service->listMandatesForCustomer('CU123456');

foreach ($mandates->json('mandates') as $mandate) {
    echo "Mandate: {$mandate['id']} - Status: {$mandate['status']}\n";
    
    // Zahlungen für dieses Mandat
    $payments = $service->listPaymentsForMandate($mandate['id']);
    foreach ($payments->json('payments') as $payment) {
        echo "  Payment: {$payment['id']} - {$payment['amount']} {$payment['currency']}\n";
    }
}
```

### Bankdaten validieren

```php
$lookupResponse = $service->lookupBankDetails(
    countryCode: 'DE',
    iban: 'DE89370400440532013000'
);

$result = $lookupResponse->json('bank_details_lookups');
// available_debit_schemes: ['sepa_core']
// bank_name: 'COMMERZBANK AG'
// bic: 'COBADEFFXXX'
```

### Auszahlung mit Details abrufen

```php
$payout = $service->getPayout('PO123456');
$payoutItems = $service->listPayoutItems('PO123456');

$totalAmount = $payout->json('payouts.amount');
$arrivalDate = $payout->json('payouts.arrival_date');

foreach ($payoutItems->json('payout_items') as $item) {
    echo "{$item['type']}: {$item['amount']}\n";
    // payment_paid_out: 1000
    // gocardless_fee: -4
}
```

---

## Fehlerbehandlung

### Error Types

| Type | Beschreibung | Aktion |
|------|--------------|--------|
| `gocardless` | GoCardless interner Fehler | Retry nach Wartezeit |
| `invalid_api_usage` | Falscher API-Aufruf | Code prüfen |
| `invalid_state` | Ungültiger Ressourcen-Status | Workflow prüfen |
| `validation_failed` | Validierungsfehler | Input prüfen |

### Beispiel Fehlerbehandlung

```php
$response = $service->createPayment($mandateId, $amount, 'EUR');

if (!$response->successful()) {
    $error = $response->json('error');
    
    switch ($error['type']) {
        case 'validation_failed':
            foreach ($error['errors'] as $fieldError) {
                Log::error("Validation: {$fieldError['field']} - {$fieldError['message']}");
            }
            break;
            
        case 'invalid_state':
            Log::warning("Invalid state: {$error['message']}");
            // Z.B. Mandat ist nicht mehr aktiv
            break;
            
        case 'gocardless':
            Log::error("GoCardless error: {$error['message']}", [
                'request_id' => $error['request_id']
            ]);
            // Support kontaktieren mit request_id
            break;
    }
}
```

---

## Test-Bankdaten (Sandbox)

Für Tests in der Sandbox-Umgebung:

### SEPA (Deutschland)
```
IBAN: DE89370400440532013000
```

### UK (Bacs)
```
Account Number: 55779911
Sort Code: 200000
```

### Fehlgeschlagene Zahlung simulieren
```
Account Number: 55779955
Sort Code: 200000
```

---

## Wichtige Hinweise

1. **SEPA Vorlaufzeit:** Mindestens 3-5 Werktage für `charge_date`
2. **Beträge in Cent:** Alle Beträge müssen in der kleinsten Währungseinheit angegeben werden
3. **Webhook Idempotenz:** Webhooks können mehrfach gesendet werden - Events nur einmal verarbeiten
4. **Sandbox vs Live:** Immer in Sandbox testen, bevor Live geschaltet wird
5. **PCI Compliance:** Bankdaten sollten nur über Billing Request Flow erfasst werden (hosted payment page)

---

## Support

- **GoCardless Dokumentation:** https://developer.gocardless.com
- **API Reference:** https://developer.gocardless.com/api-reference/
- **GoCardless Support:** help@gocardless.com
