# HR-Kennzahlen

Personalkennzahlen für die Unternehmenssteuerung: Kapazität, Produktivität,
Verfügbarkeit und Struktur — auf Ebene glattt gesamt und je Institut.
Zielgruppe sind Geschäftsführung und kaufmännische Leitung, nicht die
Standortsteuerung (dafür gibt es die [Mitarbeiterperformance](STAFF-PERFORMANCE.md)).

> **Stand August 2026:** Die Datenschicht steht (askDANTE-Spiegel, Zuordnung zu
> Phorest, Vergütungsdaten). Die Berichtsseite `/hub/reports/hr-kennzahlen` wird
> darauf aufgesetzt.

---

## Für Endanwender

### Woher die Daten kommen

| Bereich | Quelle | Aktualität |
|---|---|---|
| Mitarbeiter, Ein- und Austritt, Befristung, Urlaubsanspruch | askDANTE | nächtlich 04:30 |
| Soll- und Ist-Arbeitszeit, Krankheit, Urlaub, Pausen | askDANTE | nächtlich, rollierend 3 Monate |
| Behandlungen, Beratungsgespräche, Körperzonen | Phorest (über den Hub) | nächtlich 03:00 |
| Gehälter und Boni | im Hub gepflegt | manuell |

### Was gepflegt sein muss

Die Auswertung ist nur so gut wie der Pflegestand in askDANTE. Zwei Felder
brauchen Aufmerksamkeit:

- **Eintrittsdatum** — ohne das gibt es keine Betriebszugehörigkeit. Der Hub
  rät bewusst nicht: Der Start der Beschäftigungsperiode ist als Ersatz
  ungeeignet, weil bei zwölf Mitarbeitern dort der 01.07.2024 steht (der Tag der
  askDANTE-Einführung), obwohl sie deutlich länger dabei sind.
- **Geburtsdatum** — Grundlage der Altersstruktur.

Fehlende Werte werden im Bericht offen ausgewiesen statt stillschweigend
geschätzt.

### Gehälter und Personalkosten

Gepflegt wird das **Monatsbrutto** mit einem Gültig-ab-Datum. Die
**Arbeitgeber-Gesamtkosten** entstehen daraus über einen Aufschlag von 30 % für
Sozialabgaben und Umlagen; beide Werte werden nebeneinander gezeigt, damit nie
unklar ist, welche Größe gerade gemeint ist. Der Aufschlag lässt sich zentral
ändern und je Gehaltssatz überschreiben.

Weil Gehälter historisiert sind, verfälscht eine Erhöhung keine bereits
abgeschlossenen Monate: Für jeden Auswertungsmonat gilt der Satz, der damals
gültig war.

**Boni** (Zielbonus, Provision, Sonderzahlung) werden einem Bezugsmonat
zugeordnet und fließen in die Personalkosten ein. Korrekturen sind als negativer
Betrag möglich, etwa wenn eine Provision nach einem Widerruf zurückgenommen wird.

### Wer was sehen darf

| Recht | Bedeutung |
|---|---|
| `view_report_hr_kpis` | Zugriff auf die Berichtsseite — **ohne** Gehaltsdaten |
| `view_hr_salaries` | Gehälter, Personalkosten und Kostenquoten sehen |
| `manage_hr_salaries` | Gehälter und Boni pflegen |

Zusätzlich greifen die Rechte aus der [Datensichtbarkeit](DATA-VISIBILITY.md).

---

## Für Entwickler

### Tabellen

| Tabelle | Inhalt |
|---|---|
| `hr_employees` | askDANTE-Mitarbeiter inkl. archivierter; `is_system_account` markiert technische Konten |
| `hr_employment_periods` | Beschäftigungsperioden — `ends_on` gesetzt = befristet |
| `hr_time_profiles` | Soll-Arbeitszeit je Woche/Monat, Grundlage für Teilzeitgrad und VZÄ |
| `hr_locations` | askDANTE-Standorte inkl. Brücke `branch_id` zum Phorest-Institut |
| `hr_daily_times` | Tag × Mitarbeiter: Soll, Ist, Pause, Abwesenheit, Stempelzeiten |
| `hr_staff_links` | askDANTE-Mitarbeiter ↔ Phorest-Terminspalte |
| `hr_salaries` | Monatsbrutto, historisiert über `valid_from` |
| `hr_bonus_payments` | Boni je Bezugsmonat, negative Beträge für Korrekturen |
| `hr_monthly_snapshots` | Eingefrorener Periodenstand für Vergütungsgespräche |

### Sync

```bash
php artisan askdante:sync                 # Stammdaten + letzte 3 Monate (nächtlich 04:30)
php artisan askdante:sync --backfill      # Erstlauf über 24 Monate
php artisan askdante:sync --master-only   # nur Stammdaten
php artisan phorest:sync-staff            # Phorest-Mitarbeiter (nächtlich 04:15)
```

`AskDanteSyncService` ist idempotent — ein zweiter Lauf über denselben Zeitraum
erzeugt dasselbe Ergebnis. Gescheiterte Einzelabrufe brechen den Lauf nicht ab,
sondern werden gesammelt (`failures()`) und gemeldet; ein erneuter Lauf holt sie
nach. Konfiguration in `config/hr.php`.

### Eigenheiten der askDANTE-API

Beim Aufbau geprüft — die folgenden Punkte kosten sonst Zeit:

