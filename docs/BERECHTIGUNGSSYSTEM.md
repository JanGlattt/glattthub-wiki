# Berechtigungssystem

## Uebersicht

Das Berechtigungssystem steuert den Zugriff auf alle Bereiche des glatttHub. Es basiert auf **Spatie Laravel Permission v6** und implementiert rollenbasierte Zugriffskontrolle (RBAC) auf vier Ebenen:

1. **Navigation** -- Menue-Eintraege werden nur angezeigt, wenn der Benutzer die passende Berechtigung hat
2. **Routen** -- Jede URL ist mit Middleware geschuetzt und gibt bei fehlendem Zugriff eine 403-Seite zurueck
3. **Seiten-Elemente** -- Action-Buttons (Erstellen, Bearbeiten, Loeschen) werden per `@can`-Direktive ein-/ausgeblendet
4. **Admin-Panel** -- Filament-Ressourcen und -Seiten pruefen Berechtigungen ueber Policies und `canAccess()`

### Zahlen

| Kennzahl | Wert |
|----------|------|
| Permissions gesamt | 106 |
| Permission-Gruppen | 20 |
| Rollen (Standard) | 4 |
| Geschuetzte Routen | 139 |
| Verschiedene Route-Permissions | 48 |

---

## Fuer Endanwender

### Rollen

Jedem Benutzer wird eine oder mehrere Rollen zugewiesen. Die Rolle bestimmt, was der Benutzer im glatttHub sehen und tun kann.

| Rolle | Beschreibung | Berechtigungen |
|-------|-------------|----------------|
| **super_admin** | Vollzugriff auf alles | Alle 106 |
| **admin** | Hub + Admin-Panel, ohne Rollenverwaltung | 95 |
| **user** | Basis-Hub-Zugang (Termine, Kunden, Personal ansehen) | 13 |
| **finance** | Spezialisierte Finanz-Berechtigungen | 8 |

### Was passiert bei fehlender Berechtigung?

- **Navigation**: Menue-Punkte ohne Berechtigung werden nicht angezeigt
- **Seiten-Elemente**: Buttons wie "Neuer Gutschein" oder "Bearbeiten" sind nicht sichtbar
- **Direkte URL-Eingabe**: Es erscheint eine 403-Fehlerseite ("Zugriff verweigert")

### Rollen bearbeiten (nur fuer Administratoren)

1. Im Admin-Panel unter **Rollen** die gewuenschte Rolle oeffnen
2. Im Bereich **Berechtigungen** sind alle Permissions in aufklappbaren Gruppen organisiert (z.B. "Termine", "Kunden", "Berichte")
3. Gruppe aufklappen, gewuenschte Checkboxen setzen oder entfernen
4. Mit "Alle auswaehlen" koennen alle Permissions einer Gruppe auf einmal aktiviert werden
5. Speichern

---

## Fuer Entwickler

### Technischer Stack

