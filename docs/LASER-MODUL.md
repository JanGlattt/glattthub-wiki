# Laser-Modul – Inventar, Wartung & Nachverfolgung

Internes Modul zur vollständigen Verwaltung der **Cynosure-Vectus-Laser** (dauerhafte Haarentfernung). Es ersetzt die bisherigen Excel-Listen und den WhatsApp-Foto-Versand durch eine lückenlose digitale Nachverfolgung über die gesamte Lebensdauer jedes Geräts und Teils.

---

## Für Endanwender

### Was macht dieses Modul?

Das Laser-Modul bildet den kompletten Lebenszyklus der Laser ab:

- **Inventar**: Geräte mit allen fest verbauten Komponenten und wechselbaren Anbauteilen (je mit eigener Seriennummer)
- **Wöchentliche Wartung** über einen geführten Wizard inkl. Foto-Dokumentation
- **Reparaturen** mit Versand, Rückkehr, Kosten und Pflicht-Rechnung
- **Fehler-Log** mit Foto und Video
- **Verbrauchsmaterial**-Bestände pro Standort mit Nachbestell-Warnung
- **STK** (Sicherheitstechnische Kontrolle) und **Behördenanzeigen**
- **Reports** zu Wartung, STK, Reparaturen, Fehlern und Inventarwert
- Eine **lückenlose Historie** je Gerät/Teil: wann angeschafft, zu welchem Wert, mit Rechnung, plus jede Bewegung, Statusänderung, Wartung, Fehler und Reparatur

### Wo finde ich das Modul?

**Hub → Laser** (Navigation). Die Landing-Seite ist ein **Dashboard** mit vier Warn-Kennzahlen und den zugehörigen Listen:

- Überfällige Wartungen
- Anstehende STKs
- Geräte in Reparatur
- Lager-Unterschreitungen

Über die Buttons oben gelangt man zu **Geräte**, **Reports** und (mit Berechtigung) **Stammdaten**.

### Geräteliste & interaktive Bauteil-Ansicht

**Geräte** zeigt zwei Bereiche:

1. **Geräte-Tabelle** – alle Laser mit Status, Standort, Komponenten-/Anbauteil-Anzahl und Link zu Details
2. **Interaktive Laser-Grafik** – ein Foto des Cynosure Vectus mit klickbaren SVG-Bereichen. Ein Klick auf einen Bereich (oder auf die Legenden-Buttons links) zeigt rechts die zugehörige Tabelle aller Teile dieses Typs:

| Bereich | Zeigt |
|---|---|
| Top-Unit | Top-Unit-Komponenten + Power-Supply-Tabelle darunter |
| Center-Unit | Center-Unit-Komponenten |
| Bottom-Unit | Bottom-Unit-Komponenten + Pumpen-Tabelle darunter |
| Handstück | Alle Handstücke mit SN, Laser-Zuordnung, Standort, Zustand |
| Laserkopf | Laserkopf groß (erste Karte) + Laserkopf klein (zweite Karte) |
| Skintel | Alle Skintels |

Die Seriennummer in jeder Tabelle ist ein Link zur **Detailseite** des Teils.

### Detailseiten für Teile

Jede Komponente und jedes Anbauteil hat eine eigene Detailseite mit fünf Tabs:

| Tab | Inhalt |
|---|---|
| Übersicht | Stammdaten, Typ, Zustand, aktuell verbaut in welchem Laser/Standort |
| Wartungen | Alle Wartungsprotokolle, in denen dieses Teil erfasst wurde (inkl. Datum, Laser, Standort, Techniker; bei Handstück auch Puls-Zähler und Zustand zum Zeitpunkt der Wartung) |
| Reparaturen | Direkte Reparatur-Vorgänge (Datum, Dienstleister, Status, Kosten, Rückkehr, Ergebnis) |
| Verlauf | Alle AssetHistory-Ereignisse + Standort-Bewegungen |
| Anschaffung | Kaufdatum, Wert, Lieferant, Rechnungsnummer, Garantie, Inbetriebnahme, Bemerkung |

Erreichbar über:
- `/hub/laser/components/{serial}` – Komponenten-Detailseite
- `/hub/laser/attachments/{serial}` – Anbauteil-Detailseite

### Gerätedetail

Ein Klick auf **Details** öffnet das **Gerätedetail** mit acht Reitern:

| Reiter | Inhalt |
|--------|--------|
| Übersicht | Stammdaten, Status, Standort |
| Komponenten & Anbauteile | Fest verbaute Teile + montierte Anbauteile mit Zustand |
| Wartungen | Protokoll-Historie, Überfälligkeits-Badge, Button „Wartung durchführen" |
| Reparaturen | Reparatur-Vorgänge, Versenden/Rückkehr |
| Fehler | Fehler-Log |
| Historie | Lückenlose Ereignis-Chronologie |
| Anschaffung | Anschaffungsdaten + Rechnungen |
| STK & Behörde | Sicherheitstechnische Kontrollen + Behördenanzeigen |

> Die **Top-Unit-Seriennummer** ist überall die führende Geräte-ID (Inventar, Behörde, STK, Wartung, Fehler).

### Laser inventarisieren

Button **„Laser inventarisieren"** (Geräteliste) öffnet einen 3-Schritt-Wizard:

1. **Gerät & Komponenten** – Top-Unit-SN (Pflicht, eindeutig), Modell, Betriebsstatus, Standort und optional die weiteren Komponenten (Center-/Bottom-Unit, Power Supply, Pumpe) mit Zustand. Für jeden Komponenten-Typ kann wahlweise eine **neue Seriennummer** eingegeben oder eine **vorhandene Komponente aus dem Lager** ausgewählt werden (nur freie, nicht bereits verbaute Teile werden angeboten).
2. **Anbauteile** – wechselbare Teile (Handstück, großer/kleiner Laserkopf, Skintel) mit SN, Zustand und Pulses-Count; je Teil wählbar, ob montiert oder im Lager. Auch hier kann für jeden Slot aus vorhandenen freien Anbauteilen gewählt oder ein neues Teil erfasst werden.
3. **Anschaffung** (optional) – Datum, Wert, Lieferant, Rechnungsnummer, Garantie, Inbetriebnahme. **Sobald Anschaffungsdaten erfasst werden, ist der Rechnungs-Upload Pflicht.**

Alle Seriennummern müssen eindeutig sein. Nach dem Anlegen springt die Ansicht direkt ins neue Gerätedetail.

### Ersatzteil inventarisieren

Button **„Ersatzteil inventarisieren"** (Geräteliste, neben „Laser inventarisieren") öffnet einen 2-Schritt-Wizard zum Erfassen einzelner Komponenten oder Anbauteile **ohne Laser** (z.B. Lagerbestand, Ersatzteile):

1. **Ersatzteil** – Typ aus einer gemeinsamen Liste aller Komponenten- und Anbauteil-Typen, Seriennummer, Zustand, Puls-Zähler (nur bei Handstück), optionaler Lagerstandort
2. **Anschaffung** (optional) – gleiche Felder wie beim Laser-Wizard inkl. Rechnungs-Upload

Das erfasste Teil erscheint danach in der jeweiligen Spalte der interaktiven Geräte-Ansicht als „nicht verbaut" und kann bei der nächsten Laser-Inventarisierung als vorhandenes Teil ausgewählt werden.

### Wartung durchführen (Wizard)

Die wöchentliche Wartung ist für **aktive** Laser Pflicht. Der Wizard hat drei Schritte:

**Schritt 1 – Flow Maintenance & Reinigung**
Ein **5-Minuten-Countdown** mit harter Sperre: „Weiter" ist erst nach vollständigem Ablauf möglich, der Countdown kann nicht pausiert oder übersprungen werden. Während dieser Zeit keine Arbeiten am Display – die Reinigung des Geräts erfolgt parallel.

**Schritt 2 – Zustandsprüfung je Anbauteil**
Der Wizard hat 4 Substeps für die 4 Anbauteil-Typen (Handstück, Laserkopf groß, Laserkopf klein, Skintel). Je Substep: Zustand (4 Stufen), Puls-Zähler (nur Handstück), **Skintel-Tests** (Handflächenwert 0–50, Unterarmwert 0–50, Skintel-Probleme mit Beschreibung), bis zu **4 Foto-Slots** (Handstück: 4, Laserkopf groß: 2, Laserkopf klein: 2, Skintel: 3). Wird ein Teil als **Defekt** markiert, wird automatisch ein Reparatur-Vorgang erstellt.

**Schritt 3 – Lager-Check & Abschluss**
Zubehör-Checks, Wasserfilter-Wechsel und Anzahl verbrauchter Chiller-Fluid-Flaschen (reduziert den Bestand am Standort). Speichern schreibt das Protokoll und einen Historien-Eintrag.

> **Entwurf:** Wird der Wizard zwischendurch geschlossen, bleibt der Fortschritt (inkl. Countdown-Status) als Entwurf erhalten und kann fortgesetzt werden.

