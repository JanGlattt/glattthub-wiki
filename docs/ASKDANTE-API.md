# askDANTE API Integration

## Übersicht

**askDANTE** ist unser Personalmanagement-System für Zeiterfassung, Dienstplanung, Abwesenheiten und Mitarbeiterverwaltung.

- **Base URL:** `https://my.askdante.com/rest/api`
- **Auth:** Query-Parameter `apiAuthenticationToken`
- **Service:** `App\Services\AskDanteApiService`
- **Config:** `config/askdante.php`
- **API-Docs:** [my.askdante.com/rest-api](https://my.askdante.com/rest-api/index.html) (Login erforderlich)

---

## Konfiguration

### Environment Variables

```env
ASKDANTE_API_BASE_URL=https://my.askdante.com/rest/api
ASKDANTE_API_KEY=dein_api_key_hier
ASKDANTE_API_TIMEOUT=30
```

### Service Provider

Registriert in `bootstrap/providers.php` als `AskDanteServiceProvider`. Der Service ist als Singleton (`askdante`) im Container verfügbar.

### Verwendung

```php
// Per Dependency Injection
public function __construct(private AskDanteApiService $askDante) {}

// Per Facade/Container
$askDante = app(AskDanteApiService::class);
$askDante = app('askdante');
```

---

## API-Endpunkte

### 👥 Users (Mitarbeiter)

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/users` | `getUsers()` | Alle Mitarbeiter auflisten |
| GET | `/users?includeArchived=true` | `getUsersIncludeArchived()` | Alle inkl. archivierte |
| GET | `/users/{id}` | `getUser($id)` | Einzelnen Mitarbeiter abrufen |
| GET | `/users?personnelNumber=...` | `getUserByPersonnelNumber($nr)` | Nach Personalnummer suchen |
| POST | `/users` | `createUser($data)` | Mitarbeiter anlegen |
| PUT | `/users/{id}` | `updateUser($id, $data)` | Mitarbeiter aktualisieren |
| DELETE | `/users/{id}` | `deleteUser($id)` | Mitarbeiter löschen |
| DELETE | `/users?externalId=...` | `deleteUserByExternalId($extId)` | Nach External ID löschen |

**Create-Felder:**

| Feld | Optional | Beschreibung |
|------|----------|--------------|
| `firstName` | ✓* | Vorname (*Pflicht wenn kein onlineAccess) |
| `lastName` | ✓* | Nachname (*Pflicht wenn kein onlineAccess) |
| `personnelNumber` | ✓ | Personalnummer (max. 50 Zeichen) |
| `costCenter` | ✓ | Kostenstelle |
| `externalId` | ✓ | Externe ID (max. 50 Zeichen) |
| `gender` | ✓ | Geschlecht |
| `archived` | ✓ | Archiviert (Default: `false`) |
| `entryDate` | ✓ | Eintrittsdatum |
| `endOfProbationaryPeriod` | ✓ | Ende der Probezeit |
| `birthday` | ✓ | Geburtstag |
| `mobileNumber` | ✓ | Mobilnummer |
| `landlineNumber` | ✓ | Festnetznummer |
| `comment` | ✓ | Kommentar |
| `onlineAccess` | ✓ | Online-Zugang konfigurieren |
| `onlineAccess.email` | ✓* | E-Mail (*Pflicht wenn onlineAccess) |
| `onlineAccess.language` | ✓* | Sprache (*Pflicht wenn onlineAccess) |
| `onlineAccess.roleId` | ✓* | Rollen-ID (*Pflicht wenn onlineAccess) |
| `address` | ✓ | Adresse |
| `address.street` | ✓ | Straße |
| `address.zip` | ✓ | PLZ |
| `address.city` | ✓ | Stadt |
| `address.country` | ✓ | Land |

**Update-Felder:** Wie Create-Felder, plus:

| Feld | Optional | Beschreibung |
|------|----------|--------------|
| `exitDate` | ✓ | Austrittsdatum (beeinflusst Soll-Stunden) |

**Response:**
```json
{
  "id": "7278",
  "firstName": "Anton",
  "lastName": "Aal",
  "costCenter": "CI4",
  "archived": false,
  "entryDate": "2014-01-01",
  "exitDate": "2020-09-30",
  "gender": "UNKNOWN",
  "onlineAccess": {
    "email": "anton.aal@aal.com",
    "language": "ENGLISH",
    "roleId": "6543"
  },
  "birthday": "1980-01-01",
  "mobileNumber": "0123456",
  "landlineNumber": "321654",
  "comment": "comment",
  "address": {"street": "...", "zip": "...", "city": "...", "country": "..."}
}
```

### 🏢 User Units (Einheit-Zugehörigkeiten)

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/users/{userId}/units` | `getUserUnits($userId)` | Org-Unit-Zugehörigkeiten eines Mitarbeiters |

**Response:**
```json
{
  "memberships": [
    {"unitId": "8b8f70d6-...", "unitName": "Management", "role": "REPLACEMENT"},
    {"unitId": "d7852039-...", "unitName": "Team", "role": "HEAD"}
  ]
}
```

### 📋 Employment (Anstellungsdaten)

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/users/{userId}/employment` | `getEmployment($userId)` | Anstellung abrufen |
| POST | `/users/{userId}/employment` | `createEmployment($userId, $data)` | Anstellung anlegen |
| PUT | `/users/{userId}/employment` | `updateEmployment($userId, $data)` | Anstellung aktualisieren |

### 📅 Employment Periods (Beschäftigungsperioden)

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/users/{userId}/employment/periods` | `getEmploymentPeriods($userId)` | Perioden auflisten |
| GET | `/users/{userId}/employment/periods/{periodId}` | `getEmploymentPeriod($userId, $periodId)` | Einzelne Periode |
| POST | `/users/{userId}/employment/periods` | `createEmploymentPeriod($userId, $data)` | Periode anlegen |
| PUT | `/users/{userId}/employment/periods/{periodId}` | `updateEmploymentPeriod($userId, $periodId, $data)` | Periode aktualisieren |

### 🔗 Connect Users (Externe Systeme)

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/connect/users` | `getConnectUsers()` | Ext. Benutzer auflisten |
| GET | `/connect/users/{id}` | `getConnectUser($id)` | Ext. Benutzer abrufen |
| GET | `/connect/users?personnelNumber=...` | `getConnectUserByPersonnelNumber($nr)` | Nach Personalnummer suchen |
| POST | `/connect/users` | `createConnectUser($data)` | Ext. Benutzer anlegen |
| PUT | `/connect/users/{id}` | `updateConnectUser($id, $data)` | Ext. Benutzer vollständig aktualisieren |
| PATCH | `/connect/users/{id}` | `patchConnectUser($id, $data)` | Ext. Benutzer teilweise aktualisieren |
| PATCH | `/connect/users/extid/{externalId}` | `patchConnectUserByExternalId($extId, $data)` | Per External ID patchen |
| DELETE | `/connect/users/{id}` | `deleteConnectUser($id)` | Ext. Benutzer löschen |
| DELETE | `/connect/users/extid/{externalId}` | `deleteConnectUserByExternalId($extId)` | Per External ID löschen |

**Connect User Felder (PUT/PATCH):**

| Feld | Optional | Beschreibung |
|------|----------|--------------|
| `firstName` | | Vorname |
| `lastName` | | Nachname |
| `costCenter` | ✓ | Kostenstelle |
| `exitDate` | ✓ | Austrittsdatum (Y-m-d) |
| `transponderNumber` | ✓ | Transpondernummer |
| `trackingOptions` | ✓ | Array, z.B. `["TERMINAL", "BARCODE"]` |

### 📍 Locations (Standorte)

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/locations` | `getLocations()` | Alle Standorte |
| GET | `/locations/{locationId}` | `getLocation($id)` | Einzelner Standort |
| POST | `/locations` | `createLocation($data)` | Standort anlegen |

### 🏢 Organizational Units (Organisationseinheiten)

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/organization/units` | `getOrgUnits()` | Alle Einheiten |
| GET | `/organization/units/{id}` | `getOrgUnit($id)` | Einzelne Einheit |
| POST | `/organization/units` | `createOrgUnit($data)` | Einheit anlegen |
| PUT | `/organization/units/{id}` | `updateOrgUnit($id, $data)` | Einheit aktualisieren |
| GET | `/organization/units/{id}/directChildren` | `getOrgUnitDirectChildren($id)` | Direkte Kinder-Einheiten |
| GET | `/organization/units/userUnits/{id}` | `getOrgUnitsByUser($userId)` | Einheiten eines Benutzers |

**Create-Felder:**

| Feld | Typ | Optional | Beschreibung |
|------|-----|----------|--------------|
| `name` | string | | Name der Einheit |
| `unitType` | string | | Typ: `TEAM`, `TEAM_MANAGEMENT`, `CENTRALISED`, `MANAGEMENT` |
| `parentUnitId` | string | ✓ | ID der übergeordneten Einheit |

**Update-Felder:**

| Feld | Typ | Optional | Beschreibung |
|------|-----|----------|--------------|
| `name` | string | | Name der Einheit |
| `parentUnitId` | string | ✓ | ID der übergeordneten Einheit |

**Response:** `{id, name, unitType, parentUnitId}`

**List-Response:** `{units: [{id, name, unitType, parentUnitId}, ...]}`

### 👥 Org Unit Members (Einheit-Mitglieder)

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/organization/units/{unitId}/members` | `getOrgUnitMembers($unitId)` | Mitglieder auflisten |
| GET | `/organization/units/{unitId}/members/{id}` | `getOrgUnitMember($unitId, $id)` | Einzelnes Mitglied |
| POST | `/organization/units/{unitId}/members` | `createOrgUnitMember($unitId, $data)` | Mitglied hinzufügen |
| PUT | `/organization/units/{unitId}/members/{id}` | `updateOrgUnitMember($unitId, $id, $data)` | Mitglied aktualisieren |
| DELETE | `/organization/units/{unitId}/members/{id}` | `deleteOrgUnitMember($unitId, $id)` | Mitglied entfernen |

**Create-Felder:**

| Feld | Typ | Optional | Beschreibung |
|------|-----|----------|--------------|
| `userId` | string | | ID des Benutzers |

**Update-Felder:**

| Feld | Typ | Optional | Beschreibung |
|------|-----|----------|--------------|
| `role` | string | ✓ | Rolle in der Einheit: `HEAD`, `REPLACEMENT` oder `null` |

**List-Response:**
```json
{
  "members": [
    {"userId": "6374", "role": "HEAD"},
    {"userId": "6375", "role": "REPLACEMENT"},
    {"userId": "6376"}
  ]
}
```

**Get-Response:** `{userId, role}`

### ⚡ Activities (Tätigkeiten)

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/activities` | `getActivities()` | Alle Tätigkeiten |
| GET | `/activities/{id}` | `getActivity($id)` | Einzelne Tätigkeit |
| POST | `/activities` | `createActivity($data)` | Tätigkeit anlegen |
| PUT | `/activities/{id}` | `updateActivity($id, $data)` | Tätigkeit aktualisieren |
| DELETE | `/activities/{id}` | `deleteActivity($id)` | Tätigkeit löschen |

**Activity Felder:**

| Feld | Optional | Beschreibung |
|------|----------|--------------|
| `name` | | Tätigkeitsname |
| `archived` | ✓ | `true` = archiviert, `false` = aktiv |

**Response:** `{id, name, archived}`

### 📂 Projects (Projekte)

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/projects` | `getProjects()` | Alle Projekte |
| GET | `/projects/{projectId}` | `getProject($id)` | Einzelnes Projekt |
| POST | `/projects` | `createProject($data)` | Projekt anlegen |
| PUT | `/projects/{projectId}` | `updateProject($id, $data)` | Projekt aktualisieren |
| DELETE | `/projects/{projectId}` | `deleteProject($id)` | Projekt löschen |

### 🔗 Project Activity Mappings

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/projects/{projectId}/activityMappings` | `getProjectActivityMappings($projectId)` | Zuordnungen auflisten |
| POST | `/projects/{projectId}/activityMappings` | `createProjectActivityMapping($projectId, $data)` | Zuordnung anlegen |
| PUT | `/projects/{projectId}/activityMappings/{mappingId}` | `updateProjectActivityMapping($projectId, $mappingId, $data)` | Zuordnung aktualisieren |
| DELETE | `/projects/{projectId}/activityMappings/{mappingId}` | `deleteProjectActivityMapping($projectId, $mappingId)` | Zuordnung löschen |

### 👥 Project Members

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/projects/{projectId}/members` | `getProjectMembers($projectId)` | Mitglieder auflisten |
| POST | `/projects/{projectId}/members` | `createProjectMember($projectId, $data)` | Mitglied hinzufügen |
| PUT | `/projects/{projectId}/members/{memberId}` | `updateProjectMember($projectId, $memberId, $data)` | Mitglied aktualisieren |
| DELETE | `/projects/{projectId}/members/{memberId}` | `deleteProjectMember($projectId, $memberId)` | Mitglied entfernen |

### 📦 Project Items (Projekt-Einträge)

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/projectItems` | `getProjectItems()` | Alle Einträge |
| GET | `/projectItems/{projectItemId}` | `getProjectItem($id)` | Einzelner Eintrag |
| POST | `/projectItems` | `createProjectItem($data)` | Eintrag anlegen |
| PUT | `/projectItems/{projectItemId}` | `updateProjectItem($id, $data)` | Eintrag aktualisieren |
| DELETE | `/projectItems/{projectItemId}` | `deleteProjectItem($id)` | Eintrag löschen |
| GET | `/projectItems/{projectItemId}/members` | `getProjectItemMembers($id)` | Eintrags-Mitglieder |

### 🏪 Customers (Kunden)

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/customers` | `getCustomers()` | Alle Kunden |
| GET | `/customers/{id}` | `getCustomer($id)` | Einzelner Kunde |
| POST | `/customers` | `createCustomer($data)` | Kunde anlegen |
| PUT | `/customers/{id}` | `updateCustomer($id, $data)` | Kunde aktualisieren |
| DELETE | `/customers/{id}` | `deleteCustomer($id)` | Kunde löschen |

**Customer Felder:**

| Feld | Optional | Beschreibung |
|------|----------|--------------|
| `name` | | Kundenname |
| `referenceNumber` | ✓ | Referenznummer |
| `externalReferenceNumber` | ✓ | Externe Referenznummer |
| `timeTrackable` | ✓ | Zeiterfassung pro Kunde aktiviert |
| `archived` | ✓ | `true` = archiviert, `false` = aktiv |

### ⏱️ Time Profiles (Zeitprofile)

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/timeProfiles` | `getTimeProfiles()` | Alle Zeitprofile |
| GET | `/timeProfiles/{profileId}` | `getTimeProfile($id)` | Einzelnes Zeitprofil |
| POST | `/timeProfiles` | `createTimeProfile($data)` | Zeitprofil anlegen |
| PUT | `/timeProfiles/{profileId}` | `updateTimeProfile($id, $data)` | Zeitprofil aktualisieren |

### ⏰ Time Tracking (Zeiterfassung)

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/timetracking/{userId}` | `getTimeTracking($userId)` | Zeiterfassung eines Mitarbeiters |

### 📅 Calendar (Kalender)

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/calendar/{id}?start=...&stop=...` | `getCalendar($userId, $start, $stop)` | Kalendereinträge eines Mitarbeiters (max 31 Tage) |

### 📋 Shift Plans (Dienstpläne)

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/shiftplans/{shiftplanId}/shifts` | `getShifts($shiftplanId, $from, $to)` | Schichten eines Dienstplans |

### 🏥 Disease Stats (Krankheitstage)

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/diseases/stats` | `getDiseaseStats($from, $to)` | Krankheitstage pro Mitarbeiter |

### 📊 Reports

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/reports/projectperformance` | `getProjectPerformanceReport($from, $to)` | Projektleistungsbericht |

### ✅ V1: Attendance (Anwesenheit – aktueller Status, Singular)

Endpunkt: `/v1/attendance` — Liefert den **aktuellen** Anwesenheitsstatus. Response im **XML**-Format.

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/v1/attendance?login=...` | `getAttendanceByLogin($login, $date?, $time?)` | Status nach Login (E-Mail) |
| GET | `/v1/attendance?personnelNumber=...` | `getAttendanceByPersonnelNumber($nr, $date?, $time?)` | Status nach Personalnummer |
| GET | `/v1/attendance` | `getAttendanceAll($date?, $time?)` | Status aller Mitarbeiter |

**Parameter:**

| Parameter | Pflicht | Beschreibung |
|-----------|---------|--------------|
| `date` | | Datum im Format `yyyy-MM-dd` (Default: aktuelles Datum) |
| `time` | | Uhrzeit im Format `HH:mm:ss` (Default: aktuelle Uhrzeit) |
| `login` | ✓* | E-Mail/Login (*nur bei filterByLogin) |
| `personnelNumber` | ✓* | Personalnummer (*nur bei filterByPersonnelNumber) |

**XML-Response (Beispiel):**
```xml
<attendances>
  <date>2015-10-14</date>
  <time>15:45:30</time>
  <employee>
    <firstName>Maxi</firstName>
    <lastName>Musterfau</lastName>
    <login>...</login>
    <personnelNumber>12345</personnelNumber>
    <state>ABSENT</state>
    <plannedState>BUSINESS_DAY</plannedState>
    <absences/>
  </employee>
</attendances>
```

### ✅ V1: Attendances (Anwesenheit – Zeitraum, Plural)

Endpunkt: `/v1/attendances` — Liefert Anwesenheit über einen **Zeitraum** (max. 31 Tage). Response im **XML**-Format.

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/v1/attendances?login=...` | `getAttendancesByLogin($login, $date?, $enddate?, $time?)` | Zeitraum nach Login |
| GET | `/v1/attendances?personnelNumber=...` | `getAttendancesByPersonnelNumber($nr, $date?, $enddate?, $time?)` | Zeitraum nach Personalnummer |
| GET | `/v1/attendances` | `getAttendancesAll($date?, $enddate?)` | Zeitraum für alle |

**Parameter:**

| Parameter | Pflicht | Beschreibung |
|-----------|---------|--------------|
| `date` | | Startdatum `yyyy-MM-dd` |
| `enddate` | | Enddatum `yyyy-MM-dd` (max. 31 Tage Differenz) |
| `time` | | Uhrzeit `HH:mm:ss` (Default: aktuelle Uhrzeit) |
| `login` | ✓* | E-Mail/Login (*nur bei filterByLogin) |
| `personnelNumber` | ✓* | Personalnummer (*nur bei filterByPersonnelNumber) |

**XML-Response (Beispiel):**
```xml
<attendancePeriod>
  <personAttendancePeriod>
    <firstName>Maxi</firstName>
    <lastName>Musterfau</lastName>
    <personnelNumber>12345</personnelNumber>
    <startDate>2015-10-16</startDate>
    <endDate>2015-10-16</endDate>
    <time>12:00:00</time>
    <state>ABSENT</state>
    <attendanceDays>
      <attendanceDay>
        <plannedState>BUSINESS_DAY</plannedState>
        <absences/>
        <date>2015-10-16</date>
      </attendanceDay>
    </attendanceDays>
  </personAttendancePeriod>
</attendancePeriod>
```

### 📈 V1: Performance Period

Endpunkt: `/v1/performancePeriod` — **POST** mit `Content-Type: application/x-www-form-urlencoded`

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| POST | `/v1/performancePeriod?name=...` | `getPerformancePeriodByName($name)` | Leistungsperiode nach Name |

**Parameter:**

| Parameter | Pflicht | Beschreibung |
|-----------|---------|--------------|
| `name` | ✓ | Name der Periode (z.B. `07-2015`) |

### 📝 V1: Time Records

Endpunkt: `/v1/timeRecords` — **POST** mit `Content-Type: application/x-www-form-urlencoded`

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| POST | `/v1/timeRecords?start=...&stop=...` | `getTimeRecords($start, $stop)` | Zeiteinträge abrufen |

**Parameter:**

| Parameter | Pflicht | Beschreibung |
|-----------|---------|--------------|
| `start` | | Startdatum, Format: `dd.MM.yyyy` |
| `stop` | | Enddatum, Format: `dd.MM.yyyy` |

### ⏱️ V1: Working Time

Endpunkt: `/v1/workingTime/{from}-{until}` — Arbeitszeit-Events. Datumsformat im Pfad: **yyyyMMdd** (max. 100 Tage).

| Methode | Endpoint | Service-Methode | Beschreibung |
|---------|----------|-----------------|--------------|
| GET | `/v1/workingTime/{from}-{until}` | `getWorkingTime($from, $until)` | Alle Mitarbeiter |
| GET | `...?costCenter=...` | `getWorkingTimeByCostCenter($from, $until, $costCenter)` | Nach Kostenstelle |
| GET | `...?externalId=...` | `getWorkingTimeByExternalId($from, $until, $extId)` | Nach External ID |
| GET | `...?id=...` | `getWorkingTimeById($from, $until, $id)` | Nach Benutzer-ID |
| GET | `...?login=...` | `getWorkingTimeByLogin($from, $until, $login)` | Nach Login (E-Mail) |
| GET | `...?personnelNumber=...` | `getWorkingTimeByPersonnelNumber($from, $until, $nr)` | Nach Personalnummer |

**Pfad-Parameter:**

| Parameter | Pflicht | Format | Beschreibung |
|-----------|---------|--------|--------------|
| `from` | ✓ | `yyyyMMdd` | Startdatum |
| `until` | ✓ | `yyyyMMdd` | Enddatum (max. 100 Tage nach `from`) |

**Filter-Parameter (Query):**

| Parameter | Beschreibung |
|-----------|--------------|
| `id` | Benutzer-ID |
| `login` | Login-E-Mail |
| `personnelNumber` | Personalnummer |
| `costCenter` | Kostenstelle |
| `externalId` | Externe ID |

---

## Architektur

```
config/askdante.php                      # Konfiguration + Endpoints
app/Services/AskDanteApiService.php      # Service-Klasse
app/Providers/AskDanteServiceProvider.php # Singleton-Registration
```

### Request-Flow

```
Controller/Job → AskDanteApiService → HTTP (?apiAuthenticationToken=...) → askDANTE REST API
                       ↓
                 config('askdante.endpoints.*')
                       ↓
                 buildEndpoint() → Placeholder-Ersetzung
                       ↓
                 makeRequest() → Log + Retry (3×, nur bei 5xx)
```

### Fehlerbehandlung

- **5xx Fehler:** Automatischer Retry (3 Versuche, 500ms Pause)
- **4xx Fehler:** Werden geloggt, Response wird zurückgegeben
- **Logging:** Alle Requests über `Log::debug`, Fehler über `Log::error`

---

## Vergleich mit anderen Integrationen

| Aspekt | Phorest | GoCardless | askDANTE |
|--------|---------|------------|----------|
| **Zweck** | Terminbuchung | Lastschriften | Personal |
| **Auth** | Basic Auth | Bearer Token | Query-Param (`apiAuthenticationToken`) |
| **Base URL** | `api-gateway-eu.phorest.com` | `api.gocardless.com` | `my.askdante.com/rest/api` |
| **Config** | `config/phorest.php` | `config/gocardless.php` | `config/askdante.php` |
| **Service** | `PhorestApiService` | `GoCardlessApiService` | `AskDanteApiService` |
