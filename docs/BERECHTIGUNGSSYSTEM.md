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
| Permissions gesamt | 103 |
| Baum-Zweige im Rollen-Editor | 20 |
| Rollen (Standard) | 4 |
| Geschuetzte Hub-Routen | 293 von 302 |
| Geschuetzte Formular-API-Routen | 22 von 22 |

!!! warning "August 2026: Permission-Audit und Umbau des Rollen-Editors"
    Alle Rechte wurden gegen den tatsaechlichen Code geprueft (Routen-Gates, `@can`-Direktiven,
    Policies). Ergebnis:

    - **30 wirkungslose Rechte entfernt** -- sie standen nur im Seeder und in Migrationen, wurden
      aber nirgends geprueft (komplettes Push-Modul, Beratungs-Rechte, alle `sync_*`, die drei
      `view_any_*`-Dubletten). Den Rollen waren sie trotzdem zugewiesen.
    - **7 Keys umbenannt**, weil sie irrefuehrend oder sprachlich gemischt waren:
      `view_cancellations` → `view_revocations`, `create_cancellations` → `create_revocations`,
      `manage_contract_cancellations` → `manage_revocations`, `manage_own_reisekosten` →
      `manage_own_travel_expenses`, `approve_reisekosten` → `approve_travel_expenses`,
      `view_report_rescheduled_cancelled` → `view_report_cancelled_appointments`,
      `custom-dashboard.share` → `share_custom_dashboard`.
    - **11 Rechte ohne Label und Gruppe** nachgetragen (Laser-Modul, Besucher-Funnel,
      Buchungseingang, Audit, Schrift-Einstellungen, Dashboard-Freigabe).
    - **`use_sepa_form_fields` und `use_advanced_form_fields` scharfgestellt** -- sie waren als
      Feinsteuerung der Feldpalette im Formular-Editor gedacht, wurden aber nie eingebaut.
    - **Die Formular-API abgesichert**: 22 Endpunkte unter `api/forms/*` liefen nur hinter `auth`.

    Migration: `2026_08_02_120000_restructure_permission_catalog`

!!! info "Spalten der Tabelle `permissions`"
    | Spalte | Zweck |
    |---|---|
    | `label` | Deutsche Beschriftung im Rollen-Editor |
    | `group_key` | Alte Gruppierung (bleibt fuer Bestandscode erhalten) |
    | `page_key` | Zweig im Baum, z.B. `termine`, `berichte` |
    | `page_sub` | Unterzweig, z.B. `Behandlung`, `Preislisten` |
    | `access_level` | Zugriffsstufe: `read`, `read_write` oder `full` |

    Massgeblich zur Laufzeit ist immer die Datenbank -- Zuordnung und Stufe sind ohne Deployment
    pflegbar. Die Stammdaten fuer neu angelegte Rechte liefert `App\Support\PermissionCatalog`.


---

## Fuer Endanwender

### Rollen

Jedem Benutzer wird eine oder mehrere Rollen zugewiesen. Die Rolle bestimmt, was der Benutzer im glatttHub sehen und tun kann.

| Rolle | Beschreibung | Berechtigungen |
|-------|-------------|----------------|
| **super_admin** | Vollzugriff auf alles | Alle 116 |
| **admin** | Hub + Admin-Panel, ohne Rollenverwaltung | 95 |
| **user** | Basis-Hub-Zugang (Termine, Kunden, Personal ansehen) | 13 |
| **finance** | Spezialisierte Finanz-Berechtigungen | 8 |

### Was passiert bei fehlender Berechtigung?

- **Navigation**: Menue-Punkte ohne Berechtigung werden nicht angezeigt
- **Seiten-Elemente**: Buttons wie "Neuer Gutschein" oder "Bearbeiten" sind nicht sichtbar
- **Direkte URL-Eingabe**: Es erscheint eine 403-Fehlerseite ("Zugriff verweigert")

### Rollen bearbeiten (nur fuer Administratoren)

