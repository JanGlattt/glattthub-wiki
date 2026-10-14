# Hub-Nutzer verwalten (Admin)

Die Verwaltung der Hub-Konten unter **Admin → System → Hub-Nutzer** (`/admin/users`) wurde am
13.10.2026 neu aufgebaut (Entscheidung Jan: Entwurf 1 „Steckbrief und Reiter“, dazu der Reiter
„Aufräumen“ aus Entwurf 3; Entwürfe:
[claude.ai/artifact/475c89cTwfLk3oxFW8u9i1](https://claude.ai/artifact/475c89cTwfLk3oxFW8u9i1)).
Kern sind neue Schutzregeln: **Es gibt immer mindestens eine aktive Person mit Super-Admin**, und
niemand vergibt Rollen oder ändert Konten über die eigene Rechte-Stufe hinaus.

!!! nutzerhandbuch "Bedienung: Admin 1 – Benutzer und Rollen"
    [hilfe.hub.glattt.com/admin/1/](https://hilfe.hub.glattt.com/admin/1/) — Liste, Aufräumen, ein Konto bearbeiten,
    Zugangsdaten, Ansehen als, Archivieren.

---

## Für Anwender — Überblick

- **Liste:** Kennzahlen-Leiste (aktiv, zum Aufräumen, ohne Verknüpfung, Austritt nicht archiviert,
  Archivierung geplant), Reiter *Aktiv · Aufräumen · Archivierung geplant · Archiviert*, je Person
  Rollen, Institute, letzte Anmeldung, Zugang (ab 1536 px) und Verknüpfungen. Zeilen ab 1280 px,
  darunter eine Karte je Person.
- **Aufräumen:** alle Konten mit Befund (Austritt nicht archiviert, askDANTE/Phorest fehlt,
  Bonus-Klasse fehlt, nie angemeldet) samt passender Aktion.
- **Einzelseite:** Steckbrief, Hinweisband, Reiter *Profil, Zugang, Institute & Rollen,
  Verknüpfungen, Bonus, Trinkgeld, Geräte, Verlauf*.
- **Aktionen:** Zugangsdaten senden, Einladung, Ansehen als (nur Super-Admin), Archivieren,
  Auf allen Geräten abmelden, Endgültig löschen (nur archivierte Konten, Name eintippen).
- **Rechte als CSV** für die Rechte-Prüfung.
- **Bereich und Position (seit 14.10.2026):** Wer keinem Stamm-Institut angehört (Büro,
  Management …), bekommt unter *Institute & Rollen* einen **Bereich** mit **Kürzel** (bis 4 Zeichen) —
  das Kürzel steht dann überall, wo sonst das Institutskürzel steht, als graues Badge. Die
  **Position** (Leitung, Finance, glattt Spezialistin …) im Reiter *Profil* gilt für alle und erscheint
  im Chat, in der Personalübersicht, auf den Team-Karten der Institute und unten links unter dem
  Namen. Beides Freitext mit Vorschlägen aus den schon vergebenen Einträgen; die Liste sucht und
  filtert danach.

---

## Für Entwickler

### Schutzregeln — `App\Services\Users\HubUserGuard`

| Regel | Methode | Greift in |
|---|---|---|
| Mindestens eine **aktive** Super-Admin (ohne `archived_from`) | `isLastSuperAdmin()`, `roleChangeError()`, `archiveError()`, `deleteError()` | EditUser, Aktionen, Massenaktionen |
| Rollen nur bis zur eigenen Stufe (alle Rechte der Rolle selbst haben; Super-Admin-Rolle nur als Super-Admin) | `assignableRoleIds()`, `roleChangeError()` | Formular (ausgegraut), EditUser, `UserProvisioningService::create()`/`options()` (Konto-Assistent der Personalübersicht) |
| Konten mit mehr Rechten nicht bearbeiten | `canManage()`, `manageError()` | `UserPolicy::update/delete`, Aktionen, Zugang-Karte (`UserAccessController`, 403) |
| Ansehen als | `impersonationError()` | nur mit `impersonate_users`, nie Super-Admins, Archivierte, Dienstkonten |

**Welche Rolle Super-Admin ist**, sagt die Spalte `roles.is_super_admin` (Migration
`2026_10_13_200000`, setzt sie für „Super-Admin“) — kein Rollenname im Code
(`RoleNameFreeAuthorizationTest`). Die Rolle ist nicht löschbar und nur von Super-Admins
änderbar (`RolePolicy`); `deleteAny` ist für Rollen und Nutzer aus (kein Massen-Löschen).

### Rollen und Institute speichern

`role_ids` und `branch_access` sind virtuelle Felder (`dehydrated(false)`). `EditUser::
mutateFormDataBeforeSave()` prüft den Rollenwechsel und wirft bei Verstoß eine
`ValidationException` auf `data.role_ids`; `afterSave()` synchronisiert und schreibt den Verlauf.
„Alle Institute“ speichert `allowed_branch_ids = []`. Bonus-Klassen werden nur noch **geändert,
wo sie sich unterscheiden** (vorher Komplett-Ersatz, der `created_by_user_id` überschrieb).
`CreateUser` legt über `UserProvisioningService::create()` an (PIN-Eindeutigkeit, Rollen-Grenzen,
E-Mail optional).

### Bereich und Position — `App\Support\UserOrgUnit`

Spalten `users.department` (60), `department_short` (4), `position` (80), Migration
`2026_10_14_230000`. **Eine Regel an einer Stelle:** `UserOrgUnit::department()` liefert den Bereich
nur ohne Stamm-Institut (`home_branch_id` leer oder `all`), `departmentShort()` das eigene Kürzel
in Großbuchstaben bzw. die ersten drei Buchstaben, `position()` die Position. `suggestions()` liefert
die Vorschläge für Admin (`->datalist()`), Web-Assistent (`options.org`) und App-Assistent (Bereiche
mit ihrem häufigsten Kürzel, Schreibweisen zusammengefasst). Ausgabe im Chat über
`ChatPresenter::user()`: ohne Institut tragen `branch_name`/`branch_short` den Bereich und
`branch_color` ist `null` (Badge grau), dazu `department` und `position`. Das Bereichsfeld ist im
Formular nur sichtbar, solange kein Stamm-Institut gewählt ist (`home_branch_id` ist `live()`);
ausgeblendet wird es nicht gespeichert, der alte Wert bleibt stehen und zählt erst wieder ohne Institut.

### Letzte Anmeldung

`users.last_login_at` / `last_login_via` (`web`, `ios`, `desktop`) — Listener
`App\Listeners\RecordUserLogin` auf `Illuminate\Auth\Events\Login`, per Query (kein Observer, kein
`updated_at`). Beim Ansehen-als nicht geschrieben. Vorbelegt aus `sessions.last_activity`; der
Befund „nie angemeldet“ gilt erst für Konten ab `HubUserHealthService::LOGIN_TRACKING_SINCE`
(13.10.2026), sonst stünden alle Altkonten darin.

### Verlauf — `user_change_logs`

`UserChangeObserver` schreibt Änderungen der Felder aus `UserChangeRecorder::TRACKED`
(PIN/Passwort nur als „geändert“, nie mit Wert); Rollen, Bonus-Klassen, Einladungen, Abmelden und
Ansehen-als melden die Aktionen selbst. `UserChangeRecorder::timeline()` mischt die Zustellungen
der Zugang-Karte (`user_access_dispatches`) dazu.

### Aufräumen — `HubUserHealthService`

Befunde (`UserFinding`: Typ, `warning`/`info`, Text, Vorschlag): `exit`, `no_askdante`,
`no_phorest` (nur behandelnde Bonus-Klassen), `no_bonus_class`, `never_logged_in`, `inactive`
(info), `redundant_roles` (info), `only_super_admin` (info). Dienstkonten (`@system.glattt.com`,
`User::isSystemAccount()`) und archivierte Konten sind ausgenommen. Der Reiter „Aufräumen“ zeigt
Konten mit mindestens einer Warnung.

### Ansehen als — `ImpersonationService`

Recht `impersonate_users` (Migration `2026_10_13_200300`, nur Rollen mit `is_super_admin`).
Sitzungsschlüssel `impersonator_id`, gesetzt **vor** dem Login (der Login-Listener erkennt daran
das Ansehen). Rückweg: `POST /impersonation/leave` (nur `auth`) über die goldene Leiste
`partials/impersonation-banner` — im Hub-, Vollbild- und App-Layout sowie im Admin (`BODY_START`).
Schreibende Aktionen sind dabei bewusst möglich (Entscheidung Jan).

### Abmelden überall — `UserSignOutService`

Löscht Zeilen der Sitzungstabelle, widerruft alle App-Geräte über `AppDeviceService::revoke()`
und erneuert `remember_token`. Push-Abos bleiben.

### Oberfläche

`app/Filament/Resources/Users/` — `Schemas/UserForm.php` (Reiter mit festen Schlüsseln, Link per
`?reiter=zugang`), `Tables/UsersTable.php` (Split ab `md`, Massenaktionen), `Actions/UserActions.php`
(gemeinsam für Liste und Kopf), `Pages/ListUsers.php` (Reiter, Parameter `?tab=aufraeumen`, CSV),
`Widgets/HubUserKpis.php`, Views unter `resources/views/filament/users/`, Stile im Theme-Abschnitt
„ADMIN „HUB-NUTZER““. `ViewUser` ist die Nur-Lesen-Ansicht für Konten, die man nicht bearbeiten darf.

### Fallstricke

- Filament-Reiter bilden ihren Schlüssel aus der Beschriftung (`institute-rollen::data::tab`) —
  für Links feste `->key()` setzen.
- Der Listen-Reiter steht in `?tab=`, nicht `?activeTab=`; Widgets sind standardmäßig lazy und
  sehen die Adresse dann nicht (`$isLazy = false`).
- Im Spalten-Layout gibt es kein Zebra und keine `fi-ta-row` — Zeilen heißen `fi-ta-record`.
- Badges brechen nicht um: lange Befundtexte als Liste ohne `badge()`.
- Im Spalten-Layout sind die Spalten so breit wie ihr Inhalt — jede Zeile beginnt woanders.
  Feste Breiten setzt das Theme über Marker-Klassen (`hub-users-col-*`) und `:has()` an der Hülle,
  weil Filament den Hüllen keine eigene Klasse gibt. Die Media-Query **muss** zum Breakpoint des
  Splits passen (`from('xl')` ↔ `min-width: 1280px`): Darunter stapelt Filament die Spalten, und
  `flex-basis` wirkt dann als Höhe (Namen zerfielen in einzelne Buchstaben).

Tests: `tests/Feature/HubUserAdminTest.php`. Verwandt: [Benutzer archivieren](USER-ARCHIVIERUNG.md),
[Benutzer-Einladungen](USER-INVITATION-SYSTEM.md), [Admin-Backend](ADMIN-BACKEND.md).

### Performance

Die Liste fragt für jede Zeile und jede Aktion die Schutzregeln ab (Sichtbarkeit, Zeilen-Link).
Ungemerkt waren das **709 Abfragen bei 16 Konten** (Prod spürbar langsam, 13.10.2026). Deshalb:
`HubUserGuard` ist im Container `scoped` und merkt sich Super-Admin-Rollen, aktive Super-Admins,
Rechte und Zuweisbarkeit je Anfrage (`forget()` nach Änderungen — passiert automatisch über den
`UserChangeObserver` und beim Rollen-Verlauf); die Tabelle lädt `roles.permissions` und
`permissions` vorab, der Aufräumen-Check `hrEmployee.employmentPeriods`; Zähler laufen einmal
(`ListUsers::counts()`). Ergebnis: 31 Abfragen, unabhängig von der Kontenzahl —
`test_liste_fragt_nicht_je_person_neu_ab` wacht.

**Ladeanzeige im ganzen Admin** (`filament.partials.loading-indicator`, Hook `BODY_END`): Balken
oben und gedimmte Tabelle, solange eine ausgelöste Livewire-Anfrage läuft (ab 120 ms; Polling mit
`$refresh` zählt nicht).

## Changelog

- **14.10.2026 (nachts)** — Bereich mit Kürzel (ohne Stamm-Institut) und Position für alle;
  Anlegen in Admin, Web- und App-Assistent; Anzeige in Chat, Personal, Team, Profil.

- **13.10.2026 (abends)** — Liste 709 → 31 Abfragen, Ladeanzeige im Admin.

- **13.10.2026** — Neuaufbau: Schutzregeln, Steckbrief und Reiter, Aufräumen, Verlauf, letzte
  Anmeldung, Ansehen als, Löschen nur archivierter Konten, Massenaktionen, Rechte-CSV.
