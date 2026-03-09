# 📡 Phorest API Integration

Dokumentation der Phorest API Integration in glatttHub.

## 📋 Übersicht

Die Phorest API ermöglicht die Integration mit dem Phorest Salon Management System. glatttHub nutzt diese API für:

- **Termine** - Abfrage, Aktualisierung und Check-in
- **Kunden** - Abfrage und Verwaltung von Kundendaten
- **Institute** - Abruf aller Filialen/Branches
- **Mitarbeiter** - Staff-Informationen pro Branch
- **Services** - Behandlungs-Katalog
- **Verfügbarkeit** - Terminslots prüfen
- **Buchungen** - Neue Buchungen erstellen
- **Käufe (Purchases)** - Kauf von Services, Produkten, Kursen & Gutscheinen
- **Kundenkonto (Credit Account)** - Guthaben auf dem Kunden-Kreditkonto verwalten
- **Gutscheine** - Voucher-Verwaltung

## 🔧 Konfiguration

### Umgebungsvariablen (.env)

```env
# Phorest API Credentials
PHOREST_USERNAME=your_api_username
PHOREST_PASSWORD=your_api_password
PHOREST_BUSINESS_ID=your_business_id

# Optional
PHOREST_API_BASE_URL=https://api-gateway-eu.phorest.com/third-party-api-server/api
PHOREST_API_TIMEOUT=30
```

### Konfigurationsdatei

Die Konfiguration befindet sich in `config/phorest.php`:

```php
return [
    'base_url' => env('PHOREST_API_BASE_URL', 'https://api-gateway-eu.phorest.com/third-party-api-server/api'),
    'credentials' => [
        'username' => env('PHOREST_USERNAME'),
        'password' => env('PHOREST_PASSWORD'),
    ],
    'business_id' => env('PHOREST_BUSINESS_ID'),
    'timeout' => env('PHOREST_API_TIMEOUT', 30),
    // ... endpoints
];
```

## 📁 Dateien

| Datei | Beschreibung |
|-------|--------------|
| `app/Services/PhorestApiService.php` | Haupt-Service-Klasse (~1100 Zeilen) |
| `config/phorest.php` | API-Konfiguration & Endpoints |

## 🚀 Verwendung

### Service instanziieren

```php
use App\Services\PhorestApiService;

// Via Dependency Injection (empfohlen)
public function __construct(private PhorestApiService $phorestApi) {}

// Oder manuell
$phorestApi = app(PhorestApiService::class);
```

### Verbindung testen

```php
$result = $phorestApi->testConnection();

if ($result['success']) {
    echo "Verbindung erfolgreich!";
} else {
    echo "Fehler: " . $result['message'];
}
```

---

## 📅 Termine (Appointments)

### Termine abrufen (einzelne Branch)

```php
// Basis-Abfrage
$response = $phorestApi->getAppointments($branchId, [
    'from_date' => '2026-02-01',
    'to_date' => '2026-02-28',
    'size' => 100,
    'page' => 0
]);

$appointments = $response->json('_embedded.appointments', []);
```

### Alle Termine mit Pagination

```php
// Holt automatisch ALLE Seiten
$allAppointments = $phorestApi->getAllAppointmentsPaginated($branchId, [
    'from_date' => '2026-02-01',
    'to_date' => '2026-02-28'
]);
```

### ⚡ Parallele Abfrage für mehrere Branches

```php
// 12x schneller als sequentielle Abfragen!
$branchIds = ['branch1', 'branch2', 'branch3', 'branch4', 'branch5'];

$results = $phorestApi->getAppointmentsParallel(
    $branchIds,
    '2026-02-01',  // fromDate
    '2026-02-28'   // toDate
);

// Ergebnis: ['branch1' => [...appointments], 'branch2' => [...], ...]
foreach ($results as $branchId => $appointments) {
    echo "Branch {$branchId}: " . count($appointments) . " Termine\n";
}
```

### Alle Branches auf einmal

```php
// Holt automatisch alle Branches und deren Termine
$result = $phorestApi->getAllBranchesAppointments([
    'from_date' => '2026-02-01',
    'to_date' => '2026-02-28'
]);

// Inkludiert automatische Deduplizierung!
$appointments = $result['data'];
$branchCount = $result['branches_count'];
$appointmentCount = $result['appointments_count'];
$errors = $result['errors'];
```