Im Admin-Panel unter **Rollen** die gewuenschte Rolle oeffnen. Die Rechte stehen dort als **Baum
entlang der Hub-Struktur**: Ebene 1 sind die Seiten in der Reihenfolge der Sidebar, Ebene 2 deren
Unterseiten, Ebene 3 die einzelnen Rechte.

1. Zweig aufklappen (Pfeil links) und einzelne Rechte setzen
2. Die Checkbox am Zweig selbst vergibt oder entzieht **alle** Rechte des Zweigs auf einmal.
   Ein waagerechter Strich statt Haekchen bedeutet: nur ein Teil der Rechte ist vergeben
3. Der Zaehler rechts (`2/4`) zeigt, wie viele Rechte des Zweigs vergeben sind
4. "Alle" und "Keine" oben wirken auf den gesamten Baum
5. Speichern

**Farbcodierung der Zugriffsstufe** -- damit ohne Lesen des Labels erkennbar ist, wie weit ein
Recht reicht:

| Farbe | Stufe | Bedeutung |
|---|---|---|
| Blau | Lesen | Sehen und oeffnen, nichts veraendern |
| Orange | Bearbeiten | Anlegen und aendern, nichts unwiderruflich entfernen |
| Rot | Vollzugriff | Loeschen, Geld bewegen, Systemkonfiguration |

**Datensichtbarkeit** steht als eigener Bereich ueber den Berechtigungen. Da sich die drei Stufen
gegenseitig ausschliessen, ist es eine Auswahl und keine Sammlung von Checkboxen. Ohne bewusste
Auswahl gilt "Alle Daten"; hat ein Benutzer mehrere Rollen, gewinnt die weiteste Stufe.

### Rechte pflegen: Admin-Panel → Berechtigungen

Wie ein Recht im Rollen-Editor erscheint, wird unter **Berechtigungen** gepflegt -- ohne Deployment:

- **Beschriftung**, **Zweig**, **Unterzweig** und **Zugriffsstufe** sind direkt in der Tabelle aenderbar
- Filter nach Zweig, Zugriffsstufe und "keiner Rolle zugewiesen"
- Mehrere Rechte lassen sich per Sammelaktion umhaengen oder auf eine Stufe setzen

Neue Rechte **anlegen** und **loeschen** bleibt bewusst den Migrationen vorbehalten -- ein Recht
ohne Gate im Code waere wirkungslos, genau das hat das Audit aufgeraeumt.

### Wirken Aenderungen sofort?

Ja. Der Berechtigungs-Cache wird bei jeder Aenderung an einer Rolle oder einem Recht automatisch
geleert, und er liegt im Datenbank-Store -- ein Flush wirkt damit fuer alle laufenden
Cloud-Run-Instanzen zugleich.

Der Knopf **"Rechte jetzt anwenden"** im Kopf der Rollen- und der Berechtigungs-Seite wird nur
gebraucht, wenn am Model vorbei geschrieben wurde: direktes SQL, eine Datenkorrektur oder ein
Import. Dann haelt der Cache sonst bis zu 24 Stunden den alten Stand.

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
| `database/migrations/2026_05_10_230000_add_label_and_group_to_permissions.php` | Migration: Spalten `label` + `group_key` plus Backfill |
| `database/seeders/PermissionSeeder.php` | Seeder: Basis-Rechte + 4 Rollen-Zuweisungen (Stammdaten aus `PermissionCatalog`) |
| `scripts/production-permissions-2026-03-29.sql` | Idempotentes SQL fuer Produktiv-Deployment |
| `storage/app/permissions-label-group.sql` | Produktions-SQL fuer label/group_key-Spalten + Backfill |
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

### Alle Berechtigungen (Baum-Struktur)

Die 103 Rechte haengen an 20 Zweigen entlang der Hub-Struktur. Zuordnung (`page_key`, `page_sub`)
und Zugriffsstufe (`access_level`) stehen in der Datenbank und sind im Admin-Panel unter
**Berechtigungen** pflegbar -- die folgende Liste ist der Stand nach dem Audit vom 02.08.2026.

