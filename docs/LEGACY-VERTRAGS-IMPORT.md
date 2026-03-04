# Legacy-Vertrags-Import

> **Status:** ✅ Implementiert  
> **Datum:** 04.03.2026  
> **Artisan-Commands:** `contracts:import-legacy`, `contracts:resolve-legacy-client-ids`

## Übersicht

Import von ~13.000 Altverträgen aus einer CSV-Datei (Google Sheets Export) in die Hub-Vertragstabelle. Die CSV enthält alle historischen SEPA-Lastschriftverträge seit November 2016.

## Datenfluss

```
CSV-Datei (Legacy-System)
    │
    ▼
┌──────────────────────────┐
│  contracts:import-legacy │
│  (Artisan Command)       │
├──────────────────────────┤
│  1. CSV einlesen         │
│  2. Deduplizieren        │
│  3. Batch-Verarbeitung   │
│  4. Validierung          │
│  5. DB-Insert            │
│     client_id = NULL     │
│     legacy_kundennummer  │
│       = externalId       │
└──────────┬───────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
 contracts    contract_mandates
 (source=     (SEPA-Daten)
  'legacy')
           │
           ▼
┌────────────────────────────────────┐
│  contracts:resolve-legacy-client-ids│
├────────────────────────────────────┤
│  1. Legacy-Verträge ohne client_id │
│  2. Alle Phorest-Clients laden     │
│     (inkl. archivierte, paginiert) │
│  3. externalId → clientId Map      │
│  4. client_id UPDATE               │
└────────────────────────────────────┘
```

## CSV-Spalten-Mapping

| CSV-Spalte | DB-Feld | Beschreibung |
|------------|---------|-------------|
| Lastschrift Nummer (A) | `legacy_lastschrift_nummer` | Eindeutige ID aus Altsystem |
| Datum (B) | `signed_at` | Erfassungsdatum |
| Institut (C) | `branch_id` | → Phorest Branch-ID via Mapping |
| Kundennummer (D) | `legacy_kundennummer` | Phorest externalId (z.B. BI007039) → wird via Resolver zu `client_id` |
| M-REF (E) | `contract_number` / `mandate_reference` | Mandatsreferenz |
| Spezialist (G) | `legacy_specialist` | Kürzel als Freitext |
| Produkt (N) | `legacy_product_name` | z.B. "glattt Paket Ganzkörper" |
| Zonen-Anzahl (O) | `body_zone_count` | Numerisch (1–8) |
| Körper-zonen (P) | `body_zone_description` | Freitext (z.B. "Achseln, Intim") |
| Art des KREDITS (AA) | `status` + `payment_method` | Statusbestimmung |
| Monate Lastschrift (AB) | `installment_count` | Ratenzahl |
| Monatl. SEPA Betrag (AC) | `monthly_amount_cents` | Rate in Cent |
| IBAN (AD) | `payer_iban` | Bankverbindung |
| Mandats-Datum (AE) | `mandate_signed_at` | Unterschriftsdatum |
| VON SOLLTE (AG) | `start_date` / `first_payment_date` | Zahlungsbeginn |
| Total (AT) | `total_value_cents` | Gesamtwert in Cent |

## Branch-Mapping

| CSV Institut | Phorest Branch-ID | Standort |
|-------------|-------------------|----------|
| 01.BI | `urLYs9iAs3RUBrYaDZY9ew` | Bielefeld |
| 02.H | `0QHO0ZNAPJJsu1fVn2EBtA` | Hannover |
| 03.OS | `4Awk00OHdGhthWUrNgxakQ` | Osnabrück |
| 04.HB | `xcsxL7OJZie5KvhsWdSc8w` | Hamburg (HB) |
| 05.BS | `GE-3neZf8hpTp94gmhlKTw` | Braunschweig |

**Fallback:** Wenn Institut-Spalte leer → Branch wird aus Kundennummer-Prefix abgeleitet (BI→01.BI, H→02.H, etc.)

## Status-Mapping

| CSV "Art des KREDITS" | Hub-Status | Payment Method |
|----------------------|------------|----------------|
| `normal`, `18 Monate`, `24 Monate`, `länger` | `active` (wenn BIS > heute) / `completed` (wenn BIS ≤ heute) | `sepa` |
| `direkt` | `completed` | `direct` |
| `Widerruf` | `cancelled` | `sepa` |

