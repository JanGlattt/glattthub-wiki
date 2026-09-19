# Datensichtbarkeit (zeilenscharfe Rechte)

Steuert, **welche Datensätze** ein Benutzer in mitarbeiterbezogenen Reports sieht — nicht nur,
welche Reports er öffnen darf. Grundlage für die Tagesmessungen (BGs/CR/KPZ je Mitarbeiter), die
HR-KPIs, die Standort-Sicht der Firmenverträge und die Empfängerprüfung interner
Benachrichtigungen. Diese Seite beschreibt **Stufen, Regeln, Architektur und das Anbinden neuer
Reports**; die Bedienung im Admin-Backend steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Admin 1 – Benutzer und Rollen"
    [hilfe.hub.glattt.com/admin/1/](https://hilfe.hub.glattt.com/admin/1/) — Rollen und Rechte,
    was Rechte bewirken, Benutzer verwalten (dort auch „Erlaubte Institute" und Stamm-Institut).
    Die drei **Sichtstufen der Datensichtbarkeit** sind im Nutzerhandbuch noch nicht erklärt — sie
    folgen in Admin 1.

    Angrenzend: [Berichte 9 – Mitarbeiterperformance](https://hilfe.hub.glattt.com/berichte/9/)
    (der Bericht, auf den die Stufen wirken).

## Für Anwender — Überblick

**Was das Regelwerk leistet.** Ein Recht wie „Bericht: Mitarbeiterperformance" öffnet die Seite —
die Datensichtbarkeit legt fest, **wessen Zahlen** darauf erscheinen: nur die eigenen, die des
Teams an den erlaubten Instituten oder alle. Die Stufe hängt an der Rolle (Admin-Backend → Rollen →
Datensichtbarkeit) und ist eine bewusste Einschränkung: Ohne Auswahl gilt „alle Daten", bei mehreren
Rollen gewinnt die weiteste Stufe. Die Einschränkung greift serverseitig, also auch für direkt
aufgerufene Endpunkte und CSV-Exporte — eine fremde Mitarbeiterin lässt sich nicht durch Umbauen
der URL sichtbar machen.

**Die drei Stufen:** *Nur eigene Daten* (die Benutzerin sieht ausschließlich ihre eigenen Zahlen —
dazu muss ihr Hub-Konto mit ihren Phorest-Staff-IDs verknüpft sein), *Eigenes Team am Standort*
(alle Mitarbeiterinnen der erlaubten Institute, ersatzweise des Stamm-Instituts) und *Alle Daten*.

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Rolle öffnen, Rechte setzen, Wirkung verstehen | Admin 1 |
| Sichtstufe der Rolle wählen | folgt in Admin 1 |
| Erlaubte Institute, Stamm-Institut und Phorest-Verknüpfung am Benutzer pflegen | Admin 1 (Benutzer verwalten) |
| Mitarbeiterperformance lesen und exportieren | Berichte 9 |

## Für Entwickler

### Fachregeln

Im Admin-Backend unter **Rollen → Berechtigungen → Datensichtbarkeit** stehen drei Stufen zur Auswahl:

| Stufe | Permission | Wirkung |
|---|---|---|
| Nur eigene Daten | `data_scope_own` | Der Benutzer sieht in mitarbeiterbezogenen Reports ausschließlich seine eigenen Zahlen |
| Eigenes Team am Standort | `data_scope_branch` | Der Benutzer sieht alle Mitarbeiter seiner **erlaubten Institute** (Benutzer-Einstellung „Erlaubte Institute"; ist dort nichts gewählt, gilt das Stamm-Institut) |
| Alle Daten | `data_scope_all` | Keine Einschränkung |

- **Ohne Auswahl gilt „alle Daten"** — bestehende Rollen verhalten sich unverändert. Einschränkung ist
  ein bewusster Opt-in pro Rolle. (Migration `2026_08_03_140000` hat allen Rollen ohne Stufe
  `data_scope_branch` nachgetragen — Hintergrund in `BERECHTIGUNGSSYSTEM.md`, „Datensichtbarkeit:
  Fallback ohne vergebene Stufe ist 'alle Daten'". Beim Anlegen einer neuen Rolle immer eine Stufe
  setzen.)
- **Bei mehreren Rollen gewinnt die weiteste Stufe** (all > branch > own).
- Die Einschränkung greift **serverseitig**: Auch direkt aufgerufene JSON-Endpoints und CSV-Exporte
  liefern nur die erlaubten Daten. Ein manuell angefragter fremder Standort ergibt ein leeres Ergebnis,
  eine fremde Mitarbeiter-Detailansicht einen Berechtigungsfehler.
- Benutzer mit „nur eigene Daten" **ohne Phorest-Zuordnung** (keine Staff-IDs am Benutzer hinterlegt)
  sehen keine Daten — es gibt bewusst keinen stillen Rückfall auf mehr Sichtbarkeit. In dem Fall im
  Admin-Backend die Phorest-Verknüpfung des Benutzers pflegen.
- Betroffen ist der Report **Mitarbeiterperformance** (Seite + CSV-Export); außerdem nutzen die
  Firmenverträge (`CompanyContractController`), die Zufriedenheits-Arbeitsliste (Own zählt dort als
  Standort-Sicht) und der Hub-Provider der Benachrichtigungen (`NotificationRecipientResolver`)
  `dataScope()`. Rein aggregierte Berichte (z.B. Verkaufsstatistik) sind unverändert.

### Architektur

```
Request → Controller: $request->user()->dataScope()   (App\Support\DataScope)
             │  auflösen via App\Services\DataVisibilityService
             ▼
         DataScope::applyTo($filters)                  → scope_staff_ids / scope_branch_ids
             ▼
         StaffPerformanceService::buildConsultationFilters()/buildContractFilters()
             │  appendScopeFilter(): IN-Klausel; leere Liste ⇒ AND 1 = 0
             ▼
         Cache-Key = md5(json_encode($filters))        → Scope automatisch im Key
```

- **`App\Enums\DataScopeLevel`** — `Own` / `Branch` / `All`.
- **`App\Support\DataScope`** — Value-Object mit `staffIds`/`branchIds` (normalisiert & sortiert für stabile Cache-Keys), `applyTo(array $filters)`, `allowsStaff(string $staffId)`, `isRestricted()`.
- **`App\Services\DataVisibilityService`** — löst die Permissions auf (memoisiert pro Request):
    - `branch`: `users.allowed_branch_ids`, Fallback `home_branch_id` (`'all'` zählt nicht als Zuordnung)
    - `own`: Vereinigung aus `users.phorest_staff_ids`, `users.phorest_staff_id` und `phorest_staff.staff_id` (via `glatthub_user_id`) — ein Mitarbeiter hat **pro Standort eine eigene Phorest-Staff-ID**
- **Semantik der Filter-Keys:** Key nicht gesetzt = keine Einschränkung; Key gesetzt mit leerer Liste = *nichts* sichtbar (`AND 1 = 0`). Diese Unterscheidung niemals aufweichen.
- **Staff-Detail-Guard:** `StaffPerformanceController::staffDetail()` prüft `allowsStaff()` → 403; der Branch-Scope greift zusätzlich als `whereIn` in der Detail-Query.
- **CSV-Export:** `ExportController` mischt den Scope für Quellen der Seite `staff-performance` ein.

### Neue mitarbeiterbezogene Reports anbinden

1. Im Controller `$request->user()->dataScope()->applyTo($filters)` auf das Filter-Array anwenden.
2. Im Query-Service die Keys `scope_staff_ids`/`scope_branch_ids` als IN-Klauseln umsetzen (Muster: `StaffPerformanceService::appendScopeFilter()`), leere Liste ⇒ unmögliche Bedingung.
3. Sicherstellen, dass der Scope in die Cache-Keys einfließt (bei Filter-Hash automatisch).
4. Export-Quellen der Seite im `ExportController` mit anbinden.
5. Feature-Tests: own sieht nur sich, branch nur erlaubte Institute, fremder Request-Filter liefert leer.

### Relevante Dateien

- `database/migrations/2026_07_25_100000_add_data_scope_permissions.php`
- `app/Enums/DataScopeLevel.php`, `app/Support/DataScope.php`, `app/Services/DataVisibilityService.php`
- `app/Http/Controllers/StaffPerformanceController.php`, `app/Http/Controllers/ExportController.php`
- `app/Services/StaffPerformanceService.php` (`appendScopeFilter`)
- `app/Filament/Resources/Roles/Schemas/RoleForm.php` (Gruppe „Datensichtbarkeit")
- Tests: `tests/Unit/DataVisibilityServiceTest.php`, `tests/Feature/StaffPerformanceScopeTest.php`
