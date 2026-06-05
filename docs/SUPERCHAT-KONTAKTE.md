# Superchat-Kontakte & Automatische Verknüpfung

Die Seite **Superchat-Kontakte** (im Admin-Bereich unter *Superchat-Mapping*) verwaltet die Verbindung zwischen WhatsApp-Kontakten in Superchat und Phorest-Kunden in glatttHub. Sie zeigt alle bekannten Superchat-Kontakte mit ihrem Phorest-Match-Status und ermöglicht den manuellen sowie automatischen Abgleich.

---

## Für Endanwender

### Wo finde ich die Seite?

Admin-Bereich → linke Navigation → **Superchat-Mapping** (oder direkt `/admin/superchat-contact-links`).

### Was zeigen die Status-Karten?

Oben auf der Seite gibt es zwei Karten nebeneinander:

**Karte „Kontakte synchronisieren" (blau)**

| Wert | Bedeutung |
|------|-----------|
| Gesamt | Anzahl aller in Superchat vorhandenen WhatsApp-Kontakte |
| Neu importiert | Beim letzten Sync neu angelegte Kontakte |
| Aktualisiert | Kontakte, deren Daten aktualisiert wurden |
| Phorest-Matches | Kontakte, die automatisch einem Phorest-Kunden zugeordnet wurden |

**Karte „Daten an Superchat übertragen" (gold)**

| Wert | Bedeutung |
|------|-----------|
| Gesamt | Anzahl der bestätigten Zuordnungen |
| Übertragen | Kontakte, bei denen die Phorest-Daten erfolgreich zurückgeschrieben wurden |

Während ein Job läuft, erscheint ein **animierter Fortschrittsbalken** in der jeweiligen Karte. Die Karte aktualisiert sich automatisch jede Sekunde — kein manuelles Neu-Laden nötig.

### Kontakte synchronisieren (manuell)

Schaltfläche **„Kontakte synchronisieren"** oben rechts → Bestätigungsdialog → **Sync starten**.

Der Sync läuft im Hintergrund und:

1. Lädt alle WhatsApp-Kontakte aus Superchat (paginiert)
2. Vergleicht die Telefonnummern mit den Phorest-Mobilnummern in glatttHub
3. Legt neue Kontakte an bzw. aktualisiert bestehende
4. Versucht automatisch eine Zuordnung per Telefonnummer

Die Karte oben zeigt den Fortschritt in Echtzeit.

### Daten an Superchat übertragen (manuell)

Schaltfläche **„Daten an Superchat übertragen"** oben rechts → Bestätigungsdialog → **Übertragung starten**.

Für alle bestätigten Zuordnungen werden folgende Daten zu Superchat zurückgeschrieben:

- Vorname + Nachname (aus Phorest)
- Phorest Client ID (als Custom-Attribut)
- External ID / Kundennummer (als Custom-Attribut)

### Kontakte manuell zuordnen

In der Tabelle gibt es pro Zeile den Button **„Zuordnen"**. Damit kann ein Superchat-Kontakt manuell mit einem Phorest-Kunden verknüpft werden, falls die automatische Telefonnummern-Suche keinen Treffer liefert.

### Zuordnungsarten

| Symbol | Bedeutung |
|--------|-----------|
| Automatisch (Telefon) | Telefonnummer stimmte exakt überein |
| Manuell | Manuell zugeordnet |
| Kein Mapping | Noch kein Phorest-Kunde gefunden |

### Was passiert automatisch bei neuen Kontakten?

Wenn eine neue Person zum ersten Mal eine WhatsApp-Nachricht an glattt schreibt, legt Superchat automatisch einen neuen Kontakt an und sendet ein `contact_created`-Webhook-Event an glatttHub. Innerhalb weniger Sekunden passiert Folgendes vollautomatisch:

1. Telefonnummer des neuen Kontakts wird mit Phorest-Kunden verglichen
2. Bei Treffer: Zuordnung wird sofort gespeichert und bestätigt (`is_confirmed = true`)
3. Phorest-Daten (Name, Client ID, External ID) werden sofort zurück an Superchat geschrieben
4. Ab diesem Moment erscheint der Kontakt mit vollständigem Phorest-Match in der Tabelle

---

## Für Entwickler

### Architektur-Überblick

