# Laser-Modul – Inventar, Wartung & Nachverfolgung

Internes Modul zur vollständigen Verwaltung der **Cynosure-Vectus-Laser** (dauerhafte
Haarentfernung). Es ersetzt die bisherigen Excel-Listen und den WhatsApp-Foto-Versand durch eine
lückenlose digitale Nachverfolgung über die gesamte Lebensdauer jedes Geräts und Teils. Diese
Seite beschreibt **Absicht, Fachregeln, Datenmodell, Services, Routen, Scheduler und den
Altdaten-Import**; die Bedienung Schritt für Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Serie „Laser" 1–13 im Nutzerhandbuch"
    [Laser 1 – Dashboard und Geräteliste](https://hilfe.hub.glattt.com/laser/1/) ·
    [2 – Ein Gerät im Detail](https://hilfe.hub.glattt.com/laser/2/) ·
    [3 – Wartung 1: Flow Maintenance](https://hilfe.hub.glattt.com/laser/3/) ·
    [4 – Wartung 2: Laser prüfen](https://hilfe.hub.glattt.com/laser/4/) ·
    [5 – Wartung 3: Anbauteile](https://hilfe.hub.glattt.com/laser/5/) ·
    [6 – Wartung 4: Lager und Abschluss](https://hilfe.hub.glattt.com/laser/6/) ·
    [7 – Fehler melden](https://hilfe.hub.glattt.com/laser/7/) ·
    [8 – Reparaturen abwickeln](https://hilfe.hub.glattt.com/laser/8/) ·
    [9 – STK und Behördenanzeige](https://hilfe.hub.glattt.com/laser/9/) ·
    [10 – Anbauteile im Detail](https://hilfe.hub.glattt.com/laser/10/) ·
    [11 – Laser und Teile inventarisieren](https://hilfe.hub.glattt.com/laser/11/) ·
    [12 – Stammdaten und Verbrauchsmaterial](https://hilfe.hub.glattt.com/laser/12/) ·
    [13 – Reports zum Laser-Park](https://hilfe.hub.glattt.com/laser/13/)

## Inhaltsverzeichnis

- [Für Anwender — Überblick](#fur-anwender-uberblick)
- [Für Entwickler](#fur-entwickler)
    - [Architektur-Überblick](#architektur-uberblick)
    - [Berechtigungen](#berechtigungen)
    - [Oberfläche: Seiten, Reiter und Assistenten](#oberflache-seiten-reiter-und-assistenten)
    - [Wartungsassistent: Countdown, Pflichtfotos, Entwurf](#wartungsassistent-countdown-pflichtfotos-entwurf)
    - [Datenmodell (Tabellen)](#datenmodell-tabellen)
    - [Enums](#enums)
    - [Services](#services)
    - [Livewire-Komponenten](#livewire-komponenten)
    - [Geschäftsregeln (Auszug)](#geschaftsregeln-auszug)
    - [Scheduler & Push](#scheduler-push)
    - [Routen](#routen)
    - [Tests](#tests)
    - [Migration der Altdaten (CSV-Import)](#migration-der-altdaten-csv-import)

---

## Für Anwender — Überblick

**Was das Modul leistet.** Das Laser-Modul (Hub → Laser) bildet den kompletten Lebenszyklus der
Geräte ab: **Inventar** mit allen fest verbauten Komponenten und wechselbaren Anbauteilen (je mit
eigener Seriennummer), die **wöchentliche Wartung** über einen geführten Assistenten mit
Foto-Dokumentation, **Reparaturen** mit Versand, Rückkehr, Kosten und Pflicht-Rechnung, ein
**Fehler-Log** mit Foto und Video, **Verbrauchsmaterial**-Bestände je Standort mit
Nachbestell-Warnung, **STK** (Sicherheitstechnische Kontrolle) und **Behördenanzeigen**,
**Reports** sowie eine **lückenlose Historie** je Gerät und Teil: wann angeschafft, zu welchem
Wert, mit Rechnung, plus jede Bewegung, Statusänderung, Wartung, jeder Fehler und jede Reparatur.
Die Landing-Seite ist ein Dashboard mit vier Warn-Kennzahlen (überfällige Wartungen, anstehende
STKs, Geräte in Reparatur, Lager-Unterschreitungen) und den zugehörigen Listen.

**Grundsätze, die überall gelten:**

- **Die Top-Unit-Seriennummer ist die führende Geräte-ID** — in Inventar, Behörde, STK, Wartung
  und Fehler-Log. Jede Seriennummer im System ist eindeutig.
- **Wöchentliche Wartung ist Pflicht** für jeden aktiven Laser; fehlt in der laufenden
  Kalenderwoche ein Protokoll, gilt das Gerät als überfällig und es geht eine Erinnerung raus.
- **Der 5-Minuten-Countdown der Flow Maintenance lässt sich nicht abkürzen.** Die Zeit zählt
  **der Server**, nicht der Bildschirm: Wird das Fenster geschlossen, läuft sie weiter.
- **Ohne Fotos kein Weiterkommen.** Jede Foto-Kachel ist Pflicht, solange das Teil montiert ist;
  hochgeladene Fotos bleiben im Entwurf erhalten, wenn die Wartung unterbrochen wird.
- **Eine Rechnung ist Pflicht**, sobald Anschaffungsdaten erfasst werden und bei jeder
  Reparatur-Rückkehr.
- **Ein als defekt markiertes Teil erzeugt automatisch einen Reparatur-Vorgang.**
- **Jedes relevante Ereignis landet in der Historie** des Geräts bzw. Teils.

**Wo was erledigt wird** — die Anleitung nennt Felder, Pflichtangaben und Folgewirkungen:

| Vorgang | Anleitung |
|---|---|
| Dashboard lesen, Geräteliste, interaktive Bauteil-Ansicht | Laser 1 |
| Gerätedetail: Reiter, Komponenten und Anbauteile, Historie, Anschaffung | Laser 2 |
| Wartung Schritt 1: Flow Maintenance, Countdown, unterbrochener Entwurf | Laser 3 |
| Wartung Schritt 2: Impulse, FLOW und die Pflichtfotos des Lasers | Laser 4 |
| Wartung Schritt 3: Handstück, Laserköpfe, Skintel, Defekt melden | Laser 5 |
| Wartung Schritt 4: Lager-Check, Abschluss, Protokoll wiederfinden | Laser 6 |
| Fehler erfassen, die Fehlercodes | Laser 7 |
| Reparatur anlegen, versenden, Rückkehr verbuchen | Laser 8 |
| STK und Behördenanzeige erfassen | Laser 9 |
| Anbauteil im Detail: Stammdaten, Wartungen, Verlauf | Laser 10 |
| Laser und Teile inventarisieren, Ersatzteil erfassen | Laser 11 |
| Stammdaten: Standorte, Dienstleister, Verbrauchsmaterial und Bestände | Laser 12 |
| Reports zum Laser-Park | Laser 13 |

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

### Oberfläche: Seiten, Reiter und Assistenten

**Dashboard** (Landing-Seite) — vier Warn-Kennzahlen mit Listen: überfällige Wartungen,
anstehende STKs, Geräte in Reparatur, Lager-Unterschreitungen (`LaserDashboardService`).
Einstiege oben zu **Geräte**, **Reports** und (mit Berechtigung) **Stammdaten**.

**Geräteliste** — Geräte-Tabelle (Status, Standort, Komponenten-/Anbauteil-Anzahl, Link zu
Details) plus **interaktive Laser-Grafik**: ein Foto des Cynosure Vectus mit klickbaren
SVG-Bereichen; ein Klick auf einen Bereich (oder auf die Legenden-Buttons links) zeigt rechts
die Tabelle aller Teile dieses Typs. Die Seriennummer in jeder Tabelle verlinkt die Detailseite
des Teils.

| Bereich | Zeigt |
|---|---|
| Top-Unit | Top-Unit-Komponenten + Power-Supply-Tabelle darunter |
| Center-Unit | Center-Unit-Komponenten |
| Bottom-Unit | Bottom-Unit-Komponenten + Pumpen-Tabelle darunter |
| Handstück | Alle Handstücke mit SN, Laser-Zuordnung, Standort, Zustand |
| Laserkopf | Laserkopf groß (erste Karte) + Laserkopf klein (zweite Karte) |
| Skintel | Alle Skintels |

**Gerätedetail** (acht Reiter):

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

**Detailseiten für Teile** (`/hub/laser/components/{serial}`, `/hub/laser/attachments/{serial}`),
je fünf Tabs:

| Tab | Inhalt |
|---|---|
| Übersicht | Stammdaten, Typ, Zustand, aktuell verbaut in welchem Laser/Standort |
| Wartungen | Alle Wartungsprotokolle, in denen dieses Teil erfasst wurde (inkl. Datum, Laser, Standort, Techniker; bei Handstück auch Puls-Zähler und Zustand zum Zeitpunkt der Wartung) |
| Reparaturen | Direkte Reparatur-Vorgänge (Datum, Dienstleister, Status, Kosten, Rückkehr, Ergebnis) |
| Verlauf | Alle AssetHistory-Ereignisse + Standort-Bewegungen |
| Anschaffung | Kaufdatum, Wert, Lieferant, Rechnungsnummer, Garantie, Inbetriebnahme, Bemerkung |

**Inventarisierungs-Assistent „Laser inventarisieren"** (3 Schritte, `LaserInventoryForm`):

1. **Gerät & Komponenten** – Top-Unit-SN (Pflicht, eindeutig), Modell, Betriebsstatus, Standort und optional die weiteren Komponenten (Center-/Bottom-Unit, Power Supply, Pumpe) mit Zustand. Für jeden Komponenten-Typ kann wahlweise eine **neue Seriennummer** eingegeben oder eine **vorhandene Komponente aus dem Lager** ausgewählt werden (nur freie, nicht bereits verbaute Teile werden angeboten).
2. **Anbauteile** – wechselbare Teile (Handstück, großer/kleiner Laserkopf, Skintel) mit SN, Zustand und Pulses-Count; je Teil wählbar, ob montiert oder im Lager. Auch hier kann für jeden Slot aus vorhandenen freien Anbauteilen gewählt oder ein neues Teil erfasst werden.
3. **Anschaffung** (optional) – Datum, Wert, Lieferant, Rechnungsnummer, Garantie, Inbetriebnahme. **Sobald Anschaffungsdaten erfasst werden, ist der Rechnungs-Upload Pflicht.**

Alle Seriennummern müssen eindeutig sein; nach dem Anlegen springt die Ansicht ins neue Gerätedetail.

**Assistent „Ersatzteil inventarisieren"** (2 Schritte, `LaserPartInventoryForm`) — einzelne
Komponenten oder Anbauteile **ohne Laser** (Lagerbestand, Ersatzteile): Typ aus einer
gemeinsamen Liste aller Komponenten- und Anbauteil-Typen, Seriennummer, Zustand, Puls-Zähler
(nur Handstück), optionaler Lagerstandort; danach optional die Anschaffung mit denselben Feldern
inkl. Rechnungs-Upload. Das Teil erscheint danach in der interaktiven Geräte-Ansicht als „nicht
verbaut" und ist bei der nächsten Laser-Inventarisierung als vorhandenes Teil wählbar.

**Fehler erfassen** (Reiter *Fehler*): Fehlercode (bekannte Codes 005–110, Sanduhr blau/weiß,
„ohne Fehler abgestürzt" oder Freitext), Beschreibung und **Foto und/oder Video**.

**Reparatur-Ablauf**: *Anlegen* (Asset, Defektbeschreibung, manuell oder automatisch bei Defekt)
→ *Versenden* (Versanddatum, Dienstleister, Zieladresse, Tracking, Kostenvoranschlag; bei
Laser-Reparatur wechselt der Betriebsstatus auf „In Reparatur") → *Rückkehr* (Datum, Ergebnis
repariert / ausgetauscht / nicht reparabel, **Pflicht-Rechnung** und Kosten; bei „ausgetauscht"
wird die neue Seriennummer gepflegt und die alte ausgemustert).

**Stammdaten & Verbrauchsmaterial**: Standorte, Reparaturdienstleister und
Verbrauchsmaterial-Typen; Material-Bestände je Standort mit Mindestbestand-Warnung und Anzeige
des nächsten fälligen Wechsels.

**Reports** (sechs Auswertungen): Überfällige Wartungen, Anstehende STKs, Geräte in Reparatur
(mit Kostensummen), Defekt- & Fehlerquote, Asset-Wert/Inventarübersicht sowie Reparaturhistorie
& -kosten (`LaserReportService`).

### Wartungsassistent: Countdown, Pflichtfotos, Entwurf

Die wöchentliche Wartung ist für **aktive** Laser Pflicht; der Assistent (`MaintenanceWizard`)
hat drei Schritte. Die folgenden Regeln sind **Stand 18.09.2026** und dürfen beim Umbau des
Assistenten nicht verloren gehen:

**Schritt 1 – Flow Maintenance & Reinigung.** Ein **5-Minuten-Countdown** mit harter Sperre:
„Weiter" ist erst nach vollständigem Ablauf möglich, der Countdown kann nicht pausiert oder
übersprungen werden. Während dieser Zeit keine Arbeiten am Display – die Reinigung des Geräts
erfolgt parallel.

- **Der Server zählt die Zeit, nicht der Browser** (seit 18.09.2026): Der Startzeitpunkt liegt im
  Entwurf (`laser_maintenance_drafts.countdown_started_at`), „abgeschlossen" gilt erst, wenn seit
  dem Start wirklich fünf Minuten vergangen sind — `MaintenanceWizard::COUNTDOWN_SECONDS` = 300,
  Prüfung in `markCountdownCompleted()` (Toleranz 2 s). Wird das Fenster zwischendurch
  geschlossen, läuft die Zeit weiter und der Countdown steht beim Wiederöffnen dort, wo er
  tatsächlich ist.
- **Der laufende Countdown hält die automatische Abmeldung wach** (Stand 18.09.2026): Während
  der fünf Minuten wird am Bildschirm nicht gearbeitet — ohne diesen Schutz würde die
  Inaktivitäts-Abmeldung des Hubs mitten in die Wartung greifen und den Assistenten schließen.

**Schritt 2 – Zustandsprüfung je Anbauteil.** Vier Substeps für die vier Anbauteil-Typen
(Handstück, Laserkopf groß, Laserkopf klein, Skintel). Je Substep: Zustand (4 Stufen),
Puls-Zähler (nur Handstück), **Skintel-Tests** (Handflächenwert 0–50, Unterarmwert 0–50,
Skintel-Probleme mit Beschreibung) und **Foto-Slots** (Handstück: 4, Laserkopf groß: 2,
Laserkopf klein: 2, Skintel: 3).

- **Alle Foto-Kacheln sind Pflicht** (seit 18.09.2026), solange das Teil am Laser montiert ist;
  ohne alle Fotos geht es nicht zum nächsten Teil. Gleiches gilt für die **acht Laser-Fotos**.
  Regelwerk: `MaintenanceWizard::photoRules()`.
- Wird ein Teil als **Defekt** markiert, wird automatisch ein Reparatur-Vorgang erstellt
  (`AUTO_DEFEKT`, idempotent).

**Schritt 3 – Lager-Check & Abschluss.** Zubehör-Checks, Wasserfilter-Wechsel und Anzahl
verbrauchter Chiller-Fluid-Flaschen (reduziert den Bestand am Standort). Speichern schreibt das
Protokoll und einen Historien-Eintrag.

**Entwurf.** Wird der Assistent zwischendurch geschlossen, bleibt der Fortschritt (inkl.
Countdown-Status) als Entwurf erhalten und kann fortgesetzt werden. **Auch die Fotos bleiben
erhalten:** Jedes Foto wandert beim Hochladen sofort in die Entwurfs-Ablage
(`laser/drafts/<laser>-<user>/` auf der Medien-Platte, `draftPhotos` im Entwurf) und beim
Abschluss von dort ans Protokoll (`LaserMediaService::adoptStored()`); „Wartung verwerfen"
löscht die Ablage.

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

### Enums

`app/Enums/Laser/`: `Zustand`, `KomponentenTyp`, `AnbauteilTyp`, `StandortTyp`, `Betriebsstatus`, `AssetTyp`, `EreignisTyp`, `VerbrauchsmaterialTyp`, `Einheit`, `MediaKind`, `Fehlercode`, `FehlerStatus`, `ReparaturStatus`, `ReparaturAusloeser`, `ReparaturErgebnis`, `VersandRichtung`, `STKStatus`. Jedes Enum hat `label()` (Deutsch) und meist `options()` für Dropdowns; Status-Enums zusätzlich `color()` für Badges.

### Services

`app/Services/Laser/`:

| Service | Verantwortung |
|---------|---------------|
| `AssetHistoryService` | Zentraler Event-Logger (`record()`), von allen Flows genutzt |
| `LaserMediaService` | Polymorpher Datei-Upload (`upload()`/`uploadMany()`), Entwurfs-Ablage (`adoptStored()`) |
| `LaserInventoryService` | Anlage, Standortwechsel, Statuswechsel, Mount/Unmount, Anschaffung |
| `MaintenanceService` | Wartungsabschluss; Zustände, Chiller-Fluid-Verbrauch, **AUTO_DEFEKT → Reparatur** |
| `RepairService` | Reparatur anlegen/versenden/zurücknehmen inkl. Statuslogik |
| `ComplianceService` | STK + Behördenanzeige; `refreshStatuses()` |
| `ConsumableService` | Bestandsführung pro Standort, Low-Stock, fällige Wechsel |
| `LaserDashboardService` | Dashboard-KPIs + Warnlisten |
| `LaserReportService` | Aggregationen für die 6 Reports |

### Livewire-Komponenten

`app/Livewire/Hub/Laser/`: `LaserMasterData`, `LaserInventoryForm`, `LaserPartInventoryForm`, `MaintenanceWizard`, `LaserErrorForm`, `RepairForm`, `ComplianceForm`, `ConsumableStocks`. Modale öffnen via Alpine-Event (`$dispatch('open-…', { … })`) und `#[On(...)]`-Listener. Dropdowns nutzen die Komponente `<x-dropdown-glattt model="$wire.…">`.

### Geschäftsregeln (Auszug)

1. Top-Unit-SN ist die führende Geräte-ID.
2. Wöchentliche Wartungspflicht je **AKTIV**-Laser; „überfällig", wenn in laufender KW kein Protokoll (`Laser::isMaintenanceOverdue()`).
   Flow-Maintenance-Countdown: 300 s (`MaintenanceWizard::COUNTDOWN_SECONDS`), Start in `laser_maintenance_drafts.countdown_started_at`, Abschluss nur serverseitig (`markCountdownCompleted()` prüft die Zeit, Toleranz 2 s); der laufende Countdown hält die automatische Abmeldung wach (Stand 18.09.2026).
3. STK jährlich; Reminder 60 + 30 Tage vorher.
4. **DEFEKT** (Komponente/Anbauteil) → automatischer Reparatur-Vorgang (`AUTO_DEFEKT`, idempotent).
5. Versand → Laser `IN_REPARATUR` + `AssetHistory(REPARATUR_VERSAND)`.
6. Rückkehr → `AssetHistory(REPARATUR_RUECKKEHR)`; bei `AUSGETAUSCHT` neue SN, alte `VERSCHROTTUNG`.
7. Pulses werden nur protokolliert (keine Warnung).
8. Verbrauchsmaterial: Warnung bei Unterschreitung Mindestbestand.
9. Rechnung Pflicht-Upload bei Anschaffung **und** Reparatur-Rückkehr.
10. **Alle Foto-Kacheln sind Pflicht** (Laser: 8, je montiertes Anbauteil seine 2–4; `MaintenanceWizard::photoRules()`); Fotos werden im Entwurf gesichert; Video nur im Fehler-Modal.
11. Jedes relevante Ereignis schreibt automatisch einen `AssetHistory`-Eintrag.

### Scheduler & Push

- Command `laser:check-reminders` (`app/Console/Commands/CheckLaserReminders.php`), täglich 07:30 in `routes/console.php`.
- Push über `PushNotificationService::sendByType($key, [...])` (Queue `push`). Typen: `laser.maintenance-due`, `laser.stk-due`, `laser.low-stock` (Seeder `PushNotificationTypeSeeder`).
- Versendet werden: **STK** 60 und 30 Tage vor Fälligkeit (jeweils einmalig), **überfällige Wartung** je aktivem Laser ohne Protokoll in der laufenden KW und **Verbrauchsmaterial** unter Mindestbestand.

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