Ein Unterzweig wird nur dargestellt, wenn er mindestens zwei Rechte hat. Sonst waere er eine
Ueberschrift ueber einer einzelnen Checkbox -- das betrifft vor allem die Berichte, wo jeder
Bericht genau ein Recht hat und das Label ihn bereits benennt.


#### Startseite (2)

| Permission | Beschriftung | Stufe |
|---|---|---|
| `configure_dashboard` | KPIs und Charts konfigurieren | Bearbeiten |
| `view_dashboard` | Startseite sehen | Lesen |

#### Termine (4)

| Permission | Beschriftung | Stufe |
|---|---|---|
| `view_appointment_detail` | Termin-Detailansicht oeffnen | Lesen |
| `view_appointments` | Terminuebersicht sehen | Lesen |

**Behandlung**

| Permission | Beschriftung | Stufe |
|---|---|---|
| `manage_treatment_settings` | Behandlungseinstellungen verwalten | Vollzugriff |
| `manage_treatment_photos` | Behandlungsfotos hoch-/runterladen | Bearbeiten |

#### Kunden (3)

| Permission | Beschriftung | Stufe |
|---|---|---|
| `edit_clients` | Kunden bearbeiten | Bearbeiten |
| `view_client_detail` | Kundendetail oeffnen | Lesen |
| `view_clients` | Kundenliste sehen | Lesen |

#### Personal (7)

| Permission | Beschriftung | Stufe |
|---|---|---|
| `manage_staff_aliases` | Mitarbeiter-Aliase verwalten | Bearbeiten |
| `delete_staff` | Personal loeschen | Vollzugriff |
| `view_staff_detail` | Personal-Detailansicht | Lesen |
| `view_staff_overview` | Personal-Uebersicht sehen | Lesen |
| `view_staff` | Personalliste sehen | Lesen |

**HR-Daten**

| Permission | Beschriftung | Stufe |
|---|---|---|
| `manage_hr_salaries` | HR: Gehälter und Boni pflegen | Vollzugriff |
| `view_hr_salaries` | HR: Gehälter und Personalkosten sehen | Lesen |

#### Services (1)

| Permission | Beschriftung | Stufe |
|---|---|---|
| `view_services` | Services sehen | Lesen |

#### Berichte (16)

| Permission | Beschriftung | Stufe |
|---|---|---|
| `view_report_ads_analysis` | Bericht: Anzeigen-Analyse | Lesen |
| `view_report_visitor_funnel` | Bericht: Besucher-Funnel | Lesen |
| `view_report_glattt_kpis` | Bericht: glattt-KPIs | Lesen |
| `view_report_client_courses` | Bericht: glattt-Pakete | Lesen |
| `view_report_hr_kpis` | Bericht: HR-Kennzahlen | Lesen |
| `view_report_client_statistics` | Bericht: Kundenstatistiken | Lesen |
| `view_report_cancelled_appointments` | Bericht: Stornierte und gelöschte Termine | Lesen |
| `view_report_appointments_body_zones` | Bericht: Terminstatistik | Lesen |
| `view_report_past_consultations` | Bericht: Vergangene Beratungen | Lesen |
| `view_report_sales_statistics` | Bericht: Verkaufsstatistik | Lesen |
| `view_report_revocation_statistics` | Bericht: Widerruf-Statistik | Lesen |
| `view_report_upcoming_consultations` | Bericht: Zukuenftige Beratungen | Lesen |
| `view_reports` | Berichte-Uebersicht sehen | Lesen |
| `trigger_data_sync` | Daten-Sync ausloesen (Admin-Aktion) | Vollzugriff |
| `share_custom_dashboard` | Eigenes Dashboard teilen | Bearbeiten |
| `view_year_end_report` | Jahresabschluss-Auswertung (Sitzungen vs. Lastschriften) | Lesen |

#### Audit (2)

| Permission | Beschriftung | Stufe |
|---|---|---|
| `manage_audit_settings` | Audit-Vorgaben verwalten | Vollzugriff |
| `view_audit` | Audit-Übersicht sehen | Lesen |

#### Gutscheine (6)

