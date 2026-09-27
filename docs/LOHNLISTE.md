# Lohnliste für die Steuerberatung

Der Lohnmonat sammelt je Person, was im Monat zu zahlen ist: Grundgehalt, laufende Bezüge
(Zulagen, Sachbezüge, Jobticket, Hansefit, bAV), den geldwerten Vorteil der Dienstwagen, den
Bonus des festgeschriebenen Vormonats, genehmigte Reisekosten, Geburtstags-Gutscheine und
Minijob-/Werkstudentinnen-Stunden. Nach dem Abschluss geht er als **TXT-Liste** und als
**Brief an die Steuerberatung** raus. Diese Seite beschreibt Fachregeln, Datenmodell, Endpunkte
und Fallstricke; die Bedienung steht im Nutzerhandbuch.

!!! nutzerhandbuch "Bedienung: App 13 – Personal und Lohnmonat in der App"
    [https://hilfe.hub.glattt.com/app/13/](https://hilfe.hub.glattt.com/app/13/)

---

## Für Anwender — Überblick

**Was das Modul leistet.** Bis 09/2026 schrieb das Büro jeden Monat eine lange Nachricht an die
Steuerberatung: Neuverträge, Änderungen, Kündigungen, Boni, Jobtickets, Stunden. Der Hub kennt
die meisten dieser Angaben schon (askDANTE, Bonus-Board, Reisekosten) und erzeugt daraus Liste
und Brief. Das Büro prüft, ergänzt („Vertrag bei DATEV hochgeladen") und übergibt.

**Was in DATEV bleibt (Entscheidung Jan, 26.09.2026).** Steuerklasse, Sozialversicherung,
Krankenkassen-Meldung und Bankverbindung pflegt die Steuerberatung in DATEV. Der Hub liefert nur
die Bewegungsdaten des Monats und rechnet keine Lohnsteuer.

**Boni.** Der Bonus eines Monats kommt im Folgemonat in die Liste, sobald er im Bonus-Board
festgeschrieben ist (September → Oktober).

---

## Für Entwickler

### Rechte

`manage_payroll` („Lohnliste: Vergütung pflegen, Lohnmonat abschließen und an die
Steuerberatung übergeben"), per Migration angelegt und von `manage_hr_salaries` vererbt. Gate an
Seite `/hub/staff/payroll`, allen Endpunkten `hub/staff/payroll/api/*`, dem Reiter „Vergütung" der
Web-Akte und dem Umschalter „Lohnmonat" der App.

### Datenmodell

| Tabelle | Zweck |
|---|---|
| `hr_salaries` (bestehend) | Grundgehalt mit Verlauf (`valid_from`) — auch Quelle der HR-Kennzahlen |
| `payroll_wage_types` | Lohnarten: `key`, `name`, `datev_number`, `kind` (`recurring`/`one_time`/`automatic`), `tax_free`, `is_deduction`, `letter_mode` (`all`/`changes`), `active` |
| `payroll_recurring_items` | laufende Bezüge je Person, `valid_from`/`valid_until`; Anpassung = neue Zeile, die vorige derselben Lohnart endet am Vortag |
| `payroll_company_cars` | Dienstwagen: Listenpreis, Faktor 1/0,5/0,25, Entfernungs-km, Zeitraum |
| `payroll_months` | Lohnmonat `draft → closed → exported`, `letter_text` |
| `payroll_month_items` | Posten mit `amount_cents`, `quantity`/`unit` (Stunden), `source` (`salary`, `recurring`, `company_car`, `bonus_board`, `travel`, `hours`, `birthday`, `manual`) |
| `hr_employee_profiles` | Stammdaten aus der Teamliste (DATEV-Personalnummer, Adresse, Vertragsart, Befristung, Krankenkasse, Mutterschutz/Elternzeit, Urlaub, Schulungen); Adresse, Geburtsort, Mobil und Krankenkasse `encrypted` |

Voreingestellte DATEV-Nummern aus der Nachricht des Büros: 20 Bonus/Funktionszulage,
204 Auto-Bonus, 21 Sonderbonus (auch Bonus-Board), 30 Jobticket, 869 Sachbezug. Weitere
Lohnarten legt das Büro auf der Seite Lohnmonat an („Lohnarten muss man hinzufügen können",
Jan 26.09.2026); automatische Lohnarten lassen sich umbenennen und nummerieren, nicht stilllegen.

### Aufbau eines Monats (`PayrollService::build`)

1. Personen: beschäftigt im Monat (Eintritt ≤ Monatsende, Ende ≥ Monatsanfang), ohne technische Konten.
2. Grundgehalt: jüngster `hr_salaries`-Satz bis Monatsende.
3. Laufende Bezüge und Dienstwagen, die den Monat berühren. Dienstwagen:
   Listenpreis auf volle 100 € abgerundet × Faktor × (1 % + 0,03 % je km).
4. Minijob-/Werkstudentinnen-Stunden aus `hr_daily_times.worked_minutes` (Vertragsart aus der Teamliste).
5. Geburtstags-Gutschein im Geburtstagsmonat (`hr.payroll.birthday_voucher_cents`, 25 €).
6. Zielbonus: `BonusBoardFreeze::finalForMonth(Vormonat)`, `payload.users[].totals.payout_cents`, über `users.hr_employee_id` der Person zugeordnet.
7. Reisekosten: `TravelPayoutService::openUntil(Monat)` ohne die, die schon in einem anderen Lohnmonat stehen.

Von Hand erfasste Posten (`manual`) bleiben beim Neuaufbau erhalten. Nach dem Abschluss ist der
Monat gesperrt; „Wieder öffnen" geht bis zur Übergabe.

### Hinweise je Person

Kein Gehalt, keine Personalnummer (Fehler); Eintritt/Austritt im Monat (anteilig), keine
Stammdaten aus der Teamliste, Elternzeit/Mutterschutz laut Teamliste, Sachbezüge über 50 €,
letzte Gehaltsanpassung länger als `hr.payroll.salary_review_years` (2) her, Reisen, die noch auf
Genehmigung warten. Die Prüfliste „vor dem Versand" (`PayrollLetterService::checks`) fasst die
wichtigen zusammen.

### TXT-Liste (`PayrollService::txt`)

Semikolon, Dezimalkomma, Windows-1252, CRLF, eine Zeile je Posten:
`Personalnummer;Nachname;Vorname;Lohnart-Nr;Lohnart;Betrag;Menge;Einheit;Steuerfrei;Abrechnungsmonat;Hinweis`.
Personalnummer ist die DATEV-Nummer aus der Teamliste mit führenden Nullen
(`hr.payroll.personnel_number_digits`, 3), sonst die aus askDANTE. Ein direkter DATEV-Import
(LODAS/Lohn und Gehalt) bräuchte die Satzbeschreibung der Steuerberatung — die wollte „einfach eine
Liste". Die Übergabe setzt die enthaltenen Reisekosten auf „ausgezahlt"; danach lädt `download`
dieselbe Datei ohne Nebenwirkung.

### Brief an die Steuerberatung (`PayrollLetterService`)

Aufbau wie die bisherige Nachricht: Allgemein, Neuverträge (Eintritt im Monat), Vertragsänderungen
(neues Gehalt ab einem Tag im Monat, neue askDANTE-Beschäftigungszeit mit Wochenstunden),
Kündigungen (Ende im Monat, bekannte Enden der nächsten drei Monate), Krankheit in den ersten vier
Wochen nach Eintritt, je Lohnart ein Abschnitt „Name (DATEV-Nr.)" — `letter_mode = all` listet alle
Posten, `changes` nur Zu- und Abgänge (neu/raus) —, Gutscheine Anlass, Minijob- und
Werkstudentinnen-Stunden, Nachberechnungen, Sonstiges. Leere Abschnitte: „keine im {Monat}".
Anrede aus `hr.payroll.letter_salutation`. Der Text ist frei bearbeitbar und wird am Lohnmonat
gespeichert; „Neu erzeugen" überschreibt ihn.

### Teamliste importieren (`TeamSheetImporter`)

Excel des Büros, Blatt „DETAILS TEAM", Kopfzeile in Zeile 2. Zuordnung: Personalnummer (askDANTE
oder gespeicherte DATEV-Nummer, numerisch verglichen) → Vor- und Nachname (`Str::ascii(…, 'de')`,
ü = ue) → E-Mail. `POST …/master-data` mit `apply=0` zeigt die Vorschau (zugeordnet, ohne Treffer,
aktive ohne Treffer), `apply=1` übernimmt. Die Datei wird nicht gespeichert. Die Liste ist bis
Zeile 1140 formatiert — der Leser filtert auf Spalten A–AG und 600 Zeilen, sonst über 128 MB.

### Endpunkte (Web und App)

| Methode | Pfad (`/hub/staff/payroll/api`) | Zweck |
|---|---|---|
| GET | `/months`, `/months/{Y-m}` | Monate mit Status; Monat mit Personen, Posten, Hinweisen, Summen, Brief, Prüfliste |
| POST | `/months/{m}/build`, `/items`, `/close`, `/reopen`, `/export`, `/letter` | Aufbauen, Einmalzahlung, Abschluss, Übergabe (liefert Inhalt + `download_url`), Brief erzeugen |
| PUT/DELETE | `/months/{m}/letter`, `/months/{m}/items/{id}` | Brief speichern, Einmalzahlung entfernen |
| GET | `/months/{m}/download` | TXT eines übergebenen Monats |
| GET/POST | `/employees/{hrEmployee}`, `/salaries`, `/recurring`, `/recurring/{id}/end`, `/cars`, `/cars/{id}/end` | Vergütung einer Person |
| GET/POST/PUT | `/wage-types`, `/wage-types/{id}` | Lohnarten |
| POST | `/master-data` | Teamliste prüfen/übernehmen |

Dazu `GET /hub/staff/api/people[/{id}]` (Recht `view_staff_overview`): Personen aus dem
askDANTE-Abbild für die App.

### Dateien

`app/Services/Payroll/{PayrollService,CompensationService,PayrollLetterService,TeamSheetImporter}.php`,
`app/Http/Controllers/Hub/{PayrollController,StaffDirectoryController}.php`, `app/Models/Payroll/*`,
`app/Models/HrEmployeeProfile.php`, `resources/views/hub/staff/payroll*.blade.php`,
`resources/views/hub/staff/partials/detail-compensation.blade.php`, `public/js/staff-payroll.js`,
`resources/views/components/currency-input-glattt.blade.php`, App: `ios/glatttHub/Staff/*`.
Tests: `tests/Feature/Payroll/*`, `ios/glatttHubTests/StaffSnapshotTests.swift`.

### Fallstricke

- Tests mit festen Beispieldaten halten die Uhr fest — Neuverträge und Kündigungen hängen am Monat.
- Die lokale Datenbank ist eine Prod-Kopie: Screenshots der Web-Seite zeigen echte Namen und Gehälter und taugen nicht fürs Nutzerhandbuch.
- Bonus ohne `users.hr_employee_id` fehlt in der Liste — der Monat meldet die Namen.
- Die Reisekosten-Auszahlung (`/travel-expenses/approval/payout`) und die Lohnliste markieren beide „ausgezahlt"; was eine schon markiert hat, zieht die andere nicht mehr.

## Changelog

| Datum | Änderung |
|---|---|
| 27.09.2026 | Erste Fassung: Lohnarten, laufende Bezüge, Dienstwagen, Lohnmonat mit Abschluss, TXT, Brief an die Steuerberatung, Teamliste-Import, Web und App |
