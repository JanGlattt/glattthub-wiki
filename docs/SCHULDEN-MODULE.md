# Schulden (Kundenschulden)

Das Schulden-Modul ist die zentrale **Datenansicht** über Geld, das Kunden schulden — in der
ersten Ausbaustufe ausschließlich aus **geplatzten GoCardless-Lastschriften** (nicht eingelöste
oder zurückgebuchte SEPA-Einzüge). Es legt kein eigenes Datenmodell an, sondern wertet die per
Webhook gespeicherten Raten in `contract_payments` aus; der geführte Mahnprozess liegt im
[Forderungsmanagement](FORDERUNGSMANAGEMENT.md). Diese Seite beschreibt **Absicht, Fachregel
„Was zählt als Schuld?", Datenquelle, Routen und Bausteine**; die Bedienung der Listen und des
Schuldenberichts steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Finanzen 1 – Schulden im Überblick · Berichte 10 – Schuldenbericht"
    [hilfe.hub.glattt.com/finanzen/1/](https://hilfe.hub.glattt.com/finanzen/1/) — die Gesamtsicht,
    die Kundenliste und die Liste der geplatzten Lastschriften lesen, und was daraus folgt.
    [hilfe.hub.glattt.com/berichte/10/](https://hilfe.hub.glattt.com/berichte/10/) — der
    Schuldenbericht unter *Berichte*: Rücklastschriften, Bestand und Rückfluss.

    Angrenzend: [Verträge 4 – Zahlungen nachtragen und korrigieren](https://hilfe.hub.glattt.com/vertraege/4/)
    (eine geplatzte Lastschrift ausgleichen),
    [Verträge 5 – SEPA-Einzug und Rücklastschrift](https://hilfe.hub.glattt.com/vertraege/5/)
    (Rücklastschrift anhängen),
    [Kundenverwaltung 4 – Vertrag, Zahlung & offene Forderungen](https://hilfe.hub.glattt.com/kundenverwaltung/4/)
    (Schulden auf einen Blick im Kundenprofil) und die Serie
    [Forderungen](https://hilfe.hub.glattt.com/forderungen/) (Mahnprozess).

## Inhaltsverzeichnis

- [Für Anwender — Überblick](#fur-anwender-uberblick)
- [Für Entwickler](#fur-entwickler)
    - [Was zählt als Schuld?](#was-zahlt-als-schuld)
    - [Architektur](#architektur)
    - [Datenquelle & Berechnung](#datenquelle-berechnung)
    - [Die beiden Listen (Datenherkunft)](#die-beiden-listen-datenherkunft)
    - [Routen](#routen)
    - [Controller](#controller)
    - [Wiederverwendete Bausteine](#wiederverwendete-bausteine)
    - [Berechtigung](#berechtigung)
    - [Erweiterbarkeit](#erweiterbarkeit)

---

## Für Anwender — Überblick

**Was das Modul leistet.** Das Schulden-Modul bündelt an einer Stelle, **welche Kunden aktuell
Geld schulden** — vorher war diese Information nur verstreut in den einzelnen Vertragsdetails
sichtbar. Es betrachtet ausschließlich geplatzte GoCardless-Lastschriften: Über jeden
Lastschrift-Status informiert uns GoCardless per Webhook; das Modul wertet diese bereits
gespeicherten Daten nur aus und rechnet nichts Eigenes. Zwei Sichten gehören dazu: die
**Kundenliste** (alle Kunden mit offenen Beträgen samt Schuldensumme, ältester Fälligkeit und
Anzahl geplatzter Raten) und die **Detailliste** jeder einzelnen geplatzten Lastschrift mit
Rücklastschrift-Grund und Betrag; beide verlinken direkt zum Kundenprofil bzw. zum betroffenen
Vertrag. Beide Listen sind **standortübergreifend** (kein Standortfilter).

**Grundsätze:**

- **Nur, was tatsächlich geplatzt ist, zählt** — fehlgeschlagene und zurückgebuchte Raten.
  Überfällige, aber noch nicht eingezogene Raten, RLS-Gebühren und andere Schuldenquellen sind
  bewusst nicht enthalten (Definition unten unter [Was zählt als Schuld?](#was-zahlt-als-schuld)).
- **Die Liste ist eine Datenansicht, keine Arbeitsoberfläche.** Gemahnt, verbucht und
  abgeschrieben wird im [Forderungsmanagement](FORDERUNGSMANAGEMENT.md); wer eine geplatzte
  Rate ausgleicht oder ans Planende anhängt (Vertragsseite, seit 31.07.2026), lässt sie damit
  aus dieser Liste verschwinden — der Betrag ist dann keine offene Schuld mehr, sondern eine
  terminierte bzw. beglichene Rate.
- **Warum bei den meisten Zeilen „Bank nennt keinen Grund" steht:** Deutsche Banken legen den
  Grund einer SEPA-Rückgabe in aller Regel nicht offen und melden den Sammelcode `MS03`. Das ist
  keine Lücke im Hub, sondern die Auskunft, die GoCardless von der Bank bekommt (Details:
  [GOCARDLESS-API.md](GOCARDLESS-API.md)).

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Gesamtsicht, Kundenliste und Liste der geplatzten Lastschriften lesen, sortieren, suchen | Finanzen 1 |
| Schuldenbericht (Rücklastschriften, Bestand, Rückfluss, Kennzahlen) | Berichte 10 |
| Geplatzte Lastschrift ausgleichen (Rate als beglichen markieren) | Verträge 4 |
| Rücklastschrift ans Planende anhängen, Abgleich mit GoCardless | Verträge 5 |
| Schulden einer Kundin im Profil sehen | Kundenverwaltung 4 |
| Mahnprozess führen, Zahlungen erfassen, abschreiben | Serie Forderungen |

---

## Für Entwickler

### Was zählt als Schuld?

Im ersten Schritt zählen genau zwei Zahlungsstatus als „geplatzte Lastschrift":

| Status | Bedeutung |
|--------|-----------|
| **Fehlgeschlagen** (`failed`) | Die Lastschrift wurde nicht eingelöst (z. B. Konto nicht gedeckt) |
| **Rückbuchung** (`chargedback`) | Der Kunde hat die bereits eingezogene Lastschrift zurückgebucht |

Beides ist Geld, das nicht (dauerhaft) angekommen ist. Der **Schuldenbetrag pro Kunde** ist die Summe der Beträge genau dieser Raten – er deckt sich damit exakt mit den Zeilen der Detailliste.

!!! tip "Beglichene Rücklastschriften verlassen das Schulden-Set"
    Wird eine geplatzte Rate im Vertrag manuell **als beglichen markiert** (z. B. per Überweisung ausgeglichen – Button „Als beglichen markieren" im Zahlungen-Tab, siehe `CONTRACTS-SEPA-MODULE.md`), wechselt ihr Status auf `paid`. Damit fällt sie automatisch aus `scopeBounced()` heraus und zählt nicht mehr als Schuld. Eine eventuell erfasste **RLS-Gebühr** (`return_fee_cents`) ist bewusst **nicht** Teil dieser Schulden-Summe.

!!! tip "Angehängte Rücklastschriften (seit 31.07.2026)"
    Wird eine geplatzte Rate im Vertrag über **„RLS anhängen"** ans Ende des Zahlungsplans verschoben, verschwindet sie aus dieser Liste — der Betrag ist dann keine offene Schuld mehr, sondern eine terminierte Rate. Technisch: Die Rate wechselt von `failed`/`chargedback` auf `paid` mit `direct_payment_method = 'rescheduled'` und fällt damit aus `ContractPayment::scopeBounced()`. Details: `CONTRACTS-SEPA-MODULE.md`.

!!! tip "Pausierte Verträge"
    Wird ein Vertrag **unbefristet pausiert** (Schuldner, siehe SEPA-Pausierung in `CONTRACTS-SEPA-MODULE.md`), sind seine offenen Raten `cancelled` — sie zählen damit **nicht** als geplatzte Lastschrift/Schuld. Erst bei „Fortsetzen" entstehen wieder aktive Raten.

!!! note "Noch nicht enthalten"
    Überfällige, aber noch nicht eingezogene Raten, andere Schuldenquellen sowie ein Mahnwesen sind bewusst **nicht** Teil dieser ersten Stufe (siehe [Erweiterbarkeit](#erweiterbarkeit)). Das Mahnwesen ist inzwischen als eigenes Modul entstanden — [Forderungsmanagement](FORDERUNGSMANAGEMENT.md).

### Architektur

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

### Datenquelle & Berechnung

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

### Die beiden Listen (Datenherkunft)

Beide Seiten sind standortübergreifend (kein Standortfilter), gebändert (`table-glattt-striped`), alle Spalten client-seitig sortierbar; das Suchfeld filtert client-seitig. Bedienung: Nutzerhandbuch, Finanzen 1.

**Basisseite `/hub/debts`** — zwei Kennzahlen (*Kunden mit Schulden* = Anzahl Kunden mit mindestens einer geplatzten Lastschrift, *Gesamtschulden* = Summe aller geplatzten Lastschriften) und die Kundentabelle; Standard-Sortierung Schuld absteigend, Suche nach Kundenname oder Kundennummer:

| Spalte | Herkunft |
|--------|----------|
| **Kunde** | Name aus Phorest mit **Kundennummer** (`#externalId`) darunter (Phase 2 via `getClients()`); verlinkt auf das Kundenprofil |
| **Geplatzte Lastschriften** | `bounced_count` der Aggregation |
| **Älteste Fälligkeit** | `MIN(due_date)` der geplatzten Raten |
| **Schulden** | `SUM(amount_cents)` (rot, `--color-danger`) |

**Unterseite `/hub/debts/failed-debits`** — jede einzelne geplatzte Lastschrift; Standard-Sortierung Fälligkeit absteigend, Suche nach Kundenname, Kundennummer, Fehlergrund (deutsch wie englisch) oder Bankcode:

| Spalte | Herkunft |
|--------|----------|
| **Kunde** | wie oben |
| **Fällig am** | `due_date` |
| **Rate** | `installment_number` |
| **Status** | `status_label` („Fehlgeschlagen" / „Rückbuchung", rot) plus Anzahl Einzugsversuche |
| **Grund** | Rücklastschrift-Grund auf Deutsch, abgeleitet aus dem Bankcode (`GoCardlessFailureReason::label()`), darunter der Code selbst; der englische Originaltext von GoCardless hängt als Tooltip daran. Unbekannte Codes zeigen den Originaltext. |
| **Betrag** | `formatted_amount` (rot) |
| **Vertrag** | Link zur Vertragsdetailseite |

### Routen

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

### Controller

`DebtController` liefert Shells + JSON (zweistufiges Laden):

- **`index()` / `failedDebits()`** – rendern nur die Seiten-Shell (kein Phorest-Zugriff, sofort schnell).
- **`getData()`** – JSON: aggregiert geplatzte Raten pro Kunde (siehe oben), inkl. Gesamtsumme. Ohne Namen.
- **`getFailedDebitsData()`** – JSON: alle geplatzten Raten (`bounced()->with('contract')->orderByDesc('due_date')`) inkl. Status-Label, Fehlergrund und Vertrags-Link. Ohne Namen.
- **`getClients()`** – JSON (Phase 2): löst für eine ID-Liste Kundenname **+ Kundennummer** (`externalId`) via `getClientDataBulk()` auf.

### Wiederverwendete Bausteine

Das Modul entstand primär durch **Wiederverwendung**:

- **Kundennamen + Kundennummer** werden über den Trait `ResolvesClientData::getClientDataBulk()` gebündelt aufgelöst (Cache-Key `client_data_{id}`, 300 s TTL, plus paralleler HTTP-Pool `PhorestApiService::getClientsParallel()` für nicht gecachte IDs; `externalId` = Kundennummer). Der Trait wurde aus `ContractController` extrahiert und wird jetzt von beiden Controllern genutzt; `getClients()` spiegelt `ContractController::getContractsClientData()`.
- **Status-Labels/-Farben, Betragsformatierung** kommen aus den Accessors von `ContractPayment` (`status_label`, `status_color`, `formatted_amount`).
- **UI** nutzt das bestehende Design-System (`table-glattt-container`, `table-glattt table-glattt-striped` für Zebra-Zeilen, `card-glattt`, `badge-glattt`) sowie das **Skeleton-/Zwei-Phasen-Lademuster** und die **sortierbaren Spalten** der Vertragsliste (`hub/contracts/index.blade.php`); Schuldenbeträge sind über `--color-danger` rot hervorgehoben.

### Berechtigung

Der Menüpunkt **Schulden** in der Sidebar ist nur mit der Berechtigung `view_debts` sichtbar. Die Permission `view_debts` (Label „Schulden sehen", `group_key = schulden`) wird per Migration idempotent angelegt und `super_admin` + `admin` zugewiesen. Im Rollen-Editor erscheint sie in einer eigenen Gruppe **„Schulden"** (`RoleForm::groupMeta()`).

Zum Nachziehen in bestehenden Umgebungen:

```bash
php artisan migrate            # Produktion / Staging
# alternativ (idempotent):
php artisan db:seed --class=PermissionSeeder
```

### Erweiterbarkeit

Die Basis ist bewusst schmal gehalten. Naheliegende nächste Schritte:

- **Weitere Schuldenquellen** neben geplatzten Lastschriften (z. B. überfällige, noch nicht eingezogene Raten). Für Letzteres existiert bereits `ContractPayment::scopeOverdue()`.
- **Mahnwesen / Dunning** – die Infrastruktur `contract_payment_reminders` (Model `ContractPaymentReminder`, mit `level`, `fee_cents`, Versandkanälen) ist bereits vorhanden, aber noch nicht angebunden; der geführte Mahnprozess ist seit 08/2026 als eigenes Modul umgesetzt ([Forderungsmanagement](FORDERUNGSMANAGEMENT.md)).
- **Aktionen aus der Liste** – Wiederholung fehlgeschlagener Einzüge (`ContractPayment::scheduleRetry()`, Accessor `can_retry`) oder „als bezahlt markieren" (`markAsPaid()`) direkt aus der Schulden-Ansicht statt nur über das Vertragsdetail.
- **Tab „Forderungsmanagement"** im Kundenprofil (siehe `CLIENT-DETAIL-MODULE.md`) könnte auf denselben Scope aufsetzen.

Siehe auch: [Verträge & SEPA](CONTRACTS-SEPA-MODULE.md), [Forderungsmanagement](FORDERUNGSMANAGEMENT.md), [GoCardless API](GOCARDLESS-API.md), [Berechtigungssystem](BERECHTIGUNGSSYSTEM.md).