| Permission | Beschriftung | Stufe |
|---|---|---|
| `edit_vouchers` | Gutscheine bearbeiten | Bearbeiten |
| `create_vouchers` | Gutscheine erstellen | Bearbeiten |
| `view_vouchers` | Gutscheine sehen | Lesen |

**Verkauf**

| Permission | Beschriftung | Stufe |
|---|---|---|
| `manage_voucher_products` | Gutschein-Produkte verwalten | Vollzugriff |
| `view_voucher_sales` | Gutschein-Verkäufe sehen | Lesen |
| `manage_voucher_sales` | Gutschein-Verkäufe verwalten | Vollzugriff |

#### Verträge (9)

| Permission | Beschriftung | Stufe |
|---|---|---|
| `manage_referral_payouts` | Freunde-werben-Auszahlungen verwalten | Vollzugriff |
| `manage_gocardless` | GoCardless-Mandate verwalten | Vollzugriff |
| `edit_contracts` | Vertraege bearbeiten | Bearbeiten |
| `view_contracts` | Vertraege sehen | Lesen |
| `edit_contract_data` | Vertragsdaten bearbeiten (erweiterte Felder) | Bearbeiten |

**Preislisten**

| Permission | Beschriftung | Stufe |
|---|---|---|
| `edit_price_lists` | Preislisten bearbeiten | Bearbeiten |
| `create_price_lists` | Preislisten erstellen | Bearbeiten |
| `delete_price_lists` | Preislisten loeschen | Vollzugriff |
| `view_price_lists` | Preislisten sehen | Lesen |

#### Widerrufe (3)

| Permission | Beschriftung | Stufe |
|---|---|---|
| `manage_revocations` | Widerrufe erfassen und bearbeiten | Vollzugriff |
| `create_revocations` | Widerrufe erstellen | Bearbeiten |
| `view_revocations` | Widerrufe sehen | Lesen |

#### Schulden (1)

| Permission | Beschriftung | Stufe |
|---|---|---|
| `view_debts` | Schulden sehen | Lesen |

#### Firmenverträge (2)

| Permission | Beschriftung | Stufe |
|---|---|---|
| `view_company_contracts` | Firmenvertraege sehen | Lesen |
| `manage_company_contracts` | Firmenvertraege verwalten | Vollzugriff |

#### Institute (2)

| Permission | Beschriftung | Stufe |
|---|---|---|
| `manage_branch_images` | Institut-Bilder verwalten | Bearbeiten |
| `view_branches` | Institute sehen | Lesen |

#### Laser (5)

| Permission | Beschriftung | Stufe |
|---|---|---|
| `manage_laser_inventory` | Laser-Inventar verwalten | Bearbeiten |
| `view_laser` | Laser-Modul sehen | Lesen |
| `manage_laser_repairs` | Laser-Reparaturen, STK und Behördenanzeigen verwalten | Bearbeiten |
| `manage_laser_master_data` | Laser-Stammdaten verwalten | Vollzugriff |
| `perform_laser_maintenance` | Laser-Wartungen durchführen und Fehler melden | Bearbeiten |

#### Formulare (8)

| Permission | Beschriftung | Stufe |
|---|---|---|
| `view_form_submissions` | Einreichungen ansehen | Lesen |
| `use_advanced_form_fields` | Erweiterte Felder (Koerperzonen, Vertragspreis, Upload, Signatur) | Bearbeiten |
| `fill_forms` | Formulare ausfuellen | Lesen |
| `edit_forms` | Formulare bearbeiten | Bearbeiten |
| `create_forms` | Formulare erstellen (Editor) | Bearbeiten |
| `delete_forms` | Formulare loeschen | Vollzugriff |
| `view_forms` | Formulare sehen | Lesen |
| `use_sepa_form_fields` | SEPA-Felder (IBAN, BIC, Kontoinhaber) | Bearbeiten |

#### Buchungseingang (1)

| Permission | Beschriftung | Stufe |
|---|---|---|
| `view_booking` | Buchungseingang sehen | Lesen |

#### Reisekosten (2)

