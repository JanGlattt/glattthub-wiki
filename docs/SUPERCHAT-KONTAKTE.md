# Superchat-Kontakte & Automatische Verknüpfung

Die Seite **Superchat-Kontakte** (Admin-Bereich, *Superchat-Mapping*, `/admin/superchat-contact-links`)
verwaltet die Verbindung zwischen WhatsApp-Kontakten in Superchat und Phorest-Kunden in
glatttHub: Sie zeigt alle bekannten Superchat-Kontakte mit ihrem Phorest-Match-Status,
startet den vollständigen Kontakt-Sync und den Rückschreib-Job als Hintergrundprozesse und
erlaubt die manuelle Zuordnung. Neue Kontakte werden per Webhook sofort automatisch verknüpft.
Diese Seite beschreibt **Architektur, Hintergrundprozesse, Matching-Logik und Datenmodell**;
die Bedienung steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Admin 4 – Erinnerungen und WhatsApp · Kundenverwaltung 5 – Nachrichten & Kundenservice"
    [hilfe.hub.glattt.com/admin/4/](https://hilfe.hub.glattt.com/admin/4/) — WhatsApp-Regeln, Einwilligungen und Protokolle im Admin-Panel.
    [hilfe.hub.glattt.com/kundenverwaltung/5/](https://hilfe.hub.glattt.com/kundenverwaltung/5/) — wie sich eine fehlende Verknüpfung im Kundenprofil zeigt und über „Neue Nachricht" anlegen lässt.

    Angrenzend: Serie [Admin](https://hilfe.hub.glattt.com/admin/) (Admin-Panel), [SUPERCHAT-WHATSAPP.md](SUPERCHAT-WHATSAPP.md) (Chat im Kundenprofil).

## Für Anwender — Überblick

**Was das Modul leistet.** Damit WhatsApp-Konversationen im Kundenprofil erscheinen, muss der
Superchat-Kontakt einer Phorest-Kundin zugeordnet sein. Diese Zuordnung entsteht **automatisch
über die Mobilnummer** — sofort per Webhook, sobald eine neue Person zum ersten Mal schreibt,
und gesammelt über den Kontakt-Sync. Umgekehrt schreibt der Hub Name, Phorest-Client-ID und
Kundennummer als Attribute nach Superchat zurück, damit das Team dort sieht, mit wem es
spricht. Was die Automatik nicht trifft (andere Nummer in Phorest als bei WhatsApp), wird auf
der Admin-Seite **manuell zugeordnet**.

**Grundsätze:**

- **Telefonnummer ist der einzige automatische Schlüssel** (E.164-normalisiert, beidseitig).
- **Manuelle und bestätigte Zuordnungen werden nie vom Sync überschrieben.**
- **Sync und Übertragung laufen im Hintergrund**; die Status-Karten der Seite zeigen den
  Fortschritt live, ohne Neuladen.

| Vorgang | Anleitung |
|---|---|
| Superchat-Mapping öffnen, Kontakte synchronisieren, Daten an Superchat übertragen, manuell zuordnen | Serie Admin (Admin-Panel), Admin 4 |
| Fehlende Verknüpfung im Kundenprofil erkennen und per neuer Nachricht anlegen | Kundenverwaltung 5 |

## Für Entwickler

### Fachregeln: Status-Karten und Zuordnungsarten

Die beiden Karten oben auf der Filament-Seite spiegeln die Cache-Einträge der Jobs (siehe
[Cache-Keys](#cache-keys)); während ein Job läuft, zeigen sie einen animierten
Fortschrittsbalken und aktualisieren sich jede Sekunde.

**Karte „Kontakte synchronisieren" (blau, `superchat_sync_status`)**

| Wert | Bedeutung |
|------|-----------|
| Gesamt | Anzahl aller in Superchat vorhandenen WhatsApp-Kontakte |
| Neu importiert | Beim letzten Sync neu angelegte Kontakte |
| Aktualisiert | Kontakte, deren Daten aktualisiert wurden |
| Phorest-Matches | Kontakte, die automatisch einem Phorest-Kunden zugeordnet wurden |

**Karte „Daten an Superchat übertragen" (gold, `superchat_push_status`)**

| Wert | Bedeutung |
|------|-----------|
| Gesamt | Anzahl der bestätigten Zuordnungen |
| Übertragen | Kontakte, bei denen die Phorest-Daten erfolgreich zurückgeschrieben wurden |

**Was der Sync tut** (Schaltfläche „Kontakte synchronisieren" → Bestätigungsdialog → „Sync starten"):

1. Lädt alle WhatsApp-Kontakte aus Superchat (paginiert)
2. Vergleicht die Telefonnummern mit den Phorest-Mobilnummern in glatttHub
3. Legt neue Kontakte an bzw. aktualisiert bestehende
4. Versucht automatisch eine Zuordnung per Telefonnummer

**Was die Übertragung tut** (Schaltfläche „Daten an Superchat übertragen" → „Übertragung starten"):
Für alle bestätigten Zuordnungen werden Vorname + Nachname (aus Phorest), die Phorest Client ID
und die External ID / Kundennummer (beide als Custom-Attribut) nach Superchat geschrieben.

**Manuelle Zuordnung:** Button „Zuordnen" je Tabellenzeile verknüpft einen Superchat-Kontakt mit
einem Phorest-Kunden, wenn die Telefonnummern-Suche keinen Treffer liefert.

**Zuordnungsarten (`match_method`):**

| Anzeige | `match_method` | Bedeutung |
|--------|---|-----------|
| Automatisch (Telefon) | `auto` | Telefonnummer stimmte exakt überein |
| Manuell | `manual` | Manuell zugeordnet |
| Kein Mapping | `none` | Noch kein Phorest-Kunde gefunden |

**Automatik bei neuen Kontakten:** Schreibt eine neue Person zum ersten Mal an glattt, legt
Superchat den Kontakt an und sendet `contact_created`; innerhalb weniger Sekunden wird die
Telefonnummer mit Phorest verglichen, bei Treffer die Zuordnung gespeichert und bestätigt
(`is_confirmed = true`), die Phorest-Daten (Name, Client ID, External ID) sofort zurück an
Superchat geschrieben — ab dann erscheint der Kontakt mit vollständigem Match in der Tabelle.

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
|---------|---------|---------|
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

Bei Schema-Änderungen an `superchat_contact_links` erst lokal migrieren, dann SQL-Skript für Produktion erstellen (Hinweis aus der Zeit vor dem automatischen Migrate beim Deploy, 08.07.2026 — seither reicht die Migration im Repo). Die `superchat_contact_links`-Tabelle hat folgende wichtige Spalten:

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