```
                 ┌─────────────────────────────────────────┐
                 │         Superchat-Kontakte (Filament)    │
                 │  ListSuperchatContactLinks               │
                 │  ┌────────────────┐ ┌─────────────────┐ │
                 │  │ Sync-Widget    │ │ Push-Widget      │ │
                 │  │ (1s polling)   │ │ (1s polling)     │ │
                 │  └────────────────┘ └─────────────────┘ │
                 │  [Kontakte sync.] [Daten übertragen]     │
                 └─────────────────────────────────────────┘
                          │                        │
           nohup artisan  │                        │ nohup artisan
           superchat:sync │                        │ superchat:push-contacts
                          ▼                        ▼
         SyncSuperchatContactsJob    PushContactDataToSuperchatJob
                          │
                          ▼
                   superchat_contact_links
                          ▲
                          │ contact_created Webhook
                          │ (sofortige Verarbeitung)
                 ProcessSuperchatWebhookJob
```

### Zentrale Dateien

| Pfad | Zweck |
|------|-------|
| `app/Filament/Resources/SuperchatContactLinks/Pages/ListSuperchatContactLinks.php` | Filament-Seite: Actions (sync/push), Background-Process-Start via nohup |
| `app/Filament/Widgets/SuperchatSyncStatusWidget.php` | Livewire-Widget für Sync-Status, pollt `superchat_sync_status` Cache |
| `app/Filament/Widgets/SuperchatPushStatusWidget.php` | Livewire-Widget für Push-Status, pollt `superchat_push_status` Cache |
| `resources/views/filament/widgets/superchat-sync-status.blade.php` | Blade: Sync-Karte mit Fortschrittsbalken |
| `resources/views/filament/widgets/superchat-push-status.blade.php` | Blade: Push-Karte mit Fortschrittsbalken |
| `app/Jobs/SyncSuperchatContactsJob.php` | Vollständiger Sync aller Superchat-Kontakte |
| `app/Jobs/PushContactDataToSuperchatJob.php` | Phorest-Daten zurück an Superchat schreiben |
| `app/Jobs/ProcessSuperchatWebhookJob.php` | Verarbeitet contact_created/updated/deleted Webhooks |
| `app/Console/Commands/SyncSuperchatContactsCommand.php` | Artisan-Wrapper `superchat:sync-contacts` |
| `app/Console/Commands/PushSuperchatContactsCommand.php` | Artisan-Wrapper `superchat:push-contacts` |
| `app/Models/SuperchatContactLink.php` | Eloquent-Model für Kontakt-Mapping |
| `config/superchat.php` | API-Key, Custom-Attribute-IDs |

### Hintergrundprozesse (MAMP + Cloud Run)

Die Sync- und Push-Jobs laufen als losgelöste Prozesse, weil:

- **MAMP (mod_php):** `dispatchAfterResponse()` funktioniert nicht — der Browser blockiert trotzdem
- **Cloud Run:** kein dauerhafter Queue-Worker

Start via Shell-Befehl mit `nohup … &` — entkoppelt den Prozess von Apache/PHP-FPM:

```php
sprintf('nohup %s %s %s >> %s 2>&1 &',
    escapeshellarg($phpBinary),
    escapeshellarg(base_path('artisan')),
    escapeshellarg($command),
    escapeshellarg(storage_path('logs/superchat-background.log'))
)
```

!!! warning "Process::start() reicht nicht"
    `Process::start()` ohne nohup wird durch Apache SIGHUP gekillt, sobald der HTTP-Request endet.

### Live-Fortschritt im Widget

Die Fortschrittsanzeige nutzt zwei Mechanismen:

1. **Sofortiges Re-Render beim Klick:** Die Page-Action dispatcht ein Livewire-Event `superchat-status-updated`, bevor der Background-Prozess startet. Das Widget hört via `#[On('superchat-status-updated')]` zu und rendert sofort mit dem `running`-Status.

2. **1-Sekunden-Polling:** `wire:poll.1s` direkt am Root-`<div>` des Widget-Blade-Templates (nicht via `getPollingInterval()`, da dieses nur für Stats- und Chart-Widgets wirkt).

```html
{{-- superchat-sync-status.blade.php --}}
<div wire:poll.1s>
    ...
</div>
```

Der Job schreibt seinen Fortschritt alle 25 Kontakte in den Cache:

```php
Cache::put(SyncSuperchatContactsJob::CACHE_KEY, [
    'status'    => 'running',
    'total'     => $total,
    'processed' => $processed,
    ...
], now()->addHours(24));
```

