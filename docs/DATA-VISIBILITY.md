# Datensichtbarkeit (zeilenscharfe Rechte)

Steuert, **welche Datensätze** ein Benutzer in mitarbeiterbezogenen Reports sieht — nicht nur, welche Reports er öffnen darf. Grundlage für die Tagesmessungen (BGs/CR/KPZ je Mitarbeiter) und die HR-KPIs.

## Für Endanwender

### Die drei Stufen

Im Admin-Backend unter **Rollen → Berechtigungen → Datensichtbarkeit** stehen drei Stufen zur Auswahl:

| Stufe | Permission | Wirkung |
|---|---|---|
| Nur eigene Daten | `data_scope_own` | Der Benutzer sieht in mitarbeiterbezogenen Reports ausschließlich seine eigenen Zahlen |
| Eigenes Team am Standort | `data_scope_branch` | Der Benutzer sieht alle Mitarbeiter seiner **erlaubten Institute** (Benutzer-Einstellung „Erlaubte Institute"; ist dort nichts gewählt, gilt das Stamm-Institut) |
| Alle Daten | `data_scope_all` | Keine Einschränkung |

### Regeln

- **Ohne Auswahl gilt „alle Daten"** — bestehende Rollen verhalten sich unverändert. Einschränkung ist ein bewusster Opt-in pro Rolle.
- **Bei mehreren Rollen gewinnt die weiteste Stufe** (all > branch > own).
- Die Einschränkung greift **serverseitig**: Auch direkt aufgerufene JSON-Endpoints und CSV-Exporte liefern nur die erlaubten Daten. Ein manuell angefragter fremder Standort ergibt ein leeres Ergebnis, eine fremde Mitarbeiter-Detailansicht einen Berechtigungsfehler.
- Benutzer mit „nur eigene Daten" **ohne Phorest-Zuordnung** (keine Staff-IDs am Benutzer hinterlegt) sehen keine Daten — es gibt bewusst keinen stillen Rückfall auf mehr Sichtbarkeit. In dem Fall im Admin-Backend die Phorest-Verknüpfung des Benutzers pflegen.
- Betroffen ist aktuell der Report **Mitarbeiterperformance** (Seite + CSV-Export). Rein aggregierte Berichte (z.B. Verkaufsstatistik) sind unverändert.

## Für Entwickler

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