- **Paket**: [spatie/laravel-permission](https://spatie.be/docs/laravel-permission) v6.21
- **Guard**: `web` (einziger Guard)
- **Gate::before**: In `AppServiceProvider` -- `super_admin` umgeht alle Permission-Checks
- **Middleware**: `can:permission_name` auf Routen (Laravel-Alias fuer `Illuminate\Auth\Middleware\Authorize`)
- **Blade-Direktive**: `@can('permission_name')` / `@endcan`
- **Frontend-Helper**: `window.userPermissions` (JSON-Array in jedem Layout)

### Architektur

```
Benutzer-Request
    |
    v
[Route-Middleware: can:view_appointments]
    |
    v
[Blade-Layout: @can in Sidebar/Bottom-Nav]
    |
    v
[Blade-View: @can fuer Action-Buttons]
    |
    v
[Filament: Policy + canAccess()]
```

### Dateien und Verzeichnisse

| Datei | Zweck |
|-------|-------|
| `database/migrations/2026_03_29_153517_add_granular_hub_permissions.php` | Migration: Erstellt alle Permissions |
| `database/seeders/PermissionSeeder.php` | Seeder: 106 Permissions + 4 Rollen-Zuweisungen |
| `scripts/production-permissions-2026-03-29.sql` | Idempotentes SQL fuer Produktiv-Deployment |
| `app/Providers/AppServiceProvider.php` | Gate::before fuer super_admin-Bypass |
| `resources/views/layouts/partials/sidebar.blade.php` | Navigation mit @can-Direktiven |
| `resources/views/layouts/partials/bottom-nav.blade.php` | Mobile Navigation mit @can-Direktiven |
| `resources/views/layouts/partials/permissions-meta.blade.php` | Frontend-Helper (window.userPermissions) |
| `routes/web.php` | Alle Routen mit can:-Middleware |
| `app/Filament/Resources/Roles/Schemas/RoleForm.php` | Gruppiertes Permission-Formular |
| `app/Filament/Resources/Roles/Pages/EditRole.php` | Permission-Hydration und -Sync beim Bearbeiten |
| `app/Filament/Resources/Roles/Pages/CreateRole.php` | Permission-Sync beim Erstellen |

### Policies

| Policy | Schuetzt | Permissions |
|--------|----------|-------------|
| `NewsPolicy` | Filament: Nachrichten | manage_news |
| `NotificationPolicy` | Filament: Benachrichtigungen | manage_notifications_admin |
| `ConsultationServicePolicy` | Filament: Beratungsdienstleistungen | manage_consultation_services |
| `BodyZonePolicy` | Filament: Koerperzonen | manage_body_zones |
| `AbsenceTypePolicy` | Filament: Abwesenheitstypen | manage_absence_types |
| `PhorestStaffPolicy` | Filament: Phorest-Personal | manage_phorest_staff |

Filament-Seiten mit `canAccess()`:

- `PdfSettings` -- `manage_pdf_settings`
- `EmailSettings` -- `manage_email_settings`
- `ManageStaff` -- `manage_phorest_staff`

---

### Permission-Gruppen (vollstaendige Liste)

Die 106 Permissions sind in 20 Gruppen organisiert. Die Gruppen-Definition befindet sich in `RoleForm::permissionGroups()` und wird sowohl fuer das Admin-Formular als auch als zentrale Referenz verwendet.

#### Systemzugriff (2)

| Permission | Beschreibung |
|------------|-------------|
| `access_hub` | Zugriff auf den glatttHub |
| `access_admin` | Zugriff auf das Admin-Backend (Filament) |

#### Dashboard (2)

| Permission | Beschreibung |
|------------|-------------|
| `view_dashboard` | Startseite sehen |
| `configure_dashboard` | KPIs und Charts konfigurieren |

#### Termine (6)

| Permission | Beschreibung |
|------------|-------------|
| `view_appointments` | Terminuebersicht sehen |
| `view_appointment_detail` | Termin-Detailansicht oeffnen |
| `checkin_appointments` | Kunden einchecken |
| `manage_appointment_notes` | Terminnotizen bearbeiten |
| `manage_treatment_settings` | Behandlungseinstellungen verwalten |
| `manage_treatment_photos` | Behandlungsfotos hoch-/runterladen |

#### Kunden (4)

| Permission | Beschreibung |
|------------|-------------|
| `view_clients` | Kundenliste sehen |
| `view_client_detail` | Kundendetail oeffnen |
| `edit_clients` | Kunden bearbeiten |
| `create_clients` | Kunden anlegen |

#### Personal (9)

| Permission | Beschreibung |
|------------|-------------|
| `view_staff` | Personalliste sehen |
| `view_any_staff` | Alle Mitarbeiter auflisten (Admin) |
| `view_staff_overview` | Personal-Uebersicht sehen |
| `view_staff_detail` | Personal-Detailansicht |
| `edit_staff` | Personal bearbeiten |
| `create_staff` | Personal anlegen |
| `delete_staff` | Personal loeschen |
| `sync_staff` | Personal mit Phorest synchronisieren |
| `manage_nisv` | NiSV-Zertifikate verwalten |

#### Reisekosten (2)

| Permission | Beschreibung |
|------------|-------------|
| `manage_own_reisekosten` | Eigene Reisekosten verwalten |
| `approve_reisekosten` | Reisekosten freigeben (Vorgesetzte) |

#### Beratungen (4)

| Permission | Beschreibung |
|------------|-------------|
| `view_consultations` | Beratungen ansehen |
| `create_consultations` | Beratungen erstellen |
| `edit_consultations` | Beratungen bearbeiten |
| `delete_consultations` | Beratungen loeschen |

#### Services (3)

| Permission | Beschreibung |
|------------|-------------|
| `view_services` | Services sehen |
| `edit_services` | Services bearbeiten |
| `sync_services` | Services mit Phorest synchronisieren |

#### Berichte (8)

| Permission | Beschreibung |
|------------|-------------|
| `view_reports` | Berichte-Uebersicht sehen |
| `view_report_upcoming_consultations` | Bericht: Zukuenftige Beratungen |
| `view_report_past_consultations` | Bericht: Vergangene Beratungen |
| `view_report_rescheduled_cancelled` | Bericht: Storniert und Umgebucht |
| `view_report_appointments_body_zones` | Bericht: Terminstatistik |
| `view_report_client_courses` | Bericht: glattt-Pakete |
| `view_report_client_statistics` | Bericht: Kundenstatistiken |
| `trigger_data_sync` | Daten-Sync ausloesen (Admin-Aktion) |

#### Gutscheine (3)

| Permission | Beschreibung |
|------------|-------------|
| `view_vouchers` | Gutscheine sehen |
| `create_vouchers` | Gutscheine erstellen |
| `edit_vouchers` | Gutscheine bearbeiten |

#### Vertraege (5)

| Permission | Beschreibung |
|------------|-------------|
| `view_contracts` | Vertraege sehen |
| `create_contracts` | Vertraege erstellen |
| `edit_contracts` | Vertraege bearbeiten |
| `manage_contract_cancellations` | Vertragskuendigungen verwalten |
| `manage_gocardless` | GoCardless-Mandate verwalten |

#### Preislisten (4)

| Permission | Beschreibung |
|------------|-------------|
| `view_price_lists` | Preislisten sehen |
| `create_price_lists` | Preislisten erstellen |
| `edit_price_lists` | Preislisten bearbeiten |
| `delete_price_lists` | Preislisten loeschen |

#### Widerrufe (3)

| Permission | Beschreibung |
|------------|-------------|
| `view_cancellations` | Widerrufe sehen |
| `create_cancellations` | Widerrufe erstellen |
| `edit_cancellations` | Widerrufe bearbeiten |

#### Institute (4)

| Permission | Beschreibung |
|------------|-------------|
| `view_branches` | Institute sehen |
| `edit_branches` | Institute bearbeiten |
| `sync_branches` | Institute mit Phorest synchronisieren |
| `manage_branch_images` | Institut-Bilder verwalten |

#### Laser und Komponenten (8)

| Permission | Beschreibung |
|------------|-------------|
| `view_lasers` | Laser sehen |
| `create_lasers` | Laser erstellen |
| `edit_lasers` | Laser bearbeiten |
| `manage_laser_maintenance` | Laser-Wartung verwalten |
| `view_laser_components` | Komponenten sehen |
| `create_laser_components` | Komponenten erstellen |
| `edit_laser_components` | Komponenten bearbeiten |
| `manage_component_repairs` | Reparaturen verwalten |

#### Formulare (8)

| Permission | Beschreibung |
|------------|-------------|
| `view_forms` | Formulare sehen |
| `create_forms` | Formulare erstellen (Editor) |
| `edit_forms` | Formulare bearbeiten |
| `delete_forms` | Formulare loeschen |
| `fill_forms` | Formulare ausfuellen |
| `view_form_submissions` | Einreichungen ansehen |
| `use_advanced_form_fields` | Erweiterte Felder (Koerperzonen, Vertragspreis, Upload, Signatur) |
| `use_sepa_form_fields` | SEPA-Felder (IBAN, BIC, Kontoinhaber) |

#### Einstellungen (3)

| Permission | Beschreibung |
|------------|-------------|
| `view_settings` | Einstellungen sehen |
| `edit_settings` | Einstellungen bearbeiten |
| `manage_cache` | Cache verwalten |

#### Benutzer und Rollen (10)

| Permission | Beschreibung |
|------------|-------------|
| `view_users` | Benutzer sehen |
| `view_any_users` | Alle Benutzer auflisten (Admin) |
| `create_users` | Benutzer erstellen |
| `edit_users` | Benutzer bearbeiten |
| `delete_users` | Benutzer loeschen |
| `view_roles` | Rollen sehen |
| `view_any_roles` | Alle Rollen auflisten (Admin) |
| `create_roles` | Rollen erstellen |
| `edit_roles` | Rollen bearbeiten |
| `delete_roles` | Rollen loeschen |

#### Admin-Panel (8)

| Permission | Beschreibung |
|------------|-------------|
| `manage_news` | Nachrichten verwalten |
| `manage_body_zones` | Koerperzonen verwalten |
| `manage_consultation_services` | Beratungsdienstleistungen verwalten |
| `manage_absence_types` | Abwesenheitstypen verwalten |
| `manage_phorest_staff` | Phorest-Personal verwalten |
| `manage_pdf_settings` | PDF-Einstellungen verwalten |
| `manage_email_settings` | E-Mail-Einstellungen verwalten |
| `manage_notifications_admin` | Benachrichtigungen verwalten |

#### Push-Benachrichtigungen (10)

| Permission | Beschreibung |
|------------|-------------|
| `view_push_campaigns` | Push-Kampagnen ansehen |
| `create_push_campaigns` | Push-Kampagnen erstellen |
| `edit_push_campaigns` | Push-Kampagnen bearbeiten |
| `delete_push_campaigns` | Push-Kampagnen loeschen |
| `view_push_subscriptions` | Push-Geraete ansehen |
| `manage_push_subscriptions` | Push-Geraete verwalten |
| `view_push_types` | Push-Typen ansehen |
| `edit_push_types` | Push-Typen bearbeiten |
| `view_push_statistics` | Push-Statistiken ansehen |
| `send_test_push` | Test-Push senden |

---

### Navigationselemente und ihre Permissions

#### Sidebar (Desktop)

| Menue-Eintrag | Permission |
|---------------|-----------|
| Start | `view_dashboard` |
| Termine | `view_appointments` |
| Kunden | `view_clients` |
| Personal | `view_staff` |
| Berichte | `view_reports` |
| Gutscheine | `view_vouchers` |
| Vertraege | `view_contracts` |
| Institute | `view_branches` |
| Laser | `view_lasers` |
| Formulare | `view_forms` |
| Einstellungen | `view_settings` |

#### Bottom-Nav (Mobil)

| Menue-Eintrag | Permission |
|---------------|-----------|
| Start | `view_dashboard` |
| Termine | `view_appointments` |
| Personal | `view_staff` |
| Berichte | `view_reports` |
| Einstellungen | `view_settings` |

---

### Seiten-Level Feature-Gating

Auf den einzelnen Seiten werden Action-Buttons und Bereiche mit `@can`-Direktiven geschuetzt:

| Seite | Element | Permission |
|-------|---------|-----------|
| Dashboard | "Anpassen"-Button, Konfigurationsleiste | `configure_dashboard` |
| Berichte | Jede Berichtskarte einzeln | `view_report_*` (6 verschiedene) |
| Gutscheine | "Neuer Gutschein"-Button | `create_vouchers` |
| Gutscheine | Guthaben-Bearbeitung | `edit_vouchers` |
| Preislisten | "Neue Preisliste"-Button | `create_price_lists` |
| Preislisten | Bearbeiten/Duplizieren/Toggle | `edit_price_lists` |
| Preislisten | Loeschen-Button | `delete_price_lists` |
| Formulare | "Neues Formular"-Button | `create_forms` |
| Formulare | Bearbeiten-Button | `edit_forms` |
| Formulare | Loeschen-Option | `delete_forms` |
| Laser | "Neuen Laser erfassen"-Button | `create_lasers` |
| Laser (Detail) | "Wartung eintragen"-Button | `manage_laser_maintenance` |
| Laser (Detail) | Standort-Bearbeitung | `edit_lasers` |
| Komponenten | Bearbeiten-Toggle im Modal | `edit_laser_components` |
| Institute (Info) | Standort-Icon und Bild-Upload | `manage_branch_images` |
| Kundenstatistik | Sync-Setup-Bereich | `trigger_data_sync` |
| Widerrufe | "Neuer Widerruf"-Button | `create_cancellations` |

---

### Rollen-Verwaltung im Admin-Panel

Die Rollen-Bearbeitung im Filament-Admin-Panel verwendet ein gruppiertes Layout mit aufklappbaren Sektionen.

#### Aufbau des Formulars

Das Formular besteht aus drei Bereichen:

1. **Rollen-Informationen** -- Rollenname (eindeutig) und Guard
2. **Standard-Rolle** -- Toggle, ob neue Benutzer diese Rolle automatisch bekommen
3. **Berechtigungen** -- 20 aufklappbare Gruppen mit je einem CheckboxList

#### Technische Umsetzung

Die Permission-Verwaltung verwendet **keine** Filament `->relationship()` auf dem CheckboxList, sondern manuelle Hydration und Synchronisation:

**Warum:** Ein einzelner CheckboxList mit 106 Eintraegen ist unuebersichtlich. Stattdessen wird pro Permission-Gruppe eine eigene aufklappbare Section mit eigenem CheckboxList erzeugt.

**Datenfluss beim Bearbeiten:**

```
1. mutateFormDataBeforeFill()
   - Liest bestehende Permissions der Rolle
   - Verteilt sie auf perm_system, perm_dashboard, perm_termine, ...

2. Formular-Anzeige
   - 20 aufklappbare Sections, jeweils mit CheckboxList
   - bulkToggleable pro Gruppe ("Alle auswaehlen")

3. mutateFormDataBeforeSave()
   - Sammelt alle perm_*-Felder zusammen
   - Entfernt perm_*-Keys aus $data (nicht in DB speichern)

4. afterSave()
   - $role->syncPermissions($permissionsToSync)
```

**Relevante Dateien:**

- `app/Filament/Resources/Roles/Schemas/RoleForm.php` -- Gruppen-Definition und Section-Builder
- `app/Filament/Resources/Roles/Pages/EditRole.php` -- Hydration (beforeFill) + Sync (afterSave)
- `app/Filament/Resources/Roles/Pages/CreateRole.php` -- Sync (afterCreate)

#### Neue Gruppe hinzufuegen

1. In `RoleForm::permissionGroups()` einen neuen Eintrag ergaenzen:

```php
'neue_gruppe' => [
    'label' => 'Gruppenname',
    'description' => 'Kurzbeschreibung',
    'permissions' => [
        'permission_name' => 'Deutsche Beschreibung',
    ],
],
```

2. Die Permission muss in der Datenbank existieren (ueber Migration oder Seeder erstellen)
3. `buildPermissionSections()` erzeugt die Section automatisch

---

### Neue Permission hinzufuegen (Schritt fuer Schritt)

1. **Migration erstellen**: Permission in der Datenbank anlegen

    ```php
    Permission::firstOrCreate(['name' => 'neue_permission', 'guard_name' => 'web']);
    ```

2. **Seeder aktualisieren**: In `PermissionSeeder.php` die Permission und Rollenzuweisung ergaenzen

3. **RoleForm aktualisieren**: Permission der passenden Gruppe in `permissionGroups()` hinzufuegen

4. **Route schuetzen**: In `routes/web.php` Middleware ergaenzen

    ```php
    Route::get('/hub/neue-seite', [Controller::class, 'index'])
        ->middleware('can:neue_permission')
        ->name('hub.neue-seite');
    ```

5. **Navigation schuetzen**: In Sidebar/Bottom-Nav `@can`-Direktive ergaenzen

    ```blade
    @can('neue_permission')
        <a href="{{ route('hub.neue-seite') }}">Neuer Eintrag</a>
    @endcan
    ```

6. **Blade-Elemente schuetzen**: Action-Buttons mit `@can` wrappen

    ```blade
    @can('create_something')
        <button>Neu erstellen</button>
    @endcan
    ```

7. **Produktions-SQL erstellen**: Fuer das Deployment ein idempotentes SQL-Statement vorbereiten

    ```sql
    INSERT IGNORE INTO permissions (name, guard_name, created_at, updated_at)
    VALUES ('neue_permission', 'web', NOW(), NOW());
    ```

---

### super_admin-Bypass

In `AppServiceProvider::boot()` ist ein `Gate::before` registriert:

```php
Gate::before(function ($user, $ability) {
    return $user->hasRole('super_admin') ? true : null;
});
```

Das bedeutet: Benutzer mit der Rolle `super_admin` bestehen **jeden** Permission-Check automatisch, unabhaengig davon, ob die Permission explizit zugewiesen ist. Das gilt fuer:

- `@can`-Direktiven in Blade
- `can:`-Middleware auf Routen
- `$user->can()` in PHP
- Policy-Checks in Filament

!!! warning "Wichtig"
    Der super_admin-Bypass wird nicht durch `$user->hasPermissionTo()` ausgeloest. Dieser Spatie-Methode prueft nur die direkte Zuweisung. Fuer konsistentes Verhalten immer `$user->can()` oder `@can` verwenden.

---

### Frontend-Permission-Helper

In jedem Layout wird `resources/views/layouts/partials/permissions-meta.blade.php` eingebunden. Dieses Partial setzt ein JavaScript-Array:

```javascript
window.userPermissions = ["access_hub", "view_dashboard", ...];
```

Damit kann Alpine.js oder beliebiges JavaScript clientseitig auf Permissions pruefen:

```javascript
if (window.userPermissions.includes('edit_clients')) {
    // Element anzeigen
}
```

!!! note "Hinweis"
    Die clientseitige Pruefung ist nur fuer UX-Zwecke (Buttons ein-/ausblenden). Die tatsaechliche Autorisierung erfolgt immer serverseitig ueber Middleware und Policies.

---

### Produktions-Deployment

Das SQL-Script `scripts/production-permissions-2026-03-29.sql` ist idempotent und kann sicher mehrfach ausgefuehrt werden:

1. `INSERT IGNORE` fuer neue Permissions (ueberspringt bestehende)
2. `DELETE + INSERT` fuer die Rollen super_admin, admin und user
3. Die Rolle finance wird nicht veraendert
4. Abschliessende Verifikation per `SELECT`

```bash
mysql -u USER -p DATENBANK < scripts/production-permissions-2026-03-29.sql
```

!!! danger "Vor dem Ausfuehren"
    Immer zuerst ein Backup der `permissions`, `roles`, `role_has_permissions` und `model_has_roles` Tabellen erstellen.

---

## Standort-Beschraenkung (Erlaubte Institute)

Neben dem rollenbasierten Berechtigungssystem gibt es eine separate **Standort-Beschraenkung** pro User. Damit laesst sich festlegen, welche Phorest-Branches ein Benutzer in der Sidebar sehen und auswaehlen kann.

### Fuer Endanwender

- **Keine Einschraenkung (Standard):** Der User sieht alle Institute in der Sidebar, inklusive der Option "Alle Standorte".
- **Mit Einschraenkung:** Der User sieht nur die ihm zugewiesenen Institute. Die Option "Alle Standorte" ist ausgeblendet.
- **Stamm-Institut:** Das vorausgewaehlte Institut beim Oeffnen der App. Muss aus den erlaubten Instituten stammen.
- Beim ersten Laden wird automatisch das Stamm-Institut oder das erste erlaubte Institut ausgewaehlt, falls der User vorher "Alle Standorte" aktiv hatte.

### Konfiguration im Admin-Panel

Im Filament Admin-Panel unter **Benutzer bearbeiten** gibt es die Sektion **"Erlaubte Institute"**:

1. Aufklappbare Sektion mit Checkbox-Liste aller verfuegbaren Branches (aus Phorest API)
2. Keine Auswahl = keine Einschraenkung (alle Branches sichtbar)
3. Eine oder mehrere Branches auswaehlen = User sieht nur diese in der Sidebar
4. Das **Stamm-Institut** Dropdown passt sich automatisch an: es zeigt nur die erlaubten Institute
5. Wird ein Branch aus den erlaubten Instituten entfernt, wird das Stamm-Institut automatisch zurueckgesetzt

### Fuer Entwickler

#### Datenmodell

Die Spalte `allowed_branch_ids` auf der `users`-Tabelle:

```sql
ALTER TABLE users ADD COLUMN allowed_branch_ids JSON NULL AFTER home_branch_id;
```

- **Typ:** JSON (Array von Branch-IDs als Strings)
- **Null / leeres Array:** Keine Einschraenkung — User sieht alle Branches
- **Gefuelltes Array:** Nur diese Branches sind sichtbar

Im Model (`app/Models/User.php`):

```php
protected $fillable = [
    // ...
    'allowed_branch_ids',
];

protected function casts(): array
{
    return [
        // ...
        'allowed_branch_ids' => 'array',
    ];
}
```

#### Beteiligte Dateien

| Datei | Zweck |
|-------|-------|
| `database/migrations/2026_03_29_221505_add_allowed_branch_ids_to_users_table.php` | Migration |
| `app/Models/User.php` | Fillable + Cast |
| `app/Filament/Resources/Users/Schemas/UserForm.php` | Admin-Formular mit CheckboxList + reaktivem Stamm-Institut |
| `app/Http/Controllers/PhorestController.php` | API-Filter in `branches()` |
| `resources/views/layouts/hub.blade.php` | Meta-Tag `user-has-branch-restriction` |
| `resources/views/layouts/partials/sidebar.blade.php` | Alpine.js-Logik fuer "Alle Standorte" und Auto-Select |

#### Datenfluss

```
┌─────────────────────────────────────────────────────┐
│  Admin-Panel (Filament)                             │
│  UserForm.php → allowed_branch_ids (JSON) in DB     │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │  users.allowed_branch_ids │
          │  JSON: ["abc","def"]     │
          │  oder NULL (alle)        │
          └────────────┬────────────┘
                       │
      ┌────────────────┼────────────────┐
      ▼                ▼                ▼
┌───────────┐  ┌──────────────┐  ┌─────────────┐
│ Controller │  │  hub.blade   │  │  sidebar    │
│ branches() │  │  Meta-Tag    │  │  Alpine.js  │
│ filtert    │  │  0 oder 1    │  │  liest Tag  │
│ API-Antwort│  └──────────────┘  │  blendet    │
│ serverseit.│                    │  "Alle" aus │
└───────────┘                    └─────────────┘
```

**1. Serverseitige Filterung** (`PhorestController::branches()`):

```php
$allowedIds = $user?->allowed_branch_ids;

if (!empty($allowedIds) && is_array($allowedIds)) {
    $branches = array_values(array_filter($branches, function ($branch) use ($allowedIds) {
        return in_array($branch['branchId'], $allowedIds);
    }));
}
```

Die API `/phorest/branches` liefert nur noch erlaubte Branches zurueck. Das ist die primaere Sicherheitsschicht.

**2. Meta-Tag** (`hub.blade.php`):

```html
<meta name="user-has-branch-restriction"
      content="{{ !empty(Auth::user()->allowed_branch_ids) ? '1' : '0' }}">
```

**3. Clientseitige Logik** (`sidebar.blade.php`):

```javascript
// Property
hasBranchRestriction: document.querySelector('meta[name="user-has-branch-restriction"]')?.content === '1',

// "Alle Standorte" nur ohne Einschraenkung
<template x-if="!hasBranchRestriction"> ... </template>

// Auto-Select bei eingeschraenktem User
if (this.hasBranchRestriction && (!this.selectedBranch || this.selectedBranch === '')) {
    const homeBranch = document.querySelector('meta[name="user-home-branch"]')?.content;
    if (homeBranch && this.branches.some(b => b.branchId === homeBranch)) {
        this.selectBranch(homeBranch);
    } else if (this.branches.length > 0) {
        this.selectBranch(this.branches[0].branchId);
    }
}
```

#### Produktions-Deployment

Das SQL-Script `scripts/production-allowed-branches-2026-03-29.sql` fuegt die Spalte idempotent hinzu:

```bash
mysql -u USER -p DATENBANK < scripts/production-allowed-branches-2026-03-29.sql
```

!!! note "Rueckwaertskompatibel"
    Bestehende User haben `allowed_branch_ids = NULL` und sehen weiterhin alle Branches. Die Einschraenkung muss pro User explizit konfiguriert werden.