## Deduplizierung

Pro Kundennummer wird nur die **aktuellste Zeile** (höchste Lastschrift-Nummer) importiert.

- CSV-Zeilen gesamt: **13.093**
- Nach Deduplizierung: **10.069** eindeutige Verträge
- Duplikate entfernt: **3.024**

## Verwendung

### Dry-Run (ohne DB-Änderungen)
```bash
php artisan contracts:import-legacy "/pfad/zur/datei.csv" --dry-run --force
```

### Echten Import starten (in Batches)
```bash
# Batch 1: Die neuesten 1000 Verträge
php artisan contracts:import-legacy "/pfad/zur/datei.csv" --batch=1000 --offset=0

# Batch 2
php artisan contracts:import-legacy "/pfad/zur/datei.csv" --batch=1000 --offset=1000

# ... usw. bis alle importiert sind
```

### Alle auf einmal
```bash
php artisan contracts:import-legacy "/pfad/zur/datei.csv" --batch=99999 --force
```

### Client-IDs auflösen (nach Import)

Der Import speichert die Kundennummer (Phorest externalId) in `legacy_kundennummer` und setzt `client_id = NULL`. Die echten Phorest Client-IDs werden danach aufgelöst:

```bash
# Dry-Run (zeigt was aufgelöst wird)
php artisan contracts:resolve-legacy-client-ids --dry-run --force

# Echte Auflösung
php artisan contracts:resolve-legacy-client-ids --force
```

Das Resolver-Command:

1. Lädt **alle** Phorest-Clients paginiert (inkl. archivierte, ~20.000)
2. Baut eine `externalId → clientId` Map (speicheroptimiert, keine Rohdaten im RAM)
3. Aktualisiert `client_id` für alle Legacy-Verträge mit Match
4. Loggt nicht aufgelöste Kundennummern (typisch: Tippfehler in der CSV)

**Auflösungsrate:** 9.889 / 10.062 (**98,3%**) — 173 ohne Match (fehlerhafte Kundennummern)

### Optionen

| Option | Beschreibung | Default |
|--------|-------------|---------|
| `csv` | Pfad zur CSV-Datei | (Pflicht) |
| `--batch` | Anzahl pro Batch | 1000 |
| `--offset` | Offset (überspringt N Verträge) | 0 |
| `--dry-run` | Simulation ohne DB-Änderungen | false |
| `--force` | Keine Bestätigung nötig | false |

## Idempotenz

Der Import ist **idempotent** — bereits importierte Verträge werden anhand der `legacy_lastschrift_nummer` erkannt und übersprungen. Ein erneuter Lauf importiert nur fehlende Einträge.

## Migrationen

### `2026_03_04_100000_add_legacy_fields_to_contracts_table.php`

Neue Spalten auf `contracts`:

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `source` | varchar(20), default 'hub' | `hub` oder `legacy` |
| `legacy_lastschrift_nummer` | unsigned int, nullable, unique | LS-Nr. aus Altsystem |
| `legacy_product_name` | varchar, nullable | Produktbezeichnung (Freitext) |
| `legacy_specialist` | varchar(50), nullable | Spezialist-Kürzel |
| `body_zone_description` | text, nullable | Körperzonen-Beschreibung |

Außerdem: `price_list_id` und `seller_id` werden **nullable** gemacht (Altverträge haben keine Preisliste/User-Zuordnung).

### `2026_03_04_161532_add_legacy_kundennummer_to_contracts_table.php`

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `legacy_kundennummer` | varchar, nullable, indexed | Phorest externalId / Kundennummer aus Legacy-CSV |

Außerdem: `client_id` wird **nullable** gemacht (bis Phorest-IDs aufgelöst sind).

Die Migration verschiebt automatisch die externalId von `client_id` nach `legacy_kundennummer` und setzt `client_id = NULL` für alle Legacy-Verträge.

### SQL für Production

