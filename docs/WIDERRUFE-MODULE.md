# Widerrufe (Vertragswiderrufe)

> Erfassung, Bearbeitung und Übersicht aller Vertragswiderrufe mit Zendesk- und Phorest-Integration

## Inhaltsverzeichnis

- [Für Nutzer](#für-nutzer)
  - [Übersicht](#übersicht)
  - [Widerrufe-Seite](#widerrufe-seite)
  - [Widerruf erfassen](#widerruf-erfassen)
  - [Widerruf bearbeiten](#widerruf-bearbeiten)
  - [Filter & Suche](#filter--suche)
  - [Tabellenspalten](#tabellenspalten)
  - [Status-System](#status-system)
- [Für Entwickler](#für-entwickler)
  - [Architektur](#architektur)
  - [Datenmodell](#datenmodell)
  - [API-Endpunkte](#api-endpunkte)
  - [Frontend-Komponenten](#frontend-komponenten)
  - [Zendesk-Integration](#zendesk-integration)
  - [Phorest-Integration](#phorest-integration)
  - [Events & Kommunikation](#events--kommunikation)

---

# Für Nutzer

## Übersicht

Das Widerrufs-Modul ermöglicht die vollständige Verwaltung von Vertragswiderrufen:

- **Widerruf erfassen** – direkt aus der Vertragsansicht oder der Widerrufe-Übersicht
- **Zendesk-Verknüpfung** – automatische Ticket-Suche und Datumsübernahme
- **Behandlungshistorie** – automatische Anzeige von Beratungsgespräch, Sitzungen und Terminen aus Phorest
- **Verhandlungen dokumentieren** – Reaktion, Folgeverträge, SEPA- und Phorest-Status
- **Übersichtsseite** – alle Widerrufe auf einen Blick mit Live-Filtern

### Zugang

1. glatttHub öffnen
2. Im Seitenmenü **Widerrufe** (⊘-Icon) auswählen
3. Die Widerrufe-Übersicht wird angezeigt

---

## Widerrufe-Seite

Die Übersichtsseite zeigt alle Vertragswiderrufe in einer sortierbaren Tabelle.

### Status-Badges (Header)

Oben rechts werden die Gesamtzahlen pro Status angezeigt:

| Badge | Farbe | Bedeutung |
|-------|-------|-----------|
| **X Offen** | Orange | Neue Widerrufe ohne Verhandlung |
| **X In Verhandlung** | Teal | Widerrufe in aktiver Bearbeitung |
| **X Abgeschlossen** | Grün | Abgeschlossene Widerrufe |

!!! info "Immer Gesamtzahlen"
    Die Status-Badges zeigen stets die ungefilterten Gesamtzahlen – unabhängig davon, welche Filter gesetzt sind.

---

## Widerruf erfassen

Ein neuer Widerruf wird über die **Vertragsdetailseite** erstellt oder über die Widerrufe-Übersicht bearbeitet.

### Pflichtfelder

| Feld | Beschreibung |
|------|-------------|
| **Widerrufsdatum** | Datum des Widerrufs (wird automatisch aus Zendesk-Ticket übernommen, falls verknüpft) |
| **Grund** | Einer der vordefinierten Gründe (siehe unten) |

### Widerrufsgründe

| Wert | Anzeige |
|------|---------|
| `anpassung_laufzeit` | Anpassung Laufzeit |
| `finanzen` | Finanzen |
| `gesundheit` | Gesundheit |
| `keine_angabe` | Keine Angabe |
| `klaerung_institut` | Klärung im Institut |
| `korrektur` | Korrektur |
| `qualitaet_beratung` | Qualität Beratung |
| `sonstiges` | Sonstiges |
| `upgrade` | Upgrade |

### Zendesk-Ticket

Im Feld **Zendesk Ticket** kann eine Ticket-Nummer eingegeben oder nach Tickets gesucht werden:

- **Ticket-Nummer** (nur Ziffern) → direkter Lookup
- **Suchbegriff** (Text) → durchsucht Zendesk-Tickets
- **Automatische Suche** beim Öffnen basierend auf der Kunden-E-Mail

Wird ein Ticket ausgewählt, wird das **Widerrufsdatum** automatisch auf das Erstellungsdatum des Tickets gesetzt.

### Behandlungsinfo (automatisch)

Folgende Daten werden automatisch aus Phorest geladen:

- **Beratungsgespräch** – Datum, Mitarbeiter, Dienstleistungen
- **1. Sitzung** – Datum und Details
- **Tage zwischen BG und 1. Sitzung**
- **Weitere Sitzungen** – Liste aller Folgesitzungen
- **Geplante Termine** – Zukünftige Termine
- **Achseln im BG behandelt** – Manuelle Angabe (Ja/Nein)

---

## Widerruf bearbeiten

Beim Öffnen eines bestehenden Widerrufs wechselt das Modal in den **Bearbeitungsmodus**:

- Header wird **teal** statt rot
- Titel zeigt **„Widerruf bearbeiten"**
- Zusätzlicher Abschnitt **„Widerrufs-Verhandlungen"** wird sichtbar

### Verhandlungen

| Feld | Optionen |
|------|----------|
| **Status** | Offen · In Verhandlung · Abgeschlossen |
| **Reaktion glattt** | Offen · Akzeptiert · Abgelehnt · Upgrade · Downgrade · Korrektur · Laufzeitanpassung |
| **Folgevertrag-ID** | Wird angezeigt bei Reaktion Upgrade/Downgrade/Korrektur/Laufzeit |
| **Anmerkungen** | Freitextfeld für interne Notizen |
| **Verhandlung abgeschlossen am** | Datum |
| **In SEPA umgesetzt** | Checkbox |
| **In Phorest umgesetzt** | Checkbox |

---

## Filter & Suche

Die Filterleiste bietet Live-Filter ohne zusätzlichen „Filtern"-Button:

| Filter | Typ | Beschreibung |
|--------|-----|-------------|
| **Suche** | Textfeld (Pill-Form) | Durchsucht Kunde, Vertragsnummer, Produkt, Grund, Zendesk-Ticket, Notizen |
| **Status** | Dropdown | Alle Status · Offen · In Verhandlung · Abgeschlossen |
| **Reaktion** | Dropdown | Alle Reaktionen · Offen · Akzeptiert · Abgelehnt · Upgrade · Downgrade · Korrektur · Laufzeitanpassung |
| **Grund** | Dropdown | Alle Gründe + alle 9 Widerrufsgründe |

!!! tip "Live-Filter"
    Dropdown-Änderungen lösen sofort einen Server-Reload aus. Die Textsuche filtert zusätzlich client-seitig in Echtzeit. Der **Zurücksetzen**-Button erscheint nur, wenn mindestens ein Filter aktiv ist.

---

## Tabellenspalten

Alle Spaltenköpfe sind klickbar zum Sortieren (aufsteigend ↑ / absteigend ↓):

| Spalte | Inhalt | Sortierbar |
|--------|--------|------------|
| **Datum** | Widerrufsdatum (Standard: neueste zuerst) | ✅ |
| **Kunde** | Kundenname aus Phorest | ✅ |
| **Vertrag** | Vertragsnummer + Produktname | ✅ |
| **Grund** | Widerrufsgrund (Klartext) | ✅ |
| **Status** | Farbiges Badge (Offen/In Verhandlung/Abgeschlossen) | ✅ |
| **Reaktion** | Farbiges Badge (Offen/Akzeptiert/Abgelehnt/…) | ✅ |
| **SEPA** | ✓ oder ✗ – ob SEPA-Mandat storniert | ❌ |
| **Phorest** | ✓ oder ✗ – ob in Phorest aktualisiert | ❌ |
| **Aktion** | Bearbeiten-Button (öffnet Widerrufs-Modal) | ❌ |

Klick auf eine **Tabellenzeile** öffnet ebenfalls das Widerrufs-Modal.

---

## Status-System

### Widerrufs-Status

| Status | Badge-Farbe | Bedeutung |
|--------|------------|-----------|
| `offen` | 🟡 Warning (Orange) | Neu erfasst, noch nicht bearbeitet |
| `in_verhandlung` | 🔵 Primary (Teal) | Aktiv in Verhandlung |
| `abgeschlossen` | 🟢 Success (Grün) | Verhandlung abgeschlossen |

### Reaktionen

| Reaktion | Badge-Farbe | Bedeutung |
|----------|------------|-----------|
| `offen` | Grau | Noch keine Reaktion |
| `widerruf_akzeptiert` | Grün | Widerruf wurde akzeptiert |
| `widerruf_abgelehnt` | Rot | Widerruf wurde abgelehnt |
| `upgrade` | Teal | Kunde hat auf ein höheres Paket gewechselt |
| `downgrade` | Orange | Kunde hat auf ein niedrigeres Paket gewechselt |
| `korrektur` | Grau | Vertrag wurde korrigiert |
| `laufzeit` | Grau | Laufzeit wurde angepasst |

---

# Für Entwickler

## Architektur

```
┌─────────────────────────────────────────────────────────┐
│                  Widerrufe-Übersicht                     │
│           hub/cancellations/index.blade.php              │
│      (Alpine.js: Filter, Sortierung, Pagination)        │
├──────────────┬──────────────────────────────────────────┤
│              │  Widerrufs-Modal (Shared Partial)       │
│              │  contracts/partials/cancellation-modal   │
│              │  (Create + Edit Mode)                    │
│              ├──────────────────────────────────────────┤
│              │  • Zendesk API (Ticket-Lookup)          │
│              │  • Phorest API (Behandlungshistorie)    │
│              │  • ContractController (CRUD)            │
└──────────────┴──────────────────────────────────────────┘
```

### Dateien

| Datei | Zweck |
|-------|-------|
| `resources/views/hub/cancellations/index.blade.php` | Übersichtsseite mit Tabelle, Filtern, Pagination |
| `resources/views/hub/contracts/partials/cancellation-modal.blade.php` | Wiederverwendbares Modal (Create + Edit) |
| `app/Http/Controllers/ContractController.php` | Backend: CRUD + Daten-API |
| `app/Models/ContractCancellation.php` | Eloquent-Model |
| `routes/web.php` | Route-Definitionen |
| `resources/views/layouts/partials/sidebar.blade.php` | Sidebar-Eintrag „Widerrufe" |

---

## Datenmodell

### `contract_cancellations`

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `id` | bigint | Primary Key |
| `contract_id` | bigint (FK) | Zugehöriger Vertrag |
| `cancellation_date` | date | Widerrufsdatum |
| `reason` | string | Grund-Code (z.B. `finanzen`, `gesundheit`) |
| `reason_description` | text (nullable) | Optionale Detailbeschreibung |
| `reaction` | string | Reaktion-Code (z.B. `offen`, `upgrade`) |
| `notes` | text (nullable) | Interne Anmerkungen |
| `follow_up_contract_id` | bigint (nullable, FK) | Folgevertrag bei Upgrade/Downgrade |
| `zendesk_ticket_number` | string (nullable) | Verknüpftes Zendesk-Ticket |
| `negotiation_completed_at` | date (nullable) | Verhandlung abgeschlossen am |
| `consultation_staff_id` | string (nullable) | Phorest-Staff-ID des Beraters |
| `consultation_staff_name` | string (nullable) | Name des Beraters |
| `consultation_date` | date (nullable) | Datum Beratungsgespräch |
| `first_treatment_date` | date (nullable) | Datum 1. Sitzung |
| `first_session_completed` | boolean (nullable) | 1. Sitzung durchgeführt |
| `days_between_session_and_consultation` | integer (nullable) | Tage BG → 1. Sitzung |
| `armpits_treated_in_consultation` | boolean (nullable) | Achseln im BG behandelt |
| `sepa_cancelled` | boolean | SEPA-Mandat storniert |
| `phorest_updated` | boolean | In Phorest aktualisiert |
| `status` | string | Widerrufs-Status (`offen`, `in_verhandlung`, `abgeschlossen`) |
| `created_by` | bigint (nullable, FK) | Erstellt von (User-ID) |
| `created_at` | timestamp | Erstellt am |
| `updated_at` | timestamp | Aktualisiert am |

### Beziehungen

```php
ContractCancellation::belongsTo(Contract::class);
ContractCancellation::belongsTo(User::class, 'created_by');
ContractCancellation::belongsTo(Contract::class, 'follow_up_contract_id');
```

---

## API-Endpunkte

Alle Routen liegen unter dem Prefix `/hub` und sind authentifiziert.

### Übersichtsseite

| Method | Route | Controller | Name | Beschreibung |
|--------|-------|-----------|------|-------------|
| `GET` | `/hub/cancellations` | `cancellationsIndex()` | `hub.cancellations` | Rendert die Übersichtsseite |
| `GET` | `/hub/cancellations/data` | `getCancellations()` | `hub.cancellations.data` | JSON-API: Paginierte Widerrufe |

### CRUD pro Vertrag

| Method | Route | Controller | Name | Beschreibung |
|--------|-------|-----------|------|-------------|
| `POST` | `/hub/contracts/{contract}/cancellation` | `storeCancellation()` | `hub.contracts.cancellation.store` | Neuen Widerruf erstellen |
| `GET` | `/hub/contracts/{contract}/cancellation` | `getCancellation()` | `hub.contracts.cancellation.show` | Bestehenden Widerruf laden |
| `PUT` | `/hub/contracts/{contract}/cancellation` | `updateCancellation()` | `hub.contracts.cancellation.update` | Widerruf aktualisieren |
| `GET` | `/hub/contracts/{contract}/cancellation-data` | `getCancellationData()` | `hub.contracts.cancellation.data` | Behandlungshistorie aus Phorest |

### `GET /hub/cancellations/data` – Query-Parameter

| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|-------------|
| `page` | int | 1 | Seitennummer |
| `per_page` | int | 50 | Einträge pro Seite (max 200) |
| `status` | string | – | Filter: `offen`, `in_verhandlung`, `abgeschlossen` |
| `reaction` | string | – | Filter: `offen`, `widerruf_akzeptiert`, etc. |
| `reason` | string | – | Filter: `finanzen`, `gesundheit`, etc. |
| `date_from` | date | – | Filter: Widerrufsdatum ab |
| `date_to` | date | – | Filter: Widerrufsdatum bis |

### Response-Format (`getCancellations`)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "cancellation_date": "2026-02-18",
      "cancellation_date_formatted": "18.02.2026",
      "reason": "sonstiges",
      "reason_label": "Sonstiges",
      "reaction": "offen",
      "reaction_label": "Offen",
      "status": "offen",
      "status_label": "Offen",
      "notes": null,
      "sepa_cancelled": false,
      "phorest_updated": false,
      "zendesk_ticket_number": "12345",
      "contract": {
        "id": 42,
        "contract_number": "2025.07.07-HB000891",
        "client_id": "abc123",
        "client_name": "Dilara Akbas",
        "client_email": "dilara@example.com",
        "product_name": "glattt Paket Ganzkörper",
        "body_zones_display": "Ganzkörper",
        "total_value": "4500.00",
        "monthly_amount": "375.00",
        "signed_at": "2025-07-07",
        "status": "cancelled",
        "has_cancellation": true,
        "cancellation_status": "offen"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 50,
    "total": 1,
    "from": 1,
    "to": 1
  }
}
```

---

## Frontend-Komponenten

### Übersichtsseite (`index.blade.php`)

Alpine.js-Komponente mit folgendem State:

```javascript
{
    // Data
    cancellations: [],              // Gefilterte Widerrufe vom Server
    pagination: {},                  // Pagination-Infos
    totalStatusCounts: {},           // Ungefilterte Status-Zähler (Header-Badges)

    // Filter (Dropdowns → Server-Reload via $watch)
    filterStatus: 'all',
    filterReaction: 'all',
    filterReason: 'all',
    searchQuery: '',                 // Client-seitige Live-Suche

    // Sort (client-seitig)
    sortColumn: 'cancellation_date',
    sortDirection: 'desc',

    // Modal
    showCancellationModal: false,
    cancellationContract: null,
}
```

**Live-Filter-Architektur:**

- **Dropdowns** (Status, Reaktion, Grund): `$watch` → `applyFilters()` → Server-Reload via `loadCancellations()`
- **Textsuche**: Client-seitig über `filteredCancellations` Getter (kein Server-Request)
- **Zurücksetzen-Button**: Nur sichtbar, wenn mindestens ein Filter aktiv ist (`x-show` + `x-transition.opacity`)

### Widerrufs-Modal (`cancellation-modal.blade.php`)

Wiederverwendbares Modal mit eigenem `x-data` Scope. Wird per `@include` eingebunden.

**Voraussetzungen im Parent-Scope:**

```javascript
showCancellationModal: false,           // Boolean: Modal sichtbar
cancellationContract: null,             // Objekt: Vertragsdaten
cancellationSaving: false,             // Boolean: Speichervorgang
```

**Create vs. Edit Mode:**

| Aspekt | Create (neuer Widerruf) | Edit (bestehender) |
|--------|------------------------|---------------------|
| Erkennung | `!cancellationContract.has_cancellation` | `cancellationContract.has_cancellation` |
| HTTP-Methode | `POST` | `PUT` |
| Header-Farbe | 🔴 Danger (Rot) | 🔵 Primary (Teal) |
| Titel | „Widerruf" | „Widerruf bearbeiten" |
| Verhandlungen-Sektion | Versteckt | Sichtbar |
| Button-Text | „Widerruf speichern" | „Änderungen speichern" |
| Zendesk | Auto-Suche nach Kunden-E-Mail | Ticket wird geladen, falls vorhanden |

**Lebenszyklus beim Öffnen:**

```
$watch('showCancellationModal')
  ├─ resetForm()                    // Formular zurücksetzen
  ├─ loadCancellationData()         // Phorest-Daten laden (immer)
  └─ has_cancellation?
      ├─ true  → loadExistingCancellation()   // Bestehende Daten laden
      └─ false → autoSearchZendesk()          // Zendesk-Tickets suchen
```

---

## Zendesk-Integration

Das Modal bietet eine intelligente Zendesk-Ticket-Verknüpfung:

| Methode | Beschreibung |
|---------|-------------|
| `onTicketInput()` | Debounced Handler: Zahlen → direkter Lookup, Text → Suche |
| `lookupZendeskTicket()` | `GET /zendesk/tickets/{id}` – Ticket direkt laden |
| `searchZendeskTickets()` | `GET /zendesk/tickets/search?q=...` – Tickets durchsuchen |
| `autoSearchZendesk()` | Sucht automatisch nach Kunden-E-Mail beim Öffnen |
| `applyTicketDate(ticket)` | Setzt `cancellation_date` auf `ticket.created_at` |

**Ticket-Anzeige:** Nach Auswahl wird Ticket-Betreff, Status-Badge und Ersteller angezeigt.

---

## Phorest-Integration

### Automatische Behandlungshistorie

Beim Öffnen des Modals wird `GET /hub/contracts/{id}/cancellation-data` aufgerufen. Dieser Endpunkt nutzt die Phorest-API um folgende Daten zu laden:

| Daten | Quelle |
|-------|--------|
| Beratungsgespräch (BG) | Phorest: Erster Termin mit passenden Services |
| 1. Sitzung | Phorest: Erste tatsächliche Behandlung |
| Weitere Sitzungen | Phorest: Alle Folgetermine |
| Geplante Termine | Phorest: Zukünftige Termine |
| Tage BG → 1. Sitzung | Berechnet aus Daten |

### Client-Name-Resolution

Die Übersichtsseite löst Kundennamen über `getClientDataBulk()` auf:

```php
// Sammelt alle unique client_ids
// Bulk-Abfrage an Phorest mit Caching
// Mappt client_name + client_email auf jeden Widerruf
```

---

## Events & Kommunikation

### Dispatched Events

| Event | Auslöser | Payload | Listener |
|-------|---------|---------|----------|
| `cancellation-saved` | Nach erfolgreichem Speichern (Create/Update) | `{ contractId, cancellation }` | Übersichtsseite: `loadCancellations()` + `loadTotalStatusCounts()` |

### Bindung in der Übersichtsseite

```html
@cancellation-saved.window="loadCancellations(); loadTotalStatusCounts()"
```

Dies stellt sicher, dass die Tabelle und die Status-Badges nach jeder Änderung aktualisiert werden.

---

## CSS-Klassen

Das Modul nutzt ausschließlich Klassen aus dem glattt Design System (`theme_glattt.css`):

| Klasse | Verwendung |
|--------|-----------|
| `search-glattt-wrapper` / `search-glattt` | Suchfeld (Pill-Form mit Glass-Morphism) |
| `dropdown-glattt` / `<x-dropdown-glattt>` | Custom-Dropdowns für Filter |
| `table-glattt-container` / `table-glattt` | Übersichtstabelle |
| `badge-glattt-*` | Status- und Reaktions-Badges |
| `card-glattt` | Filterleiste, Loading/Error/Empty-States |
| `modal-glattt` / `modal-glattt-lg` | Widerrufs-Modal |
| `modal-glattt-header-danger` | Modal-Header (Create-Mode → Rot) |
| `modal-glattt-header-primary` | Modal-Header (Edit-Mode → Teal) |
| `btn-glattt-icon` | Bearbeiten-Button in Tabellenzeile |
| `spinner-glattt` | Lade-Animation |