### Einzelnen Termin abrufen

```php
$response = $phorestApi->getAppointment($branchId, $appointmentId);
$appointment = $response->json();
```

### Termin aktualisieren

```php
$response = $phorestApi->updateAppointment($branchId, $appointmentId, [
    'notes' => 'Aktualisierte Notiz'
]);
```

### Termin einchecken

```php
$response = $phorestApi->checkinAppointment($branchId, $appointmentId);
```

---

## 👥 Kunden (Clients)

### Kunden suchen

```php
// Mit Wildcard-Suche (Name beginnt mit...)
$response = $phorestApi->getClients([
    'first_name' => 'Max~',  // ~ = Wildcard
    'size' => 50
]);

$clients = $response->json('_embedded.clients', []);
```

### Einzelnen Kunden abrufen

```php
$response = $phorestApi->getClient($clientId);
$client = $response->json();
```

### ⚡ Mehrere Kunden parallel abrufen

```php
$clientIds = ['client1', 'client2', 'client3', ...];

$clients = $phorestApi->getClientsParallel($clientIds);

// Ergebnis: ['client1' => ['fullName' => 'Max Muster', ...], ...]
foreach ($clients as $clientId => $data) {
    echo "{$data['fullName']} ({$data['email']})\n";
}
```

### Kunden erstellen

```php
$response = $phorestApi->createClient([
    'firstName' => 'Max',
    'lastName' => 'Mustermann',
    'email' => 'max@example.com',
    'mobile' => '+49123456789'
]);
```

### Kunden aktualisieren

```php
$response = $phorestApi->updateClient($clientId, [
    'email' => 'neue-email@example.com'
]);
```

### Behandlungshistorie

```php
// Holt automatisch alle Seiten
$histories = $phorestApi->getClientServiceHistory($clientId);

foreach ($histories as $history) {
    echo $history['serviceName'] . ' - ' . $history['date'] . "\n";
}
```

---

## 🏢 Institute (Branches)

### Alle Branches abrufen

```php
$response = $phorestApi->getBranches();
$branches = $response->json('_embedded.branches', []);
```

### Einzelne Branch

```php
$branch = $phorestApi->getBranch($branchId);
// Returns: ['branchId' => '...', 'name' => '...', ...]
```

### Gecachte Branches (für Dropdowns)

```php
// Cached für 1 Stunde
$branches = $phorestApi->getCachedBranches();
```

---

## 👨‍💼 Mitarbeiter (Staff)

### Staff einer Branch

```php
$response = $phorestApi->getStaff($branchId);
$staff = $response->json('_embedded.staff', []);
```

### Einzelner Mitarbeiter

```php
$response = $phorestApi->getStaffMember($branchId, $staffId);
$member = $response->json();
```

---

## 💆 Services (Behandlungen)

### Services einer Branch

```php
// Inkludiert auch archivierte Services (wichtig für historische Daten)
$response = $phorestApi->getServices($branchId);
$services = $response->json('_embedded.services', []);
```

---

## 📆 Verfügbarkeit & Buchungen

### Verfügbarkeit prüfen

```php
$response = $phorestApi->checkAvailability($branchId, [
    'clientServiceSelections' => [
        ['serviceSelections' => [['serviceId' => $serviceId]]]
    ],
    'startTime' => '2026-02-01T00:00:00',
    'endTime' => '2026-02-02T00:00:00',
    'isOnlineAvailability' => true
]);
```

### ⚡ Parallele Verfügbarkeits-Prüfung

```php
$results = $phorestApi->getAvailabilityParallel(
    $branchIds,
    $serviceId,
    '2026-02-01',
    '2026-02-28',
    true  // isOnlineAvailability
);

// Ergebnis: ['branch1' => [...slots], 'branch2' => [...], ...]
```

### Buchung erstellen

```php
$response = $phorestApi->createBooking($branchId, [
    'clientId' => $clientId,
    'staffId' => $staffId,
    'serviceId' => $serviceId,
    'startTime' => '2026-02-15T10:00:00'
]);
```

---

## 🎟️ Gutscheine (Vouchers)

