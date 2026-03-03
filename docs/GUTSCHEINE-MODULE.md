# Gutscheine-Modul (Vouchers)

## Übersicht

Das Gutscheine-Modul ermöglicht die Verwaltung von Phorest-Gutscheinen im HUB. Es bietet eine Übersicht aller Gutscheine, die Möglichkeit zur Anpassung des Restbetrags und zur Erstellung neuer Gutscheine.

### Features

- **Übersicht**: Alle Gutscheine mit Suchfunktion und Filterung
- **KPI-Kacheln**: Aktive Gutscheine, aufgebrauchte Gutscheine, Gesamt-/Restwert
- **Inline-Bearbeitung**: Restbetrag direkt in der Tabelle anpassen
- **Neuer Gutschein**: Modal zum Erstellen von Gutscheinen mit Kunden-Zuweisung
- **Seriennummern**: Automatische Generierung von 8-stelligen eindeutigen Nummern

---

## Benutzerhandbuch

### Gutscheine-Seite aufrufen

Navigation: **Verwaltung → Gutscheine**

URL: `/hub/vouchers`

### Übersicht verstehen

Die Seite zeigt zunächst **KPI-Kacheln** mit folgenden Werten:
- **Aktive Gutscheine**: Anzahl der Gutscheine mit Restguthaben > 0
- **Aufgebraucht**: Anzahl der vollständig eingelösten Gutscheine
- **Gesamtwert (Original)**: Summe aller ursprünglichen Gutscheinwerte
- **Restwert (Aktiv)**: Summe der verbleibenden Guthaben

### Gutscheine suchen

Das Suchfeld durchsucht:
- **Seriennummer**: 8-stellige Gutschein-Nummer
- **Kundenname**: Vor- und Nachname
- **Kundennummer**: Phorest External ID

### Gutscheine filtern

Über die Statusfilter-Buttons kann gefiltert werden:
- **Alle**: Alle Gutscheine
- **Aktiv**: Nur Gutscheine mit Restguthaben > 0
- **Aufgebraucht**: Nur vollständig eingelöste Gutscheine

### Restbetrag anpassen

1. In der Zeile des gewünschten Gutscheins auf den **Restbetrag** klicken
2. Der Betrag wird zu einem Eingabefeld
3. Neuen Wert eingeben (z.B. `50,00` oder `50.00`)
4. Mit der **Eingabetaste** bestätigen oder **Speichern-Button** klicken
5. Mit **Escape** abbrechen

> **Hinweis**: Der Restbetrag kann maximal so hoch sein wie der Originalwert.

### Neuen Gutschein erstellen

1. Auf den Button **„Neuer Gutschein"** oben rechts klicken
2. Im Modal folgende Daten eingeben:

| Feld | Beschreibung | Pflicht |
|------|--------------|---------|
| **Filiale** | Ausstellende Branch | ✓ |
| **Wert (EUR)** | Gutscheinbetrag | ✓ |
| **Seriennummer** | 8-stellige Nummer (wird automatisch generiert) | ✓ |
| **Kunde** | Optional - Kundensuche mit Name/E-Mail/Kundennummer | ✗ |
| **Gültig bis** | Ablaufdatum (Standard: 5 Jahre ab heute) | ✗ |
| **Notizen** | Freies Textfeld | ✗ |

3. Seriennummer kann mit dem **Würfel-Button** neu generiert werden
4. Mit **„Gutschein erstellen"** speichern

---

## Entwickler-Dokumentation

### Architektur

```
┌─────────────────┐     ┌──────────────────────┐     ┌────────────────┐
│  vouchers.blade │────▶│  PhorestController   │────▶│  Phorest API   │
│  (Alpine.js)    │     │  (Laravel)           │     │  (REST)        │
└─────────────────┘     └──────────────────────┘     └────────────────┘
         │
         ▼
┌─────────────────┐
│  vouchers.js    │
│  (Alpine Comp.) │
└─────────────────┘
```

### Dateien

| Datei | Beschreibung |
|-------|--------------|
| `resources/views/hub/vouchers.blade.php` | Blade-Template mit Alpine.js |
| `public/js/vouchers.js` | Alpine.js Komponente |
| `app/Http/Controllers/PhorestController.php` | API-Proxy für Phorest |
| `routes/web.php` | Route-Definitionen |