### Fehler erfassen

Über den Reiter **Fehler** lässt sich jederzeit ein Fehler melden: Fehlercode (bekannte Codes 005–110, Sanduhr blau/weiß, „ohne Fehler abgestürzt" oder Freitext), Beschreibung und **Foto und/oder Video**.

### Reparaturen

Ein Reparatur-Vorgang kann manuell angelegt oder automatisch bei einem Defekt erzeugt werden. Ablauf:

1. **Anlegen** – Asset, Defektbeschreibung
2. **Versenden** – Versanddatum, Dienstleister, Zieladresse, Tracking, Kostenvoranschlag. Bei Laser-Reparatur wechselt der Betriebsstatus auf „In Reparatur".
3. **Rückkehr** – Datum, Ergebnis (repariert / ausgetauscht / nicht reparabel), **Pflicht-Rechnung** und Kosten. Bei „ausgetauscht" wird die neue Seriennummer gepflegt und die alte ausgemustert.

### Stammdaten & Verbrauchsmaterial

Unter **Stammdaten** werden Standorte, Reparaturdienstleister und Verbrauchsmaterial-Typen verwaltet. Über **Material-Bestände** werden Bestände pro Standort geführt – mit Mindestbestand-Warnung und Anzeige des nächsten fälligen Wechsels.

### Erinnerungen (Push)

Täglich werden automatisch Push-Benachrichtigungen versendet:

- **STK** 60 und 30 Tage vor Fälligkeit (jeweils einmalig)
- **Überfällige Wartung** je aktivem Laser ohne Protokoll in der laufenden KW
- **Verbrauchsmaterial** unter Mindestbestand

### Reports

Unter **Reports** stehen sechs Auswertungen bereit: Überfällige Wartungen, Anstehende STKs, Geräte in Reparatur (mit Kostensummen), Defekt- & Fehlerquote, Asset-Wert/Inventarübersicht und Reparaturhistorie & -kosten.

---

## Für Entwickler

### Architektur-Überblick

Das Modul folgt der Hub-Konvention: Controller delegieren an Services, Livewire-Komponenten kapseln die interaktiven Flows, Blade-Views sind aus Partials zusammengesetzt. **Keine Filament-Resources** – alles läuft im Hub.

- **Code** (Klassen, Tabellen, Spalten): Englisch · **UI/Enum-Labels**: Deutsch
- Geldbeträge in **Cents** (`*_cents`)
- Datei-Uploads über `gcs-private` (Cloud) bzw. `public` (lokal)
- Berechtigungen über Spatie Permission

### Berechtigungen

| Permission | Zweck |
|-----------|-------|
| `view_laser` | Modul, Geräte, Historie, Reports lesen |
| `perform_laser_maintenance` | Wartungen durchführen & Fehler melden |
| `manage_laser_inventory` | Inventar verwalten (Geräte, Teile, Anschaffung, Standortwechsel) |
| `manage_laser_repairs` | Reparaturen, STK & Behördenanzeigen verwalten |
| `manage_laser_master_data` | Stammdaten (Standorte, Dienstleister, Verbrauchsmaterial) |

Definiert in `database/seeders/PermissionSeeder.php`.

### Datenmodell (Tabellen)

Alle Tabellen mit Prefix `laser_` (bzw. `lasers`). Migrationen: `database/migrations/2026_06_27_100000` … `100019`.

| Tabelle | Model | Zweck |
|---------|-------|-------|
| `lasers` | `Laser` | Gerät; Route-Key = `top_unit_serial` |
| `laser_components` | `LaserComponent` | Fest verbaute Komponente (Self-FK `parent_component_id`); `laser_id` ist nullable (Lagerbestand möglich) |
| `laser_attachments` | `LaserAttachment` | Wechselbares Anbauteil (montiert oder im Lager); Unique auf `(serial, typ)` |
| `laser_acquisitions` | `Acquisition` | Anschaffung (polymorph 1:1, Wert in Cents) |
| `laser_location_movements` | `LocationMovement` | Standortbewegung (polymorph) |
| `laser_locations` | `LaserLocation` | Standort (optionaler FK auf Phorest-Branch) |
| `laser_repair_providers` | `RepairProvider` | Reparaturdienstleister |
| `laser_consumables` | `Consumable` | Verbrauchsmaterial-Typ |
| `laser_consumable_stocks` | `ConsumableStock` | Bestand je Material+Standort |
| `laser_media_files` | `LaserMediaFile` | Polymorpher Upload (`kind`: invoice/photo/video/protocol/proof) |
| `laser_asset_histories` | `AssetHistory` | Lückenlose Ereignis-Historie (polymorph) |
| `laser_maintenance_protocols` | `MaintenanceProtocol` | Wöchentliches Wartungsprotokoll |
| `laser_maintenance_drafts` | `MaintenanceDraft` | Serverseitiger Wizard-Entwurf |
| `laser_errors` | `LaserError` | Fehler-Log |
| `laser_repairs` | `Repair` | Reparatur-Vorgang (polymorph) |
| `laser_safety_inspections` | `SafetyInspection` | STK (jährlich) |
| `laser_authority_notifications` | `AuthorityNotification` | Behördenanzeige |

**Polymorphe Assets:** `Laser`, `LaserComponent` und `LaserAttachment` sind über eine **Morph-Map** (`LASER` / `KOMPONENTE` / `ANBAUTEIL`, nicht-strikt) in `AppServiceProvider` registriert. Das Trait `App\Models\Laser\Concerns\IsLaserAsset` liefert `acquisition()`, `assetHistories()` und `locationMovements()`.

### Enums (`app/Enums/Laser/`)

`Zustand`, `KomponentenTyp`, `AnbauteilTyp`, `StandortTyp`, `Betriebsstatus`, `AssetTyp`, `EreignisTyp`, `VerbrauchsmaterialTyp`, `Einheit`, `MediaKind`, `Fehlercode`, `FehlerStatus`, `ReparaturStatus`, `ReparaturAusloeser`, `ReparaturErgebnis`, `VersandRichtung`, `STKStatus`. Jedes Enum hat `label()` (Deutsch) und meist `options()` für Dropdowns; Status-Enums zusätzlich `color()` für Badges.

### Services (`app/Services/Laser/`)

| Service | Verantwortung |
|---------|---------------|
| `AssetHistoryService` | Zentraler Event-Logger (`record()`), von allen Flows genutzt |
| `LaserMediaService` | Polymorpher Datei-Upload (`upload()`/`uploadMany()`) |
| `LaserInventoryService` | Anlage, Standortwechsel, Statuswechsel, Mount/Unmount, Anschaffung |
| `MaintenanceService` | Wartungsabschluss; Zustände, Chiller-Fluid-Verbrauch, **AUTO_DEFEKT → Reparatur** |
| `RepairService` | Reparatur anlegen/versenden/zurücknehmen inkl. Statuslogik |
| `ComplianceService` | STK + Behördenanzeige; `refreshStatuses()` |
| `ConsumableService` | Bestandsführung pro Standort, Low-Stock, fällige Wechsel |
| `LaserDashboardService` | Dashboard-KPIs + Warnlisten |
| `LaserReportService` | Aggregationen für die 6 Reports |

### Livewire-Komponenten (`app/Livewire/Hub/Laser/`)

`LaserMasterData`, `LaserInventoryForm`, `LaserPartInventoryForm`, `MaintenanceWizard`, `LaserErrorForm`, `RepairForm`, `ComplianceForm`, `ConsumableStocks`. Modale öffnen via Alpine-Event (`$dispatch('open-…', { … })`) und `#[On(...)]`-Listener. Dropdowns nutzen die Komponente `<x-dropdown-glattt model="$wire.…">`.

### Geschäftsregeln (Auszug)

1. Top-Unit-SN ist die führende Geräte-ID.
2. Wöchentliche Wartungspflicht je **AKTIV**-Laser; „überfällig", wenn in laufender KW kein Protokoll (`Laser::isMaintenanceOverdue()`).
3. STK jährlich; Reminder 60 + 30 Tage vorher.
4. **DEFEKT** (Komponente/Anbauteil) → automatischer Reparatur-Vorgang (`AUTO_DEFEKT`, idempotent).
5. Versand → Laser `IN_REPARATUR` + `AssetHistory(REPARATUR_VERSAND)`.
6. Rückkehr → `AssetHistory(REPARATUR_RUECKKEHR)`; bei `AUSGETAUSCHT` neue SN, alte `VERSCHROTTUNG`.
7. Pulses werden nur protokolliert (keine Warnung).
8. Verbrauchsmaterial: Warnung bei Unterschreitung Mindestbestand.
9. Rechnung Pflicht-Upload bei Anschaffung **und** Reparatur-Rückkehr.
10. Mind. 1 Foto pro Wartung; Video nur im Fehler-Modal.
11. Jedes relevante Ereignis schreibt automatisch einen `AssetHistory`-Eintrag.

### Scheduler & Push

- Command `laser:check-reminders` (`app/Console/Commands/CheckLaserReminders.php`), täglich 07:30 in `routes/console.php`.
- Push über `PushNotificationService::sendByType($key, [...])` (Queue `push`). Typen: `laser.maintenance-due`, `laser.stk-due`, `laser.low-stock` (Seeder `PushNotificationTypeSeeder`).

### Routen

Prefix `hub/laser`, Namen `hub.laser.*`: `dashboard`, `master-data`, `consumables`, `devices.index`, `devices.show` ({laser} = `top_unit_serial`), `components.show` ({serial}), `attachments.show` ({serial}), `reports.{index,overdue-maintenance,stk,repairs,defects,asset-value,repair-history}`.

### Tests

`tests/Unit/Laser/` und `tests/Feature/Laser/` – Inventory, Maintenance, Repair, Compliance, Consumable, Dashboard, Reports, Permissions, Attachment-Movement und der Reminder-Command (Push gemockt). Ausführen:

```bash
php artisan test --filter=Laser
```

### Migration der Altdaten (CSV-Import)

Die historischen Wartungsdaten (~2.225 Zeilen, Zeitraum 2022–2025) wurden über das Artisan-Command `laser:import-history` importiert.

```bash
php artisan laser:import-history \
  --fresh \
  "/pfad/zur/datei.csv"
```

`--fresh` löscht alle bestehenden Laser-Tabellen-Inhalte vor dem Import (TRUNCATE).

**Import-Ergebnis:**
- 18 Standorte (`laser_locations`)
- 16 Laser (`lasers`)
- 114 Anbauteile (`laser_attachments`)
- 1.928 Wartungsprotokolle (`laser_maintenance_protocols`)

**CSV-Mapping:**

| CSV-Spalte | DB-Feld | Hinweis |
|---|---|---|
| Maschine | `lasers.top_unit_serial` | Nur Zeilen mit „35-"-Prefix |
| Datum | `datum` | Format TT.MM.JJJJ |
| Raum | `laser_locations.code` | Alle Räume werden als Standorte angelegt |
| Pulses Maschine | `pulses_maschine` | Tausender-Punkt wird entfernt |
| FLOW (LMP) | `flow_lmp` | Komma → Punkt |
| Handstück/Kopf/Skintel REFERENZ | `*_serial` | Uppercase-Normalisierung |
| Status `1./2./3./4.` | `Zustand`-Enum | 1./2.=GUT, 3.=KLEINE\_RISSE, 4.=GROSSE\_RISSE |
| Z.*- und *.Lager-Räume | `Betriebsstatus::IM_LAGER` | Für Laser-Betriebsstatus |

**Bekannte Besonderheiten:**
- Keine Center-Unit, Bottom-Unit, Power Supply, Pumpe in den Altdaten
- `vsn1n15004` → `VS1N15004`, `RHPF100011` → `RHPF10011` (Tippfehler-Korrekturen)
- `MHPJ24013` in Laserkopf-Groß-Spalte → als Handstück importiert
- `VL3J25002` taucht als Laserkopf groß und klein auf → Unique-Constraint auf `(serial, typ)` geändert (Migration 100019)
- Techniker-Kürzel nicht auf User gemappt (`laser_specialist_user_id = NULL`)

**Nötige Schema-Änderungen vor Prod-Import** (Migrationen 100018 + 100019):

```sql
-- Migration 100018: laser_components.laser_id nullable + aktueller_standort_id
ALTER TABLE `laser_components`
  DROP FOREIGN KEY `laser_components_laser_id_foreign`,
  MODIFY COLUMN `laser_id` BIGINT UNSIGNED NULL,
  ADD CONSTRAINT `laser_components_laser_id_foreign`
    FOREIGN KEY (`laser_id`) REFERENCES `lasers`(`id`) ON DELETE CASCADE,
  ADD COLUMN `aktueller_standort_id` BIGINT UNSIGNED NULL AFTER `laser_id`,
  ADD CONSTRAINT `laser_components_aktueller_standort_id_foreign`
    FOREIGN KEY (`aktueller_standort_id`) REFERENCES `laser_locations`(`id`) ON DELETE SET NULL;

-- Migration 100019: laser_attachments Unique serial → (serial, typ)
ALTER TABLE `laser_attachments`
  DROP INDEX `laser_attachments_serial_unique`,
  ADD UNIQUE KEY `laser_attachments_serial_typ_unique` (`serial`, `typ`);
```