### Gutscheine abrufen

```php
$response = $phorestApi->getVouchers([
    'serial_number' => 'ABC123'  // Optional: nach Seriennummer suchen
]);
```

### Gutschein erstellen

```php
$response = $phorestApi->createVoucher([
    'type' => 'MONETARY',
    'value' => 50.00,
    'expiryDate' => '2027-12-31'
]);
```

---

## � Käufe (Purchases)

Mit `createPurchase()` können Käufe in Phorest angelegt werden – z.B. für Behandlungen, Produkte, Abos (Kurse) oder Gutscheine.

### Zahlungsarten (Payment Types)

Zahlungsarten werden auf **Business-Ebene** (nicht Branch!) abgerufen:

```php
$response = $phorestApi->getPaymentTypes();
$paymentTypes = $response->json('paymentTypes', []);

// Ergebnis: [{"paymentTypeId": "abc123", "name": "Barzahlung", "type": "CASH"}, ...]
```

**Route:** `GET /phorest/payment-types`
**API-Endpoint:** `GET /business/{businessId}/paymenttype`

#### glatttHub Payment Type

In Phorest wurde ein eigener Zahlungstyp für glatttHub angelegt:

| Eigenschaft | Wert |
|-------------|------|
| **Name** | glatttHub |
| **Code** | Hub |
| **Typ** | Sonstiges (OTHER) |
| **Bankfähig** | Ja |
| **ID** | `urLYs9iAs3RUBrYaDZY9ew` |

### Kauf erstellen

> **WICHTIG:** Das `type`-Feld in `payments` ist **zwingend erforderlich**! `paymentTypeId` allein wird von der API **stillschweigend ignoriert**. Es muss immer `type` gesetzt werden.

```php
$response = $phorestApi->createPurchase($branchId, [
    'clientId' => $clientId,
    'payments' => [
        [
            'type'                => 'OTHER',                    // PFLICHTFELD: CASH|CREDIT|DEBIT|OTHER
            'amount'              => 99.00,                      // Muss Gesamtbetrag decken
            'customPaymentTypeId' => 'urLYs9iAs3RUBrYaDZY9ew',  // glatttHub Payment Type
        ]
    ],
    'items' => [
        [
            'courseId' => $courseId,   // Phorest Course ID (für Abo-Käufe)
            'price'    => 99.00,      // Brutto (inkl. MwSt.)
            'staffId'  => $staffId,   // Optional
        ]
    ],
]);
```

**Route:** `POST /phorest/branch/{branchId}/purchase`

### Payment `type`-Werte

| Typ | Beschreibung |
|-----|-------------|
| `CASH` | Barzahlung |
| `CREDIT` | Kreditkarte |
| `DEBIT` | EC-Karte / Lastschrift |
| `OTHER` | Sonstige (z.B. glatttHub) – benötigt `customPaymentTypeId` |

### Wichtige Regeln

- **`type` ist Pflicht:** Ohne `type` im Payment-Objekt wird die Zahlung **stillschweigend ignoriert** – der Kauf wird trotzdem mit 201 erstellt, aber ohne korrekte Zahlungszuordnung.
- **`customPaymentTypeId`:** Wird nur bei `type: 'OTHER'` benötigt.
- **Zahlungsbetrag:** Muss den Gesamtpreis exakt decken oder übersteigen (Überzahlung = Wechselgeld). Unterzahlung wird abgelehnt.
- **Kaufnummer (`number`):** Optional, wird automatisch generiert wenn nicht angegeben.
- **Steuerberechnung:** Phorest nutzt eigene Steuersätze, nicht die im Request übergebenen. Rundung: HALF UP auf Cent.
- **Kreditkonto:** Käufe allein beeinflussen **NICHT** das Kundenkonto/Guthaben. Dafür ist ein separater Credit Account Transaction nötig (siehe unten).

### Verwendung via Facade

```php
use App\Facades\Phorest;

// Zahlungsarten laden (Business-Ebene)
$paymentTypes = Phorest::getPaymentTypes()->json('paymentTypes', []);

// Kauf erstellen
$response = Phorest::createPurchase($branchId, [
    'clientId' => $clientId,
    'payments' => [
        [
            'type'                => 'OTHER',
            'amount'              => 99.00,
            'customPaymentTypeId' => 'urLYs9iAs3RUBrYaDZY9ew',
        ]
    ],
    'items' => [
        ['courseId' => $courseId, 'price' => 99.00, 'staffId' => $staffId]
    ],
]);
```