---

## API Endpoints

Alle Endpoints befinden sich unter dem Prefix `/phorest` und erfordern Authentifizierung.

### GET /phorest/vouchers

Paginierte Liste von Gutscheinen.

**Parameter:**

| Parameter | Typ | Beschreibung | Default |
|-----------|-----|--------------|---------|
| `includeUsed` | boolean | Aufgebrauchte Gutscheine einschließen | true |
| `page` | int | Seite (0-basiert) | 0 |
| `size` | int | Seitengröße (max. 100) | 100 |
| `clientId` | string | Filter nach Kunden-ID | - |
| `serialNumber` | string | Filter nach Seriennummer | - |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "voucherId": "V123456",
      "serialNumber": "12345678",
      "originalBalance": 100.00,
      "remainingBalance": 75.50,
      "clientId": "C789",
      "creatingBranchId": "B001",
      "issueDate": "2024-01-15T10:00:00Z",
      "expiryDate": "2029-01-15T10:00:00Z",
      "notes": "Geburtstagsgeschenk"
    }
  ],
  "pagination": {
    "size": 100,
    "totalElements": 1523,
    "totalPages": 16,
    "number": 0
  }
}
```

### GET /phorest/vouchers/all

Lädt alle Gutscheine (automatische Pagination durch alle Seiten).

**Parameter:** Wie bei `/vouchers` (außer `page` und `size`)

**Response:**

```json
{
  "success": true,
  "data": [...],
  "total": 1523
}
```

### GET /phorest/voucher/{voucherId}

Einzelner Gutschein nach ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "voucherId": "V123456",
    "serialNumber": "12345678",
    "originalBalance": 100.00,
    "remainingBalance": 75.50,
    ...
  }
}
```

### PUT /phorest/voucher/{voucherId}

Gutschein aktualisieren.

**Body:**

```json
{
  "originalBalance": 100.00,
  "remainingBalance": 50.00,
  "expiryDate": "2030-01-15",
  "notes": "Neuer Wert",
  "clientId": "C789"
}
```

Alle Felder sind optional - nur die übergebenen werden aktualisiert.

**Response:**

```json
{
  "success": true,
  "message": "Gutschein erfolgreich aktualisiert",
  "data": { ... }
}
```

### POST /phorest/voucher

Neuen Gutschein erstellen.

**Body:**

```json
{
  "creatingBranchId": "B001",
  "originalBalance": 100.00,
  "serialNumber": "12345678",
  "expiryDate": "2029-01-15",
  "notes": "Geburtstagsgeschenk",
  "clientId": "C789"
}
```

**Pflichtfelder:**

| Feld | Typ | Validierung |
|------|-----|-------------|
| `creatingBranchId` | string | Pflicht |
| `originalBalance` | numeric | Pflicht, min. 0.01 |
| `serialNumber` | string | Pflicht, exakt 8 Ziffern |

**Optionale Felder:**

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `expiryDate` | date | Ablaufdatum |
| `notes` | string | max. 1000 Zeichen |
| `clientId` | string | Phorest Client ID |
| `issueDate` | date | Ausstellungsdatum (default: heute) |
| `remainingBalance` | numeric | default: = originalBalance |

**Response:**

```json
{
  "success": true,
  "message": "Gutschein erfolgreich erstellt",
  "data": { ... }
}
```

---

## Alpine.js Komponente

Die `vouchersPage()` Funktion in `public/js/vouchers.js` enthält folgende Hauptbestandteile:

### State

```javascript
{
  // Laden & Fehler
  loading: true,
  loadingMore: false,
  error: null,
  
  // Daten
  vouchers: [],
  clientsCache: {},  // Kunden-Cache für Namen
  
  // Filter
  searchQuery: '',
  statusFilter: 'all',  // 'all' | 'active' | 'used'
  
  // Sortierung
  sortColumn: 'createdAt',
  sortDirection: 'desc',
  
  // Pagination
  currentPage: 0,
  pageSize: 25,
  
  // KPIs (final nach vollständigem Laden)
  finalStats: {
    activeCount: 0,
    usedCount: 0,
    totalOriginalValue: 0,
    totalRemainingValue: 0
  },
  
  // Modal: Gutschein-Details
  showVoucherModal: false,
  selectedVoucher: null,
  
  // Inline Balance Edit
  isEditingBalance: false,
  editBalanceValue: 0,
  savingBalance: false,
  
  // Modal: Neuer Gutschein
  showCreateModal: false,
  savingVoucher: false,
  createForm: {
    creatingBranchId: '',
    originalBalance: '',
    serialNumber: '',
    expiryDate: '',
    notes: '',
    clientId: ''
  },
  
  // Kundensuche im Create-Modal
  clientSearchQuery: '',
  clientSearchResults: [],
  selectedClientName: ''
}
```