### Cache-Keys

| Konstante | Key | Lebt |
|-----------|-----|------|
| `SyncSuperchatContactsJob::CACHE_KEY` | `superchat_sync_status` | 24 h |
| `PushContactDataToSuperchatJob::CACHE_KEY` | `superchat_push_status` | 24 h |

### Automatische Verknüpfung via Webhook

Bei jedem `contact_created`- oder `contact_updated`-Event führt `ProcessSuperchatWebhookJob::handleContactUpsert()` folgende Schritte aus:

**Stufe 1 — Lokale DB (schnell, kein API-Call):**
```php
ClientStatistic::whereNotNull('mobile')
    ->get(...)
    ->first(fn ($cs) => SuperchatApiService::normalizePhone($cs->mobile) === $e164Phone);
```

**Stufe 2 — Phorest-API-Fallback (falls kein lokaler Treffer):**
Probiert mehrere Telefonnummern-Varianten:

| Eingabe | Variante | Beispiel |
|---------|----------|---------|
| E.164 ohne `+` | für Phorest-API | `491605782830` |
| +49 → 0 | deutsches Format | `01605782830` |
| Raw-Wert aus Superchat | Originalformat | `+491605782830` |

**Bei Treffer (beide Stufen):**
- `is_confirmed = true` (Webhook = verlässliche Quelle)
- `match_method = auto`
- `mobile` in `client_statistics` zurückschreiben (für künftige lokale Matches)
- `PATCH /contacts/{superchat_id}` mit Name + Custom-Attributen

**Kein Treffer:**
- `match_method = none`
- Kontakt wird angelegt, kann später manuell zugeordnet werden

!!! note "Webhook läuft synchron"
    Auf Cloud Run gibt es keinen Queue-Worker. Webhook-Events werden via `dispatchSync()` noch im selben HTTP-Request verarbeitet. Der Phorest-API-Fallback kostet bis zu 4 API-Calls (~2–4 s) — das liegt innerhalb des Superchat-Webhook-Timeouts.

### Matching-Details (SyncSuperchatContactsJob)

Der vollständige Sync durchläuft alle Kontakte seitenweise (paginierter Generator) und versucht für jeden Kontakt ohne Mapping dasselbe zwei-stufige Matching. Zusätzlich:

- Nur Kontakte mit mindestens einem `phone`-Handle werden verarbeitet
- Fortschritt wird alle 25 Kontakte in den Cache geschrieben
- Bei 0 Ergebnissen → `status = failed` (API-Fehler oder leere Liste)
- Bestehende manuelle oder bestätigte Zuordnungen werden **nicht** überschrieben

### Superchat API — Cursor-Pagination

!!! warning "next_url ist inkonsistent encoded"
    Der Feldname `pagination.next_url` in der Superchat-API enthält teils URL-encoded, teils nicht-encoded Strings. Ausschließlich `pagination.next_cursor` mit dem `after=`-Query-Parameter verwenden.

Implementiert in `SuperchatApiService::eachPage()` mit Loop-Schutz via `$seenCursors` und 200-Iterationen-Cap.

### Console-Befehle

```bash
# Sync manuell starten (läuft synchron im Terminal)
php artisan superchat:sync-contacts

# Push manuell starten
php artisan superchat:push-contacts

# Log beobachten
tail -f storage/logs/superchat-background.log
```

### Produktiv-DB

Bei Schema-Änderungen an `superchat_contact_links` erst lokal migrieren, dann SQL-Skript für Produktion erstellen. Die `superchat_contact_links`-Tabelle hat folgende wichtige Spalten:

| Spalte | Typ | Bedeutung |
|--------|-----|-----------|
| `superchat_contact_id` | string (unique) | Superchat-interne ID (`ct_…`) |
| `phorest_client_id` | string nullable | Phorest-interne ID |
| `phone` | string nullable | E.164-normalisierte Telefonnummer |
| `match_method` | enum | `none`, `auto`, `manual` |
| `is_confirmed` | boolean | Zuordnung bestätigt |
| `superchat_name` | string nullable | Name aus Superchat |
| `phorest_name` | string nullable | Name aus Phorest |
| `contact_data` | json | Vollständiges Superchat-Kontakt-Objekt |
| `last_synced_at` | datetime | Zeitpunkt des letzten Syncs |