| Permission | Beschriftung | Stufe |
|---|---|---|
| `manage_own_travel_expenses` | Eigene Reisekosten verwalten | Bearbeiten |
| `approve_travel_expenses` | Reisekosten freigeben (Vorgesetzte) | Bearbeiten |

#### Einstellungen (5)

| Permission | Beschriftung | Stufe |
|---|---|---|
| `manage_api_clients` | API-Clients verwalten | Vollzugriff |
| `manage_cache` | Cache verwalten | Vollzugriff |
| `edit_settings` | Einstellungen bearbeiten | Bearbeiten |
| `view_settings` | Einstellungen sehen | Lesen |
| `manage_settings` | Einstellungen verwalten (erweitert) | Vollzugriff |

#### Admin-Panel (18)

| Permission | Beschriftung | Stufe |
|---|---|---|

**Benutzer & Rollen**

| Permission | Beschriftung | Stufe |
|---|---|---|
| `edit_users` | Benutzer bearbeiten | Bearbeiten |
| `create_users` | Benutzer erstellen | Bearbeiten |
| `delete_users` | Benutzer loeschen | Vollzugriff |
| `view_users` | Benutzer sehen | Lesen |
| `edit_roles` | Rollen bearbeiten | Bearbeiten |
| `create_roles` | Rollen erstellen | Bearbeiten |
| `delete_roles` | Rollen loeschen | Vollzugriff |
| `view_roles` | Rollen sehen | Lesen |

**Stammdaten**

| Permission | Beschriftung | Stufe |
|---|---|---|
| `manage_absence_types` | Abwesenheitstypen verwalten | Vollzugriff |
| `manage_consultation_services` | Beratungsdienstleistungen verwalten | Vollzugriff |
| `manage_body_zones` | Koerperzonen verwalten | Vollzugriff |
| `manage_body_zone_aliases` | Koerperzonen-Aliase verwalten | Bearbeiten |
| `manage_news` | Nachrichten verwalten | Vollzugriff |
| `manage_phorest_staff` | Phorest-Personal verwalten | Vollzugriff |

**Systemkonfiguration**

| Permission | Beschriftung | Stufe |
|---|---|---|
| `manage_notifications_admin` | Benachrichtigungen verwalten | Vollzugriff |
| `manage_email_settings` | E-Mail-Einstellungen verwalten | Vollzugriff |
| `manage_pdf_settings` | PDF-Einstellungen verwalten | Vollzugriff |
| `manage_font_settings` | Schrift-Einstellungen verwalten | Vollzugriff |

#### Systemübergreifend (3)

| Permission | Beschriftung | Stufe |
|---|---|---|
| `use_ai_assistant` | glatttBert (KI-Assistent) verwenden | Bearbeiten |

**Zugriff**

| Permission | Beschriftung | Stufe |
|---|---|---|
| `access_admin` | Zugriff auf das Admin-Backend (Filament) | Vollzugriff |
| `access_hub` | Zugriff auf den glatttHub | Lesen |


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

Der Rollen-Editor zeigt die Rechte seit 08/2026 als **Baum entlang der Hub-Struktur**. Er ersetzt
die frueheren 20 Gruppen-Karten mit je einer CheckboxList.

#### Aufbau des Formulars

1. **Rollen-Informationen** -- Rollenname (eindeutig) und Guard
2. **Standard-Rolle** -- Toggle, ob neue Benutzer diese Rolle automatisch bekommen
3. **Datensichtbarkeit** -- Stufenauswahl (`data_scope_own` / `_branch` / `_all`), kein Teil des Baums
4. **Berechtigungen** -- der Baum als `ViewField`

#### Aufbau des Baums

`RoleForm::permissionTree()` liest die Rechte aus der Datenbank und gruppiert sie:

- **Ebene 1** aus `page_key`, in der Reihenfolge von `PermissionCatalog::NODES` (entspricht der Sidebar)
- **Ebene 2** aus `page_sub`, alphabetisch
- **Ebene 3** die Rechte selbst, alphabetisch nach Label

Zwei Regeln dabei:

- Rechte ohne `page_key` landen im Zweig `system` ("Systemuebergreifend") -- keines faellt heraus
- Ein Unterzweig mit genau **einem** Recht wird in die Hauptliste geklappt: eine Ueberschrift ueber
  einer einzelnen Checkbox ist keine Gliederung. Ohne diese Regel haette der Berichte-Zweig
  14 Unterzweige mit je einem Eintrag

#### Datenfluss

```
1. mutateFormDataBeforeFill()
   - $data['permissions'] = Rechte der Rolle, geschnitten mit dem Baum
   - $data['data_scope']  = weiteste vergebene Stufe, sonst data_scope_all

2. Formular-Anzeige
   - ViewField rendert filament/forms/components/permission-tree.blade.php
   - Alpine haelt die Auswahl ueber $wire.$entangle synchron

3. mutateFormDataBeforeSave()
   - permissions + data_scope zu einer Liste zusammenfuehren
   - beide Keys aus $data entfernen (keine Spalten auf roles)

4. afterSave()
   - $role->syncPermissions($permissionsToSync)
```

#### Fallstricke

- **Das Alpine-Objekt steht direkt in der View, nicht in `@push('scripts')`.** Filament rendert den
  Script-Stack erst am Ende des Body; ist Alpine bis dahin gestartet, waere `permissionTree()` beim
  Auswerten von `x-data` noch nicht definiert.
- **`display` der aufklappbaren Zweige kommt aus der CSS-Klasse**, nie als Inline-Style -- Alpine
  ueberschreibt bei `x-show` das inline `display` und das Layout kollabiert still.
- **Mass Assignment auf neuen Spalten:** Laravel merkt sich die Spaltenliste je Modellklasse
  statisch (`isGuardableColumn`). Stammt der Cache aus der Zeit vor einer Migration, verwirft
  `update()` die neuen Spalten **stillschweigend**. Seeder und Sammelaktionen nutzen deshalb
  `forceFill()->save()`.

**Relevante Dateien:**

- `app/Support/PermissionCatalog.php` -- Stammdaten aller Rechte und die 20 Zweige
- `app/Filament/Resources/Roles/Schemas/RoleForm.php` -- Baumaufbau und Formular
- `app/Filament/Resources/Roles/Pages/EditRole.php` -- Hydration + Sync
- `app/Filament/Resources/Roles/Pages/CreateRole.php` -- Sync beim Anlegen
- `resources/views/filament/forms/components/permission-tree.blade.php` -- Baum-View
- `app/Filament/Resources/Permissions/` -- Pflege-Oberflaeche fuer Zuordnung und Stufe
- `app/Filament/Actions/FlushPermissionCacheAction.php` -- "Rechte jetzt anwenden"
- `public/css/theme_glattt.css` -- Abschnitt `permission-tree-glattt`

#### Einen neuen Zweig hinzufuegen

1. In `PermissionCatalog::NODES` einen Eintrag ergaenzen (Schluessel → Anzeigename), an der Stelle,
   an der die Seite auch in der Sidebar steht
2. Die betroffenen Rechte im Admin-Panel unter **Berechtigungen** auf den neuen Zweig umhaengen --
   oder bei neuen Rechten `page_key` gleich in der Migration setzen


### Neue Permission hinzufuegen (Schritt fuer Schritt)

1. **Migration erstellen**: Permission anlegen -- mit `label`, `page_key`, `page_sub` und `access_level`:

    ```php
    Permission::firstOrCreate(
        ['name' => 'neue_permission', 'guard_name' => 'web'],
        [
            'label'        => 'Deutsches Label',
            'group_key'    => 'kunden',      // Bestandsgruppierung
            'page_key'     => 'kunden',      // Zweig im Baum
            'page_sub'     => null,          // Unterzweig, meist null
            'access_level' => 'read_write',  // read | read_write | full
        ],
    );
    ```

    !!! tip "Der Rollen-Editor aktualisiert sich selbst"
        Sobald die Migration durch ist, erscheint das Recht **automatisch** im Baum. Es ist keine
        Aenderung an `RoleForm.php` noetig. Fehlt `page_key`, landet es im Zweig
        "Systemuebergreifend" -- sichtbar, aber an der falschen Stelle.

    !!! warning "Ein Recht ohne Gate ist wirkungslos"
        Das Audit 08/2026 hat 30 Rechte entfernt, die nur im Seeder standen und nirgends geprueft
        wurden -- den Rollen aber zugewiesen waren. Das ist Scheinsicherheit: Wegnehmen aendert
        nichts, Vergeben bringt nichts. Schritt 4 bis 6 sind deshalb **nicht optional**.