---

## Kundenkonto (Credit Account Transactions)

Käufe allein beeinflussen **nicht** das Kundenkonto (Guthaben). Um das Guthaben eines Kunden aufzuladen, muss ein separater API-Call an den `creditaccounttransaction`-Endpoint gemacht werden.

### Credit Account Transaction erstellen

```php
$response = $phorestApi->createCreditAccountTransaction([
    'clientId'          => $clientId,
    'branchId'          => $branchId,
    'description'       => 'glatttHub Vertragskauf - Abo XY',
    'transactionAmount' => 200.99,    // Positiv = Guthaben aufladen
    'staffId'           => $staffId,  // Optional
]);
```

**Route:** `POST /phorest/credit-account-transaction`
**API-Endpoint:** `POST /business/{businessId}/creditaccounttransaction`

### Wichtige Regeln

- **Positiver Betrag** = Guthaben aufladen (Kunde hat Geld gut)
- **Negativer Betrag** = Guthaben abbuchen
- **`staffId`** ist optional, aber empfohlen für Nachvollziehbarkeit
- **`description`** sollte den Grund der Buchung beschreiben

### Verwendung via Facade

```php
use App\Facades\Phorest;

$response = Phorest::createCreditAccountTransaction([
    'clientId'          => $clientId,
    'branchId'          => $branchId,
    'description'       => 'glatttHub Vertragskauf',
    'transactionAmount' => 150.00,
]);

if ($response->successful()) {
    $transaction = $response->json();
    // Kundenkonto erfolgreich aufgeladen
}
```

---

## Automatischer Vertragskauf (PhorestContractPurchaseService)

Der `PhorestContractPurchaseService` erstellt automatisiert Käufe aus glatttHub-Verträgen. Der Prozess besteht aus **zwei Schritten**:

### 2-Schritt-Ablauf

1. **Purchase erstellen** – Kauf in Phorest anlegen mit glatttHub Payment Type
2. **Credit Account Transaction** – Guthaben auf Kundenkonto buchen

```php
use App\Services\PhorestContractPurchaseService;

$service = app(PhorestContractPurchaseService::class);

$result = $service->createFromContract(
    branchId:  $branchId,
    clientId:  $clientId,
    courseId:   $courseId,
    sessions:  10,
    pricePerSession: 89.00,
    staffId:   $staffId,  // Optional
);

// Ergebnis:
// [
//     'success'     => true,
//     'purchase'    => [...],         // Phorest Purchase Response
//     'creditTx'    => [...],         // Credit Account Transaction Response
//     'totalAmount' => 890.00,
// ]
```

### Fehlerbehandlung

Der Service behandelt **Teilfehler**: Wenn der Purchase erfolgreich ist, aber die Credit Account Transaction fehlschlägt, wird ein Partial-Success zurückgegeben:

```php
if ($result['success'] === false && isset($result['purchase'])) {
    // Purchase OK, aber Credit Account Transaction fehlgeschlagen
    // $result['creditError'] enthält die Fehlermeldung
    Log::warning('Partial success: Purchase created but credit account failed', $result);
}
```

---

## �🔄 Deduplizierung

Die API liefert bei Buchungen mit mehreren Services mehrere Appointment-Einträge mit derselben `bookingId`. Die `deduplicateAppointments()` Methode:

1. **Gruppiert nach bookingId** - Fasst zusammengehörige Termine zusammen
2. **Erkennt konsekutive Termine** - Termine direkt nacheinander (endTime = nächster startTime) für denselben Kunden
3. **Merged Service-Namen** - Kombiniert alle Services zu einem String

```php
$rawAppointments = [...]; // 150 Einträge
$unique = $phorestApi->deduplicateAppointments($rawAppointments);
// Ergebnis: 100 Einträge (50 Duplikate entfernt)

// Jeder Eintrag enthält:
// - allServices: ['Service 1', 'Service 2']
// - allServiceIds: ['id1', 'id2']
// - serviceName: 'Service 1, Service 2'
// - appointmentCount: 2
```

