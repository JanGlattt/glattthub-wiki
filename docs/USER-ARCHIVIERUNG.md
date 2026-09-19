# Hub-Nutzer archivieren

Seit 10.09.2026 lassen sich Hub-Benutzerkonten **archivieren** statt löschen —
sofort oder vorgemerkt zu einem Datum in der Zukunft. Ab diesem Tag ist der
Zugang zu, die Person fällt aus der Bonusberechnung und aus Auswahllisten,
alle Daten bleiben erhalten. Diese Seite beschreibt **Absicht, Fachregeln
(Stichtag, Wirkung), Datenmodell, Middleware und Tests**; die Bedienung Schritt
für Schritt steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: Team 1 – Personalübersicht und Hub-Konten"
    [hilfe.hub.glattt.com/team/1/](https://hilfe.hub.glattt.com/team/1/) — Abschnitt
    „Austritt: archivieren": Datum wählen, Vormerkung, Archivierung aufheben.

    Angrenzend: [Admin 1 – Benutzer und Rollen](https://hilfe.hub.glattt.com/admin/1/)
    (Benutzerliste im Admin-Backend, Filter „Archivierte"),
    [Bonus-Board 3 – Bonus-Board für die Leitung](https://hilfe.hub.glattt.com/bonus-board/3/)
    (Wirkung auf die Bonus-Übersicht).

---

## Für Anwender — Überblick

**Warum archivieren statt löschen.** Ein gelöschtes Konto reißt Lücken: Verkäuferin an alten
Verträgen, Erfasserin von Beratungsgesprächen, Empfängerin eingefrorener Boni — all das
verweist auf die Person. Die Archivierung sperrt deshalb nur den **Zugang** und nimmt die
Person aus **Berechnungen und Auswahllisten**, lässt aber jede bestehende Zuordnung stehen.
Sie ist eine bewusste Entscheidung im Admin-Backend (Aktion „Archivieren" oder Feld
„Archivieren ab" im Bearbeiten-Formular); automatisch archiviert der Hub nie, auch wenn
askDANTE ein Austrittsdatum kennt — das Formular schlägt es nur vor.

**Konvention: immer der 1. des Folgemonats.** Archiviert wird zum Monatsersten nach dem
letzten Arbeitstag. Der Monat davor ist damit der letzte Bonus-Monat (mit Arbeitstage- und
Abwesenheitsregel wie gewohnt), ab dem Archivierungsmonat zählt die Person nicht mehr. Wer
ausnahmsweise ein Datum mitten im Monat setzt: Der angebrochene Monat zählt noch, der
Ausschluss beginnt mit dem Folgemonat. Bis zum Datum ändert eine Vormerkung nichts — die
Person arbeitet ganz normal weiter; Leeren des Datums (oder „Archivierung aufheben") nimmt
die Vormerkung bzw. Archivierung zurück.

**Wo was erledigt wird:**

| Vorgang | Anleitung |
|---|---|
| Austritt: Konto archivieren (sofort oder vorgemerkt), askDANTE-Austritt übernehmen | Team 1 |
| Archivierung aufheben, archivierte Konten in der Benutzerliste einblenden | Admin 1 |
| Wirkung auf Bonus-Board und Monatsabschluss nachvollziehen | Bonus-Board 3, Bonus-Board 5 |

---

## Für Entwickler

### Fachregeln: Wirkung ab dem Archivierungsdatum

- **Kein Login** mehr — weder E-Mail/Passwort, PIN noch Admin-Backend. Eine
  laufende Sitzung endet beim nächsten Klick mit dem Hinweis „Dein Zugang wurde
  archiviert".
- **Bonus-Board:** Die Person erscheint ab dem Archivierungsmonat nicht mehr —
  auch nicht als namentliche Empfängerin, im Team-Split oder im Ranking.
  Eingefrorene Vormonate bleiben unverändert. Der Monat, dessen Beginn am oder
  nach dem Archivierungsdatum liegt, ist der erste ohne die Person.
- **Personalübersicht:** Die Spalte Hub-Konto zeigt statt des grünen Hakens
  „Archiviert" bzw. „Archiviert ab …".
- **Auswahllisten** (Verkäuferin beim Vertrag, Beratungsgespräch-Erfassung,
  Ansprechpartner bei Unternehmensverträgen, Bonus-Regel-Empfängerinnen,
  Mitteilungs-/Berichtsmail-Empfänger, Push-Kampagnen, Phorest-Zuordnung)
  blenden die Person aus (`User::active()`). Bestehende Zuordnungen (z.B.
  Verkäuferin an alten Verträgen) bleiben.
- **Admin-Status:** Die Spalte **Status** in der Benutzerliste zeigt „Aktiv",
  „Archiviert ab 01.10.2026" (Vormerkung, gelb) oder „Archiviert" (grau). Der
  Filter **Archivierte** blendet archivierte Konten standardmäßig aus; „Alle
  anzeigen" oder „Nur archivierte" holt sie zurück.
- **Vorschlag aus askDANTE:** Liegt ein Austrittsdatum oder ein Ende der
  Beschäftigungsperiode vor, schlägt das Formular den passenden Monatsersten vor
  („askDANTE-Austritt übernehmen"). Automatisch passiert nichts.

### Umsetzung

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
- **Admin:** `UserForm` (DatePicker „Archivieren ab" unter *Zugang & Sicherheit*
  mit Hint-Action „askDANTE-Austritt übernehmen",
  `UserForm::suggestedArchiveDate()` = 1. des Monats nach
  `HrEmployee::contractEndsOn()`; leeren hebt die Archivierung auf),
  `UsersTable` (Status-Badge, `TernaryFilter` mit Standard „ausblenden",
  Aktionen `archive` — Datum vorbelegt mit dem 1. des Folgemonats bzw. dem
  askDANTE-Austritt — und `unarchive`, archivierte Zeilen gedimmt).
- **Personalübersicht:** `UserProvisioningService::userSummary()` liefert
  `archived` + `archive_label`; `hub/staff/partials/table.blade.php` zeigt das
  Badge. Verknüpfungs-Kandidaten (`existingCandidates`) sind nur aktive Konten.
- **Tests:** `tests/Feature/UserArchivingTest.php` (Login-Sperre auf allen drei
  Wegen, Vormerkung, Sitzungsende, Scope, Personalübersicht, Monatslogik) und
  `BonusEngineTest::test_archivierte_nutzerin_faellt_ab_dem_archivierungsmonat_aus_dem_board`.

Verwandt: [Personalverwaltung](STAFF-MODULE.md), [Einladungssystem](USER-INVITATION-SYSTEM.md),
[Bonus-Board](BONUS-BOARD.md).