### Wichtige Methoden

| Methode | Beschreibung |
|---------|--------------|
| `init()` | Initialisierung, lädt alle Gutscheine progressiv |
| `loadVouchersProgressively()` | Lädt erste Seite sofort, Rest im Hintergrund |
| `loadVoucherPage(page)` | Lädt eine einzelne API-Seite |
| `loadRemainingPagesInBackground()` | Paralleles Laden weiterer Seiten (Batches à 5) |
| `loadClientNamesForIds(ids)` | Lädt Kundennamen via Batch-API |
| `getClientName(voucher)` | Gibt Kundennamen aus Cache zurück |
| `openVoucherModal(voucher)` | Öffnet Detail-Modal |
| `startEditBalance(voucher)` | Startet Inline-Bearbeitung |
| `saveBalance(voucher)` | Speichert neuen Restbetrag |
| `openCreateModal()` | Öffnet Create-Modal, lädt Branches |
| `generateSerialNumber()` | Generiert eindeutige 8-stellige Nummer |
| `searchClients()` | API-Suche nach Kunden |
| `selectClient(client)` | Wählt Kunden für neuen Gutschein |
| `saveVoucher()` | Erstellt neuen Gutschein via API |

### Progressive Loading

Die Daten werden **progressiv** geladen für bessere UX:

1. **Erste Seite** (100 Gutscheine) wird sofort geladen und angezeigt
2. **Restliche Seiten** werden im Hintergrund parallel geladen (5er Batches)
3. **KPI-Werte** werden erst angezeigt, wenn alle Daten vollständig geladen sind (`valuesReady = true`)
4. **Kundennamen** werden separat nachgeladen via `/phorest/clients/batch`

### Seriennummern-Generierung

```javascript
generateSerialNumber() {
    // Sammelt alle existierenden Seriennummern
    const existingNumbers = new Set(
        this.vouchers
            .map(v => v.serialNumber)
            .filter(s => s && /^\d{8}$/.test(s))
    );
    
    // Generiert solange, bis eine eindeutige gefunden wird
    let attempts = 0;
    while (attempts < 100) {
        const newNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
        if (!existingNumbers.has(newNumber)) {
            this.createForm.serialNumber = newNumber;
            return;
        }
        attempts++;
    }
}
```

### Kundensuche

Die Suche erkennt automatisch den Suchtyp:

```javascript
async searchClients() {
    const params = new URLSearchParams({ size: '20' });
    const query = this.clientSearchQuery.trim();
    
    if (query.includes('@')) {
        params.set('email', query);
    } else if (/^\d+[a-z]*$/i.test(query) || /(^[a-z]+\d+)/i.test(query)) {
        params.set('externalId', query);
    } else {
        const parts = query.split(/\s+/);
        if (parts.length >= 2) {
            params.set('firstName', parts[0]);
            params.set('lastName', parts.slice(1).join(' '));
        } else {
            params.set('lastName', query);
        }
    }
    
    const response = await fetch(`/phorest/clients?${params.toString()}`);
    // ...
}
```

---

## UI-Komponenten

### Floating Labels

Das Modul verwendet das GLATTT Design System für Floating Labels:

```html
<div class="input-glattt-floating-wrapper">
    <input type="text" 
           class="input-glattt-floating"
           placeholder=" "
           x-model="createForm.originalBalance">
    <label class="input-glattt-floating-label">Wert (EUR)</label>
</div>
```

### Modals mit Teleport

Das Create-Modal verwendet Alpine's `x-teleport` für korrektes Z-Index-Verhalten:

```html
<template x-teleport="body">
    <div x-show="showCreateModal" 
         class="modal-glattt-backdrop"
         x-transition:enter="transition ease-out duration-200"
         x-transition:enter-start="opacity-0"
         x-transition:enter-end="opacity-100"
         x-transition:leave="transition ease-in duration-150"
         x-transition:leave-start="opacity-100"
         x-transition:leave-end="opacity-0">
        <!-- Modal Content -->
    </div>
</template>
```

### KPI-Kacheln

```html
<div class="stats shadow bg-gradient-to-br from-blue-500/10 to-blue-600/10">
    <div class="stat">
        <div class="stat-title text-xs">Aktive Gutscheine</div>
        <div class="stat-value text-blue-600">
            <template x-if="valuesReady">
                <span x-text="finalStats.activeCount"></span>
            </template>
            <template x-if="!valuesReady">
                <span class="loading loading-dots loading-sm"></span>
            </template>
        </div>
    </div>
</div>
```

---

## Styling

Die CSS-Klassen stammen aus dem GLATTT Design System (`theme_glattt.css`):

| Klasse | Verwendung |
|--------|------------|
| `modal-glattt-backdrop` | Modal-Overlay (z-index: 9999) |
| `input-glattt-floating-wrapper` | Container für Floating Labels |
| `input-glattt-floating` | Input mit Floating Label |
| `input-glattt-floating-label` | Das schwebende Label |
| `btn-glattt-primary` | Primärer Button |
| `btn-glattt-secondary` | Sekundärer Button |

---

## Phorest API Details

### Vouchers Endpoint (Phorest)

```
Base URL: https://api-gateway-eu.phorest.com
Endpoint: /third-party-api-server/api/business/{businessId}/voucher
```

### Response-Struktur von Phorest

```json
{
  "_embedded": {
    "vouchers": [
      {
        "voucherId": "string",
        "serialNumber": "string",
        "originalBalance": 100.00,
        "remainingBalance": 75.50,
        "issueDate": "2024-01-15T10:00:00+00:00",
        "expiryDate": "2029-01-15T10:00:00+00:00",
        "clientId": "string",
        "clientFirstName": "Max",
        "clientLastName": "Mustermann",
        "creatingBranchId": "string",
        "notes": "string"
      }
    ]
  },
  "page": {
    "size": 100,
    "totalElements": 1523,
    "totalPages": 16,
    "number": 0
  }
}
```

### POST Create Voucher (Phorest)

```json
POST /third-party-api-server/api/business/{businessId}/voucher

{
  "creatingBranchId": "required",
  "originalBalance": 100.00,
  "remainingBalance": 100.00,
  "serialNumber": "12345678",
  "issueDate": "2024-01-15T10:00:00Z",
  "expiryDate": "2029-01-15T10:00:00Z",
  "clientId": "optional",
  "notes": "optional"
}
```

---

## Fehlerbehandlung

### Duplikat-Seriennummer

Falls eine Seriennummer bereits existiert, gibt Phorest einen 400-Fehler zurück:

```json
{
  "success": false,
  "message": "Fehler beim Erstellen des Gutscheins",
  "error": "A voucher with serial number 12345678 already exists"
}
```

Die Frontend-Anzeige zeigt dies als Fehlermeldung im Modal an.

### Validierungsfehler

Laravel-Validierungsfehler werden als 422-Response zurückgegeben:

```json
{
  "success": false,
  "message": "Validierungsfehler",
  "errors": {
    "serialNumber": ["Die Seriennummer muss genau 8 Ziffern enthalten."]
  }
}
```

---

## Bekannte Einschränkungen

1. **Keine Löschfunktion**: Phorest erlaubt kein Löschen von Gutscheinen
2. **Seriennummer nicht änderbar**: Nach Erstellung kann die Seriennummer nicht geändert werden
3. **Client-Namen werden gecached**: Bei neuen Kunden muss ggf. die Seite neu geladen werden
4. **Währung**: Das System ist auf EUR konfiguriert (DACH-Region)

---

## Changelog

### 2025-01

- Initial: Gutscheine-Übersicht mit Suchfunktion
- Inline-Bearbeitung des Restbetrags
- Neuer Gutschein erstellen mit Modal
- 8-stellige Seriennummern mit Duplikat-Prüfung
- Kundensuche mit API-Integration
- Floating Label Inputs
- EUR als Währung