2. **Stammdaten ergaenzen**: In `App\Support\PermissionCatalog::ENTRIES` einen Eintrag
   `'key' => [Label, Gruppe, Zweig, Unterzweig, Stufe]` hinzufuegen, damit der Seeder das Recht
   vollstaendig anlegt.

3. **Seeder aktualisieren**: In `PermissionSeeder.php` das Recht und die Rollenzuweisung ergaenzen.

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

7. **Produktions-SQL erstellen**: Fuer das Deployment ein idempotentes SQL-Statement vorbereiten -- `label` und `group_key` nicht vergessen:

    ```sql
    INSERT IGNORE INTO permissions (name, guard_name, label, group_key, created_at, updated_at)
    VALUES ('neue_permission', 'web', 'Deutsches Label', 'kunden', NOW(), NOW());
    ```

---

### Schutz der Datenschicht (Stand 02.08.2026)

Neben den Hub-Seiten wurden die AJAX-Endpunkte dahinter abgesichert. Sie liefen bis dahin nur
hinter `auth`: Jeder angemeldete Benutzer -- auch einer **ohne** Hub-Zugang -- konnte darueber
Kunden anlegen, Kaeufe buchen, Gutscheine erstellen, NiSV-Dokumente loeschen oder WhatsApp an
Kunden senden.

Die einzige Middleware dort war `RedirectDirectApiAccess`. Sie leitet lediglich direkte
Browser-Aufrufe von JSON-URLs um (Pruefung auf `Sec-Fetch-Mode`) und ist **ausdruecklich keine
Rechtepruefung** -- ein `fetch()` kommt durch.

| Bereich | Schutz seit 08/2026 |
|---|---|
| `phorest/*` (123) | `CheckHubAccess` fuer die gesamte Gruppe, 32 schreibende Endpunkte zusaetzlich mit eigenem Recht |
| `superchat/*` (8) | Lesen `view_client_detail`, Senden zusaetzlich `send_client_messages` |
| `zendesk/*` (6) | `view_client_detail` |
| `askdante/*` (5) | `view_staff_detail` |
| `google/*` (6) | `view_company_contracts` |
| `api/users`, `api/legacy-payments` | `view_users` bzw. `view_contracts` |

Migration: `2026_08_02_150000_add_write_permissions_for_phorest_endpoints`

!!! note "Lesende Phorest-Endpunkte bewusst nur mit CheckHubAccess"
    Die rund 90 lesenden Endpunkte sind innerhalb des Hub fuer jeden Benutzer erreichbar. Das ist
    eine bewusste Entscheidung (Jan, 08/2026): Auch Phorest selbst loest den Lesezugriff auf diese
    Daten nicht feingranular auf. Eine feinere Staffelung waere strenger als das Quellsystem und
    haette keinen praktischen Gewinn.

!!! warning "Doppelte Routendefinitionen"
    Beim Absichern fiel auf, dass neun Routen in der `phorest`-Gruppe **zweimal** definiert waren,
    rund 360 Zeilen auseinander. Laravel registriert beide, wirksam ist die **spaetere** -- ein
    Gate an der frueheren Definition tut stillschweigend nichts. Die Dubletten wurden entfernt.
    Bei Aenderungen an dieser Gruppe lohnt ein Blick, ob ein Pfad mehrfach vorkommt.

Nicht betroffen und bewusst offen: `api/cron/*` (Token im Controller), `api/webhooks/*`
(Signaturpruefung), `api/v1/*` (Bearer-Token mit Scopes), `shared/*` und `api/shared/*`
(Token-basierte oeffentliche Flows), `user/*` (eigenes Profil) sowie die persoenlichen
Push-Einstellungen unter `api/push/*`.

