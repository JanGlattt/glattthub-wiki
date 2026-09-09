# Hub-Nutzer archivieren

Seit 10.09.2026 lassen sich Hub-Benutzerkonten **archivieren** statt löschen —
sofort oder vorgemerkt zu einem Datum in der Zukunft. Ab diesem Tag ist der
Zugang zu, die Person fällt aus der Bonusberechnung und aus Auswahllisten,
alle Daten bleiben erhalten.

## Für Endanwender

### Wo

**Admin-Backend → Benutzer.** Zwei Wege:

1. **Aktion „Archivieren"** in der Zeile: Datum wählen (vorbelegt mit dem
   1. des Folgemonats bzw. dem askDANTE-Austritt, siehe unten), bestätigen.
2. **Formular „Bearbeiten" → Zugang & Sicherheit → „Archivieren ab"**: Datum
   setzen oder leeren. Leeren hebt die Archivierung auf; die Aktion
   „Archivierung aufheben" in der Liste tut dasselbe.

Die Spalte **Status** zeigt „Aktiv", „Archiviert ab 01.10.2026" (Vormerkung,
gelb) oder „Archiviert" (grau). Der Filter **Archivierte** blendet archivierte
Konten standardmäßig aus; „Alle anzeigen" oder „Nur archivierte" holt sie zurück.

### Konvention: immer der 1. des Folgemonats

Archiviert wird **zum Monatsersten nach dem letzten Arbeitstag**. Der Monat
davor ist damit der letzte Bonus-Monat (mit Arbeitstage- und Abwesenheitsregel
wie gewohnt), ab dem Archivierungsmonat zählt die Person nicht mehr. Wer
ausnahmsweise ein Datum mitten im Monat setzt: Der angebrochene Monat zählt
noch, der Ausschluss beginnt mit dem Folgemonat.

Liegt in askDANTE ein Austrittsdatum oder ein Ende der Beschäftigungsperiode
vor, schlägt das Formular den passenden Monatsersten vor („askDANTE-Austritt
übernehmen"). Automatisch passiert nichts — die Archivierung bleibt eine
bewusste Entscheidung.

### Was ab dem Datum passiert

- **Kein Login** mehr — weder E-Mail/Passwort, PIN noch Admin-Backend. Eine
  laufende Sitzung endet beim nächsten Klick mit dem Hinweis „Dein Zugang wurde
  archiviert".
- **Bonus-Board:** Die Person erscheint ab dem Archivierungsmonat nicht mehr —
  auch nicht als namentliche Empfängerin, im Team-Split oder im Ranking.
  Eingefrorene Vormonate bleiben unverändert.
- **Personalübersicht:** Die Spalte Hub-Konto zeigt statt des grünen Hakens
  „Archiviert" bzw. „Archiviert ab …".
- **Auswahllisten** (Verkäuferin beim Vertrag, Beratungsgespräch-Erfassung,
  Ansprechpartner bei Unternehmensverträgen, Bonus-Regel-Empfängerinnen,
  Mitteilungs-/Berichtsmail-Empfänger, Push-Kampagnen, Phorest-Zuordnung)
  blenden die Person aus. Bestehende Zuordnungen (z.B. Verkäuferin an alten
  Verträgen) bleiben.

Bis zum Datum ändert eine Vormerkung nichts — die Person arbeitet ganz normal
weiter.

## Für Entwickler

- **Spalte** `users.archived_from` (DATE, nullable, Index; Migration
  `2026_09_10_100000_add_archived_from_to_users`).
- **Model `User`:** `isArchived(?date)` (Datum erreicht), `isArchivedForMonth(month)`
  (Monatsbeginn ≥ Datum), `archiveLabel()`, Scopes `active(?date)` und
  `activeForMonth(month)`. Die Scopes vergleichen per `whereDate`, weil der
  `date`-Cast „Y-m-d 00:00:00" speichert und ein Rohvergleich in SQLite (Tests)
  danebenliefe. `canAccessPanel()` verneint für Archivierte.
- **Zugang:** Middleware `App\Http\Middleware\RejectArchivedUsers` hängt in der
  `web`-Gruppe (`bootstrap/app.php`) und meldet Archivierte bei jedem Aufruf
  ab (Session-Guard `web`, JSON → 403, sonst Redirect zum Login mit Fehlermeldung
  `RejectArchivedUsers::MESSAGE`). Zusätzlich blocken `PinLoginController`
  (PIN + Zugangsdaten) und `Fortify::authenticateUsing` (`/login`) schon beim
  Anmelden mit derselben Meldung.
- **Bonus:** `BonusCalculationService::recipients()` filtert mit
  `activeForMonth($month)` — vor Team-Split, Ranking und namentlichen Regeln.
- **Admin:** `UserForm` (DatePicker mit Hint-Action „askDANTE-Austritt
  übernehmen", `UserForm::suggestedArchiveDate()` = 1. des Monats nach
  `HrEmployee::contractEndsOn()`), `UsersTable` (Status-Badge, `TernaryFilter`
  mit Standard „ausblenden", Aktionen `archive`/`unarchive`, archivierte Zeilen
  gedimmt).
- **Personalübersicht:** `UserProvisioningService::userSummary()` liefert
  `archived` + `archive_label`; `hub/staff/partials/table.blade.php` zeigt das
  Badge. Verknüpfungs-Kandidaten (`existingCandidates`) sind nur aktive Konten.
- **Tests:** `tests/Feature/UserArchivingTest.php` (Login-Sperre auf allen drei
  Wegen, Vormerkung, Sitzungsende, Scope, Personalübersicht, Monatslogik) und
  `BonusEngineTest::test_archivierte_nutzerin_faellt_ab_dem_archivierungsmonat_aus_dem_board`.
