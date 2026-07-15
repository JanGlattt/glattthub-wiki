# Schulden (Kundenschulden)

> Zentrale Übersicht über Geld, das Kunden schulden – im ersten Schritt aus geplatzten GoCardless-Lastschriften

## Inhaltsverzeichnis

- [Für Nutzer](#für-nutzer)
  - [Übersicht](#übersicht)
  - [Zugang](#zugang)
  - [Basisseite: Kunden mit Schulden](#basisseite-kunden-mit-schulden)
  - [Unterseite: Geplatzte Lastschriften](#unterseite-geplatzte-lastschriften)
  - [Was zählt als Schuld?](#was-zählt-als-schuld)
- [Für Entwickler](#für-entwickler)
  - [Architektur](#architektur)
  - [Datenquelle & Berechnung](#datenquelle--berechnung)
  - [Routen](#routen)
  - [Controller](#controller)
  - [Wiederverwendete Bausteine](#wiederverwendete-bausteine)
  - [Berechtigung](#berechtigung)
  - [Erweiterbarkeit](#erweiterbarkeit)

---

# Für Nutzer

## Übersicht

Das Schulden-Modul bündelt an einer Stelle, **welche Kunden aktuell Geld schulden**. Bisher war diese Information nur verstreut in den einzelnen Vertragsdetails sichtbar.

Im ersten Ausbaustufe betrachtet das Modul ausschließlich **geplatzte GoCardless-Lastschriften** – also SEPA-Einzüge, die nicht eingelöst wurden oder vom Kunden zurückgebucht wurden. Über jeden Lastschrift-Status informiert uns GoCardless per Webhook; das Modul wertet diese bereits gespeicherten Daten nur aus.

- **Kundenliste** – alle Kunden mit offenen Beträgen, mit Schuldensumme
- **Detailliste** – jede einzelne geplatzte Lastschrift mit Grund und Betrag
- **Verlinkung** – direkter Sprung zum Kunden bzw. zum betroffenen Vertrag

## Zugang

1. glatttHub öffnen
2. Im Seitenmenü **Schulden** (💰-Icon) auswählen
3. Die Schulden-Übersicht wird angezeigt

Der Menüpunkt ist nur mit der Berechtigung `view_debts` sichtbar (standardmäßig **admin** und **super_admin**).

---

## Basisseite: Kunden mit Schulden

Die Basisseite zeigt zwei Kennzahlen-Karten und eine Kundentabelle.

**Kennzahlen:**

| Karte | Bedeutung |
|-------|-----------|
| **Kunden mit Schulden** | Anzahl der Kunden mit mindestens einer geplatzten Lastschrift |
| **Gesamtschulden** | Summe aller geplatzten Lastschriften über alle Kunden |

**Tabellenspalten:**

| Spalte | Beschreibung |
|--------|-------------|
| **Kunde** | Name des Kunden (aus Phorest) mit **Kundennummer** (`#externalId`) darunter; verlinkt auf das Kundenprofil |
| **Geplatzte Lastschriften** | Anzahl der geplatzten Raten dieses Kunden |
| **Älteste Fälligkeit** | Fälligkeitsdatum der ältesten geplatzten Rate |
| **Schulden** | Summe der geplatzten Lastschriften des Kunden (in Rot) |

Alle Spalten sind **sortierbar** (Klick auf die Kopfzeile, ↑/↓), die Zeilen sind **gebändert** (Zebra). Standard-Sortierung ist Schuld absteigend. Über das Suchfeld kann nach **Kundenname oder Kundennummer** gefiltert werden. Der Button **„Geplatzte Lastschriften ansehen"** oben rechts führt zur Detailliste.

!!! info "Standortübergreifend"
    Die Schulden-Übersicht zeigt Kunden über **alle Standorte** hinweg (kein Standortfilter).

---

## Unterseite: Geplatzte Lastschriften

Erreichbar über den Button auf der Basisseite. Listet jede einzelne geplatzte Lastschrift.

**Tabellenspalten:**

| Spalte | Beschreibung |
|--------|-------------|
| **Kunde** | Name des Kunden mit **Kundennummer** (`#externalId`) darunter; verlinkt auf das Kundenprofil |
| **Fällig am** | Fälligkeitsdatum der Rate |
| **Rate** | Ratennummer (installment_number) |
| **Status** | „Fehlgeschlagen" oder „Rückbuchung" (rot), plus Anzahl Einzugsversuche |
| **Grund** | Fehlerbeschreibung von GoCardless (`failure_reason`) + Code |
| **Betrag** | Betrag der Rate (in Rot) |
| **Vertrag** | Link zur Vertragsdetailseite |

Zeilen gebändert (Zebra), Spalten sortierbar; Standard-Sortierung ist Fälligkeit absteigend. Das Suchfeld filtert nach **Kundenname, Kundennummer oder Fehlergrund**. Der Zurück-Pfeil oben links führt zur Basisseite.

---

## Was zählt als Schuld?

Im ersten Schritt zählen genau zwei Zahlungsstatus als „geplatzte Lastschrift":

| Status | Bedeutung |
|--------|-----------|
| **Fehlgeschlagen** (`failed`) | Die Lastschrift wurde nicht eingelöst (z. B. Konto nicht gedeckt) |
| **Rückbuchung** (`chargedback`) | Der Kunde hat die bereits eingezogene Lastschrift zurückgebucht |

Beides ist Geld, das nicht (dauerhaft) angekommen ist. Der **Schuldenbetrag pro Kunde** ist die Summe der Beträge genau dieser Raten – er deckt sich damit exakt mit den Zeilen der Detailliste.

!!! tip "Beglichene Rücklastschriften verlassen das Schulden-Set"
    Wird eine geplatzte Rate im Vertrag manuell **als beglichen markiert** (z. B. per Überweisung ausgeglichen – Button „Als beglichen markieren" im Zahlungen-Tab, siehe `CONTRACTS-SEPA-MODULE.md`), wechselt ihr Status auf `paid`. Damit fällt sie automatisch aus `scopeBounced()` heraus und zählt nicht mehr als Schuld. Eine eventuell erfasste **RLS-Gebühr** (`return_fee_cents`) ist bewusst **nicht** Teil dieser Schulden-Summe.

!!! note "Noch nicht enthalten"
    Überfällige, aber noch nicht eingezogene Raten, andere Schuldenquellen sowie ein Mahnwesen sind bewusst **nicht** Teil dieser ersten Stufe (siehe [Erweiterbarkeit](#erweiterbarkeit)).

---

# Für Entwickler

## Architektur

Das Modul folgt dem klassischen Hub-MVC-Muster (Controller → Blade-View, Alpine.js, Livewire-Navigation) und legt **kein neues Datenmodell** an – es wertet die bestehende Tabelle `contract_payments` aus.

**Zweistufiges Laden (Performance):** Wie die Vertragsliste liefert der Controller zunächst nur die Seiten-Shell. Die Zeilen kommen per JSON-Endpoint (schnell, nur DB), die Tabelle erscheint sofort mit **Skeleton-Loadern**; die Phorest-Kundennamen (+ Kundennummer) werden anschließend asynchron nachgeladen und je Zeile eingefüllt. Sortierung und Suche laufen client-seitig (Alpine), da alle Zeilen auf einmal geladen werden.

| Baustein | Datei |
|----------|-------|
| Controller | `app/Http/Controllers/DebtController.php` |
| Basisseite | `resources/views/hub/debts/index.blade.php` |
| Unterseite | `resources/views/hub/debts/failed-debits.blade.php` |
| Sidebar-Eintrag | `resources/views/layouts/partials/sidebar.blade.php` |
| Query-Scope | `App\Models\ContractPayment::scopeBounced()` |
| Kundennamen-Trait | `app/Http/Controllers/Concerns/ResolvesClientData.php` |
| Permission-Migration | `database/migrations/2026_07_07_100000_add_view_debts_permission.php` |

## Datenquelle & Berechnung

„Geplatzte Lastschrift" = `ContractPayment` mit `status IN ('failed', 'chargedback')`. Dafür gibt es einen wiederverwendbaren, **join-sicheren** Scope (die Spalte wird qualifiziert, weil `contracts` ebenfalls eine `status`-Spalte hat):

```php
// App\Models\ContractPayment
public function scopeBounced($query)
{
    return $query->whereIn($query->qualifyColumn('status'), [
        self::STATUS_FAILED,
        self::STATUS_CHARGEDBACK,
    ]);
}
```

Der Weg vom Zahlungsdatensatz zum Kunden führt über den Vertrag: `contract_payments.contract_id → contracts.client_id` (Phorest-Client-ID; es gibt kein lokales Kundenmodell).

**Aggregation pro Kunde** (Basisseite):

```php
ContractPayment::query()->bounced()
    ->join('contracts', 'contracts.id', '=', 'contract_payments.contract_id')
    ->whereNull('contracts.deleted_at')
    ->groupBy('contracts.client_id')
    ->select([
        'contracts.client_id',
        DB::raw('SUM(contract_payments.amount_cents) as debt_cents'),
        DB::raw('COUNT(*) as bounced_count'),
        DB::raw('MIN(contract_payments.due_date) as oldest_due'),
    ])
    ->orderByDesc('debt_cents')
    ->get();
```

Der SoftDelete-Scope von `contract_payments` greift automatisch (Basismodell der Query); für `contracts` wird `deleted_at` explizit gefiltert. Beträge liegen wie überall in der App in **Cent** (`amount_cents`) vor.

## Routen

In der `hub`-Gruppe (`routes/web.php`), geschützt über `can:view_debts`:

```php
Route::middleware('can:view_debts')->group(function () {
    Route::get('/debts', [DebtController::class, 'index'])->name('debts');
    Route::get('/debts/data', [DebtController::class, 'getData'])->name('debts.data');                       // JSON: Kunden-Aggregation
    Route::get('/debts/clients', [DebtController::class, 'getClients'])->name('debts.clients');              // JSON: Namen + Kundennummer (Phase 2)
    Route::get('/debts/failed-debits', [DebtController::class, 'failedDebits'])->name('debts.failed-debits');
    Route::get('/debts/failed-debits/data', [DebtController::class, 'getFailedDebitsData'])->name('debts.failed-debits.data'); // JSON: Einzelraten
});
```

Die Sidebar hält den Menüpunkt über `request()->routeIs('hub.debts*')` auch auf der Unterseite aktiv.

## Controller

`DebtController` liefert Shells + JSON (zweistufiges Laden):

- **`index()` / `failedDebits()`** – rendern nur die Seiten-Shell (kein Phorest-Zugriff, sofort schnell).
- **`getData()`** – JSON: aggregiert geplatzte Raten pro Kunde (siehe oben), inkl. Gesamtsumme. Ohne Namen.
- **`getFailedDebitsData()`** – JSON: alle geplatzten Raten (`bounced()->with('contract')->orderByDesc('due_date')`) inkl. Status-Label, Fehlergrund und Vertrags-Link. Ohne Namen.
- **`getClients()`** – JSON (Phase 2): löst für eine ID-Liste Kundenname **+ Kundennummer** (`externalId`) via `getClientDataBulk()` auf.

## Wiederverwendete Bausteine

Das Modul entstand primär durch **Wiederverwendung**:

- **Kundennamen + Kundennummer** werden über den Trait `ResolvesClientData::getClientDataBulk()` gebündelt aufgelöst (Cache-Key `client_data_{id}`, 300 s TTL, plus paralleler HTTP-Pool `PhorestApiService::getClientsParallel()` für nicht gecachte IDs; `externalId` = Kundennummer). Der Trait wurde aus `ContractController` extrahiert und wird jetzt von beiden Controllern genutzt; `getClients()` spiegelt `ContractController::getContractsClientData()`.
- **Status-Labels/-Farben, Betragsformatierung** kommen aus den Accessors von `ContractPayment` (`status_label`, `status_color`, `formatted_amount`).
- **UI** nutzt das bestehende Design-System (`table-glattt-container`, `table-glattt table-glattt-striped` für Zebra-Zeilen, `card-glattt`, `badge-glattt`) sowie das **Skeleton-/Zwei-Phasen-Lademuster** und die **sortierbaren Spalten** der Vertragsliste (`hub/contracts/index.blade.php`); Schuldenbeträge sind über `--color-danger` rot hervorgehoben.

## Berechtigung

Die Permission `view_debts` (Label „Schulden sehen", `group_key = schulden`) wird per Migration idempotent angelegt und `super_admin` + `admin` zugewiesen. Im Rollen-Editor erscheint sie in einer eigenen Gruppe **„Schulden"** (`RoleForm::groupMeta()`).

Zum Nachziehen in bestehenden Umgebungen:

```bash
php artisan migrate            # Produktion / Staging
# alternativ (idempotent):
php artisan db:seed --class=PermissionSeeder
```

## Erweiterbarkeit

Die Basis ist bewusst schmal gehalten. Naheliegende nächste Schritte:

- **Weitere Schuldenquellen** neben geplatzten Lastschriften (z. B. überfällige, noch nicht eingezogene Raten). Für Letzteres existiert bereits `ContractPayment::scopeOverdue()`.
- **Mahnwesen / Dunning** – die Infrastruktur `contract_payment_reminders` (Model `ContractPaymentReminder`, mit `level`, `fee_cents`, Versandkanälen) ist bereits vorhanden, aber noch nicht angebunden.
- **Aktionen aus der Liste** – Wiederholung fehlgeschlagener Einzüge (`ContractPayment::scheduleRetry()`, Accessor `can_retry`) oder „als bezahlt markieren" (`markAsPaid()`) direkt aus der Schulden-Ansicht statt nur über das Vertragsdetail.
- **Tab „Forderungsmanagement"** im Kundenprofil (siehe `CLIENT-DETAIL-MODULE.md`) könnte auf denselben Scope aufsetzen.

Siehe auch: [Verträge & SEPA](CONTRACTS-SEPA-MODULE.md), [GoCardless API](GOCARDLESS-API.md), [Berechtigungssystem](BERECHTIGUNGSSYSTEM.md).