---

### Rollen in Produktion weichen vom Seeder ab

!!! danger "Vor jedem Deploy mit neuen Gates pruefen"
    Die Rollen auf Produktion sind **nicht** die des `PermissionSeeder` (Stand 02.08.2026):

    | Produktion | Seeder / lokal |
    |---|---|
    | `admin` | `admin` |
    | `Büro` | — |
    | `Institute Leitung` | — |
    | `Institute MA` | — |
    | — | `super_admin`, `user`, `finance` |

    Zwei Konsequenzen:

    1. **Eine Migration, die Rechte ueber feste Rollennamen vergibt, erreicht in Prod nur `admin`.**
       Am 02.08.2026 hat das Behandler (`Institute MA`) vom Termin-Check-in ausgesperrt: Der
       Endpunkt hatte vorher gar kein Gate, danach besass nur `admin` das neue Recht.
       Richtig ist die Ableitung aus einem Referenzrecht -- wer `view_appointment_detail` hat,
       bekommt `checkin_appointments`. Muster:
       `2026_08_02_190000_grant_new_permissions_to_existing_roles`.
    2. **Es gibt in Prod keinen `super_admin`**, der Gate-Bypass greift dort also nie. Fehlt ein
       Recht in der Datenbank, kommt niemand mehr an die zugehoerige Seite -- auch kein
       Administrator.

    Pruefzugang: Cloud SQL Auth Proxy. Die Zugangsdaten stehen als Env-Vars am Cloud-Run-Dienst
    (`gcloud run services describe glattthub-web --region=europe-west3`), **nicht** im Secret Manager.

---

### Wirken Rechte-Aenderungen sofort? (Cache)

Ja -- nachgewiesen in `tests/Feature/PermissionCacheInvalidationTest.php`.

Rechte werden 24 Stunden zwischengespeichert (`config/permission.php`). Der Cache liegt im
**Datenbank-Store**, ein Flush wirkt daher fuer alle laufenden Cloud-Run-Instanzen zugleich.
Geleert wird er automatisch bei jedem `saved` und `deleted` auf einer Rolle oder einem Recht
(Spatie-Trait `RefreshesPermissionCache`) -- das deckt ab:

| Weg | Cache wird geleert |
|---|---|
| Rollen-Editor speichern (`syncPermissions`) | ja |
| Inline-Bearbeitung unter **Berechtigungen** | ja |
| Sammelaktionen (Zweig zuordnen, Stufe setzen) | ja |
| Rollenwechsel am Benutzer (`syncRoles`) | ja |
| Migration mit direktem `DB::table()->update()` | **nein** -- dort explizit `forgetCachedPermissions()` aufrufen |

Zwei Gruende, warum das auch im Betrieb zuverlaessig greift:

- **Kein Octane.** Jeder Web-Request bootet frisch, der `PermissionRegistrar` haelt nichts ueber
  Requests hinweg im Speicher.
- **Der Queue-Worker prueft keine Rechte.** Er waere der einzige langlebige Prozess (Neustart
  ohnehin stuendlich ueber `--max-time=3600`).

Der Knopf **"Rechte jetzt anwenden"** ist damit ein Notnagel fuer Aenderungen am Model vorbei:
direktes SQL, eine Datenkorrektur oder ein Import.

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

## Datensichtbarkeit (zeilenscharfe Rechte)

Seit 07/2026 gibt es zusätzlich die Permission-Gruppe **Datensichtbarkeit** (`data_scope_own` / `data_scope_branch` / `data_scope_all`): Sie schränkt serverseitig ein, **welche Datensätze** ein Benutzer in mitarbeiterbezogenen Reports sieht (nur eigene Daten / eigenes Team an den erlaubten Instituten / alle Daten). Die Stufe „eigenes Team" baut auf der oben beschriebenen Standort-Beschränkung (`allowed_branch_ids`) auf. Details: [Datensichtbarkeit](DATA-VISIBILITY.md).