```sql
-- Migration 1: Legacy-Felder
ALTER TABLE contracts 
  MODIFY price_list_id BIGINT UNSIGNED NULL,
  MODIFY seller_id BIGINT UNSIGNED NULL;

ALTER TABLE contracts 
  ADD COLUMN source VARCHAR(20) NOT NULL DEFAULT 'hub' AFTER notes,
  ADD COLUMN legacy_lastschrift_nummer INT UNSIGNED NULL AFTER source,
  ADD COLUMN legacy_product_name VARCHAR(255) NULL AFTER legacy_lastschrift_nummer,
  ADD COLUMN legacy_specialist VARCHAR(50) NULL AFTER legacy_product_name,
  ADD COLUMN body_zone_description TEXT NULL AFTER is_full_body,
  ADD UNIQUE INDEX contracts_legacy_lastschrift_nummer_unique (legacy_lastschrift_nummer),
  ADD INDEX contracts_source_index (source);

-- Migration 2: Kundennummer + client_id nullable
ALTER TABLE contracts
  ADD COLUMN legacy_kundennummer VARCHAR(255) NULL AFTER legacy_lastschrift_nummer,
  ADD INDEX contracts_legacy_kundennummer_index (legacy_kundennummer),
  MODIFY client_id VARCHAR(255) NULL;
```

## Import-Ergebnis (Lokal)

| Metrik | Wert |
|--------|------|
| Legacy-Verträge | **10.062** |
| SEPA-Mandate | **8.773** |
| Status: aktiv | 1.962 |
| Status: abgeschlossen | 7.555 |
| Status: storniert (Widerruf) | 545 |
| Zahlungsart: SEPA | ~9.400 |
| Zahlungsart: Direkt | ~665 |

## Scopes (Contract Model)

```php
// Nur Legacy-Verträge
Contract::legacy()->get();

// Nur Hub-Verträge
Contract::fromHub()->get();

// Kombination
Contract::legacy()->active()->forBranch('urLYs9iAs3RUBrYaDZY9ew')->count();
```

## Hinweise

- **GoCardless:** Wird separat befüllt, kein Sync durch diesen Import
- **Zahlungen:** Werden nicht generiert — nur Vertrags- und Mandatsdaten
- **Spezialist-Mapping:** Kürzel werden als Freitext gespeichert, Zuordnung zu Hub-Usern erfolgt später
- **Preislisten:** Keine Zuordnung — Gesamtwert wird direkt als `total_value_cents` gespeichert
- **Änderungen:** Bei Kunden mit mehreren Einträgen wird nur die aktuellste Zeile importiert

## Dateien

| Datei | Beschreibung |
|-------|-------------|
| `app/Console/Commands/ImportLegacyContracts.php` | Artisan Import-Command |
| `app/Console/Commands/ResolveLegacyClientIds.php` | Phorest Client-ID Resolver |
| `database/migrations/2026_03_04_100000_add_legacy_fields_to_contracts_table.php` | Migration: Legacy-Felder |
| `database/migrations/2026_03_04_161532_add_legacy_kundennummer_to_contracts_table.php` | Migration: Kundennummer + client_id nullable |
| `app/Models/Contract.php` | Erweitert um `source`, `legacy_*`, `body_zone_description` |
| `app/Services/PhorestApiService.php` | Erweitert um `getAllClientsPaginated()` |

## Git

```
feat(contracts): Legacy-Vertrags-Import aus CSV

- Migration: source, legacy_lastschrift_nummer, legacy_product_name,
  legacy_specialist, body_zone_description auf contracts
- Migration: legacy_kundennummer, client_id nullable
- price_list_id und seller_id nullable für Altverträge
- Artisan Command contracts:import-legacy mit Batch-Verarbeitung,
  Deduplizierung (aktuellste Zeile pro Kunde), Dry-Run, Idempotenz
- Artisan Command contracts:resolve-legacy-client-ids — 
  Paginiert alle Phorest-Clients, baut externalId→clientId Map,
  aktualisiert client_id (Auflösungsrate: 98,3%)
- PhorestApiService: getAllClientsPaginated() (speicheroptimiert)
- Branch-Fallback aus Kundennummer-Prefix
- Datumskorrektur für Tippfehler (0226→2026, 3036→2036)
- Contract Model: SOURCE_HUB/SOURCE_LEGACY Konstanten, legacy()/fromHub() Scopes
```