- **`endOfProbationaryPeriod` wird nie zurückgegeben.** Das Feld ist in der
  Oberfläche gepflegt und laut Doku beim Anlegen und Ändern schreibbar, taucht
  aber in keiner Leseantwort auf (`/users`, `/users/{id}`, `/employment`,
  `/employment/periods`). Der Hub rechnet das Probezeitende deshalb aus dem
  Eintritt: **Eintritt + 6 Monate − 1 Tag** (deckungsgleich mit der Oberfläche).
- **`/diseases/stats` liefert eine Login-HTML-Seite**, nicht Daten — der
  API-Token gilt dort nicht. Krankheitstage kommen stattdessen aus
  `/calendar/{userId}` über `absenceReason = DISEASE`.
- **`/timetracking/{userId}` antwortet mit HTTP 405** (GET nicht erlaubt).
- **`costCenter` und `externalId` sind bei allen Nutzern leer** — die
  Standortzuordnung läuft über `locationId` der Beschäftigungsperiode bzw. die
  Org-Unit, nicht über die Kostenstelle.
- **Zwei Quellen für Tageszeiten, weil keine allein reicht:**
  `/calendar/{userId}` liefert Soll, Ist und Abwesenheitsgrund, aber nur je
  Mitarbeiter und maximal 31 Tage; `/v1/workingTime/{von}-{bis}` liefert alle
  Mitarbeiter auf einmal samt Pausen und Stempelzeiten, aber kein Soll.
- **Wochenenden stehen als Abwesenheit `WEEKEND` im Kalender.** Sie müssen aus
  jeder Quote heraus, sonst sinkt sie künstlich. Liegt an einem Tag zusätzlich
  ein echter Grund vor, gewinnt dieser (`HrDailyTime::realDays()`).
- **Zeiten kommen in Millisekunden** (`targetTime`, `workingTime`) bzw. als
  `"HH:MM:SS"` (Pausen, Stempel). Gespeichert wird durchgehend in Minuten.

### Standort-Brücke askDANTE → Phorest

askDANTE nummeriert Standorte: `01.BI Bielefeld` … `05.BS Braunschweig` sind
Institute, `00.…` sind Verwaltungseinheiten (Office, Geschäftsführung,
Operations). Die Zuordnung läuft über den Städtenamen, wobei die `00.`-Standorte
ausgenommen sind — sie liegen alle in Hannover und würden sonst dem dortigen
Institut zugeschlagen. Sonderfälle lassen sich in
`config/hr.location_branch_overrides` fest verdrahten.

### Zuordnung zu Phorest

Es gibt keinen gemeinsamen Schlüssel. `HrStaffLinkService` schlägt über den Namen
vor (`match_source = auto`, `confirmed_at = null`), bestätigt wird im Hub.

Zwei Fallstricke:

1. **Beide Systeme kürzen unterschiedlich.** Phorest führt „Lea Schwab", askDANTE
   „Lea-Sophie Schwab"; umgekehrt steht in askDANTE „Sheyla Dzananovic Exposito"
   und in Phorest „Sheyla Dzananovic". Deshalb wird der erste Vorname mit *jedem*
   Nachnamen-Bestandteil kombiniert. Mehrdeutige Treffer werden nicht automatisch
   zugeordnet, sondern gemeldet.
2. **Phorest führt Spalten ohne Person dahinter:** Kabinen (`H 1`, `BI 2`),
   Sammelspalten (`OS Nur für Beratungen`), No-Show-Spalten
   (`… Absage weniger als 24 std/Nicht gekommen`) und Gerätezugänge
   (`Zugang Büro …`, `Ü App …`). Sie dürfen nie einer Person zugeordnet werden.

`unlinkedStaffWithAppointments()` listet Spalten mit **durchgeführten** Terminen
ohne Zuordnung — solange dort etwas steht, fehlt Leistung in personenbezogenen
Auswertungen.

### Wichtig: nur `state = 'PAID'` zählt

Für jede Leistungsauswertung gilt `state = 'PAID'` **plus**
`activation_state = 'ACTIVE'` **plus** `deleted = 0`. Wer ungefiltert über
`stats_historic_appointments` aggregiert, zählt rund ein Viertel nie
stattgefundene Buchungen mit: Kabinen-Spalten stehen zu 100 % auf `BOOKED` und
kein einziges Mal auf `PAID` — dasselbe Statusprofil wie die No-Show-Spalte. Auf
`PAID`-Basis liegt die Personen-Zuordnung bei 99,9 %.

### Befristungsende kommt aus zwei Quellen

`HrEmployee::contractEndsOn()` nimmt den früheren Termin aus `exit_date` am
Mitarbeiter und `ends_on` der zum Stichtag gültigen Beschäftigungsperiode. Beides
allein reicht nicht: Es gibt Mitarbeiterinnen mit befristeter Periode ohne
Austrittsdatum und umgekehrt.

### Relevante Dateien

```
app/Services/AskDanteSyncService.php        # Spiegelung askDANTE → hr_*
app/Services/HrStaffLinkService.php         # Zuordnung zu Phorest-Terminspalten
app/Services/AskDanteApiService.php         # API-Wrapper (siehe ASKDANTE-API.md)
app/Console/Commands/SyncAskDante.php       # askdante:sync
app/Models/Hr*.php                          # Models
config/hr.php                               # Kostenfaktor, Probezeit, Sync-Fenster
database/migrations/2026_08_01_09*          # Tabellen und Rechte
tests/Unit/AskDanteSyncServiceTest.php      # Sync inkl. Idempotenz
tests/Unit/HrStaffLinkServiceTest.php       # Namensabgleich, Nicht-Personen
tests/Unit/HrCompensationTest.php           # Gehalt, Boni, Befristung, Zeitprofile
```
