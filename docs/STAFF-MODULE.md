# Personalverwaltung (Staff Module)

Die Personalverwaltung zeigt alle Mitarbeiter aus dem Personalmanagement-System **askDANTE**
(Übersicht `/hub/staff`, Detailseite `/hub/staff/{staffId}`), bezogen über die
[askDANTE API](ASKDANTE-API.md) und serverseitig fünf Minuten gecacht, und verbindet die
askDANTE-Person mit ihrem Hub-Benutzerkonto (Spalte „Hub-Konto", Wizard „Konto anlegen").
Diese Seite beschreibt **Absicht, Architektur, Endpunkte, Alpine-Komponenten und die Fachregeln
des Hub-Konto-Wizards**; die Bedienung Schritt für Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Team 1 – Personalübersicht und Hub-Konten"
    [hilfe.hub.glattt.com/team/1/](https://hilfe.hub.glattt.com/team/1/) — Personalübersicht lesen,
    Detailseite, Hub-Konto anlegen und einladen, Austritt archivieren.

    Angrenzend: [Admin 1 – Benutzer und Rollen](https://hilfe.hub.glattt.com/admin/1/) (Rollen,
    Rechte, weitere Änderungen am Konto), [Admin 7 – Personal und Vergütung](https://hilfe.hub.glattt.com/admin/7/)
    (Personalzuordnungen, Gehälter), [Team 2 – Reisekosten erfassen](https://hilfe.hub.glattt.com/team/2/).

---

## Für Anwender — Überblick

**Was das Modul leistet.** askDANTE ist die führende Quelle für Personalstammdaten (Name,
Personalnummer, Kostenstelle, Kontakt, Ein-/Austritt, Organisationseinheiten). Der Hub
bearbeitet diese Daten nicht, sondern zeigt sie — durchsuchbar, sortierbar, mit und ohne
archivierte Personen — und ergänzt die eine Information, die askDANTE nicht kennt: **ob die
Person ein Hub-Benutzerkonto hat** und mit welchen Rollen. Grundlage ist die Verknüpfung
`users.hr_employee_id` ↔ `hr_employees.askdante_user_id`.

**Warum der Hub-Konto-Wizard.** Bis 09/2026 wurden Hub-Konten im Admin-Backend von Hand angelegt
und danach separat mit askDANTE, Phorest und einer Bonus-Klasse verknüpft — vier Stellen, an
denen etwas vergessen werden konnte (eine Person ohne Bonus-Klasse fehlt auf dem Bonus-Board,
ohne askDANTE-Verknüpfung rechnet die Abwesenheitsregel mit 0 Tagen). Der Wizard aus der
Personalübersicht legt das Konto **mit allen Verknüpfungen in einem Durchgang** an, schlägt
Institute, Rollen, Phorest-Mitarbeiter und Bonus-Klasse vor, verknüpft ein bereits vorhandenes
Konto statt ein Duplikat zu erzeugen und verschickt auf Wunsch sofort die Einladung
(siehe [Einladungssystem](USER-INVITATION-SYSTEM.md)). Spätere Änderungen laufen wie gewohnt im
Admin-Backend. Der Austritt einer Person wird über die
[Archivierung](USER-ARCHIVIERUNG.md) abgebildet — die Übersicht zeigt dann „Archiviert" bzw.
„Archiviert ab …" statt des grünen Hakens.

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Personalübersicht lesen, suchen, sortieren, Archivierte einblenden | Team 1 |
| Detailseite einer Person (Stammdaten, Kontakt, Beschäftigung, Organisationseinheiten) | Team 1 |
| Hub-Konto anlegen, vorhandenes Konto verknüpfen, Einladung senden | Team 1 |
| Austritt: Konto archivieren | Team 1 |
| Rollen und Rechte ändern, Konto im Admin-Backend pflegen | Admin 1 |
| Gehälter, Bonus-Auszahlungen, Personalzuordnungen | Admin 7 |
| Reisekosten erfassen und freigeben | Team 2, Team 3 |

---

## Für Entwickler

### Fachregeln der Übersicht und Detailseite

- **Datenquelle askDANTE, kein Schreiben.** Alle Personendaten kommen aus der askDANTE REST
  API (siehe [Datenquelle](#datenquelle)); der Hub cacht sie 5 Minuten und ändert sie nicht.
- **Suche** läuft clientseitig (debounced, 300 ms) über Name, Personalnummer, E-Mail,
  Kostenstelle und externe ID. **Sortierung** per Klick auf den Spaltenkopf, Standard Nachname
  aufsteigend. **Archiv-Toggle** blendet archivierte Mitarbeiter ein (Standard: ausgeblendet,
  eigener Cache-Key). **Pagination** 25 Einträge je Seite. Klick auf eine Zeile öffnet die
  Detailseite.
- **Spalten der Übersicht:** Nr. (Personalnummer, sortierbar) · Name (Vor-/Nachname mit
  Avatar-Initialen und Geschlecht) · Kostenstelle (Badge) · Kontakt (E-Mail und/oder Mobil) ·
  Eintritt (sortierbar) · Status (Aktiv grün / Archiviert gelb) · **Hub-Konto** (grüner Haken
  mit Rollen und E-Mail-Tooltip, „Konto anlegen"-Button, oder Badge „Archiviert" / „Archiviert
  ab …" für archivierte Hub-Konten) · Aktion (Pfeil zur Detailseite).
- **Detailseite** im Sidebar-Tab-Layout wie das [Kundenprofil](CLIENT-DETAIL-MODULE.md), Header
  mit Zurück-Button, Name, Aktiv/Archiviert-Badge, Personalnummer und Kostenstelle als Subtitle:

| Tab | Inhalt |
|-----|-------------|
| **Übersicht** | Stammdaten: Avatar, Name, Personalnummer, Externe ID, Geburtsdatum, Geschlecht, Ein-/Austrittsdatum, Status, Kommentar |
| **Kontakt** | Kontaktdaten (E-Mail, Mobil, Festnetz, Sprache) und Adresse (Straße, PLZ, Stadt, Land) |
| **Beschäftigung** | Kostenstelle, Externe ID, Ein-/Austrittsdatum, Probezeit-Ende, Status + Online-Zugang (E-Mail, Sprache, Rollen-ID) |
| **Organisationseinheiten** | Zugeordnete Organisationseinheiten aus askDANTE (Lazy-Loading bei Tab-Aktivierung) |

### Fachregeln des Hub-Konto-Wizards

Der Button **Konto anlegen** erscheint bei Personen ohne Konto für Nutzer mit dem Recht
**Benutzer erstellen** (`create_users`, dasselbe Recht wie im Admin-Backend). Der Wizard hat
fünf Schritte, alles vorbelegt und änderbar:

1. **Stammdaten** — Name und E-Mail aus askDANTE, Stamm-Institut und erlaubte Institute aus dem
   askDANTE-Standort (bzw. Team-Namen), Auto-Logout. Passt ein vorhandenes Hub-Konto ohne
   Verknüpfung (gleiche E-Mail oder gleicher Name), bietet der Wizard **„Dieses Konto
   verknüpfen"** an — dann entsteht kein Duplikat, das Konto bekommt nur die
   askDANTE-Verknüpfung. Kandidaten sind nur **aktive** (nicht archivierte) Konten.
2. **Rollen** — Vorschlag aus Team/E-Mail: „leitung" → Leitung, Office/Management → Büro bzw.
   Admin, sonst Institutsrolle (bzw. Standardrolle). Der Vorschlag setzt die Prod-Rollen voraus
   (siehe Projektwissen „Prod-Rollen ≠ Seeder-Rollen").
3. **Verknüpfungen** — Phorest-Mitarbeiter (Vorschlag per Namensabgleich, nur eindeutige
   Treffer; bereits verknüpfte sind ausgeblendet), askDANTE fest auf diese Person, Schalter
   „HR-Kennzahlen erfassen" (`kpi_relevant`).
4. **Bonus-Klasse** — Vorschlag passend zur Rolle, mit „Gültig ab" (Standard: Monatsanfang).
   **Ohne Klasse erscheint die Person nicht auf dem Bonus-Board.**
5. **Abschluss** — Zusammenfassung, **Einladung per E-Mail** ja/nein (Link 7 Tage gültig, Person
   legt PIN und Passwort selbst fest), optional PIN direkt setzen. Ohne Passwort bekommt das
   Konto ein Zufallspasswort — der Zugang läuft dann über die Einladung.

Nach dem Anlegen zeigt die Zeile sofort den Haken; ein Toast bestätigt Konto und Einladung.
Anlage und Einladung laufen **ausschließlich** über `UserProvisioningService` bzw.
`UserInvitationService` — dieselben Klassen, die auch das Admin-Backend nutzt.

### Dateistruktur

```
resources/views/hub/
├── staff.blade.php                           # Übersichtsseite (Alpine.js staffPage)
└── staff/
    ├── detail.blade.php                      # Detailseite (Alpine.js staffDetailPage)
    └── partials/
        ├── table.blade.php                   # Tabellen-Partial (Übersicht, inkl. Spalte Hub-Konto)
        ├── pagination.blade.php              # Pagination-Partial (Übersicht)
        ├── detail-overview.blade.php         # Tab: Stammdaten
        ├── detail-contact.blade.php          # Tab: Kontakt + Adresse
        ├── detail-employment.blade.php       # Tab: Beschäftigung + Online-Zugang
        └── detail-org-units.blade.php        # Tab: Organisationseinheiten

resources/views/components/
└── hub-user-wizard.blade.php                 # Hub-Konto-Wizard (Muster Dashboard-Wizard)

public/js/
└── hub-user-wizard.js                        # Wizard-Alpine (window.openHubUserWizard(staff))

app/Http/Controllers/
├── StaffController.php                       # API-Controller (index, show, units)
└── HubUserProvisioningController.php         # Wizard-Endpunkte (options, prefill, store, link)

app/Services/
├── AskDanteApiService.php                    # askDANTE API-Service (getUsers, getUser, etc.)
├── UserProvisioningService.php               # Konto anlegen / verknüpfen / vorbelegen
└── UserInvitationService.php                 # Einladung (Token, Mail)

config/
└── askdante.php                              # Endpoint-Konfiguration
```

### Architektur

#### Überblick

```
Browser (Alpine.js)
    │
    ├── GET /askdante/staff              → StaffController::index()
    ├── GET /askdante/staff/{id}         → StaffController::show()
    └── GET /askdante/staff/{id}/units   → StaffController::units()
                │
                └── AskDanteApiService
                        │
                        └── askDANTE REST API (my.askdante.com)
```

Das Frontend ist ein **Alpine.js**-Component, das per `fetch()` Daten von den Laravel-API-Routen holt. Suche, Sortierung und Pagination passieren **clientseitig** nach dem initialen Laden.

#### Caching

Alle API-Antworten werden serverseitig mit `Cache::remember()` für **300 Sekunden (5 Minuten)** gecacht:

```php
Cache::remember('askdante_staff_all', 300, fn () => $this->askDante->getUsers());
Cache::remember("askdante_staff_{$userId}", 300, fn () => $this->askDante->getUser($userId));
Cache::remember("askdante_staff_{$userId}_units", 300, fn () => $this->askDante->getUserUnits($userId));
```

Beim Aktivieren des Archiv-Toggles wird ein separater Cache-Key verwendet:

```php
Cache::remember('askdante_staff_archived', 300, fn () => $this->askDante->getUsersIncludeArchived(true));
```

---

### Routes

#### View Routes (in `routes/web.php`, Hub-Prefix)

| Method | URL | Name | Beschreibung |
|--------|-----|------|-------------|
| GET | `/hub/staff` | `hub.staff` | Personalübersicht |
| GET | `/hub/staff/{staffId}` | `hub.staff.detail` | Mitarbeiter-Detail |

#### API Routes (askdante-Prefix)

| Method | URL | Name | Controller |
|--------|-----|------|-----------|
| GET | `/askdante/staff` | `askdante.staff` | `StaffController::index()` |
| GET | `/askdante/staff/{userId}` | `askdante.staff.show` | `StaffController::show()` |
| GET | `/askdante/staff/{userId}/units` | `askdante.staff.units` | `StaffController::units()` |

---

### StaffController

**Datei:** `app/Http/Controllers/StaffController.php`

#### `index(Request $request): JsonResponse`

Liefert alle Mitarbeiter als JSON. Unterstützt den Query-Parameter `includeArchived=true`.
Zusätzlich enthält die Antwort `hub_accounts` (askDANTE-ID → Konto-Kurzform aus
`UserProvisioningService::accountsByAskdanteId()`, inkl. `archived` + `archive_label`) für die
Spalte „Hub-Konto".

```json
{
    "success": true,
    "data": [ { "id": "7278", "firstName": "Anton", ... }, ... ],
    "total": 42
}
```

#### `show(string $userId): JsonResponse`

Liefert einen einzelnen Mitarbeiter anhand seiner askDANTE User-ID.

```json
{
    "success": true,
    "data": {
        "id": "7278",
        "firstName": "Anton",
        "lastName": "Aal",
        "personnelNumber": "PE001",
        "costCenter": "CI4",
        "externalId": "EXT123",
        "archived": false,
        "entryDate": "2014-01-01",
        "exitDate": null,
        "gender": "MALE",
        "birthday": "1980-01-01",
        "mobileNumber": "0123456",
        "landlineNumber": "321654",
        "comment": "...",
        "onlineAccess": {
            "email": "anton.aal@aal.com",
            "language": "ENGLISH",
            "roleId": "6543"
        },
        "address": {
            "street": "...",
            "zip": "...",
            "city": "...",
            "country": "..."
        }
    }
}
```

#### `units(string $userId): JsonResponse`

Liefert die Organisationseinheiten, denen ein Mitarbeiter zugeordnet ist.

```json
{
    "success": true,
    "data": [ { "id": "...", "unitId": "...", "name": "Standort Berlin", ... }, ... ]
}
```

---

### Hub-Konto-Wizard (Umsetzung)

- **Endpunkte** (Gate `can:create_users`, `HubUserProvisioningController`):
  `GET /hub/staff/hub-account/options` (Rollen, Institute in Institut-Reihenfolge,
  Bonus-Klassen, Phorest-Mitarbeiter, Auto-Logout), `GET /hub/staff/hub-account/prefill/{askdanteUserId}`
  (Stammdaten, `linked_user`, `existing_candidates`, `suggestions`),
  `POST /hub/staff/hub-account` (anlegen, optional `send_invitation`),
  `POST /hub/staff/hub-account/link` (bestehendes Konto verknüpfen).
- **`App\Services\UserProvisioningService`** — eine Logik für Admin-Backend und
  Wizard: `create()` (User, Rollen mit Standardrollen-Fallback, `phorest_staff_ids`
  + `phorest_staff.glatthub_user_id`, `hr_employee_id` + `kpi_relevant`,
  `user_bonus_classes`; ohne Passwort ein Zufallspasswort, Zugang über die
  Einladung), `link()`, `prefill()` (Institut über `hr_employment_periods` →
  `hr_locations.branch_id`, Rückfall Team-Name; Namens-Schlüssel aus
  `HrStaffLinkService::nameKeys()`), `accountsByAskdanteId()` für die Spalte,
  `userSummary()` mit `archived` + `archive_label`. Verknüpfungs-Kandidaten
  (`existingCandidates`) sind nur aktive Konten (`User::active()`).
- **`App\Services\UserInvitationService`** — Einladung (vorherige offene
  ungültig, Token, Mail `emails.user-invitation`); die Filament-Aktion in
  `UsersTable` nutzt denselben Service. Details: [Einladungssystem](USER-INVITATION-SYSTEM.md).
- **Frontend**: `resources/views/components/hub-user-wizard.blade.php`
  + `public/js/hub-user-wizard.js` (Muster Dashboard-Wizard, `window.openHubUserWizard(staff)`,
  Event `hub-user-provisioned`), Spalte in `hub/staff/partials/table.blade.php`.
- **Tests**: `tests/Feature/HubUserProvisioningTest.php` (Rechte, Vorbelegung,
  Anlegen mit allen Verknüpfungen, Einladung, Duplikat-Abwehr, Verknüpfen).

### Alpine.js Components

#### `staffPage()` — Übersichtsseite

| Property | Typ | Beschreibung |
|----------|-----|-------------|
| `allStaff` | Array | Alle geladenen Mitarbeiter (Rohdaten) |
| `filteredStaff` | Array | Nach Suche gefilterte Mitarbeiter |
| `pagedStaff` | Array | Aktuelle Seite |
| `loading` | Boolean | Ladezustand |
| `searchQuery` | String | Suchbegriff |
| `includeArchived` | Boolean | Archivierte einbeziehen |
| `currentPage` | Number | Aktuelle Seite (0-basiert) |
| `pageSize` | Number | Einträge pro Seite (25) |
| `sortField` | String | Aktuelles Sortierfeld |
| `sortDir` | String | Sortierrichtung (`asc`/`desc`) |

**Methoden:**

| Methode | Beschreibung |
|---------|-------------|
| `loadStaff()` | Lädt Mitarbeiter via `GET /askdante/staff` |
| `applyFilters()` | Filtert + sortiert `allStaff`, setzt Page zurück |
| `updatePage()` | Berechnet `pagedStaff` aus `filteredStaff` + `currentPage` |
| `toggleSort(field)` | Sortierung umschalten |
| `viewStaff(staff)` | Navigation zu `/hub/staff/{id}` |
| `formatDate(dateStr)` | Datum → `dd.MM.yyyy` |
| `getGenderLabel(gender)` | `MALE` → `Männlich`, etc. |
| `getInitials(staff)` | Initialen für Avatar |

#### `staffDetailPage()` — Detailseite

| Property | Typ | Beschreibung |
|----------|-----|-------------|
| `staff` | Object/null | Mitarbeiterdaten |
| `units` | Array | Organisationseinheiten |
| `loading` | Boolean | Hauptladezustand |
| `unitsLoading` | Boolean | Ladezustand für OE-Tab |
| `activeTab` | String | Aktiver Tab-Identifier |
| `tabs` | Array | Tab-Definitionen |

**Lazy Loading:** Organisationseinheiten werden erst beim Wechsel auf den Tab „Organisationseinheiten" geladen:

```js
this.$watch('activeTab', (newTab) => {
    if (newTab === 'org-units' && this.units.length === 0 && !this.unitsLoading) {
        this.loadUnits(this.getStaffIdFromUrl());
    }
});
```

---

### CSS-Klassen

Alle verwendeten Klassen stammen aus `theme_glattt.css`. Keine Inline-Styles.

#### Übersichtsseite

| Klasse | Verwendung |
|--------|-----------|
| `page-header-glattt` | Header mit Titel und Aktionen |
| `search-glattt-wrapper` / `search-glattt` | Suchfeld |
| `toggle-glattt-wrapper` / `toggle-glattt` | Archiv-Schalter |
| `table-glattt-container` / `table-glattt` / `table-glattt-striped` | Tabelle |
| `table-glattt-sortable` | Sortierbare Spaltenheader |
| `table-glattt-cell-primary` / `-secondary` / `-mono` / `-actions` | Zell-Typen |
| `badge-glattt-success` / `-warning` / `-neutral` / `-info` | Status-Badges |
| `pagination-glattt` / `pagination-glattt-info` / `-actions` | Pagination |
| `empty-state-glattt` / `spinner-glattt` | Lade-/Leer-Zustände |
| `avatar-glattt` / `avatar-glattt-sm` | Initialen-Avatar |

#### Detailseite

| Klasse | Verwendung |
|--------|-----------|
| `tabs-glattt-layout` | Flex-Container für Sidebar + Content |
| `tabs-glattt-sidebar` | Sidebar-Navigation |
| `tab-glattt-sidebar` | Einzelner Tab-Button |
| `tabs-glattt-content` | Content-Bereich |
| `card-glattt` / `card-glattt-header` / `-body` / `-title` | Karten |
| `detail-grid-glattt` / `detail-item-glattt` | Detail-Raster |
| `detail-item-glattt-label` / `-value` | Label-Value-Paare |
| `card-list-glattt` / `card-glattt-nested` / `-compact` | Listen in Karten |
| `link-glattt` | Klickbare Links (E-Mail, Telefon) |

---

### Blade Partials & Berechtigungen

Die Detailseite ist bewusst in separate Blade-Partials aufgeteilt, um zukünftig unterschiedliche Inhalte je nach Benutzerrolle anzeigen zu können:

```blade
{{-- Aktuell werden alle Tabs angezeigt --}}
@include('hub.staff.partials.detail-overview')
@include('hub.staff.partials.detail-contact')
@include('hub.staff.partials.detail-employment')
@include('hub.staff.partials.detail-org-units')

{{-- Später möglich: --}}
@can('staff.detail.employment')
    @include('hub.staff.partials.detail-employment')
@endcan
```

Die Tab-Definitionen in `staffDetailPage()` enthalten ein `visible`-Flag, das für Berechtigungssteuerung genutzt werden kann:

```js
tabs: [
    { id: 'overview', name: 'Übersicht', visible: true },
    { id: 'contact', name: 'Kontakt', visible: true },
    { id: 'employment', name: 'Beschäftigung', visible: true },
    { id: 'org-units', name: 'Organisationseinheiten', visible: true }
],
```

---

### Datenquelle

Alle Daten stammen aus der **askDANTE REST API**. Detaillierte Informationen zu den Endpunkten, Authentifizierung und Response-Formaten finden sich in der [askDANTE API Dokumentation](ASKDANTE-API.md).

**Verwendete Endpunkte:**

| Methode | askDANTE Endpunkt | Verwendung |
|---------|-------------------|-----------|
| `getUsers()` | `GET /users` | Übersicht (aktive Mitarbeiter) |
| `getUsersIncludeArchived(true)` | `GET /users?includeArchived=true` | Übersicht mit Archiv-Toggle |
| `getUser($id)` | `GET /users/{id}` | Detailansicht |
| `getUserUnits($id)` | `GET /users/{id}/units` | Tab: Organisationseinheiten |