---

## 📊 Endpoints Referenz

Alle konfigurierten Endpoints in `config/phorest.php`:

| Kategorie | Endpoint | Methode |
|-----------|----------|---------|
| **Appointments** | `/business/{businessId}/branch/{branchId}/appointment` | GET |
| | `/business/{businessId}/branch/{branchId}/appointment/{appointmentId}` | GET/PUT |
| | `/business/{businessId}/branch/{branchId}/appointment/{appointmentId}/checkin` | POST |
| **Booking** | `/business/{businessId}/branch/{branchId}/booking` | POST |
| | `/business/{businessId}/branch/{branchId}/booking/{bookingId}/cancel` | POST |
| **Availability** | `/business/{businessId}/branch/{branchId}/appointments/availability` | POST |
| **Clients** | `/business/{businessId}/client` | GET/POST |
| | `/business/{businessId}/client/{clientId}` | GET/PUT |
| | `/business/{businessId}/client/{clientId}/service-history` | GET |
| **Client Courses** | `/business/{businessId}/clientcourse` | GET |
| | `/business/{businessId}/clientcourse/{clientCourseId}` | GET |
| **Branches** | `/business/{businessId}/branch` | GET |
| **Staff** | `/business/{businessId}/branch/{branchId}/staff` | GET |
| | `/business/{businessId}/branch/{branchId}/staff/{staffId}` | GET |
| **Services** | `/business/{businessId}/branch/{branchId}/service` | GET |
| **Products** | `/business/{businessId}/branch/{branchId}/product` | GET |
| **Vouchers** | `/business/{businessId}/voucher` | GET/POST |
| **Purchase** | `/business/{businessId}/branch/{branchId}/purchase` | POST |
| **Payment Types** | `/business/{businessId}/paymenttype` | GET |
| **Credit Account** | `/business/{businessId}/creditaccounttransaction` | POST |

---

## ⚡ Performance-Tipps

### 1. Parallele Requests nutzen

```php
// ❌ Langsam: Sequentiell (12+ Sekunden für 5 Branches)
foreach ($branchIds as $branchId) {
    $appointments[$branchId] = $phorestApi->getAllAppointmentsPaginated($branchId, $params);
}

// ✅ Schnell: Parallel (<1 Sekunde für 5 Branches)
$appointments = $phorestApi->getAppointmentsParallel($branchIds, $fromDate, $toDate);
```

### 2. Gecachte Daten verwenden

```php
// Branches ändern sich selten - nutze Cache
$branches = $phorestApi->getCachedBranches();
```

### 3. Pagination mit größeren Seiten

```php
// Standard: 50 pro Seite
// Empfohlen: 100 pro Seite (weniger API-Calls)
$params['size'] = 100;
```

### 4. Archivierte Services inkludieren

```php
// Wichtig für historische Daten!
// getServices() macht das automatisch (includeArchived=true)
```

---

## 🐛 Debugging

### Logging

Alle API-Requests werden geloggt:

```php
// In storage/logs/laravel.log
Log::debug("Phorest API Request: GET /business/.../appointment", [
    'params' => [...],
    'data' => [...]
]);

// Bei Fehlern
Log::error("Phorest API Error: GET /business/.../appointment", [
    'status' => 401,
    'body' => 'Unauthorized'
]);
```

### API-Verbindung testen

```bash
php artisan tinker
>>> app(App\Services\PhorestApiService::class)->testConnection()
```

### Häufige Fehler

| Fehler | Ursache | Lösung |
|--------|---------|--------|
| `401 Unauthorized` | Falsche Credentials | .env Variablen prüfen |
| `404 Not Found` | Ungültige Branch/Client ID | IDs validieren |
| `500 Server Error` | Phorest API Problem | Später erneut versuchen |
| `Timeout` | Zu viele Daten | Kleineren Zeitraum wählen |

---

## 🔗 Weiterführende Links

- [Phorest API Dokumentation](https://api-docs.phorest.com/)
- [config/phorest.php](../config/phorest.php) - Endpoint-Konfiguration
- [PhorestApiService.php](../app/Services/PhorestApiService.php) - Service-Implementierung
